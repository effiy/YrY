<template>
  <div class="pl">
    <PageHeaderCard
      :icon="Tickets"
      icon-bg="linear-gradient(135deg, #409eff, #1d4ed8)"
      :title="$t('project.list.title')"
      :description="$t('project.list.description')"
      :pills="headerPills"
      :show-date-nav="true"
      :filter-date="filterDate"
      :filter-date-label="filterDateLabel"
      :is-filter-today="isFilterToday"
      @prev="goToPrevDay"
      @next="goToNextDay"
      @today="goToFilterToday"
      @clear="clearFilterDate"
    >
      <template #title-tags>
        <el-tag size="small" type="info" round>{{ countLabel }}</el-tag>
        <el-tag v-if="filterDate" size="small" type="warning" round effect="dark">
          {{ filterDateLabel }}
        </el-tag>
      </template>
    </PageHeaderCard>

    <ProjectStatTiles :tiles="tiles" :date-label="filterDate ? filterDateLabel : ''" @select="onTileSelect" />

    <div v-if="filterDate" class="pl-date-banner">
      <el-icon><Calendar /></el-icon>
      <span>{{ $t('project.list.dateBanner.showing', { date: filterDateLabel }) }}</span>
      <el-button size="small" text type="primary" @click="clearFilterDate">{{ $t('project.list.dateBanner.clear') }}</el-button>
    </div>

    <ProjectAnalytics
      v-model:expanded="analyticsExpanded"
      class="pl-analytics"
      :statuses="viewRollup.statuses"
      :open-priorities="viewRollup.openPriorities"
      :types="viewRollup.types"
      :top-projects="topProjects"
      :activity="activitySeries"
      :active-filter="activeFilter"
      :total-issues="viewRollup.issues"
      :project-count="filteredProjects.length"
      :date-label="filterDate ? filterDateLabel : ''"
      @filter="setFilter"
    />

    <ProjectAttention
      :counts="riskCounts"
      :flagged-projects="flaggedCount"
      :total-projects="projects.length"
      :active-risk="activeFilter.risk"
      @select="r => setFilter('risk', r)"
    />

    <ProjectFilterPills
      :pills="activeFilterPills"
      :has-active-filter="hasActiveFilter"
      :can-undo="canUndo"
      :match-count="filteredProjects.length"
      :total-count="projects.length"
      @remove="removeFilter"
      @undo="undoLastFilter"
      @clear-all="clearAllFilters"
    />

    <div class="pl-toolbar">
      <el-input
        ref="searchRef"
        v-model="searchText"
        class="pl-search"
        size="small"
        clearable
        :placeholder="$t('project.list.searchPlaceholder')"
        :prefix-icon="Search"
      />
      <div class="pl-sort-group">
        <el-select v-model="sortBy" class="pl-sort" size="small">
          <el-option :label="$t('project.list.sortBy.updated')" value="updated" />
          <el-option :label="$t('project.list.sortBy.name')" value="name" />
          <el-option :label="$t('project.list.sortBy.issues')" value="issues" />
          <el-option :label="$t('project.list.sortBy.done')" value="done" />
          <el-option :label="$t('project.list.sortBy.risk')" value="risk" />
        </el-select>
        <el-button
          class="pl-sort-dir"
          size="small"
          :icon="sortDir === 'asc' ? SortUp : SortDown"
          :title="sortDir === 'asc' ? 'Ascending' : 'Descending'"
          @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'"
        />
      </div>
      <el-select v-model="statusFilter" class="pl-status" size="small">
        <el-option :label="$t('project.list.statusFilter.all')" value="" />
        <el-option :label="$t('project.list.statusFilter.active')" value="active" />
        <el-option :label="$t('project.list.statusFilter.archived')" value="archived" />
      </el-select>
      <el-button :type="showStarredOnly ? 'warning' : ''" size="small" :icon="Star" :title="$t('project.list.starTooltip')" @click="showStarredOnly = !showStarredOnly">
        {{ $t('project.list.starred') }}
      </el-button>
      <div class="pl-toolbar-right">
        <span v-if="lastUpdated" class="pl-updated">{{ $t('project.list.updated', { time: lastUpdated }) }}</span>
        <el-button size="small" :icon="Refresh" :loading="loading" :title="$t('project.list.refresh')" @click="refreshAll" />
        <el-button
          size="small"
          :icon="Download"
          :disabled="!displayedProjects.length"
          :title="$t('project.list.export')"
          @click="exportCSV"
        />
        <el-button type="primary" size="small" :icon="Plus" @click="openCreate">{{ $t('project.list.newProject') }}</el-button>
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="grid"
            ><el-icon><Grid /></el-icon
          ></el-radio-button>
          <el-radio-button value="list"
            ><el-icon><List /></el-icon
          ></el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="pl-results">
      <!-- Skeleton loading on first load — once data is in, v-loading handles refreshes. -->
      <div v-if="loading && !projects.length" class="pl-grid">
        <div v-for="n in 6" :key="n" class="pl-skeleton-card">
          <div class="pl-skeleton-cover" />
          <div class="pl-skeleton-body">
            <div class="pl-skeleton-line pl-skeleton-line--title" />
            <div class="pl-skeleton-line" />
            <div class="pl-skeleton-line pl-skeleton-line--short" />
            <div class="pl-skeleton-line" />
            <div class="pl-skeleton-line pl-skeleton-line--short" />
          </div>
        </div>
      </div>

      <div v-else-if="viewMode === 'grid' && displayedProjects.length" v-loading="loading" class="pl-grid">
        <ProjectCard
          v-for="p in displayedProjects"
          :key="p.key"
          :project="p"
          :stats="statsFor(p.key)"
          :risks="risksFor(p.key)"
          :health="healthFor(p.key)"
          :desc-html="descHtml(p)"
          :starred="starredKeys.has(p.key)"
          :selected="selectedKeys.has(p.key)"
          @open="goDetail(p.key)"
          @edit="openEdit(p)"
          @archive="setStatus([p.key], 'archived')"
          @restore="setStatus([p.key], 'active')"
          @toggle-star="toggleStar(p.key)"
          @toggle-select="toggleSelect(p.key)"
          @copy-id="copyIdentifier(p)"
          @filter-risk="r => setFilter('risk', r)"
          @tab="tab => goTab(p.key, tab)"
        />
      </div>

      <div v-else-if="viewMode === 'list' && displayedProjects.length" v-loading="loading" class="pl-list">
        <ProjectRow
          v-for="p in displayedProjects"
          :key="p.key"
          :project="p"
          :stats="statsFor(p.key)"
          :risks="risksFor(p.key)"
          :health="healthFor(p.key)"
          :starred="starredKeys.has(p.key)"
          :selected="selectedKeys.has(p.key)"
          @open="goDetail(p.key)"
          @edit="openEdit(p)"
          @archive="setStatus([p.key], 'archived')"
          @restore="setStatus([p.key], 'active')"
          @toggle-star="toggleStar(p.key)"
          @toggle-select="toggleSelect(p.key)"
          @copy-id="copyIdentifier(p)"
          @filter-risk="r => setFilter('risk', r)"
          @tab="tab => goTab(p.key, tab)"
        />
      </div>

      <!-- Two-tier empty state: nothing exists yet vs. nothing matches. -->
      <div v-else-if="!loading && !projects.length" class="pl-empty">
        <el-empty :description="$t('project.list.empty.noProjects')">
          <el-button type="primary" @click="openCreate">{{ $t('project.list.empty.createFirst') }}</el-button>
        </el-empty>
      </div>
      <div v-else-if="!loading" class="pl-empty">
        <el-empty :description="emptyDescription">
          <el-button size="small" @click="resetView">{{ $t('project.list.empty.clearFilters') }}</el-button>
        </el-empty>
      </div>
    </div>

    <!-- Batch bar — archive/restore only; bulk delete is intentionally absent. -->
    <Transition name="pl-batch">
      <div v-if="selectedKeys.size" class="pl-batch">
        <span class="pl-batch-count">{{ $t('project.list.batch.selected', { n: selectedKeys.size }) }}</span>
        <el-button size="small" type="warning" plain @click="setStatus([...selectedKeys], 'archived')">{{ $t('project.list.batch.archive') }}</el-button>
        <el-button size="small" type="success" plain @click="setStatus([...selectedKeys], 'active')">{{ $t('project.list.batch.restore') }}</el-button>
        <el-button size="small" text @click="selectedKeys.clear()">{{ $t('project.list.batch.clear') }}</el-button>
      </div>
    </Transition>

    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? $t('project.dialog.editTitle') : $t('project.dialog.createTitle')" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item :label="$t('project.dialog.name')" prop="name">
          <el-input v-model="dialog.form.name" :placeholder="$t('project.dialog.namePlaceholder')" maxlength="80" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('project.dialog.identifier')" prop="identifier">
          <el-input v-model="dialog.form.identifier" :placeholder="$t('project.dialog.identifierPlaceholder')" maxlength="12" />
        </el-form-item>
        <el-form-item :label="$t('project.dialog.description')">
          <el-input v-model="dialog.form.description" type="textarea" :rows="3" :placeholder="$t('project.dialog.descriptionPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('project.dialog.status')">
          <el-radio-group v-model="dialog.form.status">
            <el-radio value="active">{{ $t('project.dialog.statusActive') }}</el-radio>
            <el-radio value="archived">{{ $t('project.dialog.statusArchived') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">{{ $t('project.dialog.cancel') }}</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">{{ $t('project.dialog.save') }}</el-button>
      </template>
    </el-dialog>

      </div>
</template>

<script setup lang="ts" name="projectList">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  Calendar,
  Document,
  Download,
  Grid,
  List,
  Plus,
  Refresh,
  Search,
  SortDown,
  SortUp,
  Star,
  Tickets,
  TrendCharts,
  Warning,
  WarningFilled
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useProjectStore } from "@/stores/modules/project";
import { useMarkdown } from "@/hooks/useMarkdown";
import { loadBool, loadStr, saveBool, saveStr } from "@/utils/storage";
import { createProject, updateProject } from "@/api/modules/projectService";
import type { Project, ProjectMember } from "@/api/modules/projectService";
import { useProjectInsights } from "./composables/useProjectInsights";
import type { StatTile } from "./types";
import ProjectStatTiles from "./components/ProjectStatTiles.vue";
import ProjectAnalytics from "./components/ProjectAnalytics.vue";
import ProjectAttention from "./components/ProjectAttention.vue";
import ProjectFilterPills from "./components/ProjectFilterPills.vue";
import ProjectCard from "./components/ProjectCard.vue";
import ProjectRow from "./components/ProjectRow.vue";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import type { HeaderPill } from "@/components/PageHeaderCard/PageHeaderCard.vue";
import { useDateFilter } from "@/hooks/useDateFilter";

import { useI18n } from "vue-i18n";

const router = useRouter();
const { t } = useI18n();
const store = useProjectStore();
const { render: renderMarkdown } = useMarkdown();

// ── Date filter (must be before useProjectInsights so it can filter by date) ──
const filterDate = ref<Date | null>(null);
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);

