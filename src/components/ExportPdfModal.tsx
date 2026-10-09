import { useState } from "react";
import {
  FileText,
  Printer,
  Download,
  Loader2,
  Check,
  Settings2,
  X,
  Sparkles,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  exportElementToPdf,
  generatePortfolioPdfFromData,
  triggerPortfolioPrint,
  type PdfExportOptions,
} from "@/lib/pdf-export";
import type { Content, Theme, Section, Repo } from "@/lib/portfolio";

interface ExportPdfModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  slug?: string;
  content: Content | unknown;
  theme: Theme | unknown;
  sections: Section[] | unknown;
  repos?: Repo[] | null;
  /** Optional target element ID in the current DOM (e.g. preview canvas) */
  targetElementId?: string;
}

export function ExportPdfModal({
  open,
  onClose,
  title,
  slug,
  content,
  theme,
  sections,
  repos,
  targetElementId,
}: ExportPdfModalProps) {
  const [format, setFormat] = useState<"a4" | "letter">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [generating, setGenerating] = useState(false);

  if (!open) return null;

  const safeFilename = `${(slug || title || "portfolio")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .slice(0, 40)}-portfolio.pdf`;

  const handleExportPdf = async () => {
    setGenerating(true);
    try {
      const options: PdfExportOptions = {
        filename: safeFilename,
        format,
        orientation,
        showPageNumbers,
        scale: 2,
      };

      const targetEl = targetElementId ? document.getElementById(targetElementId) : null;

      if (targetEl) {
        await exportElementToPdf(targetEl, options);
      } else {
        await generatePortfolioPdfFromData(
          {
            title,
            content,
            theme,
            sections,
            repos,
          },
          options,
        );
      }

      toast.success("Portfolio PDF downloaded successfully for offline viewing!");
      onClose();
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      triggerPortfolioPrint();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-ink bg-card p-6 shadow-[5px_5px_0_0_oklch(0.2_0.02_60)] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-ink/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-xl border border-ink bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">Export Portfolio as PDF</h3>
              <p className="text-xs text-muted-foreground">
                Download for offline viewing or print a physical copy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Configuration Options */}
        <div className="space-y-4 py-5">
          {/* Format Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Page Size / Format
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("a4")}
                className={`flex items-center justify-between rounded-xl border-2 p-3 text-xs font-bold transition-all ${
                  format === "a4"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-ink/20 bg-background text-foreground hover:border-ink/40"
                }`}
              >
                <span>A4 (International)</span>
                {format === "a4" && <Check className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => setFormat("letter")}
                className={`flex items-center justify-between rounded-xl border-2 p-3 text-xs font-bold transition-all ${
                  format === "letter"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-ink/20 bg-background text-foreground hover:border-ink/40"
                }`}
              >
                <span>US Letter</span>
                {format === "letter" && <Check className="size-4" />}
              </button>
            </div>
          </div>

          {/* Orientation Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Orientation
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrientation("portrait")}
                className={`flex items-center justify-between rounded-xl border-2 p-3 text-xs font-bold transition-all ${
                  orientation === "portrait"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-ink/20 bg-background text-foreground hover:border-ink/40"
                }`}
              >
                <span>Portrait</span>
                {orientation === "portrait" && <Check className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => setOrientation("landscape")}
                className={`flex items-center justify-between rounded-xl border-2 p-3 text-xs font-bold transition-all ${
                  orientation === "landscape"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-ink/20 bg-background text-foreground hover:border-ink/40"
                }`}
              >
                <span>Landscape</span>
                {orientation === "landscape" && <Check className="size-4" />}
              </button>
            </div>
          </div>

          {/* Page Numbers Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-ink/15 bg-background p-3">
            <div>
              <div className="text-xs font-bold">Include Page Pagination</div>
              <div className="text-[11px] text-muted-foreground">
                Adds &quot;Page X of Y&quot; numbers in the PDF footer
              </div>
            </div>
            <input
              type="checkbox"
              checked={showPageNumbers}
              onChange={(e) => setShowPageNumbers(e.target.checked)}
              className="size-4 rounded accent-primary cursor-pointer"
            />
          </div>

          {/* Offline Viewing Notice */}
          <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 dark:bg-sky-950/30 p-3 text-xs text-sky-900 dark:text-sky-300">
            <Info className="size-4 shrink-0 mt-0.5" />
            <div>
              The generated PDF preserves full theme typography, project layouts, skills badges, and
              contact links for completely offline reading without internet access.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t-2 border-ink/10 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            disabled={generating}
            className="w-full sm:w-auto border-ink font-bold text-xs"
          >
            <Printer className="mr-1.5 size-4" />
            Print / System PDF
          </Button>

          <div className="flex w-full sm:w-auto items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={generating}
              className="w-1/2 sm:w-auto text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="block"
              onClick={handleExportPdf}
              disabled={generating}
              className="w-1/2 sm:w-auto text-xs font-bold"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-1.5 size-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
