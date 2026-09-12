<template>
  <DemoLayout active="inline-edit" title="行内编辑演示" description="双击单元格编辑，支持10种编辑器类型，Enter确认/Esc取消/Tab导航" @select="$emit('select', $event)">
    <MetricsPanel :metrics="[
      { label: '数据行数', value: 20 },
      { label: '可编辑列', value: 8 },
      { label: '编辑器类型', value: 10 },
    ]" />

    <div class="legend">
      <el-tag v-for="(col, key) in editorTypes" :key="key" size="small" style="margin:2px">
        {{ col.label }}: {{ col.type }}
      </el-tag>
    </div>

    <ProTable
      :columns="tableColumns"
      :data="localData"
      :pagination="false"
    />
  </DemoLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DemoLayout from "./shared/DemoLayout.vue";
import MetricsPanel from "./shared/MetricsPanel.vue";
import ProTable from "@/components/ProTable/index.vue";

defineEmits<{ select: [key: string] }>();

const editorTypes: Record<string, { label: string; type: string }> = {
  name: { label: "姓名", type: "text" },
  age: { label: "年龄", type: "number" },
  status: { label: "状态", type: "select" },
  joinDate: { label: "入职", type: "date" },
  lastLogin: { label: "登录", type: "datetime" },
  tags: { label: "标签", type: "tag" },
  active: { label: "启用", type: "boolean" },
  note: { label: "备注", type: "textarea" },
};

const localData = ref([
  { id: "1", name: "张伟", age: 28, status: "active", joinDate: "2024-03-15", lastLogin: "2026-09-10 09:30", tags: ["前端"], active: true, note: "核心开发" },
  { id: "2", name: "李芳", age: 32, status: "inactive", joinDate: "2023-06-01", lastLogin: "2026-08-20 14:00", tags: ["后端"], active: false, note: "" },
  { id: "3", name: "王娜", age: 25, status: "active", joinDate: "2025-01-10", lastLogin: "2026-09-09 16:45", tags: ["设计"], active: true, note: "新员工" },
]);

for (let i = 4; i <= 20; i++) {
  localData.value.push({
    id: `${i}`,
    name: `用户${i}`,
    age: 22 + (i % 20),
    status: ["active", "inactive", "draft"][i % 3],
    joinDate: `202${(i % 6) + 1}-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
    lastLogin: `2026-09-0${(i % 7) + 1} ${String(8 + (i % 12)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}`,
    tags: [["前端", "后端", "设计"][i % 3]],
    active: i % 3 !== 0,
    note: i % 4 === 0 ? "示例备注" : "",
  });
}

const tableColumns = [
  { prop: "id", label: "ID", width: 80 },
  { prop: "name", label: "姓名", width: 120 },
  { prop: "age", label: "年龄", width: 80 },
  { prop: "status", label: "状态", width: 100 },
  { prop: "joinDate", label: "入职日期", width: 120 },
  { prop: "lastLogin", label: "最后登录", width: 160 },
  { prop: "tags", label: "标签", width: 120 },
  { prop: "active", label: "启用", width: 80 },
  { prop: "note", label: "备注", width: 150 },
];
</script>

<style scoped>
.legend { margin-bottom: 12px; }
</style>