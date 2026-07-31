<script setup lang="ts" name="tlrTechSelectionList">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getTopicList, deleteTopicEntry, type TopicEntryDocument } from "@/api/modules/topic";
import { useHandleData } from "@/hooks/useHandleData";

const router = useRouter();
const proTableRef = ref<ProTableInstance>();

const tree = "tech-leadership" as const;
const topic = "tech-selection";

function toDetail(key: string) {
  router.push({ name: "tlrTechSelectionDetail", params: { id: key } });
}

async function fetchList(params: any) {
  const { pageNum, pageSize, title, tags } = params;
  const res = await getTopicList<TopicEntryDocument>(tree, topic, { title, tags, pageNum, pageSize });
  return { list: res.data?.list ?? [], total: res.data?.total ?? 0 };
}

async function handleDelete(row: TopicEntryDocument) {
  await useHandleData(() => deleteTopicEntry(tree, topic, row.key), {}, `Delete "${row.title}"`);
  proTableRef.value?.getTableList();
}

function formatTime(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

const columns = reactive<ColumnProps<TopicEntryDocument>[]>([
  { type: "selection", fixed: "left", width: 70 },
  { prop: "title", label: "Title", search: { el: "input", props: { placeholder: "Search by title" } }, minWidth: 240 },
  { prop: "tags", label: "Tags", search: { el: "input", props: { placeholder: "Search by tag" } }, width: 220 },
  { prop: "updatedAt", label: "Updated", width: 180 },
  { prop: "operation", label: "Actions", fixed: "right", width: 220 }
]);
</script>

<template>
  <div class="topic-list">
    <ProTable ref="proTableRef" :columns="columns" :request-api="fetchList" :pagination="true">
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="toDetail('new')">New Entry</el-button>
      </template>
      <template #title="scope">
        <el-button type="primary" link @click="toDetail(scope.row.key)">{{ scope.row.title }}</el-button>
      </template>
      <template #tags="scope">
        <el-tag v-for="tag in scope.row.tags" :key="tag" size="small" class="topic-list__tag">{{ tag }}</el-tag>
        <span v-if="!scope.row.tags?.length" class="topic-list__empty">—</span>
      </template>
      <template #updatedAt="scope">{{ formatTime(scope.row.updatedAt) }}</template>
      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="toDetail(scope.row.key)">View</el-button>
        <el-button type="primary" link :icon="EditPen" @click="toDetail(scope.row.key)">Edit</el-button>
        <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
      </template>
    </ProTable>
  </div>
</template>

<style scoped lang="scss">
.topic-list { height: 100%; }
.topic-list__tag { margin-right: 4px; margin-bottom: 2px; }
.topic-list__empty { color: var(--el-text-color-placeholder); }
</style>
