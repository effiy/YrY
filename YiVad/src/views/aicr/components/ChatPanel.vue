<script setup lang="ts" name="aicrChatPanel">
import AiChatBox from "@/components/AiChatBox/AiChatBox.vue";
</script>

<template>
  <AiChatBox
    side="right"
    resizable
    collapsible
    :default-width="420"
    :min-width="280"
    :max-width="800"
    storage-key="aicr_chat_panel_width"
    collapsed-storage-key="aicr_chat_panel_collapsed"
  />
</template>

<style scoped lang="scss">
:deep(.ai-chat-box) {
  height: 100%;
}
</style>
