import { ref } from "vue";
import type { ExportFormat, ExportOptions } from "@/utils/export/types";
import { exportCSV } from "@/utils/export/csv";
import { exportJSON } from "@/utils/export/json";

const LARGE_DATASET_THRESHOLD = 5000;

export function useTableExport() {
  const exporting = ref(false);
  const exportProgress = ref(0);

  const exportData = async (options: ExportOptions): Promise<void> => {
    exporting.value = true;
    exportProgress.value = 0;

    try {
      const { data, columns, format, fileName } = options;

      if (format === "csv") {
        exportCSV(data, columns, fileName);
      } else if (format === "json") {
        exportJSON(data, columns, fileName);
      } else if (format === "xlsx") {
        try {
          const { exportXLSX } = await import("@/utils/export/xlsx");
          exportXLSX(data, columns, fileName);
        } catch {
          exportCSV(data, columns, fileName);
        }
      } else if (format === "pdf") {
        try {
          const { exportPDF } = await import("@/utils/export/pdf");
          await exportPDF(data, columns, fileName);
        } catch {
          exportCSV(data, columns, fileName);
        }
      }
    } finally {
      exporting.value = false;
      exportProgress.value = 100;
    }
  };

  const shouldUseServerExport = (count: number) => count > LARGE_DATASET_THRESHOLD;

  return { exporting, exportProgress, exportData, shouldUseServerExport };
}