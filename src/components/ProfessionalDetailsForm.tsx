import { useState, useRef } from "react";
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  User,
  Plus,
  Trash2,
  ArrowRight,
  Download,
  Eye,
  Layout,
  Upload,
  Layers,
  Save,
  Check,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
  FileText,
  RotateCcw,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioView } from "@/components/PortfolioView";
import { LivePortfolioPreview } from "@/components/LivePortfolioPreview";
import {
  defaultContent,
  defaultSections,
  defaultTheme,
  TEMPLATE_ORDER,
  TEMPLATES,
  type Content,
  type Education,
  type Experience,
  type Project,
  type Section,
  type SectionType,
  type TemplateId,
  type Theme,
} from "@/lib/portfolio";
import { fileToDataUrl, parseResumeText, readResumeFile } from "@/lib/resume-parse";
import { renderPortfolioHtml } from "@/lib/export-html";
import { loadSession } from "@/lib/auth";

export interface ProfessionalDetailsFormProps {
  initialContent?: Partial<Content>;
  initialTheme?: Theme;
  initialSections?: Section[];
  onGenerate?: (data: {
    content: Content;
    theme: Theme;
    sections: Section[];
    title: string;
  }) => void | Promise<void>;
  onSaveToFirebase?: (data: {
    content: Content;
    theme: Theme;
    sections: Section[];
    title: string;
  }) => Promise<void>;
  mode?: "standalone" | "wizard" | "embedded";
}

const SAMPLE_PROFILES = [
  {
    label: "Full Stack Engineer",
    data: {
      name: "Alex Morgan",
      headline: "Senior Full Stack Engineer · React · Node.js · TypeScript · Cloud Architect",
      bio: "Crafting performant distributed web applications and developer tools. Passionate about clean architectures, real-time collaboration systems, and delightful UX.",
      location: "San Francisco, CA (or Remote)",
      skills: [
        "TypeScript",
        "React",
        "Next.js",
        "Node.js",
        "PostgreSQL",
        "TailwindCSS",
        "Docker",
        "GraphQL",
      ],
      experience: [
        {
          role: "Senior Full Stack Engineer",
          company: "Vanguard Tech Labs",
          period: "2023 — Present",
          description:
            "Led architectural migration of core client portal to serverless edge runtime, reducing p99 latency by 42%. Mentored 4 engineers and spearheaded TypeScript adoption.",
        },
        {
          role: "Software Engineer",
          company: "Nexus Cloud Systems",
          period: "2021 — 2023",
          description:
            "Engineered scalable REST & GraphQL microservices handling 15M+ daily requests. Built real-time analytics pipelines with Redis and PostgreSQL.",
        },
      ],
      education: [
        {
          degree: "B.S. in Computer Science & Engineering",
          institution: "University of California, Berkeley",
          period: "2017 — 2021",
          description:
            "Focus on Systems Architecture, Distributed Databases, and Artificial Intelligence. Dean's Honors List.",
        },
      ],
      projects: [
        {
          title: "Pulse Real-time Sync",
          description:
            "High-throughput operational transform synchronization engine for distributed canvas applications.",
          url: "https://pulse.dev",
          repo: "https://github.com/alexmorgan/pulse-sync",
          tags: "TypeScript · WebSockets · CRDTs",
        },
        {
          title: "Kite Developer Studio",
          description:
            "Extensible open-source IDE theme and plugin system with over 35,000 active developers.",
          url: "https://kitestudio.io",
          repo: "https://github.com/alexmorgan/kite-studio",
          tags: "React · Electron · TailwindCSS",
        },
      ],
      contact: {
        email: "alex.morgan@example.com",
        website: "https://alexmorgan.dev",
        github: "https://github.com/alexmorgan",
        linkedin: "https://linkedin.com/in/alexmorgan",
        twitter: "https://x.com/alexmorgan_dev",
      },
      githubUsername: "alexmorgan",
    },
  },
  {
    label: "AI & ML Specialist",
    data: {
      name: "Dr. Elena Rostova",
      headline: "Machine Learning Researcher & AI Engineer · PyTorch · LLMs · Multi-Modal Systems",
      bio: "Pushing the frontiers of multi-modal foundation models and sparse computation. Author of 6 published peer-reviewed papers on neural representations and reinforcement learning.",
      location: "Boston, MA",
      skills: [
        "Python",
        "PyTorch",
        "JAX",
        "CUDA",
        "LangChain",
        "Transformers",
        "Distributed Training",
        "NumPy",
      ],
      experience: [
        {
          role: "Lead Research Scientist",
          company: "Cortex AI Innovations",
          period: "2022 — Present",
          description:
            "Trained and deployed 70B parameter instruction-tuned multi-modal architectures. Optimized tensor parallelism and KV-cache latency by 3.4x.",
        },
        {
          role: "ML Research Intern",
          company: "DeepMind Collaborative",
          period: "2021 — 2022",
          description:
            "Explored emergent reasoning capabilities in vision-language models and cross-attention pruning.",
        },
      ],
      education: [
        {
          degree: "Ph.D. in Computer Science (Machine Learning)",
          institution: "Massachusetts Institute of Technology (MIT)",
          period: "2018 — 2022",
          description:
            "Doctoral dissertation on Sparse Neural Graph Embeddings. Outstanding Graduate Researcher Award.",
        },
        {
          degree: "B.S. in Applied Mathematics",
          institution: "Carnegie Mellon University",
          period: "2014 — 2018",
          description: "Summa Cum Laude. Departmental Prize in Discrete Mathematics.",
        },
      ],
      projects: [
        {
          title: "Aura Multimodal LLM",
          description:
            "Sub-100ms multi-modal reasoning engine capable of real-time audio and video synthesis.",
          url: "https://aura-ai.research",
          repo: "https://github.com/elena-rostova/aura-core",
          tags: "Python · PyTorch · CUDA",
        },
      ],
      contact: {
        email: "elena.rostova@mit.edu",
        website: "https://elenarostova.ai",
        github: "https://github.com/elena-rostova",
        linkedin: "https://linkedin.com/in/elenarostova",
        twitter: "https://x.com/elena_ai",
      },
      githubUsername: "elena-rostova",
    },
  },
];

