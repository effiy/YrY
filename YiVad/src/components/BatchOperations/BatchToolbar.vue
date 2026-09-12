<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="selectedCount > 0" class="batch-toolbar">
        <span class="batch-toolbar__count">{{ selectedCount }} selected</span>
        <div class="batch-toolbar__actions">
          <slot />
          <el-button size="small" @click="$emit('edit')">Edit</el-button>
          <el-button size="small" @click="$emit('move')">Move</el-button>
          <el-button size="small" @click="$emit('copy')">Copy</el-button>
          <el-button size="small" @click="$emit('tag')">Tag</el-button>
          <el-button size="small" @click="$emit('import')">Import</el-button>
          <el-button size="small" @click="$emit('mail')">Mail</el-button>
          <el-button size="small" type="danger" @click="$emit('delete')">Delete</el-button>
          <el-button size="small" text @click="$emit('clear')">Clear</el-button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ selectedCount: number }>();
defineEmits<{ edit: []; move: []; copy: []; tag: []; import: []; mail: []; delete: []; clear: [] }>();
</script>

<style scoped lang="scss">
.batch-toolbar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1500;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  box-shadow: var(--el-box-shadow-dark);
  &__count { font-weight: 600; font-size: 13px; white-space: nowrap; }
  &__actions { display: flex; gap: 6px; align-items: center; }
}
.slide-up-enter-active,
.slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from,
.slide-up-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>