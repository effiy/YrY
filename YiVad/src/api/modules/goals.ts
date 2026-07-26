/**
 * Goals CRUD convenience functions.
 * Goals are stored in the "goals" MongoDB collection.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import type { GoalDocument, YiAiEnvelope, QueryDocumentsData } from "@/api/interface/yiweb";

const CNAME = "goals";

/** Load goals, optionally filtered */
export async function getGoals(params: Record<string, any> = {}): Promise<GoalDocument[]> {
  const res = await queryDocuments<GoalDocument>({
    cname: CNAME,
    limit: 10000,
    ...params
  });
  if (res.code !== 0) throw new Error(res.message || "Failed to load goals");
  return res.data?.list ?? [];
}

/** Create a new goal */
export async function createGoal(data: Partial<GoalDocument> & { key: string }): Promise<YiAiEnvelope> {
  return createDocument(CNAME, data);
}

/** Update an existing goal */
export async function updateGoal(key: string, data: Partial<GoalDocument>): Promise<YiAiEnvelope> {
  return updateDocument(CNAME, key, data);
}

/** Delete a goal */
export async function deleteGoal(key: string): Promise<YiAiEnvelope> {
  return deleteDocument(CNAME, key);
}
