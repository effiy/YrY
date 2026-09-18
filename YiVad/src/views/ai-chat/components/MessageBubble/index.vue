<script setup lang="ts" name="aiChatMessageBubble">
import { computed, inject } from "vue";
import dayjs from "dayjs";
import { useAiChatStore } from "@/stores/modules/aiChat";
import type { ChatMessage } from "@/api/interface/yiAi";
import UserMessage from "./UserMessage.vue";
import PetMessage from "./PetMessage.vue";
import MessageActions from "./MessageActions.vue";

const props = defineProps<{
  message: ChatMessage;
  index: number;
  streaming: boolean;
}>();

const store = useAiChatStore();
const openMessageEditor = inject<(opts: { content: string; onSave: (content: string) => Promise<void> }) => void>(
  "openMessageEditor",
  () => {}
);

const isUser = computed(() => props.message.type === "user");
const time = computed(() => (props.message.timestamp ? dayjs(props.message.timestamp).format("MM/DD HH:mm:ss") : ""));
const tokenEstimate = computed(() => Math.ceil((props.message.message?.length ?? 0) / 4));

const prevRoleMessage = computed<{ tokens: number; snippet: string; ts: number | null } | null>(() => {
  const msgs = store.activeConversation?.messages ?? [];
  const myTs = props.message.timestamp;
  let myIdx = -1;
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].timestamp === myTs) {
      myIdx = i;
      break;
    }
  }
  if (myIdx < 1) return null;
  for (let j = myIdx - 1; j >= 0; j--) {
    if (msgs[j].type === props.message.type) {
      const text = msgs[j].message ?? "";
      const snippet = text.length > 80 ? text.slice(0, 79) + "…" : text;
      return {
        tokens: Math.ceil(text.length / 4),
        snippet: snippet.replace(/\s+/g, " "),
        ts: msgs[j].timestamp ?? null
      };
    }
  }
  return null;
});
const prevRoleTokenEstimate = computed(() => prevRoleMessage.value?.tokens ?? null);

