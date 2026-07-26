/**
 * Session document CRUD convenience functions.
 * All sessions are stored in the "sessions" MongoDB collection via the YiAi data service.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import type { SessionDocument, YiAiEnvelope } from "@/api/interface/yiweb";

const CNAME = "sessions";

/** Load all sessions (or a large batch) */
export async function getSessions(limit = 100000): Promise<SessionDocument[]> {
  const res = await queryDocuments<SessionDocument>({ cname: CNAME, limit, pageNum: 1, pageSize: limit });
  if (res.code !== 0) throw new Error(res.message || "Failed to load sessions");
  return res.data?.list ?? [];
}

/** Load sessions filtered by tags */
export async function getSessionsByTags(tags: string[]): Promise<SessionDocument[]> {
  const res = await queryDocuments<SessionDocument>({ cname: CNAME, tags, limit: 100000 });
  if (res.code !== 0) throw new Error(res.message || "Failed to load sessions by tags");
  return res.data?.list ?? [];
}

/** Load sessions matching a search query */
export async function searchSessions(search: string): Promise<SessionDocument[]> {
  const res = await queryDocuments<SessionDocument>({ cname: CNAME, search, limit: 100000 });
  if (res.code !== 0) throw new Error(res.message || "Failed to search sessions");
  return res.data?.list ?? [];
}

/** Get a single session by key */
export async function getSession(key: string): Promise<SessionDocument | null> {
  const res = await queryDocuments<SessionDocument>({ cname: CNAME, filter: { key }, limit: 1 });
  if (res.code !== 0) throw new Error(res.message || "Failed to get session");
  return res.data?.list?.[0] ?? null;
}

/** Create a new session document */
export async function createSession(data: Partial<SessionDocument> & { key: string }): Promise<YiAiEnvelope> {
  return createDocument(CNAME, data);
}

/** Update an existing session */
export async function updateSession(key: string, data: Partial<SessionDocument>): Promise<YiAiEnvelope> {
  return updateDocument(CNAME, key, data);
}

/** Upsert a session (create if not exists, update if exists) */
export async function upsertSession(data: Partial<SessionDocument> & { key: string }): Promise<YiAiEnvelope> {
  const existing = await getSession(data.key);
  if (existing) {
    return updateSession(data.key, data);
  }
  return createSession(data);
}

/** Delete a session by key */
export async function deleteSession(key: string): Promise<YiAiEnvelope> {
  return deleteDocument(CNAME, key);
}

/** Batch delete sessions */
export async function batchDeleteSessions(keys: string[]): Promise<YiAiEnvelope[]> {
  return Promise.all(keys.map(key => deleteSession(key)));
}
