<script setup lang="ts" name="AiChatBox">
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { ArrowLeft, ArrowRight, Plus, Download, Cpu, Loading, Search, Check } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useResizable } from "@/hooks/useResizable";
import MessageList from "@/views/ai-chat/components/MessageList.vue";
import QuickButtons from "@/views/ai-chat/components/QuickButtons.vue";
import ChatInput from "@/views/ai-chat/components/ChatInput.vue";
import ConversationSessionSidebar from "@/views/ai-chat/components/ConversationSessionSidebar.vue";
import LlamaIndexPanel from "@/views/ai-chat/components/LlamaIndexPanel/index.vue";

const props = withDefaults(
  defineProps<{
    /** System prompt — passed to the LLM as `system` on the next send.
     *  Story's file-preview chat feeds file content via this. */
    systemPrompt?: string;
    /** Optional header title. Renders a slim header row above MessageList. */
    title?: string;
    /** Drop the active conversation reference on unmount so the next mount
     *  starts fresh. Previous conversations stay in /ai-chat's list. */
    clearActiveOnUnmount?: boolean;
    /** Layout role. `fill` = take all available space (aiChat page main).
     *  `right`/`left` = side panel with bordered edge + resize + collapse. */
    side?: "fill" | "right" | "left";
    /** Show a drag handle on the panel's inner edge. Only meaningful for
     *  side != "fill". */
    resizable?: boolean;
    /** Show a collapse button; collapsed panel renders only an expand tab. */
    collapsible?: boolean;
    defaultWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    /** localStorage key for persisted width. */
    storageKey?: string;
    /** localStorage key for persisted collapsed state. */
    collapsedStorageKey?: string;
  }>(),
  {
    systemPrompt: "",
    title: "",
    clearActiveOnUnmount: false,
    side: "fill",
    resizable: false,
    collapsible: false,
    defaultWidth: 420,
    minWidth: 280,
    maxWidth: 800,
    storageKey: "",
    collapsedStorageKey: ""
  }
);

const store = useAiChatStore();

// ── Side-panel mode: resize / collapse (right/left) ──

const invert = props.side === "right";
const { width, isResizing, startResize } = useResizable(
  props.defaultWidth,
  props.minWidth,
  props.maxWidth,
  props.storageKey || undefined,
  invert
);

const collapsed = ref(false);
function loadCollapsed() {
  if (!props.collapsedStorageKey) return;
  try {
    collapsed.value = localStorage.getItem(props.collapsedStorageKey) === "1";
  } catch {
    /* ignore */
  }
}
function saveCollapsed() {
  if (!props.collapsedStorageKey) return;
  try {
    localStorage.setItem(props.collapsedStorageKey, collapsed.value ? "1" : "0");
  } catch {
    /* ignore */
  }
}
function toggleCollapse() {
  collapsed.value = !collapsed.value;
  saveCollapsed();
}
loadCollapsed();

const openKnowledgePreview = inject<(path: string) => void>("openKnowledgePreview");

function onOpenKnowledgeFile(filePath: string) {
  if (!filePath) return;
  if (openKnowledgePreview) {
    openKnowledgePreview(filePath);
  } else {
    ElMessage.warning("Knowledge preview is not available here.");
  }
}

// ── RAG panel context: extract ctx:-prefixed tags from the active conversation ──

const CTX_PREFIX = "ctx:";

const ragScopeFiles = computed(() => {
  const tags = store.activeConversation?.tags ?? [];
  return tags.filter(t => typeof t === "string" && t.startsWith(CTX_PREFIX)).map(t => (t as string).slice(CTX_PREFIX.length));
});

const ragScopeTitle = computed(() => store.activeConversation?.title || "");

provide("aiChatBoxCollapse", {
  collapsible: props.collapsible,
  side: props.side,
  toggle: toggleCollapse
});

onMounted(() => {
  if (!store.conversations.length && !store.conversationsLoaded) {
    store.loadConversations();
  }
});

watch(
  () => props.systemPrompt,
  text => store.setSystemPrompt(text ?? ""),
  { immediate: true }
);

onBeforeUnmount(() => {
  store.setSystemPrompt("");
  if (props.clearActiveOnUnmount) {
    store.activeConversation = null;
  }
});

const isSide = computed(() => props.side !== "fill");
const isFill = computed(() => props.side === "fill");
const showResizer = computed(() => props.resizable && isSide.value && !collapsed.value);
const showPanel = computed(() => !collapsed.value);

const containerStyle = computed(() => {
  if (!isSide.value) return {};
  return { width: collapsed.value ? "20px" : `${width.value}px` };
});

// ── Session sidebar (fill mode only) ──

