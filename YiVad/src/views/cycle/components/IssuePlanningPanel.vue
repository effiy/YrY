<template>
  <el-drawer
    v-model="visible"
    :title="`Sprint Planning: ${cycle?.name || ''}`"
    size="800px"
    direction="rtl"
    destroy-on-close
    @closed="emit('closed')"
  >
    <div v-loading="loading" class="planning">
      <div class="planning__columns">
        <!-- Backlog -->
        <div class="planning__col">
          <div class="planning__col-head">
            <span>Backlog</span>
            <el-tag size="small" round>{{ backlogIssues.length }}</el-tag>
          </div>
          <div class="planning__col-body">
            <div
              v-for="issue in backlogIssues"
              :key="issue.key"
              class="planning__card"
            >
              <div class="planning__card-title">{{ issue.title }}</div>
              <div class="planning__card-meta">
                <el-tag size="small" effect="plain">{{ typeLabel(issue.issue_type) }}</el-tag>
                <span :style="{ color: priorityColor(issue.priority) }">{{ priorityLabel(issue.priority) }}</span>
              </div>
              <el-button size="small" type="primary" @click="addToCycle(issue)">Add to Sprint</el-button>
            </div>
            <el-empty v-if="!backlogIssues.length" description="No backlog issues" :image-size="40" />
          </div>
        </div>

        <!-- Sprint Issues -->
        <div class="planning__col planning__col--active">
          <div class="planning__col-head">
            <span>Sprint Issues</span>
            <el-tag size="small" round type="primary">{{ sprintIssues.length }}</el-tag>
          </div>
          <div class="planning__col-body">
            <div
              v-for="issue in sprintIssues"
              :key="issue.key"
              class="planning__card"
            >
              <div class="planning__card-title">{{ issue.title }}</div>
              <div class="planning__card-meta">
                <el-tag size="small" effect="plain">{{ typeLabel(issue.issue_type) }}</el-tag>
                <span :style="{ color: priorityColor(issue.priority) }">{{ priorityLabel(issue.priority) }}</span>
                <span>{{ issue.estimate_points ? issue.estimate_points + ' pts' : '' }}</span>
              </div>
              <el-button size="small" type="danger" @click="removeFromCycle(issue)">Remove</el-button>
            </div>
            <el-empty v-if="!sprintIssues.length" description="No issues in sprint" :image-size="40" />
          </div>
        </div>
      </div>

      <div v-if="cycle" class="planning__summary">
        <span>{{ sprintIssues.length }} issues · {{ totalPoints }} pts · {{ sprintIssues.filter(i => i.status === 'done').length }} done</span>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import { useIssueStore } from "@/stores/modules/issue";
import { useCycleStore } from "@/stores/modules/cycle";
import { ISSUE_TYPE_MAP, ISSUE_PRIORITY_MAP, typeLabel } from "@/api/modules/issueService";
import type { Issue, IssuePriority } from "@/api/modules/issueService";
import type { Cycle } from "@/api/modules/cycleService";

const props = defineProps<{
  modelValue: boolean;
  cycle: Cycle | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "closed"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v)
});

const issueStore = useIssueStore();
const cycleStore = useCycleStore();

const loading = ref(false);
const allIssues = ref<Issue[]>([]);

const backlogIssues = computed(() =>
  allIssues.value.filter(i => !props.cycle?.issue_keys?.includes(i.key) && i.status !== "done" && i.status !== "cancelled")
);

const sprintIssues = computed(() =>
  allIssues.value.filter(i => props.cycle?.issue_keys?.includes(i.key))
);

const totalPoints = computed(() =>
  sprintIssues.value.reduce((sum, i) => sum + (i.estimate_points || 0), 0)
);

watch(() => props.cycle, async (c) => {
  if (!c) return;
  loading.value = true;
  try {
    await issueStore.fetchIssues({ project_key: c.project_key, pageSize: 200 });
    allIssues.value = issueStore.issues;
  } finally {
    loading.value = false;
  }
}, { immediate: true });

async function addToCycle(issue: Issue) {
  if (!props.cycle) return;
  await cycleStore.addIssueToCycle(props.cycle.key, issue.key);
  ElMessage.success(`"${issue.title}" added to sprint`);
  allIssues.value = [...allIssues.value]; // trigger reactivity
}

async function removeFromCycle(issue: Issue) {
  if (!props.cycle) return;
  await cycleStore.removeIssueFromCycle(props.cycle.key, issue.key);
  ElMessage.success(`"${issue.title}" removed from sprint`);
  allIssues.value = [...allIssues.value];
}

function priorityLabel(p: IssuePriority) { return ISSUE_PRIORITY_MAP[p] || p; }
function priorityColor(p: IssuePriority) {
  const m: Record<IssuePriority, string> = { urgent: "#f56c6c", high: "#e6a23c", medium: "#409eff", low: "#909399", none: "#c0c4cc" };
  return m[p] || "#909399";
}
</script>

<style scoped lang="scss">
.planning {
  padding: 0 4px;
}
.planning__columns {
  display: flex;
  gap: 16px;
  min-height: 400px;
}
.planning__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.planning__col--active {
  border: 1px solid var(--el-color-primary-light-5);
}
.planning__col-head {
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  background: var(--el-bg-color);
  flex-shrink: 0;
}
.planning__col-body {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.planning__card {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.planning__card-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}
.planning__card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}
.planning__summary {
  margin-top: 16px;
  padding: 12px;
  background: var(--el-fill-color);
  border-radius: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
</style>