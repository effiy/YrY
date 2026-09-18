<!--
  WebSearchResults — professional web search result citations below a chat message.
  Each result shows: favicon, title (linked), domain, quality stars, freshness date,
  snippet, and a copy-link button on hover.
-->
<script setup lang="ts" name="aiChatWebSearchResults">
import { computed, ref } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import type { WebSearchResult, WebImageResult } from "@/api/modules/searchService";
import { getDomain } from "@/api/modules/searchService";
import {
  faviconUrl,
  qualityStars,
  domainTier,
  domainTierLabel,
  domainTierClass,
  repClass,
  repLabel,
  readingTime,
  relativeTime,
  extractDate,
  detectLang,
  computeResultMeta
} from "@/views/ai-chat/composables/useSearchResultHelpers";

const props = defineProps<{
  results: WebSearchResult[];
  images?: WebImageResult[];
}>();

const store = useAiChatStore();

const resultMeta = computed(() => computeResultMeta(props.results));
const timingLabel = computed(() => {
  const ms = store.searchTimingMs;
  if (!ms) return "";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
});

// Count high-quality sources by tier for summary display
const tierCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const r of props.results) {
    const t = domainTier(r.url);
    counts[t] = (counts[t] || 0) + 1;
  }
  return counts;
});
const highAuthCount = computed(() =>
  (tierCounts.value.scholarly || 0) + (tierCounts.value.official || 0) + (tierCounts.value.news || 0)
);

// Refined search query (from store's lastSearchQuery)
const searchQueryLabel = computed(() => {
  const q = store.lastSearchQuery;
  if (!q || q === props.results[0]?.title) return "";
  return q.length > 60 ? q.slice(0, 57) + "..." : q;
});

// Image results — from props or fall back to store
const imageResults = computed(() => props.images ?? store.webSearchImages ?? []);

// ── Image lightbox ──────────────────────────────────────────────────────

const lightboxImage = ref<string | null>(null);
function openLightbox(url: string) { lightboxImage.value = url; }
function closeLightbox() { lightboxImage.value = null; }

// ── Copy link ──────────────────────────────────────────────────────────

const copiedIdx = ref<number | null>(null);

async function copyLink(url: string, idx: number) {
  try {
    await navigator.clipboard.writeText(url);
    copiedIdx.value = idx;
    setTimeout(() => {
      copiedIdx.value = null;
    }, 2000);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = url;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    copiedIdx.value = idx;
    setTimeout(() => {
      copiedIdx.value = null;
    }, 2000);
  }
}

// ── Copy all sources ────────────────────────────────────────────────────

