<script setup lang="ts" name="aiChatToolbar">
import { inject, ref, computed, onMounted } from "vue";
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
  DocumentCopy,
  Clock,
  Cpu,
  Refresh
} from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useKnowledgeTreeStore } from "@/stores/modules/knowledgeTree";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { usePromptHistory, clearPromptHistory, removePromptHistoryAt } from "@/hooks/usePromptHistory";
import { useSlowThreshold } from "@/hooks/useSlowThreshold";
import { useSkillsMcp } from "./useSkillsMcp";
import RequestStatusButton from "../RequestStatusButton.vue";
import FaqPopover from "../FaqPopover.vue";

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
    ragHyde?: boolean;
    ragScope?: string;
    ragNumQueries?: number;
    ragChatMode?: string;
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
    ragAvailable: false,
    webSearchToggle: false,
    ragHybrid: true,
    ragRerank: true,
    ragCitations: true,
    ragHyde: true,
    ragScope: "",
    ragNumQueries: 0,
    ragChatMode: "condense_plus_context",
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
  (e: "toggle-rag-hybrid"): void;
  (e: "toggle-rag-rerank"): void;
  (e: "toggle-rag-citations"): void;
  (e: "toggle-rag-hyde"): void;
  (e: "update-rag-scope", scope: string): void;
  (e: "update-rag-num-queries", n: number): void;
  (e: "update-rag-chat-mode", mode: string): void;
  (e: "stop"): void;
  (e: "remove-context-file", path: string): void;
  (e: "update-selected-model", model: string): void;
}>();

const collapseCtx = inject<{ collapsible: boolean; side: "fill" | "right" | "left"; toggle: () => void } | null>(
  "aiChatBoxCollapse",
  null
);

const openKnowledgePreview = inject<(path: string) => void>("openKnowledgePreview", () => {});

const contextPopoverVisible = ref(false);
const contextFileCount = computed(() => (props.contextFiles ?? []).length);

function toggleContextPopover() {
  contextPopoverVisible.value = !contextPopoverVisible.value;
}

/** Whether RAG is toggled on. */
const ragOn = computed(() => props.ragToggle);

// ── RAG index status ──────────────────────────────────────────────────

const ragIndexStatus = ref<{ built: boolean; num_docs: number; last_built_at: string } | null>(null);
onMounted(async () => {
  try {
    const { ragStatus } = await import("@/api/modules/ragService");
    const data = await ragStatus();
    ragIndexStatus.value = data as any;
  } catch { /* best-effort — show generic tooltip if fetch fails */ }
});

const ragTooltip = computed(() => {
  const shortcut = "Ctrl+Shift+R";
  if (!ragIndexStatus.value?.built) {
    return `RAG off — index not built yet (${shortcut} to toggle)`;
  }
  const info = ragIndexStatus.value;
  if (props.ragToggle && props.webSearchToggle) return `RAG+Web · ${info.num_docs} docs indexed (${shortcut})`;
  if (props.ragToggle) return `RAG on · ${info.num_docs} docs, last built ${info.last_built_at?.slice(0, 10)} (${shortcut})`;
  return `RAG off · ${info.num_docs} docs available (${shortcut} to toggle)`;
});

const store = useAiChatStore();
const knowledgeStore = useKnowledgeTreeStore();
const { slowThresholdMs } = useSlowThreshold();

function handleFileClick(path: string) {
  openKnowledgePreview(path);
}

// ── Context file drag-and-drop ──

const contextDropOver = ref(false);
let contextDropCounter = 0;

interface DragContextNode {
  type: "file" | "folder";
  name: string;
  path: string;
  content?: string;
  tags?: string[];
  children?: DragContextNode[];
}

function collectDragFiles(nodes: DragContextNode[]): DragContextNode[] {
  const out: DragContextNode[] = [];
  for (const n of nodes) {
    if (n.type === "file") out.push(n);
    if (n.children?.length) out.push(...collectDragFiles(n.children));
  }
  return out;
}

