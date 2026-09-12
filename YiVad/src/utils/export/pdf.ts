import type { ExportColumn } from "./types";
import { triggerDownload, generateFileName } from "./types";

export async function exportPDF(
  data: Record<string, any>[],
  columns: ExportColumn[],
  fileName?: string,
) {
  const { jsPDF } = await import("jspdf");
  await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const headers = columns.map((c) => c.label);
  const rows = data.map((row) => columns.map((c) => String(row[c.key] ?? "")));

  doc.setFontSize(12);
  doc.text(fileName ?? "Export", 14, 15);
  doc.setFontSize(8);
  doc.text(`Exported: ${new Date().toLocaleString()}  |  Records: ${data.length}`, 14, 22);

  (doc as any).autoTable({
    head: [headers],
    body: rows,
    startY: 28,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [66, 133, 244] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage: (hookData: any) => {
      const totalPages = doc.getNumberOfPages();
      doc.setFontSize(7);
      doc.text(`Page ${hookData.pageNumber} / ${totalPages}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 8);
    },
  });

  const blob = doc.output("blob");
  triggerDownload(blob, fileName ?? generateFileName("export", "pdf"));
}