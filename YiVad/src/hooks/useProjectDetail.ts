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
import { computed, ref, watch, onMounted, onUnmounted, type Ref } from "vue";
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

async function getKnowledgeFilesGlobal(): Promise<KnowledgeFileEntry[]> {
  if (_kfGlobalCache && Date.now() - _kfGlobalCache.ts < KF_GLOBAL_CACHE_TTL) return _kfGlobalCache.files;
  const res = await listKnowledgeFiles("projects");
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

  async function fetchProject(silent = false): Promise<void> {
    const key = projectKey.value;
    if (!key) {
      loading.value = false;
      headerReady.value = false;
      error.value = "项目 key 缺失";
      return;
    }

    // 0) 新请求推进 seq → 老请求到达结果静默丢弃；同时 dispose 老请求 bag
    const seq = mkSeq();
    bag.dispose();
    const localBag = new DisposerBag();
    bag.addFn(() => localBag.dispose());

    if (!silent) {
      loading.value = true;
      headerReady.value = false;
    }
    error.value = null;
    // 默认先设各 stage 为 success；在阶段内按结果覆写
    stageStatus.value = { knowledge: "success", issues: "success", modules: "success" };

    // P1: Project（单独处理，因失败需要整页 error）
    const p1Started = performance.now();
    try {
      await withRetry(async () => {
        const fetchBag = new DisposerBag();
        localBag.addFn(() => fetchBag.dispose());
        startP1Timer(fetchBag, seq, "project");
        const ctrl = new AbortController();
        fetchBag.addAbort(ctrl);
        const timeoutId = setTimeout(() => ctrl.abort(new DOMException("Project fetch timeout", "AbortError")), P1_TIMEOUT);
        fetchBag.addTimer(timeoutId);
        try {
          await store.fetchProject(key);
        } finally {
          clearTimeout(timeoutId);
        }
      }, P1_RETRY);
      if (!isActive(seq)) return;
      headerReady.value = true;
      pushReliabilityEvent({
        projectKey: key,
        phase: "P1-project",
        status: "success",
        durationMs: Math.max(0, Math.round(performance.now() - p1Started)),
        retryCount: 0
      });
    } catch (err) {
      if (!isActive(seq)) return;
      const dur = Math.max(0, Math.round(performance.now() - p1Started));
      pushReliabilityEvent({
        projectKey: key,
        phase: "P1-project",
        status: "failed",
        durationMs: dur,
        retryCount: 0,
        errorType: classifyReliabilityError(err),
        errorMessage: String((err as any)?.message ?? "")
      });
      error.value = "加载项目失败，请检查网络后重试";
      loading.value = false;
      return;
    }

    // P2: 并行三个 stage，每 stage 完成立即赋值（Partial Rendering）
    const p2Seq = seq;
    const stages = [
      makeKnowledgeStage(key, localBag, knowledgeFiles, allBugs, stageStatus, p2Seq, isActive),
      makeIssuesStage(key, localBag, allIssues, stageStatus, p2Seq, isActive),
      makeModulesStage(key, localBag, allModules, stageStatus, p2Seq, isActive)
    ] as const;

    void runParallelAndTrack(stages, localBag, p2Seq, isActive).then(outcomes => {
      if (!isActive(p2Seq)) return;
      // 仅在三项全失败时才触发整页 error；其余情况静默降级
      const allFailed = outcomes.every(o => o.status === "failed" || o.status === "circuit-open");
      if (allFailed) {
        error.value = "概览数据暂时不可用，请稍后重试";
      } else {
        error.value = null;
      }
      lastUpdated.value = Date.now();
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

  onMounted(fetchProject);

  watch(projectKey, newKey => {
    if (newKey) fetchProject();
  });

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
    run: async () => {
      const global = await getKnowledgeFilesGlobal();
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
    run: async () => {
      const r = await getIssueList({ project_key: projectKey, pageSize: 60 });
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
    run: async () => {
      const r = await getModuleList({ project_key: projectKey, pageSize: 30 });
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
