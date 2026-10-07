<script setup lang="ts">
/**
 * YiPet Chat — ChatToolbar (Vue 3 SFC)
 * Matches YiVad aiChat's ChatToolbar: "More tools" dropdown, Skills/MCP
 * popover, RAG/Web/Context pills, running tools indicator.
 */
import { computed, ref, onMounted } from 'vue';
import {
  ChatLineSquare, Picture, ChatDotRound, Search,
  Loading, Tools, Cpu, More, Setting,
} from '@element-plus/icons-vue';
import { useChatStore } from '../../stores/chat';
import { t } from '@/shared/i18n';
import RequestStatusButton from '../RequestStatusButton.vue';
import ContextFilesButton from './ContextFilesButton.vue';
import PromptHistoryPopover from './PromptHistoryPopover.vue';
import TemplatePicker from '../TemplatePicker.vue';
import FaqDialog from '../FaqDialog.vue';
import { useToolPerformance } from './useToolPerformance';

const props = withDefaults(
  defineProps<{
    faqActive?: boolean;
    sending?: boolean;
    streamingType?: '' | 'send' | 'regenerate' | 'resend';
    ragToggle?: boolean;
    webSearchToggle?: boolean;
    contextFiles?: string[];
  }>(),
  {
    faqActive: false,
    sending: false,
    streamingType: '',
    ragToggle: false,
    webSearchToggle: false,
    contextFiles: () => [],
  },
);

const emit = defineEmits<{
  (e: 'toggle-faq'): void;
  (e: 'pick-image'): void;
  (e: 'open-wechat'): void;
  (e: 'toggle-rag'): void;
  (e: 'toggle-web-search'): void;
  (e: 'stop'): void;
}>();

const store = useChatStore();
const s = store.state;

// ── More tools dropdown ──
const moreToolsVisible = ref(false);

// ── RAG settings popover ──
const ragSettingsVisible = ref(false);

// ── Skills popover ──
const skillsPopoverVisible = ref(false);
const skillFilter = ref('');
const compactMode = ref(false);

const filteredTools = computed(() => {
  const q = skillFilter.value.trim().toLowerCase();
  if (!q) return store.allTools ?? [];
  return (store.allTools ?? []).filter(
    t => t.label.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q),
  );
});

const activeSkillCount = computed(() => store.activeTools?.length ?? 0);

// ── RAG pill computed ──
const ragSourceCount = computed(() => s.ragSources?.length ?? 0);
const ragTopScore = computed(() => {
  if (!s.ragSources?.length) return 0;
  return Math.max(...s.ragSources.map(x => x.score ?? 0));
});
const ragGrade = computed(() => {
  if (!ragSourceCount.value) return null;
  const top = ragTopScore.value;
  if (top >= 0.85) return 'A';
  if (top >= 0.7) return 'B';
  if (top >= 0.5) return 'C';
  return 'D';
});
const ragHealthDot = computed(() => {
  if (!s.ragStatus) return 'red';
  if (s.ragStatus.error) return 'orange';
  if (s.ragStatus.built && s.ragStatus.num_docs > 0) return 'green';
  if (s.ragStatus.built) return 'orange';
  return 'red';
});
const ragIndexAvailable = computed(() => s.ragStatus?.built && s.ragStatus.num_docs > 0);
const isRetrieving = computed(() => s.isProcessing && s.streamingPhase === 'retrieving');

// ── Derived scope from context files ──
const derivedScope = computed(() => {
  const ctxPaths = props.contextFiles ?? [];
  if (!ctxPaths.length) return null;
  if (ctxPaths.length === 1) return { label: ctxPaths[0], count: 1 };
  const parts = ctxPaths.map(p => p.split('/'));
  const minLen = Math.min(...parts.map(p => p.length));
  const common: string[] = [];
  for (let i = 0; i < minLen; i++) {
    if (parts.every(p => p[i] === parts[0][i])) common.push(parts[0][i]);
    else break;
  }
  return { label: common.join('/') || 'mixed roles', count: ctxPaths.length };
});

