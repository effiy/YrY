<template>
  <div class="roadmap">
    <div class="roadmap__head">
      <div class="roadmap__head-left">
        <div class="roadmap__head-stat" @click="clearFilters">
          <span class="roadmap__head-stat-value">{{ totalItems }}</span>
          <span class="roadmap__head-stat-label">{{ t("roadmap.total") }}</span>
        </div>
        <div class="roadmap__head-stat">
          <span class="roadmap__head-stat-value is-cycle">{{ kindCounts.cycle }}</span>
          <span class="roadmap__head-stat-label">{{ t("roadmap.kind.cycles") }}</span>
        </div>
        <div class="roadmap__head-stat">
          <span class="roadmap__head-stat-value is-module">{{ kindCounts.module }}</span>
          <span class="roadmap__head-stat-label">{{ t("roadmap.kind.modules") }}</span>
        </div>
        <div class="roadmap__head-stat">
          <span class="roadmap__head-stat-value is-release">{{ kindCounts.release }}</span>
          <span class="roadmap__head-stat-label">{{ t("roadmap.kind.releases") }}</span>
        </div>
        <div class="roadmap__head-stat">
          <span class="roadmap__head-stat-value is-done">{{ overallProgress.pct }}%</span>
          <span class="roadmap__head-stat-label">{{ t("roadmap.done") }}</span>
        </div>
      </div>
      <div class="roadmap__head-right">
        <el-input
          v-model="search"
          :placeholder="t('roadmap.searchPlaceholder')"
          size="small"
          clearable
          style="width: 200px"
          @update:model-value="onSearchInput"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <HeroDateNav
          :filter-date="filterDate"
          :label="filterDateLabel"
          :is-today="isFilterToday"
          @prev="goToPrevDay"
          @next="goToNextDay"
          @today="goToFilterToday"
          @clear="clearFilterDate"
        />
      </div>
    </div>

    <div v-if="hasKindFilter" class="roadmap__filters">
      <div class="roadmap__filter-row">
        <span class="roadmap__filter-label">{{ t("roadmap.kind.label") }}</span>
        <el-check-tag
          v-for="k in kindOptions"
          :key="k.value"
          :checked="kindFilter.has(k.value)"
          size="small"
          @change="() => toggleKind(k.value)"
        >
          {{ k.label }}
        </el-check-tag>
      </div>
    </div>

    <div class="roadmap__stats" v-if="totalItems > 0">
      <div class="roadmap__stat-segment" :style="{ width: kindPct('cycle') + '%', background: '#409eff' }" :title="`${t('roadmap.kind.cycles')}: ${kindCounts.cycle}`" />
      <div class="roadmap__stat-segment" :style="{ width: kindPct('module') + '%', background: '#9b59b6' }" :title="`${t('roadmap.kind.modules')}: ${kindCounts.module}`" />
      <div class="roadmap__stat-segment" :style="{ width: kindPct('release') + '%', background: '#20c997' }" :title="`${t('roadmap.kind.releases')}: ${kindCounts.release}`" />
    </div>

    <div v-loading="loading" class="roadmap__board">
      <div v-for="col in columns" :key="col.projectKey" class="roadmap__col" :class="`roadmap__col--${col.status}`">
        <div class="roadmap__col-head" :style="{ background: col.headerBg }">
          <div class="roadmap__col-head-row">
            <span class="roadmap__col-title" @click="goProject(col.projectKey)">{{ col.project }}</span>
            <div class="roadmap__col-head-actions">
              <el-tag size="small" round :type="col.countTagType">{{ col.items.length }}</el-tag>
              <el-dropdown trigger="click" @command="(cmd: string) => sortColumn(col, cmd)">
                <el-button size="small" text style="padding: 2px 4px; margin-left: 2px;">
                  <el-icon><Sort /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="date">{{ t("roadmap.sort.byDate") }}</el-dropdown-item>
                    <el-dropdown-item command="progress">{{ t("roadmap.sort.byProgress") }}</el-dropdown-item>
                    <el-dropdown-item command="name">{{ t("roadmap.sort.byName") }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div class="roadmap__col-progress">
            <el-progress :percentage="colProgress(col).pct" :stroke-width="3" :show-text="false" color="#67c23a" />
            <span>{{ t("roadmap.progress.ofTotal", colProgress(col)) }}</span>
          </div>
        </div>
        <div class="roadmap__col-body">
          <div
            v-for="item in col.items"
            :key="item.id"
            class="roadmap__item"
            :class="{ 'roadmap__item--overdue': isOverdue(item) }"
            @click="goTo(item.link)"
            @contextmenu.prevent="openContextMenu($event, item)"
          >
            <div class="roadmap__item-accent" :style="{ background: item.color }" />
            <div class="roadmap__item-head">
              <code class="roadmap__item-key">{{ item.id }}</code>
              <span class="roadmap__item-kind" :class="`roadmap__item-kind--${item.kind}`">{{ item.kindLabel }}</span>
              <span class="roadmap__item-status" :style="{ color: item.color }">{{ item.statusLabel }}</span>
            </div>
            <div class="roadmap__item-title" @click.stop="openPreview(item)">{{ item.name }}</div>
            <div class="roadmap__item-foot">
              <span class="roadmap__item-foot-item" :class="{ 'roadmap__item-foot-item--overdue': isOverdue(item) }">
                <el-icon><Clock /></el-icon>{{ item.dates }}
              </span>
              <span v-if="item.lead" class="roadmap__item-foot-item">
                <el-icon><User /></el-icon>{{ item.lead }}
              </span>
              <span v-if="item.total > 0" class="roadmap__item-foot-item">
                <el-progress :percentage="pct(item)" :stroke-width="4" :show-text="false" :color="progressColor(item)" />
                <span>{{ t("roadmap.progress.ofTotal", item) }}</span>
              </span>
            </div>
            <div v-if="item.detail" class="roadmap__item-detail">{{ item.detail }}</div>
            <div v-if="item.issueKeys.length > 0" class="roadmap__item-issues">
              <div
                v-for="key in item.issueKeys"
                :key="key"
                class="roadmap__item-issue-row"
                @click.stop="openIssuePreview(key)"
              >
                <span class="roadmap__item-issue-key">{{ key }}</span>
                <span class="roadmap__item-issue-title">{{ issueTitle(key) }}</span>
              </div>
            </div>
          </div>
          <div v-if="col.items.length === 0" class="roadmap__col-empty">
            <el-icon :size="28"><Folder /></el-icon>
            <span>{{ t("roadmap.empty.noItems") }}</span>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && !columns.length" :description="t('roadmap.empty.noRoadmapItems')" :image-size="60" />
    </div>

    <teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="roadmap-ctxmenu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click.stop
      >
        <template v-if="contextMenu.item">
          <div class="roadmap-ctxmenu__item" @click="ctxOpen">
            <el-icon><View /></el-icon>{{ t("roadmap.ctxMenu.open") }}
          </div>
          <div class="roadmap-ctxmenu__item" @click="ctxPreview">
            <el-icon><Document /></el-icon>{{ t("roadmap.ctxMenu.preview") }}
          </div>
          <div class="roadmap-ctxmenu__item" @click="ctxCopyId">
            <el-icon><CopyDocument /></el-icon>{{ t("roadmap.ctxMenu.copyId") }}
          </div>
          <div class="roadmap-ctxmenu__divider" />
          <template v-if="contextMenu.item.kind === 'cycle'">
            <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('upcoming')">
              <el-icon><Clock /></el-icon>{{ t("roadmap.ctxMenu.markUpcoming") }}
            </div>
            <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('active')">
              <el-icon><VideoPlay /></el-icon>{{ t("roadmap.ctxMenu.markActive") }}
            </div>
            <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('completed')">
              <el-icon><CircleCheck /></el-icon>{{ t("roadmap.ctxMenu.markCompleted") }}
            </div>
          </template>
          <template v-else-if="contextMenu.item.kind === 'module'">
            <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('planned')">
              <el-icon><Calendar /></el-icon>{{ t("roadmap.ctxMenu.markPlanned") }}
            </div>
            <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('in_progress')">
              <el-icon><Loading /></el-icon>{{ t("roadmap.ctxMenu.markInProgress") }}
            </div>
            <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('completed')">
              <el-icon><CircleCheck /></el-icon>{{ t("roadmap.ctxMenu.markCompleted") }}
            </div>
            <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('cancelled')">
              <el-icon><CircleClose /></el-icon>{{ t("roadmap.ctxMenu.markCancelled") }}
            </div>
          </template>
          <template v-else-if="contextMenu.item.kind === 'release'">
            <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('planned')">
              <el-icon><Calendar /></el-icon>{{ t("roadmap.ctxMenu.markPlanned") }}
            </div>
            <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('in_progress')">
              <el-icon><Loading /></el-icon>{{ t("roadmap.ctxMenu.markInProgress") }}
            </div>
            <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('released')">
              <el-icon><Promotion /></el-icon>{{ t("roadmap.ctxMenu.markReleased") }}
            </div>
          </template>
          <div class="roadmap-ctxmenu__divider" />
          <div class="roadmap-ctxmenu__item roadmap-ctxmenu__item--danger" @click="ctxDelete">
            <el-icon><Delete /></el-icon>{{ t("roadmap.ctxMenu.delete") }}
          </div>
        </template>
      </div>
    </teleport>

    <KnowledgePreviewDialog ref="descDialogRef" />
  </div>
</template>

<script setup lang="ts" name="roadmapView">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import { useDateFilter } from "@/hooks/useDateFilter";
import { Search, Folder, User, Sort, Clock, View, Document, CopyDocument, VideoPlay, CircleCheck, Calendar, Loading, CircleClose, Promotion, Delete } from "@element-plus/icons-vue";
import { useCycleStore } from "@/stores/modules/cycle";
import { useModuleStore } from "@/stores/modules/module";
import { useReleaseStore } from "@/stores/modules/release";
import { useProjectStore } from "@/stores/modules/project";
import { useIssueStore } from "@/stores/modules/issue";
import { CYCLE_STATUS_MAP, type CycleStatus } from "@/api/modules/cycleService";
import { MODULE_STATUS_MAP, type ModuleStatus } from "@/api/modules/moduleService";
import { RELEASE_STATUS_MAP, type ReleaseStatus } from "@/api/modules/releaseService";
import { readKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";

const { t } = useI18n();
const router = useRouter();
const cycleStore = useCycleStore();
const moduleStore = useModuleStore();
const releaseStore = useReleaseStore();
const projectStore = useProjectStore();
const issueStore = useIssueStore();

const loading = ref(false);

const filterDate = ref<Date | null>(null);
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);

const search = ref("");
let searchTimer: ReturnType<typeof setTimeout> | null = null;
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadData(), 250);
}

