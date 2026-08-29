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
      >{{ stageIcon(sk) }}</span>
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
  font-size: 11px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 2px 8px;
  border-radius: 3px;
  cursor: pointer;
  line-height: 1.4;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: fit-content;
  &:hover { background: var(--el-color-primary-light-7); }
}
.okr-rec__process-stages {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.okr-rec__process-stage {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 12px;
  border-radius: 4px;
  background: var(--el-fill-color);
  opacity: 0.35;
  cursor: default;
  transition: opacity 0.15s, background 0.15s;
  &.is-filled { opacity: 0.7; cursor: pointer; }
  &.is-done { opacity: 1; background: var(--el-color-success-light-9); cursor: pointer; }
  &.is-filled:hover { opacity: 1; background: var(--el-fill-color-light); }
  &.is-done:hover { opacity: 1; background: var(--el-color-success-light-8); }
}
</style>