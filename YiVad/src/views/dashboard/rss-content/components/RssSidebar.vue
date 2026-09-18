<template>
  <div class="issue-list__sidebar">
    <div class="issue-list__sidebar-view">
      <el-radio-group v-model="localViewMode" size="small">
        <el-radio-button value="table"
          ><el-icon><Grid /></el-icon
        ></el-radio-button>
        <el-radio-button value="card"
          ><el-icon><Postcard /></el-icon
        ></el-radio-button>
        <el-radio-button value="list"
          ><el-icon><List /></el-icon
        ></el-radio-button>
      </el-radio-group>
    </div>
    <div class="issue-list__sidebar-section">
      <div class="issue-list__sidebar-section-header">
        <span class="issue-list__sidebar-section-label">Sources</span>
        <span class="issue-list__sidebar-section-hint">{{ filteredSources.length }}</span>
      </div>
      <div class="issue-list__sidebar-section-search">
        <el-input v-model="sourceSearch" size="small" placeholder="Filter sources..." clearable :prefix-icon="Search" />
      </div>
      <div class="issue-list__sidebar-actions">
        <el-button size="small" text @click="selectAll">All</el-button>
        <el-button size="small" text @click="deselectAll">None</el-button>
      </div>
      <div class="issue-list__sidebar-section-body issue-list__sidebar-list">
        <div
          v-for="s in filteredSources"
          :key="s.name"
          class="issue-list__sidebar-list-item"
          :class="{ 'is-active': isSourceActive(s.name) }"
          @click="toggleSource(s.name)"
        >
          <span class="issue-list__sidebar-list-dot" :style="dotStyle(s.name)" />
          <span class="issue-list__sidebar-list-label">{{ s.name }}</span>
          <span class="issue-list__sidebar-list-count">{{ s.count }}</span>
        </div>
        <div v-if="filteredSources.length === 0" class="issue-list__sidebar-list-empty">No sources match</div>
        <div v-if="sourceFilter.length" class="issue-list__sidebar-list-clear" @click="clearSourceFilter">Clear selection</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="RssSidebar">
import { ref, computed } from "vue";
import { Grid, Postcard, List, Search } from "@element-plus/icons-vue";
import type { RssSourceStats } from "@/api/interface/yiAi";
import { useSourceColor } from "../composables/useSourceColor";

type ViewMode = "table" | "card" | "list";

interface Props {
  viewMode?: ViewMode;
  sources?: RssSourceStats[];
  sourceFilter?: string[];
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
  (e: "select-all-sources", names: string[]): void;
}>();

const localViewMode = computed({
  get: () => props.viewMode,
  set: (v: ViewMode) => emit("update:viewMode", v)
});

const sourcesRef = computed(() => props.sources);
const { dotStyle } = useSourceColor(sourcesRef);

const sourceSearch = ref("");
const filteredSources = computed(() => {
  const q = sourceSearch.value.trim().toLowerCase();
  if (!q) return props.sources;
  return props.sources.filter(s => s.name.toLowerCase().includes(q));
});

function isSourceActive(name: string): boolean {
  return props.sourceFilter.indexOf(name) >= 0;
}

function toggleSource(name: string) {
  emit("toggle-source", name);
}

function clearSourceFilter() {
  emit("clear-source-filter");
}

function selectAll() {
  emit(
    "select-all-sources",
    filteredSources.value.map(s => s.name)
  );
}
function deselectAll() {
  emit("clear-source-filter");
}
</script>

<style scoped lang="scss">
.issue-list__sidebar {
  --dot-color: #909399;

  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 0;
  width: 240px;
  max-height: 100%;
  padding: 12px;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  box-shadow: 0 4px 16px -8px rgb(0 0 0 / 6%);
}
.issue-list__sidebar-view {
  padding: 4px 4px 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) {
    display: flex;
    width: 100%;
  }
  :deep(.el-radio-button) {
    flex: 1;
  }
  :deep(.el-radio-button__inner) {
    width: 100%;
    padding: 6px 0;
    font-size: 12px;
    text-align: center;
    border-radius: 6px;
    transition: all 0.2s ease;
  }
  :deep(.el-radio-button:first-child .el-radio-button__inner) {
    border-radius: 6px 0 0 6px;
  }
  :deep(.el-radio-button:last-child .el-radio-button__inner) {
    border-radius: 0 6px 6px 0;
  }
}
.issue-list__sidebar-section {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  box-shadow: inset 0 1px 0 var(--el-fill-color-light);
}
.issue-list__sidebar-section-header {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  padding-left: 12px;
  font-size: 10px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 0%, transparent 100%);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-left: 2px solid var(--el-color-primary);
}
.issue-list__sidebar-section-search {
  padding: 8px 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.issue-list__sidebar-actions {
  display: flex;
  gap: 2px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-button) {
    flex: 1;
    font-size: 11px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    &:hover {
      color: var(--el-color-primary);
    }
  }
}
.issue-list__sidebar-list-empty {
  padding: 20px 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.issue-list__sidebar-section-label {
  flex: 1;
}
.issue-list__sidebar-section-hint {
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-color-primary);
  text-transform: none;
  letter-spacing: 0;
  background: var(--el-color-primary-light-9);
  border-radius: 6px;
}
.issue-list__sidebar-section-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  padding: 10px;
}
.issue-list__sidebar-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-height: 0;
  padding: 6px 4px;
  overflow-y: auto;
  scrollbar-color: var(--el-border-color-light) transparent;
  scrollbar-width: thin;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-light);
    border-radius: 3px;
    &:hover {
      background: var(--el-border-color);
    }
  }
}
.issue-list__sidebar-list-item {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    background: var(--el-fill-color-light);
    transform: translateX(2px);
  }
  &.is-active {
    background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-8));
    border-color: var(--el-color-primary-light-5);
    .issue-list__sidebar-list-count {
      color: #ffffff;
      background: var(--el-color-primary);
      box-shadow: 0 2px 6px -2px var(--el-color-primary-light-3);
    }
  }
}
.issue-list__sidebar-list-dot {
  flex-shrink: 0;
  width: 9px;
  height: 9px;
  background: var(--dot-color);
  border-radius: 50%;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--dot-color) 12%, transparent);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  .issue-list__sidebar-list-item:hover & {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--dot-color) 18%, transparent);
    transform: scale(1.2);
  }
}
.issue-list__sidebar-list-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.issue-list__sidebar-list-count {
  flex-shrink: 0;
  padding: 1px 8px;
  font-family: DIN, sans-serif;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-radius: 9px;
  transition: all 0.2s ease;
}
.issue-list__sidebar-list-clear {
  padding: 8px 0;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-color-primary);
  text-align: center;
  cursor: pointer;
  border-top: 1px dashed var(--el-border-color-lighter);
  border-radius: 0 0 6px 6px;
  transition: all 0.15s ease;
  &:hover {
    color: var(--el-color-primary);
    text-decoration: none;
    background: var(--el-color-primary-light-9);
  }
}
</style>
