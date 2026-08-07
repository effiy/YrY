<script setup lang="ts" name="aiChatMessageList">
import { ref, watch, computed } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import MessageBubble from "./MessageBubble.vue";

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

// Auto-dismiss confirmation banner after 15 seconds
watch(() => store.pendingConfirmation, (conf) => {
  if (conf) {
    setTimeout(() => {
      if (store.pendingConfirmation?.timestamp === conf.timestamp) {
        store.pendingConfirmation = null;
      }
    }, 15000);
  }
});

function dismissConfirmation() {
  store.pendingConfirmation = null;
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

    <!-- Tool confirmation banner (Pi-inspired: tool requires user approval) -->
    <div v-if="store.pendingConfirmation" class="ml-confirmation">
      <span class="ml-confirmation-icon">🛡️</span>
      <span class="ml-confirmation-text">
        Tool <code>{{ store.pendingConfirmation.toolName }}</code> requires confirmation
        <span v-if="Object.keys(store.pendingConfirmation.toolArgs).length">
          with args: {{ JSON.stringify(store.pendingConfirmation.toolArgs) }}
        </span>
        — skipped for safety.
      </span>
      <button class="ml-confirmation-dismiss" @click="dismissConfirmation">✕</button>
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
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
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
}

.ml-confirmation-text {
  flex: 1;

  code {
    font-family: monospace;
    font-weight: 600;
    background: var(--el-color-warning-light-7);
    padding: 0 4px;
    border-radius: 3px;
  }
}

.ml-confirmation-dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 50%;
  font-size: 10px;
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-7);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--el-color-warning-light-5);
  }
}
</style>
