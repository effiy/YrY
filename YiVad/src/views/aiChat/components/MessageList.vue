<script setup lang="ts" name="aiChatMessageList">
import { ref, watch, computed } from "vue";
import dayjs from "dayjs";
import { useAiChatStore } from "@/stores/modules/aiChat";
import MessageBubble from "./MessageBubble.vue";
import TodoPanel from "./TodoPanel.vue";
import AskUserBanner from "./AskUserBanner.vue";

const store = useAiChatStore();
const container = ref<HTMLDivElement>();

const messages = computed(() => store.messages);

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
  return {
    title: s.title,
    host, path, url: s.url,
    pageTitle: s.pageTitle,
    pageDescription: s.pageDescription,
    messageCount: s.messages?.length ?? 0,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    tags: s.tags,
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

// Auto-dismiss compaction notification after 8 seconds
watch(() => store.agentCompaction, (compaction) => {
  if (compaction) {
    setTimeout(() => {
      if (store.agentCompaction?.timestamp === compaction.timestamp) {
        store.agentCompaction = null;
      }
    }, 8000);
  }
});

// Auto-reject the confirmation after 120s (matches the backend wait timeout so
// the agent loop doesn't hang after a missed decision).
const CONFIRMATION_TIMEOUT_MS = 120_000;
watch(() => store.pendingConfirmation, (conf) => {
  if (conf) {
    setTimeout(() => {
      if (store.pendingConfirmation?.timestamp === conf.timestamp) {
        store.rejectPendingConfirmation();
      }
    }, CONFIRMATION_TIMEOUT_MS);
  }
});

function approveConfirmation() {
  store.approvePendingConfirmation();
}

function rejectConfirmation() {
  store.rejectPendingConfirmation();
}

function answerQuestion(answer: string) {
  store.answerPendingQuestion(answer);
}
</script>

<template>
  <div ref="container" class="ml-container">
    <!-- Compaction notification (Pi-inspired: surface silent background state) -->
    <div v-if="store.agentCompaction" class="ml-compaction">
      <span class="ml-compaction-icon">📦</span>
      <span class="ml-compaction-text">
        Conversation compacted: {{ store.agentCompaction.beforeCount }} → {{ store.agentCompaction.afterCount }} messages
        <span v-if="store.agentCompaction.savedTokens > 0">
          (saved ~{{ store.agentCompaction.savedTokens }} tokens)
        </span>
      </span>
    </div>

    <!-- Todo list (Pi/dsh: todo capability) -->
    <TodoPanel :todos="store.agentTodos" />

    <!-- ask_user banner (Pi/dsh: interaction/ask-user) -->
    <AskUserBanner
      v-if="store.pendingQuestion"
      :question-id="store.pendingQuestion.questionId"
      :question="store.pendingQuestion.question"
      :options="store.pendingQuestion.options"
      @answer="answerQuestion"
    />

    <!-- Tool confirmation banner (Pi-inspired: tool requires user approval) -->
    <div v-if="store.pendingConfirmation" class="ml-confirmation">
      <span class="ml-confirmation-icon">🛡️</span>
      <div class="ml-confirmation-body">
        <div class="ml-confirmation-text">
          Tool <code>{{ store.pendingConfirmation.toolName }}</code> requires confirmation
          — approve to let the agent run it, or reject to skip.
        </div>
        <div v-if="Object.keys(store.pendingConfirmation.toolArgs).length" class="ml-confirmation-args">
          <code>{{ JSON.stringify(store.pendingConfirmation.toolArgs) }}</code>
        </div>
        <div class="ml-confirmation-actions">
          <button class="ml-confirmation-btn approve" @click="approveConfirmation">✓ Approve</button>
          <button class="ml-confirmation-btn reject" @click="rejectConfirmation">✕ Reject</button>
        </div>
        <div class="ml-confirmation-hint">
          或直接在输入框回复 — 可以/好/yes 批准，不要/取消/no 拒绝
        </div>
      </div>
    </div>
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
      <div v-if="welcomeInfo" class="ml-welcome">
        <div class="ml-welcome-top">
          <span class="ml-welcome-star" :class="{ 'is-fav': welcomeInfo.isFavorite }">{{ welcomeInfo.isFavorite ? '★' : '☆' }}</span>
          <span class="ml-welcome-title">{{ welcomeInfo.title || 'Untitled' }}</span>
        </div>
        <div v-if="welcomeInfo.pageTitle" class="ml-welcome-page-title">{{ welcomeInfo.pageTitle }}</div>
        <div v-if="welcomeInfo.pageDescription" class="ml-welcome-page-desc">{{ welcomeInfo.pageDescription }}</div>
        <div v-if="welcomeInfo.host" class="ml-welcome-url">
          <span class="ml-welcome-url-icon">🌐</span>
          <span class="ml-welcome-host">{{ welcomeInfo.host }}</span>
          <span v-if="welcomeInfo.path" class="ml-welcome-path">{{ welcomeInfo.path }}</span>
          <a
            v-if="welcomeInfo.url.startsWith('http')"
            class="ml-welcome-url-link"
            :href="welcomeInfo.url"
            target="_blank"
            rel="noopener noreferrer"
            title="Open source page"
            @click.stop
          >↗</a>
        </div>
        <div class="ml-welcome-stats">
          <span>{{ welcomeInfo.messageCount }} message{{ welcomeInfo.messageCount === 1 ? '' : 's' }}</span>
          <span v-if="welcomeInfo.createdAt"> · Created {{ dayjs(welcomeInfo.createdAt).format('YYYY/MM/DD HH:mm') }}</span>
          <span v-if="welcomeInfo.updatedAt && welcomeInfo.updatedAt !== welcomeInfo.createdAt"> · Updated {{ dayjs(welcomeInfo.updatedAt).format('YYYY/MM/DD HH:mm') }}</span>
        </div>
        <div v-if="welcomeInfo.tags?.length" class="ml-welcome-tags">
          <el-tag v-for="t in welcomeInfo.tags" :key="t" size="small" class="ml-welcome-tag">{{ t }}</el-tag>
        </div>
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
  padding: 12px 14px;
  font-size: 13px;
  background: linear-gradient(
    135deg,
    rgba(var(--el-color-primary-rgb, 99, 102, 241), 0.08) 0%,
    rgba(var(--el-color-primary-rgb, 99, 102, 241), 0.02) 100%
  );
  border: 1px solid rgba(var(--el-color-primary-rgb, 99, 102, 241), 0.15);
  border-radius: 10px;
  animation: ml-welcome-in 0.35s ease-out;
}

@keyframes ml-welcome-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.ml-welcome-top {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.ml-welcome-star {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  cursor: default;
  &.is-fav {
    color: #f5a623;
  }
}

.ml-welcome-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

.ml-welcome-page-title {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--el-text-color-regular);
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

.ml-welcome-url {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  margin-bottom: 8px;
  min-width: 0;
  font-size: 12px;
}

.ml-welcome-url-icon {
  flex-shrink: 0;
  font-size: 11px;
  opacity: 0.5;
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
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-decoration: none;
  opacity: 0.5;
  transition: opacity 0.15s;
  &:hover {
    opacity: 1;
    color: var(--el-color-primary);
  }
}

.ml-welcome-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.ml-welcome-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.ml-welcome-tag {
  font-size: 10px;
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
