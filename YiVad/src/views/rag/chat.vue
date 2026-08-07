<template>
  <div class="rag-page rag-page--narrow rag-chat">
    <header class="rag-page-header">
      <div>
        <h1>RAG Chat Playground</h1>
        <p>Conversational interface grounded in YiKnowledge. Each answer cites its sources with [N] markers.</p>
      </div>
      <div class="rag-page-header__actions">
        <div class="rag-scope-row">
          <span class="rag-param-label">Scope:</span>
          <el-input v-model="chatScope" placeholder="Full KB" size="small" clearable class="rag-scope-input" />
        </div>
        <el-button text type="danger" size="small" @click="clearChat" :disabled="!messages.length">
          Clear Chat
        </el-button>
      </div>
    </header>

    <!-- Chat Messages -->
    <div class="rag-chat__messages" ref="msgContainer">
      <div v-if="!messages.length && !sending" class="rag-chat__welcome">
        <el-empty description="Ask a question grounded in the YiKnowledge base." :image-size="80">
          <template #extra>
            <div class="welcome-prompts">
              <p>Try asking:</p>
              <el-tag
                v-for="(p, i) in CHAT_EXAMPLE_PROMPTS"
                :key="i"
                class="welcome-tag"
                @click="chatInput = p; sendChat()"
                effect="plain"
              >
                {{ p }}
              </el-tag>
            </div>
          </template>
        </el-empty>
      </div>

      <div
        v-for="(m, i) in messages"
        :key="i"
        class="chat-msg"
        :class="{ 'chat-msg--user': m.role === 'user', 'chat-msg--assistant': m.role === 'assistant' }"
      >
        <div class="chat-msg__role">
          <el-tag :type="m.role === 'user' ? 'info' : 'success'" size="small" effect="dark">
            {{ m.role === "user" ? "You" : "RAG" }}
          </el-tag>
        </div>
        <div class="chat-msg__content" v-html="renderAnswer(m.content)"></div>
        <div v-if="m.streaming" class="chat-msg__streaming">
          <el-icon class="is-loading"><Loading /></el-icon> Generating…
        </div>

        <!-- Message actions (assistant only, after streaming completes) -->
        <div v-if="m.role === 'assistant' && !m.streaming && m.content" class="chat-msg__actions">
          <el-button text size="small" :icon="CopyDocument" @click="copyAnswer(m.content)">Copy</el-button>
          <el-button text size="small" :icon="ChatDotRound" @click="continueInAiChat(m)">Continue in AI Chat</el-button>
          <el-button
            v-if="isLastAssistant(m, i)"
            text
            size="small"
            :icon="RefreshRight"
            :disabled="sending"
            @click="regenerateLast()"
          >
            Regenerate
          </el-button>
        </div>

        <!-- Sources for assistant messages -->
        <div v-if="m.role === 'assistant' && m.sources?.length" class="chat-msg__sources">
          <div class="sources-header" @click="m._showSources = !m._showSources">
            <el-icon><Document /></el-icon>
            {{ m.sources.length }} source{{ m.sources.length > 1 ? "s" : "" }}
            <el-icon class="sources-chevron" :class="{ 'is-reversed': m._showSources }">
              <ArrowDown />
            </el-icon>
          </div>
          <div v-show="m._showSources" class="sources-list">
            <SourceChip
              v-for="(s, si) in m.sources"
              :key="si"
              :source="s"
              :index="si"
              @click="showSourceDetail(s, si)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="rag-chat__input">
      <el-input
        ref="chatInputRef"
        v-model="chatInput"
        type="textarea"
        :rows="2"
        placeholder="Ask a question grounded in the knowledge base…"
        @keyup.enter.exact="sendChat"
        :disabled="sending"
        resize="none"
      />
      <div class="input-actions">
        <span class="rag-text-muted rag-chat-hint"><kbd>/</kbd> focus · <kbd>Enter</kbd> send · <kbd>Shift</kbd>+<kbd>Enter</kbd> newline</span>
        <div class="rag-chat-actions">
          <el-button v-if="sending" type="danger" plain size="small" @click="stopChat">
            <el-icon><Close /></el-icon> Stop
          </el-button>
          <el-button type="primary" size="small" :loading="sending" @click="sendChat" :disabled="!chatInput.trim() || sending">
            <el-icon><Promotion /></el-icon> Send
          </el-button>
        </div>
      </div>
    </div>

    <!-- Source Detail Dialog -->
    <el-dialog v-model="sourceDialogVisible" title="Source Detail" width="600px">
      <SourceDetail v-if="dialogSource" :source="dialogSource" :index="dialogSourceIndex" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="ragChatPlayground">
