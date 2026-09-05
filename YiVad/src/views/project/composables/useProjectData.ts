/**
 * Data loading layer — fetches projects, issues, and bugs in full.
 * No aggregation, filtering, or statistics logic.
 */
import { ref, type Ref } from "vue";
import { getProjectList, type Project } from "@/api/modules/projectService";
import { getIssueList, type Issue } from "@/api/modules/issueService";
import { getBugList, type BugDocument } from "@/api/modules/bug";
import { getModuleList, type Module } from "@/api/modules/moduleService";

export interface UseProjectDataReturn {
  loading: Ref<boolean>;
  lastUpdated: Ref<string>;
  projects: Ref<Project[]>;
  issues: Ref<Issue[]>;
  bugs: Ref<BugDocument[]>;
  modules: Ref<Module[]>;
  load: () => Promise<void>;
}

export function useProjectData(): UseProjectDataReturn {
  const loading = ref(false);
  const lastUpdated = ref("");
  const projects = ref<Project[]>([]);
  const issues = ref<Issue[]>([]);
  const bugs = ref<BugDocument[]>([]);
  const modules = ref<Module[]>([]);

  async function load() {
    loading.value = true;
    try {
      const [projectRes, issueRes, bugRes, moduleRes] = await Promise.all([
        getProjectList({ pageSize: 500 }),
        getIssueList({ pageSize: 2000 }),
        getBugList({ pageSize: 2000 }),
        getModuleList({ pageSize: 2000 })
      ]);
      projects.value = (projectRes.data?.list as Project[]) ?? [];
      issues.value = (issueRes.data?.list as Issue[]) ?? [];
      bugs.value = (bugRes.data?.list as BugDocument[]) ?? [];
      modules.value = (moduleRes.data?.list as Module[]) ?? [];
      lastUpdated.value = new Date().toLocaleTimeString();
    } finally {
      loading.value = false;
    }
  }

  return { loading, lastUpdated, projects, issues, bugs, modules, load };
}