<template>
  <div class="time-report">
    <div class="time-report__head">
      <h1 class="time-report__title">Time Reports</h1>
      <el-select v-model="projectFilter" placeholder="Filter by project" clearable style="width: 180px" @change="loadData">
        <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
      </el-select>
    </div>

    <div v-loading="loading" class="time-report__body">
      <div class="time-report__summary">
        <div class="time-report__summary-card">
          <div class="time-report__summary-value">{{ totalHours }}h</div>
          <div class="time-report__summary-label">Total Tracked</div>
        </div>
        <div class="time-report__summary-card">
          <div class="time-report__summary-value">{{ totalEstimated }}h</div>
          <div class="time-report__summary-label">Total Estimated</div>
        </div>
        <div class="time-report__summary-card">
          <div class="time-report__summary-value">{{ issuesWithTime }}</div>
          <div class="time-report__summary-label">Issues with Time</div>
        </div>
      </div>

      <div v-if="groupedData.length" class="time-report__table-wrap">
        <table>
          <thead>
            <tr>
              <th>Issue</th>
              <th>Project</th>
              <th>Assignee</th>
              <th>Estimate</th>
              <th>Spent</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in groupedData" :key="item.key" @click="router.push(`/issue/${item.key}`)">
              <td>{{ item.title }}</td>
              <td><code>{{ item.project }}</code></td>
              <td>{{ item.assignee || "-" }}</td>
              <td>{{ item.estimate }}h</td>
              <td>{{ item.spent }}h</td>
              <td>
                <el-progress
                  :percentage="item.pct"
                  :stroke-width="6"
                  :color="item.pct > 100 ? '#f56c6c' : '#409eff'"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <el-empty v-else description="No time tracking data" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts" name="timeReports">
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { getIssueList } from "@/api/modules/issueService";
import { useProjectStore } from "@/stores/modules/project";
import type { Issue } from "@/api/modules/issueService";

const router = useRouter();
const projectStore = useProjectStore();

const loading = ref(false);
const projectFilter = ref("");
const projects = ref<{ key: string; name: string }[]>([]);
const issues = ref<Issue[]>([]);

const groupedData = computed(() => {
  return issues.value
    .filter(i => i.time_estimate || i.time_spent)
    .map(i => ({
      key: i.key,
      title: i.title,
      project: i.project_key,
      assignee: i.assignee,
      estimate: i.time_estimate || 0,
      spent: i.time_spent || 0,
      pct: i.time_estimate ? Math.round(((i.time_spent || 0) / i.time_estimate) * 100) : 0
    }))
    .sort((a, b) => b.spent - a.spent);
});

const totalHours = computed(() => groupedData.value.reduce((s, i) => s + i.spent, 0));
const totalEstimated = computed(() => groupedData.value.reduce((s, i) => s + i.estimate, 0));
const issuesWithTime = computed(() => groupedData.value.length);

async function loadData() {
  loading.value = true;
  try {
    const params: any = { pageSize: 500 };
    if (projectFilter.value) params.project_key = projectFilter.value;
    const res = await getIssueList(params);
    issues.value = (res.data?.list as Issue[]) ?? [];
  } finally { loading.value = false; }
}

onMounted(async () => {
  await projectStore.fetchProjects({ pageSize: 100 });
  projects.value = projectStore.projects.map(p => ({ key: p.key, name: p.name }));
  loadData();
});
</script>

<style scoped lang="scss">
.time-report {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.time-report__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.time-report__title { margin: 0; font-size: 20px; font-weight: 600; }
.time-report__summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.time-report__summary-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
}
.time-report__summary-value { font-size: 28px; font-weight: 700; color: var(--el-color-primary); }
.time-report__summary-label { font-size: 13px; color: var(--el-text-color-secondary); margin-top: 4px; }
.time-report__table-wrap {
  overflow-x: auto;
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th {
    text-align: left; padding: 10px 12px; background: var(--el-fill-color-lighter);
    border-bottom: 1px solid var(--el-border-color); font-weight: 600;
  }
  td { padding: 8px 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
  tr { cursor: pointer; &:hover { background: var(--el-fill-color-light); } }
  code { font-size: 11px; background: var(--el-fill-color); padding: 1px 6px; border-radius: 3px; }
}
</style>