const ragTooltip = computed(() => {
  const shortcut = 'Ctrl+Shift+R';
  if (!s.ragStatus) return `RAG — checking index... (${shortcut})`;
  const info = s.ragStatus;
  const ctxCount = props.contextFiles?.length ?? 0;
  const scopeNote = s.ragEnabled && ctxCount > 0
    ? ` · scoped to ${ctxCount} file(s)`
    : s.ragEnabled ? ' · full knowledge base' : '';
  const health = ragHealthDot.value === 'green' ? 'healthy' : ragHealthDot.value === 'orange' ? 'degraded' : 'not built';
  const fastNote = s.ragEnabled && s.ragFast ? ' · FAST (no retrieval)' : '';
  const srcNote = ragSourceCount.value ? ` · last: ${ragSourceCount.value} sources${ragGrade.value ? ` (${ragGrade.value})` : ''}` : '';
  if (!ragIndexAvailable.value) return `RAG unavailable — index not built (${shortcut})`;
  if (s.ragEnabled && s.webSearchEnabled) return `RAG+Web · ${info.num_docs} docs · ${health}${fastNote}${scopeNote}${srcNote} (${shortcut})`;
  if (s.ragEnabled) return `RAG on · ${info.num_docs} docs · ${health}${fastNote}${scopeNote}${srcNote} (${shortcut})`;
  return `RAG off · ${info.num_docs} docs · ${health} (${shortcut})`;
});

// ── Running tools ──
const runningTools = computed(() => {
  const events = s.toolEvents ?? [];
  const started = new Set<string>();
  const ended = new Set<string>();
  for (const e of events) {
    if (e.phase === 'start') started.add(e.name);
    if (e.phase === 'end') ended.add(e.name);
  }
  return [...started]
    .filter(n => !ended.has(n))
    .map(n => events.find(e => e.name === n && e.phase === 'start'))
    .filter(Boolean) as Array<{ name: string; label: string }>;
});

const { runningToolsLabel, recentToolCalls, toolperfAggregate } = useToolPerformance();

// Load RAG status on mount
onMounted(() => {
  if (!s.ragStatus) store.loadRagStatus?.();
});
</script>

