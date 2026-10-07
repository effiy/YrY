/**
 * Knowledge base import/export operations.
 */
import { ref, type ComputedRef } from "vue";
import type { KnowledgeFileSummary } from "@/api/interface/yiAi";

export function useKnowledgeImport(
  sortedDrillTableData: ComputedRef<KnowledgeFileSummary[]>
) {
  const showBenefitCol = ref(false);

  function exportCSV() {
    const data = sortedDrillTableData.value;
    if (!data.length) return;
    const headers = [
      "title",
      "path",
      "category",
      "module",
      "sub_module",
      "status",
      "lifecycle",
      "type",
      "review_cycle",
      "tacit",
      "roles",
      "tags",
      "benefit",
      "related_count",
      "size",
      "updated"
    ];
    const rows = data.map(f =>
      headers.map(h => {
        const v = (f as any)[h];
        if (Array.isArray(v)) return v.join("; ");
        if (h === "tacit") return v ? "Y" : "";
        return v ?? "";
      })
    );
    const csv = [
      headers.join(","),
      ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `knowledge-files-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return { showBenefitCol, exportCSV };
}