<!--
  ============================================================
  HelpOS — HelpCenterPanel.vue (单例 Shell，Teleport 到 body)
  ============================================================
  职责：5 Tab（页面帮助/快捷键/FAQ/Changelog/反馈） + 统一搜索 + A11y 根节点。
  硬闸：
    - 状态、样式完全通过 Vue 3 `<script setup>` + SCSS `lang="scss"` 语义化变量（禁止 6 位 hex 硬编码；全部使用 var(--color-*)）。
    - 关闭一律 `help.close()` → 内部 `DisposerBag.reset()`（绝不 dispose）。
    - 所有 `v-html` 仅用于 `<mark>` 高亮片段；Markdown 统一出口 SafeMarkdown（DOMPurify 白名单）。
-->
<template>
  <Teleport to="body">
    <Transition name="help-fade">
      <div
        v-if="help.state.open"
        class="help-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="t('help.panel.title')"
        @click.self="help.close"
        @keydown="onDialogKeydown"
      >
        <div ref="panelRef" class="help-panel" tabindex="-1">
          <!-- 头：搜索框 + 关闭 -->
          <header class="help-panel__head">
            <div class="help-search">
              <el-icon class="help-search__icon"><Search /></el-icon>
              <input
                ref="searchInputRef"
                v-model="helpSearch.query"
                class="help-search__input"
                type="search"
                :placeholder="searchPlaceholder"
                autocomplete="off"
                spellcheck="false"
                @keydown="onSearchKeydown"
              />
              <kbd class="help-kbd">Esc</kbd>
            </div>
            <el-button text size="large" :aria-label="t('help.panel.close')" @click="help.close">
              <el-icon :size="18"><Close /></el-icon>
            </el-button>
          </header>

          <!-- 搜索结果（若 query 非空则优先展示） -->
          <section v-if="helpSearch.query.trim()" class="help-results" role="region" :aria-label="t('help.search.results')">
            <div v-if="helpSearch.loading" class="help-empty">{{ t('help.search.loading') }}</div>
            <template v-else-if="helpSearch.results.length">
              <div v-for="group in groupedResults" :key="group.tab" class="help-results__group">
                <div class="help-results__group-label">{{ tabLabel(group.tab) }} · {{ group.items.length }}</div>
                <button
                  v-for="(r, i) in group.items"
                  :key="r.id"
                  type="button"
                  class="help-result-item"
                  :class="{ 'is-active': activeResultIdx === (group._start + i) }"
                  @click="runResult(r)"
                  @mouseenter="setActive(group._start + i)"
                >
                  <div class="help-result-item__title" v-html="highlight(r.title)" />
                  <div class="help-result-item__snippet" v-html="r.snippet"></div>
                </button>
              </div>
            </template>
            <div v-else class="help-empty">
              {{ t('help.search.empty') }}
              <span class="help-empty__tip">{{ t('help.search.tip_cmd_k') }}</span>
            </div>
          </section>

          <!-- Tab + Body（若无搜索 query 则展示） -->
          <template v-else>
            <nav class="help-tabs" role="tablist">
              <button
                v-for="t in TABS"
                :key="t.id"
                role="tab"
                type="button"
                class="help-tab"
                :class="{ 'is-active': help.state.activeTab === t.id }"
                :aria-selected="help.state.activeTab === t.id"
                :aria-controls="`help-tabpanel-${t.id}`"
                @click="help.setActiveTab(t.id)"
              >
                <el-icon :size="14"><component :is="t.icon" /></el-icon>
                <span>{{ t.label }}</span>
                <kbd class="help-kbd help-kbd--sm" v-if="t.alias">{{ t.alias }}</kbd>
              </button>
            </nav>

            <main class="help-body">
              <!-- Tab: 页面帮助 -->
              <section v-show="help.state.activeTab === 'page-help'" id="help-tabpanel-page-help" role="tabpanel" class="help-tabpanel">
                <template v-if="pageHelp.current">
                  <h2 class="help-tabpanel__title">{{ pageHelp.current.title }}</h2>
                  <div v-for="s in pageHelp.visibleSections" :key="s.heading" class="help-section">
                    <h3 class="help-section__heading">{{ s.heading }}</h3>
                    <SafeMarkdown class="help-section__content" :content="s.content" />
                  </div>
                  <RelatedShortcuts v-if="pageHelp.current.relatedShortcutIds.length" :ids="pageHelp.current.relatedShortcutIds" />
                  <RelatedLinks v-if="pageHelp.current.relatedLinks.length" :links="pageHelp.current.relatedLinks" />
                  <ProTips v-if="pageHelp.current.proTips?.length" :tips="pageHelp.current.proTips" />
                </template>
                <EmptyPageHelp v-else />
              </section>

              <!-- Tab: 快捷键 -->
              <section v-show="help.state.activeTab === 'shortcuts'" id="help-tabpanel-shortcuts" role="tabpanel" class="help-tabpanel">
                <ShortcutsTab />
              </section>

              <!-- Tab: FAQ -->
              <section v-show="help.state.activeTab === 'faq'" id="help-tabpanel-faq" role="tabpanel" class="help-tabpanel">
                <FAQTab />
              </section>

              <!-- Tab: 更新日志 -->
              <section v-show="help.state.activeTab === 'changelog'" id="help-tabpanel-changelog" role="tabpanel" class="help-tabpanel">
                <ChangelogTab />
              </section>

              <!-- Tab: 反馈 -->
              <section v-show="help.state.activeTab === 'feedback'" id="help-tabpanel-feedback" role="tabpanel" class="help-tabpanel">
                <FeedbackTab />
              </section>
            </main>
          </template>

          <footer class="help-panel__foot">
            <span>{{ t('help.panel.footer.version') }}: {{ appVersion }}</span>
            <a class="help-footlink" @click.prevent="openYiknowledgeDoc">{{ t('help.panel.footer.docs') }}</a>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts" name="HelpCenterPanel">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch, h } from "vue";