import { ref, nextTick, onMounted, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import type { InputInstance } from "element-plus";
import { Document, ArrowDown, Close, Promotion, Loading, CopyDocument, RefreshRight, ChatDotRound } from "@element-plus/icons-vue";
import { streamRagChat } from "@/api/modules/ragService";
import {
  renderAnswer, CHAT_EXAMPLE_PROMPTS
} from "@/views/rag/constants";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import SourceChip from "./components/SourceChip.vue";
import SourceDetail from "./components/SourceDetail.vue";
import type { RagSource } from "@/api/interface/rag";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: RagSource[];
  streaming?: boolean;
  _showSources?: boolean;
}

const messages = ref<ChatMessage[]>([]);
const chatInput = ref("");
const chatScope = ref("");
const sending = ref(false);
const msgContainer = ref<HTMLElement | null>(null);
const chatInputRef = ref<InputInstance>();
let abortFn: (() => void) | null = null;

function focusChatInput() {
  chatInputRef.value?.focus?.();
}
function slashKeyHandler(e: KeyboardEvent) {
  if (e.key !== "/") return;
  const target = e.target as HTMLElement | null;
  const tag = target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable === true) return;
  e.preventDefault();
  focusChatInput();
}

onMounted(() => {
  focusChatInput();
  window.addEventListener("keydown", slashKeyHandler);
});

const sourceDialogVisible = ref(false);
const dialogSource = ref<RagSource | null>(null);
const dialogSourceIndex = ref(0);

async function sendChat() {
  const q = chatInput.value.trim();
  if (!q || sending.value) return;

  const userMsg: ChatMessage = { role: "user", content: q };
  const assistantMsg: ChatMessage = { role: "assistant", content: "", sources: [], streaming: true, _showSources: false };
  messages.value.push(userMsg, assistantMsg);
  chatInput.value = "";
  sending.value = true;

  await nextTick();
  scrollToBottom();

  const history = messages.value
    .filter((m) => !m.streaming && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content }));

  const { abort } = streamRagChat(
    { messages: history, scope: chatScope.value || undefined },
    {
      onChunk: (text: string) => {
        const last = messages.value[messages.value.length - 1];
        if (last?.role === "assistant") last.content += text;
        scrollToBottom();
      },
      onSources: (sources: RagSource[]) => {
        const last = messages.value[messages.value.length - 1];
        if (last?.role === "assistant") {
          last.sources = sources;
          last._showSources = sources.length > 0;
        }
      },
      onDone: () => {
        sending.value = false;
        abortFn = null;
        const last = messages.value[messages.value.length - 1];
        if (last?.role === "assistant") last.streaming = false;
      },
      onError: (err: Error) => {
        sending.value = false;
        abortFn = null;
        const last = messages.value[messages.value.length - 1];
        if (last?.role === "assistant") {
          last.streaming = false;
          if (!last.content) last.content = `Error: ${err.message}`;
        }
        ElMessage.error(err.message);
      },
    }
  );
  abortFn = abort;
}

function showSourceDetail(source: RagSource, index: number) {
  dialogSource.value = source;
  dialogSourceIndex.value = index;
  sourceDialogVisible.value = true;
}

