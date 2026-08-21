<script setup lang="ts">
/**
 * YiPet Chat — ChatToolbar (Vue 3 SFC)
 * Matches YiVad aiChat's ChatToolbar: Element Plus components, prompt history
 * popover, skills panel, RAG controls, agent mode toggle with settings dialogs.
 */
import { computed, ref } from 'vue';
import {
  ChatLineSquare, Picture, ChatDotRound, Search, Loading,
  Clock, CollectionTag, Delete, DocumentCopy, Tools, Cpu, Refresh,
  Edit, ArrowDown,
} from '@element-plus/icons-vue';
import { useChatStore } from '../../stores/chat';
import RequestStatusButton from '../RequestStatusButton.vue';

defineProps<{ hasContent: boolean }>();
const emit = defineEmits<{ clearInput: [] }>();

const store = useChatStore();
const s = store.state;
const MAX_DRAFT_IMAGES = 4;

const canUpload = computed(() => s.draftImages.length < MAX_DRAFT_IMAGES);
const currentSession = computed(() => s.sessions.find((ses) => ses.id === s.currentSessionId));

// ── Model selector (mirrors YiVad aiChat) ──
const modelOptions = computed(() => {
  const list = [...(s.availableModels ?? [])];
  if (s.selectedModel && !list.includes(s.selectedModel)) list.unshift(s.selectedModel);
  return list.length ? list : [s.selectedModel || 'qwen3.5'];
});

// ── Popover visibility ──
const showHistoryPopover = ref(false);
const showSkillsPopover = ref(false);
const showContextPopover = ref(false);
const historyQuery = ref('');
const ragOptionsExpanded = ref(false);

// ── Prompt history ──
const recentPromptChips = computed(() => {
  if (historyQuery.value.trim()) return [];
  return s.promptHistory.slice(-3).reverse();
});

const historyList = computed(() => {
  const q = historyQuery.value.trim().toLowerCase();
  const indexed = s.promptHistory.map((text, i) => ({ text, realIdx: i }));
  const filtered = q ? indexed.filter((x) => x.text.toLowerCase().includes(q)) : indexed;
  return filtered.reverse();
});

function useHistoryPrompt(text: string) {
  store.invokePromptHistory?.(s.promptHistory.indexOf(text));
  showHistoryPopover.value = false;
}

function copyHistoryPrompt(text: string) {
  navigator.clipboard?.writeText(text);
}

function removeHistoryPrompt(idx: number) {
  store.removePromptHistoryAt?.(idx);
}

function truncatePrompt(t: string, max = 40): string {
  const trimmed = t.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1) + '\u2026';
}

function highlightSegments(text: string, query: string): { text: string; match: boolean }[] {
  if (!query.trim()) return [{ text, match: false }];
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  const testRe = new RegExp(`^${escaped}$`, 'i');
  return parts.map((p) => ({ text: p, match: testRe.test(p) }));
}

function trigrams(str: string): Set<string> {
  const t = str.toLowerCase().trim();
  if (t.length < 3) return new Set([t]);
  const set = new Set<string>();
  for (let i = 0; i + 3 <= t.length; i++) set.add(t.slice(i, i + 3));
  return set;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const item of a) if (b.has(item)) intersection++;
  return intersection / (a.size + b.size - intersection);
}

