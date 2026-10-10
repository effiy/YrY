/**
 * Bug management — Pinia store. Metadata lives in MongoDB (bugs collection);
 * long-form content (description / steps / expected / actual) lives in a
 * markdown file under ~/YiKnowledge/engineer/learn/lessons/bugs/<key>.md.
 */
import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import {
  getBugList, getBug, createBug, updateBug, deleteBug, readBugContent,
  BUG_SLA_HOURS,
} from "@/api/modules/bug";
import type { BugDocument, BugContent, BugSeverity, BugPriority, BugStatus, BugType, BugFrequency, BugTimelineEvent } from "@/api/modules/bug";
import { nanoid } from "nanoid";
import { confirm } from "@/hooks/useConfirmAction";
import { Status } from "@/utils/status";

export type { BugDocument, BugContent, BugSeverity, BugPriority, BugStatus, BugType, BugFrequency, BugTimelineEvent };
export { BUG_SLA_HOURS };

function newKey(): string {
  return `bug_${nanoid(12)}`;
}

const _VALID_STATUSES = new Set<string>([
  Status.OPEN, Status.IN_PROGRESS, Status.RESOLVED, Status.CLOSED, Status.REJECTED, Status.REOPENED,
]);
const _STATUS_NORMALIZE: Record<string, BugStatus> = {
  Open: Status.OPEN, "In Progress": Status.IN_PROGRESS, Resolved: Status.RESOLVED,
  Closed: Status.CLOSED, Rejected: Status.REJECTED, Reopened: Status.REOPENED,
};

function normalizeStatus(raw: string | undefined | null): BugStatus {
  const s = (raw || "").trim();
  if (_VALID_STATUSES.has(s)) return s as BugStatus;
  return _STATUS_NORMALIZE[s] || "open";
}

function emptyForm() {
  return {
    key: "",
    title: "",
    project: "",
    project_key: "",
    issue_key: "",
    module: "",
    iteration: "",
    defectUrl: "",
    severity: "minor" as BugSeverity,
    priority: "p2" as BugPriority,
    status: "open" as BugStatus,
    type: "functional" as BugType,
    assignee: "",
    reporter: "",
    environment: "",
    affectedVersion: "",
    fixedVersion: "",
    frequency: "sometimes" as BugFrequency,
    tags: [] as string[],
    dueDate: null as Date | null,
    // Content (markdown body)
    description: "",
    stepsToReproduce: "",
    expectedResult: "",
    actualResult: "",
    causeProblem: "",
    solution: ""
  };
}

/* ── Legacy bug enricher — fill optional `reopenCount` + `timeline` on
      bugs that come from older payloads so the entire UI can treat them as
      first-class citizens without null-guarding everywhere.           ── */
const DONE_STA = new Set<string>(["resolved", "closed"]);

function _inferReopenCount(b: BugDocument): number {
  if (typeof b.reopenCount === "number" && !Number.isNaN(b.reopenCount)) {
    return Math.max(0, Math.floor(b.reopenCount));
  }
  // Heuristic: status==='reopened' and we have a resolvedAt means the bug
  // was opened → resolved → reopened at least once.
  if (b.status === "reopened" && b.resolvedAt != null) return 1;
  // timeline-based inference: count "reopen" events.
  if (Array.isArray(b.timeline)) {
    const n = b.timeline.filter(e => e.kind === "reopen").length;
    if (n > 0) return n;
  }
  return 0;
}

function _inferTimeline(b: BugDocument): BugTimelineEvent[] {
  if (Array.isArray(b.timeline) && b.timeline.length > 0) {
    return b.timeline.slice().sort((a, z) => a.ts - z.ts);
  }
  const out: BugTimelineEvent[] = [];
  if (b.createdAt) {
    out.push({ kind: "status_change", ts: b.createdAt, from: "", to: "open", by: b.reporter || undefined, note: "Bug created" });
  }
  // If `status` is no longer open but status_change event is missing, we can
  // approximate with updatedAt / resolvedAt / closedAt.
  const inferS = (to: BugStatus, ts: number | null | undefined, note: string) => {
    if (!ts) return;
    // Avoid duplicates with the open event at the exact same ts.
    if (out.length && out[out.length - 1].ts === ts && out[out.length - 1].to === to) return;
    out.push({ kind: "status_change", ts, to, note });
  };
  if (b.status === "in_progress") inferS("in_progress", b.updatedAt, "Bug moved to in progress");
  if (b.resolvedAt != null) inferS("resolved", b.resolvedAt, "Bug resolved");
  if (b.closedAt != null) inferS("closed", b.closedAt, "Bug closed");
  if (b.status === "rejected") inferS("rejected", b.updatedAt, "Bug rejected");
  if (b.status === "reopened") {
    inferS("reopened", b.updatedAt || b.createdAt, "Bug reopened");
    out.push({ kind: "reopen", ts: b.updatedAt || b.createdAt, by: b.assignee || undefined });
  }
  return out.sort((a, z) => a.ts - z.ts);
}

