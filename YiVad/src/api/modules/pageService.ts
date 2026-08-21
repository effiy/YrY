/**
 * Pages/Wiki API service.
 * Pages are stored in the YiAi `pages` collection via the data service RPC.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "@/api/modules/dataService";

const COLLECTION = "pages";

export interface Page {
  key: string;
  project_key: string;
  title: string;
  content: string;
  parent_key: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface PageQueryParams {
  pageNum?: number;
  pageSize?: number;
  project_key?: string;
  parent_key?: string;
  search?: string;
}

export function getPageList(params: PageQueryParams) {
  const { pageNum = 1, pageSize = 100, project_key, parent_key, search } = params;
  const filter: Record<string, any> = {};
  if (project_key) filter.project_key = project_key;
  if (parent_key !== undefined) filter.parent_key = parent_key;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } }
    ];
  }
  return queryDocuments<Page>({
    cname: COLLECTION,
    filter,
    pageNum,
    pageSize,
    orderBy: "order",
    orderType: "asc"
  });
}

export function getPage(key: string) {
  return queryDocuments<Page>({
    cname: COLLECTION,
    filter: { key },
    pageSize: 1
  });
}

export function createPage(data: Omit<Page, "created_at" | "updated_at">) {
  return createDocument<Page>(COLLECTION, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export function updatePage(key: string, data: Partial<Page>) {
  return updateDocument<Page>(COLLECTION, key, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export function deletePage(key: string) {
  return deleteDocument(COLLECTION, key);
}