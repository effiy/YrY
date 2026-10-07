<script setup lang="ts" name="aiChatMessageList">
import { ref, watch, computed, nextTick, inject } from "vue";
import dayjs from "dayjs";
import { Loading, ArrowDown } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import MessageBubble from "./MessageBubble/index.vue";

const store = useAiChatStore();
const container = ref<HTMLDivElement>();

const openKnowledgePreview = inject<(path: string) => void>("openKnowledgePreview", () => {});

const messages = computed(() => store.messages);

// ── Scroll-to-bottom ──
const showScrollBtn = ref(false);
const newMsgCount = ref(0);

function scrollToBottom() {
  nextTick(() => {
    if (container.value) {
      container.value.scrollTo({
        top: container.value.scrollHeight,
        behavior: store.sending ? "auto" : "smooth"
      });
    }
    showScrollBtn.value = false;
    newMsgCount.value = 0;
  });
}

function isNearBottom(): boolean {
  if (!container.value) return true;
  const { scrollTop, scrollHeight, clientHeight } = container.value;
  return scrollHeight - scrollTop - clientHeight < 120;
}

function onScroll() {
  const near = isNearBottom();
  showScrollBtn.value = !near;
  if (near) newMsgCount.value = 0;
}

watch(
  () => [store.scrollTick, messages.value[messages.value.length - 1]?.message, messages.value.length],
  () => {
    if (isNearBottom()) scrollToBottom();
    else if (store.sending) newMsgCount.value++;
  },
  { flush: "post" }
);

// ── Date separators ──
function dateLabel(ts: number): string {
  const d = dayjs(ts);
  if (!d.isValid()) return "";
  if (d.isSame(dayjs(), "day")) return "Today";
  if (d.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
  return d.format("MMMM D, YYYY");
}

function showDateSep(idx: number): string | null {
  if (idx === 0) return dateLabel(messages.value[idx].timestamp);
  const curr = dayjs(messages.value[idx].timestamp);
  const prev = dayjs(messages.value[idx - 1].timestamp);
  if (!curr.isValid() || !prev.isValid()) return null;
  return curr.isSame(prev, "day") ? null : dateLabel(messages.value[idx].timestamp);
}

const welcomeCollapsed = ref(true);

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
  let host = "";
  let path = "";
  if (s.url) {
    try {
      const u = new URL(s.url);
      host = u.hostname;
      path = u.pathname + (u.hash || "");
    } catch {
      host = s.url;
    }
  }
  const firstUserMsg = (s.messages || []).find(m => m.type === "user");
  const ctxTags = (s.tags || []).filter(t => typeof t === "string" && t.startsWith("ctx:"));
  const normalTags = (s.tags || []).filter(t => typeof t === "string" && !t.startsWith("ctx:") && !t.startsWith("from:"));
  const fromTag = (s.tags || []).find(t => typeof t === "string" && t.startsWith("from:"));

  const SOURCE_LABEL: Record<string, string> = { leader: "TL", "code-review": "CR", story: "Story", rag: "RAG", aichat: "AI" };
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
    host,
    path,
    url: s.url,
    pageTitle: s.pageTitle,
    pageDescription: s.pageDescription,
    firstUserMessage: firstUserMsg?.message || "",
    messageCount: s.messages?.length ?? 0,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    filePath: s.file_path || s.filePath || "",
    ctxTags,
    normalTags,
    sourceLabel,
    sourceUrl,
    isFavorite: s.isFavorite
  };
});

