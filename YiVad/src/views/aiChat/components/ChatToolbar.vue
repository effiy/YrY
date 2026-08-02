<script setup lang="ts" name="aiChatToolbar">
import { inject } from "vue";
import {
  ChatLineSquare, Picture, PriceTag, ChatDotRound, Search,
  ArrowLeft, ArrowRight
} from "@element-plus/icons-vue";
import RequestStatusButton from "./RequestStatusButton.vue";
import FaqPopover from "./FaqPopover.vue";

withDefaults(
  defineProps<{
    faqActive?: boolean;
    sending?: boolean;
    streamingType?: "" | "send" | "regenerate" | "resend";
    ragToggle?: boolean;
    ragAvailable?: boolean;
    webSearchToggle?: boolean;
  }>(),
  { faqActive: false, sending: false, streamingType: "", ragToggle: false, ragAvailable: false, webSearchToggle: false }
);

const emit = defineEmits<{
  (e: "toggle-faq"): void;
  (e: "pick-image"): void;
  (e: "manage-tags"): void;
  (e: "open-wechat"): void;
  (e: "toggle-rag"): void;
  (e: "toggle-web-search"): void;
  (e: "stop"): void;
}>();

const collapseCtx = inject<{ collapsible: boolean; side: "fill" | "right" | "left"; toggle: () => void } | null>(
  "aiChatBoxCollapse", null
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
      <el-tooltip content="Manage tags" placement="bottom">
        <el-button circle size="default" :icon="PriceTag" @click="emit('manage-tags')" />
      </el-tooltip>
      <el-tooltip content="WeCom bot settings" placement="bottom">
        <el-button circle size="default" :icon="ChatDotRound" @click="emit('open-wechat')" />
      </el-tooltip>
    </div>
    <div class="ct-right">
      <div
        class="ct-pill" :class="{ on: webSearchToggle }"
        :title="webSearchToggle ? 'Web search on — answers include internet results' : 'Web search off'"
        @click="emit('toggle-web-search')"
      >
        <el-icon :size="14"><Search /></el-icon>
        <span class="ct-pill-label">Web</span>
        <el-switch :model-value="webSearchToggle" size="small" @click.stop @update:model-value="emit('toggle-web-search')" />
      </div>
      <div
        class="ct-pill" :class="{ on: ragToggle }"
        :title="ragToggle ? 'RAG on — answers grounded in context files' : 'RAG off — direct chat'"
        @click="emit('toggle-rag')"
      >
        <span class="ct-pill-label">RAG</span>
        <el-switch :model-value="ragToggle" :disabled="!ragAvailable" size="small" @click.stop @update:model-value="emit('toggle-rag')" />
      </div>
      <RequestStatusButton :sending="sending" :streaming-type="streamingType" @stop="emit('stop')" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ct-toolbar { display: flex; gap: 8px; align-items: center; justify-content: space-between; padding: 6px 12px; background: var(--el-bg-color); border-bottom: 1px solid var(--el-border-color-lighter); }
.ct-left, .ct-right { display: flex; gap: 6px; align-items: center; }
.ct-pill { display: inline-flex; gap: 6px; align-items: center; height: 28px; padding: 0 10px; font-size: 12px; color: var(--el-text-color-placeholder); cursor: pointer; user-select: none; background: var(--el-fill-color-blank); border: 1px solid var(--el-border-color-light); border-radius: 14px; transition: all .15s; }
.ct-pill.on { color: var(--el-color-primary); background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-5); }
.ct-pill-label { line-height: 1; }
</style>
