import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CONNECTOR = "github";
const SCOPES = ["read:user", "public_repo"];

export const githubStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const configured = !!process.env["GITHUB_APP_USER_CONNECTOR_CLIENT_API_KEY"];
    if (!configured) return { configured: false, connected: false, login: null as string | null };
    const { getConnection } = await import("./connections.server");
    const conn = await getConnection(context.userId, CONNECTOR);
    return { configured: true, connected: !!conn, login: conn?.login ?? null };
  });

export const startGithubConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientKey = process.env["GITHUB_APP_USER_CONNECTOR_CLIENT_API_KEY"];
    if (!clientKey) throw new Error("GitHub connection isn't set up for this app yet.");
    const { authorizeAppUserOAuth } = await import("./appUserConnector.server");
    const { getConnection } = await import("./connections.server");
    const request = getRequest();
    const url = new URL(request.url);
    const sandboxHost = url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
    const returnUrl = new URL("/oauth/github/return", sandboxHost ? `https://${sandboxHost}` : url.origin).toString();
    const existing = await getConnection(context.userId, CONNECTOR);
    return authorizeAppUserOAuth({
      connectorId: CONNECTOR, appUserId: context.userId, clientAPIKey: clientKey, returnUrl,
      connectionAPIKey: existing?.key, credentialsConfiguration: { scopes: SCOPES },
    });
  });

export const completeGithubConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ code: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const { exchangeAppUserOAuthCode, callAsAppUser } = await import("./appUserConnector.server");
    const { saveConnection } = await import("./connections.server");
    const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(data.code);
    if (connectorId !== CONNECTOR) throw new Error("Wrong connector");
    const me = await callAsAppUser({ connectionAPIKey, connectorId, path: "/user", init: { headers: { Accept: "application/vnd.github+json" } } });
    const login = me.ok ? ((await me.json()) as { login: string }).login : null;
    await saveConnection(context.userId, connectorId, connectionAPIKey, login);
    return { ok: true, login };
  });

export const disconnectGithub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getConnection, deleteConnection } = await import("./connections.server");
    const { disconnectAppUser } = await import("./appUserConnector.server");
    const conn = await getConnection(context.userId, CONNECTOR);
    if (conn) await disconnectAppUser(conn.key, CONNECTOR).catch((e) => console.error(e));
    await deleteConnection(context.userId, CONNECTOR);
    return { ok: true };
  });

export const publishToGithub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ portfolioId: z.string().uuid(), repo: z.string().regex(/^[A-Za-z0-9._-]{1,100}$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const { getConnection } = await import("./connections.server");
    const { callAsAppUser, appUserReconnectRequired } = await import("./appUserConnector.server");
    const { renderPortfolioHtml } = await import("./export-html");
    const conn = await getConnection(context.userId, CONNECTOR);
    if (!conn) throw new Error("Connect your GitHub account first.");
    const { data: row, error } = await context.supabase.from("portfolios").select("*").eq("id", data.portfolioId).single();
    if (error || !row) throw new Error("Portfolio not found");

    const gh = (path: string, init?: RequestInit) => callAsAppUser({
      connectionAPIKey: conn.key, connectorId: CONNECTOR, path, requiredScopes: SCOPES,
      init: { ...init, headers: { Accept: "application/vnd.github+json", "Content-Type": "application/json", ...(init?.headers ?? {}) } },
    });

    let login = conn.login;
    if (!login) {
      const me = await gh("/user");
      if (await appUserReconnectRequired(me)) throw new Error("Your GitHub access needs to be renewed. Reconnect GitHub.");
      login = ((await me.json()) as { login: string }).login;
    }

    const repoRes = await gh(`/repos/${login}/${data.repo}`);
    if (repoRes.status === 404) {
      const created = await gh("/user/repos", { method: "POST", body: JSON.stringify({ name: data.repo, auto_init: true, description: "My portfolio" }) });
      if (!created.ok) throw new Error(`Couldn't create repo [${created.status}]: ${await created.text()}`);
    } else if (!repoRes.ok) {
      throw new Error(`GitHub error [${repoRes.status}]: ${await repoRes.text()}`);
    }

    const html = await renderPortfolioHtml(row);
    const existing = await gh(`/repos/${login}/${data.repo}/contents/index.html`);
    const sha = existing.ok ? ((await existing.json()) as { sha: string }).sha : undefined;
    const put = await gh(`/repos/${login}/${data.repo}/contents/index.html`, {
      method: "PUT",
      body: JSON.stringify({ message: `Update portfolio ${new Date().toISOString()}`, content: Buffer.from(html, "utf8").toString("base64"), sha }),
    });
    if (!put.ok) throw new Error(`Push failed [${put.status}]: ${await put.text()}`);

    // Best effort: enable GitHub Pages on the default branch.
    const pages = await gh(`/repos/${login}/${data.repo}/pages`, { method: "POST", body: JSON.stringify({ source: { branch: "main", path: "/" } }) });
    if (!pages.ok && pages.status !== 409) console.warn("Pages enable:", pages.status, await pages.text());

    await context.supabase.from("portfolios").update({ github_repo: data.repo, last_pushed_at: new Date().toISOString() }).eq("id", data.portfolioId);
    return { repoUrl: `https://github.com/${login}/${data.repo}`, pagesUrl: `https://${login}.github.io/${data.repo}/` };
  });
