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

const copyLabel = computed(() => store.copyFeedback[String(props.message.timestamp)] || "Copy");
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
    <el-button size="small" text :icon="CopyDocument" @click="onCopy">{{ copyLabel }}</el-button>
    <el-button size="small" text :icon="Edit" :disabled="sending" @click="onEdit">Edit</el-button>
    <el-button size="small" text :icon="RefreshRight" :disabled="sending" @click="onRegenerate">{{
      showRetryLabel ? "Retry" : "Regenerate"
    }}</el-button>
    <el-button size="small" text :icon="Delete" :disabled="sending" @click="onDelete">Delete</el-button>
  </div>
  <div v-else class="mb-actions">
    <el-button size="small" text :icon="Edit" :disabled="sending" @click="onEdit">Edit</el-button>
    <el-button size="small" text :icon="Promotion" :disabled="sending" @click="onResend"
      >Resend</el-button
    >
    <el-button
      v-if="!hasWebSearch"
      size="small" text :icon="Search" :disabled="sending"
      :type="webSearchEnabled ? 'primary' : ''"
      @click="onSearchWeb"
    >Search Web</el-button>
    <el-button size="small" text :icon="Delete" :disabled="sending" @click="onDelete">Delete</el-button>
  </div>
</template>

<style scoped lang="scss">
.mb-actions {
  display: flex;
  gap: 2px;
}
</style>