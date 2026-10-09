<template>
  <div class="page-detail page">
    <!-- 22s UI Watchdog 兜底骨架屏（页面级硬约束）：loading 超过 22s 仍显示骨架但提示可跳回 -->
    <template v-if="loading || page">
      <template v-if="loading && !page">
        <DetailSkeleton />
      </template>

      <template v-else-if="page">
        <!-- 页眉 -->
        <div class="pd-header">
          <div class="pd-header__crumbs">
            <el-button link type="primary" :icon="Back" @click="goBack">
              {{ projectKey ? `项目 / ${projectKey}` : "文档中心" }}
            </el-button>
            <el-icon v-if="parentKey" class="pd-header__crumb-sep"><ArrowRight /></el-icon>
            <el-button v-if="parentKey" link type="primary" @click="router.push(`/page?parent=${encodeURIComponent(parentKey)}`)">
              上级目录
            </el-button>
          </div>
          <div class="pd-header__title-row">
            <h1 class="pd-header__title">{{ page.title }}</h1>
            <div class="pd-header__actions">
              <code class="pd-header__key" :title="'文档 key：'+page.key">{{ page.key }}</code>
              <el-tag v-if="projectKey" size="small" type="info" effect="plain">项目：{{ projectKey }}</el-tag>
              <el-tooltip :content="'最后更新：'+formatDate(page.updated_at, true)">
                <el-tag size="small" type="success" effect="plain">
                  更新于 {{ formatDate(page.updated_at) }}
                </el-tag>
              </el-tooltip>
              <el-button size="small" :icon="Edit" @click="openEdit">{{ $t?.("common.edit") || "编辑" }}</el-button>
              <el-dropdown trigger="click">
                <el-button :icon="MoreFilled" size="small" />
                <template #dropdown>
                  <el-dropdown-item :icon="CopyDocument" @click="copyKey">复制 Key</el-dropdown-item>
                  <el-dropdown-item :icon="CopyDocument" @click="copyLink">复制直链</el-dropdown-item>
                  <el-dropdown-item :icon="Delete" divided type="danger" @click="handleDelete">删除文档</el-dropdown-item>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>

        <!-- 正文（Markdown + Mermaid）-->
        <div class="pd-body">
          <READMECard
            :content="page.content || ''"
            :html="renderedHTML"
            meta-type="Page · Markdown"
            :meta-updated="formatDate(page.updated_at)"
            empty-hint="该文档暂无正文内容，点击右上角『编辑』添加 README。"
            edit-label="编辑正文"
            add-label="新建正文"
            @edit="openEdit"
          />
        </div>

        <!-- 编辑弹窗（最小实现；具体业务交给 PageEditorDialog 未来插件） -->
        <el-dialog v-model="editDialogVisible" :title="'编辑 · ' + (page.title || '')" width="760px" destroy-on-close>
          <el-input
            v-model="editDraft"
            type="textarea"
            :rows="18"
            placeholder="在此输入 Markdown 正文…"
            @input="updatePreviewHTML"
          />
          <div class="pd-edit-preview-label">实时预览（只读）</div>
          <div class="pd-edit-preview rm-preview" v-html="draftPreviewHTML"></div>
          <template #footer>
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="saving" @click="submitEdit">保存</el-button>
          </template>
        </el-dialog>
      </template>
    </template>

    <!-- 未找到：30s 内后端返回空列表（不是超时）-->
    <template v-else-if="!loading && !page">
      <div class="pd-empty">
        <el-icon size="64" class="pd-empty__icon"><WarningFilled /></el-icon>
        <h2 class="pd-empty__title">未找到该文档（{{ keyParam }}）</h2>
        <p class="pd-empty__desc">{{ notFoundHint }}</p>
        <div class="pd-empty__actions">
          <el-button type="primary" :icon="Search" @click="router.push(`/search?q=${encodeURIComponent(keyParam || '')}`)">
            在搜索页查找相似文档
          </el-button>
          <el-button :icon="Back" @click="goBack">返回上一页</el-button>
          <el-button :icon="Document" @click="router.push('/page')">回到文档中心</el-button>
        </div>
      </div>
    </template>

    <!-- UI Watchdog 22s 超时通知条 -->
    <Transition name="fade">
      <el-alert
        v-if="uiWatchdogFired"
        class="pd-watchdog"
        type="warning"
        :closable="false"
        show-icon
        :title="'详情加载超过 22s 仍未返回，已为您暂停骨架屏展示。可刷新重试，或回到搜索页。'"
      >
        <template #default>
          <div>
            <el-button size="small" type="primary" plain @click="reload(true)">跳过缓存重试</el-button>
            <el-button size="small" @click="router.push('/search')">去搜索页</el-button>
          </div>
        </template>
      </el-alert>
    </Transition>
  </div>
