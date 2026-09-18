<script setup lang="ts" name="aiChatConversationSessionSidebar">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { Search, Delete, Operation, Plus, StarFilled } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { useAiChatStore } from "@/stores/modules/aiChat";
import ConversationListItem from "./ConversationListItem.vue";

const store = useAiChatStore();
const { t } = useI18n();
const route = useRoute();

const searchQuery = ref("");

watch(
  () => route.query.tag,
  tag => {
    if (typeof tag === "string" && tag) searchQuery.value = tag;
  },
  { immediate: true }
);

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
const allSelected = computed(
  () => filteredConversations.value.length > 0 && filteredConversations.value.every(c => store.selectedKeys.has(c.key))
);

function onToggleAll(checked: boolean | string | number) {
  if (checked) store.selectAll(filteredConversations.value.map(c => c.key));
  else store.clearSelection();
}

const favoriteCount = computed(() => store.conversations.filter(c => c.isFavorite).length);

async function onSelect(key: string) {
  store.exitNewContextMode();
  store.knowledgeSidebarVisible = false;
  await store.selectConversation(key);
}

async function onRename(key: string, _currentTitle: string) {
  await store.selectConversation(key);
  store.openSessionEdit();
}

async function onDelete(key: string, title: string) {
  const res = await ElMessageBox.confirm(t("aiChat.deleteConfirm", { name: title }), t("aiChat.confirm"), {
    confirmButtonText: t("aiChat.delete"),
    cancelButtonText: t("aiChat.cancel"),
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
  const res = await ElMessageBox.confirm(`Delete ${selectedCount.value} selected conversation(s)?`, "Confirm delete", {
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    type: "warning"
  }).catch(() => null);
  if (!res) return;
  await store.bulkDelete();
}

async function onBulkFavorite() {
  if (selectedCount.value === 0) return;
  const keys = [...store.selectedKeys];
  for (const key of keys) {
    await store.toggleFavorite(key);
  }
  ElMessage.success(`Toggled favorite for ${keys.length} session(s)`);
}

const creating = ref(false);

async function onNewSession() {
  if (creating.value) return;
  creating.value = true;
  try {
    await store.createConversation();
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <div class="css-sidebar">
    <!-- Header: normal mode -->
    <div v-if="!store.batchMode" class="css-header">
      <el-input v-model="searchQuery" placeholder="Search sessions..." clearable size="small" :prefix-icon="Search" />
      <el-button size="small" type="primary" :icon="Plus" :loading="creating" title="New session" @click="onNewSession" />
      <el-button size="small" :icon="Operation" title="Batch manage" @click="store.toggleBatchMode()" />
    </div>
    <!-- Header: batch mode -->
    <div v-else class="css-header css-header--batch">
      <span class="css-batch-title">
        <span class="css-batch-title-icon">{{ selectedCount }}</span>
        selected
      </span>
      <el-button size="small" text @click="onToggleAll(!allSelected)">
        {{ allSelected ? 'Deselect all' : `Select all (${filteredConversations.length})` }}
      </el-button>
      <el-button size="small" type="primary" @click="store.toggleBatchMode()">Done</el-button>
    </div>

    <el-scrollbar class="css-list">
      <div v-if="store.loading && !filteredConversations.length" class="css-empty">
        <span class="css-empty-icon">⏳</span>
        <span>Loading sessions...</span>
      </div>
      <div v-else-if="!filteredConversations.length" class="css-empty">
        <template v-if="searchQuery">
          <span class="css-empty-icon">🔍</span>
          <span>No sessions match "{{ searchQuery }}"</span>
          <el-button size="small" text @click="searchQuery = ''">Clear search</el-button>
        </template>
        <template v-else>
          <span class="css-empty-icon">💬</span>
          <span>No sessions yet</span>
          <span class="css-empty-hint">Start a new chat to begin</span>
          <el-button size="small" type="primary" :icon="Plus" :loading="creating" @click="onNewSession">New session</el-button>
        </template>
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

    <div v-if="!store.batchMode" class="css-footer">
      <span class="css-footer-count">{{ store.conversations.length }} session{{ store.conversations.length !== 1 ? 's' : '' }}</span>
      <span v-if="favoriteCount" class="css-footer-fav">· {{ favoriteCount }} favorite{{ favoriteCount !== 1 ? 's' : '' }}</span>
    </div>

    <div v-if="store.batchMode" class="css-batch-bar">
      <div class="css-batch-actions">
        <el-button size="small" type="danger" :icon="Delete" :disabled="selectedCount === 0" @click="onBulkDelete">
          Delete ({{ selectedCount }})
        </el-button>
        <el-button size="small" :disabled="selectedCount === 0" @click="onBulkFavorite">
          <el-icon :size="14"><component :is="StarFilled" /></el-icon>
          Favorite
        </el-button>
      </div>
      <span class="css-batch-summary">
        {{ selectedCount }} of {{ filteredConversations.length }} selected
      </span>
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
.css-header--batch {
  justify-content: space-between;
}
.css-batch-title {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.css-batch-title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  background: var(--el-color-primary);
  border-radius: 50%;
}
.css-list {
  flex: 1;
  min-height: 0;
}
.css-empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 32px 16px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.css-empty-icon {
  font-size: 32px;
  line-height: 1;
}
.css-empty-hint {
  font-size: 12px;
  color: var(--el-text-color-disabled);
}

// Footer: session stats bar
.css-footer {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 6px 12px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  border-top: 1px solid var(--el-border-color-lighter);
}
.css-footer-fav {
  color: #f5a623;
}

// Batch bar
.css-batch-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 14px;
  background: var(--el-color-primary-light-9);
  border-top: 2px solid var(--el-color-primary-light-5);
}
.css-batch-actions {
  display: flex;
  gap: 8px;
}
.css-batch-summary {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
</style>
