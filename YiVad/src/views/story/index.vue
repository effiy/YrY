<script setup lang="ts" name="storyBoard">
/**
 * Story Board — main list/card view with detail drawer, create/edit dialog,
 * and scenario management. Orchestrates the story store and composed UI
 * sections (BRD overview, BRD form, scenario list, AI prompts).
 */
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { Document, EditPen, CopyDocument, ChatDotRound } from "@element-plus/icons-vue";
import { useStoryStore } from "@/stores/modules/story";
import { useMarkdown } from "@/hooks/useMarkdown";
import KnowledgeMetaStrip from "@/components/KnowledgeMetaStrip.vue";
import KnowledgePreviewDialog from "@/views/aiChat/components/KnowledgePreviewDialog.vue";
import { useAiPrompts } from "@/views/story/composables/useAiPrompts";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import { buildRelatedEntriesSection } from "@/hooks/useRelatedByProject";
import {
  STORY_STATUS_ORDER,
  PRIORITY_OPTIONS,
  PRIORITY_COLORS,
  fmtDate,
  formatSize
} from "@/views/story/constants";
import StoryStatusBadge from "./components/StoryStatusBadge.vue";
import StoryCard from "./components/StoryCard.vue";
import StoryTable from "./components/StoryTable.vue";
import StoryBoardHeader from "./components/StoryBoardHeader.vue";
import StoryFilters from "./components/StoryFilters.vue";
import BrdOverviewSections from "./components/BrdOverviewSections.vue";
import BrdFormSections from "./components/BrdFormSections.vue";
import ScenarioListSection from "./components/ScenarioListSection.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useStoryStore();
const { copyToClipboard } = useAiPrompts();
const { openInAiChat, linkToAiChatByTag } = useAiChatBridge();
const { render: renderMarkdown } = useMarkdown();

const knowledgeDialogRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
function openRelatedKnowledge(path: string) {
  knowledgeDialogRef.value?.open(path);
}

async function discussStoryInAiChat() {
  const s = store.selectedStory;
  if (!s) return;
  const md = store.storyMarkdown?.content ?? "";
  const ctxPath = `stories/${s.project || "unsorted"}/${s.key}`;
  const tags = [`ctx:${ctxPath}`, `story:${s.key}`];
  if (s.project) tags.push(`project:${s.project}`);
  if (s.status) tags.push(`status:${s.status}`);
  let pageContent = md;
  if (s.project) {
    const section = await buildRelatedEntriesSection(s.project, s.key, "stories");
    if (section) pageContent = `${pageContent}\n${section}`;
  }
  await openInAiChat({
    title: `${s.name || s.key} — Story Board`,
    pageContent,
    tags,
    sourceUrl: `/story?project=${encodeURIComponent(s.project || "")}`
  });
}

function viewRelatedAiChatSessions() {
  const s = store.selectedStory;
  if (!s?.key) return;
  router.push(linkToAiChatByTag(`story:${s.key}`));
}

async function discussStoryFileInAiChat(filePath: string, fileName?: string) {
  const s = store.selectedStory;
  if (!s || !filePath) return;
  const ctxPath = `stories/${s.project || "unsorted"}/${s.key}`;
  const tags = [`ctx:${ctxPath}`, `story:${s.key}`, `file:${filePath}`];
  if (s.project) tags.push(`project:${s.project}`);
  const pageContent = [
    `# ${fileName || filePath}`,
    "",
    `**Story:** ${s.name || s.key}`,
    `**Project:** ${store.projectLabel(s.project) || "—"}`,
    `**Status:** ${s.status || "—"}`,
    `**File:** \`${filePath}\``,
    "",
    "## Story Description",
    "",
    s.description || "_(no description)_"
  ].join("\n");
  await openInAiChat({
    title: `${fileName || filePath} — ${s.name || s.key}`,
    pageContent,
    tags,
    sourceUrl: `/story?project=${encodeURIComponent(s.project || "")}`
  });
}

const storyMarkdownHtml = computed(() => {
  const md = store.storyMarkdown;
  return md?.content ? renderMarkdown(md.content) : "";
});

