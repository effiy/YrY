<template>
  <div class="tag-manager">
    <div class="tag-manager__header">
      <el-input v-model="newTagName" size="small" placeholder="New tag name..." @keydown.enter="addTag" />
      <el-color-picker v-model="newTagColor" size="small" />
      <el-button size="small" type="primary" :disabled="!newTagName.trim()" @click="addTag">Add</el-button>
    </div>
    <div class="tag-manager__list">
      <el-tag
        v-for="tag in tags"
        :key="tag.id"
        :color="tag.color"
        :closable="!readonly"
        size="default"
        class="tag-manager__tag"
        @close="$emit('remove', tag.id)"
      >
        {{ tag.name }}
        <span v-if="tag.count !== undefined" class="tag-manager__count">({{ tag.count }})</span>
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

export interface Tag {
  id: string;
  name: string;
  color?: string;
  count?: number;
}

defineProps<{ tags: Tag[]; readonly?: boolean }>();
const emit = defineEmits<{ add: [tag: { name: string; color: string }]; remove: [id: string] }>();

const newTagName = ref("");
const newTagColor = ref("#409EFF");

const addTag = () => {
  if (!newTagName.value.trim()) return;
  emit("add", { name: newTagName.value.trim(), color: newTagColor.value });
  newTagName.value = "";
};
</script>

<style scoped lang="scss">
.tag-manager {
  &__header { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
  &__list { display: flex; flex-wrap: wrap; gap: 8px; }
  &__tag { cursor: pointer; }
  &__count { font-size: 10px; opacity: 0.8; }
}
</style>