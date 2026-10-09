<template>
  <Teleport to="body">
    <Transition name="cmd-palette-fade">
      <div v-if="visible" class="cmd-palette-overlay" @click.self="close">
        <div class="cmd-palette" role="dialog" aria-label="命令面板">
          <!-- ── 顶部搜索栏 ───────────────────────────────────────────── -->
          <div class="cmd-palette__input-wrap">
            <el-icon v-if="!loading" class="cmd-palette__search-icon"><Search /></el-icon>
            <el-icon v-else class="cmd-palette__search-icon cmd-palette__spinner"><Loading /></el-icon>
            <input
              ref="inputRef"
              v-model="query"
              class="cmd-palette__input"
              :placeholder="placeholder"
              :aria-invalid="!!error"
              @keydown="onKeydown"
            />
            <span v-if="gateAStats.invalidCount" class="cmd-palette__ghost-count" :title="'已自动屏蔽 '+gateAStats.invalidCount+' 条不可达/幽灵结果（点击展开统计）'">
              屏蔽 {{ gateAStats.invalidCount }}
            </span>
            <kbd v-if="!calculatorSnippet && !aiAskSnippet" class="cmd-palette__kbd">Esc</kbd>
            <kbd v-else class="cmd-palette__kbd cmd-palette__kbd--close" @click.stop="resetInlineSnippet">Clear</kbd>
          </div>

          <!-- ── 内联 snippet（Calculator / AI Ask）────────────────── -->
          <div v-if="calculatorSnippet" class="cmd-palette__snippet cmd-palette__snippet--calc">
            <span class="cmd-palette__snippet-label">计算结果</span>
            <span class="cmd-palette__snippet-expr">{{ calculatorSnippet.expr }} =</span>
            <span class="cmd-palette__snippet-value">{{ calculatorSnippet.display }}</span>
          </div>
          <div v-else-if="aiAskSnippet" class="cmd-palette__snippet cmd-palette__snippet--ai">
            <span class="cmd-palette__snippet-label">AI 问答</span>
            <span class="cmd-palette__snippet-expr">{{ aiAskSnippet.query }}</span>
            <el-button type="primary" size="small" link @click="openAiChatForQuery(aiAskSnippet.query)">
              在 AI Chat 中打开 →
            </el-button>
          </div>

          <!-- ── 错误提示 ──────────────────────────────────────────── -->
          <div v-if="error && !results.length && !hasQuickActions" class="cmd-palette__error">
            <el-icon><Warning /></el-icon>
            <span>{{ error }}</span>
          </div>

          <!-- ── 结果区 / 空态 / Quick Actions ────────────────────── -->
          <div class="cmd-palette__results" v-else>
            <!-- 有 query：展示搜索分组结果 -->
            <template v-if="query">
              <template v-for="group in resultGroups" :key="group.type">
                <div v-if="group.items.length" class="cmd-palette__group-label">
                  {{ group.label }}
                  <span class="cmd-palette__group-count">{{ group.items.length }}</span>
                </div>
                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="cmd-palette__item"
                  :class="{
                    'cmd-palette__item--active': activeIdx === item._idx,
                    'cmd-palette__item--disabled': !item._gateA.ok,
                    'cmd-palette__item--ghost': !item._gateA.ok
                  }"
                  :disabled="!item._gateA.ok"
                  @click="selectItem(item)"
                  @mouseenter="activeIdx = item._idx; hoveredItem = item"
                  @focus="activeIdx = item._idx"
                >
                  <div class="cmd-palette__item-icon" :style="{ background: group.color }">
                    <el-icon :size="14"><component :is="group.icon" /></el-icon>
                  </div>
                  <div class="cmd-palette__item-content">
                    <div class="cmd-palette__item-title" v-html="highlight(item.title)" />
                    <div class="cmd-palette__item-meta">
                      <el-tag
                        v-for="(b, bi) in (item.badges || []).slice(0, 2)"
                        :key="bi"
                        size="small"
                        :type="b.type || 'info'"
                        :effect="b.effect || 'plain'"
                        class="cmd-palette__item-tag"
                      >{{ b.label }}</el-tag>
                      <span class="cmd-palette__item-sub">{{ item.subtitle }}</span>
                      <span v-if="item.project" class="cmd-palette__item-project">· {{ item.project }}</span>
                      <span v-if="item.date" class="cmd-palette__item-date">· {{ formatDate(item.date) }}</span>
                    </div>
                  </div>
                  <!-- Gate A 徽标：灰卡 + 不可达说明 -->
                  <LinkValidationBadge
                    v-if="!item._gateA.ok"
                    class="cmd-palette__item-badge"
                    :gate-a="item._gateA"
                    :gate-b="item._gateB"
                  />
                  <kbd v-else-if="activeIdx === item._idx" class="cmd-palette__item-kbd">↵</kbd>
                </div>
              </template>

              <div v-if="!totalItems" class="cmd-palette__empty">
                没有匹配「{{ query }}」的结果。
                <br />
                小提示：输入 "?" 可直接问 AI，输入 "100 km to mi" 可直接计算。
              </div>
            </template>

            <!-- 无 query：Quick Actions（启动时过 Gate A 剔除不可达项） -->
            <template v-else>
              <div class="cmd-palette__group-label">快捷操作 <span class="cmd-palette__group-count">{{ quickActionsFiltered.length }}/{{ quickActions.length }}</span></div>
              <div v-if="!quickActionsFiltered.length" class="cmd-palette__empty">当前账号暂无可访问的快捷操作。</div>
              <div
                v-for="action in quickActionsFiltered"
                :key="action.id"
                class="cmd-palette__item"
                :class="{ 'cmd-palette__item--active': activeIdx === action._idx }"
                @click="runQuickAction(action)"
                @mouseenter="activeIdx = action._idx"
              >
                <div class="cmd-palette__item-icon" :style="{ background: action.color }">
                  <el-icon :size="14"><component :is="action.icon" /></el-icon>
                </div>
                <div class="cmd-palette__item-content">
                  <div class="cmd-palette__item-title">{{ action.title }}</div>
                  <div class="cmd-palette__item-meta">{{ action.shortcut }}</div>
                </div>
                <kbd class="cmd-palette__item-kbd" v-if="activeIdx === action._idx">↵</kbd>
              </div>
            </template>
          </div>

          <!-- ── 底部状态条：指标 / MRU 提示 ───────────────────────── -->
          <div class="cmd-palette__footer" v-if="meta || timing || ghostFilteredCount > 0">
            <span v-if="timing" class="cmd-palette__footer-chip">⏱ {{ timing.total_ms }}ms</span>
            <span v-if="ghostFilteredCount > 0" class="cmd-palette__footer-chip cmd-palette__footer-chip--warn">🕸 本次过滤幽灵条目 {{ ghostFilteredCount }} 条</span>
            <span v-if="meta && meta.index_version" class="cmd-palette__footer-chip">index v{{ meta.index_version }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts" name="commandPalette">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  nextTick
} from "vue";
import { useRouter } from "vue-router";
import {
  Search,
  Loading,
  Plus,
  Tickets,
  Grid,
  Folder,
  Calendar,
  Document,
  ChatLineRound,
  Reading,
  Setting,
  Warning,
  Collection,
  Guide,
  MagicStick,
  QuestionFilled,
  CollectionTag,
  ChatDotRound
} from "@element-plus/icons-vue";
import { ElNotification } from "element-plus";
import { useI18n } from "vue-i18n";
import mittBus from "@/utils/mittBus";
import { DisposerBag } from "@/utils/disposer";
import LinkValidationBadge from "@/components/CommandPalette/LinkValidationBadge.vue";
import useUnifiedSearch, { type UnifiedSearchItemV2 } from "@/composables/useUnifiedSearch";
import {
  resolveLink,
  gateBEntityExists,
  gateCPostNavigate,
  type LinkResolveOk
} from "@/utils/linkFactory";
import type { PaletteItem, PaletteItemGroup, QuickAction, CalculatorSnippet } from "./types";
import useCalculator from "@/composables/useCalculator";
import { useCommandPaletteStore } from "@/stores/command-palette";

