import type { CSSProperties } from "react";
import { FONTS, type Content, type Repo, type Section, type Theme } from "@/lib/portfolio";

/** Layout inspired by polished personal sites like bnsairam.vercel.app */
export const PORTFOLIO_CSS = `
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
.pf-loc{font-size:14px;color:var(--pf-muted);margin-top:10px}
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
.pf-t-bold .pf-name{text-transform:uppercase;letter-spacing:.02em}
.pf-t-bold .pf-stat,.pf-t-bold .pf-chip{border-radius:4px}
.pf-t-terminal .pf-name::before{content:"> ";color:var(--pf-accent)}
.pf-t-terminal .pf-stat,.pf-t-terminal .pf-chip{border:1px solid color-mix(in oklab,var(--pf-fg) 22%,transparent);border-radius:4px}
.pf-t-minimal .pf-sec{border-top:none}
.pf-t-minimal .pf-name{font-weight:500}
.pf-t-editorial .pf-name{font-style:italic;font-weight:700}
@media(max-width:640px){
  .pf-stats{grid-template-columns:1fr}
  .pf-exp{grid-template-columns:1fr}
  .pf-item{grid-template-columns:36px 1fr}
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

  return (
    <div className={`pf pf-t-${theme.template}`} style={themeVars(theme)}>
      <style dangerouslySetInnerHTML={{ __html: PORTFOLIO_CSS }} />
      <div className="pf-wrap">
        <nav className="pf-nav">
          <span>{c.name || "Portfolio"}</span>
          {c.contact.email ? (
            <a href={`mailto:${c.contact.email}`}>Contact</a>
          ) : (
            <span style={{ opacity: 0.5 }}>Portfolio</span>
          )}
        </nav>

        {sections
          .filter((s) => s.visible)
          .map((s) => {
            switch (s.type) {
              case "hero": {
                sectionNo += 1;
                const marquee = `${c.headline || c.name}     ·     `;
                return (
                  <header key={s.id} className="pf-hero">
                    <p className="pf-num">Nº{padNum(sectionNo)} / Intro</p>
                    <div className="pf-hero-top">
                      {c.avatarUrl ? (
                        <img className="pf-avatar" src={c.avatarUrl} alt={c.name} />
                      ) : null}
                      <div>
                        <h1 className="pf-name">{c.name}</h1>
                        {c.location ? <div className="pf-sub">{c.location}</div> : null}
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
                      <div className="pf-marquee-inner">
                        {marquee.repeat(12)}
                      </div>
                    </div>
                  </header>
                );
              }
              case "about":
                if (!c.bio) return null;
                sectionNo += 1;
                return (
                  <section key={s.id} className="pf-sec">
                    <p className="pf-num">Nº{padNum(sectionNo)} / About</p>
                    <h2 className="pf-h">About</h2>
                    <p className="pf-bio" style={{ margin: 0 }}>
                      {c.bio}
                    </p>
                  </section>
                );
              case "skills":
                if (!c.skills.length) return null;
                sectionNo += 1;
                return (
                  <section key={s.id} className="pf-sec">
                    <p className="pf-num">Nº{padNum(sectionNo)} / Stack</p>
                    <h2 className="pf-h">Languages & tools</h2>
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
                  <section key={s.id} className="pf-sec">
                    <p className="pf-num">Nº{padNum(sectionNo)} / Work</p>
                    <h2 className="pf-h">Systems shipped</h2>
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
                            {p.tags ? <div className="pf-meta">{p.tags}</div> : null}
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
                  <section key={s.id} className="pf-sec">
                    <p className="pf-num">Nº{padNum(sectionNo)} / GitHub</p>
                    <h2 className="pf-h">On GitHub</h2>
                    {repos == null ? (
                      <p style={{ opacity: 0.6 }}>Loading repositories…</p>
                    ) : repos.length === 0 ? (
                      <p style={{ opacity: 0.6 }}>No public repositories yet.</p>
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
                  <section key={s.id} className="pf-sec">
                    <p className="pf-num">Nº{padNum(sectionNo)} / Experience</p>
                    <h2 className="pf-h">Experience</h2>
                    {c.experience.map((e, i) => (
                      <div key={i} className="pf-exp">
                        <div className="p">{e.period}</div>
                        <div>
                          <h3>
                            {e.role}
                            {e.company ? ` · ${e.company}` : ""}
                          </h3>
                          {e.description ? (
                            <p style={{ margin: "6px 0 0", color: "var(--pf-muted)", fontSize: 14.5 }}>
                              {e.description}
                            </p>
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
                  <section key={s.id} className="pf-sec">
                    <p className="pf-num">Nº{padNum(sectionNo)} / Contact</p>
                    <h2 className="pf-h">Get in touch</h2>
                    <div className="pf-links">
                      {links.map(([k, v]) => (
                        <a key={k} className="pf-btn" href={href(k, v)} target="_blank" rel="noreferrer">
                          {k}
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
          © {new Date().getFullYear()} {c.name}
          {c.location ? ` · ${c.location}` : ""}
        </footer>
      </div>
    </div>
  );
}
