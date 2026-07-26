/**
 * Story CRUD module — calls YiAi data-service RPC for the "stories" collection.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import type { YiAiEnvelope } from "@/api/interface/yiweb";

const CNAME = "stories";

export interface StoryDocument {
  key: string;
  name: string;
  status: "planning" | "design" | "develop" | "testing" | "operations";
  description: string;
  tags: string[];
  project: string;
  files: { filePath: string; fileName: string; updatedAt: number }[];
  dependencies: { directory: string; relation: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface StoryListParams {
  search?: string;
  status?: string;
  tags?: string[];
  pageNum?: number;
  pageSize?: number;
}

/** List stories with optional filters and pagination */
export async function getStoryList(params: StoryListParams = {}) {
  const res = await queryDocuments<StoryDocument>({
    cname: CNAME,
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

/** Get single story by key */
export async function getStory(key: string): Promise<StoryDocument | null> {
  const res = await queryDocuments<StoryDocument>({ cname: CNAME, filter: { key }, limit: 1 });
  if (res.code !== 0) throw new Error(res.message || "Failed to load story");
  return res.data?.list?.[0] ?? null;
}

/** Create a story */
export async function createStory(data: Omit<StoryDocument, "createdAt" | "updatedAt">): Promise<YiAiEnvelope> {
  const now = Date.now();
  return createDocument(CNAME, { ...data, createdAt: now, updatedAt: now });
}

/** Update a story */
export async function updateStory(key: string, data: Partial<StoryDocument>): Promise<YiAiEnvelope> {
  return updateDocument(CNAME, key, { ...data, updatedAt: Date.now() });
}

/** Delete a story */
export async function deleteStory(key: string): Promise<YiAiEnvelope> {
  return deleteDocument(CNAME, key);
}
