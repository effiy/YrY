<script setup lang="ts">
/**
 * YiPet Chat — ChatMessages (Vue 3 SFC)
 * Mirrors YiVad's MessageList: intelligent scroll-to-bottom, web search indicator,
 * ChatSkeleton loading, welcome card with collapse.
 */
import { computed, nextTick, ref, watch } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';
import type { Message, PageInfo } from '../types';
import MessageBubble from './MessageBubble/MessageBubble.vue';
import WelcomeCard from './WelcomeCard.vue';
import ChatSkeleton from './ChatSkeleton.vue';

// ── Date separator helper ──
function dateLabel(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (msgDate.getTime() === today.getTime()) return 'Today';
  if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Build list mixing messages with date separators. */
function withDateSeparators(msgs: Message[]): Array<{ type: 'msg'; msg: Message; idx: number } | { type: 'date'; label: string; key: string }> {
  const out: Array<{ type: 'msg'; msg: Message; idx: number } | { type: 'date'; label: string; key: string }> = [];
  let lastLabel = '';
  msgs.forEach((m, i) => {
    const label = dateLabel(m.timestamp);
    if (label !== lastLabel) {
      out.push({ type: 'date', label, key: `${label}-${i}` });
      lastLabel = label;
    }
    out.push({ type: 'msg', msg: m, idx: i });
  });
  return out;
}

const props = defineProps<{
  messages: Message[];
  viewState: string;
  pageInfo: PageInfo;
  currentSessionMessageCount: number;
}>();

const store = useChatStore();
const s = store.state;
const container = ref<HTMLDivElement>();

const session = computed(() =>
  s.sessions.find((x) => x.id === s.currentSessionId),
);

const welcomeCollapsed = ref(false);

function toggleWelcome() {
  welcomeCollapsed.value = !welcomeCollapsed.value;
}

function toggleFavorite() {
  const ses = session.value;
  if (ses) store.toggleFavorite(ses.id);
}

// ── Intelligent scroll-to-bottom (only when near bottom) ──
function isNearBottom(): boolean {
  if (!container.value) return true;
  const { scrollTop, scrollHeight, clientHeight } = container.value;
  return scrollHeight - scrollTop - clientHeight < 120;
}

function scrollToBottom() {
  nextTick(() => {
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight;
    }
  });
}

watch(
  () => [s.scrollTick, s.messages[s.messages.length - 1]?.content, s.messages.length] as const,
  () => {
    if (isNearBottom()) scrollToBottom();
  },
  { flush: 'post' },
);

// ── Scroll-to-bottom button ──
const showScrollBtn = ref(false);

function onScroll() {
  showScrollBtn.value = !isNearBottom();
}

const welcomeInfo = computed(() => {
  const ses = session.value;
  if (!ses) return null;
  let host = '';
  let path = '';
  if (ses.url) {
    try {
      const u = new URL(ses.url);
      host = u.hostname;
      path = u.pathname + (u.hash || '');
    } catch {
      host = ses.url;
    }
  }
  const firstUserMsg = s.messages.find((m) => m.type === 'user');
  const ctxTags = (ses.tags || []).filter((t) => typeof t === 'string' && t.startsWith('ctx:'));
  const normalTags = (ses.tags || []).filter((t) => typeof t === 'string' && !t.startsWith('ctx:') && !t.startsWith('from:') && !t.startsWith('source:'));

  return {
    title: ses.title,
    host,
    path,
    url: ses.url,
    firstUserMessage: firstUserMsg?.content || '',
    messageCount: s.messages.length,
    createdAt: ses.createdAt,
    updatedAt: ses.updatedAt,
    ctxTags,
    normalTags,
    isFavorite: ses.isFavorite,
  };
});

const separatedMessages = computed(() => withDateSeparators(props.messages));
</script>

