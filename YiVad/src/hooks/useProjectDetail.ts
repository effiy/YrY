/**
 * YiVad 项目详情数据 Hook（专业化可靠性 v2）
 *
 * 架构：
 *   P1 Header（8s）：fetchProject(key) → 失败则整页 error
 *   P2 并行 3 阶段（独立超时/熔断/缓存/降级）：
 *     - Knowledge Files  (18s, TTL 15min)
 *     - Issues list (60) (12s, TTL 5min)
 *     - Modules list (30) (10s, TTL 10min)
 *   P3 本地 derive（基于 Knowledge Files → Bugs）
 *   P4 README（DetailOverview 自己加载，不在本 Hook）
 *
 * 可靠性机制：
 *   ✓ 超时分级（不同 stage 不同 timeoutMs）
 *   ✓ 指数退避重试（默认 2 次，总共 3 次尝试）
 *   ✓ 熔断器：每 endpoint 3 次失败 → open → 20s cool-down → half-open 探测
 *   ✓ stale-while-revalidate 持久化缓存（localStorage + 内存 LRU，512KB 总上限）
 *   ✓ 可观测性：每个阶段一条 ReliabilityMetricEvent
 *   ✓ 资源清理：所有 AbortController + Timer 统一 DisposerBag 托管，组件卸载 / 重试 / 新请求时 dispose
 *   ✓ 渐进展示（Partial Rendering）：每个 P2 stage 完成立即写入响应式变量
 *   ✓ 请求序列号：项目切换 / 新请求发起时，旧请求到达结果静默丢弃
 */
import { computed, ref, watch, onUnmounted, type Ref } from "vue";
import { useProjectStore } from "@/stores/modules/project";
import { listKnowledgeFiles } from "@/api/modules/knowledgeService";
import { getIssueList, normalizeIssue } from "@/api/modules/issueService";
import { getModuleList } from "@/api/modules/moduleService";
import { withRetry, type RetryConfig } from "@/api/helper/retry";
import { DisposerBag } from "@/utils/disposer";
import {
  runStage,
  type PipelineStage,
  type StageOutcome,
  type StageStatus
} from "@/utils/reliability/fetchPipeline";
import {
  pushReliabilityEvent,
  classifyReliabilityError
} from "@/utils/reliability/reliabilityMetrics";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import type { Issue } from "@/api/modules/issueService";
import type { Module } from "@/api/modules/moduleService";
import type { BugDocument } from "@/api/modules/bug";
import type { Project } from "@/api/modules/projectService";

export interface ProjectDetailData {
  project: Ref<Project | null>;
  loading: Ref<boolean>;
  headerReady: Ref<boolean>;
  error: Ref<string | null>;
  knowledgeFiles: Ref<KnowledgeFileEntry[]>;
  allIssues: Ref<Issue[]>;
  allModules: Ref<Module[]>;
  allBugs: Ref<BugDocument[]>;
  /** 每个 P2 stage 的最终状态，UI 用来展示区块级降级提示 */
  stageStatus: Ref<Record<"knowledge" | "issues" | "modules", StageStatus>>;
  lastUpdated: Ref<number>;
  retry: () => Promise<void>;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
}

const P1_TIMEOUT = 8_000;
const P1_RETRY: RetryConfig = { maxRetries: 1, retryDelay: 400, backoffMultiplier: 1.5 };

const KF_CACHE_PREFIX = "projects/";

let _kfGlobalCache: { files: KnowledgeFileEntry[]; ts: number } | null = null;
const KF_GLOBAL_CACHE_TTL = 90_000;

