<script setup lang="ts" name="knowledgeGraph">
import { ref, watch, onMounted, nextTick } from "vue";

interface StoryDep {
  directory: string;
  dependsOn?: { directory: string }[];
}
interface StoryItem {
  name: string;
}
const props = defineProps<{ stories: StoryItem[]; deps: StoryDep[] }>();
const containerRef = ref<HTMLDivElement>();
let cyInstance: any = null;

async function initGraph() {
  if (!containerRef.value) return;
  if (cyInstance) {
    cyInstance.destroy();
    cyInstance = null;
  }
  const nodes = props.stories.map(s => ({ data: { id: s.name, label: s.name, color: "#409eff" } }));
  const edges: any[] = [];
  for (const dep of props.deps) {
    for (const d of dep.dependsOn || [])
      edges.push({ data: { id: `${d.directory}->${dep.directory}`, source: d.directory, target: dep.directory } });
  }
  try {
    const cytoscape = (await import("cytoscape")).default;
    await import("cytoscape-dagre");
    cyInstance = cytoscape({
      container: containerRef.value,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: "node",
          style: { "background-color": "data(color)", label: "data(label)", "font-size": "12px", width: 30, height: 30 }
        },
        {
          selector: "edge",
          style: { width: 2, "line-color": "#c0c4cc", "target-arrow-shape": "triangle", "curve-style": "bezier" }
        }
      ],
      layout: { name: "dagre", rankDir: "LR" } as any
    });
  } catch {
    /* cytoscape not available */
  }
}

watch(
  () => [props.stories, props.deps],
  () => nextTick(initGraph),
  { deep: true }
);
onMounted(() => nextTick(initGraph));
</script>

<template>
  <div class="knowledge-graph">
    <el-empty v-if="stories.length === 0" description="No data" />
    <div ref="containerRef" class="kg-container" :style="{ display: stories.length === 0 ? 'none' : 'block' }" />
  </div>
</template>

<style scoped lang="scss">
.knowledge-graph {
  width: 100%;
  min-height: 500px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color);
}
.kg-container {
  width: 100%;
  height: 500px;
}
</style>
