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
import { ArrowRight, Folder, Box, Tickets, WarningFilled, Grid } from "@element-plus/icons-vue";
import { getProjectList } from "@/api/modules/projectService";

export interface BreadcrumbSegment {
  key: string;
  label: string;
  link?: string;
  icon?: any;
  clickable: boolean;
}

const props = defineProps<{
  projectKey?: string;
  currentLabel: string;
  currentIcon?: any;
  currentLink?: string;
}>();

interface EntityInfo {
  key: string;
  name: string;
}

const project = ref<EntityInfo | null>(null);

const ICONS: Record<string, any> = {
  project: Folder,
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


function loadAll() {
  if (props.projectKey) fetchProject(props.projectKey);
  }

loadAll();

watch(
  () => [props.projectKey],
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
