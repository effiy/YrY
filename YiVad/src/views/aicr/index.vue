<script setup lang="ts" name="aicrDashboard">
import { onMounted, watch, computed } from "vue";
import { useAicrFileTreeStore } from "@/stores/modules/aicr/fileTree";
import { useAicrSessionStore } from "@/stores/modules/aicr/sessions";
import { useAicrUiStore } from "@/stores/modules/aicr/ui";
import { useAicrModelStore } from "@/stores/modules/aicr/models";
import { useAicrFilterStore } from "@/stores/modules/aicr/filters";
import { useResizable } from "@/hooks/useResizable";
import FileTree from "./components/FileTree.vue";
import FilterBar from "./components/FilterBar.vue";
import CodeViewer from "./components/CodeViewer.vue";
import ChatPanel from "./components/ChatPanel.vue";

const uiStore = useAicrUiStore();
const modelStore = useAicrModelStore();
const filterStore = useAicrFilterStore();
const fileTreeStore = useAicrFileTreeStore();

const { width: sidebarW, startResize: startSidebarResize } = useResizable(320, 200, 600, "aicr_sidebar_width");
const { width: chatW, startResize: startChatResize } = useResizable(420, 280, 800, "aicr_chat_panel_width");

watch(sidebarW, v => {
  uiStore.sidebarWidth = v;
});
watch(chatW, v => {
  uiStore.chatPanelWidth = v;
});

const viewModeLabels = [
  { label: "Tree", value: "tree" as const },
  { label: "Cards", value: "cards" as const },
  { label: "Graph", value: "graph" as const }
];

const timeOptions = [
  { label: "All", value: "all" as const },
  { label: "This Week", value: "week" as const },
  { label: "This Month", value: "month" as const },
  { label: "This Quarter", value: "quarter" as const },
  { label: "Custom", value: "custom" as const }
];

const fileCount = computed(() => fileTreeStore.flatFiles.length);

function onProjectChange(p: string | null) {
  filterStore.selectProject(p);
  fileTreeStore.loadFileTree(true);
}

function onTimeRangeChange(r: any) {
  filterStore.setTimeRange(r);
  fileTreeStore.loadFileTree(true);
}

function onCustomDateChange() {
  fileTreeStore.loadFileTree(true);
}

onMounted(() => {
  uiStore.loadWidths();
  const sessionStore = useAicrSessionStore();
  sessionStore.loadSessions();
  fileTreeStore.loadFileTree(true);
  modelStore.fetchModels();
});
</script>

