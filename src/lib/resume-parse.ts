import type { Content, Experience, Project } from "./portfolio";

/** Very light resume text → portfolio fields (works offline, no AI API). */
export function parseResumeText(raw: string): Partial<Content> {
  const text = raw.replace(/\r/g, "\n").trim();
  if (!text) return {};

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const email =
    text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone = text.match(/(\+?\d[\d\s().-]{8,}\d)/)?.[0] ?? "";
  const linkedin =
    text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s)]+/i)?.[0] ?? "";
  const github =
    text.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i)?.[0] ?? "";
  const website =
    text.match(/https?:\/\/(?!linkedin|github)[^\s)]+/i)?.[0] ?? "";

  // First non-empty line that isn't an email/url often is the name
  let name = "";
  for (const line of lines.slice(0, 5)) {
    if (/@|https?:|linkedin|github|curriculum|resume|cv/i.test(line)) continue;
    if (line.length > 2 && line.length < 60 && !/^\d+$/.test(line)) {
      name = line.replace(/\|.*$/, "").trim();
      break;
    }
  }

  // Headline: second short line or line with | or —
  let headline = "";
  for (const line of lines.slice(1, 8)) {
    if (line === name) continue;
    if (/@|https?:/.test(line)) continue;
    if (line.length < 80) {
      headline = line;
      break;
    }
  }

  // Skills: look for a Skills section
  const skills = extractListSection(text, [
    "skills",
    "technical skills",
    "technologies",
    "tech stack",
  ]);

  // Bio: summary / about / profile
  const bio =
    extractParagraphSection(text, ["summary", "profile", "about me", "about", "objective"]) ||
    lines.slice(2, 6).join(" ").slice(0, 400);

  const experience = extractExperience(text);
  const projects = extractProjects(text);

  const githubUsername =
    github.match(/github\.com\/([^/\s?#]+)/i)?.[1]?.replace(/\/$/, "") ?? "";

  return {
    name: name || undefined,
    headline: headline || undefined,
    bio: bio || undefined,
    skills: skills.length ? skills : undefined,
    experience: experience.length ? experience : undefined,
    projects: projects.length ? projects : undefined,
    githubUsername: githubUsername || undefined,
    contact: {
      email,
      website,
      github,
      linkedin,
      twitter: "",
    },
  };
}

function extractListSection(text: string, headers: string[]): string[] {
  const lower = text.toLowerCase();
  let start = -1;
  let headerLen = 0;
  for (const h of headers) {
    const i = lower.search(new RegExp(`(?:^|\n)\s*${escapeRe(h)}\s*[:\n]`, "i"));
    if (i >= 0 && (start < 0 || i < start)) {
      start = i;
      headerLen = h.length;
    }
  }
  if (start < 0) return [];
  const after = text.slice(start).split("\n").slice(1);
  const items: string[] = [];
  for (const line of after) {
    if (/^(experience|education|projects|work|employment|certifications)\b/i.test(line.trim())) {
      break;
    }
    const cleaned = line
      .replace(/^[-•*·]\s*/, "")
      .replace(/^[\d]+[.)]\s*/, "")
      .trim();
    if (!cleaned) {
      if (items.length) break;
      continue;
    }
    // comma / pipe separated skill lines
    if (/[,|]/.test(cleaned) && cleaned.length < 200) {
      items.push(
        ...cleaned
          .split(/[,|]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 1 && s.length < 40),
      );
    } else if (cleaned.length < 40) {
      items.push(cleaned);
    }
    if (items.length >= 20) break;
  }
  return [...new Set(items)].slice(0, 16);
}

function extractParagraphSection(text: string, headers: string[]): string {
  const lower = text.toLowerCase();
  let start = -1;
  for (const h of headers) {
    const i = lower.search(new RegExp(`(?:^|\n)\s*${escapeRe(h)}\s*[:\n]`, "i"));
    if (i >= 0 && (start < 0 || i < start)) start = i;
  }
  if (start < 0) return "";
  const after = text.slice(start).split("\n").slice(1);
  const paras: string[] = [];
  for (const line of after) {
    if (/^(experience|education|skills|projects|work)\b/i.test(line.trim())) break;
    if (!line.trim()) {
      if (paras.length) break;
      continue;
    }
    paras.push(line.trim());
    if (paras.join(" ").length > 500) break;
  }
  return paras.join(" ").slice(0, 600);
}

function extractExperience(text: string): Experience[] {
  const lower = text.toLowerCase();
  const i = lower.search(/(?:^|\n)\s*(experience|work experience|employment|professional experience)\s*[:\n]/i);
  if (i < 0) return [];
  const block = text.slice(i).split("\n").slice(1);
  const entries: Experience[] = [];
  let current: Experience | null = null;
  for (const line of block) {
    if (/^(education|skills|projects|certifications)\b/i.test(line.trim())) break;
    const t = line.trim();
    if (!t) continue;
    // Heuristic: Role at Company | dates
    const m =
      t.match(/^(.{3,60}?)\s+[—–\-|@]\s+(.{2,40}?)(?:\s+[—–\-|]\s+(.{2,30}))?$/i) ||
      t.match(/^(.{3,40}?)\s{2,}(.{2,40}?)\s{2,}(.{2,30})$/);
    if (m && !/^[•\-*]/.test(t)) {
      if (current) entries.push(current);
      current = {
        role: m[1].trim(),
        company: m[2].trim(),
        period: (m[3] || "").trim(),
        description: "",
      };
    } else if (current) {
      const desc = t.replace(/^[-•*]\s*/, "");
      current.description = current.description
        ? `${current.description} ${desc}`
        : desc;
    }
    if (entries.length >= 6) break;
  }
  if (current) entries.push(current);
  return entries.slice(0, 6).map((e) => ({
    ...e,
    description: e.description.slice(0, 300),
  }));
}

function extractProjects(text: string): Project[] {
  const lower = text.toLowerCase();
  const i = lower.search(/(?:^|\n)\s*(projects|personal projects|key projects)\s*[:\n]/i);
  if (i < 0) return [];
  const block = text.slice(i).split("\n").slice(1);
  const items: Project[] = [];
  let current: Project | null = null;
  for (const line of block) {
    if (/^(experience|education|skills|work)\b/i.test(line.trim())) break;
    const t = line.trim();
    if (!t) continue;
    if (/^[-•*]/.test(t) || (t.length < 60 && !current)) {
      if (current) items.push(current);
      current = {
        title: t.replace(/^[-•*]\s*/, "").split(/[—–\-:]/)[0].trim().slice(0, 80),
        description: "",
        url: t.match(/https?:\/\S+/i)?.[0] ?? "",
        tags: "",
      };
    } else if (current) {
      current.description = `${current.description} ${t}`.trim().slice(0, 300);
    }
    if (items.length >= 6) break;
  }
  if (current) items.push(current);
  return items.slice(0, 6);
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Read a File as text (txt/md/csv) or empty for binary PDFs (user can paste). */
export async function readResumeFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    // Browser has no built-in PDF text API without a library; ask user to paste.
    return "";
  }
  return await file.text();
}

/** Photo → compressed data URL for embedding in HTML. */
export async function fileToDataUrl(file: File, maxEdge = 512): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
