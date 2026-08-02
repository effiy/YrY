<script setup lang="ts" name="aiChatMessageBubble">
import { computed, ref } from "vue";
import { ElMessageBox } from "element-plus";
import { CopyDocument, Pointer, Star, RefreshRight, Delete, Edit, Promotion, Search } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { detectContextChanges, hasPartialContextBlock } from "@/hooks/useContextChangeDetector";
import type { ContextChange } from "@/hooks/useContextChangeDetector";
import RagSources from "@/components/RagSources.vue";
import WebSearchResults from "./WebSearchResults.vue";
import ContextChangeCard from "./ContextChangeCard.vue";
import type { ChatMessage } from "@/api/interface/yiweb";

const props = defineProps<{
  message: ChatMessage;
  index: number;
  streaming: boolean;
}>();

const store = useAiChatStore();
const { render } = useMarkdown();

const isUser = computed(() => props.message.type === "user");
const html = computed(() => render(props.message.message ?? ""));
const time = computed(() => (props.message.timestamp ? dayjs(props.message.timestamp).format("MM/DD HH:mm:ss") : ""));
const copyLabel = computed(() => store.copyFeedback[String(props.message.timestamp)] || "Copy");
const feedbackRating = computed(() => store.feedback[props.message.timestamp] ?? null);
const showTyping = computed(() => props.streaming && !props.message.message?.trim() && !props.message.error);
const empty = computed(() => !props.message.message?.trim());
const showAbortedTag = computed(() => !!props.message.aborted && !props.message.error);
const showRetryLabel = computed(() => !!(props.message.error || props.message.aborted));
const hasWebSearch = computed(() => !!props.message.searchContext && isUser.value);

// ── Context change proposals ──

/** Detected context change proposals in this pet message. Only meaningful for pet messages. */
const contextChanges = computed<ContextChange[]>(() => {
  if (isUser.value || props.streaming) return [];
  return detectContextChanges(props.message.message ?? "");
});

const hasContextChanges = computed(() => contextChanges.value.length > 0);

/** During streaming, detect if the AI has started a context: block but not finished it. */
const showProposingChanges = computed(() => {
  if (!props.streaming || isUser.value || !props.message.message) return false;
  return hasPartialContextBlock(props.message.message ?? "");
});

/**
 * Markdown text with context: blocks stripped so they don't render as raw
 * code blocks alongside the ContextChangeCard.
 * Uses the same fence-aware approach as the detector: find opening ```context:
 * and match to the NEXT ``` at line start, handling nested code blocks.
 */
