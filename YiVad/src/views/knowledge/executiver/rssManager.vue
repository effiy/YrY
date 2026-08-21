<template>
  <div class="rss-role">
    <div class="rss-role__header">
      <el-breadcrumb separator="/" class="rss-role__breadcrumb">
        <el-breadcrumb-item :to="{ path: '/executiver' }">Executive</el-breadcrumb-item>
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
          <div class="rss-role__stat-pill">
            <span class="rss-role__stat-pill-value">{{ feedsCount }}</span>
            <span class="rss-role__stat-pill-label">Feeds</span>
          </div>
          <div class="rss-role__stat-pill">
            <span class="rss-role__stat-pill-value">{{ totalItems }}</span>
            <span class="rss-role__stat-pill-label">Articles</span>
          </div>
          <div class="rss-role__stat-pill rss-role__stat-pill--accent">
            <span class="rss-role__stat-pill-value">{{ todayCount }}</span>
            <span class="rss-role__stat-pill-label">Today</span>
          </div>
        </div>
      </div>
    </div>

    <div class="rss-role__body">
      <nav class="rss-role__sidebar">
        <div class="rss-role__sidebar-view">
          <template v-if="activeTab === 'briefing'">
            <el-radio-group v-model="briefingViewMode" size="small">
              <el-radio-button value="list">List</el-radio-button>
              <el-radio-button value="card">Card</el-radio-button>
            </el-radio-group>
          </template>
          <template v-else-if="activeTab === 'seeds'">
            <el-radio-group v-model="seedsViewMode" size="small">
              <el-radio-button value="table">Table</el-radio-button>
              <el-radio-button value="card">Card</el-radio-button>
            </el-radio-group>
          </template>
          <template v-else>
            <el-radio-group v-model="itemsViewMode" size="small">
              <el-radio-button value="card">Card</el-radio-button>
              <el-radio-button value="list">List</el-radio-button>
              <el-radio-button value="table">Table</el-radio-button>
            </el-radio-group>
          </template>
        </div>
        <button
          class="rss-role__sidebar-item"
          :class="{ 'is-active': activeTab === 'briefing' }"
          @click="activeTab = 'briefing'; onTabChange('briefing')"
        >
          <span class="rss-role__sidebar-icon">📰</span>
          <span class="rss-role__sidebar-label">每日简报</span>
          <span class="rss-role__sidebar-badge" :data-count="todayCount">{{ todayCount }}</span>
        </button>
        <button
          class="rss-role__sidebar-item"
          :class="{ 'is-active': activeTab === 'seeds' }"
          @click="activeTab = 'seeds'; onTabChange('seeds')"
        >
          <span class="rss-role__sidebar-icon">📡</span>
          <span class="rss-role__sidebar-label">Feed Sources</span>
          <span class="rss-role__sidebar-badge" :data-count="feedsCount">{{ feedsCount }}</span>
        </button>
        <button
          class="rss-role__sidebar-item"
          :class="{ 'is-active': activeTab === 'items' }"
          @click="activeTab = 'items'; onTabChange('items')"
        >
          <span class="rss-role__sidebar-icon">📄</span>
          <span class="rss-role__sidebar-label">Articles</span>
          <span class="rss-role__sidebar-badge" :data-count="totalItems">{{ totalItems }}</span>
        </button>
      </nav>

      <div class="rss-role__content">
        <!-- ═══ Briefing ═══ -->
        <section v-if="activeTab === 'briefing'" class="rss-role__section">
          <div class="rss-role__section-head">
            <h2 class="rss-role__section-title">📰 每日简报</h2>
            <div class="rss-briefing__date-nav">
              <el-button size="small" :icon="ArrowLeft" text @click="goToPrevDay" :disabled="briefingLoading" />
              <span class="rss-briefing__date">{{ briefingDateLabel }}</span>
              <el-button size="small" :icon="ArrowRight" text @click="goToNextDay" :disabled="isToday" />
              <el-button v-if="!isToday" size="small" text type="primary" @click="goToToday" :disabled="briefingLoading">Today</el-button>
            </div>
            <span class="rss-role__toolbar-right">
              <span v-if="filteredBriefingCount" class="rss-role__result-count">{{ filteredBriefingCount }} 篇文章 · {{ briefingGroups.length }} 个来源</span>
              <el-button size="small" :icon="Refresh" @click="loadBriefing" :loading="briefingLoading">刷新</el-button>
            </span>
          </div>

          <div v-loading="briefingLoading" class="rss-role__section-body">
            <div v-if="!briefingLoading && !filteredBriefingCount" class="rss-briefing__empty">
              <span class="rss-briefing__empty-icon">{{ isToday ? '🗞️' : '📭' }}</span>
              <p class="rss-briefing__empty-title">{{ isToday ? '今日暂无新文章' : '该日期暂无文章' }}</p>
              <p class="rss-briefing__empty-hint">{{ isToday ? '前往「📡 Feed Sources」添加源并解析，稍后即可在这里生成每日简报。' : '换个日期看看，或返回今日查看最新文章。' }}</p>
              <el-button v-if="!isToday" size="small" type="primary" @click="goToToday">返回今日</el-button>
            </div>

            <div v-else-if="briefingGroups.length" class="rss-briefing__groups">
              <!-- List view -->
              <template v-if="briefingViewMode === 'list'">
              <section v-for="group in briefingGroups" :key="group.key" class="rss-briefing__group">
                <header class="rss-briefing__group-header">
                  <span class="rss-briefing__group-icon">📡</span>
                  <span class="rss-briefing__group-label">{{ group.label }}</span>
                  <span class="rss-briefing__group-count">{{ group.items.length }}</span>
                </header>
                <ul class="rss-briefing__list">
                  <li v-for="item in group.items" :key="item.key || item.link" class="rss-briefing__item">
                    <div class="rss-briefing__item-main">
                      <div class="rss-briefing__item-head">
                        <span class="rss-briefing__item-title" @click="openArticleLink(item)">{{ item.title }}</span>
                      </div>
                      <div class="rss-briefing__item-meta">
                        <template v-if="item.author">{{ item.author }} · </template>
                        <span>{{ formatRelativeTime(item.published) }}</span>
                        <template v-if="subCategory(item.category_path)"> · {{ subCategory(item.category_path) }}</template>
                      </div>
                      <p v-if="item.summary" class="rss-briefing__item-summary">{{ stripHtml(item.summary) }}</p>
                    </div>
                    </li>
                </ul>
              </section>
              </template>
              <!-- Card view -->
              <div v-else class="rss-role__items-grid">
                <el-card v-for="item in allBriefingItems" :key="item.key || item.link" class="rss-role__item-card" shadow="hover" @click="openArticleLink(item)">
                  <div class="rss-role__item-card-top">
                    <span class="rss-role__item-card-date">{{ formatRelativeTime(item.published) }}</span>
                  </div>
                  <p class="rss-role__item-card-title">{{ item.title }}</p>
                  <div class="rss-role__item-card-meta">
                    <span v-if="item.author">{{ item.author }}</span>
                    <span v-if="subCategory(item.category_path)">{{ subCategory(item.category_path) }}</span>
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
            <h2 class="rss-role__section-title">📡 Feed Sources</h2>
            <span class="rss-role__result-count">{{ filteredSeeds.length }} of {{ feedsCount }} sources</span>
            <span class="rss-role__toolbar-right">
              <el-button type="primary" :icon="Plus" @click="openSeedDialog()">Add Source</el-button>
              <el-button :icon="Refresh" @click="parseAllFeeds" :loading="parseAllLoading">Parse All</el-button>
              <el-button :icon="Link" @click="quickParseVisible = true">Quick Parse</el-button>
            </span>
          </div>

          <div class="rss-role__section-body">
            <el-table
              v-if="seedsViewMode === 'table'"
              :data="filteredSeeds"
              v-loading="seedsLoading"
              stripe
              border
              style="width:100%"
              row-key="url"
              :empty-text="seedsLoading ? '' : 'No feed sources yet. Add one to start fetching articles.'"
              >
              <el-table-column prop="name" label="Name" min-width="140" show-overflow-tooltip />
              <el-table-column prop="url" label="Feed URL" min-width="220" show-overflow-tooltip />
              <el-table-column label="Interval" width="90" align="center">
                <template #default="{ row }">
                  <span v-if="seedIntervals[(row as RssSeedDocument).url]" class="rss-role__schedule-badge">
                    {{ formatInterval(seedIntervals[(row as RssSeedDocument).url]) }}
                  </span>
                  <span v-else class="rss-role__text-muted">global</span>
                </template>
              </el-table-column>
              <el-table-column label="Active" width="70" align="center">
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
              <el-table-column label="Articles" width="80" align="center">
                <template #default="{ row }">
                  <span v-if="seedArticleCounts[(row as RssSeedDocument).url] !== undefined" class="rss-role__article-count">
                    {{ seedArticleCounts[(row as RssSeedDocument).url] }}
                  </span>
                  <span v-else class="rss-role__text-muted">—</span>
                </template>
              </el-table-column>
              <el-table-column label="Last Parsed" width="110" align="center">
                <template #default="{ row }">
                  <el-tooltip v-if="parseTimes[(row as RssSeedDocument).url]" :content="formatTime(new Date(parseTimes[(row as RssSeedDocument).url]))" placement="top" :show-after="400">
                    <span class="rss-role__date">{{ formatTimeAgo(parseTimes[(row as RssSeedDocument).url]) }}</span>
                  </el-tooltip>
                  <span v-else class="rss-role__text-muted">never</span>
                </template>
              </el-table-column>
              <el-table-column label="Actions" width="190" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" text type="primary" :loading="parsingSeed === (row as RssSeedDocument).url" @click.stop="parseOneFeed(row as RssSeedDocument)">
                    {{ parsingSeed === (row as RssSeedDocument).url ? '...' : 'Parse' }}
                  </el-button>
                  <el-button size="small" text @click.stop="openSeedDialog(row as RssSeedDocument)">Edit</el-button>
                  <el-popconfirm title="Remove this source and all its articles?" @confirm="removeSeed(row as RssSeedDocument)">
                    <template #reference>
                      <el-button size="small" text type="danger" @click.stop>Del</el-button>
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
                  <span v-if="seedIntervals[seed.url]">{{ formatInterval(seedIntervals[seed.url]) }}</span>
                  <span v-else>global</span>
                  <span v-if="seedArticleCounts[seed.url] !== undefined">{{ seedArticleCounts[seed.url] }} articles</span>
                  <span v-if="parseTimes[seed.url]">{{ formatTimeAgo(parseTimes[seed.url]) }}</span>
                  <span v-else>never</span>
                </div>
                <div class="rss-role__seed-card-actions">
                  <el-button size="small" text type="primary" :loading="parsingSeed === seed.url" @click.stop="parseOneFeed(seed)">{{ parsingSeed === seed.url ? '...' : 'Parse' }}</el-button>
                  <el-button size="small" text @click.stop="openSeedDialog(seed)">Edit</el-button>
                  <el-popconfirm title="Remove this source and all its articles?" @confirm="removeSeed(seed)">
                    <template #reference>
                      <el-button size="small" text type="danger" @click.stop>Del</el-button>
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
            <h2 class="rss-role__section-title">📄 Articles</h2>
            <span class="rss-role__result-count">{{ items.length }} of {{ totalItems }} articles</span>
            <span class="rss-role__toolbar-right">
              <el-button v-if="selectedItems.length" type="danger" size="small" @click="batchDelete">Delete ({{ selectedItems.length }})</el-button>
              <el-button v-if="hasActiveFilters" size="small" text @click="clearFilters">Clear</el-button>
              <el-button size="small" text :icon="Refresh" @click="loadItems">Refresh</el-button>
            </span>
          </div>

          <div class="rss-role__section-body">
            <div class="rss-role__toolbar">
              <el-input
                v-model="itemSearch"
                placeholder="Search title, author..."
                clearable
                :prefix-icon="Search"
                style="width:180px"
                @clear="onItemFilterChange"
                @keyup.enter="onItemFilterChange"
              />
              <el-select v-model="itemCategoryFilter" placeholder="All categories" clearable style="width:160px" @change="onItemFilterChange">
                <el-option v-for="c in categoryOptions" :key="c.value" :label="`${c.icon} ${c.label}`" :value="c.value" />
              </el-select>
              <el-select v-model="itemSourceFilter" placeholder="All sources" clearable style="width:140px" @change="onItemFilterChange">
                <el-option v-for="s in seedOptions" :key="s.value" :label="s.label" :value="s.value" />
              </el-select>
              <el-date-picker
                v-model="itemDateRange"
                type="daterange"
                range-separator="~"
                start-placeholder="From"
                end-placeholder="To"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width:220px"
                @change="onItemFilterChange"
              />
              <el-select v-model="itemSortKey" style="width:110px" @change="onItemFilterChange">
                <el-option label="Newest" value="published_parsed" />
                <el-option label="Oldest" value="published_parsed-asc" />
                <el-option label="Source" value="source_name" />
                <el-option label="Category" value="category_path" />
              </el-select>
            </div>

            <div v-if="hasActiveFilters" class="rss-role__active-filters">
              <el-tag v-if="itemSearch" size="small" closable @close="itemSearch = ''; onItemFilterChange()">Search: {{ itemSearch }}</el-tag>
              <el-tag v-if="itemCategoryFilter" size="small" closable @close="itemCategoryFilter = ''; onItemFilterChange()">Category: {{ itemCategoryFilter }}</el-tag>
              <el-tag v-if="itemSourceFilter" size="small" closable @close="itemSourceFilter = ''; onItemFilterChange()">Source: {{ itemSourceFilter }}</el-tag>
              <el-tag v-if="itemDateRange" size="small" closable @close="itemDateRange = null; onItemFilterChange()">Date: {{ itemDateRange[0] }} ~ {{ itemDateRange[1] }}</el-tag>
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
              :empty-text="itemsLoading ? '' : 'No articles yet. Add a feed source and click Parse.'"
              highlight-current-row
              @selection-change="onSelectionChange"
              @row-click="onArticleRowClick"
            >
              <el-table-column type="selection" width="40" />
              <el-table-column label="Title" min-width="340">
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
              <el-table-column label="Published" width="130" align="center">
                <template #default="{ row }">
                  <el-tooltip :content="formatDate((row as RssItemDocument).published)" placement="top" :show-after="400">
                    <span class="rss-role__date">{{ formatRelativeTime((row as RssItemDocument).published) }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column label="Actions" width="120" fixed="right">
                <template #default="{ row }">
                  <el-popconfirm title="Delete this article?" @confirm="removeItem(row as RssItemDocument)">
                    <template #reference>
                      <el-button size="small" text type="danger" @click.stop>Del</el-button>
                    </template>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>

            <!-- ═══ Card View ═══ -->
            <div v-else-if="itemsViewMode === 'card'" v-loading="itemsLoading" class="rss-role__items-grid">
              <div v-if="!itemsLoading && !filteredItems.length" class="rss-role__items-empty">
                <p>No articles yet. Add a feed source and click Parse.</p>
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
                </div>
                <p v-if="item.summary" class="rss-role__item-card-summary">{{ trimSummary(item.summary) }}</p>
                <div class="rss-role__item-card-actions">
                  <el-popconfirm title="Delete this article?" @confirm="removeItem(item)">
                    <template #reference>
                      <el-button size="small" text type="danger" @click.stop>Del</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </el-card>
            </div>

            <!-- ═══ List View ═══ -->
            <div v-else v-loading="itemsLoading" class="rss-role__items-list">
              <div v-if="!itemsLoading && !filteredItems.length" class="rss-role__items-empty">
                <p>No articles yet. Add a feed source and click Parse.</p>
              </div>
              <div v-for="item in filteredItems" :key="item.key" class="rss-role__items-list-row" @click="onArticleRowClick(item)">
                <span class="rss-role__items-list-source">{{ item.source_name }}</span>
                <span class="rss-role__items-list-title">
                  <a v-if="item.link" :href="item.link" target="_blank" rel="noopener noreferrer" class="rss-role__item-link" @click.stop>{{ item.title }}</a>
                  <span v-else>{{ item.title }}</span>
                </span>
                <span class="rss-role__items-list-date">{{ formatRelativeTime(item.published) }}</span>
                <div class="rss-role__items-list-actions">
                  <el-popconfirm title="Delete this article?" @confirm="removeItem(item)">
                    <template #reference>
                      <el-button size="small" text type="danger" @click.stop>Del</el-button>
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

    <!-- Quick Parse Dialog -->
    <el-dialog
      v-model="seedDialogVisible"
      :title="editingSeed?.key ? 'Edit Source' : 'Add Source'"
      width="520px"
      destroy-on-close
    >
      <el-form :model="seedForm" label-width="110px">
        <el-form-item label="Feed URL" required>
          <el-input v-model="seedForm.url" placeholder="https://example.com/rss.xml" />
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="seedForm.name" placeholder="Display name" />
        </el-form-item>
        <el-form-item label="Target Category">
          <el-select v-model="seedForm.category" placeholder="Auto-classify" clearable allow-create filterable style="width:100%">
            <el-option-group v-for="g in categoryGroups" :key="g.label" :label="g.label">
              <el-option v-for="o in g.options" :key="o.value" :label="o.label" :value="o.value" />
            </el-option-group>
          </el-select>
          <span class="rss-role__form-hint">Override classification target. Leave empty for auto.</span>
        </el-form-item>
        <el-form-item label="Fetch Interval">
          <el-select v-model="seedForm.interval" placeholder="Global default" clearable style="width:100%">
            <el-option :value="0" label="Global default" />
            <el-option :value="600" label="10 minutes" />
            <el-option :value="1800" label="30 minutes" />
            <el-option :value="3600" label="1 hour" />
            <el-option :value="7200" label="2 hours" />
            <el-option :value="21600" label="6 hours" />
            <el-option :value="43200" label="12 hours" />
            <el-option :value="86400" label="24 hours" />
          </el-select>
          <span class="rss-role__form-hint">Leave empty to use the global scheduler setting.</span>
        </el-form-item>
        <el-form-item label="Status">
          <el-switch v-model="seedForm.enabled" active-text="Active" inactive-text="Paused" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="seedDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveSeed" :loading="seedSaving">Save</el-button>
      </template>
    </el-dialog>

    <!-- Quick Parse Dialog -->
    <el-dialog v-model="quickParseVisible" title="Quick Parse URL" width="460px" destroy-on-close>
      <el-form :model="quickParseForm" label-width="60px">
        <el-form-item label="URL" required>
          <el-input v-model="quickParseForm.url" placeholder="https://example.com/rss.xml" />
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="quickParseForm.name" placeholder="Optional" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="quickParseVisible = false">Cancel</el-button>
        <el-button type="primary" @click="doQuickParse" :loading="quickParseLoading">Parse</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts" name="rssManager">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Plus, Refresh, Link, ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import {
  getSeedList, createSeed, updateSeed, deleteSeed,
  getRssList, deleteRssItem,
  parseFeed, parseAllEnabledFeeds,
  type RssSeedDocument, type RssItemDocument, type RssListParams
} from "@/api/modules/rssService";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";
import { ROLE_IDS, rolesData } from "@/views/knowledge/executiver/okrData";
import { loadBool, saveBool } from "@/utils/storage";
import { EXAMPLE_SEEDS } from "./rssSeedData";

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
  if (selectedRoles.value.length === 0) return "All Roles RSS Manager";
  if (selectedRoles.value.length === 1) return `${rolesData[selectedRoles.value[0]]?.name || "Role"} RSS Manager`;
  return `${selectedRoles.value.length} Roles RSS Manager`;
});
const stickyDesc = computed(() => {
  if (selectedRoles.value.length === 0) return "Aggregated RSS feeds and articles across all roles.";
  if (selectedRoles.value.length === 1) return rolesData[selectedRoles.value[0]]?.description || "";
  return rolesData[selectedRoles.value[0]]?.description || "";
});

