import { r as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { r as require_jsx_runtime, t as Root } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./button-D-5TbdOV.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-VkrVPETh.mjs";
import { a as TSS_SERVER_FUNCTION, l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
import { i as stringType, n as booleanType, r as objectType, t as anyType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/github-client-B-SGFy1Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Root.displayName;
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var portfolioSchema = objectType({
	id: stringType(),
	slug: stringType(),
	title: stringType(),
	content: anyType(),
	theme: anyType(),
	sections: anyType(),
	published: booleanType().optional(),
	github_repo: stringType().nullable().optional(),
	auto_push: booleanType().optional(),
	last_pushed_at: stringType().nullable().optional(),
	updated_at: stringType().optional(),
	created_at: stringType().optional()
});
/** Create a blob and return its SHA. */
/**
* Atomically write multiple files in a single commit via Git Data API.
* Avoids partial publishes and SHA race conditions from sequential Contents API puts.
*/
var publishInput = objectType({
	token: stringType().min(10),
	login: stringType().min(1),
	repo: stringType().min(1).max(100),
	portfolio: portfolioSchema
});
var publishToGithub = createServerFn({ method: "POST" }).validator((d) => publishInput.parse(d)).handler(createSsrRpc("f5395a2951c040e8cbbe2cc3c7569a3d0b2e4a85132573114a019a7ee625c68b"));
/** Publish portfolio site to the user's GitHub repo (server-side, reliable). */
async function publishPortfolio(opts) {
	return await publishToGithub({ data: {
		token: opts.token,
		login: opts.login,
		repo: opts.repo,
		portfolio: opts.portfolio
	} });
}
//#endregion
export { publishPortfolio as i, Textarea as n, createSsrRpc as r, Label as t };
