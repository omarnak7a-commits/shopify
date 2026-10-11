import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/auth/UpdatePasswordPage";

export const Route = createFileRoute("/_site/update-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — TryOnix" },
      { name: "description", content: "Set a new password for your TryOnix account." },
      { property: "og:title", content: "Choose a new password — TryOnix" },
      { property: "og:description", content: "Set a new password for your TryOnix account." },
    ],
  }),
  ssr: false,
  component: Page,
});
