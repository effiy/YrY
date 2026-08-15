<template>
  <div class="metrics">
    <div class="metrics__head">
      <h1 class="metrics__title">Metrics &amp; KPIs</h1>
      <el-tag size="small" type="info">{{ rows.length }} metrics · {{ roleCount }} roles</el-tag>
      <div class="metrics__nav">
        <el-button size="small" text type="primary" :icon="House" @click="go('/home/index')">Home</el-button>
        <el-button size="small" text type="primary" :icon="Odometer" @click="go('/executiver/okr')">OKR Dashboard</el-button>
      </div>
    </div>

    <el-table
      :data="rows"
      stripe
      border
      style="width: 100%"
      row-key="id"
      empty-text="No metrics."
      @row-click="onRowClick"
    >
      <el-table-column label="Metric" min-width="240">
        <template #default="{ row }">
          <span class="metrics__cell-name">
            <span class="metrics__icon">{{ row.icon }}</span>
            <span>{{ row.name }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Role" width="180">
        <template #default="{ row }">
          <span class="metrics__cell-role" @click.stop="go(`/executiver/okr/${row.roleId}`)">
            {{ row.roleIcon }} {{ row.roleName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="Category" width="140" show-overflow-tooltip />
      <el-table-column prop="framework" label="Framework" width="150" show-overflow-tooltip />
      <el-table-column label="Current → Target" width="190">
        <template #default="{ row }">
          <span class="metrics__val">{{ row.current }}{{ row.unit }} → {{ row.target }}{{ row.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Progress" width="180">
        <template #default="{ row }">
          <div class="metrics__progress">
            <el-progress :percentage="row.progress" :stroke-width="6" :status="row.progress >= 100 ? 'success' : undefined" />
            <span class="metrics__progress-num">{{ row.progress }}%</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Trend" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="trendType(row.trend)" size="small" effect="light">{{ row.trend }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts" name="knowledgeMetrics">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { House, Odometer } from "@element-plus/icons-vue";
import { ROLE_IDS, rolesData, metricsData } from "@/views/knowledge/executiver/okrData";
import type { MetricItem } from "@/views/knowledge/executiver/okrData";

const router = useRouter();

interface Row extends MetricItem {
  roleId: string;
  roleName: string;
  roleIcon: string;
}

const roles = computed(() => ROLE_IDS.map(id => rolesData[id]).filter(Boolean));
const roleCount = computed(() => roles.value.length);

const rows = computed<Row[]>(() => {
  const out: Row[] = [];
  for (const role of roles.value) {
    for (const m of metricsData[role.id] || []) {
      out.push({ ...m, roleId: role.id, roleName: role.name, roleIcon: role.icon });
    }
  }
  return out;
});

function trendType(trend: string): "success" | "danger" | "info" {
  return trend === "up" ? "success" : trend === "down" ? "danger" : "info";
}

function onRowClick(row: Row) {
  go(`/executiver/okr/${row.roleId}`);
}

function go(path: string) {
  router.push(path);
}
</script>

<style scoped lang="scss">
.metrics {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 95px);
  min-height: 0;
  padding: 24px;
  overflow: auto;
  background: var(--el-bg-color-page);
}
.metrics__head {
  display: flex;
  gap: 10px;
  align-items: center;
}
.metrics__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}
.metrics__nav {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-left: auto;
}
.metrics__cell-name {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}
.metrics__icon {
  font-size: 15px;
}
.metrics__cell-role {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
  &:hover {
    opacity: 0.85;
  }
}
.metrics__val {
  font-variant-numeric: tabular-nums;
}
.metrics__progress {
  display: flex;
  gap: 8px;
  align-items: center;
  :deep(.el-progress) {
    flex: 1;
    min-width: 0;
  }
}
.metrics__progress-num {
  flex-shrink: 0;
  min-width: 34px;
  text-align: right;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
}
</style>