<template>
  <!-- Loading skeleton -->
  <ChatSkeleton v-if="viewState === 'loading'" type="messages" />

  <!-- Error -->
  <div v-else-if="viewState === 'error'" class="cm-alert cm-alert--error">
    <strong>Error occurred</strong>
    <p>Please retry shortly</p>
  </div>

  <!-- No session -->
  <div v-else-if="viewState === 'empty' && !session" class="cm-state">
    <div class="cm-welcome-empty">
      <div class="cm-welcome-empty-icon">🐾</div>
      <h2 class="cm-welcome-empty-title">YiPet Chat</h2>
      <p class="cm-welcome-empty-desc">
        Select a conversation from the sidebar or browse a new page to start.
      </p>
    </div>
  </div>

  <!-- Session but no messages -->
  <div v-else-if="viewState === 'empty' && session" class="cm-messages-inner">
    <div class="cm-message is-pet">
      <div class="cm-bubble cm-bubble--welcome">
        <WelcomeCard
          :title="session.title"
          :url="session.url"
          :message-count="session.messageCount"
          :created-at="session.createdAt"
          :updated-at="session.updatedAt"
          :tags="session.tags"
        />
      </div>
    </div>
    <div class="cm-state">
      <p>No messages yet — type a message to start</p>
    </div>
  </div>

  <!-- Messages -->
  <div v-else ref="container" class="cm-container" @scroll="onScroll">
    <div class="cm-messages-inner">
      <!-- Welcome card -->
      <div v-if="welcomeInfo" class="cm-welcome" :class="{ 'is-collapsed': welcomeCollapsed }">
        <div class="cm-welcome-top">
          <span
            class="cm-welcome-star"
            :class="{ 'is-fav': welcomeInfo.isFavorite }"
            title="Toggle favorite"
            @click.stop="toggleFavorite"
          >{{ welcomeInfo.isFavorite ? '\u2605' : '\u2606' }}</span>
          <span class="cm-welcome-title">{{ welcomeInfo.title || 'Untitled' }}</span>
          <span class="cm-welcome-msg-count">{{ welcomeInfo.messageCount }} msgs</span>
          <button class="cm-welcome-toggle" :title="welcomeCollapsed ? 'Expand' : 'Collapse'" @click.stop="toggleWelcome">
            {{ welcomeCollapsed ? '\u25B8' : '\u25BE' }}
          </button>
        </div>
        <div v-if="welcomeCollapsed && welcomeInfo.firstUserMessage" class="cm-welcome-collapsed-preview">
          {{ welcomeInfo.firstUserMessage }}
        </div>
        <template v-if="!welcomeCollapsed">
          <div v-if="welcomeInfo.host" class="cm-welcome-url">
            <span class="cm-welcome-host">{{ welcomeInfo.host }}</span>
            <span v-if="welcomeInfo.path" class="cm-welcome-path">{{ welcomeInfo.path }}</span>
          </div>
          <div v-if="welcomeInfo.firstUserMessage" class="cm-welcome-summary">{{ welcomeInfo.firstUserMessage }}</div>
          <div v-if="welcomeInfo.ctxTags.length" class="cm-welcome-ctx">
            <span
              v-for="t in welcomeInfo.ctxTags"
              :key="t"
              class="cm-welcome-ctx-tag"
              :title="t.slice(4)"
              @click="store.openKnowledgePreview?.(t.slice(4))"
            >{{ t.slice(4) }}</span>
          </div>
          <div class="cm-welcome-footer">
            <span class="cm-welcome-stats">
              Created {{ new Date(welcomeInfo.createdAt).toLocaleDateString() }}
              <template v-if="welcomeInfo.updatedAt && welcomeInfo.updatedAt !== welcomeInfo.createdAt">
                · Updated {{ new Date(welcomeInfo.updatedAt).toLocaleDateString() }}
              </template>
            </span>
            <div v-if="welcomeInfo.normalTags.length" class="cm-welcome-tags">
              <span v-for="t in welcomeInfo.normalTags" :key="t" class="cm-welcome-tag">{{ t }}</span>
            </div>
          </div>
        </template>
      </div>

      <template v-for="item in separatedMessages" :key="item.type === 'date' ? item.key : `${item.msg.timestamp}-${item.idx}`">
        <div v-if="item.type === 'date'" class="cm-date-sep">
          <span class="cm-date-sep-label">{{ item.label }}</span>
        </div>
        <MessageBubble
          v-else
          :message="item.msg"
          :index="item.idx"
          :total-messages="messages.length"
        />
      </template>

      <!-- Web search status indicator -->
      <div v-if="s.webSearchEnabled && s.isProcessing && s.streamingPhase === 'fetching'" class="cm-search-status">
        <el-icon class="is-loading" :size="14"><Loading /></el-icon>
        <span>Searching the web</span>
      </div>
    </div>

    <!-- Scroll-to-bottom button -->
    <Transition name="cm-scroll-fade">
      <button v-if="showScrollBtn" class="cm-scroll-btn" title="Scroll to bottom" @click="scrollToBottom(); showScrollBtn = false">
        <span class="cm-scroll-arrow">↓</span>
      </button>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.cm-container {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  background: #13122a;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.2);
    border-radius: 2px;
    &:hover { background: rgba(99, 102, 241, 0.4); }
  }
}

.cm-messages-inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0 16px;
}

// States
.cm-state {
  text-align: center;
  padding: 32px 24px;
  color: #d4d0e8;
  font-size: 13px;
  p { margin: 0; }
}

.cm-alert {
  margin: 16px;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  &--error {
    background: rgba(255, 77, 79, 0.1);
    border: 1px solid rgba(255, 77, 79, 0.3);
    color: #ff4d4f;
  }
}

// Empty state
.cm-welcome-empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  max-width: 420px;
  padding: 32px 0;
  margin: 0 auto;
  text-align: center;
}
.cm-welcome-empty-icon { font-size: 52px; line-height: 1; }
.cm-welcome-empty-title {
  margin: 0; font-size: 22px; font-weight: 700;
  color: #f5f3ff;
}
.cm-welcome-empty-desc {
  margin: 0; font-size: 14px; line-height: 1.6;
  color: #d4d0e8;
}

