import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/dashboard/DashboardProducts";

export const Route = createFileRoute("/dashboard/products/")({
  head: () => ({
    meta: [
      { title: "Products — TryOnix dashboard" },
      { name: "description", content: "Manage your store's products." },
      { property: "og:title", content: "Products — TryOnix dashboard" },
      { property: "og:description", content: "Manage your store's products." },
    ],
  }),
  component: Page,
});
