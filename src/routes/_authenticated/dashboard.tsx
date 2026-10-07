import { createFileRoute } from "@tanstack/react-router";
import { UserDashboard } from "@/components/UserDashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "User Dashboard — Folio" },
      { name: "description", content: "Manage your profile and portfolios in Cloud Firestore." },
    ],
  }),
  component: UserDashboard,
});
