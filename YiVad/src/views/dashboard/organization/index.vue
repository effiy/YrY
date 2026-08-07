<template>
  <div class="organization-box" v-loading="loading">
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">Organization Overview</span>
        <div class="top-actions">
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <div class="top-content">
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-users">
              <div class="stat-icon"><el-icon><User /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.users.total ?? 0 }}</div>
                <div class="stat-label">Total Users</div>
                <div class="stat-sub">{{ activePercent }}% active</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-active">
              <div class="stat-icon"><el-icon><CircleCheck /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.users.active ?? 0 }}</div>
                <div class="stat-label">Active Users</div>
                <div class="stat-sub">{{ data?.users.inactive ?? 0 }} inactive</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-roles">
              <div class="stat-icon"><el-icon><Avatar /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.roles.length ?? 0 }}</div>
                <div class="stat-label">Roles</div>
                <div class="stat-sub">{{ topRoles }}</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-depts">
              <div class="stat-icon"><el-icon><OfficeBuilding /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.departments.length ?? 0 }}</div>
                <div class="stat-label">Departments</div>
                <div class="stat-sub">Largest: {{ largestDept }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="card chart-row">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="chart-box">
            <div class="chart-title">User Status</div>
            <div class="chart-body">
              <ECharts :option="userStatusOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="chart-box">
            <div class="chart-title">Gender Distribution</div>
            <div class="chart-body">
              <ECharts :option="genderOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="chart-box">
            <div class="chart-title">Users by Department</div>
            <div class="chart-body">
              <ECharts :option="deptOption" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card chart-row">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">Roles by Parent Group</div>
            <div class="chart-body">
              <ECharts :option="roleBarOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="table-box">
            <div class="table-title">Department Details</div>
            <el-table :data="data?.departments ?? []" stripe size="small" max-height="350">
              <el-table-column prop="name" label="Department" min-width="160" />
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="user_count" label="Users" width="80" sortable />
              <el-table-column label="Fill" width="140">
                <template #default="{ row }">
                  <el-progress :percentage="deptPercent(row.user_count)" :stroke-width="6" :show-text="true" :text-inside="false" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts" name="organization">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { User, CircleCheck, Avatar, OfficeBuilding, Refresh } from "@element-plus/icons-vue";
import { getOrgStats } from "@/api/modules/dashboard";
import type { OrgStatsData } from "@/api/interface/yiweb";
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";

const data = ref<OrgStatsData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const activePercent = computed(() => {
  const total = data.value?.users.total ?? 1;
  return total ? Math.round(((data.value?.users.active ?? 0) / total) * 100) : 0;
});

const topRoles = computed(() => {
  const roles = data.value?.roles ?? [];
  return roles.slice(0, 3).map(r => r.name).join(", ") || "—";
});

const largestDept = computed(() => {
  const depts = data.value?.departments ?? [];
  if (!depts.length) return "—";
  const sorted = [...depts].sort((a, b) => b.user_count - a.user_count);
  return sorted[0].name;
});

const userStatusOption = computed<ECOption>(() => {
  const d = data.value?.users;
  if (!d) return {} as ECOption;
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: "left", top: "center" },
    series: [{
      type: "pie",
      radius: ["50%", "75%"],
      center: ["55%", "50%"],
      data: [
        { value: d.active, name: "Active", itemStyle: { color: "#67c23a" } },
        { value: d.inactive, name: "Inactive", itemStyle: { color: "#f56c6c" } },
      ],
      label: { formatter: "{b}: {c}" },
    }]
  };
});

const genderOption = computed<ECOption>(() => {
  const g = data.value?.users.by_gender ?? {};
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: "left", top: "center" },
    series: [{
      type: "pie",
      radius: ["50%", "75%"],
      center: ["55%", "50%"],
      data: [
        { value: g["Male"] ?? 0, name: "Male", itemStyle: { color: "#5470c6" } },
        { value: g["Female"] ?? 0, name: "Female", itemStyle: { color: "#ee6666" } },
        { value: g["Unknown"] ?? 0, name: "Unknown", itemStyle: { color: "#909399" } },
      ],
      label: { formatter: "{b}: {c}" },
    }]
  };
});

const deptOption = computed<ECOption>(() => {
  const depts = (data.value?.departments ?? []).filter(d => d.user_count > 0);
  const sorted = [...depts].sort((a, b) => b.user_count - a.user_count).slice(0, 10);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", minInterval: 1 },
    yAxis: { type: "category", data: sorted.map(d => d.name).reverse(), axisLabel: { fontSize: 11 } },
    series: [{
      type: "bar",
      data: sorted.map(d => d.user_count).reverse(),
      barWidth: "60%",
      itemStyle: { color: "#fac858", borderRadius: [0, 6, 6, 0] }
    }]
  };
});

const roleBarOption = computed<ECOption>(() => {
  const roles = data.value?.roles ?? [];
  const parentCounts: Record<string, number> = {};
  for (const r of roles) {
    const parent = r.parent || "Root";
    parentCounts[parent] = (parentCounts[parent] || 0) + 1;
  }
  const entries = Object.entries(parentCounts).sort((a, b) => b[1] - a[1]);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    yAxis: { type: "category", data: entries.map(e => e[0]).reverse(), axisLabel: { fontSize: 11 } },
    xAxis: { type: "value", minInterval: 1, name: "roles" },
    series: [{
      type: "bar",
      data: entries.map(e => e[1]).reverse(),
      barWidth: "60%",
      itemStyle: { color: "#6B9DFE", borderRadius: [0, 6, 6, 0] },
    }],
  };
});

function deptPercent(count: number): number {
  const total = data.value?.users.total ?? 1;
  return Math.round((count / total) * 100);
}

async function fetchData() {
  try {
    loading.value = true;
    const res = await getOrgStats();
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