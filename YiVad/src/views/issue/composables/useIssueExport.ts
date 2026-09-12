import type { Issue } from "@/api/modules/issueService";
import { ElMessage } from "element-plus";

export function useIssueExport(getRows: () => Issue[]) {
  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const rows = getRows();
    if (!rows.length) return ElMessage.warning("No data to export");
    const headers = ["Title", "Type", "Status", "Priority", "Assignee", "Due Date", "Project"];
    const csvRows = [headers.join(",")];
    rows.forEach(r => {
      csvRows.push(
        [r.title, r.issue_type, r.status, r.priority, r.assignee || "", r.due_date || "", r.project_key]
          .map(v => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      );
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
    triggerDownload(blob, "issues-export.csv");
    ElMessage.success("CSV exported");
  }

  function exportJSON() {
    const rows = getRows();
    if (!rows.length) return ElMessage.warning("No data to export");
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json;charset=utf-8" });
    triggerDownload(blob, "issues-export.json");
    ElMessage.success("JSON exported");
  }

  return {
    exportCSV,
    exportJSON
  };
}
