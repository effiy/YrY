<script setup lang="ts" name="aiChatToolbar">
import { inject, ref, computed, onMounted, watch } from "vue";
import {
  ChatLineSquare,
  Picture,
  ChatDotRound,
  Search,
  Loading,
  ArrowLeft,
  ArrowRight,
  CollectionTag,
  Delete,
  Edit,
  Tools,
  Check,
  Close,
  FolderChecked,
  FolderOpened,
  Folder,
  Document,
  Plus,
  Cpu,
  Refresh,
  More,
  Setting
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useSlowThreshold } from "@/hooks/useSlowThreshold";
import { useSkillsMcp } from "./useSkillsMcp";
import { useContextFiles } from "./useContextFiles";
import RequestStatusButton from "../RequestStatusButton.vue";
import FaqPopover from "../FaqPopover.vue";
import PromptHistoryPanel from "./PromptHistoryPanel.vue";
import TemplatePicker from "../TemplatePicker.vue";

const props = withDefaults(
  defineProps<{
    faqActive?: boolean;
    sending?: boolean;
    streamingType?: "" | "send" | "regenerate" | "resend";
    ragToggle?: boolean;
    webSearchToggle?: boolean;
    /** List of ctx:-tagged file paths (without the ctx: prefix) */
    contextFiles?: string[];
    selectedModel?: string;
    availableModels?: string[];
  }>(),
  {
    faqActive: false,
    sending: false,
    streamingType: "",
    ragToggle: false,
    webSearchToggle: false,
    contextFiles: () => [],
    selectedModel: "",
    availableModels: () => []
  }
);

const emit = defineEmits<{
  (e: "toggle-faq"): void;
  (e: "pick-image"): void;
  (e: "manage-tags"): void;
  (e: "open-wechat"): void;
  (e: "toggle-rag"): void;
  (e: "toggle-web-search"): void;
  (e: "stop"): void;
  (e: "remove-context-file", path: string): void;
  (e: "update-selected-model", model: string): void;
}>();

const collapseCtx = inject<{ collapsible: boolean; side: "fill" | "right" | "left"; toggle: () => void } | null>(
  "aiChatBoxCollapse",
  null
);

const openKnowledgePreview = inject<(path: string) => void>("openKnowledgePreview", () => {});

const {
  contextPopoverVisible,
  contextFileCount,
  toggleContextPopover,
  handleFileClick,
  contextDropOver,
  onContextDragOver,
  onContextDragEnter,
  onContextDragLeave,
  onContextDrop,
  editingContextFile,
  editingContent,
  openContextEditor,
  saveContextEdit,
  cancelContextEdit,
  contextPopoverTab,
  knowledgeSearch,
  knowledgeTree,
  knowledgeStore,
  knowledgeExpandedFolders,
  browseDisplayItems,
  toggleKnowledgeFolder,
  onKnowledgeFileClick,
  addFolderToContext,
  onContextPopoverShow
} = useContextFiles(
  computed(() => props.contextFiles ?? []),
  (e, path) => emit(e, path),
  openKnowledgePreview
);

const store = useAiChatStore();
const { slowThresholdMs } = useSlowThreshold();

// ── Two-way sync for externally-driven model selection ──
// KnowledgeChatPanel (and other embedders) owns a local `selectedModel` and
// expects ChatToolbar to emit changes via `update-selected-model`. Internally
// ChatToolbar's ModelSelector mutates `store.selectedModel`, so we set up
// bidirectional sync so:
//   1) prop changes → reflect into store (ModelSelector reads from store)
//   2) store changes → emit to parent so the panel's local state stays aligned
watch(
  () => props.selectedModel,
  v => {
    if (v && v !== store.selectedModel) store.selectedModel = v;
  },
  { immediate: true }
);
watch(
  () => store.selectedModel,
  v => {
    if (v && v !== props.selectedModel) emit("update-selected-model", v);
  }
);
// Also expose the parent-provided model list (if any) to the store so the
// model popover can still render something useful when running inside an
// embedded preview dialog that doesn't have the full store wired up.
watch(
  () => props.availableModels ?? [],
  list => {
    if (list.length && !store.availableModels.length) {
      store.availableModels.splice(0, store.availableModels.length, ...list);
    }
  },
  { immediate: true }
);

// ── More tools dropdown ──
const moreToolsVisible = ref(false);

// ── RAG settings popover ──
const ragSettingsVisible = ref(false);

// ── RAG index status (for the toggle pill) ────────────────────────────

const ragIndexStatus = ref<{ built: boolean; num_docs: number; last_built_at: string; error?: string } | null>(null);
onMounted(async () => {
  try {
    const { ragStatus } = await import("@/api/modules/ragService");
    const data = await ragStatus();
    ragIndexStatus.value = { built: data.built, num_docs: data.num_docs, last_built_at: data.last_built_at ?? "", error: (data as any).error };
  } catch { /* best-effort */ }
});

const ragHealthDot = computed<"green" | "orange" | "red">(() => {
  if (!ragIndexStatus.value) return "red";
  if (ragIndexStatus.value.error) return "orange";
  if (ragIndexStatus.value.built && ragIndexStatus.value.num_docs > 0) return "green";
  if (ragIndexStatus.value.built) return "orange";
  return "red";
});

const ragIndexAvailable = computed(() => ragIndexStatus.value?.built && ragIndexStatus.value.num_docs > 0);

const ragSourceCount = computed(() => store.lastRagSourceCount ?? 0);
const ragGrade = computed(() => {
  if (!ragSourceCount.value) return null;
  const top = store.lastRagTopScore ?? 0;
  if (top >= 0.85) return "A";
  if (top >= 0.7) return "B";
  if (top >= 0.5) return "C";
  return "D";
});

const ragTooltip = computed(() => {
  const shortcut = "Ctrl+Shift+R";
  if (!ragIndexStatus.value) return `RAG — checking index... (${shortcut})`;
  const info = ragIndexStatus.value;
  const ctxCount = props.contextFiles?.length ?? 0;
  const scopeNote =
    props.ragToggle && ctxCount > 0
      ? ` · scoped to ${ctxCount} file(s)`
      : props.ragToggle
        ? " · full knowledge base"
        : "";
  const health = ragHealthDot.value === "green" ? "healthy" : ragHealthDot.value === "orange" ? "degraded" : "not built";
  const srcNote = ragSourceCount.value ? ` · last: ${ragSourceCount.value} sources${ragGrade.value ? ` (${ragGrade.value})` : ""}` : "";
  if (!ragIndexAvailable.value) return `RAG unavailable — index not built (${shortcut})`;
  if (props.ragToggle && props.webSearchToggle) return `RAG+Web · ${info.num_docs} docs · ${health}${scopeNote}${srcNote} (${shortcut})`;
  if (props.ragToggle) return `RAG on · ${info.num_docs} docs · ${health}${scopeNote}${srcNote} (${shortcut})`;
  return `RAG off · ${info.num_docs} docs · ${health} (${shortcut})`;
});

const isRetrieving = computed(() => store.streamingPhase === "retrieving");

const runningTools = computed(() => {
  const events = store.toolEvents ?? [];
  const started = new Set<string>();
  const ended = new Set<string>();
  for (const e of events) {
    if (e.phase === "start") started.add(e.name);
    if (e.phase === "end") ended.add(e.name);
  }
  return [...started]
    .filter(n => !ended.has(n))
    .map(n => events.find(e => e.name === n && e.phase === "start"))
    .filter(Boolean) as Array<{ name: string; label: string }>;
});

