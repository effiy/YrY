<template>
  <el-tooltip v-if="goal" placement="top" :show-after="300">
    <template #content>
      <div class="goal-cell__tip">
        <p class="goal-cell__tip-desc">{{ goal.description }}</p>
        <div class="goal-cell__tip-row"><span>Owner</span><b>{{ goal.owner }}</b></div>
        <div class="goal-cell__tip-row"><span>Project</span><b>{{ goal.project }}</b></div>
        <div class="goal-cell__tip-krs">
          <div v-for="(kr, i) in goal.keyResults" :key="i" class="goal-cell__tip-kr">
            <span>{{ kr.text }}</span>
            <b>{{ kr.progress }}%</b>
          </div>
        </div>
      </div>
    </template>

    <!-- 表格单元格：完整三行（标题 / 元信息 / 进度） -->
    <div v-if="!compact" class="goal-cell">
      <div class="goal-cell__head" @click="navigate">
        <span class="goal-cell__icon">{{ goal.icon }}</span>
        <span class="goal-cell__title">{{ goal.title }}</span>
      </div>
      <div class="goal-cell__meta">
        <el-tag :type="statusTagType(goal.status)" size="small" effect="light">{{ goal.status }}</el-tag>
        <span class="goal-cell__period">{{ goal.period }}</span>
        <code class="goal-cell__id">{{ goal.id }}</code>
      </div>
      <div class="goal-cell__progress">
        <el-progress :percentage="avg" :status="krStatus(avg)" :stroke-width="4" :show-text="false" />
        <span class="goal-cell__avg">{{ avg }}%</span>
      </div>
    </div>

    <!-- 内联（列表/卡片）：单行 chip，悬停看完整详情 -->
    <span v-else class="goal-cell__compact" @click="navigate">
      <span class="goal-cell__icon">{{ goal.icon }}</span>
      <span class="goal-cell__title">{{ goal.title }}</span>
      <el-tag :type="statusTagType(goal.status)" size="small" effect="light">{{ goal.status }}</el-tag>
    </span>
  </el-tooltip>
  <code v-else class="goal-cell__missing" @click="navigate">{{ goalId }}</code>
</template>

<script setup lang="ts" name="GoalCell">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { allGoalsMap } from "@/views/knowledge/executiver/okrData";

const props = defineProps<{ role: string; goalId: string; compact?: boolean }>();
const router = useRouter();

const goal = computed(() => allGoalsMap[props.goalId]);

/** 目标整体进度 = 各 Key Result 进度的均值（与 okrRole.vue 一致）。 */
const avg = computed(() => {
  const krs = goal.value?.keyResults ?? [];
  if (!krs.length) return 0;
  return Math.round(krs.reduce((s, kr) => s + Number(kr.progress), 0) / krs.length);
});

function navigate() {
  if (props.goalId && props.role) router.push(`/executiver/okr/${props.role}?goal=${props.goalId}`);
}

function statusTagType(status: string) {
  return status === "active" ? "success" : status === "planned" ? "warning" : status === "blocked" ? "danger" : "info";
}

function krStatus(pct: number): "success" | "warning" | "exception" | undefined {
  if (pct >= 100) return "success";
  if (pct >= 70) return undefined;
  if (pct >= 40) return "warning";
  return "exception";
}
</script>

<style scoped lang="scss">
.goal-cell { display: flex; flex-direction: column; gap: 4px; line-height: 1.4; }
.goal-cell__head { display: flex; align-items: center; gap: 6px; cursor: pointer; min-width: 0; }
.goal-cell__icon { font-size: 14px; flex-shrink: 0; }
.goal-cell__title {
  flex: 1; min-width: 0;
  font-size: 13px; font-weight: 600; color: var(--el-text-color-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  transition: color 0.15s;
  &:hover { color: var(--el-color-primary); }
}
.goal-cell__meta { display: flex; align-items: center; gap: 6px; }
.goal-cell__period { font-size: 11px; color: var(--el-text-color-secondary); }
.goal-cell__id { font-family: monospace; font-size: 11px; color: var(--el-text-color-secondary); }
.goal-cell__progress { display: flex; align-items: center; gap: 8px; }
.goal-cell__progress :deep(.el-progress) { flex: 1; }
.goal-cell__avg { font-size: 11px; color: var(--el-text-color-secondary); min-width: 30px; text-align: right; }
.goal-cell__missing { font-family: monospace; font-size: 11px; color: var(--el-color-primary); cursor: pointer; &:hover { text-decoration: underline; } }

.goal-cell__compact {
  display: inline-flex; align-items: center; gap: 5px; cursor: pointer; min-width: 0;
  .goal-cell__title {
    flex: none; max-width: 180px;
    font-size: 12px; font-weight: 500;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    transition: color 0.15s;
    &:hover { color: var(--el-color-primary); }
  }
}

.goal-cell__tip { max-width: 320px; }
.goal-cell__tip-desc { margin: 0 0 8px; font-size: 12px; line-height: 1.5; color: var(--el-text-color-regular); }
.goal-cell__tip-row { display: flex; justify-content: space-between; gap: 16px; font-size: 12px; margin-bottom: 4px; span { color: var(--el-text-color-secondary); } b { color: var(--el-text-color-primary); font-weight: 500; } }
.goal-cell__tip-krs { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--el-border-color-lighter); }
.goal-cell__tip-kr { display: flex; justify-content: space-between; gap: 16px; font-size: 12px; margin-bottom: 4px; span { color: var(--el-text-color-regular); } b { color: var(--el-color-primary); font-weight: 500; } }
</style>
