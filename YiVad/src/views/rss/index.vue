<script setup lang="tsx" name="rssList">
import { ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import type { ProTableInstance } from "@/components/ProTable/interface";
import { ChatDotRound, ChatLineRound, Check, Delete, Download, EditPen, Plus, Reading, Refresh, Star, StarFilled, VideoPlay, View as ViewIcon, Link as LinkIcon } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRssReadStar } from "@/hooks/useRssReadStar";
import { useRssAiChat } from "@/hooks/useRssAiChat";
import { useRssStore } from "@/stores/modules/rss";
import {
  getRssList,
  deleteRssItem
} from "@/api/modules/rssService";
import type { RssItemDocument, RssSeedDocument } from "@/api/modules/rssService";
import SeedDrawer from "./components/SeedDrawer.vue";
import SchedulerPanel from "./components/SchedulerPanel.vue";
import RssItemDetailDrawer from "./components/RssItemDetailDrawer.vue";
import { createRssColumns } from "./columns";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const proTable = ref<ProTableInstance>();

const { isRead, markRead, toggleRead, isStarred, toggleStar, markAllRead } = useRssReadStar();
const { loadBody, discussInAiChat: doDiscuss, quickActionInAiChat: doQuickAction, openBatchInAiChat: doOpenBatch, openInAiChat, linkToAiChatByTag } = useRssAiChat();

const filterUnread = ref(false);
const filterStarred = ref(false);
function rowClassName({ row }: { row: RssItemDocument }) {
  const cls: string[] = [];
  if (filterUnread.value && row.key && isRead(row)) cls.push("rss-row-hidden");
  if (filterStarred.value && !isStarred(row)) cls.push("rss-row-hidden");
  return cls.join(" ");
}

const isSchedulerView = computed(() => route.name === "rssScheduler");

// Sync filter toggles with the active sub-route (rssStarred / rssUnread / rssAll / rssScheduler).
watch(
  () => route.name,
  name => {
    if (name === "rssStarred") {
      filterStarred.value = true;
      filterUnread.value = false;
    } else if (name === "rssUnread") {
      filterUnread.value = true;
      filterStarred.value = false;
    } else if (name === "rssAll") {
      filterStarred.value = false;
      filterUnread.value = false;
    }
    // Clear search filters when switching sub-routes so the previous view's
    // source_name / search box doesn't bleed into the new view.
    if (name && name !== "rssScheduler") {
      const sp = proTable.value?.searchParam;
      if (sp) {
        if (sp.search) sp.search = "";
        if (sp.source_name) sp.source_name = "";
        if (sp.category_path) sp.category_path = "";
        proTable.value?.search?.();
      }
    }
  },
  { immediate: true }
);

const tableHeight = ref(0);
const updateTableHeight = () => {
  tableHeight.value = Math.max(200, window.innerHeight - 288);
};

const SCHEDULER_POLL_MS = 60000;
let schedulerTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  updateTableHeight();
  window.addEventListener("resize", updateTableHeight);
  document.addEventListener("visibilitychange", onVisibilityChange);
  fetchSeeds();
  fetchSchedulerStatus();
  schedulerTimer = setInterval(fetchSchedulerStatus, SCHEDULER_POLL_MS);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateTableHeight);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  if (schedulerTimer) clearInterval(schedulerTimer);
  schedulerTimer = null;
});

function onVisibilityChange() {
  if (document.hidden) {
    if (schedulerTimer) {
      clearInterval(schedulerTimer);
      schedulerTimer = null;
    }
  } else {
    if (!schedulerTimer) {
      fetchSchedulerStatus();
      schedulerTimer = setInterval(fetchSchedulerStatus, SCHEDULER_POLL_MS);
    }
  }
}

const initParam = reactive({});

const dataCallback = (data: any) => ({ list: data.list, total: data.total });

import { storeToRefs } from "pinia";
// ... existing imports ...

// ── Scheduler + seed state ──
const rssStore = useRssStore();
const {
  seeds, seedsLoading, schedulerStatus, schedulerLoading, parsing,
  seedCounts
} = storeToRefs(rssStore);

const seedDrawerRef = ref<InstanceType<typeof SeedDrawer> | null>(null);
const detailItem = ref<RssItemDocument | null>(null);
const detailVisible = ref(false);
const detailIndex = ref(-1);

