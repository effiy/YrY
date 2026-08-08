<script setup lang="ts" name="aiChatToolbar">
import { inject, ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import {
  ChatLineSquare, Picture, PriceTag, ChatDotRound, Search, Loading,
  ArrowLeft, ArrowRight, CollectionTag, Delete, Tools, Check, Close, FolderChecked, DocumentCopy, Clock, Cpu, Edit, Refresh, Download
} from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { usePromptHistory, clearPromptHistory, removePromptHistoryAt } from "@/hooks/usePromptHistory";
import { useSlowThreshold } from "@/hooks/useSlowThreshold";
import { useSparkLegendToggle } from "@/hooks/useSparkLegendToggle";
import { ragCategories } from "@/api/modules/ragService";
import RequestStatusButton from "./RequestStatusButton.vue";
import FaqPopover from "./FaqPopover.vue";
import { MCP_SERVERS, type McpServerConfig } from "../mcpServers";
import { listMcpTools, callMcpTool, type McpTool } from "@/api/modules/mcpService";

const props = withDefaults(
  defineProps<{
    faqActive?: boolean;
    sending?: boolean;
    streamingType?: "" | "send" | "regenerate" | "resend";
    ragToggle?: boolean;
    ragAvailable?: boolean;
    webSearchToggle?: boolean;
    ragHybrid?: boolean;
    ragRerank?: boolean;
    ragCitations?: boolean;
    ragNumQueries?: number;
    ragChatMode?: "condense_plus_context" | "condense_question" | "context" | "simple";
    ragCategory?: string;
    ragTags?: string[];
    /** List of ctx:-tagged file paths (without the ctx: prefix) */
    contextFiles?: string[];
    agentMode?: boolean;
    agentMaxTurns?: number;
    agentSystemPrompt?: string;
    agentModelRotation?: string[];
    selectedModel?: string;
    availableModels?: string[];
  }>(),
  { faqActive: false, sending: false, streamingType: "", ragToggle: false, ragAvailable: false, webSearchToggle: false, ragHybrid: true, ragRerank: false, ragCitations: true, ragNumQueries: 1, ragChatMode: "condense_plus_context", ragCategory: "", ragTags: () => [], contextFiles: () => [], agentMode: false, agentMaxTurns: 10, agentSystemPrompt: "", agentModelRotation: () => [], selectedModel: "", availableModels: () => [] }
);

const emit = defineEmits<{
  (e: "toggle-faq"): void;
  (e: "pick-image"): void;
  (e: "manage-tags"): void;
  (e: "open-wechat"): void;
  (e: "toggle-rag"): void;
  (e: "toggle-web-search"): void;
  (e: "toggle-rag-hybrid"): void;
  (e: "toggle-rag-rerank"): void;
  (e: "toggle-rag-citations"): void;
  (e: "cycle-rag-num-queries"): void;
  (e: "select-rag-chat-mode", mode: "condense_plus_context" | "condense_question" | "context" | "simple"): void;
  (e: "update-rag-category", category: string): void;
  (e: "update-rag-tags", tags: string[]): void;
  (e: "stop"): void;
  (e: "remove-context-file", path: string): void;
  (e: "toggle-agent"): void;
  (e: "update-agent-max-turns", turns: number): void;
  (e: "update-agent-system-prompt", prompt: string): void;
  (e: "update-agent-model-rotation", models: string[]): void;
  (e: "update-selected-model", model: string): void;
}>();

// ── KB metadata filters (llama_index MetadataFilters on frontmatter) ──
// Loaded lazily on first popover open — surfaces the categories + tag counts
// from the YiKnowledge index so the user can narrow RAG retrieval by
// frontmatter without typing paths. Like scope, metadata filters disable
// hybrid (BM25Retriever doesn't support them).
const filtersPopoverVisible = ref(false);
const kbCategories = ref<Array<{ name: string; file_count: number }>>([]);
const kbTags = ref<Record<string, number>>({});
const filtersLoading = ref(false);
let filtersLoaded = false;
async function loadKbFilters(): Promise<void> {
  if (filtersLoaded || filtersLoading.value) return;
  filtersLoading.value = true;
  try {
    const res = await ragCategories();
    kbCategories.value = res.categories ?? [];
    kbTags.value = res.tags ?? {};
    filtersLoaded = true;
  } catch { /* best-effort — chip just won't populate */ }
  finally { filtersLoading.value = false; }
}
function onFiltersPopoverOpen(): void {
  if (!filtersLoaded && !filtersLoading.value) void loadKbFilters();
}
const tagOptions = computed(() => {
  const entries = Object.entries(kbTags.value);
  return entries
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
});
const hasMetaFilter = computed(() => !!(props.ragCategory || (props.ragTags ?? []).length));
const filterActiveCount = computed(() => (props.ragCategory ? 1 : 0) + ((props.ragTags ?? []).length || 0));
function clearFilters(): void {
  emit("update-rag-category", "");
  emit("update-rag-tags", []);
}
const collapseCtx = inject<{ collapsible: boolean; side: "fill" | "right" | "left"; toggle: () => void } | null>(
  "aiChatBoxCollapse", null
);

const openKnowledgePreview = inject<(path: string) => void>("openKnowledgePreview", () => {});

const contextPopoverVisible = ref(false);
const contextFileCount = computed(() => (props.contextFiles ?? []).length);

function handleFileClick(path: string) {
  openKnowledgePreview(path);
  contextPopoverVisible.value = false;
}

// ── Tool execution status (Pi-inspired: tool_execution_start/end events) ──
const store = useAiChatStore();
const { slowThresholdMs } = useSlowThreshold();

// ── RAG options collapse (cleans up the toolbar when RAG overrides are visible) ──
const ragOptionsExpanded = ref(false);

// ── Agent system prompt editor ──
const showSysPromptEditor = ref(false);
const sysPromptDraft = ref("");

function saveSysPrompt() {
  emit("update-agent-system-prompt", sysPromptDraft.value.trim());
  showSysPromptEditor.value = false;
}

// Watch for prop changes to initialize draft
watch(() => props.agentSystemPrompt, (v) => {
  if (!showSysPromptEditor.value) sysPromptDraft.value = v ?? "";
}, { immediate: true });

// ── Agent model rotation editor (Pi: prepareNextTurn model switching) ──
const showModelRotationEditor = ref(false);
const modelRotationDraft = ref("");

function openModelRotationEditor() {
  modelRotationDraft.value = (props.agentModelRotation ?? []).join(", ");
  showModelRotationEditor.value = true;
}

function saveModelRotation() {
  const models = modelRotationDraft.value
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  emit("update-agent-model-rotation", models);
  showModelRotationEditor.value = false;
}

// ── Prompt history sub-panel (Pi-inspired: recent prompts browser) ──
// Singleton shared with ChatInput's ArrowUp/ArrowDown recall — pushes there
// surface here live. List is shown most-recent-last; panel displays reversed
// so newest is at the top (matches shell `history` reading order).
const { promptHistory } = usePromptHistory();
const historyPopoverVisible = ref(false);
const historyQuery = ref("");
// Pi-inspired: search box at top of prompt library. Filters by substring
// (case-insensitive) on the raw prompt text. Empty query = full list.
// Each row carries `realIdx` (index into the underlying history array) so
// remove works even when the list is filtered.
const historyList = computed<{ text: string; realIdx: number }[]>(() => {
  const q = historyQuery.value.trim().toLowerCase();
  const all = promptHistory.value;
  const indexed = all.map((text, realIdx) => ({ text, realIdx }));
  const filtered = q ? indexed.filter(x => x.text.toLowerCase().includes(q)) : indexed;
  return filtered.reverse();
});
// Pi-inspired: when substring filter returns 0, surface fuzzy "did you mean"
// suggestions via trigram Jaccard. Mirrors the similarTools pattern in the
// skills global search — dead-ends become hints.
const similarPrompts = computed<{ text: string; score: number }[]>(() => {
  const q = historyQuery.value.trim();
  if (!q) return [];
  if (historyList.value.length > 0) return [];
  const qt = trigrams(q);
  if (!qt.size) return [];
  return promptHistory.value
    .map(text => ({ text, score: jaccard(qt, trigrams(text)) }))
    .filter(x => x.score >= 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
});
// Pi-inspired: top-3 most-recent chips above the list for one-click re-invoke.
// Hidden when searching (would duplicate the filtered list) or empty.
const recentPromptChips = computed<string[]>(() => {
  if (historyQuery.value.trim()) return [];
  return promptHistory.value.slice(-3).reverse();
});
function truncatePrompt(s: string, max = 40): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}
function useHistoryPrompt(s: string) {
  store.input = s;
  historyPopoverVisible.value = false;
}
function copyHistoryPrompt(s: string) {
  navigator.clipboard?.writeText(s).then(
    () => ElMessage.success("Prompt copied"),
    () => ElMessage.error("Copy failed")
  );
}
function removeHistoryPrompt(realIdx: number) {
  removePromptHistoryAt(realIdx);
}
async function confirmClearHistory() {
  if (!promptHistory.value.length) return;
  try {
    await ElMessageBox.confirm(
      `Clear all ${promptHistory.value.length} prompt(s)? This cannot be undone.`,
      "Clear prompt history",
      { type: "warning", confirmButtonText: "Clear", cancelButtonText: "Cancel" }
    );
  } catch {
    return;
  }
  clearPromptHistory();
  ElMessage.success("Prompt history cleared");
}

const runningTools = computed(() => {
  const events = store.toolEvents ?? [];
  const started = new Set<string>();
  const ended = new Set<string>();
  for (const e of events) {
    if (e.phase === "start") started.add(e.name);
    if (e.phase === "end") ended.add(e.name);
  }
  return [...started].filter(n => !ended.has(n))
    .map(n => events.find(e => e.name === n && e.phase === "start"))
    .filter(Boolean) as Array<{ name: string; label: string }>;
});

// ── Skills panel (Pi-inspired: pluggable tool registry visualization) ──
const skillsPopoverVisible = ref(false);
// Compact mode — hide descriptions + lastcall rows so the list collapses
// to one line per tool (Pi's dense palette view). Persisted to localStorage
// so the preference survives across sessions.
const SKILLS_PREF_LS_KEY = "yivad.aichat.skillsPrefs";
type SkillSortMode = "registry" | "calls" | "recent";
function loadSkillSortMode(): SkillSortMode {
  try {
    const raw = localStorage.getItem(SKILLS_PREF_LS_KEY);
    if (!raw) return "registry";
    const v = JSON.parse(raw);
    return v?.sortMode === "calls" || v?.sortMode === "recent" ? v.sortMode : "registry";
  } catch { return "registry"; }
}
function loadCompactMode(): boolean {
  try {
    const raw = localStorage.getItem(SKILLS_PREF_LS_KEY);
    if (!raw) return false;
    const v = JSON.parse(raw);
    return v?.compact === true;
  } catch { return false; }
}
function persistSkillPrefs(): void {
  try {
    localStorage.setItem(SKILLS_PREF_LS_KEY, JSON.stringify({
      sortMode: skillSortMode.value,
      compact: compactMode.value,
    }));
  } catch { /* ignore */ }
}
const compactMode = ref(loadCompactMode());
const allSkills = computed(() => store.allTools ?? []);
const activeSkillCount = computed(() => (store.activeTools ?? []).length);

// Sort mode for the built-in tool list. "registry" preserves the store order;
// "calls" sorts by invocation count desc; "recent" sorts by last-invoked ts desc
// (Pi surfaces hot + recently-used tools at top).
const skillSortMode = ref<SkillSortMode>(loadSkillSortMode());
const sortedSkills = computed(() => {
  if (skillSortMode.value === "registry") {
    return pinnedFirst(allSkills.value);
  }
  const counts = toolLastCalls.value;
  const sorted = [...allSkills.value].sort((a, b) => {
    const ca = counts[a.name]?.count ?? 0;
    const cb = counts[b.name]?.count ?? 0;
    if (skillSortMode.value === "calls") {
      if (ca !== cb) return cb - ca;
      return 0;
    }
    // recent: by last-invoked ts desc; never-invoked tools sink to bottom.
    const ta = counts[a.name]?.ts ?? 0;
    const tb = counts[b.name]?.ts ?? 0;
    return tb - ta;
  });
  return pinnedFirst(sorted);
});

// Reorder so pinned tools come first; preserve relative order within each group.
function pinnedFirst<T extends { name: string }>(arr: T[]): T[] {
  if (!pinnedTools.value.size) return arr;
  const pinned: T[] = [];
  const rest: T[] = [];
  for (const t of arr) {
    if (pinnedTools.value.has(t.name)) pinned.push(t);
    else rest.push(t);
  }
  return [...pinned, ...rest];
}

// Pinned counts per section — for header badges.
const pinnedBuiltinCount = computed(() => {
  const names = new Set((store.allTools ?? []).map(t => t.name));
  let n = 0;
  for (const p of pinnedTools.value) if (names.has(p)) n++;
  return n;
});
const pinnedMcpCount = computed(() => {
  const names = new Set(mcpTools.value.map(t => t.name));
  let n = 0;
  for (const p of pinnedTools.value) if (names.has(p)) n++;
  return n;
});

// Pinned-tool list per section — for the count popover. Pi surfaces pinned
// items as a clickable list with batch unpin. pinSortMode cycles through:
// - "default": stale pins sink, otherwise insertion order
// - "calls":    most-called first (stale still sink)
// - "recent":   most-recently-invoked first (stale still sink)
type PinSortMode = "default" | "calls" | "recent";
const PIN_SORT_MODE_LS_KEY = "yivad.aichat.pinSortMode";
const PIN_SORT_MODE_LABEL: Record<PinSortMode, string> = {
  default: "Default",
  calls: "By calls",
  recent: "By recent"
};
function loadPinSortMode(): PinSortMode {
  try {
    const raw = localStorage.getItem(PIN_SORT_MODE_LS_KEY);
    if (raw === "calls" || raw === "recent") return raw;
    // Migrate legacy "yivad.aichat.pinSortByCount" = "1" → "calls".
    if (localStorage.getItem("yivad.aichat.pinSortByCount") === "1") {
      localStorage.setItem(PIN_SORT_MODE_LS_KEY, "calls");
      localStorage.removeItem("yivad.aichat.pinSortByCount");
      return "calls";
    }
  } catch { /* ignore */ }
  return "default";
}
const pinSortMode = ref<PinSortMode>(loadPinSortMode());
function persistPinSortMode(): void {
  try { localStorage.setItem(PIN_SORT_MODE_LS_KEY, pinSortMode.value); } catch { /* ignore */ }
}
function cyclePinSort(): void {
  const order: PinSortMode[] = ["default", "calls", "recent"];
  const i = order.indexOf(pinSortMode.value);
  pinSortMode.value = order[(i + 1) % order.length];
  persistPinSortMode();
}
const pinnedBuiltinNames = computed<string[]>(() => {
  const names = new Set((store.allTools ?? []).map(t => t.name));
  const list = [...pinnedTools.value].filter(n => names.has(n));
  return list.sort((a, b) => {
    const sa = isBuiltinPinStale(a) ? 1 : 0;
    const sb = isBuiltinPinStale(b) ? 1 : 0;
    if (pinSortMode.value === "calls") {
      const ca = toolLastCalls.value[a]?.count ?? 0;
      const cb = toolLastCalls.value[b]?.count ?? 0;
      if (ca !== cb) return cb - ca;
    } else if (pinSortMode.value === "recent") {
      const ta = toolLastCalls.value[a]?.ts ?? 0;
      const tb = toolLastCalls.value[b]?.ts ?? 0;
      if (ta !== tb) return tb - ta;
    }
    return sa - sb;
  });
});
const pinnedMcpNames = computed<string[]>(() => {
  const names = new Set(mcpTools.value.map(t => t.name));
  const list = [...pinnedTools.value].filter(n => names.has(n));
  return list.sort((a, b) => {
    const sa = isMcpPinStale(a) ? 1 : 0;
    const sb = isMcpPinStale(b) ? 1 : 0;
    if (pinSortMode.value === "calls") {
      const ca = mcpToolResults.value[a]?.count ?? 0;
      const cb = mcpToolResults.value[b]?.count ?? 0;
      if (ca !== cb) return cb - ca;
    } else if (pinSortMode.value === "recent") {
      const ta = mcpToolResults.value[a]?.at ?? 0;
      const tb = mcpToolResults.value[b]?.at ?? 0;
      if (ta !== tb) return tb - ta;
    }
    return sa - sb;
  });
});

// Per-pinned-tool call count — for the popover rows. Built-in reads from
// toolLastCalls (already tracked); MCP reads from mcpToolResults.
const PIN_NO_CALLS = "—";
const PIN_SPARK_W = 40, PIN_SPARK_H = 8, PIN_SPARK_PAD = 1;
// Pi-inspired: per-pin hover crosshair state. Single shared ref — mouse
// can only be on one sparkline at a time, so we track which row+idx is
// hovered. Symmetric to session sparkline crosshair (iter 121/122).
const pinHoverKey = ref<string | null>(null);
const pinHoverIdx = ref<number | null>(null);
// Pi-inspired: collapse pin legend to free vertical space once user
// has learned the colors. Refactored to useSparkLegendToggle composable
// (iter 205) — shared with session legend, same persist behavior.
const { collapsed: pinLegendCollapsed, toggle: togglePinLegend } = useSparkLegendToggle("yivad.pinLegendCollapsed");
function setPinHover(key: string | null, idx: number | null): void {
  pinHoverKey.value = key;
  pinHoverIdx.value = idx;
}
function sparkPathFromDurations(durations: number[]): string {
  if (durations.length < 2) return "";
  const max = Math.max(...durations, 1);
  const min = Math.min(...durations, 0);
  const range = max - min || 1;
  const n = durations.length;
  const points = durations.map((v, i) => {
    const x = PIN_SPARK_PAD + (i / (n - 1)) * (PIN_SPARK_W - 2 * PIN_SPARK_PAD);
    const y = PIN_SPARK_H - PIN_SPARK_PAD - ((v - min) / range) * (PIN_SPARK_H - 2 * PIN_SPARK_PAD);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M ${points.join(" L ")}`;
}
function sparkPointsFromDurations(durations: number[]): { cx: number; cy: number; ms: number; idx: number }[] {
  if (durations.length < 2) return [];
  const max = Math.max(...durations, 1);
  const min = Math.min(...durations, 0);
  const range = max - min || 1;
  const n = durations.length;
  return durations.map((v, i) => ({
    cx: PIN_SPARK_PAD + (i / (n - 1)) * (PIN_SPARK_W - 2 * PIN_SPARK_PAD),
    cy: PIN_SPARK_H - PIN_SPARK_PAD - ((v - min) / range) * (PIN_SPARK_H - 2 * PIN_SPARK_PAD),
    ms: v,
    idx: i + 1,
  }));
}
function mcpPinSparkPoints(name: string): { cx: number; cy: number; ms: number; idx: number }[] {
  return sparkPointsFromDurations(mcpToolResults.value[name]?.durations ?? []);
}
function builtinPinSparkPoints(name: string): { cx: number; cy: number; ms: number; idx: number }[] {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  return sparkPointsFromDurations(ds.slice(-MCP_DURATION_HISTORY));
}
// Pi-inspired: adaptive hit-strip width for pin sparkline. Symmetric to
// SessionStatusBar's costStripW/latencyStripW (iter 183). PIN_SPARK_W=40
// is tighter so cap at 5px max (vs 6 on session). Clamp [2, 5].
function mcpPinHitW(name: string): number {
  const n = mcpPinSparkPoints(name).length;
  if (n < 2) return 5;
  return Math.max(2, Math.min(5, PIN_SPARK_W / n - 1));
}
function builtinPinHitW(name: string): number {
  const n = builtinPinSparkPoints(name).length;
  if (n < 2) return 5;
  return Math.max(2, Math.min(5, PIN_SPARK_W / n - 1));
}
// Pi-inspired: per-point strip widths based on min distance to immediate
// neighbors. Symmetric to SessionStatusBar's costStripWidths (iter 190).
// Returns width array aligned with mcpPinSparkPoints(n). Cap [2, 5].
function mcpPinHitWidths(name: string): number[] {
  const pts = mcpPinSparkPoints(name);
  if (pts.length < 2) return [];
  return pts.map((p, i) => {
    const left = i > 0 ? p.cx - pts[i - 1].cx : PIN_SPARK_W;
    const right = i < pts.length - 1 ? pts[i + 1].cx - p.cx : PIN_SPARK_W;
    const gap = Math.min(left, right);
    return Math.max(2, Math.min(5, gap / 2 - 0.5));
  });
}
function builtinPinHitWidths(name: string): number[] {
  const pts = builtinPinSparkPoints(name);
  if (pts.length < 2) return [];
  return pts.map((p, i) => {
    const left = i > 0 ? p.cx - pts[i - 1].cx : PIN_SPARK_W;
    const right = i < pts.length - 1 ? pts[i + 1].cx - p.cx : PIN_SPARK_W;
    const gap = Math.min(left, right);
    return Math.max(2, Math.min(5, gap / 2 - 0.5));
  });
}
// Pi-inspired: highlight the peak call in danger color so users can spot the
// worst-case data point at a glance — mirrors SessionStatusBar's latency
// sparkline which paints slow dots red.
function mcpPinSparkMaxIdx(name: string): number {
  const ds = mcpToolResults.value[name]?.durations ?? [];
  if (ds.length < 2) return -1;
  let mi = 0;
  for (let i = 1; i < ds.length; i++) if (ds[i] > ds[mi]) mi = i;
  return mi + 1;
}
function builtinPinSparkMaxIdx(name: string): number {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  const sliced = ds.slice(-MCP_DURATION_HISTORY);
  if (sliced.length < 2) return -1;
  let mi = 0;
  for (let i = 1; i < sliced.length; i++) if (sliced[i] > sliced[mi]) mi = i;
  return mi + 1;
}
// Pi-inspired: mark the fastest call too — paired with the peak (slowest),
// the min/peak pair tells users the dynamic range of this tool's latency.
function mcpPinSparkMinIdx(name: string): number {
  const ds = mcpToolResults.value[name]?.durations ?? [];
  if (ds.length < 2) return -1;
  let mi = 0;
  for (let i = 1; i < ds.length; i++) if (ds[i] < ds[mi]) mi = i;
  return mi + 1;
}
function builtinPinSparkMinIdx(name: string): number {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  const sliced = ds.slice(-MCP_DURATION_HISTORY);
  if (sliced.length < 2) return -1;
  let mi = 0;
  for (let i = 1; i < sliced.length; i++) if (sliced[i] < sliced[mi]) mi = i;
  return mi + 1;
}
// Pi-inspired: stuck-call detection — a call is "stuck" when its latency
// exceeds 2× median (requires n ≥ 3 so median is meaningful). Stuck is a
// stronger signal than slow (≥ slowThreshold): slow means above threshold,
// stuck means statistically anomalous relative to this tool's typical
// behavior. Returns 1-based indices matching p.idx for v-for lookup.
// Symmetric to session latency's stuck-detection pattern.
function mcpPinStuckIndices(name: string): number[] {
  const ds = mcpToolResults.value[name]?.durations ?? [];
  const m = medianDuration(ds);
  if (m == null) return [];
  const cutoff = 2 * m;
  const out: number[] = [];
  ds.forEach((v, i) => { if (v >= cutoff) out.push(i + 1); });
  return out;
}
function builtinPinStuckIndices(name: string): number[] {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  const sliced = ds.slice(-MCP_DURATION_HISTORY);
  const m = medianDuration(sliced);
  if (m == null) return [];
  const cutoff = 2 * m;
  const out: number[] = [];
  sliced.forEach((v, i) => { if (v >= cutoff) out.push(i + 1); });
  return out;
}
// Pi-inspired: formatted stuck-call summary for pin tooltip — "call N (Xms)"
// per stuck call, capped at 3 + "+K more" tail. Symmetric to SessionStatusBar's
// latencyStuckSummary (iter 230). Lets users read which calls were stuck and
// their latency without hovering each ring. (iter 231)
function formatStuckSummary(indices: number[], ds: number[]): string {
  if (!indices.length) return "";
  const parts = indices.slice(0, 3).map(idx => `call ${idx} (${ds[idx - 1]}ms)`);
  if (indices.length > 3) parts.push(`+${indices.length - 3} more`);
  return parts.join(", ");
}
function mcpPinStuckSummary(name: string): string {
  return formatStuckSummary(mcpPinStuckIndices(name), mcpToolResults.value[name]?.durations ?? []);
}
function builtinPinStuckSummary(name: string): string {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  return formatStuckSummary(builtinPinStuckIndices(name), ds.slice(-MCP_DURATION_HISTORY));
}
// Pi-inspired: crosshair color reflects hovered point's state — slow=red,
// fastest=green, latest=primary, default=info. Symmetric to visible
// circle fill logic (iter 147/145/143). Returns CSS var string.
function mcpPinCrosshairColor(name: string): string {
  const idx = pinHoverIdx.value;
  if (idx == null || pinHoverKey.value !== name) return "var(--el-text-color-secondary)";
  const pts = mcpPinSparkPoints(name);
  const p = pts[idx];
  if (!p) return "var(--el-text-color-secondary)";
  if (p.ms >= slowThresholdMs.value) return "var(--el-color-danger)";
  if (p.idx === mcpPinSparkMinIdx(name)) return "var(--el-color-success)";
  if (p.idx === mcpPinSparkLatestIdx(name)) return "var(--el-color-primary)";
  return "var(--el-color-info)";
}
function builtinPinCrosshairColor(name: string): string {
  const idx = pinHoverIdx.value;
  if (idx == null || pinHoverKey.value !== name) return "var(--el-text-color-secondary)";
  const pts = builtinPinSparkPoints(name);
  const p = pts[idx];
  if (!p) return "var(--el-text-color-secondary)";
  if (p.ms >= slowThresholdMs.value) return "var(--el-color-danger)";
  if (p.idx === builtinPinSparkMinIdx(name)) return "var(--el-color-success)";
  if (p.idx === builtinPinSparkLatestIdx(name)) return "var(--el-color-primary)";
  return "var(--el-color-info)";
}
// Pi-inspired: mark the most recent call — answers "is this tool trending
// slower right now?" Last point in the trajectory = current behavior.
function mcpPinSparkLatestIdx(name: string): number {
  const ds = mcpToolResults.value[name]?.durations ?? [];
  return ds.length >= 2 ? ds.length : -1;
}
function builtinPinSparkLatestIdx(name: string): number {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  const sliced = ds.slice(-MCP_DURATION_HISTORY);
  return sliced.length >= 2 ? sliced.length : -1;
}
// Slow-threshold reference Y coord — same logic as SessionStatusBar's
// latencyThresholdY, scaled to the pinned-list mini sparkline geometry.
// Returns -10 (off-chart) when threshold exceeds the data's max.
function mcpPinSparkThresholdY(name: string): number {
  const ds = mcpToolResults.value[name]?.durations ?? [];
  if (ds.length < 2) return -10;
  const max = Math.max(...ds, 1);
  if (slowThresholdMs.value > max) return -10;
  const min = Math.min(...ds, 0);
  const range = max - min || 1;
  return PIN_SPARK_H - PIN_SPARK_PAD - ((slowThresholdMs.value - min) / range) * (PIN_SPARK_H - 2 * PIN_SPARK_PAD);
}
function builtinPinSparkThresholdY(name: string): number {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  const sliced = ds.slice(-MCP_DURATION_HISTORY);
  if (sliced.length < 2) return -10;
  const max = Math.max(...sliced, 1);
  if (slowThresholdMs.value > max) return -10;
  const min = Math.min(...sliced, 0);
  const range = max - min || 1;
  return PIN_SPARK_H - PIN_SPARK_PAD - ((slowThresholdMs.value - min) / range) * (PIN_SPARK_H - 2 * PIN_SPARK_PAD);
}
// Pi-inspired: average horizontal reference line — lets users see which
// calls ran above/below the tool's typical duration. Returns -10 (off-chart)
// when avg is undefined or outside the data range.
function mcpPinSparkAvgY(name: string): number {
  const ds = mcpToolResults.value[name]?.durations ?? [];
  if (ds.length < 2) return -10;
  const max = Math.max(...ds, 1);
  const min = Math.min(...ds, 0);
  const range = max - min || 1;
  const avg = ds.reduce((s, x) => s + x, 0) / ds.length;
  if (avg > max) return -10;
  return PIN_SPARK_H - PIN_SPARK_PAD - ((avg - min) / range) * (PIN_SPARK_H - 2 * PIN_SPARK_PAD);
}
function builtinPinSparkAvgY(name: string): number {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  const sliced = ds.slice(-MCP_DURATION_HISTORY);
  if (sliced.length < 2) return -10;
  const max = Math.max(...sliced, 1);
  const min = Math.min(...sliced, 0);
  const range = max - min || 1;
  const avg = sliced.reduce((s, x) => s + x, 0) / sliced.length;
  if (avg > max) return -10;
  return PIN_SPARK_H - PIN_SPARK_PAD - ((avg - min) / range) * (PIN_SPARK_H - 2 * PIN_SPARK_PAD);
}
// Pi-inspired: median reference line — paired with avg, the gap between the
// two reveals distribution skew. Median > avg = right-skew (slow tail);
// median < avg = left-skew (rare fast calls); overlapping = symmetric.
function mcpPinSparkMedianY(name: string): number {
  const ds = mcpToolResults.value[name]?.durations ?? [];
  const m = medianDuration(ds);
  if (m == null) return -10;
  const max = Math.max(...ds, 1);
  const min = Math.min(...ds, 0);
  const range = max - min || 1;
  if (m > max) return -10;
  return PIN_SPARK_H - PIN_SPARK_PAD - ((m - min) / range) * (PIN_SPARK_H - 2 * PIN_SPARK_PAD);
}
function builtinPinSparkMedianY(name: string): number {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  const sliced = ds.slice(-MCP_DURATION_HISTORY);
  const m = medianDuration(sliced);
  if (m == null) return -10;
  const max = Math.max(...sliced, 1);
  const min = Math.min(...sliced, 0);
  const range = max - min || 1;
  if (m > max) return -10;
  return PIN_SPARK_H - PIN_SPARK_PAD - ((m - min) / range) * (PIN_SPARK_H - 2 * PIN_SPARK_PAD);
}
// Pi-inspired: p90 reference line — typical worst-case latency. Requires >= 3
// samples (same guard as medianDuration / p90FromDurations). Drawn dashed
// in danger-light-5 to distinguish from median (success-light-3) and avg
// (secondary). Paired with SessionStatusBar's latencyP90Y (iter 160).
function mcpPinSparkP90Y(name: string): number {
  const ds = mcpToolResults.value[name]?.durations ?? [];
  const p = p90FromDurations(ds);
  if (p == null) return -10;
  const max = Math.max(...ds, 1);
  const min = Math.min(...ds, 0);
  const range = max - min || 1;
  if (p > max) return -10;
  return PIN_SPARK_H - PIN_SPARK_PAD - ((p - min) / range) * (PIN_SPARK_H - 2 * PIN_SPARK_PAD);
}
function builtinPinSparkP90Y(name: string): number {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  const sliced = ds.slice(-MCP_DURATION_HISTORY);
  const p = p90FromDurations(sliced);
  if (p == null) return -10;
  const max = Math.max(...sliced, 1);
  const min = Math.min(...sliced, 0);
  const range = max - min || 1;
  if (p > max) return -10;
  return PIN_SPARK_H - PIN_SPARK_PAD - ((p - min) / range) * (PIN_SPARK_H - 2 * PIN_SPARK_PAD);
}
function mcpPinSparkPath(name: string): string {
  const ds = mcpToolResults.value[name]?.durations ?? [];
  return sparkPathFromDurations(ds);
}
function builtinPinSparkPath(name: string): string {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  return sparkPathFromDurations(ds.slice(-MCP_DURATION_HISTORY));
}
// Pi-inspired: per-tool latency projection — extrapolate +10 calls forward.
// Symmetric to SessionStatusBar's costProjection (iter 196) but scoped to a
// single tool's duration series. Returns SVG coords or null when insufficient data.
function pinProjectionPoint(ds: number[]): { x: number; y: number; ms: number } | null {
  if (ds.length < 2) return null;
  const max = Math.max(...ds, 1);
  const min = Math.min(...ds, 0);
  const range = max - min || 1;
  const n = ds.length;
  const perCall = (ds[n - 1] - ds[0]) / (n - 1);
  const ms = ds[n - 1] + 10 * perCall;
  const x = PIN_SPARK_W - PIN_SPARK_PAD;
  // Clamp Y to [PIN_SPARK_PAD, PIN_SPARK_H - PIN_SPARK_PAD] so endpoint stays
  // in viewBox in BOTH directions. Extrapolation can overshoot observed max
  // (raw Y → negative) OR undershoot observed min (raw Y > PIN_SPARK_H, e.g.
  // declining latency). Without clamp, endpoint is clipped by SVG viewport.
  // (iter 204 top clamp, iter 209 bottom clamp)
  const rawY = PIN_SPARK_H - PIN_SPARK_PAD - ((ms - min) / range) * (PIN_SPARK_H - 2 * PIN_SPARK_PAD);
  const y = Math.min(PIN_SPARK_H - PIN_SPARK_PAD, Math.max(PIN_SPARK_PAD, rawY));
  return { x, y, ms };
}
function mcpPinProjectionPoint(name: string) {
  return pinProjectionPoint(mcpToolResults.value[name]?.durations ?? []);
}
function builtinPinProjectionPoint(name: string) {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  return pinProjectionPoint(ds.slice(-MCP_DURATION_HISTORY));
}
function builtinPinCount(name: string): string {
  const r = toolLastCalls.value[name];
  const c = r?.count;
  if (typeof c !== "number") return PIN_NO_CALLS;
  const f = r?.failCount ?? 0;
  return f > 0 ? `×${c} · ${f} fail` : `×${c}`;
}
function builtinPinFailRate(name: string): string {
  const r = toolLastCalls.value[name];
  const c = r?.count;
  const f = r?.failCount ?? 0;
  if (typeof c !== "number" || c < 3 || f === 0) return "";
  return `${Math.round((f / c) * 100)}% fail rate`;
}
function builtinPinAvgMs(name: string): string {
  const avg = toolLastCalls.value[name]?.avgMs;
  if (typeof avg !== "number") return "";
  return avg < 1000 ? `${avg}ms` : `${(avg / 1000).toFixed(1)}s`;
}
function builtinPinMaxMs(name: string): string {
  const max = toolLastCalls.value[name]?.maxMs;
  if (typeof max !== "number") return "";
  return max < 1000 ? `${max}ms` : `${(max / 1000).toFixed(1)}s`;
}
function mcpPinCount(name: string): string {
  const r = mcpToolResults.value[name];
  const c = r?.count;
  if (typeof c !== "number") return PIN_NO_CALLS;
  const f = r?.failCount ?? 0;
  return f > 0 ? `×${c} · ${f} fail` : `×${c}`;
}
// Pi-inspired: success rate over the session. Sample size guard avoids
// misleading percentages from 1-2 calls (a single failure = 0% looks dire).
function mcpPinFailRate(name: string): string {
  const r = mcpToolResults.value[name];
  const c = r?.count;
  const f = r?.failCount ?? 0;
  if (typeof c !== "number" || c < 3 || f === 0) return "";
  return `${Math.round((f / c) * 100)}% fail rate`;
}
function mcpPinAvgMs(name: string): string {
  const avg = avgDuration(mcpToolResults.value[name]?.durations);
  if (avg == null) return "";
  return avg < 1000 ? `${avg}ms` : `${(avg / 1000).toFixed(1)}s`;
}
function mcpPinMaxMs(name: string): string {
  const max = maxDuration(mcpToolResults.value[name]?.durations);
  if (max == null) return "";
  return max < 1000 ? `${max}ms` : `${(max / 1000).toFixed(1)}s`;
}
// Pi-inspired: p90 latency on the pin row — typical worst-case experience.
// Symmetric to SessionStatusBar's latencyP90. Requires >= 3 samples.
function p90FromDurations(prev: number[] | undefined): number | null {
  const arr = (prev ?? []).slice().sort((a, b) => a - b);
  if (arr.length < 3) return null;
  const idx = Math.min(arr.length - 1, Math.floor(arr.length * 0.9));
  return arr[idx];
}
function mcpPinP90Ms(name: string): string {
  const p = p90FromDurations(mcpToolResults.value[name]?.durations);
  if (p == null) return "";
  return p < 1000 ? `${p}ms` : `${(p / 1000).toFixed(1)}s`;
}
function builtinPinP90Ms(name: string): string {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  const p = p90FromDurations(ds.slice(-MCP_DURATION_HISTORY));
  if (p == null) return "";
  return p < 1000 ? `${p}ms` : `${(p / 1000).toFixed(1)}s`;
}
function medianDuration(prev: number[] | undefined): number | null {
  const arr = (prev ?? []).slice();
  if (arr.length < 3) return null;
  arr.sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 === 0 ? Math.round((arr[mid - 1] + arr[mid]) / 2) : arr[mid];
}
function mcpPinMedianMs(name: string): string {
  const m = medianDuration(mcpToolResults.value[name]?.durations);
  if (m == null) return "";
  return m < 1000 ? `${m}ms` : `${(m / 1000).toFixed(1)}s`;
}
function builtinPinMedianMs(name: string): string {
  const m = medianDurationFromEvents(name);
  if (m == null) return "";
  return m < 1000 ? `${m}ms` : `${(m / 1000).toFixed(1)}s`;
}
// A pinned tool that has never been invoked this session — surfaces as
// stale so users can spot pins that no longer match their workflow.
function isBuiltinPinStale(name: string): boolean {
  const c = toolLastCalls.value[name]?.count;
  return typeof c !== "number" || c === 0;
}
function isMcpPinStale(name: string): boolean {
  const c = mcpToolResults.value[name]?.count;
  return typeof c !== "number" || c === 0;
}
function unpinAllBuiltin(): void {
  const mcp = new Set(pinnedMcpNames.value);
  const next = new Set<string>();
  for (const p of pinnedTools.value) if (mcp.has(p)) next.add(p);
  pinnedTools.value = next;
  persistPinned();
}
function unpinAllMcp(): void {
  const builtin = new Set(pinnedBuiltinNames.value);
  const next = new Set<string>();
  for (const p of pinnedTools.value) if (builtin.has(p)) next.add(p);
  pinnedTools.value = next;
  persistPinned();
}
const skillSortLabel: Record<SkillSortMode, string> = {
  registry: "↕ by order",
  calls: "↕ by calls",
  recent: "↕ by recent",
};
function cycleSkillSortMode(): void {
  const order: SkillSortMode[] = ["registry", "calls", "recent"];
  const idx = order.indexOf(skillSortMode.value);
  skillSortMode.value = order[(idx + 1) % order.length];
  persistSkillPrefs();
}

// Watch compactMode and persist on toggle.
watch(compactMode, persistSkillPrefs);

// Pinned tools — surfacing frequently-used tools at the top regardless of
// sort mode (Pi's pin-to-top pattern). Persisted to localStorage so pins
// survive across sessions / page reloads.
const PINNED_LS_KEY = "yivad.aichat.pinnedTools";
const pinnedTools = ref<Set<string>>(new Set(loadPinned()));
function loadPinned(): string[] {
  try {
    const raw = localStorage.getItem(PINNED_LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(x => typeof x === "string") : [];
  } catch { return []; }
}
function persistPinned(): void {
  try { localStorage.setItem(PINNED_LS_KEY, JSON.stringify([...pinnedTools.value])); } catch { /* ignore */ }
}
function togglePin(toolName: string): void {
  const next = new Set(pinnedTools.value);
  if (next.has(toolName)) next.delete(toolName);
  else next.add(toolName);
  pinnedTools.value = next;
  persistPinned();
}

// Search filter for built-in tools (Pi-inspired: tool palette search).
// Substring match against name or description; case-insensitive.
const builtinToolFilter = ref("");
// Global search across both built-in + MCP sections (Pi-inspired: one search
// box that filters everything). When non-empty, overrides the per-section
// filters so users can find any tool from any category in one keystroke.
const globalToolFilter = ref("");
function activeToolFilter(local: string): string {
  return globalToolFilter.value || local;
}
const visibleSkills = computed(() => {
  const q = activeToolFilter(builtinToolFilter.value).trim().toLowerCase();
  if (!q) return sortedSkills.value;
  return sortedSkills.value.filter(t => {
    const name = (t.name ?? "").toLowerCase();
    const desc = (t.description ?? "").toLowerCase();
    const label = (t.label ?? "").toLowerCase();
    return name.includes(q) || desc.includes(q) || label.includes(q);
  });
});

// Split text into [before, match, after] segments for highlighting.
// Pi surfaces match position visually so users see why a tool matched.
type HighlightSegment = { text: string; match: boolean };
function highlightSegments(text: string, query: string): HighlightSegment[] {
  if (!query) return [{ text, match: false }];
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const out: HighlightSegment[] = [];
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(q, i);
    if (idx === -1) {
      out.push({ text: text.slice(i), match: false });
      break;
    }
    if (idx > i) out.push({ text: text.slice(i, idx), match: false });
    out.push({ text: text.slice(idx, idx + q.length), match: true });
    i = idx + q.length;
  }
  return out;
}
const mcpServers: McpServerConfig[] = MCP_SERVERS;
const lastToolEvent = computed(() => {
  const ev = store.toolEvents ?? [];
  return ev.length ? ev[ev.length - 1] : null;
});

// ── MCP tool list (Pi-inspired: discover external capability providers' tools) ──
const mcpTools = ref<McpTool[]>([]);
const mcpToolsLoading = ref(false);
const mcpToolsError = ref<string | null>(null);
const mcpToolsLoaded = ref(false);
const mcpToolFilter = ref("");

const filteredMcpTools = computed<McpTool[]>(() => {
  const q = activeToolFilter(mcpToolFilter.value).trim().toLowerCase();
  const base = !q
    ? mcpTools.value
    : mcpTools.value.filter(t => {
        const name = (t.name ?? "").toLowerCase();
        const desc = (t.description ?? "").toLowerCase();
        return name.includes(q) || desc.includes(q);
      });
  return pinnedFirst(base);
});

// Pi-inspired: aggregate match summary when the global search is active.
// Reports total + per-section counts so users know if they have 0 hits
// anywhere (skip the scrolling) or which section to focus on.
const globalSearchSummary = computed<{ total: number; builtin: number; mcp: number } | null>(() => {
  if (!globalToolFilter.value.trim()) return null;
  return {
    total: visibleSkills.value.length + filteredMcpTools.value.length,
    builtin: visibleSkills.value.length,
    mcp: filteredMcpTools.value.length
  };
});

// Pi-inspired: fuzzy "did you mean?" suggestions when global search has 0
// matches. Uses trigram Jaccard similarity across all built-in + MCP tools;
// surfaces up to 3 closest names above a 0.1 threshold so users get a hint
// rather than a dead-end.
function trigrams(s: string): Set<string> {
  const t = s.toLowerCase().trim();
  if (t.length < 3) return new Set([t]);
  const out = new Set<string>();
  for (let i = 0; i + 3 <= t.length; i++) out.add(t.slice(i, i + 3));
  return out;
}
function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
const similarTools = computed<{ name: string; score: number; kind: "built-in" | "MCP" }[]>(() => {
  const q = globalToolFilter.value.trim();
  if (!q || !globalSearchSummary.value || globalSearchSummary.value.total > 0) return [];
  const qt = trigrams(q);
  if (!qt.size) return [];
  const allBuiltin = (store.allTools ?? []).map(t => ({ name: t.name, kind: "built-in" as const }));
  const allMcp = mcpTools.value.map(t => ({ name: t.name, kind: "MCP" as const }));
  return [...allBuiltin, ...allMcp]
    .map(t => ({ ...t, score: jaccard(qt, trigrams(t.name)) }))
    .filter(t => t.score >= 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
});

// Pi-inspired: keyboard nav across the flat filtered-tool list. Built-in
// section comes first (matches visible render order), MCP second. Enter
// triggers the same action as clicking the row (togglePin for built-in,
// runMcpToolInline for MCP). Selection lives only while the global search
// has focus — Escape or clearing the query resets it.
const selectedToolIdx = ref<number>(-1);
const flatFilteredTools = computed<{ name: string; kind: "built-in" | "MCP" }[]>(() => {
  if (!globalToolFilter.value.trim()) return [];
  return [
    ...visibleSkills.value.map(t => ({ name: t.name, kind: "built-in" as const })),
    ...filteredMcpTools.value.map(t => ({ name: t.name, kind: "MCP" as const }))
  ];
});
function onGlobalSearchKeydown(e: Event): void {
  const ke = e as KeyboardEvent;
  if (!flatFilteredTools.value.length) return;
  if (ke.key === "ArrowDown") {
    e.preventDefault();
    selectedToolIdx.value = (selectedToolIdx.value + 1) % flatFilteredTools.value.length;
  } else if (ke.key === "ArrowUp") {
    e.preventDefault();
    selectedToolIdx.value = selectedToolIdx.value <= 0
      ? flatFilteredTools.value.length - 1
      : selectedToolIdx.value - 1;
  } else if (ke.key === "Enter") {
    // Pi-inspired: Enter with no selection defaults to the first match.
    // Saves one ArrowDown keystroke for the common "type → invoke top hit" flow.
    // Shift+Enter dismisses the popover too — for one-shot pin/run when the
    // user wants to keep working in the chat area next. Plain Enter leaves
    // the popover open so they can re-invoke / see MCP running state.
    const idx = selectedToolIdx.value === -1 ? 0 : selectedToolIdx.value;
    const sel = flatFilteredTools.value[idx];
    if (!sel) return;
    e.preventDefault();
    selectedToolIdx.value = idx;
    if (sel.kind === "built-in") togglePin(sel.name);
    else {
      const t = mcpTools.value.find(x => x.name === sel.name);
      if (t) void runMcpToolInline(t);
    }
    if (ke.shiftKey) {
      skillsPopoverVisible.value = false;
      globalToolFilter.value = "";
      selectedToolIdx.value = -1;
    }
  } else if (ke.key === "Escape") {
    selectedToolIdx.value = -1;
  } else if (ke.key === "Home") {
    // Pi-inspired: Home/End jump to first/last match. Skip when modifier keys
    // are held — browsers use Cmd+Home for navigation etc.
    if (ke.metaKey || ke.ctrlKey || ke.altKey) return;
    e.preventDefault();
    selectedToolIdx.value = 0;
  } else if (ke.key === "End") {
    if (ke.metaKey || ke.ctrlKey || ke.altKey) return;
    e.preventDefault();
    selectedToolIdx.value = flatFilteredTools.value.length - 1;
  } else if (ke.key === "PageUp" || ke.key === "PageDown") {
    // Pi-inspired: PageUp/PageDown jump by a page of items (not single step).
    // Page size scales with result count — small lists (≤8) page by 3, larger
    // lists page by 5 — keeps keyboard nav efficient without overshooting.
    if (ke.metaKey || ke.ctrlKey || ke.altKey) return;
    e.preventDefault();
    const len = flatFilteredTools.value.length;
    if (!len) return;
    const pageSize = len <= 8 ? 3 : 5;
    const delta = ke.key === "PageDown" ? pageSize : -pageSize;
    let next = selectedToolIdx.value + delta;
    if (next < 0) next = 0;
    if (next >= len) next = len - 1;
    if (selectedToolIdx.value === -1) next = ke.key === "PageDown" ? Math.min(pageSize, len - 1) : 0;
    selectedToolIdx.value = next;
  }
}
watch(globalToolFilter, () => { selectedToolIdx.value = -1; });
const selectedBuiltinIdx = computed(() => {
  if (selectedToolIdx.value < 0) return -1;
  if (selectedToolIdx.value >= visibleSkills.value.length) return -1;
  return selectedToolIdx.value;
});
const selectedMcpIdx = computed(() => {
  if (selectedToolIdx.value < 0) return -1;
  const offset = selectedToolIdx.value - visibleSkills.value.length;
  if (offset < 0 || offset >= filteredMcpTools.value.length) return -1;
  return offset;
});
// Pi-inspired: position indicator during keyboard nav. Shows where the
// selection is (e.g. "2/5 built-in" or "1/3 MCP") — anchored to whichever
// section currently holds the selection. Empty when nothing selected.
const selectionPos = computed<string>(() => {
  const bi = selectedBuiltinIdx.value;
  const mi = selectedMcpIdx.value;
  if (bi >= 0) return `${bi + 1}/${visibleSkills.value.length} built-in`;
  if (mi >= 0) return `${mi + 1}/${filteredMcpTools.value.length} MCP`;
  return "";
});
// Pi-inspired: auto-scroll the selected row into view within the popover.
// Uses querySelector by index-based data attribute. Runs in nextTick after
// Vue flushes the class binding so the row is already .is-selected marked.
watch([selectedBuiltinIdx, selectedMcpIdx], () => {
  void nextTick(() => {
    const list = document.querySelector<HTMLElement>(".ct-skills-list");
    if (!list) return;
    const sel = list.querySelector<HTMLElement>(".ct-skill.is-selected");
    if (!sel) return;
    sel.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
});

async function loadMcpTools(force = false): Promise<void> {
  if (mcpToolsLoading.value) return;
  if (mcpToolsLoaded.value && !force) return;
  mcpToolsLoading.value = true;
  mcpToolsError.value = null;
  try {
    mcpTools.value = await listMcpTools();
    mcpToolsLoaded.value = true;
  } catch (e: any) {
    mcpToolsError.value = e?.message || String(e);
    mcpTools.value = [];
  } finally {
    mcpToolsLoading.value = false;
  }
}

// Lazy-load on first popover open.
function onSkillsPopoverOpen(): void {
  if (!mcpToolsLoaded.value && !mcpToolsLoading.value) {
    void loadMcpTools();
  }
}

// Pi-inspired: `/` shortcut focuses the global tool search. If the Skills
// popover is closed, open it first, then focus the input on the next tick
// (popover content renders after v-model:visible flips). Ignore when the
// user is already typing in an input/textarea/contenteditable.
const globalSearchRef = ref<{ focus: () => void } | null>(null);
function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}
function onGlobalSlash(e: KeyboardEvent): void {
  if (e.key !== "/") return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (isTypingTarget(e.target)) return;
  e.preventDefault();
  if (!skillsPopoverVisible.value) {
    skillsPopoverVisible.value = true;
    void nextTick(() => globalSearchRef.value?.focus());
  } else {
    globalSearchRef.value?.focus();
  }
}
onMounted(() => window.addEventListener("keydown", onGlobalSlash));
onUnmounted(() => window.removeEventListener("keydown", onGlobalSlash));

// ── Inline Run (Pi-inspired: one-click tool invocation from the panel) ──
interface McpToolResult {
  running?: boolean;
  content?: string;
  error?: string;
  durationMs?: number;
  at?: number;
  count?: number;
  failCount?: number;
  durations?: number[];
}
const MCP_DURATION_HISTORY = 20;
function appendDuration(prev: number[] | undefined, ms: number): number[] {
  const next = [...(prev ?? []), ms];
  return next.length > MCP_DURATION_HISTORY ? next.slice(next.length - MCP_DURATION_HISTORY) : next;
}
function avgDuration(prev: number[] | undefined): number | null {
  const arr = prev ?? [];
  if (!arr.length) return null;
  return Math.round(arr.reduce((s, x) => s + x, 0) / arr.length);
}
function maxDuration(prev: number[] | undefined): number | null {
  const arr = prev ?? [];
  if (!arr.length) return null;
  return Math.max(...arr);
}
// Pi-inspired: median latency — robust to outliers, complementing avg (skewed
// by spikes) and max (single worst case). Computed from the per-tool recent
// event log; small samples (n<3) return null to avoid noise.
function medianDurationFromEvents(name: string): number | null {
  const events = store.toolEvents ?? [];
  const ds: number[] = [];
  for (const e of events) {
    if (e.phase !== "end" || e.name !== name) continue;
    if (typeof e.durationMs === "number") ds.push(e.durationMs);
  }
  if (ds.length < 3) return null;
  ds.sort((a, b) => a - b);
  const mid = Math.floor(ds.length / 2);
  return ds.length % 2 === 0 ? Math.round((ds[mid - 1] + ds[mid]) / 2) : ds[mid];
}
const mcpToolResults = ref<Record<string, McpToolResult>>({});

// Schema-driven args editor: per-tool input values keyed by property name.
interface ToolProp {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  default?: unknown;
}
const mcpToolArgs = ref<Record<string, Record<string, string>>>({});

// Reset MCP results/args when active conversation changes — these are
// per-session telemetry that shouldn't leak across conversations.
watch(
  () => store.activeConversation?.key,
  () => {
    mcpToolResults.value = {};
    mcpToolArgs.value = {};
  },
);

function getToolProps(tool: McpTool): ToolProp[] {
  const schema = (tool.input_schema ?? tool.inputSchema) as
    | { properties?: Record<string, any>; required?: string[] }
    | undefined;
  if (!schema?.properties) return [];
  const required = new Set(schema.required ?? []);
  return Object.entries(schema.properties).map(([name, def]) => ({
    name,
    type: (def as any)?.type ?? "string",
    description: (def as any)?.description,
    required: required.has(name),
    default: (def as any)?.default,
  }));
}

function ensureToolArgs(tool: McpTool): Record<string, string> {
  if (!mcpToolArgs.value[tool.name]) {
    const init: Record<string, string> = {};
    for (const p of getToolProps(tool)) {
      if (p.default != null) init[p.name] = String(p.default);
    }
    mcpToolArgs.value = { ...mcpToolArgs.value, [tool.name]: init };
  }
  return mcpToolArgs.value[tool.name];
}

function coerceArg(value: string, type: string): unknown {
  if (type === "integer" || type === "number") {
    return /^\d+$/.test(value) ? Number(value) : value;
  }
  if (type === "object" || type === "array") {
    try { return JSON.parse(value); } catch { return value; }
  }
  if (type === "boolean") {
    return value === "true" || value === "1";
  }
  return value;
}

function resetToolArgs(tool: McpTool): void {
  const init: Record<string, string> = {};
  for (const p of getToolProps(tool)) {
    if (p.default != null) init[p.name] = String(p.default);
  }
  mcpToolArgs.value = { ...mcpToolArgs.value, [tool.name]: init };
}

// Last-submitted args per tool (raw string form) — for one-click Rerun.
const mcpToolLastArgs = ref<Record<string, Record<string, string>>>({});

function rerunMcpToolLast(tool: McpTool): void {
  const last = mcpToolLastArgs.value[tool.name];
  if (!last) return;
  mcpToolArgs.value = { ...mcpToolArgs.value, [tool.name]: { ...last } };
  void runMcpToolInline(tool);
}

// Copy-result feedback state for the Rerun popover (per-tool, symmetric to
// SessionStatusBar's chip-popover pattern).
const copiedRerunTool = ref<string | null>(null);
const failedRerunTool = ref<string | null>(null);
async function copyMcpToolResult(content: string, name: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(content);
    failedRerunTool.value = null;
    copiedRerunTool.value = name;
    setTimeout(() => {
      if (copiedRerunTool.value === name) copiedRerunTool.value = null;
    }, 1500);
  } catch {
    copiedRerunTool.value = null;
    failedRerunTool.value = name;
    setTimeout(() => {
      if (failedRerunTool.value === name) failedRerunTool.value = null;
    }, 1500);
  }
}

async function saveMcpToolResultToKB(content: string): Promise<void> {
  if (!content.trim()) return;
  try {
    const res = await ElMessageBox.prompt(
      "Enter the file path under YiKnowledge (e.g. notes/tool-output.md):",
      "Save tool result to Knowledge Base",
      {
        confirmButtonText: "Save",
        cancelButtonText: "Cancel",
        inputValue: `notes/tool-result-${Date.now()}.md`,
        inputPlaceholder: "notes/tool-result.md",
      }
    );
    const path = (res?.value ?? "").trim();
    if (!path) return;
    await store.saveContextToKnowledge(path, content);
    ElMessage.success(`Saved "${path}" to knowledge base`);
  } catch {
    // user cancelled
  }
}

async function runMcpToolInline(tool: McpTool): Promise<void> {
  const t0 = performance.now();
  const prev = mcpToolResults.value[tool.name];
  const nextCount = (prev?.count ?? 0) + 1;
  mcpToolResults.value = {
    ...mcpToolResults.value,
    [tool.name]: { running: true, at: Date.now(), count: nextCount },
  };
  // Build args from the inline form (if any), coerced per schema type.
  const argValues = mcpToolArgs.value[tool.name] ?? {};
  const props = getToolProps(tool);
  const args: Record<string, unknown> = {};
  for (const p of props) {
    const raw = argValues[p.name];
    if (raw == null || raw === "") {
      if (p.required) {
        const dt = Math.round(performance.now() - t0);
        mcpToolResults.value = {
          ...mcpToolResults.value,
          [tool.name]: {
            error: `missing required parameter: ${p.name}`,
            durationMs: dt,
            at: Date.now(),
            count: nextCount,
            failCount: (prev?.failCount ?? 0) + 1,
            durations: appendDuration(prev?.durations, dt),
          },
        };
        return;
      }
      continue;
    }
    args[p.name] = coerceArg(raw, p.type);
  }
  // Snapshot the raw form values for one-click Rerun (skip when validation
  // failed above — we never reached here).
  mcpToolLastArgs.value = {
    ...mcpToolLastArgs.value,
    [tool.name]: { ...argValues },
  };
  try {
    const result = await callMcpTool(tool.name, args);
    const dt = Math.round(performance.now() - t0);
    mcpToolResults.value = {
      ...mcpToolResults.value,
      [tool.name]: {
        content: (result?.content ?? "").slice(0, 800),
        durationMs: dt,
        at: Date.now(),
        count: nextCount,
        durations: appendDuration(prev?.durations, dt),
      },
    };
  } catch (e: any) {
    const dt = Math.round(performance.now() - t0);
    mcpToolResults.value = {
      ...mcpToolResults.value,
      [tool.name]: {
        error: e?.message || String(e),
        durationMs: dt,
        at: Date.now(),
        count: nextCount,
        failCount: (prev?.failCount ?? 0) + 1,
        durations: appendDuration(prev?.durations, dt),
      },
    };
  }
}

// ── LLM-visible prompt preview (Pi-inspired: introspect what the model sees) ──
const showLlmPrompt = ref(false);
const llmPromptText = computed(() => (store.getToolsForSystemPrompt ?? (() => ""))());

// ── RAG chat-mode picker (llama_index ChatEngine selector) ──
type ChatMode = "condense_plus_context" | "condense_question" | "context" | "simple";
const chatModePopoverVisible = ref(false);
const chatModeOptions: Array<{ value: ChatMode; label: string; desc: string }> = [
  { value: "condense_plus_context", label: "condense+ctx", desc: "Multi-turn condense + context (default — best for Q&A over a knowledge base)" },
  { value: "condense_question", label: "condense_q", desc: "Condense history into a single query, then retrieve + answer" },
  { value: "context", label: "ctx_only", desc: "Last user message + context only — no history condense" },
  { value: "simple", label: "simple", desc: "Plain LLM, no retrieval — baseline for A/B comparison" },
];
const chatModeLabel = computed(() => {
  const m = (props.ragChatMode ?? "condense_plus_context") as ChatMode;
  return chatModeOptions.find(o => o.value === m)?.label ?? "condense+ctx";
});
function selectChatMode(m: ChatMode) {
  emit("select-rag-chat-mode", m);
  chatModePopoverVisible.value = false;
}
async function copyLlmPrompt(): Promise<void> {
  try {
    await navigator.clipboard.writeText(llmPromptText.value);
  } catch {
    // clipboard may be unavailable; ignore
  }
}

// ── Per-tool prompt metadata expand (Pi-inspired: surface promptSnippet + guidelines) ──
const expandedTools = ref<Set<string>>(new Set());
function toggleToolExpand(name: string): void {
  const next = new Set(expandedTools.value);
  if (next.has(name)) next.delete(name);
  else next.add(name);
  expandedTools.value = next;
}
function hasToolPromptMeta(tool: { promptSnippet?: string; promptGuidelines?: string[] }): boolean {
  return !!(tool.promptSnippet || tool.promptGuidelines?.length);
}

// ── Per-MCP-tool input_schema preview (Pi-inspired: LLM-visible metadata parity) ──
const expandedMcpTools = ref<Set<string>>(new Set());
function toggleMcpToolExpand(name: string): void {
  const next = new Set(expandedMcpTools.value);
  if (next.has(name)) next.delete(name);
  else next.add(name);
  expandedMcpTools.value = next;
}
function getToolSchemaJson(tool: McpTool): string {
  const schema = (tool.input_schema ?? tool.inputSchema) as Record<string, unknown> | undefined;
  if (!schema) return "";
  try {
    return JSON.stringify(schema, null, 2);
  } catch {
    return "";
  }
}

// ── Last-invoked timestamp per tool (Pi-inspired: tool execution history) ──
interface ToolLastCall { ts: number; durationMs?: number; error?: string; count: number; avgMs?: number; maxMs?: number; failCount?: number }
const toolLastCalls = computed<Record<string, ToolLastCall>>(() => {
  const events = store.toolEvents ?? [];
  const out: Record<string, ToolLastCall> = {};
  for (const e of events) {
    if (e.phase !== "end") continue;
    const prev = out[e.name];
    if (!prev) {
      out[e.name] = {
        ts: e.timestamp,
        durationMs: e.durationMs,
        error: e.error,
        count: 1,
        avgMs: e.durationMs,
        maxMs: e.durationMs,
        failCount: e.error ? 1 : 0,
      };
    } else {
      prev.count += 1;
      if (e.error) prev.failCount = (prev.failCount ?? 0) + 1;
      if (typeof e.durationMs === "number") {
        prev.avgMs = prev.avgMs != null
          ? Math.round(((prev.avgMs * (prev.count - 1)) + e.durationMs) / prev.count)
          : e.durationMs;
        if (prev.maxMs == null || e.durationMs > prev.maxMs) prev.maxMs = e.durationMs;
      }
      if (e.timestamp > prev.ts) {
        prev.ts = e.timestamp;
        prev.durationMs = e.durationMs;
        prev.error = e.error;
      }
    }
  }
  return out;
});
// ── Aggregate telemetry summary (Pi-inspired: session-level tool usage) ──
const toolStats = computed(() => {
  const events = store.toolEvents ?? [];
  let total = 0;
  let failed = 0;
  let durSum = 0;
  let durCount = 0;
  for (const e of events) {
    if (e.phase !== "end") continue;
    total += 1;
    if (e.error) failed += 1;
    if (typeof e.durationMs === "number") {
      durSum += e.durationMs;
      durCount += 1;
    }
  }
  let mcpTotal = 0;
  // Merge in MCP tool invocations tracked locally (not in toolEvents).
  // Each MCP tool contributes its latest duration as one sample; full call
  // count is summed (since each click was an attempt) but avg uses only
  // the latest sample because we don't retain per-call history.
  for (const r of Object.values(mcpToolResults.value)) {
    if (!r.count) continue;
    mcpTotal += r.count;
    total += r.count;
    if (r.error) failed += 1;
    if (typeof r.durationMs === "number") {
      durSum += r.durationMs;
      durCount += 1;
    }
  }
  const builtinTotal = total - mcpTotal;
  return {
    active: (store.activeTools ?? []).length,
    total,
    builtinTotal,
    mcpTotal,
    failed,
    ok: total - failed,
    avgMs: durCount ? Math.round(durSum / durCount) : undefined,
  };
});

// ── Top-3 most-invoked tools (Pi-inspired: surface high-frequency tools) ──
interface ToolCallRank { name: string; label: string; count: number; kind: "builtin" | "mcp" }
const topTools = computed<ToolCallRank[]>(() => {
  const counts = new Map<string, ToolCallRank>();
  for (const e of store.toolEvents ?? []) {
    if (e.phase !== "end") continue;
    const key = `b:${e.name}`;
    const entry = counts.get(key) ?? { name: e.name, label: e.label, count: 0, kind: "builtin" as const };
    entry.count += 1;
    counts.set(key, entry);
  }
  for (const [toolName, r] of Object.entries(mcpToolResults.value)) {
    if (!r.count) continue;
    const key = `m:${toolName}`;
    const entry = counts.get(key) ?? { name: toolName, label: toolName, count: 0, kind: "mcp" as const };
    entry.count += r.count;
    counts.set(key, entry);
  }
  return [...counts.values()]
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
});

// Plain-text tool telemetry summary — for sharing in PRs / bug reports /
// review notes. Mirrors the on-screen summary block + top-3 ranking.
const telemetrySummaryText = computed(() => {
  const s = toolStats.value;
  const lines: string[] = [];
  lines.push(`Tool telemetry · ${new Date().toLocaleString()}`);
  lines.push(`Active: ${s.active}`);
  const parts: string[] = [`Calls: ${s.total}`];
  if (s.builtinTotal || s.mcpTotal) parts.push(`(${s.builtinTotal} built-in + ${s.mcpTotal} MCP)`);
  if (s.ok) parts.push(`${s.ok} ok`);
  if (s.failed) {
    const pct = s.total > 0 ? Math.round((s.failed / s.total) * 100) : 0;
    parts.push(`${s.failed} failed (${pct}%)`);
  }
  if (s.avgMs != null) parts.push(`${s.avgMs}ms avg`);
  lines.push(parts.join(" · "));
  const tops = topTools.value;
  if (tops.length) {
    lines.push("Top:");
    for (const t of tops) {
      lines.push(`  - ${t.name} (${t.kind}) ×${t.count}`);
    }
  }
  return lines.join("\n");
});

const copiedTelemetry = ref(false);
async function copyTelemetrySummary(): Promise<void> {
  try {
    await navigator.clipboard.writeText(telemetrySummaryText.value);
    copiedTelemetry.value = true;
    setTimeout(() => { copiedTelemetry.value = false; }, 1500);
  } catch {
    copiedTelemetry.value = false;
  }
}

async function saveTelemetryToKB(): Promise<void> {
  try {
    const res = await ElMessageBox.prompt(
      "Enter the file path under YiKnowledge (e.g. notes/telemetry.md):",
      "Save telemetry summary to Knowledge Base",
      {
        confirmButtonText: "Save",
        cancelButtonText: "Cancel",
        inputValue: `notes/telemetry-${Date.now()}.md`,
        inputPlaceholder: "notes/telemetry.md",
      }
    );
    const path = (res?.value ?? "").trim();
    if (!path) return;
    await store.saveContextToKnowledge(path, telemetrySummaryText.value);
    ElMessage.success(`Saved "${path}" to knowledge base`);
  } catch {
    // user cancelled
  }
}

function formatRelativeTime(ts: number): string {
  const diffSec = Math.round((Date.now() - ts) / 1000);
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

// ── MCP health probe (Pi-inspired: live capability discovery) ──
interface McpProbeState {
  status: "idle" | "probing" | "ok" | "fail";
  latencyMs?: number;
  httpStatus?: number;
  error?: string;
}
const mcpProbe = ref<Record<string, McpProbeState>>({});

async function probeMcp(server: McpServerConfig): Promise<void> {
  if (!server.browserReachable || !server.url) {
    mcpProbe.value = {
      ...mcpProbe.value,
      [server.name]: { status: "fail", error: "local-only (stdio)" },
    };
    return;
  }
  mcpProbe.value = {
    ...mcpProbe.value,
    [server.name]: { status: "probing" },
  };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  const t0 = performance.now();
  try {
    const res = await fetch(server.url, {
      method: "GET",
      signal: ctrl.signal,
      // MCP streamable-http expects POST; a GET probe just verifies the
      // server is alive. 404/405/406 all count as "reachable".
    });
    const latency = Math.round(performance.now() - t0);
    mcpProbe.value = {
      ...mcpProbe.value,
      [server.name]: {
        status: res.ok || res.status < 500 ? "ok" : "fail",
        latencyMs: latency,
        httpStatus: res.status,
      },
    };
  } catch (err: any) {
    const latency = Math.round(performance.now() - t0);
    const msg = err?.name === "AbortError" ? "timeout (3s)" : (err?.message || "unreachable");
    mcpProbe.value = {
      ...mcpProbe.value,
      [server.name]: { status: "fail", latencyMs: latency, error: msg },
    };
  } finally {
    clearTimeout(timer);
  }
}
</script>

<template>
  <div class="ct-toolbar">
    <div class="ct-left">
      <el-tooltip v-if="collapseCtx?.collapsible" content="Collapse chat" placement="bottom">
        <el-button circle size="default" :aria-label="'Collapse chat'" @click="collapseCtx?.toggle()">
          <el-icon><ArrowRight v-if="collapseCtx?.side === 'right'" /><ArrowLeft v-else /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="FAQ" placement="bottom">
        <el-button circle size="default" :icon="ChatLineSquare" :type="faqActive ? 'primary' : ''" @click="emit('toggle-faq')" />
      </el-tooltip>
      <FaqPopover />
      <!-- Prompt history (Pi-inspired: recent prompts browser) -->
      <el-popover
        v-model:visible="historyPopoverVisible"
        placement="bottom"
        :width="420"
        trigger="click"
        :title="`Prompt history · ${promptHistory.length}`"
        @show="historyQuery = ''"
      >
        <template #reference>
          <el-button circle size="default" :icon="Clock" title="Prompt history" />
        </template>
        <div class="ct-history-pop">
          <div v-if="recentPromptChips.length" class="ct-history-recent">
            <span class="ct-history-recent-label">Recent:</span>
            <span
              v-for="(p, i) in recentPromptChips"
              :key="`recent-${i}`"
              class="ct-history-chip"
            >
              <span class="ct-history-chip-text" :title="`${p} — click to insert into input`" @click="useHistoryPrompt(p)">{{ truncatePrompt(p) }}</span>
              <el-button
                class="ct-history-chip-copy"
                size="small"
                text
                :icon="DocumentCopy"
                title="Copy prompt"
                @click.stop="copyHistoryPrompt(p)"
              />
            </span>
          </div>
          <el-input
            v-model="historyQuery"
            size="small"
            clearable
            :prefix-icon="Search"
            placeholder="Search prompts…"
            class="ct-history-search"
          />
          <div v-if="!historyList.length" class="ct-history-empty">
            {{ historyQuery ? "No prompts match your filter." : "No prompts yet. Type a prompt and press Enter — it will show up here." }}
          </div>
          <div v-if="similarPrompts.length" class="ct-history-similar">
            <span class="ct-history-similar-label">Did you mean:</span>
            <span
              v-for="(p, i) in similarPrompts"
              :key="`sim-${i}`"
              class="ct-history-chip-text"
              :title="`${p.text} — similarity ${(p.score * 100).toFixed(0)}% · click to insert into input`"
              @click="useHistoryPrompt(p.text)"
            >{{ truncatePrompt(p.text, 60) }} <span class="ct-history-similar-score">{{ (p.score * 100).toFixed(0) }}%</span></span>
          </div>
          <div class="ct-history-rows">
            <div v-for="(p, i) in historyList" :key="`${p.realIdx}-${i}`" class="ct-history-row">
              <span class="ct-history-idx">{{ promptHistory.length - p.realIdx }}</span>
              <span class="ct-history-text" :title="p.text" @click="useHistoryPrompt(p.text)">
                <template v-for="(seg, si) in highlightSegments(p.text, historyQuery)" :key="si">
                  <mark v-if="seg.match" class="ct-skill-match">{{ seg.text }}</mark>
                  <template v-else>{{ seg.text }}</template>
                </template>
              </span>
              <div class="ct-history-actions">
                <el-button size="small" text :icon="DocumentCopy" @click="copyHistoryPrompt(p.text)" />
                <el-button size="small" text :icon="Delete" @click="removeHistoryPrompt(p.realIdx)" />
              </div>
            </div>
          </div>
          <div v-if="promptHistory.length" class="ct-history-footer">
            <el-button size="small" type="danger" text :icon="Delete" @click="confirmClearHistory">Clear all ({{ promptHistory.length }})</el-button>
          </div>
        </div>
      </el-popover>
      <!-- Skills panel (Pi-inspired: tool registry browser) -->
      <el-popover
        v-model:visible="skillsPopoverVisible"
        placement="bottom"
        :width="360"
        trigger="click"
        :title="`Skills · ${activeSkillCount} active`"
        pop-class="ct-skills-pop"
        @show="onSkillsPopoverOpen"
      >
        <template #reference>
          <el-button circle size="default" :icon="Tools" title="Skills (registered tools)" />
        </template>
        <div class="ct-skills-list">
          <!-- Global tool search (Pi-inspired: one search box filters all sections) -->
          <div class="ct-skills-search-sticky">
            <el-input
              ref="globalSearchRef"
              v-model="globalToolFilter"
              size="small"
              clearable
              :prefix-icon="Search"
              placeholder="Search all tools…  (/ focus, ↑↓ nav, PgUp/PgDn jump, Home/End ends, Enter invoke, Shift+Enter close)"
              class="ct-skills-global-search"
              @keydown="onGlobalSearchKeydown"
            />
            <div v-if="globalSearchSummary" class="ct-skills-search-summary" :class="{ 'is-empty': globalSearchSummary.total === 0 }">
              <span class="ct-skills-search-total">{{ globalSearchSummary.total }} match{{ globalSearchSummary.total === 1 ? '' : 'es' }}</span>
              <span class="ct-skills-search-split">{{ globalSearchSummary.builtin }} built-in · {{ globalSearchSummary.mcp }} MCP</span>
              <span v-if="selectionPos" class="ct-skills-search-pos">{{ selectionPos }}</span>
            </div>
          </div>
          <div v-if="similarTools.length" class="ct-skills-similar">
            <span class="ct-skills-similar-label">Did you mean:</span>
            <span
              v-for="t in similarTools"
              :key="t.name"
              class="ct-skills-similar-chip"
              :title="`Use this query instead · ${t.kind} tool (similarity ${(t.score * 100).toFixed(0)}%)`"
              @click="globalToolFilter = t.name"
            >{{ t.name }} <span class="ct-skills-similar-score">{{ (t.score * 100).toFixed(0) }}%</span></span>
          </div>
          <!-- LLM-visible prompt preview (Pi-inspired: introspect what the model sees) -->
          <div class="ct-skills-section">
            <span>LLM Prompt</span>
            <el-button
              size="small"
              text
              type="primary"
              @click="showLlmPrompt = !showLlmPrompt"
            >{{ showLlmPrompt ? 'Hide' : 'Preview' }}</el-button>
          </div>
          <div v-if="showLlmPrompt" class="ct-llm-prompt">
            <div class="ct-llm-prompt-head">
              <span class="ct-llm-prompt-meta">{{ llmPromptText ? `${llmPromptText.length} chars` : '(no tools registered)' }}</span>
              <el-button
                v-if="llmPromptText"
                size="small"
                text
                @click="copyLlmPrompt"
              >Copy</el-button>
            </div>
            <pre v-if="llmPromptText">{{ llmPromptText }}</pre>
            <div v-else class="ct-llm-prompt-empty">No tools registered — LLM has no tool context.</div>
          </div>
          <!-- MCP servers (Pi-inspired: external capability providers) -->
          <div class="ct-skills-section">
            <span>MCP Servers</span>
            <el-button
              size="small"
              text
              type="primary"
              :loading="Object.values(mcpProbe).some(s => s.status === 'probing')"
              @click="mcpServers.filter(s => s.browserReachable).forEach(probeMcp)"
            >Probe all</el-button>
          </div>
          <div
            v-for="srv in mcpServers"
            :key="srv.name"
            class="ct-skill ct-mcp"
          >
            <div class="ct-skill-head">
              <span class="ct-skill-label">{{ srv.name }}</span>
              <span class="ct-skill-name">{{ srv.type }}</span>
              <span
                class="ct-skill-tag"
                :class="srv.browserReachable ? 'ct-skill-tag--on' : 'ct-skill-tag--off'"
                :title="srv.browserReachable ? 'HTTP — browser-reachable' : 'stdio — Node-side only, not browser-reachable'"
              >{{ srv.browserReachable ? 'http' : 'local' }}</span>
              <span
                v-if="mcpProbe[srv.name]"
                class="ct-skill-tag"
                :class="{
                  'ct-skill-tag--probing': mcpProbe[srv.name].status === 'probing',
                  'ct-skill-tag--on': mcpProbe[srv.name].status === 'ok',
                  'ct-skill-tag--off': mcpProbe[srv.name].status === 'fail',
                }"
                :title="mcpProbe[srv.name].error
                  ? `${mcpProbe[srv.name].error}${mcpProbe[srv.name].latencyMs ? ' · ' + mcpProbe[srv.name].latencyMs + 'ms' : ''}`
                  : (mcpProbe[srv.name].httpStatus != null
                      ? `HTTP ${mcpProbe[srv.name].httpStatus} · ${mcpProbe[srv.name].latencyMs}ms`
                      : `${mcpProbe[srv.name].latencyMs}ms`)"
              >{{ mcpProbe[srv.name].status === 'probing' ? '…' : (mcpProbe[srv.name].status === 'ok' ? '✓' : '✗') }}</span>
              <el-button
                v-if="srv.browserReachable"
                size="small"
                text
                :loading="mcpProbe[srv.name]?.status === 'probing'"
                @click="probeMcp(srv)"
              >Test</el-button>
            </div>
            <div class="ct-skill-desc">{{ srv.description }}</div>
          </div>
          <!-- MCP tools (Pi-inspired: discover external server's tools) -->
          <div class="ct-skills-section">
            <span>MCP Tools · {{ filteredMcpTools.length }}{{ mcpToolFilter ? `/${mcpTools.length}` : "" }}<el-popover
              v-if="pinnedMcpCount"
              placement="bottom"
              trigger="click"
              :width="240"
            >
              <template #reference>
                <span class="ct-skills-pin-count ct-skills-pin-count--clickable" :title="`${pinnedMcpCount} pinned tool(s) — click to manage`"> · {{ pinnedMcpCount }}★</span>
              </template>
              <div class="ct-pin-pop">
                <div class="ct-pin-pop-head">
                  <span>Pinned MCP tools</span>
                  <div class="ct-pin-pop-actions">
                    <el-button
                      size="small"
                      text
                      :type="pinSortMode !== 'default' ? 'primary' : ''"
                      :title="`Sort: ${PIN_SORT_MODE_LABEL[pinSortMode]} — click to cycle (default → calls → recent)`"
                      @click="cyclePinSort"
                    >{{ PIN_SORT_MODE_LABEL[pinSortMode] }}</el-button>
                    <el-button size="small" text type="danger" title="Unpin all MCP tools" @click="unpinAllMcp">Unpin all</el-button>
                  </div>
                </div>
                <div v-if="pinnedMcpNames.length" class="ct-pin-spark-legend-wrap">
                  <el-button size="small" text class="ct-pin-spark-legend-toggle" :title="pinLegendCollapsed ? 'Show legend' : 'Hide legend'" @click="togglePinLegend">{{ pinLegendCollapsed ? '▸ Legend' : '▾ Legend' }}</el-button>
                  <div v-show="!pinLegendCollapsed" class="ct-pin-spark-legend">
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-success-light-3); opacity: 0.5"></i>median</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-danger-light-5); opacity: 0.6"></i>p90</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-text-color-secondary); opacity: 0.5"></i>avg</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-warning); opacity: 0.6"></i>slow threshold</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-danger)"></i>slow</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: none; border: 1px solid var(--el-color-danger); opacity: 0.8"></i>stuck (2× median)</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-success)"></i>fastest</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-primary)"></i>latest</span>
                  </div>
                </div>
                <div v-for="n in pinnedMcpNames" :key="n" class="ct-pin-pop-row" :class="{ 'ct-pin-pop-row--stale': isMcpPinStale(n) }">
                  <span class="ct-pin-pop-name">{{ n }}</span>
                  <span class="ct-pin-pop-meta">
                    <span class="ct-pin-pop-count" :title="`${mcpPinCount(n)} this session${mcpPinAvgMs(n) ? ` · avg ${mcpPinAvgMs(n)}` : ''}${mcpPinMedianMs(n) ? ` · median ${mcpPinMedianMs(n)}` : ''}${mcpPinP90Ms(n) ? ` · p90 ${mcpPinP90Ms(n)}` : ''}${mcpPinMaxMs(n) ? ` · max ${mcpPinMaxMs(n)}` : ''}${mcpPinProjectionPoint(n) ? ` · projected +10 calls ${Math.round(mcpPinProjectionPoint(n)!.ms)}ms` : ''}${mcpPinStuckSummary(n) ? ` · stuck: ${mcpPinStuckSummary(n)}` : ''}${mcpPinFailRate(n) ? ` · ${mcpPinFailRate(n)}` : ''}${isMcpPinStale(n) ? ' · stale pin (never invoked)' : ''}`">{{ mcpPinCount(n) }}<span v-if="mcpPinMedianMs(n)" class="ct-pin-pop-avg"> · {{ mcpPinMedianMs(n) }}</span><span v-else-if="mcpPinAvgMs(n)" class="ct-pin-pop-avg"> · {{ mcpPinAvgMs(n) }}</span></span>
                    <svg v-if="mcpPinSparkPath(n)" class="ct-pin-pop-spark" :width="PIN_SPARK_W" :height="PIN_SPARK_H" :viewBox="`0 0 ${PIN_SPARK_W} ${PIN_SPARK_H}`" :aria-label="`Recent latency trajectory for ${n}`" @mouseleave="setPinHover(null, null)"><line v-if="mcpPinSparkMedianY(n) >= 0" :x1="0" :x2="PIN_SPARK_W" :y1="mcpPinSparkMedianY(n)" :y2="mcpPinSparkMedianY(n)" stroke="var(--el-color-success-light-3)" stroke-width="0.4" stroke-dasharray="1.5,1.5" opacity="0.5" /><line v-if="mcpPinSparkP90Y(n) >= 0" :x1="0" :x2="PIN_SPARK_W" :y1="mcpPinSparkP90Y(n)" :y2="mcpPinSparkP90Y(n)" stroke="var(--el-color-danger-light-5)" stroke-width="0.4" stroke-dasharray="1.5,1.5" opacity="0.6" /><line v-if="mcpPinSparkAvgY(n) >= 0" :x1="0" :x2="PIN_SPARK_W" :y1="mcpPinSparkAvgY(n)" :y2="mcpPinSparkAvgY(n)" stroke="var(--el-text-color-secondary)" stroke-width="0.4" stroke-dasharray="1.5,1.5" opacity="0.5" /><line v-if="mcpPinSparkThresholdY(n) >= 0" :x1="0" :x2="PIN_SPARK_W" :y1="mcpPinSparkThresholdY(n)" :y2="mcpPinSparkThresholdY(n)" stroke="var(--el-color-warning)" stroke-width="0.5" stroke-dasharray="1,1" opacity="0.6" filter="url(#ssb-spark-glow-sm)" /><path :d="mcpPinSparkPath(n)" fill="none" stroke="var(--el-color-info)" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" /><line v-if="mcpPinProjectionPoint(n) && mcpPinSparkPoints(n).length" :x1="mcpPinSparkPoints(n)[mcpPinSparkPoints(n).length - 1].cx" :y1="mcpPinSparkPoints(n)[mcpPinSparkPoints(n).length - 1].cy" :x2="mcpPinProjectionPoint(n)!.x" :y2="mcpPinProjectionPoint(n)!.y" stroke="var(--el-color-warning-light-3)" stroke-width="0.5" stroke-dasharray="1,1" opacity="0.7" filter="url(#ssb-spark-glow-sm)" /><circle v-if="mcpPinProjectionPoint(n)" :cx="mcpPinProjectionPoint(n)!.x" :cy="mcpPinProjectionPoint(n)!.y" r="0.8" fill="var(--el-color-warning-light-3)" stroke="var(--el-bg-color)" stroke-width="0.2" filter="url(#ssb-spark-glow-sm)"><title>{{ `Projected +10 calls · ${Math.round(mcpPinProjectionPoint(n)!.ms)}ms` }}</title></circle><line v-if="pinHoverKey === n && pinHoverIdx != null && mcpPinSparkPoints(n)[pinHoverIdx]" :x1="mcpPinSparkPoints(n)[pinHoverIdx].cx" :x2="mcpPinSparkPoints(n)[pinHoverIdx].cx" :y1="0" :y2="PIN_SPARK_H" :stroke="mcpPinCrosshairColor(n)" stroke-width="0.8" stroke-dasharray="1.5,1" opacity="0.9" filter="url(#ssb-spark-glow-sm)" /><circle v-if="pinHoverKey === n && pinHoverIdx != null && mcpPinSparkPoints(n)[pinHoverIdx]" :cx="mcpPinSparkPoints(n)[pinHoverIdx].cx" :cy="0.5" r="0.8" :fill="mcpPinCrosshairColor(n)" filter="url(#ssb-spark-glow-sm)" /><circle v-if="pinHoverKey === n && pinHoverIdx != null && mcpPinSparkPoints(n)[pinHoverIdx]" :cx="mcpPinSparkPoints(n)[pinHoverIdx].cx" :cy="PIN_SPARK_H - 0.5" r="0.8" :fill="mcpPinCrosshairColor(n)" filter="url(#ssb-spark-glow-sm)" /><circle v-for="(p, i) in mcpPinSparkPoints(n)" :key="i" :cx="p.cx" :cy="p.cy" :r="p.ms >= slowThresholdMs || p.idx === mcpPinSparkMinIdx(n) || p.idx === mcpPinSparkLatestIdx(n) ? 1.3 : 0.9" :fill="p.ms >= slowThresholdMs ? 'var(--el-color-danger)' : p.idx === mcpPinSparkMinIdx(n) ? 'var(--el-color-success)' : p.idx === mcpPinSparkLatestIdx(n) ? 'var(--el-color-primary)' : 'var(--el-color-info)'" :filter="p.ms >= slowThresholdMs || p.idx === mcpPinSparkMinIdx(n) || p.idx === mcpPinSparkLatestIdx(n) ? 'url(#ssb-spark-stroke-sm)' : 'none'" /><circle v-for="idx in mcpPinStuckIndices(n)" :key="`stuck-${idx}`" :cx="mcpPinSparkPoints(n)[idx - 1].cx" :cy="mcpPinSparkPoints(n)[idx - 1].cy" r="1.8" fill="none" stroke="var(--el-color-danger)" stroke-width="0.5" opacity="0.8" pointer-events="none" filter="url(#ssb-spark-stroke-sm)" class="ct-stuck-ring"><title>{{ `Stuck call ${idx} · ${mcpPinSparkPoints(n)[idx - 1].ms}ms ≥ 2× median` }}</title></circle><rect v-for="(p, i) in mcpPinSparkPoints(n)" :key="`hit-${i}`" :x="p.cx - (mcpPinHitWidths(n)[i] ?? mcpPinHitW(n)) / 2" :y="0" :width="mcpPinHitWidths(n)[i] ?? mcpPinHitW(n)" :height="PIN_SPARK_H" fill="transparent" pointer-events="all" class="ct-pin-pop-spark-hit" @mouseenter="setPinHover(n, i)"><title>{{ `Call ${p.idx} · ${p.ms}ms${p.ms >= slowThresholdMs ? ' · slow' : p.idx === mcpPinSparkMinIdx(n) ? ' · fastest' : p.idx === mcpPinSparkLatestIdx(n) ? ' · latest' : ''}` }}</title></rect></svg>
                    <el-button size="small" text title="Unpin" @click="togglePin(n)">×</el-button>
                  </span>
                </div>
              </div>
            </el-popover></span>
            <el-button
              size="small"
              text
              type="primary"
              :loading="mcpToolsLoading"
              @click="loadMcpTools(true)"
            >Refresh</el-button>
          </div>
          <div v-if="mcpTools.length" class="ct-mcp-search">
            <el-input
              v-model="mcpToolFilter"
              size="small"
              clearable
              placeholder="Filter by name or description"
              :prefix-icon="Search"
            />
          </div>
          <div v-if="mcpToolsError" class="ct-skill ct-skill--off">
            <div class="ct-skill-desc">_(failed to list: {{ mcpToolsError }})_</div>
          </div>
          <div v-else-if="mcpToolsLoading && !mcpTools.length" class="ct-skill">
            <div class="ct-skill-desc">Loading…</div>
          </div>
          <div v-else-if="!mcpTools.length" class="ct-skill ct-skill--off">
            <div class="ct-skill-desc">_(no MCP tools)_</div>
          </div>
          <div v-else-if="!filteredMcpTools.length" class="ct-skill ct-skill--off">
            <div class="ct-skill-desc">_(no match for "{{ activeToolFilter(mcpToolFilter) }}")_</div>
          </div>
          <div
            v-for="(t, i) in filteredMcpTools"
            :key="t.name"
            class="ct-skill ct-mcp-tool"
            :class="{
              'ct-skill--broken': !!mcpToolResults[t.name]?.error,
              'ct-skill--compact': compactMode,
              'is-selected': i === selectedMcpIdx,
            }"
            :title="'Invoke via /test mcp.' + t.name"
          >
            <div class="ct-skill-head">
              <el-button
                class="ct-skill-pin"
                :class="{ 'is-pinned': pinnedTools.has(t.name) }"
                size="small"
                text
                :title="pinnedTools.has(t.name) ? 'Unpin — restore sort order' : 'Pin to top — surfaces above other MCP tools'"
                @click="togglePin(t.name)"
              >{{ pinnedTools.has(t.name) ? '★' : '☆' }}</el-button>
              <span class="ct-skill-label">
                <template v-for="(seg, si) in highlightSegments(t.name ?? '', activeToolFilter(mcpToolFilter))" :key="si">
                  <mark v-if="seg.match" class="ct-skill-match">{{ seg.text }}</mark>
                  <template v-else>{{ seg.text }}</template>
                </template>
              </span>
              <span class="ct-skill-tag ct-skill-tag--on">mcp</span>
              <el-button
                size="small"
                text
                type="primary"
                :loading="mcpToolResults[t.name]?.running"
                @click="runMcpToolInline(t)"
              >Run</el-button>
              <el-button
                v-if="getToolProps(t).length"
                size="small"
                text
                title="Reset args to schema defaults"
                @click="resetToolArgs(t)"
              >Reset</el-button>
              <el-popover
                v-if="mcpToolLastArgs[t.name]"
                placement="bottom"
                trigger="hover"
                :width="280"
                :show-after="200"
              >
                <template #reference>
                  <el-button
                    size="small"
                    text
                    type="primary"
                    title="Rerun with last args"
                    @click="rerunMcpToolLast(t)"
                  >Rerun</el-button>
                </template>
                <div class="ct-rerun-pop">
                  <div class="ct-rerun-pop-head">
                    <span>Last call</span>
                    <span
                      v-if="mcpToolResults[t.name]"
                      class="ct-rerun-pop-state"
                      :class="{
                        'ct-rerun-pop-state--ok': !mcpToolResults[t.name]?.error,
                        'ct-rerun-pop-state--err': !!mcpToolResults[t.name]?.error,
                      }"
                    >{{ mcpToolResults[t.name]?.error ? 'failed' : 'ok' }}{{ mcpToolResults[t.name]?.durationMs != null ? ` · ${mcpToolResults[t.name]?.durationMs}ms` : '' }}</span>
                  </div>
                  <div
                    v-if="mcpToolResults[t.name]?.error"
                    class="ct-rerun-pop-err"
                  >{{ mcpToolResults[t.name]?.error }}</div>
                  <pre
                    v-else-if="mcpToolResults[t.name]?.content"
                    class="ct-rerun-pop-content"
                  >{{ mcpToolResults[t.name]?.content }}</pre>
                  <div
                    v-if="mcpToolResults[t.name]?.content"
                    class="ct-rerun-pop-actions"
                  >
                    <el-button
                      size="small"
                      text
                      :icon="copiedRerunTool === t.name ? Check : (failedRerunTool === t.name ? Close : undefined)"
                      :type="copiedRerunTool === t.name ? 'success' : (failedRerunTool === t.name ? 'danger' : '')"
                      :title="copiedRerunTool === t.name ? 'Copied' : (failedRerunTool === t.name ? 'Copy failed' : 'Copy result')"
                      @click="copyMcpToolResult(mcpToolResults[t.name]!.content!, t.name)"
                    >{{ copiedRerunTool === t.name ? 'Copied' : (failedRerunTool === t.name ? 'Failed' : 'Copy') }}</el-button>
                    <el-button
                      size="small"
                      text
                      :icon="FolderChecked"
                      title="Save this tool result to the knowledge base"
                      @click="saveMcpToolResultToKB(mcpToolResults[t.name]!.content!)"
                    >Save to KB</el-button>
                  </div>
                  <div class="ct-rerun-pop-subhead">Args</div>
                  <div v-for="(val, key) in mcpToolLastArgs[t.name]" :key="key" class="ct-rerun-pop-row">
                    <span class="ct-rerun-pop-key">{{ key }}</span>
                    <code class="ct-rerun-pop-val">{{ val }}</code>
                  </div>
                </div>
              </el-popover>
              <el-button
                v-if="getToolSchemaJson(t)"
                size="small"
                text
                class="ct-skill-meta-toggle"
                :class="{ 'is-open': expandedMcpTools.has(t.name) }"
                title="Toggle input_schema preview"
                @click="toggleMcpToolExpand(t.name)"
              >{{ expandedMcpTools.has(t.name) ? '−' : '+' }}</el-button>
            </div>
            <div class="ct-skill-desc">
              <template v-for="(seg, si) in highlightSegments(t.description || '(no description)', activeToolFilter(mcpToolFilter))" :key="si">
                <mark v-if="seg.match" class="ct-skill-match">{{ seg.text }}</mark>
                <template v-else>{{ seg.text }}</template>
              </template>
            </div>
            <div v-if="expandedMcpTools.has(t.name) && getToolSchemaJson(t)" class="ct-skill-meta">
              <div class="ct-skill-meta-row">
                <span class="ct-skill-meta-key">schema</span>
                <code>{{ getToolSchemaJson(t) }}</code>
              </div>
            </div>
            <div
              v-if="mcpToolResults[t.name] && !mcpToolResults[t.name].running && mcpToolResults[t.name].count"
              class="ct-skill-lastcall"
              :class="{ 'ct-skill-lastcall--err': !!mcpToolResults[t.name].error }"
              :title="`Last invoked: ${new Date(mcpToolResults[t.name].at ?? 0).toLocaleString()}`"
            >
              <span class="ct-skill-lastcall-dot" />
              <span v-if="mcpToolResults[t.name].at">{{ formatRelativeTime(mcpToolResults[t.name].at!) }}</span>
              <span v-if="mcpToolResults[t.name].durationMs != null" class="ct-skill-lastcall-ms">· {{ mcpToolResults[t.name].durationMs }}ms</span>
              <span v-if="mcpToolResults[t.name].error" class="ct-skill-lastcall-err">· failed</span>
              <span class="ct-skill-lastcall-count" :title="`Called ${mcpToolResults[t.name].count} time(s) this session`">· ×{{ mcpToolResults[t.name].count }}</span>
            </div>
            <!-- Schema-driven args editor (Pi-inspired: introspect tool's input_schema) -->
            <div
              v-if="getToolProps(t).length"
              class="ct-mcp-args"
            >
              <div
                v-for="prop in getToolProps(t)"
                :key="prop.name"
                class="ct-mcp-arg"
              >
                <label class="ct-mcp-arg-label">
                  <span class="ct-mcp-arg-name">{{ prop.name }}</span>
                  <span class="ct-mcp-arg-type">{{ prop.type }}</span>
                  <span v-if="prop.required" class="ct-mcp-arg-req" title="required">*</span>
                </label>
                <el-input
                  v-if="prop.type === 'object' || prop.type === 'array'"
                  v-model="ensureToolArgs(t)[prop.name]"
                  type="textarea"
                  :rows="2"
                  :placeholder="prop.description || (prop.type === 'object' ? '{ ... }' : '[ ... ]')"
                  size="small"
                />
                <el-input
                  v-else
                  v-model="ensureToolArgs(t)[prop.name]"
                  :placeholder="prop.description || prop.type"
                  size="small"
                />
              </div>
            </div>
            <div
              v-if="mcpToolResults[t.name] && !mcpToolResults[t.name].running"
              class="ct-mcp-result"
              :class="{ 'ct-mcp-result--err': !!mcpToolResults[t.name].error }"
            >
              <div class="ct-mcp-result-meta">
                <span v-if="mcpToolResults[t.name].durationMs != null">{{ mcpToolResults[t.name].durationMs }}ms</span>
                <span v-if="mcpToolResults[t.name].error" class="ct-mcp-result-err">{{ mcpToolResults[t.name].error }}</span>
              </div>
              <pre v-if="mcpToolResults[t.name].content">{{ mcpToolResults[t.name].content }}</pre>
            </div>
          </div>

          <!-- Built-in tool registry -->
          <div class="ct-skills-section">
            <span>Tools · {{ activeSkillCount }} active<span v-if="builtinToolFilter" class="ct-skills-filter-count"> ({{ visibleSkills.length }}/{{ sortedSkills.length }} match)</span><el-popover
              v-if="pinnedBuiltinCount"
              placement="bottom"
              trigger="click"
              :width="240"
            >
              <template #reference>
                <span class="ct-skills-pin-count ct-skills-pin-count--clickable" :title="`${pinnedBuiltinCount} pinned tool(s) — click to manage`"> · {{ pinnedBuiltinCount }}★</span>
              </template>
              <div class="ct-pin-pop">
                <div class="ct-pin-pop-head">
                  <span>Pinned built-in tools</span>
                  <div class="ct-pin-pop-actions">
                    <el-button
                      size="small"
                      text
                      :type="pinSortMode !== 'default' ? 'primary' : ''"
                      :title="`Sort: ${PIN_SORT_MODE_LABEL[pinSortMode]} — click to cycle (default → calls → recent)`"
                      @click="cyclePinSort"
                    >{{ PIN_SORT_MODE_LABEL[pinSortMode] }}</el-button>
                    <el-button size="small" text type="danger" title="Unpin all built-in tools" @click="unpinAllBuiltin">Unpin all</el-button>
                  </div>
                </div>
                <div v-if="pinnedBuiltinNames.length" class="ct-pin-spark-legend-wrap">
                  <el-button size="small" text class="ct-pin-spark-legend-toggle" :title="pinLegendCollapsed ? 'Show legend' : 'Hide legend'" @click="togglePinLegend">{{ pinLegendCollapsed ? '▸ Legend' : '▾ Legend' }}</el-button>
                  <div v-show="!pinLegendCollapsed" class="ct-pin-spark-legend">
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-success-light-3); opacity: 0.5"></i>median</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-danger-light-5); opacity: 0.6"></i>p90</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-text-color-secondary); opacity: 0.5"></i>avg</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-warning); opacity: 0.6"></i>slow threshold</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-danger)"></i>slow</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: none; border: 1px solid var(--el-color-danger); opacity: 0.8"></i>stuck (2× median)</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-success)"></i>fastest</span>
                    <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-primary)"></i>latest</span>
                  </div>
                </div>
                <div v-for="n in pinnedBuiltinNames" :key="n" class="ct-pin-pop-row" :class="{ 'ct-pin-pop-row--stale': isBuiltinPinStale(n) }">
                  <span class="ct-pin-pop-name">{{ n }}</span>
                  <span class="ct-pin-pop-meta">
                    <span class="ct-pin-pop-count" :title="`${builtinPinCount(n)} this session${builtinPinAvgMs(n) ? ` · avg ${builtinPinAvgMs(n)}` : ''}${builtinPinMedianMs(n) ? ` · median ${builtinPinMedianMs(n)}` : ''}${builtinPinP90Ms(n) ? ` · p90 ${builtinPinP90Ms(n)}` : ''}${builtinPinMaxMs(n) ? ` · max ${builtinPinMaxMs(n)}` : ''}${builtinPinProjectionPoint(n) ? ` · projected +10 calls ${Math.round(builtinPinProjectionPoint(n)!.ms)}ms` : ''}${builtinPinStuckSummary(n) ? ` · stuck: ${builtinPinStuckSummary(n)}` : ''}${builtinPinFailRate(n) ? ` · ${builtinPinFailRate(n)}` : ''}${isBuiltinPinStale(n) ? ' · stale pin (never invoked)' : ''}`">{{ builtinPinCount(n) }}<span v-if="builtinPinMedianMs(n)" class="ct-pin-pop-avg"> · {{ builtinPinMedianMs(n) }}</span><span v-else-if="builtinPinAvgMs(n)" class="ct-pin-pop-avg"> · {{ builtinPinAvgMs(n) }}</span></span>
                    <svg v-if="builtinPinSparkPath(n)" class="ct-pin-pop-spark" :width="PIN_SPARK_W" :height="PIN_SPARK_H" :viewBox="`0 0 ${PIN_SPARK_W} ${PIN_SPARK_H}`" :aria-label="`Recent latency trajectory for ${n}`" @mouseleave="setPinHover(null, null)"><line v-if="builtinPinSparkMedianY(n) >= 0" :x1="0" :x2="PIN_SPARK_W" :y1="builtinPinSparkMedianY(n)" :y2="builtinPinSparkMedianY(n)" stroke="var(--el-color-success-light-3)" stroke-width="0.4" stroke-dasharray="1.5,1.5" opacity="0.5" /><line v-if="builtinPinSparkP90Y(n) >= 0" :x1="0" :x2="PIN_SPARK_W" :y1="builtinPinSparkP90Y(n)" :y2="builtinPinSparkP90Y(n)" stroke="var(--el-color-danger-light-5)" stroke-width="0.4" stroke-dasharray="1.5,1.5" opacity="0.6" /><line v-if="builtinPinSparkAvgY(n) >= 0" :x1="0" :x2="PIN_SPARK_W" :y1="builtinPinSparkAvgY(n)" :y2="builtinPinSparkAvgY(n)" stroke="var(--el-text-color-secondary)" stroke-width="0.4" stroke-dasharray="1.5,1.5" opacity="0.5" /><line v-if="builtinPinSparkThresholdY(n) >= 0" :x1="0" :x2="PIN_SPARK_W" :y1="builtinPinSparkThresholdY(n)" :y2="builtinPinSparkThresholdY(n)" stroke="var(--el-color-warning)" stroke-width="0.5" stroke-dasharray="1,1" opacity="0.6" filter="url(#ssb-spark-glow-sm)" /><path :d="builtinPinSparkPath(n)" fill="none" stroke="var(--el-color-info)" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" /><line v-if="builtinPinProjectionPoint(n) && builtinPinSparkPoints(n).length" :x1="builtinPinSparkPoints(n)[builtinPinSparkPoints(n).length - 1].cx" :y1="builtinPinSparkPoints(n)[builtinPinSparkPoints(n).length - 1].cy" :x2="builtinPinProjectionPoint(n)!.x" :y2="builtinPinProjectionPoint(n)!.y" stroke="var(--el-color-warning-light-3)" stroke-width="0.5" stroke-dasharray="1,1" opacity="0.7" filter="url(#ssb-spark-glow-sm)" /><circle v-if="builtinPinProjectionPoint(n)" :cx="builtinPinProjectionPoint(n)!.x" :cy="builtinPinProjectionPoint(n)!.y" r="0.8" fill="var(--el-color-warning-light-3)" stroke="var(--el-bg-color)" stroke-width="0.2" filter="url(#ssb-spark-glow-sm)"><title>{{ `Projected +10 calls · ${Math.round(builtinPinProjectionPoint(n)!.ms)}ms` }}</title></circle><line v-if="pinHoverKey === n && pinHoverIdx != null && builtinPinSparkPoints(n)[pinHoverIdx]" :x1="builtinPinSparkPoints(n)[pinHoverIdx].cx" :x2="builtinPinSparkPoints(n)[pinHoverIdx].cx" :y1="0" :y2="PIN_SPARK_H" :stroke="builtinPinCrosshairColor(n)" stroke-width="0.8" stroke-dasharray="1.5,1" opacity="0.9" filter="url(#ssb-spark-glow-sm)" /><circle v-if="pinHoverKey === n && pinHoverIdx != null && builtinPinSparkPoints(n)[pinHoverIdx]" :cx="builtinPinSparkPoints(n)[pinHoverIdx].cx" :cy="0.5" r="0.8" :fill="builtinPinCrosshairColor(n)" filter="url(#ssb-spark-glow-sm)" /><circle v-if="pinHoverKey === n && pinHoverIdx != null && builtinPinSparkPoints(n)[pinHoverIdx]" :cx="builtinPinSparkPoints(n)[pinHoverIdx].cx" :cy="PIN_SPARK_H - 0.5" r="0.8" :fill="builtinPinCrosshairColor(n)" filter="url(#ssb-spark-glow-sm)" /><circle v-for="(p, i) in builtinPinSparkPoints(n)" :key="i" :cx="p.cx" :cy="p.cy" :r="p.ms >= slowThresholdMs || p.idx === builtinPinSparkMinIdx(n) || p.idx === builtinPinSparkLatestIdx(n) ? 1.3 : 0.9" :fill="p.ms >= slowThresholdMs ? 'var(--el-color-danger)' : p.idx === builtinPinSparkMinIdx(n) ? 'var(--el-color-success)' : p.idx === builtinPinSparkLatestIdx(n) ? 'var(--el-color-primary)' : 'var(--el-color-info)'" :filter="p.ms >= slowThresholdMs || p.idx === builtinPinSparkMinIdx(n) || p.idx === builtinPinSparkLatestIdx(n) ? 'url(#ssb-spark-stroke-sm)' : 'none'" /><circle v-for="idx in builtinPinStuckIndices(n)" :key="`stuck-${idx}`" :cx="builtinPinSparkPoints(n)[idx - 1].cx" :cy="builtinPinSparkPoints(n)[idx - 1].cy" r="1.8" fill="none" stroke="var(--el-color-danger)" stroke-width="0.5" opacity="0.8" pointer-events="none" filter="url(#ssb-spark-stroke-sm)" class="ct-stuck-ring"><title>{{ `Stuck call ${idx} · ${builtinPinSparkPoints(n)[idx - 1].ms}ms ≥ 2× median` }}</title></circle><rect v-for="(p, i) in builtinPinSparkPoints(n)" :key="`hit-${i}`" :x="p.cx - (builtinPinHitWidths(n)[i] ?? builtinPinHitW(n)) / 2" :y="0" :width="builtinPinHitWidths(n)[i] ?? builtinPinHitW(n)" :height="PIN_SPARK_H" fill="transparent" pointer-events="all" class="ct-pin-pop-spark-hit" @mouseenter="setPinHover(n, i)"><title>{{ `Call ${p.idx} · ${p.ms}ms${p.ms >= slowThresholdMs ? ' · slow' : p.idx === builtinPinSparkMinIdx(n) ? ' · fastest' : p.idx === builtinPinSparkLatestIdx(n) ? ' · latest' : ''}` }}</title></rect></svg>
                    <el-button size="small" text title="Unpin" @click="togglePin(n)">×</el-button>
                  </span>
                </div>
              </div>
            </el-popover>
            </span>
            <el-button
              class="ct-skills-sort-toggle"
              size="small"
              text
              :title="`Sort: ${skillSortMode} — click to cycle (registry → calls → recent)`"
              @click="cycleSkillSortMode"
            >{{ skillSortLabel[skillSortMode] }}</el-button>
            <el-button
              class="ct-skills-compact-toggle"
              :class="{ 'is-active': compactMode }"
              size="small"
              text
              :title="compactMode ? 'Compact view — click to show descriptions and stats' : 'Full view — click to collapse to one-line per tool'"
              @click="compactMode = !compactMode"
            >{{ compactMode ? '▤' : '▥' }}</el-button>
          </div>
          <div class="ct-mcp-search">
            <el-input
              v-model="builtinToolFilter"
              size="small"
              clearable
              placeholder="Filter by name or description"
              :prefix-icon="Search"
            />
          </div>
          <div v-if="!visibleSkills.length && activeToolFilter(builtinToolFilter)" class="ct-skill ct-skill--off">
            <div class="ct-skill-desc">_(no match for "{{ activeToolFilter(builtinToolFilter) }}")_</div>
          </div>
          <div
            v-for="(tool, i) in visibleSkills"
            :key="tool.name"
            class="ct-skill"
            :class="{
              'ct-skill--off': tool.enabled === false,
              'ct-skill--broken': !!toolLastCalls[tool.name]?.error,
              'ct-skill--compact': compactMode,
              'is-selected': i === selectedBuiltinIdx,
            }"
          >
            <div class="ct-skill-head">
              <el-button
                class="ct-skill-pin"
                :class="{ 'is-pinned': pinnedTools.has(tool.name) }"
                size="small"
                text
                :title="pinnedTools.has(tool.name) ? 'Unpin — restore sort order' : 'Pin to top — surfaces above other tools'"
                @click="togglePin(tool.name)"
              >{{ pinnedTools.has(tool.name) ? '★' : '☆' }}</el-button>
              <span class="ct-skill-label">
                <template v-for="(seg, si) in highlightSegments(tool.label ?? '', activeToolFilter(builtinToolFilter))" :key="si">
                  <mark v-if="seg.match" class="ct-skill-match">{{ seg.text }}</mark>
                  <template v-else>{{ seg.text }}</template>
                </template>
              </span>
              <span class="ct-skill-name">
                <template v-for="(seg, si) in highlightSegments(tool.name ?? '', activeToolFilter(builtinToolFilter))" :key="si">
                  <mark v-if="seg.match" class="ct-skill-match">{{ seg.text }}</mark>
                  <template v-else>{{ seg.text }}</template>
                </template>
              </span>
              <span v-if="tool.preStream" class="ct-skill-tag ct-skill-tag--pre" title="Runs before AI responds">pre</span>
              <span v-if="tool.enabled === false" class="ct-skill-tag ct-skill-tag--off" title="Disabled — toggle via RAG / Web pills">off</span>
              <span v-else class="ct-skill-tag ct-skill-tag--on" title="Enabled">on</span>
              <el-button
                v-if="hasToolPromptMeta(tool)"
                size="small"
                text
                class="ct-skill-meta-toggle"
                :class="{ 'is-open': expandedTools.has(tool.name) }"
                @click="toggleToolExpand(tool.name)"
              >{{ expandedTools.has(tool.name) ? '−' : '+' }}</el-button>
            </div>
            <div class="ct-skill-desc">
              <template v-for="(seg, si) in highlightSegments(tool.description ?? '', activeToolFilter(builtinToolFilter))" :key="si">
                <mark v-if="seg.match" class="ct-skill-match">{{ seg.text }}</mark>
                <template v-else>{{ seg.text }}</template>
              </template>
            </div>
            <div
              v-if="toolLastCalls[tool.name]"
              class="ct-skill-lastcall"
              :class="{ 'ct-skill-lastcall--err': !!toolLastCalls[tool.name].error }"
              :title="`Last invoked: ${new Date(toolLastCalls[tool.name].ts).toLocaleString()}${toolLastCalls[tool.name].error ? ' · error: ' + toolLastCalls[tool.name].error : ''}`"
            >
              <span class="ct-skill-lastcall-dot" />
              <span>{{ formatRelativeTime(toolLastCalls[tool.name].ts) }}</span>
              <span v-if="toolLastCalls[tool.name].durationMs != null" class="ct-skill-lastcall-ms" :class="{ 'ct-skill-lastcall-ms--slow': toolLastCalls[tool.name].maxMs != null && toolLastCalls[tool.name].durationMs! > toolLastCalls[tool.name].maxMs! * 1.5 }">· {{ toolLastCalls[tool.name].durationMs }}ms</span>
              <span v-if="toolLastCalls[tool.name].error" class="ct-skill-lastcall-err">· failed</span>
              <span class="ct-skill-lastcall-count" :title="`Called ${toolLastCalls[tool.name].count} time(s) this session${toolLastCalls[tool.name].avgMs != null ? ' · avg ' + toolLastCalls[tool.name].avgMs + 'ms' : ''}${toolLastCalls[tool.name].maxMs != null ? ' · max ' + toolLastCalls[tool.name].maxMs + 'ms' : ''}`">· ×{{ toolLastCalls[tool.name].count }}<template v-if="toolLastCalls[tool.name].avgMs != null"> · {{ toolLastCalls[tool.name].avgMs }}ms avg</template><template v-if="toolLastCalls[tool.name].maxMs != null"> · {{ toolLastCalls[tool.name].maxMs }}ms max</template></span>
            </div>
            <div v-if="expandedTools.has(tool.name) && hasToolPromptMeta(tool)" class="ct-skill-meta">
              <div v-if="tool.promptSnippet" class="ct-skill-meta-row">
                <span class="ct-skill-meta-key">snippet</span>
                <code>{{ tool.promptSnippet }}</code>
              </div>
              <div v-if="tool.promptGuidelines?.length" class="ct-skill-meta-row">
                <span class="ct-skill-meta-key">guidelines</span>
                <ul class="ct-skill-meta-list">
                  <li v-for="(g, gi) in tool.promptGuidelines" :key="gi">{{ g }}</li>
                </ul>
              </div>
            </div>
          </div>
          <div v-if="!allSkills.length" class="ct-skills-empty">
            No tools registered
          </div>
          <div class="ct-skills-summary">
            <span class="ct-skills-summary-item" title="Active tools — enabled in the registry">
              <span class="ct-skills-summary-num">{{ toolStats.active }}</span> active
            </span>
            <span class="ct-skills-summary-sep">·</span>
            <span
              class="ct-skills-summary-item"
              :title="`${toolStats.ok} succeeded, ${toolStats.failed} failed this session${toolStats.mcpTotal ? ' · ' + toolStats.mcpTotal + ' via MCP' : ''}`"
            >
              <span class="ct-skills-summary-num">{{ toolStats.total }}</span> calls
              <span v-if="toolStats.mcpTotal" class="ct-skills-summary-breakdown" :title="`${toolStats.builtinTotal} built-in · ${toolStats.mcpTotal} MCP`">({{ toolStats.builtinTotal }}+{{ toolStats.mcpTotal }})</span>
            </span>
            <span v-if="toolStats.avgMs != null" class="ct-skills-summary-item" title="Average duration per call">
              · <span class="ct-skills-summary-num">{{ toolStats.avgMs }}</span>ms avg
            </span>
            <span
              v-if="toolStats.failed"
              class="ct-skills-summary-item ct-skills-summary-item--err"
              :class="{ 'ct-skills-summary-item--warn': toolStats.total > 0 && (toolStats.failed / toolStats.total) < 0.25 }"
              :title="`${toolStats.failed} of ${toolStats.total} calls failed this session`"
            >
              · <span class="ct-skills-summary-num">{{ toolStats.failed }}</span> failed
              <span v-if="toolStats.total > 0" class="ct-skills-summary-pct">({{ Math.round((toolStats.failed / toolStats.total) * 100) }}%)</span>
            </span>
            <el-button
              class="ct-skills-summary-copy"
              :class="{ 'is-copied': copiedTelemetry }"
              size="small"
              text
              :icon="copiedTelemetry ? Check : DocumentCopy"
              :type="copiedTelemetry ? 'success' : ''"
              :title="copiedTelemetry ? 'Copied telemetry summary' : 'Copy telemetry summary as text'"
              @click="copyTelemetrySummary"
            >{{ copiedTelemetry ? 'Copied' : 'Copy' }}</el-button>
            <el-button
              class="ct-skills-summary-save"
              size="small"
              text
              :icon="FolderChecked"
              title="Save telemetry summary to the knowledge base"
              @click="saveTelemetryToKB"
            >Save to KB</el-button>
          </div>
          <div v-if="topTools.length" class="ct-skills-top">
            <span class="ct-skills-top-label">Top:</span>
            <span
              v-for="t in topTools"
              :key="t.kind + ':' + t.name"
              class="ct-skills-top-chip"
              :class="`ct-skills-top-chip--${t.kind}`"
              :title="`${t.label} — called ${t.count} time(s) this session`"
            >
              <span class="ct-skills-top-name">{{ t.name }}</span>
              <span class="ct-skills-top-count">×{{ t.count }}</span>
            </span>
          </div>
          <div v-if="lastToolEvent" class="ct-skills-last">
            Last: {{ lastToolEvent.label }} · {{ lastToolEvent.phase === 'start' ? 'running' : (lastToolEvent.error ? 'error' : 'done') }}
          </div>
        </div>
      </el-popover>
      <el-tooltip content="Upload image" placement="bottom">
        <el-button circle size="default" :icon="Picture" :disabled="sending" @click="emit('pick-image')" />
      </el-tooltip>
      <el-tooltip content="WeCom bot settings" placement="bottom">
        <el-button circle size="default" :icon="ChatDotRound" @click="emit('open-wechat')" />
      </el-tooltip>
    </div>
    <div class="ct-right">
      <!-- Pills group: status toggles -->
      <div class="ct-pills-group">
        <el-popover
          v-if="contextFileCount > 0"
          v-model:visible="contextPopoverVisible"
          placement="bottom"
          :width="420"
          trigger="click"
        >
          <template #reference>
            <div class="ct-pill on" title="Current context files">
              <el-icon :size="14"><CollectionTag /></el-icon>
              <span class="ct-pill-label">Context: {{ contextFileCount }}</span>
            </div>
          </template>
          <div class="ct-context-list">
            <div
              v-for="file in (contextFiles ?? [])"
              :key="file"
              class="ct-context-item"
            >
              <span class="ct-context-item-path" title="Click to preview" @click="handleFileClick(file)">{{ file }}</span>
              <el-button
                size="small"
                text
                type="danger"
                :icon="Delete"
                title="Remove from context"
                @click="emit('remove-context-file', file)"
              />
            </div>
            <div v-if="(contextFiles ?? []).length === 0" class="ct-context-empty">
              No context files loaded
            </div>
          </div>
        </el-popover>
        <div
          class="ct-pill" :class="{ on: webSearchToggle }"
          :title="webSearchToggle ? 'Web search on — ' + (store.activeTools.find(t => t.name === 'web_search')?.promptSnippet || 'answers include internet results') : 'Web search off — toggle to search the web'"
          @click="emit('toggle-web-search')"
        >
          <el-icon :size="14"><Search /></el-icon>
          <span class="ct-pill-label">Web</span>
          <el-switch :model-value="webSearchToggle" size="small" @click.stop @update:model-value="emit('toggle-web-search')" />
        </div>
        <div
          class="ct-pill" :class="{ on: ragToggle }"
          :title="ragToggle ? 'RAG on — ' + (store.activeTools.find(t => t.name === 'rag_search')?.promptSnippet || 'answers grounded in context files') : 'RAG off — direct chat'"
          @click="emit('toggle-rag')"
        >
          <span class="ct-pill-label">RAG</span>
          <el-switch :model-value="ragToggle" size="small" @click.stop @update:model-value="emit('toggle-rag')" />
        </div>
        <div
          class="ct-pill" :class="{ on: props.agentMode }"
          :title="props.agentMode ? 'Agent mode on — multi-turn tool calling with observability' : 'Agent mode off — direct chat'"
          @click="emit('toggle-agent')"
        >
          <el-icon :size="14"><Cpu /></el-icon>
          <span class="ct-pill-label">Agent</span>
          <el-switch :model-value="props.agentMode" size="small" @click.stop @update:model-value="emit('toggle-agent')" />
        </div>
        <div v-if="props.agentMode" class="ct-pill ct-pill--max-turns" title="Max tool-calling turns per message">
          <span class="ct-pill-label">Turns</span>
          <el-input-number
            :model-value="props.agentMaxTurns ?? 10"
            :min="1"
            :max="20"
            :step="1"
            size="small"
            controls-position="right"
            style="width: 72px"
            @update:model-value="emit('update-agent-max-turns', $event as number)"
          />
        </div>
        <div v-if="props.agentMode" class="ct-pill ct-pill--sys-prompt" title="Customize agent system prompt">
          <el-icon :size="14" @click="showSysPromptEditor = true"><Edit /></el-icon>
        </div>
        <div v-if="props.agentMode" class="ct-pill ct-pill--model-rotation" :title="props.agentModelRotation?.length ? `Model rotation: ${props.agentModelRotation.join(' → ')}` : 'Configure model rotation between turns'">
          <el-icon :size="14" @click="openModelRotationEditor"><Refresh /></el-icon>
          <span v-if="props.agentModelRotation?.length" class="ct-pill-label">{{ props.agentModelRotation.length }}⇄</span>
        </div>
        <!-- Agent system prompt editor dialog -->
        <el-dialog
          v-model="showSysPromptEditor"
          title="Agent System Prompt"
          width="560px"
          :close-on-click-modal="false"
        >
          <el-input
            v-model="sysPromptDraft"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 12 }"
            placeholder="Custom system prompt for the agent (e.g. 'You are a senior software engineer...')"
          />
          <template #footer>
            <el-button @click="showSysPromptEditor = false">Cancel</el-button>
            <el-button type="primary" @click="saveSysPrompt">Save</el-button>
          </template>
        </el-dialog>
        <!-- Agent model rotation editor dialog (Pi: prepareNextTurn) -->
        <el-dialog
          v-model="showModelRotationEditor"
          title="Agent Model Rotation"
          width="480px"
          :close-on-click-modal="false"
        >
          <p class="ct-dialog-hint">Comma-separated model names to rotate between turns. The agent switches to the next model after each turn. Leave empty to use a single model.</p>
          <el-input
            v-model="modelRotationDraft"
            placeholder="e.g. qwen3.5, qwen3.5-think, qwen3.5"
          />
          <template #footer>
            <el-button @click="showModelRotationEditor = false">Cancel</el-button>
            <el-button type="primary" @click="saveModelRotation">Save</el-button>
          </template>
        </el-dialog>
      </div>
      <!-- RAG override chips — collapsible sub-row -->
      <div v-if="ragToggle" class="ct-rag-options" :class="{ 'is-expanded': ragOptionsExpanded }">
        <button
          class="ct-mini ct-rag-toggle"
          :title="ragOptionsExpanded ? 'Collapse RAG options' : 'Expand RAG options'"
          @click="ragOptionsExpanded = !ragOptionsExpanded"
        >{{ ragOptionsExpanded ? '◂' : '▸' }}</button>
        <template v-if="ragOptionsExpanded">
          <button
            class="ct-mini" :class="{ on: ragHybrid }"
            title="Hybrid: vector + BM25 reciprocal-rank fusion (auto-disabled when scope is active)"
            @click="emit('toggle-rag-hybrid')"
          >hybrid</button>
          <button
            class="ct-mini" :class="{ on: ragRerank }"
            title="Rerank: LLMRerank postprocessor (extra LLM call, trims top-k)"
            @click="emit('toggle-rag-rerank')"
          >rerank</button>
          <button
            class="ct-mini" :class="{ on: ragCitations }"
            title="Citations: prepend [Source N] to each chunk"
            @click="emit('toggle-rag-citations')"
          >citations</button>
          <button
            v-if="ragHybrid"
            class="ct-mini"
            :class="{ on: ragNumQueries && ragNumQueries > 1 }"
            :title="`Query variants: ${ragNumQueries} (LLM query expansion, only applied without scope)`"
            @click="emit('cycle-rag-num-queries')"
          >Q×{{ ragNumQueries }}</button>
          <el-popover
            v-model:visible="chatModePopoverVisible"
            placement="bottom"
            :width="280"
            trigger="click"
            title="Chat engine mode"
          >
            <template #reference>
              <button
                class="ct-mini ct-mini--mode"
                :title="`llama_index ChatEngine: ${ragChatMode}`"
              >{{ chatModeLabel }}</button>
            </template>
            <div class="ct-mode-list">
              <button
                v-for="opt in chatModeOptions"
                :key="opt.value"
                class="ct-mode-item"
                :class="{ on: opt.value === ragChatMode }"
                @click="selectChatMode(opt.value)"
              >
                <span class="ct-mode-item-label">{{ opt.label }}</span>
                <span class="ct-mode-item-desc">{{ opt.desc }}</span>
              </button>
            </div>
          </el-popover>
          <el-popover
            v-model:visible="filtersPopoverVisible"
            placement="bottom"
            :width="320"
            trigger="click"
            title="KB metadata filters"
            @show="onFiltersPopoverOpen"
          >
            <template #reference>
              <button
                class="ct-mini"
                :class="{ on: hasMetaFilter }"
                :title="hasMetaFilter
                  ? `Filtering by category='${props.ragCategory || '(any)'}', tags=[${(props.ragTags ?? []).join(', ')}] — hybrid auto-disabled`
                  : 'Narrow retrieval by frontmatter category / tags (disables hybrid)'"
              >filter{{ filterActiveCount ? `·${filterActiveCount}` : "" }}</button>
            </template>
            <div class="ct-filter-body">
              <div v-if="filtersLoading && !filtersLoaded" class="ct-filter-loading">Loading…</div>
              <template v-else>
                <div class="ct-filter-row">
                  <label class="ct-filter-label">Category</label>
                  <el-select
                    :model-value="props.ragCategory || ''"
                    size="small"
                    clearable
                    placeholder="(any category)"
                    style="width: 100%;"
                    @update:model-value="v => emit('update-rag-category', (v as string) || '')"
                  >
                    <el-option
                      v-for="cat in kbCategories"
                      :key="cat.name"
                      :label="`${cat.name} (${cat.file_count})`"
                      :value="cat.name"
                    />
                  </el-select>
                </div>
                <div class="ct-filter-row">
                  <label class="ct-filter-label">Tags <span class="ct-filter-hint">(AND-combined, max 50)</span></label>
                  <el-select
                    :model-value="(props.ragTags ?? []) as string[]"
                    size="small"
                    multiple
                    clearable
                    filterable
                    placeholder="(any tags)"
                    style="width: 100%;"
                    @update:model-value="v => emit('update-rag-tags', (v as string[]) || [])"
                  >
                    <el-option
                      v-for="t in tagOptions"
                      :key="t.name"
                      :label="`${t.name} (${t.count})`"
                      :value="t.name"
                    />
                  </el-select>
                </div>
                <div v-if="hasMetaFilter" class="ct-filter-warn">
                  ⚠ Hybrid auto-disabled — BM25 doesn't support metadata filters
                </div>
                <div class="ct-filter-actions">
                  <el-button size="small" text @click="clearFilters">Clear</el-button>
                </div>
              </template>
            </div>
          </el-popover>
        </template>
      </div>
      <!-- Running tools indicator -->
      <div v-for="tool in runningTools" :key="tool.name" class="ct-pill on" :title="`Running: ${tool.label}`">
        <el-icon :size="14" class="ct-spin"><Loading /></el-icon>
        <span class="ct-pill-label">{{ tool.label }}</span>
      </div>
      <RequestStatusButton :sending="sending" :streaming-type="streamingType" @stop="emit('stop')" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ct-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 6px 12px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ct-left, .ct-right {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

// ── Pills group (status toggles) ──
.ct-pills-group {
  display: flex;
  gap: 6px;
  align-items: center;
}

// ── Status pills ──
.ct-pill {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 14px;
  transition: all .15s;
  &:hover { border-color: var(--el-border-color); }
  &.on {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
.ct-spin { animation: ct-spin 1s linear infinite; }
@keyframes ct-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.ct-pill-label { line-height: 1; }
.ct-pill--max-turns {
  cursor: default;
  gap: 4px;
  padding: 0 6px;
  &:hover { border-color: var(--el-border-color-light); }
}

// ── RAG override options (collapsible sub-row) ──
.ct-rag-options {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 2px 8px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: all .15s;
  &.is-expanded {
    padding: 2px 8px;
  }
}
.ct-rag-toggle {
  font-size: 10px;
  padding: 0 6px;
  min-width: 22px;
  letter-spacing: 0;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}

// ── Per-call retrieval override chips ──
.ct-mini {
  height: 22px;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  font-family: "SF Mono", Menlo, monospace;
  letter-spacing: .3px;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 11px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: color .12s, background .12s, border-color .12s;
  &:hover {
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
  }
  &.on {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
.ct-mini--mode { min-width: 70px; text-align: center; }

// ── KB metadata filters popover (llama_index MetadataFilters) ──
.ct-filter-body { display: flex; flex-direction: column; gap: 8px; padding: 2px; }
.ct-filter-row { display: flex; flex-direction: column; gap: 4px; }
.ct-filter-label {
  font-size: 11px; font-weight: 600; color: var(--el-text-color-secondary);
  display: flex; gap: 4px; align-items: baseline;
}
.ct-filter-hint { font-size: 10px; font-weight: 400; color: var(--el-text-color-placeholder); }
.ct-filter-loading { padding: 12px 0; font-size: 12px; color: var(--el-text-color-placeholder); text-align: center; }
.ct-filter-warn {
  font-size: 10px; padding: 4px 6px; border-radius: 4px;
  background: var(--el-color-warning-light-9); color: var(--el-color-warning);
  border: 1px solid var(--el-color-warning-light-7);
}
.ct-filter-actions { display: flex; justify-content: flex-end; gap: 4px; }

// ── Chat-engine mode picker popover (llama_index ChatEngine selector) ──
.ct-mode-list { display: flex; flex-direction: column; gap: 4px; padding: 2px; }
.ct-mode-item {
  display: flex; flex-direction: column; gap: 2px;
  padding: 6px 8px; text-align: left; cursor: pointer;
  background: transparent; border: 1px solid transparent; border-radius: 6px;
  transition: background .12s, border-color .12s;
  &:hover { background: var(--el-fill-color-light); }
  &.on { background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-5); }
}
.ct-mode-item-label {
  font-family: "SF Mono", Menlo, monospace; font-size: 11px; font-weight: 700;
  color: var(--el-text-color-primary);
}
.ct-mode-item-desc {
  font-size: 10px; line-height: 1.4;
  color: var(--el-text-color-secondary);
}
.ct-context-list { max-height: 240px; overflow-y: auto; }
.ct-context-item { display: flex; gap: 4px; align-items: center; padding: 4px 0; font-size: 12px; font-family: "SF Mono", Menlo, monospace; }
.ct-context-item+.ct-context-item { border-top: 1px solid var(--el-border-color-lighter); }
.ct-context-item-path { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--el-color-primary); cursor: pointer; }
.ct-context-item-path:hover { text-decoration: underline; }
.ct-context-empty { padding: 8px 0; font-size: 12px; color: var(--el-text-color-placeholder); text-align: center; }

// ── Skills panel (Pi-inspired: tool registry browser) ──
.ct-skills-list { max-height: 320px; overflow-y: auto; padding-right: 4px; }
.ct-skills-global-search { margin-bottom: 6px; }
.ct-skills-search-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 4px 6px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px dashed var(--el-border-color-lighter);
  margin-bottom: 4px;
  &.is-empty { color: var(--el-color-danger); }
}
.ct-skills-search-total { font-weight: 600; }
.ct-skills-search-split { font-variant-numeric: tabular-nums; }
.ct-skills-search-pos {
  margin-left: auto;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.ct-skills-similar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 2px 4px 6px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
}
.ct-skills-similar-label { color: var(--el-text-color-placeholder); }
.ct-skills-similar-score {
  margin-left: 4px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
}
.ct-skills-similar-chip {
  padding: 1px 6px;
  border: 1px dashed var(--el-color-info-light-5);
  border-radius: 8px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-color-info);
  cursor: pointer;
  &:hover {
    background: var(--el-color-info-light-9);
    border-style: solid;
    border-color: var(--el-color-info);
    color: var(--el-color-white);
    background: var(--el-color-info);
  }
}
.ct-skills-section { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--el-text-color-placeholder); padding: 8px 4px 4px; border-bottom: 1px solid var(--el-border-color-lighter); margin-bottom: 4px; }
.ct-skills-sort-toggle {
  font-size: 9px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  color: var(--el-text-color-placeholder);
  &:hover { color: var(--el-color-primary); }
}
.ct-skills-compact-toggle {
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  &:hover { color: var(--el-color-primary); }
  &.is-active { color: var(--el-color-primary); }
}
.ct-skills-filter-count {
  font-size: 9px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  margin-left: 2px;
}
.ct-skills-pin-count {
  font-size: 9px;
  font-weight: 600;
  color: var(--el-color-warning);
  margin-left: 2px;
}
.ct-skills-pin-count--clickable {
  cursor: pointer;
  &:hover { text-decoration: underline; }
}
.ct-pin-pop { font-size: 11px; color: var(--el-text-color-regular); }
.ct-pin-pop-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.ct-pin-pop-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}
.ct-pin-pop-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
  &:last-child { border-bottom: 0; }
}
.ct-pin-pop-row--stale {
  opacity: 0.55;
  .ct-pin-pop-name { color: var(--el-text-color-placeholder); }
  .ct-pin-pop-count { color: var(--el-color-info); }
}

// Prompt history panel (Pi-inspired)
.ct-history-pop { font-size: 12px; max-height: 360px; overflow-y: auto; }
.ct-history-recent {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.ct-history-recent-label {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  margin-right: 2px;
}
.ct-history-chip {
  display: inline-flex;
  align-items: center;
  max-width: 200px;
  padding: 1px 4px 1px 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  font-size: 11px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: var(--el-fill-color-light);
  &:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    .ct-history-chip-copy { opacity: 1; }
    .ct-history-chip-text { color: var(--el-color-primary); }
  }
}
.ct-history-chip-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ct-history-chip-copy {
  opacity: 0;
  transition: opacity 0.15s;
  padding: 0 2px;
  height: 16px;
  min-height: 16px;
  &:hover { opacity: 1; }
}
.ct-history-search { margin-bottom: 8px; }
.ct-history-empty {
  padding: 16px 8px;
  text-align: center;
  color: var(--el-text-color-placeholder);
  font-style: italic;
  line-height: 1.5;
}
.ct-history-similar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.ct-history-similar-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  font-style: italic;
}
.ct-history-similar .ct-history-chip-text {
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  font-size: 12px;
  &:hover { background: var(--el-color-primary-light-8); color: var(--el-color-primary); }
}
.ct-history-similar-score {
  margin-left: 4px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
}
.ct-history-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
  &:last-child { border-bottom: 0; }
}
.ct-history-idx {
  flex: 0 0 24px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.ct-history-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  color: var(--el-text-color-regular);
  &:hover { color: var(--el-color-primary); }
}
.ct-history-actions {
  flex: 0 0 auto;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}
.ct-history-row:hover .ct-history-actions { opacity: 1; }
.ct-history-rows {
  max-height: 280px;
  overflow-y: auto;
}
.ct-history-footer {
  position: sticky;
  bottom: 0;
  margin-top: 8px;
  padding: 8px 0 0;
  border-top: 1px solid var(--el-border-color-lighter);
  text-align: right;
  background: var(--el-bg-color);
}
.ct-pin-pop-name {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  word-break: break-all;
}
.ct-pin-pop-meta {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}
.ct-pin-pop-count {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
  font-weight: 600;
}
.ct-pin-pop-avg {
  color: var(--el-text-color-placeholder);
  font-weight: 400;
  opacity: 0.7;
}
.ct-pin-pop-spark {
  flex-shrink: 0;
  opacity: 0.7;
  &:hover { opacity: 1; }
}
.ct-pin-pop-spark-hit {
  cursor: help;
}
.ct-stuck-ring {
  animation: ct-stuck-pulse 3s ease-in-out infinite;
}
@keyframes ct-stuck-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}
@media (prefers-reduced-motion: reduce) {
  .ct-stuck-ring,
  .ct-spin,
  .ct-skill-tag--probing { animation: none; }
}
.ct-pin-spark-legend-wrap {
  margin: 0 0 4px;
}
.ct-pin-spark-legend-toggle {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  height: auto;
  padding: 2px 4px;
  margin: 0 0 2px;
}
.ct-pin-spark-legend {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  margin: 0 0 6px;
  padding: 4px 6px;
  background: var(--el-fill-color-light);
  border-radius: 3px;
}
.ct-pin-spark-legend span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}
.ct-pin-spark-legend-dot {
  display: inline-block;
  width: 6px;
  height: 2px;
  vertical-align: middle;
  border-radius: 1px;
}
.ct-skill-match {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  padding: 0 1px;
  border-radius: 2px;
  font-weight: 600;
}
.ct-skill-pin {
  width: 16px;
  height: 16px;
  padding: 0;
  font-size: 12px;
  line-height: 1;
  color: var(--el-text-color-placeholder);
  flex: 0 0 auto;
  &.is-pinned { color: var(--el-color-warning); }
  &:hover { color: var(--el-color-warning); }
}
.ct-skill { padding: 8px 4px; border-bottom: 1px solid var(--el-border-color-lighter); }
.ct-skill.is-selected {
  background: var(--el-color-primary-light-9);
  border-left: 3px solid var(--el-color-primary);
  padding-left: 1px;
}
.ct-skill--compact {
  padding: 4px;
  .ct-skill-desc, .ct-skill-lastcall { display: none; }
}
.ct-skill:last-child { border-bottom: none; }
.ct-skill--off { opacity: 0.55; }
.ct-skill--broken {
  border-left: 3px solid var(--el-color-danger);
  padding-left: 6px;
  background: var(--el-color-danger-light-9);
}
.ct-skill-head { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-bottom: 2px; }
.ct-skill-label { font-weight: 600; font-size: 12px; color: var(--el-text-color-primary); }
.ct-skill-name { font-family: "SF Mono", Menlo, monospace; font-size: 11px; color: var(--el-text-color-secondary); }
.ct-skill-tag { font-size: 9px; padding: 1px 5px; border-radius: 8px; line-height: 1.4; font-weight: 600; }
.ct-skill-tag--on { background: var(--el-color-success-light-9); color: var(--el-color-success); }
.ct-skill-tag--off { background: var(--el-fill-color); color: var(--el-text-color-placeholder); }
.ct-skill-tag--pre { background: var(--el-color-warning-light-9); color: var(--el-color-warning); }

// ── Last-invoked indicator per tool (Pi-inspired) ──
.ct-skill-lastcall {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-top: 3px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
}
.ct-skill-lastcall-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--el-color-success);
  opacity: 0.6;
}
.ct-skill-lastcall--err .ct-skill-lastcall-dot {
  background: var(--el-color-danger);
  opacity: 1;
}
.ct-skill-lastcall-ms { color: var(--el-text-color-placeholder); }
.ct-skill-lastcall-ms--slow { color: var(--el-color-warning); font-weight: 600; }
.ct-skill-lastcall-err { color: var(--el-color-danger); font-weight: 600; }
.ct-skill-lastcall-count { color: var(--el-text-color-secondary); font-weight: 600; }

// ── Per-tool prompt metadata expand (Pi-inspired) ──
.ct-rerun-pop {
  font-size: 11px;
  color: var(--el-text-color-regular);
  max-height: 200px;
  overflow: auto;
}
.ct-rerun-pop-head {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.ct-rerun-pop-state {
  font-size: 10px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.ct-rerun-pop-state--ok { color: var(--el-color-success); }
.ct-rerun-pop-state--err { color: var(--el-color-danger); }
.ct-rerun-pop-err {
  margin: 4px 0;
  padding: 4px 6px;
  font-size: 10px;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border-radius: 3px;
  word-break: break-word;
}
.ct-rerun-pop-content {
  margin: 4px 0;
  padding: 6px 8px;
  font-size: 10px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color);
  border-radius: 3px;
  max-height: 120px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
.ct-rerun-pop-subhead {
  margin-top: 4px;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.ct-rerun-pop-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2px;
}
.ct-rerun-pop-row {
  display: flex;
  gap: 6px;
  align-items: baseline;
  padding: 2px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
  &:last-child { border-bottom: 0; }
}
.ct-rerun-pop-key {
  flex: 0 0 auto;
  min-width: 60px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
.ct-rerun-pop-val {
  flex: 1;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  word-break: break-word;
  white-space: pre-wrap;
}

.ct-skill-meta-toggle {
  margin-left: auto;
  width: 20px;
  height: 20px;
  padding: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-text-color-placeholder);
  &.is-open { color: var(--el-color-primary); }
}
.ct-skill-meta {
  margin-top: 4px;
  padding: 6px 8px;
  border-radius: 4px;
  background: var(--el-fill-color);
  border: 1px dashed var(--el-border-color-lighter);
}
.ct-skill-meta-row {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  font-size: 10px;
  margin-bottom: 4px;
  &:last-child { margin-bottom: 0; }
}
.ct-skill-meta-key {
  flex-shrink: 0;
  min-width: 56px;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--el-text-color-placeholder);
  padding-top: 2px;
}
.ct-skill-meta code {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  color: var(--el-text-color-regular);
  word-break: break-word;
}
.ct-skill-meta-list {
  margin: 0;
  padding-left: 14px;
  font-size: 10px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
  li { margin: 0; }
}

// ── LLM prompt preview (Pi-inspired: introspect system prompt snippet) ──
.ct-llm-prompt {
  margin: 4px 0 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-fill-color);
  overflow: hidden;
}
.ct-llm-prompt-head {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ct-llm-prompt-meta {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
}
.ct-llm-prompt pre {
  margin: 0;
  padding: 6px 8px;
  font-size: 10px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-regular);
  max-height: 160px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
.ct-llm-prompt-empty {
  padding: 8px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}

// ── MCP tool search filter ──
.ct-mcp-search {
  padding: 4px 0 6px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 4px;
}

// ── MCP inline args editor (Pi-inspired: schema-driven form) ──
.ct-mcp-args {
  margin-top: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  background: var(--el-fill-color);
  border: 1px dashed var(--el-border-color-lighter);
}
.ct-mcp-arg { margin-bottom: 6px; }
.ct-mcp-arg:last-child { margin-bottom: 0; }
.ct-mcp-arg-label {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-bottom: 2px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
}
.ct-mcp-arg-name {
  font-family: "SF Mono", Menlo, monospace;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.ct-mcp-arg-type {
  font-size: 9px;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
}
.ct-mcp-arg-req { color: var(--el-color-danger); font-weight: 700; }

// ── MCP inline Run result (Pi-inspired: one-click tool invocation) ──
.ct-mcp-result {
  margin-top: 6px;
  padding: 4px 6px;
  border-radius: 4px;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-lighter);
}
.ct-mcp-result--err { background: var(--el-color-danger-light-9); border-color: var(--el-color-danger-light-7); }
.ct-mcp-result-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 2px;
}
.ct-mcp-result-err {
  color: var(--el-color-danger);
  font-weight: 600;
  word-break: break-all;
}
.ct-mcp-result pre {
  margin: 0;
  font-size: 10px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-regular);
  max-height: 100px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
.ct-skill-tag--probing { background: var(--el-color-info-light-9); color: var(--el-color-info); animation: ct-probe 1s ease-in-out infinite; }
@keyframes ct-probe { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.ct-skill-desc { font-size: 11px; color: var(--el-text-color-regular); line-height: 1.5; }
.ct-skills-empty { padding: 16px 0; font-size: 12px; color: var(--el-text-color-placeholder); text-align: center; }
// ── Aggregate telemetry summary (Pi-inspired) ──
.ct-skills-summary {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 6px;
  padding: 6px 8px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 4px;
}
.ct-skills-summary-item {
  display: inline-flex;
  gap: 2px;
  align-items: baseline;
}
.ct-skills-summary-item--err { color: var(--el-color-danger); }
.ct-skills-summary-item--warn { color: var(--el-color-warning); }
.ct-skills-summary-num { font-weight: 700; color: var(--el-text-color-primary); font-variant-numeric: tabular-nums; }
.ct-skills-summary-breakdown { font-size: 9px; color: var(--el-text-color-placeholder); font-weight: 500; margin-left: 2px; }
.ct-skills-summary-item--err .ct-skills-summary-num { color: var(--el-color-danger); }
.ct-skills-summary-item--warn .ct-skills-summary-num { color: var(--el-color-warning); }
.ct-skills-summary-pct { font-size: 9px; opacity: 0.85; }
.ct-skills-summary-sep { color: var(--el-text-color-placeholder); }
.ct-skills-summary-copy {
  margin-left: auto;
  padding: 0 4px;
  font-size: 10px;
  &.is-copied { color: var(--el-color-success); }
}
.ct-skills-summary-save {
  padding: 0 4px;
  font-size: 10px;
}
// ── Top-3 most-invoked tools (Pi-inspired) ──
.ct-skills-top {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 4px;
  padding: 0 8px;
  font-size: 10px;
}
.ct-skills-top-label {
  color: var(--el-text-color-placeholder);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.ct-skills-top-chip {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-lighter);
  font-size: 10px;
}
.ct-skills-top-chip--builtin {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
}
.ct-skills-top-chip--mcp {
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-7);
}
.ct-skills-top-name {
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-primary);
}
.ct-skills-top-count {
  font-weight: 700;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}
.ct-skills-last { margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--el-border-color-lighter); font-size: 10px; color: var(--el-text-color-secondary); }
</style>
<style lang="scss">
// Global: popover teleports to body, scoped styles won't reach it.
// Cap skills popover body height so long tool lists scroll instead of
// pushing the popover off-screen.
.el-popover.ct-skills-pop {
  max-height: 70vh;
  overflow-y: auto;
  // Search wrapper stays visible while body scrolls.
  .ct-skills-search-sticky {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--el-bg-color);
    // Pull to popover padding edges so the sticky bar spans full width.
    margin: -12px -12px 8px;
    padding: 12px 12px 4px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
}
</style>