const {
  width: sessionSidebarW,
  isResizing: isSessionResizing,
  startResize: startSessionResize
} = useResizable(180, 180, 480, "aiChat.sessionSidebarW");

const sessionSidebarCollapsed = ref(false);
function toggleSessionSidebar() {
  sessionSidebarCollapsed.value = !sessionSidebarCollapsed.value;
}
provide("aiChatSessionSidebar", {
  collapsed: sessionSidebarCollapsed,
  toggle: toggleSessionSidebar
});

// ── Header actions ──

function onNewChat() {
  store.createConversation();
}

// ── Model selector ──

const modelSelectVisible = ref(false);

function onModelSelectOpen() {
  if (!store.availableModels.length) store.fetchModels();
}

// ── Model selector helpers ──

const modelSearch = ref("");

function modelTag(name: string): { label: string; color: string } {
  const lower = name.toLowerCase();
  if (lower.includes("vision") || lower.includes("vl")) return { label: "vision", color: "#8b5cf6" };
  if (lower.includes("think") || lower.includes("reason")) return { label: "reasoning", color: "#f59e0b" };
  if (lower.includes("large") || /\b(70|72|405)b\b/.test(lower)) return { label: "large", color: "#ef4444" };
  if (lower.includes("small") || /\b(7|8|13)b\b/.test(lower)) return { label: "compact", color: "#10b981" };
  return { label: "general", color: "#6366f1" };
}

const filteredModels = computed(() => {
  const q = modelSearch.value.trim().toLowerCase();
  if (!q) return store.availableModels;
  return store.availableModels.filter(m => m.toLowerCase().includes(q));
});

function selectModelAndClose(m: string) {
  store.selectedModel = m;
  modelSelectVisible.value = false;
  modelSearch.value = "";
}

const contextCount = computed(() => {
  const tags = store.activeConversation?.tags ?? [];
  return tags.filter((t: string) => typeof t === "string" && t.startsWith("ctx:")).length;
});
</script>

