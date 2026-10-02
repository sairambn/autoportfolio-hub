export type GithubUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  email: string | null;
};

export type AuthSession = {
  token: string;
  user: GithubUser;
  expiresAt: number; // ms epoch; GitHub tokens don't expire, we still refresh profile periodically
};

const KEY = "folio_github_session";

export function loadSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as AuthSession;
    if (!s?.token || !s?.user?.login) return null;
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

export async function fetchGithubUser(token: string): Promise<GithubUser> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`GitHub profile failed (${res.status})`);
  const u = (await res.json()) as GithubUser;
  return {
    id: u.id,
    login: u.login,
    name: u.name,
    avatar_url: u.avatar_url,
    html_url: u.html_url,
    email: u.email ?? null,
  };
}

/** Start GitHub OAuth (redirect). Needs GITHUB_CLIENT_ID on the server. */
export function startGithubLogin() {
  const returnTo = encodeURIComponent(window.location.origin + "/auth/callback");
  window.location.href = `/api/auth/github?return_to=${returnTo}`;
}
