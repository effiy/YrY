<script setup lang="ts">
/**
 * MessageContent — text/markdown content rendering with streaming support.
 * Extracted from MessageBubble.vue.
 */
import { computed, ref } from 'vue';
import { renderMarkdown } from '../../utils';

const props = defineProps<{
  content: string;
  isUser: boolean;
  streaming: boolean;
  error: boolean;
  aborted: boolean;
  images: string[];
  isEmpty: boolean;
  showTyping: boolean;
  thinkingLabel: string;
  thinkingElapsed: number;
  thinkingWarnLevel: '' | 'slow' | 'long';
  thinkingWarnLabel: string;
  tokensPerSec: number | null;
  citedHtml: string;
  errorDisplay: string;
  contentDisplay: string;
  shouldCollapseError: boolean;
  shouldCollapseContent: boolean;
  errorCollapsed: boolean;
  contentCollapsed: boolean;
  errorCollapseThreshold: number;
  contentCollapseThreshold: number;
}>();

const emit = defineEmits<{
  toggleErrorCollapsed: [];
  toggleContentCollapsed: [];
  stopSending: [];
  markdownMouseUp: [e: MouseEvent];
  markdownClick: [e: MouseEvent];
  openLightbox: [src: string];
}>();

const markdownRef = ref<HTMLElement | null>(null);

defineExpose({ markdownRef });

