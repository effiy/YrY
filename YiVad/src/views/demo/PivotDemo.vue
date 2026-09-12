<template>
  <DemoLayout active="pivot" title="数据透视表演示" description="类似Excel透视表：行/列/值配置，聚合统计" @select="$emit('select', $event)">
    <el-table :data="pivotRows" border size="small">
      <el-table-column prop="region" label="区域" width="120" fixed="left" />
      <el-table-column v-for="q in quarters" :key="q" :prop="q" :label="q" width="120" align="right" />
      <el-table-column prop="total" label="合计" width="120" align="right" fixed="right">
        <template #default="{ row }">
          <strong>{{ row.total.toLocaleString() }}</strong>
        </template>
      </el-table-column>
    </el-table>

    <div class="config-section">
      <h4>透视配置</h4>
      <div class="config-row">
        <span>行字段: </span><el-tag>区域</el-tag><el-tag type="success">产品</el-tag>
        <span style="margin-left:16px">列字段: </span><el-tag>季度</el-tag>
        <span style="margin-left:16px">值: </span><el-tag type="warning">金额 (sum)</el-tag>
      </div>
    </div>

    <h4 style="margin-top:16px">源数据 (前5条)</h4>
    <el-table :data="sourceData.slice(0, 5)" border size="small">
      <el-table-column prop="region" label="区域" width="80" />
      <el-table-column prop="product" label="产品" width="100" />
      <el-table-column prop="quarter" label="季度" width="80" />
      <el-table-column prop="amount" label="金额" width="120" align="right" />
    </el-table>
  </DemoLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import DemoLayout from "./shared/DemoLayout.vue";

defineEmits<{ select: [key: string] }>();

const quarters = ["Q1", "Q2", "Q3", "Q4"];

const sourceData = [
  { region: "华东", product: "产品A", quarter: "Q1", amount: 1200 },
  { region: "华东", product: "产品A", quarter: "Q2", amount: 1500 },
  { region: "华东", product: "产品B", quarter: "Q1", amount: 800 },
  { region: "华东", product: "产品B", quarter: "Q3", amount: 1100 },
  { region: "华南", product: "产品A", quarter: "Q1", amount: 900 },
  { region: "华南", product: "产品A", quarter: "Q4", amount: 1300 },
  { region: "华南", product: "产品B", quarter: "Q2", amount: 700 },
  { region: "华北", product: "产品A", quarter: "Q3", amount: 1600 },
  { region: "华北", product: "产品B", quarter: "Q1", amount: 600 },
  { region: "华北", product: "产品B", quarter: "Q4", amount: 1000 },
];

const pivotRows = computed(() => {
  const regions = [...new Set(sourceData.map((d) => d.region))];
  return regions.map((region) => {
    const row: Record<string, any> = { region };
    let total = 0;
    for (const q of quarters) {
      const val = sourceData
        .filter((d) => d.region === region && d.quarter === q)
        .reduce((sum, d) => sum + d.amount, 0);
      row[q] = val || 0;
      total += val;
    }
    row.total = total;
    return row;
  });
});
</script>

<style scoped>
.config-section { margin-top: 16px; padding: 12px; background: var(--el-fill-color-light); border-radius: 8px; }
.config-section h4 { margin: 0 0 8px; }
.config-row { display: flex; align-items: center; gap: 6px; font-size: 13px; }
</style>