<template>
  <div class="module-quality">
    <div class="mq-header">
      <span class="mq-header__col mq-header__col--name">Module</span>
      <span class="mq-header__col mq-header__col--bugs">Bugs</span>
      <span class="mq-header__col mq-header__col--rate">Bug Rate</span>
      <span class="mq-header__col mq-header__col--score">Quality Score</span>
    </div>
    <div class="mq-body">
      <div
        v-for="item in sortedData"
        :key="item.module"
        class="mq-row"
      >
        <span class="mq-row__col mq-row__col--name">{{ item.module }}</span>
        <span class="mq-row__col mq-row__col--bugs">
          {{ item.bugs }}
          <span v-if="item.critical > 0" class="mq-critical-tag">{{ item.critical }} crit</span>
        </span>
        <span class="mq-row__col mq-row__col--rate">{{ item.bug_rate }}%</span>
        <span class="mq-row__col mq-row__col--score">
          <span class="mq-score-bar" :style="scoreBarStyle(item.quality_score)">
            <span class="mq-score-bar__fill" :style="{ width: item.quality_score + '%' }" />
          </span>
          <span class="mq-score-value" :class="scoreClass(item.quality_score)">{{ item.quality_score }}</span>
        </span>
      </div>
      <div v-if="sortedData.length === 0" class="mq-empty">No module data available</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ModuleQuality } from "@/types/analytics";

interface Props {
  data: ModuleQuality[];
}

const props = defineProps<Props>();

const sortedData = computed(() =>
  [...props.data].sort((a, b) => a.quality_score - b.quality_score)
);

function scoreBarStyle(score: number) {
  return {
    background: score >= 80 ? "rgba(103,194,58,.12)" : score >= 60 ? "rgba(230,162,60,.12)" : "rgba(245,108,108,.12)"
  };
}

function scoreClass(score: number) {
  return score >= 80 ? "mq--good" : score >= 60 ? "mq--warn" : "mq--bad";
}
</script>

<style scoped lang="scss">
.module-quality {
  font-size: 13px;
}

.mq-header {
  display: flex;
  padding: 0 4px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 4px;

  &__col {
    font-size: 11px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;

    &--name { flex: 2; }
    &--bugs { flex: 1; text-align: center; }
    &--rate { flex: 0 0 64px; text-align: center; }
    &--score { flex: 1.5; text-align: right; }
  }
}

.mq-body {
  max-height: 300px;
  overflow-y: auto;
}

.mq-row {
  display: flex;
  align-items: center;
  padding: 6px 4px;
  border-radius: 4px;
  transition: background .15s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &__col {
    &--name {
      flex: 2;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &--bugs {
      flex: 1;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }
    &--rate {
      flex: 0 0 64px;
      text-align: center;
      font-variant-numeric: tabular-nums;
      color: var(--el-text-color-secondary);
    }
    &--score {
      flex: 1.5;
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-end;
    }
  }
}

.mq-critical-tag {
  font-size: 10px;
  color: #f56c6c;
  background: rgba(245,108,108,.1);
  border-radius: 3px;
  padding: 1px 4px;
  margin-left: 4px;
}

.mq-score-bar {
  width: 72px;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;

  &__fill {
    height: 100%;
    border-radius: 3px;
    transition: width .4s ease;
    background: currentColor;
  }
}

.mq-score-value {
  font-weight: 700;
  font-size: 12px;
  min-width: 28px;
  text-align: right;

  &.mq--good { color: #67c23a; }
  &.mq--warn { color: #e6a23c; }
  &.mq--bad  { color: #f56c6c; }
}

.mq-empty {
  text-align: center;
  padding: 32px;
  color: var(--el-text-color-secondary);
}
</style>