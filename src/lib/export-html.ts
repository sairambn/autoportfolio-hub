import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PortfolioView } from "@/components/PortfolioView";
import { googleFontsHref, normalize, type Repo } from "./portfolio";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function renderPortfolioHtml(row: { title: string; content: unknown; theme: unknown; sections: unknown }) {
  const { content, theme, sections } = normalize(row);
  let repos: Repo[] = [];
  if (content.githubUsername) {
    const r = await fetch(`https://api.github.com/users/${encodeURIComponent(content.githubUsername)}/repos?per_page=100&sort=updated`, {
      headers: { "User-Agent": "portfolio-builder", Accept: "application/vnd.github+json" },
    });
    if (r.ok) {
      const all = (await r.json()) as (Repo & { fork: boolean })[];
      repos = all.filter((x) => !x.fork).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);
    }
  }
  const body = renderToStaticMarkup(createElement(PortfolioView, { content, theme, sections, repos }));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(content.name)} — Portfolio</title><meta name="description" content="${esc(content.headline)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="${googleFontsHref(theme.font)}">
<style>html,body{margin:0;background:${esc(theme.palette.bg)}}</style></head><body>${body}</body></html>`;
}
