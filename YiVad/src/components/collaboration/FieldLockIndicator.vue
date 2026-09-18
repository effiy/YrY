<script setup lang="ts">
/**
 * Shows a lock indicator on a form field when another user is editing it.
 */
defineProps<{
  lockedBy?: string | null;
}>();

defineSlots<{
  default(): any;
}>();
</script>

<template>
  <div class="field-lock-indicator" :class="{ 'is-locked': !!lockedBy }">
    <div class="field-lock-indicator__content">
      <slot />
    </div>
    <Transition name="el-fade-in">
      <div v-if="lockedBy" class="field-lock-indicator__overlay">
        <el-icon><Lock /></el-icon>
        <span>{{ lockedBy }} 正在编辑</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.field-lock-indicator {
  position: relative;
  &.is-locked &__content {
    pointer-events: none;
    opacity: 0.5;
  }
  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    background: rgb(var(--el-bg-color-rgb), 0.7);
    border-radius: 4px;
  }
}
</style>
