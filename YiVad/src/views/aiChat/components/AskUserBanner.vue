<script setup lang="ts" name="aiChatAskUserBanner">
import { ref, watch } from "vue";

const props = defineProps<{ questionId: string; question: string; options: string[] }>();
const emit = defineEmits<{ (e: "answer", answer: string): void }>();

const draft = ref("");

// Reset the draft when a new question arrives.
watch(() => props.questionId, () => { draft.value = ""; });

function submit(answer?: string) {
  const value = (answer ?? draft.value).trim();
  if (!value) return;
  draft.value = "";
  emit("answer", value);
}
</script>

<template>
  <div class="au-banner">
    <span class="au-icon">❓</span>
    <div class="au-body">
      <div class="au-q">{{ question }}</div>
      <div v-if="options.length" class="au-options">
        <button v-for="o in options" :key="o" class="au-opt" @click="submit(o)">{{ o }}</button>
      </div>
      <div class="au-input-row">
        <input
          v-model="draft"
          class="au-input"
          placeholder="输入你的回答…"
          @keydown.enter="submit()"
        />
        <button class="au-send" @click="submit()">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.au-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-size: 13px;
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-5);
  border-radius: 6px;
}

.au-icon {
  font-size: 16px;
  line-height: 1.6;
}

.au-body {
  flex: 1;
  min-width: 0;
}

.au-q {
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
}

.au-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.au-opt {
  padding: 2px 10px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: var(--el-color-primary-light-7);
  }
}

.au-input-row {
  display: flex;
  gap: 6px;
}

.au-input {
  flex: 1;
  padding: 3px 8px;
  font-size: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  outline: none;

  &:focus {
    border-color: var(--el-color-primary);
  }
}

.au-send {
  padding: 3px 12px;
  font-size: 12px;
  color: #fff;
  background: var(--el-color-primary);
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
}
</style>
