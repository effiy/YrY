<script setup lang="ts" name="AiChatBox">
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useKnowledgeTreeStore } from "@/stores/modules/knowledgeTree";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useResizable } from "@/hooks/useResizable";
import MessageList from "@/views/aiChat/components/MessageList.vue";
import QuickButtons from "@/views/aiChat/components/QuickButtons.vue";
import ChatInput from "@/views/aiChat/components/ChatInput.vue";
import ConversationSessionSidebar from "@/views/aiChat/components/ConversationSessionSidebar.vue";
import LlamaIndexPanel from "@/views/aiChat/components/LlamaIndexPanel.vue";

const props = withDefaults(
  defineProps<{
    /** System prompt — passed to the LLM as `system` on the next send.
     *  Story's file-preview chat feeds file content via this. */
    systemPrompt?: string;
    /** Optional header title. Renders a slim header row above MessageList. */
    title?: string;
    /** Drop the active conversation reference on unmount so the next mount
     *  starts fresh. Previous conversations stay in /aiChat's list. */
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
const knowledgeStore = useKnowledgeTreeStore();

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
  return tags
    .filter(t => typeof t === "string" && t.startsWith(CTX_PREFIX))
    .map(t => (t as string).slice(CTX_PREFIX.length));
});

const ragScopeTitle = computed(() => store.activeConversation?.title || "");

provide("aiChatBoxCollapse", {
  collapsible: props.collapsible,
  side: props.side,
  toggle: toggleCollapse
});

onMounted(() => {
  if (!store.conversations.length) {
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

// ── Drop zone: drag a knowledge file from the left sidebar to create a session ──

const isDragOver = ref(false);
let dragOverCounter = 0;

function onDragOver(e: DragEvent) {
  if (!e.dataTransfer?.types.includes("application/x-knowledge-file")) return;
  e.preventDefault();
  e.dataTransfer!.dropEffect = "link";
}

function onDragEnter(e: DragEvent) {
  if (!e.dataTransfer?.types.includes("application/x-knowledge-file")) return;
  e.preventDefault();
  dragOverCounter++;
  isDragOver.value = true;
}

function onDragLeave(e: DragEvent) {
  if (!e.dataTransfer?.types.includes("application/x-knowledge-file")) return;
  dragOverCounter--;
  if (dragOverCounter <= 0) {
    dragOverCounter = 0;
    isDragOver.value = false;
  }
}

/** Recursively collect all file entries from a drag tree. */
function collectDragFiles(
  nodes: Array<{ type: string; name: string; path: string; content?: string; tags?: string[]; children?: any[] }>
): Array<{ path: string; content: string; title: string; tags: string[] }> {
  const out: Array<{ path: string; content: string; title: string; tags: string[] }> = [];
  for (const n of nodes) {
    if (n.type === "file") {
      out.push({ path: n.path, content: n.content || "", title: n.name, tags: n.tags || [] });
    }
    if (n.children?.length) {
      out.push(...collectDragFiles(n.children));
    }
  }
  return out;
}

async function onDrop(e: DragEvent) {
  isDragOver.value = false;
  dragOverCounter = 0;
  const raw = e.dataTransfer?.getData("application/x-knowledge-file");
  if (!raw) return;
  e.preventDefault();
  try {
    const parsed = JSON.parse(raw);
    const nodes = Array.isArray(parsed) ? parsed : [parsed];
    const files = collectDragFiles(nodes);

    // Load content for any file that didn't have it in the drag payload
    const needsContent = files.filter(f => !f.content && f.path);
    if (needsContent.length) {
      const results = await Promise.allSettled(
        needsContent.map(f => readKnowledgeFile(f.path).catch(() => null))
      );
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) {
          needsContent[i].content = r.value.content || "";
        }
      });
    }

    for (const f of files) {
      if (!f.path) continue;
      await knowledgeStore.ensureKnowledgeSession(f.path, f.content, { title: f.title, tags: f.tags });
    }
    if (files.length && files[0].path) {
      await store.selectConversation(files[0].path);
    }
  } catch {
    /* silently ignore malformed drag data */
  }
}
</script>

<template>
  <div
    class="ai-chat-box"
    :class="[`ai-chat-box--${side}`, { 'is-collapsed': collapsed, 'is-dragging': isResizing }]"
    :style="containerStyle"
  >
    <!-- Side-panel drag handle -->
    <div
      v-if="showResizer"
      class="ai-chat-box__resizer"
      :class="`ai-chat-box__resizer--${side}`"
      @pointerdown="startResize"
    />

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
          <!-- Chat area with drop zone -->
          <div
            class="ai-chat-box__chat"
            :class="{ 'is-drag-over': isDragOver }"
            @dragover="onDragOver"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @drop="onDrop"
          >
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
            <!-- Drop overlay -->
            <div v-if="isDragOver" class="ai-chat-box__drop-overlay">
              <div class="ai-chat-box__drop-hint">
                <span class="ai-chat-box__drop-icon">📄</span>
                <span>Drop to start a new chat session</span>
              </div>
            </div>
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
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: transparent;
  transition: width 0.15s;
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
  width: 4px;
  flex-shrink: 0;
  cursor: col-resize;
  background: var(--el-border-color-lighter);
  transition: background 0.15s;
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
  background: var(--el-color-primary-light-9);
  pointer-events: none;
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
  transition: background 0.15s;
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
  transition: background 0.15s, color 0.15s;
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
</style>
