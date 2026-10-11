import { createFileRoute } from "@tanstack/react-router";
import Layout from "@/tryonix/pages/dashboard/DashboardLayout";
import { RequireAuth } from "@/tryonix/components/Layouts";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  component: Gate,
});

function Gate() {
  return <RequireAuth roles={['store_owner', 'admin']}>{Layout}</RequireAuth>;
}
