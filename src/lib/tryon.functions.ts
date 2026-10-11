import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SPACE = "https://yisol-idm-vton.hf.space";
const TIMEOUT_MS = 170_000;

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; type: string } {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) throw new Error("Invalid image.");
  const bin = atob(m[2] ?? "");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, type: m[1] ?? "image/jpeg" };
}

function bytesToBase64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

async function uploadToSpace(bytes: Uint8Array, type: string, name: string): Promise<string> {
  const fd = new FormData();
  fd.append("files", new Blob([bytes as BlobPart], { type }), name);
  const r = await fetch(`${SPACE}/upload`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(`upload ${r.status}`);
  const [path] = (await r.json()) as string[];
  if (!path) throw new Error("upload failed");
  return path;
}

const fileData = (path: string) => ({
  path,
  url: `${SPACE}/file=${path}`,
  orig_name: path.split("/").pop(),
  meta: { _type: "gradio.FileData" },
});

/** Runs IDM-VTON (free Hugging Face Space). Resolves with the result image URL. */
async function runIdmVton(person: { bytes: Uint8Array; type: string }, garment: { bytes: Uint8Array; type: string }, desc: string) {
  const [pp, gp] = await Promise.all([
    uploadToSpace(person.bytes, person.type, "person.jpg"),
    uploadToSpace(garment.bytes, garment.type, "garment.jpg"),
  ]);
  const session = crypto.randomUUID().replace(/-/g, "").slice(0, 11);
  const join = await fetch(`${SPACE}/queue/join`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      data: [{ background: fileData(pp), layers: [], composite: null }, fileData(gp), desc, true, false, 30, 42],
      fn_index: 2,
      session_hash: session,
      event_data: null,
      trigger_id: null,
    }),
  });
  if (!join.ok) throw new Error(`queue ${join.status}`);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${SPACE}/queue/data?session_hash=${session}`, { signal: ctrl.signal });
    if (!res.ok || !res.body) throw new Error(`stream ${res.status}`);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        const msg = JSON.parse(line.slice(5));
        if (msg.msg === "process_completed") {
          reader.cancel().catch(() => {});
          if (!msg.success) throw new Error(msg.output?.error || "The try-on model could not process this photo.");
          const url = msg.output?.data?.[0]?.url;
          if (!url) throw new Error("The try-on model returned no image.");
          return url as string;
        }
        if (msg.msg === "queue_full") throw new Error("The free try-on service is busy right now.");
      }
    }
    throw new Error("The try-on service closed the connection.");
  } catch (e) {
    if (ctrl.signal.aborted) throw new Error("timeout");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export type TryOnResponse =
  | { ok: true; image: string; sessionId: string }
  | { ok: false; kind: "timeout" | "busy" | "runtime"; message: string; sessionId?: string };

export const runTryOn = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        productId: z.string().uuid(),
        personImage: z.string().max(15_000_000).startsWith("data:image/"),
        consent: z.literal(true),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<TryOnResponse> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, store_id, name, category, image")
      .eq("id", data.productId)
      .maybeSingle();
    if (!product) return { ok: false, kind: "runtime", message: "Product not found." };

    const { data: session, error } = await supabaseAdmin
      .from("try_on_sessions")
      .insert({ product_id: product.id, store_id: product.store_id, consent: true, provider: "idm-vton", status: "processing" })
      .select("id")
      .single();
    if (error || !session) return { ok: false, kind: "runtime", message: "Could not start the try-on." };
    const sid = session.id;
    await supabaseAdmin.from("usage_events").insert({ type: "try_on_started", store_id: product.store_id, product_id: product.id, session_id: sid });

    const fail = async (kind: "timeout" | "busy" | "runtime", message: string, detail: string): Promise<TryOnResponse> => {
      await supabaseAdmin.from("try_on_sessions").update({ status: "failed", error: detail.slice(0, 500), completed_at: new Date().toISOString() }).eq("id", sid);
      await supabaseAdmin.from("usage_events").insert({ type: "try_on_failed", store_id: product.store_id, product_id: product.id, session_id: sid });
      return { ok: false, kind, message, sessionId: sid };
    };

    try {
      const person = dataUrlToBytes(data.personImage);
      const personPath = `sessions/${sid}/person.${person.type.split("/")[1] ?? "jpg"}`;
      await supabaseAdmin.storage.from("tryon-private").upload(personPath, person.bytes, { contentType: person.type });

      const gRes = await fetch(product.image);
      if (!gRes.ok) return await fail("runtime", "We couldn't load this product's photo.", `garment ${gRes.status}`);
      const garment = { bytes: new Uint8Array(await gRes.arrayBuffer()), type: gRes.headers.get("content-type") || "image/jpeg" };

      const resultUrl = await runIdmVton(person, garment, `${product.name} (${product.category})`);
      const rRes = await fetch(resultUrl);
      if (!rRes.ok) return await fail("runtime", "The result image could not be downloaded.", `result ${rRes.status}`);
      const result = new Uint8Array(await rRes.arrayBuffer());
      const resultType = rRes.headers.get("content-type") || "image/png";
      const resultPath = `sessions/${sid}/result.png`;
      await supabaseAdmin.storage.from("tryon-private").upload(resultPath, result, { contentType: resultType });

      await supabaseAdmin
        .from("try_on_sessions")
        .update({ status: "completed", person_image_path: personPath, result_image_path: resultPath, completed_at: new Date().toISOString() })
        .eq("id", sid);
      await supabaseAdmin.from("usage_events").insert({ type: "try_on_completed", store_id: product.store_id, product_id: product.id, session_id: sid });
      return { ok: true, image: `data:${resultType};base64,${bytesToBase64(result)}`, sessionId: sid };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("try-on failed", msg);
      if (msg === "timeout") return await fail("timeout", "The try-on timed out. Please try again.", msg);
      if (msg.includes("busy")) return await fail("busy", "The free try-on service is busy right now. Please try again in a minute.", msg);
      return await fail("runtime", "The try-on service couldn't create your look. Please try again with a clear, front-facing photo.", msg);
    }
  });

export const recordProductView = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ productId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p } = await supabaseAdmin.from("products").select("id, store_id").eq("id", data.productId).maybeSingle();
    if (p) await supabaseAdmin.from("usage_events").insert({ type: "product_viewed", store_id: p.store_id, product_id: p.id });
    return { ok: true };
  });
