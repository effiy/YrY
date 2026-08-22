<template>
  <div class="roadmap">
    <div class="roadmap__head">
      <div class="roadmap__head-left">
        <h1 class="roadmap__title">Roadmap</h1>
        <el-tag size="small" type="info" round>{{ totalItems }} items</el-tag>
      </div>
      <el-select v-model="projectFilter" placeholder="All projects" clearable style="width: 200px" @change="loadData">
        <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
      </el-select>
    </div>

    <div v-loading="loading" class="roadmap__body">
      <div v-for="group in groups" :key="group.project" class="roadmap__group">
        <div class="roadmap__group-head">
          <span class="roadmap__group-name">{{ group.project }}</span>
          <span class="roadmap__group-count">{{ group.items.length }} items</span>
        </div>
        <div class="roadmap__timeline">
          <div
            v-for="item in group.items"
            :key="item.id"
            class="roadmap__item"
            :style="{ borderLeftColor: item.color }"
            @click="goTo(item.link)"
          >
            <div class="roadmap__item-head">
              <span class="roadmap__item-kind" :class="`roadmap__item-kind--${item.kind}`">{{ item.kindLabel }}</span>
              <span class="roadmap__item-name">{{ item.name }}</span>
              <el-tag :type="item.tagType" size="small" effect="plain">{{ item.statusLabel }}</el-tag>
            </div>
            <div class="roadmap__item-dates">{{ item.dates }}</div>
            <div v-if="item.total > 0" class="roadmap__item-progress">
              <el-progress :percentage="pct(item)" :stroke-width="6" :show-text="false" />
              <span class="roadmap__item-progress-text">{{ item.done }}/{{ item.total }} done</span>
            </div>
            <div v-if="item.detail" class="roadmap__item-detail">{{ item.detail }}</div>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && !groups.length" description="No roadmap items" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts" name="roadmapView">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCycleStore } from "@/stores/modules/cycle";
import { useModuleStore } from "@/stores/modules/module";
import { useReleaseStore } from "@/stores/modules/release";
import { useProjectStore } from "@/stores/modules/project";
import { useIssueStore } from "@/stores/modules/issue";
import { CYCLE_STATUS_MAP } from "@/api/modules/cycleService";
import { MODULE_STATUS_MAP } from "@/api/modules/moduleService";
import { RELEASE_STATUS_MAP } from "@/api/modules/releaseService";

const router = useRouter();
const cycleStore = useCycleStore();
const moduleStore = useModuleStore();
const releaseStore = useReleaseStore();
const projectStore = useProjectStore();
const issueStore = useIssueStore();

const loading = ref(false);
const projectFilter = ref("");

type TagType = "success" | "warning" | "info" | "primary" | "danger";
type RoadmapKind = "cycle" | "module" | "release";

interface RoadmapItem {
  id: string;
  name: string;
  kind: RoadmapKind;
  kindLabel: string;
  statusLabel: string;
  tagType: TagType;
  color: string;
  dates: string;
  sortDate: string;
  detail?: string;
  link: string;
  done: number;
  total: number;
}

interface RoadmapGroup {
  project: string;
  items: RoadmapItem[];
}

const KIND_LABEL: Record<RoadmapKind, string> = {
  cycle: "Sprint",
  module: "Epic",
  release: "Milestone"
};

// status → tag + accent color, per item kind (drives the left border + status tag)
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

const STATUS_LABEL: Record<RoadmapKind, Record<string, string>> = {
  cycle: CYCLE_STATUS_MAP,
  module: MODULE_STATUS_MAP,
  release: RELEASE_STATUS_MAP
};

const groups = ref<RoadmapGroup[]>([]);

const projects = computed(() => projectStore.projects.map(p => ({ key: p.key, name: p.name })));
const projectNames = computed(() => new Map(projectStore.projects.map(p => [p.key, p.name])));
const totalItems = computed(() => groups.value.reduce((sum, g) => sum + g.items.length, 0));

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function pct(item: RoadmapItem) {
  return item.total ? Math.round((item.done / item.total) * 100) : 0;
}