// Destructured so the template gets auto-unwrapped refs instead of `x.value`.
const {
  loading,
  lastUpdated,
  projects,
  load: loadInsights,
  statsFor,
  completionPct,
  risksFor,
  healthFor,
  riskCounts,
  flaggedCount,
  activeFilter,
  setFilter,
  removeFilter,
  clearAllFilters,
  undoLastFilter,
  hasActiveFilter,
  canUndo,
  matchesFilter,
  activeFilterPills,
  rollup,
  activitySeries: buildActivitySeries
} = useProjectInsights(filterDateStr);

// ── User preferences (persisted) ──────────────────────────────────────────
const PREF = {
  view: "project.viewMode",
  sort: "project.sortBy",
  starred: "project.starredOnly",
  analytics: "project.analyticsExpanded"
};

const viewMode = ref<"grid" | "list">(loadStr(PREF.view, "grid") === "list" ? "list" : "grid");
const sortBy = ref(loadStr(PREF.sort, "updated"));
const sortDir = ref<"asc" | "desc">("desc");
const showStarredOnly = ref(loadBool(PREF.starred, false));
const analyticsExpanded = ref(loadBool(PREF.analytics, true));

watch(viewMode, v => saveStr(PREF.view, v));
watch(sortBy, v => saveStr(PREF.sort, v));
watch(showStarredOnly, v => saveBool(PREF.starred, v));
watch(analyticsExpanded, v => saveBool(PREF.analytics, v));

