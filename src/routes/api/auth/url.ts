import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/url")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const provider = url.searchParams.get("provider");
        const origin = url.origin;

        if (provider === "google") {
          const rawClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
          const clientId = rawClientId?.trim().replace(/^["']|["']$/g, "");

          if (!clientId) {
            return new Response(
              JSON.stringify({
                url: `${origin}/auth?provider=google&auto=true`,
                isFallback: true,
              }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            );
          }

          const redirectUri = `${origin}/api/auth/google`;
          const statePayload = Buffer.from(
            JSON.stringify({ returnTo: `${origin}/auth/callback`, mode: "popup" }),
            "utf8",
          ).toString("base64url");

          const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
          authUrl.searchParams.set("client_id", clientId);
          authUrl.searchParams.set("redirect_uri", redirectUri);
          authUrl.searchParams.set("response_type", "code");
          authUrl.searchParams.set("scope", "openid email profile");
          authUrl.searchParams.set("state", statePayload);
          authUrl.searchParams.set("access_type", "online");
          authUrl.searchParams.set("prompt", "select_account");

          return new Response(JSON.stringify({ url: authUrl.toString() }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        if (provider === "github") {
          const rawClientId = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
          const clientId = rawClientId?.trim().replace(/^["']|["']$/g, "");

          if (!clientId) {
            return new Response(
              JSON.stringify({
                url: `${origin}/auth?provider=github&auto=true`,
                isFallback: true,
              }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            );
          }

          const redirectUri = `${origin}/api/auth/github`;
          const statePayload = Buffer.from(
            JSON.stringify({ returnTo: `${origin}/auth/callback`, mode: "popup" }),
            "utf8",
          ).toString("base64url");

          const authUrl = new URL("https://github.com/login/oauth/authorize");
          authUrl.searchParams.set("client_id", clientId);
          authUrl.searchParams.set("redirect_uri", redirectUri);
          authUrl.searchParams.set("scope", "read:user user:email public_repo");
          authUrl.searchParams.set("state", statePayload);

          return new Response(JSON.stringify({ url: authUrl.toString() }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ error: "Invalid provider. Supported: google, github" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
