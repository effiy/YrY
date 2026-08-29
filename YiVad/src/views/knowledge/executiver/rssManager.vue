<template>
  <div class="rss-role">
    <div class="rss-role__header">
      <el-breadcrumb separator="/" class="rss-role__breadcrumb">
        <el-breadcrumb-item :to="{ path: '/executiver' }">{{ t('rss.manager.breadcrumb.executive') }}</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/executiver/rss' }">{{ t('rss.manager.breadcrumb.rss') }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ roleData.name }}</el-breadcrumb-item>
      </el-breadcrumb>
      <RoleNav v-model="selectedRoles" multiple all :counts="roleCounts" />
    </div>

    <!-- ═══ Sticky Header Bar ═══ -->
    <div class="rss-role__sticky-bar">
      <div class="rss-role__sticky-top">
        <div class="rss-role__sticky-left">
          <span class="rss-role__sticky-icon">{{ stickyIcon }}</span>
          <div class="rss-role__sticky-info">
            <h1 class="rss-role__sticky-name">{{ stickyTitle }}</h1>
            <p class="rss-role__sticky-desc">{{ stickyDesc }}</p>
          </div>
        </div>
        <div class="rss-role__sticky-right">
          <div class="rss-role__stat-pill rss-role__stat-pill--feeds" :title="t('rss.manager.sticky.viewFeeds')" @click="switchTab('seeds')">
            <span class="rss-role__stat-pill-icon">📡</span>
            <span class="rss-role__stat-pill-info">
              <span class="rss-role__stat-pill-value">{{ animatedFeeds }}</span>
              <span class="rss-role__stat-pill-label">{{ t('rss.manager.sticky.feeds') }}</span>
            </span>
          </div>
          <div class="rss-role__stat-pill rss-role__stat-pill--articles" :title="t('rss.manager.sticky.viewArticles')" @click="switchTab('items')">
            <span class="rss-role__stat-pill-icon">📄</span>
            <span class="rss-role__stat-pill-info">
              <span class="rss-role__stat-pill-value">{{ animatedArticles }}</span>
              <span class="rss-role__stat-pill-label">{{ t('rss.manager.sticky.articles') }}</span>
            </span>
          </div>
          <div class="rss-role__stat-pill rss-role__stat-pill--accent" :title="t('rss.manager.sticky.backToBriefing')" @click="goToBriefingToday">
            <span class="rss-role__stat-pill-icon">⚡</span>
            <span class="rss-role__stat-pill-info">
              <span class="rss-role__stat-pill-value">
                {{ animatedToday }}
                <span v-if="todayDelta !== 0" class="rss-role__stat-pill-delta" :class="todayDelta > 0 ? 'is-up' : 'is-down'">{{ todayDelta > 0 ? "+" : "" }}{{ todayDelta }}</span>
              </span>
              <span class="rss-role__stat-pill-label">{{ t('rss.manager.sticky.today') }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="rss-role__body">
      <nav class="rss-role__sidebar">
        <div class="rss-role__sidebar-title">{{ t('rss.manager.sidebar.sections') }}</div>
        <div class="rss-role__sidebar-view">
          <template v-if="activeTab === 'briefing'">
            <el-radio-group v-model="briefingViewMode" size="small">
              <el-radio-button value="list">{{ t('rss.manager.sidebar.view.list') }}</el-radio-button>
              <el-radio-button value="card">{{ t('rss.manager.sidebar.view.card') }}</el-radio-button>
              <el-radio-button value="table">{{ t('rss.manager.sidebar.view.table') }}</el-radio-button>
            </el-radio-group>
          </template>
          <template v-else-if="activeTab === 'seeds'">
            <el-radio-group v-model="seedsViewMode" size="small">
              <el-radio-button value="table">{{ t('rss.manager.sidebar.view.table') }}</el-radio-button>
              <el-radio-button value="card">{{ t('rss.manager.sidebar.view.card') }}</el-radio-button>
            </el-radio-group>
          </template>
          <template v-else>
            <el-radio-group v-model="itemsViewMode" size="small">
              <el-radio-button value="card">{{ t('rss.manager.sidebar.view.card') }}</el-radio-button>
              <el-radio-button value="list">{{ t('rss.manager.sidebar.view.list') }}</el-radio-button>
              <el-radio-button value="table">{{ t('rss.manager.sidebar.view.table') }}</el-radio-button>
            </el-radio-group>
          </template>
        </div>
        <button
          class="rss-role__sidebar-item"
          :class="{ 'is-active': activeTab === 'briefing' }"
          @click="switchTab('briefing')"
        >
          <span class="rss-role__sidebar-icon">📰</span>
          <span class="rss-role__sidebar-label">{{ t('rss.manager.sidebar.tabs.briefing') }}</span>
          <span class="rss-role__sidebar-badge" :data-count="todayCount">{{ todayCount }}</span>
        </button>
        <button
          class="rss-role__sidebar-item"
          :class="{ 'is-active': activeTab === 'seeds' }"
          @click="switchTab('seeds')"
        >
          <span class="rss-role__sidebar-icon">📡</span>
          <span class="rss-role__sidebar-label">{{ t('rss.manager.sidebar.tabs.seeds') }}</span>
          <span class="rss-role__sidebar-badge" :data-count="feedsCount">{{ feedsCount }}</span>
        </button>
        <button
          class="rss-role__sidebar-item"
          :class="{ 'is-active': activeTab === 'items' }"
          @click="switchTab('items')"
        >
          <span class="rss-role__sidebar-icon">📄</span>
          <span class="rss-role__sidebar-label">{{ t('rss.manager.sidebar.tabs.items') }}</span>
          <span class="rss-role__sidebar-badge" :data-count="totalItems">{{ totalItems }}</span>
        </button>
      </nav>

      <div class="rss-role__content">
        <!-- ═══ Briefing ═══ -->
        <section v-if="activeTab === 'briefing'" class="rss-role__section">
          <div class="rss-role__section-head">
            <h2 class="rss-role__section-title">{{ t('rss.manager.briefing.title') }}</h2>
            <div class="rss-briefing__date-nav">
              <el-button size="small" :icon="ArrowLeft" text @click="goToPrevDay" :disabled="briefingLoading" />
              <span class="rss-briefing__date">{{ briefingDateLabel }}</span>
              <el-button size="small" :icon="ArrowRight" text @click="goToNextDay" :disabled="isToday" />
              <el-button v-if="!isToday" size="small" text type="primary" @click="goToToday" :disabled="briefingLoading">{{ t('rss.manager.briefing.goToday') }}</el-button>
            </div>
            <el-radio-group v-if="briefingViewMode === 'list'" v-model="briefingGroupBy" size="small">
              <el-radio-button value="source">{{ t('rss.manager.briefing.groupBy.source') }}</el-radio-button>
              <el-radio-button value="category">{{ t('rss.manager.briefing.groupBy.category') }}</el-radio-button>
            </el-radio-group>
            <span class="rss-role__toolbar-right">
              <span v-if="filteredBriefingCount" class="rss-role__result-count">{{ t('rss.manager.briefing.resultCount', { count: filteredBriefingCount, groups: briefingGroups.length, unit: t('rss.manager.briefing.groupUnit.' + briefingGroupBy) }) }}</span>
              <el-button size="small" :icon="Refresh" @click="loadBriefing" :loading="briefingLoading">{{ t('rss.manager.briefing.refresh') }}</el-button>
            </span>
          </div>

          <div v-loading="briefingLoading" class="rss-role__section-body">
            <div class="rss-role__toolbar">
              <el-input
                v-model="briefingSearch"
                :placeholder="t('rss.manager.briefing.searchPlaceholder')"
                clearable
                :prefix-icon="Search"
                style="width:180px"
              />
              <el-select v-model="briefingCategoryFilter" :placeholder="t('rss.manager.briefing.categoryAll')" clearable style="width:180px">
                <el-option v-for="c in categoryOptions" :key="c.value" :label="`${c.icon} ${c.label}`" :value="c.value" />
              </el-select>
              <el-button v-if="briefingSearch || briefingCategoryFilter" size="small" text @click="clearBriefingFilters">{{ t('rss.manager.briefing.clear') }}</el-button>
            </div>

            <div v-if="briefingSearch || briefingCategoryFilter" class="rss-role__active-filters">
              <el-tag v-if="briefingSearch" size="small" closable @close="briefingSearch = ''">{{ t('rss.manager.briefing.activeFilters.search', { value: briefingSearch }) }}</el-tag>
              <el-tag v-if="briefingCategoryFilter" size="small" closable @close="briefingCategoryFilter = ''">{{ t('rss.manager.briefing.activeFilters.category', { value: briefingCategoryFilter }) }}</el-tag>
            </div>

            <div v-if="briefingCoverage" class="rss-briefing__coverage">
              <div v-for="c in briefingCoverage" :key="c.key" class="rss-briefing__coverage-item">
                <span class="rss-briefing__coverage-count" :style="{ color: coverageColor(c.pct) }">{{ c.count }}</span>
                <span class="rss-briefing__coverage-label">{{ c.label }}</span>
                <span class="rss-briefing__coverage-pct">{{ c.pct }}%</span>
              </div>
            </div>

            <div v-if="briefingItems.length || dailyVolume.length" class="rss-briefing__charts">
              <div v-if="briefingItems.length" class="rss-briefing__chart">
                <div class="rss-briefing__chart-title">{{ t('rss.manager.briefing.charts.categoryDist') }}</div>
                <ECharts :option="briefingCategoryOption" height="200" />
              </div>
              <div v-if="briefingItems.length" class="rss-briefing__chart">
                <div class="rss-briefing__chart-title">{{ t('rss.manager.briefing.charts.topSources') }}</div>
                <ECharts :option="briefingSourceOption" height="200" />
              </div>
              <div class="rss-briefing__chart rss-briefing__chart--full">
                <div class="rss-briefing__chart-title">{{ t('rss.manager.briefing.charts.volumeTrend', { n: dailyVolume.length }) }}</div>
                <ECharts :option="briefingVolumeOption" height="180" v-loading="volumeLoading" />
              </div>
            </div>

            <div v-if="!briefingLoading && !briefingItems.length" class="rss-briefing__empty">
              <span class="rss-briefing__empty-icon">{{ isToday ? t('rss.manager.briefing.empty.todayIcon') : t('rss.manager.briefing.empty.dateIcon') }}</span>
              <p class="rss-briefing__empty-title">{{ isToday ? t('rss.manager.briefing.empty.todayTitle') : t('rss.manager.briefing.empty.dateTitle') }}</p>
              <p class="rss-briefing__empty-hint">{{ isToday ? t('rss.manager.briefing.empty.todayHint') : t('rss.manager.briefing.empty.dateHint') }}</p>
              <el-button v-if="!isToday" size="small" type="primary" @click="goToToday">{{ t('rss.manager.briefing.empty.backToday') }}</el-button>
            </div>

            <div v-else-if="!briefingLoading && !filteredBriefingCount" class="rss-briefing__empty">
              <span class="rss-briefing__empty-icon">{{ t('rss.manager.briefing.empty.noMatchIcon') }}</span>
              <p class="rss-briefing__empty-title">{{ t('rss.manager.briefing.empty.noMatchTitle') }}</p>
              <p class="rss-briefing__empty-hint">{{ t('rss.manager.briefing.empty.noMatchHint') }}</p>
              <el-button size="small" text type="primary" @click="clearBriefingFilters">{{ t('rss.manager.briefing.empty.clearFilters') }}</el-button>
            </div>

            <div v-else-if="briefingGroups.length" class="rss-briefing__groups">
              <!-- Table view -->
              <el-table
                v-if="briefingViewMode === 'table'"
                :data="allBriefingItems"
                stripe
                border
                style="width:100%"
                row-key="key"
                :empty-text="t('rss.manager.briefing.table.noData')"
              >
                <el-table-column :label="t('rss.manager.briefing.table.source')" width="150" show-overflow-tooltip>
                  <template #default="{ row }">
                    <span class="rss-role__item-source">{{ (row as RssItemDocument).source_name }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="t('rss.manager.briefing.table.title')" min-width="320">
                  <template #default="{ row }">
                    <a :href="(row as RssItemDocument).link" target="_blank" rel="noopener noreferrer" class="rss-role__item-link" @click.stop="addRecentArticle(row as RssItemDocument)">
                      {{ (row as RssItemDocument).title }}
                    </a>
                  </template>
                </el-table-column>
                <el-table-column :label="t('rss.manager.briefing.table.author')" width="140" show-overflow-tooltip>
                  <template #default="{ row }">
                    <span v-if="(row as RssItemDocument).author">{{ (row as RssItemDocument).author }}</span>
                    <span v-else class="rss-role__text-muted">{{ t('rss.manager.detail.fields.unknown') }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="t('rss.manager.briefing.table.published')" width="120" align="center">
                  <template #default="{ row }">
                    <el-tooltip :content="formatDate((row as RssItemDocument).published)" placement="top" :show-after="400">
                      <span class="rss-role__date">{{ formatRelativeTime((row as RssItemDocument).published) }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column :label="t('rss.manager.briefing.table.category')" width="160" show-overflow-tooltip>
                  <template #default="{ row }">
                    <span v-if="subCategory((row as RssItemDocument).category_path)" class="rss-role__cat-chip">
                      <span class="rss-role__cat-dot" :style="{ background: roleColor((row as RssItemDocument).category_path) }"></span>
                      {{ subCategory((row as RssItemDocument).category_path) }}
                    </span>
                    <span v-else class="rss-role__text-muted">{{ t('rss.manager.detail.fields.unknown') }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="t('rss.manager.briefing.table.summary')" min-width="240" show-overflow-tooltip>
                  <template #default="{ row }">
                    <span v-if="(row as RssItemDocument).summary">{{ trimSummary((row as RssItemDocument).summary!) }}</span>
                    <span v-else class="rss-role__text-muted">{{ t('rss.manager.detail.fields.unknown') }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="t('rss.manager.briefing.table.actions')" width="180" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button size="small" text :icon="View" :title="t('rss.manager.briefing.table.detail')" @click.stop="openArticleDetail(row as RssItemDocument)" />
                    <el-popconfirm :title="t('rss.manager.briefing.table.deleteConfirm')" @confirm="removeBriefingItem(row as RssItemDocument)">
                      <template #reference>
                        <el-button size="small" text type="danger" :icon="Delete" @click.stop />
                      </template>
                    </el-popconfirm>
                  </template>
                </el-table-column>
              </el-table>

              <!-- List view -->
              <template v-else-if="briefingViewMode === 'list'">
              <section v-for="group in briefingGroups" :key="group.key" class="rss-briefing__group" :class="{ 'is-collapsed': collapsedGroups.has(group.key) }">
                <header class="rss-briefing__group-header" @click="toggleGroup(group.key)">
                  <span class="rss-briefing__group-chevron" :class="{ 'is-collapsed': collapsedGroups.has(group.key) }">▸</span>
                  <span v-if="group.color" class="rss-briefing__group-dot" :style="{ background: group.color }"></span>
                  <span v-else class="rss-briefing__group-icon">{{ group.icon }}</span>
                  <span class="rss-briefing__group-label">{{ group.label }}</span>
                  <span class="rss-briefing__group-count">{{ group.items.length }}</span>
                </header>
                <ul v-show="!collapsedGroups.has(group.key)" class="rss-briefing__list">
                  <li v-for="item in group.items" :key="item.key || item.link" class="rss-briefing__item" @click="onArticleRowClick(item)">
                    <div class="rss-briefing__item-main">
                      <div class="rss-briefing__item-head">
                        <span class="rss-briefing__item-title">{{ item.title }}</span>
                      </div>
                      <div class="rss-briefing__item-meta">
                        <template v-if="item.author">{{ item.author }} · </template>
                        <span>{{ formatRelativeTime(item.published) }}</span>
                        <template v-if="subCategory(item.category_path)">
                          · <span class="rss-role__cat-dot" :style="{ background: roleColor(item.category_path) }"></span>{{ subCategory(item.category_path) }}
                        </template>
                      </div>
                      <p v-if="item.summary" class="rss-briefing__item-summary">{{ stripHtml(item.summary) }}</p>
                    </div>
                    <div class="rss-briefing__item-actions">
                      <el-popconfirm :title="t('rss.manager.briefing.table.deleteConfirm')" @confirm="removeBriefingItem(item)">
                        <template #reference>
                          <el-button size="small" text type="danger" :icon="Delete" @click.stop />
                        </template>
                      </el-popconfirm>
                    </div>
                    </li>
                </ul>
              </section>
              </template>
              <!-- Card view -->
              <div v-else class="rss-role__items-grid">
                <el-card v-for="item in allBriefingItems" :key="item.key || item.link" class="rss-role__item-card" shadow="hover" @click="onArticleRowClick(item)">
                  <div class="rss-role__item-card-top">
                    <span class="rss-role__item-card-date">{{ formatRelativeTime(item.published) }}</span>
                    <el-popconfirm :title="t('rss.manager.briefing.table.deleteConfirm')" @confirm="removeBriefingItem(item)">
                      <template #reference>
                        <el-button size="small" text type="danger" :icon="Delete" @click.stop />
                      </template>
                    </el-popconfirm>
                  </div>
                  <p class="rss-role__item-card-title">{{ item.title }}</p>
                  <div class="rss-role__item-card-meta">
                    <span v-if="item.author">{{ item.author }}</span>
                    <span v-if="subCategory(item.category_path)" class="rss-role__cat-chip">
                      <span class="rss-role__cat-dot" :style="{ background: roleColor(item.category_path) }"></span>{{ subCategory(item.category_path) }}
                    </span>
                  </div>
                  <p v-if="item.summary" class="rss-role__item-card-summary">{{ stripHtml(item.summary) }}</p>
                </el-card>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ Feed Sources ═══ -->
        <section v-if="activeTab === 'seeds'" class="rss-role__section">
          <div class="rss-role__section-head">
            <h2 class="rss-role__section-title">{{ t('rss.manager.seeds.title') }}</h2>
            <span class="rss-role__result-count">{{ t('rss.manager.seeds.resultCount', { filtered: filteredSeeds.length, total: feedsCount }) }}</span>
            <span class="rss-role__toolbar-right">
              <el-button type="primary" :icon="Plus" @click="openSeedDialog()">{{ t('rss.manager.seeds.addSource') }}</el-button>
              <el-button :icon="Refresh" @click="parseAllFeeds" :loading="parseAllLoading">{{ t('rss.manager.seeds.parseAllBtn') }}</el-button>
              <el-button :icon="Link" @click="quickParseVisible = true">{{ t('rss.manager.seeds.quickParseBtn') }}</el-button>
            </span>
          </div>

          <div class="rss-role__section-body">
            <div class="rss-role__toolbar">
              <el-input
                v-model="seedSearch"
                :placeholder="t('rss.manager.seeds.searchPlaceholder')"
                clearable
                :prefix-icon="Search"
                style="width:220px"
              />
            </div>
            <el-table
              v-if="seedsViewMode === 'table'"
              :data="filteredSeeds"
              v-loading="seedsLoading"
              stripe
              border
              style="width:100%"
              row-key="url"
              :empty-text="seedsLoading ? '' : t('rss.manager.seeds.table.noData')"
              >
              <el-table-column prop="name" :label="t('rss.manager.seeds.table.name')" min-width="140" show-overflow-tooltip />
              <el-table-column :label="t('rss.manager.seeds.table.feedUrl')" min-width="240">
                <template #default="{ row }">
                  <span class="rss-role__seed-url">
                    <span class="rss-role__seed-url-text">{{ (row as RssSeedDocument).url }}</span>
                  </span>
                </template>
              </el-table-column>
              <el-table-column :label="t('rss.manager.seeds.table.category')" width="150" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="subCategory((row as RssSeedDocument).category)" class="rss-role__cat-chip">
                    <span class="rss-role__cat-dot" :style="{ background: roleColor((row as RssSeedDocument).category) }"></span>{{ subCategory((row as RssSeedDocument).category) }}
                  </span>
                  <span v-else class="rss-role__text-muted">{{ t('rss.manager.detail.fields.unknown') }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="t('rss.manager.seeds.table.interval')" width="90" align="center">
                <template #default="{ row }">
                  <span v-if="seedIntervals[(row as RssSeedDocument).url]" class="rss-role__schedule-badge">
                    {{ formatInterval(seedIntervals[(row as RssSeedDocument).url]) }}
                  </span>
                  <span v-else class="rss-role__text-muted">{{ t('rss.manager.seeds.table.globalInterval') }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="t('rss.manager.seeds.table.active')" width="70" align="center">
                <template #default="{ row }">
                  <el-switch
                    :model-value="(row as RssSeedDocument).enabled !== false"
                    :loading="seedToggling === (row as RssSeedDocument).key"
                    @change="toggleSeed(row as RssSeedDocument)"
                    @click.stop
                    size="small"
                  />
                </template>
              </el-table-column>
              <el-table-column :label="t('rss.manager.seeds.table.articles')" width="80" align="center">
                <template #default="{ row }">
                  <span v-if="seedArticleCounts[(row as RssSeedDocument).url] !== undefined" class="rss-role__article-count">
                    {{ seedArticleCounts[(row as RssSeedDocument).url] }}
                  </span>
                  <span v-else class="rss-role__text-muted">{{ t('rss.manager.detail.fields.unknown') }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="t('rss.manager.seeds.table.lastParsed')" width="110" align="center">
                <template #default="{ row }">
                  <el-tooltip v-if="parseTimes[(row as RssSeedDocument).url]" :content="formatTime(new Date(parseTimes[(row as RssSeedDocument).url]))" placement="top" :show-after="400">
                    <span class="rss-role__date">{{ formatTimeAgo(parseTimes[(row as RssSeedDocument).url]) }}</span>
                  </el-tooltip>
                  <span v-else class="rss-role__text-muted">{{ t('rss.manager.seeds.table.neverParsed') }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="t('rss.manager.seeds.table.actions')" width="190" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" text type="primary" :loading="parsingSeed === (row as RssSeedDocument).url" @click.stop="parseOneFeed(row as RssSeedDocument)">
                    {{ parsingSeed === (row as RssSeedDocument).url ? t('rss.manager.seeds.table.editing') : t('rss.manager.seeds.table.parse') }}
                  </el-button>
                  <el-button size="small" text @click.stop="openSeedDialog(row as RssSeedDocument)">{{ t('rss.manager.seeds.table.edit') }}</el-button>
                  <el-popconfirm :title="t('rss.manager.seeds.deleteConfirm')" @confirm="removeSeed(row as RssSeedDocument)">
                    <template #reference>
                      <el-button size="small" text type="danger" :icon="Delete" @click.stop />
                    </template>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>
            <div v-else class="rss-role__items-grid">
              <el-card v-for="seed in filteredSeeds" :key="seed.url" class="rss-role__seed-card" shadow="hover">
                <div class="rss-role__seed-card-head">
                  <span class="rss-role__seed-card-name">{{ seed.name }}</span>
                  <el-switch
                    :model-value="seed.enabled !== false"
                    :loading="seedToggling === seed.key"
                    @change="toggleSeed(seed)"
                    @click.stop
                    size="small"
                  />
                </div>
                <p class="rss-role__seed-card-url">{{ seed.url }}</p>
                <div class="rss-role__seed-card-meta">
                  <span v-if="subCategory(seed.category)" class="rss-role__cat-chip">
                    <span class="rss-role__cat-dot" :style="{ background: roleColor(seed.category) }"></span>{{ subCategory(seed.category) }}
                  </span>
                  <span v-if="seedIntervals[seed.url]">{{ formatInterval(seedIntervals[seed.url]) }}</span>
                  <span v-else>{{ t('rss.manager.seeds.card.globalInterval') }}</span>
                  <span v-if="seedArticleCounts[seed.url] !== undefined">{{ t('rss.manager.seeds.card.articles', { n: seedArticleCounts[seed.url] }) }}</span>
                  <span v-if="parseTimes[seed.url]">{{ formatTimeAgo(parseTimes[seed.url]) }}</span>
                  <span v-else>{{ t('rss.manager.seeds.card.neverParsed') }}</span>
                </div>
                <div class="rss-role__seed-card-actions">
                  <el-button size="small" text type="primary" :loading="parsingSeed === seed.url" @click.stop="parseOneFeed(seed)">{{ parsingSeed === seed.url ? t('rss.manager.seeds.table.editing') : t('rss.manager.seeds.table.parse') }}</el-button>
                  <el-button size="small" text @click.stop="openSeedDialog(seed)">{{ t('rss.manager.seeds.table.edit') }}</el-button>
                  <el-popconfirm :title="t('rss.manager.seeds.deleteConfirm')" @confirm="removeSeed(seed)">
                    <template #reference>
                      <el-button size="small" text type="danger" :icon="Delete" @click.stop />
                    </template>
                  </el-popconfirm>
                </div>
              </el-card>
            </div>
          </div>
        </section>

        <!-- ═══ Articles ═══ -->
        <section v-if="activeTab === 'items'" class="rss-role__section">
          <div class="rss-role__section-head">
            <h2 class="rss-role__section-title">{{ t('rss.manager.items.title') }}</h2>
            <span class="rss-role__result-count">{{ t('rss.manager.items.resultCount', { filtered: items.length, total: totalItems }) }}</span>
            <span class="rss-role__toolbar-right">
              <el-button v-if="selectedItems.length" type="danger" size="small" @click="batchDelete">{{ t('rss.manager.items.batchDelete', { n: selectedItems.length }) }}</el-button>
              <el-button v-if="hasActiveFilters" size="small" text @click="clearFilters">{{ t('rss.manager.items.clearFilters') }}</el-button>
              <el-button size="small" text :icon="Download" :loading="exportingItems" @click="exportItems">{{ t('rss.manager.items.exportBtn') }}</el-button>
              <el-button size="small" text :icon="Refresh" @click="loadItems">{{ t('rss.manager.items.refresh') }}</el-button>
            </span>
          </div>

          <div class="rss-role__section-body">
            <div class="rss-role__toolbar">
              <el-input
                v-model="itemSearch"
                :placeholder="t('rss.manager.items.searchPlaceholder')"
                clearable
                :prefix-icon="Search"
                style="width:180px"
                @clear="onItemFilterChange"
                @keyup.enter="onItemFilterChange"
              />
              <el-select v-model="itemCategoryFilter" :placeholder="t('rss.manager.items.categoryAll')" clearable style="width:160px" @change="onItemFilterChange">
                <el-option v-for="c in categoryOptions" :key="c.value" :label="`${c.icon} ${c.label}`" :value="c.value" />
              </el-select>
              <el-select v-model="itemSourceFilter" :placeholder="t('rss.manager.items.sourceAll')" clearable style="width:140px" @change="onItemFilterChange">
                <el-option v-for="s in seedOptions" :key="s.value" :label="s.label" :value="s.value" />
              </el-select>
              <el-radio-group v-model="timePreset" size="small" @change="setTimePreset">
                <el-radio-button value="all">{{ t('rss.manager.items.timePreset.all') }}</el-radio-button>
                <el-radio-button value="today">{{ t('rss.manager.items.timePreset.today') }}</el-radio-button>
                <el-radio-button value="week">{{ t('rss.manager.items.timePreset.week') }}</el-radio-button>
                <el-radio-button value="month">{{ t('rss.manager.items.timePreset.month') }}</el-radio-button>
              </el-radio-group>
              <el-date-picker
                v-model="itemDateRange"
                type="daterange"
                range-separator="~"
                :start-placeholder="t('rss.manager.items.dateRange.from')"
                :end-placeholder="t('rss.manager.items.dateRange.to')"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width:220px"
                @change="timePreset = ''; onItemFilterChange()"
              />
              <el-select v-model="itemSortKey" style="width:110px" @change="onItemFilterChange">
                <el-option :label="t('rss.manager.items.sort.newest')" value="published_parsed" />
                <el-option :label="t('rss.manager.items.sort.oldest')" value="published_parsed-asc" />
                <el-option :label="t('rss.manager.items.sort.source')" value="source_name" />
                <el-option :label="t('rss.manager.items.sort.category')" value="category_path" />
              </el-select>
            </div>

            <div v-if="hasActiveFilters" class="rss-role__active-filters">
              <el-tag v-if="itemSearch" size="small" closable @close="itemSearch = ''; onItemFilterChange()">{{ t('rss.manager.items.activeFilters.search', { value: itemSearch }) }}</el-tag>
              <el-tag v-if="itemCategoryFilter" size="small" closable @close="itemCategoryFilter = ''; onItemFilterChange()">{{ t('rss.manager.items.activeFilters.category', { value: itemCategoryFilter }) }}</el-tag>
              <el-tag v-if="itemSourceFilter" size="small" closable @close="itemSourceFilter = ''; onItemFilterChange()">{{ t('rss.manager.items.activeFilters.source', { value: itemSourceFilter }) }}</el-tag>
              <el-tag v-if="itemDateRange" size="small" closable @close="itemDateRange = null; timePreset = 'all'; onItemFilterChange()">{{ t('rss.manager.items.activeFilters.date', { from: itemDateRange[0], to: itemDateRange[1] }) }}</el-tag>
            </div>

            <div v-if="recentArticles.length" class="rss-role__recent-strip">
              <span class="rss-role__recent-label">{{ t('rss.manager.items.recent.label') }}</span>
              <button v-for="a in recentArticles" :key="a.key ?? a.link" class="rss-role__recent-chip" :title="a.link" @click="openArticleLink(a)">
                <span class="rss-role__recent-dot" :style="{ background: roleColor(a.category_path) }"></span>
                {{ a.title }}
              </button>
              <button class="rss-role__recent-clear" :title="t('rss.manager.items.recent.clearTitle')" @click="clearRecentArticles">{{ t('rss.manager.items.recent.clear') }}</button>
            </div>

            <!-- ═══ Table View ═══ -->
            <el-table
              v-if="itemsViewMode === 'table'"
              :data="filteredItems"
              v-loading="itemsLoading"
              stripe
              border
              style="width:100%"
              row-key="key"
              :empty-text="itemsLoading ? '' : (items.length || hasActiveFilters ? t('rss.manager.items.table.noData.filtered') : t('rss.manager.items.table.noData.empty'))"
              highlight-current-row
              @selection-change="onSelectionChange"
              @row-click="onArticleRowClick"
            >
              <el-table-column type="selection" width="40" />
              <el-table-column :label="t('rss.manager.items.table.title')" min-width="340">
                <template #default="{ row }">
                  <div class="rss-role__item-title">
                    <a :href="(row as RssItemDocument).link" target="_blank" rel="noopener noreferrer" class="rss-role__item-link" @click.stop>
                      {{ (row as RssItemDocument).title }}
                    </a>
                    <div class="rss-role__item-meta">
                      <span class="rss-role__item-source">{{ (row as RssItemDocument).source_name }}</span>
                      <template v-if="(row as RssItemDocument).author"> · {{ (row as RssItemDocument).author }}</template>
                      <span v-if="(row as RssItemDocument).summary" class="rss-role__item-summary-inline"> · {{ trimSummary((row as RssItemDocument).summary!) }}</span>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="t('rss.manager.items.table.published')" width="130" align="center">
                <template #default="{ row }">
                  <el-tooltip :content="formatDate((row as RssItemDocument).published)" placement="top" :show-after="400">
                    <span class="rss-role__date">{{ formatRelativeTime((row as RssItemDocument).published) }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column :label="t('rss.manager.items.table.category')" width="150" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="subCategory((row as RssItemDocument).category_path)" class="rss-role__cat-chip">
                    <span class="rss-role__cat-dot" :style="{ background: roleColor((row as RssItemDocument).category_path) }"></span>{{ subCategory((row as RssItemDocument).category_path) }}
                  </span>
                  <span v-else class="rss-role__text-muted">{{ t('rss.manager.detail.fields.unknown') }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="t('rss.manager.items.table.actions')" width="180" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" text :icon="View" :title="t('rss.manager.items.table.detail')" @click.stop="openArticleDetail(row as RssItemDocument)" />
                  <el-popconfirm :title="t('rss.manager.items.table.deleteConfirm')" @confirm="removeItem(row as RssItemDocument)">
                    <template #reference>
                      <el-button size="small" text type="danger" :icon="Delete" @click.stop />
                    </template>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>

            <!-- ═══ Card View ═══ -->
            <div v-else-if="itemsViewMode === 'card'" v-loading="itemsLoading" class="rss-role__items-grid">
              <div v-if="!itemsLoading && !filteredItems.length" class="rss-role__items-empty">
                <template v-if="items.length || hasActiveFilters">
                  <p>{{ t('rss.manager.items.empty.noMatch') }}</p>
                  <p class="rss-role__items-empty-hint">{{ t('rss.manager.items.empty.noMatchHint') }}</p>
                  <el-button v-if="hasActiveFilters" size="small" text type="primary" @click="clearFilters">{{ t('rss.manager.items.empty.clearFilters') }}</el-button>
                </template>
                <template v-else>
                  <p>{{ t('rss.manager.items.empty.noItems') }}</p>
                </template>
              </div>
              <el-card v-for="item in filteredItems" :key="item.key" class="rss-role__item-card" shadow="hover" @click="onArticleRowClick(item)">
                <div class="rss-role__item-card-top">
                  <span class="rss-role__item-card-date">{{ formatRelativeTime(item.published) }}</span>
                </div>
                <p class="rss-role__item-card-title">
                  <a v-if="item.link" :href="item.link" target="_blank" rel="noopener noreferrer" class="rss-role__item-link" @click.stop>{{ item.title }}</a>
                  <span v-else>{{ item.title }}</span>
                </p>
                <div class="rss-role__item-card-meta">
                  <span class="rss-role__item-source">{{ item.source_name }}</span>
                  <template v-if="item.author"> · {{ item.author }}</template>
                  <template v-if="subCategory(item.category_path)"> · <span class="rss-role__cat-dot" :style="{ background: roleColor(item.category_path) }"></span>{{ subCategory(item.category_path) }}</template>
                </div>
                <p v-if="item.summary" class="rss-role__item-card-summary">{{ trimSummary(item.summary) }}</p>
                <div class="rss-role__item-card-actions">
                  <el-button size="small" text :icon="View" :title="t('rss.manager.items.table.detail')" @click.stop="openArticleDetail(item)" />
                  <el-popconfirm :title="t('rss.manager.items.table.deleteConfirm')" @confirm="removeItem(item)">
                    <template #reference>
                      <el-button size="small" text type="danger" :icon="Delete" @click.stop />
                    </template>
                  </el-popconfirm>
                </div>
              </el-card>
            </div>

            <!-- ═══ List View ═══ -->
            <div v-else v-loading="itemsLoading" class="rss-role__items-list">
              <div v-if="!itemsLoading && !filteredItems.length" class="rss-role__items-empty">
                <template v-if="items.length || hasActiveFilters">
                  <p>{{ t('rss.manager.items.empty.noMatch') }}</p>
                  <p class="rss-role__items-empty-hint">{{ t('rss.manager.items.empty.noMatchHint') }}</p>
                  <el-button v-if="hasActiveFilters" size="small" text type="primary" @click="clearFilters">{{ t('rss.manager.items.empty.clearFilters') }}</el-button>
                </template>
                <template v-else>
                  <p>{{ t('rss.manager.items.empty.noItems') }}</p>
                </template>
              </div>
              <div v-for="item in filteredItems" :key="item.key" class="rss-role__items-list-row" @click="onArticleRowClick(item)">
                <span class="rss-role__items-list-source">{{ item.source_name }}</span>
                <span class="rss-role__items-list-title">
                  <a v-if="item.link" :href="item.link" target="_blank" rel="noopener noreferrer" class="rss-role__item-link" @click.stop>{{ item.title }}</a>
                  <span v-else>{{ item.title }}</span>
                </span>
                <span class="rss-role__items-list-date">{{ formatRelativeTime(item.published) }}</span>
                <div class="rss-role__items-list-actions">
                  <el-button size="small" text :icon="View" :title="t('rss.manager.items.table.detail')" @click.stop="openArticleDetail(item)" />
                  <el-popconfirm :title="t('rss.manager.items.table.deleteConfirm')" @confirm="removeItem(item)">
                    <template #reference>
                      <el-button size="small" text type="danger" :icon="Delete" @click.stop />
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </div>

            <div class="rss-role__pagination">
              <el-pagination
                v-model:current-page="itemPage"
                :page-size="itemPageSize"
                :total="totalItems"
                layout="prev,pager,next,total"
                background
                @current-change="loadItems"
              />
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Seed Dialog -->
    <el-dialog
      v-model="seedDialogVisible"
      :title="editingSeed?.key ? t('rss.manager.seeds.dialog.editTitle') : t('rss.manager.seeds.dialog.addTitle')"
      width="520px"
      destroy-on-close
    >
      <el-form :model="seedForm" label-width="110px">
        <el-form-item :label="t('rss.manager.seeds.dialog.feedUrl')" required>
          <el-input v-model="seedForm.url" :placeholder="t('rss.manager.seeds.dialog.feedUrlPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('rss.manager.seeds.dialog.name')">
          <el-input v-model="seedForm.name" :placeholder="t('rss.manager.seeds.dialog.namePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('rss.manager.seeds.dialog.targetCategory')">
          <el-select v-model="seedForm.category" :placeholder="t('rss.manager.seeds.dialog.autoClassify')" clearable allow-create filterable style="width:100%">
            <el-option-group v-for="g in categoryGroups" :key="g.label" :label="g.label">
              <el-option v-for="o in g.options" :key="o.value" :label="o.label" :value="o.value" />
            </el-option-group>
          </el-select>
          <span class="rss-role__form-hint">{{ t('rss.manager.seeds.dialog.overrideHint') }}</span>
        </el-form-item>
        <el-form-item :label="t('rss.manager.seeds.dialog.fetchInterval')">
          <el-select v-model="seedForm.interval" :placeholder="t('rss.manager.seeds.dialog.globalDefault')" clearable style="width:100%">
            <el-option :value="0" :label="t('rss.manager.seeds.dialog.globalDefault')" />
            <el-option :value="600" label="10 minutes" />
            <el-option :value="1800" label="30 minutes" />
            <el-option :value="3600" label="1 hour" />
            <el-option :value="7200" label="2 hours" />
            <el-option :value="21600" label="6 hours" />
            <el-option :value="43200" label="12 hours" />
            <el-option :value="86400" label="24 hours" />
          </el-select>
          <span class="rss-role__form-hint">{{ t('rss.manager.seeds.dialog.schedulerHint') }}</span>
        </el-form-item>
        <el-form-item :label="t('rss.manager.seeds.dialog.status')">
          <el-switch v-model="seedForm.enabled" :active-text="t('rss.manager.seeds.dialog.active')" :inactive-text="t('rss.manager.seeds.dialog.paused')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="seedDialogVisible = false">{{ t('rss.manager.common.cancel') }}</el-button>
        <el-button type="primary" @click="saveSeed" :loading="seedSaving">{{ t('rss.manager.common.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- Quick Parse Dialog -->
    <el-dialog v-model="quickParseVisible" :title="t('rss.manager.seeds.quickParse.title')" width="460px" destroy-on-close>
      <el-form :model="quickParseForm" label-width="60px">
        <el-form-item :label="t('rss.manager.seeds.quickParse.url')" required>
          <el-input v-model="quickParseForm.url" :placeholder="t('rss.manager.seeds.quickParse.urlPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('rss.manager.seeds.quickParse.name')">
          <el-input v-model="quickParseForm.name" :placeholder="t('rss.manager.seeds.quickParse.nameOptional')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="quickParseVisible = false">{{ t('rss.manager.common.cancel') }}</el-button>
        <el-button type="primary" @click="doQuickParse" :loading="quickParseLoading">{{ t('rss.manager.seeds.quickParse.parse') }}</el-button>
      </template>
    </el-dialog>

    <!-- Article Detail Dialog -->
    <el-dialog v-model="articleDetailVisible" :title="detailArticle?.title || t('rss.manager.detail.defaultTitle')" width="620px" destroy-on-close>
      <div v-if="detailArticle" class="rss-role__article-detail">
        <div class="rss-role__article-detail-meta">
          <div class="rss-role__article-detail-field"><b>{{ t('rss.manager.detail.fields.source') }}</b><span>{{ detailArticle.source_name || t('rss.manager.detail.fields.unknown') }}</span></div>
          <div class="rss-role__article-detail-field"><b>{{ t('rss.manager.detail.fields.author') }}</b><span>{{ detailArticle.author || t('rss.manager.detail.fields.unknown') }}</span></div>
          <div class="rss-role__article-detail-field"><b>{{ t('rss.manager.detail.fields.category') }}</b><span>{{ detailArticle.category_path || t('rss.manager.detail.fields.unknown') }}</span></div>
          <div class="rss-role__article-detail-field"><b>{{ t('rss.manager.detail.fields.published') }}</b><span>{{ detailArticle.published ? formatDate(detailArticle.published) : t('rss.manager.detail.fields.unknown') }}</span></div>
          <div class="rss-role__article-detail-field"><b>{{ t('rss.manager.detail.fields.tags') }}</b><span>{{ (detailArticle.tags || []).join(', ') || t('rss.manager.detail.fields.unknown') }}</span></div>
        </div>
        <div class="rss-role__article-detail-summary">
          <b>{{ t('rss.manager.detail.fields.summary') }}</b>
          <p>{{ stripHtml(detailArticle.summary || '') || t('rss.manager.detail.fields.noSummary') }}</p>
        </div>
        <div class="rss-role__article-detail-body">
          <div class="rss-role__article-detail-body-head">
            <b>{{ t('rss.manager.detail.fields.body') }}</b>
            <span v-if="detailArticle.file_path" class="rss-role__article-detail-body-path">{{ detailArticle.file_path }}</span>
          </div>
          <div v-if="articleBodyLoading" class="rss-role__article-detail-body-state" v-loading="true" :element-loading-text="t('rss.manager.detail.fields.loadingBody')" />
          <div v-else-if="renderedArticleBody" class="rss-role__article-detail-body-content markdown-body" v-html="renderedArticleBody" />
          <div v-else class="rss-role__article-detail-body-state rss-role__article-detail-body-state--empty">
            <span>📭 {{ articleBodyError ? t('rss.manager.detail.fields.noBodyFile') : t('rss.manager.detail.fields.noBodyContent') }}</span>
            <span v-if="articleBodyError" class="rss-role__article-detail-body-hint">{{ t('rss.manager.detail.fields.missingMarkdown') }}</span>
          </div>
        </div>
        <div class="rss-role__article-detail-actions">
          <el-button type="primary" :icon="Link" @click="openArticleLink(detailArticle)">{{ t('rss.manager.detail.open') }}</el-button>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script setup lang="ts" name="rssManager">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Plus, Refresh, Link, ArrowLeft, ArrowRight, Delete, Download, View } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import {
  getSeedList, createSeed, updateSeed, deleteSeed,
  getRssList, deleteRssItem,
  parseFeed, parseAllEnabledFeeds,
  type RssSeedDocument, type RssItemDocument, type RssListParams
} from "@/api/modules/rssService";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";
import { ROLE_IDS, rolesData, ROLE_COLORS } from "@/views/knowledge/executiver/okrData";
import { loadBool, saveBool, loadJson, saveJson } from "@/utils/storage";
import { EXAMPLE_SEEDS } from "./rssSeedData";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useMarkdown } from "@/hooks/useMarkdown";

const { t, locale } = useI18n();

const props = withDefaults(defineProps<{ roleId?: string }>(), { roleId: "executiver" });
const roleData = computed(() => rolesData[props.roleId] || rolesData.executiver);

const activeTab = ref("briefing");

/** Role-based filtering — defaults to current role. */
const selectedRoles = ref<string[]>([props.roleId]);

const stickyIcon = computed(() => {
  if (selectedRoles.value.length === 0) return "🌐";
  if (selectedRoles.value.length === 1) return rolesData[selectedRoles.value[0]]?.icon || "📡";
  return "📡";
});
const stickyTitle = computed(() => {
  if (selectedRoles.value.length === 0) return t('rss.manager.sticky.allRolesTitle');
  if (selectedRoles.value.length === 1) return t('rss.manager.sticky.singleRoleTitle', { name: rolesData[selectedRoles.value[0]]?.name || '' });
  return t('rss.manager.sticky.multiRoleTitle', { n: selectedRoles.value.length });
});
const stickyDesc = computed(() => {
  if (selectedRoles.value.length === 0) return t('rss.manager.sticky.allRolesDesc', { feeds: feedsCount.value, articles: totalItems.value, today: todayCount.value });
  if (selectedRoles.value.length === 1) return rolesData[selectedRoles.value[0]]?.description || "";
  return rolesData[selectedRoles.value[0]]?.description || "";
});

const briefingViewMode = ref<"list" | "card" | "table">("list");
const seedsViewMode = ref<"table" | "card">("table");
const itemsViewMode = ref<"card" | "list" | "table">("table");
const collapsedGroups = reactive(new Set<string>());

function toggleGroup(key: string) {
  if (collapsedGroups.has(key)) {
    collapsedGroups.delete(key);
  } else {
    collapsedGroups.add(key);
  }
}

const roleCounts = computed(() => {
  const counts: Record<string, number> = { all: 0 };
  for (const rid of ROLE_IDS) {
    counts[rid] = seeds.value.filter(s => roleFromCategory(s.category) === rid).length;
    counts.all += counts[rid];
  }
  return counts;
});

function roleFromCategory(cat?: string): string {
  if (!cat) return "";
  return cat.split("/")[0] || "";
}

/** Get sub-category from a category_path (everything after the first /). */
function subCategory(cat?: string): string {
  if (!cat) return "";
  const idx = cat.indexOf("/");
  return idx >= 0 ? cat.slice(idx + 1) : "";
}

function roleColor(cat?: string): string {
  return ROLE_COLORS[roleFromCategory(cat)] || "#909399";
}

const localeTag = computed(() => locale.value === 'zh' ? 'zh-CN' : 'en-US');

/** Category options grouped by role domain — mirrors YiKnowledge directory structure. */
const categoryGroups = computed(() => [
  {
    label: t('rss.manager.categories.groups.executiver'),
    options: [
      { label: t('rss.manager.categories.options.executiver.industry'), value: "executiver/industry" },
      { label: t('rss.manager.categories.options.executiver.strategy'), value: "executiver/strategy" },
      { label: t('rss.manager.categories.options.executiver.roadmap'), value: "executiver/roadmap" },
      { label: t('rss.manager.categories.options.executiver.readingList'), value: "executiver/reading-list" }
    ]
  },
  {
    label: t('rss.manager.categories.groups.aier'),
    options: [
      { label: t('rss.manager.categories.options.aier.methodology'), value: "aier/methodology" },
      { label: t('rss.manager.categories.options.aier.foundations'), value: "aier/foundations" }
    ]
  },
  {
    label: t('rss.manager.categories.groups.engineer'),
    options: [
      { label: t('rss.manager.categories.options.engineer.ship'), value: "engineer/ship" },
      { label: t('rss.manager.categories.options.engineer.learnLessons'), value: "engineer/learn/lessons" },
      { label: t('rss.manager.categories.options.engineer.learnWins'), value: "engineer/learn/lessons/wins" },
      { label: t('rss.manager.categories.options.engineer.learnFailures'), value: "engineer/learn/lessons/failures" }
    ]
  },
  {
    label: t('rss.manager.categories.groups.sre'),
    options: [
      { label: t('rss.manager.categories.options.srer.release'), value: "srer/release" }
    ]
  },
  {
    label: t('rss.manager.categories.groups.producter'),
    options: [
      { label: t('rss.manager.categories.options.producter.frameworks'), value: "producter/frameworks" }
    ]
  },
  {
    label: t('rss.manager.categories.groups.curator'),
    options: [
      { label: t('rss.manager.categories.options.curator.templates'), value: "curator/templates" }
    ]
  },
  {
    label: t('rss.manager.categories.groups.leader'),
    options: [
      { label: t('rss.manager.categories.options.leader.leadership'), value: "leader/leadership" },
      { label: t('rss.manager.categories.options.leader.architecture'), value: "leader/architecture" }
    ]
  }
]);

// ═══════════════════════════════════════════════
// Seeds
const seeds = ref<RssSeedDocument[]>([]);
const seedsLoading = ref(false);
const seedSearch = ref("");
const parsingSeed = ref("");
const seedToggling = ref("");
const parseTimes = reactive<Record<string, number>>({});
const seedIntervals = reactive<Record<string, number>>({});
const seedArticleCounts = reactive<Record<string, number>>({});

/** Sticky bar: role-filtered feed count. */
const feedsCount = computed(() => {
  if (!selectedRoles.value.length) return seeds.value.length;
  return seeds.value.filter(s => selectedRoles.value.includes(roleFromCategory(s.category))).length;
});

/** Sticky bar: today's article count for selected roles. */
const todayCount = ref(0);
async function loadTodayCount() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const base = { pageNum: 1, pageSize: 1, publishedStart: startOfDay.getTime(), publishedEnd: endOfDay.getTime() };
    const roles = selectedRoles.value.length ? selectedRoles.value : [];
    if (!roles.length) {
      const res = await getRssList(base);
      todayCount.value = res.data?.total ?? 0;
    } else if (roles.length === 1) {
      const res = await getRssList({ ...base, categoryPrefix: roles[0] });
      todayCount.value = res.data?.total ?? 0;
    } else {
      const results = await Promise.allSettled(roles.map(rid => getRssList({ ...base, categoryPrefix: rid })));
      todayCount.value = results.reduce((sum, r) => sum + (r.status === "fulfilled" ? r.value.data?.total ?? 0 : 0), 0);
    }
  } catch { todayCount.value = 0; }
}

const filteredSeeds = computed(() => {
  let list = seeds.value;
  if (seedSearch.value) {
    const q = seedSearch.value.toLowerCase();
    list = list.filter(s =>
      (s.name || "").toLowerCase().includes(q) || (s.url || "").toLowerCase().includes(q)
    );
  }
  if (selectedRoles.value.length) {
    list = list.filter(s => selectedRoles.value.includes(roleFromCategory(s.category)));
  }
  return list;
});

const seedOptions = computed(() => {
  const roleSet = selectedRoles.value.length ? new Set(selectedRoles.value) : null;
  return seeds.value
    .filter(s => s.name && (!roleSet || roleSet.has(roleFromCategory(s.category))))
    .map(s => ({ label: s.name!, value: s.name! }))
});

const seedDialogVisible = ref(false);
const editingSeed = ref<RssSeedDocument | null>(null);
const seedSaving = ref(false);
const seedForm = reactive<{ url: string; name: string; category: string; interval: number; enabled: boolean }>({
  url: "", name: "", category: "", interval: 0, enabled: true
});

const parseAllLoading = ref(false);

function openSeedDialog(row?: RssSeedDocument) {
  editingSeed.value = row || null;
  if (row) {
    seedForm.url = row.url || "";
    seedForm.name = row.name || "";
    seedForm.category = row.category || "";
    seedForm.interval = seedIntervals[row.url] || 0;
    seedForm.enabled = row.enabled !== false;
  } else {
    seedForm.url = "";
    seedForm.name = "";
    seedForm.category = "";
    seedForm.interval = 0;
    seedForm.enabled = true;
  }
  seedDialogVisible.value = true;
}

async function saveSeed() {
  if (!seedForm.url.trim()) { ElMessage.warning(t('rss.manager.seeds.save.urlRequired')); return; }
  seedSaving.value = true;
  try {
    const patch: Partial<RssSeedDocument> & { url: string } = {
      url: seedForm.url.trim(),
      name: seedForm.name.trim(),
      category: seedForm.category.trim() || undefined,
      enabled: seedForm.enabled
    };
    if (seedForm.interval > 0) patch.interval = seedForm.interval;
    else patch.interval = undefined;

    if (editingSeed.value?.key) {
      await updateSeed(editingSeed.value.key, patch);
      ElMessage.success(t('rss.manager.seeds.save.updateOk'));
    } else {
      const key = `seed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await createSeed({ key, ...patch });
      ElMessage.success(t('rss.manager.seeds.save.addOk'));
    }
    seedDialogVisible.value = false;
    await loadSeeds();
    if (activeTab.value === "seeds") loadSeedArticleCounts();
  } catch (e) {
    ElMessage.error(errorMessage(e) || t('rss.manager.seeds.save.fail'));
  } finally {
    seedSaving.value = false;
  }
}

async function removeSeed(row: RssSeedDocument) {
  if (!row.key) return;
  try {
    await deleteSeed(row.key);
    ElMessage.success(t('rss.manager.seeds.remove.ok'));
    await loadSeeds();
    if (activeTab.value === "seeds") loadSeedArticleCounts();
  } catch (e) {
    ElMessage.error(errorMessage(e) || t('rss.manager.seeds.remove.fail'));
  }
}

async function toggleSeed(row: RssSeedDocument) {
  if (!row.key) return;
  seedToggling.value = row.key;
  try {
    const next = row.enabled === false;
    await updateSeed(row.key, { enabled: next });
    row.enabled = next;
    ElMessage.success(next ? t('rss.manager.seeds.toggle.enabled') : t('rss.manager.seeds.toggle.disabled'));
  } catch (e) {
    ElMessage.error(errorMessage(e) || t('rss.manager.seeds.toggle.fail'));
  } finally {
    seedToggling.value = "";
  }
}

async function parseOneFeed(row: RssSeedDocument) {
  parsingSeed.value = row.url;
  try {
    const res = await parseFeed(row.url, row.name);
    const d = res.data;
    parseTimes[row.url] = Date.now();
    ElMessage.success(t('rss.manager.seeds.parseOne.ok', { saved: d.saved_count || 0, updated: d.updated_count || 0 }));
    await loadItems();
    loadTodayCount();
  } catch (e) {
    const msg = errorMessage(e) || t('rss.manager.seeds.parseOne.fail');
    ElMessage.error(msg);
  } finally {
    parsingSeed.value = "";
  }
}

async function parseAllFeeds() {
  parseAllLoading.value = true;
  try {
    const res = await parseAllEnabledFeeds();
    const d = res.data;
    ElMessage.success(t('rss.manager.seeds.parseAll.ok', { total: d.total_sources, ok: d.success_count, fail: d.failed_count }));
    const now = Date.now();
    for (const s of seeds.value) { if (s.enabled !== false) parseTimes[s.url] = now; }
    await loadItems();
    loadTodayCount();
  } catch (e) {
    const msg = errorMessage(e) || t('rss.manager.seeds.parseAll.fail');
    ElMessage.error(msg);
  } finally {
    parseAllLoading.value = false;
  }
}

const SEEDS_SEEDED_KEY = "yivad.rss.seedsSeeded";

async function seedExampleSeeds(): Promise<RssSeedDocument[]> {
  const out: RssSeedDocument[] = [];
  for (const s of EXAMPLE_SEEDS) {
    try {
      await createSeed({ key: s.key, url: s.url, name: s.name, category: s.category, enabled: s.enabled });
      out.push(s);
    } catch { /* skip duplicates */ }
  }
  return out;
}

/** Ensure all example seeds exist (idempotent — skips existing keys). */
async function ensureExampleSeeds(existing: RssSeedDocument[]): Promise<RssSeedDocument[]> {
  const existingKeys = new Set(existing.map(s => s.key).filter(Boolean));
  const missing = EXAMPLE_SEEDS.filter(s => !existingKeys.has(s.key));
  if (!missing.length) return [];
  const added: RssSeedDocument[] = [];
  for (const s of missing) {
    try {
      await createSeed({ key: s.key, url: s.url, name: s.name, category: s.category, enabled: s.enabled });
      added.push(s);
    } catch { /* skip */ }
  }
  return added;
}

async function loadSeeds() {
  seedsLoading.value = true;
  try {
    const res = await getSeedList();
    const list = res.data?.list ?? [];
    if (list.length) {
      seeds.value = list;
      saveBool(SEEDS_SEEDED_KEY, true);
      // Always ensure missing example seeds are added
      const added = await ensureExampleSeeds(list);
      if (added.length) {
        seeds.value = [...list, ...added];
        ElMessage.success(t('rss.manager.seeds.added', { n: added.length }));
      }
    } else if (!loadBool(SEEDS_SEEDED_KEY, false)) {
      const seeded = await seedExampleSeeds();
      seeds.value = seeded;
      if (seeded.length) saveBool(SEEDS_SEEDED_KEY, true);
    } else {
      seeds.value = [];
    }
    for (const s of seeds.value) {
      if (s.interval) seedIntervals[s.url] = s.interval;
    }
  } catch { seeds.value = []; }
  finally { seedsLoading.value = false; }
}

/** Per-seed article counts — only loaded when the Seeds tab is visible. */
function loadSeedArticleCounts() {
  for (const s of seeds.value) {
    getRssList({ source_url: s.url, pageSize: 1 })
      .then(res => { seedArticleCounts[s.url] = res.data?.total ?? 0; })
      .catch(() => { seedArticleCounts[s.url] = 0; });
  }
}

// ═══════════════════════════════════════════════
// Quick Parse
// ═══════════════════════════════════════════════
const quickParseVisible = ref(false);
const quickParseLoading = ref(false);
const quickParseForm = reactive({ url: "", name: "" });

async function doQuickParse() {
  if (!quickParseForm.url.trim()) { ElMessage.warning(t('rss.manager.seeds.quickParse.urlRequired')); return; }
  quickParseLoading.value = true;
  try {
    const res = await parseFeed(quickParseForm.url.trim(), quickParseForm.name.trim() || undefined);
    const d = res.data;
    ElMessage.success(t('rss.manager.seeds.quickParse.ok', { saved: d.saved_count || 0, updated: d.updated_count || 0 }));
    quickParseVisible.value = false;
    quickParseForm.url = "";
    quickParseForm.name = "";
    await loadItems();
    loadTodayCount();
  } catch (e) {
    ElMessage.error(errorMessage(e) || t('rss.manager.seeds.quickParse.fail'));
  } finally {
    quickParseLoading.value = false;
  }
}

// ═══════════════════════════════════════════════
// Items
// ═══════════════════════════════════════════════
const items = ref<RssItemDocument[]>([]);
const itemsLoading = ref(false);
const itemSearch = ref("");
const itemCategoryFilter = ref("");
const itemSourceFilter = ref("");
const itemDateRange = ref<[string, string] | null>(null);
const timePreset = ref<"all" | "today" | "week" | "month" | "">("all");
const itemSortKey = ref("published_parsed");
const itemPage = ref(1);
const itemPageSize = 20;
const totalItems = ref(0);
const selectedItems = ref<RssItemDocument[]>([]);

// ── Count-up animation for the header stat pills (mirrors knowledgeBase's live deltas) ──
function useCountUp(source: () => number, duration = 600) {
  const display = ref(0);
  let raf = 0;
  watch(source, to => {
    cancelAnimationFrame(raf);
    const from = display.value;
    const start = performance.now();
    const delta = to - from;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      display.value = Math.round(from + delta * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else display.value = to;
    };
    raf = requestAnimationFrame(step);
  }, { immediate: true });
  return display;
}

const animatedFeeds = useCountUp(() => feedsCount.value);
const animatedArticles = useCountUp(() => totalItems.value);
const animatedToday = useCountUp(() => todayCount.value);

/** Sub-category options for selected roles. */
const categoryOptions = computed(() => {
  const roleSet = selectedRoles.value.length ? new Set(selectedRoles.value) : null;
  const seen = new Set<string>();
  const opts: { label: string; value: string; icon: string }[] = [];
  for (const s of seeds.value) {
    const cat = s.category || "";
    if (!cat || !cat.includes("/")) continue;
    const rid = roleFromCategory(cat);
    if (roleSet && !roleSet.has(rid)) continue;
    if (seen.has(cat)) continue;
    seen.add(cat);
    const sub = cat.slice(rid.length + 1);
    opts.push({ label: sub, value: cat, icon: "📁" });
  }
  return opts.sort((a, b) => a.label.localeCompare(b.label));
});

const filteredItems = computed(() => {
  if (selectedRoles.value.length <= 1) return items.value;
  return items.value.filter(i => selectedRoles.value.includes(roleFromCategory(i.category_path)));
});

const hasActiveFilters = computed(() =>
  !!(itemSearch.value || itemCategoryFilter.value || itemSourceFilter.value || itemDateRange.value)
);

function onSelectionChange(rows: RssItemDocument[]) {
  selectedItems.value = rows;
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;
function onItemFilterChange() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { itemPage.value = 1; loadItems(); }, 300);
}

function clearFilters() {
  itemSearch.value = "";
  itemCategoryFilter.value = "";
  itemSourceFilter.value = "";
  itemDateRange.value = null;
  timePreset.value = "all";
  itemSortKey.value = "published_parsed";
  itemPage.value = 1;
  loadItems();
}

function fmtDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function setTimePreset(preset: string | number | boolean | undefined) {
  const p = String(preset ?? "");
  if (p === "all") {
    itemDateRange.value = null;
  } else {
    const end = new Date();
    const start = new Date();
    if (p === "today") start.setDate(end.getDate());
    else if (p === "week") start.setDate(end.getDate() - 7);
    else start.setDate(end.getDate() - 30);
    itemDateRange.value = [fmtDate(start), fmtDate(end)];
  }
  itemPage.value = 1;
  loadItems();
}

function buildItemParams(pageNum: number, pageSize: number): RssListParams {
  const params: RssListParams = { pageNum, pageSize };
  if (itemSearch.value) params.search = itemSearch.value;
  if (itemCategoryFilter.value) {
    params.categoryPrefix = itemCategoryFilter.value;
  } else if (selectedRoles.value.length === 1) {
    params.categoryPrefix = selectedRoles.value[0];
  }
  if (itemSourceFilter.value) params.source_name = itemSourceFilter.value;
  if (itemDateRange.value?.length === 2) {
    params.publishedStart = new Date(itemDateRange.value[0]).getTime();
    params.publishedEnd = new Date(itemDateRange.value[1] + 'T23:59:59').getTime();
  }
  const sk = itemSortKey.value;
  if (sk === "published_parsed-asc") {
    params.orderBy = "published_parsed";
    params.orderType = "asc";
  } else if (sk === "published_parsed") {
    params.orderBy = "published_parsed";
    params.orderType = "desc";
  } else {
    params.orderBy = sk;
    params.orderType = "asc";
  }
  return params;
}

async function loadItems() {
  itemsLoading.value = true;
  selectedItems.value = [];
  try {
    const res = await getRssList(buildItemParams(itemPage.value, itemPageSize));
    items.value = res.data?.list ?? [];
    totalItems.value = res.data?.total ?? 0;
  } catch { items.value = []; totalItems.value = 0; }
  finally { itemsLoading.value = false; }
}

const exportingItems = ref(false);
async function exportItems() {
  exportingItems.value = true;
  try {
    const res = await getRssList(buildItemParams(1, 10000));
    const list = res.data?.list ?? [];
    if (!list.length) { ElMessage.info(t('rss.manager.items.export.noData')); return; }
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const headers = ["title", "link", "source_name", "author", "category_path", "published", "summary"];
    const rows = list.map(i => headers.map(h => esc(i[h as keyof RssItemDocument])).join(","));
    const csv = "﻿" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rss-articles-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success(t('rss.manager.items.export.ok', { n: list.length }));
  } catch (e) {
    ElMessage.error(errorMessage(e) || t('rss.manager.items.export.fail'));
  } finally { exportingItems.value = false; }
}

const RECENT_ARTICLES_KEY = "rss.recentArticles";
const MAX_RECENT_ARTICLES = 8;
const recentArticles = ref<RssItemDocument[]>(loadJson<RssItemDocument[]>(RECENT_ARTICLES_KEY, []));

function addRecentArticle(row: RssItemDocument) {
  const id = row.key ?? row.link;
  recentArticles.value = [row, ...recentArticles.value.filter(a => (a.key ?? a.link) !== id)].slice(0, MAX_RECENT_ARTICLES);
  saveJson(RECENT_ARTICLES_KEY, recentArticles.value);
}

function clearRecentArticles() {
  recentArticles.value = [];
  saveJson(RECENT_ARTICLES_KEY, []);
}

function onArticleRowClick(row: RssItemDocument) {
  if (row.link) window.open(row.link, "_blank", "noopener,noreferrer");
  addRecentArticle(row);
}

function trimSummary(summary: string): string {
  const text = stripHtml(summary);
  return text.length > 120 ? text.slice(0, 120) + "…" : text;
}

async function removeItem(row: RssItemDocument) {
  if (!row.key) return;
  try {
    await deleteRssItem(row.key);
    ElMessage.success(t('rss.manager.items.delete.ok'));
    await loadItems();
    loadTodayCount();
  } catch (e) {
    ElMessage.error(errorMessage(e) || t('rss.manager.items.delete.fail'));
  }
}

async function removeBriefingItem(row: RssItemDocument) {
  if (!row.key) return;
  try {
    await deleteRssItem(row.key);
    ElMessage.success(t('rss.manager.items.delete.ok'));
    await loadBriefing();
    loadTodayCount();
  } catch (e) {
    ElMessage.error(errorMessage(e) || t('rss.manager.items.delete.fail'));
  }
}

async function batchDelete() {
  if (selectedItems.value.length === 0) return;
  try {
    await ElMessageBox.confirm(
      t('rss.manager.items.batch.confirm', { n: selectedItems.value.length }),
      t('rss.manager.items.batch.title'),
      { confirmButtonText: t('rss.manager.items.batch.deleteBtn'), cancelButtonText: t('rss.manager.common.cancel'), type: "warning" }
    );
  } catch { return; }
  let deleted = 0;
  for (const item of selectedItems.value) {
    if (!item.key) continue;
    try { await deleteRssItem(item.key); deleted++; } catch { /* skip */ }
  }
  ElMessage.success(t('rss.manager.items.batch.ok', { n: deleted }));
  await loadItems();
  loadTodayCount();
}

// ═══════════════════════════════════════════════
// Daily briefing
// ═══════════════════════════════════════════════
const briefingItems = ref<RssItemDocument[]>([]);
const briefingLoading = ref(false);
const briefingSearch = ref("");
const briefingCategoryFilter = ref("");
const briefingGroupBy = ref<"source" | "category">("source");

const briefingDate = ref(new Date());

const briefingDateLabel = computed(() => {
  const d = briefingDate.value;
  const today = new Date();
  const isTodayVal = d.toDateString() === today.toDateString();
  const dateStr = d.toLocaleDateString(localeTag.value, { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  return isTodayVal ? t('rss.manager.briefing.todayLabel', { date: dateStr }) : dateStr;
});

const isToday = computed(() => {
  const d = briefingDate.value;
  const today = new Date();
  return d.toDateString() === today.toDateString();
});

function goToPrevDay() {
  const d = new Date(briefingDate.value);
  d.setDate(d.getDate() - 1);
  briefingDate.value = d;
  loadBriefing();
}

function goToNextDay() {
  const d = new Date(briefingDate.value);
  d.setDate(d.getDate() + 1);
  briefingDate.value = d;
  loadBriefing();
}

function goToToday() {
  briefingDate.value = new Date();
  loadBriefing();
}

function goToBriefingToday() {
  if (activeTab.value === "briefing") goToToday();
  else switchTab("briefing");
}

interface BriefingGroup {
  key: string;
  label: string;
  icon: string;
  color?: string;
  items: RssItemDocument[];
}

const filteredBriefingItems = computed(() => {
  let list = briefingItems.value;
  if (briefingSearch.value) {
    const q = briefingSearch.value.toLowerCase();
    list = list.filter(i =>
      [i.title, i.author, i.summary, i.source_name]
        .some(v => !!v && v.toLowerCase().includes(q))
    );
  }
  if (briefingCategoryFilter.value) {
    const p = briefingCategoryFilter.value;
    list = list.filter(i => (i.category_path || "").startsWith(p));
  }
  return list;
});

const briefingGroups = computed<BriefingGroup[]>(() => {
  const byCategory = briefingGroupBy.value === "category";
  const groups = new Map<string, BriefingGroup>();
  for (const item of filteredBriefingItems.value) {
    const uncategorized = t('rss.manager.categories.uncategorized');
    const unknownSource = t('rss.manager.categories.unknownSource');
    const key = byCategory ? (item.category_path || uncategorized) : (item.source_name || unknownSource);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: byCategory ? (subCategory(item.category_path) || uncategorized) : key,
        icon: byCategory ? "📁" : "📡",
        color: byCategory ? roleColor(item.category_path) : undefined,
        items: []
      });
    }
    groups.get(key)!.items.push(item);
  }
  return [...groups.values()].sort((a, b) => b.items.length - a.items.length);
});

const allBriefingItems = computed(() => briefingGroups.value.flatMap(g => g.items));

const filteredBriefingCount = computed(() => filteredBriefingItems.value.length);

// ── Briefing analytics (complements the knowledgeBase dashboard charts) ──
const CHART_COLORS = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc", "#5ab1ef"];

/** Category distribution donut of today's briefing. */
const briefingCategoryOption = computed<ECOption>(() => {
  const counts = new Map<string, number>();
  const uncategorized = t('rss.manager.categories.uncategorized');
  for (const item of briefingItems.value) {
    const key = item.category_path || uncategorized;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const data = [...counts.entries()]
    .map(([key, value]) => ({ name: subCategory(key) || key, value, itemStyle: { color: roleColor(key) } }))
    .sort((a, b) => b.value - a.value);
  const articlePct = (p: any) => `${p.name}: ${p.value} (${p.percent}%)`;
  return {
    tooltip: { trigger: "item", formatter: articlePct },
    legend: { orient: "vertical", left: 0, top: "center", itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 10 }, type: "scroll" },
    series: [{
      type: "pie", radius: ["45%", "70%"], center: ["58%", "50%"],
      label: { show: true, fontSize: 10, formatter: (p: any) => `${p.name}\n${p.percent}%` },
      emphasis: { label: { fontSize: 14, fontWeight: "bold" } },
      data
    }]
  };
});

/** Top sources bar of today's briefing. */
const briefingSourceOption = computed<ECOption>(() => {
  const counts = new Map<string, number>();
  const unknownSource = t('rss.manager.categories.unknownSource');
  for (const item of briefingItems.value) {
    const label = item.source_name || unknownSource;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).reverse();
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "8%", top: "3%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", axisLabel: { fontSize: 9 } },
    yAxis: { type: "category", data: top.map(d => d[0]), axisLabel: { fontSize: 10 } },
    series: [{ type: "bar", barWidth: "60%", data: top.map((d, i) => ({ value: d[1], itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length], borderRadius: [0, 4, 4, 0] } })) }]
  };
});

// ── Volume trend (last N days) — independent of the browsed briefing date ──
const VOLUME_DAYS = 14;
const dailyVolume = ref<{ date: string; count: number }[]>([]);
const volumeLoading = ref(false);

async function loadDailyVolume() {
  volumeLoading.value = true;
  const roles = selectedRoles.value.length ? selectedRoles.value : [];
  const days: { date: string; start: number; end: number }[] = [];
  for (let i = VOLUME_DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
    days.push({ date: fmtDate(d), start, end });
  }
  try {
    const results = await Promise.allSettled(days.map(async day => {
      const base = { pageNum: 1, pageSize: 1, publishedStart: day.start, publishedEnd: day.end };
      if (!roles.length) return (await getRssList(base)).data?.total ?? 0;
      if (roles.length === 1) return (await getRssList({ ...base, categoryPrefix: roles[0] })).data?.total ?? 0;
      const per = await Promise.allSettled(roles.map(rid => getRssList({ ...base, categoryPrefix: rid })));
      return per.reduce((sum, r) => sum + (r.status === "fulfilled" ? r.value.data?.total ?? 0 : 0), 0);
    }));
    dailyVolume.value = days.map((day, i) => ({
      date: day.date,
      count: results[i].status === "fulfilled" ? results[i].value : 0
    }));
  } catch {
    dailyVolume.value = days.map(d => ({ date: d.date, count: 0 }));
  } finally {
    volumeLoading.value = false;
  }
}

const briefingVolumeOption = computed<ECOption>(() => ({
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  grid: { left: "3%", right: "4%", top: "8%", bottom: "3%", containLabel: true },
  xAxis: { type: "category", data: dailyVolume.value.map(d => d.date.slice(5)), axisLabel: { fontSize: 9 } },
  yAxis: { type: "value", axisLabel: { fontSize: 9 }, minInterval: 1 },
  series: [{ type: "bar", barWidth: "60%", itemStyle: { color: "#5470c6", borderRadius: [4, 4, 0, 0] }, data: dailyVolume.value.map(d => d.count) }]
}));

/** Today vs yesterday delta (borrows knowledgeBase's stat-delta concept). */
const todayDelta = computed(() => {
  const v = dailyVolume.value;
  if (v.length < 2) return 0;
  return v[v.length - 1].count - v[v.length - 2].count;
});

// ── Content completeness (mirrors knowledgeBase's Data Quality section) ──
function coverageColor(pct: number): string {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}

const briefingCoverage = computed(() => {
  const total = briefingItems.value.length;
  if (!total) return null;
  let withSummary = 0, withAuthor = 0, categorized = 0;
  for (const i of briefingItems.value) {
    if (i.summary) withSummary++;
    if (i.author) withAuthor++;
    if (i.category_path) categorized++;
  }
  const pct = (n: number) => Math.round((n / total) * 100);
  return [
    { key: "summary", label: t('rss.manager.briefing.coverage.withSummary'), count: withSummary, pct: pct(withSummary) },
    { key: "author", label: t('rss.manager.briefing.coverage.withAuthor'), count: withAuthor, pct: pct(withAuthor) },
    { key: "category", label: t('rss.manager.briefing.coverage.categorized'), count: categorized, pct: pct(categorized) }
  ];
});

function clearBriefingFilters() {
  briefingSearch.value = "";
  briefingCategoryFilter.value = "";
}

async function loadBriefing() {
  briefingLoading.value = true;
  try {
    const d = briefingDate.value;
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
    const baseParams = {
      pageNum: 1,
      pageSize: 200,
      publishedStart: startOfDay,
      publishedEnd: endOfDay,
      orderBy: "published_parsed" as string,
      orderType: "desc" as const
    };
    const roles = selectedRoles.value.length ? selectedRoles.value : [];
    if (!roles.length) {
      const res = await getRssList(baseParams);
      briefingItems.value = res.data?.list ?? [];
    } else if (roles.length === 1) {
      const res = await getRssList({ ...baseParams, categoryPrefix: roles[0] });
      briefingItems.value = res.data?.list ?? [];
    } else {
      const results = await Promise.allSettled(roles.map(rid => getRssList({ ...baseParams, categoryPrefix: rid })));
      const seen = new Set<string>();
      const allItems: RssItemDocument[] = [];
      for (const r of results) {
        if (r.status !== "fulfilled") continue;
        for (const item of (r.value.data?.list ?? [])) {
          const k = item.key || item.link;
          if (k && !seen.has(k)) { seen.add(k); allItems.push(item); }
        }
      }
      allItems.sort((a, b) => (Number(b.published_parsed) || 0) - (Number(a.published_parsed) || 0));
      briefingItems.value = allItems;
    }
  } catch {
    briefingItems.value = [];
  } finally {
    briefingLoading.value = false;
  }
}

function openArticleLink(item: RssItemDocument) {
  if (item.link) window.open(item.link, "_blank", "noopener,noreferrer");
}

const articleDetailVisible = ref(false);
const detailArticle = ref<RssItemDocument | null>(null);
const articleBody = ref("");
const articleBodyLoading = ref(false);
const articleBodyError = ref(false);

const { render: renderMarkdown } = useMarkdown();
const renderedArticleBody = computed(() => (articleBody.value ? renderMarkdown(articleBody.value) : ""));

async function openArticleDetail(row: RssItemDocument) {
  detailArticle.value = row;
  articleDetailVisible.value = true;
  articleBody.value = "";
  articleBodyError.value = false;
  // Article body is document content — read from disk via file read, not MongoDB metadata.
  if (row.file_path) {
    articleBodyLoading.value = true;
    try {
      const res = await readKnowledgeFile(row.file_path);
      articleBody.value = res.content || "";
    } catch {
      articleBodyError.value = true;
    } finally {
      articleBodyLoading.value = false;
    }
  } else {
    articleBodyError.value = true;
  }
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════
function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function formatDate(raw?: string): string {
  if (!raw) return "-";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw.slice(0, 10);
    return d.toLocaleDateString(localeTag.value, { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch { return raw.slice(0, 10); }
}

function formatRelativeTime(raw?: string): string {
  if (!raw) return "-";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw.slice(0, 10);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return t('rss.manager.time.justNow');
    if (diff < 3600000) return t('rss.manager.time.minutesAgo', { n: Math.round(diff / 60000) });
    if (diff < 86400000) return t('rss.manager.time.hoursAgo', { n: Math.round(diff / 3600000) });
    if (diff < 604800000) return t('rss.manager.time.daysAgo', { n: Math.round(diff / 86400000) });
    return d.toLocaleDateString(localeTag.value, { month: "2-digit", day: "2-digit" });
  } catch { return raw.slice(0, 10); }
}

function formatTime(d: Date): string {
  return d.toLocaleString(localeTag.value, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatTimeAgo(ts?: number): string {
  if (!ts) return "-";
  const diff = Date.now() - ts;
  if (diff < 60000) return t('rss.manager.time.justNow');
  if (diff < 3600000) return t('rss.manager.time.minutesAgo', { n: Math.round(diff / 60000) });
  if (diff < 86400000) return t('rss.manager.time.hoursAgo', { n: Math.round(diff / 3600000) });
  return t('rss.manager.time.daysAgo', { n: Math.round(diff / 86400000) });
}

function formatInterval(seconds: number): string {
  if (!seconds || seconds <= 0) return "-";
  if (seconds < 120) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

function switchTab(tab: "briefing" | "seeds" | "items") {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  onTabChange(tab);
}

function onTabChange(tab: string | number) {
  if (tab === "briefing") { briefingDate.value = new Date(); loadBriefing(); }
  else if (tab === "items") loadItems();
  else if (tab === "seeds") { loadSeeds(); loadSeedArticleCounts(); }
}

onMounted(() => {
  Promise.allSettled([loadBriefing(), loadSeeds(), loadItems(), loadTodayCount(), loadDailyVolume()]);
});

watch(selectedRoles, () => {
  if (activeTab.value === "briefing") loadBriefing();
  if (activeTab.value === "items") { itemPage.value = 1; loadItems(); }
  loadTodayCount();
  loadDailyVolume();
}, { deep: true });

watch(() => props.roleId, () => {
  selectedRoles.value = [props.roleId];
});
</script>

<style scoped lang="scss">
.rss-role {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: calc(100vh - 95px);
  min-height: 0;
  overflow: auto;
  background: var(--el-bg-color-page);
}

// ── Header (role nav) ──
.rss-role__header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 24px 10px;
  background: var(--el-bg-color-page);
}
.rss-role__breadcrumb { flex-shrink: 0; }

.rss-role__role-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}
.rss-role__role-nav-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 16px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  cursor: pointer;
  font-size: 12px;
  color: var(--el-text-color-regular);
  transition: all .15s;
  &:hover { border-color: var(--el-color-primary-light-5); color: var(--el-color-primary); }
  &.is-active { background: var(--el-color-primary); border-color: var(--el-color-primary); color: #fff; }
}
.rss-role__role-nav-icon { font-size: 13px; }

// ── Sticky Header Bar ──
.rss-role__sticky-bar {
  position: sticky;
  top: 46px;
  z-index: 9;
  margin: 0 24px;
  padding: 14px 20px 16px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 12px rgba(0, 0, 0, .06);
  backdrop-filter: blur(8px);
}
.rss-role__sticky-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.rss-role__sticky-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.rss-role__sticky-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--el-color-primary-light-9);
  font-size: 22px;
  flex-shrink: 0;
}
.rss-role__sticky-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.rss-role__sticky-name { margin: 0; font-size: 18px; font-weight: 700; line-height: 1.2; }
.rss-role__sticky-desc {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rss-role__sticky-right { display: flex; gap: 6px; flex-shrink: 0; }

.rss-role__stat-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 10px;
  background: var(--el-fill-color-light);
  min-width: 92px;
  cursor: pointer;
  transition: transform .15s, box-shadow .15s;
  &:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0, 0, 0, .06); }
}
.rss-role__stat-pill--feeds { background: var(--el-color-primary-light-9); }
.rss-role__stat-pill--accent { background: var(--el-color-primary-light-8); }
.rss-role__stat-pill-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--el-bg-color);
  font-size: 16px;
  flex-shrink: 0;
}
.rss-role__stat-pill-info { display: flex; flex-direction: column; gap: 1px; }
.rss-role__stat-pill-value { font-size: 17px; font-weight: 700; color: var(--el-text-color-primary); line-height: 1.1; }
.rss-role__stat-pill--feeds .rss-role__stat-pill-value,
.rss-role__stat-pill--accent .rss-role__stat-pill-value { color: var(--el-color-primary); }
.rss-role__stat-pill-label { font-size: 10px; color: var(--el-text-color-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: .3px; }
.rss-role__stat-pill-delta {
  margin-left: 4px;
  font-size: 11px;
  font-weight: 700;
  &.is-up { color: #67c23a; }
  &.is-down { color: #f56c6c; }
}

// ── Body: sidebar + content ──
.rss-role__body {
  display: flex;
  flex: 1;
  min-height: 0;
  margin: 12px 24px 0;
  gap: 0;
}

// ── Sidebar ──
.rss-role__sidebar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 200px;
  flex-shrink: 0;
  padding: 8px 10px 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  align-self: flex-start;
  position: sticky;
  top: 170px;
  overflow: hidden;
}

.rss-role__sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: var(--el-text-color-regular);
  transition: all .15s;
  text-align: left;
  width: 100%;
  white-space: nowrap;
  &:hover { background: var(--el-fill-color-light); color: var(--el-text-color-primary); }
  &.is-active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 600;
    box-shadow: inset 3px 0 0 var(--el-color-primary);
  }
}
.rss-role__sidebar-icon { font-size: 18px; flex-shrink: 0; }
.rss-role__sidebar-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.rss-role__sidebar-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
  .rss-role__sidebar-item.is-active & {
    background: var(--el-color-primary);
    color: #fff;
  }
}

.rss-role__sidebar-title {
  padding: 2px 14px 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  color: var(--el-text-color-secondary);
}
.rss-role__sidebar-view {
  padding: 4px 8px 8px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) { display: flex; width: 100%; }
  :deep(.el-radio-button) { flex: 1; }
  :deep(.el-radio-button__inner) { width: 100%; text-align: center; padding: 4px 0; font-size: 12px; }
}

// ── Content ──
.rss-role__content {
  flex: 1;
  min-width: 0;
  margin-left: 16px;
  overflow: auto;
}

// ── Section cards ──
.rss-role__section {
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  animation: rss-section-in 0.25s ease;
}
@keyframes rss-section-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.rss-role__section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-wrap: wrap;
}
.rss-role__section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.rss-role__section-body {
  padding: 16px 20px;
}

// ── Toolbar ──
.rss-role__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.rss-role__toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}
.rss-role__result-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

// ── Active filters ──
.rss-role__active-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

// ── Text helpers ──
.rss-role__text-muted { color: var(--el-text-color-placeholder); font-size: 12px; }
.rss-role__text-ok { color: #10b981; font-weight: 600; }
.rss-role__text-err { color: #f56c6c; font-weight: 600; }

// ── Category accent (role color coding) ──
.rss-role__cat-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
  flex-shrink: 0;
}
.rss-role__cat-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

// ── Category path breadcrumb ──
.rss-role__category-path {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
}
.rss-role__category-seg-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.rss-role__category-sep {
  margin: 0 1px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-weight: 700;
  flex-shrink: 0;
}

.rss-role__schedule-badge {
  font-size: 11px;
  font-weight: 600;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  padding: 1px 7px;
  border-radius: 4px;
}
.rss-role__article-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

// ── Item title ──
.rss-role__item-title {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.rss-role__item-link {
  color: var(--el-text-color-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
  line-height: 1.4;
  &:hover { color: var(--el-color-primary); text-decoration: underline; }
}
.rss-role__seed-url {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  max-width: 100%;
}
.rss-role__seed-url-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.rss-role__recent-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}
.rss-role__recent-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-right: 2px;
}
.rss-role__recent-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  font-size: 12px;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px;
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s;
  &:hover { border-color: var(--el-color-primary); box-shadow: 0 1px 6px rgba(0, 0, 0, .08); }
}
.rss-role__recent-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.rss-role__recent-clear {
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 4px;
  &:hover { color: var(--el-color-danger); }
}
.rss-role__article-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.rss-role__article-detail-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rss-role__article-detail-field {
  display: flex;
  gap: 12px;
  font-size: 13px;
  b { min-width: 80px; color: var(--el-text-color-secondary); font-weight: 600; }
  span { color: var(--el-text-color-primary); word-break: break-all; }
}
.rss-role__article-detail-summary {
  b { font-size: 13px; color: var(--el-text-color-secondary); }
  p {
    margin: 6px 0 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-primary);
    max-height: 240px;
    overflow: auto;
    white-space: pre-wrap;
  }
}
.rss-role__article-detail-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.rss-role__article-detail-body {
  border-top: 1px dashed var(--el-border-color-lighter);
  padding-top: 12px;
}
.rss-role__article-detail-body-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  b { font-size: 13px; color: var(--el-text-color-secondary); }
}
.rss-role__article-detail-body-path {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  font-family: monospace;
  word-break: break-all;
}
.rss-role__article-detail-body-content {
  max-height: 320px;
  overflow: auto;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  font-size: 13px;
  line-height: 1.6;
}
.rss-role__article-detail-body-state {
  min-height: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  border: 1px dashed var(--el-border-color-lighter);
  border-radius: 8px;
  &--empty { padding: 16px; }
}
.rss-role__article-detail-body-hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.rss-role__item-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  flex-wrap: wrap;
}
.rss-role__item-source {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}
.rss-role__item-summary-inline {
  color: var(--el-text-color-placeholder);
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
  display: inline-block;
  vertical-align: bottom;
}
.rss-role__date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

// ── Pagination ──
.rss-role__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

// ── Form hints ──
.rss-role__form-hint {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  line-height: 1.4;
}

// ── Daily briefing ──
.rss-briefing__date-nav {
  display: flex;
  align-items: center;
  gap: 2px;
}
.rss-briefing__date {
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  min-width: 180px;
  text-align: center;
}

// ── Briefing analytics charts ──
.rss-briefing__charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}
.rss-briefing__chart {
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  background: var(--el-bg-color);
}
.rss-briefing__chart-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}
.rss-briefing__chart--full {
  grid-column: 1 / -1;
}

// ── Briefing content completeness strip ──
.rss-briefing__coverage {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.rss-briefing__coverage-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
}
.rss-briefing__coverage-count {
  font-size: 15px;
  font-weight: 700;
  font-family: DIN, monospace;
}
.rss-briefing__coverage-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.rss-briefing__coverage-pct {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.rss-briefing__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 48px 0;
  color: var(--el-text-color-secondary);
}
.rss-briefing__empty-icon { font-size: 40px; }
.rss-briefing__empty-title { margin: 0; font-size: 14px; font-weight: 600; color: var(--el-text-color-primary); }
.rss-briefing__empty-hint { margin: 0; font-size: 12px; color: var(--el-text-color-placeholder); }

.rss-briefing__groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.rss-briefing__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  & + & {
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
.rss-briefing__group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  cursor: pointer;
  user-select: none;
  &:hover .rss-briefing__group-chevron { color: var(--el-color-primary); }
}
.rss-briefing__group-chevron {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  transition: transform 0.2s ease;
  &.is-collapsed { transform: rotate(0deg); }
  &:not(.is-collapsed) { transform: rotate(90deg); }
}
.rss-briefing__group-icon { font-size: 16px; }
.rss-briefing__group-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}
.rss-briefing__group-label { font-size: 14px; font-weight: 700; color: var(--el-text-color-primary); }
.rss-briefing__group-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
}

.rss-briefing__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: opacity 0.2s ease;
}
.rss-briefing__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.15s;
  cursor: pointer;
  & + & { margin-top: 8px; }
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
}
.rss-briefing__item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.rss-briefing__item-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.rss-briefing__item-title {
  color: var(--el-text-color-primary);
  font-weight: 600;
  font-size: 13px;
  line-height: 1.4;
  cursor: pointer;
  flex: 1;
  min-width: 0;
  .rss-briefing__item:hover & { color: var(--el-color-primary); }
}
.rss-briefing__item-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  flex-wrap: wrap;
}
.rss-briefing__item-summary {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rss-briefing__item-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

// ── Table hover ──
:deep(.el-table__body tr) { transition: background-color .15s ease; }
:deep(.el-table__body tr:hover > td) { background-color: var(--el-color-primary-light-9) !important; }

// ── Card View (Articles) ──
.rss-role__items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}
.rss-role__items-empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 48px 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.rss-role__items-empty p { margin: 0; }
.rss-role__items-empty-hint { font-size: 12px; color: var(--el-text-color-placeholder); }
.rss-role__item-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow .2s, border-color .2s;
  cursor: pointer;
}
.rss-role__item-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.rss-role__item-card-date {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.rss-role__item-card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rss-role__item-card-meta {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.rss-role__item-card-summary {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rss-role__item-card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: auto;
  padding-top: 4px;
}

// ── Seed Card ──
.rss-role__seed-card {
  border-radius: 10px;
  cursor: default;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover { transform: translateY(-2px); }
  :deep(.el-card__body) { padding: 14px; display: flex; flex-direction: column; gap: 8px; }
}
.rss-role__seed-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.rss-role__seed-card-name { font-size: 14px; font-weight: 600; }
.rss-role__seed-card-url { margin: 0; font-size: 12px; color: var(--el-text-color-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rss-role__seed-card-meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--el-text-color-placeholder); }
.rss-role__seed-card-actions { display: flex; align-items: center; gap: 4px; }

// ── List View (Articles) ──
.rss-role__items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rss-role__items-list-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition: box-shadow .2s, border-color .2s;
  cursor: pointer;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  }
}
.rss-role__items-list-source {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rss-role__items-list-title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rss-role__items-list-date {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
  flex-shrink: 0;
}
.rss-role__items-list-actions {
  display: flex;
  gap: 0;
  flex-shrink: 0;
  pointer-events: none;
  opacity: 0;
  transform: translateX(4px);
  transition: opacity .2s, transform .2s;
}
.rss-role__items-list-row:hover .rss-role__items-list-actions {
  pointer-events: auto;
  opacity: 1;
  transform: translateX(0);
}
</style>