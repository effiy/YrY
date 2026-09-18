<script setup lang="ts" name="SourceChip">
/**
 * Clickable source-chip showing a source's rank, file path, and relevance
 * score. Used in chat messages, comparison panels, and history detail drawers.
 */
import { scoreLabel, scoreColor } from "@/views/rag/constants";
import ScoreBar from "@/components/ScoreBar/index.vue";

defineProps<{
  source: { file_path: string; score: number };
  index: number;
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <div class="source-chip" @click="$emit('click')">
    <span class="source-chip__num">[{{ index + 1 }}]</span>
    <span class="source-chip__path">{{ source.file_path }}</span>
    <ScoreBar :score="source.score" :bar-width="36" :stroke-width="4" />
  </div>
</template>

<style scoped lang="scss">
.source-chip {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
  transition: background 0.15s;
  &:hover {
    background: var(--el-color-primary-light-7);
  }
  &__num {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 700;
    color: var(--el-color-primary);
  }
  &__path {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: monospace;
    font-size: 11px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
  }
}
</style>