const briefingViewMode = ref<"list" | "card">("list");
const seedsViewMode = ref<"table" | "card">("table");
const itemsViewMode = ref<"card" | "list" | "table">("table");

const roleCounts = computed(() => {
  const counts: Record<string, number> = { all: 0 };
  for (const rid of ROLE_IDS) {
    counts[rid] = seeds.value.filter(s => roleFromCategory(s.category) === rid).length;
    counts.all += counts[rid];
  }
  return counts;
});

// ═══════════════════════════════════════════════
// Seeds
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

/** Category options grouped by role domain — mirrors YiKnowledge directory structure. */
const categoryGroups = [
  {
    label: "Executiver",
    options: [
      { label: "Industry · market trends, competitors, reports", value: "executiver/industry" },
      { label: "Strategy · frameworks, compliance, positioning", value: "executiver/strategy" },
      { label: "Roadmap · planning, OKR, budget", value: "executiver/roadmap" },
      { label: "Reading List · curated executive readings", value: "executiver/reading-list" }
    ]
  },
  {
    label: "AI Engineer",
    options: [
      { label: "Methodology · tools, workflows, best practices", value: "aier/methodology" },
      { label: "Foundations · papers, research, theory", value: "aier/foundations" }
    ]
  },
  {
    label: "Engineer",
    options: [
      { label: "Ship · data & reliability", value: "engineer/ship" },
      { label: "Learn · Lessons", value: "engineer/learn/lessons" },
      { label: "Learn · Wins", value: "engineer/learn/lessons/wins" },
      { label: "Learn · Failures", value: "engineer/learn/lessons/failures" }
    ]
  },
  {
    label: "SRE",
    options: [
      { label: "Release · deployment, infrastructure", value: "srer/release" }
    ]
  },
  {
    label: "Product Manager",
    options: [
      { label: "Frameworks · product strategy, growth", value: "producter/frameworks" }
    ]
  },
  {
    label: "Curator",
    options: [
      { label: "Templates · knowledge curation", value: "curator/templates" }
    ]
  },
  {
    label: "Leader",
    options: [
      { label: "Tech Leadership · team, culture, scaling", value: "leader/leadership" },
      { label: "Architecture · system design, patterns", value: "leader/architecture" }
    ]
  }
];

