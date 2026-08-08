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
      <el-row :gutter="12">
        <el-col class="mb12" :xs="12" :sm="6" :md="6" :lg="3" :xl="3">
          <div class="stat-card stat-total" @click="clearAllFilters">
            <div class="stat-icon"><el-icon><Document /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(knowledgeData?.total ?? 0) }}</div>
              <div class="stat-label">Total Files</div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="6" :md="6" :lg="3" :xl="3">
          <div class="stat-card stat-categories" @click="scrollToDrillDown">
            <div class="stat-icon"><el-icon><Folder /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ knowledgeData?.categories.length ?? 0 }}</div>
              <div class="stat-label">Categories <span class="stat-sub">({{ topCategory }})</span></div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="6" :md="6" :lg="3" :xl="3">
          <div class="stat-card stat-modules" @click="scrollToDrillDown">
            <div class="stat-icon"><el-icon><Cpu /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ totalModules }}</div>
              <div class="stat-label">Modules</div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="6" :md="6" :lg="3" :xl="3">
          <div class="stat-card stat-coverage" @click="toggleNoReviewFilter">
            <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ knowledgeData?.health.review_coverage_pct ?? 0 }}%</div>
              <div class="stat-label">Review Coverage <span class="stat-sub">({{ knowledgeData?.health.no_review_cycle_count ?? 0 }} missing)</span></div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="6" :md="6" :lg="3" :xl="3">
          <div class="stat-card stat-tacit" @click="setFilter('tacit', 'true')">
            <div class="stat-icon"><el-icon><Star /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ knowledgeData?.health.tacit_count ?? 0 }}</div>
              <div class="stat-label">Tacit <span class="stat-sub">({{ tacitPct }}%)</span></div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="6" :md="6" :lg="3" :xl="3">
          <div
            class="stat-card"
            :class="(knowledgeData?.health.stale_count ?? 0) > 0 ? 'stat-stale' : 'stat-healthy'"
            @click="setFilter('stale', 'true')"
          >
            <div class="stat-icon"><el-icon><WarningFilled /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ knowledgeData?.health.stale_count ?? 0 }}</div>
              <div class="stat-label">Stale</div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="6" :md="6" :lg="3" :xl="3">
          <div class="stat-card stat-total-size" @click="scrollToDrillDown">
            <div class="stat-icon"><el-icon><Coin /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ totalSizeFormatted }}</div>
              <div class="stat-label">Total Size</div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="6" :md="6" :lg="3" :xl="3">
          <div class="stat-card stat-roles" @click="scrollToDrillDown">
            <div class="stat-icon"><el-icon><User /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ knowledgeData?.roles.length ?? 0 }}</div>
              <div class="stat-label">Roles <span class="stat-sub">({{ topRole }})</span></div>
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
          <div class="chart-box">
            <div class="chart-title">Review Cycle</div>
            <div class="chart-body"><ECharts :option="reviewCycleDonutOption" height="220" @chart-click="onChartClick('review_cycle', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box">
            <div class="chart-title">Status</div>
            <div class="chart-body"><ECharts :option="statusBarOption" height="220" @chart-click="onChartClick('status', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box">
            <div class="chart-title">Type</div>
            <div class="chart-body"><ECharts :option="typeBarOption" height="220" @chart-click="onChartClick('type', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box">
            <div class="chart-title">Lifecycle</div>
            <div class="chart-body"><ECharts :option="lifecycleBarOption" height="220" @chart-click="onChartClick('lifecycle', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box">
            <div class="chart-title">Top Modules</div>
            <div class="chart-body"><ECharts :option="moduleBarOption" height="220" @chart-click="onChartClick('module', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box">
            <div class="chart-title">Roles</div>
            <div class="chart-body"><ECharts :option="rolesBarOption" height="220" @chart-click="onChartClick('role', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box">
            <div class="chart-title">File Size</div>
            <div class="chart-body"><ECharts :option="sizeDistOption" height="220" @chart-click="onChartClick('size', $event)" /></div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <div class="chart-box">
            <div class="chart-title">File Age</div>
            <div class="chart-body"><ECharts :option="fileAgeOption" height="220" @chart-click="onChartClick('age', $event)" /></div>
          </div>
        </el-col>
      </el-row>
    </div>
    <!-- Main Row: Full-width drill-down tree + file preview -->
    <el-row :gutter="12" class="main-row">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="main-col-full">
        <div class="card drill-down-box" ref="drillDownRef">
          <!-- Panel Header -->
          <div class="panel-header">
            <span class="panel-title">
              File Classification
              <span class="panel-count">({{ knowledgeData?.total ?? 0 }} files)</span>
            </span>
            <div class="panel-actions">
              <span class="panel-nav-info">{{ dialogFileIndex + 1 }}/{{ sortedDrillTableData.length }}</span>
              <el-button size="small" text :disabled="!prevDialogFile" @click="navigateDialogFile('prev')" title="Previous file"><el-icon><ArrowLeft /></el-icon></el-button>
              <el-button size="small" text :disabled="!nextDialogFile" @click="navigateDialogFile('next')" title="Next file"><el-icon><ArrowRight /></el-icon></el-button>
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
            </div>
          </div>

          <!-- Module Classification Table -->
          <div class="module-classification-view" v-if="viewMode === 'modules' && searchMode === 'title' && !searchText">
            <div class="mcv-header">
              <span class="mcv-title">Module Classification ({{ totalModules }} modules, {{ knowledgeData?.total ?? 0 }} files)</span>
              <div class="mcv-header-actions">
                <el-input v-model="moduleDrillSearch" size="small" placeholder="Filter modules..." clearable class="search-input" :prefix-icon="Search" />
                <el-button size="small" text @click="viewMode = 'files'">File table view &rarr;</el-button>
              </div>
            </div>
            <el-table
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
                          <span class="mcv-file-link" @click="openFileInDialog(f)" :title="f.path">{{ f.title || f.path.split('/').pop() }}</span>
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
                          <span v-if="isStaleFile(f)" class="popover-stale mcv-flag-stale" title="stale">S</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="Preview" width="80" fixed="right">
                        <template #default="{ row: f }">
                          <el-button size="small" type="primary" text @click="openFileInDialog(f)">Preview</el-button>
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
                class="fg-card" @click="openFileInDialog(f)"
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
                  <span v-if="isStaleFile(f)" class="fg-stale">stale</span>
                  <span v-if="f.review_cycle" class="fg-review">{{ f.review_cycle }}</span>
                </div>
                <div class="fg-card-footer">
                  <span class="fg-footer-size">{{ formatFileSize(f.size) }}</span>
                  <span class="fg-footer-time">{{ f.updated ? formatRelativeTime(f.updated) : '--' }}</span>
                  <el-button size="small" text type="primary" @click.stop="openFileInDialog(f)" class="fg-footer-preview">Preview</el-button>
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
              <el-table-column width="42" fixed="left">
                <template #default="{ row }">
                  <el-button size="small" text @click.stop="openFilePreview(row)" title="Inline preview">
                    <el-icon :size="15"><View /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column prop="title" label="File" min-width="320" sortable="custom">
                <template #default="{ row }">
                  <el-popover placement="right" :width="320" trigger="hover" :show-after="400" :hide-after="100">
                    <template #reference>
                      <div class="file-cell">
                        <span class="file-title">
                          <el-icon v-if="isStaleFile(row)" class="stale-row-icon" :size="12"><WarningFilled /></el-icon>
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
                      <div v-if="isStaleFile(row)"><b>Stale:</b> <span class="popover-stale">Yes</span></div>
                      <div v-if="row.benefit"><b>Benefit:</b> <span class="popover-benefit">{{ row.benefit.slice(0, 100) }}{{ row.benefit.length > 100 ? '...' : '' }}</span></div>
                      <div v-if="row.related_count > 0"><b>Related:</b> {{ row.related_count }} files
                        <div v-if="resolveRelatedNames(row).length > 0" class="popover-related-row">
                          <span v-for="r in resolveRelatedNames(row)" :key="r.path" class="popover-related-link" @click.stop="openFilePreview(knowledgeData?.files?.find(f => f.path === r.path) || { path: r.path, title: r.title } as any)" :title="r.path">{{ r.title }}</span>
                        </div>
                      </div>
                      <div v-if="(row.roles || []).length > 0"><b>Roles:</b> {{ (row.roles || []).join(', ') }}</div>
                      <div v-if="(row.tags || []).length > 0"><b>Tags:</b> {{ (row.tags || []).join(', ') }}</div>
                      <div><b>Size:</b> {{ formatFileSize(row.size) }} &middot; <b>Updated:</b> {{ row.updated || '--' }}</div>
                      <div class="popover-actions">
                        <el-button size="small" type="primary" plain @click.stop="openFileInDialog(row)">Preview</el-button>
                        <el-button size="small" plain @click.stop="discussInAiChat(row)">Chat</el-button>
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
                  <span class="type-badge" :class="'type-' + (row.type || 'unknown')" @click.stop="setFilter('type', row.type || 'unknown')">{{ row.type || 'unknown' }}</span>
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
                  <el-tooltip :content="'Metadata completeness: ' + (fileHealthLevel(row) === 'good' ? 'Good' : fileHealthLevel(row) === 'warn' ? 'Fair' : 'Poor')" placement="top">
                    <span class="health-dot" :class="'health-' + fileHealthLevel(row)"></span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="Status" width="100" sortable="custom">
                <template #default="{ row }">
                  <el-tag :type="statusTagType(row.status)" size="small" @click.stop="setFilter('status', row.status)" class="table-tag-clickable">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="lifecycle" label="Lifecycle" width="100" sortable="custom">
                <template #default="{ row }">
                  <el-tag v-if="row.lifecycle && row.lifecycle !== 'unknown'" :type="lifecycleTagType(row.lifecycle)" size="small" @click.stop="setFilter('lifecycle', row.lifecycle)" class="table-tag-clickable">
                    {{ row.lifecycle }}
                  </el-tag>
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
                  <el-tag :type="statusTagType(selectedFile.status)" size="small">{{ selectedFile.status }}</el-tag>
                </div>
                <div class="fd-meta-item">
                  <span class="fd-meta-label">Lifecycle</span>
                  <el-tag v-if="selectedFile.lifecycle" :type="lifecycleTagType(selectedFile.lifecycle)" size="small">{{ selectedFile.lifecycle }}</el-tag>
                  <span v-else class="text-muted">--</span>
                </div>
                <div class="fd-meta-item">
                  <span class="fd-meta-label">Type</span>
                  <span class="type-badge" :class="'type-' + (selectedFile.type || 'unknown')">{{ selectedFile.type || 'unknown' }}</span>
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
                  <div v-if="fileContent" class="markdown-preview" v-html="render(fileContent.slice(0, 3000))"></div>
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
import { ref } from "vue";
import {
  Document, Folder, Grid, Refresh, TrendCharts, Star, WarningFilled,
  Search, InfoFilled, User, Cpu, ArrowLeft, ArrowRight, Coin, Close, View,
} from "@element-plus/icons-vue";
import KnowledgePreviewDialog from "@/views/aiChat/components/KnowledgePreviewDialog.vue";
import ECharts from "@/components/ECharts/index.vue";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useKnowledgeBase } from "./composables/useKnowledgeBase";

