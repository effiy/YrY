<script setup lang="ts">
/**
 * YiPet Chat — ChatInputActions
 * Send/stop buttons.
 */
import { Promotion, CircleClose } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';

const store = useChatStore();

const props = defineProps<{
  isProcessing: boolean;
  canSend: boolean;
  draftImagesLength: number;
}>();

const emit = defineEmits<{
  send: [];
  stop: [];
  clearImages: [];
}>();
</script>

<template>
  <div class="cia-actions">
    <!-- Stop button (when streaming) -->
    <el-tooltip v-if="isProcessing" content="Stop generating" placement="top">
      <el-button circle size="default" type="danger" class="ci-send-btn" @click="emit('stop')">
        <span class="ci-stop-icon" />
      </el-button>
    </el-tooltip>

    <!-- Send button -->
    <el-tooltip v-else-if="canSend" content="Send message (Enter)" placement="top">
      <el-button circle size="default" type="primary" class="ci-send-btn" :icon="Promotion" @click="emit('send')" />
    </el-tooltip>

    <!-- Clear (when only images, no text) -->
    <el-tooltip v-else-if="draftImagesLength > 0" content="Clear images" placement="top">
      <el-button circle size="default" class="ci-send-btn" :icon="CircleClose" @click="emit('clearImages')" />
    </el-tooltip>
  </div>
</template>