const router = useRouter();
const { t } = useI18n();
const cpStore = useCommandPaletteStore();
const calculator = useCalculator();

const visible = ref(false);
const query = ref("");
const activeIdx = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);
const hoveredItem = shallowRef<PaletteItem | null>(null);
const disposer = new DisposerBag();

/* ── 搜索数据源：SSOT useUnifiedSearch（v2 contract）───────────────────── */
const {
  results: _rawResults,
  loading,
  error,
  meta,
  timing,
  refresh,
  dispose: _usDispose,
} = (() => {
  const search = useUnifiedSearch(query as any, {
    collections: [],          // 空数组 = 所有集合
    limit: 40,
    debounceMs: 200,
    timeoutMs: 15_000,
    immediate: false,
  });
  return {
    results: search.results,
    loading: search.loading,
    error: search.error,
    meta: search.meta,
    timing: search.timing,
    refresh: search.refresh,
    dispose: search.disposer,
  };
})();
const results = computed(() => _rawResults.value || []);

/* ── 内联 snippet：Calculator ──────────────────────────────────────────── */
const calculatorSnippet = ref<CalculatorSnippet | null>(null);
const aiAskSnippet = ref<{ kind: "ai-ask"; query: string } | null>(null);

/* ── Gate A 统计（屏蔽幽灵条目数） ─────────────────────────────────────── */
const ghostFilteredCount = computed(() => meta.value?.ghost_filtered_count ?? 0);

