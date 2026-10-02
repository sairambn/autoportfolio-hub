import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-github-repos-6OdD9TOQ.js
async function fetchPublicRepos(username) {
	const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`);
	if (!res.ok) return [];
	return (await res.json()).filter((r) => !r.fork).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);
}
function useGithubRepos(username) {
	return useQuery({
		queryKey: ["gh-repos", username],
		queryFn: () => fetchPublicRepos(username),
		enabled: !!username,
		staleTime: 3e5
	});
}
//#endregion
export { useGithubRepos as t };
