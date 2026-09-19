<script setup lang="ts">
/**
 * YiPet Chat — ChatToolbar (Vue 3 SFC)
 * Matches YiVad aiChat's ChatToolbar: Element Plus components, prompt history
 * popover, RAG controls.
 */
import { computed, ref } from 'vue';
import {
  ChatLineSquare, Picture, ChatDotRound, Search,
  Clock, CollectionTag, Delete, DocumentCopy, Cpu, Setting,
  FolderChecked, FolderOpened, Folder, Document, Plus,
  Loading, Tools,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useChatStore } from '../../stores/chat';
import { t } from '@/shared/i18n';
import RequestStatusButton from '../RequestStatusButton.vue';

const props = defineProps<{ hasContent: boolean }>();
const emit = defineEmits<{ clearInput: [] }>();

const store = useChatStore();
const s = store.state;
const MAX_DRAFT_IMAGES = 4;

const canUpload = computed(() => s.draftImages.length < MAX_DRAFT_IMAGES);
const currentSession = computed(() => s.sessions.find((ses) => ses.id === s.currentSessionId));

// ── Popover visibility ──
const showHistoryPopover = ref(false);
const showContextPopover = ref(false);
const showRagSettings = ref(false);
const historyQuery = ref('');
const contextPopoverTab = ref<'context' | 'browse'>('context');
const knowledgeSearch = ref('');
const knowledgeExpandedFolders = ref<Set<string>>(new Set());

interface BrowseNode {
  key: string; label: string; type: 'folder' | 'file'; path: string; children?: BrowseNode[];
}
const browseTree = computed<BrowseNode[]>(() => {
  const folderMap = new Map<string, BrowseNode>();
  const q = knowledgeSearch.value.trim().toLowerCase();
  function copyTree(nodes: any[]): BrowseNode[] {
    const out: BrowseNode[] = [];
    for (const n of nodes) {
      if (n.type === 'file') {
        const match = !q || n.label.toLowerCase().includes(q) || n.path.toLowerCase().includes(q);
        if (match) out.push({ key: `file:${n.path}`, label: n.name || n.label, type: 'file', path: n.path });
      } else {
        const children = n.children?.length ? copyTree(n.children) : [];
        if (!q || children.length) {
          const folder: BrowseNode = { key: `folder:${n.path}`, label: n.name || n.label, type: 'folder', path: n.path, children };
          folderMap.set(folder.key, folder);
          out.push(folder);
        }
      }
    }
    return out;
  }
  function sorted(arr: BrowseNode[]) {
    arr.sort((a, b) => { if (a.type !== b.type) return a.type === 'folder' ? -1 : 1; return a.label.localeCompare(b.label, 'zh-CN'); });
    for (const n of arr) if (n.children) sorted(n.children);
  }
  const built = copyTree(s.knowledgeTree || []);
  sorted(built);
  return built;
});
interface BrowseItem { node: BrowseNode; depth: number; }
const browseItems = computed<BrowseItem[]>(() => {
  const expanded = knowledgeExpandedFolders.value;
  const items: BrowseItem[] = [];
  function walk(nodes: BrowseNode[], depth: number) {
    for (const n of nodes) {
      items.push({ node: n, depth });
      if (n.type === 'folder' && n.children?.length && expanded.has(n.key)) walk(n.children, depth + 1);
    }
  }
  walk(browseTree.value, 0);
  return items;
});

