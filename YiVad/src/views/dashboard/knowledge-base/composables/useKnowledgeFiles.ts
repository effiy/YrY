/**
 * Knowledge base file CRUD composable — file preview, dialog, recently viewed,
 * AI chat bridge, delete, and related file navigation.
 */
import { ref, computed, watch, type Ref, type ComputedRef } from "vue";
import { useI18n } from "vue-i18n";
import { readKnowledgeFile, deleteKnowledgeFile } from "@/api/modules/knowledgeService";
import { loadJson, saveJson } from "@/utils/storage";
import { fileHealthIssues } from "../utils";
import type { KnowledgeStatsData, KnowledgeFileSummary, KnowledgeModuleStats } from "@/api/interface/yiAi";
import type { AiChatBridgePayload } from "@/hooks/useAiChatBridge";

export interface UseKnowledgeFilesParams {
  knowledgeData: Ref<KnowledgeStatsData | null>;
  sortedDrillTableData: ComputedRef<KnowledgeFileSummary[]>;
  drillPage: Ref<number>;
  drillPageSize: number;
  fetchData: () => Promise<void>;
  openInAiChat: (payload: AiChatBridgePayload) => Promise<string | null>;
  /** For fixMetadataWithAgent */
  dataQualityScore: ComputedRef<number>;
  /** For fixMetadataWithAgent */
  needsAttentionFiles: ComputedRef<KnowledgeFileSummary[]>;
}

const RECENTLY_VIEWED_KEY = "kb.recentlyViewed";
const MAX_RECENTLY_VIEWED = 10;

