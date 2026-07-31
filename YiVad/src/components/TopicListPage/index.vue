<template>
  <div class="topic-list">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="requestApi"
      :data-callback="dataCallback"
      :init-param="initParam"
    >
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="toDetail('new')">New</el-button>
      </template>
      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="toDetail(scope.row.key)">View</el-button>
        <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="tsx" name="TopicListPage">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, View } from "@element-plus/icons-vue";
import { useHandleData } from "@/hooks/useHandleData";
import {
  getTopicList,
  deleteTopicEntry,
  type TopicEntryDocument,
  type TopicTree
} from "@/api/modules/topic";

const props = defineProps<{
  tree: TopicTree;
  topic: string;
  label: string;
}>();

const router = useRouter();
const proTable = ref<ProTableInstance>();
const initParam = reactive({});

const dataCallback = (data: any) => ({ list: data.list, total: data.total });

const requestApi = (params: any) =>
  getTopicList<TopicEntryDocument>(props.tree, props.topic, {
    title: params.title,
    tags: params.tags,
    pageNum: params.pageNum,
    pageSize: params.pageSize
  });

const columns = reactive<ColumnProps<TopicEntryDocument>[]>([
  { type: "selection", fixed: "left", width: 70 },
  {
    prop: "title",
    label: "Title",
    search: { el: "input" },
    minWidth: 240
  },
  {
    prop: "tags",
    label: "Tags",
    search: { el: "input" },
    width: 220,
    render: scope => (
      <div class="topic-list__tags">{(scope.row.tags ?? []).map(t => <el-tag class="topic-list__tag">{t}</el-tag>)}</div>
    )
  },
  { prop: "updatedAt", label: "Updated At", width: 180 },
  { prop: "operation", label: "Actions", fixed: "right", width: 180 }
]);

async function handleDelete(row: TopicEntryDocument) {
  // useHandleData expects a single-arg API; wrap deleteTopicEntry so the
  // confirm dialog can pass the key through.
  await useHandleData(
    (_key: string) => deleteTopicEntry(props.tree, props.topic, row.key),
    row.key,
    `Delete "${row.title}"`
  );
  proTable.value?.getTableList();
}

function toDetail(key: string) {
  const routeName =
    props.tree === "tech-leadership" ? `tlr${pascal(props.topic)}Detail` : `cr${pascal(props.topic)}Detail`;
  router.push({ name: routeName, params: { id: key } });
}

function pascal(s: string) {
  return s
    .split("_")
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}
</script>

<style scoped lang="scss">
.topic-list {
  height: 100%;
}
.topic-list__tag {
  margin-right: 4px;
}
</style>
