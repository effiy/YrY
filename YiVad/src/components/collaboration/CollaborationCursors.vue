<script setup lang="ts">
/**
 * Displays remote user cursors/active fields in a form.
 */
interface Collaborator {
  id: string;
  name: string;
  color: string;
  activeField?: string;
}

defineProps<{
  collaborators: Collaborator[];
  lockedFields: Record<string, string>;
}>();
</script>

<template>
  <div v-if="collaborators.length > 0" class="collaboration-cursors">
    <div v-for="user in collaborators" :key="user.id" class="collaboration-cursors__user">
      <span class="collaboration-cursors__dot" :style="{ background: user.color }" />
      <span class="collaboration-cursors__name">{{ user.name }}</span>
      <span v-if="user.activeField" class="collaboration-cursors__field"> 正在编辑: {{ user.activeField }} </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.collaboration-cursors {
  padding: 8px 12px;
  margin-bottom: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  &__user {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 2px 0;
    font-size: 13px;
  }
  &__dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  &__name {
    font-weight: 500;
    color: var(--el-text-color-regular);
  }
  &__field {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
