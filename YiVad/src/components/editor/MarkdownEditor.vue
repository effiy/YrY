<script setup lang="ts">
/**
 * Markdown editor with preview toggle.
 * Uses a simple textarea with live preview rendering.
 */
import { ref, computed } from "vue";

const props = withDefaults(defineProps<{
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}>(), {
  placeholder: "输入 Markdown 内容...",
  rows: 12,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const previewMode = ref(false);

function onInput(e: Event) {
  const value = (e.target as HTMLTextAreaElement).value;
  emit("update:modelValue", value);
}

function insertFormat(prefix: string, suffix: string = "") {
  const textarea = document.querySelector(".markdown-editor__textarea") as HTMLTextAreaElement;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = props.modelValue.substring(start, end);
  const newText = props.modelValue.substring(0, start) + prefix + selected + suffix + props.modelValue.substring(end);
  emit("update:modelValue", newText);

  // Restore cursor position
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
  });
}

// Simple markdown to HTML (for preview)
function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^\- (.+)$/gm, "<li>$1</li>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith("<")) return match;
      return match;
    });
}

const previewHtml = computed(() => {
  if (!props.modelValue) return "<p style='color:var(--el-text-color-placeholder)'>无内容</p>";
  return `<div style="line-height:1.8">${renderMarkdown(props.modelValue)}</div>`;
});
</script>

<template>
  <div class="markdown-editor" :class="{ 'is-preview': previewMode }">
    <div class="markdown-editor__toolbar">
      <el-button text size="small" @click="insertFormat('**', '**')" title="加粗">B</el-button>
      <el-button text size="small" @click="insertFormat('*', '*')" title="斜体"><em>I</em></el-button>
      <el-button text size="small" @click="insertFormat('`', '`')" title="代码">&lt;/&gt;</el-button>
      <el-button text size="small" @click="insertFormat('[', '](url)')" title="链接">🔗</el-button>
      <el-button text size="small" @click="insertFormat('- ')" title="列表">≡</el-button>
      <el-button text size="small" @click="insertFormat('> ')" title="引用">❝</el-button>
      <div class="markdown-editor__spacer" />
      <el-button text size="small" @click="previewMode = !previewMode">
        {{ previewMode ? '编辑' : '预览' }}
      </el-button>
    </div>

    <div class="markdown-editor__body">
      <textarea
        v-if="!previewMode"
        class="markdown-editor__textarea"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        @input="onInput"
      />
      <div
        v-else
        class="markdown-editor__preview"
        v-html="previewHtml"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.markdown-editor {
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;

  &__toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 6px 8px;
    background: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__spacer {
    flex: 1;
  }

  &__body {
    min-height: 200px;
  }

  &__textarea {
    display: block;
    width: 100%;
    min-height: 200px;
    padding: 12px;
    border: none;
    outline: none;
    resize: vertical;
    font-family: 'Menlo', 'Monaco', monospace;
    font-size: 14px;
    line-height: 1.7;
    color: var(--el-text-color-regular);
    background: var(--el-bg-color);

    &::placeholder {
      color: var(--el-text-color-placeholder);
    }
  }

  &__preview {
    padding: 16px;
    min-height: 200px;
    font-size: 14px;
    line-height: 1.8;
  }
}
</style>