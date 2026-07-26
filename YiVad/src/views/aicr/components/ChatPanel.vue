<script setup lang="ts" name="aicrChatPanel">
import { ref, watch, nextTick, computed } from "vue";
import { useAicrChatStore } from "@/stores/modules/aicr/chat";
import { useAicrModalStore } from "@/stores/modules/aicr/modals";
import { useMarkdown } from "@/hooks/useMarkdown";
import type { ChatMessage } from "@/api/interface/yiweb";

const chatStore = useAicrChatStore();
const modalStore = useAicrModalStore();
const { render } = useMarkdown();

const messagesContainer = ref<HTMLDivElement>();
const isComposing = ref(false);

const messages = computed((): ChatMessage[] => {
  return chatStore.activeSession?.messages ?? [];
});

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

watch(() => messages.value.length, scrollToBottom);
watch(
  () => chatStore.sending,
  v => {
    if (v) scrollToBottom();
  }
);

function handleKeydown(e: Event | KeyboardEvent) {
  if (isComposing.value) return;
  const ke = e as KeyboardEvent;
  if (ke.key === "Enter" && !ke.shiftKey) {
    e.preventDefault();
    chatStore.sendMessage();
  }
}

function copyText(content: string) {
  navigator.clipboard.writeText(content).then(() => {
    chatStore.copyFeedback = { ...chatStore.copyFeedback, [content.slice(0, 20)]: "Copied" };
    setTimeout(() => {
      chatStore.copyFeedback = {};
    }, 2000);
  });
}

function formatTime(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
</script>

<template>
  <div class="aicr-chat-panel">
    <div ref="messagesContainer" class="cp-messages">
      <div v-if="chatStore.loading" class="cp-center">
        <el-icon class="is-loading" :size="24"><Loading /></el-icon>
        <span>Loading...</span>
      </div>
      <div v-else-if="chatStore.error && !chatStore.activeSession" class="cp-center">
        <el-alert :title="chatStore.error" type="error" show-icon />
      </div>
      <div v-else-if="!chatStore.activeSession" class="cp-center">
        <el-empty description="Select a session to start chatting" :image-size="80" />
      </div>
      <template v-else>
        <div
          v-for="(msg, idx) in messages"
          :key="`${msg.timestamp}_${idx}`"
          class="cp-msg"
          :class="{
            'cp-msg--user': msg.type === 'user',
            'cp-msg--pet': msg.type === 'pet',
            'cp-msg--error': msg.error,
            'cp-msg--streaming': chatStore.isStreaming(msg, idx)
          }"
        >
          <div class="cp-msg-bubble">
            <div v-if="msg.imageDataUrls?.length" class="cp-msg-images">
              <img v-for="(src, i) in msg.imageDataUrls" :key="i" :src="src" class="cp-msg-img" alt="" />
            </div>
            <div
              v-if="msg.message?.trim()"
              class="cp-msg-content"
              :class="{ 'cp-msg-content--streaming': chatStore.isStreaming(msg, idx) }"
              v-html="render(msg.message)"
            />
            <div v-if="chatStore.isStreaming(msg, idx) && !msg.message?.trim()" class="cp-typing">...</div>
            <div class="cp-msg-meta">
              <div class="cp-msg-actions">
                <el-button v-if="msg.message?.trim()" size="small" text @click="copyText(msg.message)">{{
                  chatStore.copyFeedback[msg.message.slice(0, 20)] || "Copy"
                }}</el-button>
                <el-button size="small" text @click="chatStore.deleteMessage(idx)">Del</el-button>
                <el-button v-if="idx > 0" size="small" text @click="chatStore.moveMessageUp(idx)">↑</el-button>
                <el-button v-if="idx < messages.length - 1" size="small" text @click="chatStore.moveMessageDown(idx)"
                  >↓</el-button
                >
              </div>
              <time class="cp-msg-time">{{ formatTime(msg.timestamp) }}</time>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="cp-input-area" v-if="chatStore.activeSession">
      <div class="cp-toolbar">
        <div class="cp-toolbar-left">
          <el-button size="small" text title="Context" @click="modalStore.openContextEditor()">📝</el-button>
          <el-button
            size="small"
            text
            title="Edit"
            @click="modalStore.openSessionEdit(chatStore.activeSession!.key, chatStore.activeSession!.title || '')"
            >✏️</el-button
          >
          <el-button size="small" text title="FAQ" @click="modalStore.toggleFaq()">💡</el-button>
          <el-button size="small" text title="WeChat" @click="modalStore.toggleWeChat()">🤖</el-button>
          <el-button size="small" text title="Settings" @click="modalStore.toggleSettings()">⚙️</el-button>
        </div>
        <div class="cp-toolbar-right">
          <el-switch v-model="chatStore.contextEnabled" size="small" />
          <el-button v-if="chatStore.sending" size="small" text type="danger" @click="chatStore.abortSend()">Stop</el-button>
        </div>
      </div>
      <div class="cp-input-row">
        <el-input
          :model-value="chatStore.input"
          type="textarea"
          :rows="2"
          placeholder="Type a message... (Enter to send)"
          @update:model-value="
            (v: string) => {
              chatStore.input = v;
            }
          "
          @keydown="handleKeydown"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
          :disabled="chatStore.sending"
        />
        <el-button
          type="primary"
          :disabled="!chatStore.input.trim() || chatStore.sending"
          :loading="chatStore.sending"
          @click="chatStore.sendMessage()"
          >Send</el-button
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.aicr-chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.cp-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cp-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
.cp-msg {
  display: flex;
}
.cp-msg--user {
  justify-content: flex-end;
}
.cp-msg--user .cp-msg-bubble {
  background: var(--el-color-primary-light-9);
  border-radius: 12px 12px 4px 12px;
}
.cp-msg--pet {
  justify-content: flex-start;
}
.cp-msg--pet .cp-msg-bubble {
  background: var(--el-fill-color-light);
  border-radius: 12px 12px 12px 4px;
}
.cp-msg--error .cp-msg-bubble {
  border: 1px solid var(--el-color-danger);
}
.cp-msg-bubble {
  max-width: 85%;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.6;
}
.cp-msg-content :deep(p) {
  margin: 0 0 4px;
}
.cp-msg-content :deep(pre) {
  background: var(--el-fill-color);
  padding: 8px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
}
.cp-msg-content :deep(code) {
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 12px;
}
.cp-msg-content--streaming :deep(*) {
  animation: fadeIn 0.15s;
}
.cp-msg-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.cp-msg-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
}
.cp-typing {
  color: var(--el-text-color-secondary);
  font-style: italic;
  animation: blink 1s infinite;
}
.cp-msg-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.cp-msg-actions {
  display: flex;
  gap: 2px;
}
.cp-msg-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.cp-input-area {
  border-top: 1px solid var(--el-border-color-light);
  padding: 8px;
  flex-shrink: 0;
}
.cp-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.cp-toolbar-left,
.cp-toolbar-right {
  display: flex;
  align-items: center;
  gap: 2px;
}
.cp-input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
@keyframes fadeIn {
  from {
    opacity: 0.7;
  }
  to {
    opacity: 1;
  }
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
