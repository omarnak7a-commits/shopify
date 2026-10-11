import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/ProductPage";

export const Route = createFileRoute("/_site/stores/$slug/$productId/")({
  head: () => ({
    meta: [
      { title: "Product — TryOnix" },
      { name: "description", content: "See product details, colors and sizes, then try it on virtually." },
      { property: "og:title", content: "Product — TryOnix" },
      { property: "og:description", content: "See product details, colors and sizes, then try it on virtually." },
    ],
  }),
  component: Page,
});
