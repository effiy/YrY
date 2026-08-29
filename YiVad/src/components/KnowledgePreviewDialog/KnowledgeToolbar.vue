<script setup lang="ts">
/**
 * KnowledgeToolbar — toolbar for knowledge preview dialog.
 * Extracted from KnowledgePreviewDialog.vue: nav, mode switch, actions.
 */
import {
  ArrowLeft, ChatDotRound, Close, Download, FolderOpened, Reading,
} from '@element-plus/icons-vue';

defineProps<{
  currentPath: string;
  mode: string;
  showChat: boolean;
  loading: boolean;
  hasContent: boolean;
  translating: boolean;
  originalContent: string;
  saving: boolean;
  sourceRoute: any;
  readingItemExists: boolean;
  addingToReadingList: boolean;
  navHistoryLength: number;
}>();

const emit = defineEmits<{
  'update:mode': [value: string];
  goBack: [];
  translateTo: [lang: 'zh' | 'en', bilingual?: boolean];
  resetTranslation: [];
  cancelEdit: [];
  save: [];
  openInSourcePage: [];
  downloadFile: [];
  addToReadingList: [];
  toggleChat: [];
  close: [];
}>();
</script>

<template>
  <div class="kpd-toolbar">
    <div class="kpd-nav">
      <el-button
        v-if="navHistoryLength && mode === 'preview' && !showChat"
        size="small"
        text
        :title="'Back'"
        @click="emit('goBack')"
      >
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <span class="kpd-path" :title="currentPath">{{ currentPath }}</span>
    </div>
    <el-radio-group :model-value="mode" size="small" :disabled="showChat" @update:model-value="emit('update:mode', $event)">
      <el-radio-button value="edit">Edit</el-radio-button>
      <el-radio-button value="split">Split</el-radio-button>
      <el-radio-button value="preview">Preview</el-radio-button>
    </el-radio-group>
    <div class="kpd-actions">
      <template v-if="mode === 'preview' && !loading && hasContent">
        <span v-if="translating" class="kpd-translating">Translating...</span>
        <template v-if="!translating && !originalContent">
          <el-button size="small" text @click="emit('translateTo', 'zh')">译中</el-button>
          <el-button size="small" text @click="emit('translateTo', 'en')">译英</el-button>
          <el-button size="small" text @click="emit('translateTo', 'zh', true)">中英双语</el-button>
        </template>
        <el-button
          v-if="!translating && originalContent"
          size="small"
          text
          @click="emit('resetTranslation')"
        >Show Original</el-button>
      </template>
      <el-button v-if="mode === 'edit' || mode === 'split'" size="small" text @click="emit('cancelEdit')">Cancel</el-button>
      <el-button v-if="mode === 'edit' || mode === 'split'" type="primary" size="small" :loading="saving" @click="emit('save')">Save</el-button>
      <el-button v-if="sourceRoute" size="small" text :icon="FolderOpened" title="Open in source page" @click="emit('openInSourcePage')" />
      <el-button size="small" text :icon="Download" title="Download file" @click="emit('downloadFile')" />
      <el-button
        size="small" text
        :type="readingItemExists ? 'primary' : 'default'"
        :icon="Reading"
        :loading="addingToReadingList"
        :title="readingItemExists ? 'Already in reading list' : 'Add to reading list'"
        @click="emit('addToReadingList')"
      />
      <el-button :type="showChat ? 'primary' : 'default'" :icon="ChatDotRound" size="small" text :title="showChat ? 'Hide chat' : 'Chat about this file'" @click="emit('toggleChat')" />
      <el-button size="small" text :icon="Close" title="Close" @click="emit('close')" />
    </div>
  </div>
</template>