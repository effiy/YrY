<template>
  <div class="knowledge-base-box" v-loading="loading">
    <!-- Row 1: Health Overview -->
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">Knowledge Base Overview</span>
        <div class="top-actions">
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <!-- Row A: Volume metrics -->
      <el-row :gutter="12">
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card stat-total" :class="{ 'stat-pulse': pulsingCard === 'total' }" @click="pulseCard('total'); clearAllFilters()">
            <div class="stat-icon"><el-icon><Document /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(statDeltas ? statDeltas.total.filtered : (knowledgeData?.total ?? 0)) }}</div>
              <div class="stat-label">Total Files</div>
              <div class="stat-delta" v-if="statDeltas">{{ formatNumber(statDeltas.total.baseline) }} → {{ formatNumber(statDeltas.total.filtered) }}</div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card stat-categories" :class="{ 'stat-pulse': pulsingCard === 'categories' }" @click="pulseCard('categories'); scrollToDrillDown()">
            <div class="stat-icon"><el-icon><Folder /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ statDeltas ? statDeltas.categories.filtered : (knowledgeData?.categories.length ?? 0) }}</div>
              <div class="stat-label">Categories <span class="stat-sub">({{ topCategory }})</span></div>
              <div class="stat-delta" v-if="statDeltas">{{ statDeltas.categories.baseline }} → {{ statDeltas.categories.filtered }}</div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card stat-modules" :class="{ 'stat-pulse': pulsingCard === 'modules' }" @click="pulseCard('modules'); scrollToDrillDown()">
            <div class="stat-icon"><el-icon><Cpu /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ statDeltas ? statDeltas.modules.filtered : totalModules }}</div>
              <div class="stat-label">Modules <span class="stat-sub">(top role: {{ topRole }})</span></div>
              <div class="stat-delta" v-if="statDeltas">{{ statDeltas.modules.baseline }} → {{ statDeltas.modules.filtered }}</div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card stat-recent" :class="{ 'stat-pulse': pulsingCard === 'recent' }" @click="pulseCard('recent'); onTimeFilterChange('week')">
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
          <div class="stat-card stat-coverage" :class="{ 'stat-pulse': pulsingCard === 'coverage' }" @click="pulseCard('coverage'); toggleNoReviewFilter()">
            <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ clientReviewCoveragePct }}%</div>
              <div class="stat-label">Review Coverage <span class="stat-sub">({{ clientMissingStats.no_review_cycle }} missing)</span></div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card" :class="{ 'stat-healthy': dataQualityScore >= 80, 'stat-warn': dataQualityScore >= 50 && dataQualityScore < 80, 'stat-stale': dataQualityScore < 50, 'stat-pulse': pulsingCard === 'quality' }" @click="pulseCard('quality'); setQualityFilter('status')">
            <div class="stat-icon"><el-icon><DataAnalysis /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value" :style="{ color: dataQualityColor(dataQualityScore) }">{{ dataQualityScore }}%</div>
              <div class="stat-label">Data Quality <span class="stat-sub">({{ missingMetadataCount }} incomplete)</span></div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card stat-tacit" :class="{ 'stat-pulse': pulsingCard === 'tacit' }" @click="pulseCard('tacit'); setFilter('tacit', 'true')">
            <div class="stat-icon"><el-icon><Star /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ knowledgeData?.health.tacit_count ?? 0 }}</div>
              <div class="stat-label">Tacit <span class="stat-sub">({{ tacitPct }}%)</span></div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card" :class="{ 'stat-stale': (knowledgeData?.health.stale_count ?? 0) > 0, 'stat-healthy': (knowledgeData?.health.stale_count ?? 0) === 0, 'stat-pulse': pulsingCard === 'stale' }" @click="pulseCard('stale'); setFilter('stale', 'true')">
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

    <!-- Row 1.5: Analytics Charts -->
    <div class="card charts-box">
      <div class="top-header">
        <span class="top-title">Knowledge Analytics</span>
        <div class="top-actions">
          <span class="chart-hint">点击图表下钻到对应文件</span>
        </div>
      </div>
      <el-row :gutter="12">
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('review_cycle') }">
            <div class="chart-title">Review Cycle <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
            <div class="chart-body"><ECharts :option="reviewCycleDonutOption" height="220" @chart-click="onChartClick('review_cycle', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('status') }">
            <div class="chart-title">Status <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
            <div class="chart-body"><ECharts :option="statusBarOption" height="220" @chart-click="onChartClick('status', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('type') }">
            <div class="chart-title">Type <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
            <div class="chart-body"><ECharts :option="typeBarOption" height="220" @chart-click="onChartClick('type', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('lifecycle') }">
            <div class="chart-title">Lifecycle <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
            <div class="chart-body"><ECharts :option="lifecycleBarOption" height="220" @chart-click="onChartClick('lifecycle', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('module') }">
            <div class="chart-title">Top Modules <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
            <div class="chart-body"><ECharts :option="moduleBarOption" height="220" @chart-click="onChartClick('module', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('roles') }">
            <div class="chart-title">Roles <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
            <div class="chart-body"><ECharts :option="rolesBarOption" height="220" @chart-click="onChartClick('role', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('size') }">
            <div class="chart-title">File Size <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
            <div class="chart-body"><ECharts :option="sizeDistOption" height="220" @chart-click="onChartClick('size', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('age') }">
            <div class="chart-title">File Age <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
            <div class="chart-body"><ECharts :option="fileAgeOption" height="220" @chart-click="onChartClick('age', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('category') }">
            <div class="chart-title">Category <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
            <div class="chart-body"><ECharts :option="categoryBarOption" height="220" @chart-click="onChartClick('category', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box" :class="{ 'chart-highlight': isDimensionFiltered('tags') }">
            <div class="chart-title">Tags <span class="chart-count-badge" v-if="chartContextFiles">({{ chartContextFiles.length }})</span></div>
            <div class="chart-body"><ECharts :option="tagsBarOption" height="220" @chart-click="onChartClick('tag', $event)" /></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Row 2.5: Data Quality -->
    <div class="card quality-box">
      <div class="top-header">
        <span class="top-title">Data Quality</span>
        <div class="top-actions">
          <span class="chart-hint">Weighted score: status/type/lifecycle(25%) review(15%) roles/tags(5%)</span>
          <el-button size="small" type="warning" plain @click="fixMetadataWithAgent" v-if="dataQualityScore < 80">
            <el-icon><MagicStick /></el-icon> Fix with Agent
          </el-button>
        </div>
      </div>
      <el-row :gutter="12">
        <el-col class="mb12" :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
          <div class="quality-mini-card" :class="qualityCardClass(statusCompletenessPct)" @click="setQualityFilter('status')">
            <div class="qmc-pct" :style="{ color: dataQualityColor(statusCompletenessPct) }">{{ statusCompletenessPct }}%</div>
            <div class="qmc-bar"><div class="qmc-bar-fill" :style="{ width: statusCompletenessPct + '%', background: dataQualityColor(statusCompletenessPct) }"></div></div>
            <div class="qmc-label">Status</div>
            <div class="qmc-sub">{{ clientMissingStats.no_status }} missing</div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
          <div class="quality-mini-card" :class="qualityCardClass(typeCompletenessPct)" @click="setQualityFilter('type')">
            <div class="qmc-pct" :style="{ color: dataQualityColor(typeCompletenessPct) }">{{ typeCompletenessPct }}%</div>
            <div class="qmc-bar"><div class="qmc-bar-fill" :style="{ width: typeCompletenessPct + '%', background: dataQualityColor(typeCompletenessPct) }"></div></div>
            <div class="qmc-label">Type</div>
            <div class="qmc-sub">{{ clientMissingStats.no_type }} missing</div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
          <div class="quality-mini-card" :class="qualityCardClass(lifecycleCompletenessPct)" @click="setQualityFilter('lifecycle')">
            <div class="qmc-pct" :style="{ color: dataQualityColor(lifecycleCompletenessPct) }">{{ lifecycleCompletenessPct }}%</div>
            <div class="qmc-bar"><div class="qmc-bar-fill" :style="{ width: lifecycleCompletenessPct + '%', background: dataQualityColor(lifecycleCompletenessPct) }"></div></div>
            <div class="qmc-label">Lifecycle</div>
            <div class="qmc-sub">{{ clientMissingStats.no_lifecycle }} missing</div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
          <div class="quality-mini-card" :class="qualityCardClass(reviewCycleCompletenessPct)" @click="setQualityFilter('review_cycle')">
            <div class="qmc-pct" :style="{ color: dataQualityColor(reviewCycleCompletenessPct) }">{{ reviewCycleCompletenessPct }}%</div>
            <div class="qmc-bar"><div class="qmc-bar-fill" :style="{ width: reviewCycleCompletenessPct + '%', background: dataQualityColor(reviewCycleCompletenessPct) }"></div></div>
            <div class="qmc-label">Review Cycle</div>
            <div class="qmc-sub">{{ clientMissingStats.no_review_cycle }} missing</div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
          <div class="quality-mini-card" :class="qualityCardClass(rolesCompletenessPct)" @click="setQualityFilter('roles')">
            <div class="qmc-pct" :style="{ color: dataQualityColor(rolesCompletenessPct) }">{{ rolesCompletenessPct }}%</div>
            <div class="qmc-bar"><div class="qmc-bar-fill" :style="{ width: rolesCompletenessPct + '%', background: dataQualityColor(rolesCompletenessPct) }"></div></div>
            <div class="qmc-label">Roles</div>
            <div class="qmc-sub">{{ clientMissingStats.no_roles }} missing</div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
          <div class="quality-mini-card" :class="qualityCardClass(tagsCompletenessPct)" @click="setQualityFilter('tags')">
            <div class="qmc-pct" :style="{ color: dataQualityColor(tagsCompletenessPct) }">{{ tagsCompletenessPct }}%</div>
            <div class="qmc-bar"><div class="qmc-bar-fill" :style="{ width: tagsCompletenessPct + '%', background: dataQualityColor(tagsCompletenessPct) }"></div></div>
            <div class="qmc-label">Tags</div>
            <div class="qmc-sub">{{ clientMissingStats.no_tags }} missing</div>
          </div>
        </el-col>
      </el-row>
      <!-- Quality by Category -->
      <div class="quality-by-cat" v-if="worstCategories.length > 0">
        <div class="qbc-header">
          <span class="qbc-title">Needs Attention by Category</span>
          <span class="qbc-hint">{{ worstCategories.length }} categor{{ worstCategories.length === 1 ? 'y' : 'ies' }} below 80% quality</span>
        </div>
        <div class="qbc-list">
          <div
            v-for="cat in worstCategories" :key="cat.name"
            class="qbc-item"
            @click="setFilter('category', cat.name)"
          >
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

    <!-- Needs Attention Summary -->
    <div class="card attention-box" v-if="needsAttentionFiles.length > 0">
      <div class="top-header">
        <span class="top-title">Needs Attention</span>
        <div class="top-actions">
          <span class="chart-hint">{{ needsAttentionFiles.length }} files ({{ attentionPct }}%) need fixes</span>
          <el-button size="small" text @click="showAttentionDetail = !showAttentionDetail">
            {{ showAttentionDetail ? 'Collapse' : 'Expand' }}
          </el-button>
          <el-button size="small" type="warning" text @click="showAllAttentionFiles()">View all {{ needsAttentionFiles.length }} files &rarr;</el-button>
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
          <div class="attn-item" v-if="clientMissingStats.no_status > 0" @click="setQualityFilter('status')">
            <el-icon><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_status }}</span>
            <span class="attn-label">Status</span>
          </div>
          <div class="attn-item" v-if="clientMissingStats.no_type > 0" @click="setQualityFilter('type')">
            <el-icon><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_type }}</span>
            <span class="attn-label">Type</span>
          </div>
          <div class="attn-item" v-if="clientMissingStats.no_lifecycle > 0" @click="setQualityFilter('lifecycle')">
            <el-icon><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_lifecycle }}</span>
            <span class="attn-label">Lifecycle</span>
          </div>
          <div class="attn-item" v-if="clientMissingStats.no_review_cycle > 0" @click="setQualityFilter('review_cycle')">
            <el-icon><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_review_cycle }}</span>
            <span class="attn-label">Review</span>
          </div>
          <div class="attn-item" v-if="clientMissingStats.no_roles > 0" @click="setQualityFilter('roles')">
            <el-icon><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_roles }}</span>
            <span class="attn-label">Roles</span>
          </div>
          <div class="attn-item" v-if="clientMissingStats.no_tags > 0" @click="setQualityFilter('tags')">
            <el-icon><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_tags }}</span>
            <span class="attn-label">Tags</span>
          </div>
          <div class="attn-item" v-if="clientMissingStats.no_benefit > 0" @click="setQualityFilter('benefit')">
            <el-icon><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.no_benefit }}</span>
            <span class="attn-label">Benefit</span>
          </div>
        </div>
      </div>
      <div class="attention-group" v-if="hasUnknownItems">
        <div class="attention-group-label">Unknown Values</div>
        <div class="attention-grid">
          <div class="attn-item attn-item-unknown" v-if="clientMissingStats.unknown_status > 0" @click="setFilter('status', 'unknown')">
            <el-icon><QuestionFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.unknown_status }}</span>
            <span class="attn-label">Status</span>
          </div>
          <div class="attn-item attn-item-unknown" v-if="clientMissingStats.unknown_type > 0" @click="setFilter('type', 'unknown')">
            <el-icon><QuestionFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.unknown_type }}</span>
            <span class="attn-label">Type</span>
          </div>
          <div class="attn-item attn-item-unknown" v-if="clientMissingStats.unknown_lifecycle > 0" @click="setFilter('lifecycle', 'unknown')">
            <el-icon><QuestionFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.unknown_lifecycle }}</span>
            <span class="attn-label">Lifecycle</span>
          </div>
        </div>
      </div>
      <div class="attention-group" v-if="clientMissingStats.stale_count > 0">
        <div class="attention-group-label">Review Overdue</div>
        <div class="attention-grid">
          <div class="attn-item attn-item-stale" @click="setFilter('stale', 'true')">
            <el-icon><WarningFilled /></el-icon>
            <span class="attn-count">{{ clientMissingStats.stale_count }}</span>
            <span class="attn-label">Stale files</span>
          </div>
        </div>
      </div>
      </template>
    </div>

    <!-- Filter Pills Bar -->
    <FilterPills
      :pills="activeFilterPills"
      :has-active-filter="hasActiveFilter"
      :can-undo="filterHistory.length > 0"
      @remove="(key: string) => removeFilter(key)"
      @clear-all="clearAllFilters"
      @undo="undoLastFilter"
    />

    <!-- Collapsible Analytical Panels -->
    <div class="card collapsible-panels">
      <div class="top-header">
        <span class="top-title">Advanced Analysis</span>
        <div class="top-actions">
          <el-button text size="small" @click="showStaleRisk = !showStaleRisk" :type="showStaleRisk ? 'primary' : ''">
            Stale Risk
          </el-button>
          <el-button text size="small" @click="showCategoryComparison = !showCategoryComparison" :type="showCategoryComparison ? 'primary' : ''">
            Compare Categories
          </el-button>
          <el-button text size="small" @click="showCrossHeatmap = !showCrossHeatmap" :type="showCrossHeatmap ? 'primary' : ''">
            Status × Lifecycle
          </el-button>
          <el-button text size="small" @click="showCoverageGaps = !showCoverageGaps" :type="showCoverageGaps ? 'primary' : ''">
            Coverage Gaps
          </el-button>
          <el-button text size="small" @click="showTagCloud = !showTagCloud" :type="showTagCloud ? 'primary' : ''">
            Tag Cloud
          </el-button>
          <el-button text size="small" @click="showRoleCloud = !showRoleCloud" :type="showRoleCloud ? 'primary' : ''">
            Role Cloud
          </el-button>
          <el-button text size="small" @click="showReviewCompliance = !showReviewCompliance" :type="showReviewCompliance ? 'primary' : ''">
            Review Compliance
          </el-button>
          <el-button text size="small" @click="showKnowledgeGraph = !showKnowledgeGraph" :type="showKnowledgeGraph ? 'primary' : ''">
            Knowledge Graph
          </el-button>
        </div>
      </div>

      <StaleRiskTimeline
        v-if="showStaleRisk"
        :buckets="staleRiskBuckets"
        @filter-files="(files: any) => { clearAllFilters(); files.forEach((f: any) => setFilter('stale', 'true')) }"
      />

      <CategoryComparison
        v-if="showCategoryComparison"
        :data="categoryComparisonData"
        :active-category="activeFilter.category || ''"
        @select-category="(name: string) => setFilter('category', name)"
      />

      <el-row :gutter="12" v-if="showCrossHeatmap">
        <el-col class="mb12" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <CrossHeatmap
            :data="crossStatusLifecycle"
            @cell-click="(status: string, lifecycle: string) => { setFilter('status', status); setFilter('lifecycle', lifecycle) }"
          />
        </el-col>
      </el-row>

      <CoverageGaps
        v-if="showCoverageGaps"
        :data="coverageGapData"
        @drill-gap="(cat: string, mod: string, field: string) => { setFilter('category', cat); setFilter('module', mod); setQualityFilter(field) }"
      />

      <el-row :gutter="12" v-if="showTagCloud || showRoleCloud">
        <el-col class="mb12" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <TagCloud
            v-if="showTagCloud"
            title="Top Tags"
            :tags="tagCounts"
            :pairs="tagPairs"
            @select-tag="(name: string) => setFilter('tag', name)"
          />
        </el-col>
        <el-col class="mb12" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <TagCloud
            v-if="showRoleCloud"
            title="Top Roles"
            :tags="roleCounts"
            :pairs="rolePairs"
            :color-fn="(name: string) => '#fc8452'"
            @select-tag="(name: string) => setFilter('role', name)"
          />
        </el-col>
      </el-row>

      <ReviewCompliance
        v-if="showReviewCompliance"
        :data="reviewComplianceData"
        @select-cycle="(cycle: string) => setFilter('review_cycle', cycle)"
      />

      <KnowledgeGraphChart
        v-if="showKnowledgeGraph"
        :files="knowledgeData?.files || []"
        @select-node="(path: string) => openFileDialog(path)"
      />
    </div>

    <!-- Main Row: Full-width drill-down tree + file preview -->
    <el-row :gutter="12" class="main-row">
      <el-col :xs="24" :sm="6" :md="5" :lg="4" :xl="3" class="kb-cat-sidebar-col">
        <aside class="kb-cat-sidebar">
          <div class="kb-cat-sidebar__title">Categories</div>
          <nav class="kb-cat-sidebar__nav">
            <button
              class="kb-cat-sidebar__item"
              :class="{ 'is-active': !activeFilter.category }"
              @click="removeFilter('category')"
            >
              <span class="kb-cat-sidebar__dot" style="background: #c0c4cc"></span>
              <span class="kb-cat-sidebar__label">All Files</span>
              <span class="kb-cat-sidebar__badge">{{ knowledgeData?.total ?? 0 }}</span>
            </button>
            <button
              v-for="cat in categories" :key="cat.name"
              class="kb-cat-sidebar__item"
              :class="{ 'is-active': activeFilter.category === cat.name }"
              @click="setFilter('category', cat.name)"
            >
              <span class="kb-cat-sidebar__dot" :style="{ background: catColor(cat.name) }"></span>
              <span class="kb-cat-sidebar__label">{{ cat.name }}</span>
              <span class="kb-cat-sidebar__badge">{{ cat.count }}</span>
            </button>
          </nav>
        </aside>
      </el-col>
      <el-col :xs="24" :sm="18" :md="19" :lg="20" :xl="21" class="main-col-full">
        <div class="card drill-down-box" ref="drillDownRef" :class="{ 'drill-highlight-flash': drillHighlight }">
          <!-- Breadcrumb Navigation -->
          <DrillBreadcrumb
            :segments="filterBreadcrumb"
            :has-active-filter="hasActiveFilter"
            :active-dimensions="activeFilterPills.filter((p: any) => !['category', 'module', 'sub_module'].includes(p.key))"
            @clear-all="clearAllFilters"
            @back-to-category="backToCategory"
            @remove-filter="(key: string) => removeFilter(key)"
          />
          <!-- Recently viewed quick-access -->
          <div v-if="recentlyViewed.length" class="kb-recent-strip">
            <span class="kb-recent-strip__label">Recently viewed</span>
            <button v-for="f in recentlyViewed" :key="f.path" class="kb-recent-strip__chip" :title="f.path" @click="openFilePreview(f)">
              <span class="kb-recent-strip__dot" :style="{ background: catColor(f.category) }"></span>
              {{ f.title }}
            </button>
            <button class="kb-recent-strip__clear" title="Clear recently viewed" @click="clearRecentlyViewed">✕</button>
          </div>
          <!-- Panel Header -->
          <div class="panel-header">
            <span class="panel-title">
              <template v-if="viewAttentionFiles">Files Needing Attention</template>
              <template v-else>File Classification</template>
              <span class="panel-count">({{ sortedDrillTableData.length ?? 0 }} files)</span>
            </span>
            <div class="kb-date-nav" v-if="!viewAttentionFiles">
              <el-button size="small" text :icon="ArrowLeft" @click="goToPrevDay" title="Previous day" />
              <span class="kb-date-nav__label" :class="{ 'is-filtering': !!dateFilterDay }">
                {{ dateFilterLabel }}
                <span v-if="dateFilterDay" class="kb-date-nav__count">({{ dayFiles.length }})</span>
              </span>
              <el-button size="small" text :icon="ArrowRight" @click="goToNextDay" title="Next day" />
              <el-button v-if="dateFilterDay" size="small" text @click="clearDateFilter">All</el-button>
              <el-button v-else size="small" text type="primary" @click="goToTodayFilter">Today</el-button>
            </div>
            <div class="panel-actions" v-if="!viewAttentionFiles">
              <div class="search-wrapper">
                <el-input
                  v-model="searchText" :placeholder="searchMode === 'content' ? 'Search content...' : 'Ctrl+K search...'"
                  size="small" clearable class="search-input"
                  :prefix-icon="Search"
                  @input="onSearchInput"
                  @focus="showSearchSuggestions = true"
                  @blur="showSearchSuggestions = false"
                />
                <div class="search-suggestions" v-if="showSearchSuggestions && searchSuggestions.length > 0 && searchMode === 'title'">
                  <div
                    v-for="s in searchSuggestions" :key="s.path"
                    class="ss-item"
                    @mousedown.prevent="openFileInDialog(s)"
                  >
                    <span class="ss-title">{{ s.title || s.path.split('/').pop() }}</span>
                    <span class="ss-path">{{ s.path }}</span>
                  </div>
                </div>
              </div>
              <el-radio-group v-model="searchMode" size="small" @change="searchText = ''; contentSearchResults = []">
                <el-radio-button value="title">Title</el-radio-button>
                <el-radio-button value="content">Content</el-radio-button>
              </el-radio-group>
              <el-radio-group v-model="activeTimeFilter" size="small" @change="onTimeFilterChange">
                <el-radio-button value="">All</el-radio-button>
                <el-radio-button value="today">Today</el-radio-button>
                <el-radio-button value="week">Week</el-radio-button>
                <el-radio-button value="month">Month</el-radio-button>
              </el-radio-group>
              <el-radio-group v-model="viewMode" size="small">
                <el-radio-button value="files">Files</el-radio-button>
                <el-radio-button value="modules">Modules</el-radio-button>
              </el-radio-group>
              <el-radio-group v-if="viewMode === 'files'" v-model="fileViewMode" size="small">
                <el-radio-button value="table">Table</el-radio-button>
                <el-radio-button value="gallery">Gallery</el-radio-button>
              </el-radio-group>
              <el-button v-if="drillTableData.length" size="small" text :icon="Download" title="Export CSV" @click="exportCSV" />
            </div>
            <div class="panel-actions" v-if="viewAttentionFiles">
              <span class="attention-mode-hint">Showing all files with missing or invalid metadata</span>
              <el-button size="small" type="warning" plain @click="clearAllFilters()">Clear &amp; return</el-button>
            </div>
          </div>

          <!-- Module Classification Table -->
          <div class="module-classification-view" v-if="viewMode === 'modules' && searchMode === 'title' && !searchText">
            <div class="mcv-header">
              <span class="mcv-title">Module Classification ({{ totalModules }} modules, {{ knowledgeData?.total ?? 0 }} files)</span>
              <div class="mcv-header-actions">
                <el-input v-model="moduleDrillSearch" size="small" placeholder="Filter modules..." clearable class="search-input" :prefix-icon="Search" />
                <el-button size="small" text @click="showTreeView = !showTreeView" :type="showTreeView ? 'primary' : ''">
                  {{ showTreeView ? 'Table' : 'Tree' }}
                </el-button>
                <el-button size="small" text @click="viewMode = 'files'">File table view &rarr;</el-button>
              </div>
            </div>
            <CategoryTree
              v-if="showTreeView"
              :data="categoryTreeData"
              :active-category="activeFilter.category || ''"
              @select-node="(cat: string, mod?: string, sub?: string) => selectTreeNode(cat, mod, sub)"
            />
            <el-table
              v-if="!showTreeView"
              ref="moduleTableRef"
              :data="filteredModuleDrillData"
              row-key="key"
              size="small"
              :expand-row-keys="expandedModuleKeys"
              @expand-change="onModuleExpandChange"
              :default-sort="{ prop: 'count', order: 'descending' }"
              stripe
            >
              <el-table-column type="expand">
                <template #default="{ row: m }">
                  <div class="mcv-expand-inner">
                    <div class="mcv-expand-summary">
                      <template v-if="getModuleClassSummary(m.files).roles.length">
                        <span class="mcv-expand-dim">Roles</span>
                        <span v-for="r in getModuleClassSummary(m.files).roles" :key="r.name" class="mcv-chip role-badge" @click="setFilter('role', r.name)">{{ r.name }} {{ r.count }}</span>
                      </template>
                    </div>
                    <el-table :data="m.files.slice(0, m.filePage || 30)" size="small" class="mcv-files-table">
                      <el-table-column label="File" min-width="180" show-overflow-tooltip>
                        <template #default="{ row: f }">
                          <span class="mcv-file-link" @click="openFileInDialog(f as KnowledgeFileSummary)" :title="f.path">{{ f.title || f.path.split('/').pop() }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="Sub" width="100" show-overflow-tooltip>
                        <template #default="{ row: f }">
                          <span v-if="f.sub_module !== '__root__' && f.sub_module" class="mcv-sub-link" @click="drillFromModule(m.category, m.name, f.sub_module)">{{ f.sub_module }}</span>
                          <span v-else class="text-muted">--</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="Type" width="110">
                        <template #default="{ row: f }">
                          <span class="type-badge" :class="'type-' + (f.type || 'unknown')" @click="setFilter('type', f.type)">{{ f.type || '--' }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="Status" width="90">
                        <template #default="{ row: f }">
                          <span v-if="f.status" class="mcv-status-tag-dynamic" :style="{ '--bg': statusColor(f.status) }" @click="setFilter('status', f.status)">{{ f.status }}</span>
                          <span v-else class="text-muted">--</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="Lifecycle" width="100">
                        <template #default="{ row: f }">
                          <span v-if="f.lifecycle && f.lifecycle !== 'unknown'" class="mcv-lifecycle-tag-dynamic" :style="{ '--bg': lifecycleColor(f.lifecycle) }" @click="setFilter('lifecycle', f.lifecycle)">{{ f.lifecycle }}</span>
                          <span v-else class="text-muted">--</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="Review" width="100">
                        <template #default="{ row: f }">
                          <span v-if="f.review_cycle" class="mcv-review-link" @click="setFilter('review_cycle', f.review_cycle)">{{ f.review_cycle }}</span>
                          <span v-else class="text-muted">--</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="Roles" width="130">
                        <template #default="{ row: f }">
                          <span v-if="(f.roles || []).length" class="role-badges-row">
                            <span v-for="r in (f.roles || []).slice(0, 3)" :key="r" class="role-badge" @click="setFilter('role', r)">{{ r }}</span>
                          </span>
                          <span v-else class="text-muted">--</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="Size" width="70">
                        <template #default="{ row: f }">{{ f.size ? formatFileSize(f.size) : '--' }}</template>
                      </el-table-column>
                      <el-table-column label="Updated" width="100">
                        <template #default="{ row: f }">{{ f.updated ? formatRelativeTime(f.updated) : '--' }}</template>
                      </el-table-column>
                      <el-table-column label="Flags" width="50">
                        <template #default="{ row: f }">
                          <span v-if="f.tacit" class="popover-tacit mcv-flag-tacit" title="tacit">T</span>
                          <span v-if="isStaleFile(f as KnowledgeFileSummary)" class="popover-stale mcv-flag-stale" title="stale">S</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="Actions" width="110" fixed="right">
                        <template #default="{ row: f }">
                          <el-button size="small" type="primary" text @click="openFileInDialog(f as KnowledgeFileSummary)">Preview</el-button>
                          <el-button size="small" text type="danger" @click.stop="deleteFile(f)"><el-icon><Delete /></el-icon></el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <div v-if="m.files.length > (m.filePage || 30)" class="mcv-show-more" @click="m.filePage = (m.filePage || 30) + 30">
                      Showing {{ Math.min(m.filePage || 30, m.files.length) }} of {{ m.files.length }} files — click to show more
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="Module" min-width="160" sortable="custom">
                <template #default="{ row }">
                  <span class="mcv-module-link">{{ row.name === '__root__' ? 'Root' : row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="category" label="Category" width="130" sortable="custom">
                <template #default="{ row }">
                  <span class="cat-color-text" :style="{ '--cat-color': catColor(row.category) }">{{ row.category }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="count" label="Files" width="80" sortable="custom" />
              <el-table-column label="Top Status" min-width="170">
                <template #default="{ row }">
                  <span v-for="s in (row.statuses || []).slice(0, 3)" :key="s.name" class="mcv-chip-dynamic" :style="{ '--bg': statusColor(s.name) }" @click.stop="setFilter('status', s.name)">{{ s.name }} {{ s.count }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Top Type" min-width="170">
                <template #default="{ row }">
                  <span v-for="t in (row.types || []).slice(0, 3)" :key="t.name" class="mcv-chip type-badge" :class="'type-' + (t.name || 'unknown')" @click.stop="setFilter('type', t.name)">{{ t.name }} {{ t.count }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Health" width="140">
                <template #default="{ row }">
                  <div class="health-row-stats">
                    <span class="health-coverage" :style="{ '--coverage-color': row.review_coverage_pct < 50 ? '#e6a23c' : '#67c23a' }">{{ row.review_coverage_pct }}%</span>
                    <span v-if="row.stale_count > 0" class="health-stale">{{ row.stale_count }}S</span>
                    <span v-if="row.tacit_count > 0" class="health-tacit">{{ row.tacit_count }}T</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- Sub-Module Grid -->
          <div class="submodule-grid" v-if="showSubModuleGrid">
            <div
              v-for="sc in subCategories" :key="sc.name"
              class="submodule-card" :class="{ 'sm-root': sc.name === '__root__' }"
              @click="activeSubCategory = sc.name; drillPage = 1"
            >
              <div class="sm-header">
                <span class="sm-name">{{ sc.name === '__root__' ? 'Root files' : sc.name }}</span>
                <span class="sm-count">{{ sc.count }} files</span>
              </div>
              <div class="sm-stats">
                <div class="sm-stat-row">
                  <span class="sm-stat-label">Status</span>
                  <span class="sm-stat-values">
                    <span v-for="s in (sc.statuses || []).slice(0, 3)" :key="s.name" class="sm-stat-chip clickable" :class="'chip-' + (s.name || 'unknown')" @click.stop="crossFilterSubModule(sc.name, 'status', s.name)">{{ s.name }}</span>
                    <span v-if="(sc.statuses || []).length > 3" class="sm-stat-more">+{{ sc.statuses.length - 3 }}</span>
                  </span>
                </div>
                <div class="sm-stat-row" v-if="(sc.types || []).length > 0">
                  <span class="sm-stat-label">Types</span>
                  <span class="sm-stat-values">
                    <span v-for="t in (sc.types || []).slice(0, 3)" :key="t.name" class="sm-stat-chip clickable" :class="'chip-' + (t.name || 'unknown')" @click.stop="crossFilterSubModule(sc.name, 'type', t.name)">{{ t.name }}</span>
                    <span v-if="(sc.types || []).length > 3" class="sm-stat-more">+{{ sc.types.length - 3 }}</span>
                  </span>
                </div>
                <div class="sm-stat-row" v-if="(sc.lifecycles || []).length > 0">
                  <span class="sm-stat-label">Lifecycle</span>
                  <span class="sm-stat-values">
                    <span v-for="l in (sc.lifecycles || []).slice(0, 3)" :key="l.name" class="sm-stat-chip clickable" :class="'chip-' + (l.name || 'unknown')" @click.stop="crossFilterSubModule(sc.name, 'lifecycle', l.name)">{{ l.name }}</span>
                    <span v-if="(sc.lifecycles || []).length > 3" class="sm-stat-more">+{{ sc.lifecycles.length - 3 }}</span>
                  </span>
                </div>
                <div class="sm-stat-row">
                  <span class="sm-stat-label">Coverage</span>
                  <span class="sm-stat-value" :class="{ 'text-warn': sc.reviewCoveragePct < 50 }">{{ sc.reviewCoveragePct }}%</span>
                </div>
                <div class="sm-stat-row" v-if="(sc.roles || []).length > 0">
                  <span class="sm-stat-label">Roles</span>
                  <span class="sm-stat-values">
                    <span v-for="r in (sc.roles || []).slice(0, 3)" :key="r.name" class="sm-role-chip">{{ r.name }}</span>
                    <span v-if="(sc.roles || []).length > 3" class="sm-stat-more">+{{ sc.roles.length - 3 }}</span>
                  </span>
                </div>
              </div>
              <div class="sm-indicators" v-if="sc.staleCount > 0 || sc.tacitCount > 0">
                <span v-if="sc.staleCount > 0" class="sm-indicator sm-ind-stale">{{ sc.staleCount }} stale</span>
                <span v-if="sc.tacitCount > 0" class="sm-indicator sm-ind-tacit">{{ sc.tacitCount }} tacit</span>
              </div>
            </div>
          </div>

          <!-- Module Detail Card -->
          <div class="module-detail-card" v-if="moduleDetail">
            <div class="mdc-header">
              <div class="mdc-title-row">
                <span class="mdc-module-name">{{ activeSubCategory === '__root__' ? 'Root files' : activeSubCategory }}</span>
                <span class="mdc-file-count">{{ moduleDetail.count }} files</span>
                <span class="mdc-category-tag mdc-category-tag-dynamic" :style="{ '--cat-color': catColor(activeFilter.category || '') }">{{ activeFilter.category }}</span>
              </div>
              <div class="mdc-health-row">
                <div class="mdc-health-item" :class="{ 'mdc-warn': moduleDetail.review_coverage_pct < 50 }">
                  <span class="mdc-health-label">Coverage</span>
                  <span class="mdc-health-value">{{ moduleDetail.review_coverage_pct }}%</span>
                  <div class="mdc-health-bar"><div class="mdc-health-fill mdc-health-fill-dynamic" :style="{ '--w': moduleDetail.review_coverage_pct + '%', '--bar-bg': moduleDetail.review_coverage_pct < 50 ? '#e6a23c' : '#67c23a' }"></div></div>
                </div>
                <div class="mdc-health-item" v-if="moduleDetail.stale_count > 0">
                  <span class="mdc-health-label">Stale</span>
                  <span class="mdc-health-value mdc-health-stale">{{ moduleDetail.stale_count }}</span>
                </div>
                <div class="mdc-health-item" v-if="moduleDetail.tacit_count > 0">
                  <span class="mdc-health-label">Tacit</span>
                  <span class="mdc-health-value mdc-health-tacit">{{ moduleDetail.tacit_count }}</span>
                </div>
              </div>
            </div>
            <div class="mdc-body">
              <div class="mdc-dist-row" v-if="(moduleDetail.statuses || []).length > 0">
                <span class="mdc-dist-label">Status</span>
                <span v-for="s in (moduleDetail.statuses || []).slice(0, 5)" :key="s.name" class="sm-stat-chip clickable" :class="'chip-' + (s.name || 'unknown')" @click="setFilter('status', s.name)">{{ s.name }} {{ s.count }}</span>
              </div>
              <div class="mdc-dist-row" v-if="(moduleDetail.types || []).length > 0">
                <span class="mdc-dist-label">Type</span>
                <span v-for="t in (moduleDetail.types || []).slice(0, 5)" :key="t.name" class="sm-stat-chip clickable" :class="'chip-' + (t.name || 'unknown')" @click="setFilter('type', t.name)">{{ t.name }} {{ t.count }}</span>
              </div>
              <div class="mdc-dist-row" v-if="(moduleDetail.lifecycles || []).length > 0">
                <span class="mdc-dist-label">Lifecycle</span>
                <span v-for="l in (moduleDetail.lifecycles || []).slice(0, 4)" :key="l.name" class="sm-stat-chip clickable" :class="'chip-' + (l.name || 'unknown')" @click="setFilter('lifecycle', l.name)">{{ l.name }} {{ l.count }}</span>
              </div>
              <div class="mdc-dist-row" v-if="(moduleDetail.roles || []).length > 0">
                <span class="mdc-dist-label">Roles</span>
                <span v-for="r in (moduleDetail.roles || []).slice(0, 5)" :key="r.name" class="sm-role-chip">{{ r.name }} {{ r.count }}</span>
              </div>
            </div>
            <div class="mdc-sub-row" v-if="subdirectoryBreakdown.length > 1">
              <span class="mdc-dist-label">Sub-modules</span>
              <div class="mdc-sub-bars">
                <span
                  v-for="s in subdirectoryBreakdown" :key="s.name"
                  class="mdc-sub-bar-item mdc-sub-bar-item-dynamic"
                  :class="{ active: activeFilter.sub_module === s.name }"
                  @click="drillToSubdir(s.name)"
                  :style="{ '--flex': s.count }"
                  :title="`${s.name === '__root__' ? 'root' : s.name}: ${s.count} files`"
                >
                  <span class="mdc-sub-bar-fill mdc-sub-bar-fill-dynamic" :style="{ '--bar-color': catColor(activeFilter.category || '') }"></span>
                  <span class="mdc-sub-bar-label">{{ s.name === '__root__' ? 'root' : s.name }} ({{ s.count }})</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Top Files in Module -->
          <div class="top-files-row" v-if="topModuleFiles.length > 0">
            <span class="tf-label">Files:</span>
            <div class="tf-scroll">
              <span
                v-for="tf in topModuleFiles" :key="tf.path"
                class="tf-chip" @click="openFileInDialog(tf)" :title="tf.path"
              >
                <span class="tf-chip-name">{{ tf.title || tf.path.split('/').pop() }}</span>
                <span class="tf-chip-meta">
                  <span v-if="tf.type" class="type-badge tf-chip-type-sm" :class="'type-' + (tf.type || 'unknown')">{{ tf.type }}</span>
                  <span v-if="tf.status" class="tv-file-status-dot tv-file-status-dot-dynamic" :style="{ '--dot-color': statusColor(tf.status) }"></span>
                  <span v-if="tf.tacit" class="tf-chip-tacit">T</span>
                  <span v-if="isStaleFile(tf)" class="tf-chip-stale">S</span>
                </span>
              </span>
            </div>
          </div>

          <!-- Content Search Results -->
          <div v-loading="contentSearchLoading" class="content-search-results" v-if="searchMode === 'content' && searchText">
            <div class="csr-header">
              Found {{ contentSearchResults.length }} files matching "{{ searchText }}"
            </div>
            <div
              v-for="r in enrichedSearchResults" :key="r.path"
              class="csr-item"
              @click="openFileDialog(r.path)"
              @mouseenter="(e: any) => { e.currentTarget.style.borderColor = 'var(--el-color-primary)'; e.currentTarget.style.background = 'var(--el-color-primary-light-9)' }"
              @mouseleave="(e: any) => { e.currentTarget.style.borderColor = 'var(--el-border-color-lighter)'; e.currentTarget.style.background = '' }"
            >
              <div class="csr-item-header">
                <span class="csr-title">{{ r.title }}</span>
                <span class="csr-path">{{ r.path }}</span>
              </div>
              <div class="csr-class-row" v-if="r.category">
                <span class="csr-cat-color" :style="{ '--cat-color': catColor(r.category) }">{{ r.category }}</span>
                <span v-if="r.module && r.module !== '__root__'" class="csr-module">/ {{ r.module }}</span>
                <span v-if="r.sub_module && r.sub_module !== '__root__'" class="csr-sub">/ {{ r.sub_module }}</span>
                <span v-if="r.type" class="type-badge csr-type" :class="'type-' + (r.type || 'unknown')">{{ r.type }}</span>
                <el-button size="small" text type="primary" @click.stop="openFileDialog(r.path)" title="Preview" class="csr-btn"><el-icon :size="14"><View /></el-icon></el-button>
                <el-button size="small" text type="primary" @click.stop="discussSearchResult(r)" class="csr-btn">Chat</el-button>
              </div>
              <div class="csr-snippet" v-html="highlightSnippet(r.snippet, searchText)"></div>
            </div>
          </div>
          <!-- File Table / Gallery -->
          <template v-if="viewMode === 'files' && !(searchMode === 'content' && searchText)">
            <!-- Gallery View -->
            <div class="file-gallery" v-if="fileViewMode === 'gallery'">
              <div
                v-for="f in paginatedDrillFiles" :key="f.path"
                class="fg-card" @click="openFileInDialog(f as KnowledgeFileSummary)"
              >
                <div class="fg-card-header">
                  <span class="fg-card-title">{{ f.title || f.path.split('/').pop() }}</span>
                  <span class="health-dot health-dot-shrink" :class="'health-' + fileHealthLevel(f)"></span>
                </div>
                <div class="fg-card-classification">
                  <span class="fg-card-cat-color" :style="{ '--cat-color': catColor(f.category) }">{{ f.category }}</span>
                  <span class="fg-class-sep">/</span>
                  <span>{{ f.module === '__root__' ? 'root' : f.module }}</span>
                  <template v-if="f.sub_module !== '__root__'">
                    <span class="fg-class-sep">/</span>
                    <span class="fg-class-sub">{{ f.sub_module }}</span>
                  </template>
                </div>
                <div class="fg-card-meta">
                  <span v-if="f.type" class="type-badge type-badge-sm" :class="'type-' + (f.type || 'unknown')">{{ f.type }}</span>
                  <el-tag v-if="f.status" :type="statusTagType(f.status)" size="small" class="fg-card-meta-tag">{{ f.status }}</el-tag>
                  <el-tag v-if="f.lifecycle && f.lifecycle !== 'unknown'" :type="lifecycleTagType(f.lifecycle)" size="small" class="fg-card-meta-tag">{{ f.lifecycle }}</el-tag>
                  <span v-if="f.tacit" class="fg-tacit">tacit</span>
                  <span v-if="isStaleFile(f as KnowledgeFileSummary)" class="fg-stale">stale</span>
                  <span v-if="f.review_cycle" class="fg-review">{{ f.review_cycle }}</span>
                </div>
                <div class="fg-card-footer">
                  <span class="fg-footer-size">{{ formatFileSize(f.size) }}</span>
                  <span class="fg-footer-time">{{ f.updated ? formatRelativeTime(f.updated) : '--' }}</span>
                  <el-button size="small" text type="primary" @click.stop="openFileInDialog(f as KnowledgeFileSummary)" class="fg-footer-preview">Preview</el-button>
                  <el-button size="small" text @click.stop="discussInAiChat(f as KnowledgeFileSummary)" class="fg-footer-chat">Chat</el-button>
                  <el-button size="small" text :icon="CopyDocument" v-copy="f.path" title="Copy path" @click.stop class="fg-footer-copy" />
                  <el-button size="small" text type="danger" @click.stop="deleteFile(f)" class="fg-footer-delete"><el-icon><Delete /></el-icon></el-button>
                </div>
              </div>
            </div>
            <!-- Table View -->
            <el-table
              v-else
              :data="paginatedDrillFiles" stripe size="small"
              highlight-current-row @row-click="openFileInDialog"
              @sort-change="onTableSortChange"
            >
              <el-table-column prop="title" label="File" min-width="320" sortable="custom">
                <template #default="{ row }">
                  <el-popover placement="right" :width="320" trigger="hover" :show-after="400" :hide-after="100">
                    <template #reference>
                      <div class="file-cell">
                        <span class="file-title">
                          <el-icon v-if="isStaleFile(row as KnowledgeFileSummary)" class="stale-row-icon" :size="12"><WarningFilled /></el-icon>
                          {{ row.title || row.path.split('/').pop() }}
                        </span>
                        <span class="file-path">
                          <span v-for="(seg, i) in row.path.split('/')" :key="i">
                            <span v-if="(i as number) > 0" class="path-sep-dot">/</span>
                            <span
                              v-if="i === 0" class="path-seg" @click.stop="setFilter('category', seg)"
                            >{{ seg }}</span>
                            <span
                              v-else-if="i === 1 && !seg.endsWith('.md')" class="path-seg"
                            >
                              <el-popover placement="top" :width="220" trigger="hover" :show-after="300" :hide-after="200">
                                <template #reference>
                                  <span @click.stop="setFilter('module', seg)">{{ seg }}</span>
                                </template>
                                <div class="popover-content" v-if="getModuleStats(row.category, seg)">
                                  <div><b>{{ seg }}</b> ({{ getModuleStats(row.category, seg)!.count }} files)</div>
                                  <div>Status: <span v-for="s in (getModuleStats(row.category, seg)!.statuses || []).slice(0,3)" :key="s.name" class="popover-stat">{{ s.name }}:{{ s.count }}</span></div>
                                  <div>Types: <span v-for="t in (getModuleStats(row.category, seg)!.types || []).slice(0,3)" :key="t.name" class="popover-stat">{{ t.name }}:{{ t.count }}</span></div>
                                  <div>Coverage: {{ getModuleStats(row.category, seg)!.review_coverage_pct }}% | Stale: {{ getModuleStats(row.category, seg)!.stale_count }} | Tacit: {{ getModuleStats(row.category, seg)!.tacit_count }}</div>
                                  <div v-if="(getModuleStats(row.category, seg)!.sub_modules || []).length > 1">Sub-modules: {{ (getModuleStats(row.category, seg)!.sub_modules || []).filter(s => s.name !== '__root__').map(s => s.name).join(', ') }}</div>
                                </div>
                              </el-popover>
                            </span>
                            <span
                              v-else-if="i === 2 && !seg.endsWith('.md')" class="path-seg" @click.stop="setFilter('sub_module', seg)"
                            >{{ seg }}</span>
                            <span v-else class="path-seg-file">{{ seg }}</span>
                          </span>
                        </span>
                      </div>
                    </template>
                    <div class="popover-content">
                      <div><b>Path:</b> {{ row.path }}</div>
                      <div><b>Category:</b> {{ row.category }} &middot; <b>Module:</b> {{ row.module === '__root__' ? 'root' : row.module }} &middot; <b>Sub:</b> {{ row.sub_module === '__root__' ? 'root' : row.sub_module }}</div>
                      <div><b>Status:</b> {{ row.status }} &middot; <b>Lifecycle:</b> {{ row.lifecycle }} &middot; <b>Type:</b> {{ row.type }}</div>
                      <div v-if="row.review_cycle"><b>Review:</b> {{ row.review_cycle }}</div>
                      <div v-if="row.tacit"><b>Tacit:</b> <span class="popover-tacit">Yes</span></div>
                      <div v-if="isStaleFile(row as KnowledgeFileSummary)"><b>Stale:</b> <span class="popover-stale">Yes</span></div>
                      <div v-if="row.benefit"><b>Benefit:</b> <span class="popover-benefit">{{ row.benefit.slice(0, 100) }}{{ row.benefit.length > 100 ? '...' : '' }}</span></div>
                      <div v-if="row.related_count > 0"><b>Related:</b> {{ row.related_count }} files
                        <div v-if="resolveRelatedNames(row as KnowledgeFileSummary).length > 0" class="popover-related-row">
                          <span v-for="r in resolveRelatedNames(row as KnowledgeFileSummary)" :key="r.path" class="popover-related-link" @click.stop="openFilePreview(knowledgeData?.files?.find(f => f.path === r.path) || { path: r.path, title: r.title } as any)" :title="r.path">{{ r.title }}</span>
                        </div>
                      </div>
                      <div v-if="(row.roles || []).length > 0"><b>Roles:</b> {{ (row.roles || []).join(', ') }}</div>
                      <div v-if="(row.tags || []).length > 0"><b>Tags:</b> {{ (row.tags || []).join(', ') }}</div>
                      <div><b>Size:</b> {{ formatFileSize(row.size) }} &middot; <b>Updated:</b> {{ row.updated ? formatRelativeTime(row.updated) : '--' }}</div>
                      <div class="popover-actions">
                        <el-button size="small" type="primary" plain @click.stop="openFileInDialog(row as KnowledgeFileSummary)">Preview</el-button>
                        <el-button size="small" plain @click.stop="discussInAiChat(row as KnowledgeFileSummary)">Chat</el-button>
                        <el-button size="small" plain :icon="CopyDocument" v-copy="row.path" @click.stop>Copy path</el-button>
                      </div>
                    </div>
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column prop="classification" label="Classification" width="190">
                <template #default="{ row }">
                  <div class="classification-breadcrumbs">
                    <span class="cb-seg cb-seg-cat" :style="{ '--cat-color': catColor(row.category) }" @click.stop="setFilter('category', row.category)">{{ row.category }}</span>
                    <span class="cb-sep">/</span>
                    <span class="cb-seg" @click.stop="row.module !== '__root__' ? navigateToModule(row.category, row.module) : undefined">{{ row.module === '__root__' ? 'root' : row.module }}</span>
                    <template v-if="row.sub_module !== '__root__'">
                      <span class="cb-sep">/</span>
                      <span class="cb-seg" @click.stop="drillToSubdir(row.sub_module)">{{ row.sub_module }}</span>
                    </template>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="category" label="Category" width="110" show-overflow-tooltip sortable="custom">
                <template #default="{ row }">
                  <span v-if="row.category" class="cat-tag cat-color-text" :style="{ '--cat-color': catColor(row.category) }">{{ row.category }}</span>
                  <span v-else class="text-muted">--</span>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="Type" width="85" show-overflow-tooltip sortable="custom">
                <template #default="{ row }">
                  <span class="type-badge" :class="'type-' + (row.type || 'unknown')" @click.stop="setFilter('type', row.type || 'unknown')">{{ row.type || '--' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="module" label="Module" width="115" show-overflow-tooltip sortable="custom">
                <template #default="{ row }">
                  <span v-if="row.module && row.module !== '__root__'" class="module-chip" @click.stop="setFilter('module', row.module)">{{ row.module }}</span>
                  <span v-else class="text-muted">--</span>
                </template>
              </el-table-column>
              <el-table-column prop="sub_module" label="Sub" width="90" show-overflow-tooltip sortable="custom">
                <template #default="{ row }">
                  <span v-if="row.sub_module && row.sub_module !== '__root__'" class="module-chip" @click.stop="setFilter('sub_module', row.sub_module)">{{ row.sub_module }}</span>
                  <span v-else class="text-muted">--</span>
                </template>
              </el-table-column>
              <el-table-column prop="tags" label="Tags" width="160" show-overflow-tooltip sortable="custom">
                <template #default="{ row }">
                  <span v-if="(row.tags || []).length > 0" class="role-badges">
                    <span v-for="t in (row.tags || []).slice(0, 2)" :key="t" class="tag-badge" @click.stop="setFilter('tag', t)">{{ t }}</span>
                    <span v-if="(row.tags || []).length > 2" class="role-more">+{{ row.tags.length - 2 }}</span>
                  </span>
                  <span v-else class="text-muted">--</span>
                </template>
              </el-table-column>
              <el-table-column prop="roles" label="Roles" width="180" show-overflow-tooltip sortable="custom">
                <template #default="{ row }">
                  <span v-if="(row.roles || []).length > 0" class="role-badges">
                    <span v-for="r in (row.roles || []).slice(0, 2)" :key="r" class="role-badge" @click.stop="setFilter('role', r)">{{ r }}</span>
                    <span v-if="(row.roles || []).length > 2" class="role-more">+{{ row.roles.length - 2 }}</span>
                  </span>
                  <span v-else class="text-muted">--</span>
                </template>
              </el-table-column>
              <el-table-column prop="health" label="Health" width="100" align="center" sortable="custom">
                <template #default="{ row }">
                  <el-tooltip placement="top" :show-after="300">
                    <template #content>
                      <div v-if="fileHealthIssues(row as KnowledgeFileSummary).length > 0">
                        <div v-for="issue in fileHealthIssues(row as KnowledgeFileSummary)" :key="issue">{{ issue }}</div>
                      </div>
                      <div v-else>All metadata complete</div>
                    </template>
                    <span v-if="fileHealthIssues(row as KnowledgeFileSummary).length > 0" class="health-issues-badge" :class="'health-issues-' + fileHealthLevel(row as KnowledgeFileSummary)">{{ fileHealthIssues(row as KnowledgeFileSummary).length }}</span>
                    <span v-else class="health-dot health-good"></span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="Status" width="100" sortable="custom">
                <template #default="{ row }">
                  <el-tag v-if="isMissingField(row.status)" type="danger" size="small" @click.stop="setQualityFilter('status')" class="table-tag-clickable">Missing</el-tag>
                  <el-tag v-else :type="statusTagType(row.status)" size="small" @click.stop="setFilter('status', row.status || 'unknown')" class="table-tag-clickable">{{ row.status || 'unknown' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="lifecycle" label="Lifecycle" width="100" sortable="custom">
                <template #default="{ row }">
                  <el-tag v-if="isMissingField(row.lifecycle)" type="danger" size="small" @click.stop="setQualityFilter('lifecycle')" class="table-tag-clickable">Missing</el-tag>
                  <el-tag v-else-if="row.lifecycle && row.lifecycle !== 'unknown'" :type="lifecycleTagType(row.lifecycle)" size="small" @click.stop="setFilter('lifecycle', row.lifecycle)" class="table-tag-clickable">
                    {{ row.lifecycle }}
                  </el-tag>
                  <el-tag v-else-if="row.lifecycle === 'unknown'" type="info" size="small" @click.stop="setFilter('lifecycle', 'unknown')" class="table-tag-clickable">unknown</el-tag>
                  <span v-else class="text-muted">--</span>
                </template>
              </el-table-column>
              <el-table-column prop="review_cycle" label="Review" width="140" sortable="custom">
                <template #default="{ row }">
                  <el-tag v-if="row.review_cycle" :type="reviewCycleTagType(row.review_cycle)" size="small" @click.stop="setFilter('review_cycle', row.review_cycle)" class="table-tag-clickable">
                    {{ row.review_cycle }}
                  </el-tag>
                  <span v-else class="text-muted">--</span>
                </template>
              </el-table-column>
              <el-table-column prop="updated" label="Updated" width="100" show-overflow-tooltip sortable="custom">
                <template #default="{ row }">
                  <span class="text-muted" v-if="row.updated" :title="row.updated">{{ formatRelativeTime(row.updated) }}</span>
                  <span class="text-muted" v-else>--</span>
                </template>
              </el-table-column>
              <el-table-column prop="size" label="Size" width="70" align="right" sortable="custom">
                <template #default="{ row }">
                  <span class="text-muted" v-if="row.size">{{ formatFileSize(row.size) }}</span>
                  <span class="text-muted" v-else>--</span>
                </template>
              </el-table-column>
              <el-table-column prop="tacit" label="Tacit" width="100" align="center" sortable="custom">
                <template #default="{ row }">
                  <el-icon v-if="row.tacit" class="tacit-icon"><Star /></el-icon>
                  <span v-else class="text-muted">--</span>
                </template>
              </el-table-column>
              <el-table-column v-if="showBenefitCol" prop="benefit" label="Benefit" min-width="160" show-overflow-tooltip sortable="custom">
                <template #default="{ row }">
                  <span v-if="row.benefit" class="benefit-col-text">{{ row.benefit.slice(0, 80) }}{{ row.benefit.length > 80 ? '...' : '' }}</span>
                  <span v-else class="text-muted">--</span>
                </template>
              </el-table-column>
              <el-table-column label="Actions" width="90" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" text type="danger" @click.stop="deleteFile(row)"><el-icon><Delete /></el-icon></el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="table-footer" v-if="drillTableData.length > drillPageSize">
              <span class="table-footer-info">Page {{ drillPage }} of {{ Math.ceil(drillTableData.length / drillPageSize) }} ({{ drillTableData.length }} files)</span>
              <el-pagination
                v-model:current-page="drillPage" :page-size="drillPageSize"
                :total="drillTableData.length" layout="prev, pager, next" size="small" background
              />
            </div>
          </template>

          <!-- Selected File Detail Panel -->
          <div v-if="selectedFile" class="file-detail-panel" @keydown="onDetailKeydown" tabindex="0" ref="detailPanelRef">
            <div class="fd-header">
              <div class="fd-header-left">
                <el-button size="small" text :disabled="!prevFile" @click="navigateToFile(prevFile!)" title="Previous file"><el-icon><ArrowLeft /></el-icon></el-button>
                <span class="fd-position" v-if="selectedFileIndex >= 0">{{ selectedFileIndex + 1 }}/{{ sortedDrillTableData.length }}</span>
                <span class="fd-position fd-kbd-hint" title="Use ← → arrow keys to navigate">←→</span>
                <el-button size="small" text :disabled="!nextFile" @click="navigateToFile(nextFile!)" title="Next file"><el-icon><ArrowRight /></el-icon></el-button>
                <span class="fd-title">{{ selectedFile.title || selectedFile.path.split('/').pop() }}</span>
              </div>
              <div class="fd-header-right">
                <el-button size="small" text type="primary" @click="openFileDialog(selectedFile.path)" title="Full preview"><el-icon :size="14"><View /></el-icon></el-button>
                <el-button size="small" text type="danger" @click="deleteFile(selectedFile)" title="Delete"><el-icon :size="14"><Delete /></el-icon></el-button>
                <el-button size="small" text @click="selectedFile = null"><el-icon><Close /></el-icon></el-button>
              </div>
            </div>
            <div class="fd-classification-path">
              <span class="fd-path-chip fd-path-chip-cat" :style="{ '--cat-color': catColor(selectedFile.category) }" @click="setFilter('category', selectedFile.category)">{{ selectedFile.category }}</span>
              <span class="fd-path-sep">/</span>
              <span class="fd-path-chip" @click="selectedFile.module !== '__root__' ? setFilter('module', selectedFile.module) : undefined">{{ selectedFile.module === '__root__' ? 'root' : selectedFile.module }}</span>
              <template v-if="selectedFile.sub_module !== '__root__'">
                <span class="fd-path-sep">/</span>
                <span class="fd-path-chip" @click="setFilter('sub_module', selectedFile.sub_module)">{{ selectedFile.sub_module }}</span>
              </template>
              <span class="fd-path-sep">/</span>
              <span class="fd-path-file">{{ selectedFile.path.split('/').pop() }}</span>
            </div>
            <div class="fd-body">
              <div class="fd-meta-grid">
                <div class="fd-meta-item">
                  <span class="fd-meta-label">Status</span>
                  <el-tag v-if="isMissingField(selectedFile.status)" type="danger" size="small">Missing</el-tag>
                  <el-tag v-else :type="statusTagType(selectedFile.status)" size="small">{{ selectedFile.status || 'unknown' }}</el-tag>
                </div>
                <div class="fd-meta-item">
                  <span class="fd-meta-label">Lifecycle</span>
                  <el-tag v-if="isMissingField(selectedFile.lifecycle)" type="danger" size="small">Missing</el-tag>
                  <el-tag v-else-if="selectedFile.lifecycle" :type="lifecycleTagType(selectedFile.lifecycle)" size="small">{{ selectedFile.lifecycle }}</el-tag>
                  <span v-else class="text-muted">--</span>
                </div>
                <div class="fd-meta-item">
                  <span class="fd-meta-label">Type</span>
                  <span class="type-badge" :class="'type-' + (selectedFile.type || 'unknown')">{{ selectedFile.type || '--' }}</span>
                </div>
                <div class="fd-meta-item">
                  <span class="fd-meta-label">Review</span>
                  <el-tag v-if="selectedFile.review_cycle" :type="reviewCycleTagType(selectedFile.review_cycle)" size="small">{{ selectedFile.review_cycle }}</el-tag>
                  <span v-else class="text-muted">--</span>
                </div>
                <div class="fd-meta-item">
                  <span class="fd-meta-label">Tacit</span>
                  <span v-if="selectedFile.tacit" class="fd-tacit-yes">Yes</span>
                  <span v-else class="text-muted">No</span>
                </div>
                <div class="fd-meta-item">
                  <span class="fd-meta-label">Stale</span>
                  <span v-if="isStaleFile(selectedFile)" class="fd-stale-yes">Yes</span>
                  <span v-else class="text-muted">No</span>
                </div>
                <div class="fd-meta-item">
                  <span class="fd-meta-label">Size</span>
                  <span class="fd-meta-value">{{ formatFileSize(selectedFile.size) }}</span>
                </div>
                <div class="fd-meta-item">
                  <span class="fd-meta-label">Updated</span>
                  <span class="fd-meta-value">{{ selectedFile.updated ? formatRelativeTime(selectedFile.updated) : '--' }}</span>
                </div>
              </div>
              <div class="fd-missing-strip" v-if="fileHealthIssues(selectedFile).length > 0">
                <span class="fd-missing-label">Needs Attention</span>
                <span
                  v-for="issue in fileHealthIssues(selectedFile)" :key="issue"
                  class="fd-missing-chip"
                  :class="{ 'fd-missing-chip-stale': issue === 'Stale' }"
                  @click="issue === 'Stale' ? setFilter('stale', 'true') : issue === 'Missing status' ? setQualityFilter('status') : issue === 'Missing type' ? setQualityFilter('type') : issue === 'Missing lifecycle' ? setQualityFilter('lifecycle') : issue === 'Missing review cycle' ? setQualityFilter('review_cycle') : issue === 'Missing roles' ? setQualityFilter('roles') : issue === 'Missing tags' ? setQualityFilter('tags') : issue === 'Missing benefit' ? setQualityFilter('benefit') : issue === 'Status: unknown' ? setFilter('status', 'unknown') : issue === 'Type: unknown' ? setFilter('type', 'unknown') : setFilter('lifecycle', 'unknown')"
                >{{ issue }}</span>
              </div>
              <div class="fd-module-context" v-if="sameModuleCount > 0">
                <span class="fd-context-item">
                  Module: <a class="fd-context-link" @click="navigateToModule(selectedFile!.category, selectedFile!.module)">{{ selectedFile!.module === '__root__' ? 'root' : selectedFile!.module }}</a>
                  <span class="fd-context-count">({{ sameModuleCount }} files)</span>
                </span>
                <span class="fd-context-sep" v-if="sameSubModuleCount > 0 && selectedFile!.sub_module !== '__root__'">|</span>
                <span class="fd-context-item" v-if="sameSubModuleCount > 0 && selectedFile!.sub_module !== '__root__'">
                  Sub: <a class="fd-context-link" @click="drillToSubdir(selectedFile!.sub_module)">{{ selectedFile!.sub_module }}</a>
                  <span class="fd-context-count">({{ sameSubModuleCount }} files)</span>
                </span>
              </div>
              <div class="fd-content-preview" v-if="showFileContent || fileContentLoading">
                <div class="fd-content-header fd-content-toggle" @click="showFileContent = !showFileContent">
                  <span class="fd-meta-label">Content Preview</span>
                  <span class="fd-content-toggle-hint">{{ showFileContent ? 'Hide' : 'Show' }}</span>
                </div>
                <div class="fd-content-body" v-show="showFileContent" v-loading="fileContentLoading">
                  <div v-if="fileContent" class="markdown-preview" v-html="renderWithHtml(fileContent.slice(0, 3000))"></div>
                  <div v-else-if="!fileContentLoading" class="text-muted fd-empty-content">File is empty or could not be loaded.</div>
                </div>
              </div>
              <div class="fd-benefit" v-if="selectedFile.benefit">
                <span class="fd-meta-label">Benefit</span>
                <span class="fd-benefit-text">{{ selectedFile.benefit }}</span>
              </div>
              <div class="fd-tags-row" v-if="(selectedFile.tags || []).length > 0">
                <span class="fd-meta-label">Tags</span>
                <span class="fd-tags">
                  <span v-for="t in selectedFile.tags" :key="t" class="tag-badge" @click="setFilter('tag', t)">{{ t }}</span>
                </span>
              </div>
              <div class="fd-tags-row" v-if="(selectedFile.roles || []).length > 0">
                <span class="fd-meta-label">Roles</span>
                <span class="fd-tags">
                  <span v-for="r in selectedFile.roles" :key="r" class="role-badge" @click="setFilter('role', r)">{{ r }}</span>
                </span>
              </div>
              <div class="fd-tags-row" v-if="resolvedRelatedFiles.length > 0">
                <span class="fd-meta-label">Related ({{ resolvedRelatedFiles.length }})</span>
                <span class="fd-tags">
                  <span v-for="rf in resolvedRelatedFiles" :key="rf.path" class="related-link" @click="openFilePreview(rf)" :title="rf.path">
                    {{ rf.title || rf.path.split('/').pop() }}
                  </span>
                </span>
              </div>
            </div>
            <div class="fd-actions">
              <el-button size="small" plain :icon="CopyDocument" v-copy="selectedFile.path">Copy path</el-button>
              <el-button size="small" plain @click="discussInAiChat(selectedFile)">Chat in aiChat</el-button>
              <el-button size="small" text @click="selectedFile = null">Close</el-button>
            </div>
          </div>

          <!-- Empty / No-results state -->
          <div class="empty-hint" v-if="(drillTableData.length === 0 && !contentSearchLoading) || (searchMode === 'title' && searchText && searchSuggestions.length === 0 && drillTableData.length === 0)">
            <el-icon><InfoFilled /></el-icon>
            <span v-if="searchText">No files match "{{ searchText }}"</span>
            <span v-else-if="hasActiveFilter">No files match the current filters</span>
            <span v-else>Select a category above or click a chart segment to drill down into files</span>
            <el-button v-if="hasActiveFilter" size="small" type="primary" plain @click="clearAllFilters">Clear filters</el-button>
          </div>
          <div class="empty-hint" v-if="searchMode === 'content' && searchText && !contentSearchLoading && contentSearchResults.length === 0">
            <el-icon><InfoFilled /></el-icon>
            <span>No content matches "{{ searchText }}"</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <KnowledgePreviewDialog ref="previewDialogRef" />
  </div>
</template>

<script setup lang="ts" name="knowledgeBase">
import { ref, computed } from "vue";
import { Refresh, Search, ArrowLeft, ArrowRight, Download, CopyDocument } from "@element-plus/icons-vue";
import type { KnowledgeFileSummary } from "@/api/interface/yiweb";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import ECharts from "@/components/ECharts/index.vue";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useKnowledgeBase } from "./composables/useKnowledgeBase";
import FilterPills from "./components/FilterPills.vue";
import DrillBreadcrumb from "./components/DrillBreadcrumb.vue";
import CategoryComparison from "./components/CategoryComparison.vue";
import CrossHeatmap from "./components/CrossHeatmap.vue";
import StaleRiskTimeline from "./components/StaleRiskTimeline.vue";
import CoverageGaps from "./components/CoverageGaps.vue";
import CategoryTree from "./components/CategoryTree.vue";
import TagCloud from "./components/TagCloud.vue";
import ReviewCompliance from "./components/ReviewCompliance.vue";
import KnowledgeGraphChart from "./components/KnowledgeGraphChart.vue";

const { renderWithHtml } = useMarkdown();
const kb = useKnowledgeBase();
const previewDialogRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

function openFileInDialog(row: KnowledgeFileSummary) {
  kb.openFileInDialog(row as KnowledgeFileSummary);
  previewDialogRef.value?.open(row.path);
}

function openFileDialog(path: string) {
  dialogFilePath.value = path;
  previewDialogRef.value?.open(path);
}

function navigateDialogFile(direction: "prev" | "next") {
  const target = direction === "prev" ? kb.prevDialogFile.value : kb.nextDialogFile.value;
  if (target) openFileInDialog(target);
}

// Destructure all template bindings
const {
  knowledgeData, loading, lastUpdated,
  activeFilter, activeSubCategory, drillView, viewMode, drillPage, drillPageSize,
  searchText, activeTimeFilter, dateFilterDay, browseAllFiles,
  searchMode, contentSearchResults, contentSearchLoading,
  selectedFile, showBenefitCol, fileViewMode,
  showSearchSuggestions, moduleDrillSearch, expandedModuleKeys, moduleTableRef,
  fileContent, fileContentLoading, showFileContent,
  recentlyViewed, drillDownRef, detailPanelRef,
  chartPulseKey, drillHighlight, pulsingCard,
  showCategoryComparison, showCrossHeatmap, showStaleRisk, showCoverageGaps,
  showTreeView, showTagCloud, showRoleCloud, showReviewCompliance, showKnowledgeGraph, showAttentionDetail,
  filterHistory, viewAttentionFiles,
  // cross-filter
  activeFilterPills, filterBreadcrumb, filteredDimensions, isDimensionFiltered,
  chartContextFiles,
  // computed
  hasActiveFilter, showSubModuleGrid, isShowingTreeView,
  topCategory, tacitPct, topRole, totalModules, recentWeekCount, recentWeekPct, stalePct, clientReviewCoveragePct,
  dataQualityScore, missingMetadataCount,
  qualityByCategory, worstCategories,
  needsAttentionFiles, unknownStatusFiles, clientMissingStats,
  attentionPct, totalMissingCount, totalUnknownCount, hasMissingItems, hasUnknownItems,
  statusCompletenessPct, typeCompletenessPct, lifecycleCompletenessPct,
  reviewCycleCompletenessPct, rolesCompletenessPct, tagsCompletenessPct,
  filteredModuleDrillData,
  subCategories, categoryReviewCoverage, categoryStaleCount, categoryTacitCount,
  moduleDetail, subdirectoryBreakdown, topModuleFiles,
  filteredFiles, drillTableData, sortedDrillTableData, paginatedDrillFiles,
  staleFiles, dayFiles, isTodayFilter, dateFilterLabel,
  selectedFileIndex, prevFile, nextFile, resolvedRelatedFiles,
  sameModuleCount, sameSubModuleCount,
  dialogFileIndex, prevDialogFile, nextDialogFile, dialogFilePath,
  drillSummary,
  enrichedSearchResults, searchSuggestions,
  categoryComparisonData, crossStatusLifecycle, staleRiskBuckets, coverageGapData,
  tagCounts, tagPairs, roleCounts, rolePairs,
  reviewComplianceData, statDeltas,
  categoryTreeData,
  reviewCycleDonutOption, typeBarOption, statusBarOption,
  sizeDistOption, fileAgeOption, lifecycleBarOption,
  moduleBarOption, rolesBarOption, categoryBarOption, tagsBarOption,
  metadataCompletenessOption, tacitDonutOption,
  formatNumber, formatFileSize, formatRelativeTime, highlightSnippet,
  isStaleFile, fileHealthLevel, fileHealthIssues, getModuleClassSummary,
  isMissingField, isUnknownField, normalizeMetaValue, MISSING_LABEL,
  catColor, statusColor, statusTagType, lifecycleColor, lifecycleTagType, reviewCycleTagType,
  dataQualityColor,
  qualityCardClass,
  setFilter, removeFilter, undoLastFilter, selectTreeNode,
  pulseCard, toggleNoReviewFilter, setQualityFilter,
  backToCategory, clearAllFilters, showAllAttentionFiles,
  drillToModule, drillToSubdir, drillFromModule, onModuleExpandChange,
  navigateToModule, crossFilterSubModule,
  onTimeFilterChange, onTableSortChange, scrollToDrillDown,
  goToPrevDay, goToNextDay, goToTodayFilter, clearDateFilter,
  openFilePreview, clearRecentlyViewed,
  navigateToFile, resolveRelatedNames, getModuleStats,
  discussInAiChat, discussSearchResult, deleteFile, fixMetadataWithAgent,
  exportCSV, onSearchInput, onChartClick, onDetailKeydown, fetchData,
} = kb;

// Category list for the file-classification sidebar
const categories = computed(() =>
  [...(knowledgeData.value?.categories ?? [])].sort((a, b) => b.count - a.count)
);
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>