import { useI18n } from "vue-i18n";
import { Search, Close, Reading, MagicStick, QuestionFilled, CollectionTag, ChatDotRound } from "@element-plus/icons-vue";
import { useHelp } from "./useHelp";
import { usePageHelp } from "./usePageHelp";
import { useHelpSearch } from "./useHelpSearch";
import { TIMEOUT_CONFIG } from "@/config/timeout";
import SafeMarkdown from "./shared/SafeMarkdown.vue";
import RelatedShortcuts from "./tabs/RelatedShortcuts.vue";
import RelatedLinks from "./tabs/RelatedLinks.vue";
import ProTips from "./tabs/ProTips.vue";
import EmptyPageHelp from "./tabs/EmptyPageHelp.vue";
import ShortcutsTab from "./tabs/ShortcutsTab.vue";
import FAQTab from "./tabs/FAQTab.vue";
import ChangelogTab from "./tabs/ChangelogTab.vue";
import FeedbackTab from "./tabs/FeedbackTab.vue";
import type { HelpTabId, HelpSearchResult } from "./types";

const { t, locale } = useI18n();
const help = useHelp();
const pageHelp = usePageHelp();
const _helpSearch = useHelpSearch({ timeout: TIMEOUT_CONFIG.query });
/** 显式把 UseHelpSearchRuntime 当作 reactive 用：template 直接取 .query/.results/.loading 均为非 Ref 值；
 *  脚本侧若要取 raw ref（透传 composable / 取消请求 / watch 深层），使用 helpSearch.$.query / helpSearch.$.abortAll()。
 */
const helpSearch: {
  query: string;
  results: HelpSearchResult[];
  loading: boolean;
  scope: string;
  readonly $: import("./useHelpSearch").UseHelpSearchAPI;
  readonly abortAll: () => void;
} = _helpSearch as any;
/** 兼容写法：旧代码里 const { query } = $(helpSearch.$) 等价。 */
const helpSearch$ = helpSearch.$;

const panelRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const triggerEl = ref<HTMLElement | null>(null); // 关闭后焦点回归的触发元素
const appVersion = (import.meta.env.RSBUILD_ENV_GLOB_APP_TITLE ? "" : "") + ((globalThis as unknown as { __APP_VERSION__?: string }).__APP_VERSION__ ?? "1.8.3");

const activeResultIdx = ref(0);