// ═══════════════════════════════════════════════
// Seeds
// ═══════════════════════════════════════════════
const seeds = ref<RssSeedDocument[]>([]);
const seedsLoading = ref(false);
const seedSearch = ref("");
const parsingSeed = ref("");
const seedToggling = ref("");
const parseResults = reactive<Record<string, { ok: boolean; saved: number; updated: number }>>({});
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

/** Summary: articles this week. */
const weekCount = ref(0);
async function loadWeekCount() {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const base = { pageNum: 1, pageSize: 1, publishedStart: monday.getTime(), publishedEnd: now.getTime() };
    const roles = selectedRoles.value.length ? selectedRoles.value : [];
    if (!roles.length) {
      const res = await getRssList(base);
      weekCount.value = res.data?.total ?? 0;
    } else if (roles.length === 1) {
      const res = await getRssList({ ...base, categoryPrefix: roles[0] });
      weekCount.value = res.data?.total ?? 0;
    } else {
      const results = await Promise.allSettled(roles.map(rid => getRssList({ ...base, categoryPrefix: rid })));
      weekCount.value = results.reduce((sum, r) => sum + (r.status === "fulfilled" ? r.value.data?.total ?? 0 : 0), 0);
    }
  } catch { weekCount.value = 0; }
}

/** Summary: last parse time label. */
const lastParseLabel = computed(() => {
  const times = Object.values(parseTimes);
  if (!times.length) return "—";
  const latest = Math.max(...times);
  return formatTimeAgo(latest);
});

