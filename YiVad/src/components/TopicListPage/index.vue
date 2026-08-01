<template>
  <div class="topic-list">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="fetchList"
      :pagination="true"
    >
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="handleNewEntry">New Entry</el-button>
      </template>

      <template #title="scope">
        <el-button type="primary" link @click="toDetail(scope.row.key, true)">
          {{ scope.row.title }}
        </el-button>
      </template>

      <template #tags="scope">
        <el-tag
          v-for="tag in scope.row.tags"
          :key="tag"
          size="small"
          class="topic-list__tag"
        >
          {{ tag }}
        </el-tag>
        <span v-if="!scope.row.tags?.length" class="topic-list__empty">—</span>
      </template>

      <template #updatedAt="scope">
        {{ formatTime(scope.row.updatedAt) }}
      </template>

      <template #operation="scope">
        <template v-for="action in resolvedActions" :key="action.type">
          <el-button
            type="primary"
            link
            :icon="action.icon"
            @click="action.handler(scope.row)"
          />
        </template>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="tsx" name="TopicListPage">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getTopicList, deleteTopicEntry, makeKey, contentPathFor, type TopicEntryDocument, type TopicTree } from "@/api/modules/topic";
import { useHandleData } from "@/hooks/useHandleData";
import { callService } from "@/api/modules/dataService";
import { syncKnowledge } from "@/api/modules/knowledgeService";
import { useAicrKnowledgeStore } from "@/stores/modules/aicr/knowledge";
import { ElMessage } from "element-plus";

export interface MetaColumn {
  key: string;
  label: string;
  width?: number;
  minWidth?: number;
  tagTypeFn?: (val: any) => "" | "danger" | "warning" | "info" | "primary" | "success";
  enum?: { label: string; value: string }[];
}

export interface ActionButton {
  /** Which built-in action to render. */
  type: "view" | "edit" | "delete";
  /** Tooltip label. Defaults to a sensible label per type. */
  label?: string;
}

/** Convert a simplified MetaColumn config into a ProTable ColumnProps. */
function toColumnProps(mc: MetaColumn): ColumnProps<TopicEntryDocument> {
  return {
    prop: `meta.${mc.key}`,
    label: mc.label,
    width: mc.width,
    minWidth: mc.minWidth,
    render: (scope: { row: TopicEntryDocument }) => {
      const val = scope.row.meta?.[mc.key];
      if (val === undefined || val === null || val === "") return <span class="topic-list__empty">—</span>;
      // Tag rendering
      if (mc.tagTypeFn) {
        const tagType = mc.tagTypeFn(val);
        return <el-tag type={tagType || undefined} size="small">{val}</el-tag>;
      }
      // Enum label mapping
      if (mc.enum) {
        const opt = mc.enum.find(o => o.value === val);
        const display = opt ? opt.label : val;
        return <span>{display}</span>;
      }
      return <span>{String(val)}</span>;
    }
  };
}

const props = defineProps<{
  tree: TopicTree;
  topic: string;
  label: string;
  /** Domain-specific columns rendered from row.meta (injected between title and tags). */
  metaColumns?: MetaColumn[];
  /** Customise which action buttons appear in the operations column and their labels.
   *  Default: [{ type: "view" }, { type: "edit" }, { type: "delete" }] */
  actions?: ActionButton[];
  /** Markdown template for new BRD entries' YiKnowledge file (e.g. a BRD document skeleton). */
  templateContent?: string;
}>();

interface ResolvedAction {
  type: ActionButton["type"];
  label: string;
  icon: typeof View;
  handler: (row: TopicEntryDocument) => void;
}

const DEFAULT_ACTIONS: ActionButton[] = [
  { type: "view", label: "View" },
  { type: "edit", label: "Edit" },
  { type: "delete", label: "Delete" }
];

const ACTION_META: Record<ActionButton["type"], { icon: typeof View; defaultLabel: string }> = {
  view: { icon: View, defaultLabel: "View" },
  edit: { icon: EditPen, defaultLabel: "Edit" },
  delete: { icon: Delete, defaultLabel: "Delete" }
};


