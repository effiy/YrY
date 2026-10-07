<template>
  <div v-if="displayItems.length" class="rv-strip">
    <span class="rv-label">{{ label }}</span>
    <button
      v-for="item in displayItems"
      :key="item.key"
      type="button"
      class="rv-chip"
      :title="item.title"
      @click="$emit('click', item.key)"
    >
      <span v-if="item.color" class="rv-dot" :style="{ background: item.color }" />
      <code class="rv-key">{{ item.key }}</code>
      <span class="rv-title">{{ item.title }}</span>
    </button>
    <button type="button" class="rv-clear" @click="$emit('clear')" title="Clear recently viewed">✕</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface RecentItem {
  key: string;
  title: string;
  color?: string;
}

const props = withDefaults(defineProps<{
  items: RecentItem[];
  label?: string;
  maxItems?: number;
}>(), {
  label: "Recently viewed",
  maxItems: 8,
});

defineEmits<{
  (e: "click", key: string): void;
  (e: "clear"): void;
}>();

const displayItems = computed(() => props.items.slice(0, props.maxItems));
</script>

<style scoped lang="scss">
.rv-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 8px 14px;
  margin-bottom: 16px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.rv-label {
  margin-right: 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.rv-chip {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 2px 10px;
  font-size: 12px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 1px 6px rgb(0 0 0 / 8%);
  }
}
.rv-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.rv-key {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.rv-title {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rv-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  margin-left: auto;
  font-size: 12px;
  line-height: 1;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 50%;
  transition: all 0.15s;
  &:hover {
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }
}
</style>