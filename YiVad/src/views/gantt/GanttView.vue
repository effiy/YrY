<template>
  <div class="gantt-view">
    <div class="gantt-view__head">
      <el-button text :icon="ArrowLeft" @click="goBack">返回项目</el-button>
      <h2>{{ projectName }} · 甘特图</h2>
    </div>
    <GanttChart :tasks="ganttTasks" :project-key="projectKey" />
  </div>
</template>

<script setup lang="ts" name="GanttView">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import { getIssueList, type Issue } from "@/api/modules/issueService";
import GanttChart from "@/components/gantt/GanttChart.vue";
import type { GanttTask } from "@/types/gantt";

const route = useRoute();
const router = useRouter();

const projectKey = computed(() => (route.params.key as string) || "");
const projectName = ref("");
const rawIssues = ref<Issue[]>([]);

const ganttTasks = computed<GanttTask[]>(() =>
  rawIssues.value
    .filter((i) => (i as any).start_date && (i as any).end_date)
    .map((i) => ({
      id: (i as any).key,
      key: (i as any).key,
      title: (i as any).title || (i as any).name || "",
      start_date: (i as any).start_date,
      end_date: (i as any).end_date,
      progress: (i as any).status === "done" ? 1 : (i as any).status === "in_progress" ? 0.5 : 0,
      status: (i as any).status || "open",
      assignee: (i as any).assignee,
      dependencies: (i as any).dependencies || [],
    })),
);

onMounted(async () => {
  if (!projectKey.value) return;
  try {
    const res = await getIssueList({ project_key: projectKey.value, pageSize: 500 });
    rawIssues.value = (res.data?.list as Issue[]) ?? [];
  } catch {
    // Errors handled by global interceptor
  }
});

function goBack() {
  router.push(`/project/${projectKey.value}`);
}
</script>

<style scoped lang="scss">
.gantt-view {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow: auto;
}
.gantt-view__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  h2 { margin: 0; font-size: 18px; }
}
</style>