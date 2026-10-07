import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookieHeader = request.headers.get("cookie") || "";
        const match = cookieHeader.match(/folio_session=([^;]+)/);
        if (!match) {
          return new Response(JSON.stringify({ session: null }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const raw = decodeURIComponent(match[1]);
          const session = JSON.parse(raw);
          return new Response(JSON.stringify({ session }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ session: null }), {
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
