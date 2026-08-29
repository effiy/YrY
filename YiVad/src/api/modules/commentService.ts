/**
 * Issue comments API service.
 * Comments are stored in the YiAi `comments` collection.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "@/api/modules/dataService";

const COLLECTION = "comments";

export interface Comment {
  key: string;
  issue_key: string;
  author: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function getComments(issue_key: string) {
  return queryDocuments<Comment>({
    cname: COLLECTION,
    filter: { issue_key },
    pageSize: 200,
    orderBy: "created_at",
    orderType: "asc"
  });
}

export function createComment(data: Omit<Comment, "created_at" | "updated_at">) {
  return createDocument<Comment>(COLLECTION, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export function updateComment(key: string, data: Partial<Comment>) {
  return updateDocument<Comment>(COLLECTION, key, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export function deleteComment(key: string) {
  return deleteDocument(COLLECTION, key);
}