export function ProfessionalDetailsForm({
  initialContent,
  initialTheme,
  initialSections,
  onGenerate,
  onSaveToFirebase,
  mode = "standalone",
}: ProfessionalDetailsFormProps) {
  const [content, setContent] = useState<Content>(() => ({
    ...defaultContent(),
    ...(initialContent || {}),
    contact: { ...defaultContent().contact, ...(initialContent?.contact || {}) },
    education: initialContent?.education || defaultContent().education || [],
    experience: initialContent?.experience || defaultContent().experience || [],
    projects: initialContent?.projects || defaultContent().projects || [],
    skills: initialContent?.skills || defaultContent().skills || [],
  }));

  const [theme, setTheme] = useState<Theme>(() => initialTheme || defaultTheme());
  const [sections, setSections] = useState<Section[]>(() => initialSections || defaultSections());
  const [title, setTitle] = useState(
    content.name ? `${content.name} — Portfolio` : "Professional Portfolio",
  );
  const [activeTab, setActiveTab] = useState<
    "bio" | "experience" | "education" | "skills" | "projects" | "theme" | "preview"
  >("bio");
  const [newSkill, setNewSkill] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [resumeText, setResumeText] = useState("");
  const [showResumeModal, setShowResumeModal] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeFileRef = useRef<HTMLInputElement>(null);

  function patchContent(p: Partial<Content>) {
    setContent((prev) => ({ ...prev, ...p }));
  }

  function patchContact(field: keyof Content["contact"], value: string) {
    setContent((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  }

  // Work Experience Handlers
  function addExperience() {
    const item: Experience = {
      role: "Software Engineer",
      company: "Company Name",
      period: "2023 — Present",
      description: "Describe key contributions, technologies utilized, and measurable outcomes.",
    };
    setContent((prev) => ({ ...prev, experience: [item, ...prev.experience] }));
    toast.success("Added new work experience");
  }

  function updateExperience(idx: number, patch: Partial<Experience>) {
    setContent((prev) => {
      const next = [...prev.experience];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, experience: next };
    });
  }

  function removeExperience(idx: number) {
    setContent((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx),
    }));
    toast.info("Removed experience entry");
  }

  // Education Handlers
  function addEducation() {
    const item: Education = {
      degree: "B.S. in Computer Science",
      institution: "University / Institute",
      period: "2020 — 2024",
      description: "Academic honors, relevant coursework, thesis, or achievements.",
    };
    setContent((prev) => ({
      ...prev,
      education: [...(prev.education || []), item],
    }));
    toast.success("Added education entry");
  }

  function updateEducation(idx: number, patch: Partial<Education>) {
    setContent((prev) => {
      const current = prev.education || [];
      const next = [...current];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, education: next };
    });
  }

  function removeEducation(idx: number) {
    setContent((prev) => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== idx),
    }));
    toast.info("Removed education entry");
  }

  // Skills Handlers
  function addSkill(skillName?: string) {
    const s = (skillName || newSkill).trim();
    if (!s) return;
    if (content.skills.includes(s)) {
      toast.error("Skill already added");
      return;
    }
    setContent((prev) => ({ ...prev, skills: [...prev.skills, s] }));
    if (!skillName) setNewSkill("");
  }

  function removeSkill(idx: number) {
    setContent((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx),
    }));
  }

  // Project Handlers
  function addProject() {
    const item: Project = {
      title: "Featured System / App",
      description:
        "Full-stack application engineered with modern tools, high performance, and clean UX.",
      url: "",
      repo: "",
      tags: "TypeScript · React · TailwindCSS",
    };
    setContent((prev) => ({ ...prev, projects: [item, ...prev.projects] }));
    toast.success("Added new project");
  }

  function updateProject(idx: number, patch: Partial<Project>) {
    setContent((prev) => {
      const next = [...prev.projects];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, projects: next };
    });
  }

  function removeProject(idx: number) {
    setContent((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== idx),
    }));
  }

  // Section Toggle
  function toggleSection(type: SectionType) {
    setSections((prev) => prev.map((s) => (s.type === type ? { ...s, visible: !s.visible } : s)));
  }

  // Photo Upload
  async function handlePhotoUpload(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    try {
      const url = await fileToDataUrl(file);
      patchContent({ avatarUrl: url });
      toast.success("Avatar updated");
    } catch {
      toast.error("Failed to load photo");
    }
  }

  // Parse Resume text/file
  async function handleParseResume(text: string) {
    if (!text.trim()) {
      toast.error("Please paste your resume text");
      return;
    }
    setBusy(true);
    try {
      const parsed = parseResumeText(text);
      setContent((prev) => ({
        ...prev,
        name: parsed.name || prev.name,
        headline: parsed.headline || prev.headline,
        bio: parsed.bio || prev.bio,
        skills: Array.from(new Set([...prev.skills, ...parsed.skills])),
        experience: parsed.experience.length ? parsed.experience : prev.experience,
        projects: parsed.projects.length ? parsed.projects : prev.projects,
        location: parsed.location || prev.location,
        contact: {
          ...prev.contact,
          email: parsed.contact.email || prev.contact.email,
          github: parsed.contact.github || prev.contact.github,
          linkedin: parsed.contact.linkedin || prev.contact.linkedin,
          website: parsed.contact.website || prev.contact.website,
        },
        githubUsername: parsed.githubUsername || prev.githubUsername,
      }));
      setShowResumeModal(false);
      setResumeText("");
      toast.success("Resume details extracted successfully!");
    } catch (e) {
      toast.error("Could not parse resume text");
    } finally {
      setBusy(false);
    }
  }

  async function handleResumeFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const text = await readResumeFile(file);
      if (resumeFileRef.current) resumeFileRef.current.value = "";
      if (!text.trim()) {
        toast.error("Could not read text from that file");
        return;
      }
      await handleParseResume(text);
    } catch {
      toast.error("Failed to read resume file");
    } finally {
      setBusy(false);
    }
  }

  function loadSample(profile: (typeof SAMPLE_PROFILES)[0]) {
    setContent({
      ...defaultContent(),
      ...profile.data,
      contact: { ...defaultContent().contact, ...profile.data.contact },
      education: profile.data.education || [],
      experience: profile.data.experience || [],
      projects: profile.data.projects || [],
      skills: profile.data.skills || [],
    });
    setTitle(`${profile.data.name} — Portfolio`);
    toast.success(`Loaded sample: ${profile.label}`);
  }

  async function handleDownloadHtml() {
    try {
      const html = await renderPortfolioHtml({
        title,
        content,
        theme,
        sections,
      });
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${content.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "portfolio"}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Downloaded standalone HTML portfolio!");
    } catch (e) {
      toast.error("Failed to generate HTML");
    }
  }

  async function handleGenerateSubmit() {
    const payload = { content, theme, sections, title };
    if (onGenerate) {
      await onGenerate(payload);
    }
    if (onSaveToFirebase) {
      setBusy(true);
      try {
        await onSaveToFirebase(payload);
        toast.success("Portfolio layout generated and saved!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save portfolio");
      } finally {
        setBusy(false);
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left: Input Form Panel */}
      <div className="flex-1 space-y-6">
        {/* Header and Quick Pre-fills */}
        <div className="rounded-xl border-2 border-ink bg-card p-5 shadow-[4px_4px_0_0_oklch(0.2_0.02_60)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-black tracking-tight">
                Professional Details
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter your bio, career experience, education, and skills to generate a structured
                portfolio.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-ink font-semibold"
                onClick={() => setShowResumeModal(true)}
              >
                <FileText className="mr-1.5 size-3.5" /> Auto-fill from Resume
              </Button>
              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold text-muted-foreground">Sample:</span>
                {SAMPLE_PROFILES.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => loadSample(p)}
                    className="rounded border border-ink/40 bg-muted px-2 py-0.5 text-xs font-semibold hover:bg-ink hover:text-white"
                  >
                    {p.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Tabs */}
        <div className="rounded-xl border-2 border-ink bg-card p-6 shadow-[4px_4px_0_0_oklch(0.2_0.02_60)]">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 border border-ink bg-muted/40 p-1 sm:grid-cols-7">
              <TabsTrigger value="bio" className="text-xs font-bold">
                <User className="mr-1.5 size-3.5" /> Bio & Info
              </TabsTrigger>
              <TabsTrigger value="experience" className="text-xs font-bold">
                <Briefcase className="mr-1.5 size-3.5" /> Experience
              </TabsTrigger>
              <TabsTrigger value="education" className="text-xs font-bold">
                <GraduationCap className="mr-1.5 size-3.5" /> Education
              </TabsTrigger>
              <TabsTrigger value="skills" className="text-xs font-bold">
                <Sparkles className="mr-1.5 size-3.5" /> Skills
              </TabsTrigger>
              <TabsTrigger value="projects" className="text-xs font-bold">
                <Layers className="mr-1.5 size-3.5" /> Projects
              </TabsTrigger>
              <TabsTrigger value="theme" className="text-xs font-bold">
                <Layout className="mr-1.5 size-3.5" /> Theme
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs font-bold lg:hidden">
                <Eye className="mr-1.5 size-3.5 text-primary" /> Live Preview
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Bio & Personal Info */}
            <TabsContent value="bio" className="mt-6 space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-muted font-display text-xl font-bold">
                  {content.avatarUrl ? (
                    <img
                      src={content.avatarUrl}
                      alt={content.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    content.name?.charAt(0) || "U"
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold">Profile Photo / Avatar</Label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={photoInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e.target.files?.[0] || null)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-ink text-xs font-semibold"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <Upload className="mr-1.5 size-3.5" /> Upload Image
                    </Button>
                    <Input
                      placeholder="Or paste image URL"
                      value={content.avatarUrl}
                      onChange={(e) => patchContent({ avatarUrl: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="font-bold">Full Name *</Label>
                  <Input
                    value={content.name}
                    onChange={(e) => {
                      patchContent({ name: e.target.value });
                      if (!title || title.includes("Portfolio")) {
                        setTitle(`${e.target.value} — Portfolio`);
                      }
                    }}
                    placeholder="e.g. Maya Lin"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold">Location / Institution</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={content.location}
                      onChange={(e) => patchContent({ location: e.target.value })}
                      placeholder="e.g. San Francisco, CA or Stanford University"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold">Professional Headline *</Label>
                <Input
                  value={content.headline}
                  onChange={(e) => patchContent({ headline: e.target.value })}
                  placeholder="e.g. Senior Software Engineer · Distributed Systems · React · Python"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold">Professional Summary & Bio</Label>
                <Textarea
                  rows={4}
                  value={content.bio}
                  onChange={(e) => patchContent({ bio: e.target.value })}
                  placeholder="Write 2-4 sentences highlighting your background, specializations, impact, and engineering philosophy."
                />
              </div>

              <div className="border-t border-ink/20 pt-4">
                <Label className="mb-3 block font-bold">Contact & Social Links</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      className="pl-9 text-xs"
                      type="email"
                      value={content.contact.email}
                      onChange={(e) => patchContact("email", e.target.value)}
                      placeholder="Email (e.g. alex@domain.com)"
                    />
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      className="pl-9 text-xs"
                      value={content.contact.website}
                      onChange={(e) => patchContact("website", e.target.value)}
                      placeholder="Website (e.g. https://domain.com)"
                    />
                  </div>
                  <div className="relative">
                    <Github className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      className="pl-9 text-xs"
                      value={content.contact.github}
                      onChange={(e) => {
                        patchContact("github", e.target.value);
                        const match = e.target.value.match(/github\.com\/([^/\s?#]+)/i);
                        if (match?.[1]) {
                          patchContent({ githubUsername: match[1] });
                        }
                      }}
                      placeholder="GitHub URL (e.g. https://github.com/username)"
                    />
                  </div>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      className="pl-9 text-xs"
                      value={content.contact.linkedin}
                      onChange={(e) => patchContact("linkedin", e.target.value)}
                      placeholder="LinkedIn URL"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Work Experience */}
            <TabsContent value="experience" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Career & Work Experience</h3>
                  <p className="text-xs text-muted-foreground">
                    Add full-time roles, internships, contracts, and leadership positions.
                  </p>
                </div>
                <Button type="button" variant="block" size="sm" onClick={addExperience}>
                  <Plus className="mr-1.5 size-4" /> Add Role
                </Button>
              </div>

              {content.experience.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-ink/30 p-8 text-center">
                  <Briefcase className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-semibold">No work experience added yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addExperience}
                    className="mt-3 border-ink"
                  >
                    <Plus className="mr-1.5 size-3.5" /> Add First Experience
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {content.experience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-lg border-2 border-ink bg-muted/20 p-4 transition-all hover:bg-muted/30"
                    >
                      <button
                        type="button"
                        onClick={() => removeExperience(idx)}
                        className="absolute right-3 top-3 rounded p-1 text-muted-foreground hover:bg-destructive hover:text-white"
                        title="Remove role"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1 sm:col-span-1">
                          <Label className="text-xs font-bold">Role / Title *</Label>
                          <Input
                            value={exp.role}
                            onChange={(e) => updateExperience(idx, { role: e.target.value })}
                            placeholder="e.g. Senior Software Engineer"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-1">
                          <Label className="text-xs font-bold">Company / Organization *</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(idx, { company: e.target.value })}
                            placeholder="e.g. Stripe"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-1">
                          <Label className="text-xs font-bold">Period / Dates *</Label>
                          <Input
                            value={exp.period}
                            onChange={(e) => updateExperience(idx, { period: e.target.value })}
                            placeholder="e.g. 2022 — Present"
                          />
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <Label className="text-xs font-bold">
                          Key Responsibilities & Achievements
                        </Label>
                        <Textarea
                          rows={3}
                          value={exp.description}
                          onChange={(e) => updateExperience(idx, { description: e.target.value })}
                          placeholder="Describe what you built, engineering challenges tackled, and quantifiable business impact."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Education */}
            <TabsContent value="education" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Education & Degrees</h3>
                  <p className="text-xs text-muted-foreground">
                    Add universities, colleges, degrees, diplomas, and honors.
                  </p>
                </div>
                <Button type="button" variant="block" size="sm" onClick={addEducation}>
                  <Plus className="mr-1.5 size-4" /> Add Education
                </Button>
              </div>

              {!content.education || content.education.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-ink/30 p-8 text-center">
                  <GraduationCap className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-semibold">No education entries added yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addEducation}
                    className="mt-3 border-ink"
                  >
                    <Plus className="mr-1.5 size-3.5" /> Add First Degree
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {content.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-lg border-2 border-ink bg-muted/20 p-4 transition-all hover:bg-muted/30"
                    >
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="absolute right-3 top-3 rounded p-1 text-muted-foreground hover:bg-destructive hover:text-white"
                        title="Remove education"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1 sm:col-span-1">
                          <Label className="text-xs font-bold">Degree / Program *</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(idx, { degree: e.target.value })}
                            placeholder="e.g. B.Tech in Computer Science"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-1">
                          <Label className="text-xs font-bold">Institution / University *</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(idx, { institution: e.target.value })}
                            placeholder="e.g. Jeppiaar Engineering College"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-1">
                          <Label className="text-xs font-bold">Years / Graduation *</Label>
                          <Input
                            value={edu.period}
                            onChange={(e) => updateEducation(idx, { period: e.target.value })}
                            placeholder="e.g. 2021 — 2025"
                          />
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <Label className="text-xs font-bold">
                          Honors, Coursework, or Thesis (Optional)
                        </Label>
                        <Input
                          value={edu.description || ""}
                          onChange={(e) => updateEducation(idx, { description: e.target.value })}
                          placeholder="e.g. First Class with Distinction, Algorithms & Distributed Computing"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab 4: Skills & Tech Stack */}
            <TabsContent value="skills" className="mt-6 space-y-5">
              <div>
                <Label className="mb-2 block font-bold">Skills & Technologies</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Type skill and press Enter (e.g. Python, Docker, PostgreSQL)"
                  />
                  <Button type="button" variant="block" onClick={() => addSkill()}>
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Quick skill suggestions */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Quick Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Python",
                    "Java",
                    "DSA",
                    "TypeScript",
                    "React",
                    "Next.js",
                    "Node.js",
                    "Docker",
                    "PostgreSQL",
                    "AWS",
                    "TailwindCSS",
                    "GraphQL",
                    "PyTorch",
                    "Git",
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      disabled={content.skills.includes(s)}
                      className="rounded border border-ink/30 bg-card px-2.5 py-1 text-xs font-semibold hover:border-ink hover:bg-accent disabled:opacity-40"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Skills list */}
              <div className="rounded-lg border-2 border-ink bg-muted/20 p-4">
                <Label className="mb-2 block text-xs font-bold text-muted-foreground">
                  Active Skills ({content.skills.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {content.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-card px-3 py-1 text-xs font-bold shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tab 5: Projects */}
            <TabsContent value="projects" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Featured Projects</h3>
                  <p className="text-xs text-muted-foreground">
                    Showcase standout applications, libraries, and tools.
                  </p>
                </div>
                <Button type="button" variant="block" size="sm" onClick={addProject}>
                  <Plus className="mr-1.5 size-4" /> Add Project
                </Button>
              </div>

              <div className="space-y-4">
                {content.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-lg border-2 border-ink bg-muted/20 p-4 transition-all hover:bg-muted/30"
                  >
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="absolute right-3 top-3 rounded p-1 text-muted-foreground hover:bg-destructive hover:text-white"
                      title="Remove project"
                    >
                      <Trash2 className="size-4" />
                    </button>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Project Title *</Label>
                        <Input
                          value={proj.title}
                          onChange={(e) => updateProject(idx, { title: e.target.value })}
                          placeholder="e.g. Distributed Cache Engine"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Tech Stack Tags</Label>
                        <Input
                          value={
                            typeof proj.tags === "string"
                              ? proj.tags
                              : Array.isArray(proj.tags)
                                ? proj.tags.join(", ")
                                : ""
                          }
                          onChange={(e) => updateProject(idx, { tags: e.target.value })}
                          placeholder="e.g. Go · Redis · gRPC"
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <Label className="text-xs font-bold">Description & Key Features</Label>
                      <Textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => updateProject(idx, { description: e.target.value })}
                        placeholder="What problem does it solve? Architecture and achievements..."
                      />
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Live Demo URL</Label>
                        <Input
                          value={proj.url || ""}
                          onChange={(e) => updateProject(idx, { url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">GitHub Repository URL</Label>
                        <Input
                          value={proj.repo || ""}
                          onChange={(e) => updateProject(idx, { repo: e.target.value })}
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Tab 6: Theme & Layout */}
            <TabsContent value="theme" className="mt-6 space-y-6">
              <div>
                <Label className="mb-3 block font-bold">Template & Aesthetic</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {TEMPLATE_ORDER.map((tid) => {
                    const tmpl = TEMPLATES[tid];
                    const isSelected = theme.template === tid;
                    return (
                      <button
                        key={tid}
                        type="button"
                        onClick={() => {
                          setTheme(structuredClone(tmpl.theme));
                          toast.success(`Theme switched to ${tmpl.label}`);
                        }}
                        className={`rounded-xl border-2 p-3 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-[3px_3px_0_0_oklch(0.2_0.02_60)]"
                            : "border-border hover:border-foreground/30"
                        }`}
                      >
                        <div
                          className="h-8 w-full rounded border border-ink/20"
                          style={{
                            background: tmpl.theme.palette.bg,
                            borderColor: tmpl.theme.palette.accent,
                          }}
                        />
                        <div className="mt-2 text-xs font-bold">{tmpl.label}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">
                          {tmpl.blurb}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section Visibility */}
              <div className="border-t border-ink/20 pt-4">
                <Label className="mb-3 block font-bold">Section Arrangement & Visibility</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {sections.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => toggleSection(sec.type)}
                      className={`flex items-center justify-between rounded-lg border-2 p-2.5 text-xs font-bold transition-all ${
                        sec.visible
                          ? "border-ink bg-card text-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                          : "border-border bg-muted/40 text-muted-foreground opacity-60"
                      }`}
                    >
                      <span className="capitalize">{sec.type}</span>
                      {sec.visible ? <Check className="size-3 text-primary" /> : null}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tab 7: Mobile Live Preview */}
            <TabsContent value="preview" className="mt-6 lg:hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">
                    Live updates as you edit fields
                  </span>
                </div>
                <LivePortfolioPreview
                  content={content}
                  theme={theme}
                  sections={sections}
                  onThemeChange={setTheme}
                  height="h-[560px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Footer */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink pt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadHtml}
              className="border-ink font-semibold"
            >
              <Download className="mr-1.5 size-4" /> Download HTML
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="block"
                onClick={handleGenerateSubmit}
                disabled={busy || !content.name.trim()}
                className="font-display font-bold text-base"
              >
                {busy ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" /> Generate Structured Portfolio{" "}
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Interactive Portfolio Preview */}
      <div className="hidden w-full max-w-lg flex-col lg:flex xl:max-w-xl">
        <div className="sticky top-6">
          <LivePortfolioPreview
            content={content}
            theme={theme}
            sections={sections}
            onThemeChange={setTheme}
            height="h-[640px]"
          />
        </div>
      </div>

      {/* Resume Import Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="block-card w-full max-w-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-black">Auto-fill from Resume</h3>
              <button
                type="button"
                onClick={() => setShowResumeModal(false)}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload a PDF resume or paste raw text. The parser will extract your name, headline,
              bio, experience, and skills.
            </p>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Upload PDF / Word Resume</Label>
                <input
                  type="file"
                  ref={resumeFileRef}
                  accept=".pdf,.txt,.md"
                  className="w-full text-xs"
                  onChange={(e) => handleResumeFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="relative text-center text-xs uppercase tracking-widest text-muted-foreground">
                <span>or paste raw resume text</span>
              </div>

              <Textarea
                rows={6}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste work experience, education, skills, and summary here..."
                className="text-xs font-mono"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowResumeModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="block"
                  size="sm"
                  disabled={busy || !resumeText.trim()}
                  onClick={() => handleParseResume(resumeText)}
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : "Parse & Auto-fill"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