function openSourceUrl(url: string) {
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

</script>

<template>
  <div ref="container" class="ml-container" @scroll="onScroll">
    <div v-if="store.loading" class="ml-center">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>Loading...</span>
    </div>
    <div v-else-if="store.error && !store.activeConversation" class="ml-center">
      <el-alert :title="store.error" type="error" show-icon />
    </div>
    <div v-else-if="!store.activeConversation" class="ml-center">
      <div class="ml-welcome-empty">
        <div class="ml-welcome-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--el-color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h2 class="ml-welcome-empty-title">AI Chat</h2>
        <p class="ml-welcome-empty-desc">
          Select a conversation from the sidebar or start a new one.
        </p>
        <div class="ml-welcome-empty-actions">
          <el-button type="primary" size="large" @click="store.createConversation()">Start new chat</el-button>
        </div>
        <div class="ml-welcome-empty-shortcuts">
          <span class="ml-shortcut"><kbd>Enter</kbd> Send</span>
          <span class="ml-shortcut"><kbd>Shift</kbd>+<kbd>Enter</kbd> Newline</span>
          <span class="ml-shortcut"><kbd>Esc</kbd> Cancel</span>
          <span class="ml-shortcut"><kbd>↑</kbd><kbd>↓</kbd> History</span>
          <span class="ml-shortcut"><kbd>⌘K</kbd> Clear</span>
        </div>
      </div>
    </div>
    <template v-else>
      <!-- Welcome card — session metadata (YiPet parity) -->
      <div v-if="welcomeInfo" class="ml-welcome" :class="{ 'is-collapsed': welcomeCollapsed }">
        <!-- Header row -->
        <div class="ml-welcome-top">
          <span
            class="ml-welcome-star"
            :class="{ 'is-fav': welcomeInfo.isFavorite }"
            title="Toggle favorite"
            @click.stop="toggleFavorite"
            >{{ welcomeInfo.isFavorite ? "★" : "☆" }}</span
          >
          <span v-if="welcomeInfo.sourceLabel" class="ml-welcome-source">{{ welcomeInfo.sourceLabel }}</span>
          <span class="ml-welcome-title">{{ welcomeInfo.title || "Untitled" }}</span>
          <span class="ml-welcome-msg-count">{{ welcomeInfo.messageCount }} msgs</span>
          <button class="ml-welcome-toggle" :title="welcomeCollapsed ? 'Expand' : 'Collapse'" @click.stop="toggleWelcome">
            {{ welcomeCollapsed ? "▸" : "▾" }}
          </button>
        </div>

        <!-- Collapsed preview -->
        <div v-if="welcomeCollapsed && welcomeInfo.firstUserMessage" class="ml-welcome-collapsed-preview">
          {{ welcomeInfo.firstUserMessage }}
        </div>

        <!-- Expanded body -->
        <template v-if="!welcomeCollapsed">
          <!-- Source URL -->
          <div v-if="welcomeInfo.host" class="ml-welcome-url">
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
              >↗</a
            >
          </div>

          <!-- Page title + description -->
          <div v-if="welcomeInfo.pageTitle" class="ml-welcome-page-title">{{ welcomeInfo.pageTitle }}</div>
          <div v-if="welcomeInfo.pageDescription" class="ml-welcome-page-desc">{{ welcomeInfo.pageDescription }}</div>

          <!-- Conversation preview -->
          <div v-if="welcomeInfo.firstUserMessage" class="ml-welcome-summary">{{ welcomeInfo.firstUserMessage }}</div>

          <!-- Context files -->
          <div v-if="welcomeInfo.ctxTags.length" class="ml-welcome-ctx">
            <div class="ml-welcome-ctx-list">
              <span
                v-for="t in welcomeInfo.ctxTags"
                :key="t"
                class="ml-welcome-ctx-tag"
                :title="t.slice(4)"
                @click="openKnowledgePreview(t.slice(4))"
                >{{ t.slice(4) }}</span
              >
            </div>
          </div>

          <!-- Footer: file path + stats + tags -->
          <div class="ml-welcome-footer">
            <div v-if="welcomeInfo.filePath" class="ml-welcome-file">{{ welcomeInfo.filePath }}</div>
            <div class="ml-welcome-stats">
              <span>Created {{ dayjs(welcomeInfo.createdAt).format("MM/DD HH:mm") }}</span>
              <span v-if="welcomeInfo.updatedAt && welcomeInfo.updatedAt !== welcomeInfo.createdAt">
                · Updated {{ dayjs(welcomeInfo.updatedAt).format("MM/DD HH:mm") }}</span
              >
            </div>
            <div v-if="welcomeInfo.normalTags.length" class="ml-welcome-tags">
              <el-tag v-for="t in welcomeInfo.normalTags" :key="t" size="small" class="ml-welcome-tag">{{ t }}</el-tag>
            </div>
          </div>
        </template>
      </div>
      <template v-for="(msg, idx) in messages" :key="msg.timestamp">
        <div v-if="showDateSep(idx)" class="ml-date-sep">{{ showDateSep(idx) }}</div>
        <MessageBubble
          :message="msg"
          :index="idx"
          :streaming="store.isStreaming(msg, idx)"
        />
      </template>
      <!-- Web search status indicator -->
      <div v-if="store.webSearching" class="ml-search-status">
        <el-icon class="is-loading" :size="14"><Loading /></el-icon>
        <span>Searching the web</span>
      </div>
      <!-- Scroll-to-bottom button -->
      <transition name="ml-scroll-btn-fade">
        <button v-if="showScrollBtn" class="ml-scroll-btn" @click="scrollToBottom">
          <el-icon :size="16"><ArrowDown /></el-icon>
          <span v-if="newMsgCount" class="ml-scroll-btn-badge">{{ newMsgCount }}</span>
        </button>
      </transition>
    </template>
  </div>
</template>


<style scoped lang="scss">
@use "./MessageList.scss";
</style>
