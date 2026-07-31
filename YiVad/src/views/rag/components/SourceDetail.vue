<script setup lang="ts" name="SourceDetail">
/**
 * Reusable source-detail panel — renders a single RagSource's document link,
 * relevance score, metadata, and chunk content.
 *
 * Used by Retrieval Explorer (drawer), Chat (dialog), and History (drawer).
 */
import { computed } from "vue";
import { ElMessage } from "element-plus";
import { Document, Link, CopyDocument } from "@element-plus/icons-vue";
import { scorePercent, scoreLabel, scoreColor, kbDetailLink } from "@/views/rag/constants";
import ScoreBar from "./ScoreBar.vue";
import type { RagSource } from "@/api/interface/rag";

const props = defineProps<{
  source: RagSource;
  index: number;
}>();

const visibleMeta = computed(() => {
  if (!props.source?.metadata) return {};
  const m = { ...props.source.metadata };
  delete m.char_count;
  delete m.token_estimate;
  return m;
});

const hasMeta = computed(() => Object.keys(visibleMeta.value).length > 0);

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success("Chunk text copied to clipboard");
  });
}

function openInKb(filePath: string) {
  window.open(kbDetailLink(filePath), "_blank");
}
</script>

<template>
  <div class="source-detail">
    <!-- Document -->
    <div class="sd-section">
      <h4>Document</h4>
      <el-link :href="kbDetailLink(source.file_path)" target="_blank" type="primary" :underline="false">
        <el-icon><Link /></el-icon> {{ source.file_path }}
      </el-link>
    </div>

    <!-- Relevance Score -->
    <div class="sd-section">
      <h4>Relevance Score</h4>
      <div class="sd-score">
        <el-progress
          :percentage="scorePercent(source.score)"
          :stroke-width="12"
          :color="scoreColor(source.score)"
        />
        <span class="sd-score__text">{{ scoreLabel(source.score) }}</span>
      </div>
    </div>

    <!-- Metadata -->
    <div class="sd-section" v-if="hasMeta">
      <h4>Metadata</h4>
      <el-descriptions :column="1" border size="small" class="sd-meta">
        <el-descriptions-item
          v-for="(val, key) in visibleMeta"
          :key="key"
          :label="String(key)"
        >
          <template v-if="Array.isArray(val)">
            <el-tag v-for="(t, ti) in val" :key="ti" size="small" style="margin: 1px 2px">{{ t }}</el-tag>
          </template>
          <template v-else>{{ val }}</template>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Chunk Content -->
    <div class="sd-section">
      <h4>Chunk Content</h4>
      <div class="sd-text">
        <pre>{{ source.text }}</pre>
      </div>
    </div>

    <!-- Actions -->
    <div class="sd-actions">
      <el-button plain size="small" @click="copyText(source.text)">
        <el-icon><CopyDocument /></el-icon> Copy Text
      </el-button>
      <el-button plain size="small" @click="openInKb(source.file_path)">
        <el-icon><Document /></el-icon> Open in Knowledge Base
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.source-detail {
  // container
}

.sd-section {
  margin-bottom: 20px;

  h4 {
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.sd-score {
  display: flex;
  align-items: center;
  gap: 12px;

  .el-progress {
    flex: 1;
  }

  &__text {
    font-size: 18px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
}

.sd-meta {
  :deep(.el-descriptions__label) { font-size: 12px; }
  :deep(.el-descriptions__content) { font-size: 12px; word-break: break-all; }
}

.sd-text {
  background: var(--el-fill-color-light);
  border-radius: 6px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;

  pre {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: inherit;
    color: var(--el-text-color-primary);
  }
}

.sd-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
