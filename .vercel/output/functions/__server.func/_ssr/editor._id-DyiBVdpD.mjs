import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/editor._id-DyiBVdpD.js
var $$splitComponentImporter = () => import("./editor._id-BULor95J.mjs");
var Route = createFileRoute("/_authenticated/editor/$id")({
	head: () => ({ meta: [{ title: "Edit portfolio — Folio" }, {
		name: "description",
		content: "Design your portfolio and download or publish it."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
