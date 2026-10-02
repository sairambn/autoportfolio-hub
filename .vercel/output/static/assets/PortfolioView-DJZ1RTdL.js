import{t as e}from"./jsx-runtime-Cltr0gcK.js";import{n as t}from"./portfolio-vFtzq2JG.js";var n=e(),r=`
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
`;function i(e){let n=t[e.font]??t.fraunces;return{"--pf-bg":e.palette.bg,"--pf-fg":e.palette.fg,"--pf-accent":e.palette.accent,"--pf-muted":e.palette.muted,"--pf-surface":e.palette.surface,"--pf-head":n.heading,"--pf-body":n.body}}function a(e){return String(e).padStart(2,`0`)}function o({content:e,theme:t,sections:o,repos:s}){let c=Object.entries(e.contact).filter(([,e])=>e),l=(e,t)=>e===`email`?`mailto:${t}`:t.startsWith(`http`)?t:`https://${t}`,u=e.skills.slice(0,3).join(` · `)||`Skills`,d=e.projects.length||0,f=0,p=t.template||`signal`;return(0,n.jsxs)(`div`,{className:`pf pf-t-${p}`,style:i(t),children:[(0,n.jsx)(`style`,{dangerouslySetInnerHTML:{__html:r}}),(0,n.jsxs)(`div`,{className:`pf-wrap`,children:[(0,n.jsxs)(`nav`,{className:`pf-nav`,children:[(0,n.jsx)(`span`,{children:e.name||`Portfolio`}),e.contact.email?(0,n.jsx)(`a`,{href:`mailto:${e.contact.email}`,children:`Contact`}):(0,n.jsx)(`span`,{style:{opacity:.5},children:`Portfolio`})]}),o.filter(e=>e.visible).map(t=>{switch(t.type){case`hero`:{f+=1;let r=`${e.headline||e.name}     ·     `;return(0,n.jsxs)(`header`,{className:`pf-hero`,children:[(0,n.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,a(f),` / Intro`]}),(0,n.jsxs)(`div`,{className:`pf-hero-top`,children:[e.avatarUrl?(0,n.jsx)(`img`,{className:`pf-avatar`,src:e.avatarUrl,alt:e.name}):null,(0,n.jsxs)(`div`,{children:[(0,n.jsx)(`h1`,{className:`pf-name`,children:e.name}),e.location?(0,n.jsx)(`div`,{className:`pf-sub`,children:e.location}):null,(0,n.jsx)(`p`,{className:`pf-headline`,children:e.headline}),e.bio?(0,n.jsx)(`p`,{className:`pf-bio`,children:e.bio}):null]})]}),(0,n.jsxs)(`div`,{className:`pf-stats`,children:[(0,n.jsxs)(`div`,{className:`pf-stat`,children:[(0,n.jsx)(`b`,{children:u}),(0,n.jsx)(`span`,{children:`Focus`})]}),(0,n.jsxs)(`div`,{className:`pf-stat`,children:[(0,n.jsx)(`b`,{children:d>0?`${d} projects`:`Building`}),(0,n.jsx)(`span`,{children:`Work`})]}),(0,n.jsxs)(`div`,{className:`pf-stat`,children:[(0,n.jsx)(`b`,{children:e.githubUsername?`@${e.githubUsername}`:`Open to work`}),(0,n.jsx)(`span`,{children:`GitHub`})]})]}),(0,n.jsx)(`div`,{className:`pf-marquee`,"aria-hidden":!0,children:(0,n.jsx)(`div`,{className:`pf-marquee-inner`,children:r.repeat(12)})})]},t.id)}case`about`:return e.bio?(f+=1,(0,n.jsxs)(`section`,{className:`pf-sec`,children:[(0,n.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,a(f),` / About`]}),(0,n.jsx)(`h2`,{className:`pf-h`,children:`About`}),(0,n.jsx)(`p`,{className:`pf-bio`,style:{margin:0},children:e.bio})]},t.id)):null;case`skills`:return e.skills.length?(f+=1,(0,n.jsxs)(`section`,{className:`pf-sec`,children:[(0,n.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,a(f),` / Stack`]}),(0,n.jsx)(`h2`,{className:`pf-h`,children:`Languages & tools`}),(0,n.jsx)(`div`,{className:`pf-chips`,children:e.skills.map(e=>(0,n.jsx)(`span`,{className:`pf-chip`,children:e},e))})]},t.id)):null;case`projects`:return e.projects.length?(f+=1,(0,n.jsxs)(`section`,{className:`pf-sec`,children:[(0,n.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,a(f),` / Work`]}),(0,n.jsx)(`h2`,{className:`pf-h`,children:`Systems shipped`}),(0,n.jsx)(`div`,{className:`pf-list`,children:e.projects.map((e,t)=>(0,n.jsxs)(`a`,{className:`pf-item`,href:e.url?l(`url`,e.url):void 0,target:e.url?`_blank`:void 0,rel:`noreferrer`,style:{cursor:e.url?`pointer`:`default`},children:[(0,n.jsx)(`div`,{className:`pf-idx`,children:a(t+1)}),(0,n.jsxs)(`div`,{children:[(0,n.jsx)(`h3`,{children:e.title}),(0,n.jsx)(`p`,{children:e.description}),e.tags?(0,n.jsx)(`div`,{className:`pf-meta`,children:e.tags}):null]})]},t))})]},t.id)):null;case`repos`:return e.githubUsername?(f+=1,(0,n.jsxs)(`section`,{className:`pf-sec`,children:[(0,n.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,a(f),` / GitHub`]}),(0,n.jsx)(`h2`,{className:`pf-h`,children:`On GitHub`}),s==null?(0,n.jsx)(`p`,{style:{opacity:.6},children:`Loading repositories…`}):s.length===0?(0,n.jsx)(`p`,{style:{opacity:.6},children:`No public repositories yet.`}):(0,n.jsx)(`div`,{className:`pf-list`,children:s.map((e,t)=>(0,n.jsxs)(`a`,{className:`pf-item`,href:e.html_url,target:`_blank`,rel:`noreferrer`,children:[(0,n.jsx)(`div`,{className:`pf-idx`,children:a(t+1)}),(0,n.jsxs)(`div`,{children:[(0,n.jsx)(`h3`,{children:e.name}),(0,n.jsx)(`p`,{children:e.description??`No description`}),(0,n.jsxs)(`div`,{className:`pf-meta`,children:[`★ `,e.stargazers_count,e.language?` · ${e.language}`:``]})]})]},e.name))})]},t.id)):null;case`experience`:return e.experience.length?(f+=1,(0,n.jsxs)(`section`,{className:`pf-sec`,children:[(0,n.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,a(f),` / Experience`]}),(0,n.jsx)(`h2`,{className:`pf-h`,children:`Experience`}),e.experience.map((e,t)=>(0,n.jsxs)(`div`,{className:`pf-exp`,children:[(0,n.jsx)(`div`,{className:`p`,children:e.period}),(0,n.jsxs)(`div`,{children:[(0,n.jsxs)(`h3`,{children:[e.role,e.company?` · ${e.company}`:``]}),e.description?(0,n.jsx)(`p`,{style:{margin:`6px 0 0`,color:`var(--pf-muted)`,fontSize:14.5},children:e.description}):null]})]},t))]},t.id)):null;case`contact`:return c.length?(f+=1,(0,n.jsxs)(`section`,{className:`pf-sec`,children:[(0,n.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,a(f),` / Contact`]}),(0,n.jsx)(`h2`,{className:`pf-h`,children:`Get in touch`}),(0,n.jsx)(`div`,{className:`pf-links`,children:c.map(([e,t])=>(0,n.jsx)(`a`,{className:`pf-btn`,href:l(e,t),target:`_blank`,rel:`noreferrer`,children:e},e))})]},t.id)):null;default:return null}}),(0,n.jsxs)(`footer`,{className:`pf-foot`,children:[`© `,new Date().getFullYear(),` `,e.name,e.location?` · ${e.location}`:``]})]})]})}export{o as t};