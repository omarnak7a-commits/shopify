import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/auth/LoginPage";

export const Route = createFileRoute("/_site/login")({
  head: () => ({
    meta: [
      { title: "Sign in — TryOnix" },
      { name: "description", content: "Sign in to manage your TryOnix store." },
      { property: "og:title", content: "Sign in — TryOnix" },
      { property: "og:description", content: "Sign in to manage your TryOnix store." },
    ],
  }),
  ssr: false,
  component: Page,
});
