/**
 * AICR FAQ store — FAQ list with CRUD, search, tag filter, reorder.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getFaqs, createFaq, updateFaq, deleteFaq, swapFaqOrder } from "@/api/modules/faqService";
import type { FaqDocument } from "@/api/interface/yiweb";

export const useAicrFaqStore = defineStore("yivad-aicr-faqs", () => {
  const list = ref<FaqDocument[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const search = ref("");
  const selectedTags = ref<string[]>([]);
  const noTagsOnly = ref(false);

  const allTags = computed(() => {
    const set = new Set<string>();
    for (const f of list.value) for (const t of f.tags ?? []) set.add(t);
    return [...set].sort((a, b) => a.localeCompare(b, "zh-CN"));
  });

  const filtered = computed(() => {
    let r = list.value;
    if (noTagsOnly.value) r = r.filter(f => (f.tags?.length ?? 0) === 0);
    else if (selectedTags.value.length > 0) {
      r = r.filter(f => selectedTags.value.every(t => f.tags?.includes(t)));
    }
    const q = search.value.trim().toLowerCase();
    if (q) {
      r = r.filter(f => `${f.title}\n${f.prompt}`.toLowerCase().includes(q));
    }
    return r;
  });

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      list.value = await getFaqs();
    } catch (e: any) {
      error.value = e?.message || "Failed to load FAQs";
    } finally {
      loading.value = false;
    }
  }

  async function add(data: Partial<FaqDocument> & { key: string }) {
    await createFaq({ ...data, order: list.value.length + 1 });
    await load();
  }

  async function edit(key: string, data: Partial<FaqDocument>) {
    await updateFaq(key, data);
    await load();
  }

  async function remove(key: string) {
    await deleteFaq(key);
    await load();
  }

  async function moveUp(idx: number) {
    if (idx <= 0) return;
    const a = filtered.value[idx];
    const b = filtered.value[idx - 1];
    await swapFaqOrder({ key: a.key, order: b.order ?? idx }, { key: b.key, order: a.order ?? idx + 1 });
    await load();
  }

  async function moveDown(idx: number) {
    if (idx >= filtered.value.length - 1) return;
    const a = filtered.value[idx];
    const b = filtered.value[idx + 1];
    await swapFaqOrder({ key: a.key, order: b.order ?? idx + 2 }, { key: b.key, order: a.order ?? idx + 1 });
    await load();
  }

  function toggleTag(t: string) {
    const i = selectedTags.value.indexOf(t);
    if (i >= 0) selectedTags.value.splice(i, 1);
    else selectedTags.value.push(t);
  }

  function clearTags() {
    selectedTags.value = [];
    noTagsOnly.value = false;
  }

  return {
    list,
    loading,
    error,
    search,
    selectedTags,
    noTagsOnly,
    allTags,
    filtered,
    load,
    add,
    edit,
    remove,
    moveUp,
    moveDown,
    toggleTag,
    clearTags
  };
});
