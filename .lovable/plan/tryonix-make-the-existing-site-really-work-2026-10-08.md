# TryOnix: make the existing site really work

## GitHub workflow (decided)
- `omarnak7a-commits/shopify` stays the source of truth. Lovable's built-in GitHub sync is not used.
- Phase 0: you connect your GitHub account through the GitHub connector. I check that it has write access to `shopify`.
- I build in Lovable, then push the result to `shopify` through the GitHub API as normal commits on a new branch `lovable-tryonix`, based on the current `main`. Then I open a pull request into `main`. No force-push, and history stays intact. You approve each push in chat.
- I'll push after each phase so the pull request grows step by step. Before each push, I check that no `.env` files or secrets are included.
- Limit: edits made directly on GitHub don't sync back here automatically. Tell me and I'll re-read the branch before continuing.
- The repo is a Bolt app (React Router + Vite pages). This project runs on a different router. So I'll bring your existing pages, logo, colors, fonts and animations over as they are, and only change how pages are wired together. The look stays the same. The pull request will show this switch as one reviewable diff.

## Phase 1 - Inspect and report
- Read every file in the repo (pages, `AuthContext`, `data/store.ts`, `seed.ts`, `services/catalog.ts`, `services/tryOnProvider.ts`, `types`).
- Send you a short Existing / Missing / Mocked list before building. (From the file list: localStorage data store, a mocked try-on provider, and a fake auth context are likely.)

## Phase 2 - Port the design unchanged
- Copy Logo, SiteChrome, SmartImage, styles and Tailwind theme.
- Recreate each page at the same address: landing, for-stores, stores list, store, product, try-on, login/register/reset password, store dashboard (home, products, product form, analytics, settings), admin.

## Phase 3 - Real backend (Lovable Cloud, free tier)
- Tables: profiles, user roles (customer / store_owner / admin), stores, products, product variants (colors, sizes), product images, try-on sessions, usage events.
- Access rules: owners can only edit their own store and products; public can view published products; admins see everything.
- File storage: public bucket for store logos and garment images; private buckets for customer photos and generated results (viewed through short-lived links).
- Email/password sign-in for store owners; customers can try on without an account.

## Phase 4 - Real virtual try-on (free first)
- Provider switch (`VirtualTryOnProvider`) so it can be swapped later.
- First provider: a free Hugging Face Space (CatVTON, with IDM-VTON as fallback), called from the server only.
- Needs a free Hugging Face access token stored as a secret (I will ask for it). Free limits: shared GPU queue, daily GPU-minute quota, often 30-90 s per image, Space may sleep or be busy.
- No fake results: on failure show a clear error with Retry; only show an image the model actually returned.
- If the free Spaces turn out unusable, I stop and tell you the cheapest paid option before adding anything paid.

## Phase 5 - Test for real
- Owner: register, log in, create store, add product with garment image, refresh, log out/in, data still there.
- Customer: open product, try it on, upload photo, get a real generated image.
- Security: a second owner cannot edit the first owner's products.
- Final report with what was preserved, added, tested, and free-tier limits.

## Technical details
- TanStack Start routes in `src/routes`, server functions for try-on and uploads; HF token in server secrets only.
- Try-on runs as a session row (queued, processing, done, failed) the page polls, so long model runs do not time out.
- `@gradio/client` (or direct Gradio HTTP API) from the server function, checked for Worker compatibility.