// ── Skills + MCP (extracted to useSkillsMcp composable) ──
const {
  skillsPopoverVisible,
  compactMode,
  allSkills,
  activeSkillCount,
  skillSortMode,
  sortedSkills,
  cycleSkillSortMode,
  skillSortLabel,
  expandedTools,
  toggleToolExpand,
  pinnedTools,
  togglePin,
  isPinned,
  pinnedBuiltinCount,
  pinnedMcpCount,
  pinnedBuiltinNames,
  pinnedMcpNames,
  unpinAllBuiltin,
  unpinAllMcp,
  pinSortMode,
  PIN_SORT_MODE_LABEL,
  cyclePinSort,
  pinHoverIdx,
  pinHoverKey,
  setPinHover,
  PIN_SPARK_W,
  PIN_SPARK_H,
  pinLegendCollapsed,
  togglePinLegend,
  globalToolFilter,
  globalSearchRef,
  activeToolFilter,
  visibleSkills,
  globalSearchSummary,
  similarTools,
  selectedToolIdx,
  onGlobalSearchKeydown,
  builtinToolFilter,
  mcpTools,
  mcpToolsLoading,
  mcpToolsError,
  mcpToolsLoaded,
  mcpToolFilter,
  filteredMcpTools,
  mcpServers,
  loadMcpTools,
  highlightSegments,
  expandedMcpTools,
  toggleMcpToolExpand,
  copyMcpToolResult,
  saveMcpToolResultToKB,
  args,
  schema,
  required,
  ensureToolArgs,
  resetToolArgs,
  getToolProps,
  getToolSchemaJson,
  mcpToolLastArgs,
  mcpToolResults,
  rerunMcpToolLast,
  runMcpToolInline,
  failed,
  failedRerunTool,
  copiedRerunTool,
  toolLastCalls,
  hasToolPromptMeta,
  showLlmPrompt,
  llmPromptText,
  copyLlmPrompt,
  formatRelativeTime,
  isBuiltinPinStale,
  isMcpPinStale,
  builtinPinCount,
  mcpPinCount,
  builtinPinAvgMs,
  mcpPinAvgMs,
  builtinPinMaxMs,
  mcpPinMaxMs,
  builtinPinFailRate,
  mcpPinFailRate,
  builtinPinMedianMs,
  mcpPinMedianMs,
  builtinPinP90Ms,
  mcpPinP90Ms,
  builtinPinProjectionPoint,
  mcpPinProjectionPoint,
  builtinPinStuckSummary,
  mcpPinStuckSummary,
  builtinPinStuckIndices,
  mcpPinStuckIndices,
  builtinPinSparkPath,
  mcpPinSparkPath,
  builtinPinSparkPoints,
  mcpPinSparkPoints,
  builtinPinSparkAvgY,
  mcpPinSparkAvgY,
  builtinPinSparkMedianY,
  mcpPinSparkMedianY,
  builtinPinSparkP90Y,
  mcpPinSparkP90Y,
  builtinPinSparkThresholdY,
  mcpPinSparkThresholdY,
  builtinPinSparkLatestIdx,
  mcpPinSparkLatestIdx,
  builtinPinSparkMinIdx,
  mcpPinSparkMinIdx,
  builtinPinHitWidths,
  mcpPinHitWidths,
  builtinPinHitW,
  mcpPinHitW,
  builtinPinCrosshairColor,
  mcpPinCrosshairColor,
  onSkillsPopoverOpen,
  selectionPos,
  selectedBuiltinIdx,
  selectedMcpIdx,
  mcpProbe,
  probeMcp
} = useSkillsMcp();
</script>

