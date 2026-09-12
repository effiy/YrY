<script setup lang="ts">
/**
 * YiPet Chat — SearchBar (Vue 3 SFC)
 * Uses Element Plus el-input matching YiVad aiChat's sidebar search style.
 */
import { Search } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';

const store = useChatStore();
const s = store.state;

function onClear() {
  store.setSearchInput('');
  store.setSearchQuery('');
}
</script>

<template>
  <div class="yipet-sidebar-search">
    <el-input
      :model-value="s.searchInputValue"
      size="small"
      clearable
      :prefix-icon="Search"
      placeholder="Search conversations..."
      @input="store.setSearchInput(($event as string) || '')"
      @keydown.escape="onClear"
      @clear="onClear"
    />
  </div>
</template>

<style lang="scss" scoped>
.yipet-sidebar-search {
  padding: 8px;
}

:deep(.el-input__wrapper) {
  background: var(--input-bg, #181730);
  border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  border-radius: 6px;
  box-shadow: none;

  &:hover { border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.35); }
  &.is-focus {
    border-color: var(--primary-light, #818cf8);
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