<!--
  FileMentionDropdown — @-triggered fuzzy file search for YiKnowledge files.
  Appears above the chat input when the user types "@" followed by search text.
-->
<script setup lang="ts" name="aiChatFileMentionDropdown">
import { ref, watch, computed } from "vue";
import { useAicrKnowledgeStore } from "@/stores/modules/aicr/knowledge";

const props = defineProps<{
  visible: boolean;
  query: string;
}>();

const emit = defineEmits<{
  (e: "select", path: string): void;
  (e: "close"): void;
}>();

const knowledgeStore = useAicrKnowledgeStore();

// ── File list ──
interface MentionFile {
  path: string;
  name: string;
  category: string;
}

const flatMentionFiles = computed<MentionFile[]>(() => {
  return knowledgeStore.flatFiles.map(f => ({
    path: f.path,
    name: f.name,
    category: f.category,
  }));
});

const loaded = ref(false);

watch(() => props.visible, async (v) => {
  if (v && !loaded.value) {
    try {
      await knowledgeStore.loadAll();
      loaded.value = true;
    } catch {
      /* ignore */
    }
  }
});

// ── Fuzzy filter ──
const filtered = computed(() => {
  const q = props.query.toLowerCase().trim();
  const files = flatMentionFiles.value;
  if (!q) return files.slice(0, 20);
  return files
    .filter(f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
    .slice(0, 12);
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
    <template v-if="knowledgeStore.loading && !flatMentionFiles.length">
      <div class="fmd-loading">Loading files...</div>
    </template>
    <template v-else>
      <div v-if="!filtered.length" class="fmd-empty">
        {{ flatMentionFiles.length ? "No matching files" : "No knowledge files available" }}
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
    </template>
  </div>
</template>

<style scoped lang="scss">
.fmd-dropdown {
  position: absolute;
  bottom: 100%;
  left: 12px;
  right: 12px;
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
}
.fmd-loading,
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
