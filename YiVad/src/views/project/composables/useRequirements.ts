/**
 * Fetch requirement data from YiKnowledge `prd/` directory.
 * Canonical source for PRD documents shown on the project detail page.
 */
import { ref, computed, type Ref, type ComputedRef } from "vue";
import { listKnowledgeFiles } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

export interface RequireItem {
  title: string;
  path: string;
  status: string;
  priority: string;
  assignee: string;
  estimate_frontend: number;
  prd_task_id: string;
  prd_month: string;
  doc_type: string;
  /** Module IDs linked to this PRD */
  related_modules: string[];
  /** Test IDs linked to this PRD */
  related_tests: string[];
  /** OKR goal IDs linked to this PRD */
  source_okr: string[];
}

export interface OkrFileInfo {
  path: string;
  name: string;
  title: string;
}

/** A knowledge document linked to a PRD — an openable path plus a display name. */
export interface LinkedDocInfo {
  path: string;
  name: string;
  title: string;
}

export interface UseRequirementsReturn {
  items: ComputedRef<RequireItem[]>;
  loading: Ref<boolean>;
  /** Map from goal ID (e.g. "yivad-001") to OKR file path + display name */
  okrFileMap: Ref<Map<string, OkrFileInfo>>;
  fetch: (projectKey: string) => Promise<void>;
  updateItem: (path: string, updates: Partial<RequireItem>) => void;
  /** Derive requirements from pre-fetched knowledge files (no API call). */
  deriveFrom: (files: KnowledgeFileEntry[], projectKey: string) => void;
  /** Dev tasks and test specs whose frontmatter names the given PRD as their source. */
  linksForPrd: (prdPath?: string) => { dev: LinkedDocInfo[]; tests: LinkedDocInfo[] };
}

/** Source directory for requirement-type content */
const REQ_DIRS = ["prds"];

/**
 * Join key for the PRD→doc back-reference. Month-qualified because basenames
 * repeat across months (e.g. `00-需求总览.md` exists in every month folder).
 */
function prdRefKey(month: string, prdBasename: string): string {
  return `${month}/${prdBasename.trim().replace(/\.md$/, "")}`;
}

/** Month folder of a knowledge doc (`…/devs/2026-09/x.md`), falling back to the
 *  `prd_month` frontmatter field when the folder is not a month. */
function docMonth(f: KnowledgeFileEntry): string {
  const dir = f.path.split("/").slice(-2, -1)[0] || "";
  if (/^\d{4}-\d{2}$/.test(dir)) return dir;
  const pm = String((f.meta?.prd_month as string) || "");
  return pm.length === 6 ? `${pm.slice(0, 4)}-${pm.slice(4)}` : "";
}

function mapReqFile(f: KnowledgeFileEntry): RequireItem {
  const parts = f.path.split("/");
  const month = parts.length >= 4 ? parts[parts.length - 2] : "";
  const meta = f.meta || {};
  return {
    title: f.name.replace(/\.md$/, ""),
    path: f.path,
    status: (meta?.status as string) || "unknown",
    priority: (meta?.priority as string) || "none",
    assignee: (meta?.owner as string) || (meta?.assignee as string) || "",
    estimate_frontend: (meta?.estimate_frontend as number) || 0,
    prd_task_id: (meta?.prd_task_id as string) || "",
    prd_month: month,
    doc_type: (meta?.doc_type as string) || "requirement",
    related_modules: Array.isArray(meta?.related_modules) ? meta.related_modules as string[] : [],
    related_tests: Array.isArray(meta?.related_tests) ? meta.related_tests as string[] : [],
    source_okr: Array.isArray(meta?.source_okr) ? meta.source_okr as string[] : [],
  };
}

