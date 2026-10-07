# TryOnix

**Try it. See it. Love it.**

TryOnix is a fashion platform that lets clothing stores give customers a way to virtually try clothes using their own photo. The customer picks a piece, uploads a photo, and sees themselves wearing it — no sign-up, no payment, no checkout.

The AI works quietly in the background. The customer just sees a fashion website.

---

## What TryOnix is

A virtual try-on platform with two sides:

- **Customer experience** — browse stores, open a product, click "Try it on", upload a photo, see the result. Frictionless, mobile-first, no account required to try.
- **Store owner dashboard** — create a store, add products with images and details, see which pieces customers try most.

The brand is intentionally fashion-first, not AI-first. There are no robots, gradients, or technical jargon in the interface.

---

## How it works

1. Customer opens a store page (`/stores/:slug`)
2. Selects a product and clicks "Try it on"
3. Uploads a clear photo with consent
4. The try-on provider processes the request
5. The result is displayed with options to try another, go back, or download

---

## Architecture

```
TryOnix (React frontend)
    ↓
Service layer (catalog, auth, try-on provider)
    ↓
VirtualTryOnProvider (swappable abstraction)
    ↓
[Future: FastAPI → Cloud GPU → CatVTON]
```

### Frontend

- **React** + **Vite** + **TypeScript**
- **Tailwind CSS** for styling
- **Framer Motion** for subtle animations
- **React Router** for navigation
- **Lucide React** for icons

### Data layer

The frontend uses a service abstraction (`src/services/catalog.ts`) that is structured to swap from client-side storage to Supabase/PostgreSQL without UI changes. The current implementation uses localStorage for persistence and is seeded with two demo stores and their products.

### AI / Try-on provider

The try-on system is built around a `VirtualTryOnProvider` interface (`src/services/tryOnProvider.ts`):

```typescript
interface VirtualTryOnProvider {
  name: string;
  tryOn(req: { personImage, garmentImage, category }): Promise<{ image }>;
}
```

The rest of the application never depends on a specific AI model. The active provider is **FASHN.ai**, a production-grade virtual try-on REST API.

#### How the FASHN integration works

1. The customer uploads their photo (converted to a base64 data URI in the browser)
2. The product's garment image URL and the customer's photo are sent to FASHN's `POST /v1/run` endpoint with `model_name: "tryon-max"`
3. FASHN returns a prediction ID immediately
4. The provider polls `GET /v1/status/{id}` every 2 seconds until the status is `completed` or `failed` (120-second timeout)
5. The generated image is returned as a base64 data URI (`return_base64: true`) and displayed directly in an `<img>` tag
6. The customer sees the real AI-generated image of themselves wearing the product

If the API key is missing, the UI shows a clear configuration error — never a fake success.

#### Setting up FASHN

1. Create an account at [app.fashn.ai](https://app.fashn.ai)
2. Purchase API credits at [app.fashn.ai/billing](https://app.fashn.ai/billing)
3. Generate an API key at [app.fashn.ai/api](https://app.fashn.ai/api)
4. Set `VITE_FASHN_API_KEY` in `.env`

**Production security note:** The current implementation calls FASHN directly from the browser, which exposes the API key. For production, proxy FASHN calls through a backend (FastAPI or a Supabase Edge Function) that injects the key server-side. The `VirtualTryOnProvider` interface stays the same — only the provider implementation changes.

**CatVTON licensing note:** CatVTON was originally considered for development/testing but may restrict commercial use. FASHN.ai is used instead as a commercially licensed, production-ready provider. The provider abstraction remains so the model can be replaced without rebuilding TryOnix.

### Backend (design, not built in this environment)

The full production architecture calls for:

- **FastAPI** (Python) REST API
- **PostgreSQL** database (normalized: users, stores, store_members, products, product_variants, try_on_sessions, try_on_results, usage_events, admin_users)
- **S3-compatible object storage** (Cloudflare R2) with signed URLs for private image storage
- **Cloud GPU** running CatVTON or a commercial alternative

These components run outside the Bolt frontend environment and connect through the same service/provider interfaces.

---

## Frontend setup

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run typecheck
```

---

## Environment variables

See `.env.example`. The frontend needs:

- `VITE_SUPABASE_URL` — Supabase project URL (for future database connection)
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key
- `VITE_FASHN_API_KEY` — **Required for try-on.** FASHN.ai API key from [app.fashn.ai/api](https://app.fashn.ai/api)
- `VITE_FASHN_API_URL` — FASHN API base URL (defaults to `https://api.fashn.ai`)

In production, the FASHN API key should live server-side only and be injected by a backend proxy. See the "Production security note" above.

---

## Privacy

- Customer photos are private
- Consent is required before processing
- Photos are never used to train any model
- File validation (type and size limits) on upload
- Automatic cleanup policy (photos not persisted beyond the session in the current implementation)

---

## Testing

The full customer flow is verifiable in the running application:

1. Open the landing page
2. Browse stores
3. Open a store and select a product
4. Click "Try it on"
5. Upload a photo and give consent
6. See the result

Store owner flow:

1. Register as a store owner
2. Create a store (name, tagline, description)
3. Add products (image, category, price, colors, sizes)
4. View analytics (try-ons, success rate, most tried)
5. Edit/delete products

Admin flow:

1. Sign in with an admin account
2. View all stores, users, products, and try-on sessions
3. See failed AI jobs
4. Disable/enable user accounts

---

## Deployment

- **Frontend:** Vercel (or any static host)
- **Backend:** Production Python hosting (FastAPI)
- **Database:** PostgreSQL (Supabase or self-hosted)
- **AI:** Cloud GPU
- **Storage:** Cloudflare R2 or equivalent

---

## Decisions

- **Accent color:** Warm clay/terracotta (#B4533A) — a restrained, fashion-oriented tone that complements the warm off-white background without looking like a tech startup.
- **Typography:** Inter for body, Fraunces for display headings — gives a subtle editorial feel appropriate for fashion.
- **Logo:** A clothing-hanger mark — simple enough to print on a clothing tag, recognizable in black and white.
- **No forced registration:** Customers can try clothes without creating an account, per the frictionless design principle.
- **Provider abstraction:** The AI model is isolated behind `VirtualTryOnProvider` so it can be replaced without touching the UI or service layer.
