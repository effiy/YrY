<script setup lang="ts" name="storyBoard">
import { computed, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElNotification } from "element-plus";
import { Document, Link } from "@element-plus/icons-vue";
import { useStoryStore } from "@/stores/modules/story";
import type { StoryDocument, Scenario } from "@/api/modules/story";
import { YIAI_OLLAMA_URL } from "@/config/yiweb";
import StoryStatusBadge from "./components/StoryStatusBadge.vue";
import CardListToggle from "./components/CardListToggle.vue";
import StoryCard from "./components/StoryCard.vue";
import StoryTable from "./components/StoryTable.vue";

const { t } = useI18n();
const store = useStoryStore();

// Track which scenario keys are currently generating AI coding prompts
const generatingKeys = reactive<Set<string>>(new Set());
// Track which scenario keys are currently generating analysis file prompts
const generatingAnalysisKeys = reactive<Set<string>>(new Set());

/** Copy text to clipboard via the async Clipboard API. */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function handleAiCoding(sc: Scenario) {
  const key = sc.key;
  if (generatingKeys.has(key)) return;
  generatingKeys.add(key);

  try {
    // Build the scenario content for the AI
    const stepsText = (sc.steps ?? []).map(s => `  ${s.action} ${s.description}`).join("\n");
    const tagsText = (sc.tags ?? []).join(", ");

    const systemPrompt = `You are an expert at writing Claude Code prompts. Given a software scenario (with Gherkin-style Given/When/Then steps), produce a single, self-contained, actionable prompt that a developer can paste directly into Claude Code to implement the scenario. The prompt should:
- Be written in the same language as the scenario description
- Include the scenario's context, requirements, and acceptance criteria
- Mention the tech stack if inferable from the tags
- Be concise but complete — ready to copy-paste and run
- NOT include any preamble, explanation, or markdown fences — just the prompt text itself`;

    const userMessage = `Scenario: ${sc.name}
Description: ${sc.description || "N/A"}
Priority: ${sc.priority.toUpperCase()}
Tags: ${tagsText || "N/A"}
Steps:
${stepsText || "N/A"}

Generate a Claude Code prompt for this scenario.`;

    const ollamaBase = import.meta.env.DEV ? "/ollama" : YIAI_OLLAMA_URL;
    const response = await fetch(`${ollamaBase}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3.5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data = await response.json();
    const result: string = data?.message?.content ?? "";

    if (!result) {
      throw new Error("Empty response from AI");
    }

    const trimmed = result.trim();

    // Auto-copy (requires focus; may fail after long async call)
    window.focus();
    await copyToClipboard(trimmed);

    const escaped = trimmed.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    ElNotification({
      title: t("story.aiCoding"),
      message: `<div style="max-height:calc(88vh - 120px);overflow-y:auto;white-space:pre-wrap;font-size:14px;line-height:1.7;">${escaped}</div>`,
      type: "success",
      duration: 0,
      customClass: "ai-coding-notify",
      dangerouslyUseHTMLString: true,
      onClick: () => {
        copyToClipboard(trimmed);
        ElMessage.success(t("story.aiCodingCopied"));
      }
    });

    // Persist generated prompt to scenario history
    store.saveAiCodingPrompt(sc.key, trimmed);
  } catch (err) {
    console.error("AI Coding prompt generation failed:", err);
    ElMessage.error(t("story.aiCodingFailed"));
  } finally {
    generatingKeys.delete(key);
  }
}

async function handleAnalysisFiles(sc: Scenario) {
  const key = sc.key;
  if (generatingAnalysisKeys.has(key)) return;
  generatingAnalysisKeys.add(key);

  try {
    const story = store.selectedStory;
    const stepsText = (sc.steps ?? []).map(s => `  ${s.action} ${s.description}`).join("\n");
    const tagsText = (sc.tags ?? []).join(", ");
    const storyFiles = (story?.files ?? []).map(f => `  ${f.fileName} (${f.filePath})`);
    const scenarioFiles = (sc.files ?? []).map(f => `  ${f.fileName} (${f.filePath})`);
    const allFiles = [...storyFiles, ...scenarioFiles];
    const filesText = allFiles.join("\n");

    const systemPrompt = `You are an expert at writing Claude Code prompts. Given a software scenario (with Gherkin-style Given/When/Then steps, tags, and a project file inventory), produce a single, self-contained prompt that instructs Claude Code to:

1. Analyze the scenario's name, description, steps, and tags to determine which project files are relevant
2. Fill in the scenario's \`files\` array with those relevant files (format: {filePath, fileName})
3. Use the project's API (updateDocument / updateStory) to persist the updated scenario data

The output prompt MUST:
- Reference the actual project file paths from the provided inventory and match them to the scenario's domain
- Include the specific API call format: POST to the RPC endpoint with module_name/services.database.data_service, method_name/update_document, parameters/{cname: "stories", key: storyKey, data: {scenarios: [...]}}
- Be self-contained — ready to copy-paste and run
- NOT include preamble, explanation, or markdown fences — just the prompt text itself`;

    const userMessage = `Scenario: ${sc.name}
Description: ${sc.description || "N/A"}
Priority: ${sc.priority.toUpperCase()}
Tags: ${tagsText || "N/A"}
Steps:
${stepsText || "N/A"}

Project File Inventory:
${filesText || "N/A"}

Generate a Claude Code prompt that analyzes this scenario and maps the most relevant project files to its \`files\` array, then updates via the API.`;

    const ollamaBase = import.meta.env.DEV ? "/ollama" : YIAI_OLLAMA_URL;
    const response = await fetch(`${ollamaBase}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3.5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data = await response.json();
    const result: string = data?.message?.content ?? "";

    if (!result) {
      throw new Error("Empty response from AI");
    }

    const trimmed = result.trim();

    // Auto-copy
    window.focus();
    await copyToClipboard(trimmed);

    const escaped = trimmed.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    ElNotification({
      title: t("story.analysisFiles"),
      message: `<div style="max-height:calc(88vh - 120px);overflow-y:auto;white-space:pre-wrap;font-size:14px;line-height:1.7;">${escaped}</div>`,
      type: "success",
      duration: 0,
      customClass: "ai-coding-notify",
      dangerouslyUseHTMLString: true,
      onClick: () => {
        copyToClipboard(trimmed);
        ElMessage.success(t("story.analysisFilesCopied"));
      }
    });

    // Persist generated prompt to analysis files history
    store.saveAnalysisFilesPrompt(sc.key, trimmed);
  } catch (err) {
    console.error("Analysis Files prompt generation failed:", err);
    ElMessage.error(t("story.analysisFilesFailed"));
  } finally {
    generatingAnalysisKeys.delete(key);
  }
}

const statusLabels = computed(() => ({
  planning: t("story.planning"),
  design: t("story.design"),
  develop: t("story.develop"),
  testing: t("story.testing"),
  operations: t("story.operations"),
  archived: t("story.archived")
}));
const statusOrder = ["planning", "design", "develop", "testing", "operations", "archived"];
const priorityLabels = computed(() => ({
  p0: t("story.p0Critical"),
  p1: t("story.p1High"),
  p2: t("story.p2Medium"),
  p3: t("story.p3Low")
}));
const priorityColors: Record<string, string> = { p0: "danger", p1: "warning", p2: "info", p3: "" };
const stepActions = ["Given", "When", "Then", "And"];

const timeOptions = computed(() => [
  { label: t("story.all"), value: "all" as const },
  { label: t("story.thisWeek"), value: "week" as const },
  { label: t("story.thisMonth"), value: "month" as const },
  { label: t("story.thisQuarter"), value: "quarter" as const },
  { label: t("story.custom"), value: "custom" as const }
]);

function fmtDate(ts: number | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function scenarioCount(story: StoryDocument): number {
  return story.scenarios?.length ?? 0;
}

function scenarioDone(story: StoryDocument): number {
  return story.scenarios?.filter(sc => sc.status === "operations").length ?? 0;
}

function scenarioProgress(story: StoryDocument): number {
  const total = scenarioCount(story);
  if (!total) return 0;
  return Math.round((scenarioDone(story) / total) * 100);
}

function formatSize(bytes: number | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── BRD detail helpers ──

function freqTagType(freq: string): string {
  const m: Record<string, string> = { daily: "", weekly: "info", monthly: "warning", on_demand: "success" };
  return m[freq] || "";
}

function freqLabel(freq: string): string {
  const m: Record<string, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly", on_demand: "OnDemand" };
  return m[freq] || "Daily";
}

function rulePriorityType(p: string): string {
  const m: Record<string, string> = { must: "danger", should: "warning", could: "info" };
  return m[p] || "";
}

function rulePriorityLabel(p: string): string {
  const m: Record<string, string> = { must: "Must", should: "Should", could: "Could" };
  return m[p] || "Must";
}

function hasConstraints(c: { compliance?: string[]; technical?: string[]; performance?: string[] } | undefined): boolean {
  if (!c) return false;
  return !!(c.compliance?.length || c.technical?.length || c.performance?.length);
}

const milestoneDrawerProgress = computed(() => {
  const ms = store.selectedStory?.milestones;
  if (!ms?.length) return 0;
  const done = ms.filter(m => m.status === "done").length;
  return Math.round((done / ms.length) * 100);
});

function msStatusType(s: string): string {
  const m: Record<string, string> = { pending_review: "warning", not_started: "info", in_progress: "primary", done: "success" };
  return m[s] || "";
}

function msStatusLabel(s: string): string {
  const m: Record<string, string> = { pending_review: "Pending", not_started: "NotStarted", in_progress: "InProgress", done: "Done" };
  return m[s] || "NotStarted";
}

function hasAcceptanceCriteria(ac: StoryDocument["acceptanceCriteria"]): boolean {
  if (!ac) return false;
  return !!(ac.functional?.length || ac.data?.length || ac.objectiveVerification?.length);
}

function approvalRoleLabel(role: string): string {
  const m: Record<string, string> = {
    business_owner: "roleBusinessOwner",
    eu_hub_itbp: "roleEuHubItbp",
    rsc_business: "roleRscBusiness",
    hq_counterpart: "roleHqCounterpart"
  };
  const k = m[role];
  return k ? t(`brd.${k}`) : role;
}

function openAttachment(url: string) {
  window.open(url, "_blank");
}

onMounted(() => store.fetchStories());
</script>

<template>
  <div class="sb-root">
    <!-- Header -->
    <div class="sb-hdr">
      <div class="sb-hdr-l">
        <h2 class="sb-title">{{ $t("story.title") }}</h2>
        <span class="sb-count">{{ $t("story.storiesCount", { count: store.totalStories }) }}</span>
      </div>
      <div class="sb-hdr-r">
        <el-button type="primary" @click="store.openCreateDialog()">{{ $t("story.newStory") }}</el-button>
        <CardListToggle v-model="store.viewMode" />
      </div>
    </div>

    <!-- Dimensions -->
    <div class="sb-dims">
      <div class="sb-dim">
        <span class="sb-dim-lbl">{{ $t("story.project") }}</span>
        <el-select
          v-model="store.selectedProject"
          :placeholder="$t('story.all')"
          clearable
          size="small"
          style="width: 180px"
          @change="store.selectProject(store.selectedProject || '')"
        >
          <el-option :label="$t('story.allProjects')" value="" />
          <el-option v-for="p in store.projects" :key="p" :label="`${p} (${store.projectStoryCounts[p] || 0})`" :value="p" />
        </el-select>
      </div>
      <div class="sb-dim">
        <span class="sb-dim-lbl">{{ $t("story.time") }}</span>
        <el-select v-model="store.timeRange" size="small" style="width: 140px" @change="(v: any) => store.setTimeRange(v)">
          <el-option v-for="o in timeOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <template v-if="store.timeRange === 'custom'">
          <el-date-picker
            v-model="store.customStart"
            type="date"
            :placeholder="$t('story.start')"
            size="small"
            style="width: 130px"
            @change="store.fetchStories()"
          />
          <span class="sb-sep">-</span>
          <el-date-picker
            v-model="store.customEnd"
            type="date"
            :placeholder="$t('story.end')"
            size="small"
            style="width: 130px"
            @change="store.fetchStories()"
          />
        </template>
      </div>
      <div class="sb-dim-r">
        <el-input
          v-model="store.searchQuery"
          :placeholder="$t('story.search')"
          clearable
          size="small"
          style="width: 200px"
          @change="store.fetchStories()"
        />
      </div>
    </div>

    <!-- Content -->
    <el-skeleton v-if="store.loading" :rows="5" animated />
    <el-alert v-else-if="store.error" :title="store.error" type="error" show-icon />

    <!-- Cards -->
    <div v-show="store.viewMode === 'cards'" class="sb-cards">
      <template v-for="st in statusOrder" :key="st">
        <div v-if="store.groupedStories[st]?.length" class="sb-grp">
          <h3 class="sb-grp-title">
            <StoryStatusBadge :status="st" /><span class="sb-grp-count">{{ store.groupedStories[st].length }}</span>
          </h3>
          <div class="sb-grid">
            <StoryCard
              v-for="s in store.groupedStories[st]"
              :key="s.key"
              :story="s"
              @click="store.openDetail(s)"
              @edit="store.openEditDialog(s)"
              @delete="store.handleDelete(s)"
            />
          </div>
        </div>
      </template>
      <el-empty v-if="store.filteredStories.length === 0" :description="$t('story.noStories')"
        ><el-button type="primary" @click="store.openCreateDialog()">{{ $t("story.create") }}</el-button></el-empty
      >
    </div>

    <!-- List -->
    <div v-show="store.viewMode === 'list'" class="sb-list">
      <StoryTable
        :stories="store.filteredStories"
        @row-click="store.openDetail"
        @edit="store.openEditDialog"
        @delete="store.handleDelete"
      />
    </div>

    <!-- Detail Drawer -->
    <el-drawer
      v-model="store.panelVisible"
      :title="store.selectedStory?.name ?? $t('story.detail')"
      size="650px"
      @close="store.closePanel()"
    >
      <div v-if="store.selectedStory" class="sd-root">
        <el-tabs v-model="store.scenarioTab">
          <el-tab-pane :label="$t('story.overview')" name="overview">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item :label="$t('story.status')"
                ><StoryStatusBadge :status="store.selectedStory.status"
              /></el-descriptions-item>
              <el-descriptions-item :label="$t('story.priority')"
                ><el-tag
                  v-if="store.selectedStory.priority"
                  :type="priorityColors[store.selectedStory.priority] as any"
                  size="small"
                  >{{ priorityLabels[store.selectedStory.priority] }}</el-tag
                ></el-descriptions-item
              >
              <el-descriptions-item :label="$t('story.project')">{{ store.selectedStory.project || "-" }}</el-descriptions-item>
              <el-descriptions-item :label="$t('story.assignee')">{{ store.selectedStory.assignee || "-" }}</el-descriptions-item>

              <el-descriptions-item :label="$t('story.startDate')">{{
                fmtDate(store.selectedStory.startDate) || "-"
              }}</el-descriptions-item>
              <el-descriptions-item :label="$t('story.dueDate')"
                ><span>{{ fmtDate(store.selectedStory.dueDate) || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item v-if="store.selectedStory.completedAt" :label="$t('story.completedDate')">{{
                fmtDate(store.selectedStory.completedAt)
              }}</el-descriptions-item>
              <el-descriptions-item :label="$t('story.updated')">{{
                fmtDate(store.selectedStory.updatedAt)
              }}</el-descriptions-item>
            </el-descriptions>
            <h4 class="sd-sec">{{ $t("story.background") }}</h4>
            <p class="sd-txt">{{ store.selectedStory.background || $t("story.none") }}</p>
            <h4 class="sd-sec">{{ $t("story.description") }}</h4>
            <p class="sd-txt">{{ store.selectedStory.description || $t("story.none") }}</p>
            <h4 class="sd-sec">{{ $t("story.acceptance") }}</h4>
            <p class="sd-txt" style="white-space: pre-wrap">{{ store.selectedStory.acceptance || $t("story.none") }}</p>
            <h4 class="sd-sec">{{ $t("story.tags") }}</h4>
            <div class="sd-tags">
              <el-tag v-for="tag in store.selectedStory.tags" :key="tag" size="small">{{ tag }}</el-tag
              ><span v-if="!store.selectedStory.tags?.length" class="sd-muted">{{ $t("story.none") }}</span>
            </div>
            <h4 class="sd-sec">{{ $t("story.files") }}</h4>
            <div v-if="store.selectedStory.files?.length" class="sd-files">
              <div
                v-for="f in store.selectedStory.files"
                :key="f.filePath"
                class="sd-file-item"
                :title="$t('story.clickToCopy')"
                @click="
                  copyToClipboard(f.filePath);
                  ElMessage.success($t('story.aiCodingCopied'));
                "
              >
                <el-icon><Document /></el-icon>
                <div class="sd-file-info">
                  <span class="sd-file-name">{{ f.fileName || f.filePath }}</span>
                  <span class="sd-file-path">{{ f.filePath }}</span>
                </div>
                <div class="sd-file-meta">
                  <span v-if="f.language" class="sd-file-lang">{{ f.language }}</span>
                  <span v-if="f.lines" class="sd-file-lines">{{ f.lines }} lines</span>
                  <span v-if="f.size" class="sd-file-size">{{ formatSize(f.size) }}</span>
                </div>
              </div>
            </div>
            <p v-else class="sd-muted">{{ $t("story.none") }}</p>

            <!-- BRD: Business Objectives -->
            <template v-if="store.selectedStory.objectives?.length">
              <h4 class="sd-sec">{{ $t("brd.objectives") }}</h4>
              <el-table :data="store.selectedStory.objectives" border size="small" class="sd-brd-table">
                <el-table-column type="index" label="#" width="40" align="center" />
                <el-table-column :label="$t('brd.objective')" prop="objective" min-width="160" show-overflow-tooltip />
                <el-table-column :label="$t('brd.metric')" prop="metric" min-width="140" show-overflow-tooltip />
                <el-table-column :label="$t('brd.target')" prop="target" min-width="120" show-overflow-tooltip />
              </el-table>
            </template>

            <!-- BRD: Core Users -->
            <template v-if="store.selectedStory.coreUsers?.length">
              <h4 class="sd-sec">{{ $t("brd.coreUsers") }}</h4>
              <el-table :data="store.selectedStory.coreUsers" border size="small" class="sd-brd-table">
                <el-table-column :label="$t('brd.userRole')" prop="role" min-width="120" show-overflow-tooltip />
                <el-table-column :label="$t('brd.roleDesc')" prop="description" min-width="160" show-overflow-tooltip />
                <el-table-column :label="$t('brd.frequency')" width="110" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" :type="freqTagType(row.frequency)">{{ $t(`brd.freq${freqLabel(row.frequency)}`) }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </template>

            <!-- BRD: Involved Countries -->
            <template v-if="store.selectedStory.involvedCountries?.length">
              <h4 class="sd-sec">{{ $t("brd.countries") }}</h4>
              <el-table :data="store.selectedStory.involvedCountries" border size="small" class="sd-brd-table">
                <el-table-column :label="$t('brd.country')" prop="country" min-width="120" show-overflow-tooltip />
                <el-table-column :label="$t('brd.brand')" prop="brand" min-width="120" show-overflow-tooltip />
                <el-table-column :label="$t('brd.scope')" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" :type="row.scope === 'all' ? 'info' : 'warning'">{{ $t(`brd.scope${row.scope === 'all' ? 'All' : 'Partial'}`) }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </template>

            <!-- BRD: Involved Modules -->
            <template v-if="store.selectedStory.involvedModules?.length">
              <h4 class="sd-sec">{{ $t("brd.modules") }}</h4>
              <el-table :data="store.selectedStory.involvedModules" border size="small" class="sd-brd-table">
                <el-table-column :label="$t('brd.module')" prop="module" min-width="160" show-overflow-tooltip />
                <el-table-column :label="$t('brd.impact')" prop="impact" min-width="200" show-overflow-tooltip />
              </el-table>
            </template>

            <!-- BRD: Business Rules -->
            <template v-if="store.selectedStory.businessRules?.length">
              <h4 class="sd-sec">{{ $t("brd.rules") }}</h4>
              <el-table :data="store.selectedStory.businessRules" border size="small" class="sd-brd-table">
                <el-table-column :label="$t('brd.ruleId')" prop="id" width="90" />
                <el-table-column :label="$t('brd.ruleDesc')" prop="description" min-width="200" show-overflow-tooltip />
                <el-table-column :label="$t('brd.rulePriority')" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" :type="rulePriorityType(row.priority)">{{ $t(`brd.pri${rulePriorityLabel(row.priority)}`) }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </template>

            <!-- BRD: Constraints -->
            <template v-if="store.selectedStory.constraints && hasConstraints(store.selectedStory.constraints)">
              <h4 class="sd-sec">{{ $t("brd.constraints") }}</h4>
              <div class="sd-constraints">
                <div v-if="store.selectedStory.constraints.compliance?.length" class="sd-constraint-group">
                  <span class="sd-constraint-label">{{ $t("brd.compliance") }}</span>
                  <div class="sd-tags">
                    <el-tag v-for="(c, ci) in store.selectedStory.constraints.compliance" :key="'cc'+ci" size="small" type="danger">{{ c }}</el-tag>
                  </div>
                </div>
                <div v-if="store.selectedStory.constraints.technical?.length" class="sd-constraint-group">
                  <span class="sd-constraint-label">{{ $t("brd.technical") }}</span>
                  <div class="sd-tags">
                    <el-tag v-for="(c, ci) in store.selectedStory.constraints.technical" :key="'ct'+ci" size="small" type="warning">{{ c }}</el-tag>
                  </div>
                </div>
                <div v-if="store.selectedStory.constraints.performance?.length" class="sd-constraint-group">
                  <span class="sd-constraint-label">{{ $t("brd.performance") }}</span>
                  <div class="sd-tags">
                    <el-tag v-for="(c, ci) in store.selectedStory.constraints.performance" :key="'cp'+ci" size="small" type="info">{{ c }}</el-tag>
                  </div>
                </div>
              </div>
            </template>

            <!-- BRD: Milestones -->
            <template v-if="store.selectedStory.milestones?.length">
              <h4 class="sd-sec">{{ $t("brd.milestones") }}</h4>
              <el-progress
                v-if="store.selectedStory.milestones.length"
                :percentage="milestoneDrawerProgress"
                :stroke-width="8"
                :color="milestoneDrawerProgress === 100 ? '#67c23a' : '#409eff'"
                style="margin-bottom: 10px"
              />
              <el-table :data="store.selectedStory.milestones" border size="small" class="sd-brd-table">
                <el-table-column :label="$t('brd.milestoneName')" prop="name" min-width="140" show-overflow-tooltip />
                <el-table-column :label="$t('brd.expectedDate')" width="120" align="center">
                  <template #default="{ row }">{{ fmtDate(row.expectedDate) || "—" }}</template>
                </el-table-column>
                <el-table-column :label="$t('brd.milestoneStatus')" width="110" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" :type="msStatusType(row.status)">{{ $t(`brd.ms${msStatusLabel(row.status)}`) }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </template>

            <!-- BRD: Urgency -->
            <template v-if="store.selectedStory.urgency">
              <h4 class="sd-sec">{{ $t("brd.urgency") }}</h4>
              <el-tag :type="priorityColors[store.selectedStory.urgency] as any" size="small">{{ store.selectedStory.urgency.toUpperCase() }}</el-tag>
            </template>

            <!-- BRD: Acceptance Criteria -->
            <template v-if="hasAcceptanceCriteria(store.selectedStory.acceptanceCriteria)">
              <h4 class="sd-sec">{{ $t("brd.acceptance") }}</h4>
              <template v-if="store.selectedStory.acceptanceCriteria?.functional?.length">
                <h5 class="sd-sub-sec">{{ $t("brd.functional") }}</h5>
                <el-table :data="store.selectedStory.acceptanceCriteria.functional" border size="small" class="sd-brd-table">
                  <el-table-column :label="$t('brd.acId')" prop="id" width="90" />
                  <el-table-column :label="$t('brd.acDesc')" prop="description" min-width="200" show-overflow-tooltip />
                  <el-table-column :label="$t('brd.acPri')" width="90" align="center">
                    <template #default="{ row }">
                      <el-tag size="small" :type="rulePriorityType(row.priority)">{{ $t(`brd.pri${rulePriorityLabel(row.priority)}`) }}</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
              <template v-if="store.selectedStory.acceptanceCriteria?.data?.length">
                <h5 class="sd-sub-sec">{{ $t("brd.data") }}</h5>
                <ul class="sd-data-list">
                  <li v-for="(d, di) in store.selectedStory.acceptanceCriteria.data" :key="'ad'+di">{{ d }}</li>
                </ul>
              </template>
              <template v-if="store.selectedStory.acceptanceCriteria?.objectiveVerification?.length">
                <h5 class="sd-sub-sec">{{ $t("brd.objectiveVerification") }}</h5>
                <el-table :data="store.selectedStory.acceptanceCriteria.objectiveVerification" border size="small" class="sd-brd-table">
                  <el-table-column :label="$t('brd.verificationObjective')" prop="objective" min-width="140" show-overflow-tooltip />
                  <el-table-column :label="$t('brd.verificationMethod')" prop="method" min-width="140" show-overflow-tooltip />
                  <el-table-column :label="$t('brd.verificationCriteria')" prop="criteria" min-width="160" show-overflow-tooltip />
                </el-table>
              </template>
            </template>

            <!-- BRD: Attachments -->
            <template v-if="store.selectedStory.attachments?.length">
              <h4 class="sd-sec">{{ $t("brd.attachments") }}</h4>
              <div class="sd-files">
                <div v-for="att in store.selectedStory.attachments" :key="att.id" class="sd-file-item" @click="openAttachment(att.url)">
                  <el-icon><Link /></el-icon>
                  <div class="sd-file-info">
                    <span class="sd-file-name">{{ att.label }}</span>
                    <span class="sd-file-path">{{ att.url }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- BRD: Approval Records -->
            <template v-if="store.selectedStory.approvalRecords?.length">
              <h4 class="sd-sec">{{ $t("brd.approvals") }}</h4>
              <el-table :data="store.selectedStory.approvalRecords" border size="small" class="sd-brd-table">
                <el-table-column :label="$t('brd.apprRole')" width="140">
                  <template #default="{ row }">{{ approvalRoleLabel(row.role) }}</template>
                </el-table-column>
                <el-table-column :label="$t('brd.approver')" prop="approver" width="100" />
                <el-table-column :label="$t('brd.apprDate')" width="120" align="center">
                  <template #default="{ row }">{{ fmtDate(row.date) || "—" }}</template>
                </el-table-column>
                <el-table-column :label="$t('brd.apprResult')" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" :type="row.result === 'approved' ? 'success' : 'danger'">{{ $t(`brd.result${row.result === 'approved' ? 'Approved' : 'Rejected'}`) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('brd.apprComments')" prop="comments" min-width="140" show-overflow-tooltip />
              </el-table>
            </template>
          </el-tab-pane>

          <el-tab-pane :label="$t('story.scenarios')" name="scenarios">
            <div class="sd-sc-hdr">
              <span class="sd-sc-count">{{
                $t("story.scenariosCount", { total: scenarioCount(store.selectedStory), done: scenarioDone(store.selectedStory) })
              }}</span>
              <el-button size="small" type="primary" @click="store.openScenarioCreate()">{{ $t("story.addScenario") }}</el-button>
            </div>
            <el-progress
              v-if="scenarioCount(store.selectedStory) > 0"
              :percentage="scenarioProgress(store.selectedStory)"
              :stroke-width="8"
              :color="scenarioProgress(store.selectedStory) === 100 ? '#67c23a' : '#409eff'"
              style="margin-bottom: 16px"
            />
            <el-empty v-if="!store.selectedStory.scenarios?.length" :description="$t('story.noScenarios')" :image-size="60" />
            <template v-for="scStatus in statusOrder" :key="scStatus">
              <template v-if="store.selectedStory.scenarios?.filter(sc => sc.status === scStatus).length">
                <div class="sd-sc-group-hdr">
                  <StoryStatusBadge :status="scStatus" />
                  <span class="sd-sc-group-label">{{ statusLabels[scStatus] }}</span>
                  <span class="sd-sc-group-n">{{
                    store.selectedStory.scenarios.filter(sc => sc.status === scStatus).length
                  }}</span>
                </div>
                <div v-for="(sc, idx) in store.selectedStory.scenarios" :key="sc.key">
                  <div v-if="sc.status === scStatus" class="sd-sc">
                    <div class="sd-sc-top">
                      <span class="sd-sc-name">{{ sc.name }}</span>
                      <div class="sd-sc-badges">
                        <StoryStatusBadge :status="sc.status" />
                        <el-tag :type="priorityColors[sc.priority] as any" size="small">{{ sc.priority.toUpperCase() }}</el-tag>
                      </div>
                    </div>
                    <p class="sd-sc-desc">{{ sc.description || $t("story.noDescription") }}</p>
                    <div v-if="sc.steps?.length" class="sd-sc-steps">
                      <div v-for="(step, si) in sc.steps" :key="`${si}_${step.action}`" class="sd-step">
                        <span class="sd-step-act">{{ step.action }}</span>
                        <span class="sd-step-desc">{{ step.description }}</span>
                      </div>
                    </div>
                    <div v-if="sc.tags?.length" class="sd-sc-tags">
                      <el-tag v-for="tag in sc.tags" :key="tag" size="small" class="sc-tag-chip">{{ tag }}</el-tag>
                    </div>
                    <!-- Scenario Files -->
                    <div v-if="sc.files?.length" class="sd-sc-history">
                      <el-collapse>
                        <el-collapse-item>
                          <template #title>
                            <span class="sd-sc-history-title">{{ $t("story.files") }} ({{ sc.files.length }})</span>
                          </template>
                          <div
                            v-for="f in sc.files"
                            :key="f.filePath"
                            class="sd-file-item"
                            :title="$t('story.clickToCopy')"
                            @click="
                              copyToClipboard(f.filePath);
                              ElMessage.success($t('story.aiCodingCopied'));
                            "
                          >
                            <el-icon><Document /></el-icon>
                            <div class="sd-file-info">
                              <span class="sd-file-name">{{ f.fileName || f.filePath }}</span>
                              <span class="sd-file-path">{{ f.filePath }}</span>
                            </div>
                            <div class="sd-file-meta">
                              <span v-if="f.language" class="sd-file-lang">{{ f.language }}</span>
                              <span v-if="f.lines" class="sd-file-lines">{{ f.lines }} lines</span>
                              <span v-if="f.size" class="sd-file-size">{{ formatSize(f.size) }}</span>
                            </div>
                          </div>
                        </el-collapse-item>
                      </el-collapse>
                    </div>
                    <!-- AI Coding History -->
                    <div v-if="sc.aiCodingHistory?.length" class="sd-sc-history">
                      <el-collapse>
                        <el-collapse-item>
                          <template #title>
                            <span class="sd-sc-history-title"
                              >{{ $t("story.aiCodingHistory") }} ({{ sc.aiCodingHistory.length }})</span
                            >
                          </template>
                          <div v-for="(entry, ei) in sc.aiCodingHistory" :key="ei" class="sd-sc-history-entry">
                            <div class="sd-sc-history-meta">
                              <span class="sd-sc-history-time">{{
                                $t("story.aiCodingGenerated", { time: fmtDate(entry.generatedAt) })
                              }}</span>
                              <div class="sd-sc-history-acts">
                                <el-button
                                  size="small"
                                  text
                                  type="primary"
                                  @click="
                                    copyToClipboard(entry.prompt);
                                    ElMessage.success($t('story.aiCodingCopied'));
                                  "
                                >
                                  {{ $t("story.aiCodingCopy") }}
                                </el-button>
                                <el-button size="small" text type="danger" @click="store.deleteAiCodingEntry(sc.key, ei)">
                                  {{ $t("story.del") }}
                                </el-button>
                              </div>
                            </div>
                            <div class="sd-sc-history-text">{{ entry.prompt }}</div>
                          </div>
                        </el-collapse-item>
                      </el-collapse>
                    </div>
                    <!-- Analysis Files History -->
                    <div v-if="sc.analysisFilesHistory?.length" class="sd-sc-history">
                      <el-collapse>
                        <el-collapse-item>
                          <template #title>
                            <span class="sd-sc-history-title"
                              >{{ $t("story.analysisFilesHistory") }} ({{ sc.analysisFilesHistory.length }})</span
                            >
                          </template>
                          <div v-for="(entry, ei) in sc.analysisFilesHistory" :key="ei" class="sd-sc-history-entry">
                            <div class="sd-sc-history-meta">
                              <span class="sd-sc-history-time">{{
                                $t("story.aiCodingGenerated", { time: fmtDate(entry.generatedAt) })
                              }}</span>
                              <div class="sd-sc-history-acts">
                                <el-button
                                  size="small"
                                  text
                                  type="primary"
                                  @click="
                                    copyToClipboard(entry.prompt);
                                    ElMessage.success($t('story.analysisFilesCopied'));
                                  "
                                >
                                  {{ $t("story.aiCodingCopy") }}
                                </el-button>
                                <el-button size="small" text type="danger" @click="store.deleteAnalysisFilesEntry(sc.key, ei)">
                                  {{ $t("story.del") }}
                                </el-button>
                              </div>
                            </div>
                            <div class="sd-sc-history-text">{{ entry.prompt }}</div>
                          </div>
                        </el-collapse-item>
                      </el-collapse>
                    </div>
                    <div class="sd-sc-acts">
                      <el-button size="small" text @click="store.openScenarioEdit(idx)">{{ $t("story.edit") }}</el-button>
                      <el-button
                        size="small"
                        text
                        type="warning"
                        :loading="generatingKeys.has(sc.key)"
                        @click="handleAiCoding(sc)"
                        >{{ $t("story.aiCoding") }}</el-button
                      >
                      <el-button
                        size="small"
                        text
                        type="success"
                        :loading="generatingAnalysisKeys.has(sc.key)"
                        @click="handleAnalysisFiles(sc)"
                        >{{ $t("story.analysisFiles") }}</el-button
                      >
                      <el-button size="small" text type="danger" @click="store.handleScenarioDelete(idx)">{{
                        $t("story.del")
                      }}</el-button>
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>

    <!-- Story Dialog -->
    <el-dialog
      v-model="store.dialogVisible"
      :title="store.isEdit ? $t('story.editStory') : $t('story.newStoryTitle')"
      width="1000px"
      destroy-on-close
    >
      <el-form label-width="110px">
        <el-row :gutter="16">
          <el-col :span="14"
            ><el-form-item :label="$t('story.name')" required
              ><el-input v-model="store.form.name" :placeholder="$t('story.namePlaceholder')" /></el-form-item
          ></el-col>
          <el-col :span="10"
            ><el-form-item :label="$t('story.project')"
              ><el-select v-model="store.form.project" filterable allow-create default-first-option style="width: 100%"
                ><el-option v-for="p in store.projects" :key="p" :label="p" :value="p" /></el-select></el-form-item
          ></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"
            ><el-form-item :label="$t('story.status')"
              ><el-select v-model="store.form.status" style="width: 100%"
                ><el-option v-for="s in statusOrder" :key="s" :label="statusLabels[s]" :value="s" /></el-select></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item :label="$t('story.priority')"
              ><el-select v-model="store.form.priority" style="width: 100%"
                ><el-option v-for="(lbl, val) in priorityLabels" :key="val" :label="lbl" :value="val" /></el-select></el-form-item
          ></el-col>
        </el-row>
        <el-form-item :label="$t('story.description')"
          ><el-input v-model="store.form.description" type="textarea" :rows="4" :placeholder="$t('story.briefSummary')"
        /></el-form-item>
        <el-form-item :label="$t('story.background')"
          ><el-input v-model="store.form.background" type="textarea" :rows="2" :placeholder="$t('story.whyThisStory')"
        /></el-form-item>
        <el-form-item :label="$t('story.acceptance')"
          ><el-input v-model="store.form.acceptance" type="textarea" :rows="6" :placeholder="$t('story.acceptancePlaceholder')"
        /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"
            ><el-form-item :label="$t('story.assignee')"
              ><el-input v-model="store.form.assignee" placeholder="Name" /></el-form-item
          ></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"
            ><el-form-item :label="$t('story.startDate')"
              ><el-date-picker
                v-model="store.form.startDate"
                type="date"
                :placeholder="$t('story.start')"
                style="width: 100%" /></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item :label="$t('story.dueDate')"
              ><el-date-picker
                v-model="store.form.dueDate"
                type="date"
                :placeholder="$t('story.dueDate')"
                style="width: 100%" /></el-form-item
          ></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"
            ><el-form-item :label="$t('story.completedDate')"
              ><el-date-picker
                v-model="store.form.completedAt"
                type="date"
                :placeholder="$t('story.completedDate')"
                style="width: 100%" /></el-form-item
          ></el-col>
        </el-row>
        <el-form-item :label="$t('story.tags')"
          ><el-select
            v-model="store.form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            :placeholder="$t('story.addTags')"
            style="width: 100%"
        /></el-form-item>

        <!-- BRD: Business Objectives -->
        <el-divider content-position="left">{{ $t("brd.objectives") }}</el-divider>
        <div class="brd-section">
          <el-table :data="store.form.objectives" border size="small">
            <el-table-column :label="$t('brd.objective')" min-width="180">
              <template #default="{ row }"><el-input v-model="row.objective" size="small" placeholder="e.g. Reduce ticket resolution time" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.metric')" min-width="140">
              <template #default="{ row }"><el-input v-model="row.metric" size="small" placeholder="e.g. Avg ticket resolution time" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.target')" min-width="120">
              <template #default="{ row }"><el-input v-model="row.target" size="small" placeholder="e.g. < 2 hours" /></template>
            </el-table-column>
            <el-table-column width="50" align="center">
              <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeObjective($index)">×</el-button></template>
            </el-table-column>
          </el-table>
          <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addObjective()">+ {{ $t("brd.addObjective") }}</el-button>
        </div>

        <!-- BRD: Core Users -->
        <el-divider content-position="left">{{ $t("brd.coreUsers") }}</el-divider>
        <div class="brd-section">
          <el-table :data="store.form.coreUsers" border size="small">
            <el-table-column :label="$t('brd.userRole')" min-width="140">
              <template #default="{ row }"><el-input v-model="row.role" size="small" placeholder="e.g. Customer Support Agent" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.roleDesc')" min-width="160">
              <template #default="{ row }"><el-input v-model="row.description" size="small" placeholder="e.g. Handles incoming customer tickets" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.frequency')" width="130">
              <template #default="{ row }">
                <el-select v-model="row.frequency" size="small" style="width: 100%">
                  <el-option :label="$t('brd.freqDaily')" value="daily" />
                  <el-option :label="$t('brd.freqWeekly')" value="weekly" />
                  <el-option :label="$t('brd.freqMonthly')" value="monthly" />
                  <el-option :label="$t('brd.freqOnDemand')" value="on_demand" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column width="50" align="center">
              <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeCoreUser($index)">×</el-button></template>
            </el-table-column>
          </el-table>
          <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addCoreUser()">+ {{ $t("brd.addUser") }}</el-button>
        </div>

        <!-- BRD: Involved Countries -->
        <el-divider content-position="left">{{ $t("brd.countries") }}</el-divider>
        <div class="brd-section">
          <el-table :data="store.form.involvedCountries" border size="small">
            <el-table-column :label="$t('brd.country')" min-width="140">
              <template #default="{ row }"><el-input v-model="row.country" size="small" placeholder="e.g. Germany" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.brand')" min-width="120">
              <template #default="{ row }"><el-input v-model="row.brand" size="small" placeholder="e.g. Brand A" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.scope')" width="110">
              <template #default="{ row }">
                <el-select v-model="row.scope" size="small" style="width: 100%">
                  <el-option :label="$t('brd.scopeAll')" value="all" />
                  <el-option :label="$t('brd.scopePartial')" value="partial" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column width="50" align="center">
              <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeCountry($index)">×</el-button></template>
            </el-table-column>
          </el-table>
          <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addCountry()">+ {{ $t("brd.addCountry") }}</el-button>
        </div>

        <!-- BRD: Involved Modules -->
        <el-divider content-position="left">{{ $t("brd.modules") }}</el-divider>
        <div class="brd-section">
          <el-table :data="store.form.involvedModules" border size="small">
            <el-table-column :label="$t('brd.module')" min-width="160">
              <template #default="{ row }"><el-input v-model="row.module" size="small" placeholder="e.g. YiAi Ticket Service" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.impact')" min-width="200">
              <template #default="{ row }"><el-input v-model="row.impact" size="small" placeholder="e.g. New API endpoint for ticket routing" /></template>
            </el-table-column>
            <el-table-column width="50" align="center">
              <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeModule($index)">×</el-button></template>
            </el-table-column>
          </el-table>
          <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addModule()">+ {{ $t("brd.addModule") }}</el-button>
        </div>

        <!-- BRD: Business Rules -->
        <el-divider content-position="left">{{ $t("brd.rules") }}</el-divider>
        <div class="brd-section">
          <el-table :data="store.form.businessRules" border size="small">
            <el-table-column :label="$t('brd.ruleId')" width="100">
              <template #default="{ row }"><el-input v-model="row.id" size="small" placeholder="BR-001" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.ruleDesc')" min-width="220">
              <template #default="{ row }"><el-input v-model="row.description" size="small" placeholder="e.g. All tickets must be acknowledged within 15 min" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.rulePriority')" width="110">
              <template #default="{ row }">
                <el-select v-model="row.priority" size="small" style="width: 100%">
                  <el-option :label="$t('brd.priMust')" value="must" />
                  <el-option :label="$t('brd.priShould')" value="should" />
                  <el-option :label="$t('brd.priCould')" value="could" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column width="50" align="center">
              <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeBusinessRule($index)">×</el-button></template>
            </el-table-column>
          </el-table>
          <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addBusinessRule()">+ {{ $t("brd.addRule") }}</el-button>
        </div>

        <!-- BRD: Constraints -->
        <el-divider content-position="left">{{ $t("brd.constraints") }}</el-divider>
        <div class="brd-section">
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="brd-constraint-item">
                <span class="brd-constraint-label">{{ $t("brd.compliance") }}</span>
                <el-input v-model="store.constraintsText.compliance" type="textarea" :rows="3" :placeholder="$t('brd.constraintsHint')" />
              </div>
            </el-col>
            <el-col :span="8">
              <div class="brd-constraint-item">
                <span class="brd-constraint-label">{{ $t("brd.technical") }}</span>
                <el-input v-model="store.constraintsText.technical" type="textarea" :rows="3" :placeholder="$t('brd.constraintsHint')" />
              </div>
            </el-col>
            <el-col :span="8">
              <div class="brd-constraint-item">
                <span class="brd-constraint-label">{{ $t("brd.performance") }}</span>
                <el-input v-model="store.constraintsText.performance" type="textarea" :rows="3" :placeholder="$t('brd.constraintsHint')" />
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- BRD: Milestones -->
        <el-divider content-position="left">{{ $t("brd.milestones") }}</el-divider>
        <div class="brd-section">
          <el-table :data="store.form.milestones" border size="small">
            <el-table-column :label="$t('brd.milestoneName')" min-width="160">
              <template #default="{ row }"><el-input v-model="row.name" size="small" placeholder="e.g. MVP Release" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.expectedDate')" width="160">
              <template #default="{ row }">
                <el-date-picker v-model="row.expectedDate" type="date" :placeholder="$t('story.start')" size="small" style="width: 100%" value-format="x" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('brd.milestoneStatus')" width="140">
              <template #default="{ row }">
                <el-select v-model="row.status" size="small" style="width: 100%">
                  <el-option :label="$t('brd.msPending')" value="pending_review" />
                  <el-option :label="$t('brd.msNotStarted')" value="not_started" />
                  <el-option :label="$t('brd.msInProgress')" value="in_progress" />
                  <el-option :label="$t('brd.msDone')" value="done" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column width="50" align="center">
              <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeMilestone($index)">×</el-button></template>
            </el-table-column>
          </el-table>
          <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addMilestone()">+ {{ $t("brd.addMilestone") }}</el-button>
        </div>

        <!-- BRD: Urgency -->
        <el-divider content-position="left">{{ $t("brd.urgency") }}</el-divider>
        <el-form-item :label="$t('story.priority')">
          <el-select v-model="store.form.urgency" style="width: 200px">
            <el-option v-for="(lbl, val) in priorityLabels" :key="val" :label="lbl" :value="val" />
          </el-select>
        </el-form-item>

        <!-- BRD: Acceptance Criteria -->
        <el-divider content-position="left">{{ $t("brd.acceptance") }}</el-divider>

        <h5 style="margin: 0 0 8px; font-size: 13px; font-weight: 600;">{{ $t("brd.functional") }}</h5>
        <div class="brd-section">
          <el-table :data="store.form.acceptanceCriteria.functional" border size="small">
            <el-table-column :label="$t('brd.acId')" width="100">
              <template #default="{ row }"><el-input v-model="row.id" size="small" placeholder="AC-001" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.acDesc')" min-width="220">
              <template #default="{ row }"><el-input v-model="row.description" size="small" placeholder="e.g. User can create a ticket within 3 clicks" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.acPri')" width="110">
              <template #default="{ row }">
                <el-select v-model="row.priority" size="small" style="width: 100%">
                  <el-option :label="$t('brd.priMust')" value="must" />
                  <el-option :label="$t('brd.priShould')" value="should" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column width="50" align="center">
              <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeAcceptance($index)">×</el-button></template>
            </el-table-column>
          </el-table>
          <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addAcceptance()">+ {{ $t("brd.addAc") }}</el-button>
        </div>

        <h5 style="margin: 12px 0 8px; font-size: 13px; font-weight: 600;">{{ $t("brd.data") }}</h5>
        <el-input v-model="store.acceptanceDataText" type="textarea" :rows="3" :placeholder="$t('brd.constraintsHint')" />

        <h5 style="margin: 12px 0 8px; font-size: 13px; font-weight: 600;">{{ $t("brd.objectiveVerification") }}</h5>
        <div class="brd-section">
          <el-table :data="store.form.acceptanceCriteria.objectiveVerification" border size="small">
            <el-table-column :label="$t('brd.verificationObjective')" min-width="140">
              <template #default="{ row }"><el-input v-model="row.objective" size="small" placeholder="e.g. Reduce ticket resolution time" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.verificationMethod')" min-width="140">
              <template #default="{ row }"><el-input v-model="row.method" size="small" placeholder="e.g. Compare avg resolution time before/after launch" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.verificationCriteria')" min-width="140">
              <template #default="{ row }"><el-input v-model="row.criteria" size="small" placeholder="e.g. P95 < 2 hours for 2 weeks" /></template>
            </el-table-column>
            <el-table-column width="50" align="center">
              <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeObjectiveVerification($index)">×</el-button></template>
            </el-table-column>
          </el-table>
          <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addObjectiveVerification()">+ {{ $t("brd.addVerification") }}</el-button>
        </div>

        <!-- BRD: Attachments -->
        <el-divider content-position="left">{{ $t("brd.attachments") }}</el-divider>
        <div class="brd-section">
          <el-table :data="store.form.attachments" border size="small">
            <el-table-column :label="$t('brd.attLabel')" min-width="160">
              <template #default="{ row }"><el-input v-model="row.label" size="small" placeholder="e.g. Wireframe v2" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.attUrl')" min-width="220">
              <template #default="{ row }"><el-input v-model="row.url" size="small" placeholder="https://..." /></template>
            </el-table-column>
            <el-table-column width="50" align="center">
              <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeAttachment($index)">×</el-button></template>
            </el-table-column>
          </el-table>
          <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addAttachment()">+ {{ $t("brd.addAttachment") }}</el-button>
        </div>

        <!-- BRD: Approval Records -->
        <el-divider content-position="left">{{ $t("brd.approvals") }}</el-divider>
        <div class="brd-section">
          <el-table :data="store.form.approvalRecords" border size="small">
            <el-table-column :label="$t('brd.apprRole')" width="150">
              <template #default="{ row }">
                <el-select v-model="row.role" size="small" style="width: 100%">
                  <el-option :label="$t('brd.roleBusinessOwner')" value="business_owner" />
                  <el-option :label="$t('brd.roleEuHubItbp')" value="eu_hub_itbp" />
                  <el-option :label="$t('brd.roleRscBusiness')" value="rsc_business" />
                  <el-option :label="$t('brd.roleHqCounterpart')" value="hq_counterpart" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column :label="$t('brd.approver')" width="120">
              <template #default="{ row }"><el-input v-model="row.approver" size="small" placeholder="Name" /></template>
            </el-table-column>
            <el-table-column :label="$t('brd.apprDate')" width="150">
              <template #default="{ row }">
                <el-date-picker v-model="row.date" type="date" :placeholder="$t('story.start')" size="small" style="width: 100%" value-format="x" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('brd.apprResult')" width="110">
              <template #default="{ row }">
                <el-select v-model="row.result" size="small" style="width: 100%">
                  <el-option :label="$t('brd.resultApproved')" value="approved" />
                  <el-option :label="$t('brd.resultRejected')" value="rejected" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column :label="$t('brd.apprComments')" min-width="140">
              <template #default="{ row }"><el-input v-model="row.comments" size="small" placeholder="Comments" /></template>
            </el-table-column>
            <el-table-column width="50" align="center">
              <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeApproval($index)">×</el-button></template>
            </el-table-column>
          </el-table>
          <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addApproval()">+ {{ $t("brd.addApproval") }}</el-button>
        </div>
      </el-form>
      <template #footer
        ><el-button @click="store.dialogVisible = false">{{ $t("story.cancel") }}</el-button
        ><el-button type="primary" :loading="store.saving" @click="store.handleSave()">{{
          $t("story.save")
        }}</el-button></template
      >
    </el-dialog>

    <!-- Scenario Dialog -->
    <el-dialog
      v-model="store.scenarioDialogVisible"
      :title="store.scenarioEditIdx >= 0 ? $t('story.editScenario') : $t('story.addScenarioTitle')"
      width="900px"
      destroy-on-close
    >
      <el-form label-width="100px">
        <el-form-item :label="$t('story.name')" required
          ><el-input v-model="store.scenarioForm.name" :placeholder="$t('story.scenarioNamePlaceholder')"
        /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"
            ><el-form-item :label="$t('story.priority')"
              ><el-select v-model="store.scenarioForm.priority" style="width: 100%"
                ><el-option v-for="(lbl, val) in priorityLabels" :key="val" :label="lbl" :value="val" /></el-select></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item :label="$t('story.status')"
              ><el-select v-model="store.scenarioForm.status" style="width: 100%"
                ><el-option v-for="(lbl, val) in statusLabels" :key="val" :label="lbl" :value="val" /></el-select></el-form-item
          ></el-col>
        </el-row>
        <el-form-item :label="$t('story.description')"
          ><el-input
            v-model="store.scenarioForm.description"
            type="textarea"
            :rows="2"
            :placeholder="$t('story.scenarioDescPlaceholder')"
        /></el-form-item>

        <el-form-item :label="$t('story.steps')">
          <div class="sf-steps">
            <div v-for="(step, idx) in store.scenarioForm.steps" :key="`sf_${idx}_${step.action}`" class="sf-step">
              <el-select v-model="step.action" size="small" style="width: 90px"
                ><el-option v-for="a in stepActions" :key="a" :label="a" :value="a"
              /></el-select>
              <el-input v-model="step.description" size="small" :placeholder="$t('story.stepPlaceholder')" />
              <el-button size="small" text type="danger" @click="store.removeStep(idx)">×</el-button>
            </div>
            <el-button size="small" text type="primary" @click="store.addStep()">{{ $t("story.addStep") }}</el-button>
          </div>
        </el-form-item>

        <el-form-item :label="$t('story.tags')"
          ><el-select
            v-model="store.scenarioForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            :placeholder="$t('story.addTags')"
            style="width: 100%"
        /></el-form-item>

        <el-form-item :label="$t('story.files')">
          <div class="sf-steps">
            <div v-for="(f, idx) in store.scenarioForm.files" :key="`scfile_${idx}`" class="sf-step">
              <el-input v-model="f.filePath" size="small" placeholder="Full path e.g. src/views/foo.vue" style="flex: 1" />
              <el-input v-model="f.fileName" size="small" placeholder="Display name" style="width: 160px; flex-shrink: 0" />
              <el-button size="small" text type="danger" @click="store.removeScenarioFile(idx)">×</el-button>
            </div>
            <el-button size="small" text type="primary" @click="store.addScenarioFile()">+ Add File</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer
        ><el-button @click="store.scenarioDialogVisible = false">{{ $t("story.cancel") }}</el-button
        ><el-button type="primary" @click="store.handleScenarioSave()">{{ $t("story.save") }}</el-button></template
      >
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.sb-root {
  padding: 16px;
}
.sb-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
}
.sb-hdr-l {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.sb-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.sb-count {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.sb-hdr-r {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sb-dims {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 14px;
  padding: 10px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  flex-wrap: wrap;
}
.sb-dim {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sb-dim-lbl {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.sb-dim-r {
  margin-left: auto;
}
.sb-sep {
  color: var(--el-text-color-placeholder);
}

.sb-grp {
  margin-bottom: 22px;
}
.sb-grp-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  font-size: 15px;
}
.sb-grp-count {
  color: var(--el-text-color-secondary);
  font-weight: normal;
}
.sb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

// detail drawer
.sd-root {
  padding: 0 4px;
}
.sd-sec {
  margin: 18px 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.sd-txt {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}
.sd-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.sd-muted {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
.sd-files {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sd-file-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 10px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}
.sd-file-item:hover {
  background: var(--el-fill-color);
}
.sd-file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.sd-file-name {
  font-size: 13px;
  font-weight: 600;
}
.sd-file-path {
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}

.sd-file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

.sd-file-lang {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.sd-file-lines {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.sd-file-size {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  font-family: "SF Mono", "Menlo", monospace;
  white-space: nowrap;
}

.sd-sc-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.sd-sc-count {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.sd-sc-group-hdr {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 14px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--el-border-color-light);
}
.sd-sc-group-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.sd-sc-group-n {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.sd-sc-files {
  margin: 6px 0 8px;
}
.sd-sc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 6px 0;
}
.sd-sc {
  padding: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  margin-bottom: 10px;
}
.sd-sc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.sd-sc-name {
  font-size: 14px;
  font-weight: 600;
}
.sd-sc-badges {
  display: flex;
  gap: 6px;
}
.sd-sc-desc {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0 0 8px;
  line-height: 1.5;
}
.sd-sc-steps {
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 8px;
}
.sd-step {
  display: flex;
  gap: 10px;
  padding: 3px 0;
  font-size: 13px;
}
.sd-step-act {
  font-weight: 600;
  color: var(--el-color-primary);
  min-width: 48px;
}
.sd-step-desc {
  color: var(--el-text-color-regular);
}
.sd-sc-acts {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

// AI coding history
.sd-sc-history {
  margin-top: 8px;
  margin-bottom: 8px;
}
.sd-sc-history-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.sd-sc-history-entry {
  padding: 6px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
  &:last-child {
    border-bottom: none;
  }
}
.sd-sc-history-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.sd-sc-history-acts {
  display: flex;
  gap: 0;
}
.sd-sc-history-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.sd-sc-history-text {
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 6px 10px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.sd-acts {
  margin-top: 20px;
}

// scenario form
.sf-steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
.sf-step {
  display: flex;
  gap: 8px;
  align-items: center;
}

// BRD detail sections
.sd-brd-table {
  margin-bottom: 4px;
}

.sd-sub-sec {
  margin: 12px 0 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.sd-constraints {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sd-constraint-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sd-constraint-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.sd-data-list {
  margin: 4px 0;
  padding-left: 20px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.8;
}

// BRD edit dialog sections
.brd-section {
  margin-bottom: 16px;
}

.brd-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  span {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
  }
}

.brd-constraint-item {
  margin-bottom: 12px;

  .brd-constraint-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
    display: block;
  }
}
</style>

<style lang="scss">
/* Wider AI coding notification (teleported, needs unscoped styles) */
.ai-coding-notify {
  width: 900px !important;
  max-width: 92vw;
  max-height: 88vh;
  padding: 20px 28px !important;
  overflow: hidden;
}
.ai-coding-notify .el-notification__content {
  max-height: calc(88vh - 80px);
  overflow: hidden;
}
</style>