<template>
  <div class="aicr-app">
    <!-- Header -->
    <div class="aicr-hdr">
      <div class="aicr-hdr-l">
        <h2 class="aicr-title">Code Review</h2>
        <span class="aicr-count">{{ fileCount }} files</span>
      </div>
      <div class="aicr-hdr-r">
        <el-segmented
          :model-value="uiStore.viewMode"
          @update:model-value="(v: any) => uiStore.setViewMode(v)"
          :options="viewModeLabels"
        />
      </div>
    </div>

    <!-- Dimensions -->
    <div class="aicr-dims">
      <div class="aicr-dim">
        <span class="aicr-dim-lbl">Project</span>
        <el-select
          :model-value="filterStore.selectedProject"
          placeholder="All"
          clearable
          size="small"
          style="width: 180px"
          @change="onProjectChange"
        >
          <el-option label="All Projects" :value="null" />
          <el-option
            v-for="p in filterStore.projects"
            :key="p"
            :label="`${p} (${filterStore.projectFileCounts[p] || 0})`"
            :value="p"
          />
        </el-select>
      </div>
      <div class="aicr-dim">
        <span class="aicr-dim-lbl">Time</span>
        <el-select :model-value="filterStore.timeRange" size="small" style="width: 140px" @change="onTimeRangeChange">
          <el-option v-for="o in timeOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <template v-if="filterStore.timeRange === 'custom'">
          <el-date-picker
            v-model="filterStore.customStart"
            type="date"
            placeholder="Start"
            size="small"
            style="width: 130px"
            @change="onCustomDateChange"
          />
          <span class="aicr-sep">-</span>
          <el-date-picker
            v-model="filterStore.customEnd"
            type="date"
            placeholder="End"
            size="small"
            style="width: 130px"
            @change="onCustomDateChange"
          />
        </template>
      </div>
      <div class="aicr-dim-r">
        <el-input v-model="fileTreeStore.searchQuery" placeholder="Search..." clearable size="small" style="width: 200px" />
      </div>
    </div>

    <!-- Tag filters -->
    <FilterBar />

    <!-- Main content -->
    <main class="aicr-main" :class="{ 'is-cards': uiStore.viewMode === 'cards', 'is-graph': uiStore.viewMode === 'graph' }">
      <aside
        class="aicr-sidebar"
        :class="{ collapsed: uiStore.sidebarCollapsed }"
        :style="{ width: uiStore.sidebarCollapsed ? '0px' : sidebarW + 'px' }"
      >
        <div v-show="!uiStore.sidebarCollapsed" class="aicr-sidebar-inner"><FileTree /></div>
        <div v-show="!uiStore.sidebarCollapsed" class="aicr-resizer aicr-resizer--left" @mousedown="startSidebarResize" />
        <button
          v-show="uiStore.sidebarCollapsed"
          class="aicr-expand-btn aicr-expand-btn--left"
          @click="uiStore.toggleSidebar()"
          title="Expand sidebar"
        >
          <el-icon><ArrowRight /></el-icon>
        </button>
      </aside>
      <button
        v-show="!uiStore.sidebarCollapsed && uiStore.viewMode === 'tree'"
        class="aicr-collapse-btn aicr-collapse-btn--sidebar"
        :style="{ left: sidebarW + 'px' }"
        @click="uiStore.toggleSidebar()"
        title="Collapse sidebar"
      >
        <el-icon><ArrowLeft /></el-icon>
      </button>

      <section class="aicr-center">
        <CodeViewer v-if="uiStore.viewMode === 'tree'" />
        <div v-else class="aicr-full-view"><FileTree :full-width="true" /></div>
      </section>

      <aside
        class="aicr-chat"
        :class="{ collapsed: uiStore.chatPanelCollapsed }"
        :style="{ width: uiStore.chatPanelCollapsed ? '0px' : chatW + 'px' }"
      >
        <div v-show="!uiStore.chatPanelCollapsed" class="aicr-chat-inner">
          <div class="aicr-resizer aicr-resizer--right" @mousedown="startChatResize" />
          <ChatPanel />
        </div>
        <button
          v-show="uiStore.chatPanelCollapsed"
          class="aicr-expand-btn aicr-expand-btn--right"
          @click="uiStore.toggleChatPanel()"
          title="Expand chat panel"
        >
          <el-icon><ArrowLeft /></el-icon>
        </button>
      </aside>
      <button
        v-show="!uiStore.chatPanelCollapsed && uiStore.viewMode === 'tree'"
        class="aicr-collapse-btn aicr-collapse-btn--chat"
        :style="{ right: chatW + 'px' }"
        @click="uiStore.toggleChatPanel()"
        title="Collapse chat panel"
      >
        <el-icon><ArrowRight /></el-icon>
      </button>
    </main>
  </div>
</template>

<style scoped lang="scss">
.aicr-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

// Header — matches sb-hdr
.aicr-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 10px;
}
.aicr-hdr-l {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.aicr-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.aicr-count {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.aicr-hdr-r {
  display: flex;
  align-items: center;
  gap: 10px;
}

// Dimensions — matches sb-dims
.aicr-dims {
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 0 16px 8px;
  padding: 10px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.aicr-dim {
  display: flex;
  align-items: center;
  gap: 8px;
}
.aicr-dim-lbl {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.aicr-dim-r {
  margin-left: auto;
}
.aicr-sep {
  color: var(--el-text-color-placeholder);
}

// Main
.aicr-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}
.aicr-main.is-cards .aicr-center,
.aicr-main.is-graph .aicr-center {
  flex: 1;
}

.aicr-sidebar {
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color-light);
  overflow: hidden;
  position: relative;
  transition: width 0.15s;
}
.aicr-sidebar.collapsed {
  border-right: none;
}
.aicr-sidebar-inner {
  height: 100%;
  overflow-y: auto;
  padding: 8px;
}

.aicr-chat {
  flex-shrink: 0;
  border-left: 1px solid var(--el-border-color-light);
  overflow: hidden;
  position: relative;
  transition: width 0.15s;
}
.aicr-chat.collapsed {
  border-left: none;
}
.aicr-chat-inner {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.aicr-center {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}
.aicr-full-view {
  height: 100%;
  overflow-y: auto;
  padding: 8px;
}

.aicr-resizer {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  z-index: 10;
}
.aicr-resizer:hover {
  background: var(--el-color-primary);
}
.aicr-resizer--left {
  right: 0;
}
.aicr-resizer--right {
  left: 0;
}

.aicr-collapse-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 11;
  width: 20px;
  height: 48px;
  border: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 0;
}
.aicr-collapse-btn:hover {
  background: var(--el-fill-color-light);
}
.aicr-collapse-btn--sidebar {
  left: 320px;
}
.aicr-collapse-btn--chat {
  right: 420px;
}

.aicr-expand-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 11;
  width: 24px;
  height: 48px;
  border: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.aicr-expand-btn:hover {
  background: var(--el-fill-color-light);
}
.aicr-expand-btn--left {
  left: 0;
  border-radius: 0 4px 4px 0;
}
.aicr-expand-btn--right {
  right: 0;
  border-radius: 4px 0 0 4px;
}
</style>
