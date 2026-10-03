import type { CSSProperties } from "react";
import { FONTS, type Content, type Repo, type Section, type Theme } from "@/lib/portfolio";

export const PORTFOLIO_CSS = `
/* ── Reset & Root ── */
.pf{background:var(--pf-bg);color:var(--pf-fg);font-family:var(--pf-body);min-height:100%;line-height:1.55;-webkit-font-smoothing:antialiased}
.pf *{box-sizing:border-box}
.pf a{color:inherit;text-decoration:none}

/* ── Layout ── */
.pf-wrap{max-width:740px;margin:0 auto;padding:0 24px 80px}

/* ── Navigation ── */
.pf-nav{display:flex;justify-content:space-between;align-items:center;padding:28px 0 8px;font-size:14px;font-weight:600;border-bottom:1px solid color-mix(in oklab,var(--pf-fg) 8%,transparent)}
.pf-nav-name{font-family:var(--pf-head);font-weight:800;font-size:16px}
.pf-nav-links{display:flex;gap:20px}
.pf-nav-links a{opacity:.65;transition:opacity .2s}
.pf-nav-links a:hover{opacity:1}

/* ── Section base ── */
.pf-sec{padding:56px 0 8px;border-top:1px solid color-mix(in oklab,var(--pf-fg) 8%,transparent);margin-top:0}
.pf-num{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--pf-muted);margin:0 0 14px;font-weight:700}
.pf-h{font-family:var(--pf-head);font-size:clamp(26px,4vw,34px);line-height:1.15;margin:0 0 24px;font-weight:700;letter-spacing:-.02em}

/* ── Hero ── */
.pf-hero{padding:52px 0 44px}
.pf-hero-top{display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap}
.pf-avatar{width:100px;height:100px;border-radius:999px;object-fit:cover;border:3px solid color-mix(in oklab,var(--pf-fg) 15%,transparent);flex-shrink:0}
.pf-name{font-family:var(--pf-head);font-size:clamp(38px,7vw,60px);line-height:.96;margin:0;font-weight:800;letter-spacing:-.03em}
.pf-location{margin:10px 0 0;font-size:14px;color:var(--pf-muted);font-weight:500}
.pf-headline{font-size:17px;margin:16px 0 0;max-width:34em;font-weight:500;line-height:1.4}
.pf-bio{font-size:15.5px;color:var(--pf-muted);margin:12px 0 0;max-width:36em;white-space:pre-wrap;line-height:1.65}

/* ── Stats ── */
.pf-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:32px}
.pf-stat{background:var(--pf-surface);border-radius:10px;padding:14px 12px}
.pf-stat b{display:block;font-family:var(--pf-head);font-size:14px;margin-bottom:3px;font-weight:700}
.pf-stat span{font-size:12px;color:var(--pf-muted)}

/* ── Marquee ── */
.pf-marquee{overflow:hidden;margin:28px 0 0;border-block:1px solid color-mix(in oklab,var(--pf-fg) 8%,transparent);padding:9px 0}
.pf-marquee-inner{display:flex;gap:2em;white-space:nowrap;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--pf-muted);animation:pf-scroll 30s linear infinite}
@keyframes pf-scroll{to{transform:translateX(-50%)}}

/* ── Skills ── */
.pf-chips{display:flex;flex-wrap:wrap;gap:8px}
.pf-chip{padding:5px 13px;border-radius:999px;background:var(--pf-surface);font-size:13px;font-weight:500}

/* ── List (projects / repos) ── */
.pf-list{display:flex;flex-direction:column;gap:0}
.pf-item{display:grid;grid-template-columns:44px 1fr;gap:14px;padding:22px 0;border-bottom:1px solid color-mix(in oklab,var(--pf-fg) 8%,transparent);transition:background .15s}
.pf-item:last-child{border-bottom:none}
.pf-item:hover{background:color-mix(in oklab,var(--pf-fg) 3%,transparent)}
.pf-idx{font-family:var(--pf-head);font-size:13px;color:var(--pf-accent);font-weight:700;padding-top:3px}
.pf-item h3{margin:0;font-family:var(--pf-head);font-size:17px;font-weight:700;letter-spacing:-.01em}
.pf-item p{margin:5px 0 0;color:var(--pf-muted);font-size:14px;line-height:1.55}
.pf-meta{font-size:12px;color:var(--pf-accent);margin-top:8px;font-weight:600;letter-spacing:.02em}
.pf-tag{display:inline-block;margin-right:4px;margin-bottom:2px}

/* ── Experience ── */
.pf-exp{display:grid;grid-template-columns:110px 1fr;gap:8px 20px;padding:20px 0;border-bottom:1px solid color-mix(in oklab,var(--pf-fg) 8%,transparent)}
.pf-exp:last-child{border-bottom:none}
.pf-exp-period{color:var(--pf-muted);font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;padding-top:3px}
.pf-exp h3{margin:0;font-family:var(--pf-head);font-size:17px;font-weight:700}
.pf-exp-company{color:var(--pf-accent);font-size:13px;font-weight:600;margin-top:2px}
.pf-exp-desc{margin:8px 0 0;color:var(--pf-muted);font-size:14px;line-height:1.6}

/* ── Contact ── */
.pf-links{display:flex;flex-wrap:wrap;gap:10px}
.pf-btn{padding:10px 18px;border:1.5px solid color-mix(in oklab,var(--pf-fg) 30%,transparent);border-radius:999px;font-size:13px;font-weight:600;transition:all .2s}
.pf-btn:hover{background:var(--pf-accent);border-color:var(--pf-accent);color:var(--pf-bg)}

/* ── Footer ── */
.pf-foot{padding:52px 0 24px;color:var(--pf-muted);font-size:12px;border-top:1px solid color-mix(in oklab,var(--pf-fg) 8%,transparent);margin-top:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.pf-foot-brand{font-family:var(--pf-head);font-weight:800;font-size:14px;font-style:italic;opacity:.5}

/* ── Template overrides: Signal ── */
.pf-t-signal .pf-name{font-style:italic}
.pf-t-signal .pf-avatar{border-color:color-mix(in oklab,var(--pf-accent) 40%,transparent)}
.pf-t-signal .pf-chip{border-radius:3px}
.pf-t-signal .pf-btn{border-radius:3px}

/* ── Template overrides: Minimal ── */
.pf-t-minimal .pf-sec{border-top:none;padding-top:40px}
.pf-t-minimal .pf-name{font-weight:400;letter-spacing:-.02em}
.pf-t-minimal .pf-stat{border:1px solid color-mix(in oklab,var(--pf-fg) 10%,transparent);background:transparent}
.pf-t-minimal .pf-nav{border-bottom:2px solid var(--pf-fg)}
.pf-t-minimal .pf-chip{border:1px solid color-mix(in oklab,var(--pf-fg) 15%,transparent);background:transparent}

/* ── Template overrides: Midnight ── */
.pf-t-midnight .pf-stat{border:1px solid color-mix(in oklab,var(--pf-fg) 10%,transparent);background:color-mix(in oklab,var(--pf-fg) 4%,transparent)}
.pf-t-midnight .pf-avatar{box-shadow:0 0 0 2px var(--pf-accent)}
.pf-t-midnight .pf-name{background:linear-gradient(135deg,var(--pf-fg),var(--pf-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.pf-t-midnight .pf-chip{border:1px solid color-mix(in oklab,var(--pf-accent) 30%,transparent)}

/* ── Template overrides: Ocean ── */
.pf-t-ocean .pf-name{letter-spacing:-.04em}
.pf-t-ocean .pf-stat{border-bottom:2px solid var(--pf-accent)}
.pf-t-ocean .pf-btn{border-radius:6px}

/* ── Template overrides: Campus ── */
.pf-t-campus .pf-name{font-style:italic}
.pf-t-campus .pf-chip{border-radius:4px;border:1px solid color-mix(in oklab,var(--pf-accent) 30%,transparent)}
.pf-t-campus .pf-avatar{border-radius:6px;border:2px solid var(--pf-accent)}

/* ── Template overrides: Neon ── */
.pf-t-neon .pf-name{text-transform:uppercase;letter-spacing:.04em;font-size:clamp(28px,6vw,52px)}
.pf-t-neon .pf-stat,.pf-t-neon .pf-chip{border-radius:3px;border:1px solid var(--pf-accent)}
.pf-t-neon .pf-h{color:var(--pf-accent);font-size:clamp(13px,2vw,15px);letter-spacing:.14em;text-transform:uppercase;font-weight:700}
.pf-t-neon .pf-avatar{border:2px solid var(--pf-accent);border-radius:4px}
.pf-t-neon .pf-btn{border-color:var(--pf-accent);border-radius:3px}

/* ── Template overrides: Mono ── */
.pf-t-mono .pf-name::before{content:"> ";color:var(--pf-accent)}
.pf-t-mono .pf-stat,.pf-t-mono .pf-chip{border:1px solid color-mix(in oklab,var(--pf-fg) 20%,transparent);border-radius:3px;font-family:var(--pf-head)}
.pf-t-mono .pf-num::before{content:"# "}
.pf-t-mono .pf-h{font-size:clamp(14px,2vw,16px);letter-spacing:.1em;text-transform:uppercase;border-bottom:1px solid var(--pf-accent);padding-bottom:6px}
.pf-t-mono .pf-item:hover{background:color-mix(in oklab,var(--pf-accent) 4%,transparent)}

/* ── Responsive ── */
@media(max-width:640px){
  .pf-wrap{padding:0 16px 60px}
  .pf-nav{flex-direction:column;align-items:flex-start;gap:10px;padding:20px 0 12px}
  .pf-nav-links{display:flex;flex-wrap:wrap;gap:12px}
  .pf-hero{padding:32px 0 28px}
  .pf-hero-top{flex-direction:column;gap:14px}
  .pf-avatar{width:80px;height:80px}
  .pf-name{font-size:clamp(32px,10vw,52px)}
  .pf-stats{grid-template-columns:1fr 1fr}
  .pf-exp{grid-template-columns:1fr;gap:4px 0}
  .pf-exp-period{padding-top:0;margin-bottom:2px}
  .pf-item{grid-template-columns:32px 1fr;gap:10px}
  .pf-foot{flex-direction:column;text-align:center}
  .pf-sec{padding:40px 0 8px}
  .pf-links{gap:8px}
  .pf-btn{padding:8px 14px;font-size:12px}
}
@media(max-width:380px){
  .pf-stats{grid-template-columns:1fr}
  .pf-name{font-size:clamp(28px,12vw,44px)}
}
@media(prefers-reduced-motion:reduce){.pf-marquee-inner{animation:none}}
`;

