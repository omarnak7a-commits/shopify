import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/dashboard/DashboardAnalytics";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — TryOnix dashboard" },
      { name: "description", content: "See how customers use virtual try-on in your store." },
      { property: "og:title", content: "Analytics — TryOnix dashboard" },
      { property: "og:description", content: "See how customers use virtual try-on in your store." },
    ],
  }),
  component: Page,
});
