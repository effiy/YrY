<template>
  <el-dialog v-model="visible" title="Batch Mail" width="600px">
    <div class="batch-mail">
      <div class="batch-mail__field">
        <label>Subject</label>
        <el-input v-model="subject" placeholder="Email subject (use {{field}} for merge fields)" />
      </div>
      <div class="batch-mail__field">
        <label>Body</label>
        <el-input v-model="body" type="textarea" :rows="6" placeholder="Email body with {{name}}, {{status}} merge fields" />
      </div>
      <div class="batch-mail__preview">
        <label>Preview (recipient #1)</label>
        <div class="batch-mail__preview-content">{{ previewText }}</div>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="handleConfirm">Send to {{ count }} recipients</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{ count: number; sampleData?: Record<string, any> }>();
const emit = defineEmits<{ confirm: [payload: { subject: string; body: string }] }>();

const visible = ref(false);
const subject = ref("");
const body = ref("");

const previewText = computed(() => {
  let s = subject.value;
  let b = body.value;
  if (props.sampleData) {
    for (const [k, v] of Object.entries(props.sampleData)) {
      const val = String(v ?? "");
      s = s.replaceAll(`{{${k}}}`, val);
      b = b.replaceAll(`{{${k}}}`, val);
    }
  }
  return `${s || "(no subject)"}\n\n${b || "(no body)"}`;
});

const open = () => { visible.value = true; };
const close = () => { visible.value = false; };
const handleConfirm = () => { emit("confirm", { subject: subject.value, body: body.value }); visible.value = false; };
defineExpose({ open, close });
</script>

<style scoped lang="scss">
.batch-mail {
  &__field { margin-bottom: 16px; label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; } }
  &__preview { label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; } &-content { padding: 12px; background: var(--el-fill-color-lighter); border-radius: 6px; font-size: 12px; white-space: pre-wrap; max-height: 150px; overflow-y: auto; } }
}
</style>