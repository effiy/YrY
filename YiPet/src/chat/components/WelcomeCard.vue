<script setup lang="ts">
/**
 * YiPet Chat — WelcomeCard (Vue 3 SFC)
 */
import { computed } from 'vue';
import { Star, StarFilled, Monitor, Link } from '@element-plus/icons-vue';
import { formatDate } from '@/chat/utils';

const props = defineProps<{
  title: string;
  url: string;
  messageCount: number;
  createdAt: number;
  updatedAt?: number;
  pageTitle?: string;
  pageDescription?: string;
  isFavorite?: boolean;
  tags?: string[];
}>();

const emit = defineEmits<{
  toggleFavorite: [];
}>();

function parseUrl(url: string): { host: string; path: string } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return { host: u.hostname, path: u.pathname + (u.hash || '') };
  } catch {
    return { host: url, path: '' };
  }
}

const parsed = computed(() => parseUrl(props.url));
</script>

<template>
  <div class="welcome-card">
    <div class="wc-header">
      <span class="wc-title">{{ title || 'Untitled conversation' }}</span>
      <button
        v-if="isFavorite !== undefined"
        class="wc-fav-btn"
        :class="{ 'wc-fav-btn--active': isFavorite }"
        :title="isFavorite ? 'Unfavorite' : 'Favorite'"
        @click.stop="emit('toggleFavorite')"
      >
        <el-icon :size="14"><StarFilled v-if="isFavorite" /><Star v-else /></el-icon>
      </button>
    </div>

    <div v-if="pageTitle" class="wc-page-title">{{ pageTitle }}</div>
    <div v-if="pageDescription" class="wc-page-desc">{{ pageDescription }}</div>

    <div v-if="parsed" class="wc-url-row">
      <span class="wc-url-icon"><el-icon :size="14"><Monitor /></el-icon></span>
      <span class="wc-url-host">{{ parsed.host }}</span>
      <span v-if="parsed.path" class="wc-url-path">{{ parsed.path }}</span>
      <a
        v-if="url.startsWith('http')"
        class="wc-url-link"
        :href="url"
        target="_blank"
        rel="noopener noreferrer"
        title="Open page"
      ><el-icon :size="14"><Link /></el-icon></a>
    </div>

    <div class="wc-stats">
      <span class="wc-stat">{{ messageCount }} {{ messageCount === 1 ? 'message' : 'messages' }}</span>
      <template v-if="createdAt">
        <span class="wc-stat-sep">·</span>
        <span class="wc-stat">Created {{ formatDate(createdAt) }}</span>
      </template>
      <template v-if="updatedAt">
        <span class="wc-stat-sep">·</span>
        <span class="wc-stat">Updated {{ formatDate(updatedAt) }}</span>
      </template>
    </div>

    <div v-if="tags && tags.length > 0" class="wc-tags">
      <span v-for="t in tags" :key="t" class="wc-tag">{{ t }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.welcome-card {
  padding: 12px 14px;
  background: var(--bg-elevated, rgba(30, 26, 59, 0.85));
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  border-radius: 8px;
  color: var(--text-primary, #f5f3ff);
}

.wc-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.wc-title {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.wc-fav-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--text-secondary, #d4d0e8);
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  transition: color 0.15s;

  &:hover { color: #f59e0b; }
  &--active { color: #f59e0b; }
}

.wc-page-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary, #f5f3ff);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wc-page-desc {
  font-size: 11px;
  color: var(--text-secondary, #d4d0e8);
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wc-url-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-bottom: 4px;
}

.wc-url-icon { flex-shrink: 0; }
.wc-url-host { font-weight: 500; }
.wc-url-path {
  color: var(--text-secondary, #d4d0e8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wc-url-link { flex-shrink: 0; text-decoration: none; }

.wc-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);
  margin-bottom: 4px;
}

.wc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.wc-tag {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  color: var(--primary-light, #818cf8);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
}
</style>