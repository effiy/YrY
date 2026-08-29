<template>
  <nav v-if="segments.length > 1" class="eb" aria-label="Breadcrumb">
    <template v-for="(seg, i) in segments" :key="seg.key">
      <component
        :is="seg.clickable ? 'router-link' : 'span'"
        :to="seg.clickable ? seg.link : undefined"
        class="eb__seg"
        :class="{ 'eb__seg--link': seg.clickable, 'eb__seg--current': i === segments.length - 1 }"
      >
        <el-icon v-if="seg.icon" class="eb__icon"><component :is="seg.icon" /></el-icon>
        <span class="eb__label">{{ seg.label }}</span>
      </component>
      <el-icon v-if="i < segments.length - 1" class="eb__sep"><ArrowRight /></el-icon>
    </template>
  </nav>
</template>

<script setup lang="ts" name="EntityBreadcrumb">
import { computed, ref, watch } from "vue";
import { ArrowRight, Folder, Calendar, Box, Tickets, WarningFilled, Grid } from "@element-plus/icons-vue";
import { getProjectList } from "@/api/modules/projectService";
import { getCycleList } from "@/api/modules/cycleService";
import { getReleaseList } from "@/api/modules/releaseService";

export interface BreadcrumbSegment {
  key: string;
  label: string;
  link?: string;
  icon?: any;
  clickable: boolean;
}

const props = defineProps<{
  projectKey?: string;
  cycleKey?: string;
  releaseKey?: string;
  currentLabel: string;
  currentIcon?: any;
  currentLink?: string;
}>();

interface EntityInfo {
  key: string;
  name: string;
}

const project = ref<EntityInfo | null>(null);
const cycle = ref<EntityInfo | null>(null);
const release = ref<EntityInfo | null>(null);

const ICONS: Record<string, any> = {
  project: Folder,
  cycle: Calendar,
  release: Box,
  issue: Tickets,
  bug: WarningFilled,
  module: Grid,
};

async function fetchProject(key: string) {
  if (!key) return;
  try {
    const res = await getProjectList({ pageSize: 500 });
    const projects = (res.data?.list as any[]) ?? [];
    const found = projects.find((p: any) => p.key === key);
    if (found) project.value = { key, name: found.name };
  } catch { /* ignore */ }
}

async function fetchCycle(key: string) {
  if (!key) return;
  try {
    const res = await getCycleList({ pageSize: 500 });
    const cycles = (res.data?.list as any[]) ?? [];
    const found = cycles.find((c: any) => c.key === key);
    if (found) cycle.value = { key, name: found.name };
  } catch { /* ignore */ }
}

async function fetchRelease(key: string) {
  if (!key) return;
  try {
    const res = await getReleaseList({ pageSize: 500 });
    const releases = (res.data?.list as any[]) ?? [];
    const found = releases.find((r: any) => r.key === key);
    if (found) release.value = { key, name: found.name };
  } catch { /* ignore */ }
}

function loadAll() {
  if (props.projectKey) fetchProject(props.projectKey);
  if (props.cycleKey) fetchCycle(props.cycleKey);
  if (props.releaseKey) fetchRelease(props.releaseKey);
}

loadAll();

watch(
  () => [props.projectKey, props.cycleKey, props.releaseKey],
  () => loadAll()
);

const segments = computed<BreadcrumbSegment[]>(() => {
  const result: BreadcrumbSegment[] = [];

  if (project.value) {
    result.push({
      key: project.value.key,
      label: project.value.name,
      link: `/project/${project.value.key}`,
      icon: ICONS.project,
      clickable: true,
    });
  }

  if (cycle.value) {
    result.push({
      key: cycle.value.key,
      label: cycle.value.name,
      link: `/cycle/${cycle.value.key}`,
      icon: ICONS.cycle,
      clickable: true,
    });
  }

  if (release.value) {
    result.push({
      key: release.value.key,
      label: release.value.name,
      link: `/release/${release.value.key}`,
      icon: ICONS.release,
      clickable: true,
    });
  }

  result.push({
    key: "current",
    label: props.currentLabel,
    link: props.currentLink,
    icon: props.currentIcon,
    clickable: !!props.currentLink,
  });

  return result;
});
</script>

<style scoped lang="scss">
.eb {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  padding: 10px 16px;
  margin-bottom: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  font-size: 13px;
}

.eb__seg {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 6px;
  color: var(--el-text-color-secondary);
  text-decoration: none;
  transition: background 0.12s, color 0.12s;

  &--link {
    cursor: pointer;
    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }
  }

  &--current {
    color: var(--el-text-color-primary);
    font-weight: 600;
  }
}

.eb__icon {
  font-size: 14px;
  flex-shrink: 0;
}

.eb__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.eb__sep {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}
</style>