// Shared, browser- and server-safe portfolio model.
export type SectionType = "hero" | "about" | "skills" | "projects" | "repos" | "experience" | "contact";

export interface Section { id: string; type: SectionType; visible: boolean }
export interface Project { title: string; description: string; url: string; tags: string }
export interface Experience { role: string; company: string; period: string; description: string }
export interface Content {
  name: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  location: string;
  skills: string[];
  projects: Project[];
  experience: Experience[];
  contact: { email: string; website: string; github: string; linkedin: string; twitter: string };
  githubUsername: string;
}
export type TemplateId = "editorial" | "minimal" | "bold" | "terminal";
export interface Palette { bg: string; fg: string; accent: string; muted: string; surface: string }
export interface Theme { template: TemplateId; palette: Palette; font: FontId }
export type FontId = "fraunces" | "playfair" | "syne" | "dmserif" | "mono";

export interface Repo { name: string; description: string | null; html_url: string; stargazers_count: number; language: string | null }

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero", about: "About", skills: "Skills", projects: "Projects",
  repos: "GitHub Repos", experience: "Experience", contact: "Contact",
};

export const FONTS: Record<FontId, { label: string; heading: string; body: string; google: string }> = {
  fraunces: { label: "Fraunces + Space Grotesk", heading: "'Fraunces', serif", body: "'Space Grotesk', sans-serif", google: "family=Fraunces:ital,wght@0,400;0,700;0,800;1,700&family=Space+Grotesk:wght@400;500;600;700" },
  playfair: { label: "Playfair + Karla", heading: "'Playfair Display', serif", body: "'Karla', sans-serif", google: "family=Playfair+Display:wght@400;700;900&family=Karla:wght@400;500;700" },
  syne: { label: "Syne + Manrope", heading: "'Syne', sans-serif", body: "'Manrope', sans-serif", google: "family=Syne:wght@500;700;800&family=Manrope:wght@400;500;700" },
  dmserif: { label: "DM Serif + DM Sans", heading: "'DM Serif Display', serif", body: "'DM Sans', sans-serif", google: "family=DM+Serif+Display&family=DM+Sans:wght@400;500;700" },
  mono: { label: "JetBrains Mono", heading: "'JetBrains Mono', monospace", body: "'JetBrains Mono', monospace", google: "family=JetBrains+Mono:wght@400;500;700;800" },
};

/** Editorial matches the spirit of bnsairam.vercel.app (cream paper, strong type). */
export const TEMPLATES: Record<TemplateId, { label: string; theme: Theme }> = {
  editorial: {
    label: "Signal (recommended)",
    theme: {
      template: "editorial",
      font: "fraunces",
      palette: {
        bg: "#f4f0e8",
        fg: "#1a1814",
        accent: "#c45c26",
        muted: "#6b6560",
        surface: "#e9e3d8",
      },
    },
  },
  minimal: {
    label: "Minimal",
    theme: {
      template: "minimal",
      font: "dmserif",
      palette: { bg: "#ffffff", fg: "#111111", accent: "#2f6f4f", muted: "#6b6b6b", surface: "#f3f3f1" },
    },
  },
  bold: {
    label: "Bold",
    theme: {
      template: "bold",
      font: "syne",
      palette: { bg: "#151515", fg: "#f4f1ea", accent: "#c6f432", muted: "#9a978f", surface: "#222222" },
    },
  },
  terminal: {
    label: "Terminal",
    theme: {
      template: "terminal",
      font: "mono",
      palette: { bg: "#0d1117", fg: "#c9d1d9", accent: "#3fb950", muted: "#8b949e", surface: "#161b22" },
    },
  },
};

export const ALL_SECTIONS: SectionType[] = ["hero", "about", "skills", "projects", "repos", "experience", "contact"];

export const uid = () => Math.random().toString(36).slice(2, 10);

export const defaultContent = (): Content => ({
  name: "Your Name",
  headline: "Software Engineer · DSA · Python · Java",
  bio: "I write code that works, practice every day, and ship systems people actually use.",
  avatarUrl: "",
  location: "Jeppiaar Engineering College",
  skills: ["Python", "Java", "DSA"],
  projects: [
    {
      title: "Project One",
      description: "A short description of what you built and why it matters.",
      url: "",
      tags: "Python · Java",
    },
  ],
  experience: [
    {
      role: "Role",
      company: "Company / Club",
      period: "2024 — Now",
      description: "What you did there.",
    },
  ],
  contact: { email: "", website: "", github: "", linkedin: "", twitter: "" },
  githubUsername: "",
});

export const defaultSections = (): Section[] =>
  ALL_SECTIONS.map((type) => ({ id: uid(), type, visible: true }));

export const defaultTheme = (): Theme => structuredClone(TEMPLATES.editorial.theme);

export function normalize(row: { content: unknown; theme: unknown; sections: unknown }) {
  const c = { ...defaultContent(), ...((row.content as Partial<Content>) ?? {}) };
  c.contact = { ...defaultContent().contact, ...(c.contact ?? {}) };
  const t = (row.theme as Theme)?.palette ? (row.theme as Theme) : defaultTheme();
  const s = Array.isArray(row.sections) && row.sections.length ? (row.sections as Section[]) : defaultSections();
  return { content: c, theme: t, sections: s };
}

export const googleFontsHref = (font: FontId) =>
  `https://fonts.googleapis.com/css2?${FONTS[font].google}&display=swap`;
