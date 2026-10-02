import { r as __toESM } from "../_runtime.mjs";
import { a as loadSession, c as startGithubLogin, l as startGoogleLogin, s as signInWithToken } from "./auth-5sJPomW8.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { r as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as Button } from "./button-D-5TbdOV.mjs";
import { t as Input } from "./input-D62ypCpI.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { f as Github, l as KeyRound } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-Bh7BLJ1E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const nav = useNavigate();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [token, setToken] = (0, import_react.useState)("");
	const [showToken, setShowToken] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (loadSession()) nav({ to: "/dashboard" });
	}, [nav]);
	function oauth() {
		setBusy(true);
		startGithubLogin();
	}
	function oauthGoogle() {
		setBusy(true);
		startGoogleLogin();
	}
	async function withToken(e) {
		e.preventDefault();
		setBusy(true);
		try {
			await signInWithToken(token);
			toast.success("Signed in");
			nav({ to: "/dashboard" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Sign-in failed");
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center grain px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "block-card w-full max-w-md p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "font-display text-2xl font-black italic",
					children: "Folio."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-6 text-4xl font-black",
					children: "Sign in with GitHub"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted-foreground",
					children: "Drafts stay in this browser. Publish writes a static site to your repo and enables GitHub Pages."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "block",
					className: "mt-8 w-full",
					onClick: oauthGoogle,
					disabled: busy,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						viewBox: "0 0 24 24",
						className: "size-5",
						"aria-hidden": "true",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								fill: "#4285F4",
								d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								fill: "#34A853",
								d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								fill: "#FBBC05",
								d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								fill: "#EA4335",
								d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							})
						]
					}), busy && !showToken ? "Redirecting…" : "Continue with Google"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "block",
					className: "mt-3 w-full",
					onClick: oauth,
					disabled: busy,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, { className: "size-5" }), busy && !showToken ? "Redirecting…" : "Continue with GitHub"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "my-5 text-center text-xs uppercase tracking-widest text-muted-foreground",
					children: "or use a token"
				}),
				!showToken ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "blockOutline",
					className: "w-full",
					onClick: () => setShowToken(true),
					disabled: busy,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" }), " Paste personal access token"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: withToken,
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							autoComplete: "off",
							placeholder: "ghp_… or github_pat_…",
							value: token,
							onChange: (e) => setToken(e.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Create a token at",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "underline",
									href: "https://github.com/settings/tokens/new?scopes=public_repo,read:user&description=Folio",
									target: "_blank",
									rel: "noreferrer",
									children: "github.com/settings/tokens"
								}),
								" ",
								"with ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "public_repo" }),
								" + ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "read:user" }),
								". Token stays in your browser only."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "block",
							className: "w-full",
							type: "submit",
							disabled: busy || !token.trim(),
							children: busy ? "Checking…" : "Sign in with token"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-xs text-muted-foreground",
					children: "Nothing is stored on our servers. If OAuth is not set up on this deploy, use a token."
				})
			]
		})
	});
}
//#endregion
export { AuthPage as component };
