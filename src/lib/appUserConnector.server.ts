// Server-only App User Connector helpers (per-user GitHub via the Lovable gateway).
export const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";

function requireApiKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY is not set.");
  return key;
}

export async function authorizeAppUserOAuth(p: {
  connectorId: string; appUserId: string; clientAPIKey: string; returnUrl: string;
  connectionAPIKey?: string; credentialsConfiguration?: Record<string, unknown>;
}) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${requireApiKey()}`,
    "Content-Type": "application/json",
    "X-Client-Api-Key": p.clientAPIKey,
  };
  if (p.connectionAPIKey) headers["X-Connection-Api-Key"] = p.connectionAPIKey;
  const res = await fetch(`${GATEWAY_BASE_URL}/api/v1/app-users/oauth2/authorize`, {
    method: "POST", headers,
    body: JSON.stringify({ connector_id: p.connectorId, app_user_id: p.appUserId, return_url: p.returnUrl, credentials_configuration: p.credentialsConfiguration }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`OAuth start failed (${res.status}): ${text}`);
  const body = JSON.parse(text) as { authorization_url?: string };
  if (!body.authorization_url) throw new Error("Missing authorization_url");
  return { authorizationUrl: body.authorization_url };
}

export async function callAsAppUser(p: { connectionAPIKey: string; connectorId: string; path: string; init?: RequestInit; requiredScopes?: string[] }) {
  const headers = new Headers(p.init?.headers);
  headers.set("Authorization", `Bearer ${requireApiKey()}`);
  headers.set("X-Connection-Api-Key", p.connectionAPIKey);
  if (p.requiredScopes?.length) headers.set("X-Lovable-Required-Scopes", p.requiredScopes.join(" "));
  const path = p.path.startsWith("/") ? p.path : `/${p.path}`;
  return fetch(`${GATEWAY_BASE_URL}/${p.connectorId}${path}`, { ...p.init, headers });
}

export async function appUserReconnectRequired(res: Response) {
  if (res.status !== 401) return false;
  const body = (await res.clone().json().catch(() => null)) as { type?: unknown } | null;
  return typeof body?.type === "string" && body.type.startsWith("credential_");
}

export async function disconnectAppUser(connectionAPIKey: string, connectorId: string) {
  const res = await fetch(`${GATEWAY_BASE_URL}/api/v1/app-users/connection`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${requireApiKey()}`, "X-Connection-Api-Key": connectionAPIKey, "Content-Type": "application/json" },
    body: JSON.stringify({ connector_id: connectorId }),
  });
  if (!res.ok) throw new Error(`Disconnect failed (${res.status}): ${await res.text()}`);
}

export async function exchangeAppUserOAuthCode(code: string) {
  const res = await fetch(`${GATEWAY_BASE_URL}/api/v1/app-users/oauth2/exchange`, {
    method: "POST",
    headers: { Authorization: `Bearer ${requireApiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`OAuth exchange failed (${res.status}): ${text}`);
  const body = JSON.parse(text) as { api_key?: string; connector_id?: string };
  if (!body.api_key || !body.connector_id) throw new Error("Invalid exchange response");
  return { connectionAPIKey: body.api_key, connectorId: body.connector_id };
}