const resolvedActions = computed<ResolvedAction[]>(() => {
  const source = props.actions ?? DEFAULT_ACTIONS;
  return source.map(a => {
    const meta = ACTION_META[a.type];
    const handler =
      a.type === "delete" ? handleDelete
      : a.type === "view" ? (row: TopicEntryDocument) => toDetail(row.key, true)
      : (row: TopicEntryDocument) => toDetail(row.key);
    return {
      type: a.type,
      label: a.label ?? meta.defaultLabel,
      icon: meta.icon,
      handler
    };
  });
});

const router = useRouter();
const proTableRef = ref<ProTableInstance>();
const knowledgeStore = useAicrKnowledgeStore();

/** For BRD topics, create the YiKnowledge file (without MongoDB entry),
 *  sync it, then navigate to aicr for AI-assisted editing.
 *  For other trees, navigate to the detail page as before. */
async function handleNewEntry() {
  if (props.tree === "brd") {
    const key = makeKey(props.tree, props.topic);
    const cpath = contentPathFor(props.tree, props.topic, key);
    const content = props.templateContent || "# New Entry\n\nDescribe the requirements below.";
    try {
      // Create the YiKnowledge file on disk (MongoDB entry comes later via Save)
      await callService("services.knowledge.knowledge_service", "write_entry_markdown", {
        rel_path: cpath,
        content,
        meta: { title: "New Entry", key, tags: [] }
      });
      // Sync disk → MongoDB so the sidebar's scanKnowledge picks it up immediately
      await syncKnowledge();
      // One-shot: tell aicr to select this file on mount (no race — file is already synced)
      knowledgeStore.setPendingSelectPath(cpath);
      router.push({
        path: "/aicr",
        query: {
          source: "brd-new",
          brdTopic: props.topic,
          brdKey: key,
          brdBreadcrumb: props.label
        }
      });
    } catch (e: any) {
      ElMessage.error(e?.message || "Failed to create BRD entry");
    }
    return;
  }
  toDetail("new");
}

function pascal(s: string): string {
  return s
    .split(/[-_]/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

const routePrefix = props.tree === "tech-leadership" ? "tlr" : props.tree === "brd" ? "brd" : "cr";

function toDetail(key: string, viewMode = false) {
  // BRD topics already contain the tree prefix (e.g. "brd-documents"),
  // so strip it before pascal-casing to avoid "brdBrdDocumentsDetail".
  const topicName = props.topic.startsWith(props.tree + "-")
    ? props.topic.slice(props.tree.length + 1)
    : props.topic;
  const routeName = `${routePrefix}${pascal(topicName)}Detail`;
  router.push({
    name: routeName,
    params: { id: key },
    query: viewMode ? { mode: "view" } : {}
  });
}

async function fetchList(params: any) {
  const { pageNum, pageSize, title, tags } = params;
  const res = await getTopicList<TopicEntryDocument>(props.tree, props.topic, {
    title,
    tags,
    pageNum,
    pageSize
  });
  return {
    data: {
      list: res.data?.list ?? [],
      total: res.data?.total ?? 0
    }
  };
}

async function handleDelete(row: TopicEntryDocument) {
  await useHandleData(
    () => deleteTopicEntry(props.tree, props.topic, row.key),
    {},
    `Delete "${row.title}"`
  );
  proTableRef.value?.getTableList();
}

function formatTime(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

const columns = reactive<ColumnProps<TopicEntryDocument>[]>([
  { type: "selection", fixed: "left", width: 70 },
  {
    prop: "title",
    label: "Title",
    search: { el: "input", props: { placeholder: "Search by title" } },
    minWidth: 520
  },
  // Domain-specific meta columns — rendered from row.meta
  ...(props.metaColumns ?? []).map(toColumnProps),
  {
    prop: "tags",
    label: "Tags",
    search: { el: "input", props: { placeholder: "Search by tag" } },
    width: 220
  },
  {
    prop: "updatedAt",
    label: "Updated",
    width: 180
  },
  { prop: "operation", label: "Actions", fixed: "right", width: 220 }
]);
</script>

<style scoped lang="scss">
.topic-list {
  height: 100%;
}
.topic-list__tag {
  margin-right: 4px;
  margin-bottom: 2px;
}
.topic-list__empty {
  color: var(--el-text-color-placeholder);
}
</style>
