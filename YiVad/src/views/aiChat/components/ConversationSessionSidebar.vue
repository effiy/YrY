<script setup lang="ts" name="aiChatConversationSessionSidebar">
import { ref, computed } from "vue";
import { ElMessageBox } from "element-plus";
import { Search, Delete, Operation, Plus } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import ConversationListItem from "./ConversationListItem.vue";

const store = useAiChatStore();

// ── Session list state ──

const searchQuery = ref("");

const filteredConversations = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return store.conversations;
  return store.conversations.filter(
    c =>
      (c.title || "").toLowerCase().includes(q) ||
      c.key.toLowerCase().includes(q) ||
      (c.tags || []).some(t => String(t).toLowerCase().includes(q))
  );
});

const selectedCount = computed(() => store.selectedKeys.size);

async function onSelect(key: string) {
  // If context panel is in "new" mode, cancel it and show the selected session
  store.exitNewContextMode();
  await store.selectConversation(key);
}

async function onRename(key: string, currentTitle: string) {
  const res = await ElMessageBox.prompt("Enter a new title", "Rename conversation", {
    confirmButtonText: "Save",
    cancelButtonText: "Cancel",
    inputValue: currentTitle
  }).catch(() => null);
  if (!res) return;
  await store.renameConversation(key, res.value?.trim() || currentTitle);
}

async function onDelete(key: string, title: string) {
  const res = await ElMessageBox.confirm(`Delete conversation "${title}"?`, "Confirm delete", {
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    type: "warning"
  }).catch(() => null);
  if (!res) return;
  await store.deleteConversation(key);
}

async function onToggleFavorite(key: string) {
  await store.toggleFavorite(key);
}

async function onBulkDelete() {
  if (selectedCount.value === 0) return;
  const res = await ElMessageBox.confirm(
    `Delete ${selectedCount.value} selected conversation(s)?`,
    "Confirm delete",
    { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning" }
  ).catch(() => null);
  if (!res) return;
  await store.bulkDelete();
}

// ── Actions ──

/** "New session" → signals the ContextFilesPanel to enter "new" mode. */
function onNewSession() {
  store.enterNewContextMode();
}
</script>

<template>
  <div class="css-sidebar">
    <!-- ═══ List mode ═══ -->
    <div class="css-header">
      <el-input
        v-model="searchQuery"
        placeholder="Search sessions..."
        clearable
        size="small"
        :prefix-icon="Search"
      />
      <el-button
        size="small"
        type="primary"
        :icon="Plus"
        title="New session"
        aria-label="New session"
        @click="onNewSession"
      />
      <el-button
        v-if="!store.batchMode"
        size="small"
        :icon="Operation"
        title="Batch manage"
        aria-label="Batch manage"
        @click="store.toggleBatchMode()"
      />
    </div>

    <el-scrollbar class="css-list">
      <div v-if="store.loading && !filteredConversations.length" class="css-empty">
        Loading sessions...
      </div>
      <div v-else-if="!filteredConversations.length" class="css-empty">
        {{ searchQuery ? "No matching sessions" : "No sessions yet" }}
      </div>
      <template v-else>
        <ConversationListItem
          v-for="conv in filteredConversations"
          :key="conv.key"
          :conversation="conv"
          :active="store.activeConversation?.key === conv.key"
          @select="onSelect"
          @rename="onRename"
          @delete="onDelete"
          @toggle-favorite="onToggleFavorite"
        />
      </template>
    </el-scrollbar>

    <div v-if="store.batchMode" class="css-batch-bar">
      <span class="css-batch-count">{{ selectedCount }} selected</span>
      <el-button
        size="small"
        type="danger"
        :icon="Delete"
        :disabled="selectedCount === 0"
        @click="onBulkDelete"
      >Delete selected</el-button>
      <el-button size="small" @click="store.toggleBatchMode()">Cancel</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.css-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);
}
.css-header {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.css-list {
  flex: 1;
  min-height: 0;
}
.css-empty {
  padding: 24px 16px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.css-batch-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-top: 1px solid var(--el-border-color-lighter);
}
.css-batch-count {
  flex: 1;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
