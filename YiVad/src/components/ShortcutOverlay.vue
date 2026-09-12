<template>
  <Teleport to="body">
    <Transition name="shortcut-overlay">
      <div v-if="visible" class="shortcut-overlay" @click.self="close">
        <div class="shortcut-overlay__panel">
          <div class="shortcut-overlay__header">
            <h2>快捷键</h2>
            <el-input
              v-model="search"
              placeholder="搜索快捷键..."
              size="small"
              clearable
              class="shortcut-overlay__search"
            />
            <el-button text @click="close">✕</el-button>
          </div>
          <div class="shortcut-overlay__body">
            <div v-for="group in filteredGroups" :key="group.category" class="shortcut-overlay__group">
              <h3 class="shortcut-overlay__group-title">{{ group.label }}</h3>
              <div
                v-for="shortcut in group.shortcuts"
                :key="shortcut.id"
                class="shortcut-overlay__item"
              >
                <span class="shortcut-overlay__item-desc">{{ shortcut.description }}</span>
                <el-tag size="small" effect="plain">{{ shortcut.keys || shortcut.sequence?.join(" then ") }}</el-tag>
              </div>
            </div>
            <div v-if="filteredGroups.length === 0" class="shortcut-overlay__empty">
              无匹配的快捷键
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { shortcutRegistry } from "@/shortcuts/registry";
import { SHORTCUT_CATEGORIES } from "@/shortcuts/categories";
import type { ShortcutDefinition } from "@/shortcuts/registry";

const visible = ref(false);
const search = ref("");

const grouped = computed(() => {
  const all = shortcutRegistry.getAllShortcuts().filter((s) => s.keys || s.sequence?.length);
  const map = new Map<string, ShortcutDefinition[]>();
  for (const s of all) {
    const list = map.get(s.category) || [];
    list.push(s);
    map.set(s.category, list);
  }
  return Array.from(map.entries()).map(([category, shortcuts]) => ({
    category,
    label: SHORTCUT_CATEGORIES[category]?.name || category,
    shortcuts,
  }));
});

const filteredGroups = computed(() => {
  if (!search.value.trim()) return grouped.value;
  const q = search.value.trim().toLowerCase();
  return grouped.value
    .map((g) => ({
      ...g,
      shortcuts: g.shortcuts.filter(
        (s) =>
          s.description.toLowerCase().includes(q) ||
          s.keys.toLowerCase().includes(q) ||
          s.sequence?.some((k) => k.toLowerCase().includes(q))
      ),
    }))
    .filter((g) => g.shortcuts.length > 0);
});

function open() {
  visible.value = true;
}

function close() {
  visible.value = false;
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "?" && !(e.target as HTMLElement)?.matches?.("input, textarea, [contenteditable]")) {
    e.preventDefault();
    visible.value ? close() : open();
  }
  if (e.key === "Escape" && visible.value) {
    close();
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
});

defineExpose({ open, close });
</script>

<style scoped lang="scss">
.shortcut-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 15vh;
  background: rgba(0, 0, 0, 0.4);
}

.shortcut-overlay__panel {
  width: 640px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.shortcut-overlay__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  h2 {
    margin: 0;
    font-size: 16px;
    white-space: nowrap;
  }
}

.shortcut-overlay__search {
  flex: 1;
  max-width: 300px;
}

.shortcut-overlay__body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px 20px;
}

.shortcut-overlay__group {
  margin-bottom: 16px;
}

.shortcut-overlay__group-title {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
}

.shortcut-overlay__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.shortcut-overlay__item-desc {
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.shortcut-overlay__empty {
  text-align: center;
  color: var(--el-text-color-placeholder);
  padding: 40px 0;
}

.shortcut-overlay-enter-active,
.shortcut-overlay-leave-active {
  transition: opacity 0.2s ease;

  .shortcut-overlay__panel {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
}

.shortcut-overlay-enter-from,
.shortcut-overlay-leave-to {
  opacity: 0;

  .shortcut-overlay__panel {
    transform: scale(0.95) translateY(-8px);
    opacity: 0;
  }
}
</style>