async function copyAnswer(content: string) {
  try {
    await navigator.clipboard.writeText(content);
    ElMessage.success({ message: "Answer copied to clipboard", duration: 1500 });
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

const aiChatStore = useAiChatStore();
const { openInAiChat } = useAiChatBridge();

async function continueInAiChat(m: ChatMessage) {
  const sources = m.sources ?? [];
  const ctxSections = sources.slice(0, 3).map((s, i) =>
    `## ${i + 1}. ${s.file_path}\n\n${s.text?.slice(0, 400) ?? ""}`
  ).join("\n\n---\n\n");
  const tags: string[] = ["rag"];
  if (chatScope.value) tags.push(`ctx:${chatScope.value}`);
  const userQuestion = [...messages.value].reverse().find(x => x.role === "user")?.content ?? "";
  await openInAiChat({
    title: userQuestion ? `RAG: ${userQuestion.slice(0, 60)}` : "RAG follow-up",
    pageContent: ctxSections,
    tags,
    sourceUrl: `/rag/chat`
  });
  aiChatStore.input = `Following up on this RAG answer:\n\n${m.content.slice(0, 800)}`;
}

function isLastAssistant(m: ChatMessage, idx: number): boolean {
  if (m.role !== "assistant") return false;
  for (let j = idx + 1; j < messages.value.length; j++) {
    if (messages.value[j].role === "assistant") return false;
  }
  return true;
}

async function regenerateLast() {
  if (sending.value) return;
  // Find the last assistant message and its preceding user turn
  const lastIdx = messages.value.map(m => m.role).lastIndexOf("assistant");
  if (lastIdx < 0) return;
  // Remove the last assistant message — the user turn below it becomes the new "last"
  messages.value.splice(lastIdx, 1);
  // Re-stream a fresh assistant message using the remaining history
  const assistantMsg: ChatMessage = { role: "assistant", content: "", sources: [], streaming: true, _showSources: false };
  messages.value.push(assistantMsg);
  sending.value = true;
  await nextTick();
  scrollToBottom();

  const history = messages.value
    .filter((m) => !m.streaming && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content }));

  const { abort } = streamRagChat(
    { messages: history, scope: chatScope.value || undefined },
    {
      onChunk: (text: string) => {
        const last = messages.value[messages.value.length - 1];
        if (last?.role === "assistant") last.content += text;
        scrollToBottom();
      },
      onSources: (sources: RagSource[]) => {
        const last = messages.value[messages.value.length - 1];
        if (last?.role === "assistant") {
          last.sources = sources;
          last._showSources = sources.length > 0;
        }
      },
      onDone: () => {
        sending.value = false;
        abortFn = null;
        const last = messages.value[messages.value.length - 1];
        if (last?.role === "assistant") last.streaming = false;
      },
      onError: (err: Error) => {
        sending.value = false;
        abortFn = null;
        const last = messages.value[messages.value.length - 1];
        if (last?.role === "assistant") {
          last.streaming = false;
          if (!last.content) last.content = `Error: ${err.message}`;
        }
        ElMessage.error(err.message);
      },
    }
  );
  abortFn = abort;
}

function stopChat() {
  abortFn?.();
  abortFn = null;
  sending.value = false;
  const last = messages.value[messages.value.length - 1];
  if (last?.role === "assistant" && last.streaming) {
    last.streaming = false;
    if (!last.content) last.content = "_(Stopped)_";
  }
}

function clearChat() {
  stopChat();
  messages.value = [];
}

function scrollToBottom() {
  nextTick(() => {
    const el = msgContainer.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
}

onBeforeUnmount(() => {
  stopChat();
  window.removeEventListener("keydown", slashKeyHandler);
});
</script>

<style scoped lang="scss">
@use "./styles/shared.scss";

.rag-scope-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rag-scope-input {
  width: 160px;
}

.rag-chat-actions {
  display: flex;
  gap: 8px;
}

.rag-chat {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);

  &__messages {
    flex: 1;
    overflow-y: auto;
    padding: 0 0 16px;
  }

  &__welcome { margin-top: 40px; }

  &__input {
    flex-shrink: 0;
    padding: 12px 0 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
  }
}

.welcome-prompts {
  p { margin: 0 0 8px; font-size: 13px; color: var(--el-text-color-secondary); }
  .welcome-tag {
    margin: 4px;
    cursor: pointer;
    &:hover { color: var(--el-color-primary); border-color: var(--el-color-primary); }
  }
}

.chat-msg {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 8px;

  &--user {
    background: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary-light-7);
  }
  &--assistant {
    background: var(--el-fill-color);
    border: 1px solid var(--el-border-color-light);
  }

  &__role { margin-bottom: 6px; }

  &__content {
    font-size: 14px;
    line-height: 1.7;
    color: var(--el-text-color-primary);
    white-space: pre-wrap;
    word-break: break-word;

    :deep(.citation) {
      color: var(--el-color-primary);
      font-weight: 600;
      font-size: 11px;
      cursor: pointer;
      vertical-align: super;
    }
  }

  &__streaming {
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__actions {
    margin-top: 6px;
    display: flex;
    justify-content: flex-end;
    opacity: 0.6;
    transition: opacity 0.15s;
  }
  &:hover &__actions {
    opacity: 1;
  }

  &__sources {
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.sources-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  user-select: none;
  &:hover { color: var(--el-color-primary); }

  .sources-chevron {
    transition: transform 0.2s;
    &.is-reversed { transform: rotate(180deg); }
  }
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.rag-chat-hint {
  font-size: 11px;
  kbd {
    display: inline-block;
    min-width: 16px;
    padding: 1px 5px;
    font-family: "SF Mono", "Menlo", monospace;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 3px;
  }
}
</style>