<template>
  <div class="ct-toolbar">
    <div class="ct-left">
      <el-tooltip v-if="collapseCtx?.collapsible" content="Collapse chat" placement="bottom">
        <el-button circle size="default" :aria-label="'Collapse chat'" @click="collapseCtx?.toggle()">
          <el-icon><ArrowRight v-if="collapseCtx?.side === 'right'" /><ArrowLeft v-else /></el-icon>
        </el-button>
      </el-tooltip>
      <!-- More tools dropdown -->
      <el-popover
        v-model:visible="moreToolsVisible"
        placement="bottom-start"
        :width="200"
        trigger="click"
        :teleported="true"
        popper-class="ct-more-pop"
      >
        <template #reference>
          <el-button circle size="default" :icon="More" :title="'More tools'" />
        </template>
        <div class="ct-more-menu">
          <div class="ct-more-item" :class="{ 'is-active': faqActive }" @click="emit('toggle-faq'); moreToolsVisible = false">
            <el-icon :size="16"><ChatLineSquare /></el-icon>
            <span>FAQ</span>
            <span v-if="faqActive" class="ct-more-item-dot" />
          </div>
          <div class="ct-more-item" @click="skillsPopoverVisible = true; moreToolsVisible = false">
            <el-icon :size="16"><Tools /></el-icon>
            <span>Skills · {{ activeSkillCount }} active</span>
          </div>
          <div class="ct-more-item" @click="emit('pick-image'); moreToolsVisible = false">
            <el-icon :size="16"><Picture /></el-icon>
            <span>Upload image</span>
          </div>
          <div class="ct-more-item" @click="emit('open-wechat'); moreToolsVisible = false">
            <el-icon :size="16"><ChatDotRound /></el-icon>
            <span>WeCom settings</span>
          </div>
        </div>
      </el-popover>
      <TemplatePicker />
      <FaqPopover />
      <PromptHistoryPanel :highlight-segments="highlightSegments" />
      <!-- Skills panel (still rendered, but opened from More menu) -->
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
          <span class="ct-skills-anchor" />
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
            <div
              v-if="globalSearchSummary"
              class="ct-skills-search-summary"
              :class="{ 'is-empty': globalSearchSummary.total === 0 }"
            >
              <span class="ct-skills-search-total"
                >{{ globalSearchSummary.total }} match{{ globalSearchSummary.total === 1 ? "" : "es" }}</span
              >
              <span class="ct-skills-search-split"
                >{{ globalSearchSummary.builtin }} built-in · {{ globalSearchSummary.mcp }} MCP</span
              >
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
              >{{ t.name }} <span class="ct-skills-similar-score">{{ (t.score * 100).toFixed(0) }}%</span></span
            >
          </div>
          <!-- LLM-visible prompt preview (Pi-inspired: introspect what the model sees) -->
          <div class="ct-skills-section">
            <span>LLM Prompt</span>
            <el-button size="small" text type="primary" @click="showLlmPrompt = !showLlmPrompt">{{
              showLlmPrompt ? "Hide" : "Preview"
            }}</el-button>
          </div>
          <div v-if="showLlmPrompt" class="ct-llm-prompt">
            <div class="ct-llm-prompt-head">
              <span class="ct-llm-prompt-meta">{{
                llmPromptText ? `${llmPromptText.length} chars` : "(no tools registered)"
              }}</span>
              <el-button v-if="llmPromptText" size="small" text @click="copyLlmPrompt">Copy</el-button>
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
              >Probe all</el-button
            >
          </div>
          <div v-for="srv in mcpServers" :key="srv.name" class="ct-skill ct-mcp">
            <div class="ct-skill-head">
              <span class="ct-skill-label">{{ srv.name }}</span>
              <span class="ct-skill-name">{{ srv.type }}</span>
              <span
                class="ct-skill-tag"
                :class="srv.browserReachable ? 'ct-skill-tag--on' : 'ct-skill-tag--off'"
                :title="srv.browserReachable ? 'HTTP — browser-reachable' : 'stdio — Node-side only, not browser-reachable'"
                >{{ srv.browserReachable ? "http" : "local" }}</span
              >
              <span
                v-if="mcpProbe[srv.name]"
                class="ct-skill-tag"
                :class="{
                  'ct-skill-tag--probing': mcpProbe[srv.name].status === 'probing',
                  'ct-skill-tag--on': mcpProbe[srv.name].status === 'ok',
                  'ct-skill-tag--off': mcpProbe[srv.name].status === 'fail'
                }"
                :title="
                  mcpProbe[srv.name].error
                    ? `${mcpProbe[srv.name].error}${mcpProbe[srv.name].latencyMs ? ' · ' + mcpProbe[srv.name].latencyMs + 'ms' : ''}`
                    : mcpProbe[srv.name].httpStatus != null
                      ? `HTTP ${mcpProbe[srv.name].httpStatus} · ${mcpProbe[srv.name].latencyMs}ms`
                      : `${mcpProbe[srv.name].latencyMs}ms`
                "
                >{{ mcpProbe[srv.name].status === "probing" ? "…" : mcpProbe[srv.name].status === "ok" ? "✓" : "✗" }}</span
              >
              <el-button
                v-if="srv.browserReachable"
                size="small"
                text
                :loading="mcpProbe[srv.name]?.status === 'probing'"
                @click="probeMcp(srv)"
                >Test</el-button
              >
            </div>
            <div class="ct-skill-desc">{{ srv.description }}</div>
          </div>
          <!-- MCP tools (Pi-inspired: discover external server's tools) -->
          <div class="ct-skills-section">
            <span
              >MCP Tools · {{ filteredMcpTools.length }}{{ mcpToolFilter ? `/${mcpTools.length}` : ""
              }}<el-popover v-if="pinnedMcpCount" placement="bottom" trigger="click" :width="240">
                <template #reference>
                  <span
                    class="ct-skills-pin-count ct-skills-pin-count--clickable"
                    :title="`${pinnedMcpCount} pinned tool(s) — click to manage`"
                  >
                    · {{ pinnedMcpCount }}★</span
                  >
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
                        >{{ PIN_SORT_MODE_LABEL[pinSortMode] }}</el-button
                      >
                      <el-button size="small" text type="danger" title="Unpin all MCP tools" @click="unpinAllMcp"
                        >Unpin all</el-button
                      >
                    </div>
                  </div>
                  <div v-if="pinnedMcpNames.length" class="ct-pin-spark-legend-wrap">
                    <el-button
                      size="small"
                      text
                      class="ct-pin-spark-legend-toggle"
                      :title="pinLegendCollapsed ? 'Show legend' : 'Hide legend'"
                      @click="togglePinLegend"
                      >{{ pinLegendCollapsed ? "▸ Legend" : "▾ Legend" }}</el-button
                    >
                    <div v-show="!pinLegendCollapsed" class="ct-pin-spark-legend">
                      <span
                        ><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-success-light-3); opacity: 0.5"></i
                        >median</span
                      >
                      <span
                        ><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-danger-light-5); opacity: 0.6"></i
                        >p90</span
                      >
                      <span
                        ><i class="ct-pin-spark-legend-dot" style="background: var(--el-text-color-secondary); opacity: 0.5"></i
                        >avg</span
                      >
                      <span
                        ><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-warning); opacity: 0.6"></i>slow
                        threshold</span
                      >
                      <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-danger)"></i>slow</span>
                      <span
                        ><i
                          class="ct-pin-spark-legend-dot"
                          style="background: none; border: 1px solid var(--el-color-danger); opacity: 0.8"
                        ></i
                        >stuck (2× median)</span
                      >
                      <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-success)"></i>fastest</span>
                      <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-primary)"></i>latest</span>
                    </div>
                  </div>
                  <div
                    v-for="n in pinnedMcpNames"
                    :key="n"
                    class="ct-pin-pop-row"
                    :class="{ 'ct-pin-pop-row--stale': isMcpPinStale(n) }"
                  >
                    <span class="ct-pin-pop-name">{{ n }}</span>
                    <span class="ct-pin-pop-meta">
                      <span
                        class="ct-pin-pop-count"
                        :title="`${mcpPinCount(n)} this session${mcpPinAvgMs(n) ? ` · avg ${mcpPinAvgMs(n)}` : ''}${mcpPinMedianMs(n) ? ` · median ${mcpPinMedianMs(n)}` : ''}${mcpPinP90Ms(n) ? ` · p90 ${mcpPinP90Ms(n)}` : ''}${mcpPinMaxMs(n) ? ` · max ${mcpPinMaxMs(n)}` : ''}${mcpPinProjectionPoint(n) ? ` · projected +10 calls ${Math.round(mcpPinProjectionPoint(n)!.ms)}ms` : ''}${mcpPinStuckSummary(n) ? ` · stuck: ${mcpPinStuckSummary(n)}` : ''}${mcpPinFailRate(n) ? ` · ${mcpPinFailRate(n)}` : ''}${isMcpPinStale(n) ? ' · stale pin (never invoked)' : ''}`"
                        >{{ mcpPinCount(n)
                        }}<span v-if="mcpPinMedianMs(n)" class="ct-pin-pop-avg"> · {{ mcpPinMedianMs(n) }}</span
                        ><span v-else-if="mcpPinAvgMs(n)" class="ct-pin-pop-avg"> · {{ mcpPinAvgMs(n) }}</span></span
                      >
                      <svg
                        v-if="mcpPinSparkPath(n)"
                        class="ct-pin-pop-spark"
                        :width="PIN_SPARK_W"
                        :height="PIN_SPARK_H"
                        :viewBox="`0 0 ${PIN_SPARK_W} ${PIN_SPARK_H}`"
                        :aria-label="`Recent latency trajectory for ${n}`"
                        @mouseleave="setPinHover(null, null)"
                      >
                        <line
                          v-if="mcpPinSparkMedianY(n) >= 0"
                          :x1="0"
                          :x2="PIN_SPARK_W"
                          :y1="mcpPinSparkMedianY(n)"
                          :y2="mcpPinSparkMedianY(n)"
                          stroke="var(--el-color-success-light-3)"
                          stroke-width="0.4"
                          stroke-dasharray="1.5,1.5"
                          opacity="0.5"
                        />
                        <line
                          v-if="mcpPinSparkP90Y(n) >= 0"
                          :x1="0"
                          :x2="PIN_SPARK_W"
                          :y1="mcpPinSparkP90Y(n)"
                          :y2="mcpPinSparkP90Y(n)"
                          stroke="var(--el-color-danger-light-5)"
                          stroke-width="0.4"
                          stroke-dasharray="1.5,1.5"
                          opacity="0.6"
                        />
                        <line
                          v-if="mcpPinSparkAvgY(n) >= 0"
                          :x1="0"
                          :x2="PIN_SPARK_W"
                          :y1="mcpPinSparkAvgY(n)"
                          :y2="mcpPinSparkAvgY(n)"
                          stroke="var(--el-text-color-secondary)"
                          stroke-width="0.4"
                          stroke-dasharray="1.5,1.5"
                          opacity="0.5"
                        />
                        <line
                          v-if="mcpPinSparkThresholdY(n) >= 0"
                          :x1="0"
                          :x2="PIN_SPARK_W"
                          :y1="mcpPinSparkThresholdY(n)"
                          :y2="mcpPinSparkThresholdY(n)"
                          stroke="var(--el-color-warning)"
                          stroke-width="0.5"
                          stroke-dasharray="1,1"
                          opacity="0.6"
                          filter="url(#ssb-spark-glow-sm)"
                        />
                        <path
                          :d="mcpPinSparkPath(n)"
                          fill="none"
                          stroke="var(--el-color-info)"
                          stroke-width="1"
                          stroke-linejoin="round"
                          stroke-linecap="round"
                        />
                        <line
                          v-if="mcpPinProjectionPoint(n) && mcpPinSparkPoints(n).length"
                          :x1="mcpPinSparkPoints(n)[mcpPinSparkPoints(n).length - 1].cx"
                          :y1="mcpPinSparkPoints(n)[mcpPinSparkPoints(n).length - 1].cy"
                          :x2="mcpPinProjectionPoint(n)!.x"
                          :y2="mcpPinProjectionPoint(n)!.y"
                          stroke="var(--el-color-warning-light-3)"
                          stroke-width="0.5"
                          stroke-dasharray="1,1"
                          opacity="0.7"
                          filter="url(#ssb-spark-glow-sm)"
                        />
                        <circle
                          v-if="mcpPinProjectionPoint(n)"
                          :cx="mcpPinProjectionPoint(n)!.x"
                          :cy="mcpPinProjectionPoint(n)!.y"
                          r="0.8"
                          fill="var(--el-color-warning-light-3)"
                          stroke="var(--el-bg-color)"
                          stroke-width="0.2"
                          filter="url(#ssb-spark-glow-sm)"
                        >
                          <title>{{ `Projected +10 calls · ${Math.round(mcpPinProjectionPoint(n)!.ms)}ms` }}</title>
                        </circle>
                        <line
                          v-if="pinHoverKey === n && pinHoverIdx != null && mcpPinSparkPoints(n)[pinHoverIdx]"
                          :x1="mcpPinSparkPoints(n)[pinHoverIdx].cx"
                          :x2="mcpPinSparkPoints(n)[pinHoverIdx].cx"
                          :y1="0"
                          :y2="PIN_SPARK_H"
                          :stroke="mcpPinCrosshairColor(n)"
                          stroke-width="0.8"
                          stroke-dasharray="1.5,1"
                          opacity="0.9"
                          filter="url(#ssb-spark-glow-sm)"
                        />
                        <circle
                          v-if="pinHoverKey === n && pinHoverIdx != null && mcpPinSparkPoints(n)[pinHoverIdx]"
                          :cx="mcpPinSparkPoints(n)[pinHoverIdx].cx"
                          :cy="0.5"
                          r="0.8"
                          :fill="mcpPinCrosshairColor(n)"
                          filter="url(#ssb-spark-glow-sm)"
                        />
                        <circle
                          v-if="pinHoverKey === n && pinHoverIdx != null && mcpPinSparkPoints(n)[pinHoverIdx]"
                          :cx="mcpPinSparkPoints(n)[pinHoverIdx].cx"
                          :cy="PIN_SPARK_H - 0.5"
                          r="0.8"
                          :fill="mcpPinCrosshairColor(n)"
                          filter="url(#ssb-spark-glow-sm)"
                        />
                        <circle
                          v-for="(p, i) in mcpPinSparkPoints(n)"
                          :key="i"
                          :cx="p.cx"
                          :cy="p.cy"
                          :r="
                            p.ms >= slowThresholdMs || p.idx === mcpPinSparkMinIdx(n) || p.idx === mcpPinSparkLatestIdx(n)
                              ? 1.3
                              : 0.9
                          "
                          :fill="
                            p.ms >= slowThresholdMs
                              ? 'var(--el-color-danger)'
                              : p.idx === mcpPinSparkMinIdx(n)
                                ? 'var(--el-color-success)'
                                : p.idx === mcpPinSparkLatestIdx(n)
                                  ? 'var(--el-color-primary)'
                                  : 'var(--el-color-info)'
                          "
                          :filter="
                            p.ms >= slowThresholdMs || p.idx === mcpPinSparkMinIdx(n) || p.idx === mcpPinSparkLatestIdx(n)
                              ? 'url(#ssb-spark-stroke-sm)'
                              : 'none'
                          "
                        />
                        <circle
                          v-for="idx in mcpPinStuckIndices(n)"
                          :key="`stuck-${idx}`"
                          :cx="mcpPinSparkPoints(n)[idx - 1].cx"
                          :cy="mcpPinSparkPoints(n)[idx - 1].cy"
                          r="1.8"
                          fill="none"
                          stroke="var(--el-color-danger)"
                          stroke-width="0.5"
                          opacity="0.8"
                          pointer-events="none"
                          filter="url(#ssb-spark-stroke-sm)"
                          class="ct-stuck-ring"
                        >
                          <title>{{ `Stuck call ${idx} · ${mcpPinSparkPoints(n)[idx - 1].ms}ms ≥ 2× median` }}</title>
                        </circle>
                        <rect
                          v-for="(p, i) in mcpPinSparkPoints(n)"
                          :key="`hit-${i}`"
                          :x="p.cx - (mcpPinHitWidths(n)[i] ?? mcpPinHitW(n)) / 2"
                          :y="0"
                          :width="mcpPinHitWidths(n)[i] ?? mcpPinHitW(n)"
                          :height="PIN_SPARK_H"
                          fill="transparent"
                          pointer-events="all"
                          class="ct-pin-pop-spark-hit"
                          @mouseenter="setPinHover(n, i)"
                        >
                          <title>
                            {{
                              `Call ${p.idx} · ${p.ms}ms${p.ms >= slowThresholdMs ? " · slow" : p.idx === mcpPinSparkMinIdx(n) ? " · fastest" : p.idx === mcpPinSparkLatestIdx(n) ? " · latest" : ""}`
                            }}
                          </title>
                        </rect>
                      </svg>
                      <el-button size="small" text title="Unpin" @click="togglePin(n)">×</el-button>
                    </span>
                  </div>
                </div>
              </el-popover></span
            >
            <el-button size="small" text type="primary" :loading="mcpToolsLoading" @click="loadMcpTools(true)">Refresh</el-button>
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
              'is-selected': i === selectedMcpIdx
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
                >{{ pinnedTools.has(t.name) ? "★" : "☆" }}</el-button
              >
              <span class="ct-skill-label">
                <template v-for="(seg, si) in highlightSegments(t.name ?? '', activeToolFilter(mcpToolFilter))" :key="si">
                  <mark v-if="seg.match" class="ct-skill-match">{{ seg.text }}</mark>
                  <template v-else>{{ seg.text }}</template>
                </template>
              </span>
              <span class="ct-skill-tag ct-skill-tag--on">mcp</span>
              <el-button size="small" text type="primary" :loading="mcpToolResults[t.name]?.running" @click="runMcpToolInline(t)"
                >Run</el-button
              >
              <el-button
                v-if="getToolProps(t).length"
                size="small"
                text
                title="Reset args to schema defaults"
                @click="resetToolArgs(t)"
                >Reset</el-button
              >
              <el-popover v-if="mcpToolLastArgs[t.name]" placement="bottom" trigger="hover" :width="280" :show-after="200">
                <template #reference>
                  <el-button size="small" text type="primary" title="Rerun with last args" @click="rerunMcpToolLast(t)"
                    >Rerun</el-button
                  >
                </template>
                <div class="ct-rerun-pop">
                  <div class="ct-rerun-pop-head">
                    <span>Last call</span>
                    <span
                      v-if="mcpToolResults[t.name]"
                      class="ct-rerun-pop-state"
                      :class="{
                        'ct-rerun-pop-state--ok': !mcpToolResults[t.name]?.error,
                        'ct-rerun-pop-state--err': !!mcpToolResults[t.name]?.error
                      }"
                      >{{ mcpToolResults[t.name]?.error ? "failed" : "ok"
                      }}{{ mcpToolResults[t.name]?.durationMs != null ? ` · ${mcpToolResults[t.name]?.durationMs}ms` : "" }}</span
                    >
                  </div>
                  <div v-if="mcpToolResults[t.name]?.error" class="ct-rerun-pop-err">{{ mcpToolResults[t.name]?.error }}</div>
                  <pre v-else-if="mcpToolResults[t.name]?.content" class="ct-rerun-pop-content">{{
                    mcpToolResults[t.name]?.content
                  }}</pre>
                  <div v-if="mcpToolResults[t.name]?.content" class="ct-rerun-pop-actions">
                    <el-button
                      size="small"
                      text
                      :icon="copiedRerunTool === t.name ? Check : failedRerunTool === t.name ? Close : undefined"
                      :type="copiedRerunTool === t.name ? 'success' : failedRerunTool === t.name ? 'danger' : ''"
                      :title="copiedRerunTool === t.name ? 'Copied' : failedRerunTool === t.name ? 'Copy failed' : 'Copy result'"
                      @click="copyMcpToolResult(mcpToolResults[t.name]!.content!, t.name)"
                      >{{ copiedRerunTool === t.name ? "Copied" : failedRerunTool === t.name ? "Failed" : "Copy" }}</el-button
                    >
                    <el-button
                      size="small"
                      text
                      :icon="FolderChecked"
                      title="Save this tool result to the knowledge base"
                      @click="saveMcpToolResultToKB(mcpToolResults[t.name]!.content!)"
                      >Save to KB</el-button
                    >
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
                >{{ expandedMcpTools.has(t.name) ? "−" : "+" }}</el-button
              >
            </div>
            <div class="ct-skill-desc">
              <template
                v-for="(seg, si) in highlightSegments(t.description || '(no description)', activeToolFilter(mcpToolFilter))"
                :key="si"
              >
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
              <span v-if="mcpToolResults[t.name].durationMs != null" class="ct-skill-lastcall-ms"
                >· {{ mcpToolResults[t.name].durationMs }}ms</span
              >
              <span v-if="mcpToolResults[t.name].error" class="ct-skill-lastcall-err">· failed</span>
              <span class="ct-skill-lastcall-count" :title="`Called ${mcpToolResults[t.name].count} time(s) this session`"
                >· ×{{ mcpToolResults[t.name].count }}</span
              >
            </div>
            <!-- Schema-driven args editor (Pi-inspired: introspect tool's input_schema) -->
            <div v-if="getToolProps(t).length" class="ct-mcp-args">
              <div v-for="prop in getToolProps(t)" :key="prop.name" class="ct-mcp-arg">
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
            <span
              >Tools · {{ activeSkillCount }} active<span v-if="builtinToolFilter" class="ct-skills-filter-count">
                ({{ visibleSkills.length }}/{{ sortedSkills.length }} match)</span
              ><el-popover v-if="pinnedBuiltinCount" placement="bottom" trigger="click" :width="240">
                <template #reference>
                  <span
                    class="ct-skills-pin-count ct-skills-pin-count--clickable"
                    :title="`${pinnedBuiltinCount} pinned tool(s) — click to manage`"
                  >
                    · {{ pinnedBuiltinCount }}★</span
                  >
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
                        >{{ PIN_SORT_MODE_LABEL[pinSortMode] }}</el-button
                      >
                      <el-button size="small" text type="danger" title="Unpin all built-in tools" @click="unpinAllBuiltin"
                        >Unpin all</el-button
                      >
                    </div>
                  </div>
                  <div v-if="pinnedBuiltinNames.length" class="ct-pin-spark-legend-wrap">
                    <el-button
                      size="small"
                      text
                      class="ct-pin-spark-legend-toggle"
                      :title="pinLegendCollapsed ? 'Show legend' : 'Hide legend'"
                      @click="togglePinLegend"
                      >{{ pinLegendCollapsed ? "▸ Legend" : "▾ Legend" }}</el-button
                    >
                    <div v-show="!pinLegendCollapsed" class="ct-pin-spark-legend">
                      <span
                        ><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-success-light-3); opacity: 0.5"></i
                        >median</span
                      >
                      <span
                        ><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-danger-light-5); opacity: 0.6"></i
                        >p90</span
                      >
                      <span
                        ><i class="ct-pin-spark-legend-dot" style="background: var(--el-text-color-secondary); opacity: 0.5"></i
                        >avg</span
                      >
                      <span
                        ><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-warning); opacity: 0.6"></i>slow
                        threshold</span
                      >
                      <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-danger)"></i>slow</span>
                      <span
                        ><i
                          class="ct-pin-spark-legend-dot"
                          style="background: none; border: 1px solid var(--el-color-danger); opacity: 0.8"
                        ></i
                        >stuck (2× median)</span
                      >
                      <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-success)"></i>fastest</span>
                      <span><i class="ct-pin-spark-legend-dot" style="background: var(--el-color-primary)"></i>latest</span>
                    </div>
                  </div>
                  <div
                    v-for="n in pinnedBuiltinNames"
                    :key="n"
                    class="ct-pin-pop-row"
                    :class="{ 'ct-pin-pop-row--stale': isBuiltinPinStale(n) }"
                  >
                    <span class="ct-pin-pop-name">{{ n }}</span>
                    <span class="ct-pin-pop-meta">
                      <span
                        class="ct-pin-pop-count"
                        :title="`${builtinPinCount(n)} this session${builtinPinAvgMs(n) ? ` · avg ${builtinPinAvgMs(n)}` : ''}${builtinPinMedianMs(n) ? ` · median ${builtinPinMedianMs(n)}` : ''}${builtinPinP90Ms(n) ? ` · p90 ${builtinPinP90Ms(n)}` : ''}${builtinPinMaxMs(n) ? ` · max ${builtinPinMaxMs(n)}` : ''}${builtinPinProjectionPoint(n) ? ` · projected +10 calls ${Math.round(builtinPinProjectionPoint(n)!.ms)}ms` : ''}${builtinPinStuckSummary(n) ? ` · stuck: ${builtinPinStuckSummary(n)}` : ''}${builtinPinFailRate(n) ? ` · ${builtinPinFailRate(n)}` : ''}${isBuiltinPinStale(n) ? ' · stale pin (never invoked)' : ''}`"
                        >{{ builtinPinCount(n)
                        }}<span v-if="builtinPinMedianMs(n)" class="ct-pin-pop-avg"> · {{ builtinPinMedianMs(n) }}</span
                        ><span v-else-if="builtinPinAvgMs(n)" class="ct-pin-pop-avg"> · {{ builtinPinAvgMs(n) }}</span></span
                      >
                      <svg
                        v-if="builtinPinSparkPath(n)"
                        class="ct-pin-pop-spark"
                        :width="PIN_SPARK_W"
                        :height="PIN_SPARK_H"
                        :viewBox="`0 0 ${PIN_SPARK_W} ${PIN_SPARK_H}`"
                        :aria-label="`Recent latency trajectory for ${n}`"
                        @mouseleave="setPinHover(null, null)"
                      >
                        <line
                          v-if="builtinPinSparkMedianY(n) >= 0"
                          :x1="0"
                          :x2="PIN_SPARK_W"
                          :y1="builtinPinSparkMedianY(n)"
                          :y2="builtinPinSparkMedianY(n)"
                          stroke="var(--el-color-success-light-3)"
                          stroke-width="0.4"
                          stroke-dasharray="1.5,1.5"
                          opacity="0.5"
                        />
                        <line
                          v-if="builtinPinSparkP90Y(n) >= 0"
                          :x1="0"
                          :x2="PIN_SPARK_W"
                          :y1="builtinPinSparkP90Y(n)"
                          :y2="builtinPinSparkP90Y(n)"
                          stroke="var(--el-color-danger-light-5)"
                          stroke-width="0.4"
                          stroke-dasharray="1.5,1.5"
                          opacity="0.6"
                        />
                        <line
                          v-if="builtinPinSparkAvgY(n) >= 0"
                          :x1="0"
                          :x2="PIN_SPARK_W"
                          :y1="builtinPinSparkAvgY(n)"
                          :y2="builtinPinSparkAvgY(n)"
                          stroke="var(--el-text-color-secondary)"
                          stroke-width="0.4"
                          stroke-dasharray="1.5,1.5"
                          opacity="0.5"
                        />
                        <line
                          v-if="builtinPinSparkThresholdY(n) >= 0"
                          :x1="0"
                          :x2="PIN_SPARK_W"
                          :y1="builtinPinSparkThresholdY(n)"
                          :y2="builtinPinSparkThresholdY(n)"
                          stroke="var(--el-color-warning)"
                          stroke-width="0.5"
                          stroke-dasharray="1,1"
                          opacity="0.6"
                          filter="url(#ssb-spark-glow-sm)"
                        />
                        <path
                          :d="builtinPinSparkPath(n)"
                          fill="none"
                          stroke="var(--el-color-info)"
                          stroke-width="1"
                          stroke-linejoin="round"
                          stroke-linecap="round"
                        />
                        <line
                          v-if="builtinPinProjectionPoint(n) && builtinPinSparkPoints(n).length"
                          :x1="builtinPinSparkPoints(n)[builtinPinSparkPoints(n).length - 1].cx"
                          :y1="builtinPinSparkPoints(n)[builtinPinSparkPoints(n).length - 1].cy"
                          :x2="builtinPinProjectionPoint(n)!.x"
                          :y2="builtinPinProjectionPoint(n)!.y"
                          stroke="var(--el-color-warning-light-3)"
                          stroke-width="0.5"
                          stroke-dasharray="1,1"
                          opacity="0.7"
                          filter="url(#ssb-spark-glow-sm)"
                        />
                        <circle
                          v-if="builtinPinProjectionPoint(n)"
                          :cx="builtinPinProjectionPoint(n)!.x"
                          :cy="builtinPinProjectionPoint(n)!.y"
                          r="0.8"
                          fill="var(--el-color-warning-light-3)"
                          stroke="var(--el-bg-color)"
                          stroke-width="0.2"
                          filter="url(#ssb-spark-glow-sm)"
                        >
                          <title>{{ `Projected +10 calls · ${Math.round(builtinPinProjectionPoint(n)!.ms)}ms` }}</title>
                        </circle>
                        <line
                          v-if="pinHoverKey === n && pinHoverIdx != null && builtinPinSparkPoints(n)[pinHoverIdx]"
                          :x1="builtinPinSparkPoints(n)[pinHoverIdx].cx"
                          :x2="builtinPinSparkPoints(n)[pinHoverIdx].cx"
                          :y1="0"
                          :y2="PIN_SPARK_H"
                          :stroke="builtinPinCrosshairColor(n)"
                          stroke-width="0.8"
                          stroke-dasharray="1.5,1"
                          opacity="0.9"
                          filter="url(#ssb-spark-glow-sm)"
                        />
                        <circle
                          v-if="pinHoverKey === n && pinHoverIdx != null && builtinPinSparkPoints(n)[pinHoverIdx]"
                          :cx="builtinPinSparkPoints(n)[pinHoverIdx].cx"
                          :cy="0.5"
                          r="0.8"
                          :fill="builtinPinCrosshairColor(n)"
                          filter="url(#ssb-spark-glow-sm)"
                        />
                        <circle
                          v-if="pinHoverKey === n && pinHoverIdx != null && builtinPinSparkPoints(n)[pinHoverIdx]"
                          :cx="builtinPinSparkPoints(n)[pinHoverIdx].cx"
                          :cy="PIN_SPARK_H - 0.5"
                          r="0.8"
                          :fill="builtinPinCrosshairColor(n)"
                          filter="url(#ssb-spark-glow-sm)"
                        />
                        <circle
                          v-for="(p, i) in builtinPinSparkPoints(n)"
                          :key="i"
                          :cx="p.cx"
                          :cy="p.cy"
                          :r="
                            p.ms >= slowThresholdMs || p.idx === builtinPinSparkMinIdx(n) || p.idx === builtinPinSparkLatestIdx(n)
                              ? 1.3
                              : 0.9
                          "
                          :fill="
                            p.ms >= slowThresholdMs
                              ? 'var(--el-color-danger)'
                              : p.idx === builtinPinSparkMinIdx(n)
                                ? 'var(--el-color-success)'
                                : p.idx === builtinPinSparkLatestIdx(n)
                                  ? 'var(--el-color-primary)'
                                  : 'var(--el-color-info)'
                          "
                          :filter="
                            p.ms >= slowThresholdMs || p.idx === builtinPinSparkMinIdx(n) || p.idx === builtinPinSparkLatestIdx(n)
                              ? 'url(#ssb-spark-stroke-sm)'
                              : 'none'
                          "
                        />
                        <circle
                          v-for="idx in builtinPinStuckIndices(n)"
                          :key="`stuck-${idx}`"
                          :cx="builtinPinSparkPoints(n)[idx - 1].cx"
                          :cy="builtinPinSparkPoints(n)[idx - 1].cy"
                          r="1.8"
                          fill="none"
                          stroke="var(--el-color-danger)"
                          stroke-width="0.5"
                          opacity="0.8"
                          pointer-events="none"
                          filter="url(#ssb-spark-stroke-sm)"
                          class="ct-stuck-ring"
                        >
                          <title>{{ `Stuck call ${idx} · ${builtinPinSparkPoints(n)[idx - 1].ms}ms ≥ 2× median` }}</title>
                        </circle>
                        <rect
                          v-for="(p, i) in builtinPinSparkPoints(n)"
                          :key="`hit-${i}`"
                          :x="p.cx - (builtinPinHitWidths(n)[i] ?? builtinPinHitW(n)) / 2"
                          :y="0"
                          :width="builtinPinHitWidths(n)[i] ?? builtinPinHitW(n)"
                          :height="PIN_SPARK_H"
                          fill="transparent"
                          pointer-events="all"
                          class="ct-pin-pop-spark-hit"
                          @mouseenter="setPinHover(n, i)"
                        >
                          <title>
                            {{
                              `Call ${p.idx} · ${p.ms}ms${p.ms >= slowThresholdMs ? " · slow" : p.idx === builtinPinSparkMinIdx(n) ? " · fastest" : p.idx === builtinPinSparkLatestIdx(n) ? " · latest" : ""}`
                            }}
                          </title>
                        </rect>
                      </svg>
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
              >{{ skillSortLabel[skillSortMode] }}</el-button
            >
            <el-button
              class="ct-skills-compact-toggle"
              :class="{ 'is-active': compactMode }"
              size="small"
              text
              :title="
                compactMode
                  ? 'Compact view — click to show descriptions and stats'
                  : 'Full view — click to collapse to one-line per tool'
              "
              @click="compactMode = !compactMode"
              >{{ compactMode ? "▤" : "▥" }}</el-button
            >
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
              'is-selected': i === selectedBuiltinIdx
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
                >{{ pinnedTools.has(tool.name) ? "★" : "☆" }}</el-button
              >
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
              <span
                v-if="tool.enabled === false"
                class="ct-skill-tag ct-skill-tag--off"
                title="Disabled — toggle via RAG / Web pills"
                >off</span
              >
              <span v-else class="ct-skill-tag ct-skill-tag--on" title="Enabled">on</span>
              <el-button
                v-if="hasToolPromptMeta(tool)"
                size="small"
                text
                class="ct-skill-meta-toggle"
                :class="{ 'is-open': expandedTools.has(tool.name) }"
                @click="toggleToolExpand(tool.name)"
                >{{ expandedTools.has(tool.name) ? "−" : "+" }}</el-button
              >
            </div>
            <div class="ct-skill-desc">
              <template
                v-for="(seg, si) in highlightSegments(tool.description ?? '', activeToolFilter(builtinToolFilter))"
                :key="si"
              >
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
              <span
                v-if="toolLastCalls[tool.name].durationMs != null"
                class="ct-skill-lastcall-ms"
                :class="{
                  'ct-skill-lastcall-ms--slow':
                    toolLastCalls[tool.name].maxMs != null &&
                    toolLastCalls[tool.name].durationMs! > toolLastCalls[tool.name].maxMs! * 1.5
                }"
                >· {{ toolLastCalls[tool.name].durationMs }}ms</span
              >
              <span v-if="toolLastCalls[tool.name].error" class="ct-skill-lastcall-err">· failed</span>
              <span
                class="ct-skill-lastcall-count"
                :title="`Called ${toolLastCalls[tool.name].count} time(s) this session${toolLastCalls[tool.name].avgMs != null ? ' · avg ' + toolLastCalls[tool.name].avgMs + 'ms' : ''}${toolLastCalls[tool.name].maxMs != null ? ' · max ' + toolLastCalls[tool.name].maxMs + 'ms' : ''}`"
                >· ×{{ toolLastCalls[tool.name].count
                }}<template v-if="toolLastCalls[tool.name].avgMs != null"> · {{ toolLastCalls[tool.name].avgMs }}ms avg</template
                ><template v-if="toolLastCalls[tool.name].maxMs != null">
                  · {{ toolLastCalls[tool.name].maxMs }}ms max</template
                ></span
              >
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
          <div v-if="!allSkills.length" class="ct-skills-empty">No tools registered</div>
        </div>
      </el-popover>
    </div>
    <div class="ct-right">
      <!-- Pills group: status toggles -->
      <div class="ct-pills-group">
        <el-popover :visible="contextPopoverVisible" placement="bottom" :width="520" @show="onContextPopoverShow">
          <template #reference>
            <div class="ct-pill" :class="{ on: contextFileCount > 0 }" title="Manage context files" @click="toggleContextPopover">
              <el-icon :size="14"><CollectionTag /></el-icon>
              <span class="ct-pill-label">Context{{ contextFileCount > 0 ? `: ${contextFileCount}` : "" }}</span>
            </div>
          </template>
          <!-- Close button -->
          <div class="ct-pop-close" @click="contextPopoverVisible = false">
            <el-icon :size="16"><Close /></el-icon>
          </div>
          <!-- Tabs -->
          <div class="ct-pop-tabs">
            <div class="ct-pop-tab" :class="{ active: contextPopoverTab === 'context' }" @click="contextPopoverTab = 'context'">
              Context{{ contextFileCount > 0 ? ` (${contextFileCount})` : "" }}
            </div>
            <div class="ct-pop-tab" :class="{ active: contextPopoverTab === 'browse' }" @click="contextPopoverTab = 'browse'">
              Browse
            </div>
          </div>

          <!-- Context tab -->
          <div v-if="contextPopoverTab === 'context'" class="ct-pop-panel">
            <template v-if="contextFileCount > 0">
              <div class="ct-context-list">
                <div v-for="file in contextFiles ?? []" :key="file" class="ct-context-item">
                  <span class="ct-context-item-path" title="Click to preview" @click="handleFileClick(file)">{{ file }}</span>
                  <el-button size="small" text :icon="Edit" title="Edit context content" @click="openContextEditor(file)" />
                  <el-button
                    size="small"
                    text
                    type="danger"
                    :icon="Delete"
                    title="Remove from context"
                    @click="emit('remove-context-file', file)"
                  />
                </div>
              </div>
              <div v-if="editingContextFile" class="ct-edit-section">
                <div class="ct-edit-header">
                  <span class="ct-edit-path">{{ editingContextFile }}</span>
                  <span class="ct-edit-hint">Editing context content for this session</span>
                </div>
                <el-input
                  v-model="editingContent"
                  type="textarea"
                  :autosize="{ minRows: 4, maxRows: 12 }"
                  placeholder="Enter file content..."
                />
                <div class="ct-edit-actions">
                  <el-button size="small" @click="cancelContextEdit">Cancel</el-button>
                  <el-button size="small" type="primary" @click="saveContextEdit">Save</el-button>
                </div>
              </div>
              <div
                class="ct-context-drop"
                :class="{ 'is-over': contextDropOver }"
                @dragover="onContextDragOver"
                @dragenter="onContextDragEnter"
                @dragleave="onContextDragLeave"
                @drop="onContextDrop"
              >
                <template v-if="contextDropOver">
                  <span class="ct-context-drop-icon">📄</span>
                  <span>Release to add</span>
                </template>
                <template v-else>
                  <span class="ct-context-drop-hint">Drag files from Browse tab or type <code>@</code> in chat</span>
                </template>
              </div>
            </template>
            <template v-else>
              <div class="ct-context-empty-state">
                <div class="ct-context-empty-icon">📄</div>
                <div class="ct-context-empty-title">No context files</div>
                <div class="ct-context-empty-desc">
                  Browse knowledge files in the <b>Browse</b> tab and click to add them as context.
                </div>
              </div>
            </template>
          </div>

          <!-- Browse tab -->
          <div v-else class="ct-pop-panel">
            <div class="ct-browse-search">
              <el-input
                v-model="knowledgeSearch"
                placeholder="Filter knowledge files..."
                size="small"
                clearable
                :prefix-icon="Search"
              />
            </div>
            <el-scrollbar max-height="320px">
              <div v-if="knowledgeStore.loading && !knowledgeTree.length" class="ct-browse-loading">
                Loading knowledge files...
              </div>
              <div v-else-if="!knowledgeTree.length" class="ct-browse-empty">
                <template v-if="knowledgeSearch">No files match "{{ knowledgeSearch }}"</template>
                <template v-else>No knowledge files available. Sync from YiKnowledge to populate.</template>
              </div>
              <div v-else class="ct-browse-tree">
                <template v-for="item in browseDisplayItems" :key="item.node.key">
                  <!-- Folder -->
                  <div
                    v-if="item.node.type === 'folder'"
                    class="ct-browse-folder"
                    :style="{ paddingLeft: item.depth * 16 + 8 + 'px' }"
                  >
                    <span class="ct-browse-folder-toggle" @click="toggleKnowledgeFolder(item.node.key)">
                      <el-icon :size="14">
                        <FolderOpened v-if="knowledgeExpandedFolders.has(item.node.key)" />
                        <Folder v-else />
                      </el-icon>
                      <span class="ct-browse-folder-label">{{ item.node.label }}</span>
                      <span class="ct-browse-folder-count">{{ item.node.children?.length ?? 0 }}</span>
                    </span>
                    <el-button
                      size="small"
                      type="primary"
                      :icon="Plus"
                      title="Add all files in folder to context"
                      @click.stop="addFolderToContext(item.node)"
                    />
                  </div>
                  <!-- File -->
                  <div
                    v-else
                    class="ct-browse-file"
                    :class="{ 'is-in-context': contextFiles?.includes(item.node.path) }"
                    :style="{ paddingLeft: item.depth * 16 + 8 + 'px' }"
                  >
                    <el-icon :size="13"><Document /></el-icon>
                    <div class="ct-browse-file-info">
                      <span
                        class="ct-browse-file-label"
                        :title="`Preview: ${item.node.path}`"
                        @click="openKnowledgePreview(item.node.path)"
                        >{{ item.node.label }}</span
                      >
                      <span class="ct-browse-file-path">{{ item.node.path }}</span>
                    </div>
                    <el-button
                      v-if="contextFiles?.includes(item.node.path)"
                      size="small"
                      text
                      type="success"
                      :icon="Check"
                      title="Already in context"
                      disabled
                    />
                    <el-button
                      v-else
                      size="small"
                      type="primary"
                      :icon="Plus"
                      title="Add to context"
                      @click.stop="onKnowledgeFileClick(item.node)"
                    />
                  </div>
                </template>
              </div>
            </el-scrollbar>
          </div>
        </el-popover>
        <!-- RAG split-button: left toggles, right opens settings -->
        <el-popover
          v-model:visible="ragSettingsVisible"
          placement="bottom"
          :width="300"
          trigger="click"
          :teleported="true"
          popper-class="ct-rag-console-pop"
        >
          <template #reference>
            <div
              class="ct-pill ct-pill--rag"
              :class="{
                on: ragToggle,
                combined: ragToggle && webSearchToggle,
                retrieving: isRetrieving,
                fast: ragToggle && store.ragFast,
                sourced: !isRetrieving && !sending && ragSourceCount > 0,
                unavailable: !ragIndexAvailable
              }"
              :title="ragTooltip"
            >
              <span class="ct-pill--rag-main" @click.stop="emit('toggle-rag')">
                <span class="ct-rag-dot" :class="ragHealthDot" />
                <el-icon :size="14" :class="{ 'ct-spin': isRetrieving }">
                  <Loading v-if="isRetrieving" />
                  <Cpu v-else />
                </el-icon>
                <span class="ct-pill-label">
                  {{ ragToggle && webSearchToggle ? 'RAG+Web' : isRetrieving ? 'Retrieving' : 'RAG' }}
                </span>
                <span v-if="ragToggle && store.ragFast" class="ct-rag-fast-badge">FAST</span>
                <span v-if="!isRetrieving && !sending && ragSourceCount > 0" class="ct-rag-src-badge" :class="'grade-' + ragGrade?.toLowerCase()">
                  {{ ragSourceCount }}{{ ragGrade ? ` · ${ragGrade}` : '' }}
                </span>
              </span>
              <span class="ct-pill--rag-gear" title="RAG Settings">
                <el-icon :size="10"><Setting /></el-icon>
              </span>
            </div>
          </template>
          <div class="ct-rag-pop">
            <div class="ct-rag-pop-head">
              <span class="ct-rag-pop-title">
                <span class="ct-rag-dot ct-rag-dot--lg" :class="ragHealthDot" />
                RAG Settings
              </span>
              <span v-if="ragIndexStatus?.num_docs" class="ct-rag-pop-docs">{{ ragIndexStatus.num_docs }} docs indexed</span>
              <span v-else class="ct-rag-pop-docs ct-rag-pop-docs--warn">Index not built</span>
            </div>
            <template v-if="store.ragEnabled || ragIndexAvailable">
              <div class="ct-rag-pop-section">
                <div class="ct-rag-pop-section-title">Chat Engine</div>
                <div class="ct-rag-row">
                  <div class="ct-rag-row-label">
                    <span>Chat Mode</span>
                  </div>
                  <el-select
                    :model-value="store.ragChatMode ?? 'condense_plus_context'"
                    size="small"
                    class="ct-rag-select"
                    @change="store.ragChatMode = ($event as string)"
                    @click.stop
                  >
                    <el-option label="Condense (LLM)" value="condense" />
                    <el-option label="Heuristic" value="condense_plus_context" />
                    <el-option label="Context (all)" value="context" />
                    <el-option label="Simple" value="simple" />
                  </el-select>
                </div>
                <div class="ct-rag-row-desc">How conversation history is condensed for retrieval context</div>
                <div class="ct-rag-row">
                  <div class="ct-rag-row-label">
                    <span>Fast Mode</span>
                  </div>
                  <el-switch :model-value="store.ragFast" size="small" @update:model-value="store.ragFast = !store.ragFast" @click.stop />
                </div>
                <div class="ct-rag-row-desc">Skip retrieval entirely — direct LLM answer for speed</div>
              </div>
              <div class="ct-rag-pop-section">
                <div class="ct-rag-pop-section-title">Retrieval</div>
                <div class="ct-rag-row">
                  <div class="ct-rag-row-label">
                    <span>Query Variants</span>
                  </div>
                  <el-select
                    :model-value="store.ragNumQueries ?? 0"
                    size="small"
                    class="ct-rag-select"
                    @change="store.ragNumQueries = Number($event)"
                    @click.stop
                  >
                    <el-option label="Default (1)" :value="0" />
                    <el-option label="1 — no expansion" :value="1" />
                    <el-option label="3 — balanced" :value="3" />
                    <el-option label="5 — thorough" :value="5" />
                  </el-select>
                </div>
                <div class="ct-rag-row-desc">QueryFusionRetriever generates N variants for broader recall</div>
                <div class="ct-rag-row">
                  <div class="ct-rag-row-label">
                    <span>Hybrid (BM25 + Vector)</span>
                  </div>
                  <el-switch :model-value="store.ragHybrid" size="small" @update:model-value="store.ragHybrid = !store.ragHybrid" @click.stop />
                </div>
                <div class="ct-rag-row-desc">Combine keyword matching with semantic search for better recall</div>
              </div>
              <div class="ct-rag-pop-section">
                <div class="ct-rag-pop-section-title">Ranking</div>
                <div class="ct-rag-row">
                  <div class="ct-rag-row-label">
                    <span>Rerank (LLM)</span>
                  </div>
                  <el-switch :model-value="store.ragRerank" size="small" @update:model-value="store.ragRerank = !store.ragRerank" @click.stop />
                </div>
                <div class="ct-rag-row-desc">Cross-encoder re-ranks retrieved chunks for precision (~8 LLM calls)</div>
                <div class="ct-rag-row">
                  <div class="ct-rag-row-label">
                    <span>HyDE</span>
                  </div>
                  <el-switch :model-value="store.ragHyde" size="small" @update:model-value="store.ragHyde = !store.ragHyde" @click.stop />
                </div>
                <div class="ct-rag-row-desc">Generate hypothetical answer first to improve embedding match</div>
              </div>
              <div class="ct-rag-pop-section">
                <div class="ct-rag-pop-section-title">Output</div>
                <div class="ct-rag-row">
                  <div class="ct-rag-row-label">
                    <span>Inline Citations [N]</span>
                  </div>
                  <el-switch :model-value="store.ragCitations" size="small" @update:model-value="store.ragCitations = !store.ragCitations" @click.stop />
                </div>
                <div class="ct-rag-row-desc">Prefix chunks with [Source N] markers for traceable answers</div>
              </div>
              <div class="ct-rag-pop-footer">
                <el-button
