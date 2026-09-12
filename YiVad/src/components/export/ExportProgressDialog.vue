<template>
  <el-dialog v-model="visible" title="Exporting..." :close-on-click-modal="false" :close-on-press-escape="false" width="400px">
    <div class="export-progress">
      <el-progress :percentage="percent" :status="status === 'error' ? 'exception' : undefined" />
      <p class="export-progress__text">{{ statusText }}</p>
    </div>
    <template #footer>
      <el-button v-if="status === 'completed' || status === 'error'" @click="visible = false">Close</el-button>
      <el-button v-if="status === 'exporting'" @click="$emit('cancel')">Cancel</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{ percent: number; status: "idle" | "exporting" | "completed" | "error" }>();
defineEmits<{ cancel: [] }>();

const visible = ref(false);

const statusText = computed(() => {
  if (props.status === "exporting") return `Generating file... ${props.percent}%`;
  if (props.status === "completed") return "Export completed!";
  if (props.status === "error") return "Export failed. Please try again.";
  return "";
});

const open = () => { visible.value = true; };
const close = () => { visible.value = false; };

defineExpose({ open, close });
</script>

<style scoped lang="scss">
.export-progress { padding: 16px 0; &__text { margin-top: 12px; font-size: 13px; color: var(--el-text-color-secondary); text-align: center; } }
</style>