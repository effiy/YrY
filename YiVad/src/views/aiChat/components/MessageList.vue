<script setup lang="ts" name="aiChatMessageList">
import { ref, watch, computed } from "vue";
import dayjs from "dayjs";
import { useAiChatStore } from "@/stores/modules/aiChat";
import MessageBubble from "./MessageBubble.vue";

const store = useAiChatStore();
const container = ref<HTMLDivElement>();

const messages = computed(() => store.messages);

const welcomeCollapsed = ref(false);

function toggleWelcome() {
  welcomeCollapsed.value = !welcomeCollapsed.value;
}

function toggleFavorite() {
  const s = store.activeConversation;
  if (s) store.toggleFavorite(s.key);
}

const welcomeInfo = computed(() => {
  const s = store.activeConversation;
  if (!s) return null;
  let host = ""; let path = "";
  if (s.url) {
    try {
      const u = new URL(s.url);
      host = u.hostname;
      path = u.pathname + (u.hash || "");
    } catch { host = s.url; }
  }
  const firstUserMsg = (s.messages || []).find(m => m.type === "user");
  const ctxTags = (s.tags || []).filter(t => typeof t === "string" && t.startsWith("ctx:"));
  const normalTags = (s.tags || []).filter(t => typeof t === "string" && !t.startsWith("ctx:") && !t.startsWith("from:"));
  const fromTag = (s.tags || []).find(t => typeof t === "string" && t.startsWith("from:"));

  const SOURCE_LABEL: Record<string, string> = { brd: "BRD", leader: "TL", "code-review": "CR", story: "Story", rag: "RAG", aichat: "AI" };
  let sourceLabel = "";
  let sourceUrl = "";
  if (fromTag) {
    sourceUrl = (fromTag as string).slice(5);
    const m = sourceUrl.match(/^\/([^/?#]+)/);
    if (m) {
      const head = m[1];
      if (head === "code-review") sourceLabel = sourceUrl.startsWith("/code-review/bugs") ? "Bug" : "CR";
      else sourceLabel = SOURCE_LABEL[head] || head.toUpperCase();
    }
  }

  return {
    title: s.title,
    host, path, url: s.url,
    pageTitle: s.pageTitle,
    pageDescription: s.pageDescription,
    firstUserMessage: firstUserMsg?.message || firstUserMsg?.content || "",
    messageCount: s.messages?.length ?? 0,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    filePath: s.file_path || s.filePath || "",
    ctxTags, normalTags, sourceLabel, sourceUrl,
    isFavorite: s.isFavorite
  };
});

function openSourceUrl(url: string) {
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

function scrollToBottom() {
  if (container.value) {
    container.value.scrollTop = container.value.scrollHeight;
  }
}

watch(
  () => [store.scrollTick, messages.value[messages.value.length - 1]?.message, messages.value.length],
  () => scrollToBottom(),
  { flush: "post" }
);

</script>

<template>
  <div ref="container" class="ml-container">
    <div v-if="store.loading" class="ml-center">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>Loading...</span>
    </div>
    <div v-else-if="store.error && !store.activeConversation" class="ml-center">
      <el-alert :title="store.error" type="error" show-icon />
    </div>
    <div v-else-if="!store.activeConversation" class="ml-center">
      <el-empty description="Select or create a conversation" :image-size="80" />
    </div>
    <template v-else>
      <!-- Welcome card — session metadata (YiPet parity) -->
      <div v-if="welcomeInfo" class="ml-welcome" :class="{ 'is-collapsed': welcomeCollapsed }">
        <!-- Header row -->
        <div class="ml-welcome-top">
          <span class="ml-welcome-star" :class="{ 'is-fav': welcomeInfo.isFavorite }" title="Toggle favorite" @click.stop="toggleFavorite">{{ welcomeInfo.isFavorite ? '★' : '☆' }}</span>
          <span v-if="welcomeInfo.sourceLabel" class="ml-welcome-source">{{ welcomeInfo.sourceLabel }}</span>
          <span class="ml-welcome-title">{{ welcomeInfo.title || 'Untitled' }}</span>
          <span class="ml-welcome-msg-count">{{ welcomeInfo.messageCount }} msgs</span>
          <button class="ml-welcome-toggle" :title="welcomeCollapsed ? 'Expand' : 'Collapse'" @click.stop="toggleWelcome">{{ welcomeCollapsed ? '▸' : '▾' }}</button>
        </div>

        <!-- Collapsed preview -->
        <div v-if="welcomeCollapsed && welcomeInfo.firstUserMessage" class="ml-welcome-collapsed-preview">{{ welcomeInfo.firstUserMessage }}</div>

        <!-- Expanded body -->
        <template v-if="!welcomeCollapsed">
          <!-- Source URL -->
          <div v-if="welcomeInfo.host" class="ml-welcome-url">
            <span class="ml-welcome-host">{{ welcomeInfo.host }}</span>
            <span v-if="welcomeInfo.path" class="ml-welcome-path">{{ welcomeInfo.path }}</span>
            <a v-if="welcomeInfo.url.startsWith('http')" class="ml-welcome-url-link" :href="welcomeInfo.url" target="_blank" rel="noopener noreferrer" title="Open source page" @click.stop>↗</a>
          </div>

          <!-- Page title + description -->
          <div v-if="welcomeInfo.pageTitle" class="ml-welcome-page-title">{{ welcomeInfo.pageTitle }}</div>
          <div v-if="welcomeInfo.pageDescription" class="ml-welcome-page-desc">{{ welcomeInfo.pageDescription }}</div>

          <!-- Conversation preview -->
          <div v-if="welcomeInfo.firstUserMessage" class="ml-welcome-summary">{{ welcomeInfo.firstUserMessage }}</div>

          <!-- Context files -->
          <div v-if="welcomeInfo.ctxTags.length" class="ml-welcome-ctx">
            <div class="ml-welcome-ctx-list">
              <span v-for="t in welcomeInfo.ctxTags" :key="t" class="ml-welcome-ctx-tag" :title="t.slice(4)">{{ t.slice(4) }}</span>
            </div>
          </div>

          <!-- Footer: file path + stats + tags -->
          <div class="ml-welcome-footer">
            <div v-if="welcomeInfo.filePath" class="ml-welcome-file">{{ welcomeInfo.filePath }}</div>
            <div class="ml-welcome-stats">
              <span>Created {{ dayjs(welcomeInfo.createdAt).format('MM/DD HH:mm') }}</span>
              <span v-if="welcomeInfo.updatedAt && welcomeInfo.updatedAt !== welcomeInfo.createdAt"> · Updated {{ dayjs(welcomeInfo.updatedAt).format('MM/DD HH:mm') }}</span>
            </div>
            <div v-if="welcomeInfo.normalTags.length" class="ml-welcome-tags">
              <el-tag v-for="t in welcomeInfo.normalTags" :key="t" size="small" class="ml-welcome-tag">{{ t }}</el-tag>
            </div>
          </div>
        </template>
      </div>
      <MessageBubble
        v-for="(msg, idx) in messages"
        :key="msg.timestamp"
        :message="msg"
        :index="idx"
        :streaming="store.isStreaming(msg, idx)"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.ml-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 12px;
  overflow-y: auto;
}
.ml-center {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

// Welcome card — session metadata at the top of each conversation (YiPet parity)
.ml-welcome {
  max-width: 100%;
  margin-bottom: 16px;
  font-size: 13px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-left: 3px solid var(--el-color-primary-light-3);
  border-radius: 6px;
  animation: ml-welcome-in 0.35s ease-out;
  transition: padding 0.2s, border-color 0.2s;
}

.ml-welcome.is-collapsed {
  padding: 6px 10px;
  border-left-color: var(--el-border-color-light);
}

.ml-welcome:not(.is-collapsed) {
  padding: 10px 14px;
}

@keyframes ml-welcome-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

// ── Header row ──

.ml-welcome-top {
  display: flex;
  gap: 6px;
  align-items: center;
}

.ml-welcome-star {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 1;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  transition: color 0.15s;
  &:hover { color: #f5a623; }
  &.is-fav { color: #f5a623; }
}

.ml-welcome-source {
  flex-shrink: 0;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 3px;
}

.ml-welcome-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

.ml-welcome-msg-count {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.ml-welcome-toggle {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  font-size: 10px;
  line-height: 20px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  cursor: pointer;
  background: none;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}

.ml-welcome-collapsed-preview {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ── Source URL ──

.ml-welcome-url {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  min-width: 0;
  font-size: 11px;
}

.ml-welcome-host {
  font-weight: 500;
  flex-shrink: 0;
  color: var(--el-text-color-regular);
}

.ml-welcome-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-secondary);
}

.ml-welcome-url-link {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-decoration: none;
  &:hover { color: var(--el-color-primary); }
}

// ── Page meta ──

.ml-welcome-page-title {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ml-welcome-page-desc {
  margin-top: 2px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ── Conversation preview ──

.ml-welcome-summary {
  margin-top: 8px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border-radius: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ── Context files ──

.ml-welcome-ctx {
  margin-top: 6px;
}

.ml-welcome-ctx-list {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.ml-welcome-ctx-tag {
  max-width: 200px;
  padding: 1px 6px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  line-height: 1.6;
  color: var(--el-color-success);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-5);
  border-radius: 3px;
}

// ── Footer ──

.ml-welcome-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.ml-welcome-file {
  flex-shrink: 0;
  max-width: 240px;
  padding: 1px 6px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--el-fill-color-light);
  border-radius: 3px;
}

.ml-welcome-stats {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

.ml-welcome-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.ml-welcome-tag {
  max-width: 140px;
  font-size: 10px;
  :deep(.el-tag__content) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.ml-compaction {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--el-color-info);
  background: var(--el-color-info-light-9);
  border: 1px solid var(--el-color-info-light-5);
  border-radius: 6px;
  animation: ml-compaction-in 0.3s ease-out;
}

.ml-compaction-icon {
  font-size: 14px;
}

.ml-compaction-text {
  flex: 1;
}

@keyframes ml-compaction-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ml-confirmation {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-5);
  border-radius: 6px;
  animation: ml-compaction-in 0.3s ease-out;
}

.ml-confirmation-icon {
  font-size: 14px;
  line-height: 1.5;
}

.ml-confirmation-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ml-confirmation-text {
  line-height: 1.5;

  code {
    font-family: monospace;
    font-weight: 600;
    background: var(--el-color-warning-light-7);
    padding: 0 4px;
    border-radius: 3px;
  }
}

.ml-confirmation-args {
  max-height: 72px;
  padding: 4px 6px;
  overflow: auto;
  font-family: monospace;
  font-size: 11px;
  word-break: break-all;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.ml-confirmation-actions {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.ml-confirmation-hint {
  font-size: 11px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

.ml-confirmation-btn {
  padding: 2px 12px;
  font-size: 12px;
  line-height: 1.6;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.85;
  }

  &.approve {
    color: #fff;
    background: var(--el-color-success);
  }

  &.reject {
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
    border: 1px solid var(--el-color-danger-light-5);
  }
}
</style>
