<template>
  <div class="md-toolbar">
    <el-button text size="small" title="Bold (Ctrl+B)" @click="wrap('**', '**')"><b>B</b></el-button>
    <el-button text size="small" title="Italic (Ctrl+I)" @click="wrap('*', '*')"><i>I</i></el-button>
    <el-button text size="small" title="Heading" @click="wrapLine('## ')">H</el-button>
    <el-button text size="small" title="Bullet List" @click="wrapLine('- ')">•</el-button>
    <el-button text size="small" title="Numbered List" @click="wrapLine('1. ')">1.</el-button>
    <el-button text size="small" title="Code" @click="wrap('`', '`')">&lt;/&gt;</el-button>
    <el-button text size="small" title="Code Block" @click="wrap('\n```\n', '\n```\n')">```</el-button>
    <el-button text size="small" title="Link" @click="wrap('[', '](url)')">🔗</el-button>
    <el-button text size="small" title="Checkbox" @click="wrapLine('- [ ] ')">☐</el-button>
    <el-button text size="small" title="Quote" @click="wrapLine('> ')">❝</el-button>
    <slot name="extra" />
  </div>
</template>

<script setup lang="ts" name="markdownToolbar">
const props = defineProps<{ targetId: string }>();

const emit = defineEmits<{ insert: [text: string] }>();

function getTextarea(): HTMLTextAreaElement | null {
  return document.getElementById(props.targetId) as HTMLTextAreaElement | null;
}

function wrap(before: string, after: string) {
  const ta = getTextarea();
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const text = ta.value;
  const selected = text.substring(start, end);
  const newText = text.substring(0, start) + before + selected + after + text.substring(end);
  ta.value = newText;
  ta.focus();
  ta.setSelectionRange(start + before.length, end + before.length);
  ta.dispatchEvent(new Event("input", { bubbles: true }));
  emit("insert", newText);
}

function wrapLine(prefix: string) {
  const ta = getTextarea();
  if (!ta) return;
  const start = ta.selectionStart;
  const text = ta.value;
  // Find start of current line
  let lineStart = start;
  while (lineStart > 0 && text[lineStart - 1] !== "\n") lineStart--;
  const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart);
  ta.value = newText;
  ta.focus();
  const newPos = lineStart + prefix.length;
  ta.setSelectionRange(newPos, newPos);
  ta.dispatchEvent(new Event("input", { bubbles: true }));
  emit("insert", newText);
}
</script>

<style scoped>
.md-toolbar {
  display: flex;
  gap: 2px;
  padding: 4px 6px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px 6px 0 0;
  border: 1px solid var(--el-border-color-lighter);
  border-bottom: none;
  flex-wrap: wrap;
}
.md-toolbar .el-button {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  font-size: 13px;
}
</style>