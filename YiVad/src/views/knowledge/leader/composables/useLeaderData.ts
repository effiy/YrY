import { ref, computed, onMounted, onUnmounted, type Ref } from "vue";
import { scanKnowledge } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

const LEADER_CATEGORY = "leader";
const POLL_MS = 60_000;
const RECENT_MS = 7 * 86400000;

const SUBDIR_ICONS: Record<string, string> = {
  architecture: "🏛️",
  decisions: "📝",
  risk: "⚠️",
  capacity: "📈",
  roadmap: "🗺️",
  okr: "🎯"
};

const SUBDIR_COLORS: Record<string, string> = {
  architecture: "#1677ff",
  decisions: "#10b981",
  risk: "#ef4444",
  capacity: "#f59e0b",
  roadmap: "#7c3aed",
  okr: "#ec4899"
};

export interface LeaderStats {
  totalFiles: number;
  adrCount: number;
  activeRisks: number;
  capacityItems: number;
  roadmapItems: number;
  healthScore: number;
}

export interface ActivityItem {
  file: KnowledgeFileEntry;
  title: string;
  subdir: string;
  updatedAt: number;
  isNew: boolean;
}

export interface RiskGroup {
  severity: string;
  label: string;
  color: string;
  count: number;
  files: KnowledgeFileEntry[];
}

export function useLeaderData() {
  const allFiles = ref<KnowledgeFileEntry[]>([]);
  const loading = ref(false);
  const error = ref("");
  const lastFetch = ref(0);
  const now = ref(Date.now());

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let clockTimer: ReturnType<typeof setInterval> | null = null;

  const secondsSinceFetch = computed(() => Math.floor((now.value - lastFetch.value) / 1000));

  const subdirs = ["architecture", "decisions", "risk", "capacity", "roadmap", "okr"] as const;

  const filesBySubdir = computed<Record<string, KnowledgeFileEntry[]>>(() => {
    const map: Record<string, KnowledgeFileEntry[]> = {};
    for (const sd of subdirs) map[sd] = [];
    for (const f of allFiles.value) {
      const parts = f.path.split("/");
      if (parts.length >= 2 && subdirs.includes(parts[1] as (typeof subdirs)[number])) {
        map[parts[1]].push(f);
      }
    }
    return map;
  });

  const subdirCounts = computed<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const sd of subdirs) counts[sd] = filesBySubdir.value[sd].length;
    return counts;
  });

  const stats = computed<LeaderStats>(() => {
    const files = allFiles.value;
    const total = files.length;
    const adrCount = filesBySubdir.value.decisions.length;
    const risks = filesBySubdir.value.risk;
    const activeRisks = risks.filter(f => !["resolved", "closed", "deprecated", "archived"].includes(f.meta?.status ?? "")).length;
    const capacityItems = filesBySubdir.value.capacity.length;
    const roadmapItems = filesBySubdir.value.roadmap.length;

    // Health score: % of files that are stable/active (not draft/deprecated/archived)
    const healthy = files.filter(f => {
      const s = f.meta?.status ?? "";
      return ["stable", "active", "evolving"].includes(s);
    }).length;
    const healthScore = total > 0 ? Math.round((healthy / total) * 100) : 100;

    return { totalFiles: total, adrCount, activeRisks, capacityItems, roadmapItems, healthScore };
  });

  const statusDist = computed<Record<string, number>>(() => {
    const dist: Record<string, number> = {};
    for (const f of allFiles.value) {
      const s = f.meta?.status || "unknown";
      dist[s] = (dist[s] || 0) + 1;
    }
    return dist;
  });

  const lifecycleDist = computed<Record<string, number>>(() => {
    const dist: Record<string, number> = {};
    for (const f of allFiles.value) {
      const l = f.meta?.lifecycle || "unspecified";
      dist[l] = (dist[l] || 0) + 1;
    }
    return dist;
  });

  const risks = computed<RiskGroup[]>(() => {
    const groups: Record<string, KnowledgeFileEntry[]> = { critical: [], major: [], minor: [], trivial: [] };
    for (const f of filesBySubdir.value.risk) {
      const sev = f.meta?.severity || "trivial";
      if (groups[sev]) groups[sev].push(f);
    }
    return [
      { severity: "critical", label: "严重", color: "#ef4444", count: groups.critical.length, files: groups.critical },
      { severity: "major", label: "主要", color: "#f59e0b", count: groups.major.length, files: groups.major },
      { severity: "minor", label: "次要", color: "#1677ff", count: groups.minor.length, files: groups.minor },
      { severity: "trivial", label: "轻微", color: "#909399", count: groups.trivial.length, files: groups.trivial }
    ];
  });

  const recentActivity = computed<ActivityItem[]>(() => {
    const cutoff = Date.now() - RECENT_MS;
    return allFiles.value
      .filter(f => f.updatedAt && f.updatedAt > cutoff)
      .map(f => {
        const subdir = f.path.split("/")[1] || "";
        const created = f.meta?.created;
        const isNew = !!created && new Date(created).getTime() > cutoff;
        return {
          file: f,
          title: f.meta?.title || f.name,
          subdir,
          updatedAt: f.updatedAt!,
          isNew
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 15);
  });

  const priorityDist = computed<Record<string, number>>(() => {
    const dist: Record<string, number> = {};
    for (const f of allFiles.value) {
      const p = f.meta?.priority || "unspecified";
      dist[p] = (dist[p] || 0) + 1;
    }
    return dist;
  });

  const typeDist = computed<Record<string, number>>(() => {
    const dist: Record<string, number> = {};
    for (const f of allFiles.value) {
      const t = f.meta?.type || "unknown";
      dist[t] = (dist[t] || 0) + 1;
    }
    return dist;
  });

  function formatTimeAgo(ts: number): string {
    const diff = Date.now() - ts;
    if (diff < 60_000) return "刚刚";
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} 小时前`;
    return `${Math.floor(diff / 86400_000)} 天前`;
  }

  function getSubdirIcon(id: string): string {
    return SUBDIR_ICONS[id] || "📄";
  }

  function getSubdirColor(id: string): string {
    return SUBDIR_COLORS[id] || "#909399";
  }

  async function fetchData() {
    loading.value = true;
    error.value = "";
    try {
      const res = await scanKnowledge(LEADER_CATEGORY);
      allFiles.value = (res.categories?.flatMap(c => c.files) ?? []).filter(f => f.meta?.type !== "rss");
      lastFetch.value = Date.now();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Unknown error";
      allFiles.value = [];
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    fetchData();
    pollTimer = setInterval(fetchData, POLL_MS);
    clockTimer = setInterval(() => { now.value = Date.now(); }, 1000);
  });

  onUnmounted(() => {
    if (pollTimer !== null) clearInterval(pollTimer);
    if (clockTimer !== null) clearInterval(clockTimer);
  });

  return {
    allFiles,
    loading,
    error,
    lastFetch,
    secondsSinceFetch,
    filesBySubdir,
    subdirCounts,
    stats,
    statusDist,
    lifecycleDist,
    risks,
    recentActivity,
    priorityDist,
    typeDist,
    subdirs,
    formatTimeAgo,
    getSubdirIcon,
    getSubdirColor,
    retry: fetchData
  };
}