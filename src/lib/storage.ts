import {
  defaultContent,
  defaultSections,
  defaultTheme,
  uid,
  type Content,
  type Section,
  type Theme,
} from "./portfolio";

export type PortfolioRecord = {
  id: string;
  slug: string;
  title: string;
  content: Content;
  theme: Theme;
  sections: Section[];
  published: boolean;
  github_repo: string | null;
  auto_push: boolean;
  last_pushed_at: string | null;
  updated_at: string;
  created_at: string;
};

function key(login: string) {
  return `folio_portfolios_${login.toLowerCase()}`;
}

function readAll(login: string): PortfolioRecord[] {
  try {
    const raw = localStorage.getItem(key(login));
    if (!raw) return [];
    const list = JSON.parse(raw) as PortfolioRecord[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAll(login: string, list: PortfolioRecord[]) {
  localStorage.setItem(key(login), JSON.stringify(list));
}

export function listPortfolios(login: string): PortfolioRecord[] {
  return readAll(login).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

export function getPortfolio(login: string, id: string): PortfolioRecord | null {
  return readAll(login).find((p) => p.id === id) ?? null;
}

export function getBySlug(login: string, slug: string): PortfolioRecord | null {
  return readAll(login).find((p) => p.slug === slug) ?? null;
}

export function createPortfolio(login: string, opts?: { title?: string }): PortfolioRecord {
  const now = new Date().toISOString();
  const isGuest = login === "guest";
  const base = isGuest
    ? "portfolio"
    : login.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 20) || "me";
  const content = defaultContent();
  const record: PortfolioRecord = {
    id: uid() + uid(),
    slug: `${base}-${uid().slice(0, 4)}`,
    title: opts?.title ?? "My Portfolio",
    content: {
      ...content,
      name: isGuest ? "Your Name" : login,
      githubUsername: isGuest ? "" : login,
      contact: {
        ...content.contact,
        github: isGuest ? "" : `https://github.com/${login}`,
      },
    },
    theme: defaultTheme(),
    sections: defaultSections(),
    published: false,
    github_repo: null,
    auto_push: false,
    last_pushed_at: null,
    updated_at: now,
    created_at: now,
  };
  const list = readAll(login);
  list.unshift(record);
  writeAll(login, list);
  return record;
}

export function updatePortfolio(
  login: string,
  id: string,
  patch: Partial<
    Pick<
      PortfolioRecord,
      | "title"
      | "slug"
      | "content"
      | "theme"
      | "sections"
      | "published"
      | "github_repo"
      | "auto_push"
      | "last_pushed_at"
    >
  >,
): PortfolioRecord | null {
  const list = readAll(login);
  const i = list.findIndex((p) => p.id === id);
  if (i < 0) return null;
  list[i] = { ...list[i], ...patch, updated_at: new Date().toISOString() };
  writeAll(login, list);
  return list[i];
}

export function deletePortfolio(login: string, id: string) {
  writeAll(
    login,
    readAll(login).filter((p) => p.id !== id),
  );
}
