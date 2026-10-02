import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._slug-B6KRCqNS.js
var $$splitComponentImporter = () => import("./p._slug-Csm2dXi6.mjs");
var Route = createFileRoute("/p/$slug")({
	ssr: false,
	head: () => ({ meta: [{ title: "Portfolio preview — Folio" }, {
		name: "description",
		content: "Local preview. Published sites live on GitHub Pages."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