export function themeVars(theme: Theme): CSSProperties {
  const f = FONTS[theme.font] ?? FONTS.fraunces;
  return {
    ["--pf-bg" as string]: theme.palette.bg,
    ["--pf-fg" as string]: theme.palette.fg,
    ["--pf-accent" as string]: theme.palette.accent,
    ["--pf-muted" as string]: theme.palette.muted,
    ["--pf-surface" as string]: theme.palette.surface,
    ["--pf-head" as string]: f.heading,
    ["--pf-body" as string]: f.body,
  };
}

function padNum(n: number) {
  return String(n).padStart(2, "0");
}

function NavLinks({ sections, contact }: { sections: Section[]; contact: Content["contact"] }) {
  const visible = sections.filter((s) => s.visible).map((s) => s.type);
  const links: { label: string; id: string }[] = [];
  if (visible.includes("about")) links.push({ label: "About", id: "about" });
  if (visible.includes("skills")) links.push({ label: "Skills", id: "skills" });
  if (visible.includes("projects")) links.push({ label: "Work", id: "projects" });
  if (visible.includes("experience")) links.push({ label: "Experience", id: "experience" });
  if (contact.email) links.push({ label: "Contact", id: "contact" });
  return (
    <div className="pf-nav-links">
      {links.map((l) => (
        <a key={l.id} href={`#${l.id}`}>{l.label}</a>
      ))}
    </div>
  );
}

