<script setup lang="ts" name="aicrMessageBubble">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import { CopyDocument, Pointer, Star, RefreshRight, Delete, Edit, Promotion, ChatDotRound } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useAicrChatStore } from "@/stores/modules/aicr/chat";
import { useAicrModalStore } from "@/stores/modules/aicr/modals";
import { useAicrWeChatStore } from "@/stores/modules/aicr/weChat";
import RagSources from "@/components/RagSources.vue";
import type { ChatMessage } from "@/api/interface/yiweb";

const props = defineProps<{
  message: ChatMessage;
  index: number;
  streaming: boolean;
}>();

const chatStore = useAicrChatStore();
const modalStore = useAicrModalStore();
const weChatStore = useAicrWeChatStore();
const router = useRouter();
const { render } = useMarkdown();

const isUser = computed(() => props.message.type === "user");
const html = computed(() => render(props.message.message ?? ""));
const time = computed(() => (props.message.timestamp ? dayjs(props.message.timestamp).format("MM/DD HH:mm:ss") : ""));
const copyLabel = computed(() => chatStore.copyFeedback[String(props.message.timestamp)] || "Copy");
const feedbackRating = computed(() => chatStore.feedback[props.message.timestamp] ?? null);
const showTyping = computed(() => props.streaming && !props.message.message?.trim() && !props.message.error);
const empty = computed(() => !props.message.message?.trim());
const showAbortedTag = computed(() => !!props.message.aborted && !props.message.error);
const showRetryLabel = computed(() => !!(props.message.error || props.message.aborted));

async function onRegenerate() {
  if (showRetryLabel.value) await chatStore.retryLastMessage();
  else await chatStore.regenerateMessageAt(props.index);
}

async function onDelete() {
  try {
    await ElMessageBox.confirm("Delete this message?", "Confirm delete", {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "warning"
    });
  } catch {
    return;
  }
  await chatStore.deleteMessage(props.index);
}

function onEdit() {
  modalStore.openMessageEdit(props.index, props.message.message ?? "", props.message.type);
}

async function sendToWeChat(robotIdx: number) {
  if (!props.message.message) return;
  await chatStore.sendToWeChatRobot(robotIdx, props.index);
}

function onOpenSourceFile(filePath: string) {
  // Knowledge file paths are relative to YiKnowledge — route to the
  // Knowledge detail page which reads via /knowledge-read.
  if (!filePath) return;
  router.push({ path: "/knowledge/detail", query: { path: filePath } });
}
</script>

<template>
  <div
    class="mb-bubble"
    :class="{ 'mb-bubble--user': isUser, 'mb-bubble--pet': !isUser, 'mb-bubble--error': props.message.error }"
  >
    <div class="mb-content">
      <div v-if="props.message.imageDataUrls?.length" class="mb-images">
        <img v-for="(src, i) in props.message.imageDataUrls" :key="i" :src="src" class="mb-img" alt="" />
      </div>
      <div v-if="empty && !showTyping" class="mb-empty" />
      <div v-else-if="showTyping" class="mb-typing">...</div>
      <div v-else class="mb-markdown" v-html="html" />
      <div v-if="props.message.error" class="mb-error-tag">Generation failed</div>
      <div v-else-if="showAbortedTag" class="mb-aborted-tag">Stopped</div>
      <RagSources
        v-if="!isUser && props.message.sources?.length"
        :sources="props.message.sources"
        @open-file="onOpenSourceFile"
      />
    </div>
    <div class="mb-meta">
      <div v-if="!isUser" class="mb-actions">
        <el-button size="small" text :icon="CopyDocument" @click="chatStore.copyMessage(props.message)">{{ copyLabel }}</el-button>
        <el-button size="small" text :icon="RefreshRight" :disabled="chatStore.sending" @click="onRegenerate">{{
          showRetryLabel ? "Retry" : "Regenerate"
        }}</el-button>
        <el-button size="small" text :icon="Delete" :disabled="chatStore.sending" @click="onDelete">Delete</el-button>
        <el-button
          size="small"
          text
          :icon="Pointer"
          :type="feedbackRating === 'like' ? 'primary' : ''"
          @click="chatStore.submitFeedback(props.message.timestamp, 'like')"
        />
        <el-button
          size="small"
          text
          :icon="Star"
          :type="feedbackRating === 'dislike' ? 'danger' : ''"
          @click="chatStore.submitFeedback(props.message.timestamp, 'dislike')"
        />
        <el-dropdown v-if="weChatStore.robots.length > 0 && props.message.message" @command="(r: number) => sendToWeChat(r)">
          <el-button size="small" text :icon="ChatDotRound" title="Forward to WeCom">WeCom</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(r, rIdx) in weChatStore.robots"
                :key="rIdx"
                :command="rIdx"
                :disabled="!r.enabled"
              >
                {{ r.name || r.webhook }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div v-else class="mb-actions">
        <el-button size="small" text :icon="Edit" :disabled="chatStore.sending" @click="onEdit">Edit</el-button>
        <el-button size="small" text :icon="Promotion" :disabled="chatStore.sending" @click="chatStore.resendMessageAt(props.index)"
          >Resend</el-button
        >
        <el-button size="small" text :icon="Delete" :disabled="chatStore.sending" @click="onDelete">Delete</el-button>
      </div>
      <time class="mb-time">{{ time }}</time>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mb-bubble {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.6;
  border-radius: 12px;
}
.mb-bubble--user {
  align-self: flex-end;
  background: var(--el-color-primary-light-9);
  border-radius: 12px 12px 4px;
}
.mb-bubble--pet {
  align-self: flex-start;
  background: var(--el-fill-color-light);
  border-radius: 12px 12px 12px 4px;
}
.mb-bubble--error {
  border: 1px solid var(--el-color-danger);
}
.mb-content {
  overflow-wrap: anywhere;
}
.mb-markdown :deep(p) {
  margin: 0 0 4px;
}
.mb-markdown :deep(pre) {
  padding: 8px;
  overflow-x: auto;
  font-size: 12px;
  background: var(--el-fill-color);
  border-radius: 6px;
}
.mb-markdown :deep(code) {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
}
.mb-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.mb-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
}
.mb-typing {
  font-style: italic;
  color: var(--el-text-color-secondary);
  animation: mb-blink 1s infinite;
}

@keyframes mb-blink {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}
.mb-empty {
  min-height: 1px;
}
.mb-error-tag {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-color-danger);
}
.mb-aborted-tag {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.mb-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.mb-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}
.mb-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
</style>
