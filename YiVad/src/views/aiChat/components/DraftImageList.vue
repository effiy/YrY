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
  padding: 4px 0;
}
.di-item {
  position: relative;
  width: 56px;
  height: 56px;
  overflow: hidden;
  cursor: zoom-in;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}
.di-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.di-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px !important;
  height: 18px !important;
  min-height: 18px !important;
  padding: 0 !important;
}
.di-clear {
  margin-left: 4px;
}
</style>
