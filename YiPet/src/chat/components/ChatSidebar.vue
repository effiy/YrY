<script setup lang="ts">
/**
 * YiPet Chat — ChatSidebar (Vue 3 SFC)
 * Session list with search/filter, batch mode, and session stats footer.
 */
import { computed, onMounted, ref } from 'vue';
import { useChatStore } from '../stores/chat';
import { t } from '@/shared/i18n';
import SearchBar from './SearchBar.vue';
import SessionListItem from './SessionListItem.vue';

const store = useChatStore();
const s = store.state;

const filteredSessions = computed(() => {
  let list = s.sessions;
  if (s.searchQuery) {
    const q = s.searchQuery.toLowerCase();
    list = list.filter((ses) =>
      ses.title.toLowerCase().includes(q) ||
      ses.id.toLowerCase().includes(q) ||
      (ses.tags || []).some((t) => String(t).toLowerCase().includes(q))
    );
  }
  if (s.sessionProjectFilter) {
    list = list.filter((ses) => ses.url.includes(s.sessionProjectFilter));
  }
  return list;
});

interface GroupedSession { group: string; items: typeof filteredSessions.value; }

const groupedSessions = computed<GroupedSession[]>(() => {
  const now = Date.now();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();
  const weekMs = todayMs - 7 * 86400000;

  const groups: GroupedSession[] = [
    { group: 'Today', items: [] },
    { group: 'This Week', items: [] },
    { group: 'Older', items: [] },
  ];

  for (const ses of filteredSessions.value) {
    const ts = ses.updatedAt || ses.createdAt;
    if (ts >= todayMs) groups[0].items.push(ses);
    else if (ts >= weekMs) groups[1].items.push(ses);
    else groups[2].items.push(ses);
  }
  return groups.filter(g => g.items.length > 0);
});

const favoriteCount = computed(() => s.sessions.filter((c) => c.isFavorite).length);

const totalMessageCount = computed(() =>
  s.sessions.reduce((sum, ses) => sum + (ses.messageCount || 0), 0)
);

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

function onRenameSession(id: string, _currentTitle: string) {
  store.selectSession(id);
  store.editSessionInfo();
}

function onRetryLoad() {
  store.state.sessionError = '';
  store.mount();
}

function clearSearch() {
  store.setSearchInput('');
  store.setSearchQuery('');
}

onMounted(() => {
  if (s.sessions.length === 0 && !s.sessionLoading) {
    // Sessions will be loaded by mount() in chat store
  }
});
</script>

<template>
  <div class="yipet-sidebar">
    <SearchBar />
    <div class="yipet-sidebar-list">
      <!-- Loading -->
      <div v-if="s.sessionLoading && !filteredSessions.length" class="sidebar-placeholder">
        <div class="sidebar-spinner" />
        <span>Loading sessions...</span>
      </div>

      <!-- Error -->
      <div v-else-if="s.sessionError && !filteredSessions.length" class="sidebar-placeholder sidebar-error">
        <p>{{ s.sessionError }}</p>
        <el-button size="small" type="primary" @click="onRetryLoad">
          Retry
        </el-button>
      </div>

      <!-- Empty: search no match -->
      <div v-else-if="s.searchQuery && !filteredSessions.length" class="sidebar-placeholder">
        <p>No sessions match "{{ s.searchQuery }}"</p>
        <el-button size="small" text @click="clearSearch">Clear search</el-button>
      </div>

      <!-- Empty: no sessions -->
      <div v-else-if="!filteredSessions.length" class="sidebar-placeholder">
        <p>{{ t('sidebarNoSessions') }}</p>
        <span class="sidebar-hint">Start a new chat to begin</span>
        <el-button size="small" type="primary" @click="store.createEmptySession()">New session</el-button>
      </div>

      <!-- Session list (grouped by time) -->
      <template v-else>
        <template v-for="g in groupedSessions" :key="g.group">
          <div class="yipet-session-group-header">{{ g.group }} · {{ g.items.length }}</div>
          <SessionListItem
            v-for="ses in g.items"
            :key="ses.id"
            :session="ses"
            :is-active="ses.id === s.currentSessionId"
            :batch-mode="s.batchMode"
            :is-selected="s.selectedSessionIds.includes(ses.id)"
            @select="onSelectSession"
            @delete="onDeleteSession"
            @toggle-favorite="store.toggleFavorite($event)"
            @rename="onRenameSession"
          />
        </template>
      </template>
    </div>

    <!-- Footer -->
    <div v-if="!s.batchMode" class="yipet-sidebar-footer">
      <span>{{ s.sessions.length }} session{{ s.sessions.length !== 1 ? 's' : '' }}</span>
      <span v-if="totalMessageCount" class="yipet-footer-msgs">· {{ totalMessageCount }} msg{{ totalMessageCount !== 1 ? 's' : '' }}</span>
      <span v-if="favoriteCount" class="yipet-footer-fav">· {{ favoriteCount }} favorite{{ favoriteCount !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Batch bar -->
    <div v-if="s.batchMode" class="yipet-batch-bar">
      <div class="yipet-batch-actions">
        <el-button
          size="small" type="danger"
          :disabled="s.selectedSessionIds.length === 0"
          @click="store.bulkDeleteSessions?.()"
        >
          Delete ({{ s.selectedSessionIds.length }})
        </el-button>
      </div>
      <span class="yipet-batch-summary">
        {{ s.selectedSessionIds.length }} of {{ filteredSessions.length }} selected
      </span>
    </div>
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

// ── Session list ──
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

.sidebar-error {
  color: var(--el-color-danger);
}

.sidebar-hint {
  font-size: 11px;
  color: var(--text-tertiary, #9ca3af);
}

@keyframes sidebarFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.sidebar-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  border-top-color: var(--primary-light, var(--el-color-primary));
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  will-change: transform;
}

@keyframes spin { to { transform: rotate(360deg) translateZ(0); } }

// Footer
.yipet-sidebar-footer {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 6px 12px;
  font-size: 11px;
  color: var(--text-secondary, #d4d0e8);
  border-top: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.15);
}

.yipet-footer-fav {
  color: var(--el-color-warning);
}
.yipet-footer-msgs {
  color: var(--el-color-primary);
}

.yipet-session-group-header {
  padding: 6px 12px 2px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary, #d4d0e8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-top: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.12);
  &:first-child { border-top: none; }
}

// Batch bar
.yipet-batch-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  border-top: 2px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
  animation: sidebarFadeIn 0.2s ease-out;
}

.yipet-batch-actions {
  display: flex;
  gap: 8px;
}

.yipet-batch-summary {
  font-size: 11px;
  color: var(--text-secondary, #d4d0e8);
  text-align: center;
}
</style>