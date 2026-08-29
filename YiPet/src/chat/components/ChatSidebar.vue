<script setup lang="ts">
/**
 * YiPet Chat — ChatSidebar (Vue 3 SFC)
 * Shows the session list, or a context-files panel when editing a session's
 * context (mirrors YiVad aiChat's ConversationSessionSidebar + ContextFilesPanel).
 */
import { computed } from 'vue';
import { useChatStore } from '../stores/chat';
import type { SessionItem } from '../types';
import SearchBar from './SearchBar.vue';
import SessionListItem from './SessionListItem.vue';
import ContextFilesPanel from './ContextFilesPanel/ContextFilesPanel.vue';

const store = useChatStore();
const s = store.state;

const filteredSessions = computed(() => {
  let list = s.sessions;
  if (s.searchQuery) {
    const q = s.searchQuery.toLowerCase();
    list = list.filter((ses) => ses.title.toLowerCase().includes(q));
  }
  if (s.sessionProjectFilter) {
    list = list.filter((ses) => ses.url.includes(s.sessionProjectFilter));
  }
  return list;
});

function onSelectSession(id: string) {
  if (s.batchMode) {
    const idx = s.selectedSessionIds.indexOf(id);
    if (idx >= 0) s.selectedSessionIds.splice(idx, 1);
    else s.selectedSessionIds.push(id);
  } else {
    store.selectSession(id);
  }
}

function onDeleteSession(id: string) {
  if (confirm('Delete this conversation?')) store.deleteSession(id);
}

function onRenameSession(id: string, currentTitle: string) {
  const next = prompt('Rename conversation', currentTitle);
  if (next !== null) store.renameSession(id, next);
}

async function onEditContext(id: string) {
  await store.startContextEditing(id);
}
</script>

<template>
  <div class="yipet-sidebar">
    <!-- Context editing mode -->
    <ContextFilesPanel v-if="s.contextEditingId" @back="store.stopContextEditing()" />

    <!-- Sessions view -->
    <template v-else>
      <SearchBar />
      <div class="yipet-sidebar-list">
        <div v-if="s.sessionLoading" class="sidebar-placeholder">
          <div class="sidebar-spinner" />
        </div>
        <div v-else-if="filteredSessions.length === 0" class="sidebar-placeholder">
          <p>{{ s.searchQuery ? 'No matching conversations' : 'No conversations' }}</p>
        </div>
        <SessionListItem
          v-for="ses in filteredSessions"
          :key="ses.id"
          :session="ses"
          :is-active="ses.id === s.currentSessionId"
          :batch-mode="s.batchMode"
          :is-selected="s.selectedSessionIds.includes(ses.id)"
          @select="onSelectSession"
          @delete="onDeleteSession"
          @toggle-favorite="store.toggleFavorite($event)"
          @rename="onRenameSession"
          @edit-context="onEditContext"
        />
      </div>

      <!-- Batch bar -->
      <div v-if="s.batchMode" class="batch-bar">
        <span>{{ s.selectedSessionIds.length }} selected</span>
        <el-button
          size="small" type="danger"
          :disabled="s.selectedSessionIds.length === 0"
          @click="store.bulkDeleteSessions?.()"
        >
          Delete selected
        </el-button>
        <el-button size="small" @click="store.toggleBatchMode()">Cancel</el-button>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.yipet-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--bg-secondary, #1e1a3b);
}

.yipet-sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.2);
    border-radius: 4px;
    &:hover { background: rgba(var(--primary-rgb, 99, 102, 241), 0.4); }
  }
}

.sidebar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--text-secondary, #d4d0e8);
  font-size: 12px;
  gap: 8px;
  text-align: center;
  animation: sidebarFadeIn 0.25s ease-out;

  p { margin: 0; line-height: 1.5; }
}

@keyframes sidebarFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.sidebar-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  border-top-color: var(--primary-light, #818cf8);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  will-change: transform;
}

@keyframes spin { to { transform: rotate(360deg) translateZ(0); } }

.batch-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  background: var(--bg-secondary, rgba(30, 41, 59, 0.9));
  font-size: 12px;
  color: var(--text-primary, #f5f3ff);
  animation: sidebarFadeIn 0.2s ease-out;
}
</style>
