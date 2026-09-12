<script setup lang="ts">
import type { WizardStep } from "@/hooks/useFormWizard";

defineProps<{
  steps: WizardStep[];
  currentStepIndex: number;
  completedSteps: Set<number>;
  progressPercent: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}>();

const emit = defineEmits<{
  (e: "prev"): void;
  (e: "next"): void;
  (e: "submit"): void;
  (e: "go-to", index: number): void;
}>();
</script>

<template>
  <div class="form-wizard">
    <!-- Step navigation -->
    <div class="form-wizard__steps">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="form-wizard__step"
        :class="{
          'is-active': index === currentStepIndex,
          'is-completed': completedSteps.has(index),
          'is-clickable': completedSteps.has(index) || index <= currentStepIndex,
        }"
        @click="completedSteps.has(index) || index <= currentStepIndex ? emit('go-to', index) : undefined"
      >
        <div class="form-wizard__step-indicator">
          <el-icon v-if="completedSteps.has(index)"><Check /></el-icon>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="form-wizard__step-content">
          <span class="form-wizard__step-title">{{ step.title }}</span>
          <span v-if="step.description" class="form-wizard__step-desc">{{ step.description }}</span>
        </div>
      </div>
    </div>

    <!-- Progress bar -->
    <el-progress :percentage="progressPercent" :stroke-width="4" :show-text="false" />

    <!-- Step content slot -->
    <div class="form-wizard__body">
      <slot :step="steps[currentStepIndex]" :index="currentStepIndex" />
    </div>

    <!-- Actions -->
    <div class="form-wizard__actions">
      <el-button v-if="!isFirstStep" @click="emit('prev')">
        上一步
      </el-button>
      <el-button v-if="!isLastStep" type="primary" @click="emit('next')">
        下一步
      </el-button>
      <el-button v-if="isLastStep" type="primary" @click="emit('submit')">
        提交
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.form-wizard {
  &__steps {
    display: flex;
    gap: 0;
    margin-bottom: 16px;
  }

  &__step {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    padding: 12px 16px;
    position: relative;
    cursor: default;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 0;
      width: 100%;
      height: 2px;
      background: var(--el-border-color);
      z-index: 0;
    }

    &:last-child::after { display: none; }

    &.is-completed::after {
      background: var(--el-color-primary);
    }

    &.is-clickable {
      cursor: pointer;
    }
  }

  &__step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--el-fill-color);
    color: var(--el-text-color-secondary);
    font-size: 13px;
    font-weight: 600;
    z-index: 1;
    flex-shrink: 0;

    .is-active & {
      background: var(--el-color-primary);
      color: #fff;
    }

    .is-completed & {
      background: var(--el-color-success);
      color: #fff;
    }
  }

  &__step-content {
    z-index: 1;
    display: flex;
    flex-direction: column;
  }

  &__step-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-regular);

    .is-active & { color: var(--el-color-primary); }
    .is-completed & { color: var(--el-color-success); }
  }

  &__step-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__body {
    padding: 24px 0;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>