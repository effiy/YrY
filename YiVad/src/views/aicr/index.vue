<script setup lang="ts" name="aicrDashboard">
import { onMounted, watch } from "vue";
import { useAicrFileTreeStore } from "@/stores/modules/aicr/fileTree";
import { useAicrSessionStore } from "@/stores/modules/aicr/sessions";
import { useAicrUiStore } from "@/stores/modules/aicr/ui";
import { useAicrModelStore } from "@/stores/modules/aicr/models";
import { useResizable } from "@/hooks/useResizable";
import FileTree from "./components/FileTree.vue";
import FilterBar from "./components/FilterBar.vue";
import CodeViewer from "./components/CodeViewer.vue";
import ChatPanel from "./components/ChatPanel.vue";

const uiStore = useAicrUiStore();
const modelStore = useAicrModelStore();

const { width: sidebarW, startResize: startSidebarResize } = useResizable(320, 200, 600, "aicr_sidebar_width");
const { width: chatW, startResize: startChatResize } = useResizable(420, 280, 800, "aicr_chat_panel_width");

watch(sidebarW, v => {
  uiStore.sidebarWidth = v;
});
watch(chatW, v => {
  uiStore.chatPanelWidth = v;
});

const viewModeLabels = [
  { label: "树形", value: "tree" as const },
  { label: "卡片", value: "cards" as const },
  { label: "图谱", value: "graph" as const }
];

onMounted(() => {
  uiStore.loadWidths();
  const sessionStore = useAicrSessionStore();
  const fileTreeStore = useAicrFileTreeStore();
  sessionStore.loadSessions().then(() => {
    fileTreeStore.loadFileTree(true);
  });
  modelStore.fetchModels();
});
</script>

<template>
  <div class="aicr-app">
    <header class="aicr-header">
      <div class="aicr-header-left">
        <h2 class="aicr-title">代码审查</h2>
        <span class="aicr-subtitle">AICR</span>
      </div>
      <div class="aicr-header-right">
        <el-segmented
          :model-value="uiStore.viewMode"
          @update:model-value="(v: any) => uiStore.setViewMode(v)"
          :options="viewModeLabels.map(m => m)"
        />
      </div>
    </header>

    <FilterBar />
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
          title="展开侧边栏"
        >
          <el-icon><ArrowRight /></el-icon>
        </button>
      </aside>
      <button
        v-show="!uiStore.sidebarCollapsed && uiStore.viewMode === 'tree'"
        class="aicr-collapse-btn aicr-collapse-btn--sidebar"
        :style="{ left: sidebarW + 'px' }"
        @click="uiStore.toggleSidebar()"
        title="收起侧边栏"
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
          title="展开聊天面板"
        >
          <el-icon><ArrowLeft /></el-icon>
        </button>
      </aside>
      <button
        v-show="!uiStore.chatPanelCollapsed && uiStore.viewMode === 'tree'"
        class="aicr-collapse-btn aicr-collapse-btn--chat"
        :style="{ right: chatW + 'px' }"
        @click="uiStore.toggleChatPanel()"
        title="收起聊天面板"
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
.aicr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}
.aicr-header-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.aicr-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.aicr-subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

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