async function addContextFiles(files: Array<{ path: string; content?: string; name?: string }>) {
  if (!store.activeConversation) {
    await store.createConversation();
  }
  if (!store.activeConversation) {
    ElMessage.error("No active conversation — please start a chat first");
    return;
  }
  const existingTags = store.activeConversation?.tags ?? [];
  const existingCtx = new Set(existingTags.filter((t: string) => t.startsWith("ctx:")).map((t: string) => t.slice(4)));
  let added = 0;
  for (const f of files) {
    if (!f.path) continue;
    if (existingCtx.has(f.path)) continue;
    try {
      let content = f.content || "";
      if (!content) {
        const result = await readKnowledgeFile(f.path);
        content = (result as any)?.content || "";
      }
      if (!content) {
        ElMessage.warning(`No content found for: ${f.path}`);
        continue;
      }
      await store.applyContextChange(f.path, content);
      added++;
      existingCtx.add(f.path);
    } catch (e: unknown) {
      ElMessage.error(e instanceof Error ? e.message : `Failed to add: ${f.path}`);
    }
  }
  if (added > 0) {
    ElMessage.success(`Added ${added} file(s) to context`);
  }
}

function onContextDragOver(e: DragEvent) {
  if (!e.dataTransfer?.types.includes("application/x-knowledge-file")) return;
  e.preventDefault();
  e.dataTransfer!.dropEffect = "link";
}

function onContextDragEnter(e: DragEvent) {
  if (!e.dataTransfer?.types.includes("application/x-knowledge-file")) return;
  e.preventDefault();
  contextDropCounter++;
  contextDropOver.value = true;
}

function onContextDragLeave(_e: DragEvent) {
  contextDropCounter--;
  if (contextDropCounter <= 0) {
    contextDropCounter = 0;
    contextDropOver.value = false;
  }
}

async function onContextDrop(e: DragEvent) {
  contextDropOver.value = false;
  contextDropCounter = 0;
  const raw = e.dataTransfer?.getData("application/x-knowledge-file");
  if (!raw) return;
  e.preventDefault();
  try {
    const parsed = JSON.parse(raw);
    const items: DragContextNode[] = Array.isArray(parsed) ? parsed : [parsed];
    const files = collectDragFiles(items);
    await addContextFiles(files);
  } catch {
    /* ignore */
  }
}

// ── Context file editing ──

const editingContextFile = ref<string | null>(null);
const editingContent = ref("");

function openContextEditor(path: string) {
  editingContextFile.value = path;
  editingContent.value = store.getContextSectionContent(path) || "";
}

async function saveContextEdit() {
  const path = editingContextFile.value;
  if (!path) return;
  await store.applyContextChange(path, editingContent.value);
  editingContextFile.value = null;
  ElMessage.success(`Updated context: ${path}`);
}

function cancelContextEdit() {
  editingContextFile.value = null;
}

// ── Knowledge file browser (integrated in context popover) ──

const contextPopoverTab = ref<"context" | "browse">("context");
const knowledgeSearch = ref("");

interface KnowledgeTreeNode {
  key: string;
  label: string;
  type: "folder" | "file";
  path: string;
  children?: KnowledgeTreeNode[];
}

const knowledgeTree = computed<KnowledgeTreeNode[]>(() => {
  const filtered = knowledgeStore.filteredCategories;
  const rootChildren: KnowledgeTreeNode[] = [];
  const folderMap = new Map<string, KnowledgeTreeNode>();

  for (const cat of filtered) {
    for (const f of cat.files) {
      const parts = f.path.split("/").filter(Boolean);
      if (parts.length === 0) continue;

      let siblings = rootChildren;
      let prefix = "";
      for (let i = 0; i < parts.length; i++) {
        const segment = parts[i];
        prefix = prefix ? `${prefix}/${segment}` : segment;
        const isLeaf = i === parts.length - 1;
        if (isLeaf) {
          siblings.push({ key: f.path, label: f.name, type: "file", path: f.path });
        } else {
          let folder = folderMap.get(prefix);
          if (!folder) {
            folder = { key: `folder:${prefix}`, label: segment, type: "folder", path: prefix, children: [] };
            folderMap.set(prefix, folder);
            siblings.push(folder);
          }
          siblings = folder.children!;
        }
      }
    }
  }

  const q = knowledgeSearch.value.trim().toLowerCase();
  const filterTree = (nodes: KnowledgeTreeNode[]): KnowledgeTreeNode[] => {
    if (!q) return nodes;
    const out: KnowledgeTreeNode[] = [];
    for (const n of nodes) {
      if (n.type === "file") {
        if (n.label.toLowerCase().includes(q) || n.path.toLowerCase().includes(q)) {
          out.push(n);
        }
      } else {
        const filtered = n.children ? filterTree(n.children) : [];
        if (filtered.length) out.push({ ...n, children: filtered });
      }
    }
    return out;
  };

  const sorted = (nodes: KnowledgeTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.label.localeCompare(b.label, "zh-CN");
    });
    for (const n of nodes) if (n.children) sorted(n.children);
  };
  sorted(rootChildren);
  return filterTree(rootChildren);
});

