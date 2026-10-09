import { ref, computed, onBeforeUnmount } from "vue";
import { scanKnowledge } from "@/api/modules/knowledgeService";
import { getRssList, getSeedList } from "@/api/modules/rssService";
import { getReadingListCounts } from "@/api/modules/readingListService";
import { DisposerBag } from "@/utils/disposer";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

// ═══════════════════════════════════════════════════════════
// 常量区 —— 消除魔数，统一语义化命名
// ═══════════════════════════════════════════════════════════

/** Loop 生命周期总阶段数（用于 Progress 计算的分母） */
export const PROCESS_TOTAL_STAGES = 8;

/** OKR 列表展示上限（首页预览） */
export const OKR_PREVIEW_LIMIT = 6;

/** 流程记录展示上限（首页预览） */
export const PROCESS_PREVIEW_LIMIT = 5;

/** RSS 最新文章展示上限（首页预览） */
export const RSS_PREVIEW_LIMIT = 5;

/** Hook 级 Watchdog 超时阈值（毫秒）—— 防止骨架屏永久挂死 */
export const HOOK_WATCHDOG_TIMEOUT_MS = 12_000;

/** 各 API 独立超时阈值（毫秒） */
const API_TIMEOUT = {
  SCAN_KNOWLEDGE: 15_000,
  RSS_LIST: 12_000,
  RSS_TODAY: 8_000,
  RSS_SEED: 8_000,
  READING_COUNTS: 8_000
} as const;

// ═══════════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════════

export interface OkrGoalSummary {
  id: string;
  title: string;
  role: string;
  progress: number;
  status: string;
  filePath: string;
}

export interface ProcessRecordSummary {
  loopId: string;
  title: string;
  goalId: string;
  stages: number;
  doneStages: number;
  updated?: string;
  filePath: string;
}

export interface RssArticleSummary {
  title: string;
  source: string;
  published?: string;
  categoryPath?: string;
  filePath?: string;
}

export interface CategoryFileCount {
  id: string;
  icon: string;
  label: string;
  count: number;
}

/** 知识域分类与角色路由映射表（SSOT） */
export const EXECUTIVE_SUBDIRS: readonly CategoryFileCount[] = [
  { id: "strategy", icon: "🧭", label: "战略知识库", count: 0 },
  { id: "industry", icon: "🏭", label: "行业情报库", count: 0 },
  { id: "roadmap", icon: "🗺️", label: "路线图库", count: 0 },
  { id: "reading-list", icon: "📚", label: "阅读清单库", count: 0 }
] as const;

// ═══════════════════════════════════════════════════════════
// Composable 主体
// ═══════════════════════════════════════════════════════════

