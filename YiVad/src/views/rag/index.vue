<template>
  <div class="rag-page">
    <header class="rag-page-header">
      <div>
        <h1>RAG System</h1>
        <p>Retrieval-Augmented Generation — YiKnowledge indexing, retrieval exploration, and grounded chat.</p>
      </div>
      <div class="rag-page-header__actions">
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
    <section class="rag-card-grid">
      <IndexStatusCard :status="status" />
      <RetrievalConfigCard :index-info="indexInfo" />
      <QuickQueryCard :disabled="!status.built" />
    </section>

    <!-- Recent Queries Table -->
    <section class="rag-section">
      <el-card shadow="hover">
        <template #header>
          <div class="rag-card-header">
            <span class="rag-card-header__title"><el-icon><Timer /></el-icon> Recent Queries</span>
            <el-button v-if="queryHistory.length" text type="primary" size="small" @click="$router.push('/rag/history')">
              View All ({{ queryHistory.length }}) <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </template>
        <el-table
          v-if="queryHistory.length"
          :data="queryHistory.slice(0, 5)"
          stripe
          size="small"
          @row-click="(row: any) => rerunQuery(row._index)"
          class="rag-clickable-table"
        >
          <el-table-column prop="question" label="Question" min-width="200" show-overflow-tooltip />
          <el-table-column prop="scope" label="Scope" width="140">
            <template #default="{ row }">
              <el-tag v-if="row.scope" size="small" type="warning">{{ row.scope }}</el-tag>
              <span v-else class="rag-text-muted">Full KB</span>
            </template>
          </el-table-column>
          <el-table-column label="Top-K" width="70" align="center">
            <template #default="{ row }">{{ row.topK }}</template>
          </el-table-column>
          <el-table-column label="Results" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="(row.sources?.length || 0) > 0 ? 'success' : 'danger'" size="small" effect="dark">
                {{ row.sources?.length ?? "—" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Best Score" width="120" align="center">
            <template #default="{ row }">
              <ScoreBar :score="scoreBest(row.sources)" :bar-width="50" :stroke-width="6" />
            </template>
          </el-table-column>
          <el-table-column label="Time" width="160" align="center">
            <template #default="{ row }">
              <el-tooltip :content="formatTimestamp(row.timestamp)" placement="top" :show-after="300">
                <span class="rag-time-relative">{{ formatRelativeTime(row.timestamp) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="Action" width="110" align="center" fixed="right">
            <template #default="{ row }">
              <el-button text type="primary" size="small" @click.stop="rerunQuery(row._index)">
                <el-icon><RefreshRight /></el-icon> Rerun
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="No queries yet. Start exploring in the Retrieval Explorer." :image-size="60">
          <template #extra>
            <el-button type="primary" size="small" @click="$router.push('/rag/retrieval')">
              <el-icon><Search /></el-icon> Open Retrieval Explorer
            </el-button>
          </template>
        </el-empty>
      </el-card>
    </section>

    <!-- Knowledge Base Links -->
    <section>
      <el-card shadow="hover">
        <template #header>
          <span><el-icon><Document /></el-icon> RAG Methodology &amp; Reference</span>
        </template>
        <div class="doc-links">
          <a class="doc-link" href="javascript:void(0)" @click.prevent="knowledgeDialogRef?.open('aier/methodology/rag-design-patterns.md')">
            <el-icon><Reading /></el-icon>
            <div>
              <strong>RAG Design Patterns</strong>
              <p>Chunking, hybrid search, reranking, and evaluation methodology.</p>
            </div>
          </a>
          <a class="doc-link" href="javascript:void(0)" @click.prevent="knowledgeDialogRef?.open('aier/methodology/prompts/rag-system.md')">
            <el-icon><Notebook /></el-icon>
            <div>
              <strong>RAG System Prompt Engineering</strong>
              <p>Prompt templates, failure modes, citation strategy, and evaluation targets.</p>
            </div>
          </a>
        </div>
      </el-card>
    </section>

    <KnowledgePreviewDialog ref="knowledgeDialogRef" />
  </div>
</template>

<script setup lang="ts" name="ragDashboard">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { RefreshRight, Timer, Document, Reading, Notebook, ArrowRight, Search } from "@element-plus/icons-vue";
import { ragStatus } from "@/api/modules/ragService";
import { useRagStore } from "@/stores/modules/rag";
import {
  bestScore as scoreBest, formatTimestamp, formatRelativeTime, INDEX_INFO_DEFAULTS
} from "@/views/rag/constants";
import ScoreBar from "./components/ScoreBar.vue";
import IndexStatusCard from "./components/IndexStatusCard.vue";
import QuickQueryCard from "./components/QuickQueryCard.vue";
import RetrievalConfigCard from "./components/RetrievalConfigCard.vue";
import KnowledgePreviewDialog from "@/views/aiChat/components/KnowledgePreviewDialog.vue";
import type { RagStatusResponse } from "@/api/interface/rag";

const ragStore = useRagStore();
const router = useRouter();

const status = reactive<RagStatusResponse>({ built: false, num_docs: 0 });
const building = ref(false);
const indexInfo = reactive({ ...INDEX_INFO_DEFAULTS });

const queryHistory = ragStore.queryHistory;

const knowledgeDialogRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

function rerunQuery(index: number) {
  ragStore.rerunQuery(index);
  router.push("/rag/retrieval");
}

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
    await ragStore.rebuild();
    Object.assign(status, ragStore.status);
    ElMessage.success(`Index rebuilt: ${ragStore.status.num_docs} documents indexed`);
  } catch (e: any) {
    ElMessage.error(e.message ?? "Rebuild failed");
  } finally {
    building.value = false;
  }
}
</script>

<style scoped lang="scss">
@use "./styles/shared.scss";

.rag-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;

  &__title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
  }
}

.rag-time-relative {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
  cursor: default;
}

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
</style>