const knowledgeExpandedFolders = ref<Set<string>>(new Set());

interface BrowseItem {
  node: KnowledgeTreeNode;
  depth: number;
}

const browseDisplayItems = computed<BrowseItem[]>(() => {
  const expanded = knowledgeExpandedFolders.value;
  const items: BrowseItem[] = [];

  function walk(nodes: KnowledgeTreeNode[], depth: number) {
    for (const n of nodes) {
      items.push({ node: n, depth });
      if (n.type === "folder" && n.children?.length && expanded.has(n.key)) {
        walk(n.children, depth + 1);
      }
    }
  }
  walk(knowledgeTree.value, 0);
  return items;
});

function toggleKnowledgeFolder(key: string) {
  const s = new Set(knowledgeExpandedFolders.value);
  if (s.has(key)) s.delete(key);
  else s.add(key);
  knowledgeExpandedFolders.value = s;
}

async function onKnowledgeFileClick(node: KnowledgeTreeNode) {
  if (node.type !== "file") return;
  await addContextFiles([{ path: node.path, name: node.label }]);
}

function collectFolderFiles(folder: KnowledgeTreeNode): Array<{ path: string; name: string }> {
  const out: Array<{ path: string; name: string }> = [];
  for (const child of folder.children ?? []) {
    if (child.type === "file") {
      out.push({ path: child.path, name: child.label });
    } else if (child.type === "folder") {
      out.push(...collectFolderFiles(child));
    }
  }
  return out;
}

async function addFolderToContext(folder: KnowledgeTreeNode) {
  const files = collectFolderFiles(folder);
  if (!files.length) return;
  await addContextFiles(files);
}

function onContextPopoverShow() {
  contextPopoverTab.value = contextFileCount.value > 0 ? "context" : "browse";
  knowledgeSearch.value = "";
  knowledgeStore.loadAll();
}

