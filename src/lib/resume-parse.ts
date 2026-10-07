import type { Content, Experience, Project } from "./portfolio";

const TECH_WORDS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C\\+\\+",
  "C#",
  "Go",
  "Rust",
  "Kotlin",
  "Swift",
  "PHP",
  "Ruby",
  "React",
  "Next\\.js",
  "Nextjs",
  "Vue",
  "Angular",
  "Node\\.js",
  "Nodejs",
  "Express",
  "Django",
  "Flask",
  "Spring",
  "HTML",
  "CSS",
  "Tailwind",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Git",
  "GitHub",
  "Linux",
  "Figma",
  "GraphQL",
  "REST",
  "API",
  "Machine Learning",
  "TensorFlow",
  "PyTorch",
  "Pandas",
  "NumPy",
  "Excel",
  "Power BI",
  "Tableau",
  "Salesforce",
  "SAP",
  "Android",
  "iOS",
  "Flutter",
  "React Native",
];

/** Resume text → portfolio fields (browser-only, no server). */
export function parseResumeText(raw: string): Partial<Content> {
  const text = raw
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  if (!text) return {};

  // PDF extractors often drop newlines — re-split on common cues
  const normalized = text
    .replace(/([a-z])([A-Z])/g, "$1\n$2")
    .replace(
      /\s*(EXPERIENCE|EDUCATION|SKILLS|PROJECTS|SUMMARY|PROFILE|OBJECTIVE|WORK EXPERIENCE|TECHNICAL SKILLS)\s*/gi,
      "\n$1\n",
    );

  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 1);

  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const linkedin =
    text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?/i)?.[0] ?? "";
  const githubUrl =
    text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+\/?/i)?.[0] ?? "";
  const website = text.match(/https?:\/\/(?!.*(linkedin|github)\.)[^\s)]+/i)?.[0] ?? "";

  const name = guessName(lines, email);
  const headline = guessHeadline(lines, name);
  const skills = [
    ...extractListSection(normalized, [
      "skills",
      "technical skills",
      "technologies",
      "tech stack",
      "core competencies",
    ]),
    ...extractTechKeywords(text),
  ];
  const uniqueSkills = [...new Set(skills.map((s) => s.trim()).filter(Boolean))].slice(0, 16);

  const bio =
    extractParagraphSection(normalized, [
      "summary",
      "profile",
      "about me",
      "about",
      "objective",
      "professional summary",
    ]) ||
    lines
      .filter((l) => l.length > 40 && !/@/.test(l) && l !== name)
      .slice(0, 3)
      .join(" ")
      .slice(0, 500);

  const experience = extractExperience(normalized);
  const projects = extractProjects(normalized);

  const githubUsername =
    githubUrl.match(/github\.com\/([^/\s?#]+)/i)?.[1]?.replace(/\/$/, "") ?? "";

  // Prefer clean linkedin/github URLs
  const linkedinUrl = linkedin
    ? linkedin.startsWith("http")
      ? linkedin
      : `https://${linkedin}`
    : "";
  const ghContact = githubUrl
    ? githubUrl.startsWith("http")
      ? githubUrl
      : `https://${githubUrl}`
    : "";

  return {
    ...(name ? { name } : {}),
    ...(headline ? { headline } : {}),
    ...(bio ? { bio } : {}),
    ...(uniqueSkills.length ? { skills: uniqueSkills } : {}),
    ...(experience.length ? { experience } : {}),
    ...(projects.length ? { projects } : {}),
    ...(githubUsername ? { githubUsername } : {}),
    contact: {
      email,
      website,
      github: ghContact,
      linkedin: linkedinUrl,
      twitter: "",
    },
  };
}

function guessName(lines: string[], email: string): string {
  for (const line of lines.slice(0, 8)) {
    if (/@|https?:|linkedin|github|curriculum|resume|cv|phone|mobile|address/i.test(line)) continue;
    // All-caps name lines common in PDFs
    if (/^[A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){0,3}$/.test(line) && line.length < 50) {
      return toTitleCase(line);
    }
    if (line.length > 2 && line.length < 45 && !/^\d+$/.test(line) && !/,/.test(line)) {
      return toTitleCase(line.replace(/\|.*$/, "").trim());
    }
  }
  // Fallback from email local part: databytes.sairam → Sairam / Databytes Sairam
  if (email) {
    const local = email.split("@")[0] || "";
    const parts = local
      .split(/[._+-]/)
      .filter((p) => p.length > 1 && !/^(data|bytes|mail|info|dev)$/i.test(p));
    if (parts.length) return parts.map(toTitleCase).join(" ");
  }
  return "";
}

function guessHeadline(lines: string[], name: string): string {
  const roleHints =
    /engineer|developer|designer|student|intern|analyst|manager|consultant|founder|architect|scientist|lead|full.?stack|front.?end|back.?end|software|data|product/i;
  for (const line of lines.slice(0, 12)) {
    if (line === name || line.toLowerCase() === name.toLowerCase()) continue;
    if (/@|https?:/.test(line)) continue;
    if (roleHints.test(line) && line.length < 100) return line;
  }
  for (const line of lines.slice(1, 8)) {
    if (line === name) continue;
    if (/@|https?:/.test(line)) continue;
    if (line.length > 8 && line.length < 90) return line;
  }
  return "";
}

function extractTechKeywords(text: string): string[] {
  const found: string[] = [];
  for (const w of TECH_WORDS) {
    const re = new RegExp(`\\b${w}\\b`, "i");
    if (re.test(text)) {
      const nice = w.replace(/\\/g, "");
      found.push(nice === "Nextjs" ? "Next.js" : nice === "Nodejs" ? "Node.js" : nice);
    }
  }
  return found;
}

function toTitleCase(s: string) {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function extractListSection(text: string, headers: string[]): string[] {
  const lower = text.toLowerCase();
  let start = -1;
  for (const h of headers) {
    const i = lower.search(new RegExp(`(?:^|\n)\\s*${escapeRe(h)}\\s*[:\n]`, "i"));
    if (i >= 0 && (start < 0 || i < start)) start = i;
  }
  if (start < 0) return [];
  const after = text.slice(start).split("\n").slice(1);
  const items: string[] = [];
  for (const line of after) {
    if (
      /^(experience|education|projects|work|employment|certifications|summary)\b/i.test(line.trim())
    ) {
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
    if (/[,|•]/.test(cleaned) && cleaned.length < 220) {
      items.push(
        ...cleaned
          .split(/[,|•]/)
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
    const i = lower.search(new RegExp(`(?:^|\n)\\s*${escapeRe(h)}\\s*[:\n]`, "i"));
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
  const i = lower.search(
    /(?:^|\n)\s*(experience|work experience|employment|professional experience)\s*[:\n]/i,
  );
  if (i < 0) return [];
  const block = text.slice(i).split("\n").slice(1);
  const entries: Experience[] = [];
  let current: Experience | null = null;
  for (const line of block) {
    if (/^(education|skills|projects|certifications)\b/i.test(line.trim())) break;
    const t = line.trim();
    if (!t) continue;
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
      current.description = current.description ? `${current.description} ${desc}` : desc;
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
        title: t
          .replace(/^[-•*]\s*/, "")
          .split(/[—–\-:]/)[0]
          .trim()
          .slice(0, 80),
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

/** PDF text extraction — browser only, never uploaded. */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  const buf = await file.arrayBuffer();
  const data = new Uint8Array(buf);
  const doc = await pdfjs.getDocument({ data }).promise;
  const parts: string[] = [];
  const maxPages = Math.min(doc.numPages, 15);
  for (let i = 1; i <= maxPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((it) => ("str" in it ? String((it as { str: string }).str) : ""))
      .join(" ");
    parts.push(line);
    page.cleanup();
  }
  await doc.destroy();
  return parts.join("\n").trim();
}

export async function readResumeFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type || "";
  if (name.endsWith(".pdf") || type === "application/pdf") {
    return extractPdfText(file);
  }
  return await file.text();
}

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
