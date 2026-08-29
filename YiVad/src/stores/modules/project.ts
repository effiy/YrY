import { defineStore } from "pinia";
import { ref } from "vue";
import { getProjectList, getProject, createProject, updateProject, deleteProject } from "@/api/modules/projectService";
import type { Project, ProjectQueryParams, ProjectMember } from "@/api/modules/projectService";

export const useProjectStore = defineStore("project", () => {
  const projects = ref<Project[]>([]);
  const currentProject = ref<Project | null>(null);
  const total = ref(0);
  const loading = ref(false);

  async function fetchProjects(params: ProjectQueryParams = {}) {
    loading.value = true;
    try {
      const res = await getProjectList(params);
      projects.value = (res.data?.list as Project[]) ?? [];
      total.value = res.data?.total ?? 0;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProject(key: string) {
    const res = await getProject(key);
    const list = (res.data?.list as Project[]) ?? [];
    currentProject.value = list[0] ?? null;
    return currentProject.value;
  }

  async function addProject(data: Omit<Project, "created_at" | "updated_at">) {
    await createProject(data);
    await fetchProjects();
  }

  async function editProject(key: string, data: Partial<Project>) {
    await updateProject(key, data);
    if (currentProject.value?.key === key) {
      currentProject.value = { ...currentProject.value, ...data };
    }
    await fetchProjects();
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