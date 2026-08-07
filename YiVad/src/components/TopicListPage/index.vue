<template>
  <div class="topic-list">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="fetchList"
      :init-param="initParam"
      :pagination="true"
      :header-pagination="true"
      :height="tableHeight"
      @row-click="(row: TopicEntryDocument) => toDetail(row.key, true)"
      @search="syncSearchToUrl"
      @reset="clearSearchUrl"
    >
      <template #tableHeader="{ selectedList, isSelected }">
        <el-button type="primary" :icon="CirclePlus" @click="handleNewEntry">{{ $t("topicDetail.newEntry") }}</el-button>
        <el-button
          v-if="isSelected"
          type="danger"
          :icon="Delete"
          :loading="batchDeleting"
          @click="handleBatchDelete(selectedList)"
        >
          {{ $t("topicDetail.batchDelete") }}
          <span class="topic-list__batch-count">{{ selectedList.length }}</span>
        </el-button>
      </template>

      <template #empty>
        <div class="topic-list__empty-state">
          <el-icon :size="40" class="topic-list__empty-icon"><Document /></el-icon>
          <p class="topic-list__empty-text">{{ $t("topicDetail.emptyHint") }}</p>
          <el-button type="primary" :icon="CirclePlus" @click.stop="handleNewEntry">{{ $t("topicDetail.emptyCta") }}</el-button>
        </div>
      </template>

      <template #title="scope">
        <el-button type="primary" link @click.stop="toDetail(scope.row.key, true)">
          {{ scope.row.title }}
        </el-button>
      </template>

      <template #tags="scope">
        <el-tag v-for="tag in scope.row.tags" :key="tag" size="small" class="topic-list__tag">
          {{ tag }}
        </el-tag>
        <span v-if="!scope.row.tags?.length" class="topic-list__empty">—</span>
      </template>

      <template #updatedAt="scope">
        <el-tooltip
          :content="t('topicDetail.createdHint', { time: formatTime(scope.row.createdAt) })"
          placement="top"
          :disabled="!scope.row.createdAt || scope.row.createdAt === scope.row.updatedAt"
        >
          <div class="topic-list__time">
            <span>{{ formatTime(scope.row.updatedAt) }}</span>
            <el-tag v-if="isRecent(scope.row.updatedAt)" size="small" type="success" effect="light" class="topic-list__recent">
              {{ $t("topicDetail.recentBadge") }}
            </el-tag>
          </div>
        </el-tooltip>
      </template>

      <template #operation="scope">
        <template v-for="action in resolvedActions" :key="action.type">
          <el-button type="primary" link :icon="action.icon" @click.stop="action.handler(scope.row)" />
        </template>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="tsx" name="TopicListPage">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { CirclePlus, Delete, EditPen, View, Document, ChatDotRound, ChatLineRound } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getTopicList, deleteTopicEntry, type TopicEntryDocument, type TopicTree } from "@/api/modules/topic";
import { useHandleData } from "@/hooks/useHandleData";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import { ElMessage } from "element-plus";

const { t } = useI18n();

export interface MetaColumn {
  key: string;
  label: string;
  width?: number;
  minWidth?: number;
  tagTypeFn?: (val: any) => "" | "danger" | "warning" | "info" | "primary" | "success";
  enum?: { label: string; value: string }[];
  /** When true, the cell renders as a clickable link that emits `meta-click` with { row, key }. */
  clickable?: boolean;
}

export interface ActionButton {
  /** Which built-in action to render. */
  type: "view" | "edit" | "delete" | "discuss" | "sessions";
  /** Tooltip label. Defaults to a sensible label per type. */
  label?: string;
}

