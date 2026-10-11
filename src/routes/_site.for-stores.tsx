import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/ForStoresPage";

export const Route = createFileRoute("/_site/for-stores")({
  head: () => ({
    meta: [
      { title: "TryOnix for stores — virtual try-on for your shop" },
      { name: "description", content: "Add virtual try-on to your clothing store and help customers see themselves in your pieces." },
      { property: "og:title", content: "TryOnix for stores — virtual try-on for your shop" },
      { property: "og:description", content: "Add virtual try-on to your clothing store and help customers see themselves in your pieces." },
    ],
  }),
  component: Page,
});
