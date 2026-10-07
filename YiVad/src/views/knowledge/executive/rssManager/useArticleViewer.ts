import { ref, computed } from "vue";
import type { RssItemDocument } from "@/api/modules/rssService";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useMarkdown } from "@/hooks/useMarkdown";

/**
 * Article viewer composable — owns article detail dialog state and body loading.
 */
export function useArticleViewer() {
  const articleDetailVisible = ref(false);
  const detailArticle = ref<RssItemDocument | null>(null);
  const articleBody = ref("");
  const articleBodyLoading = ref(false);
  const articleBodyError = ref(false);

  const { render: renderMarkdown } = useMarkdown();
  const renderedArticleBody = computed(() => (articleBody.value ? renderMarkdown(articleBody.value) : ""));

  async function openArticleDetail(row: RssItemDocument) {
    detailArticle.value = row;
    articleDetailVisible.value = true;
    articleBody.value = "";
    articleBodyError.value = false;
    if (row.file_path) {
      articleBodyLoading.value = true;
      try {
        const res = await readKnowledgeFile(row.file_path);
        articleBody.value = res.content || "";
      } catch {
        articleBodyError.value = true;
      } finally {
        articleBodyLoading.value = false;
      }
    } else {
      articleBodyError.value = true;
    }
  }

  function openArticleLink(item: RssItemDocument) {
    if (item.link) window.open(item.link, "_blank", "noopener,noreferrer");
  }

  return {
    articleDetailVisible,
    detailArticle,
    articleBody,
    articleBodyLoading,
    articleBodyError,
    renderedArticleBody,
    openArticleDetail,
    openArticleLink
  };
}