/** Summary: active (enabled) feed count for current role. */
const activeFeedsCount = computed(() => {
  if (!selectedRoles.value.length) return seeds.value.filter(s => s.enabled !== false).length;
  return seeds.value.filter(s => s.enabled !== false && selectedRoles.value.includes(roleFromCategory(s.category))).length;
});

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
  if (!seedForm.url.trim()) { ElMessage.warning("Feed URL is required"); return; }
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
      ElMessage.success("Source updated");
    } else {
      const key = `seed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await createSeed({ key, ...patch });
      ElMessage.success("Source added");
    }
    seedDialogVisible.value = false;
    await loadSeeds();
  } catch (e) {
    ElMessage.error(errorMessage(e) || "Failed to save source");
  } finally {
    seedSaving.value = false;
  }
}

async function removeSeed(row: RssSeedDocument) {
  if (!row.key) return;
  try {
    await deleteSeed(row.key);
    ElMessage.success("Source removed");
    await loadSeeds();
  } catch (e) {
    ElMessage.error(errorMessage(e) || "Failed to remove source");
  }
}

async function toggleSeed(row: RssSeedDocument) {
  if (!row.key) return;
  seedToggling.value = row.key;
  try {
    const next = row.enabled === false;
    await updateSeed(row.key, { enabled: next });
    row.enabled = next;
    ElMessage.success(next ? "Source enabled" : "Source paused");
  } catch (e) {
    ElMessage.error(errorMessage(e) || "Failed to toggle source");
  } finally {
    seedToggling.value = "";
  }
}

function setSeedInterval(row: RssSeedDocument, val: number) {
  seedIntervals[row.url] = val || 0;
  if (row.key) {
    updateSeed(row.key, { interval: val > 0 ? val : undefined }).catch(() => {});
  }
}

async function parseOneFeed(row: RssSeedDocument) {
  parsingSeed.value = row.url;
  try {
    const res = await parseFeed(row.url, row.name);
    const d = res.data;
    parseResults[row.url] = { ok: d.success, saved: d.saved_count || 0, updated: d.updated_count || 0 };
    parseTimes[row.url] = Date.now();
    addParseHistory(row.name || row.url, d.success, d.saved_count || 0, d.updated_count || 0, d.error);
    ElMessage.success(`Parsed: ${d.saved_count || 0} new, ${d.updated_count || 0} updated`);
    await loadItems();
    loadTodayCount();
    loadWeekCount();
  } catch (e) {
    const msg = errorMessage(e) || "Parse failed";
    addParseHistory(row.name || row.url, false, 0, 0, msg);
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
    addParseHistory("All sources", d.success_count === d.total_sources, d.success_count || 0, 0);
    ElMessage.success(`${d.total_sources} sources: ${d.success_count} ok, ${d.failed_count} failed`);
    const now = Date.now();
    for (const s of seeds.value) { if (s.enabled !== false) parseTimes[s.url] = now; }
    await loadItems();
    loadTodayCount();
    loadWeekCount();
  } catch (e) {
    const msg = errorMessage(e) || "Batch parse failed";
    addParseHistory("All sources", false, 0, 0, msg);
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
        ElMessage.success(`Added ${added.length} new feed sources`);
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
    for (const s of seeds.value) {
      getRssList({ source_url: s.url, pageSize: 1 })
        .then(res => { seedArticleCounts[s.url] = res.data?.total ?? 0; })
        .catch(() => { seedArticleCounts[s.url] = 0; });
    }
  } catch { seeds.value = []; }
  finally { seedsLoading.value = false; }
}

// ═══════════════════════════════════════════════
// Quick Parse
// ═══════════════════════════════════════════════
const quickParseVisible = ref(false);
const quickParseLoading = ref(false);
const quickParseForm = reactive({ url: "", name: "" });

async function doQuickParse() {
  if (!quickParseForm.url.trim()) { ElMessage.warning("URL is required"); return; }
  quickParseLoading.value = true;
  try {
    const res = await parseFeed(quickParseForm.url.trim(), quickParseForm.name.trim() || undefined);
    const d = res.data;
    addParseHistory(d.source_name || quickParseForm.url, d.success, d.saved_count || 0, d.updated_count || 0, d.error);
    ElMessage.success(`Parsed: ${d.saved_count || 0} new, ${d.updated_count || 0} updated`);
    quickParseVisible.value = false;
    quickParseForm.url = "";
    quickParseForm.name = "";
    await loadItems();
    loadTodayCount();
    loadWeekCount();
  } catch (e) {
    ElMessage.error(errorMessage(e) || "Quick parse failed");
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
const itemSortKey = ref("published_parsed");
const itemPage = ref(1);
const itemPageSize = 20;
const totalItems = ref(0);
const selectedItems = ref<RssItemDocument[]>([]);

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
  itemSortKey.value = "published_parsed";
  itemPage.value = 1;
  loadItems();
}

async function loadItems() {
  itemsLoading.value = true;
  selectedItems.value = [];
  try {
    const params: RssListParams = { pageNum: itemPage.value, pageSize: itemPageSize };
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
    const res = await getRssList(params);
    items.value = res.data?.list ?? [];
    totalItems.value = res.data?.total ?? 0;
  } catch { items.value = []; totalItems.value = 0; }
  finally { itemsLoading.value = false; }
}

function onArticleRowClick(row: RssItemDocument) {
  if (row.link) window.open(row.link, "_blank", "noopener,noreferrer");
}

function trimSummary(summary: string): string {
  const text = stripHtml(summary);
  return text.length > 120 ? text.slice(0, 120) + "…" : text;
}

async function removeItem(row: RssItemDocument) {
  if (!row.key) return;
  try {
    await deleteRssItem(row.key);
    ElMessage.success("Article deleted");
    await loadItems();
    loadTodayCount();
    loadWeekCount();
  } catch (e) {
    ElMessage.error(errorMessage(e) || "Failed to delete article");
  }
}

async function batchDelete() {
  if (selectedItems.value.length === 0) return;
  try {
    await ElMessageBox.confirm(
      `Delete ${selectedItems.value.length} articles?`,
      "Batch Delete",
      { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning" }
    );
  } catch { return; }
  let deleted = 0;
  for (const item of selectedItems.value) {
    if (!item.key) continue;
    try { await deleteRssItem(item.key); deleted++; } catch { /* skip */ }
  }
  ElMessage.success(`Deleted ${deleted} articles`);
  await loadItems();
  loadTodayCount();
  loadWeekCount();
}

// ═══════════════════════════════════════════════
// Daily briefing
// ═══════════════════════════════════════════════
const briefingItems = ref<RssItemDocument[]>([]);
const briefingLoading = ref(false);

const briefingDate = ref(new Date());

const briefingDateLabel = computed(() => {
  const d = briefingDate.value;
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const dateStr = d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  return isToday ? `今日 · ${dateStr}` : dateStr;
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

interface BriefingGroup {
  key: string;
  label: string;
  icon: string;
  items: RssItemDocument[];
}

const briefingGroups = computed<BriefingGroup[]>(() => {
  const groups = new Map<string, BriefingGroup>();
  for (const item of briefingItems.value) {
    const source = item.source_name || "Unknown";
    if (!groups.has(source)) {
      groups.set(source, { key: source, label: source, icon: "📡", items: [] });
    }
    groups.get(source)!.items.push(item);
  }
  return [...groups.values()].sort((a, b) => b.items.length - a.items.length);
});

const allBriefingItems = computed(() => briefingGroups.value.flatMap(g => g.items));

const filteredBriefingCount = computed(() => briefingItems.value.length);

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

// ═══════════════════════════════════════════════
// Parse history
// ═══════════════════════════════════════════════
interface ParseHistoryEntry {
  id: number;
  time: string;
  label: string;
  ok: boolean;
  saved: number;
  updated: number;
  error?: string;
}
const parseHistory = ref<ParseHistoryEntry[]>([]);
let _historyId = 0;

function addParseHistory(label: string, ok: boolean, saved: number, updated: number, error?: string) {
  parseHistory.value.unshift({ id: ++_historyId, time: formatTime(new Date()), label, ok, saved, updated, error });
  if (parseHistory.value.length > 100) parseHistory.value.length = 100;
}

function sourceHistory(row: RssSeedDocument) {
  const key = row.name || row.url;
  return parseHistory.value.filter(h => h.label === key);
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
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch { return raw.slice(0, 10); }
}

function formatRelativeTime(raw?: string): string {
  if (!raw) return "-";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw.slice(0, 10);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.round(diff / 86400000)}d ago`;
    return d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  } catch { return raw.slice(0, 10); }
}

