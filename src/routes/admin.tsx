import { createFileRoute } from "@tanstack/react-router";
import Layout from "@/tryonix/pages/admin/AdminLayout";
import { RequireAuth } from "@/tryonix/components/Layouts";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: Gate,
});

function Gate() {
  return <RequireAuth roles={['admin']}>{Layout}</RequireAuth>;
}
