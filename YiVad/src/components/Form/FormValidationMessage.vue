<script setup lang="ts">
import type { FieldValidationState } from "@/utils/validation/types";

defineProps<{
  state: FieldValidationState;
  showIcon?: boolean;
}>();

defineEmits<{
  (e: "clear"): void;
}>();
</script>

<template>
  <div v-if="state.errors.length > 0" class="form-validation-message" role="alert">
    <span v-if="showIcon !== false" class="form-validation-message__icon">
      <el-icon><WarningFilled /></el-icon>
    </span>
    <span class="form-validation-message__text">{{ state.errors[0] }}</span>
  </div>
  <div v-else-if="state.status === 'valid' && state.dirty" class="form-validation-message form-validation-message--valid">
    <span class="form-validation-message__icon">
      <el-icon><SuccessFilled /></el-icon>
    </span>
  </div>
</template>

<style scoped lang="scss">
.form-validation-message {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-color-danger);

  &--valid {
    color: var(--el-color-success);
  }

  &__icon {
    flex-shrink: 0;
    font-size: 14px;
  }

  &__text {
    flex: 1;
  }
}
</style>