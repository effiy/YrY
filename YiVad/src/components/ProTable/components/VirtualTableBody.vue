<template>
  <div class="virtual-table-body" :style="{ height: totalHeight + 'px', position: 'relative' }">
    <div class="virtual-table-body__spacer" :style="{ height: offsetTop + 'px' }" />
    <slot v-bind="{ start, end }" />
    <div class="virtual-table-body__spacer" :style="{ height: bottomSpacer + 'px' }" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    totalHeight: number;
    offsetTop: number;
    start: number;
    end: number;
    totalRows: number;
    rowHeight: number;
    /** Indices of rows containing merged cells — these rows are never recycled. */
    mergedRowIndices?: Set<number>;
    /** Optional per-row height (for variable-height mode). */
    rowHeights?: number[];
  }>(),
  {
    mergedRowIndices: () => new Set()
  }
);

const renderedRowCount = computed(() => {
  // Count merged rows between start and end that need extra space
  let count = props.end - props.start;
  for (let i = props.start; i < props.end; i++) {
    if (props.mergedRowIndices!.has(i)) count++;
  }
  return count;
});

const bottomSpacer = computed(() => {
  if (props.rowHeights && props.rowHeights.length > 0) {
    // Variable-height: remaining height after rendered rows
    let renderedHeight = 0;
    for (let i = props.start; i < props.end; i++) {
      renderedHeight += props.rowHeights[i] || props.rowHeight;
    }
    return Math.max(0, props.totalHeight - props.offsetTop - renderedHeight);
  }
  return Math.max(0, props.totalHeight - props.offsetTop - renderedRowCount.value * props.rowHeight);
});
</script>

<style scoped lang="scss">
.virtual-table-body {
  min-height: 0;
  contain: layout style;
}
</style>
