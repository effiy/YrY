<template>
  <div class="issue-list__header-pills">
    <el-tooltip content="Click to clear all filters" placement="bottom">
      <div class="issue-list__header-pill issue-list__header-pill--clickable" @click="handleClearAll">
        <span class="issue-list__header-pill-val">{{ fmt(total) }}</span>
        <span class="issue-list__header-pill-lbl">Total</span>
      </div>
    </el-tooltip>
    <div class="issue-list__header-pill">
      <span class="issue-list__header-pill-val">{{ sourcesCount }}</span>
      <span class="issue-list__header-pill-lbl">Sources</span>
    </div>
    <div class="issue-list__header-pill">
      <span class="issue-list__header-pill-val">{{ categoriesCount }}</span>
      <span class="issue-list__header-pill-lbl">Categories</span>
    </div>
    <el-tooltip content="Click to toggle body-missing filter" placement="bottom">
      <div
        class="issue-list__header-pill issue-list__header-pill--clickable"
        :class="[bodyMissingClass, { 'issue-list__header-pill--active': bodyMissingActive }]"
        @click="handleFilterBodyMissing"
      >
        <span class="issue-list__header-pill-val">{{ bodyMissingPct }}%</span>
        <span class="issue-list__header-pill-lbl">No Body</span>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts" name="StatPills">
import { computed } from "vue";

interface Props {
  total?: number;
  sourcesCount?: number;
  categoriesCount?: number;
  bodyMissingPct?: number;
  bodyMissingActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  total: 0,
  sourcesCount: 0,
  categoriesCount: 0,
  bodyMissingPct: 0,
  bodyMissingActive: false
});

const emit = defineEmits<{
  (e: "clearAll"): void;
  (e: "filterBodyMissing"): void;
}>();

const bodyMissingClass = computed(() => {
  const pct = props.bodyMissingPct;
  if (pct > 20) return "issue-list__header-pill--danger";
  if (pct > 5) return "issue-list__header-pill--warning";
  return "issue-list__header-pill--ok";
});

function handleClearAll() {
  emit("clearAll");
}
function handleFilterBodyMissing() {
  emit("filterBodyMissing");
}
function fmt(n: number): string {
  return n.toLocaleString();
}
</script>

<style scoped lang="scss">
.issue-list__header-pills {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
}
.issue-list__header-pill {
  display: flex;
  flex-direction: column;
  gap: 1px;
  align-items: center;
  min-width: 64px;
  padding: 6px 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
  &--ok {
    background: #e8f5e9;
    .issue-list__header-pill-val {
      color: #2e7d32;
    }
  }
  &--warning {
    background: #fff8e1;
    .issue-list__header-pill-val {
      color: #f57f17;
    }
  }
  &--danger {
    background: #ffebee;
    .issue-list__header-pill-val {
      color: #c62828;
    }
  }
  &--active {
    box-shadow: 0 0 0 2px var(--el-color-primary);
  }
}
.issue-list__header-pill-val {
  font-family: DIN, sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
}
.issue-list__header-pill-lbl {
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.issue-list__header-pill--clickable {
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.15s,
    box-shadow 0.2s ease;
  &:hover {
    background: var(--el-fill-color);
    transform: translateY(-1px);
  }
}
</style>
