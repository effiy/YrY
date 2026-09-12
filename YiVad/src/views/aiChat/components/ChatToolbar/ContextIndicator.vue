<script setup lang="ts">
import { inject, ref, computed } from "vue";
import { CollectionTag, Delete } from "@element-plus/icons-vue";

const props = withDefaults(
  defineProps<{
    contextFiles?: string[];
    ragToggle?: boolean;
  }>(),
  { contextFiles: () => [], ragToggle: false }
);

const emit = defineEmits<{
  (e: "remove-file", path: string): void;
  (e: "open-file", path: string): void;
}>();

const openKnowledgePreview = inject<(path: string) => void>("openKnowledgePreview", () => {});

const contextPopoverVisible = ref(false);
const contextFileCount = computed(() => (props.contextFiles ?? []).length);

/** Whether RAG is auto-scoped to session context files. */
const ragAutoScoped = computed(() => {
  if (!props.ragToggle || !contextFileCount.value) return false;
  return true;
});

/** RAG is toggled on but has no context files to ground retrieval. */
const ragNoContext = computed(() => props.ragToggle && !contextFileCount.value);

function handleFileClick(path: string) {
  openKnowledgePreview(path);
  contextPopoverVisible.value = false;
}
</script>

<template>
  <el-popover
    v-if="contextFileCount > 0"
    v-model:visible="contextPopoverVisible"
    placement="bottom"
    :width="420"
    trigger="click"
  >
    <template #reference>
      <div class="ct-pill on" title="Current context files">
        <el-icon :size="14"><CollectionTag /></el-icon>
        <span class="ct-pill-label">Context: {{ contextFileCount }}</span>
      </div>
    </template>
    <div class="ct-context-list">
      <div
        v-for="file in (contextFiles ?? [])"
        :key="file"
        class="ct-context-item"
      >
        <span class="ct-context-item-path" title="Click to preview" @click="handleFileClick(file)">{{ file }}</span>
        <el-button
          size="small"
          text
          type="danger"
          :icon="Delete"
          title="Remove from context"
          @click="emit('remove-file', file)"
        />
      </div>
      <div v-if="(contextFiles ?? []).length === 0" class="ct-context-empty">
        No context files loaded
      </div>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
.ct-pill {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 14px;
  transition: all .15s;
  &:hover { border-color: var(--el-border-color); }
  &.on {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
.ct-pill-label { line-height: 1; }

.ct-context-list { max-height: 240px; overflow-y: auto; }
.ct-context-item { display: flex; gap: 4px; align-items: center; padding: 4px 0; font-size: 12px; font-family: "SF Mono", Menlo, monospace; }
.ct-context-item+.ct-context-item { border-top: 1px solid var(--el-border-color-lighter); }
.ct-context-item-path { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--el-color-primary); cursor: pointer; }
.ct-context-item-path:hover { text-decoration: underline; }
.ct-context-empty { padding: 8px 0; font-size: 12px; color: var(--el-text-color-placeholder); text-align: center; }
</style>