type RoadmapKind = "cycle" | "module" | "release";
const kindFilter = ref(new Set<RoadmapKind>());
const kindOptions = computed<{ value: RoadmapKind; label: string }[]>(() => [
  { value: "cycle", label: t("roadmap.kind.cycles") },
  { value: "module", label: t("roadmap.kind.modules") },
  { value: "release", label: t("roadmap.kind.releases") }
]);
function toggleKind(val: RoadmapKind) {
  if (kindFilter.value.has(val)) kindFilter.value.delete(val);
  else kindFilter.value.add(val);
  kindFilter.value = new Set(kindFilter.value);
}
const hasKindFilter = computed(() => kindFilter.value.size > 0);

const projectFilter = ref("");

type TagType = "success" | "warning" | "info" | "primary" | "danger";

interface RoadmapItem {
  id: string;
  name: string;
  kind: RoadmapKind;
  kindLabel: string;
  status: string;
  statusLabel: string;
  tagType: TagType;
  color: string;
  dates: string;
  sortDate: string;
  startDate: string;
  endDate: string;
  detail?: string;
  lead?: string;
  link: string;
  done: number;
  total: number;
  issueKeys: string[];
}

interface RoadmapColumn {
  project: string;
  projectKey: string;
  status: string;
  headerBg: string;
  countTagType: "info" | "primary" | "warning" | "success" | "danger";
  items: RoadmapItem[];
}