// ── Prompt history sub-panel
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
function trigrams(s: string): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i <= s.length - 3; i++) set.add(s.slice(i, i + 3));
  return set;
}
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  return intersection / (a.size + b.size - intersection);
}
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
            <span v-for="(p, i) in recentPromptChips" :key="`recent-${i}`" class="ct-history-chip">
              <span class="ct-history-chip-text" :title="`${p} — click to insert into input`" @click="useHistoryPrompt(p)">{{
                truncatePrompt(p)
              }}</span>
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
            {{
              historyQuery
                ? "No prompts match your filter."
                : "No prompts yet. Type a prompt and press Enter — it will show up here."
            }}
          </div>
          <div v-if="similarPrompts.length" class="ct-history-similar">
            <span class="ct-history-similar-label">Did you mean:</span>
            <span
              v-for="(p, i) in similarPrompts"
              :key="`sim-${i}`"
              class="ct-history-chip-text"
              :title="`${p.text} — similarity ${(p.score * 100).toFixed(0)}% · click to insert into input`"
              @click="useHistoryPrompt(p.text)"
              >{{ truncatePrompt(p.text, 60) }}
              <span class="ct-history-similar-score">{{ (p.score * 100).toFixed(0) }}%</span></span
            >
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
            <el-button size="small" type="danger" text :icon="Delete" @click="confirmClearHistory"
              >Clear all ({{ promptHistory.length }})</el-button
            >
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
        <div
          class="ct-pill ct-pill--rag"
          :class="{ on: ragToggle, combined: ragToggle && webSearchToggle }"
          :title="ragTooltip"
          @click="emit('toggle-rag')"
        >
          <el-icon :size="14"><Cpu /></el-icon>
          <span class="ct-pill-label">{{ ragToggle && webSearchToggle ? 'RAG+Web' : 'RAG' }}</span>
          <el-switch :model-value="ragToggle" size="small" @click.stop @update:model-value="emit('toggle-rag')" />
          <el-popover
            v-if="ragToggle"
            placement="bottom"
            :width="200"
            trigger="click"
            @click.stop
          >
            <template #reference>
              <el-icon :size="12" class="ct-pill-gear"><Tools /></el-icon>
            </template>
            <div class="ct-rag-settings">
              <div class="ct-rag-settings-title">RAG Settings</div>
              <div class="ct-rag-setting-row">
                <span>Scope</span>
                <el-select
                  :model-value="ragScope || ''"
                  size="small"
                  class="ct-rag-scope-select"
                  placeholder="All"
                  clearable
                  @change="emit('update-rag-scope', $event || '')"
                  @click.stop
                >
                  <el-option label="All (entire KB)" value="" />
                  <el-option label="curator" value="curator" />
                  <el-option label="engineer" value="engineer" />
                  <el-option label="designer" value="designer" />
                  <el-option label="researcher" value="researcher" />
                  <el-option label="strategist" value="strategist" />
                  <el-option label="analyst" value="analyst" />
                  <el-option label="operator" value="operator" />
                </el-select>
              </div>
              <div class="ct-rag-setting-row">
                <span>Query variants</span>
                <el-select
                  :model-value="ragNumQueries ?? 0"
                  size="small"
                  class="ct-rag-scope-select"
                  @change="emit('update-rag-num-queries', Number($event))"
                  @click.stop
                >
                  <el-option label="Default (1)" :value="0" />
                  <el-option label="1 (no expansion)" :value="1" />
                  <el-option label="3 (balanced)" :value="3" />
                  <el-option label="5 (thorough)" :value="5" />
                </el-select>
              </div>
              <div class="ct-rag-setting-row">
                <span>Multi-turn</span>
                <el-select
                  :model-value="ragChatMode ?? 'condense'"
                  size="small"
                  class="ct-rag-scope-select"
                  @change="emit('update-rag-chat-mode', $event)"
                  @click.stop
                >
                  <el-option label="Condense (LLM)" value="condense" />
                  <el-option label="Heuristic" value="condense_plus_context" />
                  <el-option label="Context (all msgs)" value="context" />
                  <el-option label="Simple (no RAG)" value="simple" />
                </el-select>
              </div>
              <div class="ct-rag-setting-row">
                <span>Hybrid (BM25+Vector)</span>
                <el-switch :model-value="ragHybrid" size="small" @update:model-value="emit('toggle-rag-hybrid')" />
              </div>
              <div class="ct-rag-setting-row">
                <span>Rerank (LLM)</span>
                <el-switch :model-value="ragRerank" size="small" @update:model-value="emit('toggle-rag-rerank')" />
              </div>
              <div class="ct-rag-setting-row">
                <span>HyDE</span>
                <el-switch :model-value="ragHyde" size="small" @update:model-value="emit('toggle-rag-hyde')" />
              </div>
              <div class="ct-rag-setting-row">
                <span>Citations [N]</span>
                <el-switch :model-value="ragCitations" size="small" @update:model-value="emit('toggle-rag-citations')" />
              </div>
            </div>
          </el-popover>
        </div>
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
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ct-left,
.ct-right {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

// ── Circle button polish in toolbar ──
.ct-left :deep(.el-button.is-circle),
.ct-right :deep(.el-button.is-circle) {
  width: 30px;
  height: 30px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-color: transparent;
  transition: all var(--transition-fast);

  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-7);
    transform: scale(1.06);
  }
  &:active {
    transform: scale(0.94);
  }
  &.el-button--primary {
    color: #fff;
    background: var(--el-color-primary);
  }
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
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 14px;
  transition: all var(--transition-fast);
  &:hover {
    border-color: var(--el-border-color);
  }
  &.on {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
  &.searching {
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
    border-color: var(--el-color-warning-light-5);
  }
}
.ct-spin {
  animation: ct-spin 1s linear infinite;
}

@keyframes ct-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Web search pill — glow when active, pulse when searching
.ct-pill--web {
  &.on {
    box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
  }
  &.searching {
    box-shadow: 0 0 8px var(--el-color-warning-light-3);
    animation: ct-web-pulse 1.5s ease-in-out infinite;
  }
}

