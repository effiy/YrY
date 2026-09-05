/**
 * Risk detection layer — pure computation over project data and stats.
 * No side effects, no API calls.
 */
import { computed, type ComputedRef, type Ref } from "vue";
import type { Project } from "@/api/modules/projectService";
import type { Issue } from "@/api/modules/issueService";
import { CLOSED_STATUSES, daysSince, RISK_ORDER, STALE_DAYS, type HealthLevel, type ProjectStats, type RiskKey } from "../types";

export interface UseProjectRiskReturn {
  risksByKey: ComputedRef<Map<string, RiskKey[]>>;
  risksFor: (key: string) => RiskKey[];
  /** Pure — takes a risk list, not a project key. */
  healthFor: (risks: RiskKey[]) => HealthLevel;
  riskCounts: ComputedRef<Record<RiskKey, number>>;
  flaggedCount: ComputedRef<number>;
}

export function useProjectRisk(
  projects: Ref<Project[]>,
  issues: Ref<Issue[]>,
  statsByKey: ComputedRef<Map<string, ProjectStats>>,
  filterDateStr?: Ref<string>
): UseProjectRiskReturn {
  const risksByKey = computed(() => {
    const map = new Map<string, RiskKey[]>();
    for (const p of projects.value) {
      const s = statsByKey.value.get(p.key);
      if (!s) { map.set(p.key, []); continue; }
      const risks: RiskKey[] = [];

      const dateIssues = filterDateStr?.value
        ? issues.value.filter(i => (i.due_date || "").slice(0, 10) === filterDateStr.value)
        : issues.value;

      const projectIssues = dateIssues.filter(i => i.project_key === p.key);
      const openIssues = projectIssues.filter(i => !CLOSED_STATUSES.has(i.status));

      // Archived projects are dormant on purpose — only data-shape gaps apply.
      const dormant = p.status === "archived";

      if (openIssues.some(i => i.due_date && new Date(i.due_date) < new Date())) {
        risks.push("overdue");
      }
      if (!dormant && daysSince(s.lastActivity) >= STALE_DAYS) {
        risks.push("stale");
      }
      if (openIssues.some(i => !i.assignee)) {
        risks.push("unassigned");
      }
      if (!(p.members || []).length) {
        risks.push("no_members");
      }
      if (!(p.description || "").trim()) {
        risks.push("no_description");
      }

      map.set(p.key, risks);
    }
    return map;
  });

  function risksFor(key: string): RiskKey[] {
    return risksByKey.value.get(key) ?? [];
  }

  function healthFor(risks: RiskKey[]): HealthLevel {
    if (risks.includes("overdue") || risks.length >= 3) return "poor";
    if (risks.length > 0) return "warn";
    return "good";
  }

  /** How many projects carry each risk — drives the attention strip counts. */
  const riskCounts = computed(() => {
    const counts = {} as Record<RiskKey, number>;
    for (const k of RISK_ORDER) counts[k] = 0;
    for (const risks of risksByKey.value.values()) {
      for (const r of risks) counts[r]++;
    }
    return counts;
  });

  /** Projects carrying at least one risk — the headline "at risk" number. */
  const flaggedCount = computed(() => {
    let n = 0;
    for (const risks of risksByKey.value.values()) if (risks.length) n++;
    return n;
  });

  return { risksByKey, risksFor, healthFor, riskCounts, flaggedCount };
}