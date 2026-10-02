import { createFileRoute } from "@tanstack/react-router";

const SCOPES = "read:user user:email public_repo";

function clientId() {
  const id = process.env.GITHUB_CLIENT_ID;
  if (!id) throw new Error("GITHUB_CLIENT_ID is not set");
  return id;
}

function clientSecret() {
  const s = process.env.GITHUB_CLIENT_SECRET;
  if (!s) throw new Error("GITHUB_CLIENT_SECRET is not set");
  return s;
}

export const Route = createFileRoute("/api/auth/github")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        // Callback from GitHub
        if (code) {
          let returnTo = "/auth/callback";
          try {
            if (state) {
              const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as {
                returnTo?: string;
              };
              if (parsed.returnTo) returnTo = parsed.returnTo;
            }
          } catch {
            /* ignore bad state */
          }

          const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: clientId(),
              client_secret: clientSecret(),
              code,
            }),
          });
          const tokenBody = (await tokenRes.json()) as {
            access_token?: string;
            error?: string;
            error_description?: string;
          };
          if (!tokenBody.access_token) {
            const msg = encodeURIComponent(
              tokenBody.error_description || tokenBody.error || "OAuth failed",
            );
            return Response.redirect(`${returnTo}?error=${msg}`, 302);
          }
          const redirect = new URL(returnTo, url.origin);
          redirect.searchParams.set("token", tokenBody.access_token);
          return Response.redirect(redirect.toString(), 302);
        }

        // Start OAuth
        const returnToParam = url.searchParams.get("return_to") || `${url.origin}/auth/callback`;
        const statePayload = Buffer.from(
          JSON.stringify({ returnTo: returnToParam }),
          "utf8",
        ).toString("base64url");
        const authorize = new URL("https://github.com/login/oauth/authorize");
        authorize.searchParams.set("client_id", clientId());
        authorize.searchParams.set("scope", SCOPES);
        authorize.searchParams.set("state", statePayload);
        // Callback hits this same route with ?code=
        authorize.searchParams.set("redirect_uri", `${url.origin}/api/auth/github`);
        return Response.redirect(authorize.toString(), 302);
      },
    },
  },
});