const searchText = ref("");
const searchRef = ref<{ focus: () => void }>();

const formRef = ref<FormInstance>();
const starredKeys = ref<Set<string>>(new Set(JSON.parse(localStorage.getItem("starred_projects") || "[]")));
const selectedKeys = ref<Set<string>>(new Set());

// The status select drives `activeFilter` so the pill bar reflects every narrowing.
const statusFilter = computed<string>({
  get: () => activeFilter.value.status ?? "",
  set: v => {
    if (v === (activeFilter.value.status ?? "")) return;
    if (v) setFilter("status", v);
    else removeFilter("status");
  }
});

// ── Derived project lists ─────────────────────────────────────────────────
const filteredProjects = computed(() => {
  const q = searchText.value.trim().toLowerCase();
  return projects.value.filter(p => {
    if (!matchesFilter(p)) return false;
    if (showStarredOnly.value && !starredKeys.value.has(p.key)) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.identifier.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      (p.members || []).some(m => m.username.toLowerCase().includes(q))
    );
  });
});

const displayedProjects = computed(() => {
  const list = [...filteredProjects.value];
  const asc = sortDir.value === "asc";
  switch (sortBy.value) {
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "issues":
      list.sort((a, b) => statsFor(b.key).issues - statsFor(a.key).issues);
      break;
    case "done":
      list.sort((a, b) => completionPct(b.key) - completionPct(a.key));
      break;
    case "risk":
      list.sort((a, b) => risksFor(b.key).length - risksFor(a.key).length);
      break;
    default:
      list.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
      break;
  }
  return asc ? list.reverse() : list;
});

