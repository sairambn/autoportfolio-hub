import { r as __toESM } from "../_runtime.mjs";
import { a as loadSession, n as ensureGuestSession } from "./auth-5sJPomW8.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { r as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { S as useRouter, _ as lazyRouteComponent, b as Link, f as Scripts, g as Outlet, h as createRouter, p as HeadContent, q as redirect, v as createFileRoute, y as createRootRouteWithContext } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { n as FONTS } from "./portfolio-QX5LsIJC.mjs";
import { t as Route$10 } from "./dashboard-DmKyaWbn.mjs";
import { t as Route$11 } from "./editor._id-DyiBVdpD.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Route$12 } from "./p._slug-B6KRCqNS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DUIqFB0F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-Cu9v96t2.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var allFonts = `https://fonts.googleapis.com/css2?${Object.values(FONTS).map((f) => f.google).join("&")}&family=JetBrains+Mono:wght@400;700&display=swap`;
var Route$9 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Folio — Portfolio builder" },
			{
				name: "description",
				content: "Build a custom portfolio and publish it to GitHub automatically."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "stylesheet",
				href: allFonts
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$9.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})]
	});
}
var $$splitComponentImporter$6 = () => import("./routes-CqkdgYbD.mjs");
var Route$8 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Folio — Portfolio from your resume in minutes" },
		{
			name: "description",
			content: "Enter details, upload photo and resume, get a portfolio website deployed online."
		},
		{
			property: "og:title",
			content: "Folio — Portfolio from your resume"
		},
		{
			property: "og:description",
			content: "Photo + resume → live portfolio website."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./route-Di7iQBCH.mjs");
var Route$7 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async ({ location }) => {
		let session = loadSession();
		if (!session && (location.pathname.startsWith("/editor") || location.pathname === "/dashboard")) session = ensureGuestSession();
		if (!session) throw redirect({ to: "/" });
		return { session };
	},
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./auth-Bh7BLJ1E.mjs");
var Route$6 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Sign in — Folio" },
		{
			name: "description",
			content: "Sign in with GitHub to build and publish your portfolio."
		},
		{
			property: "og:title",
			content: "Sign in — Folio"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./create-ACj223_L.mjs");
var Route$5 = createFileRoute("/create")({
	ssr: false,
	head: () => ({ meta: [{ title: "Create portfolio — Folio" }, {
		name: "description",
		content: "Choose from 7 themes. Upload resume and photo. Deploy a live portfolio."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./auth.callback-CXiYQ5yx.mjs");
var Route$4 = createFileRoute("/auth/callback")({
	head: () => ({ meta: [{ title: "Signing in…" }, {
		name: "robots",
		content: "noindex"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./demo.sakura-Bz4aBduO.mjs");
var Route$3 = createFileRoute("/demo/sakura")({
	ssr: false,
	head: () => ({ meta: [{ title: "Sakura editorial poster — demo" }, {
		name: "description",
		content: "Scroll-driven sakura editorial poster component demo."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var SCOPES$1 = "read:user user:email public_repo";
function missingEnvHtml$1(names) {
	return new Response(`<!doctype html><html><head><meta charset="utf-8"><title>Config error</title></head>
<body style="font:15px/1.5 system-ui;display:grid;place-items:center;min-height:100vh;margin:0">
<div style="max-width:28rem;padding:2rem;text-align:center">
<h1>GitHub OAuth not configured</h1>
<p>Set these in Vercel → Environment Variables, then redeploy:</p>
<p><code>${names.join(", ")}</code></p>
<p><a href="/">Go home</a></p>
</div></body></html>`, {
		status: 500,
		headers: { "content-type": "text/html; charset=utf-8" }
	});
}
var Route$2 = createFileRoute("/api/auth/github")({ server: { handlers: { GET: async ({ request }) => {
	const clientId = process.env.GITHUB_CLIENT_ID;
	const clientSecret = process.env.GITHUB_CLIENT_SECRET;
	if (!clientId || !clientSecret) return missingEnvHtml$1([...!clientId ? ["GITHUB_CLIENT_ID"] : [], ...!clientSecret ? ["GITHUB_CLIENT_SECRET"] : []]);
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	if (code) {
		let returnTo = "/auth/callback";
		try {
			if (state) {
				const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
				if (parsed.returnTo) returnTo = parsed.returnTo;
			}
		} catch {}
		const tokenBody = await (await fetch("https://github.com/login/oauth/access_token", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				client_id: clientId,
				client_secret: clientSecret,
				code
			})
		})).json();
		if (!tokenBody.access_token) {
			const msg = encodeURIComponent(tokenBody.error_description || tokenBody.error || "OAuth failed");
			const dest = new URL(returnTo, url.origin);
			dest.searchParams.set("error", msg);
			return Response.redirect(dest.toString(), 302);
		}
		const redirect = new URL(returnTo, url.origin);
		redirect.searchParams.set("token", tokenBody.access_token);
		return Response.redirect(redirect.toString(), 302);
	}
	const returnToParam = url.searchParams.get("return_to") || `${url.origin}/auth/callback`;
	const statePayload = Buffer.from(JSON.stringify({ returnTo: returnToParam }), "utf8").toString("base64url");
	const authorize = new URL("https://github.com/login/oauth/authorize");
	authorize.searchParams.set("client_id", clientId);
	authorize.searchParams.set("scope", SCOPES$1);
	authorize.searchParams.set("state", statePayload);
	authorize.searchParams.set("redirect_uri", `${url.origin}/api/auth/github`);
	return Response.redirect(authorize.toString(), 302);
} } } });
var SCOPES = "openid email profile";
function missingEnvHtml(names) {
	return new Response(`<!doctype html><html><head><meta charset="utf-8"><title>Config error</title></head>
<body style="font:15px/1.5 system-ui;display:grid;place-items:center;min-height:100vh;margin:0">
<div style="max-width:28rem;padding:2rem;text-align:center">
<h1>Google OAuth not configured</h1>
<p>Set these in your environment variables (or Vercel → Environment Variables), then redeploy:</p>
<p><code>${names.join(", ")}</code></p>
<p><a href="/">Go home</a></p>
</div></body></html>`, {
		status: 500,
		headers: { "content-type": "text/html; charset=utf-8" }
	});
}
var Route$1 = createFileRoute("/api/auth/google")({ server: { handlers: { GET: async ({ request }) => {
	const clientId = process.env.GOOGLE_CLIENT_ID;
	const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
	if (!clientId || !clientSecret) return missingEnvHtml([...!clientId ? ["GOOGLE_CLIENT_ID"] : [], ...!clientSecret ? ["GOOGLE_CLIENT_SECRET"] : []]);
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	if (code) {
		let returnTo = "/auth/callback";
		try {
			if (state) {
				const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
				if (parsed.returnTo) returnTo = parsed.returnTo;
			}
		} catch {}
		const redirectUri = `${url.origin}/api/auth/google`;
		const tokenBody = await (await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				client_id: clientId,
				client_secret: clientSecret,
				code,
				redirect_uri: redirectUri,
				grant_type: "authorization_code"
			})
		})).json();
		if (!tokenBody.access_token) {
			const msg = encodeURIComponent(tokenBody.error_description || tokenBody.error || "OAuth failed");
			const dest = new URL(returnTo, url.origin);
			dest.searchParams.set("error", msg);
			return Response.redirect(dest.toString(), 302);
		}
		const redirect = new URL(returnTo, url.origin);
		redirect.searchParams.set("token", tokenBody.access_token);
		redirect.searchParams.set("provider", "google");
		return Response.redirect(redirect.toString(), 302);
	}
	const returnToParam = url.searchParams.get("return_to") || `${url.origin}/auth/callback`;
	const statePayload = Buffer.from(JSON.stringify({ returnTo: returnToParam }), "utf8").toString("base64url");
	const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
	authorize.searchParams.set("client_id", clientId);
	authorize.searchParams.set("redirect_uri", `${url.origin}/api/auth/google`);
	authorize.searchParams.set("response_type", "code");
	authorize.searchParams.set("scope", SCOPES);
	authorize.searchParams.set("state", statePayload);
	authorize.searchParams.set("access_type", "offline");
	return Response.redirect(authorize.toString(), 302);
} } } });
var $$splitComponentImporter = () => import("./return-c54zNWep.mjs");
var Route = createFileRoute("/oauth/github/return")({
	head: () => ({ meta: [{ title: "Connecting GitHub…" }, {
		name: "robots",
		content: "noindex"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$8.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$9
});
var AuthenticatedRouteRoute = Route$7.update({
	id: "/_authenticated",
	getParentRoute: () => Route$9
});
var AuthRoute = Route$6.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$9
});
var CreateRoute = Route$5.update({
	id: "/create",
	path: "/create",
	getParentRoute: () => Route$9
});
var AuthenticatedDashboardRoute = Route$10.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthCallbackRoute = Route$4.update({
	id: "/callback",
	path: "/callback",
	getParentRoute: () => AuthRoute
});
var DemoSakuraRoute = Route$3.update({
	id: "/demo/sakura",
	path: "/demo/sakura",
	getParentRoute: () => Route$9
});
var PSlugRoute = Route$12.update({
	id: "/p/$slug",
	path: "/p/$slug",
	getParentRoute: () => Route$9
});
var AuthenticatedEditorIdRoute = Route$11.update({
	id: "/editor/$id",
	path: "/editor/$id",
	getParentRoute: () => AuthenticatedRouteRoute
});
var ApiAuthGithubRoute = Route$2.update({
	id: "/api/auth/github",
	path: "/api/auth/github",
	getParentRoute: () => Route$9
});
var ApiAuthGoogleRoute = Route$1.update({
	id: "/api/auth/google",
	path: "/api/auth/google",
	getParentRoute: () => Route$9
});
var OauthGithubReturnRoute = Route.update({
	id: "/oauth/github/return",
	path: "/oauth/github/return",
	getParentRoute: () => Route$9
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedDashboardRoute,
	AuthenticatedEditorIdRoute
};
var AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
var AuthRouteChildren = { AuthCallbackRoute };
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
	AuthRoute: AuthRoute._addFileChildren(AuthRouteChildren),
	CreateRoute,
	DemoSakuraRoute,
	PSlugRoute,
	ApiAuthGithubRoute,
	ApiAuthGoogleRoute,
	OauthGithubReturnRoute
};
var routeTree = Route$9._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
