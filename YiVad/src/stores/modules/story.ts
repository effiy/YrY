/**
 * Story Board — Pinia store with full CRUD, project/time dimensions, and scenario management.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getStoryList, createStory, updateStory, deleteStory } from "@/api/modules/story";
import { PROJECTS } from "@/config";
import type {
  StoryDocument,
  Scenario,
  ScenarioStep,
  ScenarioPriority,
  ScenarioStatus,
  ScheduleStatus
} from "@/api/modules/story";

export type { StoryDocument, Scenario, ScenarioStep, ScenarioPriority, ScenarioStatus, ScheduleStatus };

function newScenarioKey() {
  return `sc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useStoryStore = defineStore("yivad-story", () => {
  // ── Core ──
  const stories = ref<StoryDocument[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedStory = ref<StoryDocument | null>(null);

  // ── Dimensions ──
  const selectedProject = ref("");
  type TimeRange = "all" | "week" | "month" | "quarter" | "custom";
  const timeRange = ref<TimeRange>("all");
  const customStart = ref("");
  const customEnd = ref("");

  // ── Search & view ──
  const searchQuery = ref("");
  const viewMode = ref<"cards" | "list">("cards");

  // ── Story dialog ──
  const dialogVisible = ref(false);
  const isEdit = ref(false);
  const saving = ref(false);
  const form = ref({
    key: "",
    name: "",
    project: "",
    status: "planning" as StoryDocument["status"],
    priority: "p2" as ScenarioPriority,
    description: "",
    background: "",
    acceptance: "",
    assignee: "",
    startDate: null as Date | null,
    dueDate: null as Date | null,
    completedAt: null as Date | null,
    scheduleStatus: "planned" as ScheduleStatus,
    tags: [] as string[],
    scenarios: [] as Scenario[],
    files: [] as StoryDocument["files"]
  });

  // ── Scenario dialog ──
  const scenarioDialogVisible = ref(false);
  const scenarioEditIdx = ref(-1); // -1 = create
  const scenarioForm = ref<Scenario>({
    key: "",
    name: "",
    description: "",
    priority: "p2",
    status: "pending",
    steps: [],
    tags: [],
    createdAt: 0,
    updatedAt: 0
  });

  const scenarioTab = ref<"overview" | "scenarios">("overview");

  // ── Computed ──

  const projects = computed(() => {
    const set = new Set(PROJECTS);
    for (const s of stories.value) if (s.project) set.add(s.project);
    return [...set].sort((a, b) => a.localeCompare(b, "zh-CN"));
  });

  const totalStories = computed(() => total.value);

  const filteredStories = computed(() => {
    let result = [...stories.value];
    if (selectedProject.value) result = result.filter(s => s.project === selectedProject.value);
    return result;
  });

  function selectProject(p: string) {
    selectedProject.value = p;
  }
  const scheduleStats = computed(() => {
    const stats: Record<string, number> = { total: 0, planned: 0, on_track: 0, at_risk: 0, delayed: 0, completed: 0 };
    for (const s of filteredStories.value) {
      stats.total++;
      stats[s.scheduleStatus || "planned"] = (stats[s.scheduleStatus || "planned"] || 0) + 1;
    }
    return stats;
  });

  const groupedStories = computed(() => {
    const groups: Record<string, StoryDocument[]> = {};
    for (const s of filteredStories.value) {
      const k = s.status || "unknown";
      if (!groups[k]) groups[k] = [];
      groups[k].push(s);
    }
    return groups;
  });

  const panelVisible = computed(() => selectedStory.value !== null);
  const projectStoryCounts = computed(() => {
    const c: Record<string, number> = {};
    for (const s of stories.value) if (s.project) c[s.project] = (c[s.project] || 0) + 1;
    return c;
  });

  // ── Time filter ──
  function getTimeFilter() {
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

  // ── Story CRUD ──

  async function fetchStories() {
    loading.value = true;
    error.value = null;
    try {
      const result = await getStoryList({ search: searchQuery.value || undefined, project: selectedProject.value || undefined });
      const tf = getTimeFilter();
      let list = result.list;
      if (tf.start) list = list.filter(s => (s.createdAt || 0) >= tf.start!);
      if (tf.end) list = list.filter(s => (s.createdAt || 0) <= tf.end!);
      stories.value = list;
      total.value = result.total;
    } catch (e: any) {
      error.value = e?.message || "Failed to load";
    } finally {
      loading.value = false;
    }
  }

  function openCreateDialog(project?: string) {
    isEdit.value = false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today.getTime() + 7 * 86400000);
    form.value = {
      key: `story_${Date.now()}`,
      name: "",
      project: project || selectedProject.value || "",
      status: "planning",
      priority: "p2",
      description: "",
      background: "",
      acceptance: "",
      assignee: "",
      startDate: today,
      dueDate: nextWeek,
      completedAt: null,
      scheduleStatus: "planned",
      tags: [],
      scenarios: [],
      files: []
    };
    dialogVisible.value = true;
  }

  function openEditDialog(story: StoryDocument) {
    isEdit.value = true;
    form.value = {
      key: story.key,
      name: story.name,
      project: story.project,
      status: story.status,
      priority: story.priority ?? "p2",
      description: story.description ?? "",
      background: story.background ?? "",
      acceptance: story.acceptance ?? "",
      assignee: story.assignee ?? "",
      startDate: story.startDate ? new Date(story.startDate) : null,
      dueDate: story.dueDate ? new Date(story.dueDate) : null,
      completedAt: story.completedAt ? new Date(story.completedAt) : null,
      scheduleStatus: story.scheduleStatus ?? "planned",
      tags: [...(story.tags ?? [])],
      scenarios: [...(story.scenarios ?? [])],
      files: [...(story.files ?? [])]
    };
    dialogVisible.value = true;
  }

  async function handleSave() {
    if (!form.value.name?.trim()) {
      ElMessage.warning("Name is required");
      return;
    }
    saving.value = true;
    try {
      const payload = {
        ...form.value,
        startDate: form.value.startDate ? form.value.startDate.getTime() : null,
        dueDate: form.value.dueDate ? form.value.dueDate.getTime() : null,
        completedAt: form.value.completedAt ? form.value.completedAt.getTime() : null
      };
      if (isEdit.value) {
        await updateStory(form.value.key, payload as any);
        ElMessage.success("Story updated");
      } else {
        await createStory(payload as any);
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
      await ElMessageBox.confirm(`Delete "${story.name}" and all its scenarios?`, "Confirm", { type: "warning" });
      await deleteStory(story.key);
      ElMessage.success("Deleted");
      if (selectedStory.value?.key === story.key) selectedStory.value = null;
      await fetchStories();
    } catch {
      /* cancelled */
    }
  }

  function openDetail(story: StoryDocument) {
    selectedStory.value = story;
    scenarioTab.value = "overview";
  }

  function closePanel() {
    selectedStory.value = null;
  }
  function setTimeRange(r: TimeRange) {
    timeRange.value = r;
    fetchStories();
  }

  // ── Scenario CRUD (operates on the detail panel's selected story) ──

  function openScenarioCreate() {
    scenarioEditIdx.value = -1;
    scenarioForm.value = {
      key: newScenarioKey(),
      name: "",
      description: "",
      priority: "p2",
      status: "pending",
      steps: [],
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    scenarioDialogVisible.value = true;
  }

  function openScenarioEdit(idx: number) {
    if (!selectedStory.value) return;
    const s = selectedStory.value.scenarios[idx];
    if (!s) return;
    scenarioEditIdx.value = idx;
    scenarioForm.value = { ...s };
    scenarioDialogVisible.value = true;
  }

  async function handleScenarioSave() {
    if (!selectedStory.value) return;
    if (!scenarioForm.value.name.trim()) {
      ElMessage.warning("Scenario name is required");
      return;
    }

    const scenarios = [...selectedStory.value.scenarios];
    const sc = { ...scenarioForm.value, updatedAt: Date.now() };

    if (scenarioEditIdx.value >= 0) {
      scenarios[scenarioEditIdx.value] = sc;
    } else {
      sc.createdAt = Date.now();
      scenarios.push(sc);
    }

    try {
      await updateStory(selectedStory.value.key, { scenarios } as any);
      selectedStory.value = { ...selectedStory.value, scenarios };
      scenarioDialogVisible.value = false;
      ElMessage.success("Scenario saved");
    } catch (e: any) {
      ElMessage.error(e?.message || "Failed");
    }
  }

  async function handleScenarioDelete(idx: number) {
    if (!selectedStory.value) return;
    try {
      await ElMessageBox.confirm("Delete this scenario?", "Confirm", { type: "warning" });
      const scenarios = selectedStory.value.scenarios.filter((_, i) => i !== idx);
      await updateStory(selectedStory.value.key, { scenarios } as any);
      selectedStory.value = { ...selectedStory.value, scenarios };
      ElMessage.success("Scenario deleted");
    } catch {
      /* cancelled */
    }
  }

  // ── Scenario step helpers ──
  function addStep() {
    const steps = [...scenarioForm.value.steps];
    steps.push({ order: steps.length + 1, action: "Given", description: "" });
    scenarioForm.value = { ...scenarioForm.value, steps };
  }

  function removeStep(idx: number) {
    const steps = scenarioForm.value.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 }));
    scenarioForm.value = { ...scenarioForm.value, steps };
  }

  return {
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
    viewMode,
    dialogVisible,
    isEdit,
    saving,
    form,
    scenarioDialogVisible,
    scenarioEditIdx,
    scenarioForm,
    scenarioTab,
    projects,
    totalStories,
    filteredStories,
    groupedStories,
    panelVisible,
    projectStoryCounts,
    scheduleStats,
    fetchStories,
    openCreateDialog,
    openEditDialog,
    handleSave,
    handleDelete,
    openDetail,
    closePanel,
    selectProject,
    setTimeRange,
    openScenarioCreate,
    openScenarioEdit,
    handleScenarioSave,
    handleScenarioDelete,
    addStep,
    removeStep
  };
});
