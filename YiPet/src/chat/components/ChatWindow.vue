<script setup lang="ts">
/**
 * YiPet Chat — ChatWindow Root Component (Vue 3 SFC)
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useChatStore } from '../stores/chat';
import ChatHeader from './ChatHeader.vue';
import ChatSidebar from './ChatSidebar.vue';
import KnowledgeSidebar from './KnowledgeSidebar.vue';
import ChatMessages from './ChatMessages.vue';
import ChatInput from './ChatInput.vue';
import AgentPanel from './AgentPanel.vue';
import AgentToolsDrawer from './AgentToolsDrawer.vue';
import BugReportDialog from './BugReportDialog.vue';
import FaqDialog from './FaqDialog.vue';
import KnowledgePreviewDialog from './KnowledgePreviewDialog/KnowledgePreviewDialog.vue';
import RagDecomposeDialog from './RagDecomposeDialog.vue';
import RagSourcesPreviewDialog from './RagSourcesPreviewDialog.vue';
import SaveToKnowledgeDialog from './SaveToKnowledgeDialog.vue';
import SessionEditDialog from './SessionEditDialog.vue';
import SessionSummaryDialog from './SessionSummaryDialog.vue';
import TagManagerDialog from './TagManagerDialog.vue';
import WeChatSettingsModal from './WeChatSettingsModal.vue';

const RESIZE_HANDLES = ['n', 's', 'w', 'e', 'se', 'sw', 'ne', 'nw'] as const;

const store = useChatStore();
const s = store.state;

const isDragOver = ref(false);
const dragOverCounter = ref(0);

const fullscreen = computed(() => s.ws.isFullscreen);

const windowStyle = computed(() => {
  if (fullscreen.value) return {};
  // When sidebar is visible, widen the window leftward so the chat area keeps
  // its size and the right edge stays anchored.
  const extra = !s.sidebarCollapsed ? s.sidebarWidth : 0;
  return {
    width: `${s.ws.width + extra}px`,
    height: `${s.ws.height}px`,
    left: `${s.ws.x - extra}px`,
    top: `${s.ws.y}px`,
  };
});

const windowClass = computed(() => {
  const parts: string[] = [];
  if (fullscreen.value) parts.push('fullscreen');
  if (s.isDragging) parts.push('dragging');
  if (s.isResizing) parts.push('resizing');
  return parts.join(' ');
});

const currentSession = computed(() =>
  s.sessions.find((ses) => ses.id === s.currentSessionId),
);

// Auto-scroll on new messages
watch(
  () => [s.visible, s.messages.length, s.scrollTick] as const,
  () => {
    if (s.visible && s.messages.length > 0) {
      setTimeout(() => store.scrollToBottom(), 50);
    }
  },
);

// Drag-and-drop knowledge file
function isKnowledgeDrag(e: DragEvent): boolean {
  return e.dataTransfer?.types.includes('application/x-yipet-knowledge-file') ?? false;
}

function onDragOver(e: DragEvent) {
  if (!isKnowledgeDrag(e)) return;
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'link';
}

function onDragEnter(e: DragEvent) {
  if (!isKnowledgeDrag(e)) return;
  e.preventDefault();
  dragOverCounter.value += 1;
  isDragOver.value = true;
}

function onDragLeave(e: DragEvent) {
  e.preventDefault();
  dragOverCounter.value -= 1;
  if (dragOverCounter.value <= 0) {
    dragOverCounter.value = 0;
    isDragOver.value = false;
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  dragOverCounter.value = 0;
  isDragOver.value = false;
  const path = e.dataTransfer?.getData('application/x-yipet-knowledge-file');
  if (path) {
    store.createSessionFromKnowledgeFile?.(path);
  }
}

function onResizeMouseDown(dir: string, e: MouseEvent) {
  store.startResize(dir, e.clientX, e.clientY);
}

// Global mouse handlers for drag/resize
function onGlobalMouseMove(e: MouseEvent) {
  if (s.isDragging) store.onDragMove(e.clientX, e.clientY);
  if (s.isResizing) store.onResizeMove(e.clientX, e.clientY);
}

function onGlobalMouseUp() {
  if (s.isDragging) store.endDrag();
  if (s.isResizing) store.endResize();
}

onMounted(() => {
  window.addEventListener('mousemove', onGlobalMouseMove);
  window.addEventListener('mouseup', onGlobalMouseUp);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onGlobalMouseMove);
  window.removeEventListener('mouseup', onGlobalMouseUp);
});
</script>

<template>
  <div
    v-if="s.visible"
    id="yipet-chat-window"
    :class="windowClass"
    :style="windowStyle"
  >
    <ChatHeader
      :title="s.title"
      :role="s.roleName"
      :role-image-url="s.roleImageUrl"
      @close="store.close()"
      @toggle-sidebar="store.toggleSidebar()"
      @toggle-fullscreen="store.toggleFullscreen()"
      @header-mouse-down="store.startDrag($event.clientX, $event.clientY)"
    />

    <div class="yipet-chat-body">
      <template v-if="!s.sidebarCollapsed">
        <aside
          v-if="s.contextEditingId"
          class="yipet-knowledge-col"
          :style="{ width: s.sidebarWidth + 'px' }"
        >
          <KnowledgeSidebar />
        </aside>
        <aside class="yipet-sidebar-sider" :style="{ width: s.sidebarWidth + 'px' }">
          <ChatSidebar />
        </aside>
        <div
          class="yipet-sidebar-resizer"
          role="separator"
          tabindex="0"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          title="Drag to resize sidebar width"
          @mousedown="store.startSidebarResize($event.clientX)"
        />
      </template>

      <div
        class="yipet-chat-main"
        @dragenter="onDragEnter"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
      >
        <div v-if="isDragOver" class="yipet-chat-drop-overlay">
          <div class="yipet-chat-drop-overlay-inner">
            <span class="drop-icon">📄</span>
            <div>Drop knowledge file to start a session</div>
          </div>
        </div>

        <div id="yipet-chat-messages" class="yipet-chat-messages" role="log" aria-live="polite">
          <ChatMessages
            :messages="s.messages"
            :view-state="s.viewState"
            :page-info="s.pageInfo"
            :current-session-message-count="currentSession?.messageCount || 0"
          />
        </div>

                <AgentPanel />
        <div class="yipet-chat-input-wrap">
          <ChatInput />
        </div>
      </div>
    </div>

    <WeChatSettingsModal />
    <SessionEditDialog />
    <TagManagerDialog />
    <FaqDialog />
    <KnowledgePreviewDialog />
    <SaveToKnowledgeDialog />
    <RagSourcesPreviewDialog />
    <RagDecomposeDialog />
    <BugReportDialog />
    <SessionSummaryDialog />
    <AgentToolsDrawer />

    <template v-if="!fullscreen">
      <div
        v-for="dir in RESIZE_HANDLES"
        :key="dir"
        :class="`yipet-resize-handle yipet-resize-${dir}`"
        aria-hidden="true"
        @mousedown="onResizeMouseDown(dir, $event)"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
#yipet-chat-window {
  position: fixed;
  z-index: 2147483646;
  display: flex;
  flex-direction: column;
  background: var(--bg-elevated, rgba(20, 18, 40, 0.96));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 12px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(var(--primary-rgb, 99, 102, 241), 0.35);
  overflow: hidden;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  color: var(--text-primary, #f5f3ff);
  transition: box-shadow 0.3s ease;

  &.fullscreen {
    left: 0 !important;
    top: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    border-radius: 0;
    border: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  &.dragging { user-select: none; cursor: move; }
  &.resizing { user-select: none; }

  ::selection {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.35);
    color: var(--text-primary, #f5f3ff);
  }
}

.yipet-chat-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--bg-primary, #13122a);
  display: flex;
}

.yipet-chat-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: transparent;
  position: relative;
}

.yipet-sidebar-sider {
  background: var(--bg-secondary, #1e1a3b);
  border-right: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  flex-shrink: 0;
  overflow: hidden;
}

.yipet-knowledge-col {
  background: var(--bg-secondary, #1e1a3b);
  border-right: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  flex-shrink: 0;
  overflow: hidden;
}

.yipet-sidebar-resizer {
  flex-shrink: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background 0.2s ease;
  z-index: 5;

  &:hover {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.5);
  }
}

#yipet-chat-window.resizing .yipet-sidebar-resizer {
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.5);
}

#yipet-chat-messages {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding: 18px 20px;
  background: var(--bg-primary, #13122a);

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.2);
    border-radius: 5px;
    &:hover { background: rgba(var(--primary-rgb, 99, 102, 241), 0.4); }
  }
}

.yipet-chat-input-wrap {
  flex: 0 0 auto;
  padding: 6px 14px 8px;
  background: var(--bg-secondary, rgba(30, 26, 59, 0.6));
  border-top: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
}

/* Resize handles */
.yipet-resize-handle {
  position: absolute;
  z-index: 10;
  background: transparent;
}

