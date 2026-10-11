import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout as Page } from "@/tryonix/components/Layouts";

export const Route = createFileRoute("/_site")({
  component: Page,
});