/* ── 对原始搜索结果做 Gate A resolve & _idx 赋值 ──────────────────────── */
const paletteItems = computed<PaletteItem[]>(() => {
  const raw = (_rawResults.value || []) as unknown as UnifiedSearchItemV2[];
  let idx = 0;
  return raw
    .map(item => {
      const gateA = resolveLink({
        type: item.type,
        key: item.key,
        project: item.project,
        title: item.title,
      });
      return { ...(item as any), _idx: idx++, _gateA: gateA } as PaletteItem;
    });
});

const gateAStats = computed(() => {
  const arr = paletteItems.value;
  let invalidCount = 0;
  for (const it of arr) if (!it._gateA.ok) invalidCount++;
  return { total: arr.length, invalidCount };
});

/* ── 结果分组（与 /search 页分组一致）─────────────────────────────────── */
const GROUP_META: Record<string, { label: string; icon: any; color: string }> = {
  issue:   { label: "需求 Issue",   icon: Tickets,  color: "#409eff" },
  bug:     { label: "缺陷 Bug",     icon: Warning,  color: "#f56c6c" },
  project: { label: "项目",         icon: Folder,   color: "#67c23a" },
  module:  { label: "模块",         icon: Grid,     color: "#e6a23c" },
  page:    { label: "文档 Page",    icon: Document, color: "#909399" },
  rag:     { label: "知识库",       icon: Reading,  color: "#36cfc9" },
  session: { label: "会话",         icon: ChatLineRound, color: "#722ed1" },
  default: { label: "其他",         icon: Guide,    color: "#c0c4cc" },
};

const resultGroups = computed<PaletteItemGroup[]>(() => {
  const items = paletteItems.value;
  const map = new Map<string, PaletteItemGroup>();
  for (const it of items) {
    const t = (it.type || "default") as string;
    const meta = GROUP_META[t] ?? GROUP_META.default;
    if (!map.has(t)) {
      map.set(t, { type: t, label: meta.label, icon: meta.icon, color: meta.color, items: [] });
    }
    map.get(t)!.items.push(it);
  }
  return Array.from(map.values());
});

const totalItems = computed(() => paletteItems.value.length);

/* ── Quick Actions（启动时批量 Gate A 过滤，保证按钮都可达）───────────── */
const quickActions = ref<Array<QuickAction & { _idx: number }>>([]);

