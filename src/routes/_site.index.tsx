import { createFileRoute } from "@tanstack/react-router";
import Page from "@/tryonix/pages/LandingPage";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "TryOnix — Try it. See it. Love it." },
      { name: "description", content: "Try clothes virtually using your own photo. See yourself in it before you decide what to wear." },
      { property: "og:title", content: "TryOnix — Try it. See it. Love it." },
      { property: "og:description", content: "Try clothes virtually using your own photo. See yourself in it before you decide what to wear." },
    ],
  }),
  component: Page,
});
