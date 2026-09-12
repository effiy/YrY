/**
 * Story CRUD — calls YiAi data-service RPC for the "stories" collection.
 * Each story contains multiple scenarios describing concrete use cases.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import type { YiAiEnvelope } from "@/api/interface/yiAi";

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
  id?: string; // dedicated collection document key
  prompt: string;
  generatedAt: number;
}

export interface ScenarioFile {
  filePath: string;
  fileName: string;
  /** Line count */
  lines?: number;
  /** File size in bytes */
  size?: number;
  /** Programming language or file type */
  language?: string;
}

// ── Scenario sub-structures ──

export interface Scenario {
  key: string;
  name: string;
  description: string;
  priority: ScenarioPriority;
  status: ScenarioStatus;
  steps: ScenarioStep[];
  tags: string[];
  files: ScenarioFile[];
  trigger: string;
  prerequisites: string;
  expectedResult: string;
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
  files: ScenarioFile[];
  createdAt: number;
  updatedAt: number;
}

export interface StoryListParams {
  search?: string;
  project?: string;
  status?: string;
  tags?: string[];
  createdAtStart?: number;
  createdAtEnd?: number;
  pageNum?: number;
  pageSize?: number;
}

// ── API ──

export async function getStoryList(params: StoryListParams = {}) {
  const filter: Record<string, any> = {};
  if (params.project) filter.project = params.project;
  if (params.status) filter.status = params.status;
  // YiAi's `query_documents` silently ignores `search`/`tags` parameters —
  // only `filter` is merged into the Mongo query via `_build_filter`. Push
  // both into `filter` so they actually take effect:
  //   - search → case-insensitive $regex $or across name/description/background
  //   - tags   → $in match (any tag)
  if (params.search) {
    const rx = { $regex: params.search, $options: "i" };
    filter.$or = [{ name: rx }, { description: rx }, { background: rx }];
  }
  if (params.tags && params.tags.length > 0) {
    filter.tags = { $in: params.tags };
  }
  // Time filter must be applied server-side, not client-side — otherwise the
  // returned `total` reflects the pre-time-filter count while `list` is filtered
  // down, so the UI counter (which reads `total`) shows "20 stories" while
  // only 5 are displayed.
  if (params.createdAtStart !== undefined || params.createdAtEnd !== undefined) {
    const created: Record<string, number> = {};
    if (params.createdAtStart !== undefined) created.$gte = params.createdAtStart;
    if (params.createdAtEnd !== undefined) created.$lte = params.createdAtEnd;
    filter.createdAt = created;
  }

  const res = await queryDocuments<StoryDocument>({
    cname: CNAME,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
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
