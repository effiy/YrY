<script setup lang="ts" name="aiChatToolbar">
import { inject } from "vue";
import {
  ChatLineSquare, Picture, PriceTag, CircleClose, ChatDotRound,
  ArrowLeft, ArrowRight, DataAnalysis
} from "@element-plus/icons-vue";
import RequestStatusButton from "./RequestStatusButton.vue";
import FaqPopover from "./FaqPopover.vue";

withDefaults(
  defineProps<{
    faqActive?: boolean;
    sending?: boolean;
    streamingType?: "" | "send" | "regenerate" | "resend";
    ragActive?: boolean;
    contextFileCount?: number;
    canClear?: boolean;
  }>(),
  {
    faqActive: false, sending: false, streamingType: "",
    ragActive: false, contextFileCount: 0, canClear: false
  }
);

const emit = defineEmits<{
  (e: "toggle-faq"): void;
  (e: "pick-image"): void;
  (e: "manage-tags"): void;
  (e: "open-wechat"): void;
  (e: "clear-input"): void;
  (e: "open-rag-panel"): void;
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
      <el-tooltip :content="ragActive ? `RAG active · ${contextFileCount} context file(s)` : 'RAG panel'" placement="bottom">
        <el-button
          circle size="default"
          :icon="DataAnalysis"
          :type="ragActive ? 'primary' : ''"
          class="ct-rag-btn"
          @click="emit('open-rag-panel')"
        >
          <span v-if="contextFileCount > 0" class="ct-rag-badge">{{ contextFileCount }}</span>
        </el-button>
      </el-tooltip>
      <el-tooltip content="Clear input" placement="bottom">
        <el-button v-show="canClear" circle size="default" :icon="CircleClose" @click="emit('clear-input')" />
      </el-tooltip>
      <RequestStatusButton :sending="sending" :streaming-type="streamingType" @stop="emit('stop')" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ct-toolbar {
  display: flex; gap: 8px; align-items: center; justify-content: space-between;
  padding: 6px 12px; background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ct-left, .ct-right { display: flex; gap: 6px; align-items: center; }
.ct-rag-btn { position: relative; }
.ct-rag-badge {
  position: absolute; top: -4px; right: -4px;
  min-width: 16px; height: 14px; padding: 0 4px;
  font-size: 10px; line-height: 14px; text-align: center;
  color: #fff; background: var(--el-color-success); border-radius: 7px;
}
</style>