.yipet-resize-n {
  left: 8px; right: 8px; top: 0; height: 4px; cursor: ns-resize; z-index: 11;
}
.yipet-resize-s {
  left: 8px; right: 8px; bottom: 0; height: 4px; cursor: ns-resize;
}
.yipet-resize-w {
  left: 0; top: 8px; bottom: 8px; width: 4px; cursor: w-resize;
}
.yipet-resize-e {
  right: 0; top: 8px; bottom: 8px; width: 4px; cursor: e-resize;
}
.yipet-resize-se { right: 0; bottom: 0; width: 16px; height: 16px; cursor: se-resize; }
.yipet-resize-sw { left: 0; bottom: 0; width: 16px; height: 16px; cursor: sw-resize; }
.yipet-resize-ne { right: 0; top: 0; width: 16px; height: 16px; cursor: ne-resize; }
.yipet-resize-nw { left: 0; top: 0; width: 16px; height: 16px; cursor: nw-resize; }

.yipet-resize-n:hover, .yipet-resize-s:hover, .yipet-resize-w:hover, .yipet-resize-e:hover {
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.5);
}
#yipet-chat-window.resizing .yipet-resize-n,
#yipet-chat-window.resizing .yipet-resize-s,
#yipet-chat-window.resizing .yipet-resize-w,
#yipet-chat-window.resizing .yipet-resize-e {
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.5);
}
.yipet-resize-se:hover, .yipet-resize-sw:hover, .yipet-resize-ne:hover, .yipet-resize-nw:hover {
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.4);
}
#yipet-chat-window.resizing .yipet-resize-se,
#yipet-chat-window.resizing .yipet-resize-sw,
#yipet-chat-window.resizing .yipet-resize-ne,
#yipet-chat-window.resizing .yipet-resize-nw {
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.4);
}

/* Drag-and-drop overlay */
.yipet-chat-drop-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 2px dashed rgba(var(--primary-rgb, 99, 102, 241), 0.6);
  border-radius: 8px;
  pointer-events: none;
  animation: dropFadeIn 0.2s ease-out;
}

@keyframes dropFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.yipet-chat-drop-overlay-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 32px;
  font-size: 13px;
  color: var(--text-primary, #f5f3ff);
  background: var(--bg-elevated, rgba(20, 18, 40, 0.9));
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

  .drop-icon { font-size: 28px; }
}
</style>