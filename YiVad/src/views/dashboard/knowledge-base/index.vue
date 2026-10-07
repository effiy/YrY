<template>
  <div class="knowledge-base-box page" v-loading="loading">
    <!-- Header -->
    <header class="kb-header">
      <div class="kb-header-left">
        <h1 class="kb-title">Knowledge Base</h1>
        <div class="kb-updated-group">
          <span class="kb-updated" v-if="lastUpdated">
            <span class="kb-live-dot" :class="{ 'is-live': autoRefresh.isActive.value }"></span>
            Fetched {{ lastUpdated }}
          </span>
          <span class="kb-updated kb-updated-scan" v-if="knowledgeData?.last_scan_time">
            <span class="kb-scan-icon">⟳</span>
            Synced {{ formatRelativeTime(knowledgeData.last_scan_time) }}
          </span>
        </div>
      </div>
      <div class="kb-header-actions">
        <el-switch v-model="autoRefresh.isActive.value" active-text="Auto" size="small" />
        <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
      </div>
    </header>

    <!-- Filter Pills (always visible) -->
    <FilterPills
      v-if="hasActiveFilter"
      :pills="activeFilterPills"
      :has-active-filter="hasActiveFilter"
      :can-undo="filterHistory.length > 0"
      @remove="(key: string) => removeFilter(key)"
      @clear-all="clearAllFilters"
      @undo="undoLastFilter"
    />

    <!-- Tabbed Content -->
    <el-tabs v-model="activeTab" type="border-card" class="kb-tabs">
      <!-- Tab 1: Overview -->
      <el-tab-pane label="Overview" name="overview">
        <!-- Stat Cards -->
        <el-row :gutter="16" class="stat-row">
          <el-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6">
            <StatCard
              label="Total Files"
              :value="statDeltas ? statDeltas.total.filtered : (knowledgeData?.total ?? 0)"
              :sub="topCategory ? `Top: ${topCategory}` : undefined"
              :icon="Document"
              icon-bg="linear-gradient(135deg, #5470c6, #4460b0)"
              :trend="trendDeltas?.total ?? undefined"
              @click="clearAllFilters()"
            />
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6">
            <StatCard
              label="Categories"
              :value="knowledgeData?.categories.length ?? 0"
              :sub="`${totalModules} modules`"
              :icon="Folder"
              icon-bg="linear-gradient(135deg, #91cc75, #7ab85e)"
              :trend="trendDeltas?.categories ?? undefined"
              @click="activeTab = 'browse'"
            />
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6">
            <StatCard
              label="Review Coverage"
              :value="`${clientReviewCoveragePct}%`"
              :sub="`${clientMissingStats.no_review_cycle} missing`"
              :icon="TrendCharts"
              icon-bg="linear-gradient(135deg, #5470c6, #73c0de)"
              :trend="trendDeltas?.coverage ?? undefined"
              @click="toggleNoReviewFilter()"
            />
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6">
            <StatCard
              label="Data Quality"
              :value="`${dataQualityScore}%`"
              :sub="`${missingMetadataCount} incomplete`"
              :icon="DataAnalysis"
              icon-bg="linear-gradient(135deg, #fac858, #e0b040)"
              :variant="dataQualityScore < 50 ? 'danger' : dataQualityScore < 80 ? 'warn' : 'default'"
              :trend="trendDeltas?.quality ?? undefined"
              @click="setQualityFilter('status')"
            />
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6">
            <StatCard
              label="Active This Week"
              :value="recentWeekCount"
              :sub="`${recentWeekPct}% of total`"
              :icon="Timer"
              icon-bg="linear-gradient(135deg, #67c23a, #4a9e1e)"
              :trend="trendDeltas?.recentWeek ?? undefined"
              @click="onTimeFilterChange('week')"
            />
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6">
            <StatCard
              label="Stale"
              :value="statDeltas ? statDeltas.stale.filtered : (knowledgeData?.health.stale_count ?? 0)"
              :sub="`${stalePct}% of total` + (knowledgeData?.health.unmaintained_count ? ` · ${knowledgeData.health.unmaintained_count} unmaintained` : '') + (knowledgeData?.health.orphan_count ? ` · ${knowledgeData.health.orphan_count} orphan` : '')"
              :icon="WarningFilled"
              icon-bg="linear-gradient(135deg, #ee6666, #da5a5a)"
              :variant="(knowledgeData?.health.stale_count ?? 0) > 0 || (knowledgeData?.health.orphan_count ?? 0) > 0 ? 'danger' : 'default'"
              :trend="trendDeltas?.stale ?? undefined"
              @click="setFilter('stale', 'true')"
            />
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6">
            <StatCard
              label="Tacit"
              :value="knowledgeData?.health.tacit_count ?? 0"
              :sub="`${tacitPct}% of total`"
              :icon="Star"
              icon-bg="linear-gradient(135deg, #9a60b4, #7a40a0)"
              :trend="trendDeltas?.tacit ?? undefined"
              @click="setFilter('tacit', 'true')"
            />
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="6" :xl="6">
            <StatCard
              label="Top Role"
              :value="topRole"
              :icon="Cpu"
              icon-bg="linear-gradient(135deg, #fc8452, #e07030)"
              @click="setFilter('role', topRole)"
            />
          </el-col>
        </el-row>

        <!-- Health & Quality Quick View -->
        <el-row :gutter="16" class="section-row">
          <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <div class="chart-box">
              <div class="chart-title">Review Cycle</div>
              <div class="chart-body"><ECharts :option="reviewCycleDonutOption" height="260" @chart-click="(p:any) => onChartClick('review_cycle', p)" /></div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <div class="chart-box">
              <div class="chart-title">Top Categories</div>
              <div class="chart-body"><ECharts :option="categoryBarOption" height="260" @chart-click="(p:any) => onChartClick('category', p)" /></div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
            <div class="chart-box">
              <div class="chart-title">Recent Activity</div>
              <div class="recent-files-list">
                <div v-for="rf in (knowledgeData?.recent ?? []).slice(0, 8)" :key="rf.path" class="rf-item" @click="openFileDialog(rf.path)">
                  <span class="rf-title">{{ rf.title || rf.path.split('/').pop() }}</span>
                  <span class="rf-cat" :style="{ color: catColor(rf.category) }">{{ rf.category }}</span>
                  <span class="rf-path">{{ rf.path }}</span>
                  <span class="rf-updated">{{ rf.updated ? formatRelativeTime(rf.updated) : '' }}</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- Needs Attention Quick Alert -->
        <div v-if="needsAttentionFiles.length > 0" class="attention-alert">
          <el-icon :size="18"><WarningFilled /></el-icon>
          <span>{{ needsAttentionFiles.length }} files need attention</span>
          <el-button size="small" type="warning" plain @click="activeTab = 'quality'">Review</el-button>
        </div>

        <!-- File Alerts Summary (cross-domain) -->
        <div v-if="fileAlerts?.alerts.length" class="alerts-strip">
          <div class="alerts-strip__header">
            <el-icon :size="14"><WarningFilled /></el-icon>
            <span>Alerts</span>
            <span class="alerts-strip__total">{{ fileAlerts.summary.total }}</span>
          </div>
          <div class="alerts-strip__items">
            <span v-if="fileAlerts.summary.critical" class="alerts-chip alerts-chip--critical">
              {{ fileAlerts.summary.critical }} critical
            </span>
            <span v-if="fileAlerts.summary.warning" class="alerts-chip alerts-chip--warning">
              {{ fileAlerts.summary.warning }} warning
            </span>
            <span
