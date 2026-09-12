<template>
  <div ref="gridRef" class="dashboard-grid">
    <div
      v-for="card in cards"
      :key="card.key"
      class="dashboard-grid__item"
      :style="itemStyle(card)"
    >
      <slot :name="card.key" :card="card" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends { key: string; x: number; y: number; w: number; h: number }">
import { ref } from "vue";

defineProps<{ cards: T[] }>();

const gridRef = ref<HTMLDivElement>();

function itemStyle(card: T) {
  return {
    gridColumn: `${card.x + 1} / span ${card.w}`,
    gridRow: `${card.y + 1} / span ${card.h}`,
  };
}
</script>

<style scoped lang="scss">
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(120px, auto);
  gap: 16px;
  &__item { min-height: 0; }
}
</style>