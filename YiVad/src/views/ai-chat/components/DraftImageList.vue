<script setup lang="ts" name="aiChatDraftImageList">
import { Close, DeleteFilled } from "@element-plus/icons-vue";

defineProps<{
  images: string[];
}>();

const emit = defineEmits<{
  (e: "remove", index: number): void;
  (e: "clear"): void;
  (e: "preview", src: string): void;
}>();
</script>

<template>
  <div v-if="images.length" class="di-list">
    <div v-for="(src, idx) in images" :key="`${idx}-${src.slice(0, 24)}`" class="di-item" @click="emit('preview', src)">
      <img :src="src" class="di-img" :alt="`Pending image ${idx + 1}`" />
      <el-button class="di-remove" size="small" circle :icon="Close" @click.stop="emit('remove', idx)" />
    </div>
    <el-button class="di-clear" size="small" text :icon="DeleteFilled" @click="emit('clear')">
      Clear images ({{ images.length }})
    </el-button>
  </div>
</template>

<style scoped lang="scss">
.di-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 4px 16px 0;
}
.di-item {
  position: relative;
  width: 60px;
  height: 60px;
  overflow: hidden;
  cursor: zoom-in;
  border: 2px solid var(--el-border-color-light);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--el-color-primary-light-5);
    transform: scale(1.05);
    box-shadow: var(--shadow-sm);
  }
}
.di-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.di-remove {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 20px !important;
  height: 20px !important;
  min-height: 20px !important;
  padding: 0 !important;
  background: var(--el-bg-color) !important;
  box-shadow: 0 1px 3px rgb(0 0 0 / 15%);
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--transition-fast);
}
.di-item:hover .di-remove {
  opacity: 1;
  transform: scale(1);
}
.di-clear {
  margin-left: 4px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  transition: color var(--transition-fast);
  &:hover {
    color: var(--el-color-danger);
  }
}
</style>
