<script setup lang="ts" name="DataQualityPanel">
import { MagicStick } from "@element-plus/icons-vue";

defineProps<{
  statusCompletenessPct: number;
  typeCompletenessPct: number;
  lifecycleCompletenessPct: number;
  reviewCycleCompletenessPct: number;
  rolesCompletenessPct: number;
  tagsCompletenessPct: number;
  dataQualityScore: number;
  clientMissingStats: Record<string, number>;
  worstCategories: Array<{ name: string; score: number; totalMissing: number }>;
  qualityCardClass: (pct: number) => string;
  dataQualityColor: (score: number) => string;
  catColor: (name: string) => string;
}>();

const emit = defineEmits<{
  (e: "set-quality-filter", field: string): void;
  (e: "set-filter", key: string, value: string): void;
  (e: "fix-metadata-with-agent"): void;
}>();

const fields = [
  { key: 'status', pctKey: 'statusCompletenessPct' as const, missingKey: 'no_status' },
  { key: 'type', pctKey: 'typeCompletenessPct' as const, missingKey: 'no_type' },
  { key: 'lifecycle', pctKey: 'lifecycleCompletenessPct' as const, missingKey: 'no_lifecycle' },
  { key: 'review_cycle', pctKey: 'reviewCycleCompletenessPct' as const, missingKey: 'no_review_cycle' },
  { key: 'roles', pctKey: 'rolesCompletenessPct' as const, missingKey: 'no_roles' },
  { key: 'tags', pctKey: 'tagsCompletenessPct' as const, missingKey: 'no_tags' },
];

const labels: Record<string, string> = {
  status: 'Status', type: 'Type', lifecycle: 'Lifecycle',
  review_cycle: 'Review Cycle', roles: 'Roles', tags: 'Tags',
};
</script>

<template>
  <div class="quality-panel">
    <div class="qp-header">
      <div class="qp-header-left">
        <span class="qp-title">Data Quality</span>
        <span class="qp-score" :style="{ color: dataQualityColor(dataQualityScore) }">{{ dataQualityScore }}%</span>
        <span class="qp-hint">Weighted: status/type/lifecycle(25%) review(15%) roles/tags(5%)</span>
      </div>
      <el-button size="small" type="warning" plain @click="emit('fix-metadata-with-agent')" v-if="dataQualityScore < 80">
        <el-icon><MagicStick /></el-icon> Fix with Agent
      </el-button>
    </div>
    <el-row :gutter="16">
      <el-col
        v-for="f in fields"
        :key="f.key"
        class="mb16"
        :xs="12" :sm="8" :md="4" :lg="4" :xl="4"
      >
        <div
          class="quality-mini-card"
          :class="qualityCardClass($props[f.pctKey])"
          @click="emit('set-quality-filter', f.key)"
        >
          <div class="qmc-pct" :style="{ color: dataQualityColor($props[f.pctKey]) }">{{ $props[f.pctKey] }}%</div>
          <div class="qmc-bar">
            <div class="qmc-bar-fill" :style="{ width: $props[f.pctKey] + '%', background: dataQualityColor($props[f.pctKey]) }"></div>
          </div>
          <div class="qmc-label">{{ labels[f.key] }}</div>
          <div class="qmc-sub">{{ clientMissingStats[f.missingKey] }} missing</div>
        </div>
      </el-col>
    </el-row>
    <!-- Quality by Category -->
    <div class="quality-by-cat" v-if="worstCategories.length > 0">
      <div class="qbc-header">
        <span class="qbc-title">Needs Attention by Category</span>
        <span class="qbc-hint">{{ worstCategories.length }} below 80% quality</span>
      </div>
      <div class="qbc-list">
        <div v-for="cat in worstCategories" :key="cat.name" class="qbc-item" @click="emit('set-filter', 'category', cat.name)">
          <span class="qbc-item-name" :style="{ color: catColor(cat.name) }">{{ cat.name }}</span>
          <div class="qbc-item-bar-wrap">
            <div class="qbc-item-bar" :style="{ width: cat.score + '%', background: dataQualityColor(cat.score) }"></div>
          </div>
          <span class="qbc-item-score" :style="{ color: dataQualityColor(cat.score) }">{{ cat.score }}%</span>
          <span class="qbc-item-missing">{{ cat.totalMissing }} missing</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.quality-panel {
  margin-bottom: 20px;
}

.qp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.qp-header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.qp-title {
  font-size: 16px;
  font-weight: 700;
  color: #1d2129;
}

.qp-score {
  font-size: 20px;
  font-weight: 700;
}

.qp-hint {
  font-size: 12px;
  color: #86909c;
}

.mb16 {
  margin-bottom: 16px;
}

.quality-mini-card {
  padding: 14px 12px;
  text-align: center;
  cursor: pointer;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  transition: transform 0.12s, box-shadow 0.12s;

  &:hover {
    box-shadow: 0 3px 12px rgb(0 0 0 / 7%);
    transform: translateY(-1px);
  }

  .qmc-pct {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
  }

  .qmc-bar {
    height: 4px;
    margin: 6px 0 4px;
    overflow: hidden;
    background: #f0f0f0;
    border-radius: 2px;
  }

  .qmc-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .qmc-label {
    margin-top: 4px;
    font-size: 12px;
    font-weight: 500;
    color: #4e5969;
  }

  .qmc-sub {
    margin-top: 2px;
    font-size: 11px;
    color: #86909c;
  }

  &.qmc-healthy {
    background: #f0f9eb;
    border-color: #c2e7b0;
  }

  &.qmc-warn {
    background: #fef0e8;
    border-color: #f5dab1;
  }

  &.qmc-poor {
    background: #fef0f0;
    border-color: #fbc4c4;
  }
}

.quality-by-cat {
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);

  .qbc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    .qbc-title {
      font-size: 13px;
      font-weight: 600;
      color: #1d2129;
    }

    .qbc-hint {
      font-size: 12px;
      color: #86909c;
    }
  }
}

.qbc-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.qbc-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.12s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  .qbc-item-name {
    min-width: 80px;
    font-size: 13px;
    font-weight: 500;
  }

  .qbc-item-bar-wrap {
    flex: 1;
    height: 10px;
    overflow: hidden;
    background: #f0f0f0;
    border-radius: 5px;
  }

  .qbc-item-bar {
    min-width: 2px;
    height: 100%;
    border-radius: 5px;
    transition: width 0.3s ease;
  }

  .qbc-item-score {
    min-width: 40px;
    font-size: 13px;
    font-weight: 600;
    text-align: right;
  }

  .qbc-item-missing {
    min-width: 70px;
    font-size: 11px;
    color: #86909c;
  }
}
</style>