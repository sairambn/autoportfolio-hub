import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { loadSession, type AuthSession } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const session = loadSession();
    if (!session) throw redirect({ to: "/auth" });
    return { session } as { session: AuthSession };
  },
  component: () => <Outlet />,
});
