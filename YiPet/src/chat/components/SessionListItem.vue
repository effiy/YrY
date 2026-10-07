<script setup lang="ts">
import { computed } from 'vue';
import { Star, StarFilled, Edit, Delete } from '@element-plus/icons-vue';
import { t } from '@/shared/i18n';
import { formatRelativeTime } from '@/utils/datetime';
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
}>();

const CTX_PREFIX = 'ctx:';
const FROM_PREFIX = 'from:';

function relativeTime(ts?: number): string {
  if (!ts) return '';
  try { return formatRelativeTime(new Date(ts).toISOString(), 'en'); }
  catch { return ''; }
}

const SOURCE_DOMAIN_LABEL: Record<string, string> = { leader: 'TL', 'code-review': 'CR', story: 'Story', rag: 'RAG', aichat: 'AI' };
const SOURCE_COLORS: Record<string, string> = { TL: '#8b5cf6', CR: '#3b82f6', Bug: '#ef4444', Story: '#10b981', RAG: 'var(--el-color-warning)', AI: '#6366f1' };

const sourceUrl = computed(() => {
  const from = (props.session.tags || []).find((t) => typeof t === 'string' && t.startsWith(FROM_PREFIX));
  return from ? from.slice(FROM_PREFIX.length) : '';
});

const sourceDomainLabel = computed<string>(() => {
  const url = sourceUrl.value;
  if (!url) return '';
  const m = url.match(/^\/([^/?#]+)/);
  if (m) {
    const head = m[1];
    if (head === 'code-review') { if (url.startsWith('/code-review/bugs')) return 'Bug'; return 'CR'; }
    return SOURCE_DOMAIN_LABEL[head] || head.toUpperCase();
  }
  const hash = url.includes('#') ? url.slice(url.indexOf('#') + 1) : '';
  const path = hash || url;
  const p = path.startsWith('/') ? path.slice(1) : path;
  for (const [prefix, label] of Object.entries(SOURCE_DOMAIN_LABEL)) {
    if (p.startsWith(prefix)) return label;
  }
  if (url.startsWith('yipet://')) return 'YP';
  return '';
});

const isFavorite = computed(() => !!props.session.isFavorite);
const ctxCount = computed(() => (props.session.tags || []).filter((t) => t.startsWith(CTX_PREFIX)).length);
const msgCount = computed(() => props.session.messageCount || 0);

const isStale = computed(() => {
  const ts = props.session.updatedAt || props.session.createdAt;
  if (!ts) return false;
  return (Date.now() - ts) / 86400000 > 7;
});

const firstUserMessage = computed(() => {
  const msgs = props.session.messages ?? [];
  const first = msgs.find((m) => m.type === 'user');
  const text = (first?.content || first?.message || '').trim();
  if (!text) return '';
  return text.length > 80 ? text.slice(0, 79) + '...' : text;
});

const previewMessages = computed(() => {
  const msgs = props.session.messages ?? [];
  if (!msgs.length) return [];
  return msgs.slice(-3).map(m => ({
    type: m.type,
    preview: (m.content || m.message || '').trim().slice(0, 80),
  }));
});

function onDelete(id: string) {
  if (window.confirm('Delete this conversation?')) emit('delete', id);
}
</script>

<template>
  <el-popover
    v-if="previewMessages.length"
    placement="right" :width="280" trigger="hover"
    :show-after="600" :hide-after="100" :teleported="true"
    popper-class="session-preview-pop"
  >
    <template #reference>
      <div class="yipet-session-item" :class="{ 'is-active': isActive, 'is-selected': batchMode && isSelected }" @click="batchMode ? emit('select', session.id) : emit('select', session.id)">
        <div class="yipet-session-row">
          <button class="yipet-star" :class="{ 'is-fav': isFavorite }" @click.stop="emit('toggleFavorite', session.id)"><el-icon :size="13"><component :is="isFavorite ? StarFilled : Star" /></el-icon></button>
          <span v-if="sourceDomainLabel" class="yipet-session-src" :style="{ color: SOURCE_COLORS[sourceDomainLabel] || 'var(--primary-light)', borderColor: 'currentColor' }">{{ sourceDomainLabel }}</span>
          <span class="yipet-session-title">{{ session.title || t('welcomeUntitled') }}</span>
          <span class="yipet-session-time">{{ relativeTime(session.updatedAt || session.createdAt) }}</span>
          <span v-if="isStale" class="yipet-session-stale">stale</span>
        </div>
        <div v-if="firstUserMessage" class="yipet-session-preview">{{ firstUserMessage }}</div>
        <div class="yipet-session-meta">
          <span v-if="msgCount" class="yipet-badge">{{ msgCount }} msg{{ msgCount !== 1 ? 's' : '' }}</span>
          <span v-if="ctxCount" class="yipet-badge yipet-badge--ctx">{{ ctxCount }} file{{ ctxCount !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </template>
    <div class="session-preview">
      <div v-for="(m, i) in previewMessages" :key="i" class="session-preview-msg" :class="'session-preview-msg--' + m.type">
        <span class="session-preview-role">{{ m.type === 'user' ? 'You' : 'AI' }}</span>
        <span class="session-preview-text">{{ m.preview }}{{ m.preview.length >= 80 ? '...' : '' }}</span>
      </div>
    </div>
  </el-popover>

  <div v-else class="yipet-session-item" :class="{ 'is-active': isActive, 'is-selected': batchMode && isSelected }" @click="batchMode ? emit('select', session.id) : emit('select', session.id)">
    <div class="yipet-session-row">
      <button class="yipet-star" :class="{ 'is-fav': isFavorite }" @click.stop="emit('toggleFavorite', session.id)"><el-icon :size="13"><component :is="isFavorite ? StarFilled : Star" /></el-icon></button>
      <span v-if="sourceDomainLabel" class="yipet-session-src" :style="{ color: SOURCE_COLORS[sourceDomainLabel] || 'var(--primary-light)', borderColor: 'currentColor' }">{{ sourceDomainLabel }}</span>
      <span class="yipet-session-title">{{ session.title || t('welcomeUntitled') }}</span>
      <span class="yipet-session-time">{{ relativeTime(session.updatedAt || session.createdAt) }}</span>
      <span v-if="isStale" class="yipet-session-stale">stale</span>
    </div>
    <div v-if="firstUserMessage" class="yipet-session-preview">{{ firstUserMessage }}</div>
    <div class="yipet-session-meta">
      <span v-if="msgCount" class="yipet-badge">{{ msgCount }} msg{{ msgCount !== 1 ? 's' : '' }}</span>
      <span v-if="ctxCount" class="yipet-badge yipet-badge--ctx">{{ ctxCount }} file{{ ctxCount !== 1 ? 's' : '' }}</span>
    </div>
    <div v-if="!batchMode" class="yipet-session-actions" @click.stop>
      <el-button size="small" text :icon="Edit" @click="emit('rename', session.id, session.title || '')" />
      <el-button size="small" text :icon="Delete" class="is-danger" type="danger" @click="onDelete(session.id)" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.yipet-session-item {
  display: flex; flex-direction: column; gap: 3px; padding: 10px 12px;
  cursor: pointer; border-left: 3px solid transparent; transition: background 0.15s, border-color 0.15s;
  &:hover { background: var(--el-fill-color-lighter); }
  &.is-active { background: var(--el-color-primary-light-9); border-left-color: var(--el-color-primary); }
}
.yipet-session-row { display: flex; gap: 6px; align-items: center; min-width: 0; }
.yipet-star { display: inline-flex; flex-shrink: 0; align-items: center; padding: 0; color: var(--el-text-color-placeholder); cursor: pointer; background: none; border: none; transition: color 0.15s;
  &:hover { color: #f5a623; } &.is-fav { color: #f5a623; } }
.yipet-session-src { display: inline-flex; flex-shrink: 0; align-items: center; height: 16px; padding: 0 5px; font-size: 10px; font-weight: 700; border: 1px solid currentColor; border-radius: 4px; }
.yipet-session-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); white-space: nowrap; }
.yipet-session-time { flex-shrink: 0; font-size: 11px; color: var(--el-text-color-placeholder); }
.yipet-session-stale { flex-shrink: 0; font-size: 9px; font-weight: 600; padding: 1px 4px; border-radius: 3px; color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
.yipet-session-preview { display: -webkit-box; overflow: hidden; -webkit-line-clamp: 2; font-size: 12px; color: var(--el-text-color-secondary); -webkit-box-orient: vertical; }
.yipet-session-meta { display: flex; flex-wrap: wrap; gap: 4px; }
.yipet-badge { display: inline-flex; align-items: center; height: 18px; padding: 0 6px; font-size: 10px; font-weight: 500; color: var(--el-text-color-secondary); background: var(--el-fill-color); border-radius: 4px;
  &--ctx { color: var(--el-color-success); background: var(--el-color-success-light-9); } }
.yipet-session-actions { display: flex; gap: 2px; align-self: flex-end; opacity: 0; transition: opacity 0.15s;
  .yipet-session-item:hover & { opacity: 1; } }
</style>
<style lang="scss">
.session-preview-pop { padding: 8px !important; }
.session-preview { display: flex; flex-direction: column; gap: 4px; }
.session-preview-msg { display: flex; gap: 6px; padding: 4px 6px; border-radius: 4px; background: var(--el-fill-color-lighter); }
.session-preview-role { flex-shrink: 0; font-size: 10px; font-weight: 700; color: var(--el-color-primary); width: 24px; }
.session-preview-msg--user .session-preview-role { color: var(--el-color-info); }
.session-preview-text { font-size: 11px; color: var(--el-text-color-regular); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>