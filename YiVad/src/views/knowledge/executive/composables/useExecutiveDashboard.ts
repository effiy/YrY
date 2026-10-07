import { ref, computed } from "vue";
import { scanKnowledge } from "@/api/modules/knowledgeService";
import { getRssList, getSeedList } from "@/api/modules/rssService";
import { getReadingListCounts } from "@/api/modules/readingListService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

interface OkrGoalSummary {
  id: string;
  title: string;
  role: string;
  progress: number;
  status: string;
  filePath: string;
}

interface ProcessRecordSummary {
  loopId: string;
  title: string;
  goalId: string;
  stages: number;
  doneStages: number;
  updated?: string;
  filePath: string;
}

interface RssArticleSummary {
  title: string;
  source: string;
  published?: string;
  categoryPath?: string;
  filePath?: string;
}

interface CategoryFileCount {
  id: string;
  icon: string;
  label: string;
  count: number;
}

const SUBDIRS: CategoryFileCount[] = [
  { id: "strategy", icon: "🎯", label: "Strategy", count: 0 },
  { id: "industry", icon: "🏭", label: "Industry", count: 0 },
  { id: "roadmap", icon: "🗺️", label: "Roadmap", count: 0 },
  { id: "reading-list", icon: "📚", label: "Reading List", count: 0 }
];

export function useExecutiveDashboard() {
  const loading = ref(false);
  const error = ref("");

  const knowledgeFileCount = ref(0);
  const categoryCounts = ref<CategoryFileCount[]>(
    SUBDIRS.map(d => ({ ...d }))
  );

  const okrGoals = ref<OkrGoalSummary[]>([]);
  const okrGoalCount = ref(0);

  const rssArticleCount = ref(0);
  const rssTodayCount = ref(0);
  const rssFeedCount = ref(0);
  const rssRecentArticles = ref<RssArticleSummary[]>([]);

  const readingTotal = ref(0);
  const readingInProgress = ref(0);
  const readingDone = ref(0);

  const processRecords = ref<ProcessRecordSummary[]>([]);
  const processTotalLoops = ref(0);

  const okrAvgProgress = computed(() => {
    if (!okrGoals.value.length) return 0;
    return Math.round(okrGoals.value.reduce((s, g) => s + g.progress, 0) / okrGoals.value.length);
  });

  async function fetchAll() {
    loading.value = true;
    error.value = "";
    try {
      const [execFiles, okrFiles, rssRes, rssTodayRes, seedRes, readingCounts] = await Promise.all([
        scanKnowledge("executive"),
        scanKnowledge("okr"),
        getRssList({ pageSize: 5, orderBy: "published_parsed" }),
        getRssList({
          pageSize: 1,
          publishedStart: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
          publishedEnd: new Date(new Date().setHours(23, 59, 59, 999)).getTime()
        }),
        getSeedList({ pageSize: 1 }),
        getReadingListCounts("")
      ]);

      parseKnowledgeFiles(execFiles.categories?.flatMap(c => c.files) ?? []);
      parseOkrFiles(okrFiles.categories?.flatMap(c => c.files) ?? []);
      parseRssData(rssRes, rssTodayRes, seedRes);

      readingTotal.value = readingCounts.total;
      readingInProgress.value = readingCounts.reading;
      readingDone.value = readingCounts.done;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load dashboard data";
    } finally {
      loading.value = false;
    }
  }

  function parseKnowledgeFiles(files: KnowledgeFileEntry[]) {
    const nonRss = files.filter(f => f.meta?.type !== "rss");
    knowledgeFileCount.value = nonRss.length;

    const counts = new Map<string, number>();
    for (const f of nonRss) {
      const dir = f.path.replace(/^executive\//, "").split("/")[0];
      counts.set(dir, (counts.get(dir) ?? 0) + 1);
    }
    categoryCounts.value = SUBDIRS.map(d => ({
      ...d,
      count: counts.get(d.id) ?? 0
    }));
  }

  function parseOkrFiles(files: KnowledgeFileEntry[]) {
    const goals: OkrGoalSummary[] = [];
    const records: ProcessRecordSummary[] = [];
    const loopMap = new Map<string, ProcessRecordSummary>();
    const STAGE_COUNT = 8;

    for (const f of files) {
      const m = f.meta ?? {};
      if (m.type === "okr-goal") {
        const title = (typeof m.title === "string" ? m.title : "") || f.name.replace(/\.md$/, "");
        const progress = Number(m.progress ?? 0) || 0;
        goals.push({
          id: typeof m.id === "string" ? m.id : "",
          title,
          role: typeof m.role === "string" ? m.role : "",
          progress,
          status: typeof m.status === "string" ? m.status : "Planned",
          filePath: f.path
        });
      }

      if (m.type === "loop-record") {
        const loopId = typeof m.loopId === "string" ? m.loopId : "";
        const status = typeof m.status === "string" ? m.status : "in-progress";
        if (!loopId) continue;
        const existing = loopMap.get(loopId);
        if (existing) {
          existing.stages += 1;
          if (status === "done") existing.doneStages += 1;
          if (!existing.updated || (typeof m.updated === "string" && m.updated > existing.updated)) {
            existing.updated = typeof m.updated === "string" ? m.updated : existing.updated;
          }
        } else {
          loopMap.set(loopId, {
            loopId,
            title: typeof m.title === "string" ? m.title : loopId,
            goalId: typeof m.goalId === "string" ? m.goalId : "",
            stages: 1,
            doneStages: status === "done" ? 1 : 0,
            updated: typeof m.updated === "string" ? m.updated : undefined,
            filePath: f.path
          });
        }
      }
    }

    okrGoals.value = goals.sort((a, b) => a.progress - b.progress);
    okrGoalCount.value = goals.length;

    processRecords.value = [...loopMap.values()]
      .sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? ""))
      .slice(0, 5);
    processTotalLoops.value = loopMap.size;
  }

  function parseRssData(
    rssRes: any,
    rssTodayRes: any,
    seedRes: any
  ) {
    rssArticleCount.value = rssRes.data?.total ?? 0;
    rssTodayCount.value = rssTodayRes.data?.total ?? 0;
    rssFeedCount.value = seedRes.data?.total ?? 0;

    const list = rssRes.data?.list ?? [];
    rssRecentArticles.value = list.slice(0, 5).map((item: any) => ({
      title: item.title ?? "",
      source: item.source_name ?? "",
      published: item.published,
      categoryPath: item.category_path,
      filePath: item.file_path
    }));
  }

  return {
    loading,
    error,
    knowledgeFileCount,
    categoryCounts,
    okrGoals,
    okrGoalCount,
    okrAvgProgress,
    rssArticleCount,
    rssTodayCount,
    rssFeedCount,
    rssRecentArticles,
    readingTotal,
    readingInProgress,
    readingDone,
    processRecords,
    processTotalLoops,
    fetchAll
  };
}