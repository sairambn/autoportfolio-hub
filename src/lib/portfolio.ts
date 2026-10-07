// Shared, browser- and server-safe portfolio model.
export type SectionType = "hero" | "about" | "skills" | "projects" | "repos" | "experience" | "contact";

export interface Section {
  id: string;
  type: SectionType;
  visible: boolean;
}
export interface Project {
  title: string;
  description: string;
  url: string;
  tags: string;
}
export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
}
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

/** Visual themes students can pick. */
export type TemplateId =
  | "signal"
  | "minimal"
  | "midnight"
  | "ocean"
  | "campus"
  | "neon"
  | "mono"
  | "slate"
  | "rose"
  | "ember"
  | "forest"
  | "violet"
  | "sand";

export interface Palette {
  bg: string;
  fg: string;
  accent: string;
  muted: string;
  surface: string;
}
export interface Theme {
  template: TemplateId;
  palette: Palette;
  font: FontId;
}
export type FontId = "fraunces" | "playfair" | "syne" | "dmserif" | "mono" | "outfit";

export interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  about: "About",
  skills: "Skills",
  projects: "Projects",
  repos: "GitHub Repos",
  experience: "Experience",
  contact: "Contact",
};

export const FONTS: Record<
  FontId,
  { label: string; heading: string; body: string; google: string }
> = {
  fraunces: {
    label: "Fraunces + Space Grotesk",
    heading: "'Fraunces', serif",
    body: "'Space Grotesk', sans-serif",
    google:
      "family=Fraunces:ital,wght@0,400;0,700;0,800;1,700&family=Space+Grotesk:wght@400;500;600;700",
  },
  playfair: {
    label: "Playfair + Karla",
    heading: "'Playfair Display', serif",
    body: "'Karla', sans-serif",
    google: "family=Playfair+Display:wght@400;700;900&family=Karla:wght@400;500;700",
  },
  syne: {
    label: "Syne + Manrope",
    heading: "'Syne', sans-serif",
    body: "'Manrope', sans-serif",
    google: "family=Syne:wght@500;700;800&family=Manrope:wght@400;500;700",
  },
  dmserif: {
    label: "DM Serif + DM Sans",
    heading: "'DM Serif Display', serif",
    body: "'DM Sans', sans-serif",
    google: "family=DM+Serif+Display&family=DM+Sans:wght@400;500;700",
  },
  mono: {
    label: "JetBrains Mono",
    heading: "'JetBrains Mono', monospace",
    body: "'JetBrains Mono', monospace",
    google: "family=JetBrains+Mono:wght@400;500;700;800",
  },
  outfit: {
    label: "Outfit + Source Sans",
    heading: "'Outfit', sans-serif",
    body: "'Source Sans 3', sans-serif",
    google: "family=Outfit:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600",
  },
};

export type TemplateMeta = {
  label: string;
  blurb: string;
  theme: Theme;
};

/** Order = display order on create / theme picker. */
export const TEMPLATE_ORDER: TemplateId[] = [
  "signal",
  "minimal",
  "midnight",
  "ocean",
  "campus",
  "neon",
  "mono",
  "slate",
  "rose",
  "ember",
  "forest",
  "violet",
  "sand",
];