const similarPrompts = computed<{ text: string; score: number }[]>(() => {
  const q = historyQuery.value.trim();
  if (!q) return [];
  if (historyList.value.length > 0) return [];
  const qt = trigrams(q);
  if (!qt.size) return [];
  return s.promptHistory
    .map((text) => ({ text, score: jaccard(qt, trigrams(text)) }))
    .filter((x) => x.score >= 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
});

// ── Skills / Tools panel ──
const globalToolFilter = ref('');
const selectedToolIdx = ref(-1);

const allTools = computed(() => {
  const tools = s.agentTools ?? [];
  return tools.map((t: any) => ({
    name: t.name || t,
    label: t.label || t.name || t,
    description: t.description || '',
    enabled: t.enabled !== false,
  }));
});

const activeSkillCount = computed(() => allTools.value.filter((t) => t.enabled).length);

const visibleSkills = computed(() => {
  const q = globalToolFilter.value.trim().toLowerCase();
  if (!q) return allTools.value;
  return allTools.value.filter((t) => {
    const name = (t.name ?? '').toLowerCase();
    const desc = (t.description ?? '').toLowerCase();
    const label = (t.label ?? '').toLowerCase();
    return name.includes(q) || desc.includes(q) || label.includes(q);
  });
});

const similarTools = computed<{ name: string; score: number }[]>(() => {
  const q = globalToolFilter.value.trim();
  if (!q || visibleSkills.value.length > 0) return [];
  const qt = trigrams(q);
  if (!qt.size) return [];
  return allTools.value
    .map((t) => ({ name: t.name, score: jaccard(qt, trigrams(t.name)) }))
    .filter((x) => x.score >= 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
});

function onGlobalSearchKeydown(e: KeyboardEvent) {
  if (!visibleSkills.value.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedToolIdx.value = (selectedToolIdx.value + 1) % visibleSkills.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedToolIdx.value = selectedToolIdx.value <= 0
      ? visibleSkills.value.length - 1
      : selectedToolIdx.value - 1;
  } else if (e.key === 'Enter' && selectedToolIdx.value >= 0) {
    e.preventDefault();
    const tool = visibleSkills.value[selectedToolIdx.value];
    if (tool) globalToolFilter.value = tool.name;
    selectedToolIdx.value = -1;
  } else if (e.key === 'Escape') {
    selectedToolIdx.value = -1;
  }
}

// ── Running tools ──
const runningTools = computed(() => {
  return (s.agentToolCalls ?? [])
    .filter((c) => c.status === 'running')
    .map((c) => ({ name: c.name, label: c.name }));
});

// ── Context files ──
const contextFiles = computed(() => {
  const files: { label: string; detail: string; kind: 'scope' | 'page' | 'ctx' }[] = [];
  if (s.ragScope) {
    const autoDerived = !!(currentSession.value?.tags?.some((t) => t.startsWith('ctx:') && t.slice(4) === s.ragScope || s.ragScope.startsWith(t.slice(4))));
    files.push({ label: s.ragScope, detail: s.ragScopeIsFile ? 'File scope' + (autoDerived ? ' (auto)' : '') : 'Folder scope' + (autoDerived ? ' (auto)' : ''), kind: 'scope' });
  }
  const ses = currentSession.value;
  if (ses?.pageContent) {
    const preview = ses.pageContent.slice(0, 120).replace(/\n/g, ' ');
    files.push({ label: 'Page context', detail: preview + (ses.pageContent.length > 120 ? '...' : ''), kind: 'page' });
  }
  const ctxTags = (ses?.tags ?? []).filter((t) => t.startsWith('ctx:'));
  for (const tag of ctxTags) {
    const path = tag.slice(4);
    if (!files.some((f) => f.label === path)) {
      files.push({ label: path, detail: 'Context file', kind: 'ctx' });
    }
  }
  return files;
});

/** Context files that feed into RAG (ctx: tagged files). */
const ragContextFiles = computed(() => {
  const ses = currentSession.value;
  if (!ses?.tags) return [];
  return ses.tags
    .filter((t) => typeof t === 'string' && t.startsWith('ctx:'))
    .map((t) => t.slice(4));
});

/** Whether RAG is auto-scoped to session context files. */
const ragAutoScoped = computed(() => {
  if (!s.knowledgeGrounded || !s.ragScope) return false;
  const ctxFiles = ragContextFiles.value;
  if (!ctxFiles.length) return false;
  return ctxFiles.some((f) => f === s.ragScope || s.ragScope.startsWith(f) || f.startsWith(s.ragScope));
});

function handleContextFileClick(path: string) {
  store.openKnowledgePreview?.(path);
  showContextPopover.value = false;
}

// ── Actions ──
function onUploadImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = () => {
    const files = Array.from(input.files || []);
    const remaining = MAX_DRAFT_IMAGES - s.draftImages.length;
    const toRead = files.slice(0, remaining);
    let loaded = 0;
    const sources: string[] = new Array(toRead.length);
    toRead.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (ev) => { sources[i] = ev.target?.result as string; loaded++; if (loaded === toRead.length) store.addDraftImages?.(sources.filter(Boolean)); };
      reader.onerror = () => { loaded++; if (loaded === toRead.length) store.addDraftImages?.(sources.filter(Boolean)); };
      reader.readAsDataURL(file);
    });
  };
  input.click();
}

