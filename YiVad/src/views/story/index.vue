<script setup lang="ts" name="storyBoard">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useStoryStore } from "@/stores/modules/story";
import type { StoryDocument } from "@/api/modules/story";
import StoryStatusBadge from "./components/StoryStatusBadge.vue";

const { t } = useI18n();
const store = useStoryStore();

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
const scenarioStatusLabels = computed(() => ({
  pending: t("story.pending"),
  in_progress: t("story.inProgress"),
  done: t("story.doneStatus"),
  blocked: t("story.blocked")
}));
const stepActions = ["Given", "When", "Then", "And"];
const scheduleLabels = computed(() => ({
  planned: t("story.planned"),
  on_track: t("story.onTrack"),
  at_risk: t("story.atRisk"),
  delayed: t("story.delayed"),
  completed: t("story.completed")
}));
const scheduleColors: Record<string, string> = {
  planned: "info",
  on_track: "success",
  at_risk: "warning",
  delayed: "danger",
  completed: ""
};

function dueLabel(dueDate: number | null): { text: string; type: string } {
  if (!dueDate) return { text: "", type: "" };
  const now = Date.now();
  const days = Math.ceil((dueDate - now) / 86400000);
  if (days < 0) return { text: t("story.overdue", { days: -days }), type: "danger" };
  if (days === 0) return { text: t("story.dueToday"), type: "danger" };
  if (days <= 3) return { text: t("story.dueIn", { days }), type: "warning" };
  if (days <= 7) return { text: t("story.dueIn", { days }), type: "info" };
  return { text: t("story.dueIn", { days }), type: "" };
}

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
  return story.scenarios?.filter(sc => sc.status === "done").length ?? 0;
}