export const TEMPLATES: Record<TemplateId, TemplateMeta> = {
  signal: {
    label: "Signal",
    blurb: "Cream paper · editorial (like a personal brand site)",
    theme: {
      template: "signal",
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
    blurb: "Clean white · quiet and professional",
    theme: {
      template: "minimal",
      font: "dmserif",
      palette: {
        bg: "#ffffff",
        fg: "#111111",
        accent: "#2563eb",
        muted: "#6b6b6b",
        surface: "#f4f4f5",
      },
    },
  },
  midnight: {
    label: "Midnight",
    blurb: "Dark navy · serious product feel",
    theme: {
      template: "midnight",
      font: "outfit",
      palette: {
        bg: "#0b1220",
        fg: "#e8eef7",
        accent: "#7dd3fc",
        muted: "#94a3b8",
        surface: "#151e2e",
      },
    },
  },
  ocean: {
    label: "Ocean",
    blurb: "Soft blue · calm engineering resume",
    theme: {
      template: "ocean",
      font: "outfit",
      palette: {
        bg: "#eef6fb",
        fg: "#0f2744",
        accent: "#0284c7",
        muted: "#5b7a96",
        surface: "#ddeff8",
      },
    },
  },
  campus: {
    label: "Campus",
    blurb: "Green academic · great for college profiles",
    theme: {
      template: "campus",
      font: "playfair",
      palette: {
        bg: "#f3f7f0",
        fg: "#1c2b1a",
        accent: "#3f7d3a",
        muted: "#5f735c",
        surface: "#e4ecdf",
      },
    },
  },
  neon: {
    label: "Neon",
    blurb: "Black + lime · bold hacker energy",
    theme: {
      template: "neon",
      font: "syne",
      palette: {
        bg: "#0e0e0e",
        fg: "#f4f1ea",
        accent: "#c6f432",
        muted: "#9a978f",
        surface: "#1a1a1a",
      },
    },
  },
  mono: {
    label: "Mono",
    blurb: "GitHub terminal · code-first",
    theme: {
      template: "mono",
      font: "mono",
      palette: {
        bg: "#0d1117",
        fg: "#c9d1d9",
        accent: "#3fb950",
        muted: "#8b949e",
        surface: "#161b22",
      },
    },
  },
  slate: {
    label: "Slate",
    blurb: "Cool grey · modern and balanced",
    theme: {
      template: "slate",
      font: "outfit",
      palette: {
        bg: "#f1f5f9",
        fg: "#0f172a",
        accent: "#475569",
        muted: "#64748b",
        surface: "#e2e8f0",
      },
    },
  },
  rose: {
    label: "Rose",
    blurb: "Soft pink · warm and distinctive",
    theme: {
      template: "rose",
      font: "playfair",
      palette: {
        bg: "#fdf2f4",
        fg: "#4a1525",
        accent: "#be123c",
        muted: "#9f6b7a",
        surface: "#fce7eb",
      },
    },
  },
  ember: {
    label: "Ember",
    blurb: "Deep charcoal + orange · strong presence",
    theme: {
      template: "ember",
      font: "syne",
      palette: {
        bg: "#1c1917",
        fg: "#fafaf9",
        accent: "#ea580c",
        muted: "#a8a29e",
        surface: "#292524",
      },
    },
  },
  forest: {
    label: "Forest",
    blurb: "Deep green · calm and focused",
    theme: {
      template: "forest",
      font: "dmserif",
      palette: {
        bg: "#14231a",
        fg: "#e8f0ea",
        accent: "#4ade80",
        muted: "#86a38f",
        surface: "#1c3226",
      },
    },
  },
  violet: {
    label: "Violet",
    blurb: "Purple night · creative and modern",
    theme: {
      template: "violet",
      font: "fraunces",
      palette: {
        bg: "#1e1033",
        fg: "#f3e8ff",
        accent: "#c084fc",
        muted: "#a78bba",
        surface: "#2a1a45",
      },
    },
  },
  sand: {
    label: "Sand",
    blurb: "Warm beige · soft and approachable",
    theme: {
      template: "sand",
      font: "outfit",
      palette: {
        bg: "#faf6f1",
        fg: "#3d3429",
        accent: "#b45309",
        muted: "#8a7e6e",
        surface: "#f0e9df",
      },
    },
  },
};

export const ALL_SECTIONS: SectionType[] = [
  "hero",
  "about",
  "skills",
  "projects",
  "repos",
  "experience",
  "contact",
];

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

export const defaultTheme = (): Theme => structuredClone(TEMPLATES.signal.theme);

export function normalize(row: { content: unknown; theme: unknown; sections: unknown }) {
  const c = { ...defaultContent(), ...((row.content as Partial<Content>) ?? {}) };
  c.contact = { ...defaultContent().contact, ...(c.contact ?? {}) };

  // Migrate old template ids from earlier builds
  let t = row.theme as Theme | null;
  if (t?.palette) {
    const id = String(t.template || "") as string;
    if (id === "editorial") t = { ...t, template: "signal" };
    else if (id === "bold") t = { ...t, template: "neon" };
    else if (id === "terminal") t = { ...t, template: "mono" };
    else if (!(id in TEMPLATES)) t = defaultTheme();
  } else {
    t = defaultTheme();
  }

  const s =
    Array.isArray(row.sections) && row.sections.length
      ? (row.sections as Section[])
      : defaultSections();
  return { content: c, theme: t as Theme, sections: s };
}

export const googleFontsHref = (font: FontId) =>
  `https://fonts.googleapis.com/css2?${FONTS[font]?.google ?? FONTS.fraunces.google}&display=swap`;
