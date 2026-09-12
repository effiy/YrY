<script setup lang="ts">
defineProps<{
  type?: "sidebar" | "messages";
}>();
</script>

<template>
  <div v-if="type === 'sidebar'" class="chat-skeleton chat-skeleton--sidebar">
    <div v-for="i in 6" :key="i" class="chat-skeleton__item">
      <div class="chat-skeleton__line chat-skeleton__line--title" />
      <div class="chat-skeleton__line chat-skeleton__line--sub" />
    </div>
  </div>
  <div v-else class="chat-skeleton chat-skeleton--messages">
    <div v-for="i in 4" :key="i" class="chat-skeleton__bubble" :class="i % 2 === 0 ? 'chat-skeleton__bubble--right' : 'chat-skeleton__bubble--left'">
      <div class="chat-skeleton__avatar" />
      <div class="chat-skeleton__content">
        <div class="chat-skeleton__line chat-skeleton__line--long" />
        <div class="chat-skeleton__line chat-skeleton__line--short" />
        <div v-if="i % 2 === 0" class="chat-skeleton__line chat-skeleton__line--mid" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-skeleton {
  padding: 16px;
}
.chat-skeleton--sidebar {
  .chat-skeleton__item {
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 8px;
    background: var(--el-fill-color-light);
  }
}
.chat-skeleton__line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-fill-color) 25%, var(--el-fill-color-light) 50%, var(--el-fill-color) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 8px;
  &--title { width: 60%; }
  &--sub { width: 40%; height: 10px; }
  &--long { width: 80%; }
  &--mid { width: 50%; }
  &--short { width: 30%; height: 10px; }
}
.chat-skeleton__bubble {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  &--right {
    flex-direction: row-reverse;
    .chat-skeleton__content {
      align-items: flex-end;
    }
  }
}
.chat-skeleton__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(90deg, var(--el-fill-color) 25%, var(--el-fill-color-light) 50%, var(--el-fill-color) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.chat-skeleton__content {
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 70%;
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>