const storyMeta = computed(() => store.storyMarkdown?.meta || {});
const storyMarkdownPath = computed(() => store.storyMarkdown?.path || "");

// ── Display helpers ──

const statusLabels = computed(() => ({
  planning: t("story.planning"),
  design: t("story.design"),
  develop: t("story.develop"),
  testing: t("story.testing"),
  operations: t("story.operations"),
  archived: t("story.archived")
}));

const timeOptions = computed(() => [
  { label: t("story.all"), value: "all" as const },
  { label: t("story.thisWeek"), value: "week" as const },
  { label: t("story.thisMonth"), value: "month" as const },
  { label: t("story.thisQuarter"), value: "quarter" as const },
  { label: t("story.custom"), value: "custom" as const }
]);

const stepActions = ["Given", "When", "Then", "And"];

const pendingStoryKey = ref<string | null>(null);

onMounted(() => {
  const projectQuery = route.query.project;
  const storyQuery = route.query.story;
  if (typeof projectQuery === "string" && projectQuery) {
    store.selectProject(projectQuery);
  } else {
    store.fetchStories();
  }
  if (typeof storyQuery === "string" && storyQuery) {
    pendingStoryKey.value = storyQuery;
  }
});

// Once stories load, deep-link into a specific story
// (arrived here via RelatedByProjectPanel → /story?project=X&story=Y or
// via TagManager → /story?story=Y without a project). When a project
// wasn't specified in the URL, adopt the story's own project so the
// sidebar selection matches.
watch(
  () => store.stories.length,
  () => {
    if (!pendingStoryKey.value) return;
    const found = store.stories.find(s => s.key === pendingStoryKey.value);
    if (!found) return;
    if (!store.selectedProject && found.project) {
      store.selectProject(found.project);
    }
    store.openDetail(found);
    pendingStoryKey.value = null;
  }
);

// Push the user's project selection back to the URL so it's shareable
// and survives refresh. Skip on initial mount (the URL itself seeded the
// selection) to avoid a redundant history entry.
let seeded = false;
watch(
  () => store.selectedProject,
  project => {
    if (!seeded) {
      seeded = true;
      return;
    }
    const next: Record<string, string> = {};
    if (project) next.project = project;
    const cur = route.query.project;
    const curStr = typeof cur === "string" ? cur : "";
    if (curStr !== project) {
      router.replace({ query: { ...route.query, ...next, project: project || undefined } });
    }
  }
);
</script>

