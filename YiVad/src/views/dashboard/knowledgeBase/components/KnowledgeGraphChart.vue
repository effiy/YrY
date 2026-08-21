<template>
  <div class="knowledge-graph-chart" v-if="hasData">
    <div class="kgc-header">
      <span class="kgc-title">Knowledge Graph</span>
      <span class="kgc-summary">{{ nodeCount }} nodes, {{ linkCount }} relations</span>
    </div>
    <ECharts :option="option" height="400" @chart-click="onNodeClick" />
  </div>
</template>

<script setup lang="ts" name="KnowledgeGraphChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { KnowledgeFileSummary } from "@/api/interface/yiweb";

const props = defineProps<{
  files: KnowledgeFileSummary[];
  highlightPath?: string;
}>();

const emit = defineEmits<{
  (e: "select-node", path: string): void;
}>();

const CATEGORY_COLORS: Record<string, string> = {
  engineer: "#5470c6",
  leader: "#91cc75",
  producter: "#fac858",
  executiver: "#ee6666",
  curator: "#73c0de",
  srer: "#fc8452",
  aier: "#9a60b4",
};

interface GraphNode {
  id: string;
  name: string;
  category: string;
  symbolSize: number;
  itemStyle: { color: string };
  label: { show: boolean; fontSize: number };
}

interface GraphLink {
  source: string;
  target: string;
  lineStyle: { color: string; width: number; opacity: number };
}

const hasData = computed(() => {
  return props.files.some(f => (f.related || []).length > 0);
});

const nodeCount = computed(() => {
  const nodes = new Set<string>();
  for (const f of props.files) {
    nodes.add(f.path);
    for (const r of f.related || []) {
      nodes.add(r);
    }
  }
  return nodes.size;
});

const linkCount = computed(() => {
  return props.files.reduce((sum, f) => sum + (f.related || []).length, 0);
});

const option = computed<any>(() => {
  const filesWithRels = props.files.filter(f => (f.related || []).length > 0).slice(0, 50);
  const nodeSet = new Set<string>();
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  for (const f of filesWithRels) {
    if (!nodeSet.has(f.path)) {
      const cat = f.category || f.path.split("/")[0] || "other";
      nodeSet.add(f.path);
      const isHighlight = f.path === props.highlightPath;
      nodes.push({
        id: f.path,
        name: (f.title || f.path.split("/").pop() || f.path).slice(0, 25),
        category: cat,
        symbolSize: isHighlight ? 28 : 14,
        itemStyle: { color: CATEGORY_COLORS[cat] || "#909399" },
        label: { show: isHighlight || filesWithRels.length < 20, fontSize: 9 },
      });
    }
    for (const r of f.related || []) {
      if (!nodeSet.has(r)) {
        const cat = r.split("/")[0] || "other";
        nodeSet.add(r);
        nodes.push({
          id: r,
          name: r.split("/").pop()?.replace(/\.md$/, "").slice(0, 20) || r.slice(0, 20),
          category: cat,
          symbolSize: 10,
          itemStyle: { color: CATEGORY_COLORS[cat] || "#c0c4cc" },
          label: { show: false, fontSize: 8 },
        });
      }
      links.push({
        source: f.path,
        target: r,
        lineStyle: { color: "#c0c4cc", width: 1, opacity: 0.6 },
      });
    }
  }

  return {
    tooltip: {
      formatter: (p: any) => {
        if (p.dataType === "node") return `<b>${p.name}</b><br/>${p.data.id}`;
        return `${p.data.source} → ${p.data.target}`;
      },
    },
    legend: {
      data: Object.keys(CATEGORY_COLORS),
      bottom: 0,
      textStyle: { fontSize: 10 },
    },
    series: [{
      type: "graph",
      layout: "force",
      roam: true,
      draggable: true,
      force: { repulsion: 200, gravity: 0.1, edgeLength: [80, 200] },
      categories: Object.entries(CATEGORY_COLORS).map(([name, color]) => ({ name, itemStyle: { color } })),
      data: nodes,
      links,
      label: { position: "right", fontSize: 9 },
      emphasis: { focus: "adjacency", label: { show: true, fontSize: 12 } },
      lineStyle: { color: "source", curveness: 0.2 },
    }],
  };
});

function onNodeClick(event: any) {
  if (event.dataType === "node" && event.data?.id) {
    emit("select-node", event.data.id);
  }
}
</script>

<style scoped lang="scss">
.knowledge-graph-chart {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}
.kgc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.kgc-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.kgc-summary {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
</style>