function toggleRag() { store.toggleKnowledgeGrounded?.(); }
function toggleAgent() { s.agentMode = !s.agentMode; }
function cycleRagMode() {
  const modes = ['condense_plus_context', 'condense_question', 'context', 'simple'];
  const idx = modes.indexOf(s.ragChatMode);
  s.ragChatMode = modes[(idx + 1) % modes.length];
}
function cycleRagNumQueries() {
  const cur = s.ragNumQueries ?? 1;
  s.ragNumQueries = cur === 1 ? 2 : cur === 2 ? 3 : cur === 3 ? 5 : 1;
}

const ragModeLabels: Record<string, string> = {
  condense_plus_context: 'condense+ctx',
  condense_question: 'condense_q',
  context: 'ctx_only',
  simple: 'simple',
};

// ── Agent settings dialogs ──
const showSysPromptDialog = ref(false);
const sysPromptDraft = ref('');
function openSysPromptDialog() { sysPromptDraft.value = s.agentSystemPrompt || ''; showSysPromptDialog.value = true; }
function saveSysPrompt() { s.agentSystemPrompt = sysPromptDraft.value.trim(); showSysPromptDialog.value = false; }

const showModelRotationDialog = ref(false);
const modelRotationDraft = ref('');
function openModelRotationDialog() { modelRotationDraft.value = (s.agentModelRotation || []).join(', '); showModelRotationDialog.value = true; }
function saveModelRotation() {
  s.agentModelRotation = modelRotationDraft.value.split(',').map((m: string) => m.trim()).filter(Boolean);
  showModelRotationDialog.value = false;
}

const showModelFallbackDialog = ref(false);
const modelFallbackDraft = ref('');
function openModelFallbackDialog() { modelFallbackDraft.value = (s.agentModelFallback || []).join(', '); showModelFallbackDialog.value = true; }
function saveModelFallback() {
  s.agentModelFallback = modelFallbackDraft.value.split(',').map((m: string) => m.trim()).filter(Boolean);
  showModelFallbackDialog.value = false;
}

</script>

