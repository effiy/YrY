import { defineStore } from "pinia";
import { ref } from "vue";
import { getPageList, getPage, createPage, updatePage, deletePage } from "@/api/modules/pageService";
import type { Page, PageQueryParams } from "@/api/modules/pageService";

export const usePageStore = defineStore("page", () => {
  const pages = ref<Page[]>([]);
  const currentPage = ref<Page | null>(null);
  const total = ref(0);
  const loading = ref(false);

  async function fetchPages(params: PageQueryParams = {}) {
    loading.value = true;
    try {
      const res = await getPageList(params);
      pages.value = (res.data?.list as Page[]) ?? [];
      total.value = res.data?.total ?? 0;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPage(key: string) {
    const res = await getPage(key);
    const list = (res.data?.list as Page[]) ?? [];
    currentPage.value = list[0] ?? null;
    return currentPage.value;
  }

  async function addPage(data: Omit<Page, "created_at" | "updated_at">) {
    await createPage(data);
    await fetchPages({ project_key: data.project_key });
  }

  async function editPage(key: string, data: Partial<Page>) {
    await updatePage(key, data);
    if (currentPage.value?.key === key) {
      currentPage.value = { ...currentPage.value, ...data };
    }
  }

  async function removePage(key: string, project_key?: string) {
    await deletePage(key);
    if (currentPage.value?.key === key) {
      currentPage.value = null;
    }
    if (project_key) {
      await fetchPages({ project_key });
    }
  }

  function reset() {
    pages.value = [];
    currentPage.value = null;
    total.value = 0;
  }

  return {
    pages,
    currentPage,
    total,
    loading,
    fetchPages,
    fetchPage,
    addPage,
    editPage,
    removePage,
    reset
  };
});