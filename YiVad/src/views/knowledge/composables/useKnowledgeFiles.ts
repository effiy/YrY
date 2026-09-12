import { ref } from "vue";
import { scanKnowledge, readKnowledgeFile } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry, KnowledgeReadResponse } from "@/api/interface/yiAi";

/** Raw category scan — always fetches, no caching. */
export async function fetchCategoryFiles(cat: string): Promise<KnowledgeFileEntry[]> {
  const res = await scanKnowledge(cat);
  return (res.categories?.[0]?.files ?? []).filter(f => f.meta?.type !== "rss");
}

export function useKnowledgeFiles() {
  const currentFile = ref<KnowledgeReadResponse | null>(null);
  const fileLoading = ref(false);
  const error = ref<string | null>(null);

  async function selectFile(path: string) {
    fileLoading.value = true;
    try {
      currentFile.value = await readKnowledgeFile(path);
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to read knowledge file";
      currentFile.value = null;
    } finally {
      fileLoading.value = false;
    }
  }

  return { currentFile, fileLoading, error, selectFile };
}