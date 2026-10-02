import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ensureGuestSession, loadSession, type AuthSession } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    let session = loadSession();
    // Deep-link to /editor or /dashboard without prior visit → soft guest
    if (!session && (location.pathname.startsWith("/editor") || location.pathname === "/dashboard")) {
      session = ensureGuestSession();
    }
    if (!session) throw redirect({ to: "/" });
    return { session } as { session: AuthSession };
  },
  component: () => <Outlet />,
});
