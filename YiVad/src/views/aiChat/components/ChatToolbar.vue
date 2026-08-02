<script setup lang="ts" name="aiChatToolbar">
import { inject, ref, computed } from "vue";
import {
  ChatLineSquare, Picture, PriceTag, ChatDotRound, Search, Loading,
  ArrowLeft, ArrowRight, CollectionTag, Delete
} from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import RequestStatusButton from "./RequestStatusButton.vue";
import FaqPopover from "./FaqPopover.vue";

const props = withDefaults(
  defineProps<{
    faqActive?: boolean;
    sending?: boolean;
    streamingType?: "" | "send" | "regenerate" | "resend";
    ragToggle?: boolean;
    ragAvailable?: boolean;
    webSearchToggle?: boolean;
    /** List of ctx:-tagged file paths (without the ctx: prefix) */
    contextFiles?: string[];
  }>(),
  { faqActive: false, sending: false, streamingType: "", ragToggle: false, ragAvailable: false, webSearchToggle: false, contextFiles: () => [] }
);

const emit = defineEmits<{
  (e: "toggle-faq"): void;
  (e: "pick-image"): void;
  (e: "manage-tags"): void;
  (e: "open-wechat"): void;
  (e: "toggle-rag"): void;
  (e: "toggle-web-search"): void;
  (e: "stop"): void;
  (e: "remove-context-file", path: string): void;
}>();

const collapseCtx = inject<{ collapsible: boolean; side: "fill" | "right" | "left"; toggle: () => void } | null>(
  "aiChatBoxCollapse", null
);

const contextPopoverVisible = ref(false);
const contextFileCount = computed(() => (props.contextFiles ?? []).length);

// ── Tool execution status (Pi-inspired: tool_execution_start/end events) ──
const store = useAiChatStore();
const runningTools = computed(() => {
  const events = store.toolEvents ?? [];
  const started = new Set<string>();
  const ended = new Set<string>();
  for (const e of events) {
    if (e.phase === "start") started.add(e.name);
    if (e.phase === "end") ended.add(e.name);
  }
  return [...started].filter(n => !ended.has(n))
    .map(n => events.find(e => e.name === n && e.phase === "start"))
    .filter(Boolean) as Array<{ name: string; label: string }>;
});
</script>

<template>
  <div class="ct-toolbar">
    <div class="ct-left">
      <el-tooltip v-if="collapseCtx?.collapsible" content="Collapse chat" placement="bottom">
        <el-button circle size="default" :aria-label="'Collapse chat'" @click="collapseCtx?.toggle()">
          <el-icon><ArrowRight v-if="collapseCtx?.side === 'right'" /><ArrowLeft v-else /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="FAQ" placement="bottom">
        <el-button circle size="default" :icon="ChatLineSquare" :type="faqActive ? 'primary' : ''" @click="emit('toggle-faq')" />
      </el-tooltip>
      <FaqPopover />
      <el-tooltip content="Upload image" placement="bottom">
        <el-button circle size="default" :icon="Picture" :disabled="sending" @click="emit('pick-image')" />
      </el-tooltip>
      <el-tooltip content="Manage tags" placement="bottom">
        <el-button circle size="default" :icon="PriceTag" @click="emit('manage-tags')" />
      </el-tooltip>
      <el-tooltip content="WeCom bot settings" placement="bottom">
        <el-button circle size="default" :icon="ChatDotRound" @click="emit('open-wechat')" />
      </el-tooltip>
    </div>
    <div class="ct-right">
      <!-- Context files pill -->
      <el-popover
        v-if="contextFileCount > 0"
        v-model:visible="contextPopoverVisible"
        placement="bottom"
        :width="280"
        trigger="click"
      >
        <template #reference>
          <div class="ct-pill on" title="Current context files">
            <el-icon :size="14"><CollectionTag /></el-icon>
            <span class="ct-pill-label">Context: {{ contextFileCount }}</span>
          </div>
        </template>
        <div class="ct-context-list">
          <div
            v-for="file in (contextFiles ?? [])"
            :key="file"
            class="ct-context-item"
          >
            <span class="ct-context-item-path">{{ file }}</span>
            <el-button
              size="small"
              text
              type="danger"
              :icon="Delete"
              title="Remove from context"
              @click="emit('remove-context-file', file)"
            />
          </div>
          <div v-if="(contextFiles ?? []).length === 0" class="ct-context-empty">
            No context files loaded
          </div>
        </div>
      </el-popover>
      <div
        class="ct-pill" :class="{ on: webSearchToggle }"
        :title="webSearchToggle ? 'Web search on — ' + (store.activeTools.find(t => t.name === 'web_search')?.promptSnippet || 'answers include internet results') : 'Web search off — toggle to search the web'"
        @click="emit('toggle-web-search')"
      >
        <el-icon :size="14"><Search /></el-icon>
        <span class="ct-pill-label">Web</span>
        <el-switch :model-value="webSearchToggle" size="small" @click.stop @update:model-value="emit('toggle-web-search')" />
      </div>
      <div
        class="ct-pill" :class="{ on: ragToggle }"
        :title="ragToggle ? 'RAG on — ' + (store.activeTools.find(t => t.name === 'rag_search')?.promptSnippet || 'answers grounded in context files') : 'RAG off — direct chat'"
        @click="emit('toggle-rag')"
      >
        <span class="ct-pill-label">RAG</span>
        <el-switch :model-value="ragToggle" :disabled="!ragAvailable" size="small" @click.stop @update:model-value="emit('toggle-rag')" />
      </div>
      <!-- Tool execution indicator (Pi-inspired) -->
      <div v-for="tool in runningTools" :key="tool.name" class="ct-pill on" :title="`Running: ${tool.label}`">
        <el-icon :size="14" class="ct-spin"><Loading /></el-icon>
        <span class="ct-pill-label">{{ tool.label }}</span>
      </div>
      <RequestStatusButton :sending="sending" :streaming-type="streamingType" @stop="emit('stop')" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ct-toolbar { display: flex; gap: 8px; align-items: center; justify-content: space-between; padding: 6px 12px; background: var(--el-bg-color); border-bottom: 1px solid var(--el-border-color-lighter); }
.ct-left, .ct-right { display: flex; gap: 6px; align-items: center; }
.ct-pill { display: inline-flex; gap: 6px; align-items: center; height: 28px; padding: 0 10px; font-size: 12px; color: var(--el-text-color-placeholder); cursor: pointer; user-select: none; background: var(--el-fill-color-blank); border: 1px solid var(--el-border-color-light); border-radius: 14px; transition: all .15s; }
.ct-pill.on { color: var(--el-color-primary); background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-5); }
.ct-spin { animation: ct-spin 1s linear infinite; }
@keyframes ct-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.ct-pill-label { line-height: 1; }
.ct-context-list { max-height: 240px; overflow-y: auto; }
.ct-context-item { display: flex; gap: 4px; align-items: center; padding: 4px 0; font-size: 12px; font-family: "SF Mono", Menlo, monospace; }
.ct-context-item+.ct-context-item { border-top: 1px solid var(--el-border-color-lighter); }
.ct-context-item-path { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--el-text-color-regular); }
.ct-context-empty { padding: 8px 0; font-size: 12px; color: var(--el-text-color-placeholder); text-align: center; }
</style>