function scenarioProgress(story: StoryDocument): number {
  const total = scenarioCount(story);
  if (!total) return 0;
  return Math.round((scenarioDone(story) / total) * 100);
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
        <el-segmented
          v-model="store.viewMode"
          :options="[
            { label: $t('story.cards'), value: 'cards' },
            { label: $t('story.list'), value: 'list' }
          ]"
        />
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

    <!-- Schedule stats -->
    <div v-if="!store.loading && store.scheduleStats.total > 0" class="sb-sched">
      <span class="sb-sched-item" :class="{ on: store.scheduleStats.on_track }"
        ><span class="sb-sched-n">{{ store.scheduleStats.on_track }}</span
        >{{ $t("story.onTrack") }}</span
      >
      <span class="sb-sched-item" :class="{ warn: store.scheduleStats.at_risk }"
        ><span class="sb-sched-n">{{ store.scheduleStats.at_risk }}</span
        >{{ $t("story.atRisk") }}</span
      >
      <span class="sb-sched-item" :class="{ bad: store.scheduleStats.delayed }"
        ><span class="sb-sched-n">{{ store.scheduleStats.delayed }}</span
        >{{ $t("story.delayed") }}</span
      >
      <span class="sb-sched-item" :class="{ done: store.scheduleStats.completed }"
        ><span class="sb-sched-n">{{ store.scheduleStats.completed }}</span
        >{{ $t("story.completed") }}</span
      >
    </div>

    <!-- Content -->
    <el-skeleton v-if="store.loading" :rows="5" animated />
    <el-alert v-else-if="store.error" :title="store.error" type="error" show-icon />

    <!-- Cards -->
    <div v-else-if="store.viewMode === 'cards'" class="sb-cards">
      <template v-for="st in statusOrder" :key="st">
        <div v-if="store.groupedStories[st]?.length" class="sb-grp">
          <h3 class="sb-grp-title">
            <StoryStatusBadge :status="st" /><span class="sb-grp-count">{{ store.groupedStories[st].length }}</span>
          </h3>
          <div class="sb-grid">
            <el-card
              v-for="s in store.groupedStories[st]"
              :key="s.key"
              class="sb-card"
              :class="'sc-border--' + (s.scheduleStatus || 'planned')"
              shadow="hover"
              @click="store.openDetail(s)"
            >
              <!-- Header: name + schedule + priority -->
              <div class="sc-hdr">
                <span class="sc-name">{{ s.name }}</span>
                <div class="sc-badges">
                  <el-tag v-if="s.scheduleStatus" :type="scheduleColors[s.scheduleStatus] as any" size="small" effect="dark">{{
                    scheduleLabels[s.scheduleStatus]
                  }}</el-tag>
                  <el-tag v-if="s.priority" :type="priorityColors[s.priority] as any" size="small">{{
                    s.priority.toUpperCase()
                  }}</el-tag>
                </div>
                <!-- Progress -->
                <div v-if="scenarioCount(s) > 0" class="sc-progress">
                  <el-progress :percentage="scenarioProgress(s)" :stroke-width="6" :show-text="false" />
                  <span class="sc-progress-text">{{ scenarioDone(s) }}/{{ scenarioCount(s) }}</span>
                </div>
              </div>
              <div class="sc-meta">
                <el-tag v-if="s.project" size="small" type="info">{{ s.project }}</el-tag>
              </div>
              <p class="sc-desc">{{ s.description || $t("story.noDescription") }}</p>
              <!-- Tags -->
              <div v-if="s.tags?.length" class="sc-tags">
                <el-tag v-for="t in s.tags" :key="t" size="small" class="sc-tag-chip">{{ t }}</el-tag>
              </div>
              <!-- Counts row -->
              <div class="sc-counts">
                <span v-if="s.files?.length" class="sc-count-item"
                  >📎 {{ s.files.length }} file{{ s.files.length > 1 ? "s" : "" }}</span
                >
              </div>
              <!-- Actions -->
              <div class="sc-acts" @click.stop>
                <el-button size="small" text @click="store.openEditDialog(s)">{{ $t("story.edit") }}</el-button>
                <el-button size="small" text type="danger" @click="store.handleDelete(s)">{{ $t("story.del") }}</el-button>
              </div>
            </el-card>
          </div>
        </div>
      </template>
      <el-empty v-if="store.filteredStories.length === 0" :description="$t('story.noStories')"
        ><el-button type="primary" @click="store.openCreateDialog()">{{ $t("story.create") }}</el-button></el-empty
      >
    </div>

    <!-- List -->
    <el-table
      v-else
      :data="store.filteredStories"
      stripe
      @row-click="(r: StoryDocument) => store.openDetail(r)"
      style="cursor: pointer"
    >
      <el-table-column prop="name" :label="$t('story.name')" min-width="180"
        ><template #default="{ row }"
          ><span style="font-weight: 600">{{ row.name }}</span></template
        ></el-table-column
      >
      <el-table-column prop="project" :label="$t('story.project')" width="90"
        ><template #default="{ row }"
          ><el-tag v-if="row.project" size="small" type="info">{{ row.project }}</el-tag></template
        ></el-table-column
      >
      <el-table-column :label="$t('story.schedule')" width="100"
        ><template #default="{ row }"
          ><el-tag v-if="row.scheduleStatus" :type="scheduleColors[row.scheduleStatus] as any" size="small" effect="dark">{{
            scheduleLabels[row.scheduleStatus]
          }}</el-tag></template
        ></el-table-column
      >

      <el-table-column prop="status" :label="$t('story.status')" width="110"
        ><template #default="{ row }"><StoryStatusBadge :status="row.status" /></template
      ></el-table-column>
      <el-table-column :label="$t('story.priority')" width="90"
        ><template #default="{ row }"
          ><el-tag v-if="row.priority" :type="priorityColors[row.priority] as any" size="small"
            >{{ row.priority.toUpperCase() }}
          </el-tag>
        </template></el-table-column
      >
      <el-table-column :label="$t('story.scenarios')" width="90" align="center"
        ><template #default="{ row }"
          >{{ scenarioDone(row as StoryDocument) }}/{{ scenarioCount(row as StoryDocument) }}</template
        ></el-table-column
      >
      <el-table-column :label="$t('story.dueDate')" width="100"
        ><template #default="{ row }"
          ><span v-if="row.dueDate" :class="{ 'sc-overdue': dueLabel(row.dueDate).type === 'danger' }">{{
            fmtDate(row.dueDate)
          }}</span></template
        ></el-table-column
      >
      <el-table-column prop="assignee" :label="$t('story.assignee')" width="90" />

      <el-table-column prop="description" :label="$t('story.description')" min-width="140" show-overflow-tooltip />
      <el-table-column :label="$t('story.updated')" width="110"
        ><template #default="{ row }">{{ fmtDate(row.updatedAt) }}</template></el-table-column
      >
      <el-table-column :label="$t('story.actions')" width="140" fixed="right">
        <template #default="{ row }">
          <el-button size="small" text type="primary" @click.stop="store.openEditDialog(row as StoryDocument)">Edit</el-button>
          <el-button size="small" text type="danger" @click.stop="store.handleDelete(row as StoryDocument)">Del</el-button>
        </template>
      </el-table-column>
    </el-table>

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
              <el-descriptions-item :label="$t('story.schedule')"
                ><el-tag
                  v-if="store.selectedStory.scheduleStatus"
                  :type="scheduleColors[store.selectedStory.scheduleStatus] as any"
                  size="small"
                  >{{ scheduleLabels[store.selectedStory.scheduleStatus] }}</el-tag
                ></el-descriptions-item
              >

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
              <el-tag v-for="t in store.selectedStory.tags" :key="t" size="small">{{ t }}</el-tag
              ><span v-if="!store.selectedStory.tags?.length" class="sd-muted">{{ $t("story.none") }}</span>
            </div>
            <h4 class="sd-sec">{{ $t("story.files") }}</h4>
            <div v-if="store.selectedStory.files?.length" class="sd-files">
              <div v-for="f in store.selectedStory.files" :key="f.filePath" class="sd-file-item">
                <el-icon><Document /></el-icon>
                <span class="sd-file-name">{{ f.fileName || f.filePath }}</span>
              </div>
            </div>
            <p v-else class="sd-muted">{{ $t("story.none") }}</p>
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
            <template v-for="scStatus in ['done', 'in_progress', 'pending', 'blocked']" :key="scStatus">
              <template v-if="store.selectedStory.scenarios?.filter(sc => sc.status === scStatus).length">
                <div class="sd-sc-group-hdr">
                  <span class="sd-sc-group-dot" :class="'sc-dot--' + scStatus"></span>
                  <span class="sd-sc-group-label">{{ scenarioStatusLabels[scStatus] }}</span>
                  <span class="sd-sc-group-n">{{
                    store.selectedStory.scenarios.filter(sc => sc.status === scStatus).length
                  }}</span>
                </div>
                <div v-for="(sc, idx) in store.selectedStory.scenarios" :key="sc.key">
                  <div v-if="sc.status === scStatus" class="sd-sc">
                    <div class="sd-sc-top">
                      <span class="sd-sc-name">{{ sc.name }}</span>
                      <div class="sd-sc-badges">
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
                      <el-tag v-for="t in sc.tags" :key="t" size="small" class="sc-tag-chip">{{ t }}</el-tag>
                    </div>
                    <div class="sd-sc-acts">
                      <el-button size="small" text @click="store.openScenarioEdit(idx)">{{ $t("story.edit") }}</el-button>
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
            ><el-form-item :label="$t('story.schedule')"
              ><el-select v-model="store.form.scheduleStatus" style="width: 100%"
                ><el-option v-for="(lbl, val) in scheduleLabels" :key="val" :label="lbl" :value="val" /></el-select></el-form-item
          ></el-col>
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
                ><el-option
                  v-for="(lbl, val) in scenarioStatusLabels"
                  :key="val"
                  :label="lbl"
                  :value="val" /></el-select></el-form-item
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