export function useKnowledgeFiles(params: UseKnowledgeFilesParams) {
  const {
    knowledgeData,
    sortedDrillTableData,
    drillPage,
    drillPageSize,
    fetchData,
    openInAiChat,
    dataQualityScore,
    needsAttentionFiles
  } = params;

  const { t } = useI18n();

  // ── File Preview State ──
  const selectedFile = ref<KnowledgeFileSummary | null>(null);
  const fileContent = ref("");
  const fileContentLoading = ref(false);
  const showFileContent = ref(false);

  // ── Dialog Preview State ──
  const dialogFilePath = ref("");
  const recentlyViewed = ref<KnowledgeFileSummary[]>(
    loadJson<KnowledgeFileSummary[]>(RECENTLY_VIEWED_KEY, [])
  );

  // ── Refs for template ──
  const detailPanelRef = ref<HTMLElement | null>(null);

  // ── Selected File Computeds ──
  const selectedFileIndex = computed(() => {
    if (!selectedFile.value) return -1;
    return sortedDrillTableData.value.findIndex(f => f.path === selectedFile.value!.path);
  });

  const prevFile = computed(() => {
    if (selectedFileIndex.value <= 0) return null;
    return sortedDrillTableData.value[selectedFileIndex.value - 1];
  });

  const nextFile = computed(() => {
    if (
      selectedFileIndex.value < 0 ||
      selectedFileIndex.value >= sortedDrillTableData.value.length - 1
    )
      return null;
    return sortedDrillTableData.value[selectedFileIndex.value + 1];
  });

  const resolvedRelatedFiles = computed(() => {
    if (!selectedFile.value || !selectedFile.value.related?.length) return [];
    const fileMap = new Map<string, KnowledgeFileSummary>();
    for (const f of knowledgeData.value?.files ?? []) fileMap.set(f.path, f);
    return selectedFile.value.related
      .map(
        p =>
          fileMap.get(p) ||
          ({ path: p, title: p.split("/").pop() || p } as KnowledgeFileSummary)
      )
      .filter(Boolean);
  });

  const sameModuleCount = computed(() => {
    if (!selectedFile.value) return 0;
    return (knowledgeData.value?.files ?? []).filter(
      f =>
        f.category === selectedFile.value!.category &&
        f.module === selectedFile.value!.module
    ).length;
  });

  const sameSubModuleCount = computed(() => {
    if (!selectedFile.value) return 0;
    return (knowledgeData.value?.files ?? []).filter(
      f =>
        f.category === selectedFile.value!.category &&
        f.module === selectedFile.value!.module &&
        f.sub_module === selectedFile.value!.sub_module
    ).length;
  });

  // ── Dialog File Computeds ──
  const dialogFileIndex = computed(() => {
    if (!dialogFilePath.value) return -1;
    return sortedDrillTableData.value.findIndex(f => f.path === dialogFilePath.value);
  });

  const prevDialogFile = computed(() => {
    if (dialogFileIndex.value <= 0) return null;
    return sortedDrillTableData.value[dialogFileIndex.value - 1];
  });

  const nextDialogFile = computed(() => {
    if (
      dialogFileIndex.value < 0 ||
      dialogFileIndex.value >= sortedDrillTableData.value.length - 1
    )
      return null;
    return sortedDrillTableData.value[dialogFileIndex.value + 1];
  });

  // ── File Preview Methods ──
  function openFilePreview(row: KnowledgeFileSummary) {
    selectedFile.value = row;
    addRecentlyViewed(row);
  }

  function addRecentlyViewed(row: KnowledgeFileSummary) {
    recentlyViewed.value = [
      row,
      ...recentlyViewed.value.filter(f => f.path !== row.path)
    ].slice(0, MAX_RECENTLY_VIEWED);
    saveJson(RECENTLY_VIEWED_KEY, recentlyViewed.value);
  }

  function clearRecentlyViewed() {
    recentlyViewed.value = [];
    saveJson(RECENTLY_VIEWED_KEY, []);
  }

  function openFileInDialog(row: KnowledgeFileSummary) {
    dialogFilePath.value = row.path;
    addRecentlyViewed(row);
    return row.path;
  }

  function navigateDialogFile(direction: "prev" | "next") {
    const target =
      direction === "prev" ? prevDialogFile.value : nextDialogFile.value;
    if (target) return openFileInDialog(target);
  }

  function navigateToFile(file: KnowledgeFileSummary) {
    selectedFile.value = file;
    const idx = sortedDrillTableData.value.findIndex(f => f.path === file.path);
    if (idx >= 0) {
      const page = Math.floor(idx / drillPageSize) + 1;
      if (page !== drillPage.value) drillPage.value = page;
    }
  }

  function resolveRelatedNames(
    row: KnowledgeFileSummary
  ): { path: string; title: string }[] {
    if (!row.related?.length) return [];
    const fileMap = new Map<string, KnowledgeFileSummary>();
    for (const f of knowledgeData.value?.files ?? []) fileMap.set(f.path, f);
    return row.related.slice(0, 8).map(p => {
      const found = fileMap.get(p);
      return { path: p, title: found?.title || p.split("/").pop() || p };
    });
  }

  function getModuleStats(
    cat: string,
    mod: string
  ): KnowledgeModuleStats | undefined {
    return (knowledgeData.value?.modules ?? []).find(
      m => m.category === cat && m.name === mod
    );
  }

  // ── AI Chat Bridge ──
  async function discussInAiChat(row: KnowledgeFileSummary) {
    if (!row.path) return;
    await openInAiChat({
      title: row.title || row.path.split("/").pop() || "Knowledge file",
      pageContent: `File: ${row.path}\nCategory: ${row.category}\nModule: ${row.module}\nStatus: ${row.status}\nLifecycle: ${row.lifecycle}\nType: ${row.type}`,
      tags: [
        `ctx:${row.path}`,
        `file:${row.path}`,
        "knowledge",
        `cat:${row.category}`,
        `mod:${row.module}`
      ],
      sourceUrl: `/dashboard/knowledge-base`
    });
  }

  async function discussSearchResult(r: {
    path: string;
    title: string;
    category?: string;
    module?: string;
  }) {
    await openInAiChat({
      title: r.title || r.path.split("/").pop() || "Search result",
      pageContent: `File: ${r.path}\nCategory: ${r.category || ""}\nModule: ${r.module || ""}`,
      tags: [
        `ctx:${r.path}`,
        `file:${r.path}`,
        "knowledge",
        `cat:${r.category || ""}`,
        `mod:${r.module || ""}`
      ],
      sourceUrl: `/dashboard/knowledge-base`
    });
  }

  /** Open aiChat with a pre-filled prompt to fix missing metadata. */
  async function fixMetadataWithAgent() {
    const dq = knowledgeData.value?.data_quality;
    const files = needsAttentionFiles.value.slice(0, 20);
    const missingSummary = [
      dq?.no_status ? `- ${dq.no_status} files missing status` : "",
      dq?.no_type ? `- ${dq.no_type} files missing type` : "",
      dq?.no_lifecycle ? `- ${dq.no_lifecycle} files missing lifecycle` : "",
      dq?.no_review_cycle
        ? `- ${dq.no_review_cycle} files missing review_cycle`
        : "",
      dq?.no_roles ? `- ${dq.no_roles} files missing roles` : "",
      dq?.no_tags ? `- ${dq.no_tags} files missing tags` : "",
      dq?.no_benefit ? `- ${dq.no_benefit} files missing benefit` : ""
    ]
      .filter(Boolean)
      .join("\n");
    const fileList = files
      .map(f => `- ${f.path} (missing: ${fileHealthIssues(f).join(", ")})`)
      .join("\n");
    await openInAiChat({
      title: "Fix knowledge base metadata",
      pageContent: `Help me fix missing metadata in the knowledge base.\n\nCurrent Data Quality: ${dataQualityScore.value}%\n\nMissing fields:\n${missingSummary}\n\nAffected files (first ${files.length}):\n${fileList}\n\nFor each file, read its content, determine appropriate frontmatter values, and use db_update on the knowledge_files collection to add the missing fields.`,
      tags: ["knowledge", "metadata-fix", "data-quality"],
      sourceUrl: `/dashboard/knowledge-base`
    });
  }

  // ── Delete File ──
  async function deleteFile(file: any) {
    const { ElMessageBox, ElMessage } = await import("element-plus");
    const name = file.title || file.path.split("/").pop();
    try {
      await ElMessageBox.confirm(
        t("knowledge.common.deleteFileConfirm", { path: name }),
        t("knowledge.common.deleteFileTitle"),
        {
          confirmButtonText: t("knowledge.common.delete"),
          cancelButtonText: t("knowledge.common.cancel"),
          type: "warning"
        }
      );
    } catch {
      return;
    }
    try {
      const res = await deleteKnowledgeFile(file.path);
      if (res.deleted) {
        ElMessage.success(t("knowledge.common.fileDeleted"));
      } else {
        ElMessage.info(t("knowledge.common.fileDeleted"));
      }
      if (selectedFile.value?.path === file.path) {
        selectedFile.value = null;
      }
      await fetchData();
    } catch (e: unknown) {
      ElMessage.error(e instanceof Error ? e.message : t("knowledge.common.fileDeleteFailed"));
    }
  }

  // ── Keyboard: Detail Panel Navigation ──
  function onDetailKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft" && prevFile.value) {
      e.preventDefault();
      navigateToFile(prevFile.value);
    } else if (e.key === "ArrowRight" && nextFile.value) {
      e.preventDefault();
      navigateToFile(nextFile.value);
    }
  }

  // ── Watcher: auto-load file content when selection changes ──
  watch(selectedFile, async f => {
    fileContent.value = "";
    showFileContent.value = false;
    if (!f?.path) return;
    fileContentLoading.value = true;
    try {
      const res = await readKnowledgeFile(f.path);
      fileContent.value = res.content || "";
      showFileContent.value = true;
    } catch {
      fileContent.value = "";
    } finally {
      fileContentLoading.value = false;
    }
    setTimeout(() => detailPanelRef.value?.focus(), 50);
  });

  return {
    // State
    selectedFile,
    fileContent,
    fileContentLoading,
    showFileContent,
    dialogFilePath,
    recentlyViewed,
    detailPanelRef,
    // Computed
    selectedFileIndex,
    prevFile,
    nextFile,
    resolvedRelatedFiles,
    sameModuleCount,
    sameSubModuleCount,
    dialogFileIndex,
    prevDialogFile,
    nextDialogFile,
    // Methods
    openFilePreview,
    addRecentlyViewed,
    clearRecentlyViewed,
    openFileInDialog,
    navigateDialogFile,
    navigateToFile,
    resolveRelatedNames,
    getModuleStats,
    discussInAiChat,
    discussSearchResult,
    fixMetadataWithAgent,
    deleteFile,
    onDetailKeydown
  };
}