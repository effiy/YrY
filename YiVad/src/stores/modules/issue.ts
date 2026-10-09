import { defineStore } from "pinia";
import { ref } from "vue";
import { getIssueList, getIssue, createIssue, updateIssue, deleteIssue, normalizeIssue } from "@/api/modules/issueService";
import type { Issue, IssueQueryParams, IssueStatus, IssuePriority, IssueType } from "@/api/modules/issueService";

/* ── Dev mock 种子：只有 RSBUILD_ENV_USE_MOCK=true 且后端返回空时启用 ── */
const _MOCK_ISSUES: Issue[] = (() => {
  if (import.meta.env.RSBUILD_ENV_USE_MOCK !== "true") return [];
  const now = Date.now();
  const d = (daysAgo: number) => new Date(now - daysAgo * 864e5).toISOString();
  return [
    {
      key: "ISS-001", project_key: "yivad", sequence_id: 1,
      title: "全局搜索命令面板（⌘K）结果错链修复",
      description: "覆盖 /search 页与 ⌘K 面板数据源漂移、错误 link 拼接、page 类错链到列表页三大根因。",
      status: "in_progress", priority: "high", issue_type: "requirement",
      assignee: "admin", labels: ["search", "crr"],
      estimate_points: 8, time_estimate: 480, time_spent: 360,
      kb_file_path: "/yivad/issues/ISS-001.md",
      created_at: d(2), updated_at: d(1),
    },
    {
      key: "ISS-012", project_key: "yiknowledge", sequence_id: 12,
      title: "知识库 RAG 多段召回切分优化",
      status: "todo", priority: "medium", issue_type: "improvement",
      assignee: "admin", labels: ["rag", "chunking"],
      estimate_points: 3,
      created_at: d(6), updated_at: d(5),
    },
    {
      key: "ISS-021", project_key: "yiai", sequence_id: 21,
      title: "YiAI /search/unified 增加 version=2 契约",
      status: "todo", priority: "urgent", issue_type: "task",
      assignee: "admin", labels: ["api", "breaking"],
      estimate_points: 5,
      created_at: d(4), updated_at: d(3),
    },
    {
      key: "ISS-002", project_key: "yivad", sequence_id: 2,
      title: "【已归档】登录页背景色不支持 dark mode",
      status: "done", priority: "low", issue_type: "improvement",
      assignee: "admin", labels: ["ui"],
      created_at: d(180), updated_at: d(170),
    },
  ];
})();

function _mockSeedIssue(key: string): Issue | null {
  return _MOCK_ISSUES.find(i => i.key === key) ?? null;
}

function _mockSeedIssueList(params: IssueQueryParams): { list: Issue[]; total: number } {
  let list = _MOCK_ISSUES.slice();
  if (params.project_key) list = list.filter(i => i.project_key === params.project_key);
  if (params.status) list = list.filter(i => i.status === params.status);
  if (params.search) {
    const q = String(params.search).toLowerCase();
    list = list.filter(i =>
      i.key.toLowerCase().includes(q) ||
      i.title.toLowerCase().includes(q) ||
      (i.description || "").toLowerCase().includes(q)
    );
  }
  const total = list.length;
  const pn = params.pageNum ?? 1;
  const ps = params.pageSize ?? 20;
  list = list.slice((pn - 1) * ps, pn * ps);
  return { list, total };
}

export const useIssueStore = defineStore("yivad-issue", () => {
  const issues = ref<Issue[]>([]);
  const currentIssue = ref<Issue | null>(null);
  const total = ref(0);
  const loading = ref(false);

  async function fetchIssues(params: IssueQueryParams = {}) {
    loading.value = true;
    try {
      let list: Issue[] = [];
      let t = 0;
      try {
        const res = await getIssueList(params);
        list = ((res.data?.list ?? []) as unknown as Record<string, unknown>[]).map(normalizeIssue);
        t = res.data?.total ?? 0;
      } catch (err: any) {
        if (import.meta.env.RSBUILD_ENV_USE_MOCK !== "true") throw err;
        // AbortError / 网络错误 / 空响应 都走 mock 种子
        if (err?.name !== "AbortError" && err?.name !== "CanceledError") {
          const seeded = _mockSeedIssueList(params);
          list = seeded.list;
          t = seeded.total;
        } else {
          throw err;
        }
      }
      // 后端无索引的 mock 环境：list 空则走种子
      if (!list.length && import.meta.env.RSBUILD_ENV_USE_MOCK === "true") {
        const seeded = _mockSeedIssueList(params);
        list = seeded.list;
        t = seeded.total;
      }
      issues.value = list;
      total.value = t;
    } finally {
      loading.value = false;
    }
  }

  async function fetchIssue(key: string) {
    let found: Issue | null = null;
    try {
      const res = await getIssue(key);
      const list = (res.data?.list as Issue[]) ?? [];
      found = list[0] ?? null;
    } catch (err: any) {
      if (import.meta.env.RSBUILD_ENV_USE_MOCK !== "true") throw err;
      if (err?.name !== "AbortError" && err?.name !== "CanceledError") {
        found = _mockSeedIssue(key);
      } else {
        throw err;
      }
    }
    if (!found && import.meta.env.RSBUILD_ENV_USE_MOCK === "true") {
      found = _mockSeedIssue(key);
    }
    currentIssue.value = found;
    return currentIssue.value;
  }

  async function addIssue(data: Omit<Issue, "created_at" | "updated_at">) {
    await createIssue(data);
    await fetchIssues({ project_key: data.project_key });
  }

  async function editIssue(key: string, data: Partial<Issue>) {
    await updateIssue(key, data);
    if (currentIssue.value?.key === key) {
      currentIssue.value = { ...currentIssue.value, ...data };
    }
  }

  async function removeIssue(key: string, project_key?: string) {
    // Let backend failures propagate so callers can report them instead of
    // showing a success toast for a delete that never happened.
    await deleteIssue(key);
    issues.value = issues.value.filter(i => i.key !== key);
    if (currentIssue.value?.key === key) {
      currentIssue.value = null;
    }
    if (project_key) {
      await fetchIssues({ project_key, pageNum: 1, pageSize: 20 });
    }
  }

  async function bulkUpdateStatus(keys: string[], status: string) {
    await Promise.all(keys.map(key => updateIssue(key, { status } as any)));
    issues.value = issues.value.map(i => (keys.includes(i.key) ? { ...i, status: status as IssueStatus } : i));
  }

  async function bulkAssign(keys: string[], assignee: string) {
    await Promise.all(keys.map(key => updateIssue(key, { assignee })));
    issues.value = issues.value.map(i => (keys.includes(i.key) ? { ...i, assignee } : i));
  }

  async function bulkDelete(keys: string[]) {
    await Promise.all(keys.map(key => deleteIssue(key)));
    issues.value = issues.value.filter(i => !keys.includes(i.key));
  }

  return {
    issues,
    currentIssue,
    total,
    loading,
    fetchIssues,
    fetchIssue,
    addIssue,
    editIssue,
    removeIssue,
    bulkUpdateStatus,
    bulkAssign,
    bulkDelete
  };
});