const COL_HEADER_STYLES = [
  { status: "a", headerBg: "linear-gradient(180deg, #ecf5ff 0%, #d9ecff 100%)", countTagType: "primary" as const },
  { status: "b", headerBg: "linear-gradient(180deg, #fdf6ec 0%, #faecd8 100%)", countTagType: "warning" as const },
  { status: "c", headerBg: "linear-gradient(180deg, #f5f0ff 0%, #ede0ff 100%)", countTagType: "warning" as const },
  { status: "d", headerBg: "linear-gradient(180deg, #f0f9eb 0%, #e1f3d8 100%)", countTagType: "success" as const },
  { status: "e", headerBg: "linear-gradient(180deg, #f0f2f5 0%, #e4e7ed 100%)", countTagType: "info" as const },
];

const KIND_LABEL = computed<Record<RoadmapKind, string>>(() => ({
  cycle: t("roadmap.kind.cycleLabel"),
  module: t("roadmap.kind.moduleLabel"),
  release: t("roadmap.kind.releaseLabel")
}));

const STATUS_META: Record<RoadmapKind, Record<string, { tag: TagType; color: string }>> = {
  cycle: {
    upcoming: { tag: "info", color: "#909399" },
    active: { tag: "primary", color: "#409eff" },
    completed: { tag: "success", color: "#67c23a" }
  },
  module: {
    planned: { tag: "info", color: "#909399" },
    in_progress: { tag: "warning", color: "#e6a23c" },
    completed: { tag: "success", color: "#67c23a" },
    cancelled: { tag: "danger", color: "#f56c6c" }
  },
  release: {
    planned: { tag: "info", color: "#909399" },
    in_progress: { tag: "warning", color: "#e6a23c" },
    released: { tag: "success", color: "#67c23a" }
  }
};

