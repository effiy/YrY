/**
 * Fetch OKR goals relevant to the current project from YiKnowledge role directories.
 * OKRs are stored in YiKnowledge/{role}/okr/{quarter}/{goal-id}/goal.md.
 */
import { ref, computed, type Ref, type ComputedRef } from "vue";
import { listKnowledgeFiles } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

export interface OkrGoal {
  id: string;
  title: string;
  role: string;
  project: string;
  progress: number;
  period: string;
  owner: string;
  path: string;
  keyResults: { description: string; completion: number }[];
  metrics: { id: string; description: string; current: string; target: string; completion: number }[];
}

export interface OkrGroup {
  role: string;
  goals: OkrGoal[];
}

const ROLE_NAMES: Record<string, string> = {
  producter: "产品",
  engineer: "工程",
  leader: "技术负责人",
  curator: "知识管理",
  srer: "SRE",
  aier: "AI 工程",
  executiver: "经营",
};

const ROLE_DIRS = Object.keys(ROLE_NAMES);

export interface UseProjectOkrsReturn {
  groups: ComputedRef<OkrGroup[]>;
  loading: Ref<boolean>;
  totalGoals: ComputedRef<number>;
  avgProgress: ComputedRef<number>;
  completedCount: ComputedRef<number>;
  fetch: (projectKey: string) => Promise<void>;
}

export function useProjectOkrs(): UseProjectOkrsReturn {
  const allGoals = ref<OkrGoal[]>([]);
  const loading = ref(false);

  const groups = computed<OkrGroup[]>(() => {
    const map = new Map<string, OkrGoal[]>();
    for (const g of allGoals.value) {
      const list = map.get(g.role) || [];
      list.push(g);
      map.set(g.role, list);
    }
    return [...map.entries()]
      .sort(([, a], [, b]) => b.length - a.length)
      .map(([role, goals]) => ({ role, goals }));
  });

  const totalGoals = computed(() => allGoals.value.length);
  const avgProgress = computed(() => {
    if (!allGoals.value.length) return 0;
    return Math.round(allGoals.value.reduce((s, g) => s + g.progress, 0) / allGoals.value.length);
  });
  const completedCount = computed(() => allGoals.value.filter(g => g.progress >= 100).length);

  /** Parse key results and metrics from goal.md frontmatter */
  function parseGoalMeta(meta: Record<string, unknown>): { keyResults: OkrGoal["keyResults"]; metrics: OkrGoal["metrics"] } {
    const keyResults: OkrGoal["keyResults"] = [];
    const metrics: OkrGoal["metrics"] = [];

    // Parse KR fields: kr1, kr2, ... with kr1_completion, kr2_completion
    for (const [key, val] of Object.entries(meta)) {
      const krMatch = key.match(/^kr(\d+)$/);
      if (krMatch && typeof val === "string") {
        const idx = parseInt(krMatch[1], 10) - 1;
        if (!keyResults[idx]) keyResults[idx] = { description: "", completion: 0 };
        keyResults[idx].description = val;
      }
      const krCompMatch = key.match(/^kr(\d+)_completion$/);
      if (krCompMatch) {
        const idx = parseInt(krCompMatch[1], 10) - 1;
        if (!keyResults[idx]) keyResults[idx] = { description: "", completion: 0 };
        keyResults[idx].completion = typeof val === "number" ? val : parseInt(String(val), 10) || 0;
      }
    }

    // Parse metric fields: metricN_id, metricN_desc, metricN_current, metricN_target
    const metricMap = new Map<number, Partial<OkrGoal["metrics"][number]>>();
    for (const [key, val] of Object.entries(meta)) {
      const mIdMatch = key.match(/^metric(\d+)_id$/);
      const mDescMatch = key.match(/^metric(\d+)_desc$/);
      const mCurMatch = key.match(/^metric(\d+)_current$/);
      const mTarMatch = key.match(/^metric(\d+)_target$/);
      const idx = (mIdMatch || mDescMatch || mCurMatch || mTarMatch)?.[1];
      if (!idx) continue;
      const i = parseInt(idx, 10) - 1;
      if (!metricMap.has(i)) metricMap.set(i, {});
      const entry = metricMap.get(i)!;
      if (mIdMatch && typeof val === "string") entry.id = val;
      if (mDescMatch && typeof val === "string") entry.description = val;
      if (mCurMatch && typeof val === "string") entry.current = val;
      if (mTarMatch && typeof val === "string") entry.target = val;
    }
    for (const [, m] of metricMap) {
      if (m.id && m.description) {
        metrics.push({
          id: m.id || "",
          description: m.description || "",
          current: m.current || "-",
          target: m.target || "-",
          completion: 0,
        });
      }
    }

    return { keyResults, metrics };
  }

  async function fetch(projectKey: string) {
    loading.value = true;
    try {
      const res = await listKnowledgeFiles("");
      const files: KnowledgeFileEntry[] = res.files || [];

      const goals: OkrGoal[] = [];
      const seen = new Set<string>();
      const projectOkrPrefix = `projects/${projectKey}/okrs/`;

      for (const f of files) {
        const meta = f.meta || {};

        // Path 1: Project-level OKR files (projects/{key}/okrs/**/*.md)
        if (f.path.startsWith(projectOkrPrefix) && f.path.endsWith(".md") && f.name !== "README.md") {
          if (seen.has(f.path)) continue;
          seen.add(f.path);

          const { keyResults, metrics } = parseGoalMeta(meta as Record<string, unknown>);
          goals.push({
            id: (meta?.id as string) || "",
            title: (meta?.title as string) || f.name.replace(/\.md$/, ""),
            role: "project",
            project: projectKey,
            progress: (meta?.progress as number) ?? 0,
            period: (meta?.period as string) || "",
            owner: (meta?.owner as string) || "",
            path: f.path,
            keyResults,
            metrics,
          });
          continue;
        }

        // Path 2: Role-based OKR files ({role}/okr/.../goal.md)
        if (!f.name.endsWith("goal.md")) continue;
        const parts = f.path.split("/");
        if (parts.length < 4) continue;
        const roleIdx = parts.findIndex(p => ROLE_DIRS.includes(p));
        if (roleIdx === -1) continue;
        const role = parts[roleIdx];

        const goalProject = (meta?.project as string) || "";
        const matchesProject =
          goalProject.toLowerCase() === projectKey.toLowerCase() ||
          (meta?.project_id as string)?.toLowerCase() === projectKey.toLowerCase();

        if (!matchesProject) continue;
        if (seen.has(f.path)) continue;
        seen.add(f.path);

        const { keyResults, metrics } = parseGoalMeta(meta as Record<string, unknown>);

        goals.push({
          id: (meta?.id as string) || "",
          title: (meta?.title as string) || f.name.replace(/\.md$/, ""),
          role,
          project: goalProject,
          progress: (meta?.progress as number) ?? 0,
          period: (meta?.period as string) || "",
          owner: (meta?.owner as string) || "",
          path: f.path,
          keyResults,
          metrics,
        });
      }

      goals.sort((a, b) => b.progress - a.progress);
      allGoals.value = goals;
    } catch {
      allGoals.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { groups, loading, totalGoals, avgProgress, completedCount, fetch };
}