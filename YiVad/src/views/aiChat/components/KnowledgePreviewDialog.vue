<script setup lang="ts" name="aiChatKnowledgePreviewDialog">
import { ref, computed } from "vue";
import { useMarkdown } from "@/hooks/useMarkdown";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";

const { render } = useMarkdown();

const visible = ref(false);
const title = ref("");
const loading = ref(false);
const rawContent = ref("");

const htmlContent = computed(() => render(rawContent.value));

function open(path: string) {
  visible.value = true;
  title.value = path.split("/").pop() || path;
  loading.value = true;
  rawContent.value = "";
  readKnowledgeFile(path)
    .then(res => {
      rawContent.value = res.content || "";
    })
    .catch(() => {
      rawContent.value = "*Failed to load content.*";
    })
    .finally(() => {
      loading.value = false;
    });
}

function close() {
  visible.value = false;
}

defineExpose({ open });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="800px"
    top="5vh"
    :close-on-click-modal="true"
    append-to-body
    @close="close"
  >
    <div v-if="loading" class="kpd-loading">
      <el-icon class="is-loading" :size="20"><Loading /></el-icon>
      <span>Loading...</span>
    </div>
    <div v-else class="kpd-body" v-html="htmlContent" />
  </el-dialog>
</template>

<style scoped lang="scss">
.kpd-loading {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.kpd-body {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 4px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-primary);

  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    margin: 1em 0 0.5em;
  }
  :deep(h1) { font-size: 1.5em; }
  :deep(h2) { font-size: 1.3em; }
  :deep(h3) { font-size: 1.15em; }
  :deep(p) { margin: 0.5em 0; }
  :deep(pre) {
    padding: 12px;
    overflow-x: auto;
    font-size: 13px;
    background: var(--el-fill-color);
    border-radius: 6px;
  }
  :deep(code) {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 0.9em;
  }
  :deep(blockquote) {
    margin: 0.5em 0;
    padding: 4px 12px;
    border-left: 3px solid var(--el-color-primary-light-5);
    color: var(--el-text-color-secondary);
  }
  :deep(table) {
    border-collapse: collapse;
  }
  :deep(th), :deep(td) {
    padding: 6px 12px;
    border: 1px solid var(--el-border-color-lighter);
  }
}
</style>
