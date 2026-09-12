<template>
  <DemoLayout active="full" title="完整功能集成演示" description="全部功能同时启用: 虚拟滚动、列管理、批量操作、导出、行内编辑、快速查找" @select="$emit('select', $event)">
    <MetricsPanel :metrics="[
      { label: '数据行数', value: '1,000' },
      { label: '列数', value: 12 },
      { label: '启用特性', value: 14, status: 'good' },
      { label: '滚动帧率', value: '≥30fps', status: 'good' },
    ]" />

    <div class="quick-find-bar">
      <el-input v-model="searchKeyword" placeholder="Ctrl+F 快速查找..." clearable style="width:280px" @keydown.enter="doSearch">
        <template #prefix>🔍</template>
      </el-input>
      <span v-if="searchResult" class="search-info">{{ searchResult }}</span>
    </div>

    <ProTable
      ref="tableRef"
      :columns="fullColumns"
      :data="filteredData"
      :pagination="true"
      @selection-change="onSelection"
    />

    <div v-if="selectedIds.length > 0" class="batch-bar">
      已选 <strong>{{ selectedIds.length }}</strong> 项
      <el-button size="small" type="danger" @click="batchDelete">批量删除</el-button>
      <el-button size="small" @click="clearSelection">取消选择</el-button>
    </div>

    <div class="stats">
      <h4>当前状态快照</h4>
      <div class="stat-row">
        <div class="stat-item">
          <span class="stat-label">数据行数</span>
          <span class="stat-value">{{ filteredData.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">搜索匹配</span>
          <span class="stat-value">{{ searchResult || '无' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">选中行</span>
          <span class="stat-value">{{ selectedIds.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">列配置(localStorage)</span>
          <span class="stat-value">{{ localStorageKeys.length }} 条</span>
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

const tableRef = ref();
const searchKeyword = ref("");
const searchResult = ref("");
const selectedIds = ref<string[]>([]);
const allData = ref(generateMockData(1000));

const filteredData = computed(() => {
  if (!searchKeyword.value) return allData.value;
  const kw = searchKeyword.value.toLowerCase();
  return allData.value.filter((row) =>
    Object.values(row).some((v) => String(v).toLowerCase().includes(kw))
  );
});

const fullColumns = [
  { type: "selection", width: 50 },
  { prop: "id", label: "ID", width: 100, sortable: true },
  { prop: "name", label: "姓名", width: 120, sortable: true },
  { prop: "email", label: "邮箱", width: 200 },
  { prop: "phone", label: "电话", width: 150 },
  { prop: "department", label: "部门", width: 140 },
  { prop: "role", label: "角色", width: 120 },
  { prop: "status", label: "状态", width: 100 },
  { prop: "priority", label: "优先级", width: 100 },
  { prop: "amount", label: "金额", width: 120, sortable: true },
  { prop: "progress", label: "进度", width: 100 },
  { prop: "score", label: "评分", width: 80 },
  { prop: "createdAt", label: "创建日期", width: 120, sortable: true },
];

const localStorageKeys = computed(() =>
  Object.keys(localStorage).filter((k) => k.startsWith("yivad-"))
);

const onSelection = (rows: Record<string, any>[]) => { selectedIds.value = rows.map((r) => r.id); };
const clearSelection = () => { selectedIds.value = []; };
const batchDelete = () => {
  allData.value = allData.value.filter((r) => !selectedIds.value.includes(r.id));
  selectedIds.value = [];
};

const doSearch = () => {
  const count = filteredData.value.length;
  searchResult.value = searchKeyword.value ? `找到 ${count} 条` : "";
};
</script>

<style scoped>
.quick-find-bar { margin-bottom: 12px; display: flex; align-items: center; gap: 12px; }
.search-info { font-size: 13px; color: var(--el-text-color-secondary); }
.batch-bar { margin-top: 12px; padding: 8px 16px; background: var(--el-color-primary-light-9); border-radius: 8px; display: flex; align-items: center; gap: 12px; }
.stats { margin-top: 20px; padding: 16px; background: var(--el-fill-color-light); border-radius: 8px; }
.stats h4 { margin: 0 0 12px; }
.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-item { display: flex; flex-direction: column; }
.stat-label { font-size: 12px; color: var(--el-text-color-secondary); }
.stat-value { font-size: 16px; font-weight: 600; }
</style>