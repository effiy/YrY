<template>
  <div class="id-sb-group">
    <div class="id-sb-group__title">
      <el-icon><Connection /></el-icon>
      <span>Links</span>
    </div>
    <div class="id-sb-group__body">
      <div class="id-sb-row">
        <span class="id-sb-row__label">Project</span>
        <span class="id-sb-row__value">
          <el-button link size="small" type="primary" @click="router.push(`/project/${issue.project_key}`)">
            {{ projectName }}
          </el-button>
        </span>
      </div>
      <div v-if="issue.goal_id && goalRoleMap[issue.goal_id]" class="id-sb-row">
        <span class="id-sb-row__label">Goal</span>
        <span class="id-sb-row__value">
          <el-button link size="small" type="success" @click="goGoal(issue.goal_id)">
            {{ goalLabel(issue.goal_id) }}
          </el-button>
        </span>
      </div>
      <div v-if="issue.parent_key" class="id-sb-row">
        <span class="id-sb-row__label">Parent</span>
        <span class="id-sb-row__value">
          <el-button link size="small" type="primary" @click="router.push(`/issue/${issue.parent_key}`)">
            {{ issue.parent_key }}
          </el-button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="IssueSidebarLinks">
import { Connection } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import type { Issue } from "@/api/modules/issueService";
import { goalRoleMap, allGoalsMap } from "@/views/knowledge/executiver/okrData";

const props = defineProps<{ issue: Issue; projectName: string }>();
const router = useRouter();

function goGoal(goalId: string) {
  const role = goalRoleMap[goalId];
  if (role) router.push(`/executiver/okr/${role}?goal=${goalId}`);
}

function goalLabel(goalId: string): string {
  return allGoalsMap[goalId]?.title || goalId;
}
</script>