@keyframes ct-web-pulse {
  0%,
  100% {
    box-shadow: 0 0 4px var(--el-color-warning-light-3);
  }
  50% {
    box-shadow: 0 0 12px var(--el-color-warning-light-5);
  }
}
.ct-pill-label {
  line-height: 1;
}
.ct-pill-timing {
  flex-shrink: 0;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 600;
  line-height: 15px;
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  border-radius: 6px;
}
/* Combined Web + RAG — subtle connecting indicator */
.ct-pill--web.combined {
  border-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  margin-right: 0;
}
.ct-pill--rag.combined {
  border-left: 1px dashed var(--el-color-primary-light-5);
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-left: -1px;
}
.ct-pill-label--rag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 15px;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 700;
  color: #ffffff;
  background: var(--el-color-primary);
  border-radius: 7px;
}
.ct-pill--noctx {
  border-color: var(--el-color-warning-light-5);
  &.on {
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
    border-color: var(--el-color-warning-light-5);
  }
}
.ct-pill-label--noctx {
  display: inline-flex;
  align-items: center;
  height: 15px;
  padding: 0 5px;
  font-size: 9px;
  font-weight: 600;
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-5);
  border-radius: 7px;
}
.ct-pill--auto {
  border-color: rgb(34 197 94 / 35%);
  &.on {
    color: #22c55e;
    background: rgb(34 197 94 / 8%);
    border-color: rgb(34 197 94 / 30%);
  }
}
.ct-context-list {
  max-height: 240px;
  overflow-y: auto;
}
.ct-context-item {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 0;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
}
.ct-context-item + .ct-context-item {
  border-top: 1px solid var(--el-border-color-lighter);
}
.ct-context-item-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-color-primary);
  white-space: nowrap;
  cursor: pointer;
}
.ct-context-item-path:hover {
  text-decoration: underline;
}
.ct-context-empty {
  padding: 8px 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}