function formatTime(d: Date): string {
  return d.toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatTimeAgo(ts?: number): string {
  if (!ts) return "-";
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
  return `${Math.round(diff / 86400000)}d ago`;
}

function formatInterval(seconds: number): string {
  if (!seconds || seconds <= 0) return "-";
  if (seconds < 120) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

function estimateNextRun(url: string): string {
  const interval = seedIntervals[url] || 3600;
  const last = parseTimes[url];
  if (!last) return "on next tick";
  const diff = (last + interval * 1000) - Date.now();
  if (diff < 0) return "any moment";
  if (diff < 60000) return `${Math.round(diff / 1000)}s`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m`;
  return `${Math.round(diff / 3600000)}h`;
}

function onTabChange(tab: string | number) {
  if (tab === "briefing") { briefingDate.value = new Date(); loadBriefing(); }
  else if (tab === "items") loadItems();
  else if (tab === "seeds") loadSeeds();
}

onMounted(async () => {
  await loadBriefing();
  await loadSeeds();
  await loadItems();
  await loadTodayCount();
  await loadWeekCount();
});

watch(selectedRoles, () => {
  if (activeTab.value === "briefing") loadBriefing();
  if (activeTab.value === "items") { itemPage.value = 1; loadItems(); }
  loadTodayCount();
  loadWeekCount();
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
.rss-role__sticky-icon { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
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
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 16px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  min-width: 64px;
}
.rss-role__stat-pill--accent { background: var(--el-color-primary-light-9); }
.rss-role__stat-pill-value { font-size: 18px; font-weight: 700; color: var(--el-text-color-primary); line-height: 1.1; }
.rss-role__stat-pill--accent .rss-role__stat-pill-value { color: var(--el-color-primary); }
.rss-role__stat-pill-label { font-size: 10px; color: var(--el-text-color-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: .3px; }

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
}
.rss-briefing__group-icon { font-size: 16px; }
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
  padding: 48px 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
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