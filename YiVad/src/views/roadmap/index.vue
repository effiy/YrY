<template>
  <div class="roadmap">
    <div class="roadmap__head">
      <h1 class="roadmap__title">Roadmap</h1>
      <el-select v-model="projectFilter" placeholder="Filter by project" clearable style="width: 200px" @change="loadData">
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
            <div class="roadmap__item-name">{{ item.name }}</div>
            <div class="roadmap__item-meta">
              <el-tag :type="item.tagType" size="small" effect="plain">{{ item.status }}</el-tag>
              <span class="roadmap__item-dates">{{ item.start }} → {{ item.end }}</span>
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
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCycleStore } from "@/stores/modules/cycle";
import { useModuleStore } from "@/stores/modules/module";
import { useProjectStore } from "@/stores/modules/project";
import type { Cycle } from "@/api/modules/cycleService";
import type { Module } from "@/api/modules/moduleService";

const router = useRouter();
const cycleStore = useCycleStore();
const moduleStore = useModuleStore();
const projectStore = useProjectStore();

const loading = ref(false);
const projectFilter = ref("");
const projects = ref<{ key: string; name: string }[]>([]);

interface RoadmapItem {
  id: string;
  name: string;
  status: string;
  tagType: "success" | "warning" | "info" | "primary" | "danger";
  color: string;
  start: string;
  end: string;
  detail?: string;
  link: string;
}

interface RoadmapGroup {
  project: string;
  items: RoadmapItem[];
}

const groups = ref<RoadmapGroup[]>([]);

async function loadData() {
  loading.value = true;
  try {
    const params: any = { pageSize: 200 };
    if (projectFilter.value) params.project_key = projectFilter.value;

    await Promise.all([
      cycleStore.fetchCycles(params),
      moduleStore.fetchModules(params)
    ]);

    const cycles = cycleStore.cycles;
    const modules = moduleStore.modules;

    const projectMap: Record<string, RoadmapItem[]> = {};

    cycles.forEach(c => {
      if (!projectMap[c.project_key]) projectMap[c.project_key] = [];
      projectMap[c.project_key].push({
        id: c.key, name: c.name, status: c.status,
        tagType: c.status === "active" ? "primary" : c.status === "completed" ? "success" : "info",
        color: c.status === "active" ? "#409eff" : c.status === "completed" ? "#67c23a" : "#909399",
        start: fmtDate(c.start_date), end: fmtDate(c.end_date),
        detail: c.goal, link: `/cycle/${c.key}`
      });
    });

    modules.forEach(m => {
      if (!projectMap[m.project_key]) projectMap[m.project_key] = [];
      projectMap[m.project_key].push({
        id: m.key, name: m.name, status: m.status,
        tagType: m.status === "in_progress" ? "primary" : m.status === "completed" ? "success" : "info",
        color: m.status === "in_progress" ? "#e6a23c" : m.status === "completed" ? "#67c23a" : "#9b59b6",
        start: fmtDate(m.start_date), end: fmtDate(m.due_date),
        detail: m.description, link: `/module/${m.key}`
      });
    });

    groups.value = Object.entries(projectMap).map(([project, items]) => {
      items.sort((a, b) => a.start.localeCompare(b.start));
      return { project, items };
    });
  } finally { loading.value = false; }
}

function fmtDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function goTo(link: string) { router.push(link); }

onMounted(async () => {
  await projectStore.fetchProjects({ pageSize: 100 });
  projects.value = projectStore.projects.map(p => ({ key: p.key, name: p.name }));
  loadData();
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
.roadmap__item-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
}
.roadmap__item-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}
.roadmap__item-dates {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
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