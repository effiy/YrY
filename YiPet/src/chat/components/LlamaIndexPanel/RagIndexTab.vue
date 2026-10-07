<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Refresh, Cpu, Files, Search, DataAnalysis } from '@element-plus/icons-vue';
import { getRag } from '../../stores/services';
import { useChatStore } from '../../stores/chat';

const store = useChatStore();
const s = store.state;

const props = withDefaults(
  defineProps<{ scopeFiles?: string[]; derivedScope?: string }>(),
  { scopeFiles: () => [], derivedScope: '' }
);
const emit = defineEmits<{ (e: 'open-file', path: string): void }>();

const building = ref(false);

async function loadStatus() {
  try {
    const rag = getRag();
    s.ragStatus = await rag.status();
  } catch { /* ignore */ }
}

async function doRebuild() {
  building.value = true;
  try {
    const rag = getRag();
    await rag.build();
    await loadStatus();
  } finally {
    building.value = false;
  }
}

let _timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => { if (!s.ragStatus?.built) loadStatus(); _timer = setInterval(loadStatus, 30_000); });
onUnmounted(() => { if (_timer) clearInterval(_timer); });

const status = computed(() => s.ragStatus);
const config = computed(() => s.ragStatus?.config);

const scopeFileInfos = computed(() =>
  props.scopeFiles.map(p => {
    const parts = p.split('/');
    return { path: p, name: parts.pop() || p, dir: parts.join('/') || 'root' };
  })
);

const scopeFileFilter = ref('');
const filteredFiles = computed(() => {
  const q = scopeFileFilter.value.trim().toLowerCase();
  return q ? scopeFileInfos.value.filter(f => f.path.toLowerCase().includes(q)) : scopeFileInfos.value;
});

function freshness(iso?: string) {
  if (!iso) return null;
  const age = Date.now() - new Date(iso).getTime();
  const min = Math.floor(age / 60000);
  if (min < 60) return { label: 'Fresh', age: `${min}m ago`, color: 'var(--el-color-success)' };
  const hr = Math.floor(min / 60);
  if (hr < 24) return { label: 'Recent', age: `${hr}h ago`, color: 'var(--el-color-primary)' };
  return { label: 'Stale', age: `${Math.floor(hr / 24)}d ago`, color: 'var(--el-color-warning)' };
}
</script>