export function useExecutiveDashboard() {
  // ── 资源托管容器 ──
  const bag = new DisposerBag();

  // ── 基础状态 ──
  const loading = ref(false);
  const error = ref("");
  /** Watchdog 触发标志 —— 用于 UI 层区分"正常超时"与接口报错 */
  const watchdogTriggered = ref(false);

  const knowledgeFileCount = ref(0);
  const categoryCounts = ref<CategoryFileCount[]>(
    EXECUTIVE_SUBDIRS.map((d) => ({ ...d }))
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

  // ── 计算属性 ──
  const okrAvgProgress = computed(() => {
    if (!okrGoals.value.length) return 0;
    return Math.round(
      okrGoals.value.reduce((s, g) => s + g.progress, 0) / okrGoals.value.length
    );
  });

  // ────────────────────────────────────────────
  // 核心数据加载 —— 全链路 AbortSignal + Watchdog
  // ────────────────────────────────────────────
  async function fetchAll() {
    // ── Guard 01: 清理上一轮残留但保留容器可复用 ──
    bag.reset();
    loading.value = true;
    error.value = "";
    watchdogTriggered.value = false;

    // ── Guard 02: 本次请求的 AbortController（便于手动中断） ──
    const requestCtrl = new AbortController();
    bag.addAbort(requestCtrl);

    // ── Guard 03: Hook 级 Watchdog —— 防止 Promise 被吞或远端无响应 ──
    const watchdogTimer = setTimeout(() => {
      if (!loading.value) return;
      watchdogTriggered.value = true;
      error.value = `数据加载超时（>${Math.round(HOOK_WATCHDOG_TIMEOUT_MS / 1000)}s），请检查 YiAi 服务状态后重试`;
      loading.value = false;
      try {
        requestCtrl.abort(new DOMException(`Hook watchdog timeout: ${HOOK_WATCHDOG_TIMEOUT_MS}ms`, "AbortError"));
      } catch {
        /* noop */
      }
    }, HOOK_WATCHDOG_TIMEOUT_MS);
    bag.addTimer(watchdogTimer);

    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const [execFiles, okrFiles, rssRes, rssTodayRes, seedRes, readingCounts] = await Promise.all([
        scanKnowledge("executive", {
          timeoutMs: API_TIMEOUT.SCAN_KNOWLEDGE,
          signal: requestCtrl.signal
        }),
        scanKnowledge("okr", {
          timeoutMs: API_TIMEOUT.SCAN_KNOWLEDGE,
          signal: requestCtrl.signal
        }),
        getRssList(
          { pageSize: RSS_PREVIEW_LIMIT, orderBy: "published_parsed" },
          { timeout: API_TIMEOUT.RSS_LIST, signal: requestCtrl.signal }
        ),
        getRssList(
          {
            pageSize: 1,
            publishedStart: todayStart.getTime(),
            publishedEnd: todayEnd.getTime()
          },
          { timeout: API_TIMEOUT.RSS_TODAY, signal: requestCtrl.signal }
        ),
        getSeedList(
          { pageSize: 1 },
          { timeout: API_TIMEOUT.RSS_SEED, signal: requestCtrl.signal }
        ),
        getReadingListCounts("", {
          timeout: API_TIMEOUT.READING_COUNTS,
          signal: requestCtrl.signal
        })
      ]);

      parseKnowledgeFiles(execFiles.categories?.flatMap((c) => c.files) ?? []);
      parseOkrFiles(okrFiles.categories?.flatMap((c) => c.files) ?? []);
      parseRssData(rssRes, rssTodayRes, seedRes);

      readingTotal.value = readingCounts.total;
      readingInProgress.value = readingCounts.reading;
      readingDone.value = readingCounts.done;
    } catch (e: unknown) {
      // ── Guard 04: Abort 类错误不视为业务错误 ──
      if (e instanceof DOMException && e.name === "AbortError") {
        // Watchdog 已在上游设置 error 文案；手动 abort 情况走兜底文案
        if (!error.value) {
          error.value = "请求已取消，点击重试重新加载";
        }
      } else {
        error.value = e instanceof Error ? e.message : "仪表盘数据加载失败";
      }
    } finally {
      // ── Guard 05: 任何分支必须重置 loading，防止骨架屏永久挂死 ──
      loading.value = false;
      // 清理 Watchdog timer（正常完成路径）
      if (watchdogTimer) {
        clearTimeout(watchdogTimer);
      }
    }
  }

  // ────────────────────────────────────────────
  // 数据解析函数（纯函数，不涉及副作用）
  // ────────────────────────────────────────────

  function parseKnowledgeFiles(files: KnowledgeFileEntry[]) {
    const nonRss = files.filter((f) => f.meta?.type !== "rss");
    knowledgeFileCount.value = nonRss.length;

    const counts = new Map<string, number>();
    for (const f of nonRss) {
      const dir = f.path.replace(/^executive\//, "").split("/")[0];
      counts.set(dir, (counts.get(dir) ?? 0) + 1);
    }
    categoryCounts.value = EXECUTIVE_SUBDIRS.map((d) => ({
      ...d,
      count: counts.get(d.id) ?? 0
    }));
  }

  function parseOkrFiles(files: KnowledgeFileEntry[]) {
    const goals: OkrGoalSummary[] = [];
    const loopMap = new Map<string, ProcessRecordSummary>();

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
          const mUpdated = typeof m.updated === "string" ? m.updated : "";
          if (mUpdated && (!existing.updated || mUpdated > existing.updated)) {
            existing.updated = mUpdated;
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

    // 按进度升序：落后的 KR 优先曝光，符合管理层仪表盘直觉
    okrGoals.value = goals.sort((a, b) => a.progress - b.progress);
    okrGoalCount.value = goals.length;

    processRecords.value = [...loopMap.values()]
      .sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? ""))
      .slice(0, PROCESS_PREVIEW_LIMIT);
    processTotalLoops.value = loopMap.size;
  }

  function parseRssData(rssRes: any, rssTodayRes: any, seedRes: any) {
    rssArticleCount.value = rssRes.data?.total ?? 0;
    rssTodayCount.value = rssTodayRes.data?.total ?? 0;
    rssFeedCount.value = seedRes.data?.total ?? 0;

    const list = rssRes.data?.list ?? [];
    rssRecentArticles.value = list.slice(0, RSS_PREVIEW_LIMIT).map((item: any) => ({
      title: item.title ?? "",
      source: item.source_name ?? "",
      published: item.published,
      categoryPath: item.category_path,
      filePath: item.file_path
    }));
  }

  // ────────────────────────────────────────────
  // 生命周期清理
  // ────────────────────────────────────────────
  onBeforeUnmount(() => {
    bag.dispose();
  });

  return {
    // 状态
    loading,
    error,
    watchdogTriggered,
    // 知识文件
    knowledgeFileCount,
    categoryCounts,
    // OKR
    okrGoals,
    okrGoalCount,
    okrAvgProgress,
    // RSS
    rssArticleCount,
    rssTodayCount,
    rssFeedCount,
    rssRecentArticles,
    // 阅读
    readingTotal,
    readingInProgress,
    readingDone,
    // 流程记录
    processRecords,
    processTotalLoops,
    // 常量导出（供模板使用）
    PROCESS_TOTAL_STAGES,
    OKR_PREVIEW_LIMIT,
    // 行为
    fetchAll
  };
}