<template>
  <div
    class="ai-chat-box"
    :class="[`ai-chat-box--${side}`, { 'is-collapsed': collapsed, 'is-dragging': isResizing }]"
    :style="containerStyle"
  >
    <!-- Side-panel drag handle -->
    <div v-if="showResizer" class="ai-chat-box__resizer" :class="`ai-chat-box__resizer--${side}`" @pointerdown="startResize" />

    <!-- Side-panel expand tab -->
    <button
      v-if="collapsible && collapsed"
      class="ai-chat-box__expand"
      :class="`ai-chat-box__expand--${side}`"
      title="Expand chat"
      @click="toggleCollapse"
    >
      <el-icon><ArrowLeft v-if="side === 'right'" /><ArrowRight v-else /></el-icon>
    </button>

    <template v-if="showPanel">
      <!-- Fill mode: context files panel + session sidebar + chat area -->
      <template v-if="isFill">
        <div class="ai-chat-box__body">
          <!-- Session sidebar -->
          <div v-if="!sessionSidebarCollapsed" class="ai-chat-box__session-sidebar" :style="{ width: sessionSidebarW + 'px' }">
            <ConversationSessionSidebar />
          </div>
          <!-- Session sidebar resizer -->
          <div
            v-if="!sessionSidebarCollapsed"
            class="ai-chat-box__session-resizer"
            :class="{ 'is-active': isSessionResizing }"
            @pointerdown="startSessionResize"
          />
          <!-- Chat column -->
          <div class="ai-chat-box__chat">
            <div v-if="title" class="ai-chat-box__hdr">
              <span class="ai-chat-box__title">{{ title }}</span>
            </div>
            <!-- Chat header: conversation info + model + actions -->
            <div v-if="isFill && store.activeConversation" class="ai-chat-box__chat-hdr">
              <div class="ai-chat-box__chat-hdr-left">
                <el-button
                  v-if="!sessionSidebarCollapsed"
                  circle
                  size="small"
                  title="Hide session sidebar"
                  @click="toggleSessionSidebar"
                >
                  <el-icon><ArrowLeft /></el-icon>
                </el-button>
                <el-button v-else circle size="small" title="Show session sidebar" @click="toggleSessionSidebar">
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
                <span class="ai-chat-box__chat-title" :title="store.activeConversation.title">
                  {{ store.activeConversation.title || "Untitled" }}
                </span>
                <span v-if="contextCount" class="ai-chat-box__chat-ctx-badge">
                  {{ contextCount }} file{{ contextCount !== 1 ? "s" : "" }}
                </span>
              </div>
              <div class="ai-chat-box__chat-hdr-right">
                <el-popover
                  v-model:visible="modelSelectVisible"
                  placement="bottom-end"
                  :width="280"
                  trigger="click"
                  :teleported="true"
                  popper-class="ai-chat-box__model-pop"
                  @show="onModelSelectOpen"
                >
                  <template #reference>
                    <el-button size="small" text class="ai-chat-box__model-btn">
                      <el-icon><Cpu /></el-icon>
                      <span>{{ store.selectedModel }}</span>
                    </el-button>
                  </template>
                  <div class="ai-chat-box__model-panel">
                    <!-- Search -->
                    <div class="ai-chat-box__model-search">
                      <el-input
                        v-model="modelSearch"
                        size="small"
                        placeholder="Filter models..."
                        :prefix-icon="Search"
                        clearable
                      />
                    </div>
                    <!-- Loading skeleton -->
                    <div v-if="store.modelsLoading" class="ai-chat-box__model-loading">
                      <div v-for="i in 3" :key="i" class="ai-chat-box__model-skel">
                        <span class="ai-chat-box__model-skel-name" />
                        <span class="ai-chat-box__model-skel-tag" />
                      </div>
                    </div>
                    <!-- Empty -->
                    <div v-else-if="!store.availableModels.length" class="ai-chat-box__model-empty">
                      <span class="ai-chat-box__model-empty-icon">📡</span>
                      <span>No models available</span>
                      <el-button size="small" text type="primary" @click="store.fetchModels()">Retry</el-button>
                    </div>
                    <!-- No match -->
                    <div v-else-if="!filteredModels.length" class="ai-chat-box__model-empty">
                      <span class="ai-chat-box__model-empty-icon">🔍</span>
                      <span>No models match "{{ modelSearch }}"</span>
                    </div>
                    <!-- Model list -->
                    <div v-else class="ai-chat-box__model-items">
                      <button
                        v-for="m in filteredModels"
                        :key="m"
                        class="ai-chat-box__model-card"
                        :class="{ 'is-selected': m === store.selectedModel }"
                        @click="selectModelAndClose(m)"
                      >
                        <div class="ai-chat-box__model-card-left">
                          <span class="ai-chat-box__model-card-name">{{ m }}</span>
                          <span
                            class="ai-chat-box__model-card-tag"
                            :style="{ color: modelTag(m).color, background: modelTag(m).color + '18' }"
                          >
                            {{ modelTag(m).label }}
                          </span>
                        </div>
                        <el-icon v-if="m === store.selectedModel" class="ai-chat-box__model-card-check" :size="16">
                          <Check />
                        </el-icon>
                      </button>
                    </div>
                  </div>
                </el-popover>
                <el-button size="small" text title="New chat" @click="onNewChat">
                  <el-icon><Plus /></el-icon>
                </el-button>
                <el-button size="small" text title="Export as HTML" @click="store.exportConversationHtml()">
                  <el-icon><Download /></el-icon>
                </el-button>
              </div>
            </div>
            <MessageList />
            <QuickButtons />
            <ChatInput />
            <LlamaIndexPanel
              v-if="store.llamaIndexVisible"
              :scope-files="ragScopeFiles"
              :scope-title="ragScopeTitle"
              @close="store.closeLlamaIndex()"
              @open-file="onOpenKnowledgeFile"
            />
          </div>
        </div>
      </template>

      <!-- Side mode: just message list + input -->
      <template v-else>
        <div v-if="title" class="ai-chat-box__hdr">
          <span class="ai-chat-box__title">{{ title }}</span>
        </div>
        <MessageList />
        <QuickButtons />
        <ChatInput />
        <LlamaIndexPanel
          v-if="store.llamaIndexVisible"
          :scope-files="ragScopeFiles"
          :scope-title="ragScopeTitle"
          @close="store.closeLlamaIndex()"
          @open-file="onOpenKnowledgeFile"
        />
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss">
.ai-chat-box {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: transparent;
  transition: width var(--transition-fast);
}
.ai-chat-box--fill {
  flex: 1;
  min-width: 0;
}
.ai-chat-box--right {
  flex-shrink: 0;
  border-left: 1px solid var(--el-border-color-lighter);
}
.ai-chat-box--left {
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color-lighter);
}
.ai-chat-box.is-collapsed {
  border: none;
}

