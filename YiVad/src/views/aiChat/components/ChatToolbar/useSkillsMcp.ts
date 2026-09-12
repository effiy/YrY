import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useSparkLegendToggle } from "@/hooks/useSparkLegendToggle";
import { MCP_SERVERS, type McpServerConfig } from "../../mcpServers";
import { listMcpTools, callMcpTool, type McpTool } from "@/api/modules/mcpService";
import { getErrorMessage } from "@/utils/errorHandler";

export function useSkillsMcp() {
  const store = useAiChatStore();

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
const slowThresholdMs = ref(1000);  // default slow-call threshold (ms)
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
  } catch (e) {
    mcpToolsError.value = getErrorMessage(e);
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
  } catch (e) {
    const dt = Math.round(performance.now() - t0);
    mcpToolResults.value = {
      ...mcpToolResults.value,
      [tool.name]: {
        error: getErrorMessage(e),
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
  } catch (err: unknown) {
    const latency = Math.round(performance.now() - t0);
    const msg = err?.name === "AbortError" ? "timeout (3s)" : (err instanceof Error ? err.message : "unreachable");
    mcpProbe.value = {
      ...mcpProbe.value,
      [server.name]: { status: "fail", latencyMs: latency, error: msg },
    };
  } finally {
    clearTimeout(timer);
  }
}

  return {
    // Skills panel
    skillsPopoverVisible, compactMode, allSkills, activeSkillCount,
    skillSortMode, sortedSkills, cycleSkillSortMode, skillSortLabel,
    expandedTools, toggleToolExpand,
    // Pin management
    pinnedTools, togglePin, isPinned,
    pinnedBuiltinCount, pinnedMcpCount,
    pinnedBuiltinNames, pinnedMcpNames,
    unpinAllBuiltin, unpinAllMcp,
    pinSortMode, PIN_SORT_MODE_LABEL, cyclePinSort,
    pinHoverIdx, pinHoverKey, setPinHover,
    // Pin spark stuff
    PIN_SPARK_W, PIN_SPARK_H,
    // Search
    globalToolFilter, globalSearchRef,
    activeToolFilter, visibleSkills,
    globalSearchSummary, similarTools,
    selectedToolIdx, onGlobalSearchKeydown,
    builtinToolFilter,
    // MCP tools
    mcpTools, mcpToolsLoading, mcpToolsError, mcpToolsLoaded,
    mcpToolFilter, filteredMcpTools,
    mcpServers, lastToolEvent,
    loadMcpTools, highlightSegments,
    expandedMcpTools, toggleMcpToolExpand,
    // Inline run
    args, schema, required,
    ensureToolArgs, resetToolArgs, getToolProps, getToolSchemaJson,
    mcpToolLastArgs, mcpToolResults,
    rerunMcpToolLast, runMcpToolInline,
    failed, failedRerunTool, copiedRerunTool,
    // Metadata + LLM prompt
    toolLastCalls, hasToolPromptMeta,
    showLlmPrompt, llmPromptText,
    // Tool stats
    toolStats, topTools,
    // Telemetry
    copiedTelemetry, formatRelativeTime,
    // MCP pin stats
    builtinTotal, mcpTotal, total,
    isBuiltinPinStale, isMcpPinStale,
    builtinPinCount, mcpPinCount,
    builtinPinAvgMs, mcpPinAvgMs,
    builtinPinMaxMs, mcpPinMaxMs,
    builtinPinFailRate, mcpPinFailRate,
    builtinPinMedianMs, mcpPinMedianMs,
    builtinPinP90Ms, mcpPinP90Ms,
    builtinPinProjectionPoint, mcpPinProjectionPoint,
    builtinPinStuckSummary, mcpPinStuckSummary,
    builtinPinStuckIndices, mcpPinStuckIndices,
    builtinPinSparkPath, mcpPinSparkPath,
    builtinPinSparkPoints, mcpPinSparkPoints,
    builtinPinSparkAvgY, mcpPinSparkAvgY,
    builtinPinSparkMedianY, mcpPinSparkMedianY,
    builtinPinSparkP90Y, mcpPinSparkP90Y,
    builtinPinSparkThresholdY, mcpPinSparkThresholdY,
    builtinPinSparkLatestIdx, mcpPinSparkLatestIdx,
    builtinPinSparkMinIdx, mcpPinSparkMinIdx,
    builtinPinHitWidths, mcpPinHitWidths,
    builtinPinHitW, mcpPinHitW,
    builtinPinCrosshairColor, mcpPinCrosshairColor,
    // Popover
    onSkillsPopoverOpen, selectionPos,
    selectedBuiltinIdx, selectedMcpIdx,
    // MCP health
    mcpProbe, probeMcp,
    // Pin legend
    pinLegendCollapsed, togglePinLegend,
  };
}
