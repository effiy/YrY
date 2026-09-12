<template>
  <div class="source-cat-chart" v-if="hasData">
    <div class="scc-header">
      <span class="scc-title">Source Categories</span>
    </div>
    <ECharts :option="option" height="200" />
  </div>
</template>

<script setup lang="ts" name="SourceCategoryChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface RagSource {
  score: number;
  file_path: string;
  metadata?: { category?: string; type?: string };
}

const props = defineProps<{
  sources: RagSource[];
}>();

const PALETTE = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#fc8452", "#9a60b4", "#ea7ccc"];

const hasData = computed(() => props.sources.length > 0);

const option = computed<ECOption>(() => {
  const catMap = new Map<string, number>();
  for (const s of props.sources) {
    const cat = s.metadata?.category || s.file_path.split("/")[0] || "unknown";
    catMap.set(cat, (catMap.get(cat) || 0) + 1);
  }
  const items = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      itemStyle: { color: PALETTE[i % PALETTE.length] },
    }));
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: 0, top: "center", itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 10 } },
    series: [{
      type: "pie", radius: ["45%", "70%"], center: ["55%", "50%"],
      label: { fontSize: 10, formatter: "{b}\n{d}%" },
      emphasis: { label: { fontSize: 14, fontWeight: "bold" } },
      data: items,
    }],
  };
});
</script>

<style scoped lang="scss">
.source-cat-chart {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}
.scc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.scc-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
</style>