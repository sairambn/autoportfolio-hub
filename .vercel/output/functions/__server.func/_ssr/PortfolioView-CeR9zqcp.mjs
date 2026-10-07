import { i as __toESM } from "../_runtime.mjs";
import {
  o as require_jsx_runtime,
  s as require_react,
} from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as FONTS } from "./portfolio-DYkJwH1o.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PortfolioView-CeR9zqcp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LiquidEffectAnimation() {
  const canvasRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    if (!canvasRef.current) return;
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
      import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';

      const canvas = document.getElementById('liquid-canvas');
      if (canvas) {
        const app = LiquidBackground(canvas);
        app.loadImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560&auto=format&fit=crop');
        app.liquidPlane.material.metalness = 0.75;
        app.liquidPlane.material.roughness = 0.25;
        app.liquidPlane.uniforms.displacementScale.value = 5;
        app.setRain(false);
        window.__liquidApp = app;
      }
    `;
    document.body.appendChild(script);
    return () => {
      if (window.__liquidApp && typeof window.__liquidApp.dispose === "function")
        window.__liquidApp.dispose();
      if (script.parentNode) document.body.removeChild(script);
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "fixed inset-0 m-0 w-full h-full touch-none overflow-hidden",
    style: { fontFamily: '"Montserrat", serif' },
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
      ref: canvasRef,
      id: "liquid-canvas",
      className: "fixed inset-0 w-full h-full",
    }),
  });
}
var PORTFOLIO_CSS = `
.pf{background:var(--pf-bg);color:var(--pf-fg);font-family:var(--pf-body);min-height:100%;line-height:1.55;-webkit-font-smoothing:antialiased}
.pf *{box-sizing:border-box}
.pf a{color:inherit;text-decoration:none}
.pf-wrap{max-width:720px;margin:0 auto;padding:0 28px 96px}
.pf-nav{display:flex;justify-content:space-between;align-items:center;padding:32px 0 12px;font-size:14px;font-weight:600}
.pf-nav a{opacity:.7}
.pf-nav a:hover{opacity:1}
.pf-sec{padding:64px 0 12px;border-top:1px solid color-mix(in oklab,var(--pf-fg) 10%,transparent)}
.pf-num{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--pf-muted);margin:0 0 12px;font-weight:600}
.pf-h{font-family:var(--pf-head);font-size:clamp(26px,4vw,36px);line-height:1.15;margin:0 0 20px;font-weight:700;letter-spacing:-.02em}
.pf-hero{padding:52px 0 44px}
.pf-hero-top{display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap}
.pf-avatar{width:96px;height:96px;border-radius:999px;object-fit:cover;border:2px solid color-mix(in oklab,var(--pf-fg) 18%,transparent);flex-shrink:0}
.pf-name{font-family:var(--pf-head);font-size:clamp(36px,7vw,64px);line-height:.95;margin:0;font-weight:800;letter-spacing:-.03em;word-break:break-word}
.pf-sub{margin:14px 0 0;font-size:15px;color:var(--pf-muted)}
.pf-headline{font-size:clamp(16px,2.5vw,18px);margin:18px 0 0;max-width:34em;font-weight:500}
.pf-bio{font-size:clamp(15px,2.2vw,16px);color:var(--pf-muted);margin:14px 0 0;max-width:36em;white-space:pre-wrap}
.pf-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:36px}
.pf-stat{background:var(--pf-surface);border-radius:12px;padding:16px 14px}
.pf-stat b{display:block;font-family:var(--pf-head);font-size:15px;margin-bottom:4px;word-break:break-word}
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
.pf-item h3{margin:0;font-family:var(--pf-head);font-size:clamp(16px,2.5vw,18px);font-weight:700;letter-spacing:-.01em}
.pf-item p{margin:6px 0 0;color:var(--pf-muted);font-size:14.5px;line-height:1.5}
.pf-meta{font-size:12px;color:var(--pf-accent);margin-top:10px;font-weight:600}
.pf-exp{display:grid;grid-template-columns:120px 1fr;gap:8px 20px;padding:18px 0;border-bottom:1px solid color-mix(in oklab,var(--pf-fg) 10%,transparent)}
.pf-exp:last-child{border-bottom:none}
.pf-exp .p{color:var(--pf-muted);font-size:13px}
.pf-exp h3{margin:0;font-family:var(--pf-head);font-size:17px}
.pf-links{display:flex;flex-wrap:wrap;gap:10px}
.pf-btn{padding:10px 16px;border:1.5px solid color-mix(in oklab,var(--pf-fg) 35%,transparent);border-radius:999px;font-size:13px;font-weight:600;display:inline-block}
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
.pf-liquid{position:relative;isolation:isolate}
.pf-liquid .pf-wrap{position:relative;z-index:10}
.pf-liquid .pf-stat,.pf-liquid .pf-chip,.pf-liquid .pf-btn{backdrop-filter:blur(8px);background:color-mix(in oklab,var(--pf-surface) 85%,transparent)}

