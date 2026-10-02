import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PortfolioView } from "@/components/PortfolioView";
import { googleFontsHref, normalize, type Repo } from "./portfolio";

/** Escape text for safe use inside HTML attribute / text nodes. */
function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function renderPortfolioHtml(row: {
  title: string;
  content: unknown;
  theme: unknown;
  sections: unknown;
}) {
  const { content, theme, sections } = normalize(row);
  let repos: Repo[] = [];

  if (content.githubUsername) {
    try {
      const r = await fetch(
        `https://api.github.com/users/${encodeURIComponent(content.githubUsername)}/repos?per_page=100&sort=updated`,
        {
          headers: {
            "User-Agent": "folio-portfolio-builder",
            Accept: "application/vnd.github+json",
          },
        },
      );
      if (r.ok) {
        const all = (await r.json()) as (Repo & { fork: boolean })[];
        repos = all
          .filter((x) => !x.fork)
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 8);
      }
    } catch {
      // still publish without live repos
    }
  }

  const body = renderToStaticMarkup(
    createElement(PortfolioView, { content, theme, sections, repos }),
  );

  const title = esc(content.name || row.title || "Portfolio");
  const desc = esc(content.headline || "");
  const bg = esc(theme.palette.bg);

  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>${title} — Portfolio</title>`,
    `<meta name="description" content="${desc}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${desc}">`,
    `<meta name="theme-color" content="${bg}">`,
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link rel="stylesheet" href="${googleFontsHref(theme.font)}">`,
    `<style>html,body{margin:0;padding:0;background:${bg};min-height:100%}</style>`,
    "</head>",
    `<body>${body}</body>`,
    "</html>",
  ].join("\n");
}