<template>
  <div class="rc-body">
    <!-- Index status bar -->
    <div class="rc-ix-bar">
      <div class="rc-ix-stat">
        <span class="rc-ix-n">{{ scopeFiles.length }}</span>
        <span class="rc-ix-lbl">files in scope</span>
      </div>
      <div class="rc-ix-stat">
        <span class="rc-ix-n" :style="{ color: status?.built ? 'var(--el-color-success)' : 'var(--el-color-warning)' }">
          {{ status?.built ? 'Ready' : 'N/A' }}
        </span>
        <span class="rc-ix-lbl">index status</span>
      </div>
      <div v-if="status?.num_docs" class="rc-ix-stat">
        <span class="rc-ix-n">{{ status.num_docs }}</span>
        <span class="rc-ix-lbl">chunks</span>
      </div>
      <div v-if="freshness(status?.last_built_at)" class="rc-ix-stat">
        <span class="rc-ix-n rc-ix-fresh" :style="{ color: freshness(status?.last_built_at)!.color, borderColor: freshness(status?.last_built_at)!.color }">
          {{ freshness(status?.last_built_at)!.label }} · {{ freshness(status?.last_built_at)!.age }}
        </span>
        <span class="rc-ix-lbl">freshness</span>
      </div>
      <div v-if="status?.persist_dir_size != null" class="rc-ix-stat">
        <span class="rc-ix-n">{{ status.persist_dir_size < 1048576 ? (status.persist_dir_size / 1024).toFixed(0) + ' KB' : (status.persist_dir_size / 1048576).toFixed(1) + ' MB' }}</span>
        <span class="rc-ix-lbl">index size</span>
      </div>
      <div class="rc-ix-acts">
        <el-button size="small" :icon="Refresh" @click="loadStatus" />
        <el-button size="small" type="primary" :icon="Cpu" :loading="building" @click="doRebuild">
          {{ building ? 'Building...' : 'Rebuild' }}
        </el-button>
      </div>
    </div>

    <!-- Pipeline diagram -->
    <div v-if="config" class="rc-pipeline">
      <div class="rc-pipe-node">
        <span class="rc-pipe-stage">1 · Embed</span>
        <code class="rc-pipe-cfg">{{ config.embed_model }}</code>
      </div>
      <span class="rc-pipe-arrow">→</span>
      <div class="rc-pipe-node">
        <span class="rc-pipe-stage">2 · Store</span>
        <code class="rc-pipe-cfg">{{ status?.num_docs || 0 }} chunks</code>
      </div>
      <span class="rc-pipe-arrow">{{ config.hybrid_retrieval ? '⤵ hybrid' : '→' }}</span>
      <div class="rc-pipe-node" :class="{ on: config.hybrid_retrieval }">
        <span class="rc-pipe-stage">3 · Retrieve</span>
        <code class="rc-pipe-cfg">top_k={{ config.top_k }}</code>
      </div>
      <span class="rc-pipe-arrow">{{ config.rerank_enabled ? '⤵ rerank' : '→' }}</span>
      <div class="rc-pipe-node" :class="{ on: config.rerank_enabled }">
        <span class="rc-pipe-stage">4 · Postprocess</span>
        <code class="rc-pipe-cfg">{{ config.rerank_enabled ? 'LLMRerank' : 'passthrough' }}</code>
      </div>
      <span class="rc-pipe-arrow">→</span>
      <div class="rc-pipe-node">
        <span class="rc-pipe-stage">5 · Synthesize</span>
        <code class="rc-pipe-cfg">{{ config.llm_model }}</code>
      </div>
    </div>

    <!-- Config grid -->
    <div v-if="config" class="rc-cfg">
      <div class="rc-cfg-hd">
        <el-icon :size="14"><DataAnalysis /></el-icon><span>llama_index config</span>
      </div>
      <div class="rc-cfg-grid">
        <div class="rc-cfg-cell"><span class="rc-cfg-k">embed</span><code>{{ config.embed_model }}</code></div>
        <div class="rc-cfg-cell"><span class="rc-cfg-k">llm</span><code>{{ config.llm_model }}</code></div>
        <div class="rc-cfg-cell"><span class="rc-cfg-k">chunk</span><code>{{ config.chunk_size }}/{{ config.chunk_overlap }}</code></div>
        <div class="rc-cfg-cell"><span class="rc-cfg-k">top-k</span><code>{{ config.top_k }}</code></div>
        <div class="rc-cfg-cell" :class="{ on: config.hybrid_retrieval }"><span class="rc-cfg-k">hybrid</span><span class="rc-cfg-v">{{ config.hybrid_retrieval ? 'on' : 'off' }}</span></div>
        <div class="rc-cfg-cell" :class="{ on: config.rerank_enabled }"><span class="rc-cfg-k">rerank</span><span class="rc-cfg-v">{{ config.rerank_enabled ? 'on' : 'off' }}</span></div>
        <div class="rc-cfg-cell" :class="{ on: config.inline_citations }"><span class="rc-cfg-k">citations</span><span class="rc-cfg-v">{{ config.inline_citations ? 'on' : 'off' }}</span></div>
        <div class="rc-cfg-cell" :class="{ on: config.auto_rebuild }"><span class="rc-cfg-k">auto-build</span><span class="rc-cfg-v">{{ config.auto_rebuild ? 'on' : 'off' }}</span></div>
      </div>
      <div v-if="status?.num_docs" class="rc-cfg-foot">
        <span class="rc-cfg-docs">{{ status.num_docs }} chunks indexed</span>
        <span v-if="status.last_built_at" class="rc-cfg-built">built {{ status.last_built_at }}</span>
      </div>
    </div>

    <!-- Scope file list -->
    <div v-if="scopeFiles.length" class="rc-ix-list">
      <div v-if="scopeFileInfos.length > 6" class="rc-ix-list-filter">
        <el-input v-model="scopeFileFilter" size="small" clearable placeholder="Filter..." :prefix-icon="Search" />
        <span class="rc-ix-list-count">{{ filteredFiles.length }}/{{ scopeFileInfos.length }}</span>
      </div>
      <div v-for="f in filteredFiles" :key="f.path" class="rc-ix-file" @click="emit('open-file', f.path)">
        <span class="rc-ix-file-icon">📄</span>
        <div class="rc-ix-file-info">
          <span class="rc-ix-file-name">{{ f.name }}</span>
          <span class="rc-ix-file-path">{{ f.dir }}/</span>
        </div>
      </div>
    </div>
    <div v-else class="rc-empty">
      <el-icon :size="40"><Files /></el-icon>
      <span>No context files attached</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rc-body { min-height: 200px; }
