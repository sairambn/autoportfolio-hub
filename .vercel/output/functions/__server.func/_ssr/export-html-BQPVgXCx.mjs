import { r as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { d as require_server_bun } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as googleFontsHref, u as normalize } from "./portfolio-QX5LsIJC.mjs";
import { t as PortfolioView } from "./PortfolioView-CZmJebbf.mjs";
import { a as TSS_SERVER_FUNCTION } from "./createServerFn-DDDJMFWM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/export-html-BQPVgXCx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_server_bun = /* @__PURE__ */ __toESM(require_server_bun());
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/** Escape text for safe use inside HTML attribute / text nodes. */
function esc(s) {
	return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
async function renderPortfolioHtml(row) {
	const { content, theme, sections } = normalize(row);
	let repos = [];
	if (content.githubUsername) try {
		const r = await fetch(`https://api.github.com/users/${encodeURIComponent(content.githubUsername)}/repos?per_page=100&sort=updated`, { headers: {
			"User-Agent": "folio-portfolio-builder",
			Accept: "application/vnd.github+json"
		} });
		if (r.ok) repos = (await r.json()).filter((x) => !x.fork).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 8);
	} catch {}
	const body = (0, import_server_bun.renderToStaticMarkup)((0, import_react.createElement)(PortfolioView, {
		content,
		theme,
		sections,
		repos
	}));
	const title = esc(content.name || row.title || "Portfolio");
	const desc = esc(content.headline || "");
	const bg = esc(theme.palette.bg);
	return [
		"<!doctype html>",
		"<html lang=\"en\">",
		"<head>",
		"<meta charset=\"utf-8\">",
		"<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
		`<title>${title} — Portfolio</title>`,
		`<meta name="description" content="${desc}">`,
		`<meta property="og:title" content="${title}">`,
		`<meta property="og:description" content="${desc}">`,
		`<meta name="theme-color" content="${bg}">`,
		"<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">",
		"<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>",
		`<link rel="stylesheet" href="${googleFontsHref(theme.font)}">`,
		`<style>html,body{margin:0;padding:0;background:${bg};min-height:100%}</style>`,
		"</head>",
		`<body>${body}</body>`,
		"</html>"
	].join("\n");
}
//#endregion
export { renderPortfolioHtml as n, createServerRpc as t };
