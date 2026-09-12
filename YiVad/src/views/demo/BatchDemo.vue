<template>
  <DemoLayout active="batch" title="批量操作演示" description="展示行多选、批量删除/标签/编辑及失败处理" @select="$emit('select', $event)">
    <MetricsPanel :metrics="[
      { label: '总行数', value: 100 },
      { label: '选中行', value: selectedRows.length },
      { label: '失败模拟率', value: `${failRate}%` },
    ]" />

    <div class="controls">
      <el-slider v-model="failRate" :min="0" :max="100" :step="10" style="width:200px" show-input />
      <span class="label">模拟失败率</span>
      <el-button type="primary" :disabled="selectedRows.length===0" @click="batchTag">批量标签</el-button>
      <el-button type="danger" :disabled="selectedRows.length===0" @click="batchDelete">批量删除</el-button>
    </div>

    <ProTable
      ref="tableRef"
      :columns="tableColumns"
      :data="localData"
      :pagination="false"
      @selection-change="onSelectionChange"
    />

    <el-dialog v-model="deleteVisible" title="确认批量删除" width="500px">
      <p>即将删除 <strong>{{ selectedRows.length }}</strong> 条数据</p>
      <div v-if="failRate > 0" class="warning-note">模拟失败率: {{ failRate }}%（每10条中约 {{ failRate / 10 }} 条会失败）</div>
      <template #footer>
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="danger" @click="doBatchDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="tagVisible" title="批量标签" width="400px">
      <el-select v-model="tagAction" style="width:100%">
        <el-option value="add" label="添加标签" />
        <el-option value="remove" label="移除标签" />
      </el-select>
      <el-input v-model="tagName" placeholder="标签名" style="margin-top:12px" />
      <template #footer>
        <el-button @click="tagVisible = false">取消</el-button>
        <el-button type="primary" @click="doBatchTag">确认</el-button>
      </template>
    </el-dialog>

    <div v-if="batchResult" class="batch-result">
      <h4>操作结果</h4>
      <p>处理: {{ batchResult.total }} · 成功: {{ batchResult.success }} · 失败: {{ batchResult.failed }}</p>
      <div v-if="batchResult.failedItems.length" class="failed-list">
        <p v-for="f in batchResult.failedItems" :key="f.id">{{ f.id }}: {{ f.reason }}</p>
      </div>
    </div>
  </DemoLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import DemoLayout from "./shared/DemoLayout.vue";
import MetricsPanel from "./shared/MetricsPanel.vue";
import ProTable from "@/components/ProTable/index.vue";
import { DEMO_DATA_SMALL } from "./shared/mockData";

defineEmits<{ select: [key: string] }>();

const tableRef = ref();
const failRate = ref(20);
const selectedRows = ref<Record<string, any>[]>([]);
const localData = ref([...DEMO_DATA_SMALL]);
const deleteVisible = ref(false);
const tagVisible = ref(false);
const tagAction = ref("add");
const tagName = ref("");
const batchResult = ref<any>(null);

const tableColumns = [
  { type: "selection", width: 50 },
  { prop: "id", label: "ID", width: 100 },
  { prop: "name", label: "姓名", width: 120 },
  { prop: "department", label: "部门", width: 140 },
  { prop: "status", label: "状态", width: 100 },
  { prop: "priority", label: "优先级", width: 100 },
  { prop: "createdAt", label: "创建日期", width: 120 },
];

const onSelectionChange = (rows: Record<string, any>[]) => { selectedRows.value = rows; };

const batchDelete = () => { deleteVisible.value = true; };
const batchTag = () => { tagVisible.value = true; };

const doBatchDelete = () => {
  const total = selectedRows.value.length;
  const failedItems: { id: string; reason: string }[] = [];
  let success = 0;

  selectedRows.value.forEach((row, i) => {
    if (Math.random() * 100 < failRate.value) {
      failedItems.push({ id: row.id, reason: "模拟权限不足" });
    } else {
      localData.value = localData.value.filter((r) => r.id !== row.id);
      success++;
    }
  });

  batchResult.value = { total, success, failed: failedItems.length, failedItems };
  deleteVisible.value = false;
  selectedRows.value = [];
};

const doBatchTag = () => {
  let success = 0;
  let failed = 0;
  const total = selectedRows.value.length;
  const failedItems: { id: string; reason: string }[] = [];

  selectedRows.value.forEach((row) => {
    if (Math.random() * 100 < failRate.value) {
      failedItems.push({ id: row.id, reason: "模拟网络错误" });
      failed++;
    } else {
      const found = localData.value.find((r) => r.id === row.id);
      if (found) {
        if (tagAction.value === "add" && !found.tags.includes(tagName.value)) {
          found.tags.push(tagName.value);
        } else if (tagAction.value === "remove") {
          found.tags = found.tags.filter((t: string) => t !== tagName.value);
        }
      }
      success++;
    }
  });

  localData.value = [...localData.value];
  batchResult.value = { total, success, failed, failedItems };
  tagVisible.value = false;
};
</script>

<style scoped>
.controls { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
.label { font-size: 13px; color: var(--el-text-color-secondary); }
.warning-note { color: var(--el-color-warning); font-size: 13px; margin-top: 8px; }
.batch-result { margin-top: 16px; padding: 12px; background: var(--el-fill-color-light); border-radius: 8px; }
.batch-result h4 { margin: 0 0 8px; }
.batch-result p { margin: 4px 0; font-size: 13px; }
.failed-list p { color: var(--el-color-danger); }
</style>