/**
 * OKR metadata service — fetches roles, goals, metrics, daily/weekly data,
 * checklists, flow stages, example tasks and launches from MongoDB
 * via the YiAi data_service RPC.
 */
import { queryDocuments } from "./dataService";
import type { QueryDocumentsData } from "@/api/interface/yiweb";

// ── Collection names ────────────────────────────────────────────────

const C = {
  roles: "okr_roles",
  goals: "okr_goals",
  metrics: "okr_metrics",
  goalMetrics: "okr_goal_metrics",
  daily: "okr_daily",
  weekly: "okr_weekly",
  checklists: "okr_checklists",
  flowStages: "okr_flow_stages",
  exampleTasks: "okr_example_tasks",
  exampleLaunches: "okr_example_launches"
} as const;

// ── Types (mirror the Python seed data shapes) ──────────────────────

export interface OkrRole {
  key: string;
  id: string;
  name: string;
  icon: string;
  dir: string;
  description: string;
  projects: string[];
  categories: string[];
}

export interface KeyResult {
  text: string;
  progress: number;
  file?: string;
}

export interface OkrGoal {
  key: string;
  role: string;
  icon: string;
  title: string;
  status: string;
  description: string;
  period: string;
  owner: string;
  project: string;
  keyResults: KeyResult[];
}

export interface OkrMetric {
  key: string;
  role: string;
  icon: string;
  name: string;
  category: string;
  framework: string;
  description: string;
  current: number;
  target: number;
  baseline: number;
  unit: string;
  trend: string;
  progress: number;
}

export interface OkrGoalMetric {
  key: string;
  goalId: string;
  metricIds: string[];
}

export interface OkrDaily {
  key: string;
  role: string;
  yesterday: string[];
  today: string[];
  blocker: string;
  mood: string;
  moodType: string;
}

export interface WeeklyItem {
  text: string;
  file?: string;
}

export interface OkrWeekly {
  key: string;
  role: string;
  status: string;
  statusType: string;
  done: WeeklyItem[];
  blockers: WeeklyItem[];
  nextWeek: WeeklyItem[];
  decisions: WeeklyItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  value?: string;
}

export interface OkrChecklist {
  key: string;
  role: string;
  items: ChecklistItem[];
}

export interface OkrFlowStage {
  key: string;
  label: string;
  en: string;
  icon: string;
  description: string;
  route: string;
  count: number;
}

export interface ExampleSubtask {
  id: string;
  title: string;
  detail: string;
  acceptance: string;
}

export interface OkrExampleTask {
  key: string;
  title: string;
  role: string;
  roleIcon: string;
  roleName: string;
  goalId: string;
  skill: string;
  agent: string;
  mcp: string;
  listType: string;
  priority: string;
  status: string;
  owner: string;
  deadline: string;
  progress: number;
  description: string;
  subtasks: ExampleSubtask[];
}

export interface OkrExampleLaunch {
  key: string;
  project: string;
  projectIcon: string;
  artifact: string;
  version: string;
  env: string;
  status: string;
  deployedAt: string;
  goalId: string;
  taskId: string;
  description: string;
}

/** All OKR metadata in one bundle — fetched in parallel. */
export interface OkrMetadata {
  roles: OkrRole[];
  goals: OkrGoal[];
  metrics: OkrMetric[];
  goalMetrics: OkrGoalMetric[];
  daily: OkrDaily[];
  weekly: OkrWeekly[];
  checklists: OkrChecklist[];
  flowStages: OkrFlowStage[];
  exampleTasks: OkrExampleTask[];
  exampleLaunches: OkrExampleLaunch[];
}

// ── API functions ───────────────────────────────────────────────────

async function fetchAll<T>(cname: string): Promise<T[]> {
  const res = await queryDocuments<T>({ cname, pageSize: 10000 });
  if (res.code !== 0) throw new Error(res.message || `Failed to fetch ${cname}`);
  return res.data?.list ?? [];
}

export function fetchRoles(): Promise<OkrRole[]> {
  return fetchAll<OkrRole>(C.roles);
}

export function fetchGoals(): Promise<OkrGoal[]> {
  return fetchAll<OkrGoal>(C.goals);
}

export function fetchMetrics(): Promise<OkrMetric[]> {
  return fetchAll<OkrMetric>(C.metrics);
}

export function fetchGoalMetrics(): Promise<OkrGoalMetric[]> {
  return fetchAll<OkrGoalMetric>(C.goalMetrics);
}

export function fetchDaily(): Promise<OkrDaily[]> {
  return fetchAll<OkrDaily>(C.daily);
}

export function fetchWeekly(): Promise<OkrWeekly[]> {
  return fetchAll<OkrWeekly>(C.weekly);
}

export function fetchChecklists(): Promise<OkrChecklist[]> {
  return fetchAll<OkrChecklist>(C.checklists);
}

export function fetchFlowStages(): Promise<OkrFlowStage[]> {
  return fetchAll<OkrFlowStage>(C.flowStages);
}

export function fetchExampleTasks(): Promise<OkrExampleTask[]> {
  return fetchAll<OkrExampleTask>(C.exampleTasks);
}

export function fetchExampleLaunches(): Promise<OkrExampleLaunch[]> {
  return fetchAll<OkrExampleLaunch>(C.exampleLaunches);
}

/** Fetch all OKR metadata in parallel. */
export async function fetchAllOkrMetadata(): Promise<OkrMetadata> {
  const [roles, goals, metrics, goalMetrics, daily, weekly, checklists, flowStages, exampleTasks, exampleLaunches] =
    await Promise.all([
      fetchRoles(),
      fetchGoals(),
      fetchMetrics(),
      fetchGoalMetrics(),
      fetchDaily(),
      fetchWeekly(),
      fetchChecklists(),
      fetchFlowStages(),
      fetchExampleTasks(),
      fetchExampleLaunches()
    ]);
  return { roles, goals, metrics, goalMetrics, daily, weekly, checklists, flowStages, exampleTasks, exampleLaunches };
}