const allRollup = computed(() => rollup(projects.value));
const viewRollup = computed(() => rollup(filteredProjects.value));
const activitySeries = computed(() => buildActivitySeries(filteredProjects.value));

const topProjects = computed(() =>
  filteredProjects.value
    .map(p => {
      const s = statsFor(p.key);
      return { key: p.key, name: p.name, open: s.open, done: s.done };
    })
    .filter(r => r.open + r.done > 0)
    .sort((a, b) => b.open + b.done - (a.open + a.done))
    .slice(0, 8)
);

const criticalCount = computed(() => projects.value.filter(p => healthFor(p.key) === "poor").length);

const countLabel = computed(() => t("project.list.countLabel", { shown: displayedProjects.value.length, total: projects.value.length }));

const emptyDescription = computed(() => t("project.list.empty.noMatch"));

// ── KPI tiles: always describe the whole dataset and act as filter entries.
const tiles = computed<StatTile[]>(() => {
  const all = allRollup.value;
  const completion = all.issues ? Math.round((all.done / all.issues) * 100) : 0;
  return [
    {
      key: "issues",
      value: all.issues,
      label: t("project.stats.issues"),
      sub: t("project.stats.done", { n: all.done }),
      hint: "Open the issue list",
      icon: Tickets,
      variant: "issues",
      clickable: true
    },
    {
      key: "open",
      value: all.open,
      label: t("project.stats.open"),
      sub: all.overdue ? t("project.stats.overdue", { n: all.overdue }) : t("project.stats.noneOverdue"),
      hint: "Open the issue list",
      icon: Document,
      variant: "open",
      clickable: true
    },
    {
      key: "progress",
      value: completion,
      suffix: "%",
      label: t("project.stats.completed"),
      sub: `${all.done} ${t("project.stats.of")} ${all.issues}`,
      icon: TrendCharts,
      variant: "progress"
    },
    {
      key: "bugs",
      value: all.totalBugs,
      label: t("project.stats.bugs"),
      sub: t("project.stats.total", { n: all.totalBugs }),
      hint: "Open bugs",
      icon: Warning,
      variant: "bugs",
      clickable: true
    },
    {
      key: "risk",
      value: flaggedCount.value,
      label: t("project.stats.atRisk"),
      sub: criticalCount.value ? t("project.stats.critical", { n: criticalCount.value }) : t("project.stats.noneCritical"),
      hint: "Filter to projects failing a health check",
      icon: WarningFilled,
      variant: "risk",
      clickable: true,
      active: activeFilter.value.flagged === "1"
    }
  ];
});

function onTileSelect(key: string) {
  switch (key) {
    case "risk":
      setFilter("flagged", "1");
      break;
    case "issues":
    case "open":
      router.push("/issue");
      break;
    case "bugs":
      router.push("/bug");
      break;
  }
}

const headerPills = computed<HeaderPill[]>(() => {
  const all = allRollup.value;
  const completion = all.issues ? Math.round((all.done / all.issues) * 100) : 0;
  return [
    { value: projects.value.length, label: t("project.list.title") },
    { value: all.issues, label: t("project.stats.issues") },
    { value: all.open, label: t("project.stats.open") },
    {
      value: completion,
      suffix: "%",
      label: t("project.stats.completed"),
      accent: true,
      accentColor: "var(--el-color-primary-light-9)",
      accentValueColor: "var(--el-color-primary)"
    }
  ];
});

