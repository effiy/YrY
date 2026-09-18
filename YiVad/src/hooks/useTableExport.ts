import { ref } from "vue";
import type { ExportFormat, ExportOptions } from "@/utils/export/types";
import { exportCSV } from "@/utils/export/csv";
import { exportJSON } from "@/utils/export/json";
import { runInWorker } from "@/utils/export/workerPool";
import { triggerDownload } from "@/utils/export/types";

const LARGE_DATASET_THRESHOLD = 5000;

/** Encrypt content with a password using Web Crypto API (AES-GCM). */
async function encryptContent(content: string, password: string): Promise<Blob> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(content));
  // Prepend salt + iv so decryption can recover them
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  return new Blob([combined], { type: "application/octet-stream" });
}

export function useTableExport() {
  const exporting = ref(false);
  const exportProgress = ref(0);

  const exportData = async (options: ExportOptions & { password?: string }): Promise<void> => {
    exporting.value = true;
    exportProgress.value = 0;

    try {
      const { data, columns, format, fileName, password } = options;

      // Try Web Worker for CSV/JSON on large datasets
      if ((format === "csv" || format === "json") && data.length > 1000) {
        try {
          const content = await runInWorker({ type: format, data, columns });
          let blob: Blob;
          if (password) {
            blob = await encryptContent(content, password);
          } else {
            const mime = format === "csv" ? "text/csv;charset=utf-8;" : "application/json";
            blob = new Blob([content], { type: mime });
          }
          triggerDownload(blob, `${fileName ?? "export"}.${format === "csv" ? "csv" : "json"}`);
          return;
        } catch {
          // Worker failed; fall through to main-thread export
        }
      }

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
