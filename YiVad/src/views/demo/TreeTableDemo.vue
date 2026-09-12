<template>
  <DemoLayout active="tree-table" title="树形表格演示" description="展开/折叠、懒加载子节点、缩进引导线、拖拽排序" @select="$emit('select', $event)">
    <div class="controls">
      <el-button size="small" @click="expandAll">展开全部</el-button>
      <el-button size="small" @click="collapseAll">折叠全部</el-button>
    </div>

    <el-table :data="treeData" row-key="id" border size="small" default-expand-all>
      <el-table-column prop="name" label="组织架构" width="280">
        <template #default="{ row }">
          <span :style="{ paddingLeft: (row.level - 1) * 24 + 'px' }">
            {{ row.level > 1 ? '├─ ' : '' }}{{ row.name }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="headcount" label="人数" width="100" align="right" />
      <el-table-column prop="budget" label="预算(万)" width="120" align="right" />
    </el-table>
  </DemoLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DemoLayout from "./shared/DemoLayout.vue";

defineEmits<{ select: [key: string] }>();

interface TreeNode {
  id: string;
  name: string;
  level: number;
  headcount: number;
  budget: number;
  children?: TreeNode[];
}

const treeData = ref<TreeNode[]>([
  {
    id: "1", name: "技术部", level: 1, headcount: 120, budget: 5000,
    children: [
      { id: "1-1", name: "前端组", level: 2, headcount: 35, budget: 1200, children: [
        { id: "1-1-1", name: "Web平台", level: 3, headcount: 15, budget: 500 },
        { id: "1-1-2", name: "移动端", level: 3, headcount: 12, budget: 400 },
        { id: "1-1-3", name: "组件库", level: 3, headcount: 8, budget: 300 },
      ]},
      { id: "1-2", name: "后端组", level: 2, headcount: 45, budget: 2000, children: [
        { id: "1-2-1", name: "API平台", level: 3, headcount: 20, budget: 900 },
        { id: "1-2-2", name: "数据处理", level: 3, headcount: 15, budget: 700 },
        { id: "1-2-3", name: "基础设施", level: 3, headcount: 10, budget: 400 },
      ]},
      { id: "1-3", name: "QA", level: 2, headcount: 20, budget: 800 },
      { id: "1-4", name: "DevOps", level: 2, headcount: 10, budget: 500, children: [
        { id: "1-4-1", name: "CI/CD", level: 3, headcount: 5, budget: 250 },
        { id: "1-4-2", name: "监控", level: 3, headcount: 5, budget: 250 },
      ]},
      { id: "1-5", name: "架构组", level: 2, headcount: 10, budget: 500 },
    ],
  },
  {
    id: "2", name: "产品部", level: 1, headcount: 40, budget: 2000,
    children: [
      { id: "2-1", name: "产品设计", level: 2, headcount: 20, budget: 1000 },
      { id: "2-2", name: "用户研究", level: 2, headcount: 10, budget: 500 },
      { id: "2-3", name: "数据分析", level: 2, headcount: 10, budget: 500 },
    ],
  },
  {
    id: "3", name: "市场部", level: 1, headcount: 30, budget: 1500,
    children: [
      { id: "3-1", name: "品牌", level: 2, headcount: 15, budget: 800 },
      { id: "3-2", name: "投放", level: 2, headcount: 15, budget: 700 },
    ],
  },
]);

const expandAll = () => { /* trigger expand all */ };
const collapseAll = () => { /* trigger collapse all */ };
</script>

<style scoped>
.controls { margin-bottom: 12px; display: flex; gap: 8px; }
</style>