// Web search status
.cm-search-status {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 14px;
  margin-top: 4px;
  font-size: 13px;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 8px;
  animation: cm-search-in 0.2s ease-out;
}
@keyframes cm-search-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

// Scroll-to-bottom button
.cm-scroll-btn {
  position: sticky;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 50%;
  background: #141228;
  color: #818cf8;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 5;
  transition: all 0.15s;
  &:hover {
    background: rgba(99, 102, 241, 0.12);
    border-color: #818cf8;
    transform: translateX(-50%) scale(1.1);
  }
}
.cm-scroll-arrow { font-size: 18px; line-height: 1; }
.cm-scroll-fade-enter-active,
.cm-scroll-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.cm-scroll-fade-enter-from,
.cm-scroll-fade-leave-to { opacity: 0; transform: translateX(-50%) scale(0.8); }

// Date separators
.cm-date-sep {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0 4px;
  &:first-child { padding-top: 0; }
}
.cm-date-sep-label {
  font-size: 11px;
  font-weight: 600;
  color: #d4d0e8;
  background: #141228;
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 2px 12px;
  border-radius: 10px;
  letter-spacing: 0.3px;
}

// Welcome card (session metadata)
.cm-welcome {
  max-width: 100%;
  margin-bottom: 16px;
  font-size: 13px;
  background: #141228;
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-left: 3px solid rgba(99, 102, 241, 0.5);
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: padding 0.2s, border-color 0.2s;
  animation: cm-welcome-in 0.35s ease-out;
  &.is-collapsed {
    padding: 6px 10px;
    border-left-color: rgba(99, 102, 241, 0.2);
  }
  &:not(.is-collapsed) { padding: 10px 14px; }
}
@keyframes cm-welcome-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.cm-welcome-top { display: flex; gap: 6px; align-items: center; }
.cm-welcome-star {
  flex-shrink: 0; font-size: 14px; line-height: 1;
  color: #d4d0e8; cursor: pointer;
  transition: color 0.15s;
  &:hover { color: #f5a623; }
  &.is-fav { color: #f5a623; }
}
.cm-welcome-title {
  flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis;
  font-size: 13px; font-weight: 600; line-height: 1.4;
  color: #f5f3ff; white-space: nowrap;
}
.cm-welcome-msg-count { flex-shrink: 0; font-size: 11px; color: #d4d0e8; }
.cm-welcome-toggle {
  flex-shrink: 0; width: 20px; height: 20px; padding: 0;
  font-size: 10px; line-height: 20px; color: #d4d0e8;
  text-align: center; cursor: pointer; background: none;
  border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 4px;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  &:hover {
    color: #818cf8;
    background: rgba(99, 102, 241, 0.12);
    border-color: #818cf8;
  }
}
.cm-welcome-collapsed-preview {
  margin-top: 4px; overflow: hidden; text-overflow: ellipsis;
  font-size: 11px; line-height: 1.4; color: #d4d0e8;
  white-space: nowrap;
}
.cm-welcome-url { display: flex; gap: 4px; align-items: center; min-width: 0; margin-top: 8px; font-size: 11px; }
.cm-welcome-host { flex-shrink: 0; font-weight: 500; color: #d4d0e8; }
.cm-welcome-path { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; color: #d4d0e8; white-space: nowrap; }
.cm-welcome-summary {
  display: -webkit-box; padding: 8px 10px; margin-top: 8px; overflow: hidden;
  -webkit-line-clamp: 3; font-size: 12px; line-height: 1.5;
  color: #d4d0e8;
  background: rgba(99, 102, 241, 0.06); border-radius: 6px;
  -webkit-box-orient: vertical;
}
.cm-welcome-ctx { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 3px; }
.cm-welcome-ctx-tag {
  max-width: 200px; padding: 1px 6px; overflow: hidden; text-overflow: ellipsis;
  font-family: 'SF Mono', 'Menlo', monospace; font-size: 10px; line-height: 1.6;
  color: #22c55e; white-space: nowrap; cursor: pointer;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 3px; transition: all 0.15s;
  &:hover { background: rgba(34, 197, 94, 0.2); transform: translateY(-1px); }
}
.cm-welcome-footer {
  display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
  padding-top: 8px; margin-top: 8px;
  border-top: 1px solid rgba(99, 102, 241, 0.2);
}
.cm-welcome-stats { flex: 1; min-width: 0; font-size: 11px; color: #d4d0e8; white-space: nowrap; }
.cm-welcome-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.cm-welcome-tag {
  max-width: 140px; padding: 1px 8px; overflow: hidden; text-overflow: ellipsis;
  font-size: 10px; line-height: 1.6; color: #d4d0e8;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 10px; white-space: nowrap;
}
</style>