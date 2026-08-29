<template>
  <div class="activity">
    <div class="activity__head">
      <div class="activity__head-left">
        <h1 class="activity__title">Activity</h1>
        <el-tag size="small" type="info">{{ activities.length }} events</el-tag>
      </div>
      <div class="activity__head-right">
        <el-select v-model="projectFilter" placeholder="Filter by project" clearable style="width: 180px" @change="loadData">
          <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
        </el-select>
        <el-select v-model="typeFilter" placeholder="Event type" clearable style="width: 140px">
          <el-option label="All" value="" />
          <el-option label="Issues" value="issue" />
          <el-option label="Cycles" value="cycle" />
          <el-option label="Comments" value="comment" />
          <el-option label="Modules" value="module" />
        </el-select>
        <el-button :icon="Refresh" @click="loadData">Refresh</el-button>
      </div>
    </div>

    <div class="activity__summary">
      <div class="activity-summary__tile activity-summary__tile--total">
        <span class="activity-summary__value">{{ activities.length }}</span>
        <span class="activity-summary__label">Total Events</span>
        <span class="activity-summary__sub">across all projects</span>
      </div>
      <div class="activity-summary__tile activity-summary__tile--issue">
        <span class="activity-summary__value">{{ typeCounts.issue }}</span>
        <span class="activity-summary__label">Issues</span>
        <span class="activity-summary__sub">created / updated</span>
      </div>
      <div class="activity-summary__tile activity-summary__tile--cycle">
        <span class="activity-summary__value">{{ typeCounts.cycle }}</span>
        <span class="activity-summary__label">Cycles</span>
        <span class="activity-summary__sub">sprints</span>
      </div>
      <div class="activity-summary__tile activity-summary__tile--module">
        <span class="activity-summary__value">{{ typeCounts.module }}</span>
        <span class="activity-summary__label">Modules</span>
        <span class="activity-summary__sub">epics</span>
      </div>
      <div class="activity-summary__tile activity-summary__tile--release">
        <span class="activity-summary__value">{{ typeCounts.release }}</span>
        <span class="activity-summary__label">Releases</span>
        <span class="activity-summary__sub">milestones</span>
      </div>
    </div>

    <div v-loading="loading" class="activity__feed">
      <div v-for="event in filteredActivities" :key="event.id" class="activity__event" @click="goTo(event)">
        <div class="activity__event-icon" :style="{ background: eventIconColor(event.type) }">
          <el-icon :size="14"><component :is="eventIcon(event.type)" /></el-icon>
        </div>
        <div class="activity__event-content">
          <div class="activity__event-title">
            <span class="activity__event-action">{{ event.action }}</span>
            <span class="activity__event-target">{{ event.target }}</span>
          </div>
          <div class="activity__event-meta">
            <el-button link size="small" type="primary" @click.stop="goProject(event.projectKey)">{{ event.project }}</el-button>
            <span>{{ event.type }}</span>
            <span>{{ formatTime(event.time) }}</span>
          </div>
          <div v-if="event.detail" class="activity__event-detail">{{ event.detail }}</div>
        </div>
      </div>

      <el-empty v-if="!loading && !filteredActivities.length" description="No activity yet" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts" name="activityFeed">
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Refresh, Tickets, Calendar, ChatDotRound, Collection } from "@element-plus/icons-vue";
import { getIssueList } from "@/api/modules/issueService";
import { getCycleList } from "@/api/modules/cycleService";
import { getModuleList } from "@/api/modules/moduleService";
import { getReleaseList } from "@/api/modules/releaseService";
import { useProjectStore } from "@/stores/modules/project";
import { formatRelativeTime } from "@/utils/datetime";
import type { Issue } from "@/api/modules/issueService";
import type { Cycle } from "@/api/modules/cycleService";
import type { Module } from "@/api/modules/moduleService";
import type { Release } from "@/api/modules/releaseService";

const router = useRouter();
const projectStore = useProjectStore();

const loading = ref(false);
const projectFilter = ref("");
const typeFilter = ref("");
const projects = ref<{ key: string; name: string }[]>([]);

type EventType = "issue" | "cycle" | "comment" | "module" | "release";

interface ActivityEvent {
  id: string;
  type: EventType;
  action: string;
  target: string;
  detail?: string;
  project: string;
  projectKey: string;
  time: string;
  link: string;
}

const activities = ref<ActivityEvent[]>([]);

const filteredActivities = computed(() => {
  let list = activities.value;
  if (projectFilter.value) list = list.filter(e => e.project === projectFilter.value);
  if (typeFilter.value) list = list.filter(e => e.type === typeFilter.value);
  return list.slice(0, 100);
});

const typeCounts = computed(() => {
  const counts: Record<EventType, number> = { issue: 0, cycle: 0, comment: 0, module: 0, release: 0 };
  activities.value.forEach(e => { counts[e.type]++; });
  return counts;
});

