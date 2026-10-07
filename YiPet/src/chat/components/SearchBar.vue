<script setup lang="ts">
/**
 * YiPet Chat — SearchBar (Vue 3 SFC)
 * Header bar: search input + New session + Batch manage buttons.
 * Matches YiVad aiChat's ConversationSessionSidebar header style.
 */
import { ref } from 'vue';
import { Search, Plus, Operation } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';

const store = useChatStore();
const s = store.state;

const creating = ref(false);
const searchQuery = ref('');

function onInput(val: string) {
  searchQuery.value = val;
  store.setSearchInput(val);
  store.setSearchQuery(val);
}

function onClear() {
  searchQuery.value = '';
  store.setSearchInput('');
  store.setSearchQuery('');
}

async function onNewSession() {
  if (creating.value) return;
  creating.value = true;
  try {
    await store.createEmptySession();
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <!-- Normal header -->
  <div v-if="!s.batchMode" class="yipet-sidebar-header">
    <el-input
      v-model="searchQuery"
      size="small"
      clearable
      :prefix-icon="Search"
      placeholder="Filter sessions by title or tag..."
      @input="onInput(($event as string) || '')"
      @clear="onClear"
    />
    <el-button size="small" type="primary" :icon="Plus" :loading="creating" title="New session" @click="onNewSession" />
    <el-button size="small" :icon="Operation" title="Batch manage" @click="store.toggleBatchMode()" />
  </div>

  <!-- Batch mode header -->
  <div v-else class="yipet-sidebar-header yipet-sidebar-header--batch">
    <span class="yipet-batch-title">
      <span class="yipet-batch-count">{{ s.selectedSessionIds.length }}</span>
      selected
    </span>
    <el-button size="small" text @click="store.toggleBatchMode()">Done</el-button>
  </div>
</template>

<style lang="scss" scoped>
.yipet-sidebar-header {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.15);

  .el-input { flex: 1; min-width: 0; }
  .el-button { flex-shrink: 0; }
}

.yipet-sidebar-header--batch {
  justify-content: space-between;
}

.yipet-batch-title {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #f5f3ff);
}

.yipet-batch-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: var(--primary-light, var(--el-color-primary));
  border-radius: 50%;
}

:deep(.el-input__wrapper) {
  background: var(--input-bg, #181730);
  border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  border-radius: 6px;
  box-shadow: none;

  &:hover { border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.35); }
  &.is-focus {
    border-color: var(--primary-light, var(--el-color-primary));
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  }
}

:deep(.el-input__inner) {
  color: var(--text-primary, #f5f3ff);
  font-size: 12px;
  &::placeholder { color: var(--text-secondary, #d4d0e8); }
}

:deep(.el-input__prefix) { color: var(--text-secondary, #d4d0e8); }
:deep(.el-input__clear) { color: var(--text-secondary, #d4d0e8); }
</style>