const quickActionsFiltered = computed(() => {
  const list: Array<(QuickAction & { _idx: number })> = [];
  let idx = 0;
  for (const a of quickActions.value) {
    // Gate A：用 settings/kanban 等 type 解析一次，不可达直接剔除
    // HelpOS 5 aliases 不经过 Gate A 路由校验（它们不使用 route 字段），直接保留
    const isHelpAlias = a.id.startsWith("help-");
    let ok = isHelpAlias;
    if (!ok) {
      const r = resolveLink({
        type: a.id.startsWith("settings-") ? a.id : (a.id === "ai-chat" ? "ai-chat" : a.id),
        key: "",
        title: a.title
      });
      ok = r.ok;
    }
    if (ok) {
      list.push({ ...a, _idx: idx++ });
    }
  }
  return list;
});

const hasQuickActions = computed(() => quickActionsFiltered.value.length > 0);

/* ── 初始化 Quick Actions 注册表（与 dev 方案对齐）─────────────────────── */
async function buildQuickActions(): Promise<Array<QuickAction & { _idx: number }>> {
  // HelpOS 5 aliases 统一单源；禁止重复硬编码（Dev §2 GC-8 红线）。
  const helpAliases: Array<QuickAction & { _idx: number }> = [];
  try {
    const mod = await import("@/components/HelpCenter/useHelp");
    const HELP_COMMAND_ALIASES = (mod as any).HELP_COMMAND_ALIASES as Record<string, string> | undefined;
    const helpAPI = (mod as any).helpAPI as { open(tab: string, source: string): void };
    const iconMap: Record<string, any> = { shortcuts: MagicStick, faq: QuestionFilled, changelog: CollectionTag, feedback: ChatDotRound, help: Reading };
    const i18nKey: Record<string, string> = { shortcuts: "help.tabs.shortcuts", faq: "help.tabs.faq", changelog: "help.tabs.changelog", feedback: "help.tabs.feedback", help: "help.tabs.page_help" };
    for (const [tab, alias] of Object.entries(HELP_COMMAND_ALIASES || {})) {
      const id = `help-${tab}`;
      helpAliases.push({
        id,
        title: `${t(i18nKey[tab] ?? `help.tabs.${tab}`) ?? tab} (${alias})`,
        shortcut: alias.slice(1).toUpperCase().split("").join(" "),
        route: "",
        icon: iconMap[tab] ?? Reading,
        color: tab === "shortcuts" ? "#722ed1" : tab === "faq" ? "#1890ff" : tab === "changelog" ? "#52c41a" : tab === "feedback" ? "#eb2f96" : "#13c2c2",
        run: () => helpAPI.open(tab as any, "command-palette")
      } as QuickAction & { _idx: number });
    }
  } catch { /* noop —— 开发态缺模块就不注册 */ }

  const base: QuickAction[] = [
    { id: "new-issue",  title: "新建需求 (New Issue)",   shortcut: "N I",    route: "/issue",   icon: Plus as any,    color: "#409eff",
      run: () => { void router.push("/issue"); } },
    { id: "new-project",title: "新建项目 (New Project)", shortcut: "N P",    route: "/project", icon: Folder as any,  color: "#67c23a",
      run: () => { void router.push("/project"); } },
    { id: "kanban",    title: "看板 Kanban Board",       shortcut: "K",      route: "/kanban",  icon: Grid as any,    color: "#e6a23c",
      run: () => { void router.push("/kanban"); } },
    { id: "roadmap",   title: "Roadmap 路线图",          shortcut: "R",      route: "/roadmap", icon: Calendar as any,color: "#9254de",
      run: () => { void router.push("/roadmap"); } },
    { id: "search",    title: "全局搜索 /search",        shortcut: "S",      route: "/search",  icon: Search as any,  color: "#409eff",
      run: () => { void router.push(`/search?q=${encodeURIComponent(query.value || "")}`); } },
    { id: "page",      title: "文档中心 /page",          shortcut: "P",      route: "/page",    icon: Document as any,color: "#909399",
      run: () => { void router.push("/page"); } },
    { id: "rag",       title: "知识库 RAG",              shortcut: "G",      route: "/rag",     icon: Reading as any, color: "#36cfc9",
      run: () => { void router.push("/rag"); } },
    { id: "ai-chat",   title: "AI 对话 AI Chat",         shortcut: "A I",    route: "/ai-chat", icon: ChatLineRound as any, color: "#722ed1",
      run: () => { void router.push("/ai-chat"); } },
    { id: "import",    title: "批量导入 /import",        shortcut: "I M",    route: "/import",  icon: Collection as any, color: "#13c2c2",
      run: () => { void router.push("/import"); } },
    { id: "settings-menuManage",    title: "菜单管理",   shortcut: "S Y S M",route: "/system/menuManage",    icon: Setting as any, color: "#f0a020",
      run: () => { void router.push("/system/menuManage"); } },
    { id: "settings-accountManage", title: "账号管理",   shortcut: "S Y S A",route: "/system/accountManage", icon: Setting as any, color: "#f0a020",
      run: () => { void router.push("/system/accountManage"); } },
  ];
  return [...helpAliases, ...base].map<QuickAction & { _idx: number }>((a, i) => ({ ...a, _idx: i }));
}

