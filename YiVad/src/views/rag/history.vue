<template>
  <div class="rag-page">
    <header class="rag-page-header">
      <div>
        <h1>Query History</h1>
        <p>Browse, search, and rerun previous retrieval queries. History is session-local (last 20 queries).</p>
      </div>
      <div class="rag-page-header__actions">
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
    <div class="rag-stat-grid" v-if="history.length">
      <el-card shadow="hover" class="rag-stat-card">
        <div class="rag-stat-value">{{ history.length }}</div>
        <div class="rag-stat-label">Total Queries</div>
      </el-card>
      <el-card shadow="hover" class="rag-stat-card">
        <div class="rag-stat-value">{{ uniqueScopes }}</div>
        <div class="rag-stat-label">Unique Scopes</div>
      </el-card>
      <el-card shadow="hover" class="rag-stat-card">
        <div class="rag-stat-value">{{ scoreLabel(avgBestScore) }}</div>
        <div class="rag-stat-label">Avg Best Score</div>
      </el-card>
      <el-card shadow="hover" class="rag-stat-card">
        <div class="rag-stat-value">{{ totalSources }}</div>
        <div class="rag-stat-label">Total Sources Retrieved</div>
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
            <span style="font-size: 12px; font-variant-numeric: tabular-nums">{{ formatTimestamp(row.timestamp) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="question" label="Question" min-width="220" show-overflow-tooltip sortable />
        <el-table-column label="Scope" width="150" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.scope" size="small" type="warning" effect="light">
              {{ row.scope }}
            </el-tag>
            <span v-else class="rag-text-muted">Full Knowledge Base</span>
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
              {{ row.resultCount }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Top Score" width="110" align="center" sortable prop="topScore">
          <template #default="{ row }">
            <ScoreBar :score="getTopScore(row)" :bar-width="45" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column label="Avg Score" width="120" align="center">
          <template #default="{ row }">
            {{ scoreLabel(getAvgScore(row)) }}
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

    <el-card v-else-if="history.length && !filteredHistory.length" shadow="hover">
      <el-empty description="No queries match your search." :image-size="60" />
    </el-card>

    <el-card v-else shadow="hover">
      <el-empty description="No query history yet. Start exploring in the Retrieval Explorer." :image-size="60">
        <template #extra>
          <el-button type="primary" @click="$router.push('/rag/retrieval')">
            Go to Retrieval Explorer
          </el-button>
        </template>
      </el-empty>
    </el-card>

    <!-- Query Detail Drawer -->
    <el-drawer v-model="detailVisible" title="Query Detail" size="560px" direction="rtl">
      <template v-if="detailQuery">
        <div style="margin-bottom: 20px">
          <h4 style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.5px">Question</h4>
          <p style="margin: 0; font-size: 14px; line-height: 1.7">{{ detailQuery.question }}</p>
        </div>
        <div style="margin-bottom: 20px">
          <h4 style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.5px">Query Parameters</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="Top-K">{{ detailQuery.topK }}</el-descriptions-item>
            <el-descriptions-item label="Scope">{{ detailQuery.scope || "Full KB" }}</el-descriptions-item>
            <el-descriptions-item label="Time">{{ formatTimestamp(detailQuery.timestamp) }}</el-descriptions-item>
            <el-descriptions-item label="Results">{{ detailQuery.resultCount }}</el-descriptions-item>
            <el-descriptions-item label="Top Score">{{ scoreLabel(getTopScore(detailQuery)) }}</el-descriptions-item>
            <el-descriptions-item label="Avg Score">{{ scoreLabel(getAvgScore(detailQuery)) }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div v-if="detailQuery.sources?.length" style="margin-bottom: 20px">
          <h4 style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.5px">Retrieved Sources ({{ detailQuery.sources.length }})</h4>
          <div v-for="(s, si) in detailQuery.sources" :key="si" style="margin-bottom: 12px">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px">
              <span style="font-size: 11px; font-weight: 700; color: var(--el-color-primary)">#{{ si + 1 }}</span>
              <span style="font-size: 12px; font-family: monospace; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ s.file_path }}</span>
              <ScoreBar :score="s.score" :bar-width="45" :stroke-width="6" />
            </div>
            <p style="margin: 0; font-size: 12px; color: var(--el-text-color-secondary); line-height: 1.5">{{ truncateText(s.text, 200) }}</p>
          </div>
        </div>
        <div style="padding-top: 12px; border-top: 1px solid var(--el-border-color-lighter)">
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
import {
  scoreLabel, bestScore, avgScore, truncateText, formatTimestamp
} from "@/views/rag/constants";
import ScoreBar from "./components/ScoreBar.vue";
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
  resultCount: number;
  topScore: number;
  avgScore: number;
  _index: number;
}

const history = computed<HistoryEntry[]>(() =>
  ragStore.queryHistory.map((entry: any, idx: number) => ({
    ...entry,
    topK: entry.topK ?? 4,
    resultCount: entry.sources?.length ?? 0,
    topScore: getTopScore(entry),
    avgScore: getAvgScore(entry),
    _index: idx,
  }))
);

const filteredHistory = computed(() => {
  const q = searchText.value.toLowerCase().trim();
  if (!q) return history.value;
  return history.value.filter(
    (h) => h.question.toLowerCase().includes(q) || h.scope.toLowerCase().includes(q)
  );
});

const uniqueScopes = computed(() =>
  new Set(history.value.map((h) => h.scope || "(full KB)")).size
);

const avgBestScore = computed(() => {
  if (!history.value.length) return 0;
  return history.value.reduce((a, h) => a + h.topScore, 0) / history.value.length;
});

const totalSources = computed(() =>
  history.value.reduce((a, h) => a + h.resultCount, 0)
);

const detailVisible = ref(false);
const detailQuery = ref<HistoryEntry | null>(null);

function getTopScore(entry: any): number {
  return bestScore(entry.sources ?? []);
}
function getAvgScore(entry: any): number {
  return avgScore(entry.sources ?? []);
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
</script>

<style scoped lang="scss">
@use "./styles/shared.scss";
</style>
