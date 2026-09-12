<template>
  <el-dialog v-model="visible" title="Batch Tag" width="480px">
    <TagManager :tags="currentTags" @add="addTag" @remove="removeTag" />
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="handleConfirm">Apply to {{ count }} items</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import TagManager, { type Tag } from "@/components/tag/TagManager.vue";

defineProps<{ count: number; currentTags: Tag[] }>();
const emit = defineEmits<{ confirm: [tags: Tag[]]; addTag: [tag: { name: string; color: string }]; removeTag: [id: string] }>();

const visible = ref(false);
const appliedTags = ref<Tag[]>([]);

const addTag = (tag: { name: string; color: string }) => {
  appliedTags.value.push({ id: `tag-${Date.now()}`, ...tag });
  emit("addTag", tag);
};
const removeTag = (id: string) => {
  appliedTags.value = appliedTags.value.filter((t) => t.id !== id);
  emit("removeTag", id);
};
const open = () => { visible.value = true; };
const close = () => { visible.value = false; };
const handleConfirm = () => { emit("confirm", appliedTags.value); visible.value = false; };
defineExpose({ open, close });
</script>