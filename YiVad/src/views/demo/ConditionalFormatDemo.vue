<template>
  <DemoLayout active="conditional-format" title="条件格式演示" description="Excel风格条件格式：高亮、数据条、色阶、图标集" @select="$emit('select', $event)">
    <div class="controls">
      <el-button size="small" @click="addRule">添加规则</el-button>
      <el-button size="small" @click="clearRules">清除所有</el-button>
    </div>

    <el-table :data="demoData" border size="small" :cell-style="cellStyle">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="产品" width="120" />
      <el-table-column prop="sales" label="销量" width="100" align="right" />
      <el-table-column prop="margin" label="利润率" width="100" align="right">
        <template #default="{ row }">{{ row.margin }}%</template>
      </el-table-column>
      <el-table-column prop="rating" label="评级" width="80" />
    </el-table>

    <div class="rules-section">
      <h4>条件格式规则</h4>
      <div v-for="rule in rules" :key="rule.id" class="rule-item">
        <el-tag :color="rule.config.bgColor" style="color:#fff" size="small">
          {{ rule.column }} {{ rule.config.operator === 'gt' ? '>' : rule.config.operator === 'lt' ? '<' : '=' }} {{ rule.config.target }}
        </el-tag>
        <el-button size="small" type="danger" text @click="removeRule(rule.id)">删除</el-button>
      </div>
    </div>
  </DemoLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { CSSProperties } from "vue";
import DemoLayout from "./shared/DemoLayout.vue";

defineEmits<{ select: [key: string] }>();

interface Rule {
  id: string;
  column: string;
  config: { operator: string; target: any; bgColor: string };
}

const rules = ref<Rule[]>([
  { id: "r1", column: "sales", config: { operator: "gt", target: 800, bgColor: "#67c23a" } },
  { id: "r2", column: "sales", config: { operator: "lt", target: 200, bgColor: "#f56c6c" } },
  { id: "r3", column: "margin", config: { operator: "gt", target: 30, bgColor: "#409eff" } },
]);

const demoData = ref([
  { id: 1, name: "产品A", sales: 1200, margin: 35, rating: "A" },
  { id: 2, name: "产品B", sales: 150, margin: 12, rating: "D" },
  { id: 3, name: "产品C", sales: 950, margin: 28, rating: "B" },
  { id: 4, name: "产品D", sales: 300, margin: 42, rating: "A" },
  { id: 5, name: "产品E", sales: 80, margin: 8, rating: "D" },
  { id: 6, name: "产品F", sales: 1100, margin: 45, rating: "A" },
  { id: 7, name: "产品G", sales: 500, margin: 22, rating: "C" },
]);

const cellStyle = ({ row, column }: { row: any; column: any }): CSSProperties => {
  for (const rule of rules.value) {
    if (column.property !== rule.column) continue;
    const val = row[rule.column];
    const op = rule.config.operator;
    const target = rule.config.target;
    if ((op === "gt" && Number(val) > Number(target)) ||
        (op === "lt" && Number(val) < Number(target)) ||
        (op === "eq" && val === target)) {
      return { backgroundColor: rule.config.bgColor, color: "#fff" };
    }
  }
  return {};
};

const addRule = () => {
  const id = `r${Date.now()}`;
  const cols = ["sales", "margin"];
  const ops = ["gt", "lt"];
  rules.value.push({
    id,
    column: cols[rules.value.length % 2],
    config: { operator: ops[rules.value.length % 2], target: 500, bgColor: "#e6a23c" },
  });
};

const removeRule = (id: string) => { rules.value = rules.value.filter((r) => r.id !== id); };
const clearRules = () => { rules.value = []; };
</script>

<style scoped>
.controls { margin-bottom: 12px; display: flex; gap: 8px; }
.rules-section { margin-top: 16px; }
.rules-section h4 { margin-bottom: 8px; }
.rule-item { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
</style>