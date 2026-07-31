<script setup lang="ts" name="aiChatTagManagerDialog">
import { computed, ref, nextTick } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";

const store = useAiChatStore();

const visible = computed(() => store.tagManagerVisible);
const tags = computed<string[]>(() => store.activeConversation?.tags ?? []);
const newTag = ref("");
const inputRef = ref<{ focus: () => void } | null>(null);

function onClose() {
  store.closeTagManager();
  newTag.value = "";
}

async function addTag() {
  const name = newTag.value.trim();
  if (!name) return;
  if (tags.value.includes(name)) {
    newTag.value = "";
    return;
  }
  await store.addTag(name);
  newTag.value = "";
  await nextTick();
  inputRef.value?.focus();
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="Manage tags"
    width="480px"
    top="10vh"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    @update:model-value="v => !v && onClose()"
  >
    <div class="tm-head">
      <span class="tm-count">{{ tags.length }} tags</span>
      <span class="tm-hint">Enter to add · Tags help filter conversations in the list</span>
    </div>
    <div class="tm-tags">
      <el-tag v-for="t in tags" :key="t" closable :disable-transitions="false" @close="store.removeTag(t)">
        {{ t }}
      </el-tag>
      <span v-if="!tags.length" class="tm-empty">No tags yet — add one in the input below</span>
    </div>
    <div class="tm-input">
      <el-input
        ref="inputRef"
        v-model="newTag"
        placeholder="Type a new tag and press Enter"
        maxlength="40"
        clearable
        @keyup.enter="addTag"
      />
      <el-button type="primary" :disabled="!newTag.trim()" @click="addTag">Add</el-button>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.tm-head {
  display: flex;
  gap: 8px;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}
.tm-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.tm-hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.tm-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 40px;
  max-height: 260px;
  padding: 6px;
  margin-bottom: 12px;
  overflow-y: auto;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}
.tm-empty {
  padding: 6px 2px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.tm-input {
  display: flex;
  gap: 8px;
}
</style>
