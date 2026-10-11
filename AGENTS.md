<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- GitHub source of truth is omarnak7a-commits/shopify; changes go to branch `lovable-tryonix` via the GitHub connector and a PR into `main`, never force-pushed. Why: the user keeps one repo, not a Lovable-created one.
- Original TryOnix pages live in `src/tryonix/` and use `@/lib/router-compat` instead of react-router-dom; route files in `src/routes/` are thin wrappers. Why: keeps the ported design byte-close to the original repo.
- Public catalog (stores, products, variants) is loaded into an in-memory cache in `src/tryonix/services/catalog.ts`; all writes go to the database then refresh the cache. Why: lets the original synchronous page code work with real data.
- Virtual try-on runs only server-side in `src/lib/tryon.functions.ts` (free IDM-VTON Hugging Face Space over plain HTTP); try-on sessions and usage events are written with the admin client there. Why: clients cannot insert sessions, and no fake results are ever shown.
- Storage buckets are private; product photos use long-lived signed URLs stored on the product row. Why: public buckets are blocked in this workspace.
