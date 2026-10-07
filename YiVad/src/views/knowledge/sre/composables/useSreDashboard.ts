import { ref, onMounted, onBeforeUnmount } from "vue";
import { getQualityMetrics } from "@/api/modules/analyticsService";
import { scanKnowledge } from "@/api/modules/knowledgeService";
import type { QualityMetrics } from "@/types/analytics";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

const POLL_INTERVAL = 60_000;

interface SreSubdir {
  id: string;
  icon: string;
  label: string;
  color: string;
  desc: string;
}

export const SRE_SUBDIRS: SreSubdir[] = [
  {
    id: "incident-response",
    icon: "🚨",
    label: "Incident Response",
    color: "#ef4444",
    desc: "Production incident management lifecycle — war room protocols, blast radius analysis, rollback drills, oncall handovers, postmortems, and chaos engineering experiments."
  },
  {
    id: "observability",
    icon: "📊",
    label: "Observability",
    color: "#1677ff",
    desc: "Monitoring and observability stack — logs, metrics, traces triad, Docker/K8s monitoring, GPU inference observability, CI/CD pipeline visibility, and SLO tracking dashboards."
  },
  {
    id: "release",
    icon: "🚀",
    label: "Release",
    color: "#10b981",
    desc: "Safe deployment practices — canary releases, hotfix protocols, release freeze management, rollback procedures, and progressive delivery strategies."
  }
];

export function useSreDashboard() {
  const loading = ref(true);
  const error = ref("");
  const quality = ref<QualityMetrics | null>(null);
  const knowledgeFiles = ref<KnowledgeFileEntry[]>([]);
  const lastUpdated = ref<Date | null>(null);
  const freshnessSeconds = ref<number | null>(null);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  async function loadQuality() {
    try {
      const res = await getQualityMetrics({});
      const data = (res as any).data ?? res;
      quality.value = data as QualityMetrics;
      freshnessSeconds.value = (data as any).freshness_seconds ?? null;
      lastUpdated.value = new Date();
    } catch (e: unknown) {
      // keep last known data, only set error if we have nothing
      if (!quality.value) {
        error.value = e instanceof Error ? e.message : "Failed to load quality metrics";
      }
    }
  }

  async function loadKnowledge() {
    try {
      const res = await scanKnowledge("sre");
      knowledgeFiles.value = (res.categories?.flatMap(c => c.files) ?? []).filter(
        f => f.meta?.type !== "rss"
      );
    } catch (e: unknown) {
      if (!knowledgeFiles.value.length) {
        error.value = e instanceof Error ? e.message : "Failed to load knowledge files";
      }
    }
  }

  async function refresh() {
    loading.value = true;
    error.value = "";
    await Promise.all([loadQuality(), loadKnowledge()]);
    loading.value = false;
  }

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(loadQuality, POLL_INTERVAL);
  }

  function stopPolling() {
    if (pollTimer !== null) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function filesByDir(dirId: string): KnowledgeFileEntry[] {
    return knowledgeFiles.value.filter(f => {
      const dirName = f.path.replace(/^sre\//, "").split("/")[0];
      return dirName === dirId;
    });
  }

  onMounted(async () => {
    await refresh();
    startPolling();
  });

  onBeforeUnmount(() => {
    stopPolling();
  });

  return {
    loading,
    error,
    quality,
    knowledgeFiles,
    lastUpdated,
    freshnessSeconds,
    refresh,
    startPolling,
    stopPolling,
    filesByDir
  };
}