/* ──────────────────── Tab 元数据 ──────────────────── */
const TABS: ReadonlyArray<{ id: HelpTabId; label: string; icon: any; alias: string }> = [
  { id: "page-help", label: t("help.tabs.page_help"), icon: Reading, alias: "@help" },
  { id: "shortcuts", label: t("help.tabs.shortcuts"), icon: MagicStick, alias: "@shortcuts" },
  { id: "faq", label: t("help.tabs.faq"), icon: QuestionFilled, alias: "@faq" },
  { id: "changelog", label: t("help.tabs.changelog"), icon: CollectionTag, alias: "@changelog" },
  { id: "feedback", label: t("help.tabs.feedback"), icon: ChatDotRound, alias: "" }
];

const searchPlaceholder = computed(() =>
  t("help.search.placeholder", { sample: TABS.filter(x => x.alias).map(x => x.alias).join(" / ") })
);

/* ──────────────────── 搜索结果分组与键盘导航 ──────────────────── */
const groupedResults = computed(() => {
  const flat = helpSearch.results;
  const order: HelpTabId[] = ["shortcuts", "page-help", "faq", "changelog"];
  let cursor = 0;
  const groups = order.map(tab => {
    const items = flat.filter(r => r.tab === tab);
    const start = cursor;
    cursor += items.length;
    (items as any[]).forEach((it, i) => ((it as any)._start = start + i));
    return { tab, items, _start: start, label: tabLabel(tab) };
  }).filter(g => g.items.length > 0);
  return groups;
});
const totalResults = computed(() => helpSearch.results.length);

function tabLabel(tab: HelpTabId): string {
  return TABS.find(x => x.id === tab)?.label ?? tab;
}

function setActive(i: number) {
  activeResultIdx.value = Math.max(0, Math.min(i, totalResults.value - 1));
  // 滚动可见
  nextTick(() => {
    const el = panelRef.value?.querySelectorAll<HTMLElement>(".help-result-item")[activeResultIdx.value];
    el?.scrollIntoView({ block: "nearest" });
  });
}

function runResult(r: { open: () => void }) {
  try { r.open(); } catch { /* noop */ }
  help.close();
}

function highlight(text: string): string {
  const q = helpSearch.query.trim();
  if (!q) return escapeHtml(text);
  const re = new RegExp(`(${escapeRegex(q)})`, "ig");
  return escapeHtml(text).replace(re, (_m, g1) => `<mark>${g1}</mark>`);
}

/* ──────────────────── 打开/关闭 生命周期 ──────────────────── */
watch(() => help.state.open, async isOpen => {
  if (isOpen) {
    await nextTick();
    panelRef.value?.focus();
    setTimeout(() => searchInputRef.value?.focus({ preventScroll: true }), 0);
  } else {
    // 关闭焦点回归触发元素
    try { (triggerEl.value as HTMLElement | null)?.focus?.(); } catch { /* noop */ }
    triggerEl.value = null;
  }
}, { flush: "post" });

// 记录最后一次聚焦元素（Esc/overlay 关闭时回归）
function onDialogKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    e.stopPropagation();
    help.close();
  }
}

function onSearchKeydown(e: KeyboardEvent) {
  const total = totalResults.value;
  if (e.key === "ArrowDown" && total > 0) {
    e.preventDefault();
    setActive((activeResultIdx.value + 1) % total);
  } else if (e.key === "ArrowUp" && total > 0) {
    e.preventDefault();
    setActive((activeResultIdx.value - 1 + total) % total);
  } else if (e.key === "Enter" && total > 0) {
    e.preventDefault();
    const picked = helpSearch.results[activeResultIdx.value];
    if (picked) runResult(picked);
  }
}

/* ──────────────────── 帮助面板 L1 外部触发：统一记录 trigger 元素 ──────────────────── */
function onGlobalMousedown(e: MouseEvent) {
  if (!help.state.open && e.target instanceof HTMLElement) {
    // 点击右上角 ? 图标时记住它，用于关闭回归
    const el = e.target.closest<HTMLElement>("[data-help-trigger='true']");
    if (el) triggerEl.value = el;
  }
}
document.addEventListener("mousedown", onGlobalMousedown, true);

function openYiknowledgeDoc() {
  window.open("https://yipot.com/yiknowledge/yivad-help", "_blank", "noopener,noreferrer");
}

/* ──────────────────── utils ──────────────────── */
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeRegex(s: string): string {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

onMounted(() => {
  // aria-live: 通知搜索结果数（屏幕阅读器）
  watch(totalResults, n => {
    if (!help.state.open) return;
    const live = document.getElementById("help-aria-live-region");
    if (live) live.textContent = t("help.search.result_count", String(n));
  });
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onGlobalMousedown, true);
});
</script>

