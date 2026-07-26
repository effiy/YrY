/**
 * Story Board — Pinia store with full CRUD via YiAi backend.
 * Stories are organized by project and time range.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getStoryList, createStory, updateStory, deleteStory } from "@/api/modules/story";
import type { StoryDocument } from "@/api/modules/story";

export type { StoryDocument };

export const useStoryStore = defineStore("yivad-story", () => {
  // ── Core state ──
  const stories = ref<StoryDocument[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedStory = ref<StoryDocument | null>(null);

  // ── Dimension: project ──
  const selectedProject = ref<string | null>(null);

  // ── Dimension: time range ──
  type TimeRange = "all" | "week" | "month" | "quarter" | "custom";
  const timeRange = ref<TimeRange>("all");
  const customStart = ref<string>(""); // YYYY-MM-DD
  const customEnd = ref<string>("");

  // ── Search & pagination ──
  const searchQuery = ref("");
  const pageNum = ref(1);
  const pageSize = ref(100);
  const viewMode = ref<"cards" | "list">("cards");

  // ── Dialog state ──
  const dialogVisible = ref(false);
  const isEdit = ref(false);
  const saving = ref(false);
  const form = ref<Partial<StoryDocument>>({
    key: "",
    name: "",
    project: "",
    status: "planning",
    description: "",
    tags: [],
    files: [],
    dependencies: []
  });

  // ── Computed ──

  /** All unique project names from loaded stories */
  const projects = computed(() => {
    const set = new Set<string>();
    for (const s of stories.value) if (s.project) set.add(s.project);
    return [...set].sort((a, b) => a.localeCompare(b, "zh-CN"));
  });

  const totalStories = computed(() => total.value);

  const filteredStories = computed(() => {
    let result = [...stories.value];
    if (selectedProject.value) {
      result = result.filter(s => s.project === selectedProject.value);
    }
    return result;
  });

  const groupedStories = computed(() => {
    const groups: Record<string, StoryDocument[]> = {};
    for (const s of filteredStories.value) {
      const key = s.status || "unknown";
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    }
    return groups;
  });

  const statusCounts = computed(() => {
    const counts: Record<string, number> = {};
    for (const s of filteredStories.value) {
      counts[s.status] = (counts[s.status] || 0) + 1;
    }
    return counts;
  });

  const panelVisible = computed(() => selectedStory.value !== null);
  const projectStoryCounts = computed(() => {
    const counts: Record<string, number> = {};
    for (const s of stories.value) if (s.project) counts[s.project] = (counts[s.project] || 0) + 1;
    return counts;
  });

  // ── Time range helper ──
  function getTimeFilter(): { start?: number; end?: number } {
    const now = Date.now();
    switch (timeRange.value) {
      case "week":
        return { start: now - 7 * 86400000 };
      case "month":
        return { start: now - 30 * 86400000 };
      case "quarter":
        return { start: now - 90 * 86400000 };
      case "custom":
        return {
          start: customStart.value ? new Date(customStart.value).getTime() : undefined,
          end: customEnd.value ? new Date(customEnd.value).getTime() + 86400000 : undefined
        };
      default:
        return {};
    }
  }

  // ── Actions ──

  async function fetchStories() {
    loading.value = true;
    error.value = null;
    try {
      const result = await getStoryList({
        search: searchQuery.value || undefined,
        pageNum: pageNum.value,
        pageSize: pageSize.value
      });
      // Client-side time filtering (backend may not support time range filters natively)
      const tf = getTimeFilter();
      let list = result.list;
      if (tf.start) list = list.filter(s => (s.createdAt || 0) >= tf.start!);
      if (tf.end) list = list.filter(s => (s.createdAt || 0) <= tf.end!);

      stories.value = list;
      total.value = result.total;
    } catch (e: any) {
      error.value = e?.message || "Failed to load stories";
    } finally {
      loading.value = false;
    }
  }

  function openCreateDialog(project?: string) {
    isEdit.value = false;
    form.value = {
      key: `story_${Date.now()}`,
      name: "",
      project: project || selectedProject.value || "",
      status: "planning",
      description: "",
      tags: [],
      files: [],
      dependencies: []
    };
    dialogVisible.value = true;
  }

  function openEditDialog(story: StoryDocument) {
    isEdit.value = true;
    form.value = { ...story };
    dialogVisible.value = true;
  }

  async function handleSave() {
    if (!form.value.name?.trim()) {
      ElMessage.warning("Story name is required");
      return;
    }
    saving.value = true;
    try {
      if (isEdit.value) {
        await updateStory(form.value.key!, form.value);
        ElMessage.success("Story updated");
      } else {
        await createStory(form.value as any);
        ElMessage.success("Story created");
      }
      dialogVisible.value = false;
      await fetchStories();
    } catch (e: any) {
      ElMessage.error(e?.message || "Save failed");
    } finally {
      saving.value = false;
    }
  }

  async function handleDelete(story: StoryDocument) {
    try {
      await ElMessageBox.confirm(`Delete "${story.name}"?`, "Confirm", { type: "warning" });
      await deleteStory(story.key);
      ElMessage.success("Story deleted");
      if (selectedStory.value?.key === story.key) selectedStory.value = null;
      await fetchStories();
    } catch {
      // cancelled
    }
  }

  function openDetail(story: StoryDocument) {
    selectedStory.value = story;
  }

  function closePanel() {
    selectedStory.value = null;
  }

  function selectProject(project: string | null) {
    selectedProject.value = project;
  }

  function setTimeRange(range: TimeRange) {
    timeRange.value = range;
    fetchStories();
  }

  return {
    // state
    stories,
    total,
    loading,
    error,
    selectedStory,
    selectedProject,
    timeRange,
    customStart,
    customEnd,
    searchQuery,
    pageNum,
    pageSize,
    viewMode,
    dialogVisible,
    isEdit,
    saving,
    form,
    // computed
    projects,
    totalStories,
    filteredStories,
    groupedStories,
    statusCounts,
    panelVisible,
    projectStoryCounts,
    // actions
    fetchStories,
    openCreateDialog,
    openEditDialog,
    handleSave,
    handleDelete,
    openDetail,
    closePanel,
    selectProject,
    setTimeRange
  };
});
