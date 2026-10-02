import { r as __toESM } from "../_runtime.mjs";
import { t as clearSession } from "./auth-5sJPomW8.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { r as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as Button } from "./button-D-5TbdOV.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as ExternalLink, r as Trash2, s as Plus, t as User } from "../_libs/lucide-react.mjs";
import { a as listPortfolios, n as deletePortfolio, t as createPortfolio } from "./storage-CDPa_T-Y.mjs";
import { t as Route } from "./dashboard-DmKyaWbn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-Bus8Px0Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const { session } = Route.useRouteContext();
	const nav = useNavigate();
	const login = session.user.login;
	const guest = login === "guest" || !session.token;
	const [list, setList] = (0, import_react.useState)(() => listPortfolios(login));
	(0, import_react.useEffect)(() => {
		setList(listPortfolios(login));
	}, [login]);
	function refresh() {
		setList(listPortfolios(login));
	}
	function create() {
		const p = createPortfolio(login);
		nav({
			to: "/editor/$id",
			params: { id: p.id }
		});
	}
	function remove(id) {
		if (!confirm("Delete this portfolio from this browser?")) return;
		deletePortfolio(login, id);
		refresh();
	}
	function signOut() {
		clearSession();
		nav({ to: "/" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen grain",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "mx-auto flex max-w-5xl items-center justify-between px-6 py-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "font-display text-2xl font-black italic",
				children: "Folio."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					session.user.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: session.user.avatar_url,
						alt: "",
						className: "size-8 rounded-full border-2 border-ink"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-8 place-items-center rounded-full border-2 border-ink bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium",
						children: guest ? "Guest" : `@${login}`
					}),
					guest ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "blockOutline",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth",
							children: "Sign in"
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: signOut,
						children: "Sign out"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-5xl px-6 pb-20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-10 flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-5xl font-black",
					children: "Your portfolios"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Saved in this browser. Download HTML anytime — or publish to GitHub if you signed in."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "block",
					onClick: create,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), " New portfolio"]
				})]
			}), list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "block-card p-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-lg",
					children: "No portfolios yet."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "block",
					className: "mt-4",
					onClick: create,
					children: "Create your first"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-5 md:grid-cols-2",
				children: list.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "block-card flex flex-col p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-2xl font-bold",
								children: p.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${p.github_repo ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`,
								children: p.github_repo ? "Published" : "Draft"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: p.github_repo && !guest ? `github.com/${login}/${p.github_repo}` : "Download HTML or publish later"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "block",
									size: "sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/editor/$id",
										params: { id: p.id },
										children: "Edit"
									})
								}),
								p.github_repo && !guest ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "blockOutline",
									size: "sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: `https://${login}.github.io/${p.github_repo}/`,
										target: "_blank",
										rel: "noreferrer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {}), " View"]
									})
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									className: "ml-auto",
									onClick: () => remove(p.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
								})
							]
						})
					]
				}, p.id))
			})]
		})]
	});
}
//#endregion
export { Dashboard as component };
