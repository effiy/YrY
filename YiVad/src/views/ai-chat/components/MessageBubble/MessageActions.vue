<script setup lang="ts" name="aiChatMessageActions">
import { computed } from "vue";
import { ElMessageBox } from "element-plus";
import { CopyDocument, RefreshRight, Delete, Edit, Promotion, Search } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import type { ChatMessage } from "@/api/interface/yiAi";

const props = defineProps<{
  message: ChatMessage;
  index: number;
  isUser: boolean;
  sending: boolean;
  hasWebSearch: boolean;
  webSearchEnabled: boolean;
}>();

const emit = defineEmits<{
  edit: [];
}>();

const store = useAiChatStore();

const showRetryLabel = computed(() => !!(props.message.error || props.message.aborted));

async function onCopy() {
  await store.copyMessage(props.message);
}

function onEdit() {
  emit("edit");
}

async function onRegenerate() {
  if (showRetryLabel.value) await store.retryLastMessage();
  else await store.regenerateMessage(props.index);
}

async function onDelete() {
  try {
    await ElMessageBox.confirm("Delete this message?", "Confirm delete", {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "warning"
    });
  } catch {
    return;
  }
  await store.deleteMessage(props.index);
}

function onResend() {
  store.resendMessage(props.index);
}

function onSearchWeb() {
  store.webSearchEnabled = true;
  store.resendMessage(props.index);
}
</script>

<template>
  <div v-if="!isUser" class="mb-actions">
    <el-tooltip content="Copy" placement="top" :show-after="400">
      <el-button size="small" text :icon="CopyDocument" class="mb-act-btn" @click="onCopy" />
    </el-tooltip>
    <el-tooltip content="Edit" placement="top" :show-after="400">
      <el-button size="small" text :icon="Edit" class="mb-act-btn" :disabled="sending" @click="onEdit" />
    </el-tooltip>
    <el-tooltip :content="showRetryLabel ? 'Retry' : 'Regenerate'" placement="top" :show-after="400">
      <el-button size="small" text :icon="RefreshRight" class="mb-act-btn" :disabled="sending" @click="onRegenerate" />
    </el-tooltip>
    <el-tooltip
      v-if="!hasWebSearch && !message.searchGrounded"
      content="Deepen search — regenerate with web search"
      placement="top"
      :show-after="400"
    >
      <el-button size="small" text :icon="Search" class="mb-act-btn" :disabled="sending" @click="store.deepenSearch()" />
    </el-tooltip>
    <el-tooltip content="Delete" placement="top" :show-after="400">
      <el-button size="small" text :icon="Delete" class="mb-act-btn" :disabled="sending" @click="onDelete" />
    </el-tooltip>
  </div>
  <div v-else class="mb-actions">
    <el-tooltip content="Edit" placement="top" :show-after="400">
      <el-button size="small" text :icon="Edit" class="mb-act-btn" :disabled="sending" @click="onEdit" />
    </el-tooltip>
    <el-tooltip content="Resend" placement="top" :show-after="400">
      <el-button size="small" text :icon="Promotion" class="mb-act-btn" :disabled="sending" @click="onResend" />
    </el-tooltip>
    <el-tooltip v-if="!hasWebSearch" :content="webSearchEnabled ? 'Search: on' : 'Search web'" placement="top" :show-after="400">
      <el-button
        size="small"
        text
        :icon="Search"
        class="mb-act-btn"
        :class="{ 'is-on': webSearchEnabled }"
        :disabled="sending"
        @click="onSearchWeb"
      />
    </el-tooltip>
    <el-tooltip content="Delete" placement="top" :show-after="400">
      <el-button size="small" text :icon="Delete" class="mb-act-btn" :disabled="sending" @click="onDelete" />
    </el-tooltip>
  </div>
</template>

<style scoped lang="scss">
.mb-actions {
  display: flex;
  gap: 0;
  align-items: center;
}
.mb-act-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--el-text-color-placeholder);
  border-radius: var(--radius-xs);
  transition: all var(--transition-fast);

  &:hover:not(:disabled) {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
  &:disabled {
    opacity: 0.35;
  }
  &.is-on {
    color: var(--el-color-primary);
  }
}
</style>
