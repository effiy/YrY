<template>
  <DemoLayout active="virtual-scroll" title="虚拟滚动演示" description="对比启用/禁用虚拟滚动的性能差异" @select="$emit('select', $event)">
    <div class="controls">
      <el-select v-model="rowCount" style="width:160px">
        <el-option :value="1000" label="1,000 行" />
        <el-option :value="10000" label="10,000 行" />
        <el-option :value="50000" label="50,000 行" />
        <el-option :value="100000" label="100,000 行" />
      </el-select>
      <el-slider v-model="rowHeight" :min="32" :max="64" :step="4" style="width:200px" show-input />
      <span class="label">行高: {{ rowHeight }}px</span>
      <el-slider v-model="overscan" :min="0" :max="20" style="width:160px" show-input />
      <span class="label">overscan: {{ overscan }}</span>
    </div>

    <MetricsPanel :metrics="metrics" />

    <div class="split-view">
      <div class="panel">
        <h4>✅ 启用虚拟滚动</h4>
        <div ref="virtualContainer" class="scroll-container">
          <ProTable :columns="columns" :data="visibleData" :pagination="false" />
        </div>
      </div>
      <div class="panel">
        <h4>❌ 无虚拟滚动</h4>
        <div class="scroll-container simple">
          <el-table :data="visibleData.slice(0, 100)" border size="small">
            <el-table-column v-for="c in columns" :key="c.prop" :prop="c.prop" :label="c.label" :width="c.width" />
          </el-table>
          <p v-if="rowCount > 100" class="warning">⚠️ 仅显示前100行（避免浏览器卡死）</p>
        </div>
      </div>
    </div>
  </DemoLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import DemoLayout from "./shared/DemoLayout.vue";
import MetricsPanel from "./shared/MetricsPanel.vue";
import ProTable from "@/components/ProTable/index.vue";
import { generateMockData } from "./shared/mockData";

defineEmits<{ select: [key: string] }>();

const rowCount = ref(10000);
const rowHeight = ref(48);
const overscan = ref(5);

const allData = computed(() => generateMockData(rowCount.value));
const visibleData = computed(() => allData.value);

const columns = [
  { prop: "id", label: "ID", width: 100 },
  { prop: "name", label: "姓名", width: 120 },
  { prop: "email", label: "邮箱", width: 200 },
  { prop: "department", label: "部门", width: 140 },
  { prop: "role", label: "角色", width: 120 },
  { prop: "status", label: "状态", width: 100 },
  { prop: "priority", label: "优先级", width: 100 },
  { prop: "amount", label: "金额", width: 120 },
  { prop: "progress", label: "进度", width: 100 },
  { prop: "score", label: "评分", width: 80 },
  { prop: "createdAt", label: "创建日期", width: 120 },
];

const virtualContainer = ref<HTMLElement | null>(null);

const metrics = computed(() => {
  const count = rowCount.value;
  return [
    { label: "总行数", value: count.toLocaleString() },
    { label: "预期 DOM 节点", value: "~25", status: "good" as const },
    { label: "行高", value: `${rowHeight.value}px` },
    { label: "总高度", value: `${(count * rowHeight.value).toLocaleString()}px` },
  ];
});
</script>

<style scoped>
.controls { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
.controls .label { font-size: 13px; color: var(--el-text-color-secondary); min-width: 80px; }
.split-view { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.panel h4 { margin: 0 0 8px; font-size: 14px; }
.scroll-container { max-height: 500px; overflow: auto; border: 1px solid var(--el-border-color-light); border-radius: 4px; }
.scroll-container.simple { overflow: auto; }
.warning { padding: 12px; color: var(--el-color-warning); font-size: 13px; text-align: center; }
</style>