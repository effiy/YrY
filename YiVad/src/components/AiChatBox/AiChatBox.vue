<script setup lang="ts" name="AiChatBox">
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useResizable } from "@/hooks/useResizable";
import MessageList from "@/views/aiChat/components/MessageList.vue";
import ChatInput from "@/views/aiChat/components/ChatInput.vue";

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

// Right-side panels drag the LEFT edge (drag right = shrink, hence invert).
// Left-side panels drag the RIGHT edge (drag right = grow, default).
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

// Expose collapse controls to the ChatToolbar (rendered deep inside ChatInput)
// so the collapse button can sit as the first icon in ct-left rather than in
// the panel header.
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
const showResizer = computed(() => props.resizable && isSide.value && !collapsed.value);
const showPanel = computed(() => !collapsed.value);

const containerStyle = computed(() => {
  if (!isSide.value) return {};
  // Collapsed keeps a sliver of width so the absolute-positioned expand tab
  // (width 20px, anchored to the outer edge) stays inside the box. At 0px
  // the parent's `overflow: hidden` clips the tab and the user has no way
  // to bring the panel back.
  return { width: collapsed.value ? "20px" : `${width.value}px` };
});
</script>

<template>
  <div
    class="ai-chat-box"
    :class="[`ai-chat-box--${side}`, { 'is-collapsed': collapsed, 'is-dragging': isResizing }]"
    :style="containerStyle"
  >
    <!-- Drag handle: lives on the panel's inner edge so dragging outward grows.
         The hit area is wider than the visible bar (8px vs 4px) for easier grabbing. -->
    <div
      v-if="showResizer"
      class="ai-chat-box__resizer"
      :class="`ai-chat-box__resizer--${side}`"
      @pointerdown="startResize"
    />

    <!-- Expand tab: only visible when collapsed. Sits on the panel's outer edge. -->
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
      <div v-if="title" class="ai-chat-box__hdr">
        <span class="ai-chat-box__title">{{ title }}</span>
      </div>
      <MessageList />
      <ChatInput />
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