v-for="a in fileAlerts.alerts.slice(0, 3)" :key="a.title"
              class="alerts-chip" :class="`alerts-chip--${a.severity}`"
            >
              {{ a.domain }}: {{ a.title }}
            </span>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: Quality -->
      <el-tab-pane label="Quality" name="quality">
        <DataQualityPanel
          :status-completeness-pct="statusCompletenessPct"
          :type-completeness-pct="typeCompletenessPct"
          :lifecycle-completeness-pct="lifecycleCompletenessPct"
          :review-cycle-completeness-pct="reviewCycleCompletenessPct"
          :roles-completeness-pct="rolesCompletenessPct"
          :tags-completeness-pct="tagsCompletenessPct"
          :data-quality-score="dataQualityScore"
          :client-missing-stats="clientMissingStats"
          :worst-categories="worstCategories"
          :quality-card-class="qualityCardClass"
          :data-quality-color="dataQualityColor"
          :cat-color="catColor"
          @set-quality-filter="setQualityFilter"
          @set-filter="setFilter"
          @fix-metadata-with-agent="fixMetadataWithAgent"
        />

        <AttentionSummary
          v-if="needsAttentionFiles.length > 0"
          :needs-attention-files="needsAttentionFiles"
          :attention-pct="attentionPct"
          :total-missing-count="totalMissingCount"
          :total-unknown-count="totalUnknownCount"
          :has-missing-items="hasMissingItems"
          :has-unknown-items="hasUnknownItems"
          :client-missing-stats="clientMissingStats"
          :show-attention-detail="showAttentionDetail"
          @toggle-detail="showAttentionDetail = !showAttentionDetail"
          @show-all-attention-files="showAllAttentionFiles"
          @set-quality-filter="setQualityFilter"
          @set-filter="setFilter"
        />

        <el-row :gutter="16" class="section-row">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <ReviewCompliance
              :data="reviewComplianceData"
              @select-cycle="(cycle: string) => setFilter('review_cycle', cycle)"
            />
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <CoverageGaps
              :data="coverageGapData"
              @drill-gap="(cat: string, mod: string, field: string) => { setFilter('category', cat); setFilter('module', mod); setQualityFilter(field); }"
            />
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- Tab 3: Analytics -->
      <el-tab-pane label="Analytics" name="analytics">
        <AnalyticsCharts
          :review-cycle-donut-option="reviewCycleDonutOption"
          :status-bar-option="statusBarOption"
          :type-bar-option="typeBarOption"
          :lifecycle-bar-option="lifecycleBarOption"
          :module-bar-option="moduleBarOption"
          :roles-bar-option="rolesBarOption"
          :size-dist-option="sizeDistOption"
          :file-age-option="fileAgeOption"
          :category-bar-option="categoryBarOption"
          :tags-bar-option="tagsBarOption"
          :is-dimension-filtered="isDimensionFiltered"
          :chart-context-files="chartContextFiles"
          @chart-click="onChartClick"
        />

        <el-row :gutter="16" class="section-row">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <div class="chart-box">
              <div class="chart-title">Status &times; Lifecycle Heatmap</div>
              <div class="chart-body">
                <CrossHeatmap
                  :data="crossStatusLifecycle"
                  @cell-click="(status: string, lifecycle: string) => { setFilter('status', status); setFilter('lifecycle', lifecycle); activeTab = 'browse'; }"
                />
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <div class="chart-box">
              <div class="chart-title">Category Comparison</div>
              <div class="chart-body">
                <CategoryComparison
                  :data="categoryComparisonData"
                  :active-category="activeFilter.category || ''"
                  @select-category="(name: string) => { setFilter('category', name); activeTab = 'browse'; }"
                />
              </div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="16" class="section-row">
          <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <StaleRiskTimeline
              :buckets="staleRiskBuckets"
              @filter-files="(files: any) => { clearAllFilters(); files.forEach((f: any) => setFilter('stale', 'true')); activeTab = 'browse'; }"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <div class="chart-box">
              <div class="chart-title">Tag Cloud</div>
              <div class="chart-body">
                <TagCloud
                  title="Top Tags"
                  :tags="tagCounts"
                  :pairs="tagPairs"
                  @select-tag="(name: string) => { setFilter('tag', name); activeTab = 'browse'; }"
                />
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
            <div class="chart-box">
              <div class="chart-title">Role Cloud</div>
              <div class="chart-body">
                <TagCloud
                  title="Top Roles"
                  :tags="roleCounts"
                  :pairs="rolePairs"
                  :color-fn="(name: string) => '#fc8452'"
                  @select-tag="(name: string) => { setFilter('role', name); activeTab = 'browse'; }"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- Tab 4: Browse -->
      <el-tab-pane label="Browse" name="browse">
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
                  v-for="cat in categories"
                  :key="cat.name"
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
              <!-- Breadcrumb -->
              <DrillBreadcrumb
                :segments="filterBreadcrumb"
                :has-active-filter="hasActiveFilter"
                :active-dimensions="activeFilterPills.filter((p: any) => !['category', 'module', 'sub_module'].includes(p.key))"
                @clear-all="clearAllFilters"
                @back-to-category="backToCategory"
                @remove-filter="(key: string) => removeFilter(key)"
              />

              <!-- Recently viewed -->
              <div v-if="recentlyViewed.length" class="kb-recent-strip">
                <span class="kb-recent-strip__label">Recently viewed</span>
                <button
                  v-for="f in recentlyViewed"
                  :key="f.path"
                  class="kb-recent-strip__chip"
                  :title="f.path"
                  @click="openFilePreview(f)"
                >
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
                      v-model="searchText"
                      :placeholder="searchMode === 'content' ? 'Search content...' : 'Ctrl+K search...'"
                      size="small"
                      clearable
                      class="search-input"
                      :prefix-icon="Search"
                      @input="onSearchInput"
                      @focus="showSearchSuggestions = true"
                      @blur="showSearchSuggestions = false"
                    />
                    <div class="search-suggestions" v-if="showSearchSuggestions && searchSuggestions.length > 0 && searchMode === 'title'">
                      <div v-for="s in searchSuggestions" :key="s.path" class="ss-item" @mousedown.prevent="openFileInDialog(s)">
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
                  <el-button size="small" type="warning" plain @click="clearAllFilters()">Clear & return</el-button>
                </div>
              </div>

              <!-- Module Classification View -->
              <div class="module-classification-view" v-if="viewMode === 'modules' && searchMode === 'title' && !searchText">
                <div class="mcv-header">
                  <span class="mcv-title">Module Classification ({{ totalModules }} modules, {{ knowledgeData?.total ?? 0 }} files)</span>
                  <div class="mcv-header-actions">
                    <el-input v-model="moduleDrillSearch" size="small" placeholder="Filter modules..." clearable class="search-input" :prefix-icon="Search" />
                    <el-button size="small" text @click="showTreeView = !showTreeView" :type="showTreeView ? 'primary' : ''">
                      {{ showTreeView ? "Table" : "Tree" }}
                    </el-button>
                    <el-button size="small" text @click="viewMode = 'files'">File table view &rarr;</el-button>
                  </div>
                </div>
                <CategoryTree v-if="showTreeView" :data="categoryTreeData" :active-category="activeFilter.category || ''" @select-node="(cat: string, mod?: string, sub?: string) => selectTreeNode(cat, mod, sub)" />
                <el-table v-if="!showTreeView" ref="moduleTableRef" :data="filteredModuleDrillData" row-key="key" size="small" :expand-row-keys="expandedModuleKeys" @expand-change="onModuleExpandChange" :default-sort="{ prop: 'count', order: 'descending' }" stripe>
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
                              <span class="type-badge" :class="'type-' + (f.type || 'unknown')" @click="setFilter('type', f.type)">{{ f.type || "--" }}</span>
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
                            <template #default="{ row: f }">{{ f.size ? formatFileSize(f.size) : "--" }}</template>
                          </el-table-column>
                          <el-table-column label="Updated" width="100">
                            <template #default="{ row: f }">{{ f.updated ? formatRelativeTime(f.updated) : "--" }}</template>
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

              <!-- Content Search Results -->
              <div v-loading="contentSearchLoading" class="content-search-results" v-if="searchMode === 'content' && searchText">
                <div class="csr-header">Found {{ contentSearchResults.length }} files matching "{{ searchText }}"</div>
                <div v-for="r in enrichedSearchResults" :key="r.path" class="csr-item" @click="openFileDialog(r.path)">
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
                <!-- Gallery -->
                <div class="file-gallery" v-if="fileViewMode === 'gallery'">
                  <div v-for="f in paginatedDrillFiles" :key="f.path" class="fg-card" @click="openFileInDialog(f as KnowledgeFileSummary)">
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
                <!-- Table -->
                <el-table v-else :data="paginatedDrillFiles" stripe size="small" highlight-current-row @row-click="openFileInDialog" @sort-change="onTableSortChange">
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
                                <span v-if="i === 0" class="path-seg" @click.stop="setFilter('category', seg)">{{ seg }}</span>
                                <span v-else-if="i === 1 && !seg.endsWith('.md')" class="path-seg">
                                  <span @click.stop="setFilter('module', seg)">{{ seg }}</span>
                                </span>
                                <span v-else-if="i === 2 && !seg.endsWith('.md')" class="path-seg" @click.stop="setFilter('sub_module', seg)">{{ seg }}</span>
                                <span v-else class="path-seg-file">{{ seg }}</span>
                              </span>
                            </span>
                          </div>
                        </template>
                        <div class="popover-content">
                          <div><b>Path:</b> {{ row.path }}</div>
                          <div><b>Category:</b> {{ row.category }} &middot; <b>Module:</b> {{ row.module === '__root__' ? 'root' : row.module }}</div>
                          <div><b>Status:</b> {{ row.status }} &middot; <b>Lifecycle:</b> {{ row.lifecycle }} &middot; <b>Type:</b> {{ row.type }}</div>
                          <div v-if="row.review_cycle"><b>Review:</b> {{ row.review_cycle }}</div>
                          <div v-if="row.tacit"><b>Tacit:</b> <span class="popover-tacit">Yes</span></div>
                          <div v-if="isStaleFile(row as KnowledgeFileSummary)"><b>Stale:</b> <span class="popover-stale">Yes</span></div>
                          <div v-if="row.benefit"><b>Benefit:</b> <span class="popover-benefit">{{ row.benefit.slice(0, 100) }}{{ row.benefit.length > 100 ? '...' : '' }}</span></div>
                          <div v-if="row.related_count > 0"><b>Related:</b> {{ row.related_count }} files</div>
                          <div v-if="(row.roles || []).length > 0"><b>Roles:</b> {{ (row.roles || []).join(', ') }}</div>
                          <div v-if="(row.tags || []).length > 0"><b>Tags:</b> {{ (row.tags || []).join(', ') }}</div>
                          <div><b>Size:</b> {{ formatFileSize(row.size) }} &middot; <b>Updated:</b> {{ row.updated ? formatRelativeTime(row.updated) : '--' }}</div>
                          <div v-if="row.created"><b>Created:</b> {{ formatRelativeTime(row.created) }}</div>
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
                  <el-table-column prop="status" label="Status" width="100" sortable="custom">
                    <template #default="{ row }">
                      <el-tag v-if="isMissingField(row.status)" type="danger" size="small" @click.stop="setQualityFilter('status')" class="table-tag-clickable">Missing</el-tag>
                      <el-tag v-else :type="statusTagType(row.status)" size="small" @click.stop="setFilter('status', row.status || 'unknown')" class="table-tag-clickable">{{ row.status || 'unknown' }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="lifecycle" label="Lifecycle" width="100" sortable="custom">
                    <template #default="{ row }">
                      <el-tag v-if="isMissingField(row.lifecycle)" type="danger" size="small" @click.stop="setQualityFilter('lifecycle')" class="table-tag-clickable">Missing</el-tag>
                      <el-tag v-else-if="row.lifecycle && row.lifecycle !== 'unknown'" :type="lifecycleTagType(row.lifecycle)" size="small" @click.stop="setFilter('lifecycle', row.lifecycle)" class="table-tag-clickable">{{ row.lifecycle }}</el-tag>
                      <el-tag v-else-if="row.lifecycle === 'unknown'" type="info" size="small" @click.stop="setFilter('lifecycle', 'unknown')" class="table-tag-clickable">unknown</el-tag>
                      <span v-else class="text-muted">--</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="review_cycle" label="Review" width="140" sortable="custom">
                    <template #default="{ row }">
                      <el-tag v-if="row.review_cycle" :type="reviewCycleTagType(row.review_cycle)" size="small" @click.stop="setFilter('review_cycle', row.review_cycle)" class="table-tag-clickable">{{ row.review_cycle }}</el-tag>
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
                  <el-table-column label="Actions" width="90" align="center" fixed="right">
                    <template #default="{ row }">
                      <el-button size="small" text type="danger" @click.stop="deleteFile(row)"><el-icon><Delete /></el-icon></el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <div class="table-footer" v-if="drillTableData.length > drillPageSize">
                  <span class="table-footer-info">Page {{ drillPage }} of {{ Math.ceil(drillTableData.length / drillPageSize) }} ({{ drillTableData.length }} files)</span>
                  <el-pagination v-model:current-page="drillPage" :page-size="drillPageSize" :total="drillTableData.length" layout="prev, pager, next" size="small" background />
                </div>
              </template>

              <!-- File Detail Panel -->
              <div v-if="selectedFile" class="file-detail-panel" @keydown="onDetailKeydown" tabindex="0" ref="detailPanelRef">
                <div class="fd-header">
                  <div class="fd-header-left">
                    <el-button size="small" text :disabled="!prevFile" @click="navigateToFile(prevFile!)" title="Previous file"><el-icon><ArrowLeft /></el-icon></el-button>
                    <span class="fd-position" v-if="selectedFileIndex >= 0">{{ selectedFileIndex + 1 }}/{{ sortedDrillTableData.length }}</span>
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
                      <span class="fd-meta-label">Created</span>
                      <span class="fd-meta-value">{{ selectedFile.created ? formatRelativeTime(selectedFile.created) : '--' }}</span>
                    </div>
                    <div class="fd-meta-item">
                      <span class="fd-meta-label">Updated</span>
                      <span class="fd-meta-value">{{ selectedFile.updated ? formatRelativeTime(selectedFile.updated) : '--' }}</span>
                    </div>
                  </div>
                  <div class="fd-missing-strip" v-if="fileHealthIssues(selectedFile).length > 0">
                    <span class="fd-missing-label">Needs Attention</span>
                    <span v-for="issue in fileHealthIssues(selectedFile)" :key="issue" class="fd-missing-chip" :class="{ 'fd-missing-chip-stale': issue === 'Stale' }" @click="issue === 'Stale' ? setFilter('stale', 'true') : issue === 'Missing status' ? setQualityFilter('status') : issue === 'Missing type' ? setQualityFilter('type') : issue === 'Missing lifecycle' ? setQualityFilter('lifecycle') : issue === 'Missing review cycle' ? setQualityFilter('review_cycle') : issue === 'Missing roles' ? setQualityFilter('roles') : issue === 'Missing tags' ? setQualityFilter('tags') : issue === 'Missing benefit' ? setQualityFilter('benefit') : setFilter('lifecycle', 'unknown')">{{ issue }}</span>
                  </div>
                  <div class="fd-module-context" v-if="sameModuleCount > 0">
                    <span class="fd-context-item">Module: <a class="fd-context-link" @click="navigateToModule(selectedFile!.category, selectedFile!.module)">{{ selectedFile!.module === '__root__' ? 'root' : selectedFile!.module }}</a><span class="fd-context-count"> ({{ sameModuleCount }} files)</span></span>
                  </div>
                  <div class="fd-content-preview" v-if="!fileContentLoading && selectedFile.snippet">
                    <div class="fd-content-header">
                      <span class="fd-meta-label">Snippet</span>
                    </div>
                    <div class="fd-content-body">
                      <div class="markdown-preview" v-html="renderWithHtml(selectedFile.snippet)"></div>
                    </div>
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
                    <span class="fd-tags"><span v-for="t in selectedFile.tags" :key="t" class="tag-badge" @click="setFilter('tag', t)">{{ t }}</span></span>
                  </div>
                  <div class="fd-tags-row" v-if="(selectedFile.roles || []).length > 0">
                    <span class="fd-meta-label">Roles</span>
                    <span class="fd-tags"><span v-for="r in selectedFile.roles" :key="r" class="role-badge" @click="setFilter('role', r)">{{ r }}</span></span>
                  </div>
                </div>
                <div class="fd-actions">
                  <el-button size="small" plain :icon="CopyDocument" v-copy="selectedFile.path">Copy path</el-button>
                  <el-button size="small" plain @click="discussInAiChat(selectedFile)">Chat in aiChat</el-button>
                  <el-button size="small" text @click="selectedFile = null">Close</el-button>
                </div>
              </div>

              <!-- Empty State -->
              <div class="empty-hint" v-if="(drillTableData.length === 0 && !contentSearchLoading) || (searchMode === 'title' && searchText && searchSuggestions.length === 0 && drillTableData.length === 0)">
                <el-icon><InfoFilled /></el-icon>
                <span v-if="searchText">No files match "{{ searchText }}"</span>
                <span v-else-if="hasActiveFilter">No files match the current filters</span>
                <span v-else>Select a category or click a chart segment to drill down</span>
                <el-button v-if="hasActiveFilter" size="small" type="primary" plain @click="clearAllFilters">Clear filters</el-button>
              </div>
              <div class="empty-hint" v-if="searchMode === 'content' && searchText && !contentSearchLoading && contentSearchResults.length === 0">
                <el-icon><InfoFilled /></el-icon>
                <span>No content matches "{{ searchText }}"</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <KnowledgePreviewDialog ref="previewDialogRef" />
  </div>
</template>

<script setup lang="ts" name="knowledgeBase">
import { ref, computed } from "vue";
import { Refresh, Search, ArrowLeft, ArrowRight, Download, CopyDocument, Document, Folder, Cpu, Timer, TrendCharts, DataAnalysis, Star, WarningFilled, Delete, View, Close, InfoFilled } from "@element-plus/icons-vue";
import type { KnowledgeFileSummary } from "@/api/interface/yiAi";
import ECharts from "@/components/ECharts/index.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useKnowledgeBase } from "./composables/useKnowledgeBase";
import StatCard from "./components/StatCard.vue";
import FilterPills from "./components/FilterPills.vue";
import DataQualityPanel from "./components/DataQualityPanel.vue";
import AttentionSummary from "./components/AttentionSummary.vue";
import AnalyticsCharts from "./components/AnalyticsCharts.vue";
import DrillBreadcrumb from "./components/DrillBreadcrumb.vue";
import CategoryComparison from "./components/CategoryComparison.vue";
import CrossHeatmap from "./components/CrossHeatmap.vue";
import StaleRiskTimeline from "./components/StaleRiskTimeline.vue";
import CoverageGaps from "./components/CoverageGaps.vue";
import CategoryTree from "./components/CategoryTree.vue";
import TagCloud from "./components/TagCloud.vue";
import ReviewCompliance from "./components/ReviewCompliance.vue";

const { renderWithHtml } = useMarkdown();
const kb = useKnowledgeBase();
const previewDialogRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

function openFileInDialog(row: KnowledgeFileSummary) {
  kb.openFileInDialog(row as KnowledgeFileSummary);
  previewDialogRef.value?.open(row.path);
}

function openFileDialog(path: string) {
  kb.dialogFilePath.value = path;
  previewDialogRef.value?.open(path);
}

// Destructure all template bindings
const {
  knowledgeData, fileAlerts, loading, lastUpdated,
  activeFilter, activeSubCategory, drillView, viewMode, drillPage, drillPageSize,
  searchText, activeTimeFilter, dateFilterDay, searchMode,
  contentSearchResults, contentSearchLoading,
  selectedFile, fileViewMode, showSearchSuggestions,
  moduleDrillSearch, expandedModuleKeys, moduleTableRef,
  fileContent, fileContentLoading, showFileContent,
  recentlyViewed, drillDownRef, detailPanelRef,
  drillHighlight, showAttentionDetail, filterHistory,
  viewAttentionFiles,
  activeFilterPills, filterBreadcrumb, filteredDimensions, isDimensionFiltered,
  chartContextFiles, hasActiveFilter, showTreeView,
  topCategory, tacitPct, topRole, totalModules,
  recentWeekCount, recentWeekPct, stalePct,
  clientReviewCoveragePct, dataQualityScore, missingMetadataCount,
  worstCategories, needsAttentionFiles,
  clientMissingStats, attentionPct, totalMissingCount, totalUnknownCount,
  hasMissingItems, hasUnknownItems,
  statusCompletenessPct, typeCompletenessPct, lifecycleCompletenessPct,
  reviewCycleCompletenessPct, rolesCompletenessPct, tagsCompletenessPct,
  filteredModuleDrillData, categoryTreeData,
  drillTableData, sortedDrillTableData, paginatedDrillFiles,
  staleFiles, dayFiles, dateFilterLabel,
  selectedFileIndex, prevFile, nextFile, resolvedRelatedFiles,
  sameModuleCount, sameSubModuleCount, dialogFilePath,
  enrichedSearchResults, searchSuggestions,
  categoryComparisonData, crossStatusLifecycle,
  staleRiskBuckets, coverageGapData,
  tagCounts, tagPairs, roleCounts, rolePairs,
  reviewComplianceData, statDeltas, trendDeltas,
  reviewCycleDonutOption, typeBarOption, statusBarOption,
  sizeDistOption, fileAgeOption, lifecycleBarOption,
  moduleBarOption, rolesBarOption, categoryBarOption, tagsBarOption,
  formatNumber, formatFileSize, formatRelativeTime, highlightSnippet,
  isStaleFile, fileHealthLevel, fileHealthIssues,
  getModuleClassSummary, isMissingField,
  catColor, statusColor, statusTagType,
  lifecycleColor, lifecycleTagType, reviewCycleTagType,
  dataQualityColor, qualityCardClass,
  activeTab, autoRefresh,
  setFilter, removeFilter, undoLastFilter, selectTreeNode,
  toggleNoReviewFilter, setQualityFilter, backToCategory,
  clearAllFilters, showAllAttentionFiles,
  drillFromModule, onModuleExpandChange, navigateToModule,
  onTimeFilterChange, onTableSortChange,
  goToPrevDay, goToNextDay, goToTodayFilter, clearDateFilter,
  openFilePreview, clearRecentlyViewed, navigateToFile,
  getModuleStats, discussInAiChat, discussSearchResult,
  deleteFile, fixMetadataWithAgent, exportCSV,
  onSearchInput, onChartClick, onDetailKeydown, fetchData,
  drillToSubdir
} = kb;

const categories = computed(() => [...(knowledgeData.value?.categories ?? [])].sort((a, b) => b.count - a.count));
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>