<template>
  <DemoLayout active="columns" title="列管理演示" description="展示列显示/隐藏、排序、调整大小、冻结功能" @select="$emit('select', $event)">
    <ProTable
      ref="tableRef"
      :columns="tableColumns"
      :data="DEMO_DATA_SMALL"
      :pagination="false"
      :toolButton="true"
    />
    <el-collapse style="margin-top:16px">
      <el-collapse-item title="localStorage 列配置 (只读)" name="storage">
        <pre class="storage-preview">{{ storagePreview }}</pre>
      </el-collapse-item>
    </el-collapse>
  </DemoLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import DemoLayout from "./shared/DemoLayout.vue";
import ProTable from "@/components/ProTable/index.vue";
import { DEMO_DATA_SMALL } from "./shared/mockData";

defineEmits<{ select: [key: string] }>();

const tableRef = ref();
const storagePreview = ref("");

const tableColumns = [
  { type: "selection", width: 50 },
  { prop: "id", label: "ID", width: 100 },
  { prop: "name", label: "姓名", width: 120 },
  { prop: "email", label: "邮箱", width: 200 },
  { prop: "phone", label: "电话", width: 150 },
  { prop: "department", label: "部门", width: 140 },
  { prop: "role", label: "角色", width: 120 },
  { prop: "status", label: "状态", width: 100 },
  { prop: "priority", label: "优先级", width: 100 },
  { prop: "amount", label: "金额", width: 120 },
  { prop: "progress", label: "进度", width: 100 },
  { prop: "score", label: "评分", width: 80 },
  { prop: "createdAt", label: "创建日期", width: 120 },
];

let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  timer = setInterval(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("yivad-columns-"));
    const preview: Record<string, any> = {};
    keys.forEach((k) => {
      try { preview[k] = JSON.parse(localStorage.getItem(k)!); } catch { preview[k] = "(parse error)"; }
    });
    storagePreview.value = JSON.stringify(preview, null, 2);
  }, 1000);
});
onBeforeUnmount(() => { if (timer) clearInterval(timer); });
</script>

<style scoped>
.storage-preview {
  font-size: 12px;
  background: var(--el-fill-color-light);
  padding: 12px;
  border-radius: 4px;
  overflow: auto;
  max-height: 300px;
  margin: 0;
}
</style>