import { createRepoAndPushHtmlServerFn, publishToGithub } from "./github.functions";
import type { PortfolioRecord } from "./storage";
import type { Content, Theme, Section } from "./portfolio";
import { loadSession } from "./auth";

export interface CreateRepoAndPushHtmlOptions {
  /** The user's GitHub authentication token (OAuth access token from Firebase or Personal Access Token) */
  token: string;
  /** Repository name to create or update (e.g., "my-portfolio" or "username.github.io"). Defaults to portfolio slug or "portfolio" */
  repoName?: string;
  /** The generated portfolio HTML content to push as index.html. If omitted, rendered from portfolio data. */
  html?: string;
  /** Optional portfolio data to render HTML from if raw html is not passed directly */
  portfolio?:
    | PortfolioRecord
    | {
        id?: string;
        slug?: string;
        title?: string;
        content?: Content | unknown;
        theme?: Theme | unknown;
        sections?: Section[] | unknown;
      };
  /** Explicit GitHub username / login if known. If omitted or guest, fetched automatically from token. */
  login?: string;
  /** Description for the GitHub repository */
  description?: string;
  /** Whether the repository should be private. Defaults to false so GitHub Pages can be hosted publicly */
  isPrivate?: boolean;
  /** Commit message for the push */
  commitMessage?: string;
  /** Whether to automatically enable GitHub Pages (defaults to true) */
  enablePages?: boolean;
  /** Additional files to include in the repository (e.g. .nojekyll, README.md, folio.json) */
  additionalFiles?: Array<{ path: string; content: string }>;
}

export interface CreateRepoAndPushHtmlResult {
  success: boolean;
  repo: string;
  repoName: string;
  repoOwner: string;
  repoUrl: string;
  pagesUrl: string;
  branch: string;
  commitSha: string;
  isNewRepo: boolean;
  pagesEnabled: boolean;
  message?: string;
}

/**
 * Uses the user's GitHub authentication token to automatically create a new repository
 * in their account and push the generated portfolio HTML file (and static assets) to it.
 *
 * Automatically:
 * 1. Resolves the authentic GitHub account login from the token
 * 2. Checks if the repository exists, creating a new repository with Pages enabled if not
 * 3. Commits index.html, .nojekyll, and README.md atomically via GitHub Git Data API
 * 4. Enables and configures GitHub Pages for instant live hosting
 * 5. Returns the live repository and GitHub Pages URLs
 */
export async function createRepoAndPushPortfolioHtml(
  opts: CreateRepoAndPushHtmlOptions,
): Promise<CreateRepoAndPushHtmlResult> {
  const token = opts.token?.trim() || loadSession()?.token?.trim();
  if (!token) {
    throw new Error(
      "GitHub authentication token is required. Please sign in with GitHub or provide a Personal Access Token.",
    );
  }

  // Sanitize repo name if provided
  const rawRepoName = opts.repoName || opts.portfolio?.title || "my-portfolio";
  const repoName =
    rawRepoName
      .replace(/[^A-Za-z0-9._-]/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "my-portfolio";

  const result = await createRepoAndPushHtmlServerFn({
    data: {
      token,
      login: opts.login,
      repoName,
      html: opts.html,
      portfolio: opts.portfolio as PortfolioRecord | undefined,
      description: opts.description,
      isPrivate: opts.isPrivate ?? false,
      commitMessage: opts.commitMessage,
      enablePages: opts.enablePages ?? true,
      additionalFiles: opts.additionalFiles,
    },
  });

  return result as CreateRepoAndPushHtmlResult;
}

/** Publish portfolio site to the user's GitHub repo (server-side, reliable). */
export async function publishPortfolio(opts: {
  token: string;
  login: string;
  repo: string;
  portfolio: PortfolioRecord;
}) {
  const result = await createRepoAndPushPortfolioHtml({
    token: opts.token,
    login: opts.login,
    repoName: opts.repo,
    portfolio: opts.portfolio,
  });

  return {
    repo: result.repoName,
    repoUrl: result.repoUrl,
    pagesUrl: result.pagesUrl,
    branch: result.branch,
    commitSha: result.commitSha,
  };
}

/**
 * Validates a GitHub authentication token and returns authenticated user info and scopes.
 */
export async function verifyGithubToken(token: string): Promise<{
  valid: boolean;
  login?: string;
  name?: string;
  avatar_url?: string;
  scopes?: string[];
  error?: string;
}> {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token.trim()}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!res.ok) {
      return {
        valid: false,
        error: `GitHub token invalid (${res.status}): ${await res.text()}`,
      };
    }

    const data = await res.json();
    const scopesHeader = res.headers.get("x-oauth-scopes") || "";
    const scopes = scopesHeader
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      valid: true,
      login: data.login,
      name: data.name,
      avatar_url: data.avatar_url,
      scopes,
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Failed to verify token",
    };
  }
}