// ── Body (fill mode: session sidebar + chat) ──
.ai-chat-box__body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.ai-chat-box__session-sidebar {
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
}
.ai-chat-box__session-resizer {
  flex-shrink: 0;
  width: 4px;
  cursor: col-resize;
  background: var(--el-border-color-lighter);
  transition: background var(--transition-fast);
}
.ai-chat-box__session-resizer:hover,
.ai-chat-box__session-resizer.is-active {
  background: var(--el-color-primary-light-7);
}
.ai-chat-box__chat {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

// ── Drop zone overlay ──
.ai-chat-box__chat.is-drag-over {
  outline: 2px dashed var(--el-color-primary);
  outline-offset: -2px;
}
.ai-chat-box__drop-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: var(--el-color-primary-light-9);
}
.ai-chat-box__drop-hint {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.ai-chat-box__drop-icon {
  font-size: 40px;
}

// ── Side-panel resizer ──
.ai-chat-box__resizer {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 10;
  width: 8px;
  touch-action: none;
  cursor: col-resize;
}
.ai-chat-box__resizer::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 4px;
  content: "";
  background: transparent;
  border-radius: 2px;
  transform: translateX(-50%);
  transition: background var(--transition-fast);
}
.ai-chat-box__resizer:hover::before,
.ai-chat-box.is-dragging .ai-chat-box__resizer::before {
  background: var(--el-color-primary);
}
.ai-chat-box__resizer--right {
  left: 0;
}
.ai-chat-box__resizer--left {
  right: 0;
}
.ai-chat-box__hdr {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ai-chat-box__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

// ── Chat header bar (fill mode) ──
.ai-chat-box__chat-hdr {
  display: flex;
  flex-shrink: 0;
  gap: var(--space-sm);
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ai-chat-box__chat-hdr-left {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}
.ai-chat-box__chat-hdr-right {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  align-items: center;
}
.ai-chat-box__chat-title {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.ai-chat-box__chat-ctx-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-color-success);
  white-space: nowrap;
  background: var(--el-color-success-light-9);
  border-radius: var(--radius-pill);
}
.ai-chat-box__model-btn {
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
.ai-chat-box__model-panel {
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow: hidden;
}
.ai-chat-box__model-search {
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ai-chat-box__model-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  overflow-y: auto;
}
.ai-chat-box__model-card {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 10px;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);

  &:hover {
    background: var(--el-fill-color-lighter);
  }
  &.is-selected {
    background: var(--el-color-primary-light-9);
  }
}
.ai-chat-box__model-card-left {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  min-width: 0;
}
.ai-chat-box__model-card-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.ai-chat-box__model-card-tag {
  flex-shrink: 0;
  padding: 1px 6px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
  border-radius: var(--radius-xs);
}
.ai-chat-box__model-card-check {
  flex-shrink: 0;
  color: var(--el-color-primary);
}

// Loading skeleton
.ai-chat-box__model-loading {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
}
.ai-chat-box__model-skel {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
}
.ai-chat-box__model-skel-name {
  flex: 1;
  height: 14px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  animation: model-skel-pulse 1.5s ease-in-out infinite;
}
.ai-chat-box__model-skel-tag {
  width: 48px;
  height: 16px;
  background: var(--el-fill-color-light);
  border-radius: var(--radius-xs);
  animation: model-skel-pulse 1.5s ease-in-out infinite;
}
@keyframes model-skel-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

// Empty state
.ai-chat-box__model-empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 24px 16px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.ai-chat-box__model-empty-icon {
  font-size: 28px;
  line-height: 1;
}

// Remove old radio-group styles
.ai-chat-box__model-item {
  display: flex;
  padding: 6px 0;
  margin: 0;
}
.ai-chat-box__expand {
  position: absolute;
  top: 50%;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 48px;
  padding: 0;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  transform: translateY(-50%);
  transition:
    background var(--transition-fast),
    color var(--transition-fast);
}
.ai-chat-box__expand:hover {
  color: #ffffff;
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
}
.ai-chat-box__expand--right {
  right: 0;
  border-radius: 4px 0 0 4px;
}
.ai-chat-box__expand--left {
  left: 0;
  border-radius: 0 4px 4px 0;
}

// ── Responsive ──

@media (width <= 1023px) {
  .ai-chat-box__session-sidebar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 25;
    width: 260px !important;
    box-shadow: 2px 0 8px rgb(0 0 0 / 10%);
  }
  .ai-chat-box__session-resizer {
    display: none;
  }
  .ai-chat-box__chat-title {
    max-width: 160px;
  }
}

@media (width <= 767px) {
  .ai-chat-box__chat-hdr {
    gap: 4px;
    padding: 6px 8px;
  }
  .ai-chat-box__chat-title {
    max-width: 140px;
    font-size: 12px;
  }
  .ai-chat-box__session-sidebar {
    width: 100% !important;
  }
}
</style>

<style lang="scss">
.ai-chat-box__model-pop {
  padding: 0 !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-lg) !important;
}
</style>
