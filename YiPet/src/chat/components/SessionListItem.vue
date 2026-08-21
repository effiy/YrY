<script setup lang="ts">
/**
 * YiPet Chat — SessionListItem (Vue 3 SFC)
 */
import { computed } from 'vue';
import { FolderOpened, Star, StarFilled, Edit, Delete } from '@element-plus/icons-vue';
import type { SessionItem } from '../types';

const props = defineProps<{
  session: SessionItem;
  isActive: boolean;
  batchMode?: boolean;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  select: [id: string];
  delete: [id: string];
  toggleFavorite: [id: string];
  rename: [id: string, currentTitle: string];
  editContext: [id: string];
}>();

const FROM_PREFIX = 'from:';

function relativeTime(ts?: number): string {
  if (!ts) return '';
  const delta = Date.now() - (ts || 0);
  const mins = Math.floor(delta / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const d = new Date(ts);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const SOURCE_LABELS: Record<string, string> = {
  'code-review/bugs': 'Bug', 'code-review': 'CR', brd: 'BRD',
  story: 'Story', aiChat: 'AI', aichat: 'AI', rag: 'RAG', leader: 'TL',
};

function sourceLabel(url: string): string {
  if (!url) return '';
  const hash = url.includes('#') ? url.slice(url.indexOf('#') + 1) : '';
  const path = hash || url;
  const p = path.startsWith('/') ? path.slice(1) : path;
  for (const [prefix, label] of Object.entries(SOURCE_LABELS)) {
    if (p.startsWith(prefix)) return label;
  }
  if (url.startsWith('yipet://')) return 'YP';
  return '';
}

const CTX_PREFIX = 'ctx:';

function metaText(session: SessionItem): string {
  const parts: string[] = [];
  const ctx = (session.tags || []).filter((t) => t.startsWith(CTX_PREFIX)).length;
  const m = session.messageCount || 0;
  if (ctx) parts.push(`${ctx} files`);
  if (m) parts.push(`${m} msgs`);
  const time = relativeTime(session.updatedAt || session.createdAt);
  if (time) parts.push(time);
  return parts.join(' · ');
}

const fav = computed(() => !!props.session.isFavorite);
const srcTag = computed(() => sourceLabel(props.session.url || ''));
const meta = computed(() => metaText(props.session));
const ctxCount = computed(() => (props.session.tags || []).filter((t) => t.startsWith(CTX_PREFIX)).length);

function onDelete(id: string) {
  if (window.confirm('Delete this conversation?')) {
    emit('delete', id);
  }
}
</script>

<template>
  <div
    class="yipet-session-item"
    :class="{ 'is-active': isActive }"
    @click="$emit('select', session.id)"
  >
    <div class="yipet-session-body">
      <div class="yipet-session-row">
        <span v-if="srcTag" class="yipet-session-src">{{ srcTag }}</span>
        <span class="yipet-session-title">{{ session.title || 'Untitled conversation' }}</span>
        <span v-if="meta" class="yipet-session-meta">{{ meta }}</span>
      </div>

      <div v-if="!batchMode" class="yipet-session-actions" @click.stop>
        <el-button
          size="small" text :icon="FolderOpened"
          :title="ctxCount ? `Edit ${ctxCount} context file(s)` : 'Edit context files'"
          @click="$emit('editContext', session.id)"
        />
        <el-button
          size="small" text
          :icon="fav ? StarFilled : Star"
          :class="{ 'is-fav': fav }"
          :title="fav ? 'Unfavorite' : 'Favorite'"
          @click="$emit('toggleFavorite', session.id)"
        />
        <el-button
          size="small" text :icon="Edit"
          title="Rename"
          @click="$emit('rename', session.id, session.title || '')"
        />
        <el-button
          size="small" text :icon="Delete"
          class="is-danger"
          title="Delete"
          @click="onDelete(session.id)"
        />
      </div>
    </div>

    <span v-if="!batchMode && fav" class="yipet-session-fav-mark" title="Favorite">
      <el-icon :size="10"><StarFilled /></el-icon>
    </span>
  </div>
</template>

<style lang="scss" scoped>
.yipet-session-item {
  display: flex;
  align-items: flex-start;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;

  &:hover { background: rgba(var(--primary-rgb, 99, 102, 241), 0.08); }
  &.is-active { background: rgba(var(--primary-rgb, 99, 102, 241), 0.15); }
}

.yipet-session-body {
  flex: 1;
  min-width: 0;
}

.yipet-session-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.yipet-session-src {
  font-size: 10px;
  padding: 0 4px;
  border-radius: 3px;
  background: rgba(167, 139, 250, 0.2);
  color: #a78bfa;
  font-weight: 600;
  flex-shrink: 0;
}

.yipet-session-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary, #f5f3ff);
}

.yipet-session-meta {
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
  flex-shrink: 0;
}

.yipet-session-actions {
  display: flex;
  gap: 2px;
  margin-top: 2px;
  opacity: 0;
  transition: opacity 0.15s;

  .yipet-session-item:hover & { opacity: 1; }

  :deep(.el-button) {
    --el-button-text-color: var(--text-secondary, #d4d0e8);
    --el-button-hover-text-color: var(--text-primary, #f5f3ff);
    --el-button-hover-bg-color: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
    width: 22px;
    height: 22px;
    padding: 0;
    font-size: 11px;
    border-radius: 4px;

    &.is-fav {
      --el-button-text-color: #f59e0b;
      --el-button-hover-text-color: #f59e0b;
    }
    &.is-danger {
      --el-button-hover-text-color: #ff4d4f;
      --el-button-hover-bg-color: rgba(255, 77, 79, 0.1);
    }
  }
}

.yipet-session-fav-mark {
  font-size: 10px;
  color: #f59e0b;
  flex-shrink: 0;
  margin-left: 4px;
}
</style>