/* Tablet */
@media(max-width:768px){
  .pf-wrap{padding:0 20px 72px}
  .pf-hero{padding:40px 0 32px}
  .pf-sec{padding:48px 0 8px}
  .pf-stats{gap:10px}
}

/* Mobile */
@media(max-width:640px){
  .pf-wrap{padding:0 16px 64px}
  .pf-nav{padding:20px 0 8px;font-size:13px}
  .pf-hero{padding:32px 0 28px}
  .pf-hero-top{gap:16px;flex-direction:column;align-items:flex-start}
  .pf-avatar{width:72px;height:72px}
  .pf-name{font-size:clamp(32px,10vw,48px)}
  .pf-sub{font-size:14px;margin-top:10px}
  .pf-headline{font-size:16px;margin-top:14px}
  .pf-bio{font-size:15px}
  .pf-stats{grid-template-columns:1fr;gap:8px;margin-top:28px}
  .pf-stat{padding:14px 12px}
  .pf-stat b{font-size:14px}
  .pf-sec{padding:40px 0 8px}
  .pf-h{font-size:clamp(24px,6vw,30px);margin-bottom:16px}
  .pf-num{font-size:11px;margin-bottom:10px}
  .pf-exp{grid-template-columns:1fr;gap:4px 0;padding:16px 0}
  .pf-item{grid-template-columns:32px 1fr;gap:10px;padding:18px 0}
  .pf-item h3{font-size:16px}
  .pf-item p{font-size:14px}
  .pf-links{gap:8px}
  .pf-btn{padding:10px 14px;font-size:12px}
  .pf-foot{padding:36px 0 20px;font-size:11px}
  .pf-marquee{margin-top:20px}
}

