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

async function getAuthenticatedUser(token: string) {
  const res = await gh(token, "/user");
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Invalid GitHub token or insufficient permissions (${res.status}): ${errorText}`,
    );
  }
  const user = (await res.json()) as {
    login: string;
    id: number;
    name?: string;
    email?: string;
    html_url?: string;
  };
  return user;
}

async function ensureRepo(
  token: string,
  login: string,
  repoName: string,
  description?: string,
  isPrivate = false,
) {
  let isNew = false;
  let res = await gh(token, `/repos/${login}/${repoName}`);
  if (res.status === 404) {
    isNew = true;
    const created = await gh(token, "/user/repos", {
      method: "POST",
      body: JSON.stringify({
        name: repoName,
        description: description || "Personal portfolio website",
        auto_init: true,
        private: isPrivate,
        homepage: `https://${login}.github.io/${repoName}/`,
      }),
    });
    if (!created.ok) {
      const body = await created.text();
      throw new Error(`Could not create GitHub repository (${created.status}): ${body}`);
    }
    // Wait until repo and initial commit from auto_init are ready
    for (let i = 0; i < 12; i++) {
      await sleep(600 + i * 150);
      res = await gh(token, `/repos/${login}/${repoName}`);
      if (res.ok) break;
    }
  } else if (!res.ok) {
    throw new Error(`GitHub repository error (${res.status}): ${await res.text()}`);
  }

  const info = (await res.json()) as { default_branch?: string; html_url?: string };
  return {
    defaultBranch: info.default_branch || "main",
    isNew,
    htmlUrl: info.html_url || `https://github.com/${login}/${repoName}`,
  };
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

/** Fallback to Contents API for single file update if git ref is unavailable */
async function putFileViaContents(
  token: string,
  login: string,
  repoName: string,
  path: string,
  content: string,
  message: string,
  branch: string,
) {
  let sha: string | undefined;
  try {
    const existing = await gh(token, `/repos/${login}/${repoName}/contents/${path}?ref=${branch}`);
    if (existing.ok) {
      const json = (await existing.json()) as { sha?: string };
      sha = json.sha;
    }
  } catch {
    // New file
  }

  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(content, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(content)));

  const res = await gh(token, `/repos/${login}/${repoName}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: base64,
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`Contents API write failed for ${path} (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as { commit: { sha: string } };
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
  // 1. Resolve branch tip with retries
  let refRes: Response | null = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    refRes = await gh(token, `/repos/${login}/${repoName}/git/ref/heads/${branch}`);
    if (refRes.ok) break;
    await sleep(700 + attempt * 200);
  }

  if (!refRes || !refRes.ok) {
    // If Git Data API branch lookup fails on freshly created repo, push files via Contents API
    let lastCommitSha = "";
    for (const f of files) {
      const result = await putFileViaContents(
        token,
        login,
        repoName,
        f.path,
        f.content,
        message,
        branch,
      );
      lastCommitSha = result.commit?.sha || "";
    }
    return lastCommitSha;
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
    // Retry once with force if non-fast-forward
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
    const fallback = await gh(token, `/repos/${login}/${repoName}/pages`, {
      method: "POST",
      body: JSON.stringify({ source: { branch, path: "/" } }),
    });
    if (!fallback.ok && fallback.status !== 409) {
      console.warn("Pages enable note:", fallback.status, await fallback.text());
      return false;
    }
  }
  return true;
}

/** Schema for creating a repo and pushing portfolio HTML */
const createRepoAndPushInput = z.object({
  token: z.string().min(1, "GitHub token is required"),
  login: z.string().optional(),
  repoName: z.string().optional(),
  html: z.string().optional(),
  portfolio: portfolioSchema.optional(),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
  commitMessage: z.string().optional(),
  enablePages: z.boolean().optional(),
  additionalFiles: z.array(z.object({ path: z.string(), content: z.string() })).optional(),
});