function toggleKnowledgeFolder(key: string) {
  const next = new Set(knowledgeExpandedFolders.value);
  if (next.has(key)) next.delete(key); else next.add(key);
  knowledgeExpandedFolders.value = next;
}
async function addSingleToContext(path: string) {
  try {
    const content = (await store.readKnowledgeFile?.(path)) as any;
    const c = typeof content === 'string' ? content : content?.content || '';
    if (c) await store.applyContextChange?.(path, c);
    else await store.addContextFile?.(path);
  } catch { await store.addContextFile?.(path); }
  showContextPopover.value = false;
}
async function addFolderToContext(node: BrowseNode) {
  if (!node.children?.length) return;
  const files: BrowseNode[] = [];
  const walk = (arr: BrowseNode[]) => { for (const n of arr) { if (n.type === 'file') files.push(n); else if (n.children?.length) walk(n.children); } };
  walk(node.children);
  for (const f of files) await addSingleToContext(f.path);
}
function onContextPopoverShow() {
  contextPopoverTab.value = (currentSession.value?.tags?.length ?? 0) > 0 ? 'context' : 'browse';
  knowledgeSearch.value = '';
  if (!s.knowledgeTree?.length) store.loadKnowledgeTree?.();
}

const runningToolsLabel = computed(() => {
  const evs = s.toolEvents ?? [];
  const running = new Map<string, string>();
  for (const e of evs) {
    if (e.phase === 'start') running.set(e.name, e.label);
    else running.delete(e.name);
  }
  if (!running.size) return (evs[evs.length - 1]?.label) || 'Running tools...';
  const labels = Array.from(running.values());
  return labels.length <= 2 ? labels.join(', ') : labels.slice(0, 2).join(', ') + ` +${labels.length - 2}`;
});

// ── RAG chat modes ──
const RAG_CHAT_MODES = [
  { value: 'condense_plus_context', label: 'Condense + Context' },
  { value: 'condense', label: 'Condense Question' },
  { value: 'context', label: 'Context Only' },
  { value: 'simple', label: 'Simple' },
];

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
  navigator.clipboard?.writeText(text).then(
    () => ElMessage.success('Prompt copied'),
    () => ElMessage.error('Copy failed'),
  );
}

function removeHistoryPrompt(idx: number) {
  store.removePromptHistoryAt?.(idx);
}

