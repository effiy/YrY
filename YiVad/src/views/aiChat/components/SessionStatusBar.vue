<!--
  SessionStatusBar — Pi-inspired session state visualization.
  Compact bar showing: model, context files, token usage, RAG/compaction status.
  Renders between MessageList and ChatInput in the chat area.
-->
<script setup lang="ts" name="aiChatSessionStatusBar">
import { computed } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { DEFAULT_MODEL } from "@/views/aiChat/constants";
import { Cpu, Document, DataAnalysis, Coin } from "@element-plus/icons-vue";

const store = useAiChatStore();

const CHARS_PER_TOKEN = 4;
const CONTEXT_WINDOW = 8192;

const ctxFileCount = computed(() => {
  const tags = store.activeConversation?.tags ?? [];
  return tags.filter(t => typeof t === "string" && t.startsWith("ctx:")).length;
});

const totalChars = computed(() => {
  const msgs = store.activeConversation?.messages ?? [];
  let chars = 0;
  for (const m of msgs) chars += m.message?.length ?? 0;
  // Also count pageContent if present
  chars += (store.activeConversation?.pageContent ?? "").length;
  return chars;
});

const estimatedTokens = computed(() => Math.ceil(totalChars.value / CHARS_PER_TOKEN));

const tokenPercent = computed(() => {
  const pct = Math.round((estimatedTokens.value / CONTEXT_WINDOW) * 100);
  return Math.min(pct, 100);
});

const tokenLevel = computed<"low" | "mid" | "high">(() => {
  if (tokenPercent.value < 50) return "low";
  if (tokenPercent.value < 80) return "mid";
  return "high";
});

const ragActive = computed(() => store.ragActive);
const ragEnabled = computed(() => store.ragEnabled);
const webSearchOn = computed(() => store.webSearchEnabled);
const isStreaming = computed(() => store.sending);

const hasActiveSession = computed(() => !!store.activeConversation);
</script>

<template>
  <div v-if="hasActiveSession" class="ssb-bar">
    <!-- Model -->
    <span class="ssb-item" title="Model">
      <el-icon :size="12"><Cpu /></el-icon>
      <span class="ssb-label">{{ DEFAULT_MODEL }}</span>
    </span>

    <span class="ssb-sep">|</span>

    <!-- Context files -->
    <span
      class="ssb-item"
      :class="{ 'ssb-active': ctxFileCount > 0 }"
      :title="`${ctxFileCount} context file(s)`"
    >
      <el-icon :size="12"><Document /></el-icon>
      <span class="ssb-label">{{ ctxFileCount }} ctx</span>
    </span>

    <!-- Token usage bar -->
    <span class="ssb-item ssb-item--tokens" :title="`~${estimatedTokens} / ${CONTEXT_WINDOW} tokens`">
      <span class="ssb-token-bar">
        <span
          class="ssb-token-fill"
          :class="`ssb-token-fill--${tokenLevel}`"
          :style="{ width: tokenPercent + '%' }"
        />
      </span>
      <span class="ssb-label ssb-token-pct">{{ tokenPercent }}%</span>
    </span>

    <span class="ssb-sep">|</span>

    <!-- RAG status -->
    <span
      v-if="ragActive"
      class="ssb-item ssb-active"
      title="RAG active — responses grounded in context files"
    >
      <el-icon :size="12"><DataAnalysis /></el-icon>
      <span class="ssb-label">RAG</span>
    </span>

    <!-- Web search status -->
    <span
      v-if="webSearchOn"
      class="ssb-item ssb-active"
      title="Web search enabled"
    >
      <span class="ssb-dot ssb-dot--web" />
      <span class="ssb-label">Web</span>
    </span>

    <!-- Streaming indicator -->
    <span
      v-if="isStreaming"
      class="ssb-item ssb-active"
      title="AI is generating..."
    >
      <span class="ssb-pulse" />
      <span class="ssb-label">Generating</span>
    </span>
  </div>
</template>

<style scoped lang="scss">
.ssb-bar {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 12px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
  user-select: none;
}

.ssb-item {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  padding: 1px 6px;
  border-radius: 3px;
  transition: background 0.15s, color 0.15s;
}

.ssb-item:hover {
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
}

.ssb-active {
  color: var(--el-color-primary);
  font-weight: 600;
}

.ssb-active:hover {
  color: var(--el-color-primary);
}

.ssb-label {
  line-height: 1.4;
}

.ssb-sep {
  color: var(--el-border-color);
  font-size: 10px;
}

// Token bar
.ssb-item--tokens {
  gap: 6px;
  min-width: 60px;
}

.ssb-token-bar {
  width: 40px;
  height: 6px;
  background: var(--el-fill-color);
  border-radius: 3px;
  overflow: hidden;
}

.ssb-token-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease, background 0.3s;
}

.ssb-token-fill--low {
  background: var(--el-color-success);
}

.ssb-token-fill--mid {
  background: var(--el-color-warning);
}

.ssb-token-fill--high {
  background: var(--el-color-danger);
}

.ssb-token-pct {
  font-size: 10px;
  font-weight: 600;
  min-width: 28px;
}

// Status dots
.ssb-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.ssb-dot--web {
  background: var(--el-color-success);
}

.ssb-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-primary);
  animation: ssb-pulse 1.2s infinite;
}

@keyframes ssb-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}
</style>
