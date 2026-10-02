import { createFileRoute } from "@tanstack/react-router";

const SCOPES = "openid email profile";

function missingEnvHtml(names: string[]) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>Config error</title></head>
<body style="font:15px/1.5 system-ui;display:grid;place-items:center;min-height:100vh;margin:0">
<div style="max-width:28rem;padding:2rem;text-align:center">
<h1>Google OAuth not configured</h1>
<p>Set these in your environment variables (or Vercel → Environment Variables), then redeploy:</p>
<p><code>${names.join(", ")}</code></p>
<p><a href="/">Go home</a></p>
</div></body></html>`,
    { status: 500, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/api/auth/google")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
          const missing = [
            ...(!clientId ? ["GOOGLE_CLIENT_ID"] : []),
            ...(!clientSecret ? ["GOOGLE_CLIENT_SECRET"] : []),
          ];
          return missingEnvHtml(missing);
        }

        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (code) {
          let returnTo = "/auth/callback";
          try {
            if (state) {
              const parsed = JSON.parse(
                Buffer.from(state, "base64url").toString("utf8"),
              ) as { returnTo?: string };
              if (parsed.returnTo) returnTo = parsed.returnTo;
            }
          } catch {
            /* ignore */
          }

          const redirectUri = `${url.origin}/api/auth/google`;

          const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              code,
              redirect_uri: redirectUri,
              grant_type: "authorization_code",
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
            const dest = new URL(returnTo, url.origin);
            dest.searchParams.set("error", msg);
            return Response.redirect(dest.toString(), 302);
          }

          const redirect = new URL(returnTo, url.origin);
          redirect.searchParams.set("token", tokenBody.access_token);
          redirect.searchParams.set("provider", "google");
          return Response.redirect(redirect.toString(), 302);
        }

        const returnToParam =
          url.searchParams.get("return_to") || `${url.origin}/auth/callback`;
        const statePayload = Buffer.from(
          JSON.stringify({ returnTo: returnToParam }),
          "utf8",
        ).toString("base64url");

        const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authorize.searchParams.set("client_id", clientId);
        authorize.searchParams.set("redirect_uri", `${url.origin}/api/auth/google`);
        authorize.searchParams.set("response_type", "code");
        authorize.searchParams.set("scope", SCOPES);
        authorize.searchParams.set("state", statePayload);
        authorize.searchParams.set("access_type", "offline");
        return Response.redirect(authorize.toString(), 302);
      },
    },
  },
});