function scrollToPrevRoleMessage(): void {
  const ts = prevRoleMessage.value?.ts;
  if (ts == null) return;
  const el = document.querySelector<HTMLElement>(`[data-msg-ts="${ts}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("mb-bubble--flash");
  window.setTimeout(() => el.classList.remove("mb-bubble--flash"), 2000);
}

const tokenTrend = computed<{ arrow: string; delta: number; sign: string; cls: string } | null>(() => {
  const prev = prevRoleTokenEstimate.value;
  if (prev == null) return null;
  const delta = tokenEstimate.value - prev;
  if (delta === 0) return { arrow: "→", delta: 0, sign: "±", cls: "mb-tokens-trend--flat" };
  if (delta > 0) return { arrow: "↑", delta, sign: "+", cls: "mb-tokens-trend--up" };
  return { arrow: "↓", delta: -delta, sign: "-", cls: "mb-tokens-trend--down" };
});

const charCount = computed(() => props.message.message?.length ?? 0);
const wordCount = computed(() => {
  const s = props.message.message ?? "";
  const trimmed = s.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
});
const lineCount = computed(() => {
  const s = props.message.message ?? "";
  if (!s) return 0;
  return s.split("\n").length;
});

const hasWebSearch = computed(() => !!props.message.searchContext && isUser.value);

function onEdit() {
  openMessageEditor({
    content: props.message.message ?? "",
    onSave: async (content: string) => {
      const next = content.trim();
      if (!next) return;
      await store.editMessage(props.index, next);
    }
  });
}
</script>

<template>
  <div
    class="mb-bubble"
    :class="{ 'mb-bubble--user': isUser, 'mb-bubble--pet': !isUser, 'mb-bubble--error': props.message.error }"
    :data-msg-ts="String(props.message.timestamp ?? '')"
  >
    <div class="mb-content">
      <UserMessage v-if="isUser" :message="props.message" :index="props.index" :streaming="props.streaming" />
      <PetMessage v-else :message="props.message" :index="props.index" :streaming="props.streaming" />
    </div>
    <div class="mb-meta">
      <MessageActions
        :message="props.message"
        :index="props.index"
        :is-user="isUser"
        :sending="store.sending"
        :has-web-search="hasWebSearch"
        :web-search-enabled="store.webSearchEnabled"
        @edit="onEdit"
      />
      <time class="mb-time">{{ time }}</time>
      <el-tooltip
        :content="`${charCount} chars · ${wordCount} words · ${lineCount} line(s) · ~${tokenEstimate} tokens (chars/4 estimate)`"
        placement="top"
        :show-after="300"
      >
        <span class="mb-tokens" :class="isUser ? 'mb-tokens--user' : 'mb-tokens--pet'">
          ~{{ tokenEstimate }} tok
          <el-tooltip v-if="tokenTrend" placement="top" :show-after="200">
            <template #content>
              <div class="mb-trend-tip">
                <div>
                  <b>Previous {{ isUser ? "user" : "pet" }} message:</b> ~{{ prevRoleTokenEstimate }} tok (Δ {{ tokenTrend.sign
                  }}{{ tokenTrend.delta }})
                </div>
                <div v-if="prevRoleMessage" class="mb-trend-tip-snip">"{{ prevRoleMessage.snippet }}"</div>
                <div class="mb-trend-tip-note">
                  {{
                    tokenTrend.cls === "mb-tokens-trend--up"
                      ? "Longer than previous"
                      : tokenTrend.cls === "mb-tokens-trend--down"
                        ? "Shorter than previous"
                        : "Same length as previous"
                  }}
                </div>
              </div>
            </template>
            <span class="mb-tokens-trend" :class="tokenTrend.cls" @click="scrollToPrevRoleMessage"
              >{{ tokenTrend.arrow }}{{ tokenTrend.delta > 0 ? tokenTrend.delta : "" }}</span
            >
          </el-tooltip>
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mb-bubble {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  padding: 10px 14px;
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.6;
  border-radius: var(--radius-md);
  animation: mb-slide-in 0.25s ease-out;
}

@keyframes mb-slide-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (width <= 767px) {
  .mb-bubble {
    max-width: 92%;
    padding: 8px 12px;
    font-size: 13px;
  }
}
.mb-bubble--user {
  align-self: flex-end;
  background: var(--el-color-primary-light-9);
  border-radius: var(--radius-md) var(--radius-md) var(--radius-xs);
  box-shadow: var(--shadow-sm);
}
.mb-bubble--pet {
  align-self: flex-start;
  background: var(--el-fill-color-light);
  border-radius: var(--radius-md) var(--radius-md) var(--radius-md) var(--radius-xs);
  box-shadow: var(--shadow-sm);
}
.mb-bubble--error {
  border: 1px solid var(--el-color-danger);
}
.mb-content {
  overflow-wrap: anywhere;
}
.mb-markdown :deep(p) {
  margin: 0 0 6px;
  &:last-child { margin-bottom: 0; }
}
.mb-markdown :deep(.cite-chip) {
  display: inline-flex;
  align-items: center;
  padding: 0 5px;
  margin: 0 1px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  vertical-align: super;
  color: var(--el-color-primary);
  cursor: pointer;
  user-select: none;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 6px;
  transition:
    background var(--transition-instant),
    transform var(--transition-instant);
  &:hover {
    color: #ffffff;
    background: var(--el-color-primary);
    transform: translateY(-1px);
  }
}
.mb-markdown :deep(pre) {
  padding: 10px 14px;
  margin: 6px 0;
  overflow-x: auto;
  font-size: 12px;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--radius-sm);
  code {
    font-family: "SF Mono", Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.55;
    background: none;
    border: none;
    padding: 0;
  }
}
.mb-markdown :deep(code):not(pre code) {
  padding: 1px 5px;
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.9em;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border: 1px solid var(--el-color-danger-light-7);
  border-radius: var(--radius-xs);
}
.mb-markdown :deep(blockquote) {
  padding: 6px 14px;
  margin: 6px 0;
  color: var(--el-text-color-secondary);
  border-left: 3px solid var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
  border-radius: 0 var(--radius-xs) var(--radius-xs) 0;
}
.mb-markdown :deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}
.mb-markdown :deep(ul),
.mb-markdown :deep(ol) {
  padding-left: 20px;
  margin: 4px 0;
}
.mb-markdown :deep(li) {
  margin: 2px 0;
  &::marker { color: var(--el-text-color-placeholder); }
}
.mb-markdown :deep(strong) {
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.mb-markdown :deep(hr) {
  height: 1px;
  margin: 10px 0;
  background: var(--el-border-color-lighter);
  border: none;
}

// Mermaid diagrams — <pre class="mermaid"> rendered by mermaid.run()
.mb-markdown :deep(pre.mermaid) {
  all: unset;
  display: block;
  margin: 8px 0;
  overflow-x: auto;

  // After mermaid.run() renders, the element contains an SVG
  svg {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 0 auto;
  }
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
  display: inline-flex;
  gap: 6px;
  align-items: baseline;
  font-style: italic;
  color: var(--el-text-color-secondary);
  animation: mb-blink 1s infinite;
}
.mb-typing-phase {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  font-style: normal;
  font-weight: 600;
  color: var(--el-color-primary);
  letter-spacing: 0.3px;
}
.mb-typing-detail {
  font-size: 12px;
  font-style: normal;
  color: var(--el-text-color-secondary);
}
.mb-typing-dots {
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

// ── RAG provenance badge — surfaces the llama_index config per answer ──
.mb-rag-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 6px;
}
.mb-rag-meta-mode {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 7px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 9px;
}
.mb-rag-meta-chip {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  border-radius: 9px;
}
.mb-rag-meta-chip--on {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}
.mb-rag-meta-chip--filter {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}
.mb-rag-meta-chip--latency {
  font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
}
.mb-rag-meta--bare {
  margin-top: 4px;
}

// ── Retrieval-quality grade badge (A/B/C/D) ──
.mb-rag-meta-grade {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
  font-weight: 800;
  color: var(--el-bg-color);
  border-radius: 50%;
}
.mb-rag-meta-grade--A {
  background: var(--el-color-success);
}
.mb-rag-meta-grade--B {
  background: var(--el-color-primary);
}
.mb-rag-meta-grade--C {
  color: var(--el-text-color-primary);
  background: var(--el-color-warning);
}
.mb-rag-meta-grade--D {
  background: var(--el-color-danger);
}
.mb-rag-meta-scope {
  padding: 1px 5px;
  font-size: 9px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 4px;
}

// ── RAG content summary — brief description of retrieved content ──
.mb-rag-summary {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px 12px;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 8px;
}
.mb-rag-summary-grade {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  font-weight: 800;
  color: var(--el-bg-color);
  border-radius: 50%;
}
.mb-rag-summary-grade--A {
  background: var(--el-color-success);
}
.mb-rag-summary-grade--B {
  background: var(--el-color-primary);
}
.mb-rag-summary-grade--C {
  color: var(--el-text-color-primary);
  background: var(--el-color-warning);
}
.mb-rag-summary-grade--D {
  background: var(--el-color-danger);
}
.mb-rag-summary-icon {
  flex-shrink: 0;
  font-size: 13px;
  line-height: 1.5;
}
.mb-rag-summary-text strong {
  font-weight: 600;
  color: var(--el-color-primary);
}
.mb-rag-summary-text em {
  font-style: normal;
  color: var(--el-text-color-primary);
}
.mb-web-indicator {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 8px;
  margin-top: 6px;
  font-size: 11px;
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  border-radius: 10px;
}

// ── Per-message tool-call cards (Pi-inspired: tool timeline) ──
.mb-tools {
  margin-top: 8px;
  overflow: hidden;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}
.mb-tools-head {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-fast);
}
.mb-tools-head:hover {
  background: var(--el-fill-color);
}
.mb-tools-label {
  font-weight: 600;
}
.mb-tools-caret {
  margin-left: auto;
  transition: transform 0.15s;
}
.mb-tools-caret.is-open {
  transform: rotate(180deg);
}
.mb-tools-list {
  padding: 4px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}
.mb-tool-call {
  padding: 6px 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.mb-tool-call:last-child {
  border-bottom: none;
}
.mb-tool-call--err {
  background: var(--el-color-danger-light-9);
}
.mb-tool-call-head {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  font-size: 11px;
}
.mb-tool-call-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.mb-tool-call-tag {
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-secondary);
}
.mb-tool-call-ms {
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}
.mb-tool-call-ms--slow {
  font-weight: 600;
  color: var(--el-color-warning);
}
.mb-tool-call-ms--very-slow {
  font-weight: 700;
  color: var(--el-color-danger);
}
.mb-tool-call-tag--slow {
  padding: 0 4px;
  font-size: 9px;
  font-weight: 700;
  color: var(--el-color-warning-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: var(--el-color-warning-light-9);
  border-radius: 3px;
}
.mb-tool-call-tag--very-slow {
  padding: 0 4px;
  font-size: 9px;
  font-weight: 700;
  color: var(--el-color-danger-dark-2);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: var(--el-color-danger-light-9);
  border-radius: 3px;
}
.mb-tool-call-state--err {
  font-weight: 600;
  color: var(--el-color-danger);
}
.mb-tool-call-args {
  font-size: 11px;
  color: var(--el-text-color-regular);
  word-break: break-all;
}
.mb-tool-call-args-label {
  margin-right: 4px;
  color: var(--el-text-color-placeholder);
}
.mb-tool-call-args code {
  font-family: "SF Mono", Menlo, monospace;
}
.mb-tool-call-content {
  position: relative;
  margin-top: 4px;
}
.mb-tool-call-content pre {
  max-height: 120px;
  padding: 6px 8px;
  margin: 0;
  overflow: auto;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  color: var(--el-text-color-regular);
  overflow-wrap: break-word;
  white-space: pre-wrap;
  background: var(--el-fill-color-darker);
  border-radius: 4px;
}
.mb-tool-call-copy {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.mb-tool-call-content-toggle {
  position: absolute;
  top: 4px;
  right: 140px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  opacity: 0;
  transition: opacity var(--transition-fast);
  &:hover {
    color: var(--el-color-primary);
  }
}
.mb-tool-call-content:hover .mb-tool-call-content-toggle,
.mb-tool-call-content:hover .mb-tool-call-copy {
  opacity: 1;
}
.mb-tool-call-save {
  position: absolute;
  top: 4px;
  right: 64px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.mb-tool-call-content:hover .mb-tool-call-save {
  opacity: 1;
}
.mb-tool-call-error {
  position: relative;
  padding-right: 140px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--el-color-danger);
}
.mb-tool-call-error-text {
  overflow-wrap: break-word;
  white-space: pre-wrap;
}
.mb-tool-call-error-toggle {
  position: absolute;
  top: 0;
  right: 140px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  opacity: 0;
  transition: opacity var(--transition-fast);
  &:hover {
    color: var(--el-color-danger);
  }
}
.mb-tool-call-error:hover .mb-tool-call-error-toggle {
  opacity: 1;
}
.mb-tool-call-copy--err {
  position: absolute;
  top: 0;
  right: 64px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.mb-tool-call-save--err {
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.mb-tool-call-error:hover .mb-tool-call-copy--err,
.mb-tool-call-error:hover .mb-tool-call-save--err {
  opacity: 1;
}
.mb-meta {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-xs);
  margin-top: var(--space-sm);
  border-top: 1px solid var(--el-border-color-lighter);
}
.mb-actions {
  display: flex;
  gap: 2px;
}
.mb-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.mb-tokens {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}
.mb-tokens--user {
  color: var(--el-color-info);
}
.mb-tokens--pet {
  color: var(--el-color-success);
}
.mb-tokens-trend {
  margin-left: 2px;
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  opacity: 0.85;
  &:hover {
    opacity: 1;
  }
}
.mb-tokens-trend--up {
  color: var(--el-color-danger);
}
.mb-tokens-trend--down {
  color: var(--el-color-success);
}
.mb-tokens-trend--flat {
  color: var(--el-text-color-placeholder);
}

// Flash highlight when navigating to a baseline message via trend click.
@keyframes mb-bubble-flash {
  0% {
    background: var(--el-color-primary-light-9);
    box-shadow: 0 0 0 0 var(--el-color-primary);
  }
  50% {
    background: var(--el-color-primary-light-9);
    box-shadow: 0 0 0 4px var(--el-color-primary-light-7);
  }
  100% {
    background: transparent;
    box-shadow: 0 0 0 0 transparent;
  }
}
.mb-bubble--flash {
  border-radius: 8px;
  animation: mb-bubble-flash 2s ease-out;
}
.mb-trend-tip {
  max-width: 320px;
  font-size: 12px;
  line-height: 1.5;
}
.mb-trend-tip b {
  font-weight: 600;
}
.mb-trend-tip-snip {
  padding: 3px 6px;
  margin: 4px 0;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  color: var(--el-text-color-regular);
  white-space: normal;
  background: var(--el-fill-color-light);
  border-radius: 3px;
}
.mb-trend-tip-note {
  font-size: 11px;
  font-style: italic;
  color: var(--el-text-color-secondary);
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