const sortOptions = [
  { label: t("rss.items.sortUpdatedDesc"), value: "updatedTime:desc" },
  { label: t("rss.items.sortCreatedDesc"), value: "createdTime:desc" },
  { label: t("rss.items.sortUpdatedAsc"), value: "updatedTime:asc" }
];
const sortValue = ref("updatedTime:desc");
function handleSortChange(val: string) {
  const [orderBy, orderType] = val.split(":") as [string, "asc" | "desc"];
  const sp = proTable.value?.searchParam;
  if (sp) {
    sp.orderBy = orderBy;
    sp.orderType = orderType;
    proTable.value?.search?.();
  }
}

async function fetchSchedulerStatus() {
  // Don't toggle schedulerLoading on poll — only on manual refresh
  await rssStore.fetchSchedulerStatus();
}

async function refreshSchedulerStatusManual() {
  await rssStore.fetchSchedulerStatusManual();
}

async function handleApplySchedulerConfig(config: { interval?: number }) {
  try {
    await rssStore.updateSchedulerConfig(config);
    ElMessage.success(t("rss.scheduler.configApplied"));
  } catch (e: any) {
    ElMessage.error(e?.message || t("rss.scheduler.configFailed"));
  }
}

function parseOpmlXml(xml: string): Array<{ url: string; name?: string; category?: string }> {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const out: Array<{ url: string; name?: string; category?: string }> = [];
  const walk = (node: Element, inheritedCategory?: string) => {
    for (const child of Array.from(node.children)) {
      if (child.tagName.toLowerCase() !== "outline") continue;
      const xmlUrl = child.getAttribute("xmlUrl") || child.getAttribute("xmlurl") || "";
      const name = child.getAttribute("text") || child.getAttribute("title") || "";
      const parentCat = child.getAttribute("category") || inheritedCategory;
      if (xmlUrl) {
        out.push({ url: xmlUrl, name: name || undefined, category: parentCat || undefined });
      } else {
        // Folder outline — recurse with folder title as category
        const folderCat = child.getAttribute("text") || child.getAttribute("title") || inheritedCategory;
        walk(child, folderCat || inheritedCategory);
      }
    }
  };
  walk(doc.documentElement);
  return out;
}

async function handleImportOpml(file: File) {
  try {
    const text = await file.text();
    const parsed = parseOpmlXml(text);
    if (!parsed.length) {
      ElMessage.warning(t("rss.scheduler.opmlImportFailed"));
      return;
    }
    let ok = 0;
    let skipped = 0;
    for (const p of parsed) {
      try {
        await rssStore.addSeed({
          url: p.url,
          name: p.name || p.url,
          enabled: true,
          category: p.category,
          tags: []
        });
        ok++;
      } catch {
        skipped++;
      }
    }
    if (skipped > 0) {
      ElMessage.warning(t("rss.scheduler.opmlImportedWithSkips", { ok, skipped, total: parsed.length }));
    } else {
      ElMessage.success(t("rss.scheduler.opmlImported", { n: ok }));
    }
    proTable.value?.getTableList();
  } catch (e: any) {
    ElMessage.error(e?.message || t("rss.scheduler.opmlImportFailed"));
  }
}