const copiedAll = ref(false);
async function copyAllSources() {
  const lines = props.results.map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}`);
  const text = lines.join("\n");
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  copiedAll.value = true;
  setTimeout(() => { copiedAll.value = false; }, 2000);
}

// ── Keyboard navigation ────────────────────────────────────────────────

const focusedIdx = ref(-1);

function onResultKeydown(e: KeyboardEvent, idx: number) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    focusedIdx.value = Math.min(idx + 1, props.results.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    focusedIdx.value = Math.max(idx - 1, 0);
  } else if (e.key === "Enter" && focusedIdx.value === idx) {
    e.preventDefault();
    window.open(props.results[idx].url, "_blank", "noopener,noreferrer");
  } else if (e.key === "Escape") {
    e.preventDefault();
    focusedIdx.value = -1;
  }
}
</script>

<template>
  <div class="wsr">
    <div class="wsr-hd">
      <span>Web Search</span>
      <span v-if="searchQueryLabel" class="wsr-query" :title="store.lastSearchQuery">"{{ searchQueryLabel }}"</span>
      <span v-if="timingLabel" class="wsr-timing">{{ timingLabel }}</span>
      <span class="wsr-count">{{ results.length }} source{{ results.length !== 1 ? "s" : "" }}</span>
      <span v-if="highAuthCount" class="wsr-quality-summary" :title="`${highAuthCount} high-authority sources`">
        {{ highAuthCount }} ⭐
      </span>
      <button
        v-if="results.length"
        class="wsr-copy-all"
        :class="{ copied: copiedAll }"
        :title="copiedAll ? 'Copied!' : 'Copy all sources'"
        @click="copyAllSources"
      >
        {{ copiedAll ? "✓ Copied" : "Copy all" }}
      </button>
    </div>
    <template v-if="results.length">
      <div class="wsr-list">
        <div
          v-for="(r, i) in results"
          :key="i"
          v-memo="[r.url, r.snippet, resultMeta[i], focusedIdx === i]"
          class="wsr-item"
          :class="{ 'wsr-item--focused': focusedIdx === i }"
          :style="{ '--i': i }"
          tabindex="0"
          @keydown="onResultKeydown($event, i)"
          @click="focusedIdx = i"
        >
          <img :src="faviconUrl(r.url)" class="wsr-favicon" width="16" height="16" loading="lazy" alt="" />
          <span class="wsr-idx">{{ i + 1 }}</span>
          <div class="wsr-body">
            <a class="wsr-title-link" :href="r.url" target="_blank" rel="noopener noreferrer">
              <span class="wsr-title">{{ r.title }}</span>
            </a>
            <div class="wsr-meta">
              <span class="wsr-domain">{{ getDomain(r.url) }}</span>
              <span v-if="qualityStars(r.quality)" class="wsr-quality" :title="`Quality score: ${r.quality}/5`">{{
                qualityStars(r.quality)
              }}</span>
              <span class="wsr-rep" :class="domainTierClass(domainTier(r.url))">{{ domainTierLabel(domainTier(r.url)) }}</span>
              <span v-if="resultMeta[i].relativeTime" class="wsr-date">{{ resultMeta[i].relativeTime }}</span>
              <span class="wsr-readtime">{{ resultMeta[i].readTime }}</span>
              <span v-if="resultMeta[i].lang" class="wsr-lang">{{ resultMeta[i].lang }}</span>
            </div>
            <span v-if="r.snippet" class="wsr-snippet">{{ r.snippet }}</span>
          </div>
          <button
            class="wsr-copy"
            :class="{ copied: copiedIdx === i }"
            :title="copiedIdx === i ? 'Copied!' : 'Copy link'"
            @click.prevent.stop="copyLink(r.url, i)"
          >
            {{ copiedIdx === i ? "✓" : "⎘" }}
          </button>
        </div>
      </div>
      <!-- Image search results — parallel-fetched by backend -->
      <div v-if="imageResults.length" class="wsr-images">
        <div class="wsr-images-hd">Images</div>
        <div class="wsr-images-grid">
          <a
            v-for="(img, i) in imageResults"
            :key="i"
            class="wsr-image-card"
            :href="img.sourceUrl"
            target="_blank"
            rel="noopener noreferrer"
            :title="img.title"
            @click.prevent="openLightbox(img.imageUrl)"
          >
            <img
              :src="img.thumbnailUrl"
              :alt="img.title"
              class="wsr-image-thumb"
              loading="lazy"
              :width="img.width || undefined"
              :height="img.height || undefined"
            />
            <span class="wsr-image-title">{{ img.title }}</span>
          </a>
        </div>
      </div>
    </template>
    <div v-else class="wsr-empty">
      <p class="wsr-empty-text">No web results found</p>
      <p class="wsr-empty-hint">
        <template v-if="store.lastSearchQuery">
          Searched for: <code>"{{ store.lastSearchQuery }}"</code>.
        </template>
        Try shorter keywords, different terms, or toggle RAG to search your knowledge base instead.
      </p>
    </div>
    <!-- Image lightbox -->
    <Teleport to="body">
      <Transition name="wsr-lightbox">
        <div v-if="lightboxImage" class="wsr-lightbox" @click="closeLightbox">
          <img :src="lightboxImage" class="wsr-lightbox-img" @click.stop alt="Search image preview" />
          <button class="wsr-lightbox-close" @click="closeLightbox" title="Close">&times;</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
.wsr {
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
  animation: wsr-in 0.25s ease-out;
}

@keyframes wsr-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.wsr-hd {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.wsr-count {
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  text-transform: none;
  letter-spacing: 0;
}
.wsr-timing {
  font-weight: 600;
  color: var(--el-color-success);
  text-transform: none;
  letter-spacing: 0;
}
.wsr-query {
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  text-transform: none;
  letter-spacing: 0;
  white-space: nowrap;
}
.wsr-quality-summary {
  flex-shrink: 0;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  color: #e6a817;
  background: #fff8e1;
  border-radius: 8px;
  text-transform: none;
  letter-spacing: 0;
}
.wsr-copy-all {
  flex-shrink: 0;
  margin-left: auto;
  padding: 1px 8px;
  font-size: 10px;
  font-weight: 600;
  line-height: 18px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  text-transform: none;
  letter-spacing: 0;
  transition: all 0.15s;
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
  &.copied {
    color: var(--el-color-success);
    border-color: var(--el-color-success-light-5);
    background: var(--el-color-success-light-9);
  }
}
.wsr-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wsr-item {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  background: var(--el-fill-color-lighter);
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.15s;
  animation: wsr-item-in 0.3s ease-out both;
  animation-delay: calc(var(--i, 0) * 50ms);
}

@keyframes wsr-item-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.wsr-item:hover {
  background: var(--el-fill-color-light);
  border-color: var(--el-border-color-light);
  transform: translateX(2px);
}
.wsr-item--focused {
  outline: none;
  background: var(--el-fill-color-light);
  border-color: var(--el-color-primary-light-3);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
}
.wsr-favicon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 3px;
  border-radius: 2px;
}
.wsr-idx {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 50%;
}
.wsr-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.wsr-title-link {
  color: inherit;
  text-decoration: none;
  &:hover .wsr-title {
    color: var(--el-color-primary);
  }
}
.wsr-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}
.wsr-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.wsr-domain {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  color: var(--el-color-success);
  white-space: nowrap;
}
.wsr-quality {
  flex-shrink: 0;
  font-size: 10px;
  line-height: 1;
  color: #e6a817;
  letter-spacing: 1px;
}
.wsr-rep {
  flex-shrink: 0;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  border-radius: 8px;
  &.rep-scholarly {
    color: #6d28d9;
    background: #ede9fe;
  }
  &.rep-official {
    color: #ffffff;
    background: var(--el-color-success);
  }
  &.rep-news {
    color: #b45309;
    background: #fef3c7;
  }
  &.rep-community {
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color);
  }
  &.rep-commercial {
    display: none;
  }
  &.rep-low {
    color: #ffffff;
    background: var(--el-color-warning);
  }
}
.wsr-date {
  flex-shrink: 0;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}
.wsr-readtime {
  flex-shrink: 0;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  &::before {
    content: "· ";
  }
}
.wsr-lang {
  flex-shrink: 0;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 600;
  line-height: 15px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 3px;
}
.wsr-snippet {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  -webkit-box-orient: vertical;
}

// ── Empty state ────────────────────────────────────────────────────────
.wsr-empty {
  padding: 16px 12px;
  text-align: center;
}
.wsr-empty-text {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.wsr-empty-hint {
  margin: 0;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  code {
    padding: 1px 5px;
    font-size: 10px;
    background: var(--el-fill-color);
    border-radius: 3px;
  }
}

// ── Copy button ──
.wsr-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.15s;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
  &.copied {
    color: var(--el-color-success);
    opacity: 1;
  }
}
.wsr-item:hover .wsr-copy {
  opacity: 1;
}

// ── Mobile responsive ──────────────────────────────────────────────────

@media (width <= 600px) {
  .wsr-item {
    gap: 8px;
    padding: 8px 10px;
    &:hover {
      transform: none;
    }
  }
  .wsr-favicon {
    display: none;
  }
  .wsr-idx {
    width: 18px;
    height: 18px;
    font-size: 10px;
  }
  .wsr-title {
    font-size: 12px;
  }
  .wsr-snippet {
    font-size: 11px;
  }
  .wsr-copy {
    top: 6px;
    width: 28px;
    height: 28px;
    opacity: 0.5;
  }
  .wsr-images-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

// ── Image results ──────────────────────────────────────────────────────

.wsr-images {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.wsr-images-hd {
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.wsr-images-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.wsr-image-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-decoration: none;
  background: var(--el-fill-color-light);
  border: 1px solid transparent;
  border-radius: 6px;
  transition: all 0.15s;
  cursor: pointer;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px var(--el-color-primary-light-7);
  }
}
.wsr-image-thumb {
  width: 100%;
  height: 72px;
  object-fit: cover;
  background: var(--el-fill-color);
}
.wsr-image-title {
  display: -webkit-box;
  overflow: hidden;
  padding: 4px 6px;
  font-size: 10px;
  line-height: 1.3;
  color: var(--el-text-color-secondary);
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

// ── Lightbox ───────────────────────────────────────────────────────────

.wsr-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  cursor: zoom-out;
}
.wsr-lightbox-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.5);
  cursor: default;
}
.wsr-lightbox-close {
  position: absolute;
  top: 16px;
  right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  font-size: 24px;
  color: #ffffff;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  transition: background 0.15s;
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}
.wsr-lightbox-enter-active,
.wsr-lightbox-leave-active {
  transition: opacity 0.2s ease;
}
.wsr-lightbox-enter-from,
.wsr-lightbox-leave-to {
  opacity: 0;
}
</style>
