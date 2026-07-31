<script setup lang="ts" name="aiChatToolbar">
import { inject } from "vue";
import {
  ChatLineSquare,
  Picture,
  EditPen,
  Document,
  PriceTag,
  CircleClose,
  ChatDotRound,
  ArrowLeft,
  ArrowRight
} from "@element-plus/icons-vue";
import RequestStatusButton from "./RequestStatusButton.vue";
import FaqPopover from "./FaqPopover.vue";

withDefaults(
  defineProps<{
    faqActive?: boolean;
    sending?: boolean;
    streamingType?: "" | "send" | "regenerate" | "resend";
    canEditSession?: boolean;
    contextEnabled?: boolean;
    ragEnabled?: boolean;
    canClear?: boolean;
    hasActiveSession?: boolean;
  }>(),
  {
    faqActive: false,
    sending: false,
    streamingType: "",
    canEditSession: false,
    contextEnabled: true,
    ragEnabled: false,
    canClear: false,
    hasActiveSession: false
  }
);

const emit = defineEmits<{
  (e: "toggle-faq"): void;
  (e: "pick-image"): void;
  (e: "edit-session"): void;
  (e: "edit-context"): void;
  (e: "manage-tags"): void;
  (e: "open-wechat"): void;
  (e: "clear-input"): void;
  (e: "toggle-context"): void;
  (e: "toggle-rag"): void;
  (e: "stop"): void;
}>();

// Provided by AiChatBox when `collapsible` is set — lets the collapse button
// live in the toolbar's ct-left instead of the panel header.
const collapseCtx = inject<{ collapsible: boolean; side: "fill" | "right" | "left"; toggle: () => void } | null>(
  "aiChatBoxCollapse",
  null
);
</script>

<template>
  <div class="ct-toolbar">
    <div class="ct-left">
      <el-tooltip v-if="collapseCtx?.collapsible" content="Collapse chat" placement="bottom">
        <el-button circle size="default" :aria-label="'Collapse chat'" @click="collapseCtx?.toggle()">
          <el-icon><ArrowRight v-if="collapseCtx?.side === 'right'" /><ArrowLeft v-else /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="FAQ" placement="bottom">
        <el-button circle size="default" :icon="ChatLineSquare" :type="faqActive ? 'primary' : ''" @click="emit('toggle-faq')" />
      </el-tooltip>
      <FaqPopover />
      <el-tooltip content="Upload image" placement="bottom">
        <el-button circle size="default" :icon="Picture" :disabled="sending" @click="emit('pick-image')" />
      </el-tooltip>
      <el-tooltip content="Edit session info" placement="bottom">
        <el-button circle size="default" :icon="EditPen" :disabled="!canEditSession || sending" @click="emit('edit-session')" />
      </el-tooltip>
      <el-tooltip content="Page context" placement="bottom">
        <el-button circle size="default" :icon="Document" :disabled="!hasActiveSession" @click="emit('edit-context')" />
      </el-tooltip>
      <el-tooltip content="Manage tags" placement="bottom">
        <el-button circle size="default" :icon="PriceTag" :disabled="!hasActiveSession" @click="emit('manage-tags')" />
      </el-tooltip>
      <el-tooltip content="WeCom bot settings" placement="bottom">
        <el-button circle size="default" :icon="ChatDotRound" @click="emit('open-wechat')" />
      </el-tooltip>
    </div>
    <div class="ct-right">
      <div
        class="ct-context-switch"
        :class="{ 'is-active': contextEnabled }"
        :title="contextEnabled ? 'On: page context attached to requests' : 'Off: page context not attached to requests'"
        @click="emit('toggle-context')"
      >
        <span class="ct-context-label">context</span>
        <el-switch :model-value="contextEnabled" size="small" @click.stop @update:model-value="emit('toggle-context')" />
      </div>
      <div
        class="ct-context-switch"
        :class="{ 'is-active': ragEnabled }"
        :title="ragEnabled ? 'On: answers grounded in YiKnowledge via llama_index' : 'Off: plain Ollama chat'"
        @click="emit('toggle-rag')"
      >
        <span class="ct-context-label">RAG</span>
        <el-switch :model-value="ragEnabled" size="small" @click.stop @update:model-value="emit('toggle-rag')" />
      </div>
      <el-tooltip content="Clear input" placement="bottom">
        <el-button v-show="canClear" circle size="default" :icon="CircleClose" @click="emit('clear-input')" />
      </el-tooltip>
      <RequestStatusButton :sending="sending" :streaming-type="streamingType" @stop="emit('stop')" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ct-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ct-left,
.ct-right {
  display: flex;
  gap: 6px;
  align-items: center;
}
.ct-context-switch {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  user-select: none;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 14px;
  transition: all 0.15s;
}
.ct-context-switch.is-active {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-5);
}
.ct-context-label {
  line-height: 1;
}
</style>
