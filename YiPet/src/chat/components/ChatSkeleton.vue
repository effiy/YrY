<script setup lang="ts">
defineProps<{
  type?: "sidebar" | "messages";
}>();
</script>

<template>
  <div v-if="type === 'sidebar'" class="cs-skeleton cs-skeleton--sidebar">
    <div v-for="i in 6" :key="i" class="cs-skeleton__item">
      <div class="cs-skeleton__line cs-skeleton__line--title" />
      <div class="cs-skeleton__line cs-skeleton__line--sub" />
    </div>
  </div>
  <div v-else class="cs-skeleton cs-skeleton--messages">
    <div
      v-for="i in 4"
      :key="i"
      class="cs-skeleton__bubble"
      :class="i % 2 === 0 ? 'cs-skeleton__bubble--right' : 'cs-skeleton__bubble--left'"
    >
      <div class="cs-skeleton__avatar" />
      <div class="cs-skeleton__content">
        <div class="cs-skeleton__line cs-skeleton__line--long" />
        <div class="cs-skeleton__line cs-skeleton__line--short" />
        <div v-if="i % 2 === 0" class="cs-skeleton__line cs-skeleton__line--mid" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cs-skeleton {
  padding: 16px;
}

.cs-skeleton--sidebar {
  .cs-skeleton__item {
    padding: 14px;
    margin-bottom: 6px;
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.06);
    border-radius: 8px;
  }
}

.cs-skeleton--messages {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 640px;
  margin: 0 auto;
  padding: 20px 16px;
}

.cs-skeleton__line {
  height: 14px;
  margin-bottom: 8px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  animation: cs-shimmer 1.5s ease-in-out infinite;

  &--title { width: 60%; }
  &--sub { width: 40%; height: 10px; }
  &--long { width: 85%; }
  &--mid { width: 55%; }
  &--short { width: 35%; height: 10px; }
}

.cs-skeleton__bubble {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  margin-bottom: 0;

  &--left {
    .cs-skeleton__content { align-items: flex-start; }
  }
  &--right {
    flex-direction: row-reverse;
    .cs-skeleton__content { align-items: flex-end; }
  }
}

.cs-skeleton__avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
  border-radius: 8px;
  animation: cs-shimmer 1.5s ease-in-out infinite;
}

.cs-skeleton__content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 70%;
  padding: 12px 14px;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.06);
  border-radius: 12px;
  .cs-skeleton__bubble--right & {
    border-radius: 12px 12px 4px 12px;
  }
  .cs-skeleton__bubble--left & {
    border-radius: 12px 12px 12px 4px;
  }
  .cs-skeleton__line {
    margin-bottom: 0;
  }
}

@keyframes cs-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>