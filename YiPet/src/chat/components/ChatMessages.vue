<script setup lang="ts">
/**
 * YiPet Chat — ChatMessages (Vue 3 SFC)
 * Mirrors YiVad's MessageList: intelligent scroll-to-bottom, web search indicator,
 * ChatSkeleton loading, welcome card with collapse.
 */
import { computed, nextTick, ref, watch } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import { formatDateTimeFromTs } from '@/utils/datetime';
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
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  if (msgDate.getTime() === today.getTime()) return `Today · ${weekday}`;
  if (msgDate.getTime() === yesterday.getTime()) return `Yesterday · ${weekday}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
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

// ── Scroll-to-bottom button ──
const showScrollBtn = ref(false);
const newMsgCount = ref(0);

function onScroll() {
  const near = isNearBottom();
  showScrollBtn.value = !near;
  if (near) newMsgCount.value = 0;
}

// Track new messages when user is scrolled up
watch(
  () => [s.scrollTick, s.messages[s.messages.length - 1]?.content, s.messages.length] as const,
  () => {
    if (isNearBottom()) { scrollToBottom(); }
    else if (s.isProcessing) { newMsgCount.value++; }
  },
  { flush: 'post' },
);

const SOURCE_LABEL: Record<string, string> = { leader: "TL", "code-review": "CR", story: "Story", rag: "RAG", aichat: "AI" };

function deriveSourceLabel(sourceUrl: string): string {
  if (!sourceUrl) return '';
  // Handle YiVad-style path patterns (e.g. /code-review/bugs/...)
  const pathMatch = sourceUrl.match(/^\/([^/?#]+)/);
  if (pathMatch) {
    const head = pathMatch[1];
    if (head === 'code-review') return sourceUrl.startsWith('/code-review/bugs') ? 'Bug' : 'CR';
    return SOURCE_LABEL[head] || head.toUpperCase();
  }
  // Handle yipet:// protocol (knowledge-file-based sessions)
  if (sourceUrl.startsWith('yipet://')) return 'YP';
  // Handle full URLs — extract hash-based routes (e.g. http://localhost:8848/#/ai-chat)
  const hashIdx = sourceUrl.indexOf('#');
  if (hashIdx >= 0) {
    const hashPath = sourceUrl.slice(hashIdx + 1);
    const hashMatch = hashPath.match(/^\/([^/?#]+)/);
    if (hashMatch) {
      const head = hashMatch[1];
      if (head === 'code-review') return hashPath.startsWith('/code-review/bugs') ? 'Bug' : 'CR';
      return SOURCE_LABEL[head] || head.toUpperCase();
    }
  }
  return '';
}

const welcomeInfo = computed(() => {
  const ses = session.value;
  if (!ses) return null;
  let host = '';
  let mainPath = '';
  if (ses.url) {
    try {
      const u = new URL(ses.url);
      host = u.hostname;
      mainPath = u.pathname + (u.hash || '');
    } catch {
      host = ses.url;
    }
  }
  const firstUserMsg = s.messages.find((m) => m.type === 'user');
  const ctxTags = (ses.tags || []).filter((t) => typeof t === 'string' && t.startsWith('ctx:'));
  const normalTags = (ses.tags || []).filter((t) => typeof t === 'string' && !t.startsWith('ctx:') && !t.startsWith('from:') && !t.startsWith('source:'));
  const fromTag = (ses.tags || []).find((t) => typeof t === 'string' && t.startsWith('from:'));
  const sourceUrl = fromTag ? (fromTag as string).slice(5) : '';
  const sourceLabel = deriveSourceLabel(sourceUrl);

  return {
    title: ses.title,
    host,
    path: mainPath,
    url: ses.url,
    pageTitle: ses.pageTitle || '',
    pageDescription: ses.pageDescription || '',
    firstUserMessage: firstUserMsg?.content || '',
    messageCount: s.messages.length,
    createdAt: ses.createdAt,
    updatedAt: ses.updatedAt,
    filePath: ses.filePath || '',
    ctxTags,
    normalTags,
    sourceLabel,
    sourceUrl,
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
    <strong>An error occurred loading conversations</strong>
    <p>Please check your connection and retry</p>
  </div>

  <!-- No session -->
  <div v-else-if="viewState === 'empty' && !session" class="cm-state">
    <div class="cm-welcome-empty">
      <div class="cm-welcome-empty-icon">💬</div>
      <h2 class="cm-welcome-empty-title">YiPet Chat</h2>
      <p class="cm-welcome-empty-desc">
        Select a conversation from the sidebar or start a new one.
        Ask me about project management, bug analysis, code review, or anything else.
      </p>
      <div class="cm-welcome-empty-actions">
        <el-button type="primary" @click="store.createEmptySession?.()">Start new chat</el-button>
      </div>
      <div class="cm-welcome-empty-browse">
        <span class="cm-welcome-empty-browse-label">Browse sessions in the sidebar</span>
      </div>
      <div class="cm-welcome-empty-shortcuts">
        <span class="cm-shortcut"><kbd>Enter</kbd> Send</span>
        <span class="cm-shortcut"><kbd>Shift</kbd>+<kbd>Enter</kbd> Newline</span>
        <span class="cm-shortcut"><kbd>Esc</kbd> Cancel</span>
        <span class="cm-shortcut"><kbd>↑</kbd><kbd>↓</kbd> History</span>
        <span class="cm-shortcut"><kbd>⌘K</kbd> Clear</span>
      </div>
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
      <p>No messages yet — type a message to begin</p>
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
          <span v-if="welcomeInfo.sourceLabel" class="cm-welcome-source">{{ welcomeInfo.sourceLabel }}</span>
          <span class="cm-welcome-title">{{ welcomeInfo.title || 'Untitled' }}</span>
          <span class="cm-welcome-msg-count">{{ welcomeInfo.messageCount }} messages</span>
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
            <a
              v-if="welcomeInfo.url && welcomeInfo.url.startsWith('http')"
              class="cm-welcome-url-link"
              :href="welcomeInfo.url"
              target="_blank"
              rel="noopener noreferrer"
              title="Open source page"
              @click.stop
            >↗</a>
          </div>
          <div v-if="welcomeInfo.pageTitle" class="cm-welcome-page-title">{{ welcomeInfo.pageTitle }}</div>
          <div v-if="welcomeInfo.pageDescription" class="cm-welcome-page-desc">{{ welcomeInfo.pageDescription }}</div>
          <div v-if="welcomeInfo.firstUserMessage" class="cm-welcome-summary">{{ welcomeInfo.firstUserMessage }}</div>
          <div v-if="welcomeInfo.ctxTags.length" class="cm-welcome-ctx">
            <div class="cm-welcome-ctx-list">
              <span
                v-for="t in welcomeInfo.ctxTags"
                :key="t"
                class="cm-welcome-ctx-tag"
                :title="t.slice(4)"
              >{{ t.slice(4) }}</span>
            </div>
          </div>
                    <div class="cm-welcome-footer">
            <div v-if="welcomeInfo.filePath" class="cm-welcome-file">{{ welcomeInfo.filePath }}</div>
            <span class="cm-welcome-stats">
              Created {{ formatDateTimeFromTs(welcomeInfo.createdAt) }}
              <template v-if="welcomeInfo.updatedAt && welcomeInfo.updatedAt !== welcomeInfo.createdAt">
                · Updated {{ formatDateTimeFromTs(welcomeInfo.updatedAt) }}
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

    <!-- Scroll-to-bottom button (YiVad pill style) -->
    <Transition name="cm-scroll-fade">
      <button v-if="showScrollBtn" class="cm-scroll-btn" title="Scroll to bottom" @click="scrollToBottom(); showScrollBtn = false; newMsgCount = 0">
        <span class="cm-scroll-arrow">↓</span>
        <span v-if="newMsgCount" class="cm-scroll-badge">{{ newMsgCount }}</span>
      </button>
    </Transition>
  </div>
</template>


<style lang="scss" scoped>
@use "./ChatMessages_styles/messages.scss";
</style>
