<script setup lang="ts" name="AttentionSummary">
import { WarningFilled, QuestionFilled } from "@element-plus/icons-vue";

defineProps<{
  needsAttentionFiles: any[];
  attentionPct: number;
  totalMissingCount: number;
  totalUnknownCount: number;
  hasMissingItems: boolean;
  hasUnknownItems: boolean;
  clientMissingStats: Record<string, number>;
  showAttentionDetail: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-detail"): void;
  (e: "show-all-attention-files"): void;
  (e: "set-quality-filter", field: string): void;
  (e: "set-filter", key: string, value: string): void;
}>();
</script>

<template>
  <div class="attention-panel" v-if="needsAttentionFiles.length > 0">
    <div class="atn-header">
      <div class="atn-header-left">
        <span class="atn-title">Needs Attention</span>
        <span class="atn-count-badge">{{ needsAttentionFiles.length }} files ({{ attentionPct }}%)</span>
      </div>
      <div class="atn-header-actions">
        <el-button size="small" text @click="emit('toggle-detail')">{{ showAttentionDetail ? 'Collapse' : 'Expand' }}</el-button>
        <el-button size="small" type="warning" text @click="emit('show-all-attention-files')">View all &rarr;</el-button>
      </div>
    </div>
    <template v-if="showAttentionDetail">
      <div class="attention-summary-strip">
        <div class="attn-summary-item attn-summary-total">
          <span class="attn-summary-count">{{ needsAttentionFiles.length }}</span>
          <span class="attn-summary-label">Total</span>
        </div>
        <div class="attn-summary-item attn-summary-missing">
          <span class="attn-summary-count">{{ totalMissingCount }}</span>
          <span class="attn-summary-label">Missing</span>
        </div>
        <div class="attn-summary-item attn-summary-unknown">
          <span class="attn-summary-count">{{ totalUnknownCount }}</span>
          <span class="attn-summary-label">Unknown</span>
        </div>
        <div class="attn-summary-item attn-summary-stale" v-if="clientMissingStats.stale_count > 0">
          <span class="attn-summary-count">{{ clientMissingStats.stale_count }}</span>
          <span class="attn-summary-label">Stale</span>
        </div>
      </div>
      <div class="attention-group" v-if="hasMissingItems">
        <div class="attention-group-label">Missing Metadata</div>
        <div class="attention-grid">
          <div class="attn-item" v-if="clientMissingStats.no_status > 0" @click="emit('set-quality-filter', 'status')">
            <el-icon :size="14"><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_status }}</span>
            <span class="attn-label">Status</span>
          </div>
          <div class="attn-item" v-if="clientMissingStats.no_type > 0" @click="emit('set-quality-filter', 'type')">
            <el-icon :size="14"><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_type }}</span>
            <span class="attn-label">Type</span>
          </div>
          <div class="attn-item" v-if="clientMissingStats.no_lifecycle > 0" @click="emit('set-quality-filter', 'lifecycle')">
            <el-icon :size="14"><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_lifecycle }}</span>
            <span class="attn-label">Lifecycle</span>
          </div>
          <div class="attn-item" v-if="clientMissingStats.no_review_cycle > 0" @click="emit('set-quality-filter', 'review_cycle')">
            <el-icon :size="14"><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_review_cycle }}</span>
            <span class="attn-label">Review</span>
          </div>
          <div class="attn-item" v-if="clientMissingStats.no_roles > 0" @click="emit('set-quality-filter', 'roles')">
            <el-icon :size="14"><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_roles }}</span>
            <span class="attn-label">Roles</span>
          </div>
          <div class="attn-item" v-if="clientMissingStats.no_tags > 0" @click="emit('set-quality-filter', 'tags')">
            <el-icon :size="14"><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_tags }}</span>
            <span class="attn-label">Tags</span>
          </div>
          <div class="attn-item" v-if="clientMissingStats.no_benefit > 0" @click="emit('set-quality-filter', 'benefit')">
            <el-icon :size="14"><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_benefit }}</span>
            <span class="attn-label">Benefit</span>
          </div>
        </div>
      </div>
      <div class="attention-group" v-if="hasUnknownItems">
        <div class="attention-group-label">Unknown Values</div>
        <div class="attention-grid">
          <div class="attn-item attn-item-unknown" v-if="clientMissingStats.unknown_status > 0" @click="emit('set-filter', 'status', 'unknown')">
            <el-icon :size="14"><QuestionFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.unknown_status }}</span>
            <span class="attn-label">Status</span>
          </div>
          <div class="attn-item attn-item-unknown" v-if="clientMissingStats.unknown_type > 0" @click="emit('set-filter', 'type', 'unknown')">
            <el-icon :size="14"><QuestionFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.unknown_type }}</span>
            <span class="attn-label">Type</span>
          </div>
          <div class="attn-item attn-item-unknown" v-if="clientMissingStats.unknown_lifecycle > 0" @click="emit('set-filter', 'lifecycle', 'unknown')">
            <el-icon :size="14"><QuestionFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.unknown_lifecycle }}</span>
            <span class="attn-label">Lifecycle</span>
          </div>
        </div>
      </div>
      <div class="attention-group" v-if="clientMissingStats.stale_count > 0">
        <div class="attention-group-label">Review Overdue</div>
        <div class="attention-grid">
          <div class="attn-item attn-item-stale" @click="emit('set-filter', 'stale', 'true')">
            <el-icon :size="14"><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.stale_count }}</span>
            <span class="attn-label">Stale files</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.attention-panel {
  margin-bottom: 20px;
}

.atn-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.atn-header-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.atn-title {
  font-size: 16px;
  font-weight: 700;
  color: #e6a23c;
}

.atn-count-badge {
  font-size: 13px;
  color: #e6a23c;
  background: #fef0e8;
  padding: 2px 10px;
  border-radius: 12px;
}

.atn-header-actions {
  display: flex;
  gap: 8px;
}

.attention-summary-strip {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.attn-summary-item {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 6px 14px;
  background: var(--el-fill-color-light);
  border-radius: 8px;

  .attn-summary-count {
    font-size: 18px;
    font-weight: 700;
  }

  .attn-summary-label {
    font-size: 12px;
    color: #86909c;
  }

  &.attn-summary-total .attn-summary-count { color: #1d2129; }
  &.attn-summary-missing .attn-summary-count { color: #e6a23c; }
  &.attn-summary-unknown .attn-summary-count { color: #86909c; }
  &.attn-summary-stale .attn-summary-count { color: #f56c6c; }
}

.attention-group {
  margin-bottom: 8px;

  &:last-child { margin-bottom: 4px; }
}

.attention-group-label {
  padding-left: 2px;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #86909c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.attention-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attn-item {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 7px 14px;
  cursor: pointer;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition: all 0.15s;

  &:hover {
    border-color: #e6a23c;
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
    transform: translateY(-1px);
  }

  .el-icon { color: #e6a23c; }

  .attn-count {
    font-size: 16px;
    font-weight: 700;
    color: #e6a23c;
  }

  .attn-label {
    font-size: 13px;
    color: #4e5969;
  }

  &.attn-item-unknown {
    background: #f2f3f5;
    .el-icon { color: #86909c; }
    .attn-count { color: #86909c; }
    &:hover { border-color: #86909c; }
  }

  &.attn-item-stale {
    background: #fef0f0;
    .el-icon { color: #f56c6c; }
    .attn-count { color: #f56c6c; }
    &:hover { border-color: #f56c6c; }
  }
}
</style>