<template>
  <div class="ct-toolbar" role="toolbar" aria-label="Conversation toolbar">
    <!-- Left: FAQ, prompt history, skills, cross-project, upload, edit, tags, bot -->
    <div class="ct-left">
      <!-- FAQ -->
      <el-tooltip content="FAQ" placement="bottom">
        <el-button circle :icon="ChatLineSquare" @click="store.openFaqManager?.()" />
      </el-tooltip>

      <!-- Prompt history -->
      <el-popover
        v-model:visible="showHistoryPopover"
        popper-class="ct-tb-popper"
        placement="bottom"
        :width="420"
        trigger="click"
        :title="`Prompt history · ${s.promptHistory.length}`"
        @show="historyQuery = ''"
      >
        <template #reference>
          <el-button circle :icon="Clock" title="Prompt history" />
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
            placeholder="Search prompts..."
            class="ct-history-search"
          />
          <div v-if="!historyList.length && !similarPrompts.length" class="ct-history-empty">
            {{ historyQuery ? 'No prompts match your filter.' : 'No prompts yet. Type a prompt and press Enter — it will show up here.' }}
          </div>
          <div v-if="similarPrompts.length" class="ct-history-similar">
            <span class="ct-history-similar-label">Did you mean:</span>
            <span
              v-for="(p, i) in similarPrompts"
              :key="`sim-${i}`"
              class="ct-history-chip-text ct-history-chip-text--sim"
              :title="`${p.text} — similarity ${(p.score * 100).toFixed(0)}% · click to insert into input`"
              @click="useHistoryPrompt(p.text)"
            >{{ truncatePrompt(p.text, 60) }} <span class="ct-history-similar-score">{{ (p.score * 100).toFixed(0) }}%</span></span>
          </div>
          <div class="ct-history-rows">
            <div v-for="(p, i) in historyList" :key="`${p.realIdx}-${i}`" class="ct-history-row">
              <span class="ct-history-idx">{{ s.promptHistory.length - p.realIdx }}</span>
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
          <div v-if="s.promptHistory.length" class="ct-history-footer">
            <el-button size="small" type="danger" text :icon="Delete" @click="store.clearPromptHistory?.()">Clear all ({{ s.promptHistory.length }})</el-button>
          </div>
        </div>
      </el-popover>

      <!-- Skills / Tools panel -->
      <el-popover
        v-model:visible="showSkillsPopover"
        popper-class="ct-tb-popper"
        placement="bottom"
        :width="360"
        trigger="click"
        :title="`Skills · ${activeSkillCount} active`"
      >
        <template #reference>
          <el-button circle :icon="Tools" title="Skills (registered tools)" />
        </template>
        <div class="ct-skills-list">
          <el-input
            v-model="globalToolFilter"
            size="small"
            clearable
            :prefix-icon="Search"
            placeholder="Search tools...  (/ focus, ↑↓ nav, Enter select, Esc dismiss)"
            class="ct-skills-global-search"
            @keydown="onGlobalSearchKeydown"
          />
          <div v-if="similarTools.length" class="ct-skills-similar">
            <span class="ct-skills-similar-label">Did you mean:</span>
            <span
              v-for="t in similarTools"
              :key="t.name"
              class="ct-skills-similar-chip"
              :title="`Use this query instead (similarity ${(t.score * 100).toFixed(0)}%)`"
              @click="globalToolFilter = t.name"
            >{{ t.name }} <span class="ct-skills-similar-score">{{ (t.score * 100).toFixed(0) }}%</span></span>
          </div>
          <div class="ct-skills-section">
            <span>Tools · {{ activeSkillCount }} active</span>
          </div>
          <div v-if="!visibleSkills.length && globalToolFilter" class="ct-skill ct-skill--off">
            <div class="ct-skill-desc">_(no match for "{{ globalToolFilter }}")_</div>
          </div>
          <div
            v-for="(tool, i) in visibleSkills"
            :key="tool.name"
            class="ct-skill"
            :class="{
              'ct-skill--off': !tool.enabled,
              'is-selected': i === selectedToolIdx,
            }"
          >
            <div class="ct-skill-head">
              <span class="ct-skill-label">
                <template v-for="(seg, si) in highlightSegments(tool.label ?? '', globalToolFilter)" :key="si">
                  <mark v-if="seg.match" class="ct-skill-match">{{ seg.text }}</mark>
                  <template v-else>{{ seg.text }}</template>
                </template>
              </span>
              <span class="ct-skill-name">
                <template v-for="(seg, si) in highlightSegments(tool.name ?? '', globalToolFilter)" :key="si">
                  <mark v-if="seg.match" class="ct-skill-match">{{ seg.text }}</mark>
                  <template v-else>{{ seg.text }}</template>
                </template>
              </span>
              <span v-if="tool.enabled" class="ct-skill-tag ct-skill-tag--on">on</span>
              <span v-else class="ct-skill-tag ct-skill-tag--off">off</span>
            </div>
            <div class="ct-skill-desc">
              <template v-for="(seg, si) in highlightSegments(tool.description || '(no description)', globalToolFilter)" :key="si">
                <mark v-if="seg.match" class="ct-skill-match">{{ seg.text }}</mark>
                <template v-else>{{ seg.text }}</template>
              </template>
            </div>
          </div>
          <div v-if="!allTools.length" class="ct-skills-empty">
            No tools registered
          </div>
        </div>
      </el-popover>

      <!-- Upload image -->
      <el-tooltip content="Upload image" placement="bottom">
        <el-button circle :icon="Picture" :disabled="!canUpload" @click="onUploadImage" />
      </el-tooltip>

      <!-- Bot settings -->
      <el-tooltip content="WeCom bot settings" placement="bottom">
        <el-button circle :icon="ChatDotRound" @click="store.openWeChatSettings?.()" />
      </el-tooltip>
    </div>

    <!-- Right: pills group + running tools + clear + stop -->
    <div class="ct-right">
      <!-- Model selector (mirrors YiVad aiChat) -->
      <el-select
        :model-value="s.selectedModel"
        class="ct-model-select"
        size="small"
        placeholder="Model"
        @update:model-value="s.selectedModel = $event"
      >
        <el-option
          v-for="m in modelOptions"
          :key="m"
          :label="m"
          :value="m"
        />
      </el-select>

      <!-- Pills group: status toggles -->
      <div class="ct-pills-group">
        <!-- Context files -->
        <el-popover
          v-if="contextFiles.length"
          v-model:visible="showContextPopover"
          popper-class="ct-tb-popper"
          placement="bottom"
          :width="360"
          trigger="click"
        >
          <template #reference>
            <div class="ct-pill on" title="Active context">
              <el-icon :size="14"><CollectionTag /></el-icon>
              <span class="ct-pill-label">Context: {{ contextFiles.length }}</span>
            </div>
          </template>
          <div class="ct-context-list">
            <div
              v-for="(file, i) in contextFiles"
              :key="i"
              class="ct-context-item"
            >
              <span
                class="ct-context-item-path"
                :class="{ 'is-clickable': file.kind === 'scope' || file.kind === 'ctx' }"
                :title="file.kind === 'scope' || file.kind === 'ctx' ? 'Click to preview' : file.detail"
                @click="(file.kind === 'scope' || file.kind === 'ctx') ? handleContextFileClick(file.label) : undefined"
              >{{ file.label }}</span>
              <span class="ct-context-item-detail">{{ file.detail }}</span>
              <el-button
                v-if="file.kind === 'scope'"
                size="small"
                text
                type="danger"
                :icon="Delete"
                title="Clear RAG scope"
                @click="store.clearRagScope?.(); showContextPopover = false"
              />
            </div>
            <div v-if="!contextFiles.length" class="ct-context-empty">No active context</div>
          </div>
        </el-popover>

        <!-- Web search -->
        <div
          class="ct-pill" :class="{ on: s.webSearchEnabled }"
          :title="s.webSearchEnabled ? 'Web search on — answers include internet results' : 'Web search off — toggle to search the web'"
          @click="s.webSearchEnabled = !s.webSearchEnabled"
        >
          <el-icon :size="14"><Search /></el-icon>
          <el-switch :model-value="s.webSearchEnabled" size="small" @click.stop @update:model-value="s.webSearchEnabled = !s.webSearchEnabled" />
        </div>

        <!-- RAG -->
        <div
          class="ct-pill" :class="{ on: s.knowledgeGrounded, 'ct-pill--auto': ragAutoScoped }"
          :title="s.knowledgeGrounded
            ? (ragAutoScoped
              ? `RAG on — grounded in ${ragContextFiles.length} session context file${ragContextFiles.length > 1 ? 's' : ''}: ${ragContextFiles.join(', ')}`
              : (s.ragScope ? `RAG on — scoped to ${s.ragScope}` : 'RAG on — searching full knowledge base'))
            : 'RAG off — direct chat'"
          @click="toggleRag"
        >
          <el-icon :size="14"><Cpu /></el-icon>
          <span v-if="s.knowledgeGrounded && ragAutoScoped" class="ct-pill-label ct-pill-label--rag">{{ ragContextFiles.length }}</span>
          <el-switch :model-value="s.knowledgeGrounded" size="small" @click.stop @update:model-value="toggleRag" />
        </div>

        <!-- RAG status dot -->
        <span
          v-if="s.knowledgeGrounded"
          class="ct-rag-status"
          :class="{
            'ct-rag-status--built': s.ragStatus?.built === true,
            'ct-rag-status--loading': s.ragStatusLoading,
          }"
          :title="s.ragStatus?.built === true ? `RAG index built · ${s.ragStatus.num_docs ?? 0} docs` : s.ragStatusLoading ? 'Loading RAG status...' : 'RAG index not built'"
          @click="s.ragStatus?.built !== true && !s.ragStatusLoading ? store.loadRagStatus?.() : undefined"
        >
          <span class="ct-rag-status-dot" />
        </span>

        <!-- Agent mode -->
        <div
          class="ct-pill" :class="{ on: s.agentMode }"
          :title="s.agentMode ? 'Agent mode on — multi-turn tool calling with observability' : 'Agent mode off — direct chat'"
          @click="toggleAgent"
        >
          <el-icon :size="14"><Tools /></el-icon>
          <el-switch :model-value="s.agentMode" size="small" @click.stop @update:model-value="toggleAgent" />
        </div>

        <!-- Agent settings (matching YiVad's AgentSettingsControls) -->
        <template v-if="s.agentMode">
          <div class="ct-pill" title="Agent system prompt" @click="openSysPromptDialog">
            <el-icon :size="14"><Edit /></el-icon>
          </div>
          <div class="ct-pill" :title="s.agentModelRotation?.length ? `Model rotation: ${s.agentModelRotation.join(' → ')}` : 'Model rotation between turns'" @click="openModelRotationDialog">
            <el-icon :size="14"><Refresh /></el-icon>
            <span v-if="s.agentModelRotation?.length" class="ct-pill-label">{{ s.agentModelRotation.length }}⇄</span>
          </div>
          <div class="ct-pill" :title="s.agentModelFallback?.length ? `Fallback: ${s.agentModelFallback.join(' → ')}` : 'Fallback models on stall'" @click="openModelFallbackDialog">
            <el-icon :size="14"><ArrowDown /></el-icon>
            <span v-if="s.agentModelFallback?.length" class="ct-pill-label">{{ s.agentModelFallback.length }}↓</span>
          </div>
        </template>
      </div>

      <!-- Running tools -->
      <div v-for="tool in runningTools" :key="tool.name" class="ct-pill on" :title="`Running: ${tool.label}`">
        <el-icon :size="14" class="ct-spin"><Loading /></el-icon>
        <span class="ct-pill-label">{{ tool.label }}</span>
      </div>

      <RequestStatusButton
        :sending="s.isProcessing"
        :streaming-type="s.streamingType"
        @stop="store.stopSending()"
      />
    </div>

    <!-- Agent settings dialogs -->
    <Teleport to="body">
      <div v-if="showSysPromptDialog" class="ct-dialog-overlay" @click.self="showSysPromptDialog = false">
        <div class="ct-dialog">
          <div class="ct-dialog-header">Agent System Prompt</div>
          <div class="ct-dialog-body">
            <textarea v-model="sysPromptDraft" class="ct-dialog-textarea" placeholder="Custom system prompt for the agent..." rows="6" />
          </div>
          <div class="ct-dialog-footer">
            <el-button size="small" @click="showSysPromptDialog = false">Cancel</el-button>
            <el-button size="small" type="primary" @click="saveSysPrompt">Save</el-button>
          </div>
        </div>
      </div>
      <div v-if="showModelRotationDialog" class="ct-dialog-overlay" @click.self="showModelRotationDialog = false">
        <div class="ct-dialog">
          <div class="ct-dialog-header">Agent Model Rotation</div>
          <div class="ct-dialog-body">
            <p class="ct-dialog-hint">Comma-separated model names to rotate between turns.</p>
            <el-input v-model="modelRotationDraft" placeholder="e.g. qwen3.5, qwen3.5-think" />
          </div>
          <div class="ct-dialog-footer">
            <el-button size="small" @click="showModelRotationDialog = false">Cancel</el-button>
            <el-button size="small" type="primary" @click="saveModelRotation">Save</el-button>
          </div>
        </div>
      </div>
      <div v-if="showModelFallbackDialog" class="ct-dialog-overlay" @click.self="showModelFallbackDialog = false">
        <div class="ct-dialog">
          <div class="ct-dialog-header">Agent Fallback Models</div>
          <div class="ct-dialog-body">
            <p class="ct-dialog-hint">Comma-separated fallback models to escalate to when the active model stalls.</p>
            <el-input v-model="modelFallbackDraft" placeholder="e.g. qwen3-coder, qwen3.5" />
          </div>
          <div class="ct-dialog-footer">
            <el-button size="small" @click="showModelFallbackDialog = false">Cancel</el-button>
            <el-button size="small" type="primary" @click="saveModelFallback">Save</el-button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
// ── Toolbar ──
.ct-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 6px 12px;
  background: var(--bg-elevated, rgba(20, 18, 40, 0.96));
  border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.1);
}

