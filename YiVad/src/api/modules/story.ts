/**
 * Story CRUD — calls YiAi data-service RPC for the "stories" collection.
 * Each story contains multiple scenarios describing concrete use cases.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import type { YiAiEnvelope } from "@/api/interface/yiweb";

const CNAME = "stories";

// ── Types ──

export type StoryStatus = "planning" | "design" | "develop" | "testing" | "operations" | "archived";
export type ScenarioStatus = StoryStatus;
export type ScenarioPriority = "p0" | "p1" | "p2" | "p3";
export type ScheduleStatus = "planned" | "on_track" | "at_risk" | "delayed" | "completed";

export interface ScenarioStep {
  order: number;
  action: string; // "Given" | "When" | "Then" | "And"
  description: string;
}

export interface AiCodingEntry {
  prompt: string;
  generatedAt: number;
}

export interface Scenario {
  key: string;
  name: string;
  description: string;
  priority: ScenarioPriority;
  status: ScenarioStatus;
  steps: ScenarioStep[];
  tags: string[];
  aiCodingHistory?: AiCodingEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface StoryDocument {
  key: string;
  name: string;
  project: string;
  status: StoryStatus;
  priority: ScenarioPriority;
  description: string;
  background: string;
  acceptance: string;
  assignee: string;
  // Schedule
  startDate: number | null;
  dueDate: number | null;
  completedAt: number | null;
  sprint: string;
  scheduleStatus: ScheduleStatus;
  // Content
  tags: string[];
  scenarios: Scenario[];
  dependencies: { storyKey: string; storyName: string; relation: "blocks" | "depends_on" | "related" }[];
  files: { filePath: string; fileName: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface StoryListParams {
  search?: string;
  project?: string;
  status?: string;
  tags?: string[];
  pageNum?: number;
  pageSize?: number;
}

// ── API ──

export async function getStoryList(params: StoryListParams = {}) {
  const filter: Record<string, any> = {};
  if (params.project) filter.project = params.project;
  if (params.status) filter.status = params.status;

  const res = await queryDocuments<StoryDocument>({
    cname: CNAME,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    search: params.search,
    tags: params.tags,
    pageNum: params.pageNum ?? 1,
    pageSize: params.pageSize ?? 100,
    orderBy: "updatedAt",
    orderType: "desc"
  });
  if (res.code !== 0) throw new Error(res.message || "Failed to load stories");
  return { list: res.data?.list ?? [], total: res.data?.total ?? 0 };
}

export async function getStory(key: string): Promise<StoryDocument | null> {
  const res = await queryDocuments<StoryDocument>({ cname: CNAME, filter: { key }, limit: 1 });
  if (res.code !== 0) throw new Error(res.message || "Failed to load story");
  return res.data?.list?.[0] ?? null;
}

export async function createStory(data: Omit<StoryDocument, "createdAt" | "updatedAt">): Promise<YiAiEnvelope> {
  return createDocument(CNAME, { ...data, scenarios: data.scenarios ?? [], createdAt: Date.now(), updatedAt: Date.now() });
}

export async function updateStory(key: string, data: Partial<StoryDocument>): Promise<YiAiEnvelope> {
  return updateDocument(CNAME, key, { ...data, key, updatedAt: Date.now() });
}

export async function deleteStory(key: string): Promise<YiAiEnvelope> {
  return deleteDocument(CNAME, key);
}
