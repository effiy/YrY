/**
 * Labels management API service.
 * Stored in the YiAi `labels` collection.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "@/api/modules/dataService";

const COLLECTION = "labels";

export interface Label {
  key: string;
  name: string;
  color: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function getLabelList(params?: { pageSize?: number }) {
  return queryDocuments<Label>({
    cname: COLLECTION,
    pageSize: params?.pageSize || 200,
    orderBy: "name",
    orderType: "asc"
  });
}

export function createLabel(data: Omit<Label, "created_at" | "updated_at">) {
  return createDocument<Label>(COLLECTION, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export function updateLabel(key: string, data: Partial<Label>) {
  return updateDocument<Label>(COLLECTION, key, { ...data, updated_at: new Date().toISOString() });
}

export function deleteLabel(key: string) {
  return deleteDocument(COLLECTION, key);
}