function handleExportOpml() {
  if (!seeds.value.length) {
    ElMessage.info(t("rss.scheduler.opmlEmpty"));
    return;
  }
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const outlines = seeds.value
    .map(s => {
      const name = escape(s.name || s.url);
      const url = escape(s.url);
      return `    <outline type="rss" text="${name}" title="${name}" xmlUrl="${url}" />`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head><title>YiVad RSS Feeds</title></head>\n  <body>\n${outlines}\n  </body>\n</opml>\n`;
  const blob = new Blob([xml], { type: "text/xml;charset=utf-8" });
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u;
  a.download = `yivad-rss-${new Date().toISOString().slice(0, 10)}.opml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(u);
  ElMessage.success(t("rss.scheduler.opmlExported", { n: seeds.value.length }));
}

const sourceOptions = computed(() => {
  const set = new Set<string>();
  for (const s of seeds.value) if (s.name) set.add(s.name);
  for (const it of (proTable.value?.tableData ?? []) as RssItemDocument[]) if (it.source_name) set.add(it.source_name);
  return [...set].sort((a, b) => a.localeCompare(b, "zh-CN")).map(name => ({ label: name, value: name }));
});

const categoryOptions = computed(() => {
  const set = new Set<string>();
  for (const s of seeds.value) if (s.category) set.add(s.category);
  for (const it of (proTable.value?.tableData ?? []) as RssItemDocument[]) if (it.category_path) set.add(it.category_path);
  return [...set].sort((a, b) => a.localeCompare(b, "zh-CN")).map(name => ({ label: name, value: name }));
});

async function fetchSeeds() {
  await rssStore.fetchSeeds();
}

async function handleStartScheduler() {
  try {
    await rssStore.startScheduler();
    ElMessage.success(t("rss.scheduler.started"));
  } catch (e: any) {
    ElMessage.error(e?.message || t("rss.scheduler.startFailed"));
  }
}
async function handleStopScheduler() {
  try {
    await rssStore.stopScheduler();
    ElMessage.success(t("rss.scheduler.stopped"));
  } catch (e: any) {
    ElMessage.error(e?.message || t("rss.scheduler.stopFailed"));
  }
}
async function handleParseAll() {
  try {
    const data = await rssStore.parseAll();
    if (!data) return;
    ElMessage.success(
      t("rss.scheduler.parseAllDone", {
        total: data.total_sources ?? 0,
        ok: data.success_count ?? 0,
        fail: data.failed_count ?? 0
      })
    );
    proTable.value?.getTableList();
  } catch (e: any) {
    ElMessage.error(e?.message || t("rss.scheduler.batchParseFailed"));
  }
}

async function handleParseOne(row: RssItemDocument) {
  await doParseFeed(row.source_url, row.source_name);
}

async function handleParseSeed(row: RssSeedDocument) {
  if (!row.url) return;
  await doParseFeed(row.url, row.name);
}

async function doParseFeed(url: string, name?: string) {
  try {
    const data = await rssStore.parseOne(url, name);
    if (data.success) {
      ElMessage.success(
        t("rss.items.parseOneOk", {
          name: data.source_name || url,
          saved: data.saved_count ?? 0,
          updated: data.updated_count ?? 0
        })
      );
    } else {
      ElMessage.warning(t("rss.items.parseOneFail", { error: data.error || "unknown" }));
    }
    proTable.value?.getTableList();
  } catch (e: any) {
    ElMessage.error(e?.message || t("rss.items.parseFailed"));
  }
}

async function handleSummarizeSeed(row: RssSeedDocument) {
  if (!row.name && !row.url) return;
  const source = row.name || row.url;
  try {
    const res = await getRssList({ source_name: source, pageSize: 20 });
    const items = res.data?.list ?? [];
    if (!items.length) {
      ElMessage.info(t("rss.items.noItemsHint"));
      return;
    }
    const picked = items.slice(0, 8);
    const bodies = await Promise.all(picked.map(loadBody));
    const ctxPaths = picked.map(r => r.file_path).filter((p): p is string => !!p);
    const tags = ["rss", "rss-summary", `rss:${source}`, ...ctxPaths.map(p => `ctx:${p}`)];
    const listing = picked
      .map((r, i) => `- **${r.title || "(untitled)"}** · _${r.published || "—"}_\n  ${r.link || ""}\n\n${bodies[i]}`)
      .join("\n\n---\n\n");
    const pageContent = `# ${t("rss.items.summarizePromptTitle", { name: source })}\n\n${t("rss.items.summarizePromptPrelude", { n: picked.length })}\n\n---\n\n${listing}`;
    await openInAiChat({
      title: t("rss.items.summarizePromptTitle", { name: source }),
      pageContent,
      tags,
      sourceUrl: row.url,
      systemPrompt:
        "You are an RSS feed summarization assistant. Read the ingested articles from the same source and produce a concise ≤300-word summary grouped by theme, citing each item's title. Reply in the user's language."
    });
  } catch (e: any) {
    ElMessage.error(e?.message || t("rss.items.parseFailed"));
  }
}

async function handleSummarizeSeedsBulk(rows: RssSeedDocument[]) {
  if (!rows.length) return;
  // For each selected seed, fetch its latest items. Cap total items at 8 to stay within context limits.
  const ITEM_CAP = 8;
  const perSeed = Math.max(1, Math.floor(ITEM_CAP / rows.length));
  const sources = rows.map(r => r.name || r.url).filter(Boolean) as string[];
  try {
    const lists = await Promise.all(
      sources.map(source => getRssList({ source_name: source, pageSize: perSeed }).then(r => r.data?.list ?? []).catch(() => []))
    );
    // Flatten + cap. Items are sorted by updatedTime desc from the backend, so we trust per-source ordering.
    let picked: RssItemDocument[] = [];
    for (const list of lists) picked = picked.concat(list);
    picked = picked.slice(0, ITEM_CAP);
    if (!picked.length) {
      ElMessage.info(t("rss.items.noItemsHint"));
      return;
    }
    const bodies = await Promise.all(picked.map(loadBody));
    const ctxPaths = picked.map(r => r.file_path).filter((p): p is string => !!p);
    const tags = ["rss", "rss-summary", "rss-bulk", ...sources.map(s => `rss:${s}`), ...ctxPaths.map(p => `ctx:${p}`)];
    const listing = picked
      .map((r, i) => `- **${r.title || "(untitled)"}** · _${r.source_name || "—"}_ · _${r.published || "—"}_\n  ${r.link || ""}\n\n${bodies[i]}`)
      .join("\n\n---\n\n");
    const pageContent = `# RSS Multi-Source Summary (${sources.length} sources, ${picked.length} items)\n\nSources: ${sources.join(", ")}\n\nSynthesize a single ≤400-word brief across these articles. Group by theme, mark each bullet with its source, and call out agreements / contradictions.\n\n---\n\n${listing}`;
    await openInAiChat({
      title: `RSS Summary: ${sources.length} sources`,
      pageContent,
      tags,
      sourceUrl: rows[0]?.url,
      systemPrompt:
        "You are a multi-source RSS synthesizer. Ingest the provided articles from several feeds and produce a unified brief (≤400 words) organized by theme. Tag each bullet with its source name. Highlight points of agreement and contradiction across sources. Reply in the user's language."
    });
    if (picked.length < ITEM_CAP && lists.flat().length > picked.length) {
      ElMessage.info(t("rss.items.batchTruncateHint", { n: lists.flat().length }));
    }
  } catch (e: any) {
    ElMessage.error(e?.message || t("rss.items.parseFailed"));
  }
}

function handleFilterBySource(row: RssSeedDocument) {
  const source = row.name || row.url;
  if (!source) return;
  const sp = proTable.value?.searchParam;
  if (sp) {
    sp.source_name = source;
    proTable.value?.search?.();
  }
}

function handleViewSeedSessions(row: RssSeedDocument) {
  const source = row.name || row.url;
  if (!source) return;
  router.push(linkToAiChatByTag(`rss:${source}`));
}

// ── aiChat bridge ──

async function discussInAiChat(row: RssItemDocument) {
  await doDiscuss(row);
}

function viewRelatedAiChatSessions(row: RssItemDocument) {
  if (row.file_path) {
    router.push(linkToAiChatByTag(`rss-item:${row.file_path}`));
  } else if (row.source_name) {
    router.push(linkToAiChatByTag(`rss:${row.source_name}`));
  }
}

async function batchDiscussInAiChat(rows: RssItemDocument[]) {
  if (!rows.length) return;
  if (rows.length === 1) {
    await discussInAiChat(rows[0]);
    return;
  }
  const { total } = await doOpenBatch(rows, {
    titlePrefix: "RSS Batch",
    tagPrefix: "rss-batch",
    systemPrompt:
      "You are a research assistant. Multiple RSS articles have been ingested as context. Cross-reference them when answering, highlight contrasts, and cite each article by title/source. Reply in the user's language."
  });
  if (rows.length > total) {
    ElMessage.info(t("rss.items.batchTruncateHint", { n: rows.length }));
  }
}

async function batchSummarizeInAiChat(rows: RssItemDocument[]) {
  if (!rows.length) return;
  if (rows.length === 1) {
    await doQuickAction(rows[0], "summarize");
    return;
  }
  const { total } = await doOpenBatch(rows, {
    titlePrefix: "RSS Summary",
    tagPrefix: "rss-summary",
    systemPrompt:
      "You are an RSS batch summarizer. Synthesize the ingested articles into a single ≤300-word brief grouped by theme, with each bullet citing its source by title. Highlight points of agreement and contradiction. Reply in the user's language."
  });
  if (rows.length > total) {
    ElMessage.info(t("rss.items.batchTruncateHint", { n: rows.length }));
  }
}

function openDetail(row: RssItemDocument) {
  const items = (proTable.value?.tableData ?? []) as RssItemDocument[];
  detailIndex.value = items.findIndex(r => r.key === row.key);
  detailItem.value = row;
  detailVisible.value = true;
  markRead(row);
}

function handleNavigate(direction: -1 | 1) {
  const items = (proTable.value?.tableData ?? []) as RssItemDocument[];
  if (!items.length) return;
  const nextIdx = detailIndex.value + direction;
  if (nextIdx < 0 || nextIdx >= items.length) return;
  detailIndex.value = nextIdx;
  detailItem.value = items[nextIdx];
  markRead(items[nextIdx]);
}

function handleMarkAllRead() {
  const items = (proTable.value?.tableData ?? []) as RssItemDocument[];
  if (!items.length) return;
  markAllRead(items);
  ElMessage.success(t("rss.items.markAllReadDone"));
}

function handleMarkSelectedRead(rows: RssItemDocument[]) {
  if (!rows.length) return;
  markAllRead(rows);
  ElMessage.success(t("rss.items.markAllReadDone"));
}

async function handleExportSelected(rows: RssItemDocument[]) {
  if (!rows.length) return;
  const picked = rows.slice(0, 8);
  const bodies = await Promise.all(picked.map(loadBody));
  const sections = picked.map((r, i) => {
    const meta = [
      `**Source:** ${r.source_name || "—"}`,
      `**Published:** ${r.published || "—"}`,
      `**Link:** ${r.link || "—"}`
    ].join("  \n");
    return `## ${r.title || "(untitled)"}\n\n${meta}\n\n---\n\n${bodies[i]}`;
  });
  const md = `# RSS Export\n\n${sections.join("\n\n---\n\n")}\n`;
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  const file = `rss-export-${stamp}.md`;
  a.href = url;
  a.download = file;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  ElMessage.success(t("rss.items.exportDone", { n: picked.length, file }));
}

function openSourceLink(row: RssItemDocument) {
  if (row.link) window.open(row.link, "_blank", "noopener");
}

async function handleDeleteItem(row: RssItemDocument) {
  if (!row.key) return;
  try {
    await ElMessageBox.confirm(t("rss.items.deleteItemConfirm"), t("rss.seeds.title"), { type: "warning" });
    await deleteRssItem(row.key);
    ElMessage.success(t("rss.items.deleted"));
    proTable.value?.getTableList();
  } catch (e: any) {
    if (e === "cancel" || e?.code === "CANCEL") return;
    ElMessage.error(e?.message || t("rss.items.deleteFailed"));
  }
}

async function handleBulkDelete(rows: RssItemDocument[]) {
  if (!rows.length) return;
  try {
    await ElMessageBox.confirm(t("rss.items.deleteBatchConfirm", { n: rows.length }), t("rss.seeds.title"), {
      type: "warning"
    });
    const keys = rows.map(r => r.key).filter((k): k is string => !!k);
    await Promise.all(keys.map(k => deleteRssItem(k)));
    ElMessage.success(t("rss.items.deleted"));
    proTable.value?.clearSelection?.();
    proTable.value?.getTableList();
  } catch (e: any) {
    if (e === "cancel" || e?.code === "CANCEL") return;
    ElMessage.error(e?.message || t("rss.items.deleteFailed"));
  }
}

// ── Seeds drawer ──
function openSeedDrawer(mode: "Add" | "Edit", row?: RssSeedDocument) {
  const categorySuggestions = Array.from(new Set(seeds.value.map(s => s.category).filter(Boolean) as string[])).sort();
  const tagSuggestions = Array.from(new Set(seeds.value.flatMap(s => s.tags ?? []).filter(Boolean) as string[])).sort();
  seedDrawerRef.value?.acceptParams({
    mode,
    row: row ? { ...row } : undefined,
    categorySuggestions,
    tagSuggestions,
    onSubmit: async (payload: Partial<RssSeedDocument> & { parseImmediately?: boolean }) => {
      if (mode === "Edit" && row?.key) {
        await rssStore.editSeed(row.key, payload);
        ElMessage.success(t("rss.seeds.updated"));
      } else {
        await rssStore.addSeed(payload);
        ElMessage.success(t("rss.seeds.added"));
        if (payload.parseImmediately) {
          try {
            const data = await rssStore.parseOne(payload.url || "", payload.name);
            if (data.success) {
              ElMessage.success(
                t("rss.items.parseOneOk", {
                  name: data.source_name || payload.url,
                  saved: data.saved_count ?? 0,
                  updated: data.updated_count ?? 0
                })
              );
            } else {
              ElMessage.warning(t("rss.items.parseOneFail", { error: data.error || "unknown" }));
            }
          } catch {
            /* silent — seed is saved, parse will run on next scheduler tick */
          }
        }
      }
      proTable.value?.getTableList();
    }
  });
}

async function handleDeleteSeed(row: RssSeedDocument) {
  if (!row.key) return;
  try {
    await ElMessageBox.confirm(
      t("rss.seeds.deleteConfirm", { name: row.name || row.url }),
      t("rss.seeds.title"),
      { type: "warning" }
    );
    await rssStore.removeSeed(row.key);
    ElMessage.success(t("rss.seeds.deleted"));
  } catch {
    /* cancelled */
  }
}

async function toggleSeedEnabled(row: RssSeedDocument) {
  if (!row.key) return;
  const next = !(row.enabled ?? true);
  await rssStore.toggleSeedEnabled(row);
  ElMessage.success(next ? t("rss.seeds.enabledToast") : t("rss.seeds.disabledToast"));
}

// ── Columns ──
const columns = reactive(createRssColumns({
  t,
  isRead,
  isStarred,
  toggleStar,
  openDetail,
  toggleRead,
  sourceOptions: sourceOptions.value,
  categoryOptions: categoryOptions.value
}));
</script>

<template>
  <div class="table-box rss-table-box">
    <SchedulerPanel
      :status="schedulerStatus"
      :loading="schedulerLoading"
      :parsing="parsing"
      :seeds="seeds"
      :seeds-loading="seedsLoading"
      :seed-counts="seedCounts"
      @refresh-status="refreshSchedulerStatusManual"
      @refresh-seeds="fetchSeeds"
      @start="handleStartScheduler"
      @stop="handleStopScheduler"
      @parse-all="handleParseAll"
      @add-seed="() => openSeedDrawer('Add')"
      @edit-seed="(row: RssSeedDocument) => openSeedDrawer('Edit', row)"
      @delete-seed="handleDeleteSeed"
      @toggle-seed="toggleSeedEnabled"
      @parse-seed="handleParseSeed"
      @summarize-seed="handleSummarizeSeed"
      @summarize-seeds-bulk="handleSummarizeSeedsBulk"
      @filter-by-source="handleFilterBySource"
      @view-seed-sessions="handleViewSeedSessions"
      @apply-config="handleApplySchedulerConfig"
      @import-opml="handleImportOpml"
      @export-opml="handleExportOpml"
    />
    <template v-if="!isSchedulerView">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getRssList"
      :init-param="initParam"
      :data-callback="dataCallback"
      :height="tableHeight"
      :row-class-name="rowClassName"
    >
      <template #empty>
        <div class="rss-empty">
          <div class="rss-empty-title">{{ t("rss.items.noItemsTitle") }}</div>
          <div class="rss-empty-hint">{{ t("rss.items.noItemsHint") }}</div>
          <el-button type="primary" :icon="Plus" @click="() => openSeedDrawer('Add')">
            {{ t("rss.scheduler.addSeed") }}
          </el-button>
        </div>
      </template>
      <template #tableHeader="scope">
        <el-button
          type="primary"
          :icon="ChatDotRound"
          :disabled="!scope.isSelected"
          @click="batchDiscussInAiChat(scope.selectedList as RssItemDocument[])"
        >
          {{ scope.selectedList.length ? t("rss.items.discussBatch", { n: scope.selectedList.length }) : t("rss.items.discussInAiChat") }}
        </el-button>
        <el-button
          type="success"
          :icon="Reading"
          :disabled="!scope.isSelected"
          @click="batchSummarizeInAiChat(scope.selectedList as RssItemDocument[])"
        >
          {{ scope.selectedList.length ? t("rss.items.summarizeBatch", { n: scope.selectedList.length }) : t("rss.items.summarizeInAiChat") }}
        </el-button>
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="!scope.isSelected"
          @click="handleBulkDelete(scope.selectedList as RssItemDocument[])"
        >
          {{ t("rss.items.deleteSelected") }}
        </el-button>
        <el-button
          :icon="Check"
          :disabled="!scope.isSelected"
          @click="handleMarkSelectedRead(scope.selectedList as RssItemDocument[])"
        >
          {{ t("rss.items.markSelectedRead") }}
        </el-button>
        <el-button
          :icon="Download"
          :disabled="!scope.isSelected"
          @click="handleExportSelected(scope.selectedList as RssItemDocument[])"
        >
          {{ t("rss.items.exportSelected") }}
        </el-button>
        <el-button :icon="Check" @click="handleMarkAllRead">{{ t("rss.items.markAllRead") }}</el-button>
        <el-button-group class="rss-filter-group">
          <el-button
            :type="filterUnread ? 'primary' : 'default'"
            :icon="Reading"
            @click="filterUnread = !filterUnread"
          >{{ t("rss.items.showUnreadOnly") }}</el-button>
          <el-button
            :type="filterStarred ? 'primary' : 'default'"
            :icon="Star"
            @click="filterStarred = !filterStarred"
          >{{ t("rss.items.showStarredOnly") }}</el-button>
        </el-button-group>
        <el-select
          v-model="sortValue"
          size="default"
          style="width: 160px"
          @change="handleSortChange"
        >
          <el-option
            v-for="opt in sortOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-button type="primary" :icon="Refresh" :loading="parsing" @click="handleParseAll">
          {{ t("rss.scheduler.parseAll") }}
        </el-button>
      </template>
      <template #operation="scope">
        <el-tooltip :content="t('rss.items.viewDetail')" placement="top">
          <el-button type="primary" link :icon="ViewIcon" @click="openDetail(scope.row)" />
        </el-tooltip>
        <el-tooltip :content="t('rss.items.discussInAiChat')" placement="top">
          <el-button type="primary" link :icon="ChatDotRound" @click="discussInAiChat(scope.row)" />
        </el-tooltip>
        <el-tooltip :content="t('common.relatedAiChatSessions')" placement="top">
          <el-button type="primary" link :icon="ChatLineRound" @click="viewRelatedAiChatSessions(scope.row)" />
        </el-tooltip>
        <el-tooltip :content="t('rss.items.openSource')" placement="top">
          <el-button type="primary" link :icon="LinkIcon" @click="openSourceLink(scope.row)" />
        </el-tooltip>
        <el-tooltip :content="isRead(scope.row) ? t('rss.items.markUnread') : t('rss.items.markRead')" placement="top">
          <el-button
            type="primary"
            link
            :icon="isRead(scope.row) ? Reading : ViewIcon"
            @click="toggleRead(scope.row)"
          />
        </el-tooltip>
        <el-tooltip :content="isStarred(scope.row) ? t('rss.items.unstar') : t('rss.items.star')" placement="top">
          <el-button
            type="warning"
            link
            :icon="isStarred(scope.row) ? StarFilled : Star"
            :class="{ 'rss-star-active': isStarred(scope.row) }"
            @click="toggleStar(scope.row)"
          />
        </el-tooltip>
        <el-tooltip :content="t('rss.items.reparseFeed')" placement="top">
          <el-button type="primary" link :icon="VideoPlay" :loading="parsing" @click="handleParseOne(scope.row)" />
        </el-tooltip>
        <el-tooltip :content="t('rss.items.deleted')" placement="top">
          <el-button type="danger" link :icon="Delete" @click="handleDeleteItem(scope.row)" />
        </el-tooltip>
      </template>
    </ProTable>
    </template>
    <SeedDrawer ref="seedDrawerRef" />
    <RssItemDetailDrawer
      v-model="detailVisible"
      :item="detailItem"
      :items="proTable?.tableData ?? []"
      :index="detailIndex"
      @mark-read="markRead"
      @navigate="handleNavigate"
    />
  </div>
</template>

<style scoped lang="scss">
.rss-table-box {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 95px);
  padding: 10px 12px;
  overflow: hidden;
  gap: 8px;
}
.rss-cell-muted {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.rss-title-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.rss-unread-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--el-color-primary);
}
.rss-title-unread :deep(.el-link__inner) {
  font-weight: 600;
}
.rss-star-active {
  color: var(--el-color-warning);
}
.rss-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 0;
  color: var(--el-text-color-secondary);
}
.rss-empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.rss-empty-hint {
  font-size: 12px;
}
.rss-filter-group {
  margin-left: 8px;
}
:deep(.rss-row-hidden) {
  display: none;
}
</style>