const FINAL_STATUS: Record<RoadmapKind, Set<string>> = {
  cycle: new Set(["completed"]),
  module: new Set(["completed", "cancelled"]),
  release: new Set(["released"])
};

const STATUS_LABEL: Record<RoadmapKind, Record<string, string>> = {
  cycle: CYCLE_STATUS_MAP,
  module: MODULE_STATUS_MAP,
  release: RELEASE_STATUS_MAP
};

const columns = ref<RoadmapColumn[]>([]);
const allItems = ref<RoadmapItem[]>([]);

const projects = computed(() => projectStore.projects.map(p => ({ key: p.key, name: p.name })));
const projectNames = computed(() => new Map(projectStore.projects.map(p => [p.key, p.name])));

const filteredItems = computed(() => {
  let items = allItems.value;
  if (hasKindFilter.value) {
    items = items.filter(i => kindFilter.value.has(i.kind));
  }
  if (search.value) {
    const q = search.value.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || (i.detail && i.detail.toLowerCase().includes(q)));
  }
  return items;
});

const filteredColumns = computed(() => {
  const byProject: Record<string, RoadmapItem[]> = {};
  for (const item of filteredItems.value) {
    (byProject[item.id.split("-")[0]] ??= []).push(item);
  }
  return Object.entries(byProject)
    .map(([projectKey, items], i) => ({
      project: projectNames.value.get(projectKey) ?? projectKey,
      projectKey,
      ...COL_HEADER_STYLES[i % COL_HEADER_STYLES.length],
      items: items.sort((a, b) => a.sortDate.localeCompare(b.sortDate))
    }))
    .sort((a, b) => a.project.localeCompare(b.project));
});

const totalItems = computed(() => filteredItems.value.length);
const kindCounts = computed(() => {
  const counts: Record<RoadmapKind, number> = { cycle: 0, module: 0, release: 0 };
  allItems.value.forEach(i => { counts[i.kind]++; });
  return counts;
});
const overallProgress = computed(() => {
  let done = 0;
  let total = 0;
  allItems.value.forEach(i => { done += i.done; total += i.total; });
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
});

function kindPct(kind: RoadmapKind): number {
  if (totalItems.value === 0) return 0;
  return Math.round((kindCounts.value[kind] / totalItems.value) * 100) || 0;
}

