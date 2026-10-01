import type { CSSProperties } from "react";
import { FONTS, type Content, type Repo, type Section, type Theme } from "@/lib/portfolio";

// User-themed output. Colors come from the user's chosen palette (data),
// applied via scoped CSS variables so the same markup works in-app and in the static export.
export const PORTFOLIO_CSS = `
.pf{background:var(--pf-bg);color:var(--pf-fg);font-family:var(--pf-body);min-height:100%;line-height:1.6}
.pf *{box-sizing:border-box}
.pf a{color:inherit}
.pf-wrap{max-width:960px;margin:0 auto;padding:0 28px}
.pf-sec{padding:64px 0;border-top:1px solid color-mix(in oklab,var(--pf-fg) 14%,transparent)}
.pf-h{font-family:var(--pf-head);font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:var(--pf-accent);margin:0 0 24px;font-weight:700}
.pf-hero{padding:96px 0 72px;display:flex;gap:32px;align-items:center;flex-wrap:wrap}
.pf-avatar{width:120px;height:120px;border-radius:999px;object-fit:cover;border:3px solid var(--pf-accent)}
.pf-name{font-family:var(--pf-head);font-size:clamp(42px,7vw,84px);line-height:1;margin:0;font-weight:900;letter-spacing:-.02em}
.pf-headline{font-size:20px;color:var(--pf-muted);margin:16px 0 0;max-width:620px}
.pf-loc{font-size:14px;color:var(--pf-muted);margin-top:8px}
.pf-bio{font-size:19px;max-width:700px;white-space:pre-wrap;margin:0}
.pf-chips{display:flex;flex-wrap:wrap;gap:10px}
.pf-chip{padding:6px 14px;border-radius:999px;background:var(--pf-surface);font-size:14px}
.pf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
.pf-card{background:var(--pf-surface);padding:22px;border-radius:10px;display:block;text-decoration:none;transition:transform .2s}
.pf-card:hover{transform:translateY(-3px)}
.pf-card h3{font-family:var(--pf-head);margin:0 0 8px;font-size:20px}
.pf-card p{margin:0;color:var(--pf-muted);font-size:15px}
.pf-meta{font-size:13px;color:var(--pf-accent);margin-top:12px}
.pf-exp{display:grid;grid-template-columns:160px 1fr;gap:6px 24px;padding:16px 0}
.pf-exp .p{color:var(--pf-muted);font-size:14px}
.pf-exp h3{margin:0;font-family:var(--pf-head);font-size:19px}
.pf-links{display:flex;flex-wrap:wrap;gap:12px}
.pf-btn{padding:10px 18px;border:2px solid var(--pf-fg);border-radius:999px;text-decoration:none;font-weight:600}
.pf-btn:hover{background:var(--pf-accent);border-color:var(--pf-accent);color:var(--pf-bg)}
.pf-foot{padding:40px 0;color:var(--pf-muted);font-size:13px}
.pf-t-bold .pf-name{text-transform:uppercase}
.pf-t-bold .pf-card{border-radius:0;border-left:4px solid var(--pf-accent)}
.pf-t-terminal .pf-name::before{content:"> ";color:var(--pf-accent)}
.pf-t-terminal .pf-card,.pf-t-terminal .pf-chip{border-radius:4px;border:1px solid color-mix(in oklab,var(--pf-fg) 20%,transparent)}
.pf-t-minimal .pf-sec{border-top:none}
.pf-t-minimal .pf-name{font-weight:400}
.pf-t-editorial .pf-name{font-style:italic}
@media(max-width:640px){.pf-exp{grid-template-columns:1fr}}
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

export function PortfolioView({ content: c, theme, sections, repos }: {
  content: Content; theme: Theme; sections: Section[]; repos?: Repo[] | null;
}) {
  const links = Object.entries(c.contact).filter(([, v]) => v);
  const href = (k: string, v: string) => (k === "email" ? `mailto:${v}` : v.startsWith("http") ? v : `https://${v}`);
  return (
    <div className={`pf pf-t-${theme.template}`} style={themeVars(theme)}>
      <style dangerouslySetInnerHTML={{ __html: PORTFOLIO_CSS }} />
      <div className="pf-wrap">
        {sections.filter((s) => s.visible).map((s) => {
          switch (s.type) {
            case "hero":
              return (
                <header key={s.id} className="pf-hero">
                  {c.avatarUrl && <img className="pf-avatar" src={c.avatarUrl} alt={c.name} />}
                  <div>
                    <h1 className="pf-name">{c.name}</h1>
                    <p className="pf-headline">{c.headline}</p>
                    {c.location && <div className="pf-loc">{c.location}</div>}
                  </div>
                </header>
              );
            case "about":
              return c.bio ? <section key={s.id} className="pf-sec"><h2 className="pf-h">About</h2><p className="pf-bio">{c.bio}</p></section> : null;
            case "skills":
              return c.skills.length ? (
                <section key={s.id} className="pf-sec"><h2 className="pf-h">Skills</h2>
                  <div className="pf-chips">{c.skills.map((k) => <span key={k} className="pf-chip">{k}</span>)}</div>
                </section>) : null;
            case "projects":
              return c.projects.length ? (
                <section key={s.id} className="pf-sec"><h2 className="pf-h">Projects</h2>
                  <div className="pf-grid">{c.projects.map((p, i) => (
                    <a key={i} className="pf-card" href={p.url ? href("url", p.url) : undefined} target="_blank" rel="noreferrer">
                      <h3>{p.title}</h3><p>{p.description}</p>{p.tags && <div className="pf-meta">{p.tags}</div>}
                    </a>))}
                  </div>
                </section>) : null;
            case "repos":
              if (!c.githubUsername) return null;
              return (
                <section key={s.id} className="pf-sec"><h2 className="pf-h">On GitHub</h2>
                  {repos == null ? <p style={{ opacity: 0.6 }}>Loading repositories…</p> : repos.length === 0 ? <p style={{ opacity: 0.6 }}>No public repositories yet.</p> : (
                    <div className="pf-grid">{repos.map((r) => (
                      <a key={r.name} className="pf-card" href={r.html_url} target="_blank" rel="noreferrer">
                        <h3>{r.name}</h3><p>{r.description ?? "No description"}</p>
                        <div className="pf-meta">★ {r.stargazers_count}{r.language ? ` · ${r.language}` : ""}</div>
                      </a>))}
                    </div>)}
                </section>);
            case "experience":
              return c.experience.length ? (
                <section key={s.id} className="pf-sec"><h2 className="pf-h">Experience</h2>
                  {c.experience.map((e, i) => (
                    <div key={i} className="pf-exp"><div className="p">{e.period}</div>
                      <div><h3>{e.role}{e.company && ` · ${e.company}`}</h3><p style={{ margin: "6px 0 0", color: "var(--pf-muted)" }}>{e.description}</p></div>
                    </div>))}
                </section>) : null;
            case "contact":
              return links.length ? (
                <section key={s.id} className="pf-sec"><h2 className="pf-h">Get in touch</h2>
                  <div className="pf-links">{links.map(([k, v]) => <a key={k} className="pf-btn" href={href(k, v)} target="_blank" rel="noreferrer">{k}</a>)}</div>
                </section>) : null;
          }
        })}
        <footer className="pf-foot">© {new Date().getFullYear()} {c.name}</footer>
      </div>
    </div>
  );
}
