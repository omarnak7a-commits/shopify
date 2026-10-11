import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/StorePage";

export const Route = createFileRoute("/_site/stores/$slug/")({
  head: () => ({
    meta: [
      { title: "Store — TryOnix" },
      { name: "description", content: "Browse this store's collection and try pieces on with your own photo." },
      { property: "og:title", content: "Store — TryOnix" },
      { property: "og:description", content: "Browse this store's collection and try pieces on with your own photo." },
    ],
  }),
  component: Page,
});
