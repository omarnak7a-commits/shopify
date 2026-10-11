import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/admin/AdminHome";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — TryOnix" },
      { name: "description", content: "Platform administration." },
      { property: "og:title", content: "Admin — TryOnix" },
      { property: "og:description", content: "Platform administration." },
    ],
  }),
  component: Page,
});
