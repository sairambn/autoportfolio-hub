import{i as e,n as t,t as n}from"./jsx-runtime-Dk72oS4N.js";import{h as r,m as i,p as a,u as o,v as s}from"./index-DfnJCPrV.js";var c=e(t(),1),l=n();function u(){let e=(0,c.useRef)(null);return(0,c.useEffect)(()=>{if(!e.current)return;let t=document.createElement(`script`);return t.type=`module`,t.textContent=`
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
    `,document.body.appendChild(t),()=>{window.__liquidApp&&typeof window.__liquidApp.dispose==`function`&&window.__liquidApp.dispose(),t.parentNode&&document.body.removeChild(t)}},[]),(0,l.jsx)(`div`,{className:`fixed inset-0 m-0 w-full h-full touch-none overflow-hidden`,style:{fontFamily:`"Montserrat", serif`},children:(0,l.jsx)(`canvas`,{ref:e,id:`liquid-canvas`,className:`fixed inset-0 w-full h-full`})})}var d=`
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
`;function f(e){let t=o[e.font]??o.fraunces;return{"--pf-bg":e.palette.bg,"--pf-fg":e.palette.fg,"--pf-accent":e.palette.accent,"--pf-muted":e.palette.muted,"--pf-surface":e.palette.surface,"--pf-head":t.heading,"--pf-body":t.body}}function p(e){return String(e).padStart(2,`0`)}function m({content:e,theme:t,sections:n,repos:r,liquidBackground:i=!1}){let a=Object.entries(e.contact).filter(([,e])=>e),o=(e,t)=>e===`email`?`mailto:${t}`:t.startsWith(`http`)?t:`https://${t}`,s=e.skills.slice(0,3).join(` · `)||`Skills`,c=e.projects.length||0,m=0,h=t.template||`signal`;return(0,l.jsxs)(`div`,{className:`pf pf-t-${h}${i?` pf-liquid`:``}`,style:f(t),children:[i&&(0,l.jsx)(u,{}),(0,l.jsx)(`style`,{dangerouslySetInnerHTML:{__html:d}}),(0,l.jsxs)(`div`,{className:`pf-wrap`,children:[(0,l.jsxs)(`nav`,{className:`pf-nav`,children:[(0,l.jsx)(`span`,{children:e.name||`Portfolio`}),e.contact.email?(0,l.jsx)(`a`,{href:`mailto:${e.contact.email}`,children:`Contact`}):(0,l.jsx)(`span`,{style:{opacity:.5},children:`Portfolio`})]}),n.filter(e=>e.visible).map(t=>{switch(t.type){case`hero`:{m+=1;let n=`${e.headline||e.name}     ·     `;return(0,l.jsxs)(`header`,{className:`pf-hero`,children:[(0,l.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,p(m),` / Intro`]}),(0,l.jsxs)(`div`,{className:`pf-hero-top`,children:[e.avatarUrl?(0,l.jsx)(`img`,{className:`pf-avatar`,src:e.avatarUrl,alt:e.name}):null,(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`h1`,{className:`pf-name`,children:e.name}),e.location?(0,l.jsx)(`div`,{className:`pf-sub`,children:e.location}):null,(0,l.jsx)(`p`,{className:`pf-headline`,children:e.headline}),e.bio?(0,l.jsx)(`p`,{className:`pf-bio`,children:e.bio}):null]})]}),(0,l.jsxs)(`div`,{className:`pf-stats`,children:[(0,l.jsxs)(`div`,{className:`pf-stat`,children:[(0,l.jsx)(`b`,{children:s}),(0,l.jsx)(`span`,{children:`Focus`})]}),(0,l.jsxs)(`div`,{className:`pf-stat`,children:[(0,l.jsx)(`b`,{children:c>0?`${c} projects`:`Building`}),(0,l.jsx)(`span`,{children:`Work`})]}),(0,l.jsxs)(`div`,{className:`pf-stat`,children:[(0,l.jsx)(`b`,{children:e.githubUsername?`@${e.githubUsername}`:`Open to work`}),(0,l.jsx)(`span`,{children:`GitHub`})]})]}),(0,l.jsx)(`div`,{className:`pf-marquee`,"aria-hidden":!0,children:(0,l.jsx)(`div`,{className:`pf-marquee-inner`,children:n.repeat(12)})})]},t.id)}case`about`:return e.bio?(m+=1,(0,l.jsxs)(`section`,{className:`pf-sec`,children:[(0,l.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,p(m),` / About`]}),(0,l.jsx)(`h2`,{className:`pf-h`,children:`About`}),(0,l.jsx)(`p`,{className:`pf-bio`,style:{margin:0},children:e.bio})]},t.id)):null;case`skills`:return e.skills.length?(m+=1,(0,l.jsxs)(`section`,{className:`pf-sec`,children:[(0,l.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,p(m),` / Stack`]}),(0,l.jsx)(`h2`,{className:`pf-h`,children:`Languages & tools`}),(0,l.jsx)(`div`,{className:`pf-chips`,children:e.skills.map(e=>(0,l.jsx)(`span`,{className:`pf-chip`,children:e},e))})]},t.id)):null;case`projects`:return e.projects.length?(m+=1,(0,l.jsxs)(`section`,{className:`pf-sec`,children:[(0,l.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,p(m),` / Work`]}),(0,l.jsx)(`h2`,{className:`pf-h`,children:`Systems shipped`}),(0,l.jsx)(`div`,{className:`pf-list`,children:e.projects.map((e,t)=>(0,l.jsxs)(`a`,{className:`pf-item`,href:e.url?o(`url`,e.url):void 0,target:e.url?`_blank`:void 0,rel:`noreferrer`,style:{cursor:e.url?`pointer`:`default`},children:[(0,l.jsx)(`div`,{className:`pf-idx`,children:p(t+1)}),(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`h3`,{children:e.title}),(0,l.jsx)(`p`,{children:e.description}),e.tags?(0,l.jsx)(`div`,{className:`pf-meta`,children:Array.isArray(e.tags)?e.tags.join(` · `):e.tags}):null]})]},t))})]},t.id)):null;case`repos`:return e.githubUsername?(m+=1,(0,l.jsxs)(`section`,{className:`pf-sec`,children:[(0,l.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,p(m),` / GitHub`]}),(0,l.jsx)(`h2`,{className:`pf-h`,children:`On GitHub`}),r==null?(0,l.jsx)(`p`,{style:{opacity:.6},children:`Loading repositories…`}):r.length===0?(0,l.jsx)(`p`,{style:{opacity:.6},children:`No public repositories yet.`}):(0,l.jsx)(`div`,{className:`pf-list`,children:r.map((e,t)=>(0,l.jsxs)(`a`,{className:`pf-item`,href:e.html_url,target:`_blank`,rel:`noreferrer`,children:[(0,l.jsx)(`div`,{className:`pf-idx`,children:p(t+1)}),(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`h3`,{children:e.name}),(0,l.jsx)(`p`,{children:e.description??`No description`}),(0,l.jsxs)(`div`,{className:`pf-meta`,children:[`★ `,e.stargazers_count,e.language?` · ${e.language}`:``]})]})]},e.name))})]},t.id)):null;case`experience`:return e.experience.length?(m+=1,(0,l.jsxs)(`section`,{className:`pf-sec`,children:[(0,l.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,p(m),` / Experience`]}),(0,l.jsx)(`h2`,{className:`pf-h`,children:`Experience`}),e.experience.map((e,t)=>(0,l.jsxs)(`div`,{className:`pf-exp`,children:[(0,l.jsx)(`div`,{className:`p`,children:e.period}),(0,l.jsxs)(`div`,{children:[(0,l.jsxs)(`h3`,{children:[e.role,e.company?` · ${e.company}`:``]}),e.description?(0,l.jsx)(`p`,{style:{margin:`6px 0 0`,color:`var(--pf-muted)`,fontSize:14.5},children:e.description}):null]})]},t))]},t.id)):null;case`education`:return e.education?.length?(m+=1,(0,l.jsxs)(`section`,{className:`pf-sec`,children:[(0,l.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,p(m),` / Education`]}),(0,l.jsx)(`h2`,{className:`pf-h`,children:`Education & Academic Background`}),e.education.map((e,t)=>(0,l.jsxs)(`div`,{className:`pf-exp`,children:[(0,l.jsx)(`div`,{className:`p`,children:e.period}),(0,l.jsxs)(`div`,{children:[(0,l.jsxs)(`h3`,{children:[e.degree,e.institution?` · ${e.institution}`:``]}),e.description?(0,l.jsx)(`p`,{style:{margin:`6px 0 0`,color:`var(--pf-muted)`,fontSize:14.5},children:e.description}):null]})]},t))]},t.id)):null;case`contact`:return a.length?(m+=1,(0,l.jsxs)(`section`,{className:`pf-sec`,children:[(0,l.jsxs)(`p`,{className:`pf-num`,children:[`Nº`,p(m),` / Contact`]}),(0,l.jsx)(`h2`,{className:`pf-h`,children:`Get in touch`}),(0,l.jsx)(`div`,{className:`pf-links`,children:a.map(([e,t])=>(0,l.jsx)(`a`,{className:`pf-btn`,href:o(e,t),target:`_blank`,rel:`noreferrer`,children:e},e))})]},t.id)):null;default:return null}}),(0,l.jsxs)(`footer`,{className:`pf-foot`,children:[`© `,new Date().getFullYear(),` `,e.name,e.location?` · ${e.location}`:``]})]})]})}function h(e){return`folio_portfolios_${e.toLowerCase()}`}function g(e){try{let t=localStorage.getItem(h(e));if(!t)return[];let n=JSON.parse(t);return Array.isArray(n)?n:[]}catch{return[]}}function _(e,t){localStorage.setItem(h(e),JSON.stringify(t))}function v(e,t){return g(e).find(e=>e.id===t)??null}function y(e,t){return g(e).find(e=>e.slug===t)??null}function b(e,t){let n=new Date().toISOString(),o=e===`guest`,c=o?`portfolio`:e.toLowerCase().replace(/[^a-z0-9-]/g,``).slice(0,20)||`me`,l=a(),u={id:s()+s(),slug:`${c}-${s().slice(0,4)}`,title:t?.title??`My Portfolio`,content:{...l,name:o?`Your Name`:e,githubUsername:o?``:e,contact:{...l.contact,github:o?``:`https://github.com/${e}`}},theme:r(),sections:i(),published:!1,github_repo:null,auto_push:!1,last_pushed_at:null,updated_at:n,created_at:n},d=g(e);return d.unshift(u),_(e,d),u}function x(e,t,n){let r=g(e),i=r.findIndex(e=>e.id===t);return i<0?null:(r[i]={...r[i],...n,updated_at:new Date().toISOString()},_(e,r),r[i])}function S(e,t){let n=g(e),r=n.findIndex(e=>e.id===t.id);return r>=0?n[r]={...n[r],...t}:n.unshift(t),_(e,n),t}function C(e,t){_(e,g(e).filter(e=>e.id!==t))}export{x as a,v as i,C as n,S as o,y as r,m as s,b as t};