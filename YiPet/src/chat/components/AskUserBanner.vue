<script setup lang="ts">
/**
 * YiPet Chat — AskUserBanner (Vue 3 SFC)
 * Agent ask_user banner — renders a question with options and free-text input.
 * Mirrors YiVad aiChat's AskUserBanner.
 */
import { ref, watch } from 'vue';
import { QuestionFilled } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';

const store = useChatStore();
const s = store.state;

const askDraft = ref('');
watch(() => s.pendingQuestion?.questionId, () => { askDraft.value = ''; });

function submitAskAnswer(answer?: string) {
  const value = (answer ?? askDraft.value).trim();
  if (!value) return;
  askDraft.value = '';
  store.answerPendingQuestion?.(value);
}
</script>

<template>
  <div v-if="s.pendingQuestion" class="ab-ask-user">
    <el-icon :size="14" class="ab-ask-user-icon"><QuestionFilled /></el-icon>
    <div class="ab-ask-user-body">
      <div class="ab-ask-user-text">{{ s.pendingQuestion.question }}</div>
      <div v-if="s.pendingQuestion.options.length" class="ab-ask-user-options">
        <el-button
          v-for="opt in s.pendingQuestion.options"
          :key="opt"
          size="small"
          class="ab-ask-user-opt"
          @click="submitAskAnswer(opt)"
        >{{ opt }}</el-button>
      </div>
      <div class="ab-ask-user-input-row">
        <el-input
          v-model="askDraft"
          size="small"
          placeholder="Type your answer..."
          @keydown.enter="submitAskAnswer()"
        />
        <el-button size="small" type="primary" @click="submitAskAnswer()">Send</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ab-ask-user {
  display: flex; gap: 8px;
  padding: 10px 12px;
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.08);
  font-size: 12px;
  color: var(--text-primary, #f5f3ff);

  &-icon { flex-shrink: 0; margin-top: 1px; color: #38bdf8; }
  &-body { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  &-text { line-height: 1.5; }
  &-options { display: flex; flex-wrap: wrap; gap: 4px; }
  &-opt { font-size: 11px; }
  &-input-row { display: flex; gap: 6px; align-items: center; }
}
</style>