import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/dashboard/DashboardSettings";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TryOnix dashboard" },
      { name: "description", content: "Update your store details." },
      { property: "og:title", content: "Settings — TryOnix dashboard" },
      { property: "og:description", content: "Update your store details." },
    ],
  }),
  component: Page,
});
