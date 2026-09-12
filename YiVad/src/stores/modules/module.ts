import { defineStore } from "pinia";
import { ref } from "vue";
import { getModuleList, getModule, createModule, updateModule, deleteModule } from "@/api/modules/moduleService";
import type { Module } from "@/api/modules/moduleService";

export const useModuleStore = defineStore("module", () => {
  const modules = ref<Module[]>([]);
  const currentModule = ref<Module | null>(null);
  const total = ref(0);
  const loading = ref(false);

  async function fetchModules(params: { project_key?: string; status?: string } = {}) {
    loading.value = true;
    try {
      const res = await getModuleList(params);
      modules.value = (res.data?.list as Module[]) ?? [];
      total.value = res.data?.total ?? 0;
    } finally {
      loading.value = false;
    }
  }

  async function fetchModule(key: string) {
    const res = await getModule(key);
    const list = (res.data?.list as Module[]) ?? [];
    currentModule.value = list[0] ?? null;
    return currentModule.value;
  }

  async function addModule(data: Omit<Module, "created_at" | "updated_at">) {
    await createModule(data);
    await fetchModules({ project_key: data.project_key });
  }

  async function editModule(key: string, data: Partial<Module>) {
    await updateModule(key, data);
    if (currentModule.value?.key === key) {
      currentModule.value = { ...currentModule.value, ...data };
    }
  }

  async function removeModule(key: string, project_key?: string) {
    await deleteModule(key);
    if (currentModule.value?.key === key) currentModule.value = null;
    if (project_key) await fetchModules({ project_key });
  }

  return { modules, currentModule, total, loading, fetchModules, fetchModule, addModule, editModule, removeModule };
});