export function PortfolioView({
  content: c,
  theme,
  sections,
  repos,
}: {
  content: Content;
  theme: Theme;
  sections: Section[];
  repos?: Repo[] | null;
}) {
  const links = Object.entries(c.contact).filter(([, v]) => v);
  const href = (k: string, v: string) =>
    k === "email" ? `mailto:${v}` : v.startsWith("http") ? v : `https://${v}`;

  const skillPreview = c.skills.slice(0, 3).join(" · ") || "Skills";
  const projectCount = c.projects.length || 0;
  let sectionNo = 0;
  const tpl = theme.template || "signal";

  return (
    <div className={`pf pf-t-${tpl}`} style={themeVars(theme)}>
      <style dangerouslySetInnerHTML={{ __html: PORTFOLIO_CSS }} />
      <div className="pf-wrap">
        <nav className="pf-nav">
          <span className="pf-nav-name">{c.name || "Portfolio"}</span>
          <NavLinks sections={sections} contact={c.contact} />
        </nav>

        {sections
          .filter((s) => s.visible)
          .map((s) => {
            switch (s.type) {
              case "hero": {
                sectionNo += 1;
                const marquee = `${c.headline || c.name}     ·     `;
                return (
                  <header key={s.id} id="hero" className="pf-hero">
                    <p className="pf-num">Nº{padNum(sectionNo)} / Intro</p>
                    <div className="pf-hero-top">
                      {c.avatarUrl ? (
                        <img className="pf-avatar" src={c.avatarUrl} alt={c.name} />
                      ) : null}
                      <div style={{ flex: 1 }}>
                        <h1 className="pf-name">{c.name}</h1>
                        {c.location ? <div className="pf-location">📍 {c.location}</div> : null}
                        <p className="pf-headline">{c.headline}</p>
                        {c.bio ? <p className="pf-bio">{c.bio}</p> : null}
                      </div>
                    </div>
                    <div className="pf-stats">
                      <div className="pf-stat">
                        <b>{skillPreview}</b>
                        <span>Focus</span>
                      </div>
                      <div className="pf-stat">
                        <b>{projectCount > 0 ? `${projectCount} projects` : "Building"}</b>
                        <span>Work</span>
                      </div>
                      <div className="pf-stat">
                        <b>{c.githubUsername ? `@${c.githubUsername}` : "Open to work"}</b>
                        <span>GitHub</span>
                      </div>
                    </div>
                    <div className="pf-marquee" aria-hidden>
                      <div className="pf-marquee-inner">{marquee.repeat(12)}</div>
                    </div>
                  </header>
                );
              }
              case "about":
                if (!c.bio) return null;
                sectionNo += 1;
                return (
                  <section key={s.id} id="about" className="pf-sec">
                    <p className="pf-num">Nº{padNum(sectionNo)} / About</p>
                    <h2 className="pf-h">About me</h2>
                    <p className="pf-bio" style={{ margin: 0 }}>
                      {c.bio}
                    </p>
                  </section>
                );
              case "skills":
                if (!c.skills.length) return null;
                sectionNo += 1;
                return (
                  <section key={s.id} id="skills" className="pf-sec">
                    <p className="pf-num">Nº{padNum(sectionNo)} / Stack</p>
                    <h2 className="pf-h">Languages &amp; tools</h2>
                    <div className="pf-chips">
                      {c.skills.map((k) => (
                        <span key={k} className="pf-chip">
                          {k}
                        </span>
                      ))}
                    </div>
                  </section>
                );
              case "projects":
                if (!c.projects.length) return null;
                sectionNo += 1;
                return (
                  <section key={s.id} id="projects" className="pf-sec">
                    <p className="pf-num">Nº{padNum(sectionNo)} / Work</p>
                    <h2 className="pf-h">Projects</h2>
                    <div className="pf-list">
                      {c.projects.map((p, i) => (
                        <a
                          key={i}
                          className="pf-item"
                          href={p.url ? href("url", p.url) : undefined}
                          target={p.url ? "_blank" : undefined}
                          rel="noreferrer"
                          style={{ cursor: p.url ? "pointer" : "default" }}
                        >
                          <div className="pf-idx">{padNum(i + 1)}</div>
                          <div>
                            <h3>{p.title}</h3>
                            <p>{p.description}</p>
                            {p.tags ? (
                              <div className="pf-meta">
                                {p.tags.split(/[,·]/).map((t) => t.trim()).filter(Boolean).map((t) => (
                                  <span key={t} className="pf-tag">{t}</span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                );
              case "repos":
                if (!c.githubUsername) return null;
                sectionNo += 1;
                return (
                  <section key={s.id} id="repos" className="pf-sec">
                    <p className="pf-num">Nº{padNum(sectionNo)} / GitHub</p>
                    <h2 className="pf-h">On GitHub</h2>
                    {repos == null ? (
                      <p style={{ opacity: 0.5, fontSize: 14 }}>Loading repositories…</p>
                    ) : repos.length === 0 ? (
                      <p style={{ opacity: 0.5, fontSize: 14 }}>No public repositories yet.</p>
                    ) : (
                      <div className="pf-list">
                        {repos.map((r, i) => (
                          <a
                            key={r.name}
                            className="pf-item"
                            href={r.html_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <div className="pf-idx">{padNum(i + 1)}</div>
                            <div>
                              <h3>{r.name}</h3>
                              <p>{r.description ?? "No description"}</p>
                              <div className="pf-meta">
                                ★ {r.stargazers_count}
                                {r.language ? ` · ${r.language}` : ""}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </section>
                );
              case "experience":
                if (!c.experience.length) return null;
                sectionNo += 1;
                return (
                  <section key={s.id} id="experience" className="pf-sec">
                    <p className="pf-num">Nº{padNum(sectionNo)} / Experience</p>
                    <h2 className="pf-h">Experience</h2>
                    {c.experience.map((e, i) => (
                      <div key={i} className="pf-exp">
                        <div className="pf-exp-period">{e.period}</div>
                        <div>
                          <h3>{e.role}</h3>
                          {e.company ? <div className="pf-exp-company">{e.company}</div> : null}
                          {e.description ? (
                            <p className="pf-exp-desc">{e.description}</p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </section>
                );
              case "contact":
                if (!links.length) return null;
                sectionNo += 1;
                return (
                  <section key={s.id} id="contact" className="pf-sec">
                    <p className="pf-num">Nº{padNum(sectionNo)} / Contact</p>
                    <h2 className="pf-h">Get in touch</h2>
                    <div className="pf-links">
                      {links.map(([k, v]) => (
                        <a key={k} className="pf-btn" href={href(k, v)} target="_blank" rel="noreferrer">
                          {k.charAt(0).toUpperCase() + k.slice(1)}
                        </a>
                      ))}
                    </div>
                  </section>
                );
              default:
                return null;
            }
          })}

        <footer className="pf-foot">
          <span>© {new Date().getFullYear()} {c.name}{c.location ? ` · ${c.location}` : ""}</span>
          <span className="pf-foot-brand">Folio.</span>
        </footer>
      </div>
    </div>
  );
}