</template>

<script setup lang="ts" name="pageDetail">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowRight, Back, CopyDocument, Delete, Document, Edit, MoreFilled, Search, WarningFilled
} from "@element-plus/icons-vue";
import { ElNotification, ElMessageBox } from "element-plus";
import READMECard from "@/components/DescriptionCard/READMECard.vue";
import DetailSkeleton from "@/views/project/components/DetailSkeleton.vue";
import { useMarkdown } from "@/hooks/useMarkdown";
import { getPage, deletePage, updatePage, type Page } from "@/api/modules/pageService";
import { DisposerBag } from "@/utils/disposer";
import { pushReliabilityEvent } from "@/utils/reliability/reliabilityMetrics";

const route = useRoute();
const router = useRouter();
const { render: renderMarkdown } = useMarkdown();

/* ── State ─────────────────────────────────────────────────────────────── */
const keyParam = computed<string>(() => String((route.params as any).key ?? ""));
const loading = ref(false);
const page = ref<Page | null>(null);
const error = ref<string | null>(null);
const renderedHTML = ref("");

const disposer = new DisposerBag();

/* ── 双 Watchdog：12s Hook + 22s UI ────────────────────────────────────── */
const hookWatchdogFired = ref(false);
const uiWatchdogFired = ref(false);
let hookTimer: ReturnType<typeof setTimeout> | null = null;
let uiTimer: ReturnType<typeof setTimeout> | null = null;

function feedWatchdogs() {
  killWatchdogs();
  hookTimer = setTimeout(() => {
    hookWatchdogFired.value = true;
    loading.value = false;
    pushReliabilityEvent({
      projectKey: projectKeyEvent.value,
      phase: "page_detail_load",
      status: "failed",
      durationMs: 12_000,
      retryCount: 0,
      errorType: "timeout",
      tags: { stage: "watchdog", subStage: "hook_12s", key: keyParam.value }
    });
  }, 12_000);
  uiTimer = setTimeout(() => {
    uiWatchdogFired.value = true;
    loading.value = false;
    pushReliabilityEvent({
      projectKey: projectKeyEvent.value,
      phase: "page_detail_load",
      status: "failed",
      durationMs: 22_000,
      retryCount: 0,
      errorType: "timeout",
      tags: { stage: "watchdog", subStage: "ui_22s", key: keyParam.value }
    });
  }, 22_000);
}
function killWatchdogs() {
  if (hookTimer) { clearTimeout(hookTimer); hookTimer = null; }
  if (uiTimer)   { clearTimeout(uiTimer);   uiTimer = null; }
  hookWatchdogFired.value = false;
  uiWatchdogFired.value = false;
}

/* ── 派生字段 ──────────────────────────────────────────────────────────── */
const projectKey = computed<string | undefined>(() => page.value?.project_key);
/** 事件桥接用：若当前 page 未绑定项目，给 ""（空串），避免 pushReliabilityEvent 的 projectKey:string 类型报错。 */
const projectKeyEvent = computed<string>(() => projectKey.value ?? "");
const parentKey = computed<string | undefined>(() => page.value?.parent_key);
const notFoundHint = computed<string>(() => {
  if (error.value) return error.value;
  return "该 key 对应文档不存在或已被删除。请确认拼写，或返回文档中心查看完整目录。";
});

