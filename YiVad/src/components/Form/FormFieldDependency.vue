<script setup lang="ts">
/**
 * Conditional container for a form field.
 * Wraps a form field and applies visibility/disable/required states from conditional logic or field dependency rules.
 */
defineProps<{
  visible?: boolean;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  label: string;
  prop: string;
  rules?: any[];
}>();

defineSlots<{
  default(): any;
}>();
</script>

<template>
  <Transition name="el-fade-in-linear">
    <div v-if="visible !== false" class="form-field-dependency" :class="{ 'is-disabled': disabled, 'is-loading': loading }">
      <el-form-item :prop="prop" :label="label" :required="required" :rules="rules">
        <div v-loading="loading" class="form-field-dependency__inner">
          <slot />
        </div>
      </el-form-item>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.form-field-dependency {
  &.is-disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &__inner {
    width: 100%;
  }
}
</style>