<template>
  <div class="sb-root">
    <!-- Header -->
    <StoryBoardHeader />

    <!-- Filters -->
    <StoryFilters />

    <!-- Content -->
    <el-skeleton v-if="store.loading" :rows="5" animated />
    <el-alert v-else-if="store.error" :title="store.error" type="error" show-icon />

    <!-- Cards -->
    <div v-show="store.viewMode === 'cards'" class="sb-cards">
      <template v-for="st in STORY_STATUS_ORDER" :key="st">
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
      <el-empty v-if="store.filteredStories.length === 0" :description="$t('story.noStories')">
        <el-button type="primary" @click="store.openCreateDialog()">{{ $t("story.create") }}</el-button>
      </el-empty>
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
      size="650px"
      @close="store.closePanel()"
    >
      <template #header>
        <div class="sd-drawer-header">
          <span class="sd-drawer-header__title" :title="store.selectedStory?.name">{{ store.selectedStory?.name ?? $t("story.detail") }}</span>
          <div class="sd-drawer-header__actions" v-if="store.selectedStory">
            <StoryStatusBadge v-if="store.selectedStory.status" :status="store.selectedStory.status" />
            <el-button text type="primary" size="small" :icon="ChatDotRound" @click="discussStoryInAiChat">
              {{ $t("story.discussInAiChat") }}
            </el-button>
            <el-button text type="primary" size="small" @click="viewRelatedAiChatSessions">Related AI Chat sessions</el-button>
            <el-button text type="primary" size="small" :icon="EditPen" @click="store.openEditDialog(store.selectedStory)">
              {{ $t("story.edit") }}
            </el-button>
          </div>
        </div>
      </template>
      <div v-if="store.selectedStory" class="sd-root">
        <el-tabs v-model="store.scenarioTab">
          <!-- Overview Tab -->
          <el-tab-pane :label="$t('story.overview')" name="overview">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item :label="$t('story.status')">
                <StoryStatusBadge :status="store.selectedStory.status" />
              </el-descriptions-item>
              <el-descriptions-item :label="$t('story.priority')">
                <el-tag
                  v-if="store.selectedStory.priority"
                  :type="PRIORITY_COLORS[store.selectedStory.priority] as any"
                  size="small"
                >{{ PRIORITY_OPTIONS.find(o => o.value === store.selectedStory!.priority)?.label || store.selectedStory.priority.toUpperCase() }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item :label="$t('story.project')">{{ store.projectLabel(store.selectedStory.project) || "-" }}</el-descriptions-item>
              <el-descriptions-item :label="$t('story.assignee')">{{ store.selectedStory.assignee || "-" }}</el-descriptions-item>
              <el-descriptions-item :label="$t('story.startDate')">{{ fmtDate(store.selectedStory.startDate) || "-" }}</el-descriptions-item>
              <el-descriptions-item :label="$t('story.dueDate')">
                <span>{{ fmtDate(store.selectedStory.dueDate) || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item v-if="store.selectedStory.completedAt" :label="$t('story.completedDate')">
                {{ fmtDate(store.selectedStory.completedAt) }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('story.updated')">{{ fmtDate(store.selectedStory.updatedAt) }}</el-descriptions-item>
            </el-descriptions>

            <h4 class="sd-sec">{{ $t("story.background") }}</h4>
            <p class="sd-txt">{{ store.selectedStory.background || $t("story.none") }}</p>

            <h4 class="sd-sec">{{ $t("story.description") }}</h4>
            <p class="sd-txt">{{ store.selectedStory.description || $t("story.none") }}</p>

            <h4 class="sd-sec">{{ $t("story.acceptance") }}</h4>
            <p class="sd-txt sd-txt--pre">{{ store.selectedStory.acceptance || $t("story.none") }}</p>

            <h4 class="sd-sec">{{ $t("story.tags") }}</h4>
            <div class="sd-tags">
              <el-tag v-for="tag in store.selectedStory.tags" :key="tag" size="small">{{ tag }}</el-tag>
              <span v-if="!store.selectedStory.tags?.length" class="sd-muted">{{ $t("story.none") }}</span>
            </div>

            <h4 class="sd-sec">{{ $t("story.files") }}</h4>
            <div v-if="store.selectedStory.files?.length" class="sd-files">
              <div
                v-for="f in store.selectedStory.files"
                :key="f.filePath"
                class="sd-file-item"
                :title="$t('story.clickToCopy')"
                @click="copyToClipboard(f.filePath); ElMessage.success($t('story.aiCodingCopied'))"
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
                  <el-button
                    class="sd-file-discuss"
                    size="small"
                    text
                    :icon="ChatDotRound"
                    :title="$t('story.discussInAiChat')"
                    @click.stop="discussStoryFileInAiChat(f.filePath, f.fileName)"
                  />
                  <el-icon class="sd-file-copy"><CopyDocument /></el-icon>
                </div>
              </div>
            </div>
            <p v-else class="sd-muted">{{ $t("story.none") }}</p>

            <!-- story.md content — loaded by store.openDetail via loadStoryMarkdown -->
            <h4 class="sd-sec">story.md</h4>
            <div v-if="store.storyMarkdownLoading" class="sd-md-loading">Loading story markdown…</div>
            <div v-else-if="!store.storyMarkdown" class="sd-muted">{{ $t("story.none") }}</div>
            <div v-else class="sd-md">
              <div class="sd-md-meta">
                <KnowledgeMetaStrip
                  :meta="storyMeta"
                  :current-path="storyMarkdownPath"
                  @navigate-related="openRelatedKnowledge"
                />
              </div>
              <div class="sd-md-body" v-html="storyMarkdownHtml" />
            </div>

            <!-- BRD Overview Sections (extracted component) -->
            <BrdOverviewSections />

            <!-- Story context ends -->
          </el-tab-pane>

          <!-- Scenarios Tab -->
          <el-tab-pane :label="$t('story.scenarios')" name="scenarios">
            <ScenarioListSection />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>

    <!-- Story Create/Edit Dialog -->
    <el-dialog
      v-model="store.dialogVisible"
      :title="store.isEdit ? $t('story.editStory') : $t('story.newStoryTitle')"
      width="1000px"
      destroy-on-close
    >
      <el-form label-width="110px" class="sd-form" @keydown.meta.s.prevent="store.handleSave()" @keydown.ctrl.s.prevent="store.handleSave()">
        <!-- Basic fields -->
        <el-row :gutter="16">
          <el-col :span="14">
            <el-form-item :label="$t('story.name')" required>
              <el-input v-model="store.form.name" :placeholder="$t('story.namePlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item :label="$t('story.project')">
              <el-select v-model="store.form.project" filterable allow-create default-first-option>
                <el-option v-for="p in store.projects" :key="p" :label="store.projectLabel(p)" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('story.status')">
              <el-select v-model="store.form.status">
                <el-option v-for="s in STORY_STATUS_ORDER" :key="s" :label="statusLabels[s]" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('story.priority')">
              <el-select v-model="store.form.priority">
                <el-option v-for="opt in PRIORITY_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('story.description')">
          <el-input v-model="store.form.description" type="textarea" :rows="4" :placeholder="$t('story.briefSummary')" />
        </el-form-item>
        <el-form-item :label="$t('story.background')">
          <el-input v-model="store.form.background" type="textarea" :rows="2" :placeholder="$t('story.whyThisStory')" />
        </el-form-item>
        <el-form-item :label="$t('story.acceptance')">
          <el-input v-model="store.form.acceptance" type="textarea" :rows="6" :placeholder="$t('story.acceptancePlaceholder')" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('story.assignee')">
              <el-input v-model="store.form.assignee" placeholder="Name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('story.startDate')">
              <el-date-picker v-model="store.form.startDate" type="date" :placeholder="$t('story.start')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('story.dueDate')">
              <el-date-picker v-model="store.form.dueDate" type="date" :placeholder="$t('story.dueDate')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('story.completedDate')">
              <el-date-picker v-model="store.form.completedAt" type="date" :placeholder="$t('story.completedDate')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('story.tags')">
          <el-select v-model="store.form.tags" multiple filterable allow-create default-first-option :placeholder="$t('story.addTags')" />
        </el-form-item>

        <!-- BRD Form Sections (extracted component) -->
        <BrdFormSections />
      </el-form>
      <template #footer>
        <span class="sf-dialog-hint"><kbd>⌘/Ctrl</kbd>+<kbd>S</kbd> save</span>
        <div>
          <el-button @click="store.dialogVisible = false">{{ $t("story.cancel") }}</el-button>
          <el-button type="primary" :loading="store.saving" @click="store.handleSave()">{{ $t("story.save") }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Scenario Create/Edit Dialog -->
    <el-dialog
      v-model="store.scenarioDialogVisible"
      :title="store.scenarioEditIdx >= 0 ? $t('story.editScenario') : $t('story.addScenarioTitle')"
      width="900px"
      destroy-on-close
    >
      <el-form label-width="100px" class="sd-form" @keydown.meta.s.prevent="store.handleScenarioSave()" @keydown.ctrl.s.prevent="store.handleScenarioSave()">
        <el-form-item :label="$t('story.name')" required>
          <el-input v-model="store.scenarioForm.name" :placeholder="$t('story.scenarioNamePlaceholder')" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('story.priority')">
              <el-select v-model="store.scenarioForm.priority">
                <el-option v-for="opt in PRIORITY_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('story.status')">
              <el-select v-model="store.scenarioForm.status">
                <el-option v-for="(lbl, val) in statusLabels" :key="val" :label="lbl" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('story.description')">
          <el-input v-model="store.scenarioForm.description" type="textarea" :rows="2" :placeholder="$t('story.scenarioDescPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('story.steps')">
          <div class="sf-steps">
            <div v-for="(step, idx) in store.scenarioForm.steps" :key="`sf_${idx}_${step.action}`" class="sf-step">
              <el-select v-model="step.action" size="small" class="sf-step-action">
                <el-option v-for="a in stepActions" :key="a" :label="a" :value="a" />
              </el-select>
              <el-input v-model="step.description" size="small" :placeholder="$t('story.stepPlaceholder')" />
              <el-button size="small" text type="danger" @click="store.removeStep(idx)">×</el-button>
            </div>
            <el-button size="small" text type="primary" @click="store.addStep()">{{ $t("story.addStep") }}</el-button>
          </div>
        </el-form-item>
        <el-form-item :label="$t('story.tags')">
          <el-select v-model="store.scenarioForm.tags" multiple filterable allow-create default-first-option :placeholder="$t('story.addTags')" />
        </el-form-item>
        <el-form-item :label="$t('story.files')">
          <div class="sf-steps">
            <div v-for="(f, idx) in store.scenarioForm.files" :key="`scfile_${idx}`" class="sf-step">
              <el-input v-model="f.filePath" size="small" placeholder="Full path e.g. src/views/foo.vue" class="sf-file-path" />
              <el-input v-model="f.fileName" size="small" placeholder="Display name" class="sf-file-name" />
              <el-button size="small" text type="danger" @click="store.removeScenarioFile(idx)">×</el-button>
            </div>
            <el-button size="small" text type="primary" @click="store.addScenarioFile()">+ Add File</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="sf-dialog-hint"><kbd>⌘/Ctrl</kbd>+<kbd>S</kbd> save</span>
        <div>
          <el-button @click="store.scenarioDialogVisible = false">{{ $t("story.cancel") }}</el-button>
          <el-button type="primary" @click="store.handleScenarioSave()">{{ $t("story.save") }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Knowledge preview dialog — opened when user clicks a `related` link in story.md -->
    <KnowledgePreviewDialog ref="knowledgeDialogRef" />
  </div>
</template>

<style scoped lang="scss">
.sb-root {
  padding: 12px;
}
.sf-dialog-hint {
  margin-right: auto;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  kbd {
    display: inline-block;
    min-width: 16px;
    padding: 1px 5px;
    font-family: "SF Mono", "Menlo", monospace;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 3px;
  }
}
.sb-grp {
  margin-bottom: 14px;
}
.sb-grp-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 6px;
  font-size: 13px;
}
.sb-grp-count {
  color: var(--el-text-color-secondary);
  font-weight: normal;
}
.sb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px;
}

// detail drawer
.sd-root {
  padding: 0 4px;
}
.sd-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-width: 0;
  &__title {
    font-size: 16px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;
  }
  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
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
  &--pre {
    white-space: pre-wrap;
  }
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
.sd-md-loading {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  padding: 12px 0;
}
.sd-md {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.7;
  max-height: 480px;
  overflow-y: auto;
}
.sd-md-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.sd-md-body {
  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    margin: 0.6em 0 0.3em;
  }
  :deep(h1) { font-size: 1.3em; }
  :deep(h2) { font-size: 1.2em; }
  :deep(h3) { font-size: 1.05em; }
  :deep(p) { margin: 0.4em 0; }
  :deep(pre) {
    padding: 8px;
    overflow-x: auto;
    font-size: 12px;
    background: var(--el-fill-color);
    border-radius: 4px;
  }
  :deep(code) {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 0.9em;
  }
  :deep(blockquote) {
    margin: 0.4em 0;
    padding: 2px 10px;
    border-left: 3px solid var(--el-color-primary-light-5);
    color: var(--el-text-color-secondary);
  }
  :deep(table) {
    border-collapse: collapse;
  }
  :deep(th), :deep(td) {
    padding: 4px 8px;
    border: 1px solid var(--el-border-color-lighter);
  }
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
  .sd-file-copy { opacity: 1; }
}
.sd-file-copy {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
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
.sf-file-path {
  flex: 1;
}
.sf-file-name {
  width: 160px;
  flex-shrink: 0;
}
.sf-step-action {
  width: 90px;
  flex-shrink: 0;
}

// Force selects and date pickers inside dialog forms to fill their form-item width.
:deep(.sd-form .el-select),
:deep(.sd-form .el-date-editor) {
  width: 100%;
}
:deep(.el-dialog__footer) {
  display: flex;
  align-items: center;
  gap: 12px;
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