const { render } = useMarkdown();
const kb = useKnowledgeBase();
const previewDialogRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

function openFileInDialog(row: { path: string; [key: string]: any }) {
  kb.openFileInDialog(row as any);
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
  searchText, activeTimeFilter, browseAllFiles,
  searchMode, contentSearchResults, contentSearchLoading,
  selectedFile, showBenefitCol, fileViewMode,
  showSearchSuggestions, moduleDrillSearch, expandedModuleKeys, moduleTableRef,
  fileContent, fileContentLoading, showFileContent,
  recentlyViewed, drillDownRef, detailPanelRef,
  hasActiveFilter, showSubModuleGrid, isShowingTreeView,
  topCategory, tacitPct, topRole, totalModules, totalSizeFormatted,
  filteredModuleDrillData,
  subCategories, categoryReviewCoverage, categoryStaleCount, categoryTacitCount,
  moduleDetail, subdirectoryBreakdown, topModuleFiles,
  filteredFiles, drillTableData, sortedDrillTableData, paginatedDrillFiles,
  staleFiles,
  selectedFileIndex, prevFile, nextFile, resolvedRelatedFiles,
  sameModuleCount, sameSubModuleCount,
  dialogFileIndex, prevDialogFile, nextDialogFile, dialogFilePath,
  drillSummary,
  enrichedSearchResults, searchSuggestions,
  reviewCycleDonutOption, typeBarOption, statusBarOption,
  sizeDistOption, fileAgeOption, lifecycleBarOption,
  moduleBarOption, rolesBarOption,
  formatNumber, formatFileSize, formatRelativeTime, highlightSnippet,
  isStaleFile, fileHealthLevel, getModuleClassSummary,
  catColor, statusColor, statusTagType, lifecycleColor, lifecycleTagType, reviewCycleTagType,
  setFilter, toggleNoReviewFilter, backToCategory, clearAllFilters,
  drillToModule, drillToSubdir, drillFromModule, onModuleExpandChange,
  navigateToModule, crossFilterSubModule,
  onTimeFilterChange, onTableSortChange, scrollToDrillDown,
  openFilePreview, clearRecentlyViewed,
  navigateToFile, resolveRelatedNames, getModuleStats,
  discussInAiChat, discussSearchResult,
  exportCSV, onSearchInput, onChartClick, onDetailKeydown, fetchData,
} = kb;
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>