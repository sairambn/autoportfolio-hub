//#region node_modules/.nitro/vite/services/ssr/assets/auth-5sJPomW8.js
var KEY = "folio_github_session";
function loadSession() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const s = JSON.parse(raw);
		if (!s?.user?.login) return null;
		return s;
	} catch {
		return null;
	}
}
function saveSession(session) {
	localStorage.setItem(KEY, JSON.stringify(session));
	window.dispatchEvent(new Event("folio-auth-change"));
}
function clearSession() {
	localStorage.removeItem(KEY);
	window.dispatchEvent(new Event("folio-auth-change"));
}
/** Instant start — no account. Drafts stay in this browser. */
function ensureGuestSession() {
	const existing = loadSession();
	if (existing) return existing;
	const session = {
		token: "",
		user: {
			id: 0,
			login: "guest",
			name: "Guest",
			avatar_url: "",
			html_url: "",
			email: null
		},
		expiresAt: Date.now() + 31536e6
	};
	saveSession(session);
	return session;
}
async function fetchGithubUser(token) {
	const res = await fetch("https://api.github.com/user", { headers: {
		Accept: "application/vnd.github+json",
		Authorization: `Bearer ${token}`,
		"X-GitHub-Api-Version": "2022-11-28"
	} });
	if (!res.ok) {
		const t = await res.text();
		throw new Error(res.status === 401 ? "Invalid or expired GitHub token" : `GitHub profile failed (${res.status}): ${t}`);
	}
	const u = await res.json();
	return {
		id: u.id,
		login: u.login,
		name: u.name,
		avatar_url: u.avatar_url,
		html_url: u.html_url,
		email: u.email ?? null
	};
}
/** Sign in with a personal access token. */
async function signInWithToken(token) {
	const clean = token.trim();
	if (!clean) throw new Error("Paste a GitHub token");
	const user = await fetchGithubUser(clean);
	saveSession({
		token: clean,
		user,
		expiresAt: Date.now() + 7776e6
	});
	return user;
}
/** Start GitHub OAuth (needs GITHUB_CLIENT_ID on the server). */
function startGithubLogin() {
	const returnTo = encodeURIComponent(window.location.origin + "/auth/callback");
	window.location.href = `/api/auth/github?return_to=${returnTo}`;
}
/** Start Google OAuth (needs GOOGLE_CLIENT_ID on the server). */
function startGoogleLogin() {
	window.location.href = "/api/auth/google?return_to=" + encodeURIComponent(window.location.origin + "/auth/callback");
}
/** Fetch Google user info and map to GithubUser shape. */
async function fetchGoogleUser(token) {
	const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${token}` } });
	if (!res.ok) {
		const t = await res.text();
		throw new Error(res.status === 401 ? "Invalid or expired Google token" : `Google profile failed (${res.status}): ${t}`);
	}
	const u = await res.json();
	const login = u.email?.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "") || "user";
	return {
		id: parseInt(u.sub.slice(0, 9), 10) || 0,
		login,
		name: u.name ?? null,
		avatar_url: u.picture ?? "",
		html_url: "",
		email: u.email ?? null
	};
}
//#endregion
export { loadSession as a, startGithubLogin as c, fetchGoogleUser as i, startGoogleLogin as l, ensureGuestSession as n, saveSession as o, fetchGithubUser as r, signInWithToken as s, clearSession as t };
