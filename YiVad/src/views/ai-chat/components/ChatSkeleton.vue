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
    <div
      v-for="i in 4"
      :key="i"
      class="chat-skeleton__bubble"
      :class="i % 2 === 0 ? 'chat-skeleton__bubble--right' : 'chat-skeleton__bubble--left'"
    >
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
    padding: 14px;
    margin-bottom: 6px;
    background: var(--el-fill-color-lighter);
    border-radius: var(--radius-sm);
  }
}
.chat-skeleton__line {
  height: 14px;
  margin-bottom: 8px;
  background: linear-gradient(90deg, var(--el-fill-color) 25%, var(--el-fill-color-light) 50%, var(--el-fill-color) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s ease-in-out infinite;
  &--title {
    width: 60%;
  }
  &--sub {
    width: 40%;
    height: 10px;
  }
  &--long {
    width: 85%;
  }
  &--mid {
    width: 55%;
  }
  &--short {
    width: 35%;
    height: 10px;
  }
}
.chat-skeleton--messages {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 640px;
  margin: 0 auto;
  padding: 20px 16px;
}
.chat-skeleton__bubble {
  display: flex;
  gap: 10px;
  align-items: flex-end;

  &--left {
    .chat-skeleton__content { align-items: flex-start; }
  }
  &--right {
    flex-direction: row-reverse;
    .chat-skeleton__content { align-items: flex-end; }
  }
}
.chat-skeleton__avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(90deg, var(--el-fill-color) 25%, var(--el-fill-color-light) 50%, var(--el-fill-color) 75%);
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 1.5s ease-in-out infinite;
}
.chat-skeleton__content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 70%;
  padding: 12px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: var(--radius-md);
  .chat-skeleton__bubble--right & {
    border-radius: var(--radius-md) var(--radius-md) var(--radius-xs);
  }
  .chat-skeleton__bubble--left & {
    border-radius: var(--radius-md) var(--radius-md) var(--radius-md) var(--radius-xs);
  }
  .chat-skeleton__line {
    margin-bottom: 0;
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