/** Issue completion progress for a set of issue keys (cancelled issues excluded from the denominator). */
function progressOf(keys: string[], issueStatus: Map<string, string>) {
  let done = 0;
  let total = 0;
  for (const key of keys) {
    const status = issueStatus.get(key);
    if (status === undefined || status === "cancelled") continue;
    total++;
    if (status === "done") done++;
  }
  return { done, total };
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

    const byProject: Record<string, RoadmapItem[]> = {};
    const push = (projectKey: string, item: RoadmapItem) => {
      (byProject[projectKey] ??= []).push(item);
    };

    cycleStore.cycles.forEach(c => {
      const meta = STATUS_META.cycle[c.status] ?? { tag: "info" as TagType, color: "#909399" };
      push(c.project_key, {
        id: c.key,
        name: c.name,
        kind: "cycle",
        kindLabel: KIND_LABEL.cycle,
        statusLabel: STATUS_LABEL.cycle[c.status] ?? c.status,
        tagType: meta.tag,
        color: meta.color,
        dates: `${fmtDate(c.start_date)} → ${fmtDate(c.end_date)}`,
        sortDate: c.start_date ?? "",
        detail: c.goal,
        link: `/cycle/${c.key}`,
        ...progressOf(c.issue_keys ?? [], issueStatus)
      });
    });

    moduleStore.modules.forEach(m => {
      const meta = STATUS_META.module[m.status] ?? { tag: "info" as TagType, color: "#909399" };
      push(m.project_key, {
        id: m.key,
        name: m.name,
        kind: "module",
        kindLabel: KIND_LABEL.module,
        statusLabel: STATUS_LABEL.module[m.status] ?? m.status,
        tagType: meta.tag,
        color: meta.color,
        dates: `${fmtDate(m.start_date)} → ${fmtDate(m.due_date)}`,
        sortDate: m.start_date ?? "",
        detail: m.description,
        link: `/module/${m.key}`,
        ...progressOf(m.issue_keys ?? [], issueStatus)
      });
    });

    releaseStore.releases.forEach(r => {
      const meta = STATUS_META.release[r.status] ?? { tag: "info" as TagType, color: "#909399" };
      const date = r.release_date ?? r.target_date;
      push(r.project_key, {
        id: r.key,
        name: r.name,
        kind: "release",
        kindLabel: KIND_LABEL.release,
        statusLabel: STATUS_LABEL.release[r.status] ?? r.status,
        tagType: meta.tag,
        color: meta.color,
        dates: fmtDate(date),
        sortDate: date ?? "",
        detail: r.notes,
        link: `/release/${r.key}`,
        ...progressOf(r.issue_keys ?? [], issueStatus)
      });
    });

    groups.value = Object.entries(byProject)
      .map(([projectKey, items]) => ({
        project: projectNames.value.get(projectKey) ?? projectKey,
        items: items.sort((a, b) => a.sortDate.localeCompare(b.sortDate))
      }))
      .sort((a, b) => a.project.localeCompare(b.project));
  } finally {
    loading.value = false;
  }
}

function goTo(link: string) {
  router.push(link);
}

onMounted(async () => {
  await projectStore.fetchProjects({ pageSize: 100 });
  await loadData();
});
</script>

<style scoped lang="scss">
.roadmap {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.roadmap__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.roadmap__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.roadmap__title { margin: 0; font-size: 20px; font-weight: 600; }
.roadmap__group {
  margin-bottom: 28px;
}
.roadmap__group-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.roadmap__group-name {
  font-size: 16px;
  font-weight: 600;
}
.roadmap__group-count {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.roadmap__timeline {
  position: relative;
  padding-left: 20px;
  border-left: 2px solid var(--el-border-color);
}
.roadmap__item {
  padding: 12px 16px;
  margin-bottom: 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-left: 4px solid;
  border-radius: 8px;
  cursor: pointer;
  &:hover { background: var(--el-fill-color-light); }
}
.roadmap__item-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.roadmap__item-kind {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 10px;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  &--cycle { color: #409eff; background: rgba(64, 158, 255, 0.12); }
  &--module { color: #9b59b6; background: rgba(155, 89, 182, 0.12); }
  &--release { color: #20c997; background: rgba(32, 201, 151, 0.12); }
}
.roadmap__item-name {
  font-size: 14px;
  font-weight: 600;
}
.roadmap__item-dates {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 4px;
}
.roadmap__item-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
  max-width: 320px;
}
.roadmap__item-progress-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.roadmap__item-detail {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
