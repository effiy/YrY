<template>
  <div class="rag-history">
    <header class="rag-history__header">
      <div>
        <h1>Query History</h1>
        <p>Browse, search, and rerun previous retrieval queries. History is session-local (last 20 queries).</p>
      </div>
      <div class="rag-history__header-actions">
        <el-input
          v-model="searchText"
          placeholder="Search questions…"
          clearable
          :prefix-icon="Search"
          size="small"
          style="width: 240px"
        />
        <el-button text type="danger" size="small" @click="clearAll" :disabled="!history.length">
          <el-icon><Delete /></el-icon> Clear All
        </el-button>
      </div>
    </header>

    <!-- Stats row -->
    <div class="rag-history__stats" v-if="history.length">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-value">{{ history.length }}</div>
        <div class="stat-label">Total Queries</div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-value">{{ uniqueScopes }}</div>
        <div class="stat-label">Unique Scopes</div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-value">{{ scoreLabel(avgBestScore) }}</div>
        <div class="stat-label">Avg Best Score</div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-value">{{ totalSources }}</div>
        <div class="stat-label">Total Sources Retrieved</div>
      </el-card>
    </div>

    <!-- History Table -->
    <el-card shadow="hover" v-if="filteredHistory.length">
      <el-table
        :data="filteredHistory"
        stripe
        highlight-current-row
        size="small"
        @row-click="showQueryDetail"
        style="cursor: pointer"
      >
        <el-table-column label="Time" width="170" align="center" sortable prop="timestamp">
          <template #default="{ row }">
            <span class="time-cell">{{ formatTimestamp(row.timestamp) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="question" label="Question" min-width="220" show-overflow-tooltip sortable />
        <el-table-column label="Scope" width="150" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.scope" size="small" type="warning" effect="light">
              {{ row.scope }}
            </el-tag>
            <span v-else class="text-muted">Full Knowledge Base</span>
          </template>
        </el-table-column>
        <el-table-column label="Top-K" width="70" align="center" sortable prop="topK">
          <template #default="{ row }">{{ row.topK }}</template>
        </el-table-column>
        <el-table-column label="Results" width="80" align="center" sortable prop="resultCount">
          <template #default="{ row }">
            <el-tag
              :type="row.resultCount > 0 ? 'success' : 'danger'"
              size="small"
              effect="dark"
            >
              {{ row.resultCount ?? row.sources?.length ?? 0 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Top Score" width="120" align="center" sortable prop="topScore">
          <template #default="{ row }">
            <div class="score-cell">
              <el-progress
                :percentage="scorePercent(getTopScore(row))"
                :stroke-width="6"
                :color="scoreColor(getTopScore(row))"
                :show-text="false"
              />
              <span class="score-text">{{ scoreLabel(getTopScore(row)) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Avg Score" width="120" align="center">
          <template #default="{ row }">
            <span class="avg-score">{{ scoreLabel(getAvgScore(row)) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="140" align="center" fixed="right">
          <template #default="{ row, $index }">
            <el-button text type="primary" size="small" @click.stop="rerunQuery($index)">
              <el-icon><RefreshRight /></el-icon> Rerun
            </el-button>
            <el-button text type="primary" size="small" @click.stop="showQueryDetail(row)">
              Detail
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-else-if="history.length && !filteredHistory.length" shadow="hover" class="rag-history__empty">
      <el-empty description="No queries match your search." :image-size="60" />
    </el-card>

    <el-card v-else shadow="hover" class="rag-history__empty">
      <el-empty description="No query history yet. Start exploring in the Retrieval Explorer." :image-size="60">
        <template #extra>
          <el-button type="primary" @click="$router.push('/rag/retrieval')">
            Go to Retrieval Explorer
          </el-button>
        </template>
      </el-empty>
    </el-card>

    <!-- Query Detail Drawer -->
    <el-drawer
      v-model="detailVisible"
      title="Query Detail"
      size="560px"
      direction="rtl"
    >
      <template v-if="detailQuery">
        <div class="detail-section">
          <h4>Question</h4>
          <p class="detail-question">{{ detailQuery.question }}</p>
        </div>

        <div class="detail-section">
          <h4>Query Parameters</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="Top-K">{{ detailQuery.topK }}</el-descriptions-item>
            <el-descriptions-item label="Scope">
              {{ detailQuery.scope || "Full KB" }}
            </el-descriptions-item>
            <el-descriptions-item label="Time">{{ formatTimestamp(detailQuery.timestamp) }}</el-descriptions-item>
            <el-descriptions-item label="Results">{{ detailQuery.resultCount ?? detailQuery.sources?.length ?? 0 }}</el-descriptions-item>
            <el-descriptions-item label="Top Score">{{ scoreLabel(getTopScore(detailQuery)) }}</el-descriptions-item>
            <el-descriptions-item label="Avg Score">{{ scoreLabel(getAvgScore(detailQuery)) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section" v-if="detailQuery.sources?.length">
          <h4>Retrieved Sources ({{ detailQuery.sources.length }})</h4>
          <div v-for="(s, si) in detailQuery.sources" :key="si" class="detail-source">
            <div class="detail-source__header">
              <span class="detail-source__rank">#{{ si + 1 }}</span>
              <span class="detail-source__path">{{ s.file_path }}</span>
              <el-progress
                :percentage="scorePercent(s.score)"
                :stroke-width="6"
                :color="scoreColor(s.score)"
                :show-text="false"
                style="width: 50px"
              />
              <span class="detail-source__score">{{ scoreLabel(s.score) }}</span>
            </div>
            <p class="detail-source__text">{{ truncateText(s.text, 200) }}</p>
          </div>
        </div>

        <div class="detail-actions">
          <el-button type="primary" size="small" @click="rerunQuery(detailQuery._index); detailVisible = false">
            <el-icon><RefreshRight /></el-icon> Rerun This Query
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts" name="ragQueryHistory">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Search, Delete, RefreshRight } from "@element-plus/icons-vue";
import { useRagStore } from "@/stores/modules/rag";
import type { RagSource } from "@/api/interface/rag";

const router = useRouter();
const ragStore = useRagStore();

const searchText = ref("");

interface HistoryEntry {
  question: string;
  scope: string;
  topK: number;
  sources: RagSource[];
  timestamp: number;
  resultCount?: number;
  topScore?: number;
  avgScore?: number;
  _index?: number;
}

const history = computed<HistoryEntry[]>(() => {
  return ragStore.queryHistory.map((entry: any, idx: number) => ({
    ...entry,
    topK: entry.topK ?? entry.top_k ?? 4,
    resultCount: entry.resultCount ?? entry.sources?.length ?? 0,
    topScore: getTopScore(entry),
    avgScore: getAvgScore(entry),
    _index: idx,
  }));
});

const filteredHistory = computed(() => {
  const q = searchText.value.toLowerCase().trim();
  if (!q) return history.value;
  return history.value.filter(
    (h) =>
      h.question.toLowerCase().includes(q) ||
      h.scope.toLowerCase().includes(q)
  );
});

const uniqueScopes = computed(() => {
  const scopes = new Set(history.value.map((h) => h.scope || "(full KB)"));
  return scopes.size;
});

const avgBestScore = computed(() => {
  if (!history.value.length) return 0;
  return history.value.reduce((a, h) => a + (h.topScore ?? 0), 0) / history.value.length;
});

const totalSources = computed(() => {
  return history.value.reduce((a, h) => a + (h.resultCount ?? 0), 0);
});

// Detail drawer
const detailVisible = ref(false);
const detailQuery = ref<HistoryEntry | null>(null);

function getTopScore(entry: any): number {
  const sources = entry.sources ?? [];
  if (!sources.length) return 0;
  return Math.max(...sources.map((s: RagSource) => s.score ?? 0));
}

function getAvgScore(entry: any): number {
  const sources = entry.sources ?? [];
  if (!sources.length) return 0;
  return sources.reduce((a: number, s: RagSource) => a + (s.score ?? 0), 0) / sources.length;
}

function showQueryDetail(row: HistoryEntry) {
  detailQuery.value = row;
  detailVisible.value = true;
}

function rerunQuery(index?: number) {
  if (index != null) {
    ragStore.rerunQuery(index);
  }
  router.push("/rag/retrieval");
}

function clearAll() {
  ragStore.clearQueryHistory();
}

function formatTimestamp(ts: number): string {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
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

function truncateText(text: string, maxLen: number): string {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}
</script>

<style scoped lang="scss">
.rag-history {
  padding: 24px;
  max-width: 1300px;
  margin: 0 auto;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;

    h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; }
    p { margin: 0; color: var(--el-text-color-secondary); font-size: 14px; }
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  &__empty {
    text-align: center;
  }
}

.stat-card {
  text-align: center;
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--el-color-primary);
    margin-bottom: 2px;
  }
  .stat-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.time-cell {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.text-muted {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.score-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  .el-progress { width: 50px; }
  .score-text {
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
}

.avg-score {
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
}

// Detail drawer
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

.detail-question {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--el-text-color-primary);
}

.detail-source {
  padding: 10px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child { border-bottom: none; }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  &__rank {
    font-size: 12px;
    font-weight: 700;
    color: var(--el-color-primary);
    min-width: 24px;
  }
  &__path {
    font-size: 12px;
    font-family: monospace;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--el-text-color-regular);
  }
  &__score {
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    min-width: 42px;
    text-align: right;
  }
  &__text {
    margin: 4px 0 0 32px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }
}

.detail-actions {
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