export function enrichBug<T extends BugDocument>(b: T): T {
  const reopenCount = _inferReopenCount(b);
  const timeline = _inferTimeline(b);
  if (b.reopenCount === reopenCount && Array.isArray(b.timeline) && b.timeline.length === timeline.length) {
    return b;
  }
  return { ...b, reopenCount, timeline };
}

export function enrichBugList(list: BugDocument[]): BugDocument[] {
  let changed = false;
  const out: BugDocument[] = new Array(list.length);
  for (let i = 0; i < list.length; i++) {
    const before = list[i];
    const after = enrichBug(before);
    out[i] = after;
    if (after !== before) changed = true;
  }
  return changed ? out : list;
}

const _MOCK_BUGS: BugDocument[] = (() => {
  if (import.meta.env.RSBUILD_ENV_USE_MOCK !== "true") return [];
  const now = Date.now();
  const d = (daysAgo: number) => now - daysAgo * 864e5;
  return [
    {
      key: "BUG-007",
      title: "快捷键 Ctrl+K 被 Chrome 地址栏抢占",
      project: "YiVad", project_key: "yivad",
      issue_key: "ISS-001",
      module: "搜索 (Command Palette / Search)",
      severity: "major", priority: "p1", status: "resolved", type: "compatibility",
      frequency: "always", assignee: "admin", reporter: "QA",
      environment: "Chrome 120 / Windows 11",
      affectedVersion: "v0.9.3", fixedVersion: "v1.0.0",
      tags: ["shortcuts", "command-palette"],
      dueDate: null,
      contentPath: "/yivad/bugs/BUG-007.md",
      createdAt: d(1), updatedAt: d(1), resolvedAt: d(0), closedAt: null,
    },
    {
      key: "BUG-008",
      title: "AbortSignal.any 在 Node 18 下 undefined 导致 504",
      project: "YiAI", project_key: "yiai",
      module: "HTTP Gateway",
      severity: "minor", priority: "p2", status: "open", type: "compatibility",
      frequency: "sometimes", assignee: "admin", reporter: "SRE",
      environment: "Node 18.x SSR / Lambda",
      affectedVersion: "v0.9.2", fixedVersion: "",
      tags: ["ssr", "polyfill"],
      dueDate: null,
      contentPath: "/yiai/bugs/BUG-008.md",
      createdAt: d(9), updatedAt: d(8), resolvedAt: null, closedAt: null,
    },
    {
      key: "BUG-OLD",
      title: "【幽灵】宠物喂食记录导入 500（已 tombstone）",
      project: "YiPet", project_key: "yipet",
      module: "导入/导出",
      severity: "critical", priority: "p0", status: "closed", type: "data",
      frequency: "once", assignee: "admin", reporter: "user-221",
      environment: "Web 端 / Chrome",
      affectedVersion: "v0.1.0", fixedVersion: "v0.3.0",
      tags: ["tombstone"],
      dueDate: null,
      contentPath: "/yipet/bugs/BUG-OLD.md",
      createdAt: d(220), updatedAt: d(219), resolvedAt: d(218), closedAt: d(217),
    },
  ];
})();

function _mockSeedBug(key: string): BugDocument | null {
  return _MOCK_BUGS.find(b => b.key === key) ?? null;
}

function _mockSeedBugList(): { list: BugDocument[]; total: number } {
  return { list: _MOCK_BUGS.slice(), total: _MOCK_BUGS.length };
}

function _mockBugContent(bugKey: string): BugContent {
  if (bugKey === "BUG-007") {
    return {
      description:
        "用户在 Dashboard 按下 Ctrl+K（Windows / Linux）时，被 Chrome 默认的「搜索地址栏」拦截，命令面板无法打开。",
      stepsToReproduce: [
        "登录 YiVad 并停留在任意非输入框页面",
        "按 Ctrl+K",
        "观察焦点",
      ],
      expectedResult: "命令面板弹出。",
      actualResult: "地址栏获得焦点，命令面板未触发。",
      causeProblem: "原 keydown 监听为 passive bubbling 阶段，浏览器默认行为已执行。",
      solution: "main.ts 全局 registry 分发使用 capture:true；CommandPalette.vue 再在 capture 阶段 stopImmediatePropagation 做双层保险。",
    };
  }
  if (bugKey === "BUG-008") {
    return {
      description: "SSR 中使用 AbortSignal.any 触发 TypeError，导致 HTTP 请求整体 504。",
      stepsToReproduce: ["部署到 Node 18 Lambda", "打开任意依赖 unifiedSearch 的页面"],
      expectedResult: "正常渲染。",
      actualResult: "TypeError: AbortSignal.any is not a function → 504。",
      causeProblem: "Node 18 尚未实现 AbortSignal.any。",
      solution: "在信号合并点做 polyfill：手动创建 AbortController 并分别 addEventListener 到外部/内部 signal。",
    };
  }
  return {
    description: "",
    stepsToReproduce: [],
    expectedResult: "",
    actualResult: "",
    causeProblem: "",
    solution: "",
  };
}

