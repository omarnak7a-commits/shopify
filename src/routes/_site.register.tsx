import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/auth/RegisterPage";

export const Route = createFileRoute("/_site/register")({
  head: () => ({
    meta: [
      { title: "Create your account — TryOnix" },
      { name: "description", content: "Create a TryOnix account and start your store in minutes." },
      { property: "og:title", content: "Create your account — TryOnix" },
      { property: "og:description", content: "Create a TryOnix account and start your store in minutes." },
    ],
  }),
  ssr: false,
  component: Page,
});
