<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Search, Files, Scissor, Clock, DataLine } from '@element-plus/icons-vue';
import { useChatStore } from '../../stores/chat';

const store = useChatStore();
const s = store.state;

const emit = defineEmits<{ (e: 'close'): void }>();

type Tab = 'query' | 'index' | 'decompose' | 'history';
const activeTab = ref<Tab>('query');

const visible = computed({
  get: () => !!s.llamaIndexVisible,
  set: v => { if (!v) emit('close'); },
});

const currentSession = computed(() =>
  s.sessions.find((ses: any) => ses.id === s.currentSessionId)
);

const contextFiles = computed(() => {
  const tags = currentSession.value?.tags ?? [];
  const ctx: Array<{ path: string; name: string; dir: string }> = [];
  for (const t of tags) {
    if (typeof t !== 'string' || !t.startsWith('ctx:')) continue;
    const path = t.slice(4);
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop() || path;
    const dir = parts.length ? parts.join('/') : '.';
    ctx.push({ path, name, dir });
  }
  return ctx;
});

const scopeFileGroups = computed(() => {
  const g = new Map<string, typeof contextFiles.value>();
  for (const f of contextFiles.value) {
    if (!g.has(f.dir)) g.set(f.dir, []);
    g.get(f.dir)!.push(f);
  }
  return g;
});

const ragStats = ref({
  built: false,
  numDocs: 0,
  lastBuiltAt: '',
  queryCount: 0,
  avgLatencyMs: 0,
});

const recentPetMessages = computed(() =>
  (s.messages || []).filter((message: any) => message.type === 'pet').slice(-3).reverse()
);

function topSourceLabel(message: any): string {
  const top = message?.sources?.[0];
  if (!top) return '';
  return String(top.metadata?.title || top.path || '').replace(/\.md$/, '');
}

function topSourcePath(message: any): string {
  return String(message?.sources?.[0]?.path || '');
}

onMounted(async () => {
  try {
    const stats = await store.fetchRagStatus?.() as any;
    if (stats) {
      ragStats.value = {
        built: !!stats.built,
        numDocs: stats.num_docs ?? stats.numDocs ?? 0,
        lastBuiltAt: stats.last_built_at ?? stats.lastBuiltAt ?? '',
        queryCount: stats.queryCount ?? 0,
        avgLatencyMs: stats.avgLatencyMs ?? 0,
      };
    }
  } catch { /* best-effort */ }
});

function preview(path: string) {
  store.openKnowledgePreview?.(path);
}

