<template>
  <div class="issue-list__header-pills">
    <div class="issue-list__header-pill issue-list__header-pill--clickable" @click="handleClearAll">
      <span class="issue-list__header-pill-val">{{ total }}</span>
      <span class="issue-list__header-pill-lbl">Total</span>
    </div>
    <div class="issue-list__header-pill">
      <span class="issue-list__header-pill-val">{{ sourcesCount }}</span>
      <span class="issue-list__header-pill-lbl">Sources</span>
    </div>
    <div class="issue-list__header-pill">
      <span class="issue-list__header-pill-val">{{ categoriesCount }}</span>
      <span class="issue-list__header-pill-lbl">Categories</span>
    </div>
    <div class="issue-list__header-pill issue-list__header-pill--accent">
      <span class="issue-list__header-pill-val">{{ bodyMissingPct }}%</span>
      <span class="issue-list__header-pill-lbl">No Body</span>
    </div>
  </div>
</template>

<script setup lang="ts" name="StatPills">
interface Props {
  total: number;
  sourcesCount: number;
  categoriesCount: number;
  bodyMissingPct: number;
}

const props = withDefaults(defineProps<Props>(), {
  total: 0,
  sourcesCount: 0,
  categoriesCount: 0,
  bodyMissingPct: 0
});

const emit = defineEmits<{
  (e: "clearAll"): void;
}>();

function handleClearAll() {
  emit("clearAll");
}
</script>

<style scoped lang="scss">
.issue-list__header-pills {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.issue-list__header-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 16px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  min-width: 64px;
  &--accent {
    background: var(--el-color-primary-light-9);
  }
}
.issue-list__header-pill-val {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
  font-family: DIN, sans-serif;
}
.issue-list__header-pill--accent .issue-list__header-pill-val {
  color: var(--el-color-primary);
}
.issue-list__header-pill-lbl {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
}
.issue-list__header-pill--clickable {
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
  &:hover {
    background: var(--el-fill-color);
    transform: translateY(-1px);
  }
}
</style>
