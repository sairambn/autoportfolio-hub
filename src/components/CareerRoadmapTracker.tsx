import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  BookOpen,
  Briefcase,
  Layers,
  Download,
  AlertCircle,
  HelpCircle,
  Building2,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  INITIAL_ROADMAP_DATA,
  INITIAL_APPLICATION_PIPELINE,
  createProductCompanyRoadmapSheet,
  appendApplicationToSheet,
  type RoadmapDepartmentItem,
  type ApplicationTrackerRow,
} from "@/lib/google-sheets";
import {
  auth,
  db,
  getCachedGoogleAccessToken,
  setCachedGoogleAccessToken,
  signInWithGoogleWorkspace,
} from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";

interface CareerRoadmapTrackerProps {
  userName?: string;
  userEmail?: string;
}

export function CareerRoadmapTracker({
  userName = "bnsairam",
  userEmail = "bnsairam14@gmail.com",
}: CareerRoadmapTrackerProps) {
  const [selectedYear, setSelectedYear] = useState<number | "all">(1);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [roadmapItems, setRoadmapItems] = useState<RoadmapDepartmentItem[]>(() => {
    const saved = localStorage.getItem("folio_career_roadmap_items");
    return saved ? JSON.parse(saved) : INITIAL_ROADMAP_DATA;
  });
  const [applications, setApplications] = useState<ApplicationTrackerRow[]>(() => {
    const saved = localStorage.getItem("folio_career_applications");
    return saved ? JSON.parse(saved) : INITIAL_APPLICATION_PIPELINE;
  });

  // Google Sheet integration state
  const [sheetId, setSheetId] = useState<string | null>(() =>
    localStorage.getItem("folio_career_sheet_id"),
  );
  const [sheetUrl, setSheetUrl] = useState<string | null>(() =>
    localStorage.getItem("folio_career_sheet_url"),
  );
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddAppModal, setShowAddAppModal] = useState(false);

  // New Application Form State
  const [newApp, setNewApp] = useState<ApplicationTrackerRow>({
    company: "",
    role: "Software Engineer (New Grad)",
    tier: "Tier 1 (FAANG/Google)",
    jobUrl: "",
    appliedDate: new Date().toISOString().split("T")[0],
    referralContact: "",
    status: "Applied",
    notes: "",
  });

  // Sync with Firestore on mount if authenticated
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const trackerDoc = doc(db, "users", user.uid, "career_trackers", "primary");
      getDoc(trackerDoc)
        .then((snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data.sheetId) {
              setSheetId(data.sheetId);
              localStorage.setItem("folio_career_sheet_id", data.sheetId);
            }
            if (data.sheetUrl) {
              setSheetUrl(data.sheetUrl);
              localStorage.setItem("folio_career_sheet_url", data.sheetUrl);
            }
            if (data.items) {
              setRoadmapItems(data.items);
            }
          }
        })
        .catch((err) => {
          console.warn("Could not read tracker from Firestore:", err);
        });
    }
  }, []);

  // Save changes locally
  const saveItems = (updated: RoadmapDepartmentItem[]) => {
    setRoadmapItems(updated);
    localStorage.setItem("folio_career_roadmap_items", JSON.stringify(updated));

    const user = auth.currentUser;
    if (user) {
      const trackerDoc = doc(db, "users", user.uid, "career_trackers", "primary");
      setDoc(
        trackerDoc,
        { items: updated, updatedAt: new Date().toISOString() },
        { merge: true },
      ).catch(() => {});
    }
  };

  const handleStatusChange = (id: string, newStatus: RoadmapDepartmentItem["status"]) => {
    const updated = roadmapItems.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item,
    );
    saveItems(updated);
    toast.success("Progress updated!");
  };

  // Google Sheet Creation Handler (Confirmed by user via modal)
  const executeCreateGoogleSheet = async () => {
    setShowConfirmModal(false);
    setIsCreatingSheet(true);

    try {
      let token = getCachedGoogleAccessToken();

      // If token not in memory, request user login via Google Workspace scope popup
      if (!token) {
        toast.info("Connecting with Google to create your roadmap spreadsheet...");
        const result = await signInWithGoogleWorkspace();
        token = result.accessToken;
        setCachedGoogleAccessToken(token);
      }

      if (!token) {
        throw new Error("Unable to obtain Google Sheets authorization token.");
      }

      toast.loading("Generating your year-wise Google Sheet tracker...", { id: "sheet-gen" });

      const { spreadsheetId, spreadsheetUrl } = await createProductCompanyRoadmapSheet(token, {
        name: userName,
        email: userEmail,
        targetRole: "Software Engineer (L3/New Grad) @ Google & Tier 1 Product Companies",
      });

      setSheetId(spreadsheetId);
      setSheetUrl(spreadsheetUrl);
      localStorage.setItem("folio_career_sheet_id", spreadsheetId);
      localStorage.setItem("folio_career_sheet_url", spreadsheetUrl);

      // Save to Firestore under user's career tracker
      const user = auth.currentUser;
      if (user) {
        const trackerDoc = doc(db, "users", user.uid, "career_trackers", "primary");
        await setDoc(
          trackerDoc,
          {
            sheetId: spreadsheetId,
            sheetUrl: spreadsheetUrl,
            candidateName: userName,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          { merge: true },
        );
      }

      toast.success("Google Sheet successfully created and formatted!", { id: "sheet-gen" });
    } catch (err: unknown) {
      console.error("Sheet creation failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to create Google Sheet";
      toast.error(msg, { id: "sheet-gen" });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApp.company.trim()) {
      toast.error("Please enter a company name.");
      return;
    }

    const updated = [newApp, ...applications];
    setApplications(updated);
    localStorage.setItem("folio_career_applications", JSON.stringify(updated));

    // If Google Sheet exists, also append it to the sheet
    const token = getCachedGoogleAccessToken();
    if (token && sheetId) {
      try {
        await appendApplicationToSheet(token, sheetId, newApp);
        toast.success(`Application saved & synced to Google Sheet for ${newApp.company}!`);
      } catch (sheetErr) {
        console.warn("Could not sync application to sheet:", sheetErr);
        toast.success(`Application saved locally for ${newApp.company}!`);
      }
    } else {
      toast.success(`Application saved for ${newApp.company}!`);
    }

    setShowAddAppModal(false);
    setNewApp({
      company: "",
      role: "Software Engineer",
      tier: "Tier 1 (FAANG/Google)",
      jobUrl: "",
      appliedDate: new Date().toISOString().split("T")[0],
      referralContact: "",
      status: "Applied",
      notes: "",
    });
  };

  // CSV Export utility
  const handleDownloadCsv = () => {
    const headers = [
      "Year",
      "Department",
      "Topic",
      "Milestone Goal",
      "Recommended Problems/Tasks",
      "Priority",
      "Status",
      "Resource Link",
    ];
    const rows = roadmapItems.map((i) => [
      `Year ${i.year}`,
      `"${i.department.replace(/"/g, '""')}"`,
      `"${i.topic.replace(/"/g, '""')}"`,
      `"${i.goalOrMilestone.replace(/"/g, '""')}"`,
      `"${i.recommendedProblemsOrTasks.replace(/"/g, '""')}"`,
      i.priority,
      i.status,
      i.resourceLink,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Google_Career_Roadmap_${userName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Roadmap exported as CSV!");
  };

  // Calculate high-level progress stats
  const totalItems = roadmapItems.length;
  const masteredItems = roadmapItems.filter((i) => i.status === "Mastered").length;
  const inProgressItems = roadmapItems.filter((i) => i.status === "In Progress").length;
  const completionPercentage = Math.round((masteredItems / (totalItems || 1)) * 100);

  const departments = [
    "all",
    "Data Structures & Algorithms",
    "Core Computer Science",
    "Product Engineering",
    "System Design",
    "Career & Interview Preparation",
    "Competitive & Open Source",
  ];

  const filteredItems = roadmapItems.filter((item) => {
    const matchesYear = selectedYear === "all" || item.year === selectedYear;
    const matchesDept = selectedDepartment === "all" || item.department === selectedDepartment;
    return matchesYear && matchesDept;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Target: Google & Tier-1 Product Companies
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Year-Wise Engineering Career Tracker
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Structured preparation across 4 college years and 6 critical departments: DSA, Core
              Computer Science (OS, DBMS, CN), System Design (LLD/HLD), Production Projects, and
              Interview Pipelines.
            </p>
          </div>

          {/* Action CTAs: Google Sheet Sync & CSV */}
          <div className="flex flex-wrap items-center gap-3">
            {sheetUrl ? (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Open Live Google Sheet
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </a>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isCreatingSheet}
                className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all"
              >
                {isCreatingSheet ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating Google Sheet...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    Create Google Sheet Tracker
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-background/80 hover:bg-accent px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors"
              title="Download offline CSV backup"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border/60 pt-6">
          <div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
            <div className="text-xs font-medium text-muted-foreground">Overall Readiness</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{completionPercentage}%</span>
              <span className="text-xs text-emerald-600 font-medium">
                {completionPercentage >= 70 ? "Ready for Google" : "In Progress"}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
            <div className="text-xs font-medium text-muted-foreground">Topics Mastered</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-600">{masteredItems}</span>
              <span className="text-xs text-muted-foreground">/ {totalItems} total</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Core milestones complete
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
            <div className="text-xs font-medium text-muted-foreground">In Progress</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-amber-500">{inProgressItems}</span>
              <span className="text-xs text-muted-foreground">topics active</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              Active practice
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
            <div className="text-xs font-medium text-muted-foreground">Companies Tracked</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground">{applications.length}</span>
              <span className="text-xs text-muted-foreground">targets</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3 text-primary" />
              Google, Meta, Uber & more
            </div>
          </div>
        </div>
      </div>

      {/* Year Selector Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none rounded-xl border border-border bg-muted/40 p-1.5 w-full sm:w-auto">
            {[1, 2, 3, 4].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`inline-flex items-center gap-1.5 shrink-0 rounded-lg px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedYear === year
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Year {year}</span>
                <span className="hidden md:inline">
                  {year === 1 && " (Foundations)"}
                  {year === 2 && " (Intermediate & Dev)"}
                  {year === 3 && " (Advanced Algo)"}
                  {year === 4 && " (System Design)"}
                </span>
              </button>
            ))}
            <button
              onClick={() => setSelectedYear("all")}
              className={`rounded-lg px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                selectedYear === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All 4 Years
            </button>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Department:
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Departments</option>
              {departments
                .filter((d) => d !== "all")
                .map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Roadmap Items List */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="divide-y divide-border">
            {filteredItems.map((item) => {
              const isMastered = item.status === "Mastered";
              const isInProgress = item.status === "In Progress";

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        Year {item.year}
                      </span>
                      <span className="rounded-md border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {item.department}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.priority === "Crucial"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : item.priority === "High"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                      {item.topic}
                    </h4>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground/90 font-medium">Milestone:</strong>{" "}
                      {item.goalOrMilestone}
                    </p>

                    <div className="text-xs text-muted-foreground">
                      <strong className="text-foreground/90 font-medium">Target Tasks:</strong>{" "}
                      {item.recommendedProblemsOrTasks}
                    </div>

                    {item.resourceLink && (
                      <div className="pt-1">
                        <a
                          href={item.resourceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        >
                          <BookOpen className="h-3 w-3" />
                          View Recommended Resource
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    <button
                      onClick={() =>
                        handleStatusChange(
                          item.id,
                          isMastered ? "In Progress" : isInProgress ? "Not Started" : "Mastered",
                        )
                      }
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        isMastered
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : isInProgress
                            ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : "border-border bg-muted/30 text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {isMastered ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Mastered
                        </>
                      ) : isInProgress ? (
                        <>
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          In Progress
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5" />
                          Not Started
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No items match the selected department filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target Companies & Application Pipeline Section */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Target Company & Interview Application Pipeline
            </h3>
            <p className="text-xs text-muted-foreground">
              Track referrals, online assessments, technical rounds, and offer decisions for Google
              and target tech companies.
            </p>
          </div>

          <button
            onClick={() => setShowAddAppModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors self-start sm:self-center"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Target Company
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="p-3">Company</th>
                <th className="p-3">Role</th>
                <th className="p-3">Tier</th>
                <th className="p-3">Status</th>
                <th className="p-3">Referral Contact</th>
                <th className="p-3">Notes & Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.map((app, index) => (
                <tr key={index} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {app.company}
                  </td>
                  <td className="p-3 text-muted-foreground">{app.role}</td>
                  <td className="p-3">
                    <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                      {app.tier}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        app.status === "Offer"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : app.status.startsWith("Tech") || app.status.startsWith("OA")
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{app.referralContact || "None"}</td>
                  <td className="p-3 text-muted-foreground max-w-xs truncate" title={app.notes}>
                    {app.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory User Confirmation Modal for Mutating Google Workspace Data */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Create Google Sheet Career Tracker?
                </h3>
                <p className="text-xs text-muted-foreground">Permission confirmation</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This will create a new Google Spreadsheet titled{" "}
              <strong className="text-foreground">
                &ldquo;Google &amp; Product Company Career Tracker — {userName}&rdquo;
              </strong>{" "}
              directly in your Google Drive, populated with:
            </p>

            <ul className="space-y-1.5 text-xs text-muted-foreground pl-4 list-disc">
              <li>
                <strong className="text-foreground">
                  Executive Summary &amp; Readiness Dashboard
                </strong>{" "}
                with automated formulas
              </li>
              <li>
                <strong className="text-foreground">4 Year-by-Year tabs</strong> covering DSA, OS,
                DBMS, Networks, and LLD/HLD
              </li>
              <li>
                <strong className="text-foreground">Application Pipeline</strong> tracking Google
                and Tier-1 interviews
              </li>
              <li>
                <strong className="text-foreground">Curated high-yield learning resources</strong>{" "}
                and books
              </li>
            </ul>

            <div className="rounded-xl border border-border/80 bg-muted/40 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Your data is stored directly in your own Google account. No other files will be
                modified or deleted.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeCreateGoogleSheet}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Confirm &amp; Create Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Application */}
      {showAddAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Add Target Company Application
              </h3>
              <button
                onClick={() => setShowAddAppModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddApplication} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Meta, Uber"
                    value={newApp.company}
                    onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Role</label>
                  <input
                    type="text"
                    placeholder="e.g. SWE L3, SDE Intern"
                    value={newApp.role}
                    onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Company Tier</label>
                  <select
                    value={newApp.tier}
                    onChange={(e) =>
                      setNewApp({
                        ...newApp,
                        tier: e.target.value as ApplicationTrackerRow["tier"],
                      })
                    }
                    className="w-full rounded-lg border border-input bg-background p-2 text-foreground focus:ring-1 focus:ring-primary"
                  >
                    <option value="Tier 1 (FAANG/Google)">Tier 1 (FAANG/Google)</option>
                    <option value="Tier 1.5 (Uber/Stripe/Atlassian)">
                      Tier 1.5 (Uber/Stripe/Atlassian)
                    </option>
                    <option value="Product Unicorn">Product Unicorn</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Current Status</label>
                  <select
                    value={newApp.status}
                    onChange={(e) =>
                      setNewApp({
                        ...newApp,
                        status: e.target.value as ApplicationTrackerRow["status"],
                      })
                    }
                    className="w-full rounded-lg border border-input bg-background p-2 text-foreground focus:ring-1 focus:ring-primary"
                  >
                    <option value="Wishlist">Wishlist</option>
                    <option value="Applied">Applied</option>
                    <option value="OA Round">Online Assessment (OA)</option>
                    <option value="Tech Round 1">Technical Round 1</option>
                    <option value="Tech Round 2">Technical Round 2</option>
                    <option value="System Design">System Design</option>
                    <option value="Behavioral">Behavioral / Googliness</option>
                    <option value="Offer">Offer Received 🎉</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">
                  Referral Contact or Network Connection
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe (Senior SWE at Google) or Recruiter name"
                  value={newApp.referralContact}
                  onChange={(e) => setNewApp({ ...newApp, referralContact: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-foreground focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Key Focus &amp; Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Focus on Graphs, DP, and Googliness leadership principles."
                  value={newApp.notes}
                  onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-foreground focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAppModal(false)}
                  className="rounded-xl border border-input px-4 py-2 font-semibold text-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