/* ── 输入解析：Calculator / AI 内联 snippet ────────────────────────────── */
function updateInlineSnippets(q: string) {
  const trimmed = q.trim();
  // 1) AI ask：`? xxxx` 或 `？ xxxx`
  if (/^[?？]\s*\S/.test(trimmed)) {
    aiAskSnippet.value = { kind: "ai-ask", query: trimmed.slice(1).trim() };
    calculatorSnippet.value = null;
    return;
  }
  aiAskSnippet.value = null;
  // 2) Calculator：含数字 + 运算符 / 单位词（禁 eval/new Function，全部走 AST Shunting-Yard）
  const calc = calculator.tryEvaluateLine(trimmed);
  if (calc) {
    calculatorSnippet.value = { kind: "calculator", expr: calc.expr, value: calc.value, display: calc.display };
  } else {
    calculatorSnippet.value = null;
  }
}

watch(query, updateInlineSnippets, { flush: "post" });

/* ── Hover/聚焦 → Gate B HEAD 预检（异步，不阻塞点击）─────────────────── */
let gateBSeq = 0;
watch([hoveredItem, activeIdx], async () => {
  const arr = paletteItems.value;
  const target = hoveredItem.value ?? (arr[activeIdx.value] || null);
  if (!target) return;
  if (target._gateB !== undefined) return;       // 已测
  if (!target._gateA.ok) return;                  // Gate A 失败的就不白测了
  if (!["issue", "bug", "project", "module", "page"].includes(target.type)) return;

  const mySeq = ++gateBSeq;
  try {
    const ok = await gateBEntityExists(
      { type: target.type, key: target.key, project: target.project, title: target.title },
      { timeoutMs: 1500 }
    );
    if (mySeq === gateBSeq) target._gateB = ok;
  } catch {
    if (mySeq === gateBSeq) target._gateB = true;   // 网络异常：让 Gate C 兜底
  }
});

/* ── 键盘交互 ──────────────────────────────────────────────────────────── */
function getCurrentListLength(): number {
  if (query.value) return paletteItems.value.length;
  return quickActionsFiltered.value.length;
}

