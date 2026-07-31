import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getTopicList, deleteTopicEntry, type TopicEntryDocument, type TopicTree } from "@/api/modules/topic";
import { useHandleData } from "@/hooks/useHandleData";

export interface UseTopicListOptions {
  tree: TopicTree;
  topic: string;
  label: string;
}

function pascal(s: string): string {
  return s
    .split(/[-_]/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

export function useTopicList(options: UseTopicListOptions) {
  const { tree, topic } = options;
  const router = useRouter();
  const proTableRef = ref<ProTableInstance>();

  const routePrefix = tree === "tech-leadership" ? "tlr" : "cr";

  function toDetail(key: string) {
    const routeName = `${routePrefix}${pascal(topic)}Detail`;
    router.push({ name: routeName, params: { id: key } });
  }

  async function fetchList(params: any) {
    const { pageNum, pageSize, title, tags } = params;
    const res = await getTopicList<TopicEntryDocument>(tree, topic, {
      title,
      tags,
      pageNum,
      pageSize
    });
    return {
      list: res.data?.list ?? [],
      total: res.data?.total ?? 0
    };
  }

  async function handleDelete(row: TopicEntryDocument) {
    await useHandleData(
      () => deleteTopicEntry(tree, topic, row.key),
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
      minWidth: 240
    },
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

  return {
    proTableRef,
    columns,
    fetchList,
    toDetail,
    handleDelete,
    formatTime,
    label: options.label
  };
}
