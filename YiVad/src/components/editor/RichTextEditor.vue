<script setup lang="ts">
/**
 * Rich text editor wrapper — uses the existing WangEditor component or TipTap.
 * Currently delegates to WangEditor (already present in the project).
 */
import WangEditor from "@/components/WangEditor/index.vue";

const props = withDefaults(defineProps<{
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
}>(), {
  placeholder: "请输入内容...",
  minHeight: 300,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

function onInput(value: string) {
  emit("update:modelValue", value);
}
</script>

<template>
  <div class="rich-text-editor">
    <WangEditor
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @update:value="onInput"
    />
  </div>
</template>

<style scoped lang="scss">
.rich-text-editor {
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
}
</style>