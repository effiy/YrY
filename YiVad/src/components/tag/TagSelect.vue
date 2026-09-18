<template>
  <el-select
    :model-value="modelValue"
    :multiple="multiple"
    :placeholder="placeholder"
    style="width: 100%"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-option-group v-for="group in tagGroups" :key="group.label" :label="group.label">
      <el-option v-for="tag in group.options" :key="tag.key" :label="tag.name" :value="tag.key">
        <span class="tag-select__option">
          <span class="tag-select__dot" :style="{ background: tag.color }" />
          {{ tag.name }}
        </span>
      </el-option>
    </el-option-group>
  </el-select>
</template>

<script setup lang="ts" name="TagSelect">
import { computed } from "vue";
import type { Tag, TagTreeNode } from "@/types/tag";

const props = withDefaults(
  defineProps<{
    modelValue: string | string[];
    tags: Tag[];
    multiple?: boolean;
    placeholder?: string;
  }>(),
  {
    multiple: false,
    placeholder: "选择标签"
  }
);

defineEmits<{ "update:modelValue": [value: string | string[]] }>();

const tagTree = computed<TagTreeNode[]>(() => {
  const roots = props.tags.filter(t => !t.parent_id);
  return roots.map(root => ({
    ...root,
    children: props.tags.filter(t => t.parent_id === root.key) as TagTreeNode[]
  }));
});

const tagGroups = computed(() =>
  tagTree.value.map(root => ({
    label: root.name,
    options: [root, ...root.children]
  }))
);
</script>

<style scoped>
.tag-select__option {
  display: flex;
  gap: 6px;
  align-items: center;
}
.tag-select__dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>
