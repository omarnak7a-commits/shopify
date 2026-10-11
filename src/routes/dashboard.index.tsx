import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/dashboard/DashboardHome";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TryOnix" },
      { name: "description", content: "Your store overview." },
      { property: "og:title", content: "Dashboard — TryOnix" },
      { property: "og:description", content: "Your store overview." },
    ],
  }),
  component: Page,
});
