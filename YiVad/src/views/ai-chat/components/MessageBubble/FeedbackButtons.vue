<script setup lang="ts" name="aiChatFeedbackButtons">
import { ref } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { submitFeedback } from "@/api/modules/feedbackService";
import { ElMessage } from "element-plus";
import type { ChatMessage } from "@/api/interface/yiAi/chat";

const props = defineProps<{
  message: ChatMessage;
}>();

const store = useAiChatStore();

const rating = ref<"up" | "down" | null>(null);
const submitting = ref(false);
const submitted = ref(false);
const detailVisible = ref(false);
const accuracy = ref(3);
const helpfulness = ref(3);
const safety = ref(3);
const comment = ref("");

async function onRate(up: boolean) {
  if (submitting.value || submitted.value) return;
  const newRating = up ? "up" : "down";
  if (rating.value === newRating) {
    rating.value = null;
    detailVisible.value = false;
    return;
  }
  rating.value = newRating;
  if (!up) {
    detailVisible.value = true;
    return;
  }
  await doSubmit();
}

async function doSubmit() {
  if (!rating.value || !store.activeConversation) return;
  submitting.value = true;
  try {
    await submitFeedback({
      sessionKey: store.activeConversation.key,
      messageTimestamp: props.message.timestamp,
      rating: rating.value,
      ...(rating.value === "down"
        ? { accuracy: accuracy.value, helpfulness: helpfulness.value, safety: safety.value, comment: comment.value }
        : {})
    });
    submitted.value = true;
    ElMessage.success(rating.value === "up" ? "Thanks for your feedback!" : "Feedback submitted — we'll improve.");
  } catch {
    ElMessage.warning("Failed to submit feedback — try again later.");
    rating.value = null;
  } finally {
    submitting.value = false;
    detailVisible.value = false;
  }
}
</script>

<template>
  <div v-if="props.message.type === 'pet' && !props.message.error && props.message.message" class="fb-btns">
    <template v-if="submitted">
      <span class="fb-thanks">{{ rating === "up" ? "👍 Thanks!" : "👎 Received" }}</span>
    </template>
    <template v-else>
      <el-tooltip content="Helpful" placement="top" :show-after="400">
        <el-button
          size="small"
          text
          class="fb-btn"
          :class="{ 'is-active': rating === 'up' }"
          @click="onRate(true)"
          >👍</el-button
        >
      </el-tooltip>
      <el-tooltip content="Not helpful" placement="top" :show-after="400">
        <el-button
          size="small"
          text
          class="fb-btn"
          :class="{ 'is-active': rating === 'down' }"
          @click="onRate(false)"
          >👎</el-button
        >
      </el-tooltip>
    </template>

    <!-- Detail feedback form (after 👎) -->
    <el-dialog
      v-model="detailVisible"
      title="What went wrong?"
      width="360px"
      :close-on-click-modal="false"
      append-to-body
    >
      <div class="fb-form">
        <div class="fb-field">
          <label>Accuracy</label>
          <el-rate v-model="accuracy" :max="5" :low-threshold="2" :high-threshold="4" />
        </div>
        <div class="fb-field">
          <label>Helpfulness</label>
          <el-rate v-model="helpfulness" :max="5" :low-threshold="2" :high-threshold="4" />
        </div>
        <div class="fb-field">
          <label>Safety</label>
          <el-rate v-model="safety" :max="5" :low-threshold="2" :high-threshold="4" />
        </div>
        <div class="fb-field">
          <label>Comment (optional)</label>
          <el-input
            v-model="comment"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="What was incorrect or unhelpful?"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="doSubmit">Submit Feedback</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.fb-btns {
  display: flex;
  gap: 0;
  align-items: center;
}
.fb-thanks {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
  animation: slide-up 0.3s ease-out;
}
.fb-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 12px;
  border-radius: var(--radius-xs);
  opacity: 0.5;
  transition: all var(--transition-fast);
  filter: grayscale(0.3);

  &:hover:not(:disabled) {
    opacity: 1;
    filter: grayscale(0);
    background: var(--el-fill-color-lighter);
  }
  &.is-active {
    opacity: 1;
    filter: grayscale(0);
  }
}
.fb-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.fb-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }
}
</style>