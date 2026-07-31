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
      <IndexStatusCard :status="status" />
      <RetrievalConfigCard :index-info="indexInfo" />
      <QuickQueryCard :disabled="!status.built" />
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
          <el-table-column label="Best Score" width="120" align="center">
            <template #default="{ row }">
              <ScoreBar :score="row.top_score ?? bestScore(row.sources)" :bar-width="50" :stroke-width="6" />
            </template>
          </el-table-column>
          <el-table-column label="Time" width="160" align="center">
            <template #default="{ row }">{{ formatTimestamp(row.timestamp) }}</template>
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
import { RefreshRight, Timer, Document, Reading, Notebook } from "@element-plus/icons-vue";
import { ragBuild, ragStatus } from "@/api/modules/ragService";
import { useRagStore } from "@/stores/modules/rag";
import {
  scorePercent, scoreLabel, bestScore, INDEX_INFO_DEFAULTS
} from "@/views/rag/constants";
import ScoreBar from "./components/ScoreBar.vue";
import IndexStatusCard from "./components/IndexStatusCard.vue";
import QuickQueryCard from "./components/QuickQueryCard.vue";
import RetrievalConfigCard from "./components/RetrievalConfigCard.vue";
import type { RagStatusResponse } from "@/api/interface/rag";

const ragStore = useRagStore();

const status = reactive<RagStatusResponse>({ built: false, num_docs: 0 });
const building = ref(false);

const indexInfo = reactive({ ...INDEX_INFO_DEFAULTS });

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

.text-muted {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
</style>
