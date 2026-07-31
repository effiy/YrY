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
</style>