function colProgress(col: RoadmapColumn) {
  let done = 0;
  let total = 0;
  col.items.forEach(i => { done += i.done; total += i.total; });
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function pct(item: RoadmapItem) {
  return item.total ? Math.round((item.done / item.total) * 100) : 0;
}

function progressColor(item: RoadmapItem) {
  const v = pct(item);
  if (v >= 100) return "#67c23a";
  if (v >= 75) return "#409eff";
  if (v >= 50) return "#e6a23c";
  return "#f56c6c";
}

function isOverdue(item: RoadmapItem): boolean {
  if (!item.endDate) return false;
  if (FINAL_STATUS[item.kind]?.has(item.status)) return false;
  const today = new Date().toISOString().slice(0, 10);
  return item.endDate < today;
}

const issueTitleMap = computed(() => {
  const m = new Map<string, string>();
  issueStore.issues.forEach(i => m.set(i.key, i.title));
  return m;
});
function issueTitle(key: string) { return issueTitleMap.value.get(key) || key; }

const issueStatusMap = computed(() => {
  const m = new Map<string, string>();
  issueStore.issues.forEach(i => m.set(i.key, i.status));
  return m;
});
async function openIssuePreview(key: string) {
  const issue = issueStore.issues.find(i => i.key === key);
  if (!issue) return;
  const date = (issue.created_at || "").slice(0, 10);
  const type = issue.issue_type || "task";
  const filePath = `issues/${date}/${type}/${key}.md`;
  let content = issue.description || "";
  try {
    const res = await readKnowledgeFile(filePath);
    content = res.content || content;
  } catch { /* use issue.description as fallback */ }
  descDialogRef.value?.openFile({
    path: filePath,
    title: issue.title,
    content,
    onSave: async (newContent: string) => {
      await writeKnowledgeFile(filePath, newContent, {
        title: issue.title,
        type: "issue-description",
        status: issue.status,
        created: date
      });
    }
  });
}

function progressOf(keys: string[], issueStatus: Map<string, string>) {
  let done = 0;
  let total = 0;
  for (const key of keys) {
    const status = issueStatus.get(key);
    if (status === undefined || status === "cancelled") continue;
    total++;
    if (status === "done") done++;
  }
  return { done, total, issueKeys: keys };
}

function inDateRange(start: string, end: string, target: string): boolean {
  if (!target) return true;
  return (!start || start <= target) && (!end || end >= target);
}

function sortColumn(col: RoadmapColumn, cmd: string) {
  if (cmd === "date") {
    col.items.sort((a, b) => a.sortDate.localeCompare(b.sortDate));
  } else if (cmd === "progress") {
    col.items.sort((a, b) => pct(b) - pct(a));
  } else if (cmd === "name") {
    col.items.sort((a, b) => a.name.localeCompare(b.name));
  }
}

async function loadData() {
  loading.value = true;
  try {
    const params: any = { pageSize: 200 };
    if (projectFilter.value) params.project_key = projectFilter.value;

    await Promise.all([
      cycleStore.fetchCycles(params),
      moduleStore.fetchModules(params),
      releaseStore.fetchReleases(params),
      issueStore.fetchIssues({ pageSize: 1000 })
    ]);

    const issueStatus = new Map<string, string>();
    issueStore.issues.forEach(i => issueStatus.set(i.key, i.status));

    const items: RoadmapItem[] = [];
    const dateTarget = filterDateStr.value;
    const kindLabelMap = KIND_LABEL.value;

    cycleStore.cycles.forEach(c => {
      if (dateTarget && !inDateRange(c.start_date, c.end_date, dateTarget)) return;
      const status = c.status ?? "upcoming";
      const meta = STATUS_META.cycle[status] ?? { tag: "info" as TagType, color: "#909399" };
      items.push({
        id: c.key,
        name: c.name,
        kind: "cycle",
        kindLabel: kindLabelMap.cycle,
        status,
        statusLabel: STATUS_LABEL.cycle[status] ?? status,
        tagType: meta.tag,
        color: meta.color,
        dates: `${fmtDate(c.start_date)} → ${fmtDate(c.end_date)}`,
        sortDate: c.start_date ?? "",
        startDate: c.start_date,
        endDate: c.end_date,
        detail: c.goal,
        link: `/cycle/${c.key}`,
        ...progressOf(c.issue_keys ?? [], issueStatus)
      });
    });

    moduleStore.modules.forEach(m => {
      if (dateTarget && !inDateRange(m.start_date ?? "", m.due_date ?? "", dateTarget)) return;
      const status = m.status ?? "planned";
      const meta = STATUS_META.module[status] ?? { tag: "info" as TagType, color: "#909399" };
      items.push({
        id: m.key,
        name: m.name,
        kind: "module",
        kindLabel: kindLabelMap.module,
        status,
        statusLabel: STATUS_LABEL.module[status] ?? status,
        tagType: meta.tag,
        color: meta.color,
        dates: `${fmtDate(m.start_date)} → ${fmtDate(m.due_date)}`,
        sortDate: m.start_date ?? "",
        startDate: m.start_date ?? "",
        endDate: m.due_date ?? "",
        detail: m.description,
        lead: m.lead,
        link: `/module/${m.key}`,
        ...progressOf(m.issue_keys ?? [], issueStatus)
      });
    });

    releaseStore.releases.forEach(r => {
      const date = r.release_date ?? r.target_date;
      if (dateTarget && date && date < dateTarget) return;
      const status = r.status ?? "planned";
      const meta = STATUS_META.release[status] ?? { tag: "info" as TagType, color: "#909399" };
      items.push({
        id: r.key,
        name: r.name,
        kind: "release",
        kindLabel: kindLabelMap.release,
        status,
        statusLabel: STATUS_LABEL.release[status] ?? status,
        tagType: meta.tag,
        color: meta.color,
        dates: fmtDate(date),
        sortDate: date ?? "",
        startDate: date ?? "",
        endDate: date ?? "",
        detail: r.notes,
        link: `/release/${r.key}`,
        ...progressOf(r.issue_keys ?? [], issueStatus)
      });
    });

    allItems.value = items;
    columns.value = filteredColumns.value;
  } finally {
    loading.value = false;
  }
}

watch(filteredColumns, v => { columns.value = v; });

function goTo(link: string) { router.push(link); }
function goProject(key: string) { if (key) router.push(`/project/${key}`); }
function clearFilters() {
  search.value = "";
  projectFilter.value = "";
  kindFilter.value = new Set();
  filterDate.value = null;
  loadData();
}

const descDialogRef = ref<{ openFile: (opts: { path: string; title?: string; content: string; onSave: (content: string) => Promise<void> }) => void } | null>(null);
async function openPreview(item: RoadmapItem) {
  const date = (item.startDate || "").slice(0, 10);
  const filePath = `roadmap/${item.kind}/${item.id}.md`;
  let content = item.detail || "";
  try {
    const res = await readKnowledgeFile(filePath);
    content = res.content || content;
  } catch { /* use item.detail as fallback */ }
  descDialogRef.value?.openFile({
    path: filePath,
    title: item.name,
    content,
    onSave: async (newContent: string) => {
      await writeKnowledgeFile(filePath, newContent, {
        title: item.name,
        type: "roadmap-item",
        status: item.statusLabel,
        kind: item.kind,
        created: date
      });
    }
  });
}

const contextMenu = reactive<{
  visible: boolean;
  x: number;
  y: number;
  item: RoadmapItem | null;
}>({ visible: false, x: 0, y: 0, item: null });

function openContextMenu(e: MouseEvent, item: RoadmapItem) {
  contextMenu.x = Math.min(e.clientX, window.innerWidth - 200);
  contextMenu.y = Math.min(e.clientY, window.innerHeight - 320);
  contextMenu.item = item;
  contextMenu.visible = true;
}

function closeContextMenu() {
  contextMenu.visible = false;
  contextMenu.item = null;
}

function ctxOpen() {
  const item = contextMenu.item;
  closeContextMenu();
  if (item) goTo(item.link);
}

function ctxPreview() {
  const item = contextMenu.item;
  closeContextMenu();
  if (item) openPreview(item);
}

async function ctxCopyId() {
  const item = contextMenu.item;
  closeContextMenu();
  if (!item) return;
  try {
    await navigator.clipboard.writeText(item.id);
    ElMessage.success(t("roadmap.messages.copied", { id: item.id }));
  } catch {
    ElMessage.error(t("roadmap.messages.copyFailed"));
  }
}

type RoadmapStatus = CycleStatus | ModuleStatus | ReleaseStatus;

async function ctxQuickStatus(status: RoadmapStatus) {
  const item = contextMenu.item;
  closeContextMenu();
  if (!item) return;
  try {
    let statusLabel: string = status as string;
    if (item.kind === "cycle") {
      await cycleStore.editCycle(item.id, { status: status as CycleStatus });
      statusLabel = CYCLE_STATUS_MAP[status as CycleStatus] || status;
    } else if (item.kind === "module") {
      await moduleStore.editModule(item.id, { status: status as ModuleStatus });
      statusLabel = MODULE_STATUS_MAP[status as ModuleStatus] || status;
    } else if (item.kind === "release") {
      await releaseStore.editRelease(item.id, { status: status as ReleaseStatus });
      statusLabel = RELEASE_STATUS_MAP[status as ReleaseStatus] || status;
    }
    ElMessage.success(t("roadmap.messages.statusChanged", { name: item.name, status: statusLabel }));
    loadData();
  } catch {
    loadData();
  }
}

async function ctxDelete() {
  const item = contextMenu.item;
  closeContextMenu();
  if (!item) return;
  try {
    await ElMessageBox.confirm(
      t("roadmap.confirm.deleteMessage", { kindLabel: item.kindLabel, name: item.name }),
      t("roadmap.confirm.deleteTitle"),
      { type: "warning" }
    );
    const projectKey = item.id.split("-")[0];
    if (item.kind === "cycle") {
      await cycleStore.removeCycle(item.id, projectKey);
    } else if (item.kind === "module") {
      await moduleStore.removeModule(item.id, projectKey);
    } else if (item.kind === "release") {
      await releaseStore.removeRelease(item.id, projectKey);
    }
    ElMessage.success(t("roadmap.messages.deleted", { name: item.name }));
    loadData();
  } catch { /* cancelled */ }
}

onMounted(async () => {
  await projectStore.fetchProjects({ pageSize: 100 });
  await loadData();
  document.addEventListener("click", closeContextMenu);
});

onUnmounted(() => {
  document.removeEventListener("click", closeContextMenu);
  if (searchTimer) clearTimeout(searchTimer);
});

watch(filterDateStr, () => { loadData(); });
</script>

<style scoped lang="scss">
.roadmap {
  padding: 20px 24px;
  height: calc(100vh - 136px);
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
  overflow: hidden;
}

// ── Head ──
.roadmap__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-shrink: 0;
  gap: 16px;
}