/* Very small phones */
@media(max-width:380px){
  .pf-wrap{padding:0 12px 56px}
  .pf-name{font-size:30px}
  .pf-stats{margin-top:24px}
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
    ["--pf-body"]: f.body,
  };
}
function padNum(n) {
  return String(n).padStart(2, "0");
}
function PortfolioView({ content: c, theme, sections, repos, liquidBackground = false }) {
  const links = Object.entries(c.contact).filter(([, v]) => v);
  const href = (k, v) =>
    k === "email" ? `mailto:${v}` : v.startsWith("http") ? v : `https://${v}`;
  const skillPreview = c.skills.slice(0, 3).join(" · ") || "Skills";
  const projectCount = c.projects.length || 0;
  let sectionNo = 0;
  const tpl = theme.template || "signal";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: `pf pf-t-${tpl}${liquidBackground ? " pf-liquid" : ""}`,
    style: themeVars(theme),
    children: [
      liquidBackground && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiquidEffectAnimation, {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", {
        dangerouslySetInnerHTML: { __html: PORTFOLIO_CSS },
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "pf-wrap",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
            className: "pf-nav",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                children: c.name || "Portfolio",
              }),
              c.contact.email
                ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
                    href: `mailto:${c.contact.email}`,
                    children: "Contact",
                  })
                : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                    style: { opacity: 0.5 },
                    children: "Portfolio",
                  }),
            ],
          }),
          sections
            .filter((s) => s.visible)
            .map((s) => {
              switch (s.type) {
                case "hero": {
                  sectionNo += 1;
                  const marquee = `${c.headline || c.name}     ·     `;
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "header",
                    {
                      className: "pf-hero",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                          className: "pf-num",
                          children: ["Nº", padNum(sectionNo), " / Intro"],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          className: "pf-hero-top",
                          children: [
                            c.avatarUrl
                              ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
                                  className: "pf-avatar",
                                  src: c.avatarUrl,
                                  alt: c.name,
                                })
                              : null,
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
                                  className: "pf-name",
                                  children: c.name,
                                }),
                                c.location
                                  ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                                      className: "pf-sub",
                                      children: c.location,
                                    })
                                  : null,
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                  className: "pf-headline",
                                  children: c.headline,
                                }),
                                c.bio
                                  ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                      className: "pf-bio",
                                      children: c.bio,
                                    })
                                  : null,
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          className: "pf-stats",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                              className: "pf-stat",
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
                                  children: skillPreview,
                                }),
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                                  children: "Focus",
                                }),
                              ],
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                              className: "pf-stat",
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
                                  children:
                                    projectCount > 0 ? `${projectCount} projects` : "Building",
                                }),
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                                  children: "Work",
                                }),
                              ],
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                              className: "pf-stat",
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
                                  children: c.githubUsername
                                    ? `@${c.githubUsername}`
                                    : "Open to work",
                                }),
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                                  children: "GitHub",
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                          className: "pf-marquee",
                          "aria-hidden": true,
                          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                            className: "pf-marquee-inner",
                            children: marquee.repeat(12),
                          }),
                        }),
                      ],
                    },
                    s.id,
                  );
                }
                case "about":
                  if (!c.bio) return null;
                  sectionNo += 1;
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "section",
                    {
                      className: "pf-sec",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                          className: "pf-num",
                          children: ["Nº", padNum(sectionNo), " / About"],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
                          className: "pf-h",
                          children: "About",
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                          className: "pf-bio",
                          style: { margin: 0 },
                          children: c.bio,
                        }),
                      ],
                    },
                    s.id,
                  );
                case "skills":
                  if (!c.skills.length) return null;
                  sectionNo += 1;
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "section",
                    {
                      className: "pf-sec",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                          className: "pf-num",
                          children: ["Nº", padNum(sectionNo), " / Stack"],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
                          className: "pf-h",
                          children: "Languages & tools",
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                          className: "pf-chips",
                          children: c.skills.map((k) =>
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                              "span",
                              {
                                className: "pf-chip",
                                children: k,
                              },
                              k,
                            ),
                          ),
                        }),
                      ],
                    },
                    s.id,
                  );
                case "projects":
                  if (!c.projects.length) return null;
                  sectionNo += 1;
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "section",
                    {
                      className: "pf-sec",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                          className: "pf-num",
                          children: ["Nº", padNum(sectionNo), " / Work"],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
                          className: "pf-h",
                          children: "Systems shipped",
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                          className: "pf-list",
                          children: c.projects.map((p, i) =>
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                              "a",
                              {
                                className: "pf-item",
                                href: p.url ? href("url", p.url) : void 0,
                                target: p.url ? "_blank" : void 0,
                                rel: "noreferrer",
                                style: { cursor: p.url ? "pointer" : "default" },
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                                    className: "pf-idx",
                                    children: padNum(i + 1),
                                  }),
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                                    children: [
                                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
                                        children: p.title,
                                      }),
                                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                        children: p.description,
                                      }),
                                      p.tags
                                        ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                                            className: "pf-meta",
                                            children: p.tags,
                                          })
                                        : null,
                                    ],
                                  }),
                                ],
                              },
                              i,
                            ),
                          ),
                        }),
                      ],
                    },
                    s.id,
                  );
                case "repos":
                  if (!c.githubUsername) return null;
                  sectionNo += 1;
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "section",
                    {
                      className: "pf-sec",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                          className: "pf-num",
                          children: ["Nº", padNum(sectionNo), " / GitHub"],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
                          className: "pf-h",
                          children: "On GitHub",
                        }),
                        repos == null
                          ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                              style: { opacity: 0.6 },
                              children: "Loading repositories…",
                            })
                          : repos.length === 0
                            ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                style: { opacity: 0.6 },
                                children: "No public repositories yet.",
                              })
                            : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                                className: "pf-list",
                                children: repos.map((r, i) =>
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                                    "a",
                                    {
                                      className: "pf-item",
                                      href: r.html_url,
                                      target: "_blank",
                                      rel: "noreferrer",
                                      children: [
                                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                                          className: "pf-idx",
                                          children: padNum(i + 1),
                                        }),
                                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                                          children: [
                                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
                                              children: r.name,
                                            }),
                                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                              children: r.description ?? "No description",
                                            }),
                                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                                              className: "pf-meta",
                                              children: [
                                                "★ ",
                                                r.stargazers_count,
                                                r.language ? ` · ${r.language}` : "",
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    },
                                    r.name,
                                  ),
                                ),
                              }),
                      ],
                    },
                    s.id,
                  );
                case "experience":
                  if (!c.experience.length) return null;
                  sectionNo += 1;
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "section",
                    {
                      className: "pf-sec",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                          className: "pf-num",
                          children: ["Nº", padNum(sectionNo), " / Experience"],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
                          className: "pf-h",
                          children: "Experience",
                        }),
                        c.experience.map((e, i) =>
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                            "div",
                            {
                              className: "pf-exp",
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                                  className: "p",
                                  children: e.period,
                                }),
                                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                                  children: [
                                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
                                      children: [e.role, e.company ? ` · ${e.company}` : ""],
                                    }),
                                    e.description
                                      ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                          style: {
                                            margin: "6px 0 0",
                                            color: "var(--pf-muted)",
                                            fontSize: 14.5,
                                          },
                                          children: e.description,
                                        })
                                      : null,
                                  ],
                                }),
                              ],
                            },
                            i,
                          ),
                        ),
                      ],
                    },
                    s.id,
                  );
                case "contact":
                  if (!links.length) return null;
                  sectionNo += 1;
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "section",
                    {
                      className: "pf-sec",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                          className: "pf-num",
                          children: ["Nº", padNum(sectionNo), " / Contact"],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
                          className: "pf-h",
                          children: "Get in touch",
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                          className: "pf-links",
                          children: links.map(([k, v]) =>
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                              "a",
                              {
                                className: "pf-btn",
                                href: href(k, v),
                                target: "_blank",
                                rel: "noreferrer",
                                children: k,
                              },
                              k,
                            ),
                          ),
                        }),
                      ],
                    },
                    s.id,
                  );
                default:
                  return null;
              }
            }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
            className: "pf-foot",
            children: [
              "© ",
              /* @__PURE__ */ new Date().getFullYear(),
              " ",
              c.name,
              c.location ? ` · ${c.location}` : "",
            ],
          }),
        ],
      }),
    ],
  });
}
//#endregion
export { PortfolioView as t };
