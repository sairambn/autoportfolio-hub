import { a as TSS_SERVER_FUNCTION, l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
import { i as stringType, n as booleanType, r as objectType, t as anyType } from "../_libs/zod.mjs";
import { t as renderPortfolioHtml } from "./export-html-BcaZAeQ9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/github.functions-D9A8AzlX.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true,
  });
};
var API = "https://api.github.com";
var portfolioSchema = objectType({
  id: stringType(),
  slug: stringType(),
  title: stringType(),
  content: anyType(),
  theme: anyType(),
  sections: anyType(),
  published: booleanType().optional(),
  github_repo: stringType().nullable().optional(),
  auto_push: booleanType().optional(),
  last_pushed_at: stringType().nullable().optional(),
  updated_at: stringType().optional(),
  created_at: stringType().optional(),
});
function headers(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
    "User-Agent": "folio-portfolio-builder",
  };
}
async function gh(token, path, init) {
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...headers(token),
      ...init?.headers,
    },
  });
}
async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}
async function ensureRepo(token, login, repoName, description) {
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
    for (let i = 0; i < 10; i++) {
      await sleep(500 + i * 150);
      res = await gh(token, `/repos/${login}/${repoName}`);
      if (res.ok) break;
    }
  } else if (!res.ok) throw new Error(`GitHub error (${res.status}): ${await res.text()}`);
  return { defaultBranch: (await res.json()).default_branch || "main" };
}
/** Create a blob and return its SHA. */
async function createBlob(token, login, repoName, content) {
  const res = await gh(token, `/repos/${login}/${repoName}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({
      content,
      encoding: "utf-8",
    }),
  });
  if (!res.ok) throw new Error(`Create blob failed (${res.status}): ${await res.text()}`);
  return (await res.json()).sha;
}
/**
 * Atomically write multiple files in a single commit via Git Data API.
 * Avoids partial publishes and SHA race conditions from sequential Contents API puts.
 */
async function commitFiles(token, login, repoName, branch, message, files) {
  let refRes = await gh(token, `/repos/${login}/${repoName}/git/ref/heads/${branch}`);
  if (!refRes.ok) {
    await sleep(800);
    refRes = await gh(token, `/repos/${login}/${repoName}/git/ref/heads/${branch}`);
  }
  if (!refRes.ok)
    throw new Error(`Could not read branch ${branch} (${refRes.status}): ${await refRes.text()}`);
  const parentSha = (await refRes.json()).object.sha;
  const commitRes = await gh(token, `/repos/${login}/${repoName}/git/commits/${parentSha}`);
  if (!commitRes.ok)
    throw new Error(`Could not read commit (${commitRes.status}): ${await commitRes.text()}`);
  const baseTree = (await commitRes.json()).tree.sha;
  const tree = [];
  for (const f of files) {
    const sha = await createBlob(token, login, repoName, f.content);
    tree.push({
      path: f.path,
      mode: "100644",
      type: "blob",
      sha,
    });
  }
  const treeRes = await gh(token, `/repos/${login}/${repoName}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTree,
      tree,
    }),
  });
  if (!treeRes.ok)
    throw new Error(`Create tree failed (${treeRes.status}): ${await treeRes.text()}`);
  const newTreeSha = (await treeRes.json()).sha;
  const newCommitRes = await gh(token, `/repos/${login}/${repoName}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: newTreeSha,
      parents: [parentSha],
    }),
  });
  if (!newCommitRes.ok)
    throw new Error(`Create commit failed (${newCommitRes.status}): ${await newCommitRes.text()}`);
  const newCommitSha = (await newCommitRes.json()).sha;
  if (
    !(
      await gh(token, `/repos/${login}/${repoName}/git/refs/heads/${branch}`, {
        method: "PATCH",
        body: JSON.stringify({
          sha: newCommitSha,
          force: false,
        }),
      })
    ).ok
  ) {
    const retry = await gh(token, `/repos/${login}/${repoName}/git/refs/heads/${branch}`, {
      method: "PATCH",
      body: JSON.stringify({
        sha: newCommitSha,
        force: true,
      }),
    });
    if (!retry.ok) throw new Error(`Update branch failed (${retry.status}): ${await retry.text()}`);
  }
  return newCommitSha;
}
async function enablePages(token, login, repoName, branch) {
  const body = JSON.stringify({
    build_type: "legacy",
    source: {
      branch,
      path: "/",
    },
  });
  let res = await gh(token, `/repos/${login}/${repoName}/pages`, {
    method: "POST",
    body,
  });
  if (res.status === 409)
    res = await gh(token, `/repos/${login}/${repoName}/pages`, {
      method: "PUT",
      body,
    });
  if (!res.ok && res.status !== 409) {
    const fallback = await gh(token, `/repos/${login}/${repoName}/pages`, {
      method: "POST",
      body: JSON.stringify({
        source: {
          branch,
          path: "/",
        },
      }),
    });
    if (!fallback.ok && fallback.status !== 409)
      console.warn("Pages enable:", fallback.status, await fallback.text());
  }
}
var publishInput = objectType({
  token: stringType().min(10),
  login: stringType().min(1),
  repo: stringType().min(1).max(100),
  portfolio: portfolioSchema,
});
var publishToGithub_createServerFn_handler = createServerRpc(
  {
    id: "f5395a2951c040e8cbbe2cc3c7569a3d0b2e4a85132573114a019a7ee625c68b",
    name: "publishToGithub",
    filename: "src/lib/github.functions.ts",
  },
  (opts) => publishToGithub.__executeServer(opts),
);
var publishToGithub = createServerFn({ method: "POST" })
  .validator((d) => publishInput.parse(d))
  .handler(publishToGithub_createServerFn_handler, async ({ data }) => {
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
        updated_at: /* @__PURE__ */ new Date().toISOString(),
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
    const stamp = /* @__PURE__ */ new Date().toISOString();
    await commitFiles(
      data.token,
      data.login,
      repoName,
      defaultBranch,
      `Publish portfolio ${stamp}`,
      [
        {
          path: ".nojekyll",
          content: "",
        },
        {
          path: "index.html",
          content: html,
        },
        {
          path: "folio.json",
          content: folioJson,
        },
        {
          path: "README.md",
          content: readme,
        },
      ],
    );
    await enablePages(data.token, data.login, repoName, defaultBranch);
    return {
      repo: repoName,
      repoUrl: `https://github.com/${data.login}/${repoName}`,
      pagesUrl: `https://${data.login}.github.io/${repoName}/`,
      branch: defaultBranch,
    };
  });
//#endregion
export { publishToGithub_createServerFn_handler };
