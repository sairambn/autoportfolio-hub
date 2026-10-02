import { c as defaultTheme, d as uid, o as defaultContent, s as defaultSections } from "./portfolio-QX5LsIJC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/storage-CDPa_T-Y.js
function key(login) {
	return `folio_portfolios_${login.toLowerCase()}`;
}
function readAll(login) {
	try {
		const raw = localStorage.getItem(key(login));
		if (!raw) return [];
		const list = JSON.parse(raw);
		return Array.isArray(list) ? list : [];
	} catch {
		return [];
	}
}
function writeAll(login, list) {
	localStorage.setItem(key(login), JSON.stringify(list));
}
function listPortfolios(login) {
	return readAll(login).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}
function getPortfolio(login, id) {
	return readAll(login).find((p) => p.id === id) ?? null;
}
function getBySlug(login, slug) {
	return readAll(login).find((p) => p.slug === slug) ?? null;
}
function createPortfolio(login, opts) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const isGuest = login === "guest";
	const base = isGuest ? "portfolio" : login.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 20) || "me";
	const content = defaultContent();
	const record = {
		id: uid() + uid(),
		slug: `${base}-${uid().slice(0, 4)}`,
		title: opts?.title ?? "My Portfolio",
		content: {
			...content,
			name: isGuest ? "Your Name" : login,
			githubUsername: isGuest ? "" : login,
			contact: {
				...content.contact,
				github: isGuest ? "" : `https://github.com/${login}`
			}
		},
		theme: defaultTheme(),
		sections: defaultSections(),
		published: false,
		github_repo: null,
		auto_push: false,
		last_pushed_at: null,
		updated_at: now,
		created_at: now
	};
	const list = readAll(login);
	list.unshift(record);
	writeAll(login, list);
	return record;
}
function updatePortfolio(login, id, patch) {
	const list = readAll(login);
	const i = list.findIndex((p) => p.id === id);
	if (i < 0) return null;
	list[i] = {
		...list[i],
		...patch,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	writeAll(login, list);
	return list[i];
}
function deletePortfolio(login, id) {
	writeAll(login, readAll(login).filter((p) => p.id !== id));
}
//#endregion
export { listPortfolios as a, getPortfolio as i, deletePortfolio as n, updatePortfolio as o, getBySlug as r, createPortfolio as t };
