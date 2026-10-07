import { createFileRoute } from "@tanstack/react-router";

const SCOPES = "read:user user:email public_repo";

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
    <h2>${data.success ? "Signed in with GitHub" : "Sign-in Error"}</h2>
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

export const Route = createFileRoute("/api/auth/github")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const rawClientId = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
        const rawClientSecret =
          process.env.GITHUB_CLIENT_SECRET || process.env.VITE_GITHUB_CLIENT_SECRET;
        const clientId = rawClientId?.trim().replace(/^["']|["']$/g, "");
        const clientSecret = rawClientSecret?.trim().replace(/^["']|["']$/g, "");
        const url = new URL(request.url);

        if (!clientId || !clientSecret) {
          return popupCallbackHtml({
            success: false,
            provider: "github",
            error:
              "GitHub OAuth is not configured. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to your environment variables.",
            returnTo: "/auth",
          });
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
            provider: "github",
            error: url.searchParams.get("error_description") || oauthErr,
            returnTo: "/auth",
          });
        }

        if (code) {
          const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: clientId,
              client_secret: clientSecret,
              code,
            }),
          });

          const tokenBody = (await tokenRes.json()) as {
            access_token?: string;
            error?: string;
            error_description?: string;
          };

          if (!tokenBody.access_token) {
            return popupCallbackHtml({
              success: false,
              provider: "github",
              error:
                tokenBody.error_description || tokenBody.error || "GitHub token exchange failed",
              returnTo: "/auth",
            });
          }

          // Fetch verified GitHub User Profile
          try {
            const userRes = await fetch("https://api.github.com/user", {
              headers: {
                Accept: "application/vnd.github+json",
                Authorization: `Bearer ${tokenBody.access_token}`,
                "X-GitHub-Api-Version": "2022-11-28",
              },
            });

            const u = (await userRes.json()) as {
              id: number;
              login: string;
              name?: string;
              avatar_url?: string;
              html_url?: string;
              email?: string;
            };

            const user = {
              id: u.id,
              login: u.login,
              name: u.name ?? null,
              avatar_url: u.avatar_url ?? "",
              html_url: u.html_url ?? `https://github.com/${u.login}`,
              email: u.email ?? null,
              provider: "github",
            };

            return popupCallbackHtml({
              success: true,
              token: tokenBody.access_token,
              provider: "github",
              user,
              returnTo,
            });
          } catch (e) {
            return popupCallbackHtml({
              success: false,
              provider: "github",
              error: e instanceof Error ? e.message : "Failed to load GitHub user profile",
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

        const authorize = new URL("https://github.com/login/oauth/authorize");
        authorize.searchParams.set("client_id", clientId);
        authorize.searchParams.set("scope", SCOPES);
        authorize.searchParams.set("state", statePayload);
        authorize.searchParams.set("redirect_uri", `${url.origin}/api/auth/github`);
        return Response.redirect(authorize.toString(), 302);
      },
    },
  },
});