async function confirmClearPromptHistory() {
  if (!s.promptHistory.length) return;
  try {
    await ElMessageBox.confirm(
      `Clear all ${s.promptHistory.length} prompt(s)? This cannot be undone.`,
      'Clear prompt history',
      {
        type: 'warning',
        confirmButtonText: 'Clear',
        cancelButtonText: 'Cancel',
      },
    );
  } catch {
    return;
  }
  store.clearPromptHistory?.();
  showHistoryPopover.value = false;
  ElMessage.success('Prompt history cleared');
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

const recentToolCalls = computed(() =>
  (s.toolEvents ?? [])
    .filter((event) => event.phase === 'end')
    .slice(-5)
    .reverse()
    .map((event) => ({
      key: `${event.name}-${event.timestamp}`,
      label: event.label,
      name: event.name,
      error: event.error || '',
      durationText: typeof event.durationMs === 'number' ? `${event.durationMs}ms` : '',
      preview: (event.error || event.content || '').trim(),
    })),
);

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

</script>

<template>
  <div class="ct-toolbar" role="toolbar" :aria-label="t('chatToolbarAriaLabel')">
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
        :title="t('chatPromptHistoryCount', String(s.promptHistory.length))"
        @show="historyQuery = ''"
      >
        <template #reference>
          <el-button circle :icon="Clock" :title="t('chatPromptHistory')" />
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
            <el-button size="small" type="danger" text :icon="Delete" @click="confirmClearPromptHistory()">Clear all ({{ s.promptHistory.length }})</el-button>
          </div>
        </div>
      </el-popover>

      <!-- Upload image -->
      <el-tooltip :content="t('chatUploadImage')" placement="bottom">
        <el-button circle :icon="Picture" :disabled="!canUpload" @click="onUploadImage" />
      </el-tooltip>

      <!-- Clear composer -->
      <el-tooltip v-if="props.hasContent" content="Clear composer" placement="bottom">
        <el-button circle :icon="Delete" @click="emit('clearInput')" />
      </el-tooltip>

      <!-- Bot settings -->
      <el-tooltip content="WeCom bot settings" placement="bottom">
        <el-button circle :icon="ChatDotRound" @click="store.openWeChatSettings?.()" />
      </el-tooltip>

      <!-- Skills / MCP -->
      <el-popover
        placement="bottom"
        trigger="click"
        :width="420"
        popper-class="ct-tb-popper"
        :title="`Skills & Tools · ${store.activeTools?.length ?? 0} active`"
      >
        <template #reference>
          <el-tooltip content="Skills & Tools" placement="bottom">
            <el-button circle :icon="Tools" />
          </el-tooltip>
        </template>
        <div class="ct-skills-panel">
          <div v-if="!store.allTools?.length" class="ct-skills-empty">
            No tools registered. Built-in tools (Web Search, Knowledge Search) activate automatically when the corresponding toggles are on.
          </div>
          <div v-else class="ct-skills-list">
            <div
              v-for="tool in (store.allTools ?? [])"
              :key="tool.name"
              class="ct-skill-item"
              :class="{ 'is-on': tool.enabled !== false }"
            >
              <div class="ct-skill-main">
                <span class="ct-skill-name">{{ tool.label }}</span>
                <span class="ct-skill-sub">{{ tool.name }}</span>
                <p class="ct-skill-desc">{{ tool.promptSnippet || tool.description }}</p>
              </div>
              <el-switch
                :model-value="tool.enabled !== false"
                size="small"
                @update:model-value="store.setToolEnabled?.(tool.name, $event as boolean)"
              />
            </div>
          </div>
          <div v-if="recentToolCalls.length" class="ct-tool-calls">
            <div class="ct-skills-section-title">Latest runs</div>
            <div class="ct-tool-call-list">
              <div
                v-for="call in recentToolCalls"
                :key="call.key"
                class="ct-tool-call-item"
                :class="{ 'is-error': !!call.error }"
                :title="call.preview || call.name"
              >
                <div class="ct-tool-call-top">
                  <span class="ct-tool-call-name">{{ call.label }}</span>
                  <span class="ct-tool-call-meta">
                    <span class="ct-tool-call-status">{{ call.error ? 'error' : 'ok' }}</span>
                    <span v-if="call.durationText">{{ call.durationText }}</span>
                  </span>
                </div>
                <div class="ct-tool-call-preview">
                  {{ call.preview || 'Completed without preview content' }}
                </div>
              </div>
            </div>
          </div>
          <div class="ct-skills-footer">
            <div class="ct-skills-toolperf">
              <span class="ct-skills-toolperf-label">Recent calls</span>
              <span class="ct-skills-toolperf-value">{{ s.toolEvents?.length ?? 0 }}</span>
            </div>
            <div class="ct-skills-toolperf">
              <span class="ct-skills-toolperf-label">Active</span>
              <span class="ct-skills-toolperf-value" :class="{'is-on': (store.activeTools?.length ?? 0) > 0}">
                {{ store.activeTools?.length ?? 0 }}
              </span>
            </div>
          </div>
        </div>
      </el-popover>
    </div>

    <!-- Right: pills group + running tools + clear + stop -->
    <div class="ct-right">

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
          @show="onContextPopoverShow"
        >
          <template #reference>
            <div class="ct-pill on" :title="t('chatActiveContext')">
              <el-icon :size="14"><CollectionTag /></el-icon>
              <span class="ct-pill-label">Context: {{ contextFiles.length }}</span>
            </div>
          </template>
          <el-tabs v-model="contextPopoverTab" class="ct-context-tabs">
            <el-tab-pane label="Context" name="context">
              <div class="ct-context-list">
                <div
                  v-for="(file, i) in contextFiles"
                  :key="i"
                  class="ct-context-item"
                >
                  <span
                    class="ct-context-item-path"
                    :class="{ 'is-clickable': file.kind === 'scope' || file.kind === 'ctx' }"
                    :title="file.kind === 'scope' || file.kind === 'ctx' ? t('chatClickToPreview') : file.detail"
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
                  <el-button
                    v-else-if="file.kind === 'ctx'"
                    size="small"
                    text
                    type="danger"
                    :icon="Delete"
                    title="Remove context file"
                    @click="store.removeContextFile?.(file.label)"
                  />
                </div>
                <div v-if="!contextFiles.length" class="ct-context-empty">
                  No active context. Switch to Browse tab to add files from the knowledge base.
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Browse" name="browse">
              <el-input
                v-model="knowledgeSearch"
                size="small"
                clearable
                :prefix-icon="Search"
                placeholder="Search knowledge tree..."
                class="ct-browse-search"
              />
              <div class="ct-browse-tree">
                <div
                  v-for="item in browseItems"
                  :key="item.node.key"
                  class="ct-browse-item"
                  :style="{ paddingLeft: (item.depth * 12 + 4) + 'px' }"
                >
                  <template v-if="item.node.type === 'folder'">
                    <el-icon :size="12" class="ct-browse-caret" @click="toggleKnowledgeFolder(item.node.key)">
                      <component :is="knowledgeExpandedFolders.has(item.node.key) ? FolderOpened : Folder" />
                    </el-icon>
                    <el-icon :size="14"><FolderChecked /></el-icon>
                    <span class="ct-browse-label">{{ item.node.label }}</span>
                    <el-button size="small" text :icon="Plus" title="Add all files in folder to context" @click="addFolderToContext(item.node)" />
                  </template>
                  <template v-else>
                    <span class="ct-browse-caret" />
                    <el-icon :size="14"><Document /></el-icon>
                    <span class="ct-browse-label ct-browse-label--file" :title="item.node.path" @click="addSingleToContext(item.node.path)">{{ item.node.label }}</span>
                    <el-button size="small" text :icon="Plus" title="Add to context" @click="addSingleToContext(item.node.path)" />
                  </template>
                </div>
                <div v-if="!browseItems.length" class="ct-browse-empty">
                  {{ knowledgeSearch ? 'No files match your search.' : 'No knowledge files loaded yet.' }}
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
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

        <!-- RAG settings -->
        <el-popover
          v-if="s.knowledgeGrounded"
          v-model:visible="showRagSettings"
          popper-class="ct-tb-popper"
          placement="bottom"
          :width="280"
          trigger="click"
        >
          <template #reference>
            <span class="ct-rag-settings-btn" :class="{ 'is-active': showRagSettings }" title="RAG settings">
              <el-icon :size="12"><Setting /></el-icon>
            </span>
          </template>
          <div class="ct-rag-settings">
            <div class="ct-rag-setting-section">
              <span class="ct-rag-setting-label">Chat Mode</span>
              <el-select
                :model-value="s.ragChatMode"
                size="small"
                @update:model-value="s.ragChatMode = $event as string"
              >
                <el-option
                  v-for="m in RAG_CHAT_MODES"
                  :key="m.value"
                  :label="m.label"
                  :value="m.value"
                />
              </el-select>
            </div>
            <div class="ct-rag-setting-row">
              <span class="ct-rag-setting-label">Hybrid (BM25+Vector)</span>
              <el-switch :model-value="s.ragHybrid" size="small" @update:model-value="s.ragHybrid = $event as boolean" />
            </div>
            <div class="ct-rag-setting-row">
              <span class="ct-rag-setting-label">Rerank results</span>
              <el-switch :model-value="s.ragRerank" size="small" @update:model-value="s.ragRerank = $event as boolean" />
            </div>
            <div class="ct-rag-setting-row">
              <span class="ct-rag-setting-label">Citation injection</span>
              <el-switch :model-value="s.ragCitations" size="small" @update:model-value="s.ragCitations = $event as boolean" />
            </div>
            <div class="ct-rag-setting-section">
              <span class="ct-rag-setting-label">Num queries (multi-query)</span>
              <el-input-number
                :model-value="s.ragNumQueries"
                :min="0"
                :max="10"
                size="small"
                controls-position="right"
                style="width: 100px"
                @update:model-value="s.ragNumQueries = $event as number"
              />
            </div>
            <div class="ct-rag-setting-row">
              <span class="ct-rag-setting-label">HyDE (Hypothetical Document)</span>
              <el-switch :model-value="s.ragHyde" size="small" @update:model-value="s.ragHyde = $event as boolean" />
            </div>
            <div class="ct-rag-setting-section" style="border-top: 1px solid rgba(var(--primary-rgb,99,102,241),.15); padding-top: 8px; margin-top: 4px;">
              <span class="ct-rag-setting-label">Context files in session</span>
              <span class="ct-rag-ctx-count">{{ ragContextFiles.length }}</span>
            </div>
            <div class="ct-rag-setting-section">
              <span class="ct-rag-setting-label">RAG scope</span>
              <el-input size="small" :model-value="s.ragScope" placeholder="(all knowledge base)" clearable @update:model-value="store.setRagScopeFromNode?.($event as string, false)" />
            </div>
          </div>
        </el-popover>
      </div>

      <transition name="ct-pop-in">
        <div
          v-if="s.isProcessing && s.toolEvents?.length"
          class="ct-running-tools"
          :title="s.toolEvents.slice(-3).map(e => `${e.label} · ${e.phase}`).join(', ')"
        >
          <el-icon class="ct-running-dot" :size="10"><Loading /></el-icon>
          <span class="ct-running-label">
            {{ runningToolsLabel }}
          </span>
        </div>
      </transition>

      <RequestStatusButton
        :sending="s.isProcessing"
        :streaming-type="s.streamingType"
        @stop="store.stopSending()"
      />
    </div>
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

// ── Popover animation ──
@keyframes ct-pop-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

// ── RAG settings popover ──
.ct-rag-settings-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: -4px;
  cursor: pointer;
  color: var(--text-secondary, #d4d0e8);
  border-radius: 4px;
  transition: all 0.15s;
  &:hover { color: var(--primary-light, #818cf8); background: rgba(var(--primary-rgb, 99, 102, 241), 0.1); }
  &.is-active { color: var(--primary-light, #818cf8); }
}

.ct-rag-settings {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  padding: 4px 0;
}

.ct-rag-setting-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 0;
}

.ct-rag-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 0;
  border-top: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.08);
}

.ct-rag-setting-label {
  font-size: 11px;
  color: var(--text-secondary, #d4d0e8);
  font-weight: 500;
}

.ct-rag-ctx-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 22px; padding: 0 6px;
  font-family: 'SF Mono', monospace; font-size: 11px; font-weight: 700;
  color: #fff; background: var(--primary,#6366f1); border-radius: 11px;
}

.ct-context-tabs :deep(.el-tabs__header) { margin-bottom: 6px; }
.ct-context-tabs :deep(.el-tabs__nav-wrap::after) { background: rgba(var(--primary-rgb,99,102,241),.15); }
.ct-context-tabs :deep(.el-tabs__item) { font-size: 12px; height: 30px; line-height: 30px; color: var(--text-secondary,#d4d0e8); }
.ct-context-tabs :deep(.el-tabs__item.is-active) { color: var(--primary-light,#818cf8); }
.ct-browse-search { margin-bottom: 6px; }
.ct-browse-tree { max-height: 260px; overflow-y: auto; padding-right: 4px; }
.ct-browse-item {
  display: flex; align-items: center; gap: 4px; height: 26px;
  font-size: 12px; color: var(--text-primary,#f5f3ff);
  border-radius: 4px; cursor: default;
  &:hover { background: rgba(var(--primary-rgb,99,102,241),.08); }
}
.ct-browse-caret { width: 14px; display: inline-flex; justify-content: center; cursor: pointer; flex-shrink: 0; }
.ct-browse-label {
  flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ct-browse-label--file { cursor: pointer; &:hover { color: var(--primary-light,#818cf8); text-decoration: underline; } }
.ct-browse-empty {
  padding: 16px 8px; text-align: center; color: var(--text-secondary,#d4d0e8);
  font-size: 12px; font-style: italic;
}

.ct-running-tools {
  display: inline-flex; align-items: center; gap: 6px;
  height: 28px; padding: 0 10px;
  background: rgba(var(--primary-rgb,99,102,241),.1);
  border: 1px solid rgba(var(--primary-rgb,99,102,241),.25);
  border-radius: 14px;
  font-size: 11px; color: var(--primary-light,#818cf8);
  max-width: 220px;
}
.ct-running-label {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-weight: 500;
}
.ct-running-dot { color: var(--primary-light,#818cf8); }
.ct-running-dot { animation: ct-spin 0.8s linear infinite; }
.ct-pop-in-enter-active, .ct-pop-in-leave-active { transition: all .2s; }
.ct-pop-in-enter-from, .ct-pop-in-leave-to { opacity: 0; transform: translateX(6px); max-width: 0; padding-left: 0; padding-right: 0; border: 0; }

.ct-skills-panel { display: flex; flex-direction: column; gap: 8px; font-size: 12px; }
.ct-skills-section-title {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary,#d4d0e8);
  text-transform: uppercase;
  letter-spacing: .06em;
}
.ct-skills-empty {
  padding: 12px 8px; text-align: center;
  color: var(--text-secondary,#d4d0e8); font-style: italic;
  background: rgba(var(--primary-rgb,99,102,241),.04);
  border-radius: 6px;
}
.ct-skills-list {
  display: flex; flex-direction: column; gap: 2px;
  max-height: 260px; overflow-y: auto; padding-right: 4px;
}
.ct-skill-item {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 6px 8px; border-radius: 6px;
  border: 1px solid transparent;
  transition: all .15s;
  &:hover { background: rgba(var(--primary-rgb,99,102,241),.06); border-color: rgba(var(--primary-rgb,99,102,241),.15); }
  &.is-on { background: rgba(34,197,94,.06); border-color: rgba(34,197,94,.2); }
}
.ct-skill-main { flex: 1; min-width: 0; }
.ct-skill-name { font-weight: 600; color: var(--text-primary,#f5f3ff); font-size: 12px; }
.ct-skill-sub {
  font-family: 'SF Mono', monospace; font-size: 10px;
  color: var(--text-secondary,#d4d0e8); opacity: .6; margin-left: 6px;
}
.ct-skill-desc {
  margin: 2px 0 0; font-size: 11px; color: var(--text-secondary,#d4d0e8);
  line-height: 1.5;
}
.ct-tool-calls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 4px;
  border-top: 1px solid rgba(var(--primary-rgb,99,102,241),.1);
}
.ct-tool-call-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 4px;
}
.ct-tool-call-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(var(--primary-rgb,99,102,241),.05);
  border: 1px solid rgba(var(--primary-rgb,99,102,241),.12);
}
.ct-tool-call-item.is-error {
  background: rgba(239,68,68,.08);
  border-color: rgba(239,68,68,.18);
}
.ct-tool-call-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.ct-tool-call-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary,#f5f3ff);
}
.ct-tool-call-meta {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
  font-family: 'SF Mono', monospace;
  font-size: 10px;
  color: var(--text-secondary,#d4d0e8);
}
.ct-tool-call-status {
  text-transform: uppercase;
  color: #22c55e;
}
.ct-tool-call-item.is-error .ct-tool-call-status {
  color: #f87171;
}
.ct-tool-call-preview {
  display: -webkit-box;
  overflow: hidden;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-secondary,#d4d0e8);
  text-overflow: ellipsis;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.ct-skills-footer {
  display: flex; justify-content: space-around;
  border-top: 1px solid rgba(var(--primary-rgb,99,102,241),.1);
  padding-top: 8px; margin-top: 4px;
}
.ct-skills-toolperf {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.ct-skills-toolperf-label {
  font-size: 10px; color: var(--text-secondary,#d4d0e8); text-transform: uppercase; letter-spacing: .04em;
}
.ct-skills-toolperf-value {
  font-family: 'SF Mono', monospace; font-size: 14px; font-weight: 700;
  color: var(--text-secondary,#d4d0e8);
  &.is-on { color: #22c55e; }
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
