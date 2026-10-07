<script setup lang="ts" name="HealthOverview">
import { Document, Folder, Cpu, Timer, TrendCharts, DataAnalysis, Star, WarningFilled } from "@element-plus/icons-vue";

defineProps<{
  pulsingCard: string;
  statDeltas: any;
  knowledgeData: any;
  topCategory: string;
  topRole: string;
  totalModules: number;
  recentWeekCount: number;
  recentWeekPct: any;
  clientReviewCoveragePct: any;
  clientMissingStats: any;
  dataQualityScore: any;
  missingMetadataCount: any;
  tacitPct: any;
  stalePct: any;
  dataQualityColor: (score: number) => string;
  formatNumber: (n: number) => string;
}>();

const emit = defineEmits<{
  (e: "pulse-card", card: string): void;
  (e: "clear-all-filters"): void;
  (e: "scroll-to-drill-down"): void;
  (e: "toggle-no-review-filter"): void;
  (e: "set-quality-filter", field: string): void;
  (e: "set-filter", key: string, value: string): void;
  (e: "time-filter-change", period: string): void;
}>();
</script>

<template>
  <!-- Row 1: Health Overview -->
  <div class="card top-box">
    <div class="top-header">
      <span class="top-title">Knowledge Base Overview</span>
    </div>
    <!-- Row A: Volume metrics -->
    <el-row :gutter="12">
      <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card stat-total" :class="{ 'stat-pulse': pulsingCard === 'total' }" @click="emit('pulse-card', 'total'); emit('clear-all-filters')">
          <div class="stat-icon"><el-icon><Document /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(statDeltas ? statDeltas.total.filtered : (knowledgeData?.total ?? 0)) }}</div>
            <div class="stat-label">Total Files</div>
            <div class="stat-delta" v-if="statDeltas">{{ formatNumber(statDeltas.total.baseline) }} → {{ formatNumber(statDeltas.total.filtered) }}</div>
          </div>
        </div>
      </el-col>
      <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card stat-categories" :class="{ 'stat-pulse': pulsingCard === 'categories' }" @click="emit('pulse-card', 'categories'); emit('scroll-to-drill-down')">
          <div class="stat-icon"><el-icon><Folder /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ statDeltas ? statDeltas.categories.filtered : (knowledgeData?.categories.length ?? 0) }}</div>
            <div class="stat-label">Categories <span class="stat-sub">({{ topCategory }})</span></div>
            <div class="stat-delta" v-if="statDeltas">{{ statDeltas.categories.baseline }} → {{ statDeltas.categories.filtered }}</div>
          </div>
        </div>
      </el-col>
      <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card stat-modules" :class="{ 'stat-pulse': pulsingCard === 'modules' }" @click="emit('pulse-card', 'modules'); emit('scroll-to-drill-down')">
          <div class="stat-icon"><el-icon><Cpu /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ statDeltas ? statDeltas.modules.filtered : totalModules }}</div>
            <div class="stat-label">Modules <span class="stat-sub">(top role: {{ topRole }})</span></div>
            <div class="stat-delta" v-if="statDeltas">{{ statDeltas.modules.baseline }} → {{ statDeltas.modules.filtered }}</div>
          </div>
        </div>
      </el-col>
      <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card stat-recent" :class="{ 'stat-pulse': pulsingCard === 'recent' }" @click="emit('pulse-card', 'recent'); emit('time-filter-change', 'week')">
          <div class="stat-icon"><el-icon><Timer /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ recentWeekCount }}</div>
            <div class="stat-label">Active This Week <span class="stat-sub">({{ recentWeekPct }}%)</span></div>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- Row B: Quality metrics -->
    <el-row :gutter="12">
      <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card stat-coverage" :class="{ 'stat-pulse': pulsingCard === 'coverage' }" @click="emit('pulse-card', 'coverage'); emit('toggle-no-review-filter')">
          <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ clientReviewCoveragePct }}%</div>
            <div class="stat-label">Review Coverage <span class="stat-sub">({{ clientMissingStats.no_review_cycle }} missing)</span></div>
          </div>
        </div>
      </el-col>
      <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card" :class="{ 'stat-healthy': dataQualityScore >= 80, 'stat-warn': dataQualityScore >= 50 && dataQualityScore < 80, 'stat-stale': dataQualityScore < 50, 'stat-pulse': pulsingCard === 'quality' }" @click="emit('pulse-card', 'quality'); emit('set-quality-filter', 'status')">
          <div class="stat-icon"><el-icon><DataAnalysis /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value" :style="{ color: dataQualityColor(dataQualityScore) }">{{ dataQualityScore }}%</div>
            <div class="stat-label">Data Quality <span class="stat-sub">({{ missingMetadataCount }} incomplete)</span></div>
          </div>
        </div>
      </el-col>
      <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card stat-tacit" :class="{ 'stat-pulse': pulsingCard === 'tacit' }" @click="emit('pulse-card', 'tacit'); emit('set-filter', 'tacit', 'true')">
          <div class="stat-icon"><el-icon><Star /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ knowledgeData?.health.tacit_count ?? 0 }}</div>
            <div class="stat-label">Tacit <span class="stat-sub">({{ tacitPct }}%)</span></div>
          </div>
        </div>
      </el-col>
      <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card" :class="{ 'stat-stale': (knowledgeData?.health.stale_count ?? 0) > 0, 'stat-healthy': (knowledgeData?.health.stale_count ?? 0) === 0, 'stat-pulse': pulsingCard === 'stale' }" @click="emit('pulse-card', 'stale'); emit('set-filter', 'stale', 'true')">
          <div class="stat-icon"><el-icon><WarningFilled /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ statDeltas ? statDeltas.stale.filtered : (knowledgeData?.health.stale_count ?? 0) }}</div>
            <div class="stat-label">Stale <span class="stat-sub">({{ stalePct }}%)</span></div>
            <div class="stat-delta" v-if="statDeltas">{{ statDeltas.stale.baseline }} → {{ statDeltas.stale.filtered }}</div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
@use "../index.scss" as *;
</style>