.rc-ix-bar { display: flex; flex-wrap: wrap; gap: 20px; align-items: center; padding: 12px 16px; margin-bottom: 18px; background: var(--el-fill-color-lighter); border-radius: 10px; }
.rc-ix-stat { display: flex; flex-direction: column; gap: 2px; }
.rc-ix-n { font-family: 'SF Mono', monospace; font-size: 18px; font-weight: 700; color: var(--el-text-color-primary); }
.rc-ix-fresh { padding: 1px 6px; font-size: 12px; border: 1px solid currentColor; border-radius: 4px; font-variant-numeric: tabular-nums; }
.rc-ix-lbl { font-size: 10px; color: var(--el-text-color-placeholder); text-transform: uppercase; }
.rc-ix-acts { display: flex; gap: 6px; margin-left: auto; }
.rc-pipeline { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; padding: 10px 14px; margin-bottom: 14px; overflow-x: auto; background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 10px; }
.rc-pipe-node { display: flex; flex-direction: column; gap: 2px; min-width: 70px; padding: 6px 8px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-light); border-radius: 6px; &.on { background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-5); } }
.rc-pipe-stage { font-family: 'SF Mono', monospace; font-size: 9px; font-weight: 700; color: var(--el-text-color-placeholder); text-transform: uppercase; }
.rc-pipe-cfg { max-width: 120px; overflow: hidden; text-overflow: ellipsis; font-family: 'SF Mono', monospace; font-size: 11px; color: var(--el-text-color-primary); white-space: nowrap; }
.rc-pipe-arrow { font-family: 'SF Mono', monospace; font-size: 14px; color: var(--el-text-color-placeholder); }
.rc-cfg { padding: 14px 16px; margin-bottom: 14px; background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 10px; }
.rc-cfg-hd { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); }
.rc-cfg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; }
.rc-cfg-cell { display: flex; gap: 6px; align-items: center; padding: 4px 10px; background: var(--el-bg-color); border-radius: 6px; code { font-family: 'SF Mono', monospace; font-size: 12px; color: var(--el-text-color-primary); } &.on { background: var(--el-color-primary-light-9); } }
.rc-cfg-k { font-size: 10px; font-weight: 600; color: var(--el-text-color-placeholder); text-transform: uppercase; }
.rc-cfg-v { font-family: 'SF Mono', monospace; font-size: 12px; color: var(--el-color-primary); }
.rc-cfg-foot { display: flex; gap: 12px; margin-top: 10px; font-size: 11px; color: var(--el-text-color-placeholder); }
.rc-cfg-docs { font-weight: 500; color: var(--el-text-color-secondary); }
.rc-ix-list-filter { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.rc-ix-list-count { font-family: 'SF Mono', monospace; font-size: 11px; color: var(--el-text-color-placeholder); }
.rc-ix-file { display: flex; gap: 10px; align-items: center; padding: 8px 12px; cursor: pointer; border-radius: 6px; transition: background .12s; &:hover { background: var(--el-fill-color-light); } }
.rc-ix-file-icon { flex-shrink: 0; font-size: 18px; }
.rc-ix-file-info { display: flex; flex: 1; flex-direction: column; gap: 1px; min-width: 0; }
.rc-ix-file-name { overflow: hidden; text-overflow: ellipsis; font-size: 13px; font-weight: 500; color: var(--el-text-color-primary); white-space: nowrap; }
.rc-ix-file-path { overflow: hidden; text-overflow: ellipsis; font-family: 'SF Mono', monospace; font-size: 11px; color: var(--el-text-color-placeholder); white-space: nowrap; }
.rc-empty { display: flex; flex-direction: column; gap: 8px; align-items: center; padding: 48px 0; font-size: 14px; color: var(--el-text-color-placeholder); }
</style>