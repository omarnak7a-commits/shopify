import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/dashboard/DashboardProductForm";

export const Route = createFileRoute("/dashboard/products/new")({
  head: () => ({
    meta: [
      { title: "Add product — TryOnix dashboard" },
      { name: "description", content: "Add a new product to your store." },
      { property: "og:title", content: "Add product — TryOnix dashboard" },
      { property: "og:description", content: "Add a new product to your store." },
    ],
  }),
  component: Page,
});
