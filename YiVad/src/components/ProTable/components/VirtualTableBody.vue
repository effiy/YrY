<template>
  <div class="virtual-table-body" :style="{ height: totalHeight + 'px', position: 'relative' }">
    <div class="virtual-table-body__spacer" :style="{ height: offsetTop + 'px' }" />
    <slot v-bind="{ start, end }" />
    <div class="virtual-table-body__spacer" :style="{ height: bottomSpacer + 'px' }" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  totalHeight: number;
  offsetTop: number;
  start: number;
  end: number;
  totalRows: number;
  rowHeight: number;
}>();

const bottomSpacer = computed(() =>
  Math.max(0, props.totalHeight - props.offsetTop - (props.end - props.start) * props.rowHeight),
);
</script>

<style scoped lang="scss">
.virtual-table-body {
  contain: layout style;
  min-height: 0;
}
</style>