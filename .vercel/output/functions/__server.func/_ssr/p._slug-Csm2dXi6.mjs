import { r as __toESM } from "../_runtime.mjs";
import { a as loadSession } from "./auth-5sJPomW8.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { r as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as normalize } from "./portfolio-QX5LsIJC.mjs";
import { t as PortfolioView } from "./PortfolioView-CZmJebbf.mjs";
import { r as getBySlug } from "./storage-CDPa_T-Y.mjs";
import { t as useGithubRepos } from "./use-github-repos-6OdD9TOQ.mjs";
import { t as Route } from "./p._slug-B6KRCqNS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._slug-Csm2dXi6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PublicPortfolio() {
	const { slug } = Route.useParams();
	const row = (0, import_react.useMemo)(() => {
		const session = loadSession();
		if (!session) return null;
		return getBySlug(session.user.login, slug);
	}, [slug]);
	if (!row) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-4xl font-black",
					children: "Preview not available"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted-foreground",
					children: "Drafts are stored in your browser. Sign in on this device to preview, or publish to GitHub Pages for a public URL."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-6 inline-block underline",
					children: "Go home"
				})
			]
		})
	});
	const { content, theme, sections } = normalize(row);
	const repos = useGithubRepos(content.githubUsername);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortfolioView, {
		content,
		theme,
		sections,
		repos: repos.data ?? null
	});
}
//#endregion
export { PublicPortfolio as component };
