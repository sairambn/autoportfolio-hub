import { renderPortfolioHtml } from "./export-html";
import type { PortfolioRecord } from "./storage";

const API = "https://api.github.com";
const HEADERS = (token: string) => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
});

async function gh(token: string, path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...HEADERS(token), ...(init?.headers as Record<string, string> | undefined) },
  });
  return res;
}

export async function publishPortfolio(opts: {
  token: string;
  login: string;
  repo: string;
  portfolio: PortfolioRecord;
}) {
  const { token, login, repo, portfolio } = opts;
  const repoName = repo.replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 100);
  if (!repoName) throw new Error("Invalid repo name");

  // Ensure repo exists
  let repoRes = await gh(token, `/repos/${login}/${repoName}`);
  if (repoRes.status === 404) {
    const created = await gh(token, "/user/repos", {
      method: "POST",
      body: JSON.stringify({
        name: repoName,
        description: portfolio.title || "My portfolio",
        auto_init: true,
        private: false,
      }),
    });
    if (!created.ok) {
      throw new Error(`Could not create repo (${created.status}): ${await created.text()}`);
    }
  } else if (!repoRes.ok) {
    throw new Error(`GitHub error (${repoRes.status}): ${await repoRes.text()}`);
  }

  const html = await renderPortfolioHtml({
    title: portfolio.title,
    content: portfolio.content,
    theme: portfolio.theme,
    sections: portfolio.sections,
  });

  // Also save folio.json so the user can re-import later
  const folioJson = JSON.stringify(
    {
      title: portfolio.title,
      slug: portfolio.slug,
      content: portfolio.content,
      theme: portfolio.theme,
      sections: portfolio.sections,
      updated_at: new Date().toISOString(),
    },
    null,
    2,
  );

  async function putFile(path: string, content: string, message: string) {
    const existing = await gh(token, `/repos/${login}/${repoName}/contents/${path}`);
    let sha: string | undefined;
    if (existing.ok) {
      const body = (await existing.json()) as { sha?: string };
      sha = body.sha;
    }
    const put = await gh(token, `/repos/${login}/${repoName}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        sha,
      }),
    });
    if (!put.ok) throw new Error(`Push ${path} failed (${put.status}): ${await put.text()}`);
  }

  await putFile("index.html", html, `Update portfolio ${new Date().toISOString()}`);
  await putFile("folio.json", folioJson, `Update folio data ${new Date().toISOString()}`);

  // Enable Pages (ignore if already on)
  const pages = await gh(token, `/repos/${login}/${repoName}/pages`, {
    method: "POST",
    body: JSON.stringify({ source: { branch: "main", path: "/" } }),
  });
  if (!pages.ok && pages.status !== 409) {
    // try master
    await gh(token, `/repos/${login}/${repoName}/pages`, {
      method: "POST",
      body: JSON.stringify({ source: { branch: "master", path: "/" } }),
    }).catch(() => null);
  }

  return {
    repoUrl: `https://github.com/${login}/${repoName}`,
    pagesUrl: `https://${login}.github.io/${repoName}/`,
  };
}
