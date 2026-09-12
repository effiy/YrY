<template>
  <div class="milestone-list">
    <div class="milestone-list__header">
      <span class="milestone-list__count">共 {{ milestones.length }} 个里程碑</span>
      <el-button type="primary" size="small" @click="openEditor()">新建里程碑</el-button>
    </div>

    <div v-if="loading" class="milestone-list__loading">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="!milestones.length" class="milestone-list__empty">
      <el-empty description="暂无里程碑" />
    </div>

    <div v-else class="milestone-list__items">
      <div
        v-for="ms in milestones"
        :key="ms.key"
        class="milestone-card"
        :class="`milestone-card--${ms.health}`"
        @click="openEditor(ms)"
      >
        <div class="milestone-card__head">
          <span class="milestone-card__title">{{ ms.title }}</span>
          <div class="milestone-card__badges">
            <el-tag :type="healthTagType(ms.health)" size="small">
              {{ MILESTONE_HEALTH_MAP[ms.health]?.label }}
            </el-tag>
            <el-tag :color="MILESTONE_STATUS_MAP[ms.status]?.color" size="small" effect="dark">
              {{ MILESTONE_STATUS_MAP[ms.status]?.label }}
            </el-tag>
          </div>
        </div>
        <div class="milestone-card__progress">
          <el-progress
            :percentage="Math.round(ms.progress * 100)"
            :color="progressColor(ms.health)"
            :stroke-width="8"
          />
        </div>
        <div class="milestone-card__meta">
          <span v-if="ms.target_date">目标: {{ ms.target_date }}</span>
          <span>{{ ms.linked_issues?.length || 0 }} 个关联 Issue</span>
        </div>
      </div>
    </div>

    <MilestoneEditor
      v-if="editorVisible"
      :milestone="editingMilestone"
      :project-key="projectKey"
      @close="editorVisible = false"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts" name="MilestoneList">
import { ref, onMounted } from "vue";
import { listMilestones } from "@/api/modules/milestoneService";
import { MILESTONE_HEALTH_MAP, MILESTONE_STATUS_MAP, type Milestone } from "@/types/milestone";
import MilestoneEditor from "./MilestoneEditor.vue";

const props = defineProps<{ projectKey: string }>();

const milestones = ref<Milestone[]>([]);
const loading = ref(true);
const editorVisible = ref(false);
const editingMilestone = ref<Milestone | null>(null);

function healthTagType(health: string) {
  return health === "normal" ? "success" : health === "at_risk" ? "warning" : "danger";
}

function progressColor(health: string) {
  return health === "normal" ? "#67c23a" : health === "at_risk" ? "#e6a23c" : "#f56c6c";
}

function openEditor(ms?: Milestone) {
  editingMilestone.value = ms || null;
  editorVisible.value = true;
}

async function fetchMilestones() {
  loading.value = true;
  try {
    const res = await listMilestones(props.projectKey);
    milestones.value = (res.data?.list as Milestone[]) ?? [];
  } catch {
    // Global error handler
  } finally {
    loading.value = false;
  }
}

async function onSaved() {
  editorVisible.value = false;
  await fetchMilestones();
}

onMounted(fetchMilestones);
</script>

<style scoped lang="scss">
.milestone-list { padding: 8px 0; }
.milestone-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.milestone-list__count { color: var(--el-text-color-secondary); font-size: 13px; }

.milestone-card {
  padding: 12px 16px;
  margin-bottom: 8px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
  &--delayed { border-left: 3px solid #f56c6c; }
  &--at_risk { border-left: 3px solid #e6a23c; }
}
.milestone-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.milestone-card__title { font-weight: 500; }
.milestone-card__badges { display: flex; gap: 6px; }
.milestone-card__progress { margin-bottom: 6px; }
.milestone-card__meta {
  display: flex; gap: 16px; font-size: 12px; color: var(--el-text-color-secondary);
}
</style>