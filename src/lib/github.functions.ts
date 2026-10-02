import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { renderPortfolioHtml } from "./export-html";

const API = "https://api.github.com";

const portfolioSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  content: z.any(),
  theme: z.any(),
  sections: z.any(),
  published: z.boolean().optional(),
  github_repo: z.string().nullable().optional(),
  auto_push: z.boolean().optional(),
  last_pushed_at: z.string().nullable().optional(),
  updated_at: z.string().optional(),
  created_at: z.string().optional(),
});

function headers(token: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
    "User-Agent": "folio-portfolio-builder",
  };
}

async function gh(token: string, path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...headers(token), ...(init?.headers as Record<string, string> | undefined) },
  });
  return res;
}

function toBase64(text: string) {
  return Buffer.from(text, "utf8").toString("base64");
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function ensureRepo(token: string, login: string, repoName: string, description: string) {
  let res = await gh(token, `/repos/${login}/${repoName}`);
  if (res.status === 404) {
    const created = await gh(token, "/user/repos", {
      method: "POST",
      body: JSON.stringify({
        name: repoName,
        description: description || "My portfolio",
        auto_init: true,
        private: false,
        homepage: `https://${login}.github.io/${repoName}/`,
      }),
    });
    if (!created.ok) {
      const body = await created.text();
      throw new Error(`Could not create repo (${created.status}): ${body}`);
    }
    // Wait until contents API is ready (auto_init README)
    for (let i = 0; i < 8; i++) {
      await sleep(400 + i * 200);
      res = await gh(token, `/repos/${login}/${repoName}`);
      if (res.ok) break;
    }
  } else if (!res.ok) {
    throw new Error(`GitHub error (${res.status}): ${await res.text()}`);
  }

  const info = (await res.json()) as { default_branch?: string; full_name?: string };
  return { defaultBranch: info.default_branch || "main" };
}

async function putFile(
  token: string,
  login: string,
  repoName: string,
  path: string,
  content: string,
  message: string,
  branch: string,
) {
  let sha: string | undefined;
  const existing = await gh(token, `/repos/${login}/${repoName}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${branch}`);
  if (existing.ok) {
    const body = (await existing.json()) as { sha?: string };
    sha = body.sha;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const put = await gh(token, `/repos/${login}/${repoName}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: toBase64(content),
        branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (put.ok) return;

    // Conflict: refresh sha and retry
    if (put.status === 409 || put.status === 422) {
      const again = await gh(
        token,
        `/repos/${login}/${repoName}/contents/${path}?ref=${branch}`,
      );
      if (again.ok) {
        sha = ((await again.json()) as { sha?: string }).sha;
        continue;
      }
    }

    const errText = await put.text();
    throw new Error(`Push ${path} failed (${put.status}): ${errText}`);
  }

  throw new Error(`Push ${path} failed after retries`);
}

async function enablePages(token: string, login: string, repoName: string, branch: string) {
  // Build type: legacy from branch root
  const body = JSON.stringify({
    build_type: "legacy",
    source: { branch, path: "/" },
  });

  let res = await gh(token, `/repos/${login}/${repoName}/pages`, {
    method: "POST",
    body,
  });

  // Already exists → update
  if (res.status === 409) {
    res = await gh(token, `/repos/${login}/${repoName}/pages`, {
      method: "PUT",
      body,
    });
  }

  // Some accounts still use the older shape without build_type
  if (!res.ok && res.status !== 409) {
    const fallback = await gh(token, `/repos/${login}/${repoName}/pages`, {
      method: "POST",
      body: JSON.stringify({ source: { branch, path: "/" } }),
    });
    if (!fallback.ok && fallback.status !== 409) {
      // Non-fatal: site files are still in the repo
      console.warn("Pages enable:", fallback.status, await fallback.text());
    }
  }
}

export const publishToGithub = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        token: z.string().min(10),
        login: z.string().min(1),
        repo: z.string().min(1).max(100),
        portfolio: portfolioSchema,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const repoName = data.repo.replace(/[^A-Za-z0-9._-]/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
    if (!repoName) throw new Error("Invalid repository name");

    const { defaultBranch } = await ensureRepo(
      data.token,
      data.login,
      repoName,
      data.portfolio.title || "My portfolio",
    );

    const html = await renderPortfolioHtml({
      title: data.portfolio.title,
      content: data.portfolio.content,
      theme: data.portfolio.theme,
      sections: data.portfolio.sections,
    });

    const folioJson = JSON.stringify(
      {
        id: data.portfolio.id,
        title: data.portfolio.title,
        slug: data.portfolio.slug,
        content: data.portfolio.content,
        theme: data.portfolio.theme,
        sections: data.portfolio.sections,
        updated_at: new Date().toISOString(),
      },
      null,
      2,
    );

    const readme = `# ${data.portfolio.title || "Portfolio"}\n\nPublished with [Folio](https://${data.login}.github.io/${repoName}/).\n\n**Live site:** https://${data.login}.github.io/${repoName}/\n`;

    const stamp = new Date().toISOString();

    // .nojekyll first so Pages serves raw HTML/CSS
    await putFile(data.token, data.login, repoName, ".nojekyll", "", `chore: disable jekyll ${stamp}`, defaultBranch);
    await putFile(data.token, data.login, repoName, "index.html", html, `Update portfolio ${stamp}`, defaultBranch);
    await putFile(data.token, data.login, repoName, "folio.json", folioJson, `Update folio data ${stamp}`, defaultBranch);
    await putFile(data.token, data.login, repoName, "README.md", readme, `Update README ${stamp}`, defaultBranch);

    await enablePages(data.token, data.login, repoName, defaultBranch);

    return {
      repo: repoName,
      repoUrl: `https://github.com/${data.login}/${repoName}`,
      pagesUrl: `https://${data.login}.github.io/${repoName}/`,
      branch: defaultBranch,
    };
  });
