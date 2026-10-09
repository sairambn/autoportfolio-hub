import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { PortfolioView } from "@/components/PortfolioView";
import { normalize, type Content, type Section, type Theme, type Repo } from "./portfolio";

export interface PdfExportOptions {
  filename?: string;
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  showPageNumbers?: boolean;
  scale?: number;
}

/**
 * Capture an existing DOM element and export it as a multi-page PDF file.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: PdfExportOptions = {},
): Promise<Blob> {
  const {
    filename = "portfolio.pdf",
    format = "a4",
    orientation = "portrait",
    showPageNumbers = true,
    scale = 2,
  } = options;

  // Clone or capture element with html2canvas
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    windowWidth: 1200, // standard desktop width for responsive layout capture
    backgroundColor: window.getComputedStyle(element).backgroundColor || "#ffffff",
  });

  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8; // 8mm margin
  const contentWidth = pageWidth - margin * 2;

  // Aspect ratio scaling
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const totalPdfHeight = (canvasHeight * contentWidth) / canvasWidth;

  const contentHeightPerPage = pageHeight - margin * 2 - (showPageNumbers ? 8 : 0);
  const totalPages = Math.ceil(totalPdfHeight / contentHeightPerPage);

  // Split canvas across pages
  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      pdf.addPage();
    }

    // Source coordinates on the canvas
    const sourceY = (page * contentHeightPerPage * canvasWidth) / contentWidth;
    const sourceHeight = Math.min(
      (contentHeightPerPage * canvasWidth) / contentWidth,
      canvasHeight - sourceY,
    );

    // Create a temporary canvas for this specific slice
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvasWidth;
    pageCanvas.height = Math.max(1, sourceHeight);

    const ctx = pageCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, sourceY, canvasWidth, sourceHeight, 0, 0, canvasWidth, sourceHeight);
    }

    const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.95);
    const slicePdfHeight = (sourceHeight * contentWidth) / canvasWidth;

    pdf.addImage(pageImgData, "JPEG", margin, margin, contentWidth, slicePdfHeight);

    // Optional page footer with pagination
    if (showPageNumbers) {
      pdf.setFontSize(8);
      pdf.setTextColor(130, 130, 130);
      pdf.text(
        `Page ${page + 1} of ${totalPages} • Generated via Folio`,
        pageWidth / 2,
        pageHeight - 4,
        { align: "center" },
      );
    }
  }

  // Save directly to user filesystem
  const safeFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  pdf.save(safeFilename);

  return pdf.output("blob");
}

/**
 * Programmatically renders a portfolio offscreen and generates a downloadable PDF file.
 * Useful when exporting from dashboard or background without navigating into the preview.
 */
export async function generatePortfolioPdfFromData(
  data: {
    title: string;
    content: Content | unknown;
    theme: Theme | unknown;
    sections: Section[] | unknown;
    repos?: Repo[] | null;
  },
  options: PdfExportOptions = {},
): Promise<Blob> {
  const normalized = normalize(data);

  // Create temporary offscreen container
  const container = document.createElement("div");
  container.id = "pdf-offscreen-render-container";
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "1180px";
  container.style.minHeight = "1000px";
  container.style.zIndex = "-9999";
  container.style.opacity = "1";
  container.style.pointerEvents = "none";
  container.style.backgroundColor = normalized.theme.palette.bg || "#ffffff";
  document.body.appendChild(container);

  try {
    const root = createRoot(container);
    await new Promise<void>((resolve) => {
      root.render(
        createElement(PortfolioView, {
          content: normalized.content,
          theme: normalized.theme,
          sections: normalized.sections,
          repos: data.repos || null,
        }),
      );
      // Wait for DOM paint and image layout
      setTimeout(resolve, 350);
    });

    const filename =
      options.filename ||
      `${(data.title || normalized.content.name || "portfolio")
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .slice(0, 40)}-portfolio.pdf`;

    const blob = await exportElementToPdf(container, {
      ...options,
      filename,
    });

    root.unmount();
    return blob;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Triggers clean browser print dialog with dedicated print styles.
 */
export function triggerPortfolioPrint() {
  window.print();
}