/* ── 编辑弹窗 ──────────────────────────────────────────────────────────── */
const editDialogVisible = ref(false);
const editDraft = ref("");
const draftPreviewHTML = ref("");
const saving = ref(false);

function openEdit() {
  editDraft.value = page.value?.content || "";
  draftPreviewHTML.value = renderedHTML.value;
  editDialogVisible.value = true;
}
function updatePreviewHTML() {
  draftPreviewHTML.value = renderMarkdown(editDraft.value);
}

async function submitEdit() {
  if (!page.value) return;
  saving.value = true;
  try {
    await updatePage(page.value.key, { content: editDraft.value });
    page.value = { ...page.value, content: editDraft.value, updated_at: new Date().toISOString() };
    renderedHTML.value = renderMarkdown(page.value.content);
    editDialogVisible.value = false;
    ElNotification({ title: "保存成功", message: page.value.title, type: "success", duration: 2000 });
  } catch (e: any) {
    ElNotification({ title: "保存失败", message: e?.message || "未知错误", type: "error", duration: 3000 });
  } finally {
    saving.value = false;
  }
}

/* ── 加载器：AbortSignal.any + disposer.reset ───────────────────────────── */
async function load(skipCache = false) {
  const key = keyParam.value;
  if (!key) {
    loading.value = false;
    return;
  }
  // 重置 disposer：容器保留，条目清空（硬约束：不能 dispose，否则 disposed=true 会让后续 AbortCtrl 立即 abort）
  disposer.reset();
  const ctrl = new AbortController();
  disposer.addAbort(ctrl);
  loading.value = true;
  error.value = null;
  feedWatchdogs();

  // 联合 signal：外部超时（此处 15s）+ 内部 AbortController，用 AbortSignal.any 合并
  const t15 = (AbortSignal as any).timeout ? (AbortSignal as any).timeout(15_000) : undefined;
  const combined = (() => {
    const list = [ctrl.signal, t15].filter(Boolean) as AbortSignal[];
    if (list.length === 1) return list[0];
    try {
      if (typeof (AbortSignal as any).any === "function") return (AbortSignal as any).any(list);
    } catch { /* fallback below */ }
    const fallback = new AbortController();
    for (const s of list) {
      if (s.aborted) { try { fallback.abort(); } catch { /* noop */ } break; }
      s.addEventListener("abort", () => { try { fallback.abort(); } catch { /* noop */ } }, { once: true });
    }
    return fallback.signal;
  })();

  if (skipCache) {
    // 预留：暂无 L1 缓存；保留给将来的 usePageData 做 localCache 清理
  }

  try {
    const res = await getPage(key);
    if (ctrl.signal.aborted) return;
    const arr = (res.data?.list as Page[]) ?? [];
    page.value = arr[0] ?? null;
    renderedHTML.value = renderMarkdown(page.value?.content || "");
    if (!page.value) {
      pushReliabilityEvent({
        projectKey: projectKeyEvent.value,
        phase: "page_detail_load",
        status: "degraded",
        durationMs: 0,
        retryCount: 0,
        errorType: "business",
        tags: { stage: "http", subStage: "empty_list", key }
      });
    }
  } catch (e: any) {
    if (ctrl.signal.aborted || (e && (e.name === "AbortError" || /cancel|abort/i.test(e.message || "")))) {
      // 主动取消：不视为错误
      return;
    }
    error.value = (e?.message || String(e?.code || "未知错误"));
    pushReliabilityEvent({
      projectKey: projectKeyEvent.value,
      phase: "page_detail_load",
      status: "failed",
      durationMs: 0,
      retryCount: 0,
      errorType: /timeout/i.test(error.value || "") ? "timeout" : "network",
      errorMessage: error.value || undefined,
      tags: { stage: "http", subStage: "error", key, msg: error.value || "" }
    });
  } finally {
    if (!ctrl.signal.aborted) {
      loading.value = false;
      killWatchdogs();
    }
  }
}

