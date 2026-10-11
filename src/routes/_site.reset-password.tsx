import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/auth/ResetPasswordPage";

export const Route = createFileRoute("/_site/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — TryOnix" },
      { name: "description", content: "Reset your TryOnix account password." },
      { property: "og:title", content: "Reset password — TryOnix" },
      { property: "og:description", content: "Reset your TryOnix account password." },
    ],
  }),
  ssr: false,
  component: Page,
});
