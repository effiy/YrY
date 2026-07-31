<template>
  <div class="rag-page">
    <header class="rag-page-header">
      <div>
        <h1>Retrieval Explorer</h1>
        <p>One-shot semantic search over the YiKnowledge index. No LLM generation — inspect what the retriever returns.</p>
      </div>
    </header>

    <!-- Query Controls -->
    <el-card shadow="hover" class="rag-section">
      <div class="rag-query-form">
        <el-input
          v-model="question"
          type="textarea"
          :rows="2"
          placeholder="Enter a query to retrieve semantically similar chunks from the knowledge base…"
          @keyup.enter.ctrl="runQuery"
        />
        <div class="rag-query-controls">
          <div class="rag-query-params">
            <span class="rag-param-label">Top-K</span>
            <el-input-number v-model="topK" :min="1" :max="50" size="small" controls-position="right" />
            <span class="rag-param-label">Scope</span>
            <el-input
              v-model="scope"
              placeholder="e.g. projects/YiVad"
              size="small"
              clearable
              style="width: 180px"
            />
          </div>
          <div class="rag-query-actions">
            <el-button type="primary" :loading="querying" @click="runQuery" :disabled="!question.trim()">
              <el-icon><Search /></el-icon> {{ querying ? "Retrieving…" : "Retrieve" }}
            </el-button>
            <el-button text @click="clearQuery" :disabled="!sources.length && !lastError">Clear</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Error -->
    <el-alert v-if="lastError" :title="lastError" type="error" show-icon closable @close="lastError = ''" class="rag-section" />

    <!-- Results Table -->
    <el-card v-if="sources.length" shadow="hover" class="rag-section">
      <template #header>
        <div class="results-header">
          <span><el-icon><List /></el-icon> Retrieved Chunks ({{ sources.length }})</span>
          <span class="results-summary">
            Best: <strong>{{ scoreLabel(best) }}</strong>
            &nbsp;|&nbsp; Avg: <strong>{{ scoreLabel(avg) }}</strong>
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
            <ScoreBar :score="row.score" :bar-width="70" :stroke-width="8" />
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
              :type="categoryTagType(row.metadata.category)"
              effect="light"
            >
              {{ row.metadata.category }}
            </el-tag>
            <span v-else class="rag-text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="Type" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.metadata?.type" size="small" type="info" effect="plain">
              {{ row.metadata.type }}
            </el-tag>
            <span v-else class="rag-text-muted">—</span>
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
    <el-card v-if="!sources.length && !querying && searched" shadow="hover" class="rag-section">
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
      <SourceDetail v-if="detailSource" :source="detailSource" :index="detailIndex" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts" name="ragRetrievalExplorer">
import { ref, computed } from "vue";
import { Search, List, Document } from "@element-plus/icons-vue";
import { useRagStore } from "@/stores/modules/rag";
import { useRagQuery } from "@/views/rag/composables/useRagQuery";
import {
  scoreLabel, bestScore, avgScore,
  stripSourcePrefix, categoryTagType
} from "@/views/rag/constants";
import ScoreBar from "./components/ScoreBar.vue";
import SourceDetail from "./components/SourceDetail.vue";
import type { RagSource } from "@/api/interface/rag";

const ragStore = useRagStore();
const { querying, sources, lastError, lastLatency, execute, clear } = useRagQuery();

// Query state — seeded from store on mount (e.g. from history rerun)
const question = ref(ragStore.lastQuestion || "");
const topK = ref(ragStore.lastTopK || 4);
const scope = ref(ragStore.lastScope || "");
const searched = ref(false);

// Detail drawer
const drawerVisible = ref(false);
const detailSource = ref<RagSource | null>(null);
const detailIndex = ref(0);

const best = computed(() => bestScore(sources.value));
const avg = computed(() => avgScore(sources.value));

function showDetail(source: RagSource, index?: number) {
  detailSource.value = source;
  detailIndex.value = index ?? 0;
  drawerVisible.value = true;
}

async function runQuery() {
  if (!question.value.trim() || querying.value) return;
  searched.value = true;
  await execute(question.value, topK.value, scope.value || undefined);
}

function clearQuery() {
  clear();
  searched.value = false;
}
</script>

<style scoped lang="scss">
@use "./styles/shared.scss";

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

.empty-tips {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;

  p { margin: 0 0 8px; }
  ul {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.8;
  }
}
</style>
