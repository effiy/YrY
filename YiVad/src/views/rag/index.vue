<template>
  <div class="rag-dashboard">
    <header class="rag-dashboard__header">
      <div>
        <h1>RAG System</h1>
        <p>Retrieval-Augmented Generation — YiKnowledge indexing, retrieval exploration, and grounded chat.</p>
      </div>
      <div class="rag-dashboard__actions">
        <el-button type="primary" @click="$router.push('/rag/retrieval')">
          <el-icon><Search /></el-icon> Retrieval Explorer
        </el-button>
        <el-button @click="$router.push('/rag/chat')">
          <el-icon><ChatDotRound /></el-icon> Chat
        </el-button>
        <el-button @click="rebuildIndex" :loading="building" :disabled="building">
          <el-icon><RefreshRight /></el-icon> {{ building ? "Rebuilding..." : "Rebuild Index" }}
        </el-button>
      </div>
    </header>

    <!-- Index Overview Cards -->
    <section class="rag-dashboard__cards">
      <el-card shadow="hover" class="rag-dashboard__card rag-dashboard__card--status">
        <template #header>
          <div class="card-header">
            <span><el-icon><DataBoard /></el-icon> Index Status</span>
            <el-tag :type="status.built ? 'success' : 'warning'" size="small" effect="dark">
              {{ status.built ? "HEALTHY" : "NOT BUILT" }}
            </el-tag>
          </div>
        </template>
        <div class="card-body">
          <div class="stat-row">
            <span class="stat-label">Documents Indexed</span>
            <span class="stat-value">{{ status.num_docs ?? "—" }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Last Built</span>
            <span class="stat-value stat-value--time">{{ status.last_built_at ? formatTime(status.last_built_at) : "Never" }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Persist Directory</span>
            <span class="stat-value stat-value--path">{{ status.persist_dir ?? "—" }}</span>
          </div>
          <div v-if="status.error" class="stat-row stat-row--error">
            <span class="stat-label">Error</span>
            <span class="stat-value">{{ status.error }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="rag-dashboard__card rag-dashboard__card--config">
        <template #header>
          <span><el-icon><Setting /></el-icon> Retrieval Configuration</span>
        </template>
        <div class="card-body">
          <div class="stat-row">
            <span class="stat-label">Embedding Model</span>
            <el-tag size="small" type="info">{{ indexInfo.embed_model || "nomic-embed-text" }}</el-tag>
          </div>
          <div class="stat-row">
            <span class="stat-label">Chat LLM</span>
            <el-tag size="small" type="info">{{ indexInfo.llm_model || "qwen2.5" }}</el-tag>
          </div>
          <div class="stat-row">
            <span class="stat-label">Chunk Size / Overlap</span>
            <span class="stat-value">{{ indexInfo.chunk_size || 500 }} / {{ indexInfo.chunk_overlap || 50 }} tokens</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Hybrid Retrieval</span>
            <el-tag size="small" :type="indexInfo.hybrid_retrieval !== false ? 'success' : 'info'">
              {{ indexInfo.hybrid_retrieval !== false ? "Vector + BM25" : "Vector only" }}
            </el-tag>
          </div>
          <div class="stat-row">
            <span class="stat-label">Cross-Encoder Rerank</span>
            <el-tag size="small" :type="indexInfo.rerank_enabled ? 'success' : 'info'">
              {{ indexInfo.rerank_enabled ? "Enabled" : "Disabled" }}
            </el-tag>
          </div>
          <div class="stat-row">
            <span class="stat-label">Inline Citations</span>
            <el-tag size="small" :type="indexInfo.inline_citations !== false ? 'success' : 'info'">
              {{ indexInfo.inline_citations !== false ? "[Source N]" : "Off" }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="rag-dashboard__card rag-dashboard__card--quick">
        <template #header>
          <span><el-icon><Opportunity /></el-icon> Quick Query</span>
        </template>
        <div class="card-body">
          <el-input
            v-model="quickQuestion"
            placeholder="Ask a quick question..."
            @keyup.enter.ctrl="runQuickQuery"
            :disabled="!status.built"
          />
          <el-button
            type="primary"
            :loading="quickLoading"
            @click="runQuickQuery"
            :disabled="!status.built || !quickQuestion.trim()"
            style="margin-top: 12px; width: 100%"
          >
            {{ quickLoading ? "Retrieving..." : "Search Knowledge Base" }}
          </el-button>
          <div v-if="quickSources.length" class="quick-results">
            <div class="quick-results__title">
              Top {{ quickSources.length }} results
              <span class="quick-results__best">(best: {{ (quickSources[0].score * 100).toFixed(1) }}%)</span>
            </div>
            <div v-for="(s, i) in quickSources.slice(0, 3)" :key="i" class="quick-result">
              <div class="quick-result__header">
                <el-tag size="small" :type="scoreType(s.score)">{{ (s.score * 100).toFixed(0) }}%</el-tag>
                <span class="quick-result__path">{{ s.file_path }}</span>
              </div>
              <p class="quick-result__text">{{ truncateText(s.text, 120) }}</p>
            </div>
          </div>
        </div>
      </el-card>
    </section>

    <!-- Recent Queries Table -->
    <section class="rag-dashboard__recent">
      <el-card shadow="hover">
        <template #header>
          <span><el-icon><Timer /></el-icon> Recent Queries</span>
        </template>
        <el-table
          v-if="queryHistory.length"
          :data="queryHistory.slice(0, 5)"
          stripe
          size="small"
          @row-click="(row: any) => $router.push('/rag/history')"
          style="cursor: pointer"
        >
          <el-table-column prop="question" label="Question" min-width="200" show-overflow-tooltip />
          <el-table-column prop="scope" label="Scope" width="140">
            <template #default="{ row }">
              <el-tag v-if="row.scope" size="small" type="warning">{{ row.scope }}</el-tag>
              <span v-else class="text-muted">Full KB</span>
            </template>
          </el-table-column>
          <el-table-column label="Top-K" width="70" align="center">
            <template #default="{ row }">{{ row.top_k }}</template>
          </el-table-column>
          <el-table-column label="Results" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.result_count > 0 ? 'success' : 'danger'" size="small" effect="dark">
                {{ row.result_count ?? row.sources?.length ?? "—" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Best Score" width="110" align="center">
            <template #default="{ row }">
              <div class="score-cell">
                <el-progress
                  :percentage="scorePercent(row.top_score ?? bestScore(row.sources))"
                  :stroke-width="6"
                  :show-text="false"
                />
                <span class="score-text">{{ scoreLabel(row.top_score ?? bestScore(row.sources)) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Time" width="160" align="center">
            <template #default="{ row }">{{ fmtTs(row.timestamp) }}</template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="No queries yet. Start exploring in the Retrieval Explorer." :image-size="60" />
      </el-card>
    </section>

    <!-- Knowledge Base Links -->
    <section class="rag-dashboard__docs">
      <el-card shadow="hover">
        <template #header>
          <span><el-icon><Document /></el-icon> RAG Methodology &amp; Reference</span>
        </template>
        <div class="doc-links">
          <a href="/knowledge/detail?path=methodology/ai-specific/rag-design-patterns-summary.md" class="doc-link">
            <el-icon><Reading /></el-icon>
            <div>
              <strong>RAG Design Patterns</strong>
              <p>Chunking, hybrid search, reranking, and evaluation methodology.</p>
            </div>
          </a>
          <a href="/knowledge/detail?path=resources/prompts/rag-system-prompt.md" class="doc-link">
            <el-icon><Notebook /></el-icon>
            <div>
              <strong>RAG System Prompt Engineering</strong>
              <p>Prompt templates, failure modes, citation strategy, and evaluation targets.</p>
            </div>
          </a>
        </div>
      </el-card>
    </section>
  </div>
</template>

<script setup lang="ts" name="ragDashboard">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { Search, ChatDotRound, RefreshRight, DataBoard, Setting, Opportunity, Timer, Document, Reading, Notebook } from "@element-plus/icons-vue";
import { ragQuery, ragBuild, ragStatus } from "@/api/modules/ragService";
import { useRagStore } from "@/stores/modules/rag";
import type { RagSource, RagStatusResponse } from "@/api/interface/rag";

const ragStore = useRagStore();

const status = reactive<RagStatusResponse>({ built: false, num_docs: 0 });
const building = ref(false);

const indexInfo = reactive({
  embed_model: "nomic-embed-text",
  llm_model: "qwen2.5",
  chunk_size: 500,
  chunk_overlap: 50,
  hybrid_retrieval: true,
  rerank_enabled: false,
  inline_citations: true,
});

const quickQuestion = ref("");
const quickLoading = ref(false);
const quickSources = ref<RagSource[]>([]);

const queryHistory = computed(() => {
  return ragStore.queryHistory.map((entry: any) => ({
    ...entry,
    result_count: entry.result_count ?? entry.sources?.length ?? 0,
  }));
});

onMounted(async () => {
  try {
    const s = await ragStatus();
    Object.assign(status, s);
  } catch {
    // backend may not be available
  }
});

async function rebuildIndex() {
  building.value = true;
  try {
    const res = await ragBuild();
    Object.assign(status, res);
    ElMessage.success(`Index rebuilt: ${res.num_docs} documents indexed`);
  } catch (e: any) {
    ElMessage.error(e.message ?? "Rebuild failed");
  } finally {
    building.value = false;
  }
}

async function runQuickQuery() {
  const q = quickQuestion.value.trim();
  if (!q) return;
  quickLoading.value = true;
  quickSources.value = [];
  try {
    const res = await ragQuery({ question: q, top_k: 5 });
    quickSources.value = res.sources ?? [];
  } catch (e: any) {
    ElMessage.error(e.message ?? "Query failed");
  } finally {
    quickLoading.value = false;
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

function scoreType(score: number): string {
  if (score >= 0.7) return "success";
  if (score >= 0.4) return "warning";
  return "danger";
}

function scorePercent(score: number | undefined): number {
  if (score == null || isNaN(score)) return 0;
  return Math.round(score * 100);
}

function scoreLabel(score: number | undefined): string {
  if (score == null || isNaN(score)) return "—";
  return (score * 100).toFixed(1) + "%";
}

function bestScore(sources: RagSource[]): number {
  if (!sources?.length) return 0;
  return Math.max(...sources.map((s) => s.score ?? 0));
}

function fmtTs(ts: number | string): string {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}
</script>

<style scoped lang="scss">
.rag-dashboard {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;

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

  &__actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  &__card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }

  &__recent {
    margin-bottom: 24px;
  }

  &__docs {
    .doc-links {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      .doc-link {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 16px;
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        text-decoration: none;
        color: inherit;
        flex: 1;
        min-width: 280px;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .el-icon {
          font-size: 24px;
          color: var(--el-color-primary);
          margin-top: 2px;
          flex-shrink: 0;
        }

        strong {
          display: block;
          margin-bottom: 2px;
          font-size: 14px;
        }
        p {
          margin: 0;
          font-size: 12px;
          color: var(--el-text-color-secondary);
          line-height: 1.5;
        }
      }
    }
  }
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  line-height: 1.8;

  &--error {
    color: var(--el-color-danger);
  }
}

.stat-label {
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
  margin-right: 12px;
}

.stat-value {
  text-align: right;
  font-weight: 500;
  font-variant-numeric: tabular-nums;

  &--time {
    font-size: 12px;
    color: var(--el-text-color-regular);
  }
  &--path {
    font-size: 11px;
    font-family: monospace;
    color: var(--el-text-color-secondary);
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.quick-results {
  margin-top: 12px;

  &__title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--el-text-color-primary);
  }

  &__best {
    font-weight: 400;
    color: var(--el-color-success);
  }
}

.quick-result {
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  &__path {
    font-size: 12px;
    color: var(--el-color-primary);
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__text {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }
}

.score-cell {
  display: flex;
  align-items: center;
  gap: 6px;

  .el-progress {
    width: 50px;
  }

  .score-text {
    font-size: 12px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
}

.text-muted {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
</style>
