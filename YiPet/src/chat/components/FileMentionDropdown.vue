<script setup lang="ts">
/**
 * YiPet Chat — FileMentionDropdown (Vue 3 SFC)
 */
import { computed } from 'vue';
import { useChatStore } from '../stores/chat';

const props = defineProps<{
  query: string;
  visible: boolean;
}>();

defineEmits<{
  close: [];
  select: [path: string];
}>();

const store = useChatStore();

const matches = computed(() => {
  if (!props.visible || !props.query) return [];
  return store.knowledgeFileMatches?.(props.query, 8) || [];
});
</script>

<template>
  <div v-if="visible && matches.length > 0" class="mention-dropdown">
    <div
      v-for="m in matches"
      :key="m.path"
      class="mention-item"
      @click="$emit('select', m.path)"
    >
      <span class="mention-path">{{ m.path }}</span>
    </div>
  </div>
  <div v-else-if="visible && query" class="mention-dropdown">
    <div class="mention-empty">No files match "{{ query }}"</div>
  </div>
</template>

<style lang="scss" scoped>
.mention-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: var(--bg-elevated, #1e1a3b);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
  border-radius: 8px;
  margin-bottom: 4px;
  z-index: 100;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.mention-item {
  padding: 6px 10px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-primary, #f5f3ff);

  &:hover {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  }
}

.mention-path {
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.mention-empty {
  padding: 8px 10px;
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);
}
</style>