size="small" text type="info" @click.stop="
                  store.ragChatMode = 'condense_plus_context';
                  store.ragFast = false;
                  store.ragNumQueries = 0;
                  store.ragHybrid = true;
                  store.ragRerank = true;
                  store.ragHyde = false;
                  store.ragCitations = true;
                ">Reset to Defaults</el-button>
              </div>
            </template>
            <div v-else class="ct-rag-pop-section">
              <div class="ct-rag-pop-empty">
                Knowledge index not built. Run a build from the RAG dashboard or use <code>python -m scripts.build_index</code> on the server.
              </div>
            </div>
          </div>
        </el-popover>
        <div
          class="ct-pill ct-pill--web"
          :class="{ on: webSearchToggle, searching: store.webSearching, combined: webSearchToggle && ragToggle }"
          :title="
            store.webSearching
              ? 'Searching the web...'
              : webSearchToggle && ragToggle
                ? 'Web + RAG combined — answers grounded in knowledge base and real-time web results'
                : webSearchToggle
                  ? 'Web search on — answers grounded in real-time search results'
                  : 'Web search off — toggle to search the web'
          "
          @click="emit('toggle-web-search')"
        >
          <el-icon :size="14" :class="{ 'ct-spin': store.webSearching }">
            <Loading v-if="store.webSearching" />
            <Search v-else />
          </el-icon>
          <span class="ct-pill-label">{{
            store.webSearching
              ? 'Searching...'
              : webSearchToggle && store.webSearchResults.length
                ? `Web ${store.webSearchResults.length}`
                : 'Web'
          }}</span>
          <span v-if="webSearchToggle && store.searchTimingMs > 0 && !store.webSearching" class="ct-pill-timing">
            {{ store.searchTimingMs < 1000 ? `${store.searchTimingMs}ms` : `${(store.searchTimingMs / 1000).toFixed(1)}s` }}
          </span>
        </div>
        </div>
      <!-- Running tools indicator -->
      <div v-for="tool in runningTools" :key="tool.name" class="ct-pill on" :title="`Running: ${tool.label}`">
        <el-icon :size="14" class="ct-spin"><Loading /></el-icon>
        <span class="ct-pill-label">{{ tool.label }}</span>
      </div>
      <RequestStatusButton v-if="sending" :sending="sending" :streaming-type="streamingType" @stop="emit('stop')" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "./styles/toolbar.scss";
@use "./styles/context.scss";
@use "./styles/skills.scss";
</style>
<style lang="scss">
@use "./styles/global.scss";
</style>