<style lang="scss" scoped>
/* 全部使用语义化 CSS 变量；禁止 hex。主题：Element Plus + YiVad tokens（styles/var.scss） */
.help-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; justify-content: center; align-items: flex-start;
  padding-top: 12vh;
  background: var(--el-overlay-color);
  backdrop-filter: blur(2px);
}
.help-panel {
  width: min(960px, 92vw);
  max-height: 80vh;
  display: flex; flex-direction: column;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
  font: var(--el-font-size-base) / 1.5 var(--el-font-family);
  &:focus { outline: none; }
}

/* Head */
.help-panel__head {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-bottom: 1px solid var(--el-border-color);
  background: var(--el-fill-color-light);
}
.help-search {
  flex: 1; display: flex; align-items: center; gap: 8px;
  padding: 6px 12px; background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color); border-radius: 8px;
  &:focus-within { border-color: var(--el-color-primary); box-shadow: 0 0 0 3px var(--el-color-primary-light-9); }
}
.help-search__icon { color: var(--el-text-color-placeholder); }
.help-search__input {
  flex: 1; border: 0; background: transparent; outline: none;
  font: inherit; color: var(--el-text-color-primary);
  &::placeholder { color: var(--el-text-color-placeholder); }
}
.help-kbd {
  display: inline-flex; align-items: center; height: 22px; padding: 0 6px;
  font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--el-text-color-secondary);
  border: 1px solid var(--el-border-color); background: var(--el-fill-color);
  border-radius: 4px;
  &--sm { height: 18px; padding: 0 4px; font-size: 10px; }
}

/* Tabs */
.help-tabs {
  display: flex; align-items: stretch;
  padding: 0 16px; border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  gap: 4px;
}
.help-tab {
  appearance: none; background: transparent; border: 0; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 12px 10px 10px;
  color: var(--el-text-color-secondary);
  border-bottom: 2px solid transparent;
  font: inherit;
  &:hover { color: var(--el-text-color-primary); }
  &.is-active { color: var(--el-color-primary); border-bottom-color: var(--el-color-primary); }
}

/* Search Results */
.help-results {
  padding: 8px 0; overflow-y: auto; min-height: 180px;
}
.help-results__group-label {
  padding: 8px 20px 4px;
  font-size: 11px; letter-spacing: .5px; text-transform: uppercase;
  color: var(--el-text-color-secondary);
}
.help-result-item {
  all: unset; box-sizing: border-box; cursor: pointer;
  display: block; padding: 8px 20px;
  &:hover, &.is-active { background: var(--el-fill-color-light); }
  &__title { font-weight: 600; color: var(--el-text-color-primary); }
  &__snippet { color: var(--el-text-color-secondary); font-size: 12px; margin-top: 2px; }
}
.help-empty {
  padding: 24px 20px; text-align: center; color: var(--el-text-color-secondary);
  &__tip { display: block; margin-top: 6px; color: var(--el-color-primary-light-5); font-size: 12px; }
}

/* Body & Tab panel */
.help-body { flex: 1; min-height: 0; overflow: hidden; display: flex; }
.help-tabpanel {
  width: 100%;
  padding: 16px 20px 20px;
  overflow-y: auto;
  &__title { margin: 0 0 12px; font-size: 16px; font-weight: 600; color: var(--el-text-color-primary); }
}
.help-section { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px dashed var(--el-border-color-lighter); &:last-child { border-bottom: 0; } }
.help-section__heading { margin: 0 0 6px; font-size: 13px; font-weight: 600; color: var(--el-color-primary); }
.help-section__content :deep(kbd) { @extend .help-kbd; }

/* Foot */
.help-panel__foot {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; border-top: 1px solid var(--el-border-color);
  color: var(--el-text-color-secondary); font-size: 12px; background: var(--el-fill-color-lighter);
}
.help-footlink { color: var(--el-color-primary); cursor: pointer; }

/* Transition */
.help-fade-enter-from, .help-fade-leave-to { opacity: 0; transform: translateY(-6px); }
.help-fade-enter-active, .help-fade-leave-active { transition: opacity 180ms ease, transform 180ms ease; }

@media (prefers-reduced-motion: reduce) {
  .help-fade-enter-active, .help-fade-leave-active { transition: opacity 120ms linear; transform: none !important; }
}
</style>
