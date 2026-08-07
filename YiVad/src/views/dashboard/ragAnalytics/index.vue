<template>
  <div class="rag-analytics-box" v-loading="loading">
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">RAG Analytics</span>
        <div class="top-actions">
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <div class="top-content">
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card" :class="data?.built ? 'stat-ok' : 'stat-warn'">
              <div class="stat-icon"><el-icon><DataBoard /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.built ? 'Built' : 'Not Built' }}</div>
                <div class="stat-label">Index Status</div>
                <div class="stat-sub" v-if="data?.last_built_at">Built {{ formatShortDate(data.last_built_at) }}</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-docs">
              <div class="stat-icon"><el-icon><Document /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(data?.num_docs ?? 0) }}</div>
                <div class="stat-label">Indexed Documents</div>
                <div class="stat-sub">{{ formatSize(data?.persist_dir_size ?? 0) }} index</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-queries">
              <div class="stat-icon"><el-icon><Search /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.recent_queries.length ?? 0 }}</div>
                <div class="stat-label">Recent Queries</div>
                <div class="stat-sub">Avg {{ avgLatency }}ms latency</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-score">
              <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ avgTopScore }}</div>
                <div class="stat-label">Avg Top Score</div>
                <div class="stat-sub">Top-K: {{ data?.config.top_k ?? '—' }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="card config-box">
      <div class="section-title">RAG Configuration</div>
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="config-item">
            <span class="config-label">Embed Model</span>
            <span class="config-value">{{ data?.config.embed_model || '—' }}</span>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="config-item">
            <span class="config-label">LLM Model</span>
            <span class="config-value">{{ data?.config.llm_model || '—' }}</span>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="config-item">
            <span class="config-label">Chunk Size / Overlap</span>
            <span class="config-value">{{ data?.config.chunk_size ?? '—' }} / {{ data?.config.chunk_overlap ?? '—' }}</span>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="config-item">
            <span class="config-label">Top K</span>
            <span class="config-value">{{ data?.config.top_k ?? '—' }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="config-item">
            <span class="config-label">Hybrid Retrieval</span>
            <el-tag :type="data?.config.hybrid_retrieval ? 'success' : 'info'" size="small">{{ data?.config.hybrid_retrieval ? 'On' : 'Off' }}</el-tag>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="config-item">
            <span class="config-label">Rerank</span>
            <el-tag :type="data?.config.rerank_enabled ? 'success' : 'info'" size="small">{{ data?.config.rerank_enabled ? 'On' : 'Off' }}</el-tag>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="config-item">
            <span class="config-label">Inline Citations</span>
            <el-tag :type="data?.config.inline_citations ? 'success' : 'info'" size="small">{{ data?.config.inline_citations ? 'On' : 'Off' }}</el-tag>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="config-item">
            <span class="config-label">Auto Rebuild</span>
            <el-tag :type="data?.config.auto_rebuild ? 'success' : 'info'" size="small">{{ data?.config.auto_rebuild ? 'On' : 'Off' }}</el-tag>
          </div>
        </el-col>
      </el-row>
      <div class="config-item" v-if="data?.last_built_at">
        <span class="config-label">Last Built</span>
        <span class="config-value">{{ formatDate(data?.last_built_at) }}</span>
      </div>
    </div>

    <div class="card chart-row" v-if="(data?.recent_queries ?? []).length > 0">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">Query Latency (ms)</div>
            <div class="chart-body">
              <ECharts :option="latencyChartOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">Top Score Distribution</div>
            <div class="chart-body">
              <ECharts :option="scoreChartOption" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card recent-box">
      <div class="section-title">Recent RAG Queries</div>
      <el-table :data="data?.recent_queries ?? []" stripe size="small" max-height="400">
        <el-table-column prop="question" label="Question" min-width="280" show-overflow-tooltip />
        <el-table-column prop="scope" label="Scope" width="120" />
        <el-table-column prop="result_count" label="Results" width="80" sortable />
        <el-table-column prop="top_score" label="Top Score" width="100">
          <template #default="{ row }">
            {{ row.top_score ? row.top_score.toFixed(3) : '—' }}
          </template>
        </el-table-column>
        <el-table-column prop="latency_ms" label="Latency" width="100">
          <template #default="{ row }">
            <el-tag :type="row.latency_ms < 500 ? 'success' : row.latency_ms < 1000 ? 'warning' : 'danger'" size="small">{{ row.latency_ms }}ms</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="Time" width="160">
          <template #default="{ row }">
            {{ formatDate(row.timestamp) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts" name="ragAnalytics">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { DataBoard, Document, Search, TrendCharts, Refresh } from "@element-plus/icons-vue";
import { getRagStats } from "@/api/modules/dashboard";
import type { RagStatsData } from "@/api/interface/yiweb";
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";

const data = ref<RagStatsData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const avgLatency = computed(() => {
  const qs = data.value?.recent_queries ?? [];
  if (!qs.length) return 0;
  return Math.round(qs.reduce((s, q) => s + q.latency_ms, 0) / qs.length);
});

const avgTopScore = computed(() => {
  const qs = data.value?.recent_queries ?? [];
  if (!qs.length) return "0";
  return (qs.reduce((s, q) => s + (q.top_score || 0), 0) / qs.length).toFixed(3);
});

function formatNumber(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 ** 3) return (bytes / (1024 ** 3)).toFixed(1) + " GB";
  if (bytes >= 1024 ** 2) return (bytes / (1024 ** 2)).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

function formatDate(val: string): string {
  if (!val) return "—";
  try {
    const d = new Date(val);
    return d.toLocaleString();
  } catch {
    return val.slice(0, 16);
  }
}

function formatShortDate(val: string): string {
  if (!val) return "";
  try { return new Date(val).toLocaleDateString(); } catch { return val.slice(0, 10); }
}

const latencyChartOption = computed<ECOption>(() => {
  const qs = data.value?.recent_queries ?? [];
  if (!qs.length) return {} as ECOption;
  const sorted = [...qs].sort((a, b) => b.latency_ms - a.latency_ms);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: (p: any) => `${p[0].name}<br/>Latency: ${p[0].value}ms` },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", name: "ms" },
    yAxis: { type: "category", data: sorted.map((_, i) => `Q${sorted.length - i}`).reverse(), axisLabel: { fontSize: 10 } },
    series: [{
      type: "bar",
      data: sorted.map(q => q.latency_ms).reverse(),
      barWidth: "60%",
      itemStyle: {
        color: (p: any) => p.value < 500 ? "#67c23a" : p.value < 1000 ? "#e6a23c" : "#f56c6c",
        borderRadius: [0, 6, 6, 0],
      },
    }],
  };
});

const scoreChartOption = computed<ECOption>(() => {
  const qs = data.value?.recent_queries ?? [];
  if (!qs.length) return {} as ECOption;
  return {
    tooltip: { trigger: "axis", formatter: (p: any) => `${p[0].name}<br/>Score: ${p[0].value.toFixed(3)}<br/>Results: ${p[1].value}` },
    legend: { data: ["Top Score", "Results"], top: 0 },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "15%", containLabel: true },
    xAxis: { type: "category", data: qs.map((_, i) => `Q${i + 1}`), axisLabel: { fontSize: 10 } },
    yAxis: { type: "value", min: 0, max: 1 },
    series: [
      {
        name: "Top Score", type: "bar", data: qs.map(q => q.top_score || 0),
        barWidth: "40%", itemStyle: { color: "#5470c6", borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "Results", type: "line", data: qs.map(q => q.result_count),
        smooth: true, lineStyle: { color: "#ee6666", width: 2 }, itemStyle: { color: "#ee6666" },
      },
    ],
  };
});

async function fetchData() {
  try {
    loading.value = true;
    const res = await getRagStats();
    data.value = res.data;
    lastUpdated.value = new Date().toLocaleTimeString();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchData();
  refreshTimer = setInterval(fetchData, 60_000);
});

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>