function stripContextBlocks(text: string): string {
  const OPEN_RE = /```context:[^\n]*\n/g;
  let result = "";
  let lastEnd = 0;
  let match: RegExpExecArray | null;
  OPEN_RE.lastIndex = 0;

  while ((match = OPEN_RE.exec(text)) !== null) {
    result += text.slice(lastEnd, match.index);
    // Find matching closing ``` at line start
    const afterOpen = text.slice(match.index + match[0].length);
    const closeMatch = /^```\s*$/gm.exec(afterOpen);
    if (closeMatch) {
      const closeIdx = match.index + match[0].length + closeMatch.index + closeMatch[0].length;
      lastEnd = closeIdx;
      OPEN_RE.lastIndex = closeIdx;
    } else {
      // No closing fence found — keep from opening onward
      lastEnd = match.index;
      break;
    }
  }
  result += text.slice(lastEnd);
  return result.trim();
}

const cleanMessageText = computed(() => {
  const text = props.message.message ?? "";
  if (hasContextChanges.value) {
    return stripContextBlocks(text);
  }
  return text;
});
const cleanHtml = computed(() => render(cleanMessageText.value));

/** Track applied/rejected state per change path */
const changeStates = ref<Record<string, "applied" | "rejected" | "error">>({});

async function onApplyChange(path: string, content: string) {
  try {
    // Find the specific change to determine action type
    const change = contextChanges.value.find(c => c.path === path);
    if (change?.action === "addTag") {
      await store.addContextFile(path);
    } else if (change?.action === "removeTag") {
      await store.removeContextFile(path);
    } else {
      await store.applyContextChange(path, content);
    }
    changeStates.value = { ...changeStates.value, [path]: "applied" };
  } catch {
    changeStates.value = { ...changeStates.value, [path]: "error" };
    throw new Error("Failed to apply");
  }
}

function onRejectChange(path: string) {
  changeStates.value = { ...changeStates.value, [path]: "rejected" };
}

function onUndoChange(path?: string) {
  store.undoLastContextChange(path);
}

async function applyAllChanges() {
  for (const change of contextChanges.value) {
    try {
      await onApplyChange(change.path, change.content);
    } catch {
      // continue to next change on error
    }
  }
}

function rejectAllChanges() {
  for (const change of contextChanges.value) {
    onRejectChange(change.path);
  }
}

async function onRegenerate() {
  if (showRetryLabel.value) await store.retryLastMessage();
  else await store.regenerateMessage(props.index);
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
  await store.deleteMessage(props.index);
}

async function onEdit() {
  let res: { value?: string } | null = null;
  try {
    res = await ElMessageBox.prompt("Enter new content", "Edit message", {
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      inputValue: props.message.message ?? ""
    });
  } catch {
    return;
  }
  const next = (res?.value ?? "").trim();
  if (!next) return;
  await store.editMessage(props.index, next);
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
      <!-- Context change proposals (pet messages only) -->
      <TransitionGroup v-if="hasContextChanges && !showTyping" name="ccc-list" tag="div" class="mb-changes">
        <!-- Batch actions when 2+ proposals -->
        <div v-if="contextChanges.length > 1" key="batch-bar" class="mb-batch-bar">
          <el-button size="small" type="primary" @click="applyAllChanges">
            Apply all ({{ contextChanges.length }})
          </el-button>
          <el-button size="small" text @click="rejectAllChanges">
            Reject all
          </el-button>
        </div>
        <ContextChangeCard
          v-for="(change, ci) in contextChanges"
          :key="change.path"
          :change="change"
          :on-apply="onApplyChange"
          :on-reject="onRejectChange"
          :on-undo="onUndoChange"
        />
      </TransitionGroup>
      <!-- Streaming: show indicator when AI is proposing a context change -->
      <div v-if="showProposingChanges" class="mb-proposing">
        <span class="mb-proposing-dot" />
        <span>Proposing context changes...</span>
      </div>
      <div v-if="empty && !showTyping" class="mb-empty" />
      <div v-else-if="showTyping" class="mb-typing">...</div>
      <div v-else class="mb-markdown" v-html="hasContextChanges ? cleanHtml : html" />
      <!-- Web search indicator for user messages that triggered a search -->
      <div v-if="hasWebSearch" class="mb-web-indicator">
        <el-icon :size="12"><Search /></el-icon>
        <span>Web search results used</span>
      </div>
      <WebSearchResults v-if="hasWebSearch" :results="store.webSearchResults" />
      <div v-if="props.message.error" class="mb-error-tag">Generation failed</div>
      <div v-else-if="showAbortedTag" class="mb-aborted-tag">Stopped</div>
      <RagSources
        v-if="!isUser && props.message.sources?.length"
        :sources="props.message.sources"
      />
    </div>
    <div class="mb-meta">
      <div v-if="!isUser" class="mb-actions">
        <el-button size="small" text :icon="CopyDocument" @click="store.copyMessage(props.message)">{{ copyLabel }}</el-button>
        <el-button size="small" text :icon="RefreshRight" :disabled="store.sending" @click="onRegenerate">{{
          showRetryLabel ? "Retry" : "Regenerate"
        }}</el-button>
        <el-button size="small" text :icon="Delete" :disabled="store.sending" @click="onDelete">Delete</el-button>
        <el-button
          size="small"
          text
          :icon="Pointer"
          :type="feedbackRating === 'like' ? 'primary' : ''"
          @click="store.submitFeedback(props.message.timestamp, 'like')"
        />
        <el-button
          size="small"
          text
          :icon="Star"
          :type="feedbackRating === 'dislike' ? 'danger' : ''"
          @click="store.submitFeedback(props.message.timestamp, 'dislike')"
        />
      </div>
      <div v-else class="mb-actions">
        <el-button size="small" text :icon="Edit" :disabled="store.sending" @click="onEdit">Edit</el-button>
        <el-button size="small" text :icon="Promotion" :disabled="store.sending" @click="store.resendMessage(props.index)"
          >Resend</el-button
        >
        <el-button
          v-if="!hasWebSearch"
          size="small" text :icon="Search" :disabled="store.sending"
          :type="store.webSearchEnabled ? 'primary' : ''"
          @click="store.webSearchEnabled = true; store.resendMessage(props.index)"
        >Search Web</el-button>
        <el-button size="small" text :icon="Delete" :disabled="store.sending" @click="onDelete">Delete</el-button>
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
.mb-web-indicator {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  margin-top: 6px;
  padding: 2px 8px;
  font-size: 11px;
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  border-radius: 10px;
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
  gap: 2px;
}
.mb-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.mb-changes {
  margin-bottom: 4px;
}
.mb-batch-bar {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 0 8px;
}
/* TransitionGroup for context cards */
.ccc-list-enter-active,
.ccc-list-leave-active {
  transition: all 0.25s ease;
}
.ccc-list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.ccc-list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.mb-proposing {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--el-color-primary);
  border: 1px dashed var(--el-color-primary-light-5);
  border-radius: 6px;
}
.mb-proposing-dot {
  width: 8px;
  height: 8px;
  background: var(--el-color-primary);
  border-radius: 50%;
  animation: mb-blink 1s infinite;
}
</style>