/** Server function to automatically create a repository and push portfolio HTML */
export const createRepoAndPushHtmlServerFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => createRepoAndPushInput.parse(d))
  .handler(async ({ data }) => {
    // 1. Resolve authentic user login
    let login = data.login?.trim();
    if (!login || login === "guest" || login === "user") {
      const authenticatedUser = await getAuthenticatedUser(data.token);
      login = authenticatedUser.login;
    }

    // 2. Resolve repository name
    const rawName = (data.repoName || data.portfolio?.title || "portfolio").trim();

    const repoName = rawName
      .replace(/[^A-Za-z0-9._-]/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);

    if (!repoName) {
      throw new Error("Invalid repository name. Please use alphanumeric characters and hyphens.");
    }

    // 3. Ensure repository exists or create a new one
    const description =
      data.description ||
      (data.portfolio?.title
        ? `${data.portfolio.title} - Portfolio Website`
        : "Personal portfolio website");

    const { defaultBranch, isNew } = await ensureRepo(
      data.token,
      login,
      repoName,
      description,
      data.isPrivate ?? false,
    );

    // 4. Resolve HTML content
    let htmlContent = data.html?.trim();
    if (!htmlContent && data.portfolio) {
      htmlContent = await renderPortfolioHtml({
        title: data.portfolio.title || "Portfolio",
        content: data.portfolio.content,
        theme: data.portfolio.theme,
        sections: data.portfolio.sections,
      });
    }

    if (!htmlContent) {
      htmlContent = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${data.portfolio?.title || "Portfolio"}</title>
</head>
<body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc;">
  <div style="text-align: center; max-width: 600px; padding: 2rem;">
    <h1>${data.portfolio?.title || "My Portfolio"}</h1>
    <p>Portfolio published with Folio</p>
  </div>
</body>
</html>`;
    }

    // 5. Build files array to push
    const stamp = new Date().toISOString();
    const filesToPush: { path: string; content: string }[] = [
      { path: ".nojekyll", content: "" },
      { path: "index.html", content: htmlContent },
      {
        path: "README.md",
        content: [
          `# ${data.portfolio?.title || repoName}`,
          "",
          `Portfolio website automatically generated and published with [Folio](https://github.com/sairambn/autoportfolio-hub).`,
          "",
          `**Live Site:** https://${login}.github.io/${repoName}/`,
          "",
          `_Last published at: ${stamp}_`,
        ].join("\n"),
      },
    ];

    if (data.portfolio) {
      filesToPush.push({
        path: "folio.json",
        content: JSON.stringify(
          {
            id: data.portfolio.id,
            title: data.portfolio.title,
            slug: data.portfolio.slug,
            content: data.portfolio.content,
            theme: data.portfolio.theme,
            sections: data.portfolio.sections,
            updated_at: stamp,
          },
          null,
          2,
        ),
      });
    }

    if (data.additionalFiles?.length) {
      for (const extra of data.additionalFiles) {
        if (!filesToPush.some((f) => f.path === extra.path)) {
          filesToPush.push(extra);
        }
      }
    }

    // 6. Push files atomically via Git Data API
    const commitMsg = data.commitMessage || `Deploy portfolio ${stamp}`;
    const commitSha = await commitFiles(
      data.token,
      login,
      repoName,
      defaultBranch,
      commitMsg,
      filesToPush,
    );

    // 7. Enable GitHub Pages if requested (defaults to true)
    let pagesEnabled = false;
    if (data.enablePages !== false) {
      pagesEnabled = await enablePages(data.token, login, repoName, defaultBranch);
    }

    const repoUrl = `https://github.com/${login}/${repoName}`;
    const pagesUrl = `https://${login}.github.io/${repoName}/`;

    return {
      success: true,
      repo: repoName,
      repoName,
      repoOwner: login,
      repoUrl,
      pagesUrl,
      branch: defaultBranch,
      commitSha,
      isNewRepo: isNew,
      pagesEnabled,
      message: isNew
        ? `Created repository ${login}/${repoName} and published portfolio HTML!`
        : `Updated portfolio HTML in repository ${login}/${repoName}!`,
    };
  });

const publishInput = z.object({
  token: z.string().min(10),
  login: z.string().min(1),
  repo: z.string().min(1).max(100),
  portfolio: portfolioSchema,
});

export const publishToGithub = createServerFn({ method: "POST" })
  .validator((d: unknown) => publishInput.parse(d))
  .handler(async ({ data }) => {
    // Route through unified createRepoAndPushHtmlServerFn
    return await createRepoAndPushHtmlServerFn({
      data: {
        token: data.token,
        login: data.login,
        repoName: data.repo,
        portfolio: data.portfolio,
      },
    });
  });
