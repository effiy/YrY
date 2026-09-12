<template>
  <Transition name="slide-down">
    <div v-if="selectedCount > 0" class="row-selection-bar">
      <span class="row-selection-bar__count">
        {{ selectedCount }} selected
      </span>
      <div class="row-selection-bar__actions">
        <slot name="actions" :selected-count="selectedCount" :clear-selection="emit('clear')">
          <el-button size="small" @click="$emit('batchDelete')">Delete</el-button>
          <el-button size="small" @click="$emit('batchMove')">Move</el-button>
          <el-button size="small" @click="$emit('batchCopy')">Copy</el-button>
          <el-button size="small" @click="$emit('batchTag')">Tag</el-button>
        </slot>
        <el-button size="small" text @click="emit('clear')">Clear selection</el-button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{ selectedCount: number }>();
const emit = defineEmits<{
  clear: [];
  batchDelete: [];
  batchMove: [];
  batchCopy: [];
  batchTag: [];
}>();
</script>

<style scoped lang="scss">
.row-selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
  margin-bottom: 8px;
  &__count { font-weight: 500; font-size: 13px; }
  &__actions { display: flex; gap: 8px; align-items: center; }
}
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
</style>