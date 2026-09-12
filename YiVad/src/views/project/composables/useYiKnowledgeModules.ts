/**
 * Fetch dev module docs from YiKnowledge `devs/` directory.
 * Complements MongoDB modules with design/implementation documentation.
 * Links back to source PRDs via `source_prd` frontmatter field.
 */
import { ref, computed, type Ref, type ComputedRef } from "vue";
import { listKnowledgeFiles } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

export interface YiKnowledgeModule {
  title: string;
  path: string;
  status: string;
  priority: string;
  owner: string;
  prd_task_id: string;
  source_prd: string;
  related_tests: string[];
  prd_month: string;
  estimate_frontend: number;
  /** 文件序号（从文件名提取，如 01-prd-task-xxx.md → 01） */
  seq: string;
}

export interface UseYiKnowledgeModulesReturn {
  items: ComputedRef<YiKnowledgeModule[]>;
  /** Map of prd_task_id → module for cross-referencing with MongoDB modules */
  byPrdTaskId: ComputedRef<Map<string, YiKnowledgeModule>>;
  loading: Ref<boolean>;
  fetch: (projectKey: string) => Promise<void>;
  /** Derive modules from pre-fetched knowledge files (no API call). */
  deriveFrom: (files: KnowledgeFileEntry[], projectKey: string) => void;
}

const MODULE_DIRS = ["devs"];

function mapModuleFile(f: KnowledgeFileEntry): YiKnowledgeModule {
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
    source_prd: (meta?.source_prd as string) || "",
    related_tests: Array.isArray(meta?.related_tests) ? meta.related_tests as string[] : [],
    prd_month: month,
    estimate_frontend: (meta?.estimate_frontend as number) || 0,
    seq,
  };
}

export function useYiKnowledgeModules(): UseYiKnowledgeModulesReturn {
  const allItems = ref<YiKnowledgeModule[]>([]);
  const loading = ref(false);

  const items = computed(() => allItems.value);

  const byPrdTaskId = computed(() => {
    const map = new Map<string, YiKnowledgeModule>();
    for (const item of allItems.value) {
      if (item.prd_task_id) map.set(item.prd_task_id, item);
    }
    return map;
  });

  function deriveFrom(files: KnowledgeFileEntry[], projectKey: string) {
    const prefixes = MODULE_DIRS.map(d => `projects/${projectKey}/${d}/`);
    allItems.value = files
      .filter(f =>
        f.path.endsWith(".md") &&
        f.name !== "README.md" &&
        prefixes.some(p => f.path.startsWith(p))
      )
      .map(mapModuleFile)
      .sort((a, b) => {
        const monthCmp = (b.prd_month || "").localeCompare(a.prd_month || "");
        if (monthCmp !== 0) return monthCmp;
        const na = parseInt(a.seq, 10);
        const nb = parseInt(b.seq, 10);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.seq.localeCompare(b.seq);
      });
  }

  async function fetch(projectKey: string) {
    loading.value = true;
    try {
      const res = await listKnowledgeFiles("projects");
      deriveFrom((res.files || []) as KnowledgeFileEntry[], projectKey);
    } catch {
      allItems.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { items, byPrdTaskId, loading, fetch, deriveFrom };
}