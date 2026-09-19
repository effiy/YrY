<script setup lang="ts">
import { computed, ref } from 'vue';
import type { WebImageResult, WebSearchResult } from '@/api/types';

const props = withDefaults(defineProps<{
  results: WebSearchResult[];
  images?: WebImageResult[];
  query?: string;
  timingMs?: number;
}>(), {
  images: () => [],
  query: '',
  timingMs: 0,
});

const copiedAll = ref(false);
const copiedIdx = ref<number | null>(null);
const lightboxImage = ref<string | null>(null);

const timingLabel = computed(() => {
  const ms = props.timingMs || 0;
  if (!ms) return '';
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
});

const highAuthorityCount = computed(() =>
  props.results.filter((item) => domainTier(item.url) === 'high').length,
);

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url;
  }
}

function faviconUrl(url: string): string {
  const domain = getDomain(url);
  return domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32` : '';
}

function domainTier(url: string): 'high' | 'medium' | 'low' {
  const domain = getDomain(url);
  if (!domain) return 'medium';
  if (
    domain.endsWith('.gov') ||
    domain.endsWith('.edu') ||
    [
      'github.com',
      'developer.mozilla.org',
      'docs.python.org',
      'react.dev',
      'vuejs.org',
      'typescriptlang.org',
      'w3.org',
      'arxiv.org',
      'nature.com',
      'science.org',
    ].includes(domain)
  ) {
    return 'high';
  }
  if (['pinterest.com', 'quora.com', 'answers.com'].includes(domain)) {
    return 'low';
  }
  return 'medium';
}

function tierLabel(url: string): string {
  const tier = domainTier(url);
  if (tier === 'high') return 'high-authority';
  if (tier === 'low') return 'low-confidence';
  return 'general';
}

function qualityStars(score?: number): string {
  if (!score || score <= 0) return '';
  return '★'.repeat(Math.min(score, 5));
}

async function copyAllSources(): Promise<void> {
  const text = props.results.map((item, idx) => `${idx + 1}. ${item.title}\n   ${item.url}`).join('\n');
  await navigator.clipboard.writeText(text);
  copiedAll.value = true;
  setTimeout(() => { copiedAll.value = false; }, 1500);
}

async function copyLink(url: string, idx: number): Promise<void> {
  await navigator.clipboard.writeText(url);
  copiedIdx.value = idx;
  setTimeout(() => {
    if (copiedIdx.value === idx) copiedIdx.value = null;
  }, 1500);
}
</script>

<template>
  <div class="wsr">
    <div class="wsr-hd">
      <span class="wsr-title">Web Search</span>
      <span v-if="query" class="wsr-query" :title="query">"{{ query }}"</span>
      <span class="wsr-count">{{ results.length }} sources</span>
      <span v-if="highAuthorityCount" class="wsr-badge">{{ highAuthorityCount }} trusted</span>
      <span v-if="timingLabel" class="wsr-timing">{{ timingLabel }}</span>
      <button v-if="results.length" class="wsr-copy-all" @click="copyAllSources">
        {{ copiedAll ? 'Copied' : 'Copy all' }}
      </button>
    </div>

    <div v-if="results.length" class="wsr-list">
      <div
        v-for="(item, idx) in results"
        :key="`${idx}-${item.url}`"
        class="wsr-item"
      >
        <img
          v-if="faviconUrl(item.url)"
          :src="faviconUrl(item.url)"
          class="wsr-favicon"
          width="16"
          height="16"
          alt=""
        />
        <span class="wsr-idx">{{ idx + 1 }}</span>
        <div class="wsr-body">
          <a class="wsr-link" :href="item.url" target="_blank" rel="noopener noreferrer">
            <span class="wsr-item-title">{{ item.title || item.url }}</span>
          </a>
          <div class="wsr-meta">
            <span class="wsr-domain">{{ getDomain(item.url) }}</span>
            <span class="wsr-tier" :class="`is-${domainTier(item.url)}`">{{ tierLabel(item.url) }}</span>
            <span v-if="item.date" class="wsr-date">{{ item.date }}</span>
            <span v-if="qualityStars(item.quality)" class="wsr-quality">{{ qualityStars(item.quality) }}</span>
          </div>
          <p v-if="item.snippet" class="wsr-snippet">{{ item.snippet }}</p>
        </div>
        <button class="wsr-copy" @click="copyLink(item.url, idx)">
          {{ copiedIdx === idx ? 'OK' : 'Copy' }}
        </button>
      </div>
    </div>

    <div v-else class="wsr-empty">
      No web results found for this turn.
    </div>

    <div v-if="images.length" class="wsr-images">
      <div class="wsr-images-hd">Images</div>
      <div class="wsr-images-grid">
        <button
          v-for="(image, idx) in images"
          :key="`${idx}-${image.imageUrl}`"
          class="wsr-image-card"
          :title="image.title"
          @click="lightboxImage = image.imageUrl"
        >
          <img
            :src="image.thumbnailUrl || image.imageUrl"
            :alt="image.title"
            class="wsr-image-thumb"
            loading="lazy"
          />
          <span class="wsr-image-label">{{ image.title }}</span>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="lightboxImage" class="wsr-lightbox" @click="lightboxImage = null">
        <img :src="lightboxImage" class="wsr-lightbox-img" alt="Search preview" @click.stop />
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.wsr {
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.14);
}

.wsr-hd {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 11px;
  color: var(--text-secondary, #d4d0e8);
}

.wsr-title {
  font-weight: 700;
  color: var(--text-primary, #f5f3ff);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.wsr-query {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wsr-count,
.wsr-timing,
.wsr-badge {
  padding: 1px 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
}

.wsr-badge {
  color: #fbbf24;
}

.wsr-copy-all {
  margin-left: auto;
  padding: 2px 8px;
  font-size: 11px;
  color: var(--text-secondary, #d4d0e8);
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.16);
  border-radius: 999px;
}

.wsr-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wsr-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  border-radius: 10px;
}

.wsr-favicon {
  flex-shrink: 0;
  margin-top: 2px;
  border-radius: 4px;
}

.wsr-idx {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
  border-radius: 999px;
}

.wsr-body {
  flex: 1;
  min-width: 0;
}

.wsr-link {
  color: inherit;
  text-decoration: none;
}

.wsr-item-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #f5f3ff);
}

.wsr-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 3px;
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
}

.wsr-tier {
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}

.wsr-tier.is-high {
  color: #86efac;
}

.wsr-tier.is-low {
  color: #fca5a5;
}

.wsr-quality {
  color: #fbbf24;
}

.wsr-snippet {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--text-secondary, #d4d0e8);
  line-clamp: 3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.wsr-copy {
  flex-shrink: 0;
  padding: 2px 8px;
  font-size: 11px;
  color: var(--text-secondary, #d4d0e8);
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.16);
  border-radius: 999px;
}

.wsr-empty {
  padding: 10px 12px;
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
}

.wsr-images {
  margin-top: 10px;
}

.wsr-images-hd {
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary, #d4d0e8);
  text-transform: uppercase;
}

.wsr-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 8px;
}

.wsr-image-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.wsr-image-thumb {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.12);
}

.wsr-image-label {
  font-size: 11px;
  line-height: 1.4;
  color: var(--text-secondary, #d4d0e8);
  text-align: left;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.wsr-lightbox {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 10, 20, 0.8);
}

.wsr-lightbox-img {
  max-width: min(92vw, 1100px);
  max-height: 90vh;
  border-radius: 12px;
}
</style>
