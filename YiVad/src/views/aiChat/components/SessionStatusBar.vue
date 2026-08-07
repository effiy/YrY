<!--
  SessionStatusBar — Pi-inspired session state visualization.
  Compact bar showing: model, context files, token usage, RAG/compaction status,
  granular streaming phase (fetching → thinking → streaming), and a live
  tool-call timeline (Pi: tool_execution_start/end events surfaced in the UI).
  Renders between MessageList and ChatInput in the chat area.
-->
<script setup lang="ts" name="aiChatSessionStatusBar">
import { computed, ref, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useSparkLegendToggle } from "@/hooks/useSparkLegendToggle";
import { ElMessageBox, ElMessage } from "element-plus";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { DEFAULT_MODEL } from "@/views/aiChat/constants";
import { Cpu, Document, DataAnalysis, Coin, Loading, Tools, Compass, Check, Close, FolderChecked, Timer, Back } from "@element-plus/icons-vue";
import { useSlowThreshold, setSlowThreshold, formatSlowThreshold, SLOW_THRESHOLD_PRESETS } from "@/hooks/useSlowThreshold";

const store = useAiChatStore();
const router = useRouter();

const FROM_PREFIX = "from:";
const SOURCE_DOMAIN_LABEL: Record<string, string> = {
  brd: "BRD",
  "tech-leadership": "TL",
  "code-review": "CR",
  story: "Story",
  rag: "RAG",
  rss: "RSS",
  aichat: "AI"
};
const sourceUrl = computed(() => {
  const from = (store.activeConversation?.tags ?? [])
    .find(t => typeof t === "string" && t.startsWith(FROM_PREFIX));
  return from ? from.slice(FROM_PREFIX.length) : "";
});
const sourceDomainLabel = computed<string>(() => {
  const url = sourceUrl.value;
  if (!url) return "";
  const m = url.match(/^\/([^/?#]+)/);
  if (!m) return "";
  const head = m[1];
  if (head === "code-review") {
    if (url.startsWith("/code-review/bugs")) return "Bug";
    return "CR";
  }
  return SOURCE_DOMAIN_LABEL[head] || head.toUpperCase();
});
function backToSource() {
  if (!sourceUrl.value) return;
  router.push(sourceUrl.value);
}

const CHARS_PER_TOKEN = 4;
const CONTEXT_WINDOW = 8192;
// Pi-inspired: collapse session sparkline legends (shared across cost /
// latency / token). Refactored to useSparkLegendToggle composable (iter 205)
// — same persist-to-localStorage behavior, shared with pin legend.
const { collapsed: sessionLegendCollapsed, toggle: toggleSessionLegend } = useSparkLegendToggle("yivad.sessionLegendCollapsed");

const ctxFileCount = computed(() => {
  const tags = store.activeConversation?.tags ?? [];
  return tags.filter(t => typeof t === "string" && t.startsWith("ctx:")).length;
});

const totalChars = computed(() => {
  const msgs = store.activeConversation?.messages ?? [];
  let chars = 0;
  for (const m of msgs) chars += m.message?.length ?? 0;
  // Also count pageContent if present
  chars += (store.activeConversation?.pageContent ?? "").length;
  return chars;
});

const estimatedTokens = computed(() => Math.ceil(totalChars.value / CHARS_PER_TOKEN));

// Per-role token split (Pi-inspired: input vs output economics).
// User messages = prompt tokens (info color); pet messages = completion
// tokens (success color). Mirrors MessageBubble's role-colored chip.
const userChars = computed(() => {
  const msgs = store.activeConversation?.messages ?? [];
  let chars = 0;
  for (const m of msgs) if (m.type === "user") chars += m.message?.length ?? 0;
  return chars;
});
const petChars = computed(() => {
  const msgs = store.activeConversation?.messages ?? [];
  let chars = 0;
  for (const m of msgs) if (m.type !== "user") chars += m.message?.length ?? 0;
  return chars;
});
const userTokens = computed(() => Math.ceil(userChars.value / CHARS_PER_TOKEN));
const petTokens = computed(() => Math.ceil(petChars.value / CHARS_PER_TOKEN));
const userMsgCount = computed(() => {
  const msgs = store.activeConversation?.messages ?? [];
  return msgs.filter(m => m.type === "user").length;
});
const petMsgCount = computed(() => {
  const msgs = store.activeConversation?.messages ?? [];
  return msgs.filter(m => m.type !== "user").length;
});
const tokenRatio = computed(() => {
  // output:input ratio — e.g. pet 340 / user 120 ≈ 2.8× more output than input.
  if (!userTokens.value) return 0;
  return Math.round((petTokens.value / userTokens.value) * 10) / 10;
});
// Stacked-bar proportions: in vs out share of total tokens. When total is 0
// (no messages yet), in defaults to 100% so the bar renders fully rather than
// as an empty sliver.
const tokenInPct = computed(() => {
  const total = userTokens.value + petTokens.value;
  if (!total) return 100;
  return Math.round((userTokens.value / total) * 100);
});
const tokenOutPct = computed(() => 100 - tokenInPct.value);

// Pi-inspired: rough cost estimate. Per-1K-token rates in USD. Defaults
// approximate Qwen-turbo-class local pricing; override per-model as needed.
// Coarse chars/4 estimate upstream makes this indicative, not billing-grade.
const INPUT_RATE_PER_1K = 0.0005;
const OUTPUT_RATE_PER_1K = 0.0015;
const estimatedCost = computed(() => {
  const inCost = (userTokens.value / 1000) * INPUT_RATE_PER_1K;
  const outCost = (petTokens.value / 1000) * OUTPUT_RATE_PER_1K;
  return inCost + outCost;
});
function formatCost(usd: number): string {
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}
// Pi-inspired: cost trajectory as a sparkline. Samples cumulative spend at
// each message boundary so the user sees whether spend is accelerating,
// linear, or plateauing. Empty until at least 2 messages exist.
const costHistory = computed<number[]>(() => {
  const msgs = store.activeConversation?.messages ?? [];
  if (msgs.length < 2) return [];
  let uChars = 0, pChars = 0;
  const samples: number[] = [];
  for (const m of msgs) {
    if (m.type === "user") uChars += m.message?.length ?? 0;
    else pChars += m.message?.length ?? 0;
    const uTok = Math.ceil(uChars / CHARS_PER_TOKEN);
    const pTok = Math.ceil(pChars / CHARS_PER_TOKEN);
    samples.push((uTok / 1000) * INPUT_RATE_PER_1K + (pTok / 1000) * OUTPUT_RATE_PER_1K);
  }
  return samples;
});
const SPARK_W = 56, SPARK_H = 12, SPARK_PAD = 1;
const costSparkPath = computed<string>(() => {
  const data = costHistory.value;
  if (data.length < 2) return "";
  const max = data[data.length - 1] || 1;
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const n = data.length;
  const points = data.map((v, i) => {
    const x = SPARK_PAD + (i / (n - 1)) * (SPARK_W - 2 * SPARK_PAD);
    const y = SPARK_H - SPARK_PAD - ((v - min) / range) * (SPARK_H - 2 * SPARK_PAD);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M ${points.join(" L ")}`;
});
const costSparkLatest = computed<number>(() => {
  const d = costHistory.value;
  return d.length ? d[d.length - 1] : 0;
});
const costSparkMax = computed<number>(() => {
  const d = costHistory.value;
  return d.length ? Math.max(...d) : 0;
});
const costSparkMin = computed<number>(() => {
  const d = costHistory.value;
  return d.length ? Math.min(...d) : 0;
});
// Pi-inspired: per-msg index of cheapest/latest — paired with the min/max
// values, gives the user "which message was cheapest / which was latest".
// 1-based to match latency's idx convention (iter 221). Cheap = min cost msg.
const costSparkMinIdx = computed<number>(() => {
  const d = costHistory.value;
  if (d.length < 2) return -1;
  let mi = 0;
  for (let i = 1; i < d.length; i++) if (d[i] < d[mi]) mi = i;
  return mi + 1;
});
const costSparkLatestIdx = computed<number>(() => {
  const d = costHistory.value;
  return d.length >= 2 ? d.length : -1;
});
// Pi-inspired: 80% of peak spend — a budget reference line. For a cumulative
// trajectory, the curve crosses this line at the moment cumulative cost
// reached 80% of current total. Crossing early = front-loaded spend (recent
// activity cheaper); crossing late = back-loaded (recent activity expensive).
const costSparkWarnY = computed<number>(() => {
  if (costHistory.value.length < 2) return -10;
  return SPARK_H - SPARK_PAD - 0.8 * (SPARK_H - 2 * SPARK_PAD);
});
// Pi-inspired: avg/median/p90 of the cumulative cost trajectory — reference
// lines symmetric to the latency sparkline (iter 160) and pin iter 148/149.
// Uses same min-max normalization as costSparkPath so curves stay aligned.
// Guard < 3 samples → off-chart (-10).
const costSparkAvg = computed<number>(() => {
  const d = costHistory.value;
  if (!d.length) return 0;
  return d.reduce((s, v) => s + v, 0) / d.length;
});
// Pi-inspired: cost projection — extrapolate cumulative cost 10 messages
// forward, assuming per-message incremental cost stays at historical avg.
// Guard < 2 samples → 0 (no projection). Symmetric to pi's "trajectory
// forecast" pattern.
const costProjection = computed<number>(() => {
  const d = costHistory.value;
  if (d.length < 2) return 0;
  const perMsg = (d[d.length - 1] - d[0]) / (d.length - 1);
  return d[d.length - 1] + 10 * perMsg;
});
// Pi-inspired: SVG coords for projection endpoint. Uses same min-max
// normalization as costSparkPath. Projection exceeds max so cy goes
// above SPARK_PAD (off-chart) — visually signals "beyond observed range".
// Returns null when no projection or no latest point.
const costProjectionPoint = computed<{ x: number; y: number } | null>(() => {
  if (costProjection.value <= 0) return null;
  const d = costHistory.value;
  if (d.length < 2) return null;
  const max = d[d.length - 1] || 1;
  const min = Math.min(...d, 0);
  const range = max - min || 1;
  const x = SPARK_W - SPARK_PAD;
  // Clamp y to [SPARK_PAD, SPARK_H - SPARK_PAD] so projection endpoint stays
  // within viewBox in BOTH directions — extrapolation can overshoot observed
  // max (y → negative) OR undershoot observed min (y → > SPARK_H). Without
  // both clamps, endpoint is clipped by the SVG viewport. (iter 204 top clamp,
  // iter 209 bottom clamp)
  const rawY = SPARK_H - SPARK_PAD - ((costProjection.value - min) / range) * (SPARK_H - 2 * SPARK_PAD);
  const y = Math.min(SPARK_H - SPARK_PAD, Math.max(SPARK_PAD, rawY));
  return { x, y };
});
const costSparkMedian = computed<number>(() => {
  const d = costHistory.value;
  if (d.length < 3) return 0;
  const arr = [...d].sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
});
// Pi-inspired: p90 cost — typical worst-case per-msg spend. Requires >= 3
// samples. Symmetric to ChatToolbar's mcpPinSparkP90Y (iter 202) and the
// latency p90 line (iter 160).
const costSparkP90 = computed<number>(() => {
  const d = costHistory.value;
  if (d.length < 3) return 0;
  const arr = [...d].sort((a, b) => a - b);
  const idx = Math.min(arr.length - 1, Math.floor(arr.length * 0.9));
  return arr[idx];
});
const costSparkAvgY = computed<number>(() => {
  if (costHistory.value.length < 2) return -10;
  const min = Math.min(...costHistory.value, 0);
  const max = costSparkMax.value || 1;
  const range = max - min || 1;
  return SPARK_H - SPARK_PAD - ((costSparkAvg.value - min) / range) * (SPARK_H - 2 * SPARK_PAD);
});
const costSparkMedianY = computed<number>(() => {
  if (costSparkMedian.value === 0) return -10;
  const min = Math.min(...costHistory.value, 0);
  const max = costSparkMax.value || 1;
  const range = max - min || 1;
  return SPARK_H - SPARK_PAD - ((costSparkMedian.value - min) / range) * (SPARK_H - 2 * SPARK_PAD);
});
const costSparkP90Y = computed<number>(() => {
  if (costSparkP90.value === 0) return -10;
  const min = Math.min(...costHistory.value, 0);
  const max = costSparkMax.value || 1;
  const range = max - min || 1;
  return SPARK_H - SPARK_PAD - ((costSparkP90.value - min) / range) * (SPARK_H - 2 * SPARK_PAD);
});
// Crossing point: first index where cumulative ≥ 80% of peak. Marked with a
// circle so users can see "when did spend cross 80%" at a glance.
const costSparkWarnPoint = computed<{ cx: number; cy: number; cost: number; idx: number } | null>(() => {
  const d = costHistory.value;
  if (d.length < 2) return null;
  const max = costSparkMax.value || 1;
  const min = Math.min(...d, 0);
  const range = max - min || 1;
  const threshold = 0.8 * max;
  const i = d.findIndex(v => v >= threshold);
  if (i < 0) return null;
  const n = d.length;
  const cx = SPARK_PAD + (i / (n - 1)) * (SPARK_W - 2 * SPARK_PAD);
  const cy = SPARK_H - SPARK_PAD - ((d[i] - min) / range) * (SPARK_H - 2 * SPARK_PAD);
  return { cx, cy, cost: d[i], idx: i + 1 };
});
// Token history sparkline (Pi-inspired: trajectory of input/output tokens
// over the session). Two stacked lines — info for input (user), success for
// output (pet) — mirrors the existing stacked-bar palette so colors stay
// consistent across views.
const tokenHistory = computed<{ uTok: number; pTok: number; ts: number | null }[]>(() => {
  const msgs = store.activeConversation?.messages ?? [];
  if (msgs.length < 2) return [];
  let uChars = 0, pChars = 0;
  const out: { uTok: number; pTok: number; ts: number | null }[] = [];
  for (const m of msgs) {
    if (m.type === "user") uChars += m.message?.length ?? 0;
    else pChars += m.message?.length ?? 0;
    out.push({ uTok: Math.ceil(uChars / CHARS_PER_TOKEN), pTok: Math.ceil(pChars / CHARS_PER_TOKEN), ts: m.timestamp ?? null });
  }
  return out;
});
const tokenSparkPaths = computed<{ in: string; out: string }>(() => {
  const data = tokenHistory.value;
  if (data.length < 2) return { in: "", out: "" };
  const max = tokenSparkMax.value || 1;
  const n = data.length;
  const mkPath = (key: "uTok" | "pTok") => data.map((v, i) => {
    const x = SPARK_PAD + (i / (n - 1)) * (SPARK_W - 2 * SPARK_PAD);
    const y = SPARK_H - SPARK_PAD - (v[key] / max) * (SPARK_H - 2 * SPARK_PAD);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" L ");
  return { in: `M ${mkPath("uTok")}`, out: `M ${mkPath("pTok")}` };
});
// Per-sample SVG point coords + values for the in/out lines. Pi-inspired:
// hover each data point to see its token count + message timestamp.
// `tokenHoverIdx` adds a crosshair vertical line on hover — mirrors cost
// sparkline behavior so the two views stay visually consistent.
const tokenHoverIdx = ref<number | null>(null);
const tokenHoverSeries = ref<"in" | "out" | null>(null);
// Pi-inspired: adaptive hit rx/ry for token in+out ellipses. Dual series
// share cx but have different cy (yIn/yOut) — horizontal rx large for hit
// width, vertical ry small to avoid in/out overlap when both near top.
// rx scales with n (4→2 dense); ry fixed 2 (token circles small enough).
const tokenHitRx = computed<number>(() => {
  const n = tokenSparkPoints.value.length;
  if (n < 2) return 4;
  return Math.max(2, Math.min(4, SPARK_W / n / 2));
});
// Pi-inspired: per-point rx for token in+out ellipses. Symmetric to
// costStripWidths/latencyStripWidths (iter 190). Returns rx array aligned
// with tokenSparkPoints. Cap [2, 4] — token rx is half strip width.
const tokenHitRxs = computed<number[]>(() => {
  const pts = tokenSparkPoints.value;
  if (pts.length < 2) return [];
  return pts.map((p, i) => {
    const left = i > 0 ? p.cx - pts[i - 1].cx : SPARK_W;
    const right = i < pts.length - 1 ? pts[i + 1].cx - p.cx : SPARK_W;
    const gap = Math.min(left, right);
    return Math.max(2, Math.min(4, gap / 2 - 0.5));
  });
});
// Pi-inspired: per-point ry for token in+out ellipses. When yIn and yOut
// are vertically close (small token count), ry=2 causes overlap. Shrink
// ry based on |yIn - yOut| so ellipses never overlap vertically. Clamp
// [1, 2] — narrower than 1px defeats hit purpose.
const tokenHitRys = computed<number[]>(() => {
  const pts = tokenSparkPoints.value;
  if (!pts.length) return [];
  return pts.map(p => {
    const gap = Math.abs(p.yIn - p.yOut);
    return Math.max(1, Math.min(2, gap / 2 - 0.5));
  });
});
const tokenSparkMax = computed<number>(() => {
  const d = tokenHistory.value;
  if (!d.length) return 0;
  return d.reduce((m, v) => Math.max(m, v.uTok, v.pTok), 0);
});
const tokenSparkMin = computed<number>(() => {
  const d = tokenHistory.value;
  if (!d.length) return 0;
  return Math.min(d[0].uTok, d[0].pTok);
});
// Pi-inspired: per-msg index of smallest-token / latest — paired with the
// min/max values, gives the user "which message had fewest tokens / which
// was latest". 1-based to match cost/latency idx convention (iter 221/223).
// Smallest = msg with lowest total (uTok + pTok).
const tokenSparkSmallestIdx = computed<number>(() => {
  const d = tokenHistory.value;
  if (d.length < 2) return -1;
  let mi = 0;
  for (let i = 1; i < d.length; i++) if (d[i].uTok + d[i].pTok < d[mi].uTok + d[mi].pTok) mi = i;
  return mi + 1;
});
const tokenSparkLatestIdx = computed<number>(() => {
  const d = tokenHistory.value;
  return d.length >= 2 ? d.length : -1;
});
// Pi-inspired: avg/median for in (uTok) and out (pTok) token series —
// symmetric to costSparkAvg/Median (iter 161). Guard < 3 → 0.
const tokenSparkAvgIn = computed<number>(() => {
  const d = tokenHistory.value;
  if (!d.length) return 0;
  return Math.round(d.reduce((s, v) => s + v.uTok, 0) / d.length);
});
const tokenSparkAvgOut = computed<number>(() => {
  const d = tokenHistory.value;
  if (!d.length) return 0;
  return Math.round(d.reduce((s, v) => s + v.pTok, 0) / d.length);
});
const tokenSparkMedianIn = computed<number>(() => {
  const d = tokenHistory.value;
  if (d.length < 3) return 0;
  const arr = d.map(v => v.uTok).sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 === 0 ? Math.round((arr[mid - 1] + arr[mid]) / 2) : arr[mid];
});
const tokenSparkMedianOut = computed<number>(() => {
  const d = tokenHistory.value;
  if (d.length < 3) return 0;
  const arr = d.map(v => v.pTok).sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 === 0 ? Math.round((arr[mid - 1] + arr[mid]) / 2) : arr[mid];
});
// Pi-inspired: avg/median reference-line Y coords for the token sparkline,
// symmetric to costSparkAvgY/MedianY (iter 161) and latency iter 160.
// Uses 0..max normalization (tokenSparkMax is shared across in/out).
// Guard < 3 samples → off-chart (-10) for median; avg uses length guard.
const tokenSparkAvgInY = computed<number>(() => {
  if (tokenHistory.value.length < 2) return -10;
  const max = tokenSparkMax.value || 1;
  return SPARK_H - SPARK_PAD - (tokenSparkAvgIn.value / max) * (SPARK_H - 2 * SPARK_PAD);
});
const tokenSparkAvgOutY = computed<number>(() => {
  if (tokenHistory.value.length < 2) return -10;
  const max = tokenSparkMax.value || 1;
  return SPARK_H - SPARK_PAD - (tokenSparkAvgOut.value / max) * (SPARK_H - 2 * SPARK_PAD);
});
const tokenSparkMedianInY = computed<number>(() => {
  if (tokenSparkMedianIn.value === 0) return -10;
  const max = tokenSparkMax.value || 1;
  return SPARK_H - SPARK_PAD - (tokenSparkMedianIn.value / max) * (SPARK_H - 2 * SPARK_PAD);
});
const tokenSparkMedianOutY = computed<number>(() => {
  if (tokenSparkMedianOut.value === 0) return -10;
  const max = tokenSparkMax.value || 1;
  return SPARK_H - SPARK_PAD - (tokenSparkMedianOut.value / max) * (SPARK_H - 2 * SPARK_PAD);
});
// Pi-inspired: p90 input-token reference line — typical worst-case user
// prompt size. Only in series (not out) to avoid visual crowding in the
// 56x12 viewBox. Symmetric to costSparkP90 (iter 203) and pin p90 (iter 202).
// Guard < 3 samples → 0 → off-chart.
const tokenSparkP90In = computed<number>(() => {
  const d = tokenHistory.value;
  if (d.length < 3) return 0;
  const arr = d.map(v => v.uTok).sort((a, b) => a - b);
  const idx = Math.min(arr.length - 1, Math.floor(arr.length * 0.9));
  return arr[idx];
});
const tokenSparkP90InY = computed<number>(() => {
  if (tokenSparkP90In.value === 0) return -10;
  const max = tokenSparkMax.value || 1;
  return SPARK_H - SPARK_PAD - (tokenSparkP90In.value / max) * (SPARK_H - 2 * SPARK_PAD);
});
// Pi-inspired: p90 output-token reference line — typical worst-case pet
// response size. Symmetric to tokenSparkP90In (iter 206). Same warning-light-5
// color + dash as p90 in — p90 is a statistical concept, not series-specific.
// Position differs (out Y vs in Y), so they're naturally distinguishable.
const tokenSparkP90Out = computed<number>(() => {
  const d = tokenHistory.value;
  if (d.length < 3) return 0;
  const arr = d.map(v => v.pTok).sort((a, b) => a - b);
  const idx = Math.min(arr.length - 1, Math.floor(arr.length * 0.9));
  return arr[idx];
});
const tokenSparkP90OutY = computed<number>(() => {
  if (tokenSparkP90Out.value === 0) return -10;
  const max = tokenSparkMax.value || 1;
  return SPARK_H - SPARK_PAD - (tokenSparkP90Out.value / max) * (SPARK_H - 2 * SPARK_PAD);
});
// Pi-inspired: 80% of peak tokens — a budget reference line symmetric to
// costSparkWarnY. For cumulative token trajectories, the in/out curves
// cross this line at the moment each reached 80% of its current peak.
const tokenSparkWarnY = computed<number>(() => {
  if (tokenHistory.value.length < 2) return -10;
  return SPARK_H - SPARK_PAD - 0.8 * (SPARK_H - 2 * SPARK_PAD);
});
// Pi-inspired: ctx-window 80% reference line — fixed budget threshold based
// on CONTEXT_WINDOW (8192), not observed max. Unlike tokenSparkWarnY (80%
// of observed peak), this surfaces "approaching context limit" — the same
// fraction every session regardless of peak. Tokens above this line mean
// that single message is using >6.4K tokens; trajectory crossing it = real
// budget pressure. Guard: if ctx-window's 80% exceeds observed max (small
// sessions), return -10 (off-chart).
const tokenSparkCtxWarnY = computed<number>(() => {
  if (tokenHistory.value.length < 2) return -10;
  const max = tokenSparkMax.value || 1;
  const threshold = CONTEXT_WINDOW * 0.8;
  if (threshold > max) return -10;
  return SPARK_H - SPARK_PAD - (threshold / max) * (SPARK_H - 2 * SPARK_PAD);
});
// Pi-inspired: in/out 80% crossing points. Each line (uTok / pTok) crosses
// the 80% threshold at its own X — the gap between the two reveals whether
// output (pet) or input (user) tokens accumulated first toward the peak.
const tokenSparkWarnPoints = computed<{ inPt: { cx: number; cy: number; tok: number; idx: number } | null; outPt: { cx: number; cy: number; tok: number; idx: number } | null }>(() => {
  const d = tokenHistory.value;
  if (d.length < 2) return { inPt: null, outPt: null };
  const max = tokenSparkMax.value || 1;
  const n = d.length;
  const threshold = 0.8 * max;
  const findCross = (key: "uTok" | "pTok") => {
    const i = d.findIndex(v => v[key] >= threshold);
    if (i < 0) return null;
    const cx = SPARK_PAD + (i / (n - 1)) * (SPARK_W - 2 * SPARK_PAD);
    const cy = SPARK_H - SPARK_PAD - (d[i][key] / max) * (SPARK_H - 2 * SPARK_PAD);
    return { cx, cy, tok: d[i][key], idx: i + 1 };
  };
  return { inPt: findCross("uTok"), outPt: findCross("pTok") };
});
// Pi-inspired: token projection — extrapolate in/out tokens 10 msgs
// forward, capped at CONTEXT_WINDOW. Symmetric to costProjection (iter 196).
// Returns SVG coords for the projection endpoint, or null when no data.
const tokenProjectionPoint = computed<{ x: number; inY: number; outY: number; inTok: number; outTok: number } | null>(() => {
  const d = tokenHistory.value;
  if (d.length < 2) return null;
  const max = tokenSparkMax.value || 1;
  const n = d.length;
  const perMsgIn = (d[n - 1].uTok - d[0].uTok) / (n - 1);
  const perMsgOut = (d[n - 1].pTok - d[0].pTok) / (n - 1);
  const inTok = Math.min(CONTEXT_WINDOW, d[n - 1].uTok + 10 * perMsgIn);
  const outTok = Math.min(CONTEXT_WINDOW, d[n - 1].pTok + 10 * perMsgOut);
  const x = SPARK_W - SPARK_PAD;
  // Clamp Y to [SPARK_PAD, SPARK_H - SPARK_PAD] so endpoints stay in viewBox
  // in BOTH directions. Token values are already capped at CONTEXT_WINDOW,
  // but Y normalization uses observed max — projected tok can overshoot
  // (raw Y → negative) OR undershoot (raw Y > SPARK_H, e.g. declining tokens).
  // (iter 204 top clamp, iter 209 bottom clamp)
  const rawInY = SPARK_H - SPARK_PAD - (inTok / max) * (SPARK_H - 2 * SPARK_PAD);
  const rawOutY = SPARK_H - SPARK_PAD - (outTok / max) * (SPARK_H - 2 * SPARK_PAD);
  const inY = Math.min(SPARK_H - SPARK_PAD, Math.max(SPARK_PAD, rawInY));
  const outY = Math.min(SPARK_H - SPARK_PAD, Math.max(SPARK_PAD, rawOutY));
  return { x, inY, outY, inTok, outTok };
});
const tokenSparkLatest = computed<{ uTok: number; pTok: number } | null>(() => {
  const d = tokenHistory.value;
  if (!d.length) return null;
  const last = d[d.length - 1];
  return { uTok: last.uTok, pTok: last.pTok };
});
const tokenSparkPoints = computed<{ cx: number; yIn: number; yOut: number; uTok: number; pTok: number; ts: number | null }[]>(() => {
  const data = tokenHistory.value;
  if (data.length < 2) return [];
  const max = tokenSparkMax.value || 1;
  const n = data.length;
  return data.map((v, i) => {
    const cx = SPARK_PAD + (i / (n - 1)) * (SPARK_W - 2 * SPARK_PAD);
    const yIn = SPARK_H - SPARK_PAD - (v.uTok / max) * (SPARK_H - 2 * SPARK_PAD);
    const yOut = SPARK_H - SPARK_PAD - (v.pTok / max) * (SPARK_H - 2 * SPARK_PAD);
    return { cx, yIn, yOut, uTok: v.uTok, pTok: v.pTok, ts: v.ts };
  });
});

// Latency sparkline (Pi-inspired: per-call duration trajectory). Pulls from
// allToolCalls (last 20 paired end events). Slow calls paint their dot
// danger color so the sparkline doubles as a slow-spotting view.
const latencyHistory = computed<{ ms: number; label: string; error?: string }[]>(() => {
  return allToolCalls.value
    .filter(t => typeof t.ms === "number")
    .map(t => ({ ms: t.ms as number, label: t.label, error: t.error }));
});
const latencyMin = computed(() => latencyHistory.value.length ? Math.min(...latencyHistory.value.map(x => x.ms)) : 0);
const latencyMax = computed(() => latencyHistory.value.length ? Math.max(...latencyHistory.value.map(x => x.ms)) : 0);
// Pi-inspired: fastest/latest call indices — paired with slow/stuck, the
// min/max/latest trio tells users the dynamic range of session latency.
// 1-based to match p.idx convention from pin sparkline (iter 220).
// Latest = last index since latencyHistory is time-ordered.
const latencySparkMinIdx = computed<number>(() => {
  const arr = latencyHistory.value;
  if (arr.length < 2) return -1;
  let mi = 0;
  for (let i = 1; i < arr.length; i++) if (arr[i].ms < arr[mi].ms) mi = i;
  return mi + 1;
});
const latencySparkLatestIdx = computed<number>(() => {
  const arr = latencyHistory.value;
  return arr.length >= 2 ? arr.length : -1;
});
const latencyAvg = computed(() => {
  const arr = latencyHistory.value;
  if (!arr.length) return 0;
  return Math.round(arr.reduce((s, x) => s + x.ms, 0) / arr.length);
});
// Pi-inspired: p90 latency — typical "worst-case" experience (90% of calls
// are at or below this). Requires >= 3 samples to be meaningful; below
// that returns 0 (tooltip renders empty).
const latencyP90 = computed(() => {
  const arr = latencyHistory.value.map(x => x.ms).sort((a, b) => a - b);
  if (arr.length < 3) return 0;
  const idx = Math.min(arr.length - 1, Math.floor(arr.length * 0.9));
  return arr[idx];
});
// Pi-inspired: median latency — midpoint of the distribution. Requires
// >= 3 samples to be meaningful (n<3 → 0). Symmetric to pin iter 139.
const latencyMedian = computed(() => {
  const arr = latencyHistory.value.map(x => x.ms).sort((a, b) => a - b);
  if (arr.length < 3) return 0;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 === 0 ? Math.round((arr[mid - 1] + arr[mid]) / 2) : arr[mid];
});
// Reference-line Y coords for the latency sparkline, normalized to the
// same scale as the data (0..max). Symmetric to pin iter 148/149.
const latencyAvgY = computed<number>(() => {
  const max = latencyMax.value || 1;
  return SPARK_H - SPARK_PAD - (latencyAvg.value / max) * (SPARK_H - 2 * SPARK_PAD);
});
const latencyMedianY = computed<number>(() => {
  if (latencyMedian.value === 0) return -10;
  const max = latencyMax.value || 1;
  return SPARK_H - SPARK_PAD - (latencyMedian.value / max) * (SPARK_H - 2 * SPARK_PAD);
});
const latencyP90Y = computed<number>(() => {
  if (latencyP90.value === 0) return -10;
  const max = latencyMax.value || 1;
  return SPARK_H - SPARK_PAD - (latencyP90.value / max) * (SPARK_H - 2 * SPARK_PAD);
});
const latencySparkPath = computed<string>(() => {
  const data = latencyHistory.value;
  if (data.length < 2) return "";
  const max = latencyMax.value || 1;
  const n = data.length;
  const points = data.map((v, i) => {
    const x = SPARK_PAD + (i / (n - 1)) * (SPARK_W - 2 * SPARK_PAD);
    const y = SPARK_H - SPARK_PAD - (v.ms / max) * (SPARK_H - 2 * SPARK_PAD);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M ${points.join(" L ")}`;
});
const latencySparkPoints = computed<{ cx: number; cy: number; ms: number; label: string; error?: string }[]>(() => {
  const data = latencyHistory.value;
  if (data.length < 2) return [];
  const max = latencyMax.value || 1;
  const n = data.length;
  return data.map((v, i) => {
    const cx = SPARK_PAD + (i / (n - 1)) * (SPARK_W - 2 * SPARK_PAD);
    const cy = SPARK_H - SPARK_PAD - (v.ms / max) * (SPARK_H - 2 * SPARK_PAD);
    return { cx, cy, ms: v.ms, label: v.label, error: v.error };
  });
});
// Pi-inspired: stuck-call detection — a tool call is "stuck" when its latency
// exceeds 2× median (requires n ≥ 3 so median is meaningful). Stuck is a
// stronger signal than slow (≥ slowThreshold): slow means above threshold,
// stuck means statistically anomalous relative to this session's typical
// latency. Returns 1-based indices matching p.idx for v-for lookup.
// Symmetric to ChatToolbar's mcpPinStuckIndices (iter 214).
const latencyStuckIndices = computed<number[]>(() => {
  const m = latencyMedian.value;
  if (m <= 0) return [];
  const cutoff = 2 * m;
  const out: number[] = [];
  latencyHistory.value.forEach((v, i) => { if (v.ms >= cutoff) out.push(i + 1); });
  return out;
});
// Pi-inspired: formatted stuck-call summary for tooltip — "call N (Xms)"
// per stuck call, capped at 3 + "+K more" tail. Lets users read which calls
// were stuck and their latency without hovering each ring. (iter 230)
const latencyStuckSummary = computed<string>(() => {
  const indices = latencyStuckIndices.value;
  if (!indices.length) return "";
  const arr = latencyHistory.value;
  const parts = indices.slice(0, 3).map(idx => `call ${idx} (${arr[idx - 1]?.ms ?? 0}ms)`);
  if (indices.length > 3) parts.push(`+${indices.length - 3} more`);
  return parts.join(", ");
});
// Pi-inspired: cost-stuck detection — a message is "cost-stuck" when its
// cumulative cost jump exceeds 2× median (n ≥ 3). Symmetric to latency stuck
// (iter 215) but for $ spend spikes. Returns 1-based indices matching
// costSparkPoints for v-for lookup. (iter 232)
const costStuckIndices = computed<number[]>(() => {
  const m = costSparkMedian.value;
  if (m <= 0) return [];
  const cutoff = 2 * m;
  const out: number[] = [];
  costHistory.value.forEach((v, i) => { if (v >= cutoff) out.push(i + 1); });
  return out;
});
const costStuckSummary = computed<string>(() => {
  const indices = costStuckIndices.value;
  if (!indices.length) return "";
  const arr = costHistory.value;
  const parts = indices.slice(0, 3).map(idx => `msg ${idx} (${formatCost(arr[idx - 1])})`);
  if (indices.length > 3) parts.push(`+${indices.length - 3} more`);
  return parts.join(", ");
});
// Pi-inspired: token-stuck detection — a message is "token-stuck" when its
// total token count (in + out) exceeds 2× median total (n ≥ 3). Symmetric
// to latency/cost stuck. Returns 1-based indices matching tokenSparkPoints.
// (iter 232)
const tokenStuckIndices = computed<number[]>(() => {
  const d = tokenHistory.value;
  if (d.length < 3) return [];
  const totals = d.map(v => v.uTok + v.pTok).sort((a, b) => a - b);
  const mid = Math.floor(totals.length / 2);
  const median = totals.length % 2 === 0 ? Math.round((totals[mid - 1] + totals[mid]) / 2) : totals[mid];
  if (median <= 0) return [];
  const cutoff = 2 * median;
  const out: number[] = [];
  d.forEach((v, i) => { if (v.uTok + v.pTok >= cutoff) out.push(i + 1); });
  return out;
});
const tokenStuckSummary = computed<string>(() => {
  const indices = tokenStuckIndices.value;
  if (!indices.length) return "";
  const arr = tokenHistory.value;
  const parts = indices.slice(0, 3).map(idx => `msg ${idx} (in ${arr[idx - 1]?.uTok ?? 0} / out ${arr[idx - 1]?.pTok ?? 0})`);
  if (indices.length > 3) parts.push(`+${indices.length - 3} more`);
  return parts.join(", ");
});
// Y coordinate of the slow threshold reference line, normalized same as data.
const latencyThresholdY = computed<number>(() => {
  const max = latencyMax.value || 1;
  if (slowThresholdMs.value > max) return -10; // off-chart
  return SPARK_H - SPARK_PAD - (slowThresholdMs.value / max) * (SPARK_H - 2 * SPARK_PAD);
});
// Per-sample SVG point coords (for hover circles with native <title>).
// Pi-inspired: surface per-data-point details without JS hover logic —
// each point is a small <circle> with a native tooltip showing cost + ts.
// `costHoverIdx` adds a crosshair vertical line on hover for visual focus.
const costHoverIdx = ref<number | null>(null);
const latencyHoverIdx = ref<number | null>(null);
// Pi-inspired: adaptive hit-strip width. 6px is the ideal hit width for
// sparse sparklines; for dense ones (n large) shrink to SPARK_W/n - 1px
// gap to avoid overlap. Clamp to [2, 6] — narrower than 2px defeats
// the purpose. Symmetric for cost + latency (single-series sparklines).
const costStripW = computed<number>(() => {
  const n = costSparkPoints.value.length;
  if (n < 2) return 6;
  return Math.max(2, Math.min(6, SPARK_W / n - 1));
});
const latencyStripW = computed<number>(() => {
  const n = latencySparkPoints.value.length;
  if (n < 2) return 6;
  return Math.max(2, Math.min(6, SPARK_W / n - 1));
});
// Pi-inspired: per-point strip width based on min distance to immediate
// neighbors. Handles non-uniform cx spacing (e.g., paused time between
// messages) — strip shrinks to half the smallest neighbor gap so it
// never overlaps adjacent strips. Cap [2, 6]. Symmetric for cost + latency.
const costStripWidths = computed<number[]>(() => {
  const pts = costSparkPoints.value;
  if (pts.length < 2) return [];
  return pts.map((p, i) => {
    const left = i > 0 ? p.cx - pts[i - 1].cx : SPARK_W;
    const right = i < pts.length - 1 ? pts[i + 1].cx - p.cx : SPARK_W;
    const gap = Math.min(left, right);
    return Math.max(2, Math.min(6, gap / 2 - 0.5));
  });
});
const latencyStripWidths = computed<number[]>(() => {
  const pts = latencySparkPoints.value;
  if (pts.length < 2) return [];
  return pts.map((p, i) => {
    const left = i > 0 ? p.cx - pts[i - 1].cx : SPARK_W;
    const right = i < pts.length - 1 ? pts[i + 1].cx - p.cx : SPARK_W;
    const gap = Math.min(left, right);
    return Math.max(2, Math.min(6, gap / 2 - 0.5));
  });
});
const costSparkPoints = computed<{ cx: number; cy: number; cost: number; ts: number | null }[]>(() => {
  const data = costHistory.value;
  if (data.length < 2) return [];
  const max = data[data.length - 1] || 1;
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const n = data.length;
  const msgs = store.activeConversation?.messages ?? [];
  return data.map((v, i) => {
    const cx = SPARK_PAD + (i / (n - 1)) * (SPARK_W - 2 * SPARK_PAD);
    const cy = SPARK_H - SPARK_PAD - ((v - min) / range) * (SPARK_H - 2 * SPARK_PAD);
    return { cx, cy, cost: v, ts: msgs[i]?.timestamp ?? null };
  });
});

// ── Context window pressure gauge (Pi-inspired: token usage vs model capacity) ──
// When agent mode provides actual token counts from the API, use those instead of
// the coarse chars/4 estimate. The agent's totalTokens is authoritative; fall back
// to estimatedTokens for non-agent sessions.
const pressureTokens = computed(() => {
  if (store.agentUsage?.totalTokens) return store.agentUsage.totalTokens;
  return estimatedTokens.value;
});
const tokenPercent = computed(() => {
  const pct = Math.round((pressureTokens.value / CONTEXT_WINDOW) * 100);
  return Math.min(pct, 100);
});

const tokenLevel = computed<"low" | "mid" | "high" | "critical">(() => {
  // Use store's contextPressure for more accurate detection
  if (store.contextPressure?.level === "critical") return "critical";
  if (tokenPercent.value < 50) return "low";
  if (tokenPercent.value < 80) return "mid";
  if (tokenPercent.value < 95) return "high";
  return "critical";
});

// Pressure gauge segments: show how much of the window is consumed by agent turns.
// Each segment = one agent turn's token budget, stacked to show cumulative pressure.
const agentPressureSegments = computed(() => {
  if (!store.agentUsage?.totalTokens) return [];
  const summaries = store.agentTurnSummaries ?? [];
  if (summaries.length < 2) return [];
  const segments: Array<{ pct: number; level: string }> = [];
  for (const s of summaries) {
    const t = s.usage?.turnTokens ?? 0;
    const pct = Math.round((t / CONTEXT_WINDOW) * 100);
    if (pct > 0) segments.push({ pct, level: pct > 15 ? "high" : pct > 5 ? "mid" : "low" });
  }
  return segments;
});

const ragActive = computed(() => store.ragActive);
const ragEnabled = computed(() => store.ragEnabled);
const webSearchOn = computed(() => store.webSearchEnabled);

// ── Session duration (Pi-inspired: how long has this session been active) ──
const sessionCreatedAt = computed(() => store.activeConversation?.createdAt ?? null);
function formatDuration(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) {
    const min = Math.floor(ms / 60_000);
    const sec = Math.round((ms % 60_000) / 1000);
    return `${min}m${sec}s`;
  }
  const hr = Math.floor(ms / 3_600_000);
  const min = Math.round((ms % 3_600_000) / 60_000);
  return `${hr}h${min}m`;
}
const sessionDurationMs = computed(() => {
  const t = sessionCreatedAt.value;
  if (!t) return 0;
  return Math.max(0, now.value - t);
});

// ── Idle indicator (Pi-inspired: how long since the last message) ──
const lastMessageTimestamp = computed(() => {
  const msgs = store.activeConversation?.messages ?? [];
  if (!msgs.length) return null;
  return msgs[msgs.length - 1]?.timestamp ?? null;
});
const idleMs = computed(() => {
  const t = lastMessageTimestamp.value;
  if (!t) return 0;
  return Math.max(0, now.value - t);
});
const isStreaming = computed(() => store.sending);

const hasActiveSession = computed(() => !!store.activeConversation);

// ── Pi-inspired: granular streaming phase + tool-call timeline ──

type Phase = "idle" | "fetching" | "thinking" | "retrieving" | "streaming" | "done";
const phase = computed<Phase>(() => store.streamingPhase as Phase);

const phaseLabel = computed(() => {
  switch (phase.value) {
    case "fetching": return "Fetching";
    case "retrieving": return "Retrieving";
    case "thinking": return "Thinking";
    case "streaming": return "Streaming";
    case "done": return "Done";
    default: return "Generating";
  }
});

// Show the live "Generating" pill only when actively working.
const showPhasePill = computed(() => isStreaming.value || phase.value === "done");

// ── Compaction history (Pi-inspired: silent background state surfaced) ──
const lastCompact = computed(() => store.lastCompaction);
const lastCompactTooltip = computed(() => {
  const c = lastCompact.value;
  if (!c) return "";
  const when = new Date(c.timestamp).toLocaleTimeString();
  return `Compacted at ${when}: ${c.before} → ${c.after} msgs (-${c.saved})`;
});
const lastCompactLabel = computed(() => {
  const c = lastCompact.value;
  if (!c) return "";
  return `${c.before}→${c.after}`;
});

// ── Agent status (Pi-inspired: agent mode indicator + live turn/token info) ──
const agentActive = computed(() => store.agentMode);
const agentTurnInfo = computed(() => {
  if (!store.agentUsage) return null;
  const u = store.agentUsage;
  return { current: u.turns, max: store.agentMaxTurns, totalTokens: u.totalTokens, turnTokens: u.turnTokens };
});
const agentCompactionInfo = computed(() => store.agentCompaction);
const agentCompactionTooltip = computed(() => {
  const c = agentCompactionInfo.value;
  if (!c) return "";
  const when = new Date(c.timestamp).toLocaleTimeString();
  return `Agent compaction at ${when}: ${c.beforeCount} → ${c.afterCount} msgs (saved ~${c.savedTokens} tokens)`;
});

// Live tool execution indicator (Pi: show currently running tool during agent mode)
const runningTool = computed(() => {
  if (!store.agentMode || !store.sending) return null;
  const events = store.toolEvents ?? [];
  // Find the most recent "start" event without a matching "end"
  const starts = new Map<string, { name: string; label: string; ts: number }>();
  for (const e of events) {
    if (e.phase === "start") starts.set(e.name, { name: e.name, label: e.label, ts: e.timestamp });
    else starts.delete(e.name);
  }
  if (!starts.size) return null;
  const running = [...starts.values()][0];
  const elapsed = Date.now() - running.ts;
  return { name: running.name, label: running.label, elapsedMs: elapsed };
});

// Pair up toolEvents into start/end pairs for the recent timeline.
// Each pair = one tool invocation. Unpaired "start" = currently running.
const recentToolCalls = computed(() => {
  const events = store.toolEvents ?? [];
  const out: Array<{ name: string; label: string; running: boolean; error?: string; ms?: number; ts?: number; endTs?: number; content?: string }> = [];
  const starts = new Map<string, { name: string; label: string; ts: number }>();
  for (const e of events) {
    if (e.phase === "start") {
      starts.set(e.name, { name: e.name, label: e.label, ts: e.timestamp });
    } else {
      const s = starts.get(e.name);
      if (!s) continue;
      out.push({
        name: s.name,
        label: s.label,
        running: false,
        error: e.error,
        ms: Math.max(0, e.timestamp - s.ts),
        endTs: e.timestamp,
        content: e.content,
      });
      starts.delete(e.name);
    }
  }
  for (const s of starts.values()) {
    out.push({ name: s.name, label: s.label, running: true, ts: s.ts });
  }
  return out.slice(-3).reverse();
});

// Full paired tool-call history (same pairing logic, no slice).
// Toggled by the "All" affordance — Pi surfaces the full session tool
// execution history, not just the last 3.
const allToolCalls = computed(() => {
  const events = store.toolEvents ?? [];
  const out: Array<{ name: string; label: string; running: boolean; error?: string; ms?: number; ts?: number; endTs?: number; content?: string }> = [];
  const starts = new Map<string, { name: string; label: string; ts: number }>();
  for (const e of events) {
    if (e.phase === "start") {
      starts.set(e.name, { name: e.name, label: e.label, ts: e.timestamp });
    } else {
      const s = starts.get(e.name);
      if (!s) continue;
      out.push({
        name: s.name,
        label: s.label,
        running: false,
        error: e.error,
        ms: Math.max(0, e.timestamp - s.ts),
        endTs: e.timestamp,
        content: e.content,
      });
      starts.delete(e.name);
    }
  }
  for (const s of starts.values()) {
    out.push({ name: s.name, label: s.label, running: true, ts: s.ts });
  }
  return out.slice(-20).reverse();
});

const showAllToolCalls = ref(false);
const showOnlyFailed = ref(false);
const showOnlySlow = ref(false);
const { slowThresholdMs } = useSlowThreshold();
// Pi-inspired: click a sparkline data point → scroll to the corresponding
// message bubble + flash it. MessageBubble root carries `data-msg-ts` for
// O(1) lookup (see MessageBubble scrollToPrevRoleMessage).
function scrollToMessageByTs(ts: number | null): void {
  if (ts == null) return;
  const el = document.querySelector<HTMLElement>(`[data-msg-ts="${ts}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("mb-bubble--flash");
  window.setTimeout(() => el.classList.remove("mb-bubble--flash"), 2000);
}
const visibleToolCalls = computed(() => {
  // When filtering to failed / slow, scan the full history (last 20) — last 3
  // might not contain any match, leaving the user with an empty list.
  const base = (showAllToolCalls.value || showOnlyFailed.value || showOnlySlow.value)
    ? allToolCalls.value
    : recentToolCalls.value;
  let out = base;
  if (showOnlyFailed.value) out = out.filter(t => !!t.error);
  if (showOnlySlow.value) out = out.filter(t => typeof t.ms === "number" && t.ms >= slowThresholdMs.value);
  return out;
});
const failedCallCount = computed(() => {
  const events = store.toolEvents ?? [];
  let count = 0;
  const starts = new Set<string>();
  for (const e of events) {
    if (e.phase === "start") starts.add(e.name);
    else if (starts.has(e.name)) {
      if (e.error) count++;
      starts.delete(e.name);
    }
  }
  return count;
});
const slowCallCount = computed(() => {
  const events = store.toolEvents ?? [];
  let count = 0;
  const starts = new Map<string, number>();
  for (const e of events) {
    if (e.phase === "start") starts.set(e.name, e.timestamp);
    else if (starts.has(e.name)) {
      const s = starts.get(e.name)!;
      if (e.timestamp - s >= slowThresholdMs.value) count++;
      starts.delete(e.name);
    }
  }
  return count;
});
const slowThresholdInput = ref("");
const slowThresholdPopoverVisible = ref(false);
function applySlowThreshold(): void {
  const v = parseInt(slowThresholdInput.value, 10);
  if (Number.isFinite(v) && v > 0) setSlowThreshold(v);
  slowThresholdPopoverVisible.value = false;
}
const toolCallsOverflow = computed(() => {
  const total = (() => {
    const events = store.toolEvents ?? [];
    let count = 0;
    const starts = new Set<string>();
    for (const e of events) {
      if (e.phase === "start") starts.add(e.name);
      else if (starts.has(e.name)) { count++; starts.delete(e.name); }
    }
    count += starts.size;
    return count;
  })();
  return total > 3;
});

// Cumulative tool execution time across the whole session — Pi surfaces
// session-level totals alongside the per-call timeline.
const totalToolMs = computed(() => {
  const events = store.toolEvents ?? [];
  let sum = 0;
  const starts = new Map<string, number>();
  for (const e of events) {
    if (e.phase === "start") {
      starts.set(e.name, e.timestamp);
    } else {
      const s = starts.get(e.name);
      if (s != null) {
        sum += Math.max(0, e.timestamp - s);
        starts.delete(e.name);
      } else if (typeof e.durationMs === "number") {
        sum += e.durationMs;
      }
    }
  }
  // Account for currently-running tools (live ticking).
  for (const ts of starts.values()) {
    sum += Math.max(0, now.value - ts);
  }
  return sum;
});

// Completed call count + average latency (Pi-inspired: session aggregate).
const toolCallCount = computed(() => {
  const events = store.toolEvents ?? [];
  let count = 0;
  const starts = new Set<string>();
  for (const e of events) {
    if (e.phase === "start") starts.add(e.name);
    else if (starts.has(e.name)) { count++; starts.delete(e.name); }
  }
  return count;
});
const avgToolMs = computed(() => {
  const n = toolCallCount.value;
  if (!n) return 0;
  return Math.round(totalToolMs.value / n);
});

// Per-call durations (paired end - start). Drives max + p95 latency
// (Pi-inspired: surface tail latency, not just the mean).
const toolCallDurations = computed<number[]>(() => {
  const events = store.toolEvents ?? [];
  const out: number[] = [];
  const starts = new Map<string, number>();
  for (const e of events) {
    if (e.phase === "start") {
      starts.set(e.name, e.timestamp);
    } else {
      const s = starts.get(e.name);
      if (s != null) {
        out.push(Math.max(0, e.timestamp - s));
        starts.delete(e.name);
      } else if (typeof e.durationMs === "number") {
        out.push(e.durationMs);
      }
    }
  }
  return out;
});
const maxToolMs = computed(() => {
  const ds = toolCallDurations.value;
  return ds.length ? Math.max(...ds) : 0;
});
const p95ToolMs = computed(() => {
  const ds = toolCallDurations.value;
  if (!ds.length) return 0;
  const sorted = [...ds].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
  return sorted[idx];
});

function formatTotalMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const min = Math.floor(ms / 60_000);
  const sec = Math.round((ms % 60_000) / 1000);
  return `${min}m${sec}s`;
}

// ── Live elapsed time for running tools (Pi-inspired: ticking duration) ──
// Tick every 500ms while a tool is running OR a recently-finished tool
// is still within its 500ms "fresh" window.
const hasRunning = computed(() => recentToolCalls.value.some(t => t.running));
const FRESH_WINDOW_MS = 500;
function isFresh(endTs: number | undefined): boolean {
  if (!endTs) return false;
  return now.value - endTs < FRESH_WINDOW_MS;
}
const hasFresh = computed(() => recentToolCalls.value.some(t => isFresh(t.endTs)));
const needsTick = computed(() => hasRunning.value || hasFresh.value);
const now = ref(Date.now());
let tickHandle: ReturnType<typeof setInterval> | null = null;
function startTick(): void {
  if (tickHandle) return;
  tickHandle = setInterval(() => { now.value = Date.now(); }, 500);
}
function stopTick(): void {
  if (tickHandle) { clearInterval(tickHandle); tickHandle = null; }
}
// Watch needsTick — start/stop the timer accordingly.
watch(needsTick, (should) => {
  if (should) startTick();
  else stopTick();
}, { immediate: true });
onUnmounted(stopTick);

function formatRunningSec(ts: number): string {
  const sec = Math.max(0, (now.value - ts) / 1000);
  if (sec < 10) return `${sec.toFixed(1)}s`;
  return `${Math.round(sec)}s`;
}

// ── Slow-tool warning (Pi-inspired: detect stuck tool execution) ──
const SLOW_THRESHOLD_MS = 30_000;
function isSlowTool(ts: number | undefined): boolean {
  if (!ts) return false;
  return now.value - ts > SLOW_THRESHOLD_MS;
}

// ── Result preview (Pi-inspired: surface tool output on hover) ──
const copiedChipName = ref<string | null>(null);
const failedChipName = ref<string | null>(null);
async function copyToolResult(content: string, name: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(content);
    failedChipName.value = null;
    copiedChipName.value = name;
    setTimeout(() => {
      if (copiedChipName.value === name) copiedChipName.value = null;
    }, 1500);
  } catch {
    copiedChipName.value = null;
    failedChipName.value = name;
    setTimeout(() => {
      if (failedChipName.value === name) failedChipName.value = null;
    }, 1500);
  }
}

async function saveToolResultToKB(content: string): Promise<void> {
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
</script>

<template>
  <div v-if="hasActiveSession" class="ssb-bar">
    <!-- Session duration (Pi: how long this conversation has been active) -->
    <span
      v-if="sessionDurationMs > 0"
      class="ssb-item ssb-session-duration"
      :title="`Session started ${new Date(sessionCreatedAt!).toLocaleString()} — live duration`"
    >
      <el-icon :size="12"><Timer /></el-icon>
      <span class="ssb-label">{{ formatDuration(sessionDurationMs) }}</span>
    </span>

    <!-- Idle indicator (Pi: time since the last message in this session) -->
    <span
      v-if="idleMs > 0"
      class="ssb-item ssb-idle"
      :class="{ 'ssb-idle--stale': idleMs > 5 * 60_000 }"
      :title="`Last message ${new Date(lastMessageTimestamp!).toLocaleTimeString()} · idle for ${formatDuration(idleMs)}`"
    >
      <span class="ssb-label">idle {{ formatDuration(idleMs) }}</span>
    </span>

    <!-- Source-context chip — always visible when session has a from: tag.
         Symmetric to ConversationListItem's back-to-source button, but shown
         in the status bar so deep-linked sessions surface their origin. -->
    <span
      v-if="sourceUrl"
      class="ssb-item ssb-source"
      :title="`Back to source: ${sourceUrl}`"
      @click="backToSource"
    >
      <el-icon :size="12"><Back /></el-icon>
      <span class="ssb-label">{{ sourceDomainLabel || "source" }}</span>
    </span>

    <span class="ssb-sep">|</span>

    <!-- Model -->
    <span class="ssb-item" title="Model">
      <el-icon :size="12"><Cpu /></el-icon>
      <span class="ssb-label">{{ DEFAULT_MODEL }}</span>
    </span>

    <span class="ssb-sep">|</span>

    <!-- Context files -->
    <span
      class="ssb-item"
      :class="{ 'ssb-active': ctxFileCount > 0 }"
      :title="`${ctxFileCount} context file(s)`"
    >
      <el-icon :size="12"><Document /></el-icon>
      <span class="ssb-label">{{ ctxFileCount }} ctx</span>
    </span>

    <!-- Token usage bar (Pi-inspired: context window pressure gauge) -->
    <span class="ssb-item ssb-item--tokens" :title="`~${pressureTokens} / ${CONTEXT_WINDOW} tokens${store.agentUsage?.totalTokens ? ' (actual from agent)' : ' (estimated from chars/4)'}`">
      <span class="ssb-token-bar">
        <!-- Agent turn segments (stacked per-turn token consumption) -->
        <template v-if="agentPressureSegments.length">
          <span
            v-for="(seg, i) in agentPressureSegments"
            :key="i"
            class="ssb-token-seg"
            :class="`ssb-token-seg--${seg.level}`"
            :style="{ width: seg.pct + '%' }"
          />
        </template>
        <!-- Fill bar (always visible, layered behind segments) -->
        <span
          class="ssb-token-fill"
          :class="`ssb-token-fill--${tokenLevel}`"
          :style="{ width: tokenPercent + '%' }"
        />
      </span>
      <span class="ssb-label ssb-token-pct">{{ tokenPercent }}%</span>
    </span>

    <!-- Context-tight warning (Pi-inspired: surface budget pressure + suggest action) -->
    <span
      v-if="tokenLevel === 'high' || tokenLevel === 'critical'"
      class="ssb-item ssb-context-warn"
      :class="{ 'ssb-context-warn--critical': tokenLevel === 'critical' }"
      :title="tokenLevel === 'critical' ? `Context window ${tokenPercent}% full — near overflow! Run /compact immediately to summarize history and prevent errors.` : `Context window ~${tokenPercent}% full. Run /compact to summarize history and free up budget — leaving the most recent messages intact.`"
      @click="store.input = '/compact'"
    >{{ tokenLevel === 'critical' ? '⚠⚠ /compact' : '⚠ /compact' }}</span>

    <!-- Per-role token split (Pi-inspired: input vs output economics) -->
    <el-tooltip placement="bottom" :show-after="300">
      <template #content>
        <div class="ssb-token-tip">
          <div><b class="ssb-token-tip-in">Input (user):</b> ~{{ userTokens }} tok · {{ userChars }} chars · {{ userMsgCount }} message(s)</div>
          <div><b class="ssb-token-tip-out">Output (pet):</b> ~{{ petTokens }} tok · {{ petChars }} chars · {{ petMsgCount }} message(s)</div>
          <div><b>Total:</b> ~{{ estimatedTokens }} tok / {{ CONTEXT_WINDOW }} context window · 80% ctx {{ Math.round(CONTEXT_WINDOW * 0.8) }} tok<span v-if="tokenProjectionPoint"> · projected +10 msgs in {{ Math.round(tokenProjectionPoint.inTok) }} / out {{ Math.round(tokenProjectionPoint.outTok) }} tok</span></div>
          <div v-if="tokenRatio">Output:Input ratio {{ tokenRatio }}× — higher means AI is producing more relative to your prompts</div>
          <div v-else>Send a prompt to see the output:input ratio</div>
          <div v-if="tokenHistory.length >= 2" class="ssb-cost-spark-wrap">
            <span class="ssb-cost-spark-label">Trajectory ({{ tokenHistory.length }} msgs, min {{ tokenSparkMin }} · avg in {{ tokenSparkAvgIn }} / out {{ tokenSparkAvgOut }}<span v-if="tokenSparkMedianIn > 0 || tokenSparkMedianOut > 0"> · median in {{ tokenSparkMedianIn }} / out {{ tokenSparkMedianOut }}</span><span v-if="tokenSparkP90In > 0"> · p90 in {{ tokenSparkP90In }}</span><span v-if="tokenSparkP90Out > 0"> / out {{ tokenSparkP90Out }}</span> · max {{ tokenSparkMax }} tok · 80% peak {{ Math.round(tokenSparkMax * 0.8) }} tok · 80% ctx {{ Math.round(CONTEXT_WINDOW * 0.8) }} tok<span v-if="tokenSparkLatest"> · latest in {{ tokenSparkLatest.uTok }} / out {{ tokenSparkLatest.pTok }}</span><span v-if="tokenSparkLatest && tokenSparkSmallestIdx > 0 && tokenSparkLatestIdx > 0"> · smallest msg {{ tokenSparkSmallestIdx }} (in {{ tokenHistory[tokenSparkSmallestIdx - 1].uTok }} / out {{ tokenHistory[tokenSparkSmallestIdx - 1].pTok }}) · latest msg {{ tokenSparkLatestIdx }} (in {{ tokenSparkLatest.uTok }} / out {{ tokenSparkLatest.pTok }})</span><span v-if="tokenStuckIndices.length"> · stuck: {{ tokenStuckSummary }}</span>):</span>
            <svg class="ssb-cost-spark" :width="SPARK_W" :height="SPARK_H" :viewBox="`0 0 ${SPARK_W} ${SPARK_H}`" aria-label="Input vs output token trajectory" @mouseleave="tokenHoverIdx = null; tokenHoverSeries = null">
              <line v-if="tokenSparkMedianInY >= 0" :x1="0" :x2="SPARK_W" :y1="tokenSparkMedianInY" :y2="tokenSparkMedianInY" stroke="var(--el-color-info-light-5)" stroke-width="0.4" stroke-dasharray="1,1" opacity="0.6" />
              <line v-if="tokenSparkP90InY >= 0" :x1="0" :x2="SPARK_W" :y1="tokenSparkP90InY" :y2="tokenSparkP90InY" stroke="var(--el-color-warning-light-5)" stroke-width="0.4" stroke-dasharray="2,2" opacity="0.6" />
              <line v-if="tokenSparkP90OutY >= 0" :x1="0" :x2="SPARK_W" :y1="tokenSparkP90OutY" :y2="tokenSparkP90OutY" stroke="var(--el-color-warning-light-5)" stroke-width="0.4" stroke-dasharray="2,2" opacity="0.6" />
              <line v-if="tokenSparkMedianOutY >= 0" :x1="0" :x2="SPARK_W" :y1="tokenSparkMedianOutY" :y2="tokenSparkMedianOutY" stroke="var(--el-color-success-light-5)" stroke-width="0.4" stroke-dasharray="1,1" opacity="0.6" />
              <line v-if="tokenSparkAvgInY >= 0" :x1="0" :x2="SPARK_W" :y1="tokenSparkAvgInY" :y2="tokenSparkAvgInY" stroke="var(--el-color-info)" stroke-width="0.4" stroke-dasharray="1,1" opacity="0.4" />
              <line v-if="tokenSparkAvgOutY >= 0" :x1="0" :x2="SPARK_W" :y1="tokenSparkAvgOutY" :y2="tokenSparkAvgOutY" stroke="var(--el-color-success)" stroke-width="0.4" stroke-dasharray="1,1" opacity="0.4" />
              <line v-if="tokenSparkWarnY >= 0" :x1="0" :x2="SPARK_W" :y1="tokenSparkWarnY" :y2="tokenSparkWarnY" stroke="var(--el-text-color-secondary)" stroke-width="0.4" stroke-dasharray="1.5,1.5" opacity="0.5" filter="url(#ssb-spark-glow-lg)" />
              <line v-if="tokenSparkCtxWarnY >= 0" :x1="0" :x2="SPARK_W" :y1="tokenSparkCtxWarnY" :y2="tokenSparkCtxWarnY" stroke="var(--el-color-danger-light-5)" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.7" filter="url(#ssb-spark-glow-lg)" />
              <path :d="tokenSparkPaths.in" fill="none" stroke="var(--el-color-info)" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" />
              <path :d="tokenSparkPaths.out" fill="none" stroke="var(--el-color-success)" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" />
              <circle v-if="tokenSparkWarnPoints.inPt" :cx="tokenSparkWarnPoints.inPt.cx" :cy="tokenSparkWarnPoints.inPt.cy" r="1.5" fill="var(--el-color-info)" stroke="var(--el-bg-color)" stroke-width="0.4"><title>{{ `In crossed 80% peak at msg ${tokenSparkWarnPoints.inPt.idx} · ${tokenSparkWarnPoints.inPt.tok} tok` }}</title></circle>
              <circle v-if="tokenSparkWarnPoints.outPt" :cx="tokenSparkWarnPoints.outPt.cx" :cy="tokenSparkWarnPoints.outPt.cy" r="1.5" fill="var(--el-color-success)" stroke="var(--el-bg-color)" stroke-width="0.4"><title>{{ `Out crossed 80% peak at msg ${tokenSparkWarnPoints.outPt.idx} · ${tokenSparkWarnPoints.outPt.tok} tok` }}</title></circle>
              <line v-if="tokenProjectionPoint && tokenSparkPoints.length" :x1="tokenSparkPoints[tokenSparkPoints.length - 1].cx" :y1="tokenSparkPoints[tokenSparkPoints.length - 1].yIn" :x2="tokenProjectionPoint.x" :y2="tokenProjectionPoint.inY" stroke="var(--el-color-info-light-5)" stroke-width="0.6" stroke-dasharray="1,1" opacity="0.7" filter="url(#ssb-spark-glow-lg)" />
              <line v-if="tokenProjectionPoint && tokenSparkPoints.length" :x1="tokenSparkPoints[tokenSparkPoints.length - 1].cx" :y1="tokenSparkPoints[tokenSparkPoints.length - 1].yOut" :x2="tokenProjectionPoint.x" :y2="tokenProjectionPoint.outY" stroke="var(--el-color-success-light-5)" stroke-width="0.6" stroke-dasharray="1,1" opacity="0.7" filter="url(#ssb-spark-glow-lg)" />
              <circle v-if="tokenProjectionPoint" :cx="tokenProjectionPoint.x" :cy="tokenProjectionPoint.inY" r="1.2" fill="var(--el-color-info-light-5)" stroke="var(--el-bg-color)" stroke-width="0.3" filter="url(#ssb-spark-glow-lg)"><title>{{ `Projected +10 msgs · in: ${Math.round(tokenProjectionPoint.inTok)} tok` }}</title></circle>
              <circle v-if="tokenProjectionPoint" :cx="tokenProjectionPoint.x" :cy="tokenProjectionPoint.outY" r="1.2" fill="var(--el-color-success-light-5)" stroke="var(--el-bg-color)" stroke-width="0.3" filter="url(#ssb-spark-glow-lg)"><title>{{ `Projected +10 msgs · out: ${Math.round(tokenProjectionPoint.outTok)} tok` }}</title></circle>
              <line
                v-if="tokenHoverIdx != null && tokenSparkPoints[tokenHoverIdx]"
                :x1="tokenSparkPoints[tokenHoverIdx].cx"
                :x2="tokenSparkPoints[tokenHoverIdx].cx"
                :y1="0"
                :y2="SPARK_H"
                :stroke="tokenHoverSeries === 'in' ? 'var(--el-color-info)' : tokenHoverSeries === 'out' ? 'var(--el-color-success)' : 'var(--el-text-color-secondary)'"
                stroke-width="0.8"
                stroke-dasharray="1.5,1"
                opacity="0.9"
                filter="url(#ssb-spark-glow-lg)"
              />
              <circle v-if="tokenHoverIdx != null && tokenSparkPoints[tokenHoverIdx]" :cx="tokenSparkPoints[tokenHoverIdx].cx" :cy="1" r="1.2" :fill="tokenHoverSeries === 'in' ? 'var(--el-color-info)' : tokenHoverSeries === 'out' ? 'var(--el-color-success)' : 'var(--el-text-color-secondary)'" filter="url(#ssb-spark-glow-lg)" />
              <circle v-if="tokenHoverIdx != null && tokenSparkPoints[tokenHoverIdx]" :cx="tokenSparkPoints[tokenHoverIdx].cx" :cy="SPARK_H - 1" r="1.2" :fill="tokenHoverSeries === 'in' ? 'var(--el-color-info)' : tokenHoverSeries === 'out' ? 'var(--el-color-success)' : 'var(--el-text-color-secondary)'" filter="url(#ssb-spark-glow-lg)" />
              <rect
                v-for="(p, i) in tokenSparkPoints"
                :key="`in-${i}`"
                :x="p.cx - (tokenHoverIdx === i || i + 1 === tokenSparkSmallestIdx || i + 1 === tokenSparkLatestIdx ? 1.5 : 1)"
                :y="p.yIn - (tokenHoverIdx === i || i + 1 === tokenSparkSmallestIdx || i + 1 === tokenSparkLatestIdx ? 1.1 : 0.65)"
                :width="tokenHoverIdx === i || i + 1 === tokenSparkSmallestIdx || i + 1 === tokenSparkLatestIdx ? 3 : 2"
                :height="tokenHoverIdx === i || i + 1 === tokenSparkSmallestIdx || i + 1 === tokenSparkLatestIdx ? 2.2 : 1.3"
                fill="var(--el-color-info)"
                :filter="i + 1 === tokenSparkSmallestIdx || i + 1 === tokenSparkLatestIdx ? 'url(#ssb-spark-stroke-lg)' : 'none'"
                class="ssb-cost-spark-pt"
              />
              <circle
                v-for="(p, i) in tokenSparkPoints"
                :key="`out-${i}`"
                :cx="p.cx"
                :cy="p.yOut"
                :r="tokenHoverIdx === i || i + 1 === tokenSparkSmallestIdx || i + 1 === tokenSparkLatestIdx ? 2.2 : 1.3"
                fill="var(--el-color-success)"
                :filter="i + 1 === tokenSparkSmallestIdx || i + 1 === tokenSparkLatestIdx ? 'url(#ssb-spark-stroke-lg)' : 'none'"
                class="ssb-cost-spark-pt"
              />
              <circle v-for="idx in tokenStuckIndices" :key="`stuck-in-${idx}`" :cx="tokenSparkPoints[idx - 1].cx" :cy="tokenSparkPoints[idx - 1].yIn" r="2.2" fill="none" stroke="var(--el-color-danger)" stroke-width="0.6" opacity="0.8" pointer-events="none" filter="url(#ssb-spark-stroke-lg)" class="ssb-stuck-ring"><title>{{ `Stuck msg ${idx} · in ${tokenSparkPoints[idx - 1].uTok} / out ${tokenSparkPoints[idx - 1].pTok} tok ≥ 2× median total` }}</title></circle>
              <circle v-for="idx in tokenStuckIndices" :key="`stuck-out-${idx}`" :cx="tokenSparkPoints[idx - 1].cx" :cy="tokenSparkPoints[idx - 1].yOut" r="2.2" fill="none" stroke="var(--el-color-danger)" stroke-width="0.6" opacity="0.8" pointer-events="none" filter="url(#ssb-spark-stroke-lg)" class="ssb-stuck-ring"><title>{{ `Stuck msg ${idx} · in ${tokenSparkPoints[idx - 1].uTok} / out ${tokenSparkPoints[idx - 1].pTok} tok ≥ 2× median total` }}</title></circle>
              <ellipse
                v-for="(p, i) in tokenSparkPoints"
                :key="`hit-in-${i}`"
                :cx="p.cx"
                :cy="p.yIn"
                :rx="tokenHitRxs[i] ?? tokenHitRx"
                :ry="tokenHitRys[i] ?? 2"
                fill="transparent"
                pointer-events="all"
                class="ssb-cost-spark-hit"
                @mouseenter="tokenHoverIdx = i; tokenHoverSeries = 'in'"
                @click="scrollToMessageByTs(p.ts)"
              >
                <title>{{ `Msg ${i + 1}/${tokenSparkPoints.length} · in: ${p.uTok} tok · out: ${p.pTok} tok${p.ts ? ` · ${new Date(p.ts).toLocaleString()}` : ''} — click to jump` }}</title>
              </ellipse>
              <ellipse
                v-for="(p, i) in tokenSparkPoints"
                :key="`hit-out-${i}`"
                :cx="p.cx"
                :cy="p.yOut"
                :rx="tokenHitRxs[i] ?? tokenHitRx"
                :ry="tokenHitRys[i] ?? 2"
                fill="transparent"
                pointer-events="all"
                class="ssb-cost-spark-hit"
                @mouseenter="tokenHoverIdx = i; tokenHoverSeries = 'out'"
                @click="scrollToMessageByTs(p.ts)"
              >
                <title>{{ `Msg ${i + 1}/${tokenSparkPoints.length} · in: ${p.uTok} tok · out: ${p.pTok} tok${p.ts ? ` · ${new Date(p.ts).toLocaleString()}` : ''} — click to jump` }}</title>
              </ellipse>
            </svg>
            <span class="ssb-token-spark-legend">
              <span class="ssb-token-spark-dot ssb-token-spark-dot--in" /> in
              <span class="ssb-token-spark-dot ssb-token-spark-dot--out" /> out
            </span>
            <div class="ssb-spark-legend-wrap">
              <span class="ssb-spark-legend-toggle" title="Toggle legend" @click="toggleSessionLegend">{{ sessionLegendCollapsed ? '▸' : '▾' }} legend</span>
              <div v-show="!sessionLegendCollapsed" class="ssb-spark-legend ssb-spark-legend--stacked">
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-info-light-5); opacity: 0.6"></i>median in</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-warning-light-5); opacity: 0.6"></i>p90 in</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-warning-light-5); opacity: 0.6; border: 1px solid var(--el-color-warning-light-5)"></i>p90 out</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-success-light-5); opacity: 0.6"></i>median out</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-info); opacity: 0.4"></i>avg in</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-success); opacity: 0.4"></i>avg out</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-text-color-secondary); opacity: 0.5"></i>80% peak</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-danger-light-5); opacity: 0.7"></i>80% ctx</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-info); opacity: 0.6; border: 1px solid var(--el-color-info)"></i>smallest msg</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-success); opacity: 0.6; border: 1px solid var(--el-color-success)"></i>latest msg</span>
                <span><i class="ssb-spark-legend-dot" style="background: none; border: 1px solid var(--el-color-danger); opacity: 0.8"></i>stuck (2× median total)</span>
              </div>
            </div>
          </div>
          <div class="ssb-token-tip-note">Coarse chars/4 estimate; real tokenization differs by model</div>
        </div>
      </template>
      <span class="ssb-item ssb-tokens-split">
        <span class="ssb-tokens-bar" :title="`Input ${userTokens} / Output ${petTokens} tok composition`">
          <span class="ssb-tokens-bar-in" :style="{ width: tokenInPct + '%' }" />
          <span class="ssb-tokens-bar-out" :style="{ width: tokenOutPct + '%' }" />
        </span>
        <span class="ssb-tokens-in">{{ userTokens }}</span>
        <span class="ssb-tokens-sep">/</span>
        <span class="ssb-tokens-out">{{ petTokens }}</span>
        <span v-if="tokenRatio" class="ssb-tokens-ratio">×{{ tokenRatio }}</span>
      </span>
    </el-tooltip>

    <!-- Cost estimate (Pi-inspired: $ spend this session) -->
    <el-tooltip placement="bottom" :show-after="300">
      <template #content>
        <div class="ssb-token-tip">
          <div><b>Estimated session cost:</b> {{ formatCost(estimatedCost) }}<span v-if="costProjection > 0"> · projected +10 msgs {{ formatCost(costProjection) }}</span></div>
          <div>Input: {{ userTokens }} tok × ${{ INPUT_RATE_PER_1K }}/1K = {{ formatCost((userTokens / 1000) * INPUT_RATE_PER_1K) }}</div>
          <div>Output: {{ petTokens }} tok × ${{ OUTPUT_RATE_PER_1K }}/1K = {{ formatCost((petTokens / 1000) * OUTPUT_RATE_PER_1K) }}</div>
          <div v-if="costHistory.length >= 2" class="ssb-cost-spark-wrap">
            <span class="ssb-cost-spark-label">Trajectory ({{ costHistory.length }} msgs, min {{ formatCost(costSparkMin) }} · avg {{ formatCost(costSparkAvg) }}<span v-if="costSparkMedian > 0"> · median {{ formatCost(costSparkMedian) }}</span><span v-if="costSparkP90 > 0"> · p90 {{ formatCost(costSparkP90) }}</span> · max {{ formatCost(costSparkMax) }} · latest {{ formatCost(costSparkLatest) }} · 80% peak {{ formatCost(costSparkMax * 0.8) }}<span v-if="costSparkMinIdx > 0 && costSparkLatestIdx > 0"> · cheapest msg {{ costSparkMinIdx }} ({{ formatCost(costHistory[costSparkMinIdx - 1]) }}) · latest msg {{ costSparkLatestIdx }} ({{ formatCost(costSparkLatest) }})</span><span v-if="costStuckIndices.length"> · stuck: {{ costStuckSummary }}</span>):</span>
            <svg class="ssb-cost-spark" :width="SPARK_W" :height="SPARK_H" :viewBox="`0 0 ${SPARK_W} ${SPARK_H}`" :aria-label="`Cumulative cost trajectory across ${costHistory.length} messages, latest $${costSparkLatest.toFixed(4)}`" @mouseleave="costHoverIdx = null">
              <line v-if="costSparkMedianY >= 0" :x1="0" :x2="SPARK_W" :y1="costSparkMedianY" :y2="costSparkMedianY" stroke="var(--el-color-success-light-3)" stroke-width="0.5" stroke-dasharray="1,1" />
              <line v-if="costSparkP90Y >= 0" :x1="0" :x2="SPARK_W" :y1="costSparkP90Y" :y2="costSparkP90Y" stroke="var(--el-color-warning-light-5)" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.6" />
              <line v-if="costSparkAvgY >= 0" :x1="0" :x2="SPARK_W" :y1="costSparkAvgY" :y2="costSparkAvgY" stroke="var(--el-text-color-secondary)" stroke-width="0.5" stroke-dasharray="1,1" opacity="0.6" />
              <line v-if="costSparkWarnY >= 0" :x1="0" :x2="SPARK_W" :y1="costSparkWarnY" :y2="costSparkWarnY" stroke="var(--el-color-warning-light-5)" stroke-width="0.5" stroke-dasharray="1.5,1.5" opacity="0.6" filter="url(#ssb-spark-glow-lg)" />
              <path :d="costSparkPath" fill="none" stroke="var(--el-color-warning)" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" />
              <circle v-if="costSparkWarnPoint" :cx="costSparkWarnPoint.cx" :cy="costSparkWarnPoint.cy" r="1.5" fill="var(--el-color-warning)" stroke="var(--el-bg-color)" stroke-width="0.4"><title>{{ `Crossed 80% peak at msg ${costSparkWarnPoint.idx} · $${costSparkWarnPoint.cost.toFixed(4)}` }}</title></circle>
              <line v-if="costProjectionPoint" :x1="costSparkPoints[costSparkPoints.length - 1]?.cx ?? SPARK_PAD" :y1="costSparkPoints[costSparkPoints.length - 1]?.cy ?? SPARK_H - SPARK_PAD" :x2="costProjectionPoint.x" :y2="costProjectionPoint.y" stroke="var(--el-color-warning-light-3)" stroke-width="0.6" stroke-dasharray="1,1" opacity="0.7" filter="url(#ssb-spark-glow-lg)" />
              <circle v-if="costProjectionPoint" :cx="costProjectionPoint.x" :cy="costProjectionPoint.y" r="1.2" fill="var(--el-color-warning-light-3)" stroke="var(--el-bg-color)" stroke-width="0.3" filter="url(#ssb-spark-glow-lg)"><title>{{ `Projected +10 msgs · $${costProjection.toFixed(4)}` }}</title></circle>
              <line
                v-if="costHoverIdx != null && costSparkPoints[costHoverIdx]"
                :x1="costSparkPoints[costHoverIdx].cx"
                :x2="costSparkPoints[costHoverIdx].cx"
                :y1="0"
                :y2="SPARK_H"
                stroke="var(--el-color-warning)"
                stroke-width="0.8"
                stroke-dasharray="1.5,1"
                opacity="0.8"
                filter="url(#ssb-spark-glow-lg)"
              />
              <circle v-if="costHoverIdx != null && costSparkPoints[costHoverIdx]" :cx="costSparkPoints[costHoverIdx].cx" :cy="1" r="1.2" fill="var(--el-color-warning)" filter="url(#ssb-spark-glow-lg)" />
              <circle v-if="costHoverIdx != null && costSparkPoints[costHoverIdx]" :cx="costSparkPoints[costHoverIdx].cx" :cy="SPARK_H - 1" r="1.2" fill="var(--el-color-warning)" filter="url(#ssb-spark-glow-lg)" />
              <circle
                v-for="(p, i) in costSparkPoints"
                :key="i"
                :cx="p.cx"
                :cy="p.cy"
                :r="costHoverIdx === i || i + 1 === costSparkMinIdx || i + 1 === costSparkLatestIdx ? 2.2 : 1.3"
                fill="var(--el-color-warning)"
                :filter="i + 1 === costSparkMinIdx || i + 1 === costSparkLatestIdx ? 'url(#ssb-spark-stroke-lg)' : 'none'"
                class="ssb-cost-spark-pt"
              />
              <circle v-for="idx in costStuckIndices" :key="`stuck-${idx}`" :cx="costSparkPoints[idx - 1].cx" :cy="costSparkPoints[idx - 1].cy" r="2.2" fill="none" stroke="var(--el-color-danger)" stroke-width="0.6" opacity="0.8" pointer-events="none" filter="url(#ssb-spark-stroke-lg)" class="ssb-stuck-ring"><title>{{ `Stuck msg ${idx} · ${formatCost(costSparkPoints[idx - 1].cost)} ≥ 2× median (${formatCost(costSparkMedian)})` }}</title></circle>
              <rect
                v-for="(p, i) in costSparkPoints"
                :key="`hit-${i}`"
                :x="p.cx - (costStripWidths[i] ?? costStripW) / 2"
                :y="0"
                :width="costStripWidths[i] ?? costStripW"
                :height="SPARK_H"
                fill="transparent"
                pointer-events="all"
                class="ssb-cost-spark-hit"
                @mouseenter="costHoverIdx = i"
                @click="scrollToMessageByTs(p.ts)"
              >
                <title>{{ `Msg ${i + 1}/${costHistory.length} · $${p.cost.toFixed(4)}${p.ts ? ` · ${new Date(p.ts).toLocaleString()}` : ''} — click to jump` }}</title>
              </rect>
            </svg>
            <div class="ssb-spark-legend-wrap">
              <span class="ssb-spark-legend-toggle" title="Toggle legend" @click="toggleSessionLegend">{{ sessionLegendCollapsed ? '▸' : '▾' }} legend</span>
              <div v-show="!sessionLegendCollapsed" class="ssb-spark-legend">
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-success-light-3)"></i>median</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-warning-light-5); opacity: 0.6"></i>p90</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-text-color-secondary); opacity: 0.6"></i>avg</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-warning-light-5)"></i>80% peak</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-warning); opacity: 0.6; border: 1px solid var(--el-color-warning)"></i>cheapest msg</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-primary); opacity: 0.6; border: 1px solid var(--el-color-primary)"></i>latest msg</span>
                <span><i class="ssb-spark-legend-dot" style="background: none; border: 1px solid var(--el-color-danger); opacity: 0.8"></i>stuck (2× median)</span>
              </div>
            </div>
          </div>
          <div class="ssb-token-tip-note">Rates are local defaults; real pricing differs by provider/model.</div>
        </div>
      </template>
      <span class="ssb-item ssb-cost">
        <el-icon :size="11"><Coin /></el-icon>
        <span class="ssb-label">{{ formatCost(estimatedCost) }}</span>
      </span>
    </el-tooltip>

    <span class="ssb-sep">|</span>

    <!-- RAG status -->
    <span
      v-if="ragActive"
      class="ssb-item ssb-active"
      title="RAG active — responses grounded in context files"
    >
      <el-icon :size="12"><DataAnalysis /></el-icon>
      <span class="ssb-label">RAG</span>
    </span>

    <!-- Web search status -->
    <span
      v-if="webSearchOn"
      class="ssb-item ssb-active"
      title="Web search enabled"
    >
      <span class="ssb-dot ssb-dot--web" />
      <span class="ssb-label">Web</span>
    </span>

    <!-- Streaming indicator with granular phase (Pi: turn_start/message_start/message_end) -->
    <span
      v-if="showPhasePill"
      class="ssb-item ssb-active ssb-phase"
      :class="`ssb-phase--${phase}`"
      :title="`Phase: ${phase}`"
    >
      <el-icon v-if="phase === 'streaming'" :size="12"><Loading /></el-icon>
      <span v-else class="ssb-pulse" />
      <span class="ssb-label">{{ phaseLabel }}</span>
    </span>

    <!-- Agent mode indicator (Pi-inspired: agent loop status in the status bar) -->
    <span
      v-if="agentActive"
      class="ssb-item ssb-active ssb-agent"
      title="Agent mode active — multi-turn reasoning with tool calling"
    >
      <el-icon :size="12"><Tools /></el-icon>
      <span class="ssb-label">Agent</span>
    </span>

    <!-- Agent turn counter (Pi-inspired: live turn progress during agent loop) -->
    <span
      v-if="agentActive && agentTurnInfo"
      class="ssb-item ssb-agent-turn"
      :title="`Turn ${agentTurnInfo.current}/${agentTurnInfo.max} · ~${agentTurnInfo.totalTokens} total tokens`"
    >
      <span class="ssb-label">T{{ agentTurnInfo.current }}/{{ agentTurnInfo.max }}</span>
    </span>

    <!-- Live tool execution (Pi: show currently running tool during agent mode) -->
    <span
      v-if="runningTool"
      class="ssb-item ssb-agent-tool"
      :title="`Running: ${runningTool.label} (${(runningTool.elapsedMs / 1000).toFixed(1)}s)`"
    >
      <span class="ssb-pulse" />
      <span class="ssb-label">{{ runningTool.label }}</span>
      <span class="ssb-agent-tool-elapsed">{{ (runningTool.elapsedMs / 1000).toFixed(1) }}s</span>
    </span>

    <!-- Agent token usage (Pi-inspired: per-turn + cumulative token tracking) -->
    <span
      v-if="agentActive && agentTurnInfo"
      class="ssb-item ssb-agent-tokens"
      :title="`Turn tokens: ~${agentTurnInfo.turnTokens} · Total: ~${agentTurnInfo.totalTokens}`"
    >
      <span class="ssb-label">~{{ agentTurnInfo.totalTokens }} tok</span>
    </span>

    <!-- Agent compaction indicator (Pi-inspired: surface agent auto-compaction) -->
    <span
      v-if="agentCompactionInfo"
      class="ssb-item ssb-compact ssb-agent-compact"
      :title="agentCompactionTooltip"
    >
      <el-icon :size="12"><Compass /></el-icon>
      <span class="ssb-label">Agent compacted {{ agentCompactionInfo.beforeCount }}→{{ agentCompactionInfo.afterCount }}</span>
    </span>

    <!-- Compaction history (Pi-inspired: silent background state surfaced) -->
    <span
      v-if="lastCompact"
      class="ssb-item ssb-compact"
      :title="lastCompactTooltip"
    >
      <el-icon :size="12"><Compass /></el-icon>
      <span class="ssb-label">Compacted {{ lastCompactLabel }}</span>
    </span>

    <!-- Tool-call timeline (Pi: tool_execution_start/end events) -->
    <span
      v-if="recentToolCalls.length"
      class="ssb-tools"
      title="Recent tool calls"
    >
      <el-icon :size="11"><Tools /></el-icon>
      <span
        v-if="failedCallCount"
        class="ssb-tools-filter"
        :class="{ 'is-active': showOnlyFailed }"
        :title="showOnlyFailed ? `Showing ${failedCallCount} failed call(s) — click to clear filter` : `${failedCallCount} failed call(s) this session — click to filter`"
        @click="showOnlyFailed = !showOnlyFailed"
      >{{ showOnlyFailed ? '✗ only' : `${failedCallCount}✗` }}</span>
      <span
        v-if="slowCallCount || showOnlySlow"
        class="ssb-tools-filter ssb-tools-filter--slow"
        :class="{ 'is-active': showOnlySlow }"
        :title="showOnlySlow ? `Showing ${slowCallCount} slow call(s) (≥${formatSlowThreshold(slowThresholdMs)}) — click to clear filter` : `${slowCallCount} slow call(s) (≥${formatSlowThreshold(slowThresholdMs)}) this session — click to filter`"
        @click="showOnlySlow = !showOnlySlow"
      >{{ showOnlySlow ? 'slow only' : `${slowCallCount}slow` }}</span>
      <el-popover
        placement="bottom"
        trigger="click"
        :width="220"
        v-model:visible="slowThresholdPopoverVisible"
        @show="slowThresholdInput = String(slowThresholdMs)"
      >
        <template #reference>
          <span
            class="ssb-tools-threshold"
            :class="{ 'is-default': slowThresholdMs === 1000 }"
            :title="`Slow threshold: ${formatSlowThreshold(slowThresholdMs)} — click to adjust`"
          >slow ≥ {{ formatSlowThreshold(slowThresholdMs) }}</span>
        </template>
        <div class="ssb-slow-pop">
          <div class="ssb-slow-pop-label">Slow threshold (ms)</div>
          <el-input
            v-model="slowThresholdInput"
            size="small"
            type="number"
            :placeholder="String(slowThresholdMs)"
            @keyup.enter="applySlowThreshold"
          />
          <div class="ssb-slow-pop-presets">
            <el-button
              v-for="p in SLOW_THRESHOLD_PRESETS"
              :key="p"
              size="small"
              text
              :class="{ 'is-current': p === slowThresholdMs }"
              :title="`Set threshold to ${formatSlowThreshold(p)}`"
              @click="setSlowThreshold(p); slowThresholdInput = String(p)"
            >{{ formatSlowThreshold(p) }}</el-button>
          </div>
          <div class="ssb-slow-pop-actions">
            <el-button size="small" text @click="slowThresholdPopoverVisible = false">Cancel</el-button>
            <el-button size="small" type="primary" @click="applySlowThreshold">Apply</el-button>
          </div>
        </div>
      </el-popover>
      <!-- Latency sparkline (Pi-inspired: per-call duration trajectory) -->
      <el-tooltip v-if="latencySparkPath" placement="bottom" :show-after="300">
        <template #content>
          <div class="ssb-token-tip">
            <div><b>Tool latency trajectory:</b> last {{ latencyHistory.length }} call(s)</div>
            <div>min: {{ latencyMin }}ms · avg: {{ latencyAvg }}ms<span v-if="latencyMedian > 0"> · median: {{ latencyMedian }}ms</span><span v-if="latencyP90 > 0"> · p90: {{ latencyP90 }}ms</span> · max: {{ latencyMax }}ms</div>
            <div v-if="latencySparkMinIdx > 0 && latencySparkLatestIdx > 0">fastest: call {{ latencySparkMinIdx }} ({{ latencyMin }}ms) · latest: call {{ latencySparkLatestIdx }} ({{ latencyHistory[latencyHistory.length - 1]?.ms ?? 0 }}ms)<span v-if="latencyStuckIndices.length"> · stuck: {{ latencyStuckSummary }}</span></div>
            <div class="ssb-token-tip-note">Each point = one tool call's duration. Hover dots for details.</div>
            <div class="ssb-spark-legend-wrap">
              <span class="ssb-spark-legend-toggle" title="Toggle legend" @click="toggleSessionLegend">{{ sessionLegendCollapsed ? '▸' : '▾' }} legend</span>
              <div v-show="!sessionLegendCollapsed" class="ssb-spark-legend">
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-success-light-3)"></i>median</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-text-color-secondary); opacity: 0.6"></i>avg</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-warning-light-5)"></i>p90</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-warning)"></i>slow threshold</span>
                <span><i class="ssb-spark-legend-dot" style="background: none; border: 1px solid var(--el-color-danger); opacity: 0.8"></i>stuck (2× median)</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-danger)"></i>slow</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-success)"></i>fastest</span>
                <span><i class="ssb-spark-legend-dot" style="background: var(--el-color-primary)"></i>latest</span>
              </div>
            </div>
          </div>
        </template>
        <svg class="ssb-latency-spark" :width="SPARK_W" :height="SPARK_H" :viewBox="`0 0 ${SPARK_W} ${SPARK_H}`" aria-label="Tool call latency sparkline" @mouseleave="latencyHoverIdx = null">
          <line v-if="latencyMedianY >= 0" :x1="0" :x2="SPARK_W" :y1="latencyMedianY" :y2="latencyMedianY" stroke="var(--el-color-success-light-3)" stroke-width="0.5" stroke-dasharray="1,1" />
          <line v-if="latencyAvgY >= 0" :x1="0" :x2="SPARK_W" :y1="latencyAvgY" :y2="latencyAvgY" stroke="var(--el-text-color-secondary)" stroke-width="0.5" stroke-dasharray="1,1" opacity="0.6" />
          <line v-if="latencyP90Y >= 0" :x1="0" :x2="SPARK_W" :y1="latencyP90Y" :y2="latencyP90Y" stroke="var(--el-color-warning-light-5)" stroke-width="0.5" stroke-dasharray="2,2" />
          <line :x1="0" :x2="SPARK_W" :y1="latencyThresholdY" :y2="latencyThresholdY" stroke="var(--el-color-warning)" stroke-width="0.5" stroke-dasharray="2,2" filter="url(#ssb-spark-glow-lg)" />
          <path :d="latencySparkPath" fill="none" stroke="var(--el-text-color-secondary)" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" />
          <line v-if="latencyHoverIdx != null && latencySparkPoints[latencyHoverIdx]" :x1="latencySparkPoints[latencyHoverIdx].cx" :x2="latencySparkPoints[latencyHoverIdx].cx" :y1="0" :y2="SPARK_H" :stroke="latencySparkPoints[latencyHoverIdx].ms >= slowThresholdMs ? 'var(--el-color-danger)' : 'var(--el-text-color-secondary)'" stroke-width="0.8" stroke-dasharray="1.5,1" opacity="0.9" filter="url(#ssb-spark-glow-lg)" />
          <circle v-if="latencyHoverIdx != null && latencySparkPoints[latencyHoverIdx]" :cx="latencySparkPoints[latencyHoverIdx].cx" :cy="1" r="1.2" :fill="latencySparkPoints[latencyHoverIdx].ms >= slowThresholdMs ? 'var(--el-color-danger)' : 'var(--el-text-color-secondary)'" filter="url(#ssb-spark-glow-lg)" />
          <circle v-if="latencyHoverIdx != null && latencySparkPoints[latencyHoverIdx]" :cx="latencySparkPoints[latencyHoverIdx].cx" :cy="SPARK_H - 1" r="1.2" :fill="latencySparkPoints[latencyHoverIdx].ms >= slowThresholdMs ? 'var(--el-color-danger)' : 'var(--el-text-color-secondary)'" filter="url(#ssb-spark-glow-lg)" />
          <circle
            v-for="(p, i) in latencySparkPoints"
            :key="i"
            :cx="p.cx"
            :cy="p.cy"
            :r="latencyHoverIdx === i ? 2.2 : 1.3"
            :fill="p.ms >= slowThresholdMs ? 'var(--el-color-danger)' : i + 1 === latencySparkMinIdx ? 'var(--el-color-success)' : i + 1 === latencySparkLatestIdx ? 'var(--el-color-primary)' : 'var(--el-text-color-secondary)'"
            :filter="p.ms >= slowThresholdMs || i + 1 === latencySparkMinIdx || i + 1 === latencySparkLatestIdx ? 'url(#ssb-spark-stroke-lg)' : 'none'"
            class="ssb-cost-spark-pt"
          />
          <circle v-for="idx in latencyStuckIndices" :key="`stuck-${idx}`" :cx="latencySparkPoints[idx - 1].cx" :cy="latencySparkPoints[idx - 1].cy" r="2.2" fill="none" stroke="var(--el-color-danger)" stroke-width="0.6" opacity="0.8" pointer-events="none" filter="url(#ssb-spark-stroke-lg)" class="ssb-stuck-ring"><title>{{ `Stuck call ${idx} · ${latencySparkPoints[idx - 1].ms}ms ≥ 2× median (${latencyMedian}ms)` }}</title></circle>
          <rect
            v-for="(p, i) in latencySparkPoints"
            :key="`hit-${i}`"
            :x="p.cx - (latencyStripWidths[i] ?? latencyStripW) / 2"
            :y="0"
            :width="latencyStripWidths[i] ?? latencyStripW"
            :height="SPARK_H"
            fill="transparent"
            pointer-events="all"
            class="ssb-cost-spark-hit"
            @mouseenter="latencyHoverIdx = i"
          >
            <title>{{ `${p.label} · ${p.ms}ms${p.ms >= slowThresholdMs ? ' · slow' : ''}${p.error ? ' · failed' : ''}` }}</title>
          </rect>
        </svg>
      </el-tooltip>
      <el-popover
        v-for="(t, i) in visibleToolCalls"
        :key="i"
        placement="bottom"
        trigger="hover"
        :width="320"
        :show-after="200"
        :disabled="!t.content && !t.error && !t.running"
      >
        <template #reference>
          <span
            class="ssb-tool-chip"
            :class="{ 'ssb-tool-chip--running': t.running, 'ssb-tool-chip--error': !!t.error }"
          >
            <span class="ssb-tool-dot" />
            <span class="ssb-tool-label">{{ t.label }}</span>
            <span
              v-if="t.running && t.ts"
              class="ssb-tool-state"
              :class="{
                'ssb-tool-state--running': !isSlowTool(t.ts),
                'ssb-tool-state--slow': isSlowTool(t.ts),
              }"
              :title="`Started ${new Date(t.ts).toLocaleTimeString()}${isSlowTool(t.ts) ? ' · slow (>30s, may be stuck)' : ''}`"
            >{{ formatRunningSec(t.ts) }}</span>
            <span v-else-if="t.running" class="ssb-tool-state">…</span>
            <span
              v-else-if="t.error"
              class="ssb-tool-state"
              :class="{
                'ssb-tool-state--err': !isFresh(t.endTs),
                'ssb-tool-state--fresh-err': isFresh(t.endTs),
              }"
            ><el-icon :size="10"><Close /></el-icon></span>
            <span
              v-else-if="typeof t.ms === 'number'"
              class="ssb-tool-state"
              :class="{ 'ssb-tool-state--fresh': isFresh(t.endTs) }"
            ><el-icon :size="10"><Check /></el-icon>{{ t.ms }}ms</span>
          </span>
        </template>
        <div class="ssb-tool-pop">
          <div class="ssb-tool-pop-head">
            <span class="ssb-tool-pop-label">{{ t.label }}</span>
            <span v-if="t.running" class="ssb-tool-pop-state">running…</span>
            <span v-else-if="t.error" class="ssb-tool-pop-state ssb-tool-pop-state--err">failed</span>
            <span v-else-if="typeof t.ms === 'number'" class="ssb-tool-pop-state">{{ t.ms }}ms</span>
          </div>
          <div v-if="t.error" class="ssb-tool-pop-err">{{ t.error }}</div>
          <pre v-if="t.content" class="ssb-tool-pop-content">{{ t.content }}</pre>
          <div v-if="t.content" class="ssb-tool-pop-actions">
            <el-button
              size="small"
              text
              :icon="copiedChipName === t.name ? Check : (failedChipName === t.name ? Close : undefined)"
              :type="copiedChipName === t.name ? 'success' : (failedChipName === t.name ? 'danger' : '')"
              :title="copiedChipName === t.name ? 'Copied' : (failedChipName === t.name ? 'Copy failed' : 'Copy result')"
              @click="copyToolResult(t.content!, t.name)"
            >{{ copiedChipName === t.name ? 'Copied' : (failedChipName === t.name ? 'Failed' : 'Copy') }}</el-button>
            <el-button
              size="small"
              text
              :icon="FolderChecked"
              title="Save this tool result to the knowledge base"
              @click="saveToolResultToKB(t.content!)"
            >Save to KB</el-button>
          </div>
        </div>
      </el-popover>
      <span
        v-if="(showOnlyFailed || showOnlySlow) && !visibleToolCalls.length"
        class="ssb-tools-empty"
        title="No matching tool calls in this session"
      >no matches</span>
      <span
        v-if="toolCallsOverflow"
        class="ssb-tools-toggle"
        :title="showAllToolCalls ? 'Collapse to last 3 calls' : 'Expand to last 20 calls'"
        @click="showAllToolCalls = !showAllToolCalls"
      >{{ showAllToolCalls ? '−' : '+' }}</span>
      <span
        v-if="totalToolMs > 0"
        class="ssb-tools-total"
        :title="`Cumulative tool time this session · ${toolCallCount} call(s) · avg ${formatTotalMs(avgToolMs)} · p95 ${formatTotalMs(p95ToolMs)} · max ${formatTotalMs(maxToolMs)} (live ticking while a tool is running)`"
      >{{ formatTotalMs(totalToolMs) }}<span class="ssb-tools-total-avg" v-if="avgToolMs"> · {{ formatTotalMs(avgToolMs) }} avg · {{ formatTotalMs(p95ToolMs) }} p95 · {{ formatTotalMs(maxToolMs) }} max</span></span>
    </span>
  </div>
</template>

<style scoped lang="scss">
.ssb-bar {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 12px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
  user-select: none;
}

.ssb-item {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  padding: 1px 6px;
  border-radius: 3px;
  transition: background 0.15s, color 0.15s;
}

.ssb-item:hover {
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
}

.ssb-active {
  color: var(--el-color-primary);
  font-weight: 600;
}

.ssb-active:hover {
  color: var(--el-color-primary);
}

.ssb-session-duration {
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}
.ssb-source {
  color: var(--el-color-primary);
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background: var(--el-color-primary-light-9);
  }
}
.ssb-idle {
  color: var(--el-text-color-placeholder);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.ssb-idle--stale {
  color: var(--el-color-warning);
  font-weight: 600;
}

.ssb-label {
  line-height: 1.4;
}

.ssb-sep {
  color: var(--el-border-color);
  font-size: 10px;
}

// Token bar
.ssb-item--tokens {
  gap: 6px;
  min-width: 60px;
}

.ssb-token-bar {
  position: relative;
  width: 40px;
  height: 6px;
  background: var(--el-fill-color);
  border-radius: 3px;
  overflow: hidden;
}

.ssb-token-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease, background 0.3s;
  opacity: 0.5;
}

.ssb-token-fill--low {
  background: var(--el-color-success);
}

.ssb-token-fill--mid {
  background: var(--el-color-warning);
}

.ssb-token-fill--high {
  background: var(--el-color-danger);
}

// Per-turn segments (stacked on top of the fill bar for agent pressure detail)
.ssb-token-seg {
  position: relative;
  display: inline-block;
  height: 100%;
  vertical-align: top;
  border-right: 1px solid var(--el-bg-color);
  transition: width 0.3s ease;

  &:last-child {
    border-right: none;
  }

  &--low {
    background: var(--el-color-success);
  }
  &--mid {
    background: var(--el-color-warning);
  }
  &--high {
    background: var(--el-color-danger);
  }
}

.ssb-context-warn {
  font-size: 10px;
  font-weight: 600;
  color: var(--el-color-danger);
  cursor: pointer;
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--el-color-danger-light-9);
  border: 1px solid var(--el-color-danger-light-5);
  &:hover {
    background: var(--el-color-danger-light-7);
    color: var(--el-color-white);
  }
  &--critical {
    animation: ssb-pulse 1.5s ease-in-out infinite;
    background: var(--el-color-danger-light-7);
    border-color: var(--el-color-danger);
  }
}

@keyframes ssb-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.ssb-token-pct {
  font-size: 10px;
  font-weight: 600;
  min-width: 28px;
}

.ssb-tokens-split {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  gap: 2px;
}
.ssb-tokens-bar {
  display: inline-flex;
  width: 36px;
  height: 6px;
  margin-right: 4px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--el-fill-color-light);
  vertical-align: middle;
}
.ssb-tokens-bar-in { background: var(--el-color-info); }
.ssb-tokens-bar-out { background: var(--el-color-success); }
.ssb-tokens-in { color: var(--el-color-info); font-weight: 600; }
.ssb-tokens-sep { color: var(--el-text-color-placeholder); }
.ssb-tokens-out { color: var(--el-color-success); font-weight: 600; }
.ssb-cost {
  color: var(--el-color-warning);
  font-variant-numeric: tabular-nums;
}
.ssb-cost .ssb-label { font-size: 10px; font-weight: 600; }

.ssb-cost-spark-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0;
  padding: 3px 0;
  border-top: 1px dashed var(--el-border-color-lighter);
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.ssb-cost-spark-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.ssb-cost-spark {
  display: block;
  flex: 0 0 auto;
}
.ssb-cost-spark-pt {
  cursor: pointer;
  transition: r 0.1s;
  &:hover { r: 2.5; }
}
.ssb-cost-spark-hit {
  cursor: pointer;
}
.ssb-stuck-ring {
  animation: ssb-stuck-pulse 3s ease-in-out infinite;
}
@keyframes ssb-stuck-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}
@media (prefers-reduced-motion: reduce) {
  .ssb-stuck-ring,
  .ssb-pulse,
  .ssb-tool-chip--running .ssb-tool-dot,
  .ssb-tool-state--err,
  .ssb-tool-state--fresh,
  .ssb-tool-state--fresh-err { animation: none; }
}
.ssb-token-spark-legend {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 4px;
}
.ssb-spark-legend-wrap {
  display: block;
  margin: 2px 0;
}
.ssb-spark-legend-toggle {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  user-select: none;
  display: inline-block;
  margin-bottom: 2px;
  &:hover { color: var(--el-color-primary); }
}
.ssb-spark-legend {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 6px;
  flex: 0 0 auto;
}
.ssb-spark-legend--stacked {
  flex-wrap: wrap;
  margin-left: 0;
  margin-top: 2px;
  width: 100%;
  gap: 6px 10px;
}
.ssb-spark-legend span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.ssb-spark-legend-dot {
  display: inline-block;
  width: 8px;
  height: 2px;
  vertical-align: middle;
  border-radius: 1px;
}
.ssb-token-spark-dot {
  display: inline-block;
  width: 6px;
  height: 2px;
  margin: 0 3px 0 6px;
  vertical-align: middle;
}
.ssb-token-spark-dot--in { background: var(--el-color-info); }
.ssb-token-spark-dot--out { background: var(--el-color-success); }

.ssb-latency-spark {
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
  cursor: pointer;
}
.ssb-tokens-ratio {
  color: var(--el-text-color-secondary);
  margin-left: 2px;
  font-size: 9px;
}

.ssb-token-tip {
  font-size: 12px;
  line-height: 1.6;
  max-width: 380px;
}
.ssb-token-tip b { font-weight: 600; }
.ssb-token-tip-in { color: var(--el-color-info-light-3); }
.ssb-token-tip-out { color: var(--el-color-success-light-3); }
.ssb-token-tip-note {
  margin-top: 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  font-style: italic;
}

// Status dots
.ssb-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.ssb-dot--web {
  background: var(--el-color-success);
}

.ssb-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-primary);
  animation: ssb-pulse 1.2s infinite;
}

@keyframes ssb-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

// ── Phase pill (Pi-inspired: idle/fetching/thinking/streaming/done) ──
.ssb-phase {
  font-weight: 600;
}
.ssb-phase--fetching {
  color: var(--el-color-warning);
}
.ssb-phase--thinking {
  color: var(--el-color-info);
}
.ssb-phase--retrieving {
  color: var(--el-color-success);
}
.ssb-phase--streaming {
  color: var(--el-color-primary);
}
.ssb-phase--done {
  color: var(--el-color-success);
}

// ── Compaction pill (Pi-inspired: silent background state surfaced) ──
.ssb-compact {
  color: var(--el-color-info);
}
.ssb-compact:hover {
  color: var(--el-color-info-dark-2);
}

// ── Agent status (Pi-inspired: agent mode indicator + turn/token info) ──
.ssb-agent {
  color: var(--el-color-primary);
  font-weight: 600;
}
.ssb-agent-turn {
  color: var(--el-color-primary-light-3);
  font-variant-numeric: tabular-nums;
}
.ssb-agent-tokens {
  color: var(--el-color-primary-light-5);
  font-variant-numeric: tabular-nums;
}
.ssb-agent-compact {
  color: var(--el-color-primary-light-3);
}

.ssb-agent-tool {
  color: var(--el-color-warning);
  font-weight: 500;
}

.ssb-agent-tool-elapsed {
  font-variant-numeric: tabular-nums;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}

// ── Tool-call timeline (Pi: tool_execution events) ──
.ssb-tools {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 1px 6px;
  color: var(--el-text-color-secondary);
}

.ssb-tools-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-fill-color);
  }
}
.ssb-tools-filter {
  font-size: 10px;
  font-weight: 600;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  padding: 0 4px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  &:hover { background: var(--el-color-danger-light-8); }
  &.is-active {
    background: var(--el-color-danger);
    color: #fff;
  }
}
.ssb-tools-filter--slow {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
  &:hover { background: var(--el-color-warning-light-8); }
  &.is-active {
    background: var(--el-color-warning);
    color: #fff;
  }
}
.ssb-tools-empty {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-style: italic;
}
.ssb-tools-threshold {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  user-select: none;
  font-variant-numeric: tabular-nums;
  &:hover { color: var(--el-color-primary); }
  &.is-default { color: var(--el-text-color-placeholder); }
}
.ssb-slow-pop { font-size: 11px; color: var(--el-text-color-regular); }
.ssb-slow-pop-label {
  margin-bottom: 4px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.ssb-slow-pop-presets {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  margin-top: 4px;
  .el-button { padding: 0 4px; font-size: 10px; }
  .el-button.is-current {
    color: var(--el-color-primary);
    font-weight: 700;
    background: var(--el-color-primary-light-9);
  }
}
.ssb-slow-pop-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 6px;
}
.ssb-tools-total {
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
  padding-left: 4px;
  border-left: 1px solid var(--el-border-color-lighter);
}
.ssb-tools-total-avg {
  font-weight: 500;
  color: var(--el-text-color-placeholder);
}

.ssb-tool-chip {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  padding: 0 5px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  font-size: 10px;
  line-height: 1.4;
  transition: background 0.15s;
}

// ── Tool chip result popover (Pi-inspired: hover for full output + copy) ──
.ssb-tool-pop {
  font-size: 11px;
  color: var(--el-text-color-regular);
}
.ssb-tool-pop-head {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 4px;
}
.ssb-tool-pop-label {
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.ssb-tool-pop-state {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
}
.ssb-tool-pop-state--err {
  color: var(--el-color-danger);
  font-weight: 600;
}
.ssb-tool-pop-err {
  margin: 4px 0;
  padding: 4px 6px;
  font-size: 10px;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border-radius: 3px;
  word-break: break-word;
}
.ssb-tool-pop-content {
  margin: 4px 0;
  padding: 6px 8px;
  font-size: 10px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color);
  border-radius: 3px;
  max-height: 180px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
.ssb-tool-pop-actions {
  display: flex;
  justify-content: flex-end;
}

.ssb-tool-chip--running {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.ssb-tool-chip--error {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.ssb-tool-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
}

.ssb-tool-chip--running .ssb-tool-dot {
  animation: ssb-pulse 1.2s infinite;
}

.ssb-tool-label {
  font-weight: 500;
}

.ssb-tool-state {
  display: inline-flex;
  gap: 2px;
  align-items: center;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}

.ssb-tool-state--running {
  color: var(--el-color-primary);
  font-weight: 700;
  opacity: 1;
}

.ssb-tool-state--slow {
  color: var(--el-color-danger);
  font-weight: 700;
  opacity: 1;
  animation: ssb-tool-blink 1s infinite;
}

@keyframes ssb-tool-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.ssb-tool-state--fresh {
  color: var(--el-color-success);
  font-weight: 700;
  opacity: 1;
  animation: ssb-tool-fresh 500ms ease-out;
}

.ssb-tool-state--fresh-err {
  color: var(--el-color-danger);
  font-weight: 700;
  opacity: 1;
  animation: ssb-tool-fresh 500ms ease-out;
}

@keyframes ssb-tool-fresh {
  0% { transform: scale(1.4); }
  100% { transform: scale(1); }
}

.ssb-tool-state--err {
  color: var(--el-color-danger);
  font-weight: 700;
  opacity: 1;
}
</style>
