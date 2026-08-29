<!--
  FileMentionDropdown — @-triggered file search scoped to the session's
  context files (ctx:-tagged).  Appears above the chat input.
-->
<script setup lang="ts" name="aiChatFileMentionDropdown">
import { computed, ref, watch } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";

const props = defineProps<{
  visible: boolean;
  query: string;
}>();

const emit = defineEmits<{
  (e: "select", path: string): void;
  (e: "close"): void;
}>();

const store = useAiChatStore();

const CTX_PREFIX = "ctx:";

interface MentionFile {
  path: string;
  name: string;
}

/** Only the current session's ctx:-tagged files — not the full knowledge base. */
const contextFiles = computed<MentionFile[]>(() => {
  const tags = store.activeConversation?.tags ?? [];
  return tags
    .filter(t => typeof t === "string" && t.startsWith(CTX_PREFIX))
    .map(t => {
      const path = (t as string).slice(CTX_PREFIX.length);
      return { path, name: path.split("/").pop() || path };
    });
});

const filtered = computed(() => {
  const q = props.query.toLowerCase().trim();
  if (!q) return contextFiles.value;
  return contextFiles.value.filter(
    f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)
  );
});

const selectedIdx = ref(0);
watch(() => props.query, () => { selectedIdx.value = 0; });

function onSelect(file: MentionFile) {
  emit("select", file.path);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIdx.value = Math.min(selectedIdx.value + 1, filtered.value.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIdx.value = Math.max(selectedIdx.value - 1, 0);
  } else if (e.key === "Enter") {
    e.preventDefault();
    const f = filtered.value[selectedIdx.value];
    if (f) onSelect(f);
  } else if (e.key === "Escape") {
    e.preventDefault();
    emit("close");
  }
}

defineExpose({ onKeydown });
</script>

<template>
  <div v-if="visible" class="fmd-dropdown">
    <div v-if="!contextFiles.length" class="fmd-empty">
      No context files in this session. Drag files from the knowledge panel or use the context panel to add them.
    </div>
    <div v-else-if="!filtered.length" class="fmd-empty">
      No matching context files
    </div>
    <div
      v-for="(f, i) in filtered"
      :key="f.path"
      class="fmd-item"
      :class="{ 'is-selected': i === selectedIdx }"
      @click="onSelect(f)"
      @mouseenter="selectedIdx = i"
    >
      <span class="fmd-icon">📄</span>
      <span class="fmd-name">{{ f.name }}</span>
      <span class="fmd-path">{{ f.path }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fmd-dropdown {
  position: absolute;
  bottom: 100%;
  left: 12px;
  right: 12px;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
}
.fmd-empty {
  padding: 16px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.fmd-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.1s;
}
.fmd-item:hover,
.fmd-item.is-selected {
  background: var(--el-fill-color-light);
}
.fmd-icon {
  flex-shrink: 0;
  font-size: 14px;
}
.fmd-name {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.fmd-path {
  min-width: 0;
  overflow: hidden;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
