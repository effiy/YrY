/**
 * Knowledge-driven insights for the home page.
 * Fetches YiKnowledge metadata: bugs, files, and health metrics.
 */
import { ref, onMounted, onUnmounted, type Ref } from "vue";
import { listKnowledgeBugs, listKnowledgeFiles, readKnowledgeFile } from "@/api/modules/knowledgeService";
import type { KnowledgeBugEntry, KnowledgeFileEntry } from "@/api/interface/yiAi";

export interface CategoryInfo {
  category: string;
  count: number;
  /** % of files in this category updated within the last 30 days (0-100) */
  freshness: number;
  /** files updated in last 7 days */
  recentCount: number;
}

export interface ActivityItem {
  type: "file" | "bug";
  path?: string;
  title: string;
  category?: string;
  severity?: string;
  updatedAt: number;
  isNew?: boolean;
}

export interface KnowledgeInsight {
  recentBugs: Ref<KnowledgeBugEntry[]>;
  bugSeverity: Ref<Record<string, number>>;
  recentFiles: Ref<KnowledgeFileEntry[]>;
  importantFiles: Ref<KnowledgeFileEntry[]>;
  activityItems: Ref<ActivityItem[]>;
  totalFiles: Ref<number>;
  categoryInfo: Ref<CategoryInfo[]>;
  avgFreshness: Ref<number>;
  healthSummary: Ref<string | null>;
  gaps: Ref<string[]>;
  available: Ref<boolean>;
  loading: Ref<boolean>;
  retry: () => Promise<void>;
}

const ROLE_LABELS: Record<string, string> = {
  engineer: "Engineer",
  executive: "Executive",
  leader: "Tech Lead",
  aier: "AI",
  product: "product",
  sre: "SRE",
  curator: "Curator"
};

const POLL_MS = 60_000;
const FRESH_CUTOFF_MS = 30 * 86400000; // 30 days
const RECENT_CUTOFF_MS = 7 * 86400000; // 7 days
const STALE_CUTOFF_MS = 90 * 86400000; // 90 days — files untouched beyond this are stale
const SPARSE_THRESHOLD = 5;
const LOW_FRESHNESS_THRESHOLD = 40;

