import { l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
import { i as stringType, r as objectType, t as anyType } from "../_libs/zod.mjs";
import { n as renderPortfolioHtml, t as createServerRpc } from "./export-html-BQPVgXCx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/export.functions-D07i1vQK.js
var inputSchema = objectType({
	title: stringType(),
	content: anyType(),
	theme: anyType(),
	sections: anyType()
});
/** Server-render a complete standalone HTML portfolio for download. */
var exportPortfolioHtml_createServerFn_handler = createServerRpc({
	id: "6bce8897996b231829ad936cf478c6f186657139a43be54f49b0ae759ea7076f",
	name: "exportPortfolioHtml",
	filename: "src/lib/export.functions.ts"
}, (opts) => exportPortfolioHtml.__executeServer(opts));
var exportPortfolioHtml = createServerFn({ method: "POST" }).validator((d) => inputSchema.parse(d)).handler(exportPortfolioHtml_createServerFn_handler, async ({ data }) => {
	return { html: await renderPortfolioHtml({
		title: data.title,
		content: data.content,
		theme: data.theme,
		sections: data.sections
	}) };
});
//#endregion
export { exportPortfolioHtml_createServerFn_handler };
