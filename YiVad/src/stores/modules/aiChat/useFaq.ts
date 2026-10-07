/**
 * useFaq — FAQ management for the AI chat store.
 */
import type { Ref } from "vue";
import type { FaqDocument } from "@/api/interface/yiAi";
import { queryDocuments } from "@/api/modules/dataService";

export interface FaqDeps {
  faqs: Ref<FaqDocument[]>;
  faqLoading: Ref<boolean>;
  faqVisible: Ref<boolean>;
  faqApplyMode: Ref<"insert" | "append">;
  input: Ref<string>;
}

export function useFaq(deps: FaqDeps) {
  const { faqs, faqLoading, faqVisible, faqApplyMode, input } = deps;
  let faqLoaded = false;

  async function loadFaqs(force = false) {
    if (faqLoaded && !force) return;
    faqLoading.value = true;
    try {
      const res = await queryDocuments<FaqDocument>({ cname: "faqs", pageSize: 100000 });
      if (res.code !== 0) throw new Error(res.message || "Failed to load FAQs");
      const list = res.data?.list ?? [];
      list.sort((a, b) => (a.order ?? a.createdAt ?? 0) - (b.order ?? b.createdAt ?? 0));
      faqs.value = list;
      faqLoaded = true;
    } catch {
      /* ignore */
    } finally {
      faqLoading.value = false;
    }
  }

  function openFaq() {
    faqVisible.value = true;
    if (!faqLoaded) loadFaqs();
  }

  function closeFaq() {
    faqVisible.value = false;
  }

  function toggleFaq() {
    if (faqVisible.value) closeFaq();
    else openFaq();
  }

  function applyFaq(item: FaqDocument, mode: "insert" | "append" = faqApplyMode.value) {
    const title = (item.title || "").trim();
    const prompt = (item.prompt || "").trim();
    const text = title && prompt ? `${title}\n\n${prompt}` : prompt || title;
    if (!text) return;
    const current = input.value;
    input.value = mode === "append" && current ? `${current}\n\n${text}` : text;
    closeFaq();
  }

  return { loadFaqs, openFaq, closeFaq, toggleFaq, applyFaq };
}