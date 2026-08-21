<script setup lang="ts" name="aiChat">
import { onMounted, provide, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useResizable } from "@/hooks/useResizable";
import AiChatBox from "@/components/AiChatBox/AiChatBox.vue";
import ConversationSidebar from "./components/ConversationSidebar.vue";
import SessionEditDialog from "./components/SessionEditDialog.vue";
import TagManagerDialog from "./components/TagManagerDialog.vue";
import WeChatSettingsDialog from "./components/WeChatSettingsDialog.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";

const store = useAiChatStore();
const route = useRoute();

const { width: sidebarW, startResize } = useResizable(220, 200, 600, "aiChat.sidebarW");

// ── Shared knowledge file preview dialog ──

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

function openKnowledgePreview(path: string) {
  previewDlg.value?.open(path);
}

provide("openKnowledgePreview", openKnowledgePreview);

onMounted(() => {
  store.loadConversations().then(() => {
    const sessionKey = route.query.session;
    if (typeof sessionKey === "string" && sessionKey) {
      store.selectConversation(sessionKey).catch(() => {});
    }
  });
});

watch(
  () => route.query.session,
  (key) => {
    if (typeof key === "string" && key) {
      if (store.activeConversation?.key !== key) {
        store.selectConversation(key).catch(() => {});
      }
    }
  }
);
</script>

<template>
  <div class="ai-chat">
    <aside v-if="store.knowledgeSidebarVisible" class="ai-chat__side" :style="{ width: sidebarW + 'px' }">
      <ConversationSidebar />
    </aside>
    <div v-if="store.knowledgeSidebarVisible" class="ai-chat__resizer" @pointerdown="startResize" />
    <section class="ai-chat__main">
      <AiChatBox />
    </section>
    <KnowledgePreviewDialog ref="previewDlg" />
    <SessionEditDialog />
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
  height: calc(100vh - 95px);
  overflow: auto;
}
.ai-chat__box {
  flex: 1;
  min-height: 0;
}
</style>
