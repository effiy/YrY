<template>
  <div class="md-preview-wrap">
    <div class="md-preview-wrap__toolbar">
      <MarkdownToolbar :target-id="editorId" />
      <el-button text size="small" :icon="previewOpen ? Edit : View" @click="previewOpen = !previewOpen">
        {{ previewOpen ? "Edit" : "Preview" }}
      </el-button>
    </div>
    <div class="md-preview-wrap__body" :class="{ 'md-preview-wrap__body--split': previewOpen }">
      <textarea
        :id="editorId"
        ref="editorRef"
        :value="modelValue"
        class="md-preview-wrap__editor"
        :class="{ 'md-preview-wrap__editor--hidden': previewOpen && splitMode }"
        :placeholder="placeholder"
        @input="onInput"
      />
      <div
        v-if="previewOpen"
        class="md-preview-wrap__preview markdown-body"
        v-html="renderedPreview"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="markdownPreview">
import { ref, computed } from "vue";
import { Edit, View } from "@element-plus/icons-vue";
import MarkdownToolbar from "@/components/MarkdownToolbar/MarkdownToolbar.vue";
import { useMarkdown } from "@/hooks/useMarkdown";

const props = withDefaults(defineProps<{
  modelValue: string;
  editorId: string;
  placeholder?: string;
  splitMode?: boolean;
}>(), { placeholder: "", splitMode: true });

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const { render: renderMarkdown } = useMarkdown();
const previewOpen = ref(false);
const editorRef = ref<HTMLTextAreaElement | null>(null);

const renderedPreview = computed(() => {
  if (!props.modelValue) return "<p style='color:#999'>Nothing to preview</p>";
  return renderMarkdown(props.modelValue);
});

function onInput(e: Event) {
  emit("update:modelValue", (e.target as HTMLTextAreaElement).value);
}
</script>

<style scoped>
.md-preview-wrap {
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
}
.md-preview-wrap__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  background: var(--el-fill-color-lighter);
}
.md-preview-wrap__body {
  display: flex;
}
.md-preview-wrap__body--split {
  gap: 0;
}
.md-preview-wrap__editor {
  flex: 1;
  min-height: 120px;
  border: none;
  outline: none;
  padding: 10px 12px;
  font-size: 13px;
  font-family: monospace;
  resize: vertical;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
}
.md-preview-wrap__editor--hidden {
  display: none;
}
.md-preview-wrap__preview {
  flex: 1;
  padding: 10px 12px;
  min-height: 120px;
  overflow-y: auto;
  background: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
}
</style>