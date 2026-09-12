<script setup lang="ts">
import { computed } from "vue";

interface Step {
  id: string;
  title: string;
  fields: string[];
}

const props = defineProps<{
  steps: Step[];
  formData: Record<string, any>;
  currentStepIndex: number;
}>();

const emit = defineEmits<{
  (e: "select-step", index: number): void;
}>();

/** Summary of key data across all steps */
const summary = computed(() => {
  return props.steps.map((step, index) => ({
    step,
    index,
    fields: step.fields.map((field) => ({
      name: field,
      value: props.formData[field],
    })),
  }));
});
</script>

<template>
  <div class="form-wizard-summary">
    <h3 class="form-wizard-summary__title">提交确认</h3>
    <p class="form-wizard-summary__hint">请检查以下信息，确认无误后提交</p>

    <div
      v-for="item in summary"
      :key="item.step.id"
      class="form-wizard-summary__section"
      @click="emit('select-step', item.index)"
    >
      <div class="form-wizard-summary__section-header">
        <h4>{{ item.index + 1 }}. {{ item.step.title }}</h4>
        <el-button text size="small" type="primary">编辑</el-button>
      </div>
      <dl class="form-wizard-summary__fields">
        <div v-for="field in item.fields" :key="field.name" class="form-wizard-summary__field">
          <dt>{{ field.name }}</dt>
          <dd v-if="field.value !== undefined && field.value !== null && field.value !== ''">{{ field.value }}</dd>
          <dd v-else class="form-wizard-summary__empty">未填写</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<style scoped lang="scss">
.form-wizard-summary {
  &__title {
    margin: 0 0 4px;
    font-size: 18px;
  }

  &__hint {
    margin: 0 0 20px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  &__section {
    margin-bottom: 16px;
    padding: 16px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  &__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    h4 {
      margin: 0;
      font-size: 15px;
    }
  }

  &__fields {
    margin: 0;
  }

  &__field {
    display: flex;
    padding: 4px 0;
    font-size: 13px;

    dt {
      min-width: 100px;
      color: var(--el-text-color-secondary);

      &::after {
        content: '：';
      }
    }

    dd {
      margin: 0;
      color: var(--el-text-color-regular);
    }
  }

  &__empty {
    margin: 0;
    color: var(--el-text-color-placeholder);
  }
}
</style>