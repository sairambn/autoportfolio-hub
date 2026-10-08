import { createFileRoute } from "@tanstack/react-router";

const SCOPES = "openid email profile";

function popupCallbackHtml(data: {
  success: boolean;
  token?: string;
  provider: "google" | "github";
  user?: unknown;
  error?: string;
  returnTo: string;
}) {
  const jsonPayload = JSON.stringify(
    data.success
      ? {
          type: "OAUTH_AUTH_SUCCESS",
          token: data.token,
          provider: data.provider,
          user: data.user,
        }
      : {
          type: "OAUTH_AUTH_ERROR",
          error: data.error || "Authentication failed",
        },
  );

  const headers = new Headers();
  headers.set("Content-Type", "text/html; charset=utf-8");

  if (data.success && data.token && data.user) {
    const sessionCookieValue = encodeURIComponent(
      JSON.stringify({
        token: data.token,
        provider: data.provider,
        user: data.user,
      }),
    );
    headers.append(
      "Set-Cookie",
      `folio_session=${sessionCookieValue}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${60 * 60 * 24 * 30}`,
    );
  }

  return new Response(
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.success ? "Sign in Successful" : "Sign in Failed"} — Folio</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #fdfbf7;
      color: #1a1918;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
      box-sizing: border-box;
    }
    .card {
      background: #fff;
      border: 2px solid #1a1918;
      border-radius: 8px;
      box-shadow: 4px 4px 0 0 #1a1918;
      padding: 2rem;
      max-width: 24rem;
      width: 100%;
      text-align: center;
    }
    h2 { margin-top: 0; font-size: 1.25rem; font-weight: 800; }
    p { font-size: 0.875rem; color: #555; line-height: 1.5; }
    .btn {
      display: inline-block;
      margin-top: 1rem;
      background: #1a1918;
      color: #fff;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>${data.success ? "Signed in with Google" : "Sign-in Error"}</h2>
    <p>${data.success ? "Completing sign-in. This window will close automatically." : (data.error ?? "Could not complete sign in.")}</p>
    ${!data.success ? `<a href="/auth" class="btn">Back to Sign In</a>` : ""}
  </div>
  <script>
    (function() {
      var payload = ${jsonPayload};
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(payload, "*");
          setTimeout(function() { window.close(); }, 350);
          return;
        }
      } catch (e) {
        console.error("Popup postMessage error:", e);
      }
      if (payload.type === "OAUTH_AUTH_SUCCESS") {
        window.location.href = "${data.returnTo}";
      }
    })();
  </script>
</body>
</html>`,
    {
      status: data.success ? 200 : 400,
      headers,
    },
  );
}

export const Route = createFileRoute("/api/auth/google")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const rawClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
        const rawClientSecret =
          process.env.GOOGLE_CLIENT_SECRET || process.env.VITE_GOOGLE_CLIENT_SECRET;
        const clientId = rawClientId?.trim().replace(/^["']|["']$/g, "");
        const clientSecret = rawClientSecret?.trim().replace(/^["']|["']$/g, "");
        const url = new URL(request.url);

        if (!clientId || !clientSecret) {
          const returnToParam = url.searchParams.get("return_to") || "/dashboard";
          // Seamlessly redirect to client-side Firebase Auth so users on Vercel never encounter configuration errors
          return Response.redirect(
            `${url.origin}/auth?provider=google&auto=true&return_to=${encodeURIComponent(returnToParam)}`,
            302,
          );
        }

        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const oauthErr = url.searchParams.get("error");

        let returnTo = "/dashboard";
        try {
          if (state) {
            const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as {
              returnTo?: string;
            };
            if (parsed.returnTo) returnTo = parsed.returnTo;
          }
        } catch {
          /* ignore */
        }

        if (oauthErr) {
          return popupCallbackHtml({
            success: false,
            provider: "google",
            error: url.searchParams.get("error_description") || oauthErr,
            returnTo: "/auth",
          });
        }

        if (code) {
          const redirectUri = `${url.origin}/api/auth/google`;
          const body = new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          });

          const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
          });

          const tokenBody = (await tokenRes.json()) as {
            access_token?: string;
            error?: string;
            error_description?: string;
          };

          if (!tokenBody.access_token) {
            return popupCallbackHtml({
              success: false,
              provider: "google",
              error:
                tokenBody.error_description || tokenBody.error || "Google token exchange failed",
              returnTo: "/auth",
            });
          }

          // Fetch verified Google User Profile
          try {
            const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${tokenBody.access_token}` },
            });
            const u = (await userRes.json()) as {
              sub: string;
              name?: string;
              email?: string;
              email_verified?: boolean;
              picture?: string;
              given_name?: string;
            };

            const email = u.email ?? null;
            const local =
              (email?.split("@")[0] || u.given_name || u.name || "user")
                .toLowerCase()
                .replace(/[^a-z0-9._-]/g, "-")
                .replace(/-+/g, "-")
                .slice(0, 32) || "user";

            const user = {
              id:
                Math.abs(
                  u.sub.split("").reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0),
                ) || 1,
              login: `g_${local}`,
              name: u.name ?? null,
              avatar_url: u.picture ?? "",
              html_url: email ? `mailto:${email}` : "",
              email,
              provider: "google",
            };

            return popupCallbackHtml({
              success: true,
              token: tokenBody.access_token,
              provider: "google",
              user,
              returnTo,
            });
          } catch (e) {
            return popupCallbackHtml({
              success: false,
              provider: "google",
              error: e instanceof Error ? e.message : "Failed to load Google profile",
              returnTo: "/auth",
            });
          }
        }

        // Direct GET redirect flow fallback
        const returnToParam = url.searchParams.get("return_to") || `${url.origin}/auth/callback`;
        const statePayload = Buffer.from(
          JSON.stringify({ returnTo: returnToParam, mode: "redirect" }),
          "utf8",
        ).toString("base64url");

        const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authorize.searchParams.set("client_id", clientId);
        authorize.searchParams.set("redirect_uri", `${url.origin}/api/auth/google`);
        authorize.searchParams.set("response_type", "code");
        authorize.searchParams.set("scope", SCOPES);
        authorize.searchParams.set("state", statePayload);
        authorize.searchParams.set("access_type", "online");
        authorize.searchParams.set("prompt", "select_account");
        return Response.redirect(authorize.toString(), 302);
      },
    },
  },
});
