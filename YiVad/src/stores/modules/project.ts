import { defineStore } from "pinia";
import { ref } from "vue";
import { getProjectList, getProjectByIdentifierOrKey, createProject, updateProject, deleteProject } from "@/api/modules/projectService";
import type { Project, ProjectQueryParams, ProjectMember } from "@/api/modules/projectService";

export interface FetchProjectOpts {
  timeout?: number;
  signal?: AbortSignal;
}

/* ── Dev mock 种子：只有 RSBUILD_ENV_USE_MOCK=true 且后端返回空时启用 ── */
const _MOCK_PROJECTS: Project[] = (() => {
  if (import.meta.env.RSBUILD_ENV_USE_MOCK !== "true") return [];
  const now = Date.now();
  const d = (daysAgo: number) => new Date(now - daysAgo * 864e5).toISOString();
  const member = (user_id: string, username: string, role: "owner" | "admin" | "member" = "member"): ProjectMember => ({
    user_id, username, role,
  });
  return [
    {
      key: "yivad", identifier: "yivad", name: "YiVad 研发协同工作台（当前项目）",
      description: "Issue / Project / Module / Page 统一搜索与管理，以 ⌘K + /search 为入口。",
      status: "active",
      members: [member("admin", "Admin", "owner"), member("u2", "Alex", "admin"), member("u3", "Bella", "member"), member("u4", "Carol", "member"), member("u5", "Danny", "member"), member("u6", "Evan", "member"), member("u7", "Fiona", "member")],
      created_at: d(365), updated_at: d(0),
    },
    {
      key: "yiai", identifier: "yiai", name: "YiAI 后端服务（搜索 / AI / 嵌入）",
      description: "/search/unified、/web-search、/compact、SSE 流式对话等后端服务。",
      status: "active",
      members: [member("admin", "Admin", "owner"), member("ai1", "Grace", "admin"), member("ai2", "Henry", "member"), member("ai3", "Ivy", "member"), member("ai4", "Jack", "member")],
      created_at: d(300), updated_at: d(0),
    },
    {
      key: "yiknowledge", identifier: "yiknowledge", name: "YiKnowledge 知识库 + RAG",
      description: "2148 篇文档、312 标签；混合召回 + 重排 RAG 管线。",
      status: "active",
      members: [member("admin", "Admin", "owner"), member("k1", "Kevin", "admin"), member("k2", "Lily", "member")],
      created_at: d(400), updated_at: d(1),
    },
    {
      key: "yipet", identifier: "yipet", name: "YiPet 家庭宠物健康管理",
      description: "喂食、疫苗、体重全量记录。",
      status: "active",
      members: [member("admin", "Admin", "owner"), member("p1", "Mike", "member"), member("p2", "Nina", "member")],
      created_at: d(200), updated_at: d(3),
    },
  ];
})();

function _mockSeedProject(keyOrIdent: string): Project | null {
  const k = String(keyOrIdent || "").toLowerCase();
  return (
    _MOCK_PROJECTS.find(p => p.key.toLowerCase() === k) ??
    _MOCK_PROJECTS.find(p => p.identifier.toLowerCase() === k) ??
    null
  );
}

function _mockSeedProjectList(params: ProjectQueryParams): { list: Project[]; total: number } {
  let list = _MOCK_PROJECTS.slice();
  if (params.status) list = list.filter(p => p.status === params.status);
  if (params.search) {
    const q = String(params.search).toLowerCase();
    list = list.filter(p =>
      p.key.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.identifier.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  }
  const total = list.length;
  const pn = params.pageNum ?? 1;
  const ps = params.pageSize ?? 20;
  list = list.slice((pn - 1) * ps, pn * ps);
  return { list, total };
}

export const useProjectStore = defineStore("yivad-project", () => {
  const projects = ref<Project[]>([]);
  const currentProject = ref<Project | null>(null);
  const total = ref(0);
  const loading = ref(false);

  async function fetchProjects(params: ProjectQueryParams = {}, opts: FetchProjectOpts = {}) {
    loading.value = true;
    try {
      let list: Project[] = [];
      let t = 0;
      try {
        const res = await getProjectList(params, opts);
        list = (res.data?.list as Project[]) ?? [];
        t = res.data?.total ?? 0;
      } catch (e: any) {
        if (import.meta.env.RSBUILD_ENV_USE_MOCK !== "true") throw e;
        if (e?.name !== "AbortError" && e?.name !== "CanceledError") {
          const seeded = _mockSeedProjectList(params);
          list = seeded.list; t = seeded.total;
        } else {
          throw e;
        }
      }
      if (!list.length && import.meta.env.RSBUILD_ENV_USE_MOCK === "true") {
        const seeded = _mockSeedProjectList(params);
        list = seeded.list; t = seeded.total;
      }
      projects.value = list;
      total.value = t;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProject(key: string, opts: FetchProjectOpts = {}) {
    let found: Project | null = null;
    try {
      const res = await getProjectByIdentifierOrKey(key, opts);
      const list = (res.data?.list as Project[]) ?? [];
      found = list[0] ?? null;
    } catch (e: any) {
      if (import.meta.env.RSBUILD_ENV_USE_MOCK !== "true") throw e;
      if (e?.name !== "AbortError" && e?.name !== "CanceledError") {
        found = _mockSeedProject(key);
      } else {
        throw e;
      }
    }
    if (!found && import.meta.env.RSBUILD_ENV_USE_MOCK === "true") {
      found = _mockSeedProject(key);
    }
    currentProject.value = found;
    return currentProject.value;
  }

  async function addProject(data: Omit<Project, "created_at" | "updated_at">) {
    await createProject(data);
    await fetchProjects();
  }

  async function editProject(key: string, data: Partial<Project>) {
    const prev = currentProject.value?.key === key ? { ...currentProject.value } : null;
    if (prev) {
      currentProject.value = { ...currentProject.value!, ...data };
    }
    try {
      await updateProject(key, data);
      await fetchProjects();
    } catch {
      if (prev) currentProject.value = prev;
    }
  }

  async function removeProject(key: string) {
    await deleteProject(key);
    if (currentProject.value?.key === key) {
      currentProject.value = null;
    }
    await fetchProjects();
  }

  async function addMember(projectKey: string, member: ProjectMember) {
    const project = projects.value.find(p => p.key === projectKey);
    if (!project) return;
    const members = [...(project.members || []), member];
    await editProject(projectKey, { members } as any);
  }

  async function removeMember(projectKey: string, userId: string) {
    const project = projects.value.find(p => p.key === projectKey);
    if (!project) return;
    const members = (project.members || []).filter(m => m.user_id !== userId);
    await editProject(projectKey, { members } as any);
  }

  return {
    projects,
    currentProject,
    total,
    loading,
    fetchProjects,
    fetchProject,
    addProject,
    editProject,
    removeProject,
    addMember,
    removeMember
  };
});
