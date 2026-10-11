import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/TryOnPage";

export const Route = createFileRoute("/_site/stores/$slug/$productId/try-on")({
  head: () => ({
    meta: [
      { title: "Try it on — TryOnix" },
      { name: "description", content: "Upload a photo of yourself and see how this piece looks on you." },
      { property: "og:title", content: "Try it on — TryOnix" },
      { property: "og:description", content: "Upload a photo of yourself and see how this piece looks on you." },
    ],
  }),
  ssr: false,
  component: Page,
});
