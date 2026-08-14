<script setup lang="ts" name="aiChatMessageList">
import { ref, watch, computed } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import MessageBubble from "./MessageBubble.vue";
import TodoPanel from "./TodoPanel.vue";
import AskUserBanner from "./AskUserBanner.vue";

const store = useAiChatStore();
const container = ref<HTMLDivElement>();

const messages = computed(() => store.messages);

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
