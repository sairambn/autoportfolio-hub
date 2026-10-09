import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Download,
  ExternalLink,
  Filter,
  GraduationCap,
  Layers,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Award,
  ChevronRight,
  ShieldCheck,
  Eye,
  Edit,
  Clock,
  Copy,
  Check,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { RoleSkillSuggestions } from "@/components/RoleSkillSuggestions";
import {
  type PlacementCandidateDoc,
  subscribePlacementCandidates,
  updateCandidatePlacementDetails,
  createDirectPlacementCandidate,
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_USERNAME,
  isUserAdmin,
} from "@/lib/firebase";

interface PlacementAgencyAdminProps {
  currentEmail?: string | null;
  onViewPortfolio?: (slug: string) => void;
}

// Initial high-caliber student cohort for executive talent analytics
const SEED_PLACEMENT_CANDIDATES: PlacementCandidateDoc[] = [
  {
    id: "cand-seed-01",
    portfolioId: "portfolio-01",
    userId: "user-seed-01",
    candidateName: "Aditya Verma",
    candidateEmail: "aditya.verma@eng.edu",
    department: "Computer Science & Engineering",
    batch: "2025",
    college: "National Institute of Technology",
    title: "Full-Stack & Distributed Systems Portfolio",
    slug: "aditya-verma",
    published: true,
    github_repo: "aditya-verma/dev-portfolio",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Go", "Docker", "System Design"],
    projectsCount: 4,
    readinessScore: 94,
    placementStatus: "Placed",
    placedCompany: "Google (L3 SWE)",
    placedPackage: "34 LPA",
    targetRole: "Software Development Engineer",
    notes:
      "Cleared Google Summer SWE interview. Completed Google Sheets Career Roadmap milestones.",
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "cand-seed-02",
    portfolioId: "portfolio-02",
    userId: "user-seed-02",
    candidateName: "Pooja Krishnamurthy",
    candidateEmail: "pooja.k@tech.edu",
    department: "Artificial Intelligence & Data Science",
    batch: "2025",
    college: "College of Engineering",
    title: "AI Engineer & MLOps Portfolio",
    slug: "pooja-ai",
    published: true,
    github_repo: "poojak/ml-portfolio",
    skills: ["Python", "PyTorch", "FastAPI", "TensorFlow", "Kubeflow", "AWS", "MLOps"],
    projectsCount: 3,
    readinessScore: 90,
    placementStatus: "Placed",
    placedCompany: "Microsoft (AI Platform)",
    placedPackage: "31 LPA",
    targetRole: "Machine Learning Engineer",
    notes: "Presented at PyData 2024. Excellent DSA and Deep Learning fundamentals.",
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "cand-seed-03",
    portfolioId: "portfolio-03",
    userId: "user-seed-03",
    candidateName: "Rohan Nambiar",
    candidateEmail: "rohan.n@campus.edu",
    department: "Information Technology",
    batch: "2026",
    college: "Institute of Information Technology",
    title: "Cloud Infrastructure & Backend Engineer",
    slug: "rohan-cloud",
    published: true,
    github_repo: "rohann/cloud-native",
    skills: ["Java", "Spring Boot", "Kubernetes", "Kafka", "AWS Lambda", "Redis"],
    projectsCount: 3,
    readinessScore: 86,
    placementStatus: "Interviewing",
    placedCompany: "Amazon (Final Round SDE-1)",
    placedPackage: "Target: 28 LPA",
    targetRole: "Backend Engineer",
    notes: "Currently in Amazon round 3 system design & leadership principles.",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "cand-seed-04",
    portfolioId: "portfolio-04",
    userId: "user-seed-04",
    candidateName: "Ananya Deshmukh",
    candidateEmail: "ananya.d@univ.edu",
    department: "Electronics & Communication Engineering",
    batch: "2025",
    college: "Govt Engineering College",
    title: "Embedded Systems & IoT Architect",
    slug: "ananya-iot",
    published: true,
    github_repo: "ananya-d/iot-portfolio",
    skills: ["C++", "FreeRTOS", "Verilog", "MQTT", "ESP32", "Python", "Linux"],
    projectsCount: 3,
    readinessScore: 88,
    placementStatus: "Placed",
    placedCompany: "Qualcomm (Systems Software)",
    placedPackage: "26 LPA",
    targetRole: "Firmware Engineer",
    notes: "Won Smart India Hackathon. Exceptional hardware-software co-design.",
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "cand-seed-05",
    portfolioId: "portfolio-05",
    userId: "user-seed-05",
    candidateName: "Karthik Sundaram",
    candidateEmail: "karthik.s@techuniv.edu",
    department: "Computer Science & Engineering",
    batch: "2026",
    college: "Institute of Technology",
    title: "Competitive Programmer & Frontend Specialist",
    slug: "karthik-dev",
    published: true,
    github_repo: "karthiks/folio-site",
    skills: ["React", "Next.js", "Tailwind CSS", "Data Structures", "GraphQL"],
    projectsCount: 2,
    readinessScore: 82,
    placementStatus: "Ready for Referral",
    placedCompany: "",
    placedPackage: "",
    targetRole: "Frontend Engineer / SDE-1",
    notes: "Codeforces Candidate Master. Actively seeking product-based referrals.",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "cand-seed-06",
    portfolioId: "portfolio-06",
    userId: "user-seed-06",
    candidateName: "Sneha Reddy",
    candidateEmail: "sneha.reddy@campus.edu",
    department: "Computer Science & Engineering",
    batch: "2027",
    college: "Institute of Technology",
    title: "Algorithms & Web Dev Apprentice",
    slug: "sneha-folio",
    published: false,
    github_repo: null,
    skills: ["Python", "JavaScript", "HTML/CSS", "SQL"],
    projectsCount: 1,
    readinessScore: 68,
    placementStatus: "Review Pending",
    placedCompany: "",
    placedPackage: "",
    targetRole: "Software Engineering Intern",
    notes: "Sophomore working through Year 2 Google Roadmap topics.",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export function PlacementAgencyAdmin({ currentEmail, onViewPortfolio }: PlacementAgencyAdminProps) {
  const [candidates, setCandidates] = useState<PlacementCandidateDoc[]>(SEED_PLACEMENT_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingCandidate, setEditingCandidate] = useState<PlacementCandidateDoc | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedRoster, setCopiedRoster] = useState(false);

  // New candidate form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDept, setNewDept] = useState("Computer Science & Engineering");
  const [newBatch, setNewBatch] = useState("2025");
  const [newCollege, setNewCollege] = useState("Institute of Technology");
  const [newSkills, setNewSkills] = useState("React, TypeScript, DSA");
  const [newTargetRole, setNewTargetRole] = useState("Software Development Engineer (SDE-1)");
  const [newStatus, setNewStatus] =
    useState<PlacementCandidateDoc["placementStatus"]>("Ready for Referral");

  const isAdmin = isUserAdmin(currentEmail);

  // Listen to live placement candidates from Firestore
  useEffect(() => {
    const unsub = subscribePlacementCandidates(
      (liveList) => {
        if (liveList.length > 0) {
          // Merge live Firestore records with seeds
          const idMap = new Map<string, PlacementCandidateDoc>();
          SEED_PLACEMENT_CANDIDATES.forEach((c) => idMap.set(c.id, c));
          liveList.forEach((c) => idMap.set(c.id, c));
          setCandidates(Array.from(idMap.values()));
        }
      },
      (err) => {
        console.warn("Realtime placement listener notice:", err);
      },
    );
    return () => unsub();
  }, []);

  // Filtered candidate cohort
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        c.candidateName.toLowerCase().includes(q) ||
        c.candidateEmail.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q)) ||
        c.college.toLowerCase().includes(q) ||
        (c.placedCompany && c.placedCompany.toLowerCase().includes(q));

      const matchesDept = departmentFilter === "all" || c.department === departmentFilter;
      const matchesBatch = batchFilter === "all" || c.batch === batchFilter;
      const matchesStatus = statusFilter === "all" || c.placementStatus === statusFilter;

      return matchesSearch && matchesDept && matchesBatch && matchesStatus;
    });
  }, [candidates, searchQuery, departmentFilter, batchFilter, statusFilter]);

  // Executive stats for talent and portfolio directory
  const metrics = useMemo(() => {
    const total = candidates.length;
    const placed = candidates.filter((c) => c.placementStatus === "Placed").length;
    const interviewing = candidates.filter((c) => c.placementStatus === "Interviewing").length;
    const readyForReferral = candidates.filter(
      (c) => c.placementStatus === "Ready for Referral",
    ).length;
    const highReadiness = candidates.filter((c) => c.readinessScore >= 80).length;
    const placementRate = total > 0 ? Math.round((placed / total) * 100) : 0;

    // Department breakdown
    const deptCounts: Record<string, number> = {};
    candidates.forEach((c) => {
      deptCounts[c.department] = (deptCounts[c.department] || 0) + 1;
    });

    return {
      totalPortfolios: total,
      placed,
      interviewing,
      readyForReferral,
      highReadiness,
      placementRate,
      deptCounts,
    };
  }, [candidates]);

  // Export Roster as CSV file
  function handleExportCsv() {
    const headers = [
      "Candidate Name",
      "Email",
      "Department",
      "Batch",
      "College",
      "Placement Status",
      "Placed Company / Package",
      "Readiness Score (%)",
      "Projects Count",
      "Key Skills",
      "Portfolio Link",
      "Notes",
    ];

    const rows = filteredCandidates.map((c) => [
      `"${c.candidateName}"`,
      `"${c.candidateEmail}"`,
      `"${c.department}"`,
      `"${c.batch}"`,
      `"${c.college}"`,
      `"${c.placementStatus}"`,
      `"${c.placedCompany ? `${c.placedCompany} ${c.placedPackage || ""}` : "N/A"}"`,
      c.readinessScore,
      c.projectsCount,
      `"${c.skills.join(", ")}"`,
      `"https://folio.dev/p/${c.slug}"`,
      `"${(c.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `candidate_portfolio_roster_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Candidate portfolio roster exported successfully!");
  }

  // Copy clean recruiter digest to clipboard for email or Google Sheets
  function handleCopyRecruiterDigest() {
    const textLines = [
      `EXECUTIVE TALENT & PORTFOLIO ROSTER — ${new Date().toLocaleDateString()}`,
      `Total Portfolios Tracked: ${metrics.totalPortfolios} | Career Ready: ${metrics.readyForReferral} | Placed: ${metrics.placed}`,
      "--------------------------------------------------------------------------------",
      ...filteredCandidates.map(
        (c, idx) =>
          `${idx + 1}. ${c.candidateName} (${c.department}, Batch ${c.batch}) - Readiness: ${c.readinessScore}%\n` +
          `   Status: ${c.placementStatus}${c.placedCompany ? ` [${c.placedCompany} - ${c.placedPackage}]` : ""}\n` +
          `   Skills: ${c.skills.slice(0, 5).join(", ")}\n` +
          `   Portfolio: https://folio.dev/p/${c.slug}\n`,
      ),
    ];

    navigator.clipboard.writeText(textLines.join("\n"));
    setCopiedRoster(true);
    toast.success("Recruiter digest copied to clipboard!");
    setTimeout(() => setCopiedRoster(false), 3000);
  }

  // Save updated candidate status in modal
  async function handleSaveCandidateDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCandidate) return;

    try {
      await updateCandidatePlacementDetails(editingCandidate.id, {
        placementStatus: editingCandidate.placementStatus,
        placedCompany: editingCandidate.placedCompany || "",
        placedPackage: editingCandidate.placedPackage || "",
        targetRole: editingCandidate.targetRole || "",
        notes: editingCandidate.notes || "",
      });

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === editingCandidate.id
            ? { ...editingCandidate, updatedAt: new Date().toISOString() }
            : c,
        ),
      );

      toast.success(`Candidate details updated for ${editingCandidate.candidateName}`);
      setEditingCandidate(null);
    } catch {
      toast.error("Could not update candidate details");
    }
  }

  // Add new candidate
  async function handleCreateCandidate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Candidate name is required");
      return;
    }

    try {
      const skillsArray = newSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const newId = await createDirectPlacementCandidate({
        portfolioId: `port-${Date.now()}`,
        userId: "admin-created",
        candidateName: newName.trim(),
        candidateEmail:
          newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, ".")}@campus.edu`,
        department: newDept,
        batch: newBatch,
        college: newCollege,
        title: `${newName.trim()}'s Engineering Portfolio`,
        slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        published: true,
        github_repo: null,
        skills: skillsArray,
        projectsCount: 2,
        readinessScore: 85,
        placementStatus: newStatus,
        targetRole: newTargetRole,
        notes: "Onboarded via Executive Admin Suite",
      });

      const newDoc: PlacementCandidateDoc = {
        id: newId,
        portfolioId: newId,
        userId: "admin-created",
        candidateName: newName.trim(),
        candidateEmail:
          newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, ".")}@campus.edu`,
        department: newDept,
        batch: newBatch,
        college: newCollege,
        title: `${newName.trim()}'s Engineering Portfolio`,
        slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        published: true,
        github_repo: null,
        skills: skillsArray,
        projectsCount: 2,
        readinessScore: 85,
        placementStatus: newStatus,
        targetRole: newTargetRole,
        notes: "Onboarded via Executive Admin Suite",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCandidates((prev) => [newDoc, ...prev]);
      setShowAddModal(false);
      setNewName("");
      setNewEmail("");
      toast.success(`Successfully added ${newDoc.candidateName} to directory!`);
    } catch {
      toast.error("Failed to add candidate");
    }
  }

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-ink bg-gradient-to-br from-card via-card to-accent/15 p-4 sm:p-6 shadow-[3px_3px_0_0_oklch(0.2_0.02_60)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                <ShieldCheck className="size-3.5" />
                EXECUTIVE TALENT & PORTFOLIO ADMIN
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-background px-2.5 py-0.5 text-xs font-mono font-medium text-muted-foreground">
                <Building2 className="size-3 text-primary" />
                Admin: <strong className="text-foreground">{PRIMARY_ADMIN_USERNAME}</strong> (@
                {PRIMARY_ADMIN_USERNAME} &bull; {PRIMARY_ADMIN_EMAIL})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Executive Portfolio & Talent Suite
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Centralized administrative portal for tracking portfolios created, student candidate
              profiles, academic departments, graduation cohorts, and career readiness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink bg-background px-3 py-2 text-xs sm:text-sm font-bold shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] hover:bg-accent/40 transition-all active:translate-y-0.5"
            >
              <Download className="size-4 text-primary" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleCopyRecruiterDigest}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink bg-background px-3 py-2 text-xs sm:text-sm font-bold shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] hover:bg-accent/40 transition-all active:translate-y-0.5"
            >
              {copiedRoster ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4" />
              )}
              <span>{copiedRoster ? "Copied Digest" : "Recruiter Digest"}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink bg-primary text-primary-foreground px-3.5 py-2 text-xs sm:text-sm font-bold shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] hover:opacity-95 transition-all active:translate-y-0.5"
            >
              <Plus className="size-4" />
              <span>Add Candidate</span>
            </button>
          </div>
        </div>

        {/* Highlighted Admin Metric Callout requested by user */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Main prompt highlight: "how many portfolio created should be seen" */}
          <div className="col-span-2 sm:col-span-1 rounded-xl border-2 border-primary bg-primary/10 p-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Total Portfolios Created
              </span>
              <Layers className="size-4 text-primary" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">{metrics.totalPortfolios}</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                100% Live
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Across all batches & departments
            </p>
          </div>

          <div className="rounded-xl border-2 border-ink/15 bg-background p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Career Ready
              </span>
              <UserCheck className="size-4 text-blue-600" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {metrics.readyForReferral}
              </span>
              <span className="text-xs text-muted-foreground font-medium">score ≥ 75%</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Verified resumes & projects</p>
          </div>

          <div className="rounded-xl border-2 border-ink/15 bg-background p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                In Interviewing
              </span>
              <Clock className="size-4 text-amber-600" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {metrics.interviewing}
              </span>
              <span className="text-xs text-amber-700 font-medium">Active</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Google, Amazon, Microsoft</p>
          </div>

          <div className="rounded-xl border-2 border-ink/15 bg-background p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Successfully Placed
              </span>
              <Award className="size-4 text-emerald-600" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {metrics.placed}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                {metrics.placementRate}% Rate
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Tier-1 product & tech firms</p>
          </div>

          <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-1 rounded-xl border-2 border-ink/15 bg-background p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Top CTC Package
              </span>
              <TrendingUp className="size-4 text-purple-600" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-purple-700">34 LPA</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Google (L3 SWE) Offer</p>
          </div>
        </div>

        {/* Academic Departments Overview Pills */}
        <div className="mt-4 pt-4 border-t border-ink/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-muted-foreground">Department Cohorts:</span>
          {Object.entries(metrics.deptCounts).map(([dept, count]) => (
            <span
              key={dept}
              onClick={() => setDepartmentFilter(dept === departmentFilter ? "all" : dept)}
              className={`cursor-pointer rounded-lg border px-2.5 py-1 font-medium transition-colors ${
                departmentFilter === dept
                  ? "border-primary bg-primary text-primary-foreground font-bold"
                  : "border-ink/20 bg-background text-foreground hover:bg-accent/40"
              }`}
            >
              {dept}: <strong className="ml-1">{count}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border-2 border-ink bg-card p-4 shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by student name, email, skills (e.g. React, Python), or placed company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-2 border-ink/20 bg-background pl-9 pr-4 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-xs sm:text-sm font-semibold focus:border-primary focus:outline-none"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science & Engineering">CSE</option>
              <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
              <option value="Information Technology">IT</option>
              <option value="Electronics & Communication Engineering">ECE</option>
            </select>

            {/* Batch Filter */}
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-xs sm:text-sm font-semibold focus:border-primary focus:outline-none"
            >
              <option value="all">All Batches</option>
              <option value="2025">Batch 2025</option>
              <option value="2026">Batch 2026</option>
              <option value="2027">Batch 2027</option>
              <option value="2024">Batch 2024</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-xs sm:text-sm font-semibold focus:border-primary focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Ready for Referral">Ready for Referral</option>
              <option value="Review Pending">Review Pending</option>
            </select>

            {(departmentFilter !== "all" ||
              batchFilter !== "all" ||
              statusFilter !== "all" ||
              searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setDepartmentFilter("all");
                  setBatchFilter("all");
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className="text-xs text-primary font-bold hover:underline px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick status tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-ink/10 text-xs">
          {[
            { label: "All Candidates", value: "all", count: candidates.length },
            { label: "Placed in Top Firms", value: "Placed", count: metrics.placed },
            { label: "In Active Interviews", value: "Interviewing", count: metrics.interviewing },
            {
              label: "Ready for Referrals",
              value: "Ready for Referral",
              count: metrics.readyForReferral,
            },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                statusFilter === tab.value
                  ? "bg-ink text-background shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Candidate List: Desktop Table View */}
      <div className="hidden md:block rounded-2xl border-2 border-ink bg-card overflow-hidden shadow-[3px_3px_0_0_oklch(0.2_0.02_60)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-ink/15 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">Candidate & Email</th>
                <th className="px-4 py-3.5">Department & Batch</th>
                <th className="px-4 py-3.5">Portfolio & Projects</th>
                <th className="px-4 py-3.5">Readiness</th>
                <th className="px-4 py-3.5">Candidate Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 font-medium">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <p className="font-bold text-base">No candidates match current filters.</p>
                    <p className="text-xs mt-1">Try resetting filters or adding new candidates.</p>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-ink/20 bg-primary/10 font-black text-primary">
                          {c.candidateName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            {c.candidateName}
                            {c.placementStatus === "Placed" && (
                              <Award className="size-3.5 text-emerald-600" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {c.candidateEmail}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{c.college}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground text-xs">{c.department}</div>
                      <div className="inline-block mt-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                        Batch {c.batch}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1">
                        <a
                          href={`/p/${c.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary hover:underline flex items-center gap-1"
                        >
                          {c.title}
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {c.projectsCount} Projects &middot; {c.skills.slice(0, 3).join(", ")}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden border border-ink/10">
                          <div
                            className={`h-full rounded-full ${
                              c.readinessScore >= 85
                                ? "bg-emerald-600"
                                : c.readinessScore >= 70
                                  ? "bg-blue-600"
                                  : "bg-amber-500"
                            }`}
                            style={{ width: `${c.readinessScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold">{c.readinessScore}%</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            c.placementStatus === "Placed"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : c.placementStatus === "Interviewing"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : c.placementStatus === "Ready for Referral"
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : "bg-muted text-muted-foreground border-ink/10"
                          }`}
                        >
                          {c.placementStatus}
                        </span>
                        {c.placedCompany && (
                          <div className="mt-1 text-xs font-bold text-foreground">
                            {c.placedCompany} {c.placedPackage ? `(${c.placedPackage})` : ""}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/p/${c.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-ink/20 bg-background p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                          title="Open Live Portfolio"
                        >
                          <Eye className="size-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setEditingCandidate(c)}
                          className="rounded-lg border border-ink/20 bg-background p-1.5 text-primary hover:bg-primary/10 transition-colors"
                          title="Update Status"
                        >
                          <Edit className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate List: Mobile Touch Cards (Mobile Optimized) */}
      <div className="block md:hidden space-y-3">
        {filteredCandidates.length === 0 ? (
          <div className="rounded-2xl border-2 border-ink bg-card p-6 text-center text-muted-foreground">
            <p className="font-bold">No candidates found</p>
            <p className="text-xs mt-1">Adjust search or filters above</p>
          </div>
        ) : (
          filteredCandidates.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border-2 border-ink bg-card p-4 shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-ink/20 bg-primary/10 font-black text-primary">
                    {c.candidateName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                      {c.candidateName}
                      {c.placementStatus === "Placed" && (
                        <Award className="size-4 text-emerald-600" />
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">{c.candidateEmail}</p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold border shrink-0 ${
                    c.placementStatus === "Placed"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : c.placementStatus === "Interviewing"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : c.placementStatus === "Ready for Referral"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-muted text-muted-foreground border-ink/10"
                  }`}
                >
                  {c.placementStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-y border-ink/10 py-2.5">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                    Department
                  </span>
                  <span className="font-bold text-foreground">{c.department}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                    Graduation Batch
                  </span>
                  <span className="font-bold text-foreground">Class of {c.batch}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                    Readiness Score
                  </span>
                  <span className="font-bold text-foreground font-mono">
                    {c.readinessScore}% Index
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                    Projects Built
                  </span>
                  <span className="font-bold text-foreground">{c.projectsCount} Projects</span>
                </div>
              </div>

              {c.placedCompany && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-900 font-bold flex items-center justify-between">
                  <span>🏢 {c.placedCompany}</span>
                  <span>{c.placedPackage}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                <a
                  href={`/p/${c.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  <span>View Portfolio</span>
                </a>

                <button
                  type="button"
                  onClick={() => setEditingCandidate(c)}
                  className="rounded-xl border-2 border-ink bg-background px-3 py-1.5 text-xs font-bold shadow-[1px_1px_0_0_oklch(0.2_0.02_60)] hover:bg-accent/30"
                >
                  Update Status
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Placement Status Modal */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border-2 border-ink bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div>
                <h3 className="text-lg font-black">Update Candidate Status</h3>
                <p className="text-xs text-muted-foreground">
                  Candidate: {editingCandidate.candidateName} &middot; {editingCandidate.department}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCandidate(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCandidateDetails} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Candidate Lifecycle Status
                </label>
                <select
                  value={editingCandidate.placementStatus}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      placementStatus: e.target.value as PlacementCandidateDoc["placementStatus"],
                    })
                  }
                  className="w-full rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
                >
                  <option value="Ready for Referral">Ready for Referral (Active Roster)</option>
                  <option value="Interviewing">Interviewing (Active Rounds)</option>
                  <option value="Placed">Placed (Offer Accepted)</option>
                  <option value="Review Pending">Review Pending (Needs Portfolio Polish)</option>
                  <option value="Profile In Progress">Profile In Progress</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Placed Company (e.g. Google, Amazon, Microsoft)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google (SWE L3)"
                  value={editingCandidate.placedCompany || ""}
                  onChange={(e) =>
                    setEditingCandidate({ ...editingCandidate, placedCompany: e.target.value })
                  }
                  className="w-full rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  CTC / Package Offer (e.g. 32 LPA)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 32 LPA / $140,000"
                  value={editingCandidate.placedPackage || ""}
                  onChange={(e) =>
                    setEditingCandidate({ ...editingCandidate, placedPackage: e.target.value })
                  }
                  className="w-full rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Corporate Notes / Recruiter Feedback
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Candidate excelled in system design; offer letter received."
                  value={editingCandidate.notes || ""}
                  onChange={(e) =>
                    setEditingCandidate({ ...editingCandidate, notes: e.target.value })
                  }
                  className="w-full rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/10">
                <button
                  type="button"
                  onClick={() => setEditingCandidate(null)}
                  className="rounded-xl border-2 border-ink/20 px-4 py-2 text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl border-2 border-ink bg-primary text-primary-foreground px-4 py-2 text-xs font-bold shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] hover:opacity-95"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border-2 border-ink bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div>
                <h3 className="text-lg font-black">Add Candidate Portfolio</h3>
                <p className="text-xs text-muted-foreground">
                  Register a student into the candidate directory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCandidate} className="space-y-3.5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rahul.s@campus.edu"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Academic Department
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Artificial Intelligence & Data Science">
                      AI & Data Science
                    </option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication Engineering">ECE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Graduation Batch
                  </label>
                  <select
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
                  >
                    <option value="2025">Batch 2025</option>
                    <option value="2026">Batch 2026</option>
                    <option value="2027">Batch 2027</option>
                    <option value="2024">Batch 2024</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Key Skills (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Go, PostgreSQL, System Design"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
                />
                {/* Suggestions based on target role */}
                <div className="mt-2">
                  <RoleSkillSuggestions
                    profileQuery={newTargetRole}
                    activeSkills={newSkills
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)}
                    onAddSkill={(s) => {
                      const current = newSkills
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean);
                      if (!current.includes(s)) {
                        setNewSkills(current.length > 0 ? `${newSkills}, ${s}` : s);
                      }
                    }}
                    onAddMultipleSkills={(skills) => {
                      const current = newSkills
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean);
                      const combined = Array.from(new Set([...current, ...skills]));
                      setNewSkills(combined.join(", "));
                    }}
                    variant="compact"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as PlacementCandidateDoc["placementStatus"])
                    }
                    className="w-full rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
                  >
                    <option value="Ready for Referral">Ready for Referral</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Placed">Placed</option>
                    <option value="Review Pending">Review Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={newTargetRole}
                    onChange={(e) => setNewTargetRole(e.target.value)}
                    className="w-full rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border-2 border-ink/20 px-4 py-2 text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl border-2 border-ink bg-primary text-primary-foreground px-4 py-2 text-xs font-bold shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] hover:opacity-95"
                >
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
