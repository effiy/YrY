<script setup lang="ts">
import { computed } from "vue";

interface Step {
  id: string;
  label: string;
  status: "pending" | "active" | "completed" | "failed";
}

const props = defineProps<{
  steps: Step[];
  visible: boolean;
  error?: string | null;
  retryCount?: number;
  maxRetries?: number;
}>();

const emit = defineEmits<{
  (e: "retry"): void;
  (e: "close"): void;
}>();

const progressPercent = computed(() => {
  const completed = props.steps.filter((s) => s.status === "completed").length;
  return Math.round((completed / props.steps.length) * 100);
});

const statusIcon = computed(() => {
  const hasFailed = props.steps.some((s) => s.status === "failed");
  if (hasFailed) return "error";
  const allDone = props.steps.every((s) => s.status === "completed");
  if (allDone) return "success";
  return "loading";
});

function stepIcon(status: string) {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "error";
    case "active":
      return "loading";
    default:
      return "pending";
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="form-submission-overlay">
        <div class="form-submission-progress">
          <div class="form-submission-progress__header">
            <el-icon
              :class="`status-${statusIcon}`"
              :size="24"
            >
              <SuccessFilled v-if="statusIcon === 'success'" />
              <WarningFilled v-else-if="statusIcon === 'error'" />
              <Loading v-else />
            </el-icon>
            <span class="form-submission-progress__title">
              {{ statusIcon === 'success' ? '提交成功' : statusIcon === 'error' ? '提交失败' : '正在提交...' }}
            </span>
          </div>

          <div class="form-submission-progress__bar">
            <div
              class="form-submission-progress__bar-fill"
              :style="{ width: `${progressPercent}%` }"
              :class="{ 'is-error': statusIcon === 'error', 'is-success': statusIcon === 'success' }"
            />
          </div>

          <ul class="form-submission-progress__steps">
            <li
              v-for="step in steps"
              :key="step.id"
              class="form-submission-progress__step"
              :class="`is-${step.status}`"
            >
              <el-icon :size="14">
                <SuccessFilled v-if="step.status === 'completed'" />
                <WarningFilled v-else-if="step.status === 'failed'" />
                <Loading v-else-if="step.status === 'active'" />
                <MoreFilled v-else />
              </el-icon>
              <span>{{ step.label }}</span>
            </li>
          </ul>

          <div v-if="error" class="form-submission-progress__error">
            <p>{{ error }}</p>
            <p v-if="retryCount && maxRetries">
              已重试 {{ retryCount }}/{{ maxRetries }} 次
            </p>
          </div>

          <div class="form-submission-progress__actions">
            <el-button v-if="statusIcon === 'error'" type="primary" @click="emit('retry')">
              重试
            </el-button>
            <el-button v-if="statusIcon === 'success'" type="primary" @click="emit('close')">
              完成
            </el-button>
            <el-button v-if="statusIcon === 'loading'" text @click="emit('close')">
              后台提交
            </el-button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.form-submission-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.form-submission-progress {
  width: 420px;
  max-height: 80vh;
  padding: 32px;
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .status-loading { color: var(--el-color-primary); animation: spin 1s linear infinite; }
    .status-success { color: var(--el-color-success); }
    .status-error { color: var(--el-color-danger); }
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
  }

  &__bar {
    height: 4px;
    background: var(--el-fill-color);
    border-radius: 2px;
    margin-bottom: 16px;
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    background: var(--el-color-primary);
    border-radius: 2px;
    transition: width 0.3s ease;

    &.is-success { background: var(--el-color-success); }
    &.is-error { background: var(--el-color-danger); }
  }

  &__steps {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__step {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);

    &.is-active { color: var(--el-color-primary); }
    &.is-completed { color: var(--el-color-success); }
    &.is-failed { color: var(--el-color-danger); }
  }

  &__error {
    margin-top: 12px;
    padding: 10px 12px;
    background: var(--el-color-danger-light-9);
    border-radius: 6px;
    font-size: 13px;
    color: var(--el-color-danger);

    p { margin: 0; }
    p + p { margin-top: 4px; }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 20px;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>