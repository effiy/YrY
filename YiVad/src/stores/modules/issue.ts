import { defineStore } from "pinia";
import { ref } from "vue";
import { getIssueList, getIssue, createIssue, updateIssue, deleteIssue } from "@/api/modules/issueService";
import type { Issue, IssueQueryParams } from "@/api/modules/issueService";

export const useIssueStore = defineStore("issue", () => {
  const issues = ref<Issue[]>([]);
  const currentIssue = ref<Issue | null>(null);
  const total = ref(0);
  const loading = ref(false);

  async function fetchIssues(params: IssueQueryParams = {}) {
    loading.value = true;
    try {
      const res = await getIssueList(params);
      issues.value = (res.data?.list as Issue[]) ?? [];
      total.value = res.data?.total ?? 0;
    } finally {
      loading.value = false;
    }
  }

  async function fetchIssue(key: string) {
    const res = await getIssue(key);
    const list = (res.data?.list as Issue[]) ?? [];
    currentIssue.value = list[0] ?? null;
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
    try {
      await deleteIssue(key);
      issues.value = issues.value.filter(i => i.key !== key);
      total.value = issues.value.length;
    } catch {
      // fall back to a full reload below
    }
    if (currentIssue.value?.key === key) {
      currentIssue.value = null;
    }
    if (project_key) {
      await fetchIssues({ project_key, pageNum: 1, pageSize: 20 });
    }
  }

  async function bulkUpdateStatus(keys: string[], status: string) {
    await Promise.all(keys.map(key => updateIssue(key, { status } as any)));
    issues.value = issues.value.map(i =>
      keys.includes(i.key) ? { ...i, status: status as any } : i
    );
  }

  async function bulkAssign(keys: string[], assignee: string) {
    await Promise.all(keys.map(key => updateIssue(key, { assignee } as any)));
    issues.value = issues.value.map(i =>
      keys.includes(i.key) ? { ...i, assignee } : i
    );
  }

  async function bulkDelete(keys: string[]) {
    await Promise.all(keys.map(key => deleteIssue(key)));
    issues.value = issues.value.filter(i => !keys.includes(i.key));
    total.value = issues.value.length;
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