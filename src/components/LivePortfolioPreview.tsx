import { useState, useRef, useEffect } from "react";
import {
  Desktop,
  Monitor,
  Smartphone,
  Tablet,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Download,
  ExternalLink,
  Eye,
  RefreshCw,
  Palette,
  Layers,
  Check,
  Globe,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { PortfolioView } from "@/components/PortfolioView";
import { Button } from "@/components/ui/button";
import {
  TEMPLATES,
  TEMPLATE_ORDER,
  type Content,
  type Theme,
  type Section,
  type TemplateId,
} from "@/lib/portfolio";
import { renderPortfolioHtml } from "@/lib/export-html";

export interface LivePortfolioPreviewProps {
  content: Content;
  theme: Theme;
  sections?: Section[];
  repos?: Array<{
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    language: string | null;
    fork: boolean;
  }> | null;
  onThemeChange?: (newTheme: Theme) => void;
  className?: string;
  enableFullscreen?: boolean;
  enableDeviceSwitcher?: boolean;
  enableThemeSwitcher?: boolean;
  initialDevice?: "desktop" | "tablet" | "mobile";
  defaultZoom?: number;
  height?: string;
}

export function LivePortfolioPreview({
  content,
  theme,
  sections,
  repos = null,
  onThemeChange,
  className = "",
  enableFullscreen = true,
  enableDeviceSwitcher = true,
  enableThemeSwitcher = true,
  initialDevice = "desktop",
  defaultZoom = 100,
  height = "h-[680px]",
}: LivePortfolioPreviewProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(initialDevice);
  const [zoom, setZoom] = useState<number>(defaultZoom);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [pulseLive, setPulseLive] = useState(false);
  const prevContentRef = useRef<string>("");

  // Visual pulse indicator when user types into form
  useEffect(() => {
    const serialized = JSON.stringify({
      name: content.name,
      headline: content.headline,
      bio: content.bio,
      skills: content.skills,
      expLen: content.experience?.length,
      projLen: content.projects?.length,
    });

    if (prevContentRef.current && prevContentRef.current !== serialized) {
      setPulseLive(true);
      const timer = setTimeout(() => setPulseLive(false), 800);
      return () => clearTimeout(timer);
    }
    prevContentRef.current = serialized;
  }, [content]);

  async function handleDownloadExport() {
    try {
      const html = await renderPortfolioHtml({
        title: content.name ? `${content.name} — Portfolio` : "Portfolio",
        content,
        theme,
        sections,
      });
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(content.name || "portfolio").toLowerCase().replace(/\s+/g, "-")}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported single-file HTML portfolio");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  }

  const currentUsername =
    content.githubUsername ||
    content.contact?.email?.split("@")[0] ||
    content.name?.toLowerCase().replace(/\s+/g, "") ||
    "developer";

  const previewBody = (
    <div className="relative flex flex-1 flex-col items-center justify-start overflow-y-auto bg-muted/30 p-3 sm:p-6">
      {/* Device Wrapper Container */}
      <div
        style={{
          transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
          transformOrigin: "top center",
          transition: "transform 0.2s ease, width 0.3s ease",
        }}
        className={`w-full ${
          device === "mobile"
            ? "max-w-[390px] rounded-[42px] border-[10px] border-ink bg-background shadow-2xl overflow-hidden my-auto"
            : device === "tablet"
              ? "max-w-[768px] rounded-2xl border-4 border-ink bg-background shadow-xl overflow-hidden my-auto"
              : "max-w-5xl rounded-xl border-2 border-ink bg-background shadow-md overflow-hidden"
        }`}
      >
        {/* Mobile Notch / Speaker Bar */}
        {device === "mobile" && (
          <div className="flex h-6 items-center justify-between bg-ink px-6 text-[10px] text-white">
            <span>9:41</span>
            <div className="h-3.5 w-16 rounded-full bg-black/80" />
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-white/80" />
              <div className="size-2 rounded-full bg-white/80" />
            </div>
          </div>
        )}

        {/* Scrollable Viewport Frame */}
        <div
          className={`w-full overflow-y-auto ${
            isFullscreen
              ? "h-[calc(100vh-140px)]"
              : device === "mobile"
                ? "h-[640px]"
                : device === "tablet"
                  ? "h-[680px]"
                  : "h-[620px]"
          }`}
        >
          <PortfolioView content={content} theme={theme} sections={sections} repos={repos} />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`flex flex-col rounded-2xl border-2 border-ink bg-card shadow-[4px_4px_0_0_oklch(0.2_0.02_60)] overflow-hidden transition-all ${className}`}
    >
      {/* Top Browser Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink bg-muted/50 px-4 py-2.5">
        {/* Left: Window Controls & Live Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden>
            <div className="size-3 rounded-full border border-ink/40 bg-red-500/80" />
            <div className="size-3 rounded-full border border-ink/40 bg-amber-500/80" />
            <div className="size-3 rounded-full border border-ink/40 bg-emerald-500/80" />
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-ink/20 bg-background px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground shadow-2xs">
            <Globe className="size-3 text-primary" />
            <span>folio.dev/@{currentUsername}</span>
          </div>

          {/* Live Reactive Pulse Badge */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <span
              className={`inline-block size-2 rounded-full transition-all ${
                pulseLive
                  ? "bg-primary scale-125 shadow-[0_0_8px_oklch(0.6_0.2_240)]"
                  : "bg-emerald-500"
              }`}
            />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {pulseLive ? "Updating…" : "Live Preview"}
            </span>
          </div>
        </div>

        {/* Center: Device Switcher */}
        {enableDeviceSwitcher && (
          <div className="flex items-center rounded-lg border border-ink/30 bg-background p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              title="Desktop View (100% Fluid)"
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-all ${
                device === "desktop"
                  ? "bg-ink text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Monitor className="size-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice("tablet")}
              title="Tablet View (768px)"
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-all ${
                device === "tablet"
                  ? "bg-ink text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tablet className="size-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              title="Mobile View (390px)"
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-all ${
                device === "mobile"
                  ? "bg-ink text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="size-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>
        )}

        {/* Right: Quick Tools */}
        <div className="flex items-center gap-1.5">
          {/* Theme Quick Switcher Popover Button */}
          {enableThemeSwitcher && onThemeChange && (
            <div className="relative">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setShowThemePicker(!showThemePicker)}
                title="Change Template Theme"
                className="size-7 border-ink/30"
              >
                <Palette className="size-3.5" />
              </Button>

              {showThemePicker && (
                <div className="absolute right-0 top-9 z-50 w-56 rounded-xl border-2 border-ink bg-card p-2.5 shadow-xl animate-rise">
                  <div className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Select Aesthetic Theme
                  </div>
                  <div className="space-y-1">
                    {TEMPLATE_ORDER.map((tid) => {
                      const tmpl = TEMPLATES[tid];
                      const isSelected = theme.template === tid;
                      return (
                        <button
                          key={tid}
                          type="button"
                          onClick={() => {
                            onThemeChange(structuredClone(tmpl.theme));
                            setShowThemePicker(false);
                            toast.success(`Applied ${tmpl.label} theme`);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-primary/10 text-primary font-bold"
                              : "hover:bg-muted text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="size-3 rounded-full border"
                              style={{ background: tmpl.theme.palette.accent }}
                            />
                            <span>{tmpl.label}</span>
                          </div>
                          {isSelected && <Check className="size-3 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Zoom In/Out */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setZoom((z) => Math.max(70, z - 10))}
            title="Zoom Out"
            className="size-7 text-muted-foreground hover:text-foreground"
          >
            <ZoomOut className="size-3.5" />
          </Button>
          <span className="font-mono text-[11px] text-muted-foreground w-8 text-center select-none">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setZoom((z) => Math.min(130, z + 10))}
            title="Zoom In"
            className="size-7 text-muted-foreground hover:text-foreground"
          >
            <ZoomIn className="size-3.5" />
          </Button>

          {/* HTML Download */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleDownloadExport}
            title="Download Standalone HTML"
            className="size-7 border-ink/30"
          >
            <Download className="size-3.5" />
          </Button>

          {/* Fullscreen Modal Toggle */}
          {enableFullscreen && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setIsFullscreen(true)}
              title="Fullscreen Live Preview"
              className="size-7 border-ink/30"
            >
              <Maximize2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Preview Viewport */}
      {previewBody}

      {/* Bottom Live Feedback Bar */}
      <div className="flex items-center justify-between border-t border-ink/15 bg-card/60 px-4 py-1.5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            Theme:{" "}
            <strong className="font-semibold text-foreground capitalize">
              {theme.template || "Default"}
            </strong>
          </span>
          <span>•</span>
          <span>
            Projects:{" "}
            <strong className="font-semibold text-foreground">
              {content.projects?.length || 0}
            </strong>
          </span>
          <span>•</span>
          <span>
            Experience:{" "}
            <strong className="font-semibold text-foreground">
              {content.experience?.length || 0}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1 font-medium text-foreground">
          <Sparkles className="size-3 text-primary" /> Instant Reactivity
        </div>
      </div>

      {/* Fullscreen Modal Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md">
          <div className="flex items-center justify-between border-b-2 border-ink bg-muted/80 px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="font-display font-black text-xl">Folio Live Fullscreen Preview</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                @{currentUsername}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {enableDeviceSwitcher && (
                <div className="flex items-center rounded-lg border border-ink/30 bg-background p-0.5">
                  <button
                    type="button"
                    onClick={() => setDevice("desktop")}
                    className={`rounded px-3 py-1 text-xs font-semibold ${
                      device === "desktop" ? "bg-ink text-white" : "text-muted-foreground"
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevice("tablet")}
                    className={`rounded px-3 py-1 text-xs font-semibold ${
                      device === "tablet" ? "bg-ink text-white" : "text-muted-foreground"
                    }`}
                  >
                    Tablet
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevice("mobile")}
                    className={`rounded px-3 py-1 text-xs font-semibold ${
                      device === "mobile" ? "bg-ink text-white" : "text-muted-foreground"
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              )}
              <Button variant="block" size="sm" onClick={() => setIsFullscreen(false)}>
                <Minimize2 className="mr-1.5 size-4" /> Exit Fullscreen
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-6">{previewBody}</div>
        </div>
      )}
    </div>
  );
}
