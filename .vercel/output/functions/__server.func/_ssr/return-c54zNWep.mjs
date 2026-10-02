import { r as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { r as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/return-c54zNWep.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OAuthReturn() {
	const [msg, setMsg] = (0, import_react.useState)("Finishing connection…");
	(0, import_react.useEffect)(() => {
		const p = new URLSearchParams(window.location.search);
		const send = (type, code) => {
			window.opener?.postMessage({
				type,
				connectorId: "github",
				code: code ?? null
			}, window.location.origin);
			window.close();
		};
		if (p.get("success") !== "true") {
			setMsg(p.get("error") ?? "Connection did not complete.");
			return send("appUserConnectorOAuthFailed");
		}
		const code = p.get("code");
		if (!code) {
			if (p.get("offline_access_allowed") === "false") return send("appUserConnectorOAuthComplete");
			setMsg("Missing code.");
			return send("appUserConnectorOAuthFailed");
		}
		send("appUserConnectorOAuthComplete", code);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-10",
		children: msg
	});
}
//#endregion
export { OAuthReturn as component };
