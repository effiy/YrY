<script setup lang="ts">
/**
 * KnowledgeToolbar — toolbar for knowledge preview dialog.
 * Extracted from KnowledgePreviewDialog.vue: nav, mode switch, actions.
 * Matches YiVad's KnowledgeToolbar layout.
 */
import { ArrowLeft, Close, Download, Refresh, Check } from '@element-plus/icons-vue';

export type KbMode = 'preview' | 'edit' | 'split';

defineProps<{
  currentPath: string;
  mode: KbMode;
  loading: boolean;
  hasContent: boolean;
  saving: boolean;
  /** Document stats: chars, words, readingMin — shown in preview mode */
  docStats: { chars: number; words: number; readingMin: number };
  navHistoryLength: number;
}>();

const emit = defineEmits<{
  'update:mode': [value: KbMode];
  goBack: [];
  cancelEdit: [];
  save: [];
  downloadFile: [];
  refresh: [];
  close: [];
}>();

const VALID_MODES: readonly KbMode[] = ['preview', 'edit', 'split'];

function onModeChange(value: unknown) {
  const str = typeof value === 'string' ? value : String(value ?? 'preview');
  const next = VALID_MODES.includes(str as KbMode) ? (str as KbMode) : 'preview';
  emit('update:mode', next);
}
</script>

<template>
  <div class="kpd-toolbar">
    <div class="kpd-nav">
      <el-button
        v-if="navHistoryLength && mode === 'preview'"
        size="small"
        text
        :icon="ArrowLeft"
        title="Back"
        @click="emit('goBack')"
      />
      <span class="kpd-path" :title="currentPath">{{ currentPath }}</span>
    </div>
    <el-radio-group :model-value="mode" size="small" @update:model-value="onModeChange">
      <el-radio-button value="edit">Edit</el-radio-button>
      <el-radio-button value="split">Split</el-radio-button>
      <el-radio-button value="preview">Preview</el-radio-button>
    </el-radio-group>
    <div class="kpd-actions">
      <template v-if="mode === 'edit' || mode === 'split'">
        <el-button size="small" text @click="emit('cancelEdit')">Cancel</el-button>
        <el-button type="primary" size="small" :loading="saving" :icon="Check" @click="emit('save')">Save</el-button>
      </template>
      <template v-else>
        <span class="kpd-stats">
          <span class="kpd-stat" :title="`${docStats.chars.toLocaleString()} characters`">{{ docStats.chars.toLocaleString() }} ch</span>
          <span class="kpd-stat-sep">·</span>
          <span class="kpd-stat">{{ docStats.words.toLocaleString() }} w</span>
          <span class="kpd-stat-sep">·</span>
          <span class="kpd-stat">{{ docStats.readingMin }}m read</span>
        </span>
      </template>
      <el-button text size="small" :icon="Download" title="Download" :disabled="!hasContent" @click="emit('downloadFile')" />
      <el-button text size="small" :icon="Refresh" title="Refresh" :disabled="loading" @click="emit('refresh')" />
      <el-button text size="small" :icon="Close" title="Close" @click="emit('close')" />
    </div>
  </div>
</template>