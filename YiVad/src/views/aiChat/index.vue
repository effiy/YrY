<script setup lang="ts" name="aiChat">
import { onMounted } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useResizable } from "@/hooks/useResizable";
import AiChatBox from "@/components/AiChatBox/AiChatBox.vue";
import ConversationSidebar from "./components/ConversationSidebar.vue";
import SessionEditDialog from "./components/SessionEditDialog.vue";
import PageContextEditor from "./components/PageContextEditor.vue";
import TagManagerDialog from "./components/TagManagerDialog.vue";
import WeChatSettingsDialog from "./components/WeChatSettingsDialog.vue";

const store = useAiChatStore();

const { width: sidebarW, startResize } = useResizable(280, 200, 600, "aiChat.sidebarW");

onMounted(() => {
  store.loadConversations();
});
</script>

<template>
  <div class="ai-chat">
    <aside class="ai-chat__side" :style="{ width: sidebarW + 'px' }">
      <ConversationSidebar />
    </aside>
    <div class="ai-chat__resizer" @pointerdown="startResize" />
    <section class="ai-chat__main">
      <AiChatBox />
    </section>
    <SessionEditDialog />
    <PageContextEditor />
    <TagManagerDialog />
    <WeChatSettingsDialog />
  </div>
</template>

<style scoped lang="scss">
.ai-chat {
  display: flex;
  height: 100%;
  overflow: hidden;
  background: var(--el-bg-color-page);
}
.ai-chat__side {
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
}
.ai-chat__resizer {
  width: 4px;
  cursor: col-resize;
  background: var(--el-border-color-lighter);
  &:hover {
    background: var(--el-color-primary-light-7);
  }
}
.ai-chat__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}
.ai-chat__box {
  flex: 1;
  min-height: 0;
}
</style>
