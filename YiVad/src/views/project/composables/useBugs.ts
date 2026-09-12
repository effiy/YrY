/**
 * Fetch bug records from YiKnowledge `bugs/` directory.
 * Canonical source for bug data shown on the project detail page bugs tab.
 */
import { ref, computed, type Ref, type ComputedRef } from "vue";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

export interface YiKnowledgeBug {
  title: string;
  path: string;
  status: string;
  severity: string;
  priority: string;
  module: string;
  /** Subdirectory name under bugs/{month}/ (e.g. "代码质量", "数据") */
  category: string;
  /** 月份 (YYYY-MM) extracted from path */
  prdMonth: string;
  created: string;
  updated: string;
  source_prd: string;
  /** 文件序号（从文件名提取） */
  seq: string;
}

const BUG_DIRS = ["bugs"];

function mapBugFile(f: KnowledgeFileEntry): YiKnowledgeBug {
  const parts = f.path.split("/");
  // path: projects/{key}/bugs/{month}/{category}/{filename}.md
  // or old format: projects/{key}/bugs/{category}/{filename}.md
  const hasMonth = parts.length >= 6;
  const month = hasMonth ? parts[3] : "";
  const category = parts.length >= 5 ? parts[parts.length - 2] : "";
  const meta = f.meta || {};
  const seq = (f.name.match(/^(\d+)/)?.[1]) || "";
  return {
    title: (meta?.title as string) || f.name.replace(/\.md$/, ""),
    path: f.path,
    status: (meta?.status as string) || "open",
    severity: (meta?.severity as string) || "minor",
    priority: (meta?.priority as string) || "p3",
    module: (meta?.module as string) || "",
    category,
    prdMonth: month || ((meta?.created as string) || "").substring(0, 7),
    created: (meta?.created as string) || "",
    updated: (meta?.updated as string) || "",
    source_prd: (meta?.source_prd as string) || "",
    seq,
  };
}

export function useBugs() {
  const allItems = ref<YiKnowledgeBug[]>([]);

  const items = computed(() => allItems.value);

  function deriveFrom(files: KnowledgeFileEntry[], projectKey: string) {
    const prefixes = BUG_DIRS.map(d => `projects/${projectKey}/${d}/`);
    allItems.value = files
      .filter(f =>
        f.path.endsWith(".md") &&
        f.name !== "README.md" &&
        prefixes.some(p => f.path.startsWith(p))
      )
      .map(mapBugFile)
      .sort((a, b) => {
        const monthCmp = (b.prdMonth || "").localeCompare(a.prdMonth || "");
        if (monthCmp !== 0) return monthCmp;
        const na = parseInt(a.seq, 10);
        const nb = parseInt(b.seq, 10);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.seq.localeCompare(b.seq);
      });
  }

  return { items, deriveFrom };
}