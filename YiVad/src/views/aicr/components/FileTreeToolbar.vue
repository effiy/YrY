<script setup lang="ts" name="aicrFileTreeToolbar">
import { Plus, Fold } from "@element-plus/icons-vue";
import { useAicrFileTreeStore } from "@/stores/modules/aicr/fileTree";
import { useAicrUiStore } from "@/stores/modules/aicr/ui";

const emit = defineEmits<{
  (e: "new-file"): void;
}>();

const fileTreeStore = useAicrFileTreeStore();
const uiStore = useAicrUiStore();
</script>

<template>
  <div class="ft-toolbar">
    <el-input
      v-model="fileTreeStore.searchQuery"
      placeholder="Search files..."
      clearable
      size="small"
      class="ft-search"
    />
    <el-button type="primary" size="small" :icon="Plus" title="New file" aria-label="New file" @click="emit('new-file')" />
    <el-tooltip :content="uiStore.centerCollapsed ? 'Expand center' : 'Collapse center'" placement="bottom">
      <el-button
        circle
        size="small"
        :icon="Fold"
        :aria-label="uiStore.centerCollapsed ? 'Expand center' : 'Collapse center'"
        @click="uiStore.toggleCenter()"
      />
    </el-tooltip>
  </div>
</template>

<style scoped lang="scss">
.ft-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ft-search {
  flex: 1;
  min-width: 0;
}
</style>