function previewQuestionSources(message: any) {
  const question = String(message?.searchQuery || message?.content || '').trim();
  if (!question) return;
  store.previewRagSources?.(question);
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="contextFiles.length ? `RAG Console · ${contextFiles.length} context file(s)` : 'RAG Console'"
    width="880px"
    top="3vh"
    :z-index="2147483647"
    append-to-body
    :close-on-click-modal="false"
    class="lip-dialog"
    @close="emit('close')"
  >
    <div class="lip-ctx" :class="{ 'lip-ctx--on': contextFiles.length > 0 }">
      <div class="lip-ctx-top">
        <span class="lip-ctx-icon">📚</span>
        <span class="lip-ctx-n">{{ contextFiles.length }} context file(s)</span>
        <code v-if="contextFiles.length" class="lip-ctx-scope">{{ contextFiles.length }} paths loaded</code>
        <span v-else class="lip-ctx-empty-tag">No context files attached</span>
        <div class="lip-ctx-stats">
          <span class="lip-stat"><span class="lip-stat-label">Docs indexed</span><span class="lip-stat-value">{{ ragStats.numDocs }}</span></span>
          <span class="lip-stat"><span class="lip-stat-label">Queries</span><span class="lip-stat-value">{{ ragStats.queryCount }}</span></span>
          <span class="lip-stat"><span class="lip-stat-label">Avg latency</span><span class="lip-stat-value">{{ ragStats.avgLatencyMs }}ms</span></span>
        </div>
      </div>
      <div v-if="contextFiles.length" class="lip-ctx-list">
        <template v-for="[dir, files] in scopeFileGroups" :key="dir">
          <span class="lip-ctx-dir">{{ dir === '.' ? 'root' : dir }}/</span>
          <span
            v-for="f in files"
            :key="f.path"
            class="lip-ctx-file"
            :title="f.path"
            @click="preview(f.path)"
          >{{ f.name }}</span>
        </template>
      </div>
    </div>

    <div class="lip-tabs">
      <button class="lip-tab" :class="{ on: activeTab === 'query' }" @click="activeTab = 'query'">
        <el-icon><Search /></el-icon> Query
      </button>
      <button class="lip-tab" :class="{ on: activeTab === 'decompose' }" @click="activeTab = 'decompose'">
        <el-icon><Scissor /></el-icon> Decompose
      </button>
      <button class="lip-tab" :class="{ on: activeTab === 'index' }" @click="activeTab = 'index'">
        <el-icon><Files /></el-icon> Index
      </button>
      <button class="lip-tab" :class="{ on: activeTab === 'history' }" @click="activeTab = 'history'">
        <el-icon><Clock /></el-icon> History
      </button>
    </div>

    <div class="lip-body">
      <KeepAlive>
        <div v-if="activeTab === 'query'" class="lip-tab-body">
          <div class="lip-tab-header">
            <h4>Retrieval Query Settings</h4>
            <span class="lip-tab-sub">Tune how queries are decomposed, embedded, and retrieved.</span>
          </div>
          <div class="lip-query-row">
            <div class="lip-qrow-label">Chat mode</div>
            <el-select :model-value="s.ragChatMode || 'condense_plus_context'" size="small" style="width: 220px" @update:model-value="(v:any) => s.ragChatMode = v">
              <el-option label="Condense + Context" value="condense_plus_context" />
              <el-option label="Context only" value="context_only" />
              <el-option label="Condense only" value="condense_only" />
              <el-option label="Plain (no context)" value="plain" />
            </el-select>
          </div>
          <div class="lip-query-row">
            <div class="lip-qrow-label">Hybrid (BM25 + vector)</div>
            <el-switch :model-value="!!s.ragHybrid" size="small" @update:model-value="v => s.ragHybrid = v as boolean" />
          </div>
          <div class="lip-query-row">
            <div class="lip-qrow-label">Rerank</div>
            <el-switch :model-value="!!s.ragRerank" size="small" @update:model-value="v => s.ragRerank = v as boolean" />
          </div>
          <div class="lip-query-row">
            <div class="lip-qrow-label">Citations injection</div>
            <el-switch :model-value="!!s.ragCitations" size="small" @update:model-value="v => s.ragCitations = v as boolean" />
          </div>
          <div class="lip-query-row">
            <div class="lip-qrow-label">HyDE (hypothetical doc)</div>
            <el-switch :model-value="!!s.ragHyde" size="small" @update:model-value="v => s.ragHyde = v as boolean" />
          </div>
          <div class="lip-query-row">
            <div class="lip-qrow-label">Multi-queries</div>
            <el-input-number :model-value="s.ragNumQueries || 0" :min="0" :max="10" size="small" controls-position="right" @update:model-value="(v:any) => s.ragNumQueries = v as number" />
          </div>
          <div class="lip-query-row">
            <div class="lip-qrow-label">Scope filter</div>
            <el-input :model-value="s.ragScope || ''" size="small" style="width: 320px" placeholder="(all knowledge base)" clearable @update:model-value="(v:any) => store.setRagScopeFromNode?.(v as string,false)" />
          </div>
        </div>

        <div v-else-if="activeTab === 'decompose'" class="lip-tab-body">
          <div class="lip-tab-header">
            <h4>Query Decompose</h4>
            <span class="lip-tab-sub">See how the last multi-turn question was split into retrievals.</span>
          </div>
          <div v-if="!s.messages?.length" class="lip-empty">No messages yet — ask a RAG question first.</div>
          <template v-else>
            <div
              v-for="(m, i) in recentPetMessages"
              :key="`dm-${i}`"
              class="lip-decompose-card"
            >
              <div class="lip-dc-header">
                <span class="lip-dc-role">Answer</span>
                <span class="lip-dc-id">#{{ recentPetMessages.length - i }}</span>
              </div>
              <div v-if="m.sources?.length" class="lip-dc-queries">
                <div v-for="(src, j) in m.sources.slice(0, 5)" :key="j" class="lip-dc-sr">
                  <span class="lip-dc-sr-title">{{ src.metadata?.title || src.path || '—' }}</span>
                  <span v-if="src.score != null" class="lip-dc-sr-score">{{ src.score.toFixed(3) }}</span>
                </div>
              </div>
              <div v-else class="lip-dc-sr-empty">No knowledge retrieval recorded on this turn.</div>
              <div v-if="m.ragContentSummary" class="lip-dc-summary">
                <span class="lip-dc-summary-label">RAG summary</span>
                <p>{{ m.ragContentSummary }}</p>
              </div>
              <div v-if="m.searchResults?.length" class="lip-dc-summary lip-dc-summary--web">
                <span class="lip-dc-summary-label">Web grounding</span>
                <p>{{ m.searchResults.length }} web sources{{ m.searchQuery ? ` · ${m.searchQuery}` : '' }}</p>
              </div>
              <div v-if="m.retrievalGrade" class="lip-dc-grade">
                <span class="lip-dc-grade-label">Retrieval grade</span>
                <span class="lip-dc-grade-chip" :class="`grade-${m.retrievalGrade}`">{{ m.retrievalGrade }}</span>
              </div>
              <div class="lip-dc-actions">
                <el-button
                  v-if="m.sources?.length"
                  size="small"
                  text
                  type="primary"
                  @click="preview(topSourcePath(m))"
                >Preview top source</el-button>
                <el-button
                  v-if="m.sources?.length || m.searchQuery"
                  size="small"
                  text
                  @click="previewQuestionSources(m)"
                >Preview retrieval</el-button>
              </div>
            </div>
          </template>
        </div>

        <div v-else-if="activeTab === 'index'" class="lip-tab-body">
          <div class="lip-tab-header">
            <h4>Index Overview</h4>
            <span class="lip-tab-sub">Chunks, documents, and coverage gaps.</span>
          </div>
          <div class="lip-index-grid">
            <div class="lip-index-card">
              <el-icon :size="22" :color="ragStats.built ? '#22c55e' : '#eab308'"><DataLine /></el-icon>
              <div class="lip-ix-title">Status</div>
              <div class="lip-ix-value" :class="{ on: ragStats.built }">{{ ragStats.built ? 'Built' : 'Not built' }}</div>
            </div>
            <div class="lip-index-card">
              <el-icon :size="22"><Files /></el-icon>
              <div class="lip-ix-title">Documents</div>
              <div class="lip-ix-value">{{ ragStats.numDocs }}</div>
            </div>
            <div class="lip-index-card">
              <el-icon :size="22"><Clock /></el-icon>
              <div class="lip-ix-title">Last build</div>
              <div class="lip-ix-value" style="font-size:12px">{{ ragStats.lastBuiltAt?.slice(0, 16) || '—' }}</div>
            </div>
            <div class="lip-index-card">
              <el-icon :size="22"><Search /></el-icon>
              <div class="lip-ix-title">Coverage in session</div>
              <div class="lip-ix-value">{{ contextFiles.length }} / {{ ragStats.numDocs || '?' }}</div>
            </div>
          </div>
          <div class="lip-index-files">
            <div class="lip-ix-files-title">Files in current session context</div>
            <div v-if="!contextFiles.length" class="lip-empty">No context files.</div>
            <div v-else class="lip-ix-list">
              <div
                v-for="f in contextFiles"
                :key="f.path"
                class="lip-ix-file"
                :title="f.path"
                @click="preview(f.path)"
              >
                <span class="lip-ix-file-name">{{ f.name }}</span>
                <span class="lip-ix-file-dir">{{ f.dir }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'history'" class="lip-tab-body">
          <div class="lip-tab-header">
            <h4>Retrieval History</h4>
            <span class="lip-tab-sub">Each turn's retrieval grade and grounded-sources.</span>
          </div>
          <div v-if="!s.messages?.length" class="lip-empty">No messages yet.</div>
          <el-table v-else :data="s.messages.slice().reverse()" size="small" max-height="380" class="lip-history-table">
            <el-table-column label="T" width="40">
              <template #default="{ $index }">{{ s.messages.length - $index }}</template>
            </el-table-column>
            <el-table-column label="Role" width="80">
              <template #default="{ row }">
                <el-tag size="small" :type="row.type === 'user' ? '' : 'success'" effect="plain">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Snippet" min-width="240">
              <template #default="{ row }">
                <div class="lip-snippet">{{ (row.content || '').slice(0, 140) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="KB" width="72">
              <template #default="{ row }">
                <span class="lip-hits">{{ row.sources?.length || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Web" width="72">
              <template #default="{ row }">
                <span class="lip-hits">{{ row.searchResults?.length || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Grade" width="90">
              <template #default="{ row }">
                <el-tag v-if="row.retrievalGrade" size="small" :class="`lip-grade-${row.retrievalGrade}`">{{ row.retrievalGrade }}</el-tag>
                <span v-else class="lip-empty-grade">—</span>
              </template>
            </el-table-column>
            <el-table-column label="Top Source" min-width="180">
              <template #default="{ row }">
                <span v-if="row.sources?.length" class="lip-top-source" :title="topSourceLabel(row)">{{ topSourceLabel(row) }}</span>
                <span v-else class="lip-empty-grade">—</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </KeepAlive>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.lip-dialog :deep(.el-dialog__body) {
  padding-top: 8px;
  padding-bottom: 4px;
}
.lip-ctx {
  padding: 12px 16px;
  margin-bottom: 14px;
  background: rgba(var(--primary-rgb,99,102,241),.04);
  border: 1px solid rgba(var(--primary-rgb,99,102,241),.15);
  border-radius: 10px;
  transition: all .2s;
}
.lip-ctx--on {
  background: rgba(var(--primary-rgb,99,102,241),.1);
  border-color: rgba(var(--primary-rgb,99,102,241),.3);
}
.lip-ctx-top {
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
}
.lip-ctx-icon { font-size: 16px; }
.lip-ctx-n { font-size: 13px; font-weight: 600; color: var(--text-primary,#f5f3ff); }
.lip-ctx-scope {
  padding: 1px 8px; font-family: 'SF Mono', Menlo, monospace;
  font-size: 11px; color: var(--primary-light,#818cf8);
  background: rgba(var(--primary-rgb,99,102,241),.15); border-radius: 3px;
}
.lip-ctx-empty-tag { font-size: 12px; color: var(--text-secondary,#d4d0e8); opacity: .6; }
.lip-ctx-stats {
  margin-left: auto; display: flex; gap: 14px; align-items: center;
}
.lip-stat {
  display: flex; flex-direction: column; align-items: flex-end;
}
.lip-stat-label {
  font-size: 10px; color: var(--text-secondary,#d4d0e8); opacity: .7; text-transform: uppercase; letter-spacing: .04em;
}
.lip-stat-value {
  font-family: 'SF Mono', monospace; font-size: 13px; font-weight: 700; color: var(--text-primary,#f5f3ff);
}
.lip-ctx-list {
  display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: baseline;
  margin-top: 10px;
}
.lip-ctx-dir {
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 11px; color: var(--text-secondary,#d4d0e8); opacity: .8;
}
.lip-ctx-file {
  padding: 2px 8px; font-size: 12px; font-weight: 500;
  color: var(--primary-light,#818cf8); cursor: pointer;
  background: rgba(var(--primary-rgb,99,102,241),.1); border-radius: 4px;
  transition: all .1s;
  &:hover { color: #fff; background: var(--primary,#6366f1); }
}
.lip-tabs {
  display: flex; gap: 0; margin-bottom: 18px;
  border-bottom: 2px solid rgba(var(--primary-rgb,99,102,241),.15);
}
.lip-tab {
  display: inline-flex; gap: 6px; align-items: center;
  padding: 8px 22px; margin-bottom: -2px;
  font-size: 13px; font-weight: 500;
  color: var(--text-secondary,#d4d0e8); cursor: pointer;
  background: none; border: none;
  border-bottom: 2px solid transparent;
  transition: all .15s;
  &:hover { color: var(--text-primary,#f5f3ff); }
  &.on { color: var(--primary-light,#818cf8); border-bottom-color: var(--primary-light,#818cf8); }
}
.lip-body { min-height: 340px; }
.lip-tab-body { display: flex; flex-direction: column; gap: 8px; }
.lip-tab-header {
  padding: 4px 2px 8px;
  h4 { margin: 0 0 2px; font-size: 14px; color: var(--text-primary,#f5f3ff); font-weight: 600; }
}
.lip-tab-sub {
  font-size: 12px; color: var(--text-secondary,#d4d0e8); opacity: .75;
}
.lip-empty {
  padding: 32px 8px; text-align: center;
  color: var(--text-secondary,#d4d0e8); font-style: italic;
}
.lip-query-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 4px;
  border-top: 1px dashed rgba(var(--primary-rgb,99,102,241),.1);
  &:first-of-type { border-top: 0; }
}
.lip-qrow-label {
  font-size: 12px; color: var(--text-secondary,#d4d0e8); font-weight: 500;
}
.lip-decompose-card {
  padding: 10px 12px; margin-bottom: 8px;
  border: 1px solid rgba(var(--primary-rgb,99,102,241),.15);
  border-radius: 8px;
  background: rgba(var(--primary-rgb,99,102,241),.04);
}
.lip-dc-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
}
.lip-dc-role {
  padding: 1px 8px; font-size: 11px; font-weight: 600;
  color: #fff; background: var(--primary,#6366f1); border-radius: 4px;
}
.lip-dc-id {
  font-family: 'SF Mono', monospace; font-size: 11px;
  color: var(--text-secondary,#d4d0e8); opacity: .7;
}
.lip-dc-sr {
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 6px;
  border-top: 1px dashed rgba(var(--primary-rgb,99,102,241),.1);
  &:first-of-type { border-top: 0; }
}
.lip-dc-sr-title {
  font-size: 12px; color: var(--text-primary,#f5f3ff);
  font-family: 'SF Mono', monospace;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  flex: 1; min-width: 0;
}
.lip-dc-sr-score {
  margin-left: 10px;
  font-family: 'SF Mono', monospace; font-size: 11px;
  color: var(--primary-light,#818cf8);
  background: rgba(var(--primary-rgb,99,102,241),.1); padding: 1px 6px; border-radius: 3px;
}
.lip-dc-sr-empty {
  font-size: 12px; color: var(--text-secondary,#d4d0e8); opacity: .6; padding: 4px 0;
}
.lip-dc-summary {
  margin-top: 8px; padding-top: 6px;
  border-top: 1px dashed rgba(var(--primary-rgb,99,102,241),.1);
  p { margin: 4px 0 0; font-size: 12px; line-height: 1.6; color: var(--text-primary,#f5f3ff); white-space: pre-wrap; }
}
.lip-dc-summary--web .lip-dc-summary-label { color: #38bdf8; }
.lip-dc-summary-label {
  font-size: 10px; color: var(--primary-light,#818cf8); text-transform: uppercase; letter-spacing: .04em;
}
.lip-dc-grade { margin-top: 6px; display: flex; align-items: center; gap: 6px; }
.lip-dc-grade-label { font-size: 10px; color: var(--text-secondary,#d4d0e8); text-transform: uppercase; letter-spacing: .04em; }
.lip-dc-grade-chip {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 22px;
  font-family: 'SF Mono', monospace; font-size: 13px; font-weight: 800;
  border-radius: 4px; color: #fff;
  &.grade-A { background: #22c55e; }
  &.grade-B { background: #3b82f6; }
  &.grade-C { background: #eab308; color: #141228; }
  &.grade-D { background: #ef4444; }
}
.lip-dc-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.lip-index-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  margin-bottom: 14px;
}
.lip-index-card {
  padding: 12px; border-radius: 8px;
  background: rgba(var(--primary-rgb,99,102,241),.05);
  border: 1px solid rgba(var(--primary-rgb,99,102,241),.15);
  display: flex; flex-direction: column; gap: 4px; align-items: flex-start;
}
.lip-ix-title {
  font-size: 10px; color: var(--text-secondary,#d4d0e8); text-transform: uppercase; letter-spacing: .04em;
}
.lip-ix-value {
  font-family: 'SF Mono', monospace; font-size: 15px; font-weight: 700;
  color: var(--text-primary,#f5f3ff);
  &.on { color: #22c55e; }
}
.lip-index-files {
  padding: 10px 0;
  border-top: 1px solid rgba(var(--primary-rgb,99,102,241),.1);
}
.lip-ix-files-title {
  font-size: 11px; color: var(--text-secondary,#d4d0e8);
  text-transform: uppercase; letter-spacing: .04em; margin-bottom: 8px;
}
.lip-ix-list {
  display: flex; flex-direction: column; gap: 2px;
  max-height: 180px; overflow-y: auto;
}
.lip-ix-file {
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 8px; cursor: pointer; border-radius: 4px;
  &:hover { background: rgba(var(--primary-rgb,99,102,241),.08); }
}
.lip-ix-file-name {
  font-size: 12px; color: var(--text-primary,#f5f3ff);
  font-family: 'SF Mono', monospace;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%;
}
.lip-ix-file-dir {
  font-size: 11px; color: var(--text-secondary,#d4d0e8); opacity: .7;
  font-family: 'SF Mono', monospace;
  max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.lip-history-table :deep(.el-table__body tr:hover > td.el-table__cell) {
  background: rgba(var(--primary-rgb,99,102,241),.06);
}
.lip-snippet {
  font-size: 12px; color: var(--text-primary,#f5f3ff);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lip-hits {
  font-family: 'SF Mono', monospace; font-size: 12px; font-weight: 700; color: var(--primary-light,#818cf8);
}
.lip-top-source {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--text-primary,#f5f3ff);
}
.lip-empty-grade { color: var(--text-secondary,#d4d0e8); opacity: .5; }
.lip-img-n { font-size: 12px; }
.lip-grade-A { --el-tag-bg-color: rgba(34,197,94,.12); --el-tag-border-color: rgba(34,197,94,.3); --el-tag-text-color: #22c55e; }
.lip-grade-B { --el-tag-bg-color: rgba(59,130,246,.12); --el-tag-border-color: rgba(59,130,246,.3); --el-tag-text-color: #3b82f6; }
.lip-grade-C { --el-tag-bg-color: rgba(234,179,8,.12); --el-tag-border-color: rgba(234,179,8,.3); --el-tag-text-color: #eab308; }
.lip-grade-D { --el-tag-bg-color: rgba(239,68,68,.12); --el-tag-border-color: rgba(239,68,68,.3); --el-tag-text-color: #ef4444; }
</style>
<style lang="scss">
.lip-dialog,
.el-overlay:has(+ .lip-dialog) {
  z-index: 2147483647 !important;
}
.lip-dialog .el-dialog {
  background: var(--bg-elevated,rgba(20,18,40,0.98));
  border: 1px solid rgba(var(--primary-rgb,99,102,241),.25);
  color: var(--text-primary,#f5f3ff);
}
.lip-dialog .el-dialog__title { color: var(--text-primary,#f5f3ff); font-weight: 600; }
.lip-dialog .el-dialog__headerbtn .el-dialog__close { color: var(--text-secondary,#d4d0e8); }
</style>