/** Path-based importance: specs/architecture/workflows/governance > patterns > rest */
function importanceScore(f: KnowledgeFileEntry): number {
  const p = f.path;
  if (/projects\/[^/]+\/(specs|architecture|workflows)\//.test(p)) return 3;
  if (/curator\/governance\//.test(p)) return 3;
  if (/\/patterns\//.test(p) || /\/requirements\//.test(p)) return 2;
  return 1;
}

export function useKnowledgeInsight(): KnowledgeInsight {
  const recentBugs = ref<KnowledgeBugEntry[]>([]);
  const bugSeverity = ref<Record<string, number>>({});
  const recentFiles = ref<KnowledgeFileEntry[]>([]);
  const allFiles = ref<KnowledgeFileEntry[]>([]);
  const importantFiles = ref<KnowledgeFileEntry[]>([]);
  const activityItems = ref<ActivityItem[]>([]);
  const totalFiles = ref(0);
  const categoryInfo = ref<CategoryInfo[]>([]);
  const avgFreshness = ref(0);
  const healthSummary = ref<string | null>(null);
  const gaps = ref<string[]>([]);
  const available = ref(false);
  const loading = ref(true);

  async function fetchAll() {
    loading.value = true;
    available.value = false;

    const [bugsRes, filesRes] = await Promise.allSettled([
      listKnowledgeBugs().catch(() => null),
      listKnowledgeFiles().catch(() => null)
    ]);

    const now = Date.now();
    const weekAgo = now - RECENT_CUTOFF_MS;

    // Bugs
    if (bugsRes.status === "fulfilled" && bugsRes.value) {
      available.value = true;
      const all = bugsRes.value.bugs ?? [];
      recentBugs.value = all
        .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
        .slice(0, 6);

      const sev: Record<string, number> = {};
      for (const b of all) {
        const s = b.severity || "trivial";
        sev[s] = (sev[s] ?? 0) + 1;
      }
      bugSeverity.value = sev;
    }

    // Files
    if (filesRes.status === "fulfilled" && filesRes.value) {
      available.value = true;
      const files = filesRes.value.files ?? [];
      totalFiles.value = filesRes.value.total ?? files.length;

      const monthAgo = now - FRESH_CUTOFF_MS;

      recentFiles.value = files
        .filter(f => f.updatedAt && f.updatedAt > weekAgo)
        .sort((a, b) => {
          const si = importanceScore(b) - importanceScore(a);
          if (si !== 0) return si;
          return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
        })
        .slice(0, 8);

      allFiles.value = files;

      importantFiles.value = [...files]
        .filter(f => f.updatedAt && f.updatedAt > monthAgo)
        .sort((a, b) => {
          const si = importanceScore(b) - importanceScore(a);
          if (si !== 0) return si;
          return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
        })
        .slice(0, 10);

      // Per-category freshness = % of files updated within 30 days
      const catFiles = new Map<string, KnowledgeFileEntry[]>();
      for (const f of files) {
        const cat = f.category || "__root__";
        if (cat === "__root__") continue;
        if (!catFiles.has(cat)) catFiles.set(cat, []);
        catFiles.get(cat)!.push(f);
      }

      const infoList: CategoryInfo[] = [];
      let totalFresh = 0;
      let totalWithData = 0;

      for (const [cat, catFileList] of catFiles) {
        const freshCount = catFileList.filter(f => f.updatedAt && f.updatedAt > monthAgo).length;
        const recentCount = catFileList.filter(f => f.updatedAt && f.updatedAt > weekAgo).length;
        const freshness = catFileList.length ? Math.round((freshCount / catFileList.length) * 100) : 0;
        infoList.push({
          category: ROLE_LABELS[cat] || cat,
          count: catFileList.length,
          freshness,
          recentCount
        });
        totalFresh += freshCount;
        totalWithData += catFileList.length;
      }

      categoryInfo.value = infoList.sort((a, b) => b.count - a.count);
      avgFreshness.value = totalWithData ? Math.round((totalFresh / totalWithData) * 100) : 0;

      // --- Data-driven knowledge gaps ---
      const dataGaps: string[] = [];

      // 1. Low freshness: categories with many files but few updated recently
      for (const info of infoList) {
        if (info.freshness < LOW_FRESHNESS_THRESHOLD && info.count >= SPARSE_THRESHOLD) {
          const staleCount = info.count - Math.round((info.freshness / 100) * info.count);
          dataGaps.push(`${info.category} 鲜活度 ${info.freshness}%，${staleCount} 个文件超 30 天未更新`);
        }
      }

      // 2. Sparse coverage: categories with too few files
      const ROLE_FLOORS: Record<string, number> = { Engineer: 12, Executive: 8, "Tech Lead": 10, AI: 6, product: 6, SRE: 6, Curator: 10 };
      for (const info of infoList) {
        const floor = ROLE_FLOORS[info.category] ?? 5;
        if (info.count > 0 && info.count < floor) {
          dataGaps.push(`${info.category} 仅 ${info.count} 个文件（建议 ≥${floor}），内容覆盖不足`);
        }
      }

      // 3. Stale files: untouched for 90+ days
      const staleByCat = new Map<string, number>();
      for (const f of files) {
        if (f.updatedAt && f.updatedAt < now - STALE_CUTOFF_MS) {
          const cat = ROLE_LABELS[f.category || ""] || f.category || "Unknown";
          staleByCat.set(cat, (staleByCat.get(cat) || 0) + 1);
        }
      }
      for (const [cat, count] of staleByCat) {
        if (count >= 3) dataGaps.push(`${cat} ${count} 个文件超 90 天未更新，可能过时`);
      }

      // 4. Supplement with curator-defined priorities from health dashboard
      try {
        const healthRes = await readKnowledgeFile("curator/governance/01-治理-知识健康看板.md");
        if (healthRes?.content) {
          const intro = healthRes.content.match(/^# .+\n\n> (.+)/m);
          healthSummary.value = intro ? intro[1] : null;

          const nextSteps = healthRes.content.match(/## 下步优先事项\s*\n([\s\S]*?)(?=\n## |$)/);
          if (nextSteps) {
            const items = nextSteps[1].match(/\d+\.\s*\*\*(.+?)\*\*/g);
            if (items) {
              const curatorGaps = items.map(i => i.replace(/^\d+\.\s*\*\*/, "").replace(/\*\*$/, ""));
              for (const cg of curatorGaps) {
                if (!dataGaps.some(dg => dg.includes(cg.substring(0, 6)))) {
                  dataGaps.push(cg);
                }
              }
            }
          }
        }
      } catch { /* non-critical */ }

      gaps.value = dataGaps.slice(0, 6);
    }

    // Merged activity feed: file updates + bug reports
    const fileActs: ActivityItem[] = allFiles.value
      .filter(f => f.updatedAt && f.updatedAt > weekAgo)
      .map(f => ({
        type: "file" as const,
        path: f.path,
        title: f.meta?.title || f.name,
        category: f.category,
        updatedAt: f.updatedAt!,
        isNew: !!f.meta?.created && new Date(f.meta.created).getTime() > weekAgo
      }));
    const bugActs: ActivityItem[] = recentBugs.value.map(b => ({
      type: "bug" as const,
      title: b.title || b.key,
      severity: b.severity,
      updatedAt: b.updatedAt ?? 0
    }));
    activityItems.value = [...fileActs, ...bugActs]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 15);

    loading.value = false;
  }

  let timer: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    fetchAll();
    timer = setInterval(fetchAll, POLL_MS);
  });

  onUnmounted(() => {
    if (timer !== null) clearInterval(timer);
  });

  return {
    recentBugs, bugSeverity, recentFiles, importantFiles, activityItems,
    totalFiles, categoryInfo,
    avgFreshness, healthSummary, gaps, available, loading, retry: fetchAll
  };
}