// ── Markdown descriptions, rendered once per data change ──────────────────
const descHtmlMap = computed(() => {
  const map = new Map<string, string>();
  for (const p of projects.value) {
    if (p.description) map.set(p.key, renderMarkdown(p.description));
  }
  return map;
});

function descHtml(project: Project): string {
  return descHtmlMap.value.get(project.key) || "";
}

// ── Selection + starring ──────────────────────────────────────────────────
function toggleSelect(key: string) {
  const next = new Set(selectedKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  selectedKeys.value = next;
}

function toggleStar(key: string) {
  const next = new Set(starredKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  starredKeys.value = next;
  localStorage.setItem("starred_projects", JSON.stringify([...next]));
}

// Never act on a project the user can no longer see.
watch(displayedProjects, list => {
  if (!selectedKeys.value.size) return;
  const visible = new Set(list.map(p => p.key));
  const kept = [...selectedKeys.value].filter(k => visible.has(k));
  if (kept.length !== selectedKeys.value.size) selectedKeys.value = new Set(kept);
});

// ── Mutations ─────────────────────────────────────────────────────────────
async function refreshAll() {
  // The shared store stays on its own paginated fetch so the other 13 pages
  // that read it keep seeing what they always saw.
  await Promise.all([loadInsights(), store.fetchProjects()]);
}

async function setStatus(keys: string[], status: "active" | "archived") {
  const byKey = new Map(projects.value.map(p => [p.key, p]));
  const targets = keys.filter(k => byKey.get(k)?.status !== status);
  if (!targets.length) {
    ElMessage.info(status === "archived" ? t("project.list.alreadyArchived") : t("project.list.alreadyActive"));
    return;
  }
  const verb = status === "archived" ? t("project.list.batch.archive") : t("project.list.batch.restore");
  if (targets.length > 1) {
    const confirmMsg = status === "archived" ? t("project.list.archiveConfirm", { n: targets.length }) : t("project.list.restoreConfirm", { n: targets.length });
    const ok = await ElMessageBox.confirm(confirmMsg, verb, {
      type: "warning"
    }).catch(() => false);
    if (!ok) return;
  }
  await Promise.all(targets.map(k => updateProject(k, { status })));
  selectedKeys.value = new Set();
  await refreshAll();
  ElMessage.success(
    status === "archived" ? t("project.list.archiveSuccess", { n: targets.length }) : t("project.list.restoreSuccess", { n: targets.length })
  );
}

const rules: FormRules = {
  name: [{ required: true, message: t("project.dialog.nameRequired"), trigger: "blur" }],
  identifier: [
    { required: true, message: t("project.dialog.identifierRequired"), trigger: "blur" },
    { pattern: /^[A-Z][A-Z0-9_]{0,11}$/, message: t("project.dialog.identifierPattern"), trigger: "blur" }
  ]
};

interface ProjectForm {
  name: string;
  identifier: string;
  description: string;
  status: "active" | "archived";
  members: ProjectMember[];
  cover_image: string;
}

const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editKey: "",
  form: { name: "", identifier: "", description: "", status: "active", members: [], cover_image: "" } as ProjectForm
});

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = { name: "", identifier: "", description: "", status: "active", members: [], cover_image: "" };
  dialog.visible = true;
}

function openEdit(project: Project) {
  dialog.isEdit = true;
  dialog.editKey = project.key;
  dialog.form = {
    name: project.name,
    identifier: project.identifier,
    description: project.description || "",
    status: project.status,
    members: project.members || [],
    cover_image: project.cover_image || ""
  };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await updateProject(dialog.editKey, {
        name: dialog.form.name,
        identifier: dialog.form.identifier,
        description: dialog.form.description,
        status: dialog.form.status
      });
      ElMessage.success(t("project.dialog.updateSuccess"));
    } else {
      await createProject({
        key: dialog.form.identifier.toLowerCase() + "-" + Date.now().toString(36),
        name: dialog.form.name,
        identifier: dialog.form.identifier,
        description: dialog.form.description,
        status: dialog.form.status,
        members: [{ user_id: "admin", username: "Admin", role: "owner" }],
        cover_image: dialog.form.cover_image
      });
      ElMessage.success(t("project.dialog.createSuccess"));
    }
    dialog.visible = false;
    await refreshAll();
  } finally {
    dialog.submitting = false;
  }
}

