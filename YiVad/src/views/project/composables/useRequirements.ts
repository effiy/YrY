/**
 * Fetch requirement data from YiKnowledge markdown files.
 * Canonical source for requirement-type issues in the project detail page.
 */
import { ref, computed, type Ref, type ComputedRef } from "vue";
import { listKnowledgeFiles } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";

export interface RequireItem {
  title: string;
  path: string;
  status: string;
  priority: string;
  assignee: string;
  estimate_frontend: number;
  prd_task_id: string;
  prd_month: string;
}

export interface UseRequirementsReturn {
  items: ComputedRef<RequireItem[]>;
  loading: Ref<boolean>;
  fetch: (projectKey: string) => Promise<void>;
  updateItem: (path: string, updates: Partial<RequireItem>) => void;
}

export function useRequirements(): UseRequirementsReturn {
  const allItems = ref<RequireItem[]>([]);
  const loading = ref(false);

  const items = computed(() => allItems.value);

  async function fetch(projectKey: string) {
    loading.value = true;
    try {
      const res = await listKnowledgeFiles("projects");
      const prefix = `projects/${projectKey}/requires/`;
      allItems.value = (res.files || [])
        .filter((f: KnowledgeFileEntry) => f.path.startsWith(prefix) && f.path.endsWith(".md") && f.name !== "需求文档.md")
        .map((f: KnowledgeFileEntry) => {
          const parts = f.path.split("/");
          const month = parts.length >= 4 ? parts[parts.length - 2] : "";
          return {
            title: f.name.replace(/\.md$/, ""),
            path: f.path,
            status: (f.meta?.status as string) || "unknown",
            priority: (f.meta?.priority as string) || "none",
            assignee: (f.meta?.owner as string) || (f.meta?.assignee as string) || "",
            estimate_frontend: (f.meta?.estimate_frontend as number) || 0,
            prd_task_id: (f.meta?.prd_task_id as string) || "",
            prd_month: month
          };
        })
        .sort((a, b) => String(a.prd_task_id || "").localeCompare(String(b.prd_task_id || "")));
    } catch {
      allItems.value = [];
    } finally {
      loading.value = false;
    }
  }

  function updateItem(path: string, updates: Partial<RequireItem>) {
    const idx = allItems.value.findIndex(item => item.path === path);
    if (idx !== -1) {
      const newItems = [...allItems.value];
      newItems[idx] = { ...newItems[idx], ...updates };
      allItems.value = newItems;
    }
  }

  return { items, loading, fetch, updateItem };
}