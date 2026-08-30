<template>
  <div class="issue-list__sidebar">
    <div class="issue-list__sidebar-view">
      <el-radio-group v-model="localViewMode" size="small">
        <el-radio-button value="table"><el-icon><Grid /></el-icon></el-radio-button>
        <el-radio-button value="card"><el-icon><Postcard /></el-icon></el-radio-button>
        <el-radio-button value="list"><el-icon><List /></el-icon></el-radio-button>
      </el-radio-group>
    </div>
    <div class="issue-list__sidebar-section">
      <div class="issue-list__sidebar-section-header">
        <span class="issue-list__sidebar-section-label">Sources</span>
        <span class="issue-list__sidebar-section-hint">{{ sources.length }}</span>
      </div>
      <div class="issue-list__sidebar-section-body issue-list__sidebar-list">
        <div
          v-for="s in sources"
          :key="s.name"
          class="issue-list__sidebar-list-item"
          :class="{ 'is-active': isSourceActive(s.name) }"
          @click="toggleSource(s.name)"
        >
          <span class="issue-list__sidebar-list-dot" :style="{ background: sourceColor(s.name) }" />
          <span class="issue-list__sidebar-list-label">{{ s.name }}</span>
          <span class="issue-list__sidebar-list-count">{{ s.count }}</span>
        </div>
        <div
          v-if="sourceFilter.length"
          class="issue-list__sidebar-list-clear"
          @click="clearSourceFilter"
        >
          Clear selection
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="RssSidebar">
import { computed, watch } from "vue";
import { Grid, Postcard, List } from "@element-plus/icons-vue";
import type { RssSourceStats } from "@/api/interface/yiweb";

type ViewMode = "table" | "card" | "list";

interface Props {
  viewMode: ViewMode;
  sources: RssSourceStats[];
  sourceFilter: string[];
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: "table",
  sources: () => [],
  sourceFilter: () => []
});

const emit = defineEmits<{
  (e: "update:viewMode", v: ViewMode): void;
  (e: "toggle-source", name: string): void;
  (e: "clear-source-filter"): void;
}>();

const localViewMode = computed({
  get: () => props.viewMode,
  set: (v: ViewMode) => emit("update:viewMode", v)
});

const SOURCE_PALETTE = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc", "#5ab1ef"];

const sourceColorMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  props.sources.forEach((s, i) => {
    map[s.name] = SOURCE_PALETTE[i % SOURCE_PALETTE.length];
  });
  return map;
});

function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return SOURCE_PALETTE[h % SOURCE_PALETTE.length];
}

function sourceColor(name: string): string {
  return sourceColorMap.value[name] ?? hashColor(name || "unknown");
}

function isSourceActive(name: string): boolean {
  return props.sourceFilter.indexOf(name) >= 0;
}

function toggleSource(name: string) {
  emit("toggle-source", name);
}

function clearSourceFilter() {
  emit("clear-source-filter");
}
</script>

<style scoped lang="scss">
.issue-list__sidebar {
  width: 240px;
  flex-shrink: 0;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  max-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.issue-list__sidebar-view {
  padding: 4px 4px 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) { display: flex; width: 100%; }
  :deep(.el-radio-button) { flex: 1; }
  :deep(.el-radio-button__inner) { width: 100%; text-align: center; padding: 4px 0; font-size: 12px; }
}

.issue-list__sidebar-section {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.issue-list__sidebar-section-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-left: 2px solid var(--el-color-primary);
  padding-left: 10px;
}

.issue-list__sidebar-section-label {
  flex: 1;
}

.issue-list__sidebar-section-hint {
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  text-transform: none;
  letter-spacing: 0;
}

.issue-list__sidebar-section-body {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-height: 0;
}

.issue-list__sidebar-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.issue-list__sidebar-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  border: 1px solid transparent;
  &:hover {
    background: var(--el-fill-color-light);
  }
  &.is-active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    .issue-list__sidebar-list-count {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-8);
    }
  }
}

.issue-list__sidebar-list-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.issue-list__sidebar-list-label {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue-list__sidebar-list-count {
  font-size: 11px;
  font-weight: 600;
  font-family: DIN, sans-serif;
  color: var(--el-text-color-secondary);
  padding: 0 6px;
  line-height: 16px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  flex-shrink: 0;
}

.issue-list__sidebar-list-clear {
  font-size: 11px;
  color: var(--el-color-primary);
  text-align: center;
  padding: 6px 0;
  cursor: pointer;
  margin-top: 4px;
  border-top: 1px dashed var(--el-border-color-lighter);
  &:hover {
    text-decoration: underline;
  }
}
</style>