export function useRequirements(): UseRequirementsReturn {
  const allItems = ref<RequireItem[]>([]);
  const loading = ref(false);
  const okrFileMap = ref<Map<string, OkrFileInfo>>(new Map());
  const devFileMap = ref<Map<string, LinkedDocInfo[]>>(new Map());
  const testFileMap = ref<Map<string, LinkedDocInfo[]>>(new Map());

  const items = computed(() => allItems.value);

  function deriveFrom(files: KnowledgeFileEntry[], projectKey: string) {
    const prefixes = REQ_DIRS.map(d => `projects/${projectKey}/${d}/`);
    allItems.value = files
      .filter(f =>
        f.path.endsWith(".md") &&
        f.name !== "README.md" &&
        prefixes.some(p => f.path.startsWith(p))
      )
      .map(mapReqFile)
      .sort((a, b) => {
        const monthCmp = (b.prd_month || "").localeCompare(a.prd_month || "");
        if (monthCmp !== 0) return monthCmp;
        const na = parseInt((a.title || "").match(/^(\d+)/)?.[1] || "0", 10);
        const nb = parseInt((b.title || "").match(/^(\d+)/)?.[1] || "0", 10);
        return isNaN(na) || isNaN(nb) ? (a.title || "").localeCompare(b.title || "") : na - nb;
      });

    // Build OKR file map + reverse PRD→goal index from goal files
    const okrPrefix = `projects/${projectKey}/okrs/`;
    const map = new Map<string, OkrFileInfo>();
    const prdToGoals = new Map<string, string[]>();

    for (const f of files) {
      if (f.path.startsWith(okrPrefix) && f.path.endsWith(".md") && f.name !== "README.md") {
        const goalId = (f.meta?.id as string) || "";
        if (!goalId) continue;
        map.set(goalId, { path: f.path, name: f.name.replace(/\.md$/, ""), title: (f.meta?.title as string) || f.name.replace(/\.md$/, "") });

        const relatedPrds = f.meta?.related_prds;
        if (Array.isArray(relatedPrds)) {
          for (const prdPath of relatedPrds) {
            if (typeof prdPath !== "string") continue;
            const existing = prdToGoals.get(prdPath) || [];
            if (!existing.includes(goalId)) existing.push(goalId);
            prdToGoals.set(prdPath, existing);
          }
        }
      }
    }
    okrFileMap.value = map;

    // Enrich PRD source_okr from goal files' related_prds (reverse lookup)
    for (const item of allItems.value) {
      const fromReverse = prdToGoals.get(item.path) || [];
      if (fromReverse.length > 0) {
        const merged = new Set([...item.source_okr, ...fromReverse]);
        item.source_okr = [...merged];
      }
    }

    // Reverse-index dev tasks and test specs by the PRD they were derived from.
    // Each carries its source PRD in frontmatter (`source_prd` / `source_prds`),
    // so the PRD path is all that's needed to find them — no extra API call.
    const devMap = new Map<string, LinkedDocInfo[]>();
    const testMap = new Map<string, LinkedDocInfo[]>();
    const devPrefix = `projects/${projectKey}/devs/`;
    const testPrefix = `projects/${projectKey}/tests/`;

    const addLink = (map: Map<string, LinkedDocInfo[]>, key: string, info: LinkedDocInfo) => {
      const list = map.get(key) || [];
      if (!list.some(i => i.path === info.path)) list.push(info);
      map.set(key, list);
    };

    for (const f of files) {
      const isDev = f.path.startsWith(devPrefix);
      const isTest = f.path.startsWith(testPrefix);
      if ((!isDev && !isTest) || !f.path.endsWith(".md") || f.name === "README.md") continue;
      const month = docMonth(f);
      if (!month) continue;
      const meta = f.meta || {};
      const sources = isDev ? [meta.source_prd] : meta.source_prds;
      const info: LinkedDocInfo = {
        path: f.path,
        name: f.name.replace(/\.md$/, ""),
        title: (meta.title as string) || f.name.replace(/\.md$/, ""),
      };
      for (const raw of Array.isArray(sources) ? sources : [sources]) {
        if (typeof raw !== "string" || !raw.trim()) continue;
        addLink(isDev ? devMap : testMap, prdRefKey(month, raw), info);
      }
    }
    devFileMap.value = devMap;
    testFileMap.value = testMap;
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

  function updateItem(path: string, updates: Partial<RequireItem>) {
    const idx = allItems.value.findIndex(item => item.path === path);
    if (idx !== -1) {
      const newItems = [...allItems.value];
      newItems[idx] = { ...newItems[idx], ...updates };
      allItems.value = newItems;
    }
  }

  /** Dev tasks / test specs derived from a PRD, keyed off the PRD's own path. */
  function linksForPrd(prdPath?: string): { dev: LinkedDocInfo[]; tests: LinkedDocInfo[] } {
    const parts = (prdPath || "").split("/");
    if (parts.length < 4) return { dev: [], tests: [] };
    const key = prdRefKey(parts[parts.length - 2], parts[parts.length - 1]);
    return {
      dev: devFileMap.value.get(key) || [],
      tests: testFileMap.value.get(key) || [],
    };
  }

  return { items, loading, okrFileMap, fetch, updateItem, deriveFrom, linksForPrd };
}