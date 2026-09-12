<script setup lang="ts">
/**
 * MessageMetaRow — message actions, timestamp, and token chip with trend.
 * Extracted from MessageBubble.vue.
 */
import { CopyDocument, Refresh, Delete, Edit, Upload, Link, FolderOpened, Star, StarFilled, Search } from '@element-plus/icons-vue';

defineProps<{
  isUser: boolean;
  isProcessing: boolean;
  hasContent: boolean;
  showRetryLabel: boolean;
  copyState: string;
  rating: string | null;
  timestamp: number;
  formattedTime: string;
  charCount: number;
  wordCount: number;
  lineCount: number;
  tokenEstimate: number;
  prevRoleTokenEstimate: number | null;
  tokenTrend: { arrow: string; delta: number; sign: string; cls: string } | null;
  prevRoleMessage: { snippet: string } | null;
}>();

const emit = defineEmits<{
  copy: [];
  edit: [];
  regenerate: [];
  delete: [];
  like: [];
  dislike: [];
  saveToKnowledge: [];
  openInYiVad: [];
  resend: [];
  searchWeb: [];
}>();
</script>

<template>
  <div class="mb-meta">
    <div class="mb-actions">
      <template v-if="!isUser">
        <el-button size="small" text :icon="CopyDocument" @click="emit('copy')">{{ copyState === 'copied' ? 'Copied' : 'Copy' }}</el-button>
        <el-button size="small" text :icon="Edit" :disabled="isProcessing" @click="emit('edit')">Edit</el-button>
        <el-button size="small" text :icon="Refresh" :disabled="isProcessing" @click="emit('regenerate')">{{ showRetryLabel ? 'Retry' : 'Regenerate' }}</el-button>
        <el-button size="small" text :icon="Delete" :disabled="isProcessing" @click="emit('delete')">Delete</el-button>
        <el-button size="small" text :icon="rating === 'like' ? StarFilled : Star" :type="rating === 'like' ? 'warning' : 'default'" title="Like" @click="emit('like')" />
        <el-button size="small" text :icon="Star" title="Dislike" style="transform: scaleY(-1)" @click="emit('dislike')" />
        <el-button size="small" text :icon="FolderOpened" title="Save to YiKnowledge" :disabled="isProcessing || !hasContent" @click="emit('saveToKnowledge')" />
        <el-button size="small" text :icon="Link" title="Open in YiVad aiChat" :disabled="isProcessing || !hasContent" @click="emit('openInYiVad')" />
      </template>
      <template v-else>
        <el-button size="small" text :icon="Edit" :disabled="isProcessing" @click="emit('edit')">Edit</el-button>
        <el-button size="small" text :icon="Upload" title="Resend" :disabled="isProcessing" @click="emit('resend')">Resend</el-button>
        <el-button size="small" text :icon="Search" :disabled="isProcessing" :type="false ? 'primary' : ''" @click="emit('searchWeb')">Search Web</el-button>
        <el-button size="small" text :icon="Delete" :disabled="isProcessing" @click="emit('delete')">Delete</el-button>
      </template>
    </div>
    <time class="mb-time" :datetime="new Date(timestamp).toISOString()">
      {{ formattedTime }}
    </time>
    <el-tooltip
      :content="`${charCount} chars · ${wordCount} words · ${lineCount} line(s) · ~${tokenEstimate} tokens (chars/4 estimate)`"
      placement="top"
      :show-after="300"
    >
      <span class="mb-token-chip" :class="isUser ? 'mb-token-chip--in' : 'mb-token-chip--out'">
        ~{{ tokenEstimate }} tok
        <el-tooltip v-if="tokenTrend" placement="top" :show-after="200">
          <template #content>
            <div class="mb-trend-tip">
              <div><b>Previous {{ isUser ? 'user' : 'pet' }} message:</b> ~{{ prevRoleTokenEstimate }} tok (Δ {{ tokenTrend.sign }}{{ tokenTrend.delta }})</div>
              <div v-if="prevRoleMessage" class="mb-trend-tip-snip">"{{ prevRoleMessage.snippet }}"</div>
            </div>
          </template>
          <span class="mb-token-trend" :class="tokenTrend.cls">{{ tokenTrend.arrow }}</span>
        </el-tooltip>
      </span>
    </el-tooltip>
  </div>
</template>