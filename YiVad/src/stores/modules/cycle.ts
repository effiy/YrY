import { defineStore } from "pinia";
import { ref } from "vue";
import { getCycleList, getCycle, createCycle, updateCycle, deleteCycle } from "@/api/modules/cycleService";
import type { Cycle, CycleQueryParams } from "@/api/modules/cycleService";

export const useCycleStore = defineStore("cycle", () => {
  const cycles = ref<Cycle[]>([]);
  const currentCycle = ref<Cycle | null>(null);
  const total = ref(0);
  const loading = ref(false);

  async function fetchCycles(params: CycleQueryParams = {}) {
    loading.value = true;
    try {
      const res = await getCycleList(params);
      cycles.value = (res.data?.list as Cycle[]) ?? [];
      total.value = res.data?.total ?? 0;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCycle(key: string) {
    const res = await getCycle(key);
    const list = (res.data?.list as Cycle[]) ?? [];
    currentCycle.value = list[0] ?? null;
    return currentCycle.value;
  }

  async function addCycle(data: Omit<Cycle, "created_at" | "updated_at">) {
    await createCycle(data);
    await fetchCycles({ project_key: data.project_key });
  }

  async function editCycle(key: string, data: Partial<Cycle>) {
    await updateCycle(key, data);
    if (currentCycle.value?.key === key) {
      currentCycle.value = { ...currentCycle.value, ...data };
    }
  }

  async function removeCycle(key: string, project_key?: string) {
    await deleteCycle(key);
    if (currentCycle.value?.key === key) {
      currentCycle.value = null;
    }
    if (project_key) {
      await fetchCycles({ project_key });
    }
  }

  async function addIssueToCycle(cycleKey: string, issueKey: string) {
    const cycle = cycles.value.find(c => c.key === cycleKey);
    if (!cycle) return;
    const keys = [...(cycle.issue_keys || []), issueKey];
    await editCycle(cycleKey, { issue_keys: keys });
  }

  async function removeIssueFromCycle(cycleKey: string, issueKey: string) {
    const cycle = cycles.value.find(c => c.key === cycleKey);
    if (!cycle) return;
    const keys = (cycle.issue_keys || []).filter(k => k !== issueKey);
    await editCycle(cycleKey, { issue_keys: keys });
  }

  return {
    cycles,
    currentCycle,
    total,
    loading,
    fetchCycles,
    fetchCycle,
    addCycle,
    editCycle,
    removeCycle,
    addIssueToCycle,
    removeIssueFromCycle
  };
});