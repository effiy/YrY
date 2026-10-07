<script setup lang="ts" name="AnalyticsCharts">
import ECharts from "@/components/ECharts/index.vue";

defineProps<{
  reviewCycleDonutOption: any;
  statusBarOption: any;
  typeBarOption: any;
  lifecycleBarOption: any;
  moduleBarOption: any;
  rolesBarOption: any;
  sizeDistOption: any;
  fileAgeOption: any;
  categoryBarOption: any;
  tagsBarOption: any;
  isDimensionFiltered: (dim: string) => boolean;
  chartContextFiles: any[] | null;
}>();

const emit = defineEmits<{
  (e: "chart-click", dimension: string, params: any): void;
}>();
</script>

<template>
  <div>
    <el-row :gutter="16">
      <el-col class="mb16" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('review_cycle') }">
          <div class="chart-title">Review Cycle <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
          <div class="chart-body"><ECharts :option="reviewCycleDonutOption" height="280" @chart-click="(p:any) => emit('chart-click', 'review_cycle', p)" /></div>
        </div>
      </el-col>
      <el-col class="mb16" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('status') }">
          <div class="chart-title">Status <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
          <div class="chart-body"><ECharts :option="statusBarOption" height="280" @chart-click="(p:any) => emit('chart-click', 'status', p)" /></div>
        </div>
      </el-col>
      <el-col class="mb16" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('type') }">
          <div class="chart-title">Type <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
          <div class="chart-body"><ECharts :option="typeBarOption" height="280" @chart-click="(p:any) => emit('chart-click', 'type', p)" /></div>
        </div>
      </el-col>
      <el-col class="mb16" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('lifecycle') }">
          <div class="chart-title">Lifecycle <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
          <div class="chart-body"><ECharts :option="lifecycleBarOption" height="280" @chart-click="(p:any) => emit('chart-click', 'lifecycle', p)" /></div>
        </div>
      </el-col>
      <el-col class="mb16" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('module') }">
          <div class="chart-title">Top Modules <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
          <div class="chart-body"><ECharts :option="moduleBarOption" height="280" @chart-click="(p:any) => emit('chart-click', 'module', p)" /></div>
        </div>
      </el-col>
      <el-col class="mb16" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('roles') }">
          <div class="chart-title">Roles <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
          <div class="chart-body"><ECharts :option="rolesBarOption" height="280" @chart-click="(p:any) => emit('chart-click', 'role', p)" /></div>
        </div>
      </el-col>
      <el-col class="mb16" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('size') }">
          <div class="chart-title">File Size <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
          <div class="chart-body"><ECharts :option="sizeDistOption" height="280" @chart-click="(p:any) => emit('chart-click', 'size', p)" /></div>
        </div>
      </el-col>
      <el-col class="mb16" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('age') }">
          <div class="chart-title">File Age <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
          <div class="chart-body"><ECharts :option="fileAgeOption" height="280" @chart-click="(p:any) => emit('chart-click', 'age', p)" /></div>
        </div>
      </el-col>
      <el-col class="mb16" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('category') }">
          <div class="chart-title">Category <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
          <div class="chart-body"><ECharts :option="categoryBarOption" height="280" @chart-click="(p:any) => emit('chart-click', 'category', p)" /></div>
        </div>
      </el-col>
      <el-col class="mb16" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('tags') }">
          <div class="chart-title">Tags <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
          <div class="chart-body"><ECharts :option="tagsBarOption" height="280" @chart-click="(p:any) => emit('chart-click', 'tag', p)" /></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.mb16 { margin-bottom: 16px; }

.chart-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  .chart-title {
    flex-shrink: 0;
    padding: 12px 16px 8px;
    font-size: 13px;
    font-weight: 600;
    color: #1d2129;
  }
  .chart-body {
    flex: 1;
    min-height: 0;
    padding: 0 8px 8px;
  }
}

.chart-highlight {
  border-color: var(--el-color-primary) !important;
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
  .chart-title {
    font-weight: 700;
    color: var(--el-color-primary);
  }
}

.chart-count-badge {
  margin-left: 4px;
  font-size: 11px;
  font-weight: normal;
  color: var(--el-color-primary);
}
</style>