<script setup lang="ts">
/**
 * YiPet Chat — DraftImageList (Vue 3 SFC)
 */
defineProps<{
  images: string[];
}>();

defineEmits<{
  remove: [index: number];
  clear: [];
}>();
</script>

<template>
  <div class="draft-images">
    <div v-for="(src, idx) in images" :key="`draft-${idx}`" class="draft-image-wrap">
      <img :src="src" :alt="`Draft ${idx + 1}`" class="draft-image" />
      <button type="button" class="draft-remove" title="Remove" @click="$emit('remove', idx)">✕</button>
    </div>
    <button v-if="images.length > 0" type="button" class="draft-clear" @click="$emit('clear')">Clear all</button>
  </div>
</template>

<style lang="scss" scoped>
.draft-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 0;
}

.draft-image-wrap {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
}

.draft-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.draft-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.draft-clear {
  font-size: 11px;
  padding: 2px 8px;
  border: none;
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border-radius: 4px;
  cursor: pointer;
  align-self: center;
}
</style>