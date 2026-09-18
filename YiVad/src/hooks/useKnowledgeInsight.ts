/**
 * Knowledge-driven insights for the home page.
 * Fetches YiKnowledge metadata: bugs, files, and health metrics.
 */
import { ref, onMounted, onUnmounted, type Ref } from "vue";
import { listKnowledgeBugs, listKnowledgeFiles, readKnowledgeFile } from "@/api/modules/knowledgeService";
import type { KnowledgeBugEntry, KnowledgeFileEntry } from "@/api/interface/yiAi";

export interface KnowledgeInsight {
  recentBugs: Ref<KnowledgeBugEntry[]>;
  /** Severity distribution: critical, major, minor, trivial counts */
  bugSeverity: Ref<Record<string, number>>;
  recentFiles: Ref<KnowledgeFileEntry[]>;
  totalFiles: Ref<number>;
  categoryCounts: Ref<Array<{ category: string; count: number; maturity: number }>>;
  healthSummary: Ref<string | null>;
  gaps: Ref<string[]>;
  available: Ref<boolean>;
  loading: Ref<boolean>;
  retry: () => Promise<void>;
}

const ROLE_LABELS: Record<string, string> = {
  engineer: "Engineer",
  executiver: "Executive",
  leader: "Tech Lead",
  aier: "AI",
  producter: "Producter",
  srer: "SRE",
  curator: "Curator"
};

const POLL_MS = 120_000;

export function useKnowledgeInsight(): KnowledgeInsight {
  const recentBugs = ref<KnowledgeBugEntry[]>([]);
  const bugSeverity = ref<Record<string, number>>({});
  const recentFiles = ref<KnowledgeFileEntry[]>([]);
  const totalFiles = ref(0);
  const categoryCounts = ref<Array<{ category: string; count: number; maturity: number }>>([]);
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

      const weekAgo = Date.now() - 7 * 86400000;
      recentFiles.value = files
        .filter(f => f.updatedAt && f.updatedAt > weekAgo)
        .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
        .slice(0, 8);

      const catMap = new Map<string, number>();
      for (const f of files) {
        const cat = f.category || "__root__";
        if (cat !== "__root__") catMap.set(cat, (catMap.get(cat) ?? 0) + 1);
      }
      const total = totalFiles.value || 1;
      categoryCounts.value = Array.from(catMap.entries())
        .map(([category, count]) => ({
          category: ROLE_LABELS[category] || category,
          count,
          // Maturity = category's share of total knowledge base (0-100)
          maturity: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.count - a.count);
    }

    // Health dashboard (best-effort, non-blocking)
    try {
      const healthRes = await readKnowledgeFile("curator/governance/01-治理-知识健康看板.md");
      if (healthRes?.content) {
        const intro = healthRes.content.match(/^# .+\n\n> (.+)/m);
        healthSummary.value = intro ? intro[1] : null;

        const nextSteps = healthRes.content.match(/## 下步优先事项\s*\n([\s\S]*?)(?=\n## |$)/);
        if (nextSteps) {
          const items = nextSteps[1].match(/\d+\.\s*\*\*(.+?)\*\*/g);
          if (items) gaps.value = items.map(i => i.replace(/^\d+\.\s*\*\*/, "").replace(/\*\*$/, ""));
        }
      }
    } catch { /* non-critical */ }

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
    recentBugs, bugSeverity, recentFiles, totalFiles, categoryCounts,
    healthSummary, gaps, available, loading, retry: fetchAll
  };
}