import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/StoresListPage";

export const Route = createFileRoute("/_site/stores/")({
  head: () => ({
    meta: [
      { title: "Browse stores — TryOnix" },
      { name: "description", content: "Browse clothing collections and try pieces on your own photo." },
      { property: "og:title", content: "Browse stores — TryOnix" },
      { property: "og:description", content: "Browse clothing collections and try pieces on your own photo." },
    ],
  }),
  component: Page,
});
