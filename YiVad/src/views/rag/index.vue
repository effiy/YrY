<template>
  <div class="rag-page">
    <header class="rag-page-header">
      <div class="rag-page-header__icon">
        <el-icon><Search /></el-icon>
      </div>
      <div class="rag-page-header__text">
        <h1>RAG System</h1>
        <p>Retrieval-Augmented Generation — YiKnowledge indexing, retrieval exploration, and grounded chat.</p>
      </div>
      <div class="rag-page-header__pills">
        <div class="rag-page-header__pill">
          <span class="rag-page-header__pill-val">{{ status.num_docs }}</span>
          <span class="rag-page-header__pill-lbl">Docs</span>
        </div>
        <div class="rag-page-header__pill">
          <span class="rag-page-header__pill-val">{{ queryHistory.length }}</span>
          <span class="rag-page-header__pill-lbl">Queries</span>
        </div>
        <div class="rag-page-header__pill" :class="{ 'rag-page-header__pill--built': status.built, 'rag-page-header__pill--empty': !status.built }">
          <span class="rag-page-header__pill-val">{{ status.built ? 'Ready' : 'Empty' }}</span>
          <span class="rag-page-header__pill-lbl">Index</span>
        </div>
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

    <div class="rag-page__body">
      <aside class="rag-page__sidebar">
        <div class="rag-sb-group">
          <div class="rag-sb-group__title">Navigate</div>
          <div class="rag-sb-group__body">
            <button class="rag-sb-link" @click="$router.push('/rag/retrieval')">
              <el-icon><Search /></el-icon> Retrieval Explorer
            </button>
            <button class="rag-sb-link" @click="$router.push('/rag/chat')">
              <el-icon><ChatDotRound /></el-icon> RAG Chat
            </button>
            <button class="rag-sb-link" @click="$router.push('/rag/compare')">
              <el-icon><DataAnalysis /></el-icon> Compare
            </button>
            <button class="rag-sb-link" @click="$router.push('/rag/history')">
              <el-icon><Timer /></el-icon> Query History
            </button>
          </div>
        </div>
        <div class="rag-sb-group">
          <div class="rag-sb-group__title">Index</div>
          <div class="rag-sb-group__body">
            <div class="rag-sb-row">
              <span class="rag-sb-row__label">Status</span>
              <el-tag :type="status.built ? 'success' : 'warning'" size="small">{{ status.built ? 'Healthy' : 'Empty' }}</el-tag>
            </div>
            <div class="rag-sb-row">
              <span class="rag-sb-row__label">Documents</span>
              <span class="rag-sb-row__value">{{ status.num_docs }}</span>
            </div>
            <div class="rag-sb-row">
              <span class="rag-sb-row__label">Last Built</span>
              <span class="rag-sb-row__value rag-sb-row__value--muted">{{ status.last_built_at ? formatTimestamp(status.last_built_at) : 'Never' }}</span>
            </div>
          </div>
        </div>
        <div class="rag-sb-group">
          <div class="rag-sb-group__title">Reference</div>
          <div class="rag-sb-group__body">
            <button class="rag-sb-link" @click="knowledgeDialogRef?.open('aier/methodology/rag-design-patterns.md')">
              <el-icon><Reading /></el-icon> Design Patterns
            </button>
            <button class="rag-sb-link" @click="knowledgeDialogRef?.open('aier/methodology/prompts/rag-system.md')">
              <el-icon><Notebook /></el-icon> Prompt Engineering
            </button>
          </div>
        </div>
      </aside>

      <main class="rag-page__main">
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
      </main>
    </div>

    <KnowledgePreviewDialog ref="knowledgeDialogRef" />
  </div>
</template>

<script setup lang="ts" name="ragDashboard">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { RefreshRight, Timer, Reading, Notebook, ArrowRight, Search, ChatDotRound, DataAnalysis } from "@element-plus/icons-vue";
import { ragStatus } from "@/api/modules/ragService";
import { useRagStore } from "@/stores/modules/rag";
import {
  bestScore as scoreBest, formatTimestamp, formatRelativeTime, INDEX_INFO_DEFAULTS
} from "@/views/rag/constants";
import ScoreBar from "@/components/ScoreBar/index.vue";
import IndexStatusCard from "./components/IndexStatusCard.vue";
import QuickQueryCard from "./components/QuickQueryCard.vue";
import RetrievalConfigCard from "./components/RetrievalConfigCard.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
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

.rag-page {
  max-width: none;
  background: var(--el-bg-color-page);
}

.rag-page__body {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.rag-page__main {
  flex: 1;
  min-width: 0;
}

.rag-page__sidebar {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rag-sb-group {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}

.rag-sb-group__title {
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.rag-sb-group__body {
  padding: 4px;
}

.rag-sb-link {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--el-text-color-primary);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  text-align: left;

  .el-icon { font-size: 14px; color: var(--el-text-color-secondary); flex-shrink: 0; }
  &:hover { background: var(--el-color-primary-light-9); color: var(--el-color-primary); .el-icon { color: var(--el-color-primary); } }
}

.rag-sb-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  font-size: 13px;
  & + & { border-top: 1px solid var(--el-border-color-lighter); }
}

.rag-sb-row__label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.rag-sb-row__value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  &--muted { font-size: 11px; font-weight: 400; color: var(--el-text-color-placeholder); }
}

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
</style>