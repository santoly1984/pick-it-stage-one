import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleGate } from "@/components/auth/RoleGate";

/** Judge area gate (mock session). Server-side enforcement is a follow-up. */
export const Route = createFileRoute("/judge")({
  component: () => (
    <RoleGate role="judge">
      <Outlet />
    </RoleGate>
  ),
});