.roadmap__head-left {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.roadmap__head-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 4px 12px;
  cursor: default;
  transition: background 0.15s;
  position: relative;

  &:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 15%;
    height: 70%;
    width: 1px;
    background: var(--el-border-color-lighter);
  }

  &:first-child {
    cursor: pointer;
    &:hover .roadmap__head-stat-value { color: var(--el-color-primary); }
  }
}

.roadmap__head-stat-value {
  font-size: 16px;
  font-weight: 800;
  font-family: "SF Mono", "Fira Code", monospace;
  line-height: 1;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;

  &.is-cycle { color: #409eff; }
  &.is-module { color: #9b59b6; }
  &.is-release { color: #20c997; }
  &.is-done { color: var(--el-color-success); }
}

.roadmap__head-stat-label {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.roadmap__head-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

// ── Filters ──
.roadmap__filters {
  margin-bottom: 8px;
  flex-shrink: 0;
}

.roadmap__filter-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.roadmap__filter-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  min-width: 32px;
}

// ── Stats bar ──
.roadmap__stats {
  display: flex;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 12px;
  flex-shrink: 0;
  background: var(--el-fill-color);
}

.roadmap__stat-segment {
  transition: width 0.4s ease;
  min-width: 0;
}

// ── Board ──
.roadmap__board {
  flex: 1;
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 8px;
  align-items: stretch;

  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 3px;
    &:hover { background: var(--el-border-color-dark); }
  }
}

// ── Columns ──
.roadmap__col {
  flex: 1;
  min-width: 270px;
  display: flex;
  flex-direction: column;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  max-height: 100%;
  border: 1px solid var(--el-border-color-lighter);
}

.roadmap__col-head {
  padding: 10px 14px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.roadmap__col-head-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.roadmap__col-head-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.roadmap__col-title {
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  &:hover { color: var(--el-color-primary); }
}

.roadmap__col-progress {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
  :deep(.el-progress) { flex: 1; max-width: 200px; }
  span {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }
}

.roadmap__col-body {
  flex: 1;
  padding: 8px 10px;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 2px;
  }
}

.roadmap__col-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
  padding: 24px;
  min-height: 80px;
}

// ── Items (kanban cards) ──
.roadmap__item {
  position: relative;
  background: var(--el-bg-color);
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.12s;
  border: 1px solid var(--el-border-color-lighter);

  &:hover {
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.09);
    border-color: var(--el-border-color);
    transform: translateY(-1px);
  }

  &:active { transform: translateY(0); }

  &--overdue {
    border-color: var(--el-color-danger-light-4);
    box-shadow: 0 0 0 1px var(--el-color-danger-light-6);
  }
}