// ── Context empty state ──
.ct-context-empty-state {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 16px 8px;
  text-align: center;
}
.ct-context-empty-icon {
  font-size: 32px;
}
.ct-context-empty-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.ct-context-empty-desc {
  max-width: 320px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
.ct-context-empty-hint {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.ct-context-empty-hint code {
  padding: 1px 6px;
  font-family: monospace;
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-fill-color);
  border-radius: 4px;
}
.ct-context-add-hint {
  margin-top: 8px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}

// ── Context drop zone ──
.ct-context-drop {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  border: 2px dashed var(--el-border-color);
  border-radius: 6px;
  transition:
    border-color 0.15s,
    background 0.15s;
  &.is-over {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }
}
.ct-context-drop-icon {
  font-size: 20px;
}
.ct-context-drop-hint code {
  padding: 1px 4px;
  font-family: monospace;
  font-size: 11px;
  color: var(--el-color-primary);
  background: var(--el-fill-color);
  border-radius: 3px;
}
.ct-context-empty-state.is-over {
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
}
.ct-context-drop-zone {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  border: 2px dashed var(--el-border-color);
  border-radius: 6px;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.ct-context-empty-state.is-over .ct-context-drop-zone {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

// ── Context popover tabs ──
.ct-pop-close {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }
}
.ct-pop-tabs {
  position: relative;
  display: flex;
  gap: 0;
  padding-right: 28px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ct-pop-tab {
  flex: 1;
  padding: 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-align: center;
  cursor: pointer;
  user-select: none;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
  &:hover {
    color: var(--el-text-color-primary);
  }
  &.active {
    color: var(--el-color-primary);
    border-bottom-color: var(--el-color-primary);
  }
}
.ct-pop-panel {
  min-height: 120px;
}

// ── Browse tab ──
.ct-browse-search {
  margin-bottom: 6px;
}
.ct-browse-loading,
.ct-browse-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.ct-browse-tree {
  padding: 2px 0;
}
.ct-browse-folder {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  font-size: 13px;
  user-select: none;
  border-radius: 4px;
  &:hover {
    background: var(--el-fill-color-light);
  }
}
.ct-browse-folder-toggle {
  display: flex;
  flex: 1;
  gap: 6px;
  align-items: center;
  min-width: 0;
  font-weight: 600;
  color: var(--el-text-color-primary);
  cursor: pointer;
}
.ct-browse-folder-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ct-browse-folder-count {
  flex-shrink: 0;
  padding: 0 6px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 8px;
}
.ct-browse-file {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 8px 4px 24px;
  border-radius: 4px;
  transition: background var(--transition-instant);
  &:hover {
    background: var(--el-fill-color-light);
  }
  &.is-in-context {
    background: var(--el-color-success-light-9);
  }
}
.ct-browse-file-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.ct-browse-file-label {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    color: var(--el-color-primary);
    text-decoration: underline;
  }
}
.ct-browse-file-path {
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

// ── Context edit section ──
.ct-edit-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.ct-edit-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ct-edit-path {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.ct-edit-hint {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.ct-edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

// ── Skills panel (Pi-inspired: tool registry browser) ──
.ct-skills-list {
  max-height: 320px;
  padding-right: 4px;
  overflow-y: auto;
}
.ct-skills-global-search {
  margin-bottom: 6px;
}
.ct-skills-search-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 6px;
  margin-bottom: 4px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px dashed var(--el-border-color-lighter);
  &.is-empty {
    color: var(--el-color-danger);
  }
}
.ct-skills-search-total {
  font-weight: 600;
}
.ct-skills-search-split {
  font-variant-numeric: tabular-nums;
}
.ct-skills-search-pos {
  padding: 0 4px;
  margin-left: auto;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
}
.ct-skills-similar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  padding: 2px 4px 6px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
}
.ct-skills-similar-label {
  color: var(--el-text-color-placeholder);
}
.ct-skills-similar-score {
  margin-left: 4px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}
.ct-skills-similar-chip {
  padding: 1px 6px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-color-info);
  cursor: pointer;
  border: 1px dashed var(--el-color-info-light-5);
  border-radius: 8px;
  &:hover {
    color: var(--el-color-white);
    background: var(--el-color-info);
    border-color: var(--el-color-info);
    border-style: solid;
  }
}
.ct-skills-section {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px 4px;
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 700;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ct-skills-sort-toggle {
  font-size: 9px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  text-transform: none;
  letter-spacing: 0;
  &:hover {
    color: var(--el-color-primary);
  }
}
.ct-skills-compact-toggle {
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  &:hover {
    color: var(--el-color-primary);
  }
  &.is-active {
    color: var(--el-color-primary);
  }
}
.ct-skills-filter-count {
  margin-left: 2px;
  font-size: 9px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
}
.ct-skills-pin-count {
  margin-left: 2px;
  font-size: 9px;
  font-weight: 600;
  color: var(--el-color-warning);
}
.ct-skills-pin-count--clickable {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
.ct-pin-pop {
  font-size: 11px;
  color: var(--el-text-color-regular);
}
.ct-pin-pop-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  align-items: center;
  justify-content: space-between;
  padding: 3px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
  &:last-child {
    border-bottom: 0;
  }
}
.ct-pin-pop-row--stale {
  opacity: 0.55;
  .ct-pin-pop-name {
    color: var(--el-text-color-placeholder);
  }
  .ct-pin-pop-count {
    color: var(--el-color-info);
  }
}

// Prompt history panel (Pi-inspired)
.ct-history-pop {
  max-height: 360px;
  overflow-y: auto;
  font-size: 12px;
}
.ct-history-recent {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  padding-bottom: 6px;
  margin-bottom: 8px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.ct-history-recent-label {
  margin-right: 2px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}
.ct-history-chip {
  display: inline-flex;
  align-items: center;
  max-width: 200px;
  padding: 1px 4px 1px 8px;
  font-size: 11px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
    .ct-history-chip-copy {
      opacity: 1;
    }
    .ct-history-chip-text {
      color: var(--el-color-primary);
    }
  }
}
.ct-history-chip-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ct-history-chip-copy {
  height: 16px;
  min-height: 16px;
  padding: 0 2px;
  opacity: 0;
  transition: opacity var(--transition-fast);
  &:hover {
    opacity: 1;
  }
}
.ct-history-search {
  margin-bottom: 8px;
}
.ct-history-empty {
  padding: 16px 8px;
  font-style: italic;
  line-height: 1.5;
  color: var(--el-text-color-placeholder);
  text-align: center;
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
  font-style: italic;
  color: var(--el-text-color-secondary);
}
.ct-history-similar .ct-history-chip-text {
  padding: 2px 8px;
  font-size: 12px;
  cursor: pointer;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-8);
  }
}
.ct-history-similar-score {
  margin-left: 4px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}
.ct-history-row {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
  &:last-child {
    border-bottom: 0;
  }
}
.ct-history-idx {
  flex: 0 0 24px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
  text-align: right;
}
.ct-history-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-text-color-regular);
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    color: var(--el-color-primary);
  }
}
.ct-history-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 2px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.ct-history-row:hover .ct-history-actions {
  opacity: 1;
}
.ct-history-rows {
  max-height: 280px;
  overflow-y: auto;
}
.ct-history-footer {
  position: sticky;
  bottom: 0;
  padding: 8px 0 0;
  margin-top: 8px;
  text-align: right;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
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
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}
.ct-pin-pop-avg {
  font-weight: 400;
  color: var(--el-text-color-placeholder);
  opacity: 0.7;
}
.ct-pin-pop-spark {
  flex-shrink: 0;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
}
.ct-pin-pop-spark-hit {
  cursor: help;
}
.ct-stuck-ring {
  animation: ct-stuck-pulse 3s ease-in-out infinite;
}

