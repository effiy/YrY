import { defineStore } from "pinia";
import { ref } from "vue";
import { getModuleList, getModule, createModule, updateModule, deleteModule } from "@/api/modules/moduleService";
import type { Module, ModuleStatus } from "@/api/modules/moduleService";

/* ── Dev mock 种子：只有 RSBUILD_ENV_USE_MOCK=true 且后端返回空时启用 ── */
const _MOCK_MODULES: Module[] = (() => {
  if (import.meta.env.RSBUILD_ENV_USE_MOCK !== "true") return [];
  const now = Date.now();
  const d = (daysAgo: number) => new Date(now - daysAgo * 864e5).toISOString();
  return [
    {
      key: "mod-search", project_key: "yivad",
      name: "全局搜索模块 (mod-search)",
      description: "⌘K 命令面板、/search 页、MRU v2 Pinia 缓存。",
      status: "in_progress", lead: "admin",
      issue_keys: ["ISS-001", "ISS-021"],
      yk_module_path: "modules/2026-10/00-module-全局搜索.md",
      start_date: d(14), due_date: d(-3),
      created_at: d(60), updated_at: d(2),
    },
    {
      key: "mod-kanban", project_key: "yivad",
      name: "看板模块 (mod-kanban)",
      description: "泳道 / 拖拽 / 卡片联查。",
      status: "completed", lead: "admin",
      issue_keys: ["ISS-012"],
      start_date: d(30), due_date: d(7),
      created_at: d(90), updated_at: d(10),
    },
    {
      key: "mod-rag", project_key: "yiknowledge",
      name: "RAG 召回 + 重排 (mod-rag)",
      description: "向量 / 关键词 / 混合检索 + 重排。",
      status: "in_progress", lead: "k1",
      issue_keys: ["ISS-012"],
      start_date: d(20), due_date: d(-10),
      created_at: d(120), updated_at: d(12),
    },
  ];
})();

function _mockSeedModule(key: string): Module | null {
  return _MOCK_MODULES.find(m => m.key === key) ?? null;
}

function _mockSeedModuleList(params: { project_key?: string; status?: string; pageSize?: number; pageNum?: number }) {
  let list = _MOCK_MODULES.slice();
  if (params.project_key) list = list.filter(m => m.project_key === params.project_key);
  if (params.status) list = list.filter(m => m.status === params.status);
  const total = list.length;
  const pn = params.pageNum ?? 1;
  const ps = params.pageSize ?? 50;
  list = list.slice((pn - 1) * ps, pn * ps);
  return { list, total };
}

export const useModuleStore = defineStore("yivad-module", () => {
  const modules = ref<Module[]>([]);
  const currentModule = ref<Module | null>(null);
  const total = ref(0);
  const loading = ref(false);

  async function fetchModules(params: { project_key?: string; status?: string; pageSize?: number; pageNum?: number } = {}) {
    loading.value = true;
    try {
      let list: Module[] = [];
      let t = 0;
      try {
        const res = await getModuleList(params);
        list = (res.data?.list as Module[]) ?? [];
        t = res.data?.total ?? 0;
      } catch (e: any) {
        if (import.meta.env.RSBUILD_ENV_USE_MOCK !== "true") throw e;
        if (e?.name !== "AbortError" && e?.name !== "CanceledError") {
          const s = _mockSeedModuleList(params);
          list = s.list; t = s.total;
        } else {
          throw e;
        }
      }
      if (!list.length && import.meta.env.RSBUILD_ENV_USE_MOCK === "true") {
        const s = _mockSeedModuleList(params);
        list = s.list; t = s.total;
      }
      modules.value = list;
      total.value = t;
    } finally {
      loading.value = false;
    }
  }

  async function fetchModule(key: string) {
    let found: Module | null = null;
    try {
      const res = await getModule(key);
      const list = (res.data?.list as Module[]) ?? [];
      found = list[0] ?? null;
    } catch (e: any) {
      if (import.meta.env.RSBUILD_ENV_USE_MOCK !== "true") throw e;
      if (e?.name !== "AbortError" && e?.name !== "CanceledError") {
        found = _mockSeedModule(key);
      } else {
        throw e;
      }
    }
    if (!found && import.meta.env.RSBUILD_ENV_USE_MOCK === "true") {
      found = _mockSeedModule(key);
    }
    currentModule.value = found;
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
