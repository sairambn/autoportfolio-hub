export type AuthProvider = "github" | "google" | "guest";

export type AppUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  email: string | null;
  provider?: AuthProvider;
};

/** @deprecated use AppUser — kept for older imports */
export type GithubUser = AppUser;

export type AuthSession = {
  token: string;
  user: AppUser;
  expiresAt: number;
  provider?: AuthProvider;
};

const KEY = "folio_github_session";

export function loadSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as AuthSession;
    if (!s?.user?.login) return null;
    return s;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("folio-auth-change"));
}

export function clearSession() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("folio-auth-change"));
}

export function isGuestSession(session: AuthSession | null | undefined) {
  return (
    !session?.token ||
    session.user.login === "guest" ||
    session.provider === "guest" ||
    session.user.provider === "guest"
  );
}

/** Instant start — no account. Drafts stay in this browser. */
export function ensureGuestSession(): AuthSession {
  const existing = loadSession();
  if (existing) return existing;
  const session: AuthSession = {
    token: "",
    provider: "guest",
    user: {
      id: 0,
      login: "guest",
      name: "Guest",
      avatar_url: "",
      html_url: "",
      email: null,
      provider: "guest",
    },
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365,
  };
  saveSession(session);
  return session;
}

export async function fetchGithubUser(token: string): Promise<AppUser> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(
      res.status === 401
        ? "Invalid or expired GitHub token"
        : `GitHub profile failed (${res.status}): ${t}`,
    );
  }
  const u = (await res.json()) as AppUser;
  return {
    id: u.id,
    login: u.login,
    name: u.name,
    avatar_url: u.avatar_url,
    html_url: u.html_url,
    email: u.email ?? null,
    provider: "github",
  };
}

function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

export async function fetchGoogleUser(accessToken: string): Promise<AppUser> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(
      res.status === 401
        ? "Invalid or expired Google token"
        : `Google profile failed (${res.status}): ${t}`,
    );
  }
  const u = (await res.json()) as {
    sub: string;
    name?: string;
    email?: string;
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
  return {
    id: hashId(u.sub),
    login: `g_${local}`,
    name: u.name ?? null,
    avatar_url: u.picture ?? "",
    html_url: email ? `mailto:${email}` : "",
    email,
    provider: "google",
  };
}

/** Sign in with a GitHub personal access token. */
export async function signInWithToken(token: string) {
  const clean = token.trim();
  if (!clean) throw new Error("Paste a GitHub token");
  const user = await fetchGithubUser(clean);
  const session: AuthSession = {
    token: clean,
    user,
    provider: "github",
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 90,
  };
  saveSession(session);
  return user;
}

/** Fetch OAuth authorization URL from server. */
export async function getOAuthUrl(provider: "google" | "github"): Promise<string> {
  const res = await fetch(`/api/auth/url?provider=${provider}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `Could not initialize ${provider} login`);
  }
  return data.url;
}

/** Open provider authorization URL in a popup with postMessage handshake. */
export function openOAuthPopup(url: string, title = "Sign in"): Promise<AuthSession> {
  return new Promise((resolve, reject) => {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      title,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`,
    );

    if (!popup) {
      reject(
        new Error("Sign-in popup was blocked by your browser. Please allow popups for this site."),
      );
      return;
    }

    let resolved = false;

    const messageHandler = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type === "OAUTH_AUTH_SUCCESS") {
        resolved = true;
        window.removeEventListener("message", messageHandler);
        clearInterval(pollTimer);
        const session: AuthSession = {
          token: event.data.token,
          user: event.data.user,
          provider: event.data.provider,
          expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
        };
        saveSession(session);
        resolve(session);
      } else if (event.data.type === "OAUTH_AUTH_ERROR") {
        resolved = true;
        window.removeEventListener("message", messageHandler);
        clearInterval(pollTimer);
        reject(new Error(event.data.error || "Authentication failed"));
      }
    };

    window.addEventListener("message", messageHandler);

    const pollTimer = setInterval(() => {
      if (popup.closed && !resolved) {
        clearInterval(pollTimer);
        window.removeEventListener("message", messageHandler);
        reject(new Error("Sign-in popup was closed before completing."));
      }
    }, 1000);
  });
}

/** Start Google OAuth popup flow. */
export async function loginWithGoogle(): Promise<AuthSession> {
  const url = await getOAuthUrl("google");
  return openOAuthPopup(url, "Google Sign In");
}

/** Start GitHub OAuth popup flow. */
export async function loginWithGithub(): Promise<AuthSession> {
  const url = await getOAuthUrl("github");
  return openOAuthPopup(url, "GitHub Sign In");
}

/** Start GitHub OAuth redirect fallback. */
export function startGithubLogin() {
  window.location.href = `/auth?provider=github&auto=true`;
}

/** Start Google OAuth redirect fallback. */
export function startGoogleLogin() {
  window.location.href = `/auth?provider=google&auto=true`;
}