// ── Navigation + misc actions ─────────────────────────────────────────────
function goDetail(key: string) {
  router.push(`/project/${key}`);
}

function goTab(key: string, tab: "issues" | "members" | "bugs" | "modules") {
  router.push({ path: `/project/${key}`, query: { tab } });
}

async function copyIdentifier(project: Project) {
  try {
    await navigator.clipboard.writeText(project.identifier);
    ElMessage.success(t("project.dialog.copied", { identifier: project.identifier }));
  } catch {
    ElMessage.warning(t("project.dialog.clipboardUnavailable"));
  }
}

function resetView() {
  clearAllFilters();
  searchText.value = "";
  showStarredOnly.value = false;
}

const CSV_HEADERS = [
  "key",
  "name",
  "identifier",
  "status",
  "members",
  "issues",
  "done",
  "open",
  "overdue",
  "completion_pct",
    "health",
  "risks",
  "updated_at"
];

function exportCSV() {
  const rows = displayedProjects.value.map(p => {
    const s = statsFor(p.key);
    return [
      p.key,
      p.name,
      p.identifier,
      p.status,
      String((p.members || []).length),
      String(s.issues),
      String(s.done),
      String(s.open),
      String(s.overdue),
      String(completionPct(p.key)),
      healthFor(p.key),
      risksFor(p.key).join(" | "),
      p.updated_at || ""
    ];
  });
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [CSV_HEADERS, ...rows].map(r => r.map(escape).join(",")).join("\n");
  // BOM keeps Excel from mangling non-ASCII project names.
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `projects-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success(t("project.list.exportSuccess", { n: rows.length }));
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    searchRef.value?.focus();
  }
}

onMounted(() => {
  refreshAll();
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});

// Starred keys for projects.value that no longer exist would silently accumulate.
watch(projects, list => {
  if (!list.length || !starredKeys.value.size) return;
  const live = new Set(list.map(p => p.key));
  const kept = [...starredKeys.value].filter(k => live.has(k));
  if (kept.length !== starredKeys.value.size) {
    starredKeys.value = new Set(kept);
    localStorage.setItem("starred_projects", JSON.stringify(kept));
  }
});
</script>

<style scoped lang="scss">
.pl {
  height: calc(100vh - 146px);
  padding: 24px;
  overflow: auto;
  background: var(--el-bg-color-page);
}

.pl-updated {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}
.pl-analytics {
  margin-top: 16px;
}
.pl-date-banner {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 14px;
  margin-top: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-5);
  border-radius: 9px;
  .el-icon {
    flex-shrink: 0;
    font-size: 14px;
    color: var(--el-color-warning);
  }
  strong {
    color: var(--el-text-color-primary);
  }
  .el-button {
    margin-left: auto;
  }
}
.pl-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}
.pl-search {
  width: 220px;
}
.pl-sort {
  width: 140px;
}
.pl-sort-group {
  display: flex;
  gap: 0;
  align-items: center;
  .pl-sort {
    width: 130px;
    :deep(.el-input__wrapper) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
}
.pl-sort-dir {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 0;
}
.pl-status {
  width: 120px;
}
.pl-toolbar-right {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-left: auto;
}
.pl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 18px;
}
.pl-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pl-results {
  min-height: 200px;
}
/* Skeleton cards — pulse animation matching the grid layout. */
.pl-skeleton-card {
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
.pl-skeleton-cover {
  height: 104px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  animation: pl-shimmer 1.5s ease-in-out infinite;
}
.pl-skeleton-body {
  padding: 14px 16px 16px;
}
.pl-skeleton-line {
  height: 12px;
  margin-bottom: 10px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: pl-shimmer 1.5s ease-in-out infinite;
  &--title {
    width: 60%;
    height: 16px;
  }
  &--short {
    width: 35%;
  }
}
@keyframes pl-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.pl-empty {
  padding: 56px 0;
}

/* Floating batch bar — only appears once something is selected. */
.pl-batch {
  position: fixed;
  bottom: 28px;
  left: 50%;
  z-index: 20;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 9px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 999px;
  box-shadow: 0 6px 24px rgb(0 0 0 / 16%);
  transform: translateX(-50%);
}
.pl-batch-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}
.pl-batch-enter-active,
.pl-batch-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.pl-batch-enter-from,
.pl-batch-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
