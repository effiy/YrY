<template>
  <div class="rag-chat">
    <header class="rag-chat__header">
      <div>
        <h1>RAG Chat Playground</h1>
        <p>Conversational interface grounded in YiKnowledge. Each answer cites its sources with [N] markers.</p>
      </div>
      <div class="rag-chat__header-actions">
        <div class="scope-input">
          <span class="scope-label">Scope:</span>
          <el-input v-model="chatScope" placeholder="Full KB" size="small" clearable style="width: 160px" />
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
                v-for="(p, i) in examplePrompts"
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
          <el-tag :type="m.role === 'user' ? '' : 'success'" size="small" effect="dark">
            {{ m.role === "user" ? "You" : "RAG" }}
          </el-tag>
        </div>
        <div class="chat-msg__content" v-html="renderContent(m.content)"></div>
        <div v-if="m.streaming" class="chat-msg__streaming">
          <el-icon class="is-loading"><Loading /></el-icon> Generating…
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
            <div v-for="(s, si) in m.sources" :key="si" class="source-chip" @click="showSourceDetail(s, si)">
              <span class="source-chip__num">[{{ si + 1 }}]</span>
              <span class="source-chip__path">{{ s.file_path }}</span>
              <el-progress
                :percentage="scorePercent(s.score)"
                :stroke-width="4"
                :show-text="false"
                :color="scoreColor(s.score)"
                style="width: 40px"
              />
              <span class="source-chip__score">{{ scoreLabel(s.score) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="rag-chat__input">
      <el-input
        v-model="chatInput"
        type="textarea"
        :rows="2"
        placeholder="Ask a question grounded in the knowledge base…"
        @keyup.enter.exact="sendChat"
        :disabled="sending"
        resize="none"
      />
      <div class="input-actions">
        <span class="input-hint">Enter to send, Shift+Enter for newline</span>
        <div>
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
      <template v-if="dialogSource">
        <div class="detail-section">
          <h4>Document</h4>
          <el-link :href="kbDetailLink(dialogSource.file_path)" target="_blank" type="primary" :underline="false">
            {{ dialogSource.file_path }}
          </el-link>
        </div>
        <div class="detail-section">
          <h4>Relevance Score</h4>
          <div class="detail-score">
            <el-progress
              :percentage="scorePercent(dialogSource.score)"
              :stroke-width="10"
              :color="scoreColor(dialogSource.score)"
            />
            <span class="detail-score__text">{{ scoreLabel(dialogSource.score) }}</span>
          </div>
        </div>
        <div class="detail-section">
          <h4>Chunk Text</h4>
          <div class="detail-text"><pre>{{ dialogSource.text }}</pre></div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="ragChatPlayground">
import { ref, nextTick, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { Document, ArrowDown, Close, Promotion, Loading } from "@element-plus/icons-vue";
import { streamRagChat } from "@/api/modules/ragService";
import { useRagStore } from "@/stores/modules/rag";
import type { RagSource } from "@/api/interface/rag";

const ragStore = useRagStore();

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
let abortFn: (() => void) | null = null;

const sourceDialogVisible = ref(false);
const dialogSource = ref<RagSource | null>(null);

const examplePrompts = [
  "What are the RAG design patterns for chunking?",
  "How does the YiVad ProTable component work?",
  "Explain the dual-write file persistence model",
  "What are the best practices for hybrid retrieval?",
];

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

function renderContent(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\[(\d+)\]/g, '<span class="citation">[$1]</span>')
    .replace(/\n/g, "<br>");
}

function showSourceDetail(source: RagSource, _index: number) {
  dialogSource.value = source;
  sourceDialogVisible.value = true;
}

function scorePercent(score: number): number {
  if (score == null || isNaN(score)) return 0;
  return Math.round(score * 100);
}

function scoreLabel(score: number): string {
  if (score == null || isNaN(score)) return "—";
  return (score * 100).toFixed(1) + "%";
}

function scoreColor(score: number): string {
  if (score >= 0.7) return "#67c23a";
  if (score >= 0.4) return "#e6a23c";
  return "#f56c6c";
}

function kbDetailLink(filePath: string): string {
  return `/knowledge/detail?path=${encodeURIComponent(filePath)}`;
}

onBeforeUnmount(() => {
  stopChat();
});
</script>

<style scoped lang="scss">
.rag-chat {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px 0 16px;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 12px;

    h1 { margin: 0 0 4px; font-size: 20px; }
    p { margin: 0; color: var(--el-text-color-secondary); font-size: 13px; }
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__messages {
    flex: 1;
    overflow-y: auto;
    padding: 0 0 16px;
  }

  &__welcome {
    margin-top: 40px;
  }

  &__input {
    flex-shrink: 0;
    padding: 12px 0 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
  }
}

.scope-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-right: 4px;
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

.source-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: var(--el-color-primary-light-7); }

  &__num {
    font-size: 11px;
    font-weight: 700;
    color: var(--el-color-primary);
    flex-shrink: 0;
  }
  &__path {
    font-size: 11px;
    font-family: monospace;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--el-text-color-regular);
  }
  &__score {
    font-size: 11px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    min-width: 38px;
    text-align: right;
  }
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.input-hint {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

// Detail dialog (same styles as retrieval page)
.detail-section {
  margin-bottom: 16px;
  h4 { margin: 0 0 8px; font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
}
.detail-score {
  display: flex; align-items: center; gap: 12px;
  .el-progress { flex: 1; }
  &__text { font-size: 18px; font-weight: 700; }
}
.detail-text {
  background: var(--el-fill-color-light);
  border-radius: 6px; padding: 12px; max-height: 250px; overflow-y: auto;
  pre { margin: 0; font-size: 13px; line-height: 1.7; white-space: pre-wrap; word-break: break-word; }
}
</style>
