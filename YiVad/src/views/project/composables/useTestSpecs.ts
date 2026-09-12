/**
 * Fetch test spec docs from YiKnowledge `tests/` directory.
 * Links back to source PRDs via `source_prds` frontmatter field.
 */
import { ref, computed, type Ref, type ComputedRef } from "vue";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

export interface TestSpec {
  title: string;
  path: string;
  status: string;
  priority: string;
  owner: string;
  prd_task_id: string;
  source_prds: string[];
  prd_month: string;
  /** 文件序号（从文件名提取） */
  seq: string;
}

const TEST_DIRS = ["tests"];

function mapTestFile(f: KnowledgeFileEntry): TestSpec {
  const parts = f.path.split("/");
  const month = parts.length >= 4 ? parts[parts.length - 2] : "";
  const meta = f.meta || {};
  const seq = (f.name.match(/^(\d+)/)?.[1]) || "";
  return {
    title: (meta?.title as string) || f.name.replace(/\.md$/, ""),
    path: f.path,
    status: (meta?.status as string) || "unknown",
    priority: (meta?.priority as string) || "none",
    owner: (meta?.owner as string) || "",
    prd_task_id: (meta?.prd_task_id as string) || "",
    source_prds: Array.isArray(meta?.source_prds) ? meta.source_prds as string[] : [],
    prd_month: month,
    seq,
  };
}

export function useTestSpecs() {
  const allItems = ref<TestSpec[]>([]);

  const items = computed(() => allItems.value);

  function deriveFrom(files: KnowledgeFileEntry[], projectKey: string) {
    const prefixes = TEST_DIRS.map(d => `projects/${projectKey}/${d}/`);
    allItems.value = files
      .filter(f =>
        f.path.endsWith(".md") &&
        f.name !== "README.md" &&
        prefixes.some(p => f.path.startsWith(p))
      )
      .map(mapTestFile)
      .sort((a, b) => {
        const monthCmp = (b.prd_month || "").localeCompare(a.prd_month || "");
        if (monthCmp !== 0) return monthCmp;
        const na = parseInt(a.seq, 10);
        const nb = parseInt(b.seq, 10);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.seq.localeCompare(b.seq);
      });
  }

  return { items, deriveFrom };
}