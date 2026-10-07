import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async () => {
        const headers = new Headers();
        headers.append(
          "Set-Cookie",
          "folio_session=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0",
        );
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            ...Object.fromEntries(headers.entries()),
            "Content-Type": "application/json",
          },
        });
      },
    },
  },
});
