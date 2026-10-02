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
  return fetch(`${API}${path}`, {
    ...init,
    headers: { ...headers(token), ...(init?.headers as Record<string, string> | undefined) },
  });
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
    // Wait until the empty commit from auto_init is visible
    for (let i = 0; i < 10; i++) {
      await sleep(500 + i * 150);
      res = await gh(token, `/repos/${login}/${repoName}`);
      if (res.ok) break;
    }
  } else if (!res.ok) {
    throw new Error(`GitHub error (${res.status}): ${await res.text()}`);
  }

  const info = (await res.json()) as { default_branch?: string };
  return { defaultBranch: info.default_branch || "main" };
}

/** Create a blob and return its SHA. */
async function createBlob(token: string, login: string, repoName: string, content: string) {
  const res = await gh(token, `/repos/${login}/${repoName}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content, encoding: "utf-8" }),
  });
  if (!res.ok) throw new Error(`Create blob failed (${res.status}): ${await res.text()}`);
  return ((await res.json()) as { sha: string }).sha;
}

/**
 * Atomically write multiple files in a single commit via Git Data API.
 * Avoids partial publishes and SHA race conditions from sequential Contents API puts.
 */
async function commitFiles(
  token: string,
  login: string,
  repoName: string,
  branch: string,
  message: string,
  files: { path: string; content: string }[],
) {
  // 1. Resolve branch tip
  let refRes = await gh(token, `/repos/${login}/${repoName}/git/ref/heads/${branch}`);
  if (!refRes.ok) {
    // Branch may not exist yet right after create — try default
    await sleep(800);
    refRes = await gh(token, `/repos/${login}/${repoName}/git/ref/heads/${branch}`);
  }
  if (!refRes.ok) {
    throw new Error(`Could not read branch ${branch} (${refRes.status}): ${await refRes.text()}`);
  }
  const parentSha = ((await refRes.json()) as { object: { sha: string } }).object.sha;

  // 2. Get base tree from parent commit
  const commitRes = await gh(token, `/repos/${login}/${repoName}/git/commits/${parentSha}`);
  if (!commitRes.ok) {
    throw new Error(`Could not read commit (${commitRes.status}): ${await commitRes.text()}`);
  }
  const baseTree = ((await commitRes.json()) as { tree: { sha: string } }).tree.sha;

  // 3. Create blobs + tree entries
  const tree = [];
  for (const f of files) {
    const sha = await createBlob(token, login, repoName, f.content);
    tree.push({ path: f.path, mode: "100644" as const, type: "blob" as const, sha });
  }

  const treeRes = await gh(token, `/repos/${login}/${repoName}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTree, tree }),
  });
  if (!treeRes.ok) {
    throw new Error(`Create tree failed (${treeRes.status}): ${await treeRes.text()}`);
  }
  const newTreeSha = ((await treeRes.json()) as { sha: string }).sha;

  // 4. Create commit
  const newCommitRes = await gh(token, `/repos/${login}/${repoName}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: newTreeSha,
      parents: [parentSha],
    }),
  });
  if (!newCommitRes.ok) {
    throw new Error(`Create commit failed (${newCommitRes.status}): ${await newCommitRes.text()}`);
  }
  const newCommitSha = ((await newCommitRes.json()) as { sha: string }).sha;

  // 5. Move branch tip
  const updateRef = await gh(token, `/repos/${login}/${repoName}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommitSha, force: false }),
  });
  if (!updateRef.ok) {
    // Retry once with force if non-fast-forward (rare race)
    const retry = await gh(token, `/repos/${login}/${repoName}/git/refs/heads/${branch}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: newCommitSha, force: true }),
    });
    if (!retry.ok) {
      throw new Error(`Update branch failed (${retry.status}): ${await retry.text()}`);
    }
  }

  return newCommitSha;
}

async function enablePages(token: string, login: string, repoName: string, branch: string) {
  const body = JSON.stringify({
    build_type: "legacy",
    source: { branch, path: "/" },
  });

  let res = await gh(token, `/repos/${login}/${repoName}/pages`, { method: "POST", body });
  if (res.status === 409) {
    res = await gh(token, `/repos/${login}/${repoName}/pages`, { method: "PUT", body });
  }
  if (!res.ok && res.status !== 409) {
    // Older API shape fallback
    const fallback = await gh(token, `/repos/${login}/${repoName}/pages`, {
      method: "POST",
      body: JSON.stringify({ source: { branch, path: "/" } }),
    });
    if (!fallback.ok && fallback.status !== 409) {
      console.warn("Pages enable:", fallback.status, await fallback.text());
    }
  }
}

const publishInput = z.object({
  token: z.string().min(10),
  login: z.string().min(1),
  repo: z.string().min(1).max(100),
  portfolio: portfolioSchema,
});

export const publishToGithub = createServerFn({ method: "POST" })
  .validator((d: unknown) => publishInput.parse(d))
  .handler(async ({ data }) => {
    const repoName = data.repo
      .replace(/[^A-Za-z0-9._-]/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);
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

    const readme = [
      `# ${data.portfolio.title || "Portfolio"}`,
      "",
      "Published with [Folio](https://github.com/sairambn/autoportfolio-hub).",
      "",
      `**Live site:** https://${data.login}.github.io/${repoName}/`,
      "",
    ].join("\n");

    const stamp = new Date().toISOString();

    await commitFiles(data.token, data.login, repoName, defaultBranch, `Publish portfolio ${stamp}`, [
      { path: ".nojekyll", content: "" },
      { path: "index.html", content: html },
      { path: "folio.json", content: folioJson },
      { path: "README.md", content: readme },
    ]);

    await enablePages(data.token, data.login, repoName, defaultBranch);

    return {
      repo: repoName,
      repoUrl: `https://github.com/${data.login}/${repoName}`,
      pagesUrl: `https://${data.login}.github.io/${repoName}/`,
      branch: defaultBranch,
    };
  });
