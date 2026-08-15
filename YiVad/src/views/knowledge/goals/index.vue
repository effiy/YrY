<template>
  <div class="goals">
    <div class="goals__head">
      <h1 class="goals__title">Goals &amp; Objectives</h1>
      <el-tag size="small" type="info">{{ goalCount }} objectives · {{ roleCount }} roles</el-tag>
      <div class="goals__nav">
        <el-button size="small" text type="primary" :icon="House" @click="go('/home/index')">Home</el-button>
        <el-button size="small" text type="primary" :icon="Aim" @click="go('/executiver/okr')">OKR Dashboard</el-button>
      </div>
    </div>

    <div v-for="role in roles" :key="role.id" class="goals__role">
      <div class="goals__role-head" @click="go(`/executiver/okr/${role.id}`)">
        <span class="goals__role-icon">{{ role.icon }}</span>
        <span class="goals__role-name">{{ role.name }}</span>
        <span class="goals__role-desc">{{ role.description }}</span>
        <el-icon class="goals__role-arrow"><ArrowRight /></el-icon>
      </div>

      <div class="goals__grid">
        <el-card
          v-for="g in goalsOf(role.id)"
          :key="g.id"
          class="goals__card"
          shadow="hover"
          @click="go(`/executiver/okr/${role.id}?goal=${g.id}`)"
        >
          <div class="goals__card-top">
            <span class="goals__card-icon">{{ g.icon }}</span>
            <code class="goals__card-id">{{ g.id }}</code>
            <el-tag :type="statusType(g.status)" size="small" class="goals__card-status">{{ g.status }}</el-tag>
          </div>
          <div class="goals__card-title">{{ g.title }}</div>
          <div class="goals__card-meta">{{ g.period }} · {{ g.owner }} · {{ g.project }}</div>
          <div class="goals__card-krs">
            <div v-for="kr in g.keyResults" :key="kr.text" class="goals__kr">
              <el-progress :percentage="kr.progress" :stroke-width="5" :status="kr.progress >= 100 ? 'success' : undefined" />
              <span class="goals__kr-text">{{ kr.text }}</span>
            </div>
          </div>
          <div class="goals__card-avg">
            <span>Avg progress</span>
            <b>{{ krAvg(g) }}%</b>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="knowledgeGoals">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { House, Aim, ArrowRight } from "@element-plus/icons-vue";
import { ROLE_IDS, rolesData, goalsData } from "@/views/knowledge/executiver/okrData";
import type { GoalItem } from "@/views/knowledge/executiver/okrData";

const router = useRouter();

const roles = computed(() => ROLE_IDS.map(id => rolesData[id]).filter(Boolean));
const roleCount = computed(() => roles.value.length);
const goalCount = computed(() => roles.value.reduce((n, r) => n + (goalsData[r.id] || []).length, 0));

function goalsOf(roleId: string): GoalItem[] {
  return goalsData[roleId] || [];
}

function krAvg(goal: GoalItem): number {
  if (!goal.keyResults.length) return 0;
  return Math.round(goal.keyResults.reduce((s, kr) => s + kr.progress, 0) / goal.keyResults.length);
}

function statusType(status: string): "primary" | "success" | "info" | "danger" {
  if (status === "active") return "primary";
  if (status === "done") return "success";
  if (status === "blocked") return "danger";
  return "info";
}

function go(path: string) {
  router.push(path);
}
</script>

<style scoped lang="scss">
.goals {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 95px);
  min-height: 0;
  padding: 24px;
  overflow: auto;
  background: var(--el-bg-color-page);
}
.goals__head {
  display: flex;
  gap: 10px;
  align-items: center;
}
.goals__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}
.goals__nav {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-left: auto;
}
.goals__role {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.goals__role-head {
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
  &:hover .goals__role-name {
    color: var(--el-color-primary);
  }
}
.goals__role-icon {
  font-size: 18px;
}
.goals__role-name {
  font-size: 15px;
  font-weight: 700;
  transition: color 0.15s;
}
.goals__role-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goals__role-arrow {
  margin-left: auto;
  color: var(--el-text-color-secondary);
}
.goals__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}
.goals__card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.goals__card-top {
  display: flex;
  gap: 6px;
  align-items: center;
}
.goals__card-icon {
  font-size: 16px;
}
.goals__card-id {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.goals__card-status {
  margin-left: auto;
}
.goals__card-title {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}
.goals__card-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.goals__card-krs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.goals__kr {
  display: flex;
  flex-direction: column;
  gap: 3px;
  :deep(.el-progress) {
    width: 100%;
  }
}
.goals__kr-text {
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-regular);
}
.goals__card-avg {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 8px;
  b {
    font-variant-numeric: tabular-nums;
    color: var(--el-text-color-primary);
  }
}
</style>
