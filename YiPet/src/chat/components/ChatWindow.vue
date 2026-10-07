<script setup lang="ts">
/**
 * YiPet Chat — ChatWindow Root Component (Vue 3 SFC)
 * Mirrors YiVad AiChatBox: inline chat header, light theme, clean layout.
 */
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue';
import { ArrowLeft, ArrowRight, Plus, Download, Cpu, Search, Check } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';
import { keyboardRegistry } from '@/shared/shortcuts';

import { estimateTokens } from '../utils';

function phaseLabel(phase: string | undefined): string {
  if (phase === 'preparing') return 'Preparing';
  if (phase === 'fetching') return 'Fetching';
  if (phase === 'retrieving') return 'Retrieving';
  if (phase === 'thinking') return 'Thinking';
  if (phase === 'streaming') return 'Generating';
  return 'Processing';
}
function formatElapsed(ms: number): string {
  if (!ms) return '0s';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
import ChatHeader from './ChatHeader.vue';
import ChatSidebar from './ChatSidebar.vue';
import ChatMessages from './ChatMessages.vue';
import ChatInput from './ChatInput.vue';
import QuickButtons from './QuickButtons.vue';
import CheatSheetOverlay from './CheatSheetOverlay.vue';
import ShortcutBindingEditor from './ShortcutBindingEditor.vue';
import SessionEditDialog from './SessionEditDialog.vue';
import SessionSummaryDialog from './SessionSummaryDialog.vue';
import TagManagerDialog from './TagManagerDialog.vue';
import WeChatSettingsModal from './WeChatSettingsModal.vue';
import LlamaIndexPanel from './LlamaIndexPanel/index.vue';
import KnowledgePreviewDialog from './KnowledgePreviewDialog/KnowledgePreviewDialog.vue';
import StatsBar from './StatsBar.vue';
import ProjectHealthCard from './ProjectHealthCard.vue';

const RESIZE_HANDLES = ['n', 's', 'w', 'e', 'se', 'sw', 'ne', 'nw'] as const;

const store = useChatStore();
const s = store.state;

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

// ── Header streaming timer ──
const hdrStreamStart = ref(0);
const hdrStreamElapsed = ref(0);
let _hdrTimer: ReturnType<typeof setInterval> | null = null;
watch(
  () => s.isProcessing,
  (v) => {
    if (_hdrTimer) { clearInterval(_hdrTimer); _hdrTimer = null; }
    if (v) {
      hdrStreamStart.value = Date.now();
      hdrStreamElapsed.value = 0;
      _hdrTimer = setInterval(() => { hdrStreamElapsed.value = Date.now() - hdrStreamStart.value; }, 100);
    }
  }
);
onBeforeUnmount(() => { if (_hdrTimer) { clearInterval(_hdrTimer); _hdrTimer = null; } });

const perf = computed(() => {
  const msgs = s.messages ?? [];
  let totalChars = 0, totalTok = 0, petTok = 0, usrTok = 0, turns = 0;
  for (const m of msgs) {
    const c = (m.content || '').length;
    const t = estimateTokens(m.content || '');
    totalChars += c; totalTok += t;
    if (m.type === 'pet') { petTok += t; turns++; }
    else usrTok += t;
  }
  const costUsd = ((usrTok * 3) + (petTok * 10)) / 1_000_000;
  const rate = totalTok && turns ? Math.round(totalTok / Math.max(1, turns)) : 0;
  return {
    totalTok, petTok, usrTok, turns,
    rate,
    costText: costUsd >= 0.01 ? `$${costUsd.toFixed(2)}` : costUsd >= 0.0001 ? `${(costUsd*100).toFixed(2)}¢` : '<0.01¢',
    perTurn: rate ? `${rate} tok/turn` : '0',
  };
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
  if (lower.includes('think') || lower.includes('reason')) return { label: 'reasoning', color: 'var(--el-color-warning)' };
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
      <div class="yipet-chat-main">

        <!-- Inline chat header bar (mirrors YiVad ai-chat-box__chat-hdr) -->
        <div v-if="currentSession" class="yipet-chat-hdr">
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
            <span
              v-if="s.isProcessing"
              class="yipet-chat-hdr-streaming"
              :class="`phase-${s.streamingPhase || 'processing'}`"
              :title="`Streaming in progress — click to jump to latest message`"
              @click="store.scrollToBottom?.()"
              style="cursor: pointer;"
            >
              <span class="yipet-chat-hdr-streaming-dot" />
              <span class="yipet-chat-hdr-streaming-phase">{{ phaseLabel(s.streamingPhase) }}…</span>
              <span class="yipet-chat-hdr-streaming-elapsed">{{ formatElapsed(hdrStreamElapsed) }}</span>
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
                <!-- Loading skeleton (mirrors YiVad) -->
                <div v-if="store.modelsLoading" class="yipet-model-loading">
                  <div v-for="i in 3" :key="i" class="yipet-model-skel">
                    <span class="yipet-model-skel-name" />
                    <span class="yipet-model-skel-tag" />
                  </div>
                </div>
                <div v-else-if="!s.availableModels.length" class="yipet-model-empty">
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
            <el-tooltip
              placement="bottom"
              :content="`${perf.totalTok} tokens (${perf.usrTok} input + ${perf.petTok} output) · ${perf.turns} turns · est. cost ${perf.costText}`"
            >
              <span class="perf-pill">
                <svg viewBox="0 0 14 14" class="perf-pill-spark"><path d="M1 11 L4 7 L6 9 L10 3 L13 5" stroke-width="1.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="perf-pill-tok">{{ perf.totalTok }} tok</span>
                <span class="perf-pill-sep">·</span>
                <span class="perf-pill-rate">{{ perf.perTurn }}</span>
                <span class="perf-pill-sep">·</span>
                <span class="perf-pill-cost">{{ perf.costText }}</span>
              </span>
            </el-tooltip>
            <el-button size="small" text title="Export as HTML" @click="store.exportConversationHtml?.()">
              <el-icon><Download /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- Personal stats bar (mirrors YiVad Home stat cards) -->
        <StatsBar />

        <!-- Project health summary (only on YiVad project pages) -->
        <ProjectHealthCard />

        <!-- Messages area -->
        <div id="yipet-chat-messages" role="log" aria-live="polite" class="yipet-chat-messages-wrap">
          <ChatMessages
            :messages="s.messages"
            :view-state="s.viewState"
            :page-info="s.pageInfo"
            :current-session-message-count="currentSession?.messageCount || 0"
          />
        </div>

        <!-- Quick action chips (qb-row) — sibling of input, mirrors YiVad ai-chat-box -->
        <QuickButtons />

        <!-- Input area (ci-input) -->
        <ChatInput />
      </div>
    </div>

    <!-- Dialogs -->
    <WeChatSettingsModal />
    <SessionEditDialog />
    <TagManagerDialog />
    <SessionSummaryDialog />
    <LlamaIndexPanel
      v-if="s.llamaIndexVisible"
      :scope-title="s.sessions.find(x => x.id === s.currentSessionId)?.title || ''"
      @close="store.closeLlamaIndex?.()"
    />
    <KnowledgePreviewDialog />
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
@use "./ChatWindow/window.scss";
</style>
<style lang="scss">
@use "./ChatWindow/global.scss";
</style>
