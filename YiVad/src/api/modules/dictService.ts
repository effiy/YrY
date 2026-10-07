/**
 * Dictionary management API service.
 * Dict types are stored in `dict_types`, dict items in `dict_items` collections.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "@/api/modules/dataService";

const TYPE_COLLECTION = "dict_types";
const ITEM_COLLECTION = "dict_items";

// ── Dict Type ──

export interface DictType {
  key: string;
  name: string;
  code: string;
  description: string;
  sort_order: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export function getDictTypeList(params?: { pageNum?: number; pageSize?: number; search?: string }) {
  const { pageNum = 1, pageSize = 100, search } = params || {};
  const filter: Record<string, any> = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } }
    ];
  }
  return queryDocuments<DictType>({
    cname: TYPE_COLLECTION,
    filter: Object.keys(filter).length ? filter : undefined,
    pageNum,
    pageSize,
    orderBy: "sort_order",
    orderType: "asc"
  });
}

export function createDictType(data: Omit<DictType, "created_at" | "updated_at">) {
  return createDocument(TYPE_COLLECTION, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export function updateDictType(key: string, data: Partial<DictType>) {
  return updateDocument(TYPE_COLLECTION, key, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export function deleteDictType(key: string) {
  return deleteDocument(TYPE_COLLECTION, key);
}

// ── Dict Item ──

export interface DictItem {
  key: string;
  type_key: string;
  label: string;
  value: string;
  sort_order: number;
  status: "active" | "inactive";
  description: string;
  created_at: string;
  updated_at: string;
}

export function getDictItemList(params: { type_key: string; pageNum?: number; pageSize?: number; search?: string }) {
  const { type_key, pageNum = 1, pageSize = 100, search } = params;
  const filter: Record<string, any> = { type_key };
  if (search) {
    filter.$or = [
      { label: { $regex: search, $options: "i" } },
      { value: { $regex: search, $options: "i" } }
    ];
  }
  return queryDocuments<DictItem>({
    cname: ITEM_COLLECTION,
    filter,
    pageNum,
    pageSize,
    orderBy: "sort_order",
    orderType: "asc"
  });
}

export function createDictItem(data: Omit<DictItem, "created_at" | "updated_at">) {
  return createDocument(ITEM_COLLECTION, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export function updateDictItem(key: string, data: Partial<DictItem>) {
  return updateDocument(ITEM_COLLECTION, key, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export function deleteDictItem(key: string) {
  return deleteDocument(ITEM_COLLECTION, key);
}