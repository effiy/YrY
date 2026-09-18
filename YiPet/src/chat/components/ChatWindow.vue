<script setup lang="ts">
/**
 * YiPet Chat — ChatWindow Root Component (Vue 3 SFC)
 * Mirrors YiVad AiChatBox: inline chat header, light theme, clean layout.
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { ArrowLeft, ArrowRight, Plus, Download, Cpu, Search, Check } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';
import { keyboardRegistry } from '@/shared/shortcuts';
import ChatHeader from './ChatHeader.vue';
import ChatSidebar from './ChatSidebar.vue';
import KnowledgeSidebar from './KnowledgeSidebar.vue';
import ChatMessages from './ChatMessages.vue';
import ChatInput from './ChatInput.vue';
import BugReportDialog from './BugReportDialog.vue';
import FaqDialog from './FaqDialog.vue';
import KnowledgePreviewDialog from './KnowledgePreviewDialog/KnowledgePreviewDialog.vue';
import RagDecomposeDialog from './RagDecomposeDialog.vue';
import RagSourcesPreviewDialog from './RagSourcesPreviewDialog.vue';
import CheatSheetOverlay from './CheatSheetOverlay.vue';
import ShortcutBindingEditor from './ShortcutBindingEditor.vue';
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

const contextFileCount = computed(() => {
  const tags = currentSession.value?.tags ?? [];
  return tags.filter((t: string) => typeof t === 'string' && t.startsWith('ctx:')).length;
});

// Auto-scroll on new messages
watch(
  () => [s.visible, s.messages.length, s.scrollTick] as const,
  () => {
    if (s.visible && s.messages.length > 0) {
      setTimeout(() => store.scrollToBottom(), 50);
    }
  },
);

// Keyboard shortcut scope
watch(() => s.visible, (v) => {
  keyboardRegistry.setChatActive(v);
});

// ── Model selector ──
const modelSelectVisible = ref(false);
const modelSearch = ref('');

function onModelSelectOpen() {
  if (!store.state.availableModels.length) store.fetchModels?.();
}

function modelTag(name: string): { label: string; color: string } {
  const lower = name.toLowerCase();
  if (lower.includes('vision') || lower.includes('vl')) return { label: 'vision', color: '#8b5cf6' };
  if (lower.includes('think') || lower.includes('reason')) return { label: 'reasoning', color: '#f59e0b' };
  if (lower.includes('large') || /\b(70|72|405)b\b/.test(lower)) return { label: 'large', color: '#ef4444' };
  if (lower.includes('small') || /\b(7|8|13)b\b/.test(lower)) return { label: 'compact', color: '#10b981' };
  return { label: 'general', color: '#6366f1' };
}

const filteredModels = computed(() => {
  const q = modelSearch.value.trim().toLowerCase();
  if (!q) return s.availableModels;
  return s.availableModels.filter(m => m.toLowerCase().includes(q));
});

function selectModelAndClose(m: string) {
  s.selectedModel = m;
  modelSelectVisible.value = false;
  modelSearch.value = '';
}

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
  if (dragOverCounter.value <= 0) { dragOverCounter.value = 0; isDragOver.value = false; }
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  dragOverCounter.value = 0;
  isDragOver.value = false;
  const path = e.dataTransfer?.getData('application/x-yipet-knowledge-file');
  if (path) store.createSessionFromKnowledgeFile?.(path);
}

function onResizeMouseDown(dir: string, e: MouseEvent) {
  store.startResize(dir, e.clientX, e.clientY);
}

function onHeaderMouseDown(e: MouseEvent) {
  store.startDrag(e.clientX, e.clientY);
}

// Global mouse handlers
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
    <!-- Window-level drag header (minimal) -->
    <ChatHeader
      :title="s.title"
      :is-processing="s.isProcessing"
      :streaming-phase="s.streamingPhase"
      @close="store.close()"
      @toggle-fullscreen="store.toggleFullscreen()"
      @header-mouse-down="onHeaderMouseDown"
    />

    <div class="yipet-chat-body">
      <!-- Session sidebar -->
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

      <!-- Chat main column -->
      <div
        class="yipet-chat-main"
        @dragenter="onDragEnter"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
      >
        <!-- Drag-and-drop overlay -->
        <div v-if="isDragOver" class="yipet-chat-drop-overlay">
          <div class="yipet-chat-drop-overlay-inner">
            <span class="drop-icon">📄</span>
            <div>Drop knowledge file to start a session</div>
          </div>
        </div>

        <!-- Inline chat header bar (mirrors YiVad ai-chat-box__chat-hdr) -->
        <div v-if="store.state.activeConversation || currentSession" class="yipet-chat-hdr">
          <div class="yipet-chat-hdr-left">
            <el-button
              v-if="!s.sidebarCollapsed"
              circle
              size="small"
              title="Hide session sidebar"
              @click="store.toggleSidebar()"
            >
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <el-button v-else circle size="small" title="Show session sidebar" @click="store.toggleSidebar()">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
            <span class="yipet-chat-hdr-title" :title="currentSession?.title || s.title">
              {{ currentSession?.title || s.title || 'Untitled' }}
            </span>
            <span v-if="contextFileCount" class="yipet-chat-hdr-ctx">
              {{ contextFileCount }} file{{ contextFileCount !== 1 ? 's' : '' }}
            </span>
            <span v-if="s.isProcessing" class="yipet-chat-hdr-streaming">
              <span class="yipet-chat-hdr-streaming-dot" />
              {{ s.streamingPhase === 'retrieving' ? 'Retrieving...' : s.streamingPhase === 'thinking' ? 'Thinking...' : s.streamingPhase === 'streaming' ? 'Writing...' : 'Processing...' }}
            </span>
          </div>
          <div class="yipet-chat-hdr-right">
            <!-- Model selector (mirrors YiVad popover) -->
            <el-popover
              v-model:visible="modelSelectVisible"
              placement="bottom-end"
              :width="280"
              trigger="click"
              :teleported="true"
              popper-class="yipet-model-pop"
              @show="onModelSelectOpen"
            >
              <template #reference>
                <el-button size="small" text class="yipet-chat-hdr-model-btn">
                  <el-icon><Cpu /></el-icon>
                  <span>{{ s.selectedModel }}</span>
                </el-button>
              </template>
              <div class="yipet-model-panel">
                <div class="yipet-model-search">
                  <el-input
                    v-model="modelSearch"
                    size="small"
                    placeholder="Filter models..."
                    :prefix-icon="Search"
                    clearable
                  />
                </div>
                <div v-if="!s.availableModels.length" class="yipet-model-empty">
                  <span class="yipet-model-empty-icon">📡</span>
                  <span>No models available</span>
                  <el-button size="small" text type="primary" @click="store.fetchModels?.()">Retry</el-button>
                </div>
                <div v-else-if="!filteredModels.length" class="yipet-model-empty">
                  <span class="yipet-model-empty-icon">🔍</span>
                  <span>No models match "{{ modelSearch }}"</span>
                </div>
                <div v-else class="yipet-model-items">
                  <button
                    v-for="m in filteredModels"
                    :key="m"
                    class="yipet-model-card"
                    :class="{ 'is-selected': m === s.selectedModel }"
                    @click="selectModelAndClose(m)"
                  >
                    <div class="yipet-model-card-left">
                      <span class="yipet-model-card-name">{{ m }}</span>
                      <span
                        class="yipet-model-card-tag"
                        :style="{ color: modelTag(m).color, background: modelTag(m).color + '18' }"
                      >{{ modelTag(m).label }}</span>
                    </div>
                    <el-icon v-if="m === s.selectedModel" class="yipet-model-card-check" :size="16"><Check /></el-icon>
                  </button>
                </div>
              </div>
            </el-popover>
            <el-button size="small" text title="New chat" @click="store.createEmptySession?.()">
              <el-icon><Plus /></el-icon>
            </el-button>
            <el-button size="small" text title="Export as HTML" @click="store.exportConversationHtml?.()">
              <el-icon><Download /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- Messages area -->
        <div id="yipet-chat-messages" role="log" aria-live="polite">
          <ChatMessages
            :messages="s.messages"
            :view-state="s.viewState"
            :page-info="s.pageInfo"
            :current-session-message-count="currentSession?.messageCount || 0"
          />
        </div>

        <!-- Input area -->
        <div class="yipet-chat-input-wrap">
          <ChatInput />
        </div>
      </div>
    </div>

    <!-- Dialogs -->
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
    <CheatSheetOverlay />
    <ShortcutBindingEditor />

    <!-- Resize handles -->
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
  background: #141228;
  border-radius: 12px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: #f5f3ff;
  transition: box-shadow 0.3s ease;

  &.fullscreen {
    left: 0 !important;
    top: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    border-radius: 0;
    border: none;
  }

  &.dragging { user-select: none; cursor: move; }
  &.resizing { user-select: none; }
}

.yipet-chat-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #13122a;
  display: flex;
  position: relative;
}

.yipet-chat-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #141228;
  position: relative;
}

// Sidebar
.yipet-sidebar-sider {
  background: #141228;
  border-right: 1px solid rgba(99, 102, 241, 0.2);
  flex-shrink: 0;
  overflow: hidden;
}

.yipet-knowledge-col {
  background: #141228;
  border-right: 1px solid rgba(99, 102, 241, 0.2);
  flex-shrink: 0;
  overflow: hidden;
}

.yipet-sidebar-resizer {
  flex-shrink: 0;
  width: 4px;
  cursor: col-resize;
  background: rgba(99, 102, 241, 0.2);
  transition: background 0.2s;
  z-index: 5;
  &:hover { background: rgba(99, 102, 241, 0.5); }
}

// ── Inline chat header bar (mirrors YiVad ai-chat-box__chat-hdr) ──
.yipet-chat-hdr {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #141228;
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
}

.yipet-chat-hdr-left {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.yipet-chat-hdr-right {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  align-items: center;
}

.yipet-chat-hdr-title {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 600;
  color: #f5f3ff;
  white-space: nowrap;
}

.yipet-chat-hdr-ctx {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 500;
  color: #22c55e;
  white-space: nowrap;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 10px;
}

.yipet-chat-hdr-streaming {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 500;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 10px;
  white-space: nowrap;
}

.yipet-chat-hdr-streaming-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #818cf8;
  animation: hdr-dot-pulse 1.2s ease-in-out infinite;
}

@keyframes hdr-dot-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

// Model selector button
.yipet-chat-hdr-model-btn {
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #d4d0e8;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 6px;
  transition: all 0.15s;
  &:hover {
    color: #818cf8;
    background: rgba(99, 102, 241, 0.12);
    border-color: rgba(99, 102, 241, 0.5);
  }
}

// Messages area
#yipet-chat-messages {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #13122a;
}

// Input wrap
.yipet-chat-input-wrap {
  flex: 0 0 auto;
}

// Resize handles (keep dark for contrast against any page)
.yipet-resize-handle {
  position: absolute;
  z-index: 10;
  background: transparent;
}
.yipet-resize-n { left: 8px; right: 8px; top: 0; height: 4px; cursor: ns-resize; z-index: 11; }
.yipet-resize-s { left: 8px; right: 8px; bottom: 0; height: 4px; cursor: ns-resize; }
.yipet-resize-w { left: 0; top: 8px; bottom: 8px; width: 4px; cursor: w-resize; }
.yipet-resize-e { right: 0; top: 8px; bottom: 8px; width: 4px; cursor: e-resize; }
.yipet-resize-se { right: 0; bottom: 0; width: 16px; height: 16px; cursor: se-resize; }
.yipet-resize-sw { left: 0; bottom: 0; width: 16px; height: 16px; cursor: sw-resize; }
.yipet-resize-ne { right: 0; top: 0; width: 16px; height: 16px; cursor: ne-resize; }
.yipet-resize-nw { left: 0; top: 0; width: 16px; height: 16px; cursor: nw-resize; }

.yipet-resize-n:hover, .yipet-resize-s:hover, .yipet-resize-w:hover, .yipet-resize-e:hover {
  background: rgba(99, 102, 241, 0.3);
}
#yipet-chat-window.resizing .yipet-resize-n,
#yipet-chat-window.resizing .yipet-resize-s,
#yipet-chat-window.resizing .yipet-resize-w,
#yipet-chat-window.resizing .yipet-resize-e {
  background: rgba(99, 102, 241, 0.3);
}
.yipet-resize-se:hover, .yipet-resize-sw:hover, .yipet-resize-ne:hover, .yipet-resize-nw:hover {
  background: rgba(99, 102, 241, 0.25);
}

// Drag-and-drop overlay
.yipet-chat-drop-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.12);
  border: 2px dashed rgba(99, 102, 241, 0.5);
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
  color: #818cf8;
  background: #141228;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  .drop-icon { font-size: 28px; }
}

// ── Responsive ──
@media (width <= 767px) {
  .yipet-chat-hdr { gap: 4px; padding: 6px 8px; }
  .yipet-chat-hdr-title { max-width: 140px; font-size: 12px; }
}
</style>

<style lang="scss">
// Model selector popover (global — teleported)
.yipet-model-pop {
  padding: 0 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
}
.yipet-model-panel {
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow: hidden;
}
.yipet-model-search {
  padding: 10px 12px 8px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
}
.yipet-model-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  overflow-y: auto;
}
.yipet-model-card {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 10px;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 6px;
  transition: background 0.15s;
  &:hover { background: rgba(99, 102, 241, 0.08); }
  &.is-selected { background: rgba(99, 102, 241, 0.12); }
}
.yipet-model-card-left {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  min-width: 0;
}
.yipet-model-card-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 500;
  color: #f5f3ff;
  white-space: nowrap;
}
.yipet-model-card-tag {
  flex-shrink: 0;
  padding: 1px 6px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
  border-radius: 3px;
}
.yipet-model-card-check {
  flex-shrink: 0;
  color: #818cf8;
}
.yipet-model-empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 24px 16px;
  font-size: 13px;
  color: #d4d0e8;
  text-align: center;
}
.yipet-model-empty-icon {
  font-size: 28px;
  line-height: 1;
}
</style>