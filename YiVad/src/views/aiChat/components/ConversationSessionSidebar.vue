<script setup lang="ts" name="aiChatConversationSessionSidebar">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessageBox } from "element-plus";
import { Search, Delete, Operation, Plus, ArrowLeft } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { useAiChatStore } from "@/stores/modules/aiChat";
import ConversationListItem from "./ConversationListItem.vue";
import ContextFilesPanel from "./ContextFilesPanel.vue";

const store = useAiChatStore();
const { t } = useI18n();
const route = useRoute();

// ── Session list state ──

const searchQuery = ref("");

// Deep-link from business pages: /aiChat?tag=bug:BUG-001 pre-fills the
// search box so the list shows only sessions carrying that tag.
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

const someSelected = computed(() => selectedCount.value > 0 && !allSelected.value);

function onToggleAll(checked: boolean | string | number) {
  if (checked) {
    store.selectAll(filteredConversations.value.map(c => c.key));
  } else {
    store.clearSelection();
  }
}

async function onSelect(key: string) {
  // If context panel is in "new" mode, cancel it and show the selected session
  store.exitNewContextMode();
  await store.selectConversation(key);
}

async function onRename(key: string, _currentTitle: string) {
  // Select the conversation so SessionEditDialog (bound to activeConversation)
  // operates on the right session, then open the full edit dialog instead of
  // a bare prompt — users can edit title / page title / page description /
  // source URL together.
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

// ── Actions ──

/** "New session" → signals the ContextFilesPanel to enter "new" mode. */
function onNewSession() {
  store.enterNewContextMode();
}

// ── Context panel per-session toggle ──

const editingContextKey = ref<string | null>(null);
const showContextPanel = computed(() => editingContextKey.value !== null);

async function onEditContext(key: string) {
  await store.selectConversation(key);
  editingContextKey.value = key;
}

function onBackFromContext() {
  editingContextKey.value = null;
  store.exitNewContextMode();
}
</script>

<template>
  <div class="css-sidebar">
    <!-- ═══ Context editing mode ═══ -->
    <template v-if="showContextPanel">
      <div class="css-header">
        <el-button size="small" text :icon="ArrowLeft" title="Back to sessions" @click="onBackFromContext">Sessions</el-button>
        <span class="css-ctx-title">{{ store.activeConversation?.title || "Context files" }}</span>
      </div>
      <div class="css-context">
        <ContextFilesPanel />
      </div>
    </template>

    <!-- ═══ Session list mode ═══ -->
    <template v-else>
      <div class="css-header">
        <el-input v-model="searchQuery" placeholder="Search sessions..." clearable size="small" :prefix-icon="Search" />
        <el-button size="small" type="primary" :icon="Plus" title="New session" aria-label="New session" @click="onNewSession" />
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
        <div v-if="store.loading && !filteredConversations.length" class="css-empty">Loading sessions...</div>
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
            @edit-context="onEditContext"
          />
        </template>
      </el-scrollbar>

      <div v-if="store.batchMode" class="css-batch-bar">
        <el-checkbox :model-value="allSelected" :indeterminate="someSelected" title="Select all" @update:model-value="onToggleAll"
          >All</el-checkbox
        >
        <span class="css-batch-count">{{ selectedCount }} selected</span>
        <el-button size="small" type="danger" :icon="Delete" :disabled="selectedCount === 0" @click="onBulkDelete"
          >Delete</el-button
        >
        <el-button size="small" @click="store.toggleBatchMode()">Cancel</el-button>
      </div>
    </template>
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
.css-ctx-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.css-context {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
