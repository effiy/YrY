<script setup lang="ts">
/**
 * YiPet Chat — ChatMessages (Vue 3 SFC)
 */
import { computed } from 'vue';
import { Box } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';
import type { Message, PageInfo } from '../types';
import MessageBubble from './MessageBubble/MessageBubble.vue';
import WelcomeCard from './WelcomeCard.vue';
import AgentTodoList from './AgentTodoList.vue';
import AskUserBanner from './AskUserBanner.vue';
import ConfirmationBanner from './ConfirmationBanner.vue';

const props = defineProps<{
  messages: Message[];
  viewState: string;
  pageInfo: PageInfo;
  currentSessionMessageCount: number;
}>();

const store = useChatStore();
const s = store.state;

const session = computed(() =>
  s.sessions.find((x) => x.id === s.currentSessionId),
);
</script>

<template>
  <!-- Loading -->
  <div v-if="viewState === 'loading'" class="cm-state">
    <div class="cm-spinner" />
    <span class="cm-state-text">Loading conversation...</span>
  </div>

  <!-- Error -->
  <div v-else-if="viewState === 'error'" class="cm-alert cm-alert--error">
    <strong>Error occurred</strong>
    <p>Please retry shortly</p>
  </div>

  <!-- No session -->
  <div v-else-if="viewState === 'empty' && !session" class="cm-state">
    <p>No conversation selected — pick one from the sidebar to start chatting</p>
  </div>

  <!-- Session but no messages -->
  <div v-else-if="viewState === 'empty' && session" class="yipet-chat-messages-inner">
    <div class="yipet-chat-message is-pet" data-welcome-message="true">
      <div class="pet-chat-bubble pet-chat-bubble--welcome">
        <div class="pet-chat-content markdown-content">
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
    </div>
    <div class="cm-state">
      <p>No messages yet — type a message to start</p>
    </div>
  </div>

  <!-- Messages -->
  <div v-else class="yipet-chat-messages-inner">
    <!-- Compaction notification (mirrors YiVad aiChat) -->
    <div v-if="s.agentCompaction" class="cm-compaction">
      <el-icon :size="14"><Box /></el-icon>
      <span class="cm-compaction-text">
        Conversation compacted: {{ s.agentCompaction.beforeCount }} → {{ s.agentCompaction.afterCount }} messages
        <span v-if="s.agentCompaction.savedTokens > 0"> (saved ~{{ s.agentCompaction.savedTokens }} tokens)</span>
      </span>
    </div>

    <AgentTodoList />

    <!-- ask_user banner (agent question) -->
    <AskUserBanner />

    <!-- Tool confirmation banner (mirrors YiVad aiChat) -->
    <ConfirmationBanner />
    <!-- Session welcome -->
    <div class="yipet-chat-message is-pet" data-welcome-message="true">
      <div class="pet-chat-bubble pet-chat-bubble--welcome">
        <div class="pet-chat-content markdown-content">
          <WelcomeCard
            v-if="session"
            :title="session.title"
            :url="session.url"
            :message-count="session.messageCount"
            :created-at="session.createdAt"
            :tags="session.tags"
          />
        </div>
      </div>
    </div>

    <MessageBubble
      v-for="(msg, idx) in messages"
      :key="`${msg.timestamp}-${idx}`"
      :message="msg"
      :index="idx"
      :total-messages="messages.length"
    />
  </div>
</template>

<style lang="scss" scoped>
.yipet-chat-messages-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 0 16px;
}

.yipet-chat-message.is-pet[data-welcome-message] {
  align-self: flex-start;
  max-width: 80%;
  margin-bottom: 4px;

  .pet-chat-bubble--welcome {
    background: transparent;
    border: none;
    padding: 0;
  }
}

/* Markdown content in welcome messages */
.pet-chat-content.markdown-content {
  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    margin: 0.8em 0 0.4em;
    line-height: 1.3;
    font-weight: 600;
    &:first-child { margin-top: 0; }
  }
  :deep(h1) { font-size: 1.3em; }
  :deep(h2) { font-size: 1.15em; }
  :deep(h3) { font-size: 1.05em; }
  :deep(p) { margin: 0.4em 0; line-height: 1.6; }
  :deep(ul), :deep(ol) { padding-left: 1.5em; margin: 0.3em 0; }
  :deep(li) { margin: 0.15em 0; }
  :deep(code) {
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 0.9em;
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
    padding: 1px 5px;
    border-radius: 3px;
  }
  :deep(pre) {
    padding: 10px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    overflow-x: auto;
    font-size: 12px;
    code { background: none; padding: 0; }
  }
  :deep(a) { color: var(--primary-light, #818cf8); }
  :deep(blockquote) {
    margin: 0.4em 0;
    padding: 4px 10px;
    border-left: 3px solid var(--primary-light, #818cf8);
    color: var(--text-secondary, #d4d0e8);
  }
}

.cm-state {
  text-align: center;
  padding: 32px 24px;
  color: var(--text-secondary, #d4d0e8);
  font-size: 13px;
  line-height: 1.6;

  p { margin: 0; }
}

.cm-state-text {
  color: var(--text-secondary, #d4d0e8);
}

.cm-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  border-top-color: var(--primary-light, #818cf8);
  border-radius: 50%;
  animation: cm-spin 0.8s linear infinite;
  will-change: transform;
  margin: 0 auto 8px;
}

@keyframes cm-spin {
  to { transform: rotate(360deg) translateZ(0); }
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

/* Compaction notification */
.cm-compaction {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; margin-bottom: 8px;
  font-size: 12px; color: #38bdf8;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 6px;
  animation: cm-fade-in 0.3s ease-out;
}

.cm-compaction-text { flex: 1; }
</style>