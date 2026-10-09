import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  Calendar,
  Check,
  ChevronRight,
  Download,
  ExternalLink,
  Filter,
  GraduationCap,
  Layers,
  PieChart,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_USERNAME,
  type PlacementCandidateDoc,
  subscribePlacementCandidates,
} from "@/lib/firebase";
import { SEED_PLATFORM_CANDIDATES } from "@/lib/candidate-seeds";

interface AdminGlobalMetricsViewProps {
  currentEmail: string;
  onSwitchToPersonalPortfolios?: () => void;
}

export function AdminGlobalMetricsView({
  currentEmail,
  onSwitchToPersonalPortfolios,
}: AdminGlobalMetricsViewProps) {
  const [candidates, setCandidates] = useState<PlacementCandidateDoc[]>(SEED_PLATFORM_CANDIDATES);
  const [loading, setLoading] = useState(true);
  const [liveSyncActive, setLiveSyncActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"summary" | "matrix" | "roster">("summary");

  // Subscribe to real-time candidate portfolios from Firestore
  useEffect(() => {
    setLoading(true);
    const unsub = subscribePlacementCandidates(
      (liveList) => {
        const idMap = new Map<string, PlacementCandidateDoc>();
        // First populate seeds
        SEED_PLATFORM_CANDIDATES.forEach((c) => idMap.set(c.id, c));
        // Overlay any live items from Firestore
        liveList.forEach((c) => idMap.set(c.id, c));
        setCandidates(Array.from(idMap.values()));
        setLiveSyncActive(true);
        setLoading(false);
      },
      (err) => {
        console.warn("Live platform portfolios listener notice:", err);
        setLiveSyncActive(false);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  // Compute all years present (using batch/cohort year and creation year)
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => {
      if (c.batch) set.add(c.batch);
      if (c.createdAt) {
        const y = new Date(c.createdAt).getFullYear().toString();
        if (y && y !== "NaN") set.add(y);
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [candidates]);

  // Compute all departments present
  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => {
      if (c.department) set.add(c.department);
    });
    return Array.from(set).sort();
  }, [candidates]);

  // Global calculations: Total Counts, Year categorization, Department categorization
  const globalMetrics = useMemo(() => {
    const totalPortfolios = candidates.length;
    const publishedCount = candidates.filter((c) => c.published || c.github_repo).length;
    const draftCount = totalPortfolios - publishedCount;

    // Categorized by Year (Batch/Cohort)
    const countByYear: Record<
      string,
      {
        total: number;
        published: number;
        drafts: number;
        placed: number;
        interviewing: number;
        ready: number;
      }
    > = {};

    // Categorized by Department
    const countByDepartment: Record<
      string,
      {
        total: number;
        published: number;
        drafts: number;
        avgReadiness: number;
        skills: Set<string>;
      }
    > = {};

    // Matrix: Department x Year
    const matrix: Record<string, Record<string, number>> = {};

    candidates.forEach((c) => {
      const year = c.batch || new Date(c.createdAt || Date.now()).getFullYear().toString();
      const dept = c.department || "General Engineering";

      // By Year
      if (!countByYear[year]) {
        countByYear[year] = {
          total: 0,
          published: 0,
          drafts: 0,
          placed: 0,
          interviewing: 0,
          ready: 0,
        };
      }
      countByYear[year].total += 1;
      if (c.published || c.github_repo) countByYear[year].published += 1;
      else countByYear[year].drafts += 1;
      if (c.placementStatus === "Placed") countByYear[year].placed += 1;
      if (c.placementStatus === "Interviewing") countByYear[year].interviewing += 1;
      if (c.placementStatus === "Ready for Referral") countByYear[year].ready += 1;

      // By Department
      if (!countByDepartment[dept]) {
        countByDepartment[dept] = {
          total: 0,
          published: 0,
          drafts: 0,
          avgReadiness: 0,
          skills: new Set(),
        };
      }
      countByDepartment[dept].total += 1;
      if (c.published || c.github_repo) countByDepartment[dept].published += 1;
      else countByDepartment[dept].drafts += 1;
      countByDepartment[dept].avgReadiness += c.readinessScore || 0;
      if (Array.isArray(c.skills)) {
        c.skills.forEach((s) => {
          if (s) countByDepartment[dept].skills.add(String(s));
        });
      }

      // Matrix
      if (!matrix[dept]) matrix[dept] = {};
      matrix[dept][year] = (matrix[dept][year] || 0) + 1;
    });

    // Average readiness per department
    Object.keys(countByDepartment).forEach((dept) => {
      const d = countByDepartment[dept];
      d.avgReadiness = d.total > 0 ? Math.round(d.avgReadiness / d.total) : 0;
    });

    return {
      totalPortfolios,
      publishedCount,
      draftCount,
      countByYear,
      countByDepartment,
      matrix,
    };
  }, [candidates]);

  // Filtered list for detailed roster search
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      let createdYear = "";
      if (c.createdAt) {
        const d = new Date(c.createdAt);
        if (!isNaN(d.getTime())) createdYear = d.getFullYear().toString();
      }

      const matchesYear =
        selectedYear === "all" || c.batch === selectedYear || createdYear === selectedYear;

      const matchesDept = selectedDept === "all" || c.department === selectedDept;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (c.candidateName || "").toLowerCase().includes(q) ||
        (c.candidateEmail || "").toLowerCase().includes(q) ||
        (c.title || "").toLowerCase().includes(q) ||
        (c.college || "").toLowerCase().includes(q) ||
        (Array.isArray(c.skills) &&
          c.skills.some((s) => typeof s === "string" && s.toLowerCase().includes(q)));

      return matchesYear && matchesDept && matchesSearch;
    });
  }, [candidates, selectedYear, selectedDept, searchQuery]);

  // Export CSV of Global Metrics breakdown
  const handleExportMetricsCsv = () => {
    const lines: string[] = [];
    lines.push(
      `"FOLIO GLOBAL PORTFOLIO METRICS REPORT","Generated for ${PRIMARY_ADMIN_EMAIL}","${new Date().toISOString()}"`,
    );
    lines.push(`"Total Platform Portfolios Created",${globalMetrics.totalPortfolios}`);
    lines.push(`"Published Portfolios",${globalMetrics.publishedCount}`);
    lines.push(`"Draft Portfolios",${globalMetrics.draftCount}`);
    lines.push("");
    lines.push(`"PORTFOLIO COUNTS CATEGORIZED BY YEAR"`);
    lines.push(`"Year / Cohort","Total Portfolios","Published","Drafts","Career Ready","Placed"`);
    Object.entries(globalMetrics.countByYear).forEach(([year, data]) => {
      lines.push(
        `"${year}",${data.total},${data.published},${data.drafts},${data.ready},${data.placed}`,
      );
    });
    lines.push("");
    lines.push(`"PORTFOLIO COUNTS CATEGORIZED BY DEPARTMENT"`);
    lines.push(`"Department","Total Portfolios","Published","Drafts","Avg Readiness Score"`);
    Object.entries(globalMetrics.countByDepartment).forEach(([dept, data]) => {
      lines.push(
        `"${dept}",${data.total},${data.published},${data.drafts},"${data.avgReadiness}%"`,
      );
    });
    lines.push("");
    lines.push(`"CROSS-DIMENSIONAL MATRIX: DEPARTMENT x YEAR"`);
    const headerRow = ["Department", ...availableYears];
    lines.push(headerRow.map((h) => `"${h}"`).join(","));
    availableDepartments.forEach((dept) => {
      const row = [
        `"${dept}"`,
        ...availableYears.map((yr) => globalMetrics.matrix[dept]?.[yr] || 0),
      ];
      lines.push(row.join(","));
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `folio_global_portfolio_metrics_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Global metrics CSV exported successfully!");
  };

  return (
    <div className="space-y-8">
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-ink bg-card p-5 sm:p-7 shadow-[4px_4px_0_0_oklch(0.2_0.02_60)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <ShieldCheck className="size-4" />
                ADMINISTRATOR GLOBAL METRICS
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-ink/20 bg-muted/60 px-2.5 py-0.5 text-xs font-mono font-semibold text-foreground">
                Account: <strong>{currentEmail}</strong> (@{PRIMARY_ADMIN_USERNAME})
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {liveSyncActive ? "Live Firestore Active" : "Local & Synced Cohort"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
              Global Platform Portfolio Analytics
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Consolidated portfolio creation counts across all registered platform users,
              categorized by academic graduation year and engineering department.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onSwitchToPersonalPortfolios && (
              <button
                type="button"
                onClick={onSwitchToPersonalPortfolios}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink/25 bg-background px-3 py-2 text-xs sm:text-sm font-bold shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] hover:bg-muted transition-all"
              >
                <Layers className="size-4 text-primary" />
                <span>My Portfolios</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleExportMetricsCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink bg-primary text-primary-foreground px-3.5 py-2 text-xs sm:text-sm font-bold shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] hover:opacity-95 transition-all"
            >
              <Download className="size-4" />
              <span>Export Metrics CSV</span>
            </button>
          </div>
        </div>

        {/* Global Summary Metric Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          {/* Card 1: Total Portfolios Created (Explicit prompt highlight) */}
          <div className="rounded-xl border-2 border-primary bg-primary/10 p-4 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Total Portfolios Created
              </span>
              <Layers className="size-4 text-primary" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-foreground">
                {globalMetrics.totalPortfolios}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                All Users
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Total created across {availableDepartments.length} departments
            </p>
          </div>

          {/* Card 2: Categorized Years */}
          <div className="rounded-xl border-2 border-ink/15 bg-background p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Year Cohorts Tracked
              </span>
              <Calendar className="size-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">{availableYears.length}</span>
              <span className="text-xs font-medium text-muted-foreground">
                {availableYears[availableYears.length - 1]} - {availableYears[0]}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Categorized by graduation batch
            </p>
          </div>

          {/* Card 3: Categorized Departments */}
          <div className="rounded-xl border-2 border-ink/15 bg-background p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Departments
              </span>
              <Building2 className="size-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">
                {availableDepartments.length}
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                Active
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">CSE, IT, AI & DS, ECE, Mech</p>
          </div>

          {/* Card 4: Published vs Drafts */}
          <div className="rounded-xl border-2 border-ink/15 bg-background p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Live Deployment Rate
              </span>
              <TrendingUp className="size-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">
                {globalMetrics.totalPortfolios > 0
                  ? Math.round((globalMetrics.publishedCount / globalMetrics.totalPortfolios) * 100)
                  : 0}
                %
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {globalMetrics.publishedCount} published
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {globalMetrics.draftCount} drafting / in review
            </p>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b-2 border-ink/15 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setViewMode("summary")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              viewMode === "summary"
                ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                : "border-2 border-ink/15 bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="size-4" />
            <span>Categorized Overview (Year & Dept)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("matrix")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              viewMode === "matrix"
                ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                : "border-2 border-ink/15 bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <PieChart className="size-4" />
            <span>Year × Department Cross Matrix</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("roster")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              viewMode === "roster"
                ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)]"
                : "border-2 border-ink/15 bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="size-4" />
            <span>Platform Portfolios Directory ({filteredCandidates.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Categorized Overview (By Year & By Department) */}
      {viewMode === "summary" && (
        <div className="space-y-8">
          {/* Section A: Portfolio Creation Counts Categorized By Year */}
          <div className="rounded-2xl border-2 border-ink bg-card p-5 sm:p-6 shadow-[3px_3px_0_0_oklch(0.2_0.02_60)]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  <Calendar className="size-5 text-primary" />
                  Portfolio Creation Counts Categorized by Year
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Distribution of student & candidate portfolios across graduation cohorts and
                  creation dates.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-muted-foreground">
                Total Years: {availableYears.length}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {availableYears.map((year) => {
                const data = globalMetrics.countByYear[year] || {
                  total: 0,
                  published: 0,
                  drafts: 0,
                  ready: 0,
                  placed: 0,
                };
                const percentage =
                  globalMetrics.totalPortfolios > 0
                    ? Math.round((data.total / globalMetrics.totalPortfolios) * 100)
                    : 0;

                return (
                  <div
                    key={year}
                    className="relative overflow-hidden rounded-xl border-2 border-ink/20 bg-background p-4 hover:border-primary/50 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-ink/20 bg-muted px-2.5 py-1 font-mono text-xs font-black text-foreground">
                        Class of {year}
                      </span>
                      <span className="font-mono text-xs font-bold text-primary">
                        {percentage}% of platform
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-foreground">{data.total}</span>
                      <span className="text-xs text-muted-foreground font-semibold">
                        portfolios created
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground border-t border-ink/10 pt-2.5 font-medium">
                      <div className="flex items-center justify-between">
                        <span>Published:</span>
                        <strong className="text-foreground">{data.published}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Drafts:</span>
                        <strong className="text-foreground">{data.drafts}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Career Ready:</span>
                        <strong className="text-blue-700">{data.ready}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Placed:</span>
                        <strong className="text-emerald-700">{data.placed}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Portfolio Creation Counts Categorized By Department */}
          <div className="rounded-2xl border-2 border-ink bg-card p-5 sm:p-6 shadow-[3px_3px_0_0_oklch(0.2_0.02_60)]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  <Building2 className="size-5 text-primary" />
                  Portfolio Creation Counts Categorized by Department
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Academic branch breakdown detailing student representation, project readiness, and
                  skill distribution.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-muted-foreground">
                Total Departments: {availableDepartments.length}
              </span>
            </div>

            <div className="space-y-4">
              {availableDepartments.map((dept) => {
                const data = globalMetrics.countByDepartment[dept] || {
                  total: 0,
                  published: 0,
                  drafts: 0,
                  avgReadiness: 0,
                  skills: new Set(),
                };
                const percentage =
                  globalMetrics.totalPortfolios > 0
                    ? Math.round((data.total / globalMetrics.totalPortfolios) * 100)
                    : 0;

                return (
                  <div
                    key={dept}
                    className="rounded-xl border-2 border-ink/15 bg-background p-4 sm:p-5 hover:border-primary/50 transition-all shadow-xs"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-foreground">
                            {dept}
                          </h3>
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                            {data.total} {data.total === 1 ? "Portfolio" : "Portfolios"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>Avg Portfolio Readiness:</span>
                          <strong className="text-foreground">{data.avgReadiness}%</strong>
                          <span>&bull;</span>
                          <span>Published:</span>
                          <strong className="text-emerald-700">{data.published}</strong>
                          <span>&bull;</span>
                          <span>Draft:</span>
                          <strong className="text-muted-foreground">{data.drafts}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-2xl font-black text-foreground">{percentage}%</span>
                          <span className="block text-[10px] text-muted-foreground uppercase font-bold">
                            Share
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress distribution */}
                    <div className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>

                    {/* Top Skills extracted from Department portfolios */}
                    {data.skills && data.skills.size > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-ink/10">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase mr-1">
                          Core Competencies:
                        </span>
                        {Array.from(data.skills)
                          .slice(0, 6)
                          .map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md border border-ink/15 bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Year x Department Cross-Matrix */}
      {viewMode === "matrix" && (
        <div className="rounded-2xl border-2 border-ink bg-card p-5 sm:p-6 shadow-[3px_3px_0_0_oklch(0.2_0.02_60)] space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-ink/15 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                <PieChart className="size-5 text-primary" />
                Cross-Dimensional Matrix: Department × Year
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Exact count of portfolios created across each academic department and graduation
                year cohort.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportMetricsCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink bg-background px-3 py-1.5 text-xs font-bold hover:bg-muted"
            >
              <Download className="size-3.5" /> Export Matrix CSV
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border-2 border-ink/15 bg-background">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/70 text-xs font-bold uppercase text-muted-foreground border-b border-ink/15">
                <tr>
                  <th className="px-4 py-3.5">Academic Department</th>
                  {availableYears.map((yr) => (
                    <th key={yr} className="px-4 py-3.5 text-center font-mono">
                      Batch {yr}
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-right font-bold text-foreground">Dept Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 font-medium">
                {availableDepartments.map((dept) => {
                  const deptTotal = globalMetrics.countByDepartment[dept]?.total || 0;
                  return (
                    <tr key={dept} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="size-4 text-primary shrink-0" />
                          <span>{dept}</span>
                        </div>
                      </td>
                      {availableYears.map((yr) => {
                        const count = globalMetrics.matrix[dept]?.[yr] || 0;
                        return (
                          <td key={yr} className="px-4 py-3 text-center">
                            {count > 0 ? (
                              <span className="inline-flex items-center justify-center rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono font-bold text-primary text-xs">
                                {count}
                              </span>
                            ) : (
                              <span className="font-mono text-muted-foreground/40 text-xs">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-right font-black font-mono text-foreground">
                        {deptTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-ink/20 bg-muted/60 font-black text-xs sm:text-sm">
                <tr>
                  <td className="px-4 py-3.5 uppercase tracking-wider text-muted-foreground">
                    Year Total (All Departments)
                  </td>
                  {availableYears.map((yr) => {
                    const yearTotal = globalMetrics.countByYear[yr]?.total || 0;
                    return (
                      <td key={yr} className="px-4 py-3.5 text-center font-mono text-foreground">
                        {yearTotal}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3.5 text-right font-mono text-primary text-base">
                    {globalMetrics.totalPortfolios}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Platform Portfolios Directory */}
      {viewMode === "roster" && (
        <div className="rounded-2xl border-2 border-ink bg-card p-5 sm:p-6 shadow-[3px_3px_0_0_oklch(0.2_0.02_60)] space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-ink/15 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                <Users className="size-5 text-primary" />
                All Platform User Portfolios
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Search and inspect individual portfolios contributing to global platform metrics.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              Showing {filteredCandidates.length} of {candidates.length} Portfolios
            </span>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search candidate, skills, college..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-2 border-ink/20 bg-background pl-9 pr-3 py-2 text-xs sm:text-sm font-medium focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground shrink-0" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-xs sm:text-sm font-semibold focus:border-primary focus:outline-none"
              >
                <option value="all">All Years (Cohorts)</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Batch {yr} ({globalMetrics.countByYear[yr]?.total || 0})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full rounded-xl border-2 border-ink/20 bg-background px-3 py-2 text-xs sm:text-sm font-semibold focus:border-primary focus:outline-none"
              >
                <option value="all">All Departments</option>
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept} ({globalMetrics.countByDepartment[dept]?.total || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="overflow-x-auto rounded-xl border-2 border-ink/15 bg-background">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/60 text-xs font-bold uppercase text-muted-foreground border-b border-ink/15">
                <tr>
                  <th className="px-4 py-3">Candidate & Profile</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3 text-center">Batch Year</th>
                  <th className="px-4 py-3">Portfolio Details</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Live Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 font-medium">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      No candidate portfolios match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-foreground text-sm">{c.candidateName}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {c.candidateEmail}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {c.college}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-md border border-ink/15 bg-card px-2 py-0.5 text-xs font-semibold">
                          {c.department}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-foreground">
                        {c.batch}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-bold text-foreground truncate max-w-[180px]">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {c.projectsCount} Projects &bull; Readiness: {c.readinessScore}%
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border ${
                            c.published
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                              : "border-ink/20 bg-muted text-muted-foreground"
                          }`}
                        >
                          {c.published ? (
                            <>
                              <Check className="size-3" /> Published
                            </>
                          ) : (
                            "Draft"
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={`/p/${c.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          View <ExternalLink className="size-3" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
