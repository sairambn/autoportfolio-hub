import { useQuery } from "@tanstack/react-query";
import type { Repo } from "@/lib/portfolio";

export async function fetchPublicRepos(username: string): Promise<Repo[]> {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
  );
  if (!res.ok) return [];
  const all = (await res.json()) as (Repo & { fork: boolean })[];
  return all
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);
}

export function useGithubRepos(username: string) {
  return useQuery({
    queryKey: ["gh-repos", username],
    queryFn: () => fetchPublicRepos(username),
    enabled: !!username,
    staleTime: 5 * 60_000,
  });
}