function reload(skipCache = false) {
  uiWatchdogFired.value = false;
  nextTick(() => load(skipCache));
}

/* ── Actions ─────────────────────────────────────────────────────────── */
function goBack() {
  if (window.history.length > 1) router.back();
  else router.push("/page");
}

function copyKey() {
  navigator.clipboard?.writeText(keyParam.value).catch(() => { /* noop */ });
  ElNotification({ title: "已复制", message: keyParam.value, type: "success", duration: 1500 });
}
function copyLink() {
  const url = `${window.location.origin}/#/page/${encodeURIComponent(keyParam.value)}`;
  navigator.clipboard?.writeText(url).catch(() => { /* noop */ });
  ElNotification({ title: "已复制直链", message: url, type: "success", duration: 2000 });
}
async function handleDelete() {
  if (!page.value) return;
  try {
    await ElMessageBox.confirm(
      `将永久删除文档「${page.value.title}（${page.value.key}）」，是否继续？`,
      "确认删除",
      { type: "warning", confirmButtonText: "删除", cancelButtonText: "取消" }
    );
    await deletePage(page.value.key);
    ElNotification({ title: "已删除", message: page.value.title, type: "success", duration: 2000 });
    router.push("/page");
  } catch { /* 用户取消 */ }
}

/* 支持非 Markdown 的用户：在正文上按 C-/E 直接进入编辑 */
function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && (e.key === "e" || e.key === "E")) {
    e.preventDefault();
    openEdit();
  }
}

/* ── Lifecycle ─────────────────────────────────────────────────────────── */
watch(
  keyParam,
  () => {
    page.value = null;
    renderedHTML.value = "";
    load();
  },
  { flush: "post" }
);

onMounted(() => {
  if (keyParam.value) load();
  window.addEventListener("keydown", handleKeydown);
});
onBeforeUnmount(() => {
  killWatchdogs();
  disposer.dispose();
  window.removeEventListener("keydown", handleKeydown);
});

/* ── Utils ─────────────────────────────────────────────────────────────── */
function formatDate(s: string, full = false): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  if (!full) return `${y}-${m}-${day}`;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}
</script>

<style scoped lang="scss">
.page-detail {
  position: relative;
  min-height: 100vh;
  padding: 24px 32px 64px;
  max-width: 1280px;
  margin: 0 auto;
}

.pd-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.pd-header__crumbs {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.pd-header__crumb-sep { color: var(--el-text-color-placeholder); margin: 0 2px; }
.pd-header__title-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.pd-header__title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.pd-header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.pd-header__key {
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
  font-family: ui-monospace, Menlo, monospace;
  font-size: 11px;
  color: var(--el-text-color-regular);
  border: 1px solid var(--el-border-color-lighter);
}

.pd-body { display: flex; flex-direction: column; }
.pd-watchdog { margin-top: 20px; }

.pd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 60vh;
  text-align: center;
  color: var(--el-text-color-regular);
}
.pd-empty__icon { color: var(--el-color-warning); }
.pd-empty__title { margin: 0; font-size: 18px; color: var(--el-text-color-primary); }
.pd-empty__desc { max-width: 520px; margin: 0; font-size: 13px; line-height: 1.6; }
.pd-empty__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 8px; }

.pd-edit-preview-label {
  margin: 10px 2px 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pd-edit-preview {
  max-height: 240px;
  overflow: auto;
  padding: 12px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
}
.pd-edit-preview :deep(pre) { background: #0f172a; color: #e2e8f0; padding: 10px; border-radius: 6px; }
</style>
