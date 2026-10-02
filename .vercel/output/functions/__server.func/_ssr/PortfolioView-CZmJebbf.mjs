import { r as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { n as FONTS } from "./portfolio-QX5LsIJC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PortfolioView-CZmJebbf.js
var import_jsx_runtime = require_jsx_runtime();
var PORTFOLIO_CSS = `
.pf{background:var(--pf-bg);color:var(--pf-fg);font-family:var(--pf-body);min-height:100%;line-height:1.55;-webkit-font-smoothing:antialiased}
.pf *{box-sizing:border-box}
.pf a{color:inherit;text-decoration:none}
.pf-wrap{max-width:720px;margin:0 auto;padding:0 24px 80px}
.pf-nav{display:flex;justify-content:space-between;align-items:center;padding:28px 0 8px;font-size:14px;font-weight:600}
.pf-nav a{opacity:.7}
.pf-nav a:hover{opacity:1}
.pf-sec{padding:56px 0 8px;border-top:1px solid color-mix(in oklab,var(--pf-fg) 10%,transparent)}
.pf-num{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--pf-muted);margin:0 0 12px;font-weight:600}
.pf-h{font-family:var(--pf-head);font-size:clamp(28px,4vw,36px);line-height:1.15;margin:0 0 20px;font-weight:700;letter-spacing:-.02em}
.pf-hero{padding:48px 0 40px}
.pf-hero-top{display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap}
.pf-avatar{width:96px;height:96px;border-radius:999px;object-fit:cover;border:2px solid color-mix(in oklab,var(--pf-fg) 18%,transparent)}
.pf-name{font-family:var(--pf-head);font-size:clamp(40px,8vw,64px);line-height:.95;margin:0;font-weight:800;letter-spacing:-.03em}
.pf-sub{margin:14px 0 0;font-size:15px;color:var(--pf-muted)}
.pf-headline{font-size:18px;margin:18px 0 0;max-width:34em;font-weight:500}
.pf-bio{font-size:16px;color:var(--pf-muted);margin:14px 0 0;max-width:36em;white-space:pre-wrap}
.pf-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:36px}
.pf-stat{background:var(--pf-surface);border-radius:12px;padding:16px 14px}
.pf-stat b{display:block;font-family:var(--pf-head);font-size:15px;margin-bottom:4px}
.pf-stat span{font-size:13px;color:var(--pf-muted)}
.pf-marquee{overflow:hidden;margin:28px 0 0;border-block:1px solid color-mix(in oklab,var(--pf-fg) 10%,transparent);padding:10px 0}
.pf-marquee-inner{display:flex;gap:2em;white-space:nowrap;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--pf-muted);animation:pf-scroll 28s linear infinite}
@keyframes pf-scroll{to{transform:translateX(-50%)}}
.pf-chips{display:flex;flex-wrap:wrap;gap:8px}
.pf-chip{padding:6px 12px;border-radius:999px;background:var(--pf-surface);font-size:13px;font-weight:500}
.pf-list{display:flex;flex-direction:column;gap:0}
.pf-item{display:grid;grid-template-columns:48px 1fr;gap:12px;padding:22px 0;border-bottom:1px solid color-mix(in oklab,var(--pf-fg) 10%,transparent)}
.pf-item:last-child{border-bottom:none}
.pf-idx{font-family:var(--pf-head);font-size:14px;color:var(--pf-accent);font-weight:700;padding-top:2px}
.pf-item h3{margin:0;font-family:var(--pf-head);font-size:18px;font-weight:700;letter-spacing:-.01em}
.pf-item p{margin:6px 0 0;color:var(--pf-muted);font-size:14.5px;line-height:1.5}
.pf-meta{font-size:12px;color:var(--pf-accent);margin-top:10px;font-weight:600}
.pf-exp{display:grid;grid-template-columns:120px 1fr;gap:8px 20px;padding:18px 0;border-bottom:1px solid color-mix(in oklab,var(--pf-fg) 10%,transparent)}
.pf-exp:last-child{border-bottom:none}
.pf-exp .p{color:var(--pf-muted);font-size:13px}
.pf-exp h3{margin:0;font-family:var(--pf-head);font-size:17px}
.pf-links{display:flex;flex-wrap:wrap;gap:10px}
.pf-btn{padding:10px 16px;border:1.5px solid color-mix(in oklab,var(--pf-fg) 35%,transparent);border-radius:999px;font-size:13px;font-weight:600}
.pf-btn:hover{background:var(--pf-accent);border-color:var(--pf-accent);color:var(--pf-bg)}
.pf-foot{padding:48px 0 24px;color:var(--pf-muted);font-size:12px}
.pf-t-signal .pf-name{font-style:italic;font-weight:700}
.pf-t-minimal .pf-sec{border-top:none}
.pf-t-minimal .pf-name{font-weight:500}
.pf-t-midnight .pf-stat{border:1px solid color-mix(in oklab,var(--pf-fg) 12%,transparent)}
.pf-t-ocean .pf-name{letter-spacing:-.04em}
.pf-t-campus .pf-name{font-style:italic}
.pf-t-neon .pf-name{text-transform:uppercase;letter-spacing:.02em}
.pf-t-neon .pf-stat,.pf-t-neon .pf-chip{border-radius:4px}
.pf-t-mono .pf-name::before{content:"> ";color:var(--pf-accent)}
.pf-t-mono .pf-stat,.pf-t-mono .pf-chip{border:1px solid color-mix(in oklab,var(--pf-fg) 22%,transparent);border-radius:4px}
@media(max-width:640px){
  .pf-stats{grid-template-columns:1fr}
  .pf-exp{grid-template-columns:1fr}
  .pf-item{grid-template-columns:36px 1fr}
}
@media(prefers-reduced-motion:reduce){.pf-marquee-inner{animation:none}}
`;
function themeVars(theme) {
	const f = FONTS[theme.font] ?? FONTS.fraunces;
	return {
		["--pf-bg"]: theme.palette.bg,
		["--pf-fg"]: theme.palette.fg,
		["--pf-accent"]: theme.palette.accent,
		["--pf-muted"]: theme.palette.muted,
		["--pf-surface"]: theme.palette.surface,
		["--pf-head"]: f.heading,
		["--pf-body"]: f.body
	};
}
function padNum(n) {
	return String(n).padStart(2, "0");
}
function PortfolioView({ content: c, theme, sections, repos }) {
	const links = Object.entries(c.contact).filter(([, v]) => v);
	const href = (k, v) => k === "email" ? `mailto:${v}` : v.startsWith("http") ? v : `https://${v}`;
	const skillPreview = c.skills.slice(0, 3).join(" · ") || "Skills";
	const projectCount = c.projects.length || 0;
	let sectionNo = 0;
	const tpl = theme.template || "signal";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `pf pf-t-${tpl}`,
		style: themeVars(theme),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { dangerouslySetInnerHTML: { __html: PORTFOLIO_CSS } }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pf-wrap",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "pf-nav",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c.name || "Portfolio" }), c.contact.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `mailto:${c.contact.email}`,
						children: "Contact"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { opacity: .5 },
						children: "Portfolio"
					})]
				}),
				sections.filter((s) => s.visible).map((s) => {
					switch (s.type) {
						case "hero": {
							sectionNo += 1;
							const marquee = `${c.headline || c.name}     ·     `;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
								className: "pf-hero",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "pf-num",
										children: [
											"Nº",
											padNum(sectionNo),
											" / Intro"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "pf-hero-top",
										children: [c.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											className: "pf-avatar",
											src: c.avatarUrl,
											alt: c.name
										}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
												className: "pf-name",
												children: c.name
											}),
											c.location ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "pf-sub",
												children: c.location
											}) : null,
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "pf-headline",
												children: c.headline
											}),
											c.bio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "pf-bio",
												children: c.bio
											}) : null
										] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "pf-stats",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "pf-stat",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: skillPreview }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Focus" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "pf-stat",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectCount > 0 ? `${projectCount} projects` : "Building" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Work" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "pf-stat",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: c.githubUsername ? `@${c.githubUsername}` : "Open to work" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "GitHub" })]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "pf-marquee",
										"aria-hidden": true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "pf-marquee-inner",
											children: marquee.repeat(12)
										})
									})
								]
							}, s.id);
						}
						case "about":
							if (!c.bio) return null;
							sectionNo += 1;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "pf-sec",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "pf-num",
										children: [
											"Nº",
											padNum(sectionNo),
											" / About"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "pf-h",
										children: "About"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "pf-bio",
										style: { margin: 0 },
										children: c.bio
									})
								]
							}, s.id);
						case "skills":
							if (!c.skills.length) return null;
							sectionNo += 1;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "pf-sec",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "pf-num",
										children: [
											"Nº",
											padNum(sectionNo),
											" / Stack"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "pf-h",
										children: "Languages & tools"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "pf-chips",
										children: c.skills.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "pf-chip",
											children: k
										}, k))
									})
								]
							}, s.id);
						case "projects":
							if (!c.projects.length) return null;
							sectionNo += 1;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "pf-sec",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "pf-num",
										children: [
											"Nº",
											padNum(sectionNo),
											" / Work"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "pf-h",
										children: "Systems shipped"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "pf-list",
										children: c.projects.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											className: "pf-item",
											href: p.url ? href("url", p.url) : void 0,
											target: p.url ? "_blank" : void 0,
											rel: "noreferrer",
											style: { cursor: p.url ? "pointer" : "default" },
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "pf-idx",
												children: padNum(i + 1)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: p.title }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.description }),
												p.tags ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "pf-meta",
													children: p.tags
												}) : null
											] })]
										}, i))
									})
								]
							}, s.id);
						case "repos":
							if (!c.githubUsername) return null;
							sectionNo += 1;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "pf-sec",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "pf-num",
										children: [
											"Nº",
											padNum(sectionNo),
											" / GitHub"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "pf-h",
										children: "On GitHub"
									}),
									repos == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										style: { opacity: .6 },
										children: "Loading repositories…"
									}) : repos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										style: { opacity: .6 },
										children: "No public repositories yet."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "pf-list",
										children: repos.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											className: "pf-item",
											href: r.html_url,
											target: "_blank",
											rel: "noreferrer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "pf-idx",
												children: padNum(i + 1)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: r.name }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: r.description ?? "No description" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "pf-meta",
													children: [
														"★ ",
														r.stargazers_count,
														r.language ? ` · ${r.language}` : ""
													]
												})
											] })]
										}, r.name))
									})
								]
							}, s.id);
						case "experience":
							if (!c.experience.length) return null;
							sectionNo += 1;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "pf-sec",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "pf-num",
										children: [
											"Nº",
											padNum(sectionNo),
											" / Experience"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "pf-h",
										children: "Experience"
									}),
									c.experience.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "pf-exp",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p",
											children: e.period
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [e.role, e.company ? ` · ${e.company}` : ""] }), e.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											style: {
												margin: "6px 0 0",
												color: "var(--pf-muted)",
												fontSize: 14.5
											},
											children: e.description
										}) : null] })]
									}, i))
								]
							}, s.id);
						case "contact":
							if (!links.length) return null;
							sectionNo += 1;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "pf-sec",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "pf-num",
										children: [
											"Nº",
											padNum(sectionNo),
											" / Contact"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "pf-h",
										children: "Get in touch"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "pf-links",
										children: links.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											className: "pf-btn",
											href: href(k, v),
											target: "_blank",
											rel: "noreferrer",
											children: k
										}, k))
									})
								]
							}, s.id);
						default: return null;
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
					className: "pf-foot",
					children: [
						"© ",
						(/* @__PURE__ */ new Date()).getFullYear(),
						" ",
						c.name,
						c.location ? ` · ${c.location}` : ""
					]
				})
			]
		})]
	});
}
//#endregion
export { PortfolioView as t };