/** Which HTML to render based on message state. */
const displayHtml = computed(() => {
  if (props.isUser) return renderMarkdown(props.content || '');
  if (props.showTyping) return '';
  if (props.streaming) {
    // Close unclosed fenced code blocks to prevent broken rendering
    const text = props.content || '';
    if (!text) return '';
    const openFences = (text.match(/```/g) || []).length;
    const safe = openFences % 2 === 1 ? text + '\n```' : text;
    return renderMarkdown(safe);
  }
  if (props.error) return renderMarkdown(props.errorDisplay);
  if (props.shouldCollapseContent) return renderMarkdown(props.contentDisplay);
  return props.citedHtml;
});

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 10_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 1000)}s`;
}

function onMarkdownMouseUp(e: MouseEvent) {
  if (props.isUser) return;
  emit('markdownMouseUp', e);
}
</script>

<template>
  <div class="mc-content">
    <!-- Images -->
    <div v-if="images.length > 0" class="mc-images">
      <img
        v-for="(src, i) in images"
        :key="`img-${i}-${src.slice(0, 12)}`"
        :src="src"
        :alt="`Attachment ${i + 1}`"
        class="mc-image"
        @click="emit('openLightbox', src)"
      />
    </div>

    <!-- Empty -->
    <div v-if="isEmpty && !streaming" class="mc-empty" />

    <!-- Typing indicator (mirrors YiVad PetMessage) -->
    <div
      v-else-if="showTyping"
      class="mc-typing"
      :class="{ 'mc-typing--slow': thinkingWarnLevel === 'slow', 'mc-typing--long': thinkingWarnLevel === 'long' }"
      role="status"
      aria-label="Generating"
    >
      <div class="mc-typing-inner">
        <span class="mc-typing-pulse"><span /><span /><span /></span>
        <span class="mc-typing-phase">{{ thinkingLabel }}</span>
        <span v-if="thinkingElapsed > 500" class="mc-typing-elapsed">{{ formatElapsed(thinkingElapsed) }}</span>
      </div>
      <div v-if="thinkingWarnLabel" class="mc-typing-warn">{{ thinkingWarnLabel }}</div>
      <button class="mc-typing-stop" title="Stop generating" @click="emit('stopSending')">
        <span class="mc-typing-stop-icon" />
        Stop
      </button>
    </div>

    <!-- Markdown content with streaming enhancements -->
    <div v-else class="mc-markdown-wrap" :class="{ 'is-streaming': streaming }">
      <div v-if="streaming && !isUser" class="mc-live-indicator">
        <span class="mc-live-dot" />
        <span class="mc-live-label">typing</span>
      </div>
      <div
        ref="markdownRef"
        class="mc-markdown markdown-content"
        :class="{ 'mc-markdown--streaming': streaming }"
        v-html="displayHtml"
        @mouseup="onMarkdownMouseUp"
        @click="(e: MouseEvent) => emit('markdownClick', e)"
      />
      <span v-if="streaming" class="mc-caret" aria-hidden="true" />
      <span v-if="tokensPerSec && streaming" class="mc-speed">{{ tokensPerSec }} tok/s</span>
      <div v-if="streaming && !isUser" class="mc-stream-fade" />
      <button
        v-if="error && shouldCollapseError"
        class="mc-collapse-btn"
        @click="emit('toggleErrorCollapsed')"
      >
        Expand error ({{ (content || '').length }} chars)
      </button>
      <button
        v-if="error && !shouldCollapseError && (content || '').length > errorCollapseThreshold"
        class="mc-collapse-btn"
        @click="emit('toggleErrorCollapsed')"
      >
        Collapse
      </button>
      <button
        v-if="!isUser && !streaming && !error && shouldCollapseContent"
        class="mc-collapse-btn"
        @click="emit('toggleContentCollapsed')"
      >
        Read more ({{ (content || '').length }} chars)
      </button>
      <button
        v-if="!isUser && !streaming && !error && !shouldCollapseContent && (content || '').length > contentCollapseThreshold"
        class="mc-collapse-btn"
        @click="emit('toggleContentCollapsed')"
      >
        Collapse
      </button>
    </div>

    <!-- Error/aborted tags -->
    <div v-if="error" class="mc-tag mc-tag--error">Generation failed</div>
    <div v-if="aborted && !error" class="mc-tag mc-tag--aborted">Stopped</div>
  </div>
</template>

<style lang="scss" scoped>
.mc-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.mc-images { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }
.mc-image {
  max-width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.14);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 16px 30px rgba(15, 23, 42, 0.2);
  }
}
.mc-empty { min-height: 14px; }

.mc-typing {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
  padding: 10px 14px;
  color: var(--text-secondary, #d4d0e8);
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.08);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.16);
  border-radius: 16px 16px 16px 8px;
  transition: background 0.3s, border-color 0.3s;
}
.mc-typing--slow {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
}
.mc-typing--long {
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.3);
}
.mc-typing-inner {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
.mc-typing-elapsed {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary, #d4d0e8);
  opacity: 0.7;
}
.mc-typing-warn {
  font-size: 11px;
  font-weight: 500;
  color: #eab308;
}
.mc-typing--long .mc-typing-warn {
  color: var(--el-color-danger);
}
.mc-typing-stop {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-color-danger);
  cursor: pointer;
  background: none;
  border: 1px solid rgba(255, 77, 79, 0.3);
  border-radius: 4px;
  transition: all 0.15s;
  &:hover {
    color: #fff;
    background: var(--el-color-danger);
    border-color: var(--el-color-danger);
  }
}
.mc-typing-stop-icon {
  display: block;
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 1px;
}
.mc-typing-phase {
  font-style: normal;
  font-size: 12px;
  font-weight: 600;
  font-family: 'SF Mono', 'Menlo', monospace;
  letter-spacing: 0.3px;
  color: var(--primary-light, var(--el-color-primary));
}
.mc-typing-pulse {
  display: inline-flex;
  gap: 5px;
  align-items: center;
}
.mc-typing-pulse span {
  width: 7px;
  height: 7px;
  background: var(--primary-light, var(--el-color-primary));
  border-radius: 50%;
  animation: mc-pulse 1.4s ease-in-out infinite;
}
.mc-typing-pulse span:nth-child(2) { animation-delay: 0.2s; }
.mc-typing-pulse span:nth-child(3) { animation-delay: 0.4s; }

@keyframes mc-pulse {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

.mc-tag {
  align-self: flex-start; display: inline-block; font-size: 11px;
  padding: 3px 8px; border-radius: 999px; margin-top: 2px;
}
.mc-tag--error {
  background: rgba(255, 77, 79, 0.15); color: var(--el-color-danger);
  border: 1px solid rgba(255, 77, 79, 0.4);
}
.mc-tag--aborted {
  background: rgba(0, 0, 0, 0.06); color: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(0, 0, 0, 0.15);
}

/* Markdown + caret */
.mc-markdown-wrap {
  position: relative;
  transition: padding 0.15s;
  &.is-streaming {
    padding-bottom: 4px;
    border-left: 2px solid rgba(var(--primary-rgb, 99, 102, 241), 0.45);
    padding-left: 12px;
    animation: mc-stream-glow 2s ease-in-out infinite;
  }
}

/* Live typing indicator badge */
.mc-live-indicator {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 2px 10px;
  margin-bottom: 6px;
  font-size: 11px;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.22);
  border-radius: 999px;
  animation: mc-live-fade-in 0.3s ease-out;
}
.mc-live-dot {
  width: 6px;
  height: 6px;
  background: var(--primary-light, var(--el-color-primary));
  border-radius: 50%;
  animation: mc-live-pulse 1s ease-in-out infinite;
}
.mc-live-label {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 10px;
  font-weight: 600;
  color: var(--primary-light, var(--el-color-primary));
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@keyframes mc-live-fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes mc-live-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.3); }
}

/* Bottom gradient fade */
.mc-stream-fade {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 24px;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, rgba(12, 18, 32, 0.42) 80%);
  border-radius: 0 0 14px 14px;
  animation: mc-fade-pulse 2s ease-in-out infinite;
}
@keyframes mc-fade-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.9; }
}

@keyframes mc-stream-glow {
  0%, 100% { border-left-color: rgba(var(--primary-rgb, 99, 102, 241), 0.45); }
  50% { border-left-color: var(--primary-light, var(--el-color-primary)); }
}

.mc-markdown {
  animation: mc-fade-in 0.2s ease-out;

  &--streaming {
    animation: none;
  }
}

@keyframes mc-fade-in {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

.mc-caret {
  display: inline-block; width: 8px; height: 1.35em; margin-left: 1px;
  background: var(--primary-light, var(--el-color-primary));
  vertical-align: text-bottom;
  border-radius: 1px;
  box-shadow: 0 0 8px rgba(var(--primary-rgb, 99, 102, 241), 0.6);
  animation: mc-caret-blink 0.7s step-end infinite;
}

@keyframes mc-caret-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.mc-speed {
  margin-left: 6px;
  font-size: 10px;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary, #d4d0e8);
  opacity: 0.7;
}

// ── Code block line numbers ──
:deep(pre) {
  counter-reset: mc-line;
  code {
    counter-increment: mc-line;
    &::before {
      content: none;
    }
  }
  .line {
    display: block;
    &::before {
      counter-increment: mc-line;
      content: counter(mc-line);
      display: inline-block;
      width: 2em;
      margin-right: 1em;
      text-align: right;
      color: rgba(255, 255, 255, 0.2);
      font-size: 0.85em;
      user-select: none;
    }
  }
}

/* ── Markdown Content Typography ───────── */

.mc-markdown {
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin: 1.2em 0 0.5em;
    line-height: 1.3;
    font-weight: 600;
    &:first-child { margin-top: 0; }
  }
  :deep(h1) { font-size: 1.4em; border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.22); padding-bottom: 0.3em; }
  :deep(h2) { font-size: 1.25em; }
  :deep(h3) { font-size: 1.1em; }
  :deep(h4) { font-size: 1em; color: var(--text-secondary, #d4d0e8); }

  :deep(p) { margin: 0.6em 0; line-height: 1.65; }
  :deep(p:first-child) { margin-top: 0; }
  :deep(p:last-child) { margin-bottom: 0; }

  :deep(a) {
    color: var(--link-color, var(--el-color-primary));
    text-decoration: none;
    border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
    transition: border-color 0.15s;
    &:hover { border-color: var(--primary-light, var(--el-color-primary)); }
  }

  :deep(.cite-chip) {
    display: inline-flex;
    align-items: center;
    margin: 0 1px;
    padding: 0 5px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.4;
    color: var(--primary-light, var(--el-color-primary));
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
    border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.26);
    border-radius: 6px;
    cursor: pointer;
    user-select: none;
    vertical-align: super;
    transition: background 0.12s, transform 0.12s;
    &:hover {
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.22);
      color: #fff;
      transform: translateY(-1px);
    }
  }

  :deep(strong) { font-weight: 700; color: var(--text-primary, #f5f3ff); }
  :deep(em) { font-style: italic; }

  :deep(ul), :deep(ol) {
    margin: 0.4em 0;
    padding-left: 1.5em;
    line-height: 1.65;
  }
  :deep(li) { margin: 0.2em 0; }
  :deep(ul) { list-style: disc; }
  :deep(ul ul) { list-style: circle; }
  :deep(ul ul ul) { list-style: square; }
  :deep(ol) { list-style: decimal; }

  :deep(blockquote) {
    margin: 0.6em 0;
    padding: 6px 14px;
    border-left: 3px solid var(--primary-light, var(--el-color-primary));
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.06);
    border-radius: 0 4px 4px 0;
    color: var(--text-secondary, #d4d0e8);
    p { margin: 0.3em 0; }
  }

  :deep(code) {
    font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
    font-size: 0.88em;
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
    padding: 1px 5px;
    border-radius: 4px;
    color: var(--text-primary, #e2e8f0);
  }

  :deep(pre) {
    position: relative;
    margin: 0.8em 0;
    padding: 14px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.55;
    background: rgba(10, 14, 26, 0.55);
    border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.18);
    border-radius: 14px;

    code {
      background: none;
      padding: 0;
      font-size: inherit;
      color: inherit;
      border-radius: 0;
    }
  }

  :deep(.code-block-wrapper) {
    margin: 0.8em 0;
    border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.18);
    border-radius: 14px;
    overflow: hidden;

    pre {
      margin: 0;
      border: none;
      border-radius: 0;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }

  :deep(.code-block-header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.14);
  }

  :deep(.code-block-lang) {
    font-size: 10px;
    font-weight: 700;
    font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--primary-light, var(--el-color-primary));
  }

  :deep(table) {
    width: 100%;
    margin: 0.8em 0;
    border-collapse: collapse;
    font-size: 0.92em;
    overflow: hidden;
    border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.18);
    border-radius: 14px;
  }

  :deep(th), :deep(td) {
    padding: 8px 12px;
    border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.14);
    text-align: left;
  }

  :deep(th) {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
    font-weight: 600;
    font-size: 0.85em;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: var(--primary-light, var(--el-color-primary));
  }

  :deep(tr:nth-child(even) td) {
    background: rgba(255, 255, 255, 0.02);
  }

  :deep(tr:hover td) {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.06);
  }

  // ── Task list checkboxes ──
  :deep(input[type="checkbox"]) {
    margin-right: 6px;
    accent-color: var(--primary, #6366f1);
    width: 14px;
    height: 14px;
    cursor: default;
    vertical-align: middle;
  }

  :deep(li:has(input[type="checkbox"]:checked)) {
    text-decoration: line-through;
    opacity: 0.6;
  }

  :deep(hr) {
    margin: 1em 0;
    border: none;
    border-top: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.18);
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 0.4em 0;
  }

  :deep(pre.mermaid) {
    all: unset;
    display: block;
    overflow-x: auto;
    margin: 12px 0;
    svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
  }
}

/* Code copy button */
:deep(.mc-markdown .mb-code-copy),
:deep(.mb-code-copy) {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  font-size: 11px;
  font-family: inherit;
  color: var(--text-secondary, #d4d0e8);
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.22);
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease;

  &:hover {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.24);
    color: var(--text-primary, #f5f3ff);
  }
}

:deep(pre:hover .mb-code-copy) {
  opacity: 1;
}

.mc-collapse-btn {
  display: inline-flex;
  align-items: center;
  margin-top: 6px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--primary-light, var(--el-color-primary));
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.08);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.18);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.16);
    border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.3);
  }
}
</style>