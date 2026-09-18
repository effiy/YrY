<script setup lang="ts" name="aiChat">
import { onMounted, provide, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useAiChatStore } from "@/stores/modules/aiChat";
import AiChatBox from "@/components/AiChatBox/AiChatBox.vue";
import SessionEditDialog from "./components/SessionEditDialog.vue";
import TagManagerDialog from "./components/TagManagerDialog.vue";
import WeChatSettingsDialog from "./components/WeChatSettingsDialog.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import ChatSkeleton from "./components/ChatSkeleton.vue";
import ChatError from "./components/ChatError.vue";

const store = useAiChatStore();
const route = useRoute();

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

function openKnowledgePreview(path: string) {
  previewDlg.value?.open(path);
}

function openMessageEditor(opts: { content: string; onSave: (content: string) => Promise<void> }) {
  previewDlg.value?.openFile({
    path: `message-edit-${Date.now()}.md`,
    title: "Edit Message",
    content: opts.content,
    onSave: opts.onSave,
    initialMode: "split"
  });
}

provide("openKnowledgePreview", openKnowledgePreview);
provide("openMessageEditor", openMessageEditor);

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
  key => {
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
    <Transition name="fade" mode="out-in">
      <ChatError v-if="store.error" key="error" :message="store.error" @retry="store.loadConversations()" />
      <section v-else key="content" class="ai-chat__main">
        <ChatSkeleton v-if="store.loading && !store.activeConversation" type="messages" />
        <AiChatBox v-else />
      </section>
    </Transition>
    <KnowledgePreviewDialog ref="previewDlg" />
    <SessionEditDialog />
    <TagManagerDialog />
    <WeChatSettingsDialog />
  </div>
</template>

<style scoped lang="scss">
.ai-chat {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--el-bg-color-page);
}
.ai-chat__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast) ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
