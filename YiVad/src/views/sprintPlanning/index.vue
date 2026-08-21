<template>
  <div class="sprint-planning">
    <div class="sprint-planning__head">
      <div class="sprint-planning__head-left">
        <h1 class="sprint-planning__title">Sprint Planning</h1>
        <el-select v-model="selectedCycle" placeholder="Select a cycle" style="width: 200px" @change="loadData">
          <el-option v-for="c in cycles" :key="c.key" :label="c.name" :value="c.key" />
        </el-select>
      </div>
      <el-button :icon="Refresh" @click="loadData">Refresh</el-button>
    </div>

    <div v-if="selectedCycle" v-loading="loading" class="sprint-planning__body">
      <div class="sprint-planning__columns">
        <!-- Backlog -->
        <div class="sprint-planning__col">
          <div class="sprint-planning__col-head">
            <span>Backlog</span>
            <el-tag size="small" round>{{ backlogIssues.length }}</el-tag>
          </div>
          <div class="sprint-planning__col-body">
            <div
              v-for="issue in backlogIssues"
              :key="issue.key"
              class="sprint-planning__card"
              @click="goDetail(issue.key)"
            >
              <div class="sprint-planning__card-title">{{ issue.title }}</div>
              <div class="sprint-planning__card-meta">
                <el-tag size="small" effect="plain">{{ issue.issue_type }}</el-tag>
                <span :style="{ color: priorityColor(issue.priority) }">{{ issue.priority }}</span>
              </div>
              <el-button size="small" type="primary" @click.stop="addToCycle(issue)">Add to Sprint</el-button>
            </div>
            <el-empty v-if="!backlogIssues.length" description="No backlog issues" :image-size="40" />
          </div>
        </div>

        <!-- Sprint -->
        <div class="sprint-planning__col sprint-planning__col--active">
          <div class="sprint-planning__col-head">
            <span>Sprint Issues</span>
            <el-tag size="small" round type="primary">{{ sprintIssues.length }}</el-tag>
          </div>
          <div class="sprint-planning__col-body">
            <div
              v-for="issue in sprintIssues"
              :key="issue.key"
              class="sprint-planning__card"
              @click="goDetail(issue.key)"
            >
              <div class="sprint-planning__card-title">{{ issue.title }}</div>
              <div class="sprint-planning__card-meta">
                <el-tag size="small" effect="plain">{{ issue.issue_type }}</el-tag>
                <span>{{ issue.estimate_points ? issue.estimate_points + ' pts' : '' }}</span>
              </div>
              <el-button size="small" type="danger" @click.stop="removeFromCycle(issue)">Remove</el-button>
            </div>
            <el-empty v-if="!sprintIssues.length" description="No issues in sprint" :image-size="40" />
          </div>
        </div>
      </div>

      <div v-if="selectedCycle" class="sprint-planning__summary">
        <span>{{ sprintIssues.length }} issues · {{ totalPoints }} pts · {{ sprintIssues.filter(i => i.status === 'done').length }} done</span>
      </div>
    </div>

    <el-empty v-else description="Select a cycle to start planning" :image-size="80" />
  </div>
</template>

<script setup lang="ts" name="sprintPlanning">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getIssueList, updateIssue } from "@/api/modules/issueService";
import { getCycleList, updateCycle } from "@/api/modules/cycleService";
import type { Issue, IssuePriority } from "@/api/modules/issueService";
import type { Cycle } from "@/api/modules/cycleService";

const router = useRouter();

const loading = ref(false);
const selectedCycle = ref("");
const cycles = ref<Cycle[]>([]);
const backlogIssues = ref<Issue[]>([]);
const sprintIssues = ref<Issue[]>([]);

const totalPoints = ref(0);

async function loadData() {
  loading.value = true;
  try {
    const [cycleRes, issueRes] = await Promise.all([
      getCycleList({ pageSize: 100 }),
      getIssueList({ pageSize: 500 })
    ]);

    cycles.value = (cycleRes.data?.list as Cycle[]) ?? [];
    const allIssues = (issueRes.data?.list as Issue[]) ?? [];

    if (selectedCycle.value) {
      const cycle = cycles.value.find(c => c.key === selectedCycle.value);
      const cycleIssueKeys = new Set(cycle?.issue_keys || []);
      sprintIssues.value = allIssues.filter(i => cycleIssueKeys.has(i.key));
      backlogIssues.value = allIssues.filter(i => !cycleIssueKeys.has(i.key) && i.status !== "done");
      totalPoints.value = sprintIssues.value.reduce((s, i) => s + (i.estimate_points || 0), 0);
    }
  } finally { loading.value = false; }
}

async function addToCycle(issue: Issue) {
  if (!selectedCycle.value) return;
  const cycle = cycles.value.find(c => c.key === selectedCycle.value);
  if (!cycle) return;
  const newKeys = [...new Set([...(cycle.issue_keys || []), issue.key])];
  await updateCycle(selectedCycle.value, { issue_keys: newKeys });
  ElMessage.success(`"${issue.title}" added to sprint`);
  await loadData();
}

async function removeFromCycle(issue: Issue) {
  if (!selectedCycle.value) return;
  const cycle = cycles.value.find(c => c.key === selectedCycle.value);
  if (!cycle) return;
  const newKeys = (cycle.issue_keys || []).filter(k => k !== issue.key);
  await updateCycle(selectedCycle.value, { issue_keys: newKeys });
  ElMessage.success(`"${issue.title}" removed from sprint`);
  await loadData();
}

function goDetail(key: string) { router.push(`/issue/${key}`); }

function priorityColor(p: IssuePriority) {
  const m: Record<string, string> = { urgent: "#f56c6c", high: "#e6a23c", medium: "#409eff", low: "#909399", none: "#c0c4cc" };
  return m[p] || "#909399";
}

onMounted(() => { loadData(); });
</script>

<style scoped lang="scss">
.sprint-planning {
  padding: 24px;
  height: calc(100vh - 95px);
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
  overflow: hidden;
}
.sprint-planning__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}
.sprint-planning__head-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.sprint-planning__title { margin: 0; font-size: 20px; font-weight: 600; }
.sprint-planning__body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.sprint-planning__columns {
  display: flex;
  gap: 16px;
  flex: 1;
  overflow: hidden;
}
.sprint-planning__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  &--active {
    background: var(--el-color-primary-light-9);
  }
}
.sprint-planning__col-head {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  flex-shrink: 0;
}
.sprint-planning__col-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sprint-planning__card {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
}
.sprint-planning__card-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}
.sprint-planning__card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}
.sprint-planning__summary {
  margin-top: 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: center;
  flex-shrink: 0;
}
</style>