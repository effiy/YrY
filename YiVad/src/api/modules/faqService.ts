/**
 * FAQ document CRUD — backed by the YiAi data_service RPC dispatcher.
 * FAQs live in the `faqs` MongoDB collection.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import type { FaqDocument, YiAiEnvelope } from "@/api/interface/yiweb";

const CNAME = "faqs";

/** Load all FAQ entries, ordered ascending by `order` */
export async function getFaqs(): Promise<FaqDocument[]> {
  const res = await queryDocuments<FaqDocument>({
    cname: CNAME,
    pageNum: 1,
    pageSize: 2000,
    orderBy: "order",
    orderType: "asc"
  });
  if (res.code !== 0) throw new Error(res.message || "Failed to load FAQs");
  return res.data?.list ?? [];
}

/** Create a new FAQ entry */
export async function createFaq(data: Partial<FaqDocument> & { key: string }): Promise<YiAiEnvelope> {
  return createDocument(CNAME, data);
}

/** Update an existing FAQ entry by key */
export async function updateFaq(key: string, data: Partial<FaqDocument>): Promise<YiAiEnvelope> {
  return updateDocument(CNAME, key, data);
}

/** Swap the `order` field of two FAQ entries — used by the reorder flow */
export async function swapFaqOrder(
  a: { key: string; order: number },
  b: { key: string; order: number }
): Promise<[YiAiEnvelope, YiAiEnvelope]> {
  return Promise.all([updateFaq(a.key, { order: a.order }), updateFaq(b.key, { order: b.order })]);
}

/** Delete a FAQ entry by key */
export async function deleteFaq(key: string): Promise<YiAiEnvelope> {
  return deleteDocument(CNAME, key);
}
