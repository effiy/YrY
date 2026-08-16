/**
 * Story Board — Pinia store with full CRUD, project/time dimensions, and scenario management.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getStoryList, createStory, updateStory, deleteStory } from "@/api/modules/story";
import { getHistoryList, createHistoryEntry, deleteHistoryEntry } from "@/api/modules/aiCodingHistory";
import { listKnowledgeStories, readKnowledgeStory } from "@/api/modules/knowledgeService";
import type { KnowledgeReadResponse, KnowledgeStoryEntry } from "@/api/interface/yiweb";
import { PROJECTS, PROJECT_LABELS } from "@/config";
import type {
  StoryDocument,
  Scenario,
  ScenarioStep,
  ScenarioPriority,
  ScenarioFile,
  BusinessObjective,
  CoreUser,
  CountryInvolvement,
  InvolvedModule,
  BusinessRule,
  Constraints,
  Milestone,
  AcceptanceCriterion,
  ObjectiveVerification,
  Attachment,
  ApprovalRecord
} from "@/api/modules/story";

export type { StoryDocument, Scenario, ScenarioStep, ScenarioPriority, ScenarioFile };

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function emptyConstraints(): Constraints {
  return { compliance: [], technical: [], performance: [] };
}
function emptyAcceptanceCriteria(): {
  functional: AcceptanceCriterion[];
  data: string[];
  objectiveVerification: ObjectiveVerification[];
} {
  return { functional: [], data: [], objectiveVerification: [] };
}

// Textareas store string[] as newline-joined text; split/trim on save.
function linesToStr(arr?: string[]): string {
  return (arr ?? []).join("\n");
}
function strToLines(s: string | undefined): string[] {
  if (!s) return [];
  return s
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);
}

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

  // ── Knowledge bridge ──
  // Story's story.md content (from YiKnowledge/engineer/learn/projects/{project}/{name}/story.md).
  // Null when not yet loaded or no story.md exists for this story.
  const storyMarkdown = ref<KnowledgeReadResponse | null>(null);
  const storyMarkdownLoading = ref(false);
  // The story dir name (semantic) that resolved to the loaded markdown —
  // used by the story page to navigate to the knowledge tab.
  const storyKnowledgeDir = ref<string | null>(null);
  // All story.md entries for the currently filtered project — used to
  // suggest "open in code review" even when the current story has no markdown yet.
  const projectKnowledgeStories = ref<KnowledgeStoryEntry[]>([]);

  /** Resolve a story's markdown directory by matching `meta.key` first,
   *  falling back to a slug of `story.name`. Returns the dir name or null. */
  function slugify(name: string): string {
    return (name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function loadProjectKnowledgeStories(project: string) {
    if (!project) {
      projectKnowledgeStories.value = [];
      return;
    }
    try {
      const res = await listKnowledgeStories(project);
      projectKnowledgeStories.value = res.stories ?? [];
    } catch {
      projectKnowledgeStories.value = [];
    }
  }

  async function loadStoryMarkdown(story: StoryDocument) {
    if (!story?.project || !story?.name) {
      storyMarkdown.value = null;
      storyKnowledgeDir.value = null;
      return;
    }
    storyMarkdownLoading.value = true;
    try {
      // Resolve dir name: prefer meta.key match, fall back to slug of name.
      await loadProjectKnowledgeStories(story.project);
      const byKey = projectKnowledgeStories.value.find(s => s.meta?.key === story.key);
      const dir = byKey?.storyName ?? slugify(story.name);
      if (!dir) {
        storyMarkdown.value = null;
        storyKnowledgeDir.value = null;
        return;
      }
      const md = await readKnowledgeStory(story.project, dir);
      storyMarkdown.value = md;
      storyKnowledgeDir.value = dir;
    } catch {
      storyMarkdown.value = null;
      storyKnowledgeDir.value = null;
    } finally {
      storyMarkdownLoading.value = false;
    }
  }

  // ── Story dialog ──
  const dialogVisible = ref(false);
  const isEdit = ref(false);
  const saving = ref(false);
  // Textarea mirrors of `constraints.*` string[] — kept in sync by
  // `syncConstraintsToText` (read) / `syncConstraintsFromText` (write) so the
  // dialog can use el-input textarea while the persisted shape stays string[].
  const constraintsText = ref({
    compliance: "",
    technical: "",
    performance: ""
  });
  const acceptanceDataText = ref("");
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
    tags: [] as string[],
    scenarios: [] as Scenario[],
    files: [] as StoryDocument["files"],
    // BRD sections
    objectives: [] as BusinessObjective[],
    coreUsers: [] as CoreUser[],
    involvedCountries: [] as CountryInvolvement[],
    involvedModules: [] as InvolvedModule[],
    businessRules: [] as BusinessRule[],
    constraints: emptyConstraints(),
    milestones: [] as Milestone[],
    urgency: "p2" as ScenarioPriority,
    acceptanceCriteria: emptyAcceptanceCriteria(),
    attachments: [] as Attachment[],
    approvalRecords: [] as ApprovalRecord[]
  });

  // ── Scenario dialog ──
  const scenarioDialogVisible = ref(false);
  const scenarioEditIdx = ref(-1); // -1 = create
  const scenarioForm = ref<Scenario>({
    key: "",
    name: "",
    description: "",
    priority: "p2",
    status: "planning",
    steps: [],
    tags: [],
    files: [],
    trigger: "",
    prerequisites: "",
    expectedResult: "",
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

  function projectLabel(value: string): string {
    return PROJECT_LABELS[value] ?? value;
  }

  const projectStoryCounts = computed(() => {
    const counts: Record<string, number> = {};
    for (const s of stories.value) {
      if (s.project) {
        counts[s.project] = (counts[s.project] || 0) + 1;
      }
    }
    return counts;
  });

  const totalStories = computed(() => total.value);

  const filteredStories = computed(() => {
    let result = [...stories.value];
    if (selectedProject.value) result = result.filter(s => s.project === selectedProject.value);
    return result;
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
      const tf = getTimeFilter();
      const result = await getStoryList({
        search: searchQuery.value || undefined,
        project: selectedProject.value || undefined,
        createdAtStart: tf.start,
        createdAtEnd: tf.end
      });
      let list = result.list;
      // Migrate old scenario status values to the shared StoryStatus set
      const statusMap: Record<string, string> = {
        pending: "planning",
        in_progress: "develop",
        done: "operations",
        blocked: "planning"
      };
      for (const s of list) {
        if (s.scenarios) {
          for (const sc of s.scenarios) {
            if (statusMap[sc.status]) sc.status = statusMap[sc.status] as any;
          }
        }
      }
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
      tags: [],
      scenarios: [],
      files: [],
      objectives: [],
      coreUsers: [],
      involvedCountries: [],
      involvedModules: [],
      businessRules: [],
      constraints: emptyConstraints(),
      milestones: [],
      urgency: "p2",
      acceptanceCriteria: emptyAcceptanceCriteria(),
      attachments: [],
      approvalRecords: []
    };
    constraintsText.value = { compliance: "", technical: "", performance: "" };
    acceptanceDataText.value = "";
    dialogVisible.value = true;
  }

  function openEditDialog(story: StoryDocument) {
    isEdit.value = true;
    const c = story.constraints ?? emptyConstraints();
    const ac = story.acceptanceCriteria ?? emptyAcceptanceCriteria();
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
      tags: [...(story.tags ?? [])],
      scenarios: [...(story.scenarios ?? [])],
      files: [...(story.files ?? [])],
      objectives: [...(story.objectives ?? [])],
      coreUsers: [...(story.coreUsers ?? [])],
      involvedCountries: [...(story.involvedCountries ?? [])],
      involvedModules: [...(story.involvedModules ?? [])],
      businessRules: [...(story.businessRules ?? [])],
      constraints: { compliance: [...c.compliance], technical: [...c.technical], performance: [...c.performance] },
      milestones: [...(story.milestones ?? [])],
      urgency: story.urgency ?? "p2",
      acceptanceCriteria: {
        functional: [...ac.functional],
        data: [...ac.data],
        objectiveVerification: [...ac.objectiveVerification]
      },
      attachments: [...(story.attachments ?? [])],
      approvalRecords: [...(story.approvalRecords ?? [])]
    };
    constraintsText.value = {
      compliance: linesToStr(c.compliance),
      technical: linesToStr(c.technical),
      performance: linesToStr(c.performance)
    };
    acceptanceDataText.value = linesToStr(ac.data);
    dialogVisible.value = true;
  }

  async function handleSave() {
    if (!form.value.name?.trim()) {
      ElMessage.warning("Name is required");
      return;
    }
    saving.value = true;
    try {
      // Sync textarea mirrors into the persisted array shape right before save.
      form.value.constraints = {
        compliance: strToLines(constraintsText.value.compliance),
        technical: strToLines(constraintsText.value.technical),
        performance: strToLines(constraintsText.value.performance)
      };
      form.value.acceptanceCriteria = {
        ...form.value.acceptanceCriteria,
        data: strToLines(acceptanceDataText.value)
      };
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
    loadAiCodingHistoryForStory(story.key);
    // Kick off story.md load — nulls out any stale content from the
    // previously opened story. Best-effort: missing story.md is fine.
    storyMarkdown.value = null;
    storyKnowledgeDir.value = null;
    loadStoryMarkdown(story);
  }

  /** Load AI coding history from the dedicated collection and merge into scenario arrays. */
  async function loadAiCodingHistoryForStory(storyKey: string) {
    try {
      const [aiCodingRes] = await Promise.all([
        getHistoryList({ storyKey, type: "ai_coding", pageSize: 500 })
      ]);

      if (!selectedStory.value || selectedStory.value.key !== storyKey) return;

      // Build map of scenarioKey → entries
      const byScenarioAi: Record<string, { id?: string; prompt: string; generatedAt: number }[]> = {};
      for (const doc of aiCodingRes.list) {
        if (!byScenarioAi[doc.scenarioKey]) byScenarioAi[doc.scenarioKey] = [];
        byScenarioAi[doc.scenarioKey].push({ id: doc.key, prompt: doc.prompt, generatedAt: doc.generatedAt });
      }

      // Merge into each scenario
      const scenarios = selectedStory.value.scenarios.map(sc => {
        const aiEntries = byScenarioAi[sc.key];
        if (!aiEntries?.length) return sc;
        return {
          ...sc,
          ...(aiEntries?.length ? { aiCodingHistory: aiEntries } : {})
        };
      });

      selectedStory.value = { ...selectedStory.value, scenarios };
    } catch (e: any) {
      console.warn("Failed to load AI coding history:", e.message);
    }
  }

  function closePanel() {
    selectedStory.value = null;
    storyMarkdown.value = null;
    storyKnowledgeDir.value = null;
  }
  function selectProject(project: string) {
    selectedProject.value = project;
    fetchStories();
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
      status: "planning",
      steps: [],
      tags: [],
      files: [],
      aiCodingHistory: [],
      trigger: "",
      prerequisites: "",
      expectedResult: "",
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
    scenarioForm.value = {
      ...s,
      trigger: s.trigger ?? "",
      prerequisites: s.prerequisites ?? "",
      expectedResult: s.expectedResult ?? ""
    };
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

  async function saveAiCodingPrompt(scenarioKey: string, prompt: string) {
    if (!selectedStory.value) return;
    const story = selectedStory.value;
    const idx = story.scenarios.findIndex(s => s.key === scenarioKey);
    if (idx < 0) return;

    const sc = story.scenarios[idx];
    const generatedAt = Date.now();

    try {
      // Persist to dedicated collection
      const result = await createHistoryEntry({
        storyKey: story.key,
        scenarioKey,
        scenarioName: sc.name,
        prompt,
        generatedAt
      });

      // Update local state for immediate UI feedback
      const scenarios = [...story.scenarios];
      const history = sc.aiCodingHistory ? [...sc.aiCodingHistory] : [];
      history.push({ id: result?.key, prompt, generatedAt });
      scenarios[idx] = { ...sc, aiCodingHistory: history };
      selectedStory.value = { ...story, scenarios };
    } catch (e: any) {
      console.error("Failed to save AI coding history:", e);
    }
  }

  async function deleteAiCodingEntry(scenarioKey: string, entryIdx: number) {
    if (!selectedStory.value) return;
    const story = selectedStory.value;
    const idx = story.scenarios.findIndex(s => s.key === scenarioKey);
    if (idx < 0) return;

    const sc = story.scenarios[idx];
    if (!sc.aiCodingHistory?.length) return;

    const entry = sc.aiCodingHistory[entryIdx];
    if (!entry) return;

    try {
      await ElMessageBox.confirm("Delete this history entry?", "Confirm", { type: "warning" });

      // Delete from dedicated collection if we have the document key
      if (entry.id) {
        await deleteHistoryEntry(entry.id);
      }

      // Update local state
      const scenarios = [...story.scenarios];
      const history = sc.aiCodingHistory.filter((_, i) => i !== entryIdx);
      scenarios[idx] = { ...sc, aiCodingHistory: history };
      selectedStory.value = { ...story, scenarios };
      ElMessage.success("History entry deleted");
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

  function addScenarioFile() {
    const files = [...scenarioForm.value.files];
    files.push({ filePath: "", fileName: "" });
    scenarioForm.value = { ...scenarioForm.value, files };
  }

  function removeScenarioFile(idx: number) {
    const files = scenarioForm.value.files.filter((_, i) => i !== idx);
    scenarioForm.value = { ...scenarioForm.value, files };
  }

  // ── BRD tabular field helpers ──
  // Each tabular field uses the same add/remove pattern as `addStep`/`removeStep`.
  // New rows get a generated id so Vue's `:key` stays stable across edits.

  function addObjective() {
    const arr = [...form.value.objectives];
    arr.push({ id: newId("obj"), objective: "", metric: "", target: "" });
    form.value = { ...form.value, objectives: arr };
  }
  function removeObjective(idx: number) {
    form.value = { ...form.value, objectives: form.value.objectives.filter((_, i) => i !== idx) };
  }

  function addCoreUser() {
    const arr = [...form.value.coreUsers];
    arr.push({ id: newId("cu"), role: "", description: "", frequency: "on_demand" });
    form.value = { ...form.value, coreUsers: arr };
  }
  function removeCoreUser(idx: number) {
    form.value = { ...form.value, coreUsers: form.value.coreUsers.filter((_, i) => i !== idx) };
  }

  function addCountry() {
    const arr = [...form.value.involvedCountries];
    arr.push({ id: newId("ctry"), country: "", brand: "", scope: "all" });
    form.value = { ...form.value, involvedCountries: arr };
  }
  function removeCountry(idx: number) {
    form.value = { ...form.value, involvedCountries: form.value.involvedCountries.filter((_, i) => i !== idx) };
  }

  function addModule() {
    const arr = [...form.value.involvedModules];
    arr.push({ id: newId("mod"), module: "", impact: "" });
    form.value = { ...form.value, involvedModules: arr };
  }
  function removeModule(idx: number) {
    form.value = { ...form.value, involvedModules: form.value.involvedModules.filter((_, i) => i !== idx) };
  }

  function addBusinessRule() {
    const arr = [...form.value.businessRules];
    const nextNum = arr.length + 1;
    arr.push({ id: `BR-${String(nextNum).padStart(3, "0")}`, description: "", priority: "must" });
    form.value = { ...form.value, businessRules: arr };
  }
  function removeBusinessRule(idx: number) {
    form.value = { ...form.value, businessRules: form.value.businessRules.filter((_, i) => i !== idx) };
  }

  function addMilestone() {
    const arr = [...form.value.milestones];
    arr.push({ id: newId("ms"), name: "", expectedDate: null, status: "not_started" });
    form.value = { ...form.value, milestones: arr };
  }
  function removeMilestone(idx: number) {
    form.value = { ...form.value, milestones: form.value.milestones.filter((_, i) => i !== idx) };
  }

  function addAcceptance() {
    const arr = [...form.value.acceptanceCriteria.functional];
    const nextNum = arr.length + 1;
    arr.push({ id: `AC-${String(nextNum).padStart(3, "0")}`, description: "", priority: "must" });
    form.value = {
      ...form.value,
      acceptanceCriteria: { ...form.value.acceptanceCriteria, functional: arr }
    };
  }
  function removeAcceptance(idx: number) {
    form.value = {
      ...form.value,
      acceptanceCriteria: {
        ...form.value.acceptanceCriteria,
        functional: form.value.acceptanceCriteria.functional.filter((_, i) => i !== idx)
      }
    };
  }

  function addObjectiveVerification() {
    const arr = [...form.value.acceptanceCriteria.objectiveVerification];
    arr.push({ id: newId("ov"), objective: "", method: "", criteria: "" });
    form.value = {
      ...form.value,
      acceptanceCriteria: { ...form.value.acceptanceCriteria, objectiveVerification: arr }
    };
  }
  function removeObjectiveVerification(idx: number) {
    form.value = {
      ...form.value,
      acceptanceCriteria: {
        ...form.value.acceptanceCriteria,
        objectiveVerification: form.value.acceptanceCriteria.objectiveVerification.filter((_, i) => i !== idx)
      }
    };
  }

  function addAttachment() {
    const arr = [...form.value.attachments];
    arr.push({ id: newId("att"), label: "", url: "" });
    form.value = { ...form.value, attachments: arr };
  }
  function removeAttachment(idx: number) {
    form.value = { ...form.value, attachments: form.value.attachments.filter((_, i) => i !== idx) };
  }

  function addApproval() {
    const arr = [...form.value.approvalRecords];
    arr.push({ id: newId("appr"), role: "business_owner", approver: "", date: null, result: "approved", comments: "" });
    form.value = { ...form.value, approvalRecords: arr };
  }
  function removeApproval(idx: number) {
    form.value = { ...form.value, approvalRecords: form.value.approvalRecords.filter((_, i) => i !== idx) };
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
    constraintsText,
    acceptanceDataText,
    scenarioDialogVisible,
    scenarioEditIdx,
    scenarioForm,
    scenarioTab,
    projects,
    projectLabel,
    projectStoryCounts,
    totalStories,
    filteredStories,
    groupedStories,
    panelVisible,
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
    saveAiCodingPrompt,
    deleteAiCodingEntry,
    addStep,
    removeStep,
    addScenarioFile,
    removeScenarioFile,
    addObjective,
    removeObjective,
    addCoreUser,
    removeCoreUser,
    addCountry,
    removeCountry,
    addModule,
    removeModule,
    addBusinessRule,
    removeBusinessRule,
    addMilestone,
    removeMilestone,
    addAcceptance,
    removeAcceptance,
    addObjectiveVerification,
    removeObjectiveVerification,
    addAttachment,
    removeAttachment,
    addApproval,
    removeApproval,
    storyMarkdown,
    storyMarkdownLoading,
    storyKnowledgeDir,
    projectKnowledgeStories,
    loadStoryMarkdown,
    loadProjectKnowledgeStories
  };
});
