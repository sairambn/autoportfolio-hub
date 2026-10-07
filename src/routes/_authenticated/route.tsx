import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { loadSession, type AuthSession } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const session = loadSession();
    if (!session || !session.token) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.pathname },
      });
    }
    return { session } as { session: AuthSession };
  },
  component: () => <Outlet />,
});
