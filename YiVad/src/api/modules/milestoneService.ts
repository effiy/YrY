/**
 * Milestone API service.
 */
import { callService } from "./dataService";
import type { Milestone } from "@/types/milestone";

const MODULE = "services.milestone.milestone_service";

export function listMilestones(projectKey: string) {
  return callService<{ list: Milestone[] }>(MODULE, "list_milestones", {
    project_key: projectKey,
  });
}

export function createMilestone(data: Partial<Milestone>) {
  return callService<Milestone>(MODULE, "create_milestone", { data });
}

export function updateMilestone(key: string, data: Partial<Milestone>) {
  return callService<Milestone>(MODULE, "update_milestone", { key, data });
}

export function deleteMilestone(key: string) {
  return callService<void>(MODULE, "delete_milestone", { key });
}

export function recalcMilestoneProgress(key: string) {
  return callService<{ progress: number; health: string }>(MODULE, "recalc_progress", { key });
}