.ct-left, .ct-right {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.ct-sep {
  width: 1px;
  height: 16px;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  margin: 0 2px;
}

// ── Round buttons ──
:deep(.el-button.is-circle) {
  --el-button-bg-color: transparent;
  --el-button-border-color: transparent;
  --el-button-text-color: var(--text-primary, #f5f3ff);
  --el-button-hover-bg-color: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
  --el-button-hover-border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.35);
  --el-button-hover-text-color: var(--primary-light, #818cf8);
  transition: all 0.15s;
}

// ── Pills group ──
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
  color: var(--text-secondary, #d4d0e8);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.06);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  border-radius: 14px;
  transition: all 0.15s;

  &:hover { border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.25); }

  &.on {
    color: var(--primary-light, #818cf8);
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
    border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.35);
  }
}

.ct-pill-label {
  font-size: 10px;
  line-height: 1;
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
  line-height: 1;
  color: #fff;
  background: var(--primary, #6366f1);
  border-radius: 7px;
}

.ct-pill--auto {
  border-color: rgba(34, 197, 94, 0.35);
  &.on {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.08);
    border-color: rgba(34, 197, 94, 0.3);
  }
}

// ── Model selector (mirrors YiVad aiChat) ──
.ct-model-select {
  width: 150px;
  :deep(.el-select__wrapper) {
    border-radius: 14px;
    font-size: 12px;
  }
}

.ct-spin { animation: ct-spin 1s linear infinite; }
@keyframes ct-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

// ── RAG status dot ──
.ct-rag-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 10px;
  margin-left: -6px;
  margin-right: -2px;
  cursor: pointer;
}
.ct-rag-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #eab308;
  transition: background 0.2s;
}
.ct-rag-status--built .ct-rag-status-dot { background: #22c55e; }
.ct-rag-status--loading .ct-rag-status-dot {
  background: #38bdf8;
  animation: ct-pulse 1.2s ease-in-out infinite;
}
@keyframes ct-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

// ── Prompt history popover ──
.ct-history-pop { font-size: 12px; max-height: 360px; overflow-y: auto; }
.ct-history-recent {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px dashed rgba(var(--primary-rgb, 99, 102, 241), 0.1);
}
.ct-history-recent-label {
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
  margin-right: 2px;
}
.ct-history-chip {
  display: inline-flex;
  align-items: center;
  max-width: 200px;
  padding: 1px 4px 1px 8px;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  border-radius: 10px;
  font-size: 11px;
  color: var(--text-primary, #f5f3ff);
  cursor: pointer;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.08);

  &:hover {
    border-color: var(--primary-light, #818cf8);
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
    .ct-history-chip-copy { opacity: 1; }
    .ct-history-chip-text { color: var(--primary-light, #818cf8); }
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
  color: var(--text-secondary, #d4d0e8);
  font-style: italic;
  line-height: 1.5;
}
.ct-history-similar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(var(--primary-rgb, 99, 102, 241), 0.1);
}
.ct-history-similar-label {
  font-size: 11px;
  color: var(--text-secondary, #d4d0e8);
  font-style: italic;
}
.ct-history-similar-score {
  margin-left: 4px;
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
  font-variant-numeric: tabular-nums;
}
.ct-history-chip-text--sim {
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.08);
  font-size: 12px;
  color: var(--text-primary, #f5f3ff);
  &:hover { background: rgba(var(--primary-rgb, 99, 102, 241), 0.12); color: var(--primary-light, #818cf8); }
}

.ct-history-rows {
  max-height: 240px;
  overflow-y: auto;
}
.ct-history-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  border-bottom: 1px dashed rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  &:last-child { border-bottom: 0; }
}
.ct-history-idx {
  flex: 0 0 24px;
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
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
  color: var(--text-primary, #f5f3ff);
  font-size: 12px;
  &:hover { color: var(--primary-light, #818cf8); }
}
.ct-history-actions {
  flex: 0 0 auto;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}
.ct-history-row:hover .ct-history-actions { opacity: 1; }
.ct-history-footer {
  position: sticky;
  bottom: 0;
  margin-top: 8px;
  padding: 8px 0 0;
  border-top: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  text-align: right;
  background: var(--bg-elevated, rgba(20, 18, 40, 0.96));
}

// ── Search highlight ──
.ct-skill-match {
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  color: var(--primary-light, #818cf8);
  padding: 0 1px;
  border-radius: 2px;
  font-weight: 600;
}

// ── Context files popover ──
.ct-context-list { max-height: 240px; overflow-y: auto; }
.ct-context-item {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
  font-family: 'SF Mono', 'Menlo', monospace;
  & + & { border-top: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.1); }
}
.ct-context-item-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--primary-light, #818cf8);
  &.is-clickable { cursor: pointer; &:hover { text-decoration: underline; } }
}
.ct-context-item-detail {
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ct-context-empty {
  padding: 12px 8px;
  text-align: center;
  color: var(--text-secondary, #d4d0e8);
  font-size: 12px;
  font-style: italic;
}

// ── Skills panel ──
.ct-skills-list { max-height: 320px; overflow-y: auto; padding-right: 4px; }
.ct-skills-global-search { margin-bottom: 6px; }
.ct-skills-similar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 2px 4px 6px;
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
}
.ct-skills-similar-label { color: var(--text-secondary, #d4d0e8); }
.ct-skills-similar-score {
  margin-left: 4px;
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
  font-variant-numeric: tabular-nums;
}
.ct-skills-similar-chip {
  padding: 1px 6px;
  border: 1px dashed rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  font-family: 'SF Mono', 'Menlo', monospace;
  color: var(--primary, #6366f1);
  cursor: pointer;
  &:hover {
    background: var(--primary, #6366f1);
    color: var(--text-primary, #f5f3ff);
    border-style: solid;
    border-color: var(--primary, #6366f1);
  }
}
.ct-skills-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary, #d4d0e8);
  padding: 8px 4px 4px;
  border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  margin-bottom: 4px;
}
.ct-skills-empty {
  padding: 20px 8px;
  text-align: center;
  color: var(--text-secondary, #d4d0e8);
  font-size: 12px;
  font-style: italic;
}
.ct-skill {
  padding: 4px 0;
  border-bottom: 1px dashed rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  &:last-child { border-bottom: 0; }
  &--off { opacity: 0.55; }
  &.is-selected { background: rgba(var(--primary-rgb, 99, 102, 241), 0.12); }
}
.ct-skill-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ct-skill-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary, #f5f3ff);
}
.ct-skill-name {
  font-size: 10px;
  font-family: 'SF Mono', 'Menlo', monospace;
  color: var(--text-secondary, #d4d0e8);
}
.ct-skill-tag {
  font-size: 9px;
  padding: 0 4px;
  border-radius: 4px;
  line-height: 16px;
  &--on { background: rgba(34, 197, 94, 0.12); color: #22c55e; }
  &--off { background: rgba(99, 102, 241, 0.1); color: var(--primary, #6366f1); }
}
.ct-skill-desc {
  font-size: 11px;
  color: var(--text-secondary, #d4d0e8);
  margin-top: 2px;
  padding-left: 2px;
}

// ── Popover animation ──
@keyframes ct-pop-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

// ── Agent settings dialogs ──
.ct-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  animation: ct-fade-in 0.15s ease-out;
}
.ct-dialog {
  width: 480px;
  max-width: 90vw;
  background: var(--bg-elevated, rgba(20, 18, 40, 0.96));
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  animation: ct-pop-in 0.15s ease-out;
}
@keyframes ct-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.ct-dialog-header {
  padding: 14px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #f5f3ff);
  border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.1);
}
.ct-dialog-body { padding: 16px 18px; }
.ct-dialog-hint { margin: 0 0 10px; font-size: 12px; color: var(--text-secondary, #d4d0e8); line-height: 1.5; }
.ct-dialog-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  border-radius: 8px;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.08);
  color: var(--text-primary, #f5f3ff);
  font-size: 13px;
  font-family: 'SF Mono', 'Menlo', monospace;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: var(--primary-light, #818cf8); }
  &::placeholder { color: var(--text-secondary, #d4d0e8); }
}
.ct-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px;
  border-top: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.1);
}
</style>

<style lang="scss">
// ── Popover z-index + dark theme (must be global — popovers teleport to body) ──
.ct-tb-popper {
  z-index: 2147483647 !important;

  // Dark-themed popover content
  --el-bg-color: var(--bg-elevated, rgba(20, 18, 40, 0.98));
  --el-bg-color-overlay: var(--bg-elevated, rgba(20, 18, 40, 0.98));
  --el-border-color-light: rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  --el-text-color-primary: var(--text-primary, #f5f3ff);
  --el-text-color-regular: var(--text-primary, #f5f3ff);
  --el-text-color-secondary: var(--text-secondary, #d4d0e8);
  --el-text-color-placeholder: var(--text-secondary, #d4d0e8);
  --el-fill-color-blank: var(--bg-elevated, rgba(20, 18, 40, 0.98));
  --el-fill-color-light: rgba(var(--primary-rgb, 99, 102, 241), 0.08);
  --el-color-primary: var(--primary-light, #818cf8);
  --el-color-primary-light-9: rgba(var(--primary-rgb, 99, 102, 241), 0.12);

  .el-popover {
    border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25) !important;
    background: var(--bg-elevated, rgba(20, 18, 40, 0.98)) !important;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5) !important;
  }

  .el-popover__title {
    color: var(--text-primary, #f5f3ff);
    font-size: 13px;
  }
}

// Dark-themed select dropdown
.el-select-dropdown {
  background: var(--bg-elevated, rgba(20, 18, 40, 0.98)) !important;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25) !important;

  .el-select-dropdown__item {
    color: var(--text-primary, #f5f3ff);

    &.is-selected { color: var(--primary-light, #818cf8); }
    &:hover { background: rgba(var(--primary-rgb, 99, 102, 241), 0.1); }
  }
}
</style>
