import { r as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as Button } from "./button-D-5TbdOV.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Rocket, p as FileText, u as ImagePlus, y as ArrowRight } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CqkdgYbD.js
var import_jsx_runtime = require_jsx_runtime();
function Landing() {
	const nav = useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen grain",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "font-display text-2xl font-black italic",
					children: "Folio."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth",
							children: "Sign in"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "block",
						onClick: () => nav({ to: "/create" }),
						children: "Create portfolio"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto max-w-6xl px-6 pb-20 pt-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "animate-rise mb-6 inline-block rounded-full border-2 border-ink bg-accent px-4 py-1 text-sm font-semibold",
						children: "Photo + resume → live website"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "animate-rise max-w-4xl text-6xl font-black leading-[0.95] tracking-tight md:text-8xl",
						children: ["Enter your details. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
							className: "text-primary",
							children: "Get a portfolio site."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "animate-rise mt-8 max-w-xl text-lg text-muted-foreground",
						children: "Upload a photo and resume, review the auto-filled profile, pick a style, and deploy a public portfolio URL — free on GitHub Pages."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "animate-rise mt-10 flex flex-wrap gap-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "block",
							size: "lg",
							onClick: () => nav({ to: "/create" }),
							children: ["Start now ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3",
				children: [
					{
						icon: ImagePlus,
						t: "1. Photo + resume",
						d: "Upload a picture and paste or upload your resume text."
					},
					{
						icon: FileText,
						t: "2. We build it",
						d: "Name, skills, experience and projects are filled in automatically."
					},
					{
						icon: Rocket,
						t: "3. Deploy live",
						d: "One step publishes a public website URL you can share."
					}
				].map(({ icon: I, t, d }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "block-card p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(I, { className: "mb-4 size-7 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-2xl font-bold",
							children: t
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted-foreground",
							children: d
						})
					]
				}, t))
			})
		]
	});
}
//#endregion
export { Landing as component };
