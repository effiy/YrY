<template>
  <div class="gantt-view">
    <div class="gantt-view__head">
      <el-button text :icon="ArrowLeft" @click="goBack">{{ $t("gantt.backToProject") }}</el-button>
      <h2>{{ projectName }} · {{ $t("gantt.title") }}</h2>
      <span v-if="lastUpdated" class="gantt-view__updated">
        {{ $t("gantt.lastUpdated") }}：{{ lastUpdated }}
        <el-tag v-if="refreshing" size="small" type="warning">{{ $t("gantt.refreshing") }}</el-tag>
      </span>
    </div>
    <GanttChart
      :tasks="ganttTasks"
      :project-key="projectKey"
      @refresh="fetchData"
      @navigate="goToIssue"
    />
  </div>
</template>

<script setup lang="ts" name="GanttView">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ArrowLeft } from "@element-plus/icons-vue";
import { getIssueList, type Issue } from "@/api/modules/issueService";
import GanttChart from "@/components/gantt/GanttChart.vue";
import type { GanttTask } from "@/types/gantt";

const route = useRoute();
const router = useRouter();
useI18n();
const POLL_INTERVAL = 30_000;

const projectKey = computed(() => (route.params.key as string) || "");
const projectName = ref("");
const rawIssues = ref<Issue[]>([]);
const lastUpdated = ref("");
const refreshing = ref(false);

let pollTimer: ReturnType<typeof setInterval> | null = null;

const now = computed(() => new Date());

const ganttTasks = computed<GanttTask[]>(() =>
  rawIssues.value
    .filter(i => i.start_date || i.due_date)
    .map(i => {
      const start = i.start_date || i.due_date!;
      const end = i.end_date || i.due_date || start;
      const startMs = new Date(start).getTime();
      const endMs = new Date(end).getTime();
      const durationDays = Math.max(1, Math.round((endMs - startMs) / 86_400_000));
      const isMilestone = start === end || durationDays === 0;

      let progress = 0;
      if (i.status === "done") progress = 1;
      else if (i.status === "in_progress" || i.status === "in_review") {
        const nowMs = now.value.getTime();
        if (nowMs >= endMs) progress = 0.9;
        else if (nowMs <= startMs) progress = 0.05;
        else progress = Math.round(((nowMs - startMs) / (endMs - startMs)) * 100) / 100;
      }

      return {
        id: i.key,
        key: i.key,
        title: i.title,
        start_date: start,
        end_date: end,
        durationDays,
        progress: Math.min(1, Math.max(0, progress)),
        status: i.status,
        overdue: !isMilestone && endMs < now.value.getTime() && i.status !== "done" && i.status !== "cancelled",
        isMilestone,
        assignee: i.assignee,
        dependencies: i.dependencies || [],
        category: i.assignee || i.issue_type || "task",
      };
    })
);

async function fetchData() {
  if (!projectKey.value) return;
  refreshing.value = true;
  try {
    const res = await getIssueList({ project_key: projectKey.value, pageSize: 500 });
    rawIssues.value = (res.data?.list as Issue[]) ?? [];
    lastUpdated.value = new Date().toLocaleTimeString("zh-CN");
  } catch {
    // Errors handled by global interceptor
  } finally {
    refreshing.value = false;
  }
}

function goToIssue(taskId: string) {
  router.push(`/issue/${taskId}`);
}

function goBack() {
  router.push(`/project/${projectKey.value}`);
}

onMounted(() => {
  fetchData();
  pollTimer = setInterval(fetchData, POLL_INTERVAL);
});

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped lang="scss">
.gantt-view {
  height: calc(100vh - 120px);
  padding: 20px;
  overflow: auto;
}
.gantt-view__head {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  h2 {
    margin: 0;
    font-size: 18px;
  }
}
.gantt-view__updated {
  margin-left: auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>