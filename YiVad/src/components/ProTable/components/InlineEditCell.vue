<template>
  <div class="inline-edit-cell" @dblclick.stop="$emit('startEdit')">
    <template v-if="editing">
      <component
        :is="editorComponent"
        v-model="editValue"
        v-bind="editorProps"
        size="small"
        @keydown.enter="$emit('commit')"
        @keydown.esc="$emit('cancel')"
        @keydown.tab.prevent="$emit('moveNext')"
      />
    </template>
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, h, resolveComponent } from "vue";
import type { EditorType } from "@/hooks/useInlineEdit";

const props = defineProps<{
  editing: boolean;
  modelValue: any;
  editorType: EditorType;
  editorOptions?: { label: string; value: any }[];
}>();

const emit = defineEmits<{
  startEdit: [];
  commit: [];
  cancel: [];
  moveNext: [];
  "update:modelValue": [value: any];
}>();

const editValue = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const editorMap: Record<EditorType, string> = {
  text: "el-input",
  textarea: "el-input",
  number: "el-input-number",
  select: "el-select",
  date: "el-date-picker",
  datetime: "el-date-picker",
  tag: "el-select",
  user: "el-select",
  boolean: "el-switch",
  color: "el-color-picker",
};

const editorComponent = computed(() => editorMap[props.editorType] ?? "el-input");

const editorProps = computed(() => {
  const t = props.editorType;
  if (t === "textarea") return { type: "textarea", rows: 2 };
  if (t === "number") return { controlsPosition: "right" };
  if (t === "date") return { type: "date", valueFormat: "YYYY-MM-DD" };
  if (t === "datetime") return { type: "datetime", valueFormat: "YYYY-MM-DDTHH:mm:ss" };
  return {};
});
</script>

<style scoped lang="scss">
.inline-edit-cell {
  min-height: 24px;
  cursor: default;
}
</style>