.sb-card {
  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
  border-left: 3px solid transparent;
}
.sb-card:hover {
  transform: translateY(-2px);
}
// Left border accent by schedule
.sc-border--planned {
  border-left-color: var(--el-color-info);
}
.sc-border--on_track {
  border-left-color: var(--el-color-success);
}
.sc-border--at_risk {
  border-left-color: var(--el-color-warning);
}
.sc-border--delayed {
  border-left-color: var(--el-color-danger);
}
.sc-border--completed {
  border-left-color: var(--el-text-color-placeholder);
}

.sc-hdr {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 6px;
  gap: 6px;
}
.sc-name {
  font-size: 15px;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sc-badges {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.sc-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.sc-desc {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}
.sc-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.sc-progress-text {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.sc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}
.sc-tag-chip {
  font-size: 11px;
  opacity: 0.8;
}
.sc-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
  flex-wrap: wrap;
  gap: 4px;
}
.sc-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--el-color-primary-light-3);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  margin-right: 3px;
  vertical-align: middle;
}
.sc-assignee {
  color: var(--el-text-color-secondary);
  display: inline-flex;
  align-items: center;
}
.sc-counts {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}
.sc-count-item {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.sc-acts {
  display: flex;
  gap: 2px;
  justify-content: flex-end;
  margin-top: 2px;
  padding-top: 4px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.sc-overdue {
  color: var(--el-color-danger);
  font-weight: 600;
}

.sb-sched {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  padding: 8px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}
.sb-sched-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  padding: 4px 12px;
  border-radius: 6px;
  cursor: default;
}
.sb-sched-item.on {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}
.sb-sched-item.warn {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}
.sb-sched-item.bad {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}
.sb-sched-item.done {
  background: var(--el-fill-color);
  color: var(--el-text-color-placeholder);
}
.sb-sched-n {
  font-size: 20px;
  font-weight: 700;
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
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
.sd-file-name {
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 12px;
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
.sd-sc-group-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.sc-dot--done {
  background: var(--el-color-success);
}
.sc-dot--in_progress {
  background: var(--el-color-warning);
}
.sc-dot--pending {
  background: var(--el-color-info);
}
.sc-dot--blocked {
  background: var(--el-color-danger);
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
</style>