function onKeydown(e: KeyboardEvent) {
  const total = getCurrentListLength();

  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIdx.value = (activeIdx.value + 1) % Math.max(total, 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIdx.value = (activeIdx.value - 1 + total) % Math.max(total, 1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    handleEnter();
  } else if (e.key === "Escape") {
    e.preventDefault();
    close();
  } else if (e.key === "Tab") {
    // Tab 切换：Calculator → 把结果复制到剪贴板（若存在）
    if (calculatorSnippet.value) {
      e.preventDefault();
      copyToClipboard(calculatorSnippet.value.display);
    }
  }
}

function handleEnter() {
  // (1) 若存在 calculator snippet：Enter 复制结果并关闭面板
  if (calculatorSnippet.value) {
    copyToClipboard(calculatorSnippet.value.display);
    close();
    return;
  }
  // (2) 若存在 AI snippet：Enter 打开 AI Chat
  if (aiAskSnippet.value) {
    openAiChatForQuery(aiAskSnippet.value.query);
    return;
  }
  // (3) 结果区选择
  if (query.value) {
    const it = paletteItems.value[activeIdx.value];
    if (it) selectItem(it);
    return;
  }
  // (4) Quick Actions
  const act = quickActionsFiltered.value[activeIdx.value];
  if (act) runQuickAction(act);
}

/* ── 三闸门导航：selectItem（最核心的 public action） ──────────────────── */
async function selectItem(item: PaletteItem) {
  // Gate A：任何 reason 都不能点（UI 也是灰的，但以防 DOM 被强制触发）
  if (!item._gateA.ok) {
    try {
      ElNotification({
        title: "无法跳转",
        message: `${item._gateA.message}（${item._gateA.reason}）`,
        type: "warning",
        duration: 3000,
      });
    } catch { /* noop */ }
    // 同步跳 fallback（用户体验：给出一个可落地页，而不是什么都不做）
    router.push(item._gateA.fallback).catch(() => { /* noop */ });
    close();
    return;
  }

  const gateA = item._gateA as LinkResolveOk;
  const link = gateA.link;

  // Gate B：若预检明确为 false（不是 undefined）—— 降级为 goTo 列表页预填搜索词
  //   （网络异常时 B=undefined，放行给 Gate C 兜底）
  if (item._gateB === false) {
    try {
      ElNotification({
        title: "目标资源暂不可用",
        message: `${item.title}（${item.type}: ${item.key}）在后端 HEAD 预检不存在，已为您跳转至列表页搜索。`,
        type: "warning",
        duration: 3000,
      });
    } catch { /* noop */ }
    router.push(`/search?q=${encodeURIComponent(item.title || item.key || "")}`).catch(() => {});
    close();
    return;
  }

  // ── 导航 ───────────────────────────────────────────────────────────────
  close();
  try {
    await router.push(link);
  } catch (err: any) {
    // Vue Router 本身抛错（e.g. NavigationDuplicated）：不算死链，按 pass 处理
    if (err?.name !== "NavigationDuplicated") {
      try {
        ElNotification({
          title: "路由异常",
          message: err?.message || "跳转失败，已跳回搜索页。",
          type: "warning",
          duration: 3000,
        });
      } catch { /* noop */ }
      router.push(`/search?q=${encodeURIComponent(item.title || item.key || "")}`).catch(() => {});
    }
    return;
  }

  // Gate C：2s 内 post-navigate 后验；失败 → 回退到列表页预填
  const cPass = await gateCPostNavigate({
    expectedLink: link,
    expectedParams: gateA.params,
    // title: item.key || undefined,
    timeoutMs: 2000,
  });

  if (cPass) {
    // MRU v2：只有 Gate C pass 才写入（避免把幽灵结果塞到最近使用）
    cpStore.pushMRU({
      id: item.id, type: item.type, key: item.key, title: item.title, project: item.project,
      ts: Date.now(),
    });
  } else {
    try {
      ElNotification({
        title: "未成功到达目标页",
        message: `${item.title} 的详情页渲染未在预期时间内完成，可能已被归档/删除。已跳回列表页搜索。`,
        type: "warning",
        duration: 3000,
      });
    } catch { /* noop */ }
    // 回退：跳到 /search 预填（不依赖 item.listFallback 字段，避免与 v2 contract 耦合）
    router.push(`/search?q=${encodeURIComponent(item.title || item.key || "")}`).catch(() => {});
  }
}

function runQuickAction(action: QuickAction & { _idx: number }) {
  try {
    if (typeof action.run === "function") {
      const ret = action.run();
      if (ret && typeof (ret as any).then === "function") {
        (ret as Promise<any>).catch(() => {});
      }
    } else {
      router.push(action.route).catch(() => {});
    }
  } finally {
    close();
  }
}

/* ── AI Chat helpers ──────────────────────────────────────────────────── */
function openAiChatForQuery(q: string) {
  close();
  router.push({ path: "/ai-chat", query: { q: encodeURIComponent(q) } }).catch(() => {});
}

/* ── 打开/关闭 & 快捷键绑定 ───────────────────────────────────────────── */
const CMD_KEYDOWN_CAPTURE = "cmd-palette:capture-keydown";

function open(initialQuery = "") {
  visible.value = true;
  query.value = initialQuery;
  activeIdx.value = 0;
  calculatorSnippet.value = null;
  aiAskSnippet.value = null;
  if (initialQuery) updateInlineSnippets(initialQuery);
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function close() {
  if (!visible.value) return;
  visible.value = false;
  // 清理 AbortController（所有在途请求）：用 reset 保留容器复用
  disposer.reset();
}

function resetInlineSnippet() {
  calculatorSnippet.value = null;
  aiAskSnippet.value = null;
  if (aiAskSnippet.value || calculatorSnippet.value) {
    // 已清零，无 else
  }
  nextTick(() => inputRef.value?.focus());
}

/* ⌘K / Ctrl+K：
 *   - mittBus 事件总线通道（layouts/settings 等其它组件也会触发）
 *   - document 级 capture:true keydown：应对 Chrome 抢占 ⌘K 地址栏
 */
function onMittOpen(payload?: any) {
  if (typeof payload === "string") open(payload);
  else if (payload && typeof payload === "object" && typeof (payload as any).query === "string") open((payload as any).query);
  else open();
}

function globalKeydown(e: KeyboardEvent) {
  const isCmdK = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
  if (isCmdK) {
    e.preventDefault();
    e.stopImmediatePropagation?.();
    if (visible.value) close();
    else open();
    return;
  }
  // Escape 全文档级兜底
  if (e.key === "Escape" && visible.value) {
    e.preventDefault();
    close();
  }
}

onMounted(async () => {
  try { quickActions.value = await buildQuickActions(); } catch { /* noop */ }
  mittBus.on("cmd-palette:open", onMittOpen);
  document.addEventListener("keydown", globalKeydown, { capture: true });
});

onBeforeUnmount(() => {
  mittBus.off("cmd-palette:open", onMittOpen);
  document.removeEventListener("keydown", globalKeydown, true as any);
  disposer.dispose();
  try { (_usDispose as any)?.dispose?.(); } catch { /* noop */ }
});

/* ── 小工具 ────────────────────────────────────────────────────────────── */
function highlight(text: string): string {
  const q = (query.value || "").trim();
  const escaped = String(text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (!q) return escaped;
  const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(new RegExp(`(${safeQ})`, "gi"), "<mark>$1</mark>");
}

function formatDate(d: string): string {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function copyToClipboard(text: string) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    ElNotification({ title: "已复制", message: text, type: "success", duration: 1500 });
  } catch {
    ElNotification({ title: "复制失败", message: "请手动复制：" + text, type: "warning", duration: 2000 });
  }
}

const placeholder = computed(() => {
  if (calculatorSnippet.value) return "继续输入表达式（例：100 km to mi），Enter = 复制结果";
  if (aiAskSnippet.value) return "继续输入，Enter = 在 AI Chat 中打开";
  return "搜索需求/缺陷/项目/模块/文档；输入 ? 问 AI，输入算式直接算。（⌘K / Ctrl+K）";
});

defineExpose({ open, close, refresh, visible });
</script>

<style scoped>
.cmd-palette-fade-enter-active,
.cmd-palette-fade-leave-active { transition: opacity 0.12s ease; }
.cmd-palette-fade-enter-from,
.cmd-palette-fade-leave-to { opacity: 0; }

.cmd-palette-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  padding-top: 12vh;
  background: rgb(0 0 0 / 35%);
  backdrop-filter: blur(2px);
}

.cmd-palette {
  display: flex;
  flex-direction: column;
  width: min(680px, 92vw);
  max-height: 62vh;
  min-height: 220px;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 14px;
  box-shadow: 0 12px 48px rgb(0 0 0 / 26%);
}

.cmd-palette__input-wrap {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.cmd-palette__search-icon {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
}
.cmd-palette__spinner { animation: cmd-spin 0.9s linear infinite; color: var(--el-color-primary); }
@keyframes cmd-spin { to { transform: rotate(360deg); } }

.cmd-palette__input {
  flex: 1;
  font-size: 15px;
  color: var(--el-text-color-primary);
  outline: none;
  background: transparent;
  border: none;
  min-width: 0;
}
.cmd-palette__input::placeholder { color: var(--el-text-color-placeholder); }

.cmd-palette__kbd {
  padding: 2px 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  user-select: none;
}
.cmd-palette__kbd--close { cursor: pointer; }
.cmd-palette__kbd--close:hover { color: var(--el-text-color-primary); background: var(--el-fill-color-light); }

.cmd-palette__ghost-count {
  font-size: 11px;
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-7);
  padding: 2px 8px;
  border-radius: 10px;
}

.cmd-palette__snippet {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
}
.cmd-palette__snippet--calc { background: var(--el-color-success-light-9); color: var(--el-text-color-primary); }
.cmd-palette__snippet--ai   { background: var(--el-color-primary-light-9); color: var(--el-text-color-primary); }
.cmd-palette__snippet-label { font-weight: 600; font-size: 11px; letter-spacing: .5px; opacity: .7; }
.cmd-palette__snippet-expr  { color: var(--el-text-color-regular); }
.cmd-palette__snippet-value { margin-left: auto; font-family: ui-monospace, Menlo, monospace; font-weight: 600; }

.cmd-palette__error {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 20px;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
}

.cmd-palette__results {
  flex: 1;
  padding: 8px 4px 10px;
  overflow-y: auto;
}
.cmd-palette__group-label {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 12px 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.cmd-palette__group-count {
  background: var(--el-fill-color);
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
}

.cmd-palette__item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 12px;
  margin: 2px 4px;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.08s ease, opacity 0.08s ease;
}
.cmd-palette__item:hover,
.cmd-palette__item--active { background: var(--el-color-primary-light-9); }

.cmd-palette__item--disabled { cursor: not-allowed; }
.cmd-palette__item--ghost {
  opacity: 0.55;
  background: repeating-linear-gradient(
    135deg,
    transparent 0 8px,
    rgba(150,150,150,0.04) 8px 16px
  );
}
.cmd-palette__item--ghost .cmd-palette__item-title {
  text-decoration: line-through;
  text-decoration-color: var(--el-text-color-placeholder);
}

.cmd-palette__item-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: #ffffff;
  border-radius: 8px;
}

.cmd-palette__item-content { flex: 1; min-width: 0; }
.cmd-palette__item-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cmd-palette__item-title :deep(mark) {
  padding: 0 2px;
  color: inherit;
  background: var(--el-color-warning-light-5);
  border-radius: 2px;
}
.cmd-palette__item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-top: 2px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.cmd-palette__item-tag { max-width: 160px; }
.cmd-palette__item-sub, .cmd-palette__item-project, .cmd-palette__item-date { white-space: nowrap; }

.cmd-palette__item-kbd {
  flex-shrink: 0;
  padding: 1px 6px;
  font-family: ui-monospace, Menlo, monospace;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}
.cmd-palette__item-badge { flex-shrink: 0; }

.cmd-palette__empty {
  padding: 28px 12px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  line-height: 1.6;
}

.cmd-palette__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.cmd-palette__footer-chip {
  padding: 2px 8px;
  background: var(--el-bg-color-overlay);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
}
.cmd-palette__footer-chip--warn { color: var(--el-color-warning); }
</style>