async function getKnowledgeFilesGlobal(
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<KnowledgeFileEntry[]> {
  if (_kfGlobalCache && Date.now() - _kfGlobalCache.ts < KF_GLOBAL_CACHE_TTL) return _kfGlobalCache.files;
  const res = await listKnowledgeFiles("projects", opts);
  const files = (res.files as KnowledgeFileEntry[]) ?? [];
  _kfGlobalCache = { files, ts: Date.now() };
  return files;
}

function deriveBugs(files: KnowledgeFileEntry[], projectKey: string): BugDocument[] {
  if (!files.length) return [];
  const prefix = `${KF_CACHE_PREFIX}${projectKey}/bugs/`;
  const bugs: BugDocument[] = [];
  for (const f of files) {
    if (!f.path.startsWith(prefix) || !f.path.endsWith(".md") || f.name === "README.md") continue;
    const m = (f.meta || {}) as Record<string, unknown>;
    bugs.push({
      key: (m.key as string) || f.path,
      title: (m.title as string) || f.name.replace(/\.md$/, ""),
      status: (m.status as string) || "open",
      priority: (m.priority as string) || "p3",
      severity: (m.severity as string) || "minor",
      assignee: (m.assignee as string) || "",
      reporter: (m.reporter as string) || "",
      dueDate: (m.due_date ? new Date(m.due_date as string).getTime() : null) as number | null,
      updatedAt: (m.updated ? new Date(m.updated as string).getTime() : Date.now()) as number,
      createdAt: (m.created ? new Date(m.created as string).getTime() : Date.now()) as number,
      contentPath: f.path,
      project: projectKey,
      project_key: projectKey,
      module: (m.module as string) || "",
      tags: (m.tags as string[]) || [],
      type: (m.type as string) || "bug",
      frequency: (m.frequency as string) || "once",
      environment: (m.environment as string) || "",
      affectedVersion: "",
      fixedVersion: "",
      resolvedAt: null,
      closedAt: null,
      iteration: "",
      defectUrl: ""
    } as BugDocument);
  }
  bugs.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  return bugs;
}

function filterProjectKnowledge(files: KnowledgeFileEntry[], projectKey: string): KnowledgeFileEntry[] {
  const prefix = `${KF_CACHE_PREFIX}${projectKey}/`;
  return files.filter(f => f.path.startsWith(prefix));
}

export function useProjectDetail(projectKey: Ref<string>): ProjectDetailData {
  const store = useProjectStore();

  const loading = ref(true);
  const headerReady = ref(false);
  const error = ref<string | null>(null);
  const knowledgeFiles = ref<KnowledgeFileEntry[]>([]);
  const allIssues = ref<Issue[]>([]);
  const allModules = ref<Module[]>([]);
  const allBugs = ref<BugDocument[]>([]);
  const stageStatus = ref<Record<"knowledge" | "issues" | "modules", StageStatus>>({
    knowledge: "success",
    issues: "success",
    modules: "success"
  });
  const lastUpdated = ref(0);
  const project = computed(() => store.currentProject);

  const bag = new DisposerBag();
  let requestSeq = 0;
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  function isActive(seq: number): boolean {
    return seq === requestSeq && !bag.isDisposed;
  }

  function mkSeq(): number {
    return ++requestSeq;
  }

  function startP1Timer(bagLocal: DisposerBag, seqLocal: number, stage: "project"): void {
    // 仅用作兜底：withRetry 内部也会超时，所以这段是防御性的
    const t = setTimeout(() => {
      // noop：超时由 AbortSignal 触发，这里保留以兼容 bag 统一管理
      void stage;
      void seqLocal;
    }, P1_TIMEOUT + 200);
    bagLocal.addTimer(t);
  }

  let _lastFetchTicket = 0;

  async function fetchProject(silent = false): Promise<void> {
    const key = projectKey.value;
    if (!key) {
      loading.value = false;
      headerReady.value = false;
      error.value = "项目 key 缺失";
      return;
    }

    const ticket = ++_lastFetchTicket;
    const isLatest = () => ticket === _lastFetchTicket && !bag.isDisposed;

    // ⚠️ 关键修复：之前用 bag.dispose() 会把 bag.isDisposed 设为 true，
    // 后续 bag.addFn(() => localBag.dispose()) 会立刻 dispose localBag，
    // 进而引发 fetchBag 被 dispose，最终 ctrl 被 abort，请求被 cancel。
    // 改用 reset() 仅清空容器内条目但保留容器处于活动状态。
    bag.reset();
    const localBag = new DisposerBag();
    bag.addFn(() => localBag.dispose());

    if (!silent) {
      loading.value = true;
      headerReady.value = false;
    }
    error.value = null;
    stageStatus.value = { knowledge: "success", issues: "success", modules: "success" };

    // ── P1 看门狗（最终兜底） ──────────────────────────────────────
    const WATCHDOG_MS = P1_TIMEOUT + 4_000;
    const watchdogTimer = setTimeout(() => {
      if (!isLatest() || headerReady.value || error.value) return;
      if (store.currentProject != null && store.currentProject.key === key) {
        headerReady.value = true;
      } else if (store.currentProject == null) {
        headerReady.value = true;
      } else {
        store.currentProject = null;
        headerReady.value = true;
      }
      loading.value = false;
    }, WATCHDOG_MS);
    localBag.addTimer(watchdogTimer);

    let settled = false;
    const p1Started = performance.now();
    try {
      let __attempt_counter = 0;
      await withRetry(async () => {
        __attempt_counter++;
        const attempt = __attempt_counter - 1;
        const fetchBag = new DisposerBag();
        localBag.addFn(() => fetchBag.dispose());
        startP1Timer(fetchBag, ticket, "project");
        const ctrl = new AbortController();
        fetchBag.addAbort(ctrl);
        const timeoutId = setTimeout(() => ctrl.abort(new DOMException("Project fetch timeout", "AbortError")), P1_TIMEOUT);
        fetchBag.addTimer(timeoutId);
        try {
          await store.fetchProject(key, {
            timeout: P1_TIMEOUT,
            signal: ctrl.signal
          });
        } finally {
          clearTimeout(timeoutId);
        }
      }, P1_RETRY);
      settled = true;
      if (!isLatest()) {
        if (!silent) loading.value = false;
        return;
      }
      headerReady.value = true;
      pushReliabilityEvent({
        projectKey: key,
        phase: "P1-project",
        status: "success",
        durationMs: Math.max(0, Math.round(performance.now() - p1Started)),
        retryCount: 0
      });
    } catch (err) {
      settled = true;
      if (!isLatest()) {
        if (!silent) loading.value = false;
        return;
      }
      const errMsg = String((err as any)?.message ?? (err as any)?.code ?? "");
      const CANCEL_PATTERNS = /AbortError|aborted|canceled|cancelled|the user aborted|ERR_CANCELED|request aborted/i;
      const aborted = CANCEL_PATTERNS.test(errMsg);
      const dur = Math.max(0, Math.round(performance.now() - p1Started));
      pushReliabilityEvent({
        projectKey: key,
        phase: "P1-project",
        status: aborted ? "aborted" as any : "failed",
        durationMs: dur,
        retryCount: 0,
        errorType: classifyReliabilityError(err),
        errorMessage: errMsg
      });
      if (!aborted) {
        error.value = "加载项目失败，请检查网络后重试";
        loading.value = false;
        return;
      }
      if (store.currentProject != null && store.currentProject.key === key) {
        error.value = null;
        headerReady.value = true;
      } else if (store.currentProject == null) {
        error.value = null;
        headerReady.value = true;
      } else {
        store.currentProject = null;
        error.value = "加载项目失败，请检查网络后重试";
      }
      loading.value = false;
      return;
    }

    if (!isLatest()) {
      if (!silent) loading.value = false;
      return;
    }

    const stages = [
      makeKnowledgeStage(key, localBag, knowledgeFiles, allBugs, stageStatus, ticket, isLatest),
      makeIssuesStage(key, localBag, allIssues, stageStatus, ticket, isLatest),
      makeModulesStage(key, localBag, allModules, stageStatus, ticket, isLatest)
    ] as const;

    runParallelAndTrack(stages, localBag, ticket, isLatest).then(outcomes => {
      if (!isLatest()) {
        if (!silent) loading.value = false;
        return;
      }
      const allFailed = outcomes.every(o => o.status === "failed" || o.status === "circuit-open");
      if (allFailed) {
        error.value = "概览数据暂时不可用，请稍后重试";
      } else {
        error.value = null;
      }
      lastUpdated.value = Date.now();
      if (!silent) loading.value = false;
    }).catch(() => {
      if (!isLatest()) {
        if (!silent) loading.value = false;
        return;
      }
      if (!silent) loading.value = false;
    });
  }

  async function runParallelAndTrack<T extends unknown[]>(
    stages: readonly [...{ [K in keyof T]: PipelineStage<T[K]> }],
    disposer: DisposerBag,
    seq: number,
    _isActive: (n: number) => boolean
  ): Promise<{ -readonly [K in keyof T]: StageOutcome<T[K]> }> {
    const seqObj = { current: seq };
    return Promise.all(
      (stages as Array<PipelineStage<any>>).map(s => runStage(s, disposer, seqObj))
    ) as Promise<{ -readonly [K in keyof T]: StageOutcome<T[K]> }>;
  }

  async function retry() {
    return fetchProject(true);
  }

  function startPolling(intervalMs = 60_000) {
    stopPolling();
    pollTimer = setInterval(() => fetchProject(true), intervalMs);
    bag.addTimer(pollTimer);
  }

  function stopPolling() {
    if (pollTimer !== null) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  let _didInitialFetch = false;

  function _attemptBoot(): boolean {
    if (bag.isDisposed) return true;
    const k = projectKey.value;
    if (!k) return false;
    if (_didInitialFetch) return true;
    _didInitialFetch = true;
    void fetchProject();
    return true;
  }

  if (_attemptBoot()) {
    // already started successfully in sync setup
  } else {
    const retries = [50, 200, 500, 1200, 2500, 4000];
    let _attempts = 0;
    const _tryNext = () => {
      if (_attemptBoot()) return;
      if (_attempts >= retries.length) {
        loading.value = false;
        headerReady.value = false;
        error.value = "无法加载项目：项目 key 始终为空。请检查动态路由是否注册。";
        return;
      }
      const delay = retries[_attempts++];
      const t = setTimeout(_tryNext, delay);
      bag.addTimer(t);
    };
    _tryNext();
  }

  watch(
    () => projectKey.value,
    (newKey, oldKey) => {
      const isFirstFlush = oldKey === undefined;
      if (isFirstFlush) return;
      if (newKey && newKey !== oldKey) {
        void fetchProject();
      } else if (!newKey && _didInitialFetch) {
        loading.value = false;
        headerReady.value = false;
        error.value = "项目 key 缺失";
      }
    },
    { flush: "post" }
  );

  onUnmounted(() => {
    stopPolling();
    bag.dispose();
  });

  return {
    project,
    loading,
    headerReady,
    error,
    knowledgeFiles,
    allIssues,
    allModules,
    allBugs,
    stageStatus,
    lastUpdated,
    retry,
    startPolling,
    stopPolling
  };
}

// ────────────────────────────────────────────────────────
//  Stage 工厂（P2 三个阶段）
// ────────────────────────────────────────────────────────

function makeKnowledgeStage(
  projectKey: string,
  _bag: DisposerBag,
  filesRef: Ref<KnowledgeFileEntry[]>,
  bugsRef: Ref<BugDocument[]>,
  statusRef: Ref<Record<"knowledge" | "issues" | "modules", StageStatus>>,
  seq: number,
  isActive: (n: number) => boolean
): PipelineStage<KnowledgeFileEntry[]> {
  return {
    key: "knowledge",
    phase: "P2-knowledge",
    endpoint: `knowledge:${projectKey}`,
    projectKey,
    timeoutMs: 18_000,
    ttlMs: 15 * 60_000,
    run: async (ctrl) => {
      const global = await getKnowledgeFilesGlobal({
        timeoutMs: 18_000,
        signal: ctrl.signal
      });
      return filterProjectKnowledge(global, projectKey);
    },
    fallback: () => filesRef.value.length ? filesRef.value : [],
    onSuccess: (value, info) => {
      if (!isActive(seq)) return;
      filesRef.value = value ?? [];
      bugsRef.value = deriveBugs(filesRef.value, projectKey);
      statusRef.value = { ...statusRef.value, knowledge: info.status as StageStatus };
    },
    onFail: ({ status }) => {
      if (!isActive(seq)) return;
      statusRef.value = { ...statusRef.value, knowledge: status as StageStatus };
    }
  };
}

function makeIssuesStage(
  projectKey: string,
  _bag: DisposerBag,
  issuesRef: Ref<Issue[]>,
  statusRef: Ref<Record<"knowledge" | "issues" | "modules", StageStatus>>,
  seq: number,
  isActive: (n: number) => boolean
): PipelineStage<Issue[]> {
  return {
    key: "issues",
    phase: "P2-issues",
    endpoint: `issues:${projectKey}`,
    projectKey,
    timeoutMs: 12_000,
    ttlMs: 5 * 60_000,
    run: async (ctrl) => {
      const r = await getIssueList(
        { project_key: projectKey, pageSize: 60 },
        { timeoutMs: 12_000, signal: ctrl.signal }
      );
      return (((r as any)?.data?.list ?? []) as unknown as Record<string, unknown>[]).map(normalizeIssue);
    },
    fallback: () => issuesRef.value.length ? issuesRef.value : [],
    onSuccess: (value, info) => {
      if (!isActive(seq)) return;
      issuesRef.value = value ?? [];
      statusRef.value = { ...statusRef.value, issues: info.status as StageStatus };
    },
    onFail: ({ status }) => {
      if (!isActive(seq)) return;
      statusRef.value = { ...statusRef.value, issues: status as StageStatus };
    }
  };
}

function makeModulesStage(
  projectKey: string,
  _bag: DisposerBag,
  modulesRef: Ref<Module[]>,
  statusRef: Ref<Record<"knowledge" | "issues" | "modules", StageStatus>>,
  seq: number,
  isActive: (n: number) => boolean
): PipelineStage<Module[]> {
  return {
    key: "modules",
    phase: "P2-modules",
    endpoint: `modules:${projectKey}`,
    projectKey,
    timeoutMs: 10_000,
    ttlMs: 10 * 60_000,
    run: async (ctrl) => {
      const r = await getModuleList(
        { project_key: projectKey, pageSize: 30 },
        { timeout: 10_000, signal: ctrl.signal }
      );
      return ((r as any)?.data?.list as Module[]) ?? [];
    },
    fallback: () => modulesRef.value.length ? modulesRef.value : [],
    onSuccess: (value, info) => {
      if (!isActive(seq)) return;
      modulesRef.value = value ?? [];
      statusRef.value = { ...statusRef.value, modules: info.status as StageStatus };
    },
    onFail: ({ status }) => {
      if (!isActive(seq)) return;
      statusRef.value = { ...statusRef.value, modules: status as StageStatus };
    }
  };
}
