<script setup lang="ts">
/**
 * MessageEditDialog — inline edit dialog for chat messages.
 * Extracted from MessageBubble.vue.
 */
const model = defineModel<string>({ required: true });

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  save: [];
}>();
</script>

<template>
  <dialog v-if="open" class="mb-edit-dialog" open @click.self="emit('close')">
    <div class="mb-edit-dialog-content" @click.stop>
      <h3>Edit message</h3>
      <textarea
        v-model="model"
        rows="5"
        class="mb-edit-textarea"
        aria-label="Edit message content"
      />
      <div class="mb-edit-actions">
        <button type="button" class="mb-edit-btn mb-edit-btn--cancel" @click="emit('close')">Cancel</button>
        <button type="button" class="mb-edit-btn mb-edit-btn--save" @click="emit('save')">Save</button>
      </div>
    </div>
  </dialog>
</template>