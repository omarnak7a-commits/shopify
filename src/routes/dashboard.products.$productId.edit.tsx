import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/dashboard/DashboardProductForm";

export const Route = createFileRoute("/dashboard/products/$productId/edit")({
  head: () => ({
    meta: [
      { title: "Edit product — TryOnix dashboard" },
      { name: "description", content: "Edit a product in your store." },
      { property: "og:title", content: "Edit product — TryOnix dashboard" },
      { property: "og:description", content: "Edit a product in your store." },
    ],
  }),
  component: Page,
});
