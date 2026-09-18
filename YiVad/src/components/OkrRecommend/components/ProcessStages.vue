<script setup lang="ts">
/**
 * ProcessStages — reusable process stage indicators.
 * Used by OkrRecommendTable, List, and Card views.
 */
import { STAGE_KEYS, stageIcon, stageLabel } from "@/hooks/useOkrFormat";

defineProps<{
  groups: Array<{
    loopId: string;
    title: string;
    stageMap: Record<string, { status: string; title: string; path: string }>;
  }>;
}>();

const emit = defineEmits<{
  goToProcess: [loopId: string];
  openRecord: [path: string];
}>();
</script>

<template>
  <div v-for="group in groups" :key="group.loopId" class="okr-rec__process-loop">
    <div class="okr-rec__process-loop-id" @click="emit('goToProcess', group.loopId)" :title="group.loopId">{{ group.title }}</div>
    <div class="okr-rec__process-stages">
      <span
        v-for="sk in STAGE_KEYS"
        :key="sk"
        class="okr-rec__process-stage"
        :class="{ 'is-done': group.stageMap[sk]?.status === 'done', 'is-filled': !!group.stageMap[sk] }"
        :title="group.stageMap[sk] ? `${stageIcon(sk)} ${stageLabel(sk)} — ${group.stageMap[sk]!.title}` : stageLabel(sk)"
        @click="group.stageMap[sk] && emit('openRecord', group.stageMap[sk]!.path)"
        >{{ stageIcon(sk) }}</span
      >
    </div>
  </div>
</template>

<style scoped lang="scss">
.okr-rec__process-loop {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.okr-rec__process-loop-id {
  width: fit-content;
  max-width: 220px;
  padding: 2px 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-color-primary);
  white-space: nowrap;
  cursor: pointer;
  background: var(--el-color-primary-light-9);
  border-radius: 3px;
  &:hover {
    background: var(--el-color-primary-light-7);
  }
}
.okr-rec__process-stages {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.okr-rec__process-stage {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 12px;
  cursor: default;
  background: var(--el-fill-color);
  border-radius: 4px;
  opacity: 0.35;
  transition:
    opacity 0.15s,
    background 0.15s;
  &.is-filled {
    cursor: pointer;
    opacity: 0.7;
  }
  &.is-done {
    cursor: pointer;
    background: var(--el-color-success-light-9);
    opacity: 1;
  }
  &.is-filled:hover {
    background: var(--el-fill-color-light);
    opacity: 1;
  }
  &.is-done:hover {
    background: var(--el-color-success-light-8);
    opacity: 1;
  }
}
</style>
