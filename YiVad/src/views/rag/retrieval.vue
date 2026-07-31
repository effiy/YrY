<template>
  <div class="rag-retrieval">
    <header class="rag-retrieval__header">
      <div>
        <h1>Retrieval Explorer</h1>
        <p>One-shot semantic search over the YiKnowledge index. No LLM generation — inspect what the retriever returns.</p>
      </div>
    </header>

    <!-- Query Controls -->
    <el-card shadow="hover" class="rag-retrieval__query">
      <div class="query-form">
        <el-input
          v-model="question"
          type="textarea"
          :rows="2"
          placeholder="Enter a query to retrieve semantically similar chunks from the knowledge base…"
          @keyup.enter.ctrl="runQuery"
          class="query-input"
        />
        <div class="query-controls">
          <div class="query-params">
            <span class="param-label">Top-K</span>
            <el-input-number v-model="topK" :min="1" :max="50" size="small" controls-position="right" />
            <span class="param-label">Scope</span>
            <el-input
              v-model="scope"
              placeholder="e.g. projects/YiVad"
              size="small"
              clearable
              style="width: 180px"
            />
          </div>
          <div class="query-actions">
            <el-button type="primary" :loading="querying" @click="runQuery" :disabled="!question.trim()">
              <el-icon><Search /></el-icon> {{ querying ? "Retrieving…" : "Retrieve" }}
            </el-button>
            <el-button text @click="clearQuery" :disabled="!sources.length && !lastError">Clear</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Error -->
    <el-alert v-if="lastError" :title="lastError" type="error" show-icon closable @close="lastError = ''" class="rag-retrieval__alert" />

    <!-- Results Table -->
    <el-card v-if="sources.length" shadow="hover" class="rag-retrieval__results">
      <template #header>
        <div class="results-header">
          <span><el-icon><List /></el-icon> Retrieved Chunks ({{ sources.length }})</span>
          <span class="results-summary">
            Best: <strong>{{ scoreLabel(bestScore) }}</strong>
            &nbsp;|&nbsp; Avg: <strong>{{ scoreLabel(avgScore) }}</strong>
            &nbsp;|&nbsp; Latency: <strong>{{ lastLatency }}ms</strong>
          </span>
        </div>
      </template>

      <el-table
        :data="sources"
        stripe
        highlight-current-row
        @row-click="showDetail"
        style="cursor: pointer"
        size="small"
        :default-sort="{ prop: 'score', order: 'descending' }"
      >
        <el-table-column type="index" label="#" width="50" align="center" sortable />
        <el-table-column label="Relevance" width="140" align="center" sortable prop="score">
          <template #default="{ row }">
            <div class="score-col">
              <el-progress
                :percentage="scorePercent(row.score)"
                :stroke-width="8"
                :color="scoreColor(row.score)"
                :show-text="false"
              />
              <span class="score-col__text" :style="{ color: scoreColor(row.score) }">
                {{ scoreLabel(row.score) }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="file_path" label="Document" min-width="200" sortable>
          <template #default="{ row }">
            <div class="file-col">
              <el-icon><Document /></el-icon>
              <span class="file-col__path">{{ row.file_path }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Category" width="130" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.metadata?.category"
              size="small"
              :type="categoryType(row.metadata.category)"
              effect="light"
            >
              {{ row.metadata.category }}
            </el-tag>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="Type" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.metadata?.type" size="small" type="info" effect="plain">
              {{ row.metadata.type }}
            </el-tag>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="Chunk Preview" min-width="280" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="chunk-preview">{{ stripSourcePrefix(row.text) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Chars" width="70" align="center" sortable prop="metadata.char_count">
          <template #default="{ row }">{{ row.metadata?.char_count ?? (row.text?.length || 0) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="100" align="center" fixed="right">
          <template #default="{ row, $index }">
            <el-button text type="primary" size="small" @click.stop="showDetail(row, $index)">
              Inspect
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Empty State -->
    <el-card v-if="!sources.length && !querying && searched" shadow="hover" class="rag-retrieval__empty">
      <el-empty description="No chunks matched your query. Try broader terms or a different scope." :image-size="80">
        <template #extra>
          <div class="empty-tips">
            <p><strong>Tips:</strong></p>
            <ul>
              <li>Remove or broaden the <em>Scope</em> filter</li>
              <li>Use more general terminology</li>
              <li>Check that the index is built (Dashboard → Index Status)</li>
              <li>Rebuild the index if documents have changed</li>
            </ul>
          </div>
        </template>
      </el-empty>
    </el-card>

    <!-- Source Detail Drawer -->
    <el-drawer
      v-model="drawerVisible"
      :title="`Source Detail — #${detailIndex + 1}`"
      size="560px"
      direction="rtl"
    >
      <template v-if="detailSource">
        <div class="detail-section">
          <h4>Document</h4>
          <el-link :href="kbDetailLink(detailSource.file_path)" target="_blank" type="primary" :underline="false">
            <el-icon><Link /></el-icon> {{ detailSource.file_path }}
          </el-link>
        </div>

        <div class="detail-section">
          <h4>Relevance Score</h4>
          <div class="detail-score">
            <el-progress
              :percentage="scorePercent(detailSource.score)"
              :stroke-width="12"
              :color="scoreColor(detailSource.score)"
            />
            <span class="detail-score__text">{{ scoreLabel(detailSource.score) }}</span>
          </div>
        </div>

        <div class="detail-section" v-if="detailSource.metadata && Object.keys(detailSource.metadata).length">
          <h4>Metadata</h4>
          <el-descriptions :column="1" border size="small" class="detail-meta">
            <el-descriptions-item
              v-for="(val, key) in visibleMeta"
              :key="key"
              :label="String(key)"
            >
              <template v-if="Array.isArray(val)">
                <el-tag v-for="(t, ti) in val" :key="ti" size="small" style="margin: 1px 2px">{{ t }}</el-tag>
              </template>
              <template v-else>{{ val }}</template>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>Chunk Content</h4>
          <div class="detail-text">
            <pre>{{ detailSource.text }}</pre>
          </div>
        </div>

        <div class="detail-actions">
          <el-button plain size="small" @click="copyText(detailSource.text)">
            <el-icon><CopyDocument /></el-icon> Copy Text
          </el-button>
          <el-button plain size="small" @click="openInKb(detailSource.file_path)">
            <el-icon><Document /></el-icon> Open in Knowledge Base
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts" name="ragRetrievalExplorer">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Search, List, Document, Link, CopyDocument } from "@element-plus/icons-vue";
import { ragQuery } from "@/api/modules/ragService";
import { useRagStore } from "@/stores/modules/rag";
import type { RagSource } from "@/api/interface/rag";

const ragStore = useRagStore();

// Query state
const question = ref(ragStore.question || "");
const topK = ref(ragStore.topK || 4);
const scope = ref(ragStore.scope || "");
const querying = ref(false);
const sources = ref<RagSource[]>([]);
const searched = ref(false);
const lastError = ref("");
const lastLatency = ref(0);

// Detail drawer
const drawerVisible = ref(false);
const detailSource = ref<RagSource | null>(null);
const detailIndex = ref(0);

const bestScore = computed(() => {
  if (!sources.value.length) return 0;
  return Math.max(...sources.value.map((s) => s.score ?? 0));
});

const avgScore = computed(() => {
  if (!sources.value.length) return 0;
  return sources.value.reduce((a, s) => a + (s.score ?? 0), 0) / sources.value.length;
});

const visibleMeta = computed(() => {
  if (!detailSource.value?.metadata) return {};
  const m = { ...detailSource.value.metadata };
  delete m.char_count;
  delete m.token_estimate;
  return m;
});

async function runQuery() {
  const q = question.value.trim();
  if (!q || querying.value) return;

  querying.value = true;
  searched.value = false;
  sources.value = [];
  lastError.value = "";
  lastLatency.value = 0;

  const t0 = performance.now();
  try {
    const res = await ragQuery({
      question: q,
      top_k: topK.value,
      scope: scope.value || undefined,
    });
    sources.value = (res.sources ?? []).map((s) => ({
      ...s,
      metadata: {
        ...s.metadata,
        char_count: s.metadata?.char_count ?? (s.text?.length || 0),
        token_estimate: s.metadata?.token_estimate ?? Math.round((s.text?.length || 0) / 4),
      },
    }));
    searched.value = true;

    // Push to store history
    ragStore.question = q;
    ragStore.topK = topK.value;
    ragStore.scope = scope.value;
    ragStore.lastSources = sources.value;
    ragStore.lastError = null;
    ragStore.queryHistory = [
      {
        question: q,
        scope: scope.value,
        topK: topK.value,
        sources: sources.value,
        timestamp: Date.now(),
      },
      ...ragStore.queryHistory,
    ].slice(0, 20);
  } catch (e: any) {
    lastError.value = e.message ?? "Retrieval failed";
    ragStore.lastError = lastError.value;
  } finally {
    querying.value = false;
    lastLatency.value = Math.round(performance.now() - t0);
  }
}

function clearQuery() {
  sources.value = [];
  searched.value = false;
  lastError.value = "";
}

function showDetail(source: RagSource, index?: number) {
  detailSource.value = source;
  detailIndex.value = index ?? 0;
  drawerVisible.value = true;
}

function stripSourcePrefix(text: string): string {
  return (text || "").replace(/^\[Source \d+\]\s*/gm, "");
}

function scorePercent(score: number): number {
  if (score == null || isNaN(score)) return 0;
  return Math.round(score * 100);
}

function scoreLabel(score: number): string {
  if (score == null || isNaN(score)) return "—";
  return (score * 100).toFixed(1) + "%";
}

function scoreColor(score: number): string {
  if (score >= 0.7) return "#67c23a";
  if (score >= 0.4) return "#e6a23c";
  return "#f56c6c";
}

function categoryType(cat: string): string {
  const map: Record<string, string> = {
    methodology: "",
    tech: "success",
    work: "warning",
    projects: "primary",
    resources: "info",
    industry: "danger",
  };
  return map[cat.split("/")[0]] || "";
}

function kbDetailLink(filePath: string): string {
  return `/knowledge/detail?path=${encodeURIComponent(filePath)}`;
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success("Chunk text copied to clipboard");
  });
}

function openInKb(filePath: string) {
  window.open(kbDetailLink(filePath), "_blank");
}
</script>

<style scoped lang="scss">
.rag-retrieval {
  padding: 24px;
  max-width: 1300px;
  margin: 0 auto;

  &__header {
    margin-bottom: 20px;

    h1 {
      margin: 0 0 4px;
      font-size: 24px;
      font-weight: 700;
    }
    p {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }

  &__query {
    margin-bottom: 16px;
  }

  &__alert {
    margin-bottom: 16px;
  }

  &__results {
    margin-bottom: 16px;
  }

  &__empty {
    text-align: center;
  }
}

.query-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.query-input {
  font-family: inherit;
}

.query-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.query-params {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.param-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.query-actions {
  display: flex;
  gap: 8px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.results-summary {
  font-size: 13px;
  color: var(--el-text-color-secondary);

  strong {
    color: var(--el-text-color-primary);
    font-variant-numeric: tabular-nums;
  }
}

.score-col {
  display: flex;
  align-items: center;
  gap: 6px;

  .el-progress {
    flex: 1;
    min-width: 60px;
  }

  &__text {
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    min-width: 42px;
    text-align: right;
  }
}

.file-col {
  display: flex;
  align-items: center;
  gap: 6px;

  &__path {
    font-size: 12px;
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.chunk-preview {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.text-muted {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.empty-tips {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;

  p {
    margin: 0 0 8px;
  }
  ul {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.8;
  }
}

// Detail Drawer
.detail-section {
  margin-bottom: 20px;

  h4 {
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.detail-score {
  display: flex;
  align-items: center;
  gap: 12px;

  .el-progress {
    flex: 1;
  }

  &__text {
    font-size: 18px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
}

.detail-meta {
  :deep(.el-descriptions__label) {
    font-size: 12px;
  }
  :deep(.el-descriptions__content) {
    font-size: 12px;
    word-break: break-all;
  }
}

.detail-text {
  background: var(--el-fill-color-light);
  border-radius: 6px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;

  pre {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: inherit;
    color: var(--el-text-color-primary);
  }
}

.detail-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