<template>
  <div class="ct-toolbar" role="toolbar" :aria-label="t('chatToolbarAriaLabel')">
    <!-- Left: More tools dropdown, TemplatePicker, FaqPopover, PromptHistory, Skills -->
    <div class="ct-left">
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
          <div
            class="ct-more-item"
            :class="{ 'is-active': props.faqActive }"
            @click="emit('toggle-faq'); moreToolsVisible = false"
          >
            <el-icon :size="16"><ChatLineSquare /></el-icon>
            <span>FAQ</span>
            <span v-if="props.faqActive" class="ct-more-item-dot" />
          </div>
          <div
            class="ct-more-item"
            @click="skillsPopoverVisible = true; moreToolsVisible = false"
          >
            <el-icon :size="16"><Tools /></el-icon>
            <span>Skills · {{ activeSkillCount }} active</span>
          </div>
          <div
            class="ct-more-item"
            @click="emit('pick-image'); moreToolsVisible = false"
          >
            <el-icon :size="16"><Picture /></el-icon>
            <span>Upload image</span>
          </div>
          <div
            class="ct-more-item"
            @click="emit('open-wechat'); moreToolsVisible = false"
          >
            <el-icon :size="16"><ChatDotRound /></el-icon>
            <span>WeCom settings</span>
          </div>
        </div>
      </el-popover>

      <!-- Prompt templates -->
      <TemplatePicker />

      <!-- FAQ dialog (matches YiVad FaqPopover placement) -->
      <FaqDialog />

      <!-- Prompt history -->
      <PromptHistoryPopover />

      <!-- Skills / MCP popover (triggered from More menu via hidden anchor) -->
      <el-popover
        v-model:visible="skillsPopoverVisible"
        placement="bottom"
        :width="360"
        trigger="click"
        :title="`Skills · ${activeSkillCount} active`"
        popper-class="ct-skills-pop"
      >
        <template #reference>
          <span class="ct-skills-anchor" />
        </template>
        <div class="ct-skills-list">
          <!-- Global tool search -->
          <div class="ct-skills-search-sticky">
            <el-input
              v-model="skillFilter"
              size="small"
              clearable
              :prefix-icon="Search"
              placeholder="Search all tools…"
              class="ct-skills-global-search"
            />
            <div
              v-if="skillFilter.trim()"
              class="ct-skills-search-summary"
            >
              <span class="ct-skills-search-total">{{ filteredTools.length }} match{{ filteredTools.length === 1 ? '' : 'es' }}</span>
            </div>
          </div>

          <!-- Tool list -->
          <div v-if="!store.allTools?.length" class="ct-skills-empty">
            No tools registered.
          </div>
          <div v-else-if="!filteredTools.length" class="ct-skills-empty">
            No tools match "{{ skillFilter }}"
          </div>
          <div v-else class="ct-skills-section">
            <span>Tools · {{ activeSkillCount }} active</span>
            <el-button
              class="ct-skills-compact-toggle"
              :class="{ 'is-active': compactMode }"
              size="small"
              text
              :title="compactMode ? 'Full view' : 'Compact view'"
              @click="compactMode = !compactMode"
            >{{ compactMode ? '▤' : '▥' }}</el-button>
          </div>
          <div
            v-for="tool in filteredTools"
            :key="tool.name"
            class="ct-skill"
            :class="{
              'ct-skill--off': tool.enabled === false,
              'ct-skill--compact': compactMode
            }"
          >
            <div class="ct-skill-head">
              <span class="ct-skill-label">{{ tool.label }}</span>
              <span class="ct-skill-name">{{ tool.name }}</span>
              <span v-if="tool.enabled === false" class="ct-skill-tag ct-skill-tag--off" title="Disabled">off</span>
              <span v-else class="ct-skill-tag ct-skill-tag--on" title="Enabled">on</span>
            </div>
            <div v-if="!compactMode" class="ct-skill-desc">{{ tool.promptSnippet || tool.description }}</div>
          </div>

          <!-- Recent tool calls -->
          <div v-if="recentToolCalls.length" class="ct-tool-calls">
            <div class="ct-skills-section-title">Latest runs</div>
            <div class="ct-tool-call-list">
              <div
                v-for="call in recentToolCalls"
                :key="call.key"
                class="ct-tool-call-item"
                :class="[
                  { 'is-error': !!call.error },
                  call.speedTier ? `speed-${call.speedTier}` : '',
                ]"
                :title="call.preview || call.name"
              >
                <div class="ct-tool-call-top">
                  <span class="ct-tool-call-name">
                    {{ call.label }}
                    <span v-if="call.speedLabel" class="ct-tool-call-speed" :class="`is-${call.speedTier}`">{{ call.speedLabel }}</span>
                  </span>
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

          <!-- Footer stats -->
          <div class="ct-skills-footer">
            <div class="ct-skills-toolperf">
              <span class="ct-skills-toolperf-label">Calls</span>
              <span class="ct-skills-toolperf-value" :title="`Last 20 tool executions: ${toolperfAggregate.total} runs · avg ${toolperfAggregate.avgMs}ms`">
                {{ s.toolEvents?.length ?? 0 }}
              </span>
            </div>
            <div class="ct-skills-toolperf">
              <span class="ct-skills-toolperf-label">Active</span>
              <span class="ct-skills-toolperf-value" :class="{'is-on': activeSkillCount > 0}">
                {{ activeSkillCount }}
              </span>
            </div>
            <div class="ct-skills-toolperf">
              <span class="ct-skills-toolperf-label">Errors</span>
              <span class="ct-skills-toolperf-value" :class="{'is-err': toolperfAggregate.errors > 0}">
                {{ toolperfAggregate.errors }}
              </span>
            </div>
            <div class="ct-skills-toolperf">
              <span class="ct-skills-toolperf-label">Slow</span>
              <span class="ct-skills-toolperf-value" :class="{'is-slow': toolperfAggregate.slowCount > 0}">
                {{ toolperfAggregate.slowCount }}
              </span>
            </div>
          </div>
        </div>
      </el-popover>
    </div>

    <!-- Right: pills group + running tools + stop -->
    <div class="ct-right">
      <!-- Pills group: status toggles -->
      <div class="ct-pills-group">
        <!-- Context files -->
        <ContextFilesButton />

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
                on: s.ragEnabled,
                combined: s.ragEnabled && s.webSearchEnabled,
                retrieving: isRetrieving,
                fast: s.ragEnabled && s.ragFast,
                sourced: !isRetrieving && !s.isProcessing && ragSourceCount > 0,
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
                  {{ s.ragEnabled && s.webSearchEnabled ? 'RAG+Web' : isRetrieving ? 'Retrieving' : 'RAG' }}
                </span>
                <span v-if="s.ragEnabled && s.ragFast" class="ct-rag-fast-badge">FAST</span>
                <span v-if="!isRetrieving && !s.isProcessing && ragSourceCount > 0" class="ct-rag-src-badge" :class="'grade-' + ragGrade?.toLowerCase()">
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
              <span v-if="s.ragStatus?.num_docs" class="ct-rag-pop-docs">{{ s.ragStatus.num_docs }} docs indexed</span>
              <span v-else class="ct-rag-pop-docs ct-rag-pop-docs--warn">Index not built</span>
            </div>
            <template v-if="s.ragEnabled || ragIndexAvailable">
              <div v-if="derivedScope" class="ct-rag-scope-bar">
                <span class="ct-rag-scope-bar-icon">ctx</span>
                <span class="ct-rag-scope-bar-label">{{ derivedScope.label }}</span>
                <span class="ct-rag-scope-bar-count">{{ derivedScope.count }} file{{ derivedScope.count !== 1 ? 's' : '' }}</span>
              </div>
              <div class="ct-rag-pop-section">
                <div class="ct-rag-pop-section-title">Chat Engine</div>
                <div class="ct-rag-row">
                  <div class="ct-rag-row-label">
                    <span>Chat Mode</span>
                    <el-tooltip content="How conversation history is used for retrieval" placement="top">
                      <span class="ct-rag-info">?</span>
                    </el-tooltip>
                  </div>
                  <el-select
                    :model-value="s.ragChatMode"
                    size="small"
                    class="ct-rag-select"
                    @change="store.setRagChatMode(($event as string))"
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
                    <el-tooltip content="Skip retrieval entirely — direct LLM answer for speed" placement="top">
                      <span class="ct-rag-info">?</span>
                    </el-tooltip>
                  </div>
                  <el-switch :model-value="s.ragFast" size="small" @update:model-value="store.toggleRagFast()" @click.stop />
                </div>
                <div class="ct-rag-row-desc">Skip retrieval entirely — direct LLM answer for speed</div>
              </div>
              <div class="ct-rag-pop-section">
                <div class="ct-rag-pop-section-title">Retrieval</div>
                <div class="ct-rag-row">
                  <div class="ct-rag-row-label">
                    <span>Query Variants</span>
                    <el-tooltip content="Number of query variations for fusion retrieval (1 = no expansion)" placement="top">
                      <span class="ct-rag-info">?</span>
                    </el-tooltip>
                  </div>
                  <el-select
                    :model-value="s.ragNumQueries"
                    size="small"
                    class="ct-rag-select"
                    @change="store.setRagNumQueries(Number($event))"
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
                    <el-tooltip content="Combine keyword matching with semantic search for better recall" placement="top">
                      <span class="ct-rag-info">?</span>
                    </el-tooltip>
                  </div>
                  <el-switch :model-value="s.ragHybrid" size="small" @update:model-value="store.toggleRagHybrid()" @click.stop />
                </div>
                <div class="ct-rag-row-desc">Combine keyword matching with semantic search for better recall</div>
              </div>
              <div class="ct-rag-pop-section">
                <div class="ct-rag-pop-section-title">Ranking</div>
                <div class="ct-rag-row">
                  <div class="ct-rag-row-label">
                    <span>Rerank (LLM)</span>
                    <el-tooltip content="Cross-encoder re-ranks retrieved chunks for precision (~8 LLM calls)" placement="top">
                      <span class="ct-rag-info">?</span>
                    </el-tooltip>
                  </div>
                  <el-switch :model-value="s.ragRerank" size="small" @update:model-value="store.toggleRagRerank()" @click.stop />
                </div>
                <div class="ct-rag-row-desc">Cross-encoder re-ranks retrieved chunks for precision (~8 LLM calls)</div>
                <div class="ct-rag-row">
                  <div class="ct-rag-row-label">
                    <span>HyDE</span>
                    <el-tooltip content="Generate hypothetical answer first to improve embedding match" placement="top">
                      <span class="ct-rag-info">?</span>
                    </el-tooltip>
                  </div>
                  <el-switch :model-value="s.ragHyde" size="small" @update:model-value="store.toggleRagHyde()" @click.stop />
                </div>
                <div class="ct-rag-row-desc">Generate hypothetical answer first to improve embedding match</div>
              </div>
              <div class="ct-rag-pop-section">
                <div class="ct-rag-pop-section-title">Output</div>
                <div class="ct-rag-row">
                  <div class="ct-rag-row-label">
                    <span>Inline Citations [N]</span>
                    <el-tooltip content="Prefix chunks with [Source N] markers for traceable answers" placement="top">
                      <span class="ct-rag-info">?</span>
                    </el-tooltip>
                  </div>
                  <el-switch :model-value="s.ragCitations" size="small" @update:model-value="store.toggleRagCitations()" @click.stop />
                </div>
                <div class="ct-rag-row-desc">Prefix chunks with [Source N] markers for traceable answers</div>
              </div>
              <div class="ct-rag-pop-footer">
                <el-button size="small" text type="info" @click.stop="store.resetRagSettings()">Reset to Defaults</el-button>
              </div>
            </template>
            <div v-else class="ct-rag-pop-section">
              <div class="ct-rag-pop-empty">
                Knowledge index not built. Run a build from the RAG dashboard or use <code>python -m scripts.build_index</code> on the server.
              </div>
            </div>
          </div>
        </el-popover>

        <!-- Web search -->
        <div
          class="ct-pill ct-pill--web"
          :class="{
            on: s.webSearchEnabled,
            searching: s.webSearching,
            combined: s.webSearchEnabled && s.ragEnabled
          }"
          :title="s.webSearchEnabled
            ? (s.webSearching
              ? 'Web search running...'
              : (s.webSearchResults.length
                ? `Web search on — ${s.webSearchResults.length} cached source(s)${s.searchTimingMs ? ` · ${s.searchTimingMs}ms` : ''}`
                : 'Web search on — answers include internet results'))
            : 'Web search off — toggle to search the web'"
          @click="emit('toggle-web-search')"
        >
          <el-icon :size="14" :class="{ 'ct-spin': s.webSearching }">
            <Loading v-if="s.webSearching" />
            <Search v-else />
          </el-icon>
          <span class="ct-pill-label">{{
            s.webSearching
              ? 'Searching...'
              : s.webSearchEnabled && s.webSearchResults.length
                ? `Web ${s.webSearchResults.length}`
                : 'Web'
          }}</span>
          <span v-if="s.webSearchEnabled && s.searchTimingMs > 0 && !s.webSearching" class="ct-pill-timing">
            {{ s.searchTimingMs < 1000 ? `${s.searchTimingMs}ms` : `${(s.searchTimingMs / 1000).toFixed(1)}s` }}
          </span>
        </div>
      </div>

      <!-- Running tools indicator -->
      <div v-for="tool in runningTools" :key="tool.name" class="ct-pill on" :title="`Running: ${tool.label}`">
        <el-icon :size="14" class="ct-spin"><Loading /></el-icon>
        <span class="ct-pill-label">{{ tool.label }}</span>
      </div>

      <RequestStatusButton
        v-if="s.isProcessing"
        :sending="s.isProcessing"
        :streaming-type="s.streamingType"
        @stop="emit('stop')"
      />
    </div>

    <!-- FAQ dialog (matches YiVad FaqPopover inline render) -->
  </div>
</template>


<style lang="scss" scoped>
@use "./styles/toolbar.scss";
</style>
<style lang="scss">
@use "./styles/global.scss";
</style>