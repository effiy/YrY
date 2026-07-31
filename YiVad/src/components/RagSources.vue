<!--
  RagSources — renders a list of RAG source citations under a chat message.

  Each source is a clickable el-tag pointing to a file path relative to
  YiKnowledge. Clicking emits `open-file` so the parent can route the path
  to whatever viewer it uses (e.g. aicr CodeViewer via fileService.readFile).
-->
<script setup lang="ts">
import type { RagSource } from "@/api/interface/rag";

const props = defineProps<{
  sources: RagSource[];
}>();

const emit = defineEmits<{
  (e: "open-file", filePath: string): void;
}>();

function label(s: RagSource, idx: number): string {
  const p = s.file_path || s.metadata?.file_path || "(unknown)";
  const short = String(p).split("/").slice(-2).join("/");
  return `[${idx + 1}] ${short} · ${s.score.toFixed(2)}`;
}
</script>

<template>
  <div v-if="props.sources.length" class="rag-sources">
    <div class="rag-sources__title">来源</div>
    <div class="rag-sources__list">
      <el-tag
        v-for="(s, i) in props.sources"
        :key="i"
        size="small"
        type="info"
        effect="plain"
        class="rag-source-chip"
        :title="s.file_path"
        @click="emit('open-file', s.file_path)"
      >
        {{ label(s, i) }}
      </el-tag>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rag-sources {
  padding-top: 6px;
  margin-top: 8px;
  border-top: 1px dashed var(--el-border-color-lighter, #dcdfe6);
  &__title {
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
  }
  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}
.rag-source-chip {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
</style>
