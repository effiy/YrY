<script setup lang="ts">
import { computed } from "vue";
import { useMarkdown } from "@/hooks/useMarkdown";

const props = withDefaults(defineProps<{ content: string; emptyText?: string }>(), {
  emptyText: "No content"
});

const { render } = useMarkdown();
const html = computed(() => render(props.content || ""));
const hasContent = computed(() => (props.content || "").trim().length > 0);
</script>

<template>
  <div v-if="hasContent" class="bug-content-section markdown-body" v-html="html" />
  <el-empty v-else :description="emptyText" :image-size="40" />
</template>

<style scoped>
.bug-content-section {
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}
.bug-content-section :deep(h1),
.bug-content-section :deep(h2),
.bug-content-section :deep(h3) {
  margin: 16px 0 8px;
  font-weight: 600;
}
.bug-content-section :deep(p) { margin: 0 0 8px; }
.bug-content-section :deep(ul),
.bug-content-section :deep(ol) { padding-left: 20px; margin: 0 0 8px; }
.bug-content-section :deep(li) { line-height: 1.8; }
.bug-content-section :deep(code) {
  padding: 1px 6px;
  font-family: monospace;
  font-size: 13px;
  background: var(--el-fill-color-light);
  border-radius: 3px;
}
.bug-content-section :deep(pre) {
  padding: 12px;
  overflow-x: auto;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}
.bug-content-section :deep(pre code) {
  padding: 0;
  background: none;
}
.bug-content-section :deep(blockquote) {
  padding: 4px 12px;
  margin: 0 0 8px;
  border-left: 3px solid var(--el-color-primary);
  color: var(--el-text-color-secondary);
}
</style>