async function loadData() {
  loading.value = true;
  try {
    const params: any = { pageSize: 200 };
    if (projectFilter.value) params.project_key = projectFilter.value;

    const [issueRes, cycleRes, moduleRes, releaseRes] = await Promise.all([
      getIssueList(params).catch(() => ({ data: { list: [] } })),
      getCycleList(params).catch(() => ({ data: { list: [] } })),
      getModuleList(params).catch(() => ({ data: { list: [] } })),
      getReleaseList(params).catch(() => ({ data: { list: [] } }))
    ]);

    const issues = (issueRes.data?.list as Issue[]) ?? [];
    const cycles = (cycleRes.data?.list as Cycle[]) ?? [];
    const modules = (moduleRes.data?.list as Module[]) ?? [];
    const releases = (releaseRes.data?.list as Release[]) ?? [];

    const events: ActivityEvent[] = [];

    issues.forEach(i => {
      events.push({
        id: i.key,
        type: "issue",
        action: i.status === "done" ? "Completed" : i.status === "in_progress" ? "Started" : "Created",
        target: i.title,
        detail: `${i.priority} priority · ${i.issue_type}`,
        project: i.project_key,
        projectKey: i.project_key,
        time: i.updated_at,
        link: `/issue/${i.key}`
      });
    });

    cycles.forEach(c => {
      events.push({
        id: c.key,
        type: "cycle",
        action: c.status === "completed" ? "Completed" : c.status === "active" ? "Started" : "Created",
        target: c.name,
        detail: `${c.issue_keys?.length || 0} issues`,
        project: c.project_key,
        projectKey: c.project_key,
        time: c.updated_at,
        link: `/cycle/${c.key}`
      });
    });

    modules.forEach(m => {
      events.push({
        id: m.key,
        type: "module",
        action: m.status === "completed" ? "Completed" : m.status === "in_progress" ? "Started" : "Created",
        target: m.name,
        detail: `${m.issue_keys?.length || 0} issues`,
        project: m.project_key,
        projectKey: m.project_key,
        time: m.updated_at,
        link: `/module/${m.key}`
      });
    });

    releases.forEach(r => {
      events.push({
        id: r.key,
        type: "release",
        action: r.status === "released" ? "Released" : r.status === "in_progress" ? "Started" : "Planned",
        target: r.version,
        detail: r.name ? `${r.name} · ${r.issue_keys?.length || 0} issues` : `${r.issue_keys?.length || 0} issues`,
        project: r.project_key,
        projectKey: r.project_key,
        time: r.updated_at,
        link: `/release/${r.key}`
      });
    });

    events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    activities.value = events;
  } finally {
    loading.value = false;
  }
}

function goTo(event: ActivityEvent) {
  router.push(event.link);
}
function goProject(key: string) {
  if (key) router.push(`/project/${key}`);
}

function eventIcon(type: EventType) {
  const icons: Record<EventType, any> = { issue: Tickets, cycle: Calendar, comment: ChatDotRound, module: Collection, release: Tickets };
  return icons[type] || Tickets;
}

function eventIconColor(type: EventType) {
  const colors: Record<EventType, string> = { issue: "#409eff", cycle: "#e6a23c", comment: "#67c23a", module: "#9b59b6", release: "#67c23a" };
  return colors[type] || "#909399";
}

onMounted(async () => {
  await projectStore.fetchProjects({ pageSize: 100 });
  projects.value = projectStore.projects.map(p => ({ key: p.key, name: p.name }));
  loadData();
});

function formatTime(iso: string) { return formatRelativeTime(iso) || ""; }
</script>

<style scoped lang="scss">
.activity {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.activity__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.activity__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.activity__title { margin: 0; font-size: 20px; font-weight: 600; }
.activity__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.activity-summary__tile {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.activity-summary__value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
}
.activity-summary__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.activity-summary__sub {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.activity-summary__tile--total .activity-summary__value { color: var(--el-color-primary); }
.activity-summary__tile--issue .activity-summary__value { color: #409eff; }
.activity-summary__tile--cycle .activity-summary__value { color: #e6a23c; }
.activity-summary__tile--module .activity-summary__value { color: #9b59b6; }
.activity-summary__tile--release .activity-summary__value { color: #67c23a; }
.activity__head-right {
  display: flex;
  gap: 10px;
}
.activity__feed {
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.activity__event {
  display: flex;
  gap: 14px;
  padding: 12px 0;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-lighter);
  &:hover { background: var(--el-fill-color-lighter); margin: 0 -12px; padding: 12px; border-radius: 8px; }
}
.activity__event-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  margin-top: 2px;
}
.activity__event-content {
  flex: 1;
  min-width: 0;
}
.activity__event-title {
  margin-bottom: 4px;
  font-size: 14px;
}
.activity__event-action {
  font-weight: 600;
  margin-right: 6px;
}
.activity__event-target {
  color: var(--el-color-primary);
}
.activity__event-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  code {
    font-size: 11px;
    background: var(--el-fill-color);
    padding: 0 6px;
    border-radius: 3px;
  }
}
.activity__event-detail {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>