@keyframes ct-stuck-pulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ct-stuck-ring,
  .ct-spin,
  .ct-skill-tag--probing {
    animation: none;
  }
}
.ct-pin-spark-legend-wrap {
  margin: 0 0 4px;
}
.ct-pin-spark-legend-toggle {
  height: auto;
  padding: 2px 4px;
  margin: 0 0 2px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
}
.ct-pin-spark-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  align-items: center;
  padding: 4px 6px;
  margin: 0 0 6px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-radius: 3px;
}
.ct-pin-spark-legend span {
  display: inline-flex;
  gap: 3px;
  align-items: center;
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
  padding: 0 1px;
  font-weight: 600;
  color: var(--el-color-warning-dark-2);
  background: var(--el-color-warning-light-9);
  border-radius: 2px;
}
.ct-skill-pin {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  padding: 0;
  font-size: 12px;
  line-height: 1;
  color: var(--el-text-color-placeholder);
  &.is-pinned {
    color: var(--el-color-warning);
  }
  &:hover {
    color: var(--el-color-warning);
  }
}
.ct-skill {
  padding: 8px 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ct-skill.is-selected {
  padding-left: 1px;
  background: var(--el-color-primary-light-9);
  border-left: 3px solid var(--el-color-primary);
}
.ct-skill--compact {
  padding: 4px;
  .ct-skill-desc,
  .ct-skill-lastcall {
    display: none;
  }
}
.ct-skill:last-child {
  border-bottom: none;
}
.ct-skill--off {
  opacity: 0.55;
}
.ct-skill--broken {
  padding-left: 6px;
  background: var(--el-color-danger-light-9);
  border-left: 3px solid var(--el-color-danger);
}
.ct-skill-head {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 2px;
}
.ct-skill-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.ct-skill-name {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.ct-skill-tag {
  padding: 1px 5px;
  font-size: 9px;
  font-weight: 600;
  line-height: 1.4;
  border-radius: 8px;
}
.ct-skill-tag--on {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}
.ct-skill-tag--off {
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
}
.ct-skill-tag--pre {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}

// ── Last-invoked indicator per tool (Pi-inspired) ──
.ct-skill-lastcall {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-top: 3px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}
.ct-skill-lastcall-dot {
  width: 5px;
  height: 5px;
  background: var(--el-color-success);
  border-radius: 50%;
  opacity: 0.6;
}
.ct-skill-lastcall--err .ct-skill-lastcall-dot {
  background: var(--el-color-danger);
  opacity: 1;
}
.ct-skill-lastcall-ms {
  color: var(--el-text-color-placeholder);
}
.ct-skill-lastcall-ms--slow {
  font-weight: 600;
  color: var(--el-color-warning);
}
.ct-skill-lastcall-err {
  font-weight: 600;
  color: var(--el-color-danger);
}
.ct-skill-lastcall-count {
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

// ── Per-tool prompt metadata expand (Pi-inspired) ──
.ct-rerun-pop {
  max-height: 200px;
  overflow: auto;
  font-size: 11px;
  color: var(--el-text-color-regular);
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
.ct-rerun-pop-state--ok {
  color: var(--el-color-success);
}
.ct-rerun-pop-state--err {
  color: var(--el-color-danger);
}
.ct-rerun-pop-err {
  padding: 4px 6px;
  margin: 4px 0;
  font-size: 10px;
  color: var(--el-color-danger);
  overflow-wrap: break-word;
  background: var(--el-color-danger-light-9);
  border-radius: 3px;
}
.ct-rerun-pop-content {
  max-height: 120px;
  padding: 6px 8px;
  margin: 4px 0;
  overflow: auto;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  color: var(--el-text-color-regular);
  overflow-wrap: break-word;
  white-space: pre-wrap;
  background: var(--el-fill-color);
  border-radius: 3px;
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
  &:last-child {
    border-bottom: 0;
  }
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
  overflow-wrap: break-word;
  white-space: pre-wrap;
}
.ct-skill-meta-toggle {
  width: 20px;
  height: 20px;
  padding: 0;
  margin-left: auto;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-text-color-placeholder);
  &.is-open {
    color: var(--el-color-primary);
  }
}
.ct-skill-meta {
  padding: 6px 8px;
  margin-top: 4px;
  background: var(--el-fill-color);
  border: 1px dashed var(--el-border-color-lighter);
  border-radius: 4px;
}
.ct-skill-meta-row {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  margin-bottom: 4px;
  font-size: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}
.ct-skill-meta-key {
  flex-shrink: 0;
  min-width: 56px;
  padding-top: 2px;
  font-size: 9px;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.ct-skill-meta code {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  color: var(--el-text-color-regular);
  overflow-wrap: break-word;
}
.ct-skill-meta-list {
  padding-left: 14px;
  margin: 0;
  font-size: 10px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  li {
    margin: 0;
  }
}

// ── LLM prompt preview (Pi-inspired: introspect system prompt snippet) ──
.ct-llm-prompt {
  margin: 4px 0 8px;
  overflow: hidden;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
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
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}
.ct-llm-prompt pre {
  max-height: 160px;
  padding: 6px 8px;
  margin: 0;
  overflow: auto;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  color: var(--el-text-color-regular);
  overflow-wrap: break-word;
  white-space: pre-wrap;
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
  margin-bottom: 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

// ── MCP inline args editor (Pi-inspired: schema-driven form) ──
.ct-mcp-args {
  padding: 6px 8px;
  margin-top: 6px;
  background: var(--el-fill-color);
  border: 1px dashed var(--el-border-color-lighter);
  border-radius: 4px;
}
.ct-mcp-arg {
  margin-bottom: 6px;
}
.ct-mcp-arg:last-child {
  margin-bottom: 0;
}
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
.ct-mcp-arg-req {
  font-weight: 700;
  color: var(--el-color-danger);
}

// ── MCP inline Run result (Pi-inspired: one-click tool invocation) ──
.ct-mcp-result {
  padding: 4px 6px;
  margin-top: 6px;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}
.ct-mcp-result--err {
  background: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger-light-7);
}
.ct-mcp-result-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 2px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}
.ct-mcp-result-err {
  font-weight: 600;
  color: var(--el-color-danger);
  word-break: break-all;
}
.ct-mcp-result pre {
  max-height: 100px;
  margin: 0;
  overflow: auto;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  color: var(--el-text-color-regular);
  overflow-wrap: break-word;
  white-space: pre-wrap;
}
.ct-skill-tag--probing {
  color: var(--el-color-info);
  background: var(--el-color-info-light-9);
  animation: ct-probe 1s ease-in-out infinite;
}

@keyframes ct-probe {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
.ct-skill-desc {
  font-size: 11px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}
.ct-skills-empty {
  padding: 16px 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
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
    padding: 12px 12px 4px;

    // Pull to popover padding edges so the sticky bar spans full width.
    margin: -12px -12px 8px;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
}

// RAG settings popover
.ct-pill-gear {
  cursor: pointer;
  opacity: 0.5;
  transition: opacity var(--transition-base);
  &:hover {
    opacity: 1;
  }
}
.ct-rag-settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ct-rag-settings-title {
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.ct-rag-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.ct-rag-scope-select {
  width: 120px;
}
</style>
