<script setup lang="ts">
/**
 * YiPet Popup — RolePicker
 * Role card grid. Each card shows the role image + name.
 */
import { ROLE_NAMES, roleImageUrl } from '@/popup/data';

defineProps<{
  value: string;
  disabled?: boolean;
}>();

defineEmits<{
  change: [role: string];
}>();
</script>

<template>
  <div class="role-picker" role="radiogroup" aria-label="Role">
    <button
      v-for="role in ROLE_NAMES"
      :key="role"
      type="button"
      class="role-card"
      :class="{ 'is-selected': role === value }"
      :disabled="disabled"
      :aria-pressed="role === value"
      @click="$emit('change', role)"
    >
      <img class="role-card-img" :src="roleImageUrl(role)" :alt="role" />
      <span class="role-card-name">{{ role }}</span>
    </button>
  </div>
</template>

<style scoped>
.role-picker {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.role-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--border-secondary, rgba(167, 139, 250, 0.3));
  background: var(--bg-tertiary, #312d55);
  cursor: pointer;
  color: var(--text-primary, #f5f3ff);
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
}

.role-card:hover:not(:disabled) {
  border-color: var(--border-focus, #a78bfa);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.role-card.is-selected {
  border-color: var(--border-focus, #a78bfa);
  background: var(--primary-alpha, rgba(102, 126, 234, 0.12));
  box-shadow: 0 0 0 1px var(--border-focus, #a78bfa), 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.role-card:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.role-card-img {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: contain;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.role-card-name {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
}
</style>