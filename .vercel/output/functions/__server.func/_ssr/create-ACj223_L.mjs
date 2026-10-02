import { r as __toESM } from "../_runtime.mjs";
import { n as ensureGuestSession, s as signInWithToken } from "./auth-5sJPomW8.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { r as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as Button } from "./button-D-5TbdOV.mjs";
import { t as Input } from "./input-D62ypCpI.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { b as ArrowLeft, c as LoaderCircle, i as Sparkles, n as Upload, p as FileText, u as ImagePlus, v as Check, y as ArrowRight } from "../_libs/lucide-react.mjs";
import { a as TEMPLATE_ORDER, i as TEMPLATES, o as defaultContent, s as defaultSections } from "./portfolio-QX5LsIJC.mjs";
import { t as PortfolioView } from "./PortfolioView-CZmJebbf.mjs";
import { o as updatePortfolio, t as createPortfolio } from "./storage-CDPa_T-Y.mjs";
import { i as publishPortfolio, n as Textarea, t as Label } from "./github-client-B-SGFy1Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/create-ACj223_L.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TECH_WORDS = [
	{
		pattern: "JavaScript",
		display: "JavaScript"
	},
	{
		pattern: "TypeScript",
		display: "TypeScript"
	},
	{
		pattern: "Python",
		display: "Python"
	},
	{
		pattern: "Java(?!Script)",
		display: "Java"
	},
	{
		pattern: "C\\+\\+",
		display: "C++"
	},
	{
		pattern: "C#",
		display: "C#"
	},
	{
		pattern: "\\bGo\\b",
		display: "Go"
	},
	{
		pattern: "Rust",
		display: "Rust"
	},
	{
		pattern: "Kotlin",
		display: "Kotlin"
	},
	{
		pattern: "Swift",
		display: "Swift"
	},
	{
		pattern: "PHP",
		display: "PHP"
	},
	{
		pattern: "Ruby",
		display: "Ruby"
	},
	{
		pattern: "React(?! Native)",
		display: "React"
	},
	{
		pattern: "Next\\.js",
		display: "Next.js"
	},
	{
		pattern: "Nextjs",
		display: "Next.js"
	},
	{
		pattern: "\\bVue\\b",
		display: "Vue"
	},
	{
		pattern: "Angular",
		display: "Angular"
	},
	{
		pattern: "Node\\.js",
		display: "Node.js"
	},
	{
		pattern: "Nodejs",
		display: "Node.js"
	},
	{
		pattern: "Express",
		display: "Express"
	},
	{
		pattern: "Django",
		display: "Django"
	},
	{
		pattern: "Flask",
		display: "Flask"
	},
	{
		pattern: "Spring",
		display: "Spring"
	},
	{
		pattern: "HTML",
		display: "HTML"
	},
	{
		pattern: "CSS",
		display: "CSS"
	},
	{
		pattern: "Tailwind",
		display: "Tailwind"
	},
	{
		pattern: "\\bSQL\\b",
		display: "SQL"
	},
	{
		pattern: "PostgreSQL",
		display: "PostgreSQL"
	},
	{
		pattern: "MySQL",
		display: "MySQL"
	},
	{
		pattern: "MongoDB",
		display: "MongoDB"
	},
	{
		pattern: "Redis",
		display: "Redis"
	},
	{
		pattern: "AWS",
		display: "AWS"
	},
	{
		pattern: "Azure",
		display: "Azure"
	},
	{
		pattern: "GCP",
		display: "GCP"
	},
	{
		pattern: "Docker",
		display: "Docker"
	},
	{
		pattern: "Kubernetes",
		display: "Kubernetes"
	},
	{
		pattern: "\\bGit\\b",
		display: "Git"
	},
	{
		pattern: "GitHub",
		display: "GitHub"
	},
	{
		pattern: "Linux",
		display: "Linux"
	},
	{
		pattern: "Figma",
		display: "Figma"
	},
	{
		pattern: "GraphQL",
		display: "GraphQL"
	},
	{
		pattern: "REST",
		display: "REST"
	},
	{
		pattern: "\\bAPI\\b",
		display: "API"
	},
	{
		pattern: "Machine Learning",
		display: "Machine Learning"
	},
	{
		pattern: "TensorFlow",
		display: "TensorFlow"
	},
	{
		pattern: "PyTorch",
		display: "PyTorch"
	},
	{
		pattern: "Pandas",
		display: "Pandas"
	},
	{
		pattern: "NumPy",
		display: "NumPy"
	},
	{
		pattern: "Excel",
		display: "Excel"
	},
	{
		pattern: "Power BI",
		display: "Power BI"
	},
	{
		pattern: "Tableau",
		display: "Tableau"
	},
	{
		pattern: "Salesforce",
		display: "Salesforce"
	},
	{
		pattern: "\\bSAP\\b",
		display: "SAP"
	},
	{
		pattern: "Android",
		display: "Android"
	},
	{
		pattern: "\\biOS\\b",
		display: "iOS"
	},
	{
		pattern: "Flutter",
		display: "Flutter"
	},
	{
		pattern: "React Native",
		display: "React Native"
	}
];
/** Resume text → portfolio fields (browser-only, no server). */
function parseResumeText(raw) {
	const text = raw.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").trim();
	if (!text) return {};
	const normalized = text.replace(/([a-z])([A-Z])/g, "$1\n$2").replace(/\s*(EXPERIENCE|EDUCATION|SKILLS|PROJECTS|SUMMARY|PROFILE|OBJECTIVE|WORK EXPERIENCE|TECHNICAL SKILLS)\s*/gi, "\n$1\n");
	const lines = normalized.split("\n").map((l) => l.trim()).filter((l) => l.length > 1);
	const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
	const linkedin = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?/i)?.[0] ?? "";
	const githubUrl = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+\/?/i)?.[0] ?? "";
	const website = text.match(/https?:\/\/(?!.*(linkedin|github)\.)[^\s)]+/i)?.[0] ?? "";
	let name = guessName(lines, email);
	let headline = guessHeadline(lines, name);
	const skills = [...extractListSection(normalized, [
		"skills",
		"technical skills",
		"technologies",
		"tech stack",
		"core competencies"
	]), ...extractTechKeywords(text)];
	const uniqueSkills = [...new Set(skills.map((s) => s.trim()).filter(Boolean))].slice(0, 16);
	const bio = extractParagraphSection(normalized, [
		"summary",
		"profile",
		"about me",
		"about",
		"objective",
		"professional summary"
	]) || lines.filter((l) => l.length > 40 && !/@/.test(l) && l !== name).slice(0, 3).join(" ").slice(0, 500);
	const experience = extractExperience(normalized);
	const projects = extractProjects(normalized);
	let githubUsername = githubUrl.match(/github\.com\/([^/\s?#]+)/i)?.[1]?.replace(/\/$/, "") ?? "";
	const linkedinUrl = linkedin ? linkedin.startsWith("http") ? linkedin : `https://${linkedin}` : "";
	const ghContact = githubUrl ? githubUrl.startsWith("http") ? githubUrl : `https://${githubUrl}` : "";
	return {
		...name ? { name } : {},
		...headline ? { headline } : {},
		...bio ? { bio } : {},
		...uniqueSkills.length ? { skills: uniqueSkills } : {},
		...experience.length ? { experience } : {},
		...projects.length ? { projects } : {},
		...githubUsername ? { githubUsername } : {},
		contact: {
			email,
			website,
			github: ghContact,
			linkedin: linkedinUrl,
			twitter: ""
		}
	};
}
function guessName(lines, email) {
	for (const line of lines.slice(0, 8)) {
		if (/@|https?:|linkedin|github|curriculum|resume|cv|phone|mobile|address/i.test(line)) continue;
		if (/^[A-Z][A-Za-z.'\-]+(?:\s+[A-Z][A-Za-z.'\-]+){0,3}$/.test(line) && line.length < 50) return toTitleCase(line);
		if (line.length > 2 && line.length < 45 && !/^\d+$/.test(line) && !/,/.test(line)) return toTitleCase(line.replace(/\|.*$/, "").trim());
	}
	if (email) {
		const parts = (email.split("@")[0] || "").split(/[._+-]/).filter((p) => p.length > 1 && !/^(data|bytes|mail|info|dev)$/i.test(p));
		if (parts.length) return parts.map(toTitleCase).join(" ");
	}
	return "";
}
function guessHeadline(lines, name) {
	const roleHints = /engineer|developer|designer|student|intern|analyst|manager|consultant|founder|architect|scientist|lead|full.?stack|front.?end|back.?end|software|data|product/i;
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
function extractTechKeywords(text) {
	const seen = /* @__PURE__ */ new Set();
	const found = [];
	for (const { pattern, display } of TECH_WORDS) {
		if (seen.has(display)) continue;
		let re;
		try {
			re = new RegExp(pattern, "i");
		} catch {
			continue;
		}
		if (re.test(text)) {
			seen.add(display);
			found.push(display);
		}
	}
	return found;
}
function toTitleCase(s) {
	return s.toLowerCase().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function extractListSection(text, headers) {
	const lower = text.toLowerCase();
	let start = -1;
	for (const h of headers) {
		const i = lower.search(new RegExp(`(?:^|\n)\s*${escapeRe(h)}\s*[:\n]`, "i"));
		if (i >= 0 && (start < 0 || i < start)) start = i;
	}
	if (start < 0) return [];
	const after = text.slice(start).split("\n").slice(1);
	const items = [];
	for (const line of after) {
		if (/^(experience|education|projects|work|employment|certifications|summary)\b/i.test(line.trim())) break;
		const cleaned = line.replace(/^[-•*·]\s*/, "").replace(/^[\d]+[.)]\s*/, "").trim();
		if (!cleaned) {
			if (items.length) break;
			continue;
		}
		if (/[,|•]/.test(cleaned) && cleaned.length < 220) items.push(...cleaned.split(/[,|•]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 40));
		else if (cleaned.length < 40) items.push(cleaned);
		if (items.length >= 20) break;
	}
	return [...new Set(items)].slice(0, 16);
}
function extractParagraphSection(text, headers) {
	const lower = text.toLowerCase();
	let start = -1;
	for (const h of headers) {
		const i = lower.search(new RegExp(`(?:^|\n)\s*${escapeRe(h)}\s*[:\n]`, "i"));
		if (i >= 0 && (start < 0 || i < start)) start = i;
	}
	if (start < 0) return "";
	const after = text.slice(start).split("\n").slice(1);
	const paras = [];
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
function extractExperience(text) {
	const i = text.toLowerCase().search(/(?:^|\n)\s*(experience|work experience|employment|professional experience)\s*[:\n]/i);
	if (i < 0) return [];
	const block = text.slice(i).split("\n").slice(1);
	const entries = [];
	let current = null;
	for (const line of block) {
		if (/^(education|skills|projects|certifications)\b/i.test(line.trim())) break;
		const t = line.trim();
		if (!t) continue;
		const m = t.match(/^(.{3,60}?)\s+[—–\-|@]\s+(.{2,40}?)(?:\s+[—–\-|]\s+(.{2,30}))?$/i) || t.match(/^(.{3,40}?)\s{2,}(.{2,40}?)\s{2,}(.{2,30})$/);
		if (m && !/^[•\-*]/.test(t)) {
			if (current) entries.push(current);
			current = {
				role: m[1].trim(),
				company: m[2].trim(),
				period: (m[3] || "").trim(),
				description: ""
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
		description: e.description.slice(0, 300)
	}));
}
function extractProjects(text) {
	const i = text.toLowerCase().search(/(?:^|\n)\s*(projects|personal projects|key projects)\s*[:\n]/i);
	if (i < 0) return [];
	const block = text.slice(i).split("\n").slice(1);
	const items = [];
	let current = null;
	for (const line of block) {
		if (/^(experience|education|skills|work)\b/i.test(line.trim())) break;
		const t = line.trim();
		if (!t) continue;
		if (/^[-•*]/.test(t) || t.length < 60 && !current) {
			if (current) items.push(current);
			current = {
				title: t.replace(/^[-•*]\s*/, "").split(/[—–\-:]/)[0].trim().slice(0, 80),
				description: "",
				url: t.match(/https?:\/\S+/i)?.[0] ?? "",
				tags: ""
			};
		} else if (current) current.description = `${current.description} ${t}`.trim().slice(0, 300);
		if (items.length >= 6) break;
	}
	if (current) items.push(current);
	return items.slice(0, 6);
}
function escapeRe(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/** PDF text extraction — browser only, never uploaded. */
async function extractPdfText(file) {
	const pdfjs = await import("../_libs/pdfjs-dist.mjs").then((n) => n.t);
	pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
	const buf = await file.arrayBuffer();
	const data = new Uint8Array(buf);
	const doc = await pdfjs.getDocument({ data }).promise;
	const parts = [];
	const maxPages = Math.min(doc.numPages, 15);
	for (let i = 1; i <= maxPages; i++) {
		const page = await doc.getPage(i);
		const line = (await page.getTextContent()).items.map((it) => "str" in it ? String(it.str) : "").join(" ");
		parts.push(line);
		page.cleanup();
	}
	await doc.destroy();
	return parts.join("\n").trim();
}
async function readResumeFile(file) {
	const name = file.name.toLowerCase();
	const type = file.type || "";
	if (name.endsWith(".pdf") || type === "application/pdf") return extractPdfText(file);
	return await file.text();
}
async function fileToDataUrl(file, maxEdge = 512) {
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
	return canvas.toDataURL("image/jpeg", .85);
}
function CreateWizard() {
	const [step, setStep] = (0, import_react.useState)(1);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [template, setTemplate] = (0, import_react.useState)("signal");
	const [content, setContent] = (0, import_react.useState)(() => defaultContent());
	const [resumeNote, setResumeNote] = (0, import_react.useState)("");
	const [resumePaste, setResumePaste] = (0, import_react.useState)("");
	const [token, setToken] = (0, import_react.useState)("");
	const [repoName, setRepoName] = (0, import_react.useState)("my-portfolio");
	const [liveUrl, setLiveUrl] = (0, import_react.useState)(null);
	const [portfolioId, setPortfolioId] = (0, import_react.useState)(null);
	const photoInputRef = (0, import_react.useRef)(null);
	const resumeInputRef = (0, import_react.useRef)(null);
	function patch(p) {
		setContent((c) => ({
			...c,
			...p
		}));
	}
	function patchContact(key, value) {
		setContent((c) => ({
			...c,
			contact: {
				...c.contact,
				[key]: value
			}
		}));
	}
	function wipeUploadMemory() {
		setResumePaste("");
		setResumeNote("");
		if (photoInputRef.current) photoInputRef.current.value = "";
		if (resumeInputRef.current) resumeInputRef.current.value = "";
	}
	async function onPhoto(file) {
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Please choose an image file");
			return;
		}
		try {
			patch({ avatarUrl: await fileToDataUrl(file) });
			if (photoInputRef.current) photoInputRef.current.value = "";
			toast.success("Photo added");
		} catch {
			toast.error("Could not read photo");
		}
	}
	async function onResumeFile(file) {
		if (!file) return;
		setBusy(true);
		try {
			const text = await readResumeFile(file);
			if (resumeInputRef.current) resumeInputRef.current.value = "";
			if (!text.trim()) {
				setResumeNote("Could not read text from that file. Try another PDF or paste text.");
				toast.error("No text found in resume");
				return;
			}
			applyResume(text);
			setResumeNote(`Imported from ${file.name} — check the live preview on the next step.`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not read resume");
			setResumeNote("PDF read failed. Paste resume text instead.");
		} finally {
			setBusy(false);
		}
	}
	function applyResume(text) {
		const parsed = parseResumeText(text);
		setContent((c) => {
			const next = {
				...c,
				name: parsed.name || c.name,
				headline: parsed.headline || c.headline,
				bio: parsed.bio || c.bio,
				skills: parsed.skills?.length ? parsed.skills : c.skills,
				experience: parsed.experience?.length ? parsed.experience : c.experience,
				projects: parsed.projects?.length ? parsed.projects : c.projects,
				githubUsername: parsed.githubUsername || c.githubUsername,
				contact: {
					...c.contact,
					email: parsed.contact?.email || c.contact.email,
					website: parsed.contact?.website || c.contact.website,
					github: parsed.contact?.github || c.contact.github,
					linkedin: parsed.contact?.linkedin || c.contact.linkedin,
					twitter: c.contact.twitter
				}
			};
			if ((!parsed.name || next.name === "Your Name") && next.contact.email) {
				const parts = (next.contact.email.split("@")[0] || "").split(/[._+-]/).filter((p) => p.length > 1 && !/^(data|bytes|mail|info|dev|admin)$/i.test(p));
				if (parts.length) next.name = parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
			}
			return next;
		});
		setResumePaste("");
		toast.success("Resume applied to portfolio");
	}
	async function buildPortfolio() {
		setBusy(true);
		try {
			const login = ensureGuestSession().user.login;
			const p = createPortfolio(login, { title: content.name || "My Portfolio" });
			const theme = structuredClone(TEMPLATES[template].theme);
			updatePortfolio(login, p.id, {
				content,
				theme,
				sections: defaultSections(),
				slug: p.slug,
				title: content.name || "My Portfolio"
			});
			setPortfolioId(p.id);
			wipeUploadMemory();
			setStep(4);
			toast.success("Portfolio built");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Build failed");
		}
		setBusy(false);
	}
	async function deployLive() {
		const clean = token.trim();
		if (!clean) {
			toast.error("Paste a GitHub token to deploy a live URL");
			return;
		}
		if (!portfolioId) {
			toast.error("Build the portfolio first");
			return;
		}
		setBusy(true);
		try {
			const login = (await signInWithToken(clean)).login;
			const guestList = JSON.parse(localStorage.getItem("folio_portfolios_guest") || "[]");
			const guestRow = Array.isArray(guestList) ? guestList.find((x) => x.id === portfolioId) : null;
			if (guestRow) {
				const key = `folio_portfolios_${login.toLowerCase()}`;
				const existing = JSON.parse(localStorage.getItem(key) || "[]");
				const list = Array.isArray(existing) ? existing : [];
				if (!list.some((x) => x.id === portfolioId)) {
					list.unshift({
						...guestRow,
						content,
						updated_at: (/* @__PURE__ */ new Date()).toISOString()
					});
					localStorage.setItem(key, JSON.stringify(list));
				}
			}
			const row = {
				id: portfolioId,
				slug: repoName,
				title: content.name || "My Portfolio",
				content,
				theme: TEMPLATES[template].theme,
				sections: defaultSections(),
				published: true,
				github_repo: repoName.trim(),
				auto_push: false,
				last_pushed_at: null,
				updated_at: (/* @__PURE__ */ new Date()).toISOString(),
				created_at: (/* @__PURE__ */ new Date()).toISOString()
			};
			const result = await publishPortfolio({
				token: clean,
				login,
				repo: repoName.trim() || "my-portfolio",
				portfolio: row
			});
			updatePortfolio(login, portfolioId, {
				github_repo: repoName.trim(),
				published: true,
				last_pushed_at: (/* @__PURE__ */ new Date()).toISOString(),
				content
			});
			setLiveUrl(result.pagesUrl);
			setToken("");
			wipeUploadMemory();
			toast.success("Live website deployed");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Deploy failed");
		}
		setBusy(false);
	}
	const previewTheme = TEMPLATES[template].theme;
	const previewSections = defaultSections();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen grain",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "font-display text-2xl font-black italic",
				children: "Folio."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-sm text-muted-foreground",
				children: [
					"Step ",
					step,
					" of 4"
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-6xl px-6 pb-24",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-8 flex max-w-2xl gap-2",
					children: [
						1,
						2,
						3,
						4
					].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}` }, s))
				}),
				step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto max-w-2xl space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-4xl font-black",
							children: "Your details"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground",
							children: "Upload a PDF resume — we fill the portfolio fields. Everything stays in your browser."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block-card flex cursor-pointer flex-col items-center gap-2 p-6 text-center hover:bg-muted/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-8 text-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold",
										children: "Upload photo"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "JPG or PNG"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: photoInputRef,
										type: "file",
										accept: "image/*",
										className: "hidden",
										onChange: (e) => onPhoto(e.target.files?.[0] ?? null)
									}),
									content.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: content.avatarUrl,
										alt: "",
										className: "mt-2 size-20 rounded-full border-2 border-ink object-cover"
									}) : null
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block-card flex cursor-pointer flex-col items-center gap-2 p-6 text-center hover:bg-muted/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-8 text-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold",
										children: "Upload resume"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "PDF, .txt, or .md"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: resumeInputRef,
										type: "file",
										accept: ".pdf,.txt,.md,.csv,application/pdf,text/plain",
										className: "hidden",
										onChange: (e) => onResumeFile(e.target.files?.[0] ?? null)
									}),
									busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mt-2 size-5 animate-spin" }) : null
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "mb-1 block",
								children: "Or paste resume text"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 6,
								value: resumePaste,
								placeholder: "Paste your resume / CV text here…",
								onChange: (e) => setResumePaste(e.target.value),
								onBlur: () => {
									if (resumePaste.trim().length > 40) applyResume(resumePaste);
								}
							}),
							resumeNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: resumeNote
							}) : null
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "block",
								onClick: () => setStep(2),
								disabled: busy,
								children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
							})
						})
					]
				}),
				step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-8 lg:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-4xl font-black",
								children: "Review details"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground",
								children: "Edit fields on the left — the portfolio on the right updates immediately."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "mb-1 block",
										children: "Full name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: content.name,
										onChange: (e) => patch({ name: e.target.value })
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "mb-1 block",
										children: "Headline"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: content.headline,
										onChange: (e) => patch({ headline: e.target.value }),
										placeholder: "e.g. Frontend developer"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "mb-1 block",
										children: "About you"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 4,
										value: content.bio,
										onChange: (e) => patch({ bio: e.target.value })
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "mb-1 block",
										children: "Skills (comma separated)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: content.skills.join(", "),
										onChange: (e) => patch({ skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "mb-1 block",
										children: "Email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: content.contact.email,
										onChange: (e) => patchContact("email", e.target.value)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "mb-1 block",
										children: "GitHub username (optional)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: content.githubUsername,
										onChange: (e) => patch({ githubUsername: e.target.value.trim() }),
										placeholder: "your-handle"
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									onClick: () => setStep(1),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {}), " Back"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "block",
									onClick: () => setStep(3),
									disabled: !content.name.trim(),
									children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "overflow-hidden rounded-lg border-2 border-ink bg-card shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-b-2 border-ink bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Live website preview"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-[70vh] overflow-y-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortfolioView, {
								content,
								theme: previewTheme,
								sections: previewSections,
								repos: null
							})
						})]
					})]
				}),
				step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto max-w-3xl text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-4xl font-black",
								children: "Pick a theme"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-muted-foreground",
								children: "Seven styles — click one to preview, then build."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
							children: TEMPLATE_ORDER.map((id) => {
								const meta = TEMPLATES[id];
								const p = meta.theme.palette;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setTemplate(id),
									className: `rounded-xl border-2 p-4 text-left transition ${template === id ? "border-primary ring-2 ring-primary/30" : "border-ink/15 hover:border-ink/40"}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-3 flex h-14 overflow-hidden rounded-lg border border-black/10",
											"aria-hidden": true,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex-1",
													style: { background: p.bg }
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "w-1/4",
													style: { background: p.surface }
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "w-1/5",
													style: { background: p.accent }
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "w-1/6",
													style: { background: p.fg }
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-bold",
											children: meta.label
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 text-xs text-muted-foreground",
											children: meta.blurb
										})
									]
								}, id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto max-w-3xl overflow-hidden rounded-xl border-2 border-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b-2 border-ink bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
								children: ["Preview · ", TEMPLATES[template].label]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "max-h-[50vh] overflow-y-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortfolioView, {
									content,
									theme: TEMPLATES[template].theme,
									sections: previewSections,
									repos: null
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto flex max-w-3xl justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								onClick: () => setStep(2),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {}), " Back"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "block",
								onClick: buildPortfolio,
								disabled: busy,
								children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {}), "Build my portfolio"]
							})]
						})
					]
				}),
				step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto max-w-2xl space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-10 place-items-center rounded-full bg-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-4xl font-black",
								children: "Portfolio ready"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted-foreground",
							children: [
								"Theme: ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: TEMPLATES[template].label }),
								". Deploy to GitHub Pages for a public URL."
							]
						}),
						liveUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "block-card space-y-3 p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: "Live website"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: liveUrl,
								target: "_blank",
								rel: "noreferrer",
								className: "break-all text-primary underline",
								children: liveUrl
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "block-card space-y-4 p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold",
									children: "Deploy live (free GitHub Pages)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										"Token:",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											className: "underline",
											href: "https://github.com/settings/tokens/new?scopes=repo&description=Folio",
											target: "_blank",
											rel: "noreferrer",
											children: "github.com/settings/tokens"
										}),
										" ",
										"(",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "repo" }),
										" scope)."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "mb-1 block",
									children: "GitHub token"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									value: token,
									onChange: (e) => setToken(e.target.value),
									placeholder: "ghp_…",
									autoComplete: "off"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "mb-1 block",
									children: "Site name (repo)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: repoName,
									onChange: (e) => setRepoName(e.target.value.replace(/[^A-Za-z0-9._-]/g, "-")),
									placeholder: "my-portfolio"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "block",
									className: "w-full",
									onClick: deployLive,
									disabled: busy,
									children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), "Deploy website"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-3",
							children: [portfolioId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "blockOutline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/editor/$id",
									params: { id: portfolioId },
									children: "Edit design"
								})
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/dashboard",
									children: "Dashboard"
								})
							})]
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { CreateWizard as component };
