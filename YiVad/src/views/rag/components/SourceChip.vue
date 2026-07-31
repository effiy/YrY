<script setup lang="ts" name="SourceChip">
/**
 * Clickable source-chip showing a source's rank, file path, and relevance
 * score. Used in chat messages, comparison panels, and history detail drawers.
 */
import { scoreLabel, scoreColor } from "@/views/rag/constants";
import ScoreBar from "./ScoreBar.vue";

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
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--el-color-primary-light-7);
  }

  &__num {
    font-size: 11px;
    font-weight: 700;
    color: var(--el-color-primary);
    flex-shrink: 0;
  }

  &__path {
    font-size: 11px;
    font-family: monospace;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--el-text-color-regular);
  }
}
</style>
