import { r as __toESM } from "../_runtime.mjs";
import { i as fetchGoogleUser, o as saveSession, r as fetchGithubUser } from "./auth-5sJPomW8.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { r as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.callback-CXiYQ5yx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Callback() {
	const nav = useNavigate();
	const [msg, setMsg] = (0, import_react.useState)("Finishing sign-in…");
	(0, import_react.useEffect)(() => {
		const params = new URLSearchParams(window.location.search);
		const err = params.get("error");
		const token = params.get("token");
		const provider = params.get("provider");
		if (err) {
			setMsg(err);
			return;
		}
		if (!token) {
			setMsg("Missing token. Try signing in again.");
			return;
		}
		(async () => {
			try {
				const user = provider === "google" ? await fetchGoogleUser(token) : await fetchGithubUser(token);
				saveSession({
					token,
					user,
					expiresAt: Date.now() + 2592e6,
					provider: provider === "google" ? "google" : "github"
				});
				window.history.replaceState({}, "", "/auth/callback");
				nav({ to: "/dashboard" });
			} catch (e) {
				setMsg(e instanceof Error ? e.message : "Sign-in failed");
			}
		})();
	}, [nav]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-lg",
			children: msg
		})
	});
}
//#endregion
export { Callback as component };
