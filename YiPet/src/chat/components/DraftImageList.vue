<script setup lang="ts">
/**
 * YiPet Chat — DraftImageList
 * Mirrors YiVad aiChat's DraftImageList: hover effects, preview, polished actions.
 */
import { Close, DeleteFilled } from '@element-plus/icons-vue';

defineProps<{
  images: string[];
}>();

const emit = defineEmits<{
  remove: [index: number];
  clear: [];
  preview: [src: string];
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

<style lang="scss" scoped>
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
  border: 2px solid rgba(var(--primary-rgb, 99, 102, 241), 0.18);
  border-radius: 6px;
  transition: all 0.15s;

  &:hover {
    border-color: var(--primary-light, var(--el-color-primary));
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
  background: var(--bg-elevated, #1e293b) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.15s;
}

.di-item:hover .di-remove {
  opacity: 1;
  transform: scale(1);
}

.di-clear {
  margin-left: 4px;
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);
  transition: color 0.15s;

  &:hover {
    color: var(--el-color-danger);
  }
}
</style>