.roadmap__item-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 6px 0 0 6px;
}

// Row 1: key + kind + status
.roadmap__item-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}

.roadmap__item-key {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-family: monospace;
  background: var(--el-fill-color-light);
  padding: 1px 5px;
  border-radius: 3px;
}

.roadmap__item-kind {
  font-size: 10px;
  font-weight: 600;
  padding: 0 6px;
  border-radius: 8px;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  line-height: 1.7;
  &--cycle { color: #409eff; background: rgba(64, 158, 255, 0.12); }
  &--module { color: #9b59b6; background: rgba(155, 89, 182, 0.12); }
  &--release { color: #20c997; background: rgba(32, 201, 151, 0.12); }
}

.roadmap__item-status {
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

// Row 2: title
.roadmap__item-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--el-text-color-primary);
  cursor: pointer;
  padding: 1px 4px;
  margin-left: -4px;
  margin-right: -4px;
  border-radius: 3px;
  transition: background 0.12s, color 0.12s;

  &:hover {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

// Row 3: compact footer
.roadmap__item-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.roadmap__item-foot-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;

  .el-icon { font-size: 11px; flex-shrink: 0; }

  :deep(.el-progress) {
    width: 40px;
    flex-shrink: 0;
  }

  &--overdue {
    color: var(--el-color-danger);
    font-weight: 600;
  }
}

// Row 4: detail
.roadmap__item-detail {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Issue list
.roadmap__item-issues {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.roadmap__item-issue-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 4px;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.12s;
  margin-left: -4px;
  margin-right: -4px;

  &:hover { background: var(--el-fill-color-light); }
}

.roadmap__item-issue-key {
  font-size: 10px;
  font-family: monospace;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
  padding: 0 4px;
  border-radius: 2px;
  flex-shrink: 0;
}

.roadmap__item-issue-title {
  font-size: 11px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ── Context Menu ──
.roadmap-ctxmenu {
  position: fixed;
  z-index: 9999;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
  min-width: 180px;
}

.roadmap-ctxmenu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  color: var(--el-text-color-primary);

  .el-icon { font-size: 14px; color: var(--el-text-color-secondary); }

  &:hover { background: var(--el-fill-color-light); }

  &--danger {
    color: var(--el-color-danger);
    .el-icon { color: var(--el-color-danger); }
    &:hover { background: var(--el-color-danger-light-9); }
  }
}

.roadmap-ctxmenu__divider {
  height: 1px;
  background: var(--el-border-color-lighter);
  margin: 4px 8px;
}
</style>
