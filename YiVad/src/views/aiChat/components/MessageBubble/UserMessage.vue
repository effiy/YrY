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
const hasWebSearch = computed(() => !!props.message.searchContext);
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
  <WebSearchResults v-if="hasWebSearch" :results="store.webSearchResults" />
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
  border-radius: 8px;
}
.mb-markdown {
  overflow-wrap: anywhere;
}
.mb-markdown :deep(p) {
  margin: 0 0 4px;
}
.mb-markdown :deep(pre) {
  padding: 8px;
  overflow-x: auto;
  font-size: 12px;
  background: var(--el-fill-color);
  border-radius: 6px;
}
.mb-markdown :deep(code) {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
}
.mb-web-indicator {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  margin-top: 6px;
  padding: 2px 8px;
  font-size: 11px;
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  border-radius: 10px;
}
</style>