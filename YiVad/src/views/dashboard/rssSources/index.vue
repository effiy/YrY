<template>
  <div class="rss-sources-box" v-loading="loading">
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">RSS Source Health</span>
        <div class="top-actions">
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <span class="last-fetch" v-if="lastFetchTime !== '—'">Last fetch {{ lastFetchTime }}</span>
          <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <div class="top-content">
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-total">
              <div class="stat-icon"><el-icon><Connection /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.total_sources ?? 0 }}</div>
                <div class="stat-label">Total Sources</div>
                <div class="stat-sub">{{ data?.enabled_count ?? 0 }} active / {{ data?.disabled_count ?? 0 }} paused</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-enabled">
              <div class="stat-icon"><el-icon><CircleCheck /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.enabled_count ?? 0 }}</div>
                <div class="stat-label">Enabled</div>
                <div class="stat-sub">{{ enabledPercent }}% of sources</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-articles">
              <div class="stat-icon"><el-icon><Reading /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.total_articles ?? 0 }}</div>
                <div class="stat-label">Total Articles</div>
                <div class="stat-sub">Avg {{ avgArticlesPerSource }} / source</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-health">
              <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ healthySourceCount }}</div>
                <div class="stat-label">Healthy</div>
                <div class="stat-sub">{{ unhealthySourceCount }} need attention</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="card chart-row">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">Articles per Source</div>
            <div class="chart-body">
              <ECharts :option="articlesBarOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">Source Status</div>
            <div class="chart-body">
              <ECharts :option="statusPieOption" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card source-table-box">
      <div class="table-title">Source Details</div>
      <el-table :data="data?.sources ?? []" stripe size="small" max-height="500">
        <el-table-column prop="name" label="Source" min-width="160" />
        <el-table-column prop="url" label="URL" min-width="250" show-overflow-tooltip />
        <el-table-column prop="enabled" label="Status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'danger'" size="small">{{ row.enabled ? 'Enabled' : 'Disabled' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="article_count" label="Articles" width="100" sortable />
        <el-table-column prop="last_fetch" label="Last Fetch" width="180">
          <template #default="{ row }">
            {{ formatDate(row.last_fetch) }}
          </template>
        </el-table-column>
        <el-table-column label="Health" width="100">
          <template #default="{ row }">
            <el-tag v-if="!row.enabled" type="info" size="small">Inactive</el-tag>
            <el-tag v-else-if="row.article_count > 0" type="success" size="small">Healthy</el-tag>
            <el-tag v-else type="warning" size="small">No Data</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts" name="rssSources">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Connection, CircleCheck, Reading, TrendCharts, Refresh } from "@element-plus/icons-vue";
import { getRssSourceHealth } from "@/api/modules/dashboard";
import type { RssSourceHealthData } from "@/api/interface/yiweb";
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";

const data = ref<RssSourceHealthData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const enabledPercent = computed(() => {
  const total = data.value?.total_sources ?? 1;
  return total ? Math.round(((data.value?.enabled_count ?? 0) / total) * 100) : 0;
});

const avgArticlesPerSource = computed(() => {
  const total = data.value?.enabled_count ?? 1;
  return total ? Math.round((data.value?.total_articles ?? 0) / total) : 0;
});

const healthySourceCount = computed(() => {
  return (data.value?.sources ?? []).filter(s => s.enabled && s.article_count > 0).length;
});

const unhealthySourceCount = computed(() => {
  return (data.value?.sources ?? []).filter(s => !s.enabled || s.article_count === 0).length;
});

const lastFetchTime = computed(() => {
  const sources = data.value?.sources ?? [];
  const enabled = sources.filter(s => s.enabled && s.last_fetch);
  if (!enabled.length) return "—";
  const latest = enabled.sort((a, b) => new Date(b.last_fetch).getTime() - new Date(a.last_fetch).getTime())[0];
  try { return new Date(latest.last_fetch).toLocaleString(); } catch { return "—"; }
});

const articlesBarOption = computed<ECOption>(() => {
  const sources = data.value?.sources ?? [];
  const sorted = [...sources].sort((a, b) => b.article_count - a.article_count);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "value" },
    yAxis: { type: "category", data: sorted.map(s => s.name).reverse(), axisLabel: { fontSize: 12 } },
    series: [{
      type: "bar",
      data: sorted.map(s => s.article_count).reverse(),
      barWidth: "60%",
      itemStyle: { color: "#6B9DFE", borderRadius: [0, 6, 6, 0] }
    }]
  };
});

const statusPieOption = computed<ECOption>(() => {
  const d = data.value;
  if (!d) return {} as ECOption;
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: "left", top: "center" },
    series: [{
      type: "pie",
      radius: ["50%", "75%"],
      center: ["55%", "50%"],
      data: [
        { value: d.enabled_count, name: "Enabled", itemStyle: { color: "#67c23a" } },
        { value: d.disabled_count, name: "Disabled", itemStyle: { color: "#f56c6c" } },
      ],
      label: { formatter: "{b}: {c}" },
    }]
  };
});

function formatDate(val: string): string {
  if (!val) return "—";
  try {
    const d = new Date(val);
    return d.toLocaleString();
  } catch {
    return val.slice(0, 16);
  }
}

async function fetchData() {
  try {
    loading.value = true;
    const res = await getRssSourceHealth();
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