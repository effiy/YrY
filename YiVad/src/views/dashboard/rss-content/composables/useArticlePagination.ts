import { ref, computed, watch, type Ref } from "vue";
import type { RssItemDocument } from "@/api/modules/rssService";

export function useArticlePagination(articles: Ref<RssItemDocument[]>, viewMode: Ref<string>) {
  const pageNum = ref(1);
  const pageSize = ref(50);

  const pagedArticles = computed(() => {
    const start = (pageNum.value - 1) * pageSize.value;
    return articles.value.slice(start, start + pageSize.value);
  });

  function onPageChange(p: number) {
    pageNum.value = p;
  }
  function onSizeChange(s: number) {
    pageNum.value = 1;
    pageSize.value = s;
  }

  watch(viewMode, () => {
    pageNum.value = 1;
  });
  watch(
    () => articles.value.length,
    () => {
      pageNum.value = 1;
    }
  );

  return { pageNum, pageSize, pagedArticles, onPageChange, onSizeChange };
}
