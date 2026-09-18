<script setup lang="ts" name="aiChatUserMessage">
import { computed } from "vue";
import { Clock, Search } from "@element-plus/icons-vue";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useAiChatStore } from "@/stores/modules/aiChat";
import type { ChatMessage } from "@/api/interface/yiAi";
import WebSearchResults from "../WebSearchResults.vue";

const props = defineProps<{
  message: ChatMessage;
  index: number;
  streaming: boolean;
}>();

const store = useAiChatStore();
const { render } = useMarkdown();

const html = computed(() => render(props.message.message ?? ""));
const hasWebSearch = computed(() => !!props.message.searchContext || !!props.message.searchResults?.length);
</script>

<template>
  <div v-if="props.message.imageDataUrls?.length" class="mb-images">
    <img v-for="(src, i) in props.message.imageDataUrls" :key="i" :src="src" class="mb-img" alt="" />
  </div>
  <div class="mb-markdown" v-html="html" />
  <div v-if="hasWebSearch" class="mb-web-indicator">
    <el-icon :size="12"><Search /></el-icon>
    <span>Web search results used</span>
  </div>
  <WebSearchResults v-if="hasWebSearch" :results="props.message.searchResults || []" />
</template>

<style scoped lang="scss">
.mb-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.mb-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: var(--radius-sm);
}
.mb-markdown {
  overflow-wrap: anywhere;
  line-height: 1.6;
  :deep(p) { margin: 0 0 6px; &:last-child { margin-bottom: 0; } }
  :deep(pre) {
    padding: 10px 14px; margin: 6px 0; overflow-x: auto;
    font-size: 12px; background: var(--el-fill-color);
    border: 1px solid var(--el-border-color-lighter); border-radius: var(--radius-sm);
  }
  :deep(code):not(pre code) {
    padding: 1px 5px; font-family: "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.9em; color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
    border: 1px solid var(--el-color-danger-light-7); border-radius: var(--radius-xs);
  }
  :deep(blockquote) {
    padding: 6px 14px; margin: 6px 0; color: var(--el-text-color-secondary);
    border-left: 3px solid var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
    border-radius: 0 var(--radius-xs) var(--radius-xs) 0;
  }
  :deep(a) { color: var(--el-color-primary); text-decoration: none; }
  :deep(ul), :deep(ol) { padding-left: 20px; margin: 4px 0; }
  :deep(li) { margin: 2px 0; }
  :deep(strong) { font-weight: 700; color: var(--el-text-color-primary); }
  :deep(hr) { height: 1px; margin: 10px 0; background: var(--el-border-color-lighter); border: none; }
}
.mb-web-indicator {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 8px;
  margin-top: 6px;
  font-size: 11px;
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  border-radius: 10px;
}
</style>
