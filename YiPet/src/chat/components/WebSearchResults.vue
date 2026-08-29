<!--
  WebSearchResults — displays web search result citations below a chat message.
  Each result shows title (linked), URL, and snippet.
  Mirrors YiVad aiChat's WebSearchResults.vue.
-->
<script setup lang="ts">
import type { WebSearchResult } from '../types';

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

<style lang="scss" scoped>
.wsr {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed var(--border-secondary, rgba(167, 139, 250, 0.18));
}

.wsr-hd {
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary, #d4d0e8);
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
  color: var(--text-primary, #f5f3ff);
  text-decoration: none;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  transition: background 0.1s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);

    .wsr-title {
      color: var(--primary-light, #818cf8);
      text-decoration: underline;
    }
  }
}

.wsr-idx {
  flex-shrink: 0;
  font-weight: 600;
  color: var(--primary-light, #818cf8);
}

.wsr-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.wsr-title {
  font-weight: 500;
  color: var(--text-primary, #f5f3ff);
}

.wsr-url {
  font-size: 10px;
  color: #22c55e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wsr-snippet {
  font-size: 11px;
  color: var(--text-secondary, #d4d0e8);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>