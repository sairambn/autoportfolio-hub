import { publishToGithub } from "./github.functions";
import type { PortfolioRecord } from "./storage";

/** Publish portfolio site to the user's GitHub repo (server-side, reliable). */
export async function publishPortfolio(opts: {
  token: string;
  login: string;
  repo: string;
  portfolio: PortfolioRecord;
}) {
  const result = await publishToGithub({
    data: {
      token: opts.token,
      login: opts.login,
      repo: opts.repo,
      portfolio: opts.portfolio,
    },
  });
  return result as {
    repo: string;
    repoUrl: string;
    pagesUrl: string;
    branch: string;
  };
}
