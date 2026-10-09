import {
  defaultContent,
  defaultSections,
  defaultTheme,
  uid,
  type Content,
  type Section,
  type Theme,
} from "./portfolio";
import { sanitizeObject, logSecurityEvent, computeDataHash } from "./security";

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
  const direct = readAll(login).find((p) => p.id === id);
  if (direct) return direct;

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("folio_portfolios_")) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const list = JSON.parse(raw) as PortfolioRecord[];
            if (Array.isArray(list)) {
              const match = list.find((p) => p.id === id);
              if (match) return match;
            }
          }
        }
      }
    } catch {
      // ignore parsing error
    }
  }

  return null;
}

export function getBySlug(login: string, slug: string): PortfolioRecord | null {
  if (!slug) return null;

  // 1. Direct login check
  if (login) {
    const direct = readAll(login).find((p) => p.slug === slug || p.id === slug);
    if (direct) return direct;
  }

  // 2. Check guest & default user keys
  for (const fallbackUser of ["guest", "user"]) {
    if (fallbackUser !== login) {
      const match = readAll(fallbackUser).find((p) => p.slug === slug || p.id === slug);
      if (match) return match;
    }
  }

  // 3. Scan all portfolio keys in localStorage
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("folio_portfolios_")) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const list = JSON.parse(raw) as PortfolioRecord[];
            if (Array.isArray(list)) {
              const match = list.find((p) => p.slug === slug || p.id === slug);
              if (match) return match;
            }
          }
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }

  return null;
}

export function createPortfolio(login: string, opts?: { title?: string }): PortfolioRecord {
  const now = new Date().toISOString();
  const isGuest = login === "guest";
  const base = isGuest
    ? "portfolio"
    : login
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 20) || "me";
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

  // Anti-XSS sanitization
  const sanitizedPatch = sanitizeObject(patch);

  list[i] = { ...list[i], ...sanitizedPatch, updated_at: new Date().toISOString() };
  writeAll(login, list);

  // Compute security data integrity hash
  computeDataHash(list[i]).then((hash) => {
    logSecurityEvent(
      "DATA_SAVED",
      `Portfolio record '${sanitizedPatch.title || list[i].title}' saved with SHA-256 data hash protection.`,
      "success",
      hash,
    );
  });

  return list[i];
}

export function upsertPortfolio(login: string, record: PortfolioRecord): PortfolioRecord {
  const sanitizedRecord = sanitizeObject(record);
  const list = readAll(login);
  const i = list.findIndex((p) => p.id === sanitizedRecord.id);
  if (i >= 0) {
    list[i] = { ...list[i], ...sanitizedRecord };
  } else {
    list.unshift(sanitizedRecord);
  }
  writeAll(login, list);
  return sanitizedRecord;
}

export function deletePortfolio(login: string, id: string) {
  writeAll(
    login,
    readAll(login).filter((p) => p.id !== id),
  );
}
