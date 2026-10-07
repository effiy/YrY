<script setup lang="ts">
/**
 * YiPet Chat — LlamaIndexPanel (RAG Console)
 *
 * Ported from YiVad aiChat's LlamaIndexPanel, adapted for YiPet's
 * floating window. 4-tab console: Query, Decompose, Index, History.
 */
import { ref, computed, onMounted } from 'vue';
import { Search, Files, Scissor, Clock } from '@element-plus/icons-vue';
import { useChatStore } from '../../stores/chat';
import { getRag, getKnowledge } from '../../stores/services';
import { marked } from 'marked';
import type { RagSource, RagQueryResponse, RagHistoryRecord } from '@/api/types';
import RagQueryTab from './RagQueryTab.vue';
import RagDecomposeTab from './RagDecomposeTab.vue';
import RagIndexTab from './RagIndexTab.vue';
import RagHistoryTab from './RagHistoryTab.vue';

const store = useChatStore();
const s = store.state;

const props = withDefaults(defineProps<{ scopeTitle?: string }>(), { scopeTitle: '' });
const emit = defineEmits<{ (e: 'close'): void }>();

// ── Context files (from ctx: tags) ──
const CTX_PREFIX = 'ctx:';
const scopeFiles = computed(() => {
  const tags = s.sessions.find(x => x.id === s.currentSessionId)?.tags ?? [];
  return tags.filter(t => typeof t === 'string' && t.startsWith(CTX_PREFIX)).map(t => (t as string).slice(CTX_PREFIX.length));
});
const derivedScope = computed(() => {
  if (!scopeFiles.value.length) return '';
  if (scopeFiles.value.length === 1) return scopeFiles.value[0];
  const parts = scopeFiles.value.map(p => p.split('/'));
  const minLen = Math.min(...parts.map(p => p.length));
  const c: string[] = [];
  for (let i = 0; i < minLen; i++) {
    if (parts.every(p => p[i] === parts[0][i])) c.push(parts[0][i]);
    else break;
  }
  return c.join('/') || '';
});

// ── Tabs ──
type Tab = 'query' | 'decompose' | 'index' | 'history';
const activeTab = ref<Tab>('query');
const queryTabRef = ref<InstanceType<typeof RagQueryTab> | null>(null);

function handleSwitchToQuery(question: string) {
  activeTab.value = 'query';
  queryTabRef.value?.setQuestion(question);
}

// ── File preview dialog ──
const fp = ref({ visible: false, title: '', loading: false, html: '' });

async function previewFile(path: string) {
  fp.value = { visible: true, title: path.split('/').pop() || path, loading: true, html: '' };
  try {
    const knowledge = getKnowledge();
    const res = await knowledge.read(path);
    if (res.ok && res.data) {
      fp.value.html = marked((res.data as { content?: string }).content || '') as string;
    } else {
      fp.value.html = '<p style="color:var(--el-color-danger)">Failed to load.</p>';
    }
  } catch {
    fp.value.html = '<p style="color:var(--el-color-danger)">Failed to load.</p>';
  } finally {
    fp.value.loading = false;
  }
}

onMounted(() => {
  if (s.ragEnabled && !s.ragStatus) store.loadRagStatus?.();
});
</script>

<template>
  <el-dialog
    :model-value="true"
    :title="props.scopeTitle ? `RAG — ${props.scopeTitle}` : s.ragScope ? `RAG — ${s.ragScope.split('/').pop()}` : 'RAG Console'"
    width="820px"
    top="2vh"
    append-to-body
    :close-on-click-modal="false"
    @close="emit('close')"
  >
    <!-- Context bar -->
    <div class="rc-ctx" :class="{ 'rc-ctx--on': scopeFiles.length > 0 }">
      <div class="rc-ctx-top">
        <span class="rc-ctx-n">{{ scopeFiles.length }} context file(s)</span>
        <code v-if="derivedScope" class="rc-ctx-scope">{{ derivedScope }}</code>
        <span v-else class="rc-ctx-empty-tag">No context files attached</span>
      </div>
      <div v-if="scopeFiles.length" class="rc-ctx-list">
        <span v-for="f in scopeFiles" :key="f" class="rc-ctx-file" @click="previewFile(f)" :title="f">
          {{ f.split('/').pop() }}
        </span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="rc-tabs">
      <button class="rc-tab" :class="{ on: activeTab === 'query' }" @click="activeTab = 'query'">
        <el-icon><Search /></el-icon> Query
      </button>
      <button class="rc-tab" :class="{ on: activeTab === 'decompose' }" @click="activeTab = 'decompose'">
        <el-icon><Scissor /></el-icon> Decompose
      </button>
      <button class="rc-tab" :class="{ on: activeTab === 'index' }" @click="activeTab = 'index'">
        <el-icon><Files /></el-icon> Index
      </button>
      <button class="rc-tab" :class="{ on: activeTab === 'history' }" @click="activeTab = 'history'">
        <el-icon><Clock /></el-icon> History
      </button>
    </div>

    <!-- Tab panels -->
    <KeepAlive>
      <RagQueryTab
        v-if="activeTab === 'query'"
        ref="queryTabRef"
        :scope-files="scopeFiles"
        :derived-scope="derivedScope"
        @open-file="previewFile"
      />
      <RagDecomposeTab
        v-else-if="activeTab === 'decompose'"
        :scope-files="scopeFiles"
        :derived-scope="derivedScope"
        @open-file="previewFile"
        @switch-to-query="handleSwitchToQuery"
      />
      <RagIndexTab
        v-else-if="activeTab === 'index'"
        :scope-files="scopeFiles"
        :derived-scope="derivedScope"
        @open-file="previewFile"
      />
      <RagHistoryTab v-else @open-file="previewFile" />
    </KeepAlive>

    <!-- File preview dialog -->
    <el-dialog v-model="fp.visible" :title="fp.title" width="700px" top="5vh" append-to-body :close-on-click-modal="true">
      <div v-if="fp.loading" class="rc-fp-loading">Loading...</div>
      <div v-else class="rc-fp-body" v-html="fp.html" />
    </el-dialog>
  </el-dialog>
</template>

<style scoped lang="scss">
@use "./styles/panel.scss";
</style>