/** Convert a simplified MetaColumn config into a ProTable ColumnProps. */
function toColumnProps(mc: MetaColumn, onMetaClick?: (row: TopicEntryDocument) => void): ColumnProps<TopicEntryDocument> {
  return {
    prop: `meta.${mc.key}`,
    label: mc.label,
    width: mc.width,
    minWidth: mc.minWidth,
    render: (scope: { row: TopicEntryDocument }) => {
      const val = scope.row.meta?.[mc.key];
      if (val === undefined || val === null || val === "") return <span class="topic-list__empty">—</span>;
      // Clickable link — bubbles to parent via onMetaClick callback
      if (mc.clickable && onMetaClick) {
        return (
          <el-button
            type="primary"
            link
            size="small"
            onClick={(e: Event) => {
              e.stopPropagation();
              onMetaClick(scope.row);
            }}
          >
            {String(val)}
          </el-button>
        );
      }
      // Tag rendering
      if (mc.tagTypeFn) {
        const tagType = mc.tagTypeFn(val);
        const display = mc.enum?.find(o => o.value === val)?.label ?? String(val);
        return (
          <el-tag type={tagType || undefined} size="small">
            {display}
          </el-tag>
        );
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
  label?: string;
  /** Domain-specific columns rendered from row.meta (injected between title and tags). */
  metaColumns?: MetaColumn[];
  /** Customise which action buttons appear in the operations column and their labels.
   *  Default: [{ type: "view" }, { type: "edit" }, { type: "delete" }] */
  actions?: ActionButton[];
  /** Markdown template for new BRD entries' YiKnowledge file (e.g. a BRD document skeleton). */
  templateContent?: string;
}>();

const emit = defineEmits<{
  (e: "meta-click", payload: { row: TopicEntryDocument; key: string; value: any }): void;
}>();

interface ResolvedAction {
  type: ActionButton["type"];
  label: string;
  icon: typeof View;
  handler: (row: TopicEntryDocument) => void;
}

const DEFAULT_ACTIONS: ActionButton[] = [{ type: "view" }, { type: "discuss" }, { type: "sessions" }, { type: "edit" }, { type: "delete" }];

const { openInAiChat, linkToAiChatByTag } = useAiChatBridge();

async function discussInAiChat(row: TopicEntryDocument) {
  const tree = props.tree;
  const topic = props.topic;
  const ctxPath = `${tree}/${topic}/${row.key}`;
  const pageContent = [
    `# ${row.title || row.key}`,
    "",
    `**Tree:** ${tree}`,
    `**Topic:** ${topic}`,
    `**Key:** ${row.key}`,
    ...(row.tags?.length ? ["", `**Tags:** ${row.tags.join(", ")}`] : []),
    "",
    "## Content",
    "",
    row.content || "_(empty)_"
  ].join("\n");
  await openInAiChat({
    title: `${row.title || row.key} — ${tree}/${topic}`,
    pageContent,
    tags: [`ctx:${ctxPath}`, tree, topic, `${topic}:${row.key}`],
    sourceUrl: `${detailRouteNameFor(tree, topic)}/${row.key}?mode=view`
  });
}

function viewRelatedAiChatSessions(row: TopicEntryDocument) {
  router.push(linkToAiChatByTag(`${props.topic}:${row.key}`));
}

function detailRouteNameFor(tree: string, topic: string): string {
  // brd topic is stored as "brd-engineer"; route path segment is "engineer".
  // tl/cr topics are stored as-is ("adr-review", "summary").
  const topicSeg = topic.startsWith(tree + "-") ? topic.slice(tree.length + 1) : topic;
  const treeSeg = tree === "tech-leadership" ? "tech-leadership" : tree === "brd" ? "brd" : "code-review";
  return `/${treeSeg}/${topicSeg}/detail`;
}

const ACTION_META: Record<ActionButton["type"], { icon: typeof View; labelKey: string }> = {
  view: { icon: View, labelKey: "common.view" },
  edit: { icon: EditPen, labelKey: "common.edit" },
  delete: { icon: Delete, labelKey: "common.delete" },
  discuss: { icon: ChatDotRound, labelKey: "common.discussInAiChat" },
  sessions: { icon: ChatLineRound, labelKey: "common.relatedAiChatSessions" }
};

const resolvedActions = computed<ResolvedAction[]>(() => {
  const source = props.actions ?? DEFAULT_ACTIONS;
  return source.map(a => {
    const meta = ACTION_META[a.type];
    const handler =
      a.type === "delete"
        ? handleDelete
        : a.type === "view"
          ? (row: TopicEntryDocument) => toDetail(row.key, true)
          : a.type === "discuss"
            ? (row: TopicEntryDocument) => discussInAiChat(row)
            : a.type === "sessions"
              ? (row: TopicEntryDocument) => viewRelatedAiChatSessions(row)
              : (row: TopicEntryDocument) => toDetail(row.key);
    return {
      type: a.type,
      label: a.label ?? t(meta.labelKey),
      icon: meta.icon,
      handler
    };
  });
});

const router = useRouter();
const route = useRoute();
const proTableRef = ref<ProTableInstance>();
const batchDeleting = ref(false);

// ── URL ↔ search state sync ───────────────────────────────────────────────
// Prefill search form from ?title=&tags=&project= on mount, and push current
// search back to the URL on submit so refresh restores the query (shareable too).
// `project` is a meta-field filter — it's forwarded to the API as `meta.project`
// rather than rendered as a search input.
const SEARCH_KEYS = ["title", "tags"] as const;
const META_QUERY_KEYS = ["project"] as const;
const urlSearch = computed(() => {
  const out: Record<string, string> = {};
  for (const k of SEARCH_KEYS) {
    const v = route.query[k];
    if (typeof v === "string" && v) out[k] = v;
  }
  return out;
});
const urlMetaFilter = computed(() => {
  const out: Record<string, string> = {};
  for (const k of META_QUERY_KEYS) {
    const v = route.query[k];
    if (typeof v === "string" && v) out[k] = v;
  }
  return out;
});
const initParam = computed(() => ({ ...urlSearch.value, ...urlMetaFilter.value }));
function syncSearchToUrl() {
  const sp = proTableRef.value?.searchParam ?? {};
  const next: Record<string, string> = {};
  for (const k of SEARCH_KEYS) {
    const v = sp[k];
    if (typeof v === "string" && v) next[k] = v;
  }
  // Preserve meta query keys (e.g. project) from URL so a search doesn't lose the filter.
  for (const k of META_QUERY_KEYS) {
    const v = route.query[k];
    if (typeof v === "string" && v) next[k] = v;
  }
  // Searching resets page to 1; drop ?page= to match.
  const cur = urlSearch.value;
  if (JSON.stringify(cur) !== JSON.stringify(next)) {
    router.replace({ query: next });
  }
}
function clearSearchUrl() {
  if (Object.keys(route.query).length) router.replace({ query: {} });
}

// ── URL ↔ pagination state sync ───────────────────────────────────────────
// Restore ?page=N on mount, push page changes back to URL.
const urlPageNum = computed(() => {
  const raw = Number(route.query.page);
  return Number.isFinite(raw) && raw > 1 ? raw : null;
});

async function handleBatchDelete(rows: { [key: string]: any }[]) {
  if (!rows.length) return;
  try {
    await ElMessageBox.confirm(
      t("topicDetail.batchDeleteConfirm", { count: rows.length }),
      t("topicDetail.batchDeleteTitle"),
      {
        type: "warning",
        distinguishCancelAndClose: true,
        confirmButtonText: t("topicDetail.delete"),
        cancelButtonText: t("topicDetail.cancel")
      }
    );
  } catch {
    return;
  }
  batchDeleting.value = true;
  let done = 0;
  let failed = 0;
  await Promise.all(
    rows.map(async r => {
      try {
        await deleteTopicEntry(props.tree, props.topic, r.key);
        done++;
      } catch {
        failed++;
      }
    })
  );
  batchDeleting.value = false;
  if (failed === 0) {
    ElMessage.success(t("topicDetail.batchDeleteSuccess", { count: done }));
  } else {
    ElMessage.warning(t("topicDetail.batchDeletePartial", { done, failed }));
  }
  proTableRef.value?.getTableList();
}

const tableHeight = ref(0);
const updateTableHeight = () => {
  // Pagination moved into the header row — drop its former 52px slot.
  // header(55) + tabs(40) + search(74) + toolbar(47) + box padding(20) = 236
  tableHeight.value = Math.max(200, window.innerHeight - 236);
};
onMounted(() => {
  updateTableHeight();
  window.addEventListener("resize", updateTableHeight);
});
onBeforeUnmount(() => window.removeEventListener("resize", updateTableHeight));

/** Navigate to the detail page for a new entry. */
async function handleNewEntry() {
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
  const topicName = props.topic.startsWith(props.tree + "-") ? props.topic.slice(props.tree.length + 1) : props.topic;
  const routeName = `${routePrefix}${pascal(topicName)}Detail`;
  router.push({
    name: routeName,
    params: { id: key },
    query: viewMode ? { mode: "view" } : {}
  });
}

async function fetchList(params: any) {
  const { pageNum, pageSize, title, tags, project } = params;
  const res = await getTopicList<TopicEntryDocument>(props.tree, props.topic, {
    title,
    tags,
    project,
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
  const ok = await useHandleData(
    () => deleteTopicEntry(props.tree, props.topic, row.key),
    {},
    t("topicDetail.deleteEntryConfirm", { title: row.title })
  );
  if (ok) proTableRef.value?.getTableList();
}

function formatTime(ts: number): string {
  if (!ts) return "—";
  return timeFormatter.format(new Date(ts));
}

const RECENT_MS = 7 * 24 * 60 * 60 * 1000;
function isRecent(ts: number): boolean {
  if (!ts) return false;
  return Date.now() - ts < RECENT_MS;
}

const timeFormatter = new Intl.DateTimeFormat(typeof navigator !== "undefined" ? navigator.language : "en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

const columns = reactive<ColumnProps<TopicEntryDocument>[]>([
  { type: "selection", fixed: "left", width: 70 },
  {
    prop: "title",
    label: t("topicDetail.title"),
    search: { el: "input", props: { placeholder: t("common.search") } },
    minWidth: 520
  },
  // Domain-specific meta columns — rendered from row.meta
  ...(props.metaColumns ?? []).map(mc =>
    toColumnProps(mc, (row: TopicEntryDocument) => {
      emit("meta-click", { row, key: mc.key, value: row.meta?.[mc.key] });
    })
  ),
  {
    prop: "tags",
    label: t("topicDetail.tags"),
    search: { el: "input", props: { placeholder: t("common.search") } },
    width: 220
  },
  {
    prop: "updatedAt",
    label: t("story.updated"),
    width: 180
  },
  { prop: "operation", label: t("story.actions"), fixed: "right", width: 260 }
]);

// ── Column setting persistence (per tree+topic) ──────────────────────────
// Save isShow / sortable per column prop to localStorage so user toggles
// survive page refresh. Loaded once on setup before first render.
const colSettingStorageKey = `yivad:col-setting:${props.tree}:${props.topic}`;
interface ColSettingSnapshot {
  isShow?: boolean;
  sortable?: boolean;
}
function loadColSettings(): Record<string, ColSettingSnapshot> {
  try {
    const raw = localStorage.getItem(colSettingStorageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function applyColSettings() {
  const saved = loadColSettings();
  if (!Object.keys(saved).length) return;
  for (const col of columns) {
    if (!col.prop) continue;
    const override = saved[col.prop];
    if (!override) continue;
    if (override.isShow !== undefined) col.isShow = override.isShow;
    if (override.sortable !== undefined) col.sortable = override.sortable;
  }
}
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleColSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const snapshot: Record<string, ColSettingSnapshot> = {};
    for (const col of columns) {
      if (!col.prop) continue;
      snapshot[col.prop] = { isShow: col.isShow, sortable: !!col.sortable };
    }
    try {
      localStorage.setItem(colSettingStorageKey, JSON.stringify(snapshot));
    } catch {
      // storage full / disabled — silently ignore
    }
  }, 200);
}
applyColSettings();
watch(columns, scheduleColSave, { deep: true });

// ── Pagination size persistence (per tree+topic) ──────────────────────────
// Restore saved pageSize before first fetch when possible, then persist
// any subsequent change. Default 10 means no override and no extra fetch.
const pageSizeStorageKey = `yivad:page-size:${props.tree}:${props.topic}`;
function loadPageSize(): number | null {
  const raw = Number(localStorage.getItem(pageSizeStorageKey));
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}
onMounted(() => {
  const saved = loadPageSize();
  if (saved && saved !== 10) {
    // Triggers a re-fetch with the new size; first fetch used default 10.
    proTableRef.value?.handleSizeChange(saved);
  }
  // Restore ?page=N — only re-fetch when URL has a non-default page so the
  // common case (no ?page=) avoids a second fetch.
  const urlPage = urlPageNum.value;
  if (urlPage) {
    proTableRef.value?.handleCurrentChange(urlPage);
  }
});
watch(
  () => proTableRef.value?.pageable.pageSize,
  newSize => {
    if (!newSize) return;
    if (newSize === 10) localStorage.removeItem(pageSizeStorageKey);
    else localStorage.setItem(pageSizeStorageKey, String(newSize));
  }
);
watch(
  () => proTableRef.value?.pageable.pageNum,
  pageNum => {
    if (!pageNum) return;
    const cur = Number(route.query.page);
    if (pageNum === 1) {
      if (cur) router.replace({ query: { ...route.query, page: undefined } });
    } else if (pageNum !== cur) {
      router.replace({ query: { ...route.query, page: String(pageNum) } });
    }
  }
);
onBeforeUnmount(() => {
  if (saveTimer) clearTimeout(saveTimer);
});
</script>

<style scoped lang="scss">
.topic-list {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 95px);
  padding: 10px 12px;
  overflow: hidden;
}
.topic-list__tag {
  margin-right: 4px;
  margin-bottom: 2px;
}
.topic-list__empty {
  color: var(--el-text-color-placeholder);
}
.topic-list__empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 0 24px;
}
.topic-list__empty-icon {
  color: var(--el-text-color-placeholder);
}
.topic-list__empty-text {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.topic-list__batch-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  margin-left: 6px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-color-white);
  background: rgba(255, 255, 255, 0.25);
  border-radius: 9px;
}
.topic-list__time {
  display: flex;
  align-items: center;
  gap: 6px;
}
.topic-list__recent {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  height: 16px;
  padding: 0 5px;
  line-height: 14px;
}
</style>