export const useBugStore = defineStore("yivad-bug", () => {
  const bugs = ref<BugDocument[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const selectedBug = ref<BugDocument | null>(null);
  const selectedBugContent = ref<BugContent | null>(null);
  const detailLoading = ref(false);

  const dialogVisible = ref(false);
  const isEdit = ref(false);
  const saving = ref(false);
  const form = reactive(emptyForm());

  function resetForm() {
    Object.assign(form, emptyForm());
  }

  async function fetchBugs(_force = false) {
    loading.value = true;
    error.value = null;
    try {
      let list: BugDocument[] = [];
      let t = 0;
      try {
        const res = await getBugList({ pageNum: 1, pageSize: 500 });
        list = res.data?.list ?? [];
        t = res.data?.total ?? 0;
      } catch (e: unknown) {
        if (import.meta.env.RSBUILD_ENV_USE_MOCK !== "true") throw e;
        const err: any = e;
        if (err?.name !== "AbortError" && err?.name !== "CanceledError") {
          const s = _mockSeedBugList();
          list = s.list; t = s.total;
        } else {
          throw e;
        }
      }
      if (!list.length && import.meta.env.RSBUILD_ENV_USE_MOCK === "true") {
        const s = _mockSeedBugList();
        list = s.list; t = s.total;
      }
      bugs.value = enrichBugList(list);
      total.value = t;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load bugs";
    } finally {
      loading.value = false;
    }
  }

  async function loadDetail(key: string) {
    detailLoading.value = true;
    selectedBugContent.value = null;
    try {
      let bug: BugDocument | null = null;
      try {
        bug = await getBug(key);
      } catch (e: unknown) {
        if (import.meta.env.RSBUILD_ENV_USE_MOCK !== "true") throw e;
        const err: any = e;
        if (err?.name !== "AbortError" && err?.name !== "CanceledError") {
          bug = _mockSeedBug(key);
        } else {
          throw e;
        }
      }
      if (!bug && import.meta.env.RSBUILD_ENV_USE_MOCK === "true") {
        bug = _mockSeedBug(key);
      }
      // Fallback 1：从已加载的 bugs 列表中查找（避免 API/detail 未实现时详情页空白）
      if (!bug && bugs.value?.length) {
        const inMem = bugs.value.find(b => b.key === key);
        if (inMem) bug = inMem;
      }
      // Fallback 2：bugs 列表未加载（如列表页用本地 ref 而非 store）时，主动拉一次列表兜底
      if (!bug && (!bugs.value || bugs.value.length === 0)) {
        try {
          await fetchBugs();
        } catch { /* swallow — 继续 fallback */ }
        const inMem = bugs.value?.find(b => b.key === key);
        if (inMem) bug = inMem;
      }
      selectedBug.value = bug ? enrichBug(bug) : null;
      if (bug?.contentPath) {
        try {
          selectedBugContent.value = await readBugContent(bug);
        } catch (_e) {
          if (import.meta.env.RSBUILD_ENV_USE_MOCK === "true") {
            selectedBugContent.value = _mockBugContent(bug.key);
          } else {
            throw _e;
          }
        }
        // 空内容双保险：即使 readBugContent 没有抛错（比如旧 bundle 仍返回空），
        // 所有字段都为空白时 mock 环境仍然填种子，保证 UI 四栏非空桩。
        const sc = selectedBugContent.value;
        const emptySc =
          !sc ||
          (!sc.description &&
            (sc.stepsToReproduce || []).length === 0 &&
            !sc.expectedResult &&
            !sc.actualResult &&
            !sc.causeProblem &&
            !sc.solution);
        if (emptySc && import.meta.env.RSBUILD_ENV_USE_MOCK === "true") {
          selectedBugContent.value = _mockBugContent(bug.key);
        }
      } else {
        // 没有 contentPath：从 bug 标题/描述（或空）生成最低限度的 content，保证详情页非空桩
        const desc = (bug?.description as string) ||
          (bug?.title ? `Bug: ${bug.title}` : "No description provided.");
        selectedBugContent.value = {
          description: desc,
          stepsToReproduce: [],
          expectedResult: "",
          actualResult: "",
          causeProblem: "",
          solution: ""
        };
        // Mock 环境 + 空字段时：根据 severity/priority 推断样例内容
        if (import.meta.env.RSBUILD_ENV_USE_MOCK === "true" && bug) {
          selectedBugContent.value = _mockBugContent(bug.key);
          // 覆盖为当前 bug 的真实标题
          if (bug.title) {
            selectedBugContent.value.description = desc;
          }
        }
      }
    } catch (e: unknown) {
      ElMessage.error(e instanceof Error ? e.message : "Failed to load bug");
      selectedBug.value = null;
    } finally {
      detailLoading.value = false;
    }
  }

  function openCreateDialog(project = "", projectKey = "") {
    isEdit.value = false;
    resetForm();
    form.key = newKey();
    form.project = project;
    form.project_key = projectKey;
    dialogVisible.value = true;
  }

  function openEditDialog(bug: BugDocument, content?: BugContent | null) {
    isEdit.value = true;
    Object.assign(form, {
      key: bug.key,
      title: bug.title ?? "",
      project: bug.project ?? "",
      project_key: bug.project_key ?? "",
      issue_key: bug.issue_key ?? "",
      module: bug.module ?? "",
      iteration: bug.iteration ?? "",
      defectUrl: bug.defectUrl ?? "",
      severity: bug.severity ?? "minor",
      priority: bug.priority ?? "p2",
      status: normalizeStatus(bug.status),
      type: bug.type ?? "functional",
      assignee: bug.assignee ?? "",
      reporter: bug.reporter ?? "",
      environment: bug.environment ?? "",
      affectedVersion: bug.affectedVersion ?? "",
      fixedVersion: bug.fixedVersion ?? "",
      frequency: bug.frequency ?? "sometimes",
      tags: [...(bug.tags ?? [])],
      dueDate: bug.dueDate ? new Date(bug.dueDate) : null,
      description: content?.description ?? "",
      stepsToReproduce: (content?.stepsToReproduce ?? []).join("\n"),
      expectedResult: content?.expectedResult ?? "",
      actualResult: content?.actualResult ?? "",
      causeProblem: content?.causeProblem ?? "",
      solution: content?.solution ?? ""
    });
    dialogVisible.value = true;
  }

  async function handleSave() {
    if (!form.title.trim()) {
      ElMessage.warning("Title is required");
      return;
    }
    saving.value = true;
    try {
      const content: BugContent = {
        description: form.description,
        stepsToReproduce: form.stepsToReproduce
          .split("\n")
          .map(l => l.trim())
          .filter(Boolean),
        expectedResult: form.expectedResult,
        actualResult: form.actualResult,
        causeProblem: form.causeProblem,
        solution: form.solution
      };
      const meta = {
        title: form.title,
        project: form.project,
        project_key: form.project_key,
        issue_key: form.issue_key,
        module: form.module,
        iteration: form.iteration,
        defectUrl: form.defectUrl,
        severity: form.severity,
        priority: form.priority,
        status: form.status,
        type: form.type,
        frequency: form.frequency,
        assignee: form.assignee,
        reporter: form.reporter,
        environment: form.environment,
        affectedVersion: form.affectedVersion,
        fixedVersion: form.fixedVersion,
        tags: form.tags,
        dueDate: form.dueDate ? form.dueDate.getTime() : null
      };
      if (isEdit.value) {
        await updateBug(form.key, meta, content);
        ElMessage.success("Bug updated");
      } else {
        await createBug({ key: form.key, ...meta } as any, content);
        ElMessage.success("Bug created");
      }
      dialogVisible.value = false;
    } catch (e: unknown) {
      ElMessage.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      saving.value = false;
    }
  }

  async function handleDelete(bug: BugDocument, skipConfirm = false) {
    if (!skipConfirm) {
      const ok = await confirm(`Delete bug "${bug.title}"?`, "Confirm");
      if (!ok) return;
    }
    try {
      await deleteBug(bug.key);
      ElMessage.success("Deleted");
      bugs.value = bugs.value.filter(b => b.key !== bug.key);
      total.value = bugs.value.length;
      if (selectedBug.value?.key === bug.key) {
        selectedBug.value = null;
        selectedBugContent.value = null;
      }
    } catch (e: unknown) {
      ElMessage.error(e instanceof Error ? e.message : "Delete failed");
      fetchBugs();
    }
  }

  return {
    bugs,
    total,
    loading,
    error,
    selectedBug,
    selectedBugContent,
    detailLoading,
    dialogVisible,
    isEdit,
    saving,
    form,
    fetchBugs,
    loadDetail,
    openCreateDialog,
    openEditDialog,
    handleSave,
    handleDelete,
    resetForm
  };
});
