<!--
  WebSearchResults — displays web search result citations below a chat message.
  Each result shows title (linked), URL, and snippet.
-->
<script setup lang="ts" name="aiChatWebSearchResults">
import type { WebSearchResult } from "@/api/modules/searchService";

defineProps<{
  results: WebSearchResult[];
}>();
</script>

<template>
  <div v-if="results.length" class="wsr">
    <div class="wsr-hd">🌐 Web Results ({{ results.length }})</div>
    <div class="wsr-list">
      <a
        v-for="(r, i) in results"
        :key="i"
        class="wsr-item"
        :href="r.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="wsr-idx">{{ i + 1 }}.</span>
        <div class="wsr-body">
          <span class="wsr-title">{{ r.title }}</span>
          <span class="wsr-url">{{ r.url }}</span>
          <span v-if="r.snippet" class="wsr-snippet">{{ r.snippet }}</span>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wsr {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed var(--el-border-color-lighter);
}
.wsr-hd {
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.wsr-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wsr-item {
  display: flex;
  gap: 6px;
  padding: 6px 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  text-decoration: none;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  transition: background 0.1s;
}
.wsr-item:hover {
  background: var(--el-fill-color-light);
}
.wsr-idx {
  flex-shrink: 0;
  font-weight: 600;
  color: var(--el-color-primary);
}
.wsr-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.wsr-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.wsr-item:hover .wsr-title {
  color: var(--el-color-primary);
  text-decoration: underline;
}
.wsr-url {
  font-size: 10px;
  color: var(--el-color-success);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wsr-snippet {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
