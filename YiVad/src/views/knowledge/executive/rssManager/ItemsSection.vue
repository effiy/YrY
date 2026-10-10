<template>
  <section class="rss-role__section">
    <div class="rss-role__section-head">
      <h2 class="rss-role__section-title">
        🗂️ {{ t("rss.manager.items.title") }}
        <span v-if="totalItems" class="rss-role__result-count" style="margin-left:6px;">
          {{ t("rss.manager.items.resultCount", { filtered: items.length ?? 0, total: totalItems ?? 0 }) }}
        </span>
      </h2>
      <span class="rss-role__toolbar-right">
        <el-button
          v-if="batchSelected.length"
          size="small"
          type="primary"
          plain
          :icon="Star"
          @click="onBatchStar"
        >
          {{ t("rss.manager.items.batchStar", { n: batchSelected.length }) }}
        </el-button>
        <el-button
          v-if="batchSelected.length"
          size="small"
          type="warning"
          plain
          :icon="FolderChecked"
          @click="moveDialogVisible = true"
        >
          {{ t("rss.manager.items.batchMove") }}
        </el-button>
        <el-button
          v-if="batchSelected.length"
          type="danger"
          size="small"
          :icon="Delete"
          @click="onBatchPrune"
        >
          {{ t("rss.manager.items.batchPrune", { n: batchSelected.length }) }}
        </el-button>
        <el-button v-if="hasActiveFilters" size="small" text @click="clearFiltersLocal">
          {{ t("rss.manager.items.clearFilters") }}
        </el-button>
        <el-button size="small" text :icon="Download" :loading="exportingItems" @click="exportItems">
          {{ t("rss.manager.items.exportBtn") }}
        </el-button>
        <el-button size="small" :icon="Refresh" @click="loadUIItems" :loading="loading">
          {{ t("rss.manager.items.refresh") }}
        </el-button>
      </span>
    </div>

    <div class="rss-role__section-body">
      <!-- Batch bar -->
      <div v-if="batchSelected.length" class="rss-batch-bar">
        <span class="rss-batch-bar__title">
          <el-icon><Select /></el-icon>
          {{ t("rss.manager.items.batchSelected", { n: batchSelected.length }) }}
        </span>
        <el-button
          size="small"
          type="primary"
          plain
          :icon="Star"
          :loading="batchOpLoading.star"
          @click="onBatchStar"
        >
          {{ t("rss.manager.items.batchStar", { n: batchSelected.length }) }}
        </el-button>
        <el-button
          size="small"
          type="warning"
          plain
          :icon="FolderChecked"
          @click="moveDialogVisible = true"
        >
          {{ t("rss.manager.items.batchMove") }}
        </el-button>
        <el-button
          size="small"
          type="danger"
          :icon="Delete"
          :loading="batchOpLoading.prune"
          @click="onBatchPrune"
        >
          {{ t("rss.manager.items.batchPrune", { n: batchSelected.length }) }}
        </el-button>
        <span v-if="prunableCount" class="rss-batch-bar__hint">
          ⚠️ {{ t("rss.manager.items.batchPruneHint", { keep: starCount, toprune: prunableCount }) }}
        </span>
        <el-button size="small" text type="info" class="ml-auto" @click="clearSelection">
          {{ t("rss.manager.items.clearSelection") }}
        </el-button>
      </div>

      <!-- Charts: category pie + role/importance heatmap -->
      <div v-if="items.length" class="rss-items__chart-row">
        <div class="rss-chart-card rss-items__chart rss-items__chart--pie">
          <div class="rss-chart-card__head">
            <span class="rss-prune-board__title">
              🥧 {{ t("rss.manager.items.categoryPieTitle") }}
            </span>
            <el-tag size="small" type="info">
              {{ t("rss.manager.items.clickSliceFilter") }}
            </el-tag>
          </div>
          <ECharts :option="pieOption" height="260" @click="onPieClick" />
        </div>
        <div class="rss-chart-card rss-items__chart rss-items__chart--heat">
          <div class="rss-chart-card__head">
            <span class="rss-prune-board__title">
              🔥 {{ t("rss.manager.items.heatTitle") }}
            </span>
            <el-tag size="small" type="warning">
              {{ t("rss.manager.items.clickCellFilter") }}
            </el-tag>
          </div>
          <ECharts :option="heatOption" height="260" @click="onHeatClick" />
        </div>
      </div>

      <!-- Filter bar -->
      <div class="rss-role__toolbar">
        <el-input
          v-model="state.filters.search"
          :placeholder="t('rss.manager.items.searchPlaceholder')"
          clearable
          :prefix-icon="Search"
          style="width: 200px"
          @change="onItemFilterChange"
          @keyup.enter="onItemFilterChange"
          @clear="onItemFilterChange"
        />
        <el-select
          v-model="state.filters.sourceUrlFilter"
          :placeholder="t('rss.manager.items.sourceAll')"
          clearable
          style="width: 160px"
          @change="onItemFilterChange"
        >
          <el-option v-for="s in seedOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-select
          v-model="state.filters.categoryFilter"
          :placeholder="t('rss.manager.items.categoryAll')"
          clearable
          style="width: 160px"
          @change="onItemFilterChange"
        >
          <el-option
            v-for="c in categoryOptions"
            :key="c.value"
            :label="`${c.icon} ${c.label}`"
            :value="c.value"
          />
        </el-select>
        <el-slider
          v-if="advancedFiltersOpen"
          v-model="importanceFilterBind"
          :min="1"
          :max="5"
          :marks="{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }"
          show-stops
          style="width: 180px"
          @change="onImportanceSlider"
        />
        <el-checkbox v-if="advancedFiltersOpen" v-model="state.filters.starredOnly" @change="onItemFilterChange">
          {{ t("rss.manager.items.starredOnly") }}
        </el-checkbox>
        <el-button
          size="small"
          text
          type="primary"
          @click="advancedFiltersOpen = !advancedFiltersOpen"
          :class="{ 'is-open': advancedFiltersOpen }"
        >
          {{ t(advancedFiltersOpen ? "rss.manager.items.advanced.collapse" : "rss.manager.items.advanced.expand") }}
          <span class="rss-items__advanced-caret">{{ advancedFiltersOpen ? "▴" : "▾" }}</span>
        </el-button>
        <template v-if="advancedFiltersOpen">
          <el-radio-group v-model="timePreset" size="small" @change="setTimePreset">
            <el-radio-button value="all">{{ t("rss.manager.items.timePreset.all") }}</el-radio-button>
            <el-radio-button value="today">{{ t("rss.manager.items.timePreset.today") }}</el-radio-button>
            <el-radio-button value="week">{{ t("rss.manager.items.timePreset.week") }}</el-radio-button>
            <el-radio-button value="month">{{ t("rss.manager.items.timePreset.month") }}</el-radio-button>
          </el-radio-group>
          <el-date-picker
            v-model="dateRangeBind"
            type="daterange"
            range-separator="~"
            :start-placeholder="t('rss.manager.items.dateRange.from')"
            :end-placeholder="t('rss.manager.items.dateRange.to')"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 220px"
            @change="
              timePreset = '';
              onItemFilterChange();
            "
          />
          <el-select v-model="sortKey" style="width: 110px" @change="onItemFilterChange">
            <el-option :label="t('rss.manager.items.sort.newest')" value="published_parsed" />
            <el-option :label="t('rss.manager.items.sort.oldest')" value="published_parsed-asc" />
            <el-option :label="t('rss.manager.items.sort.source')" value="source_name" />
            <el-option :label="t('rss.manager.items.sort.category')" value="category_path" />
          </el-select>
        </template>
      </div>

      <!-- Active filter tags -->
      <div v-if="hasActiveFilters" class="rss-role__active-filters">
        <el-tag
          v-if="state.filters.search"
          size="small"
          closable
          @close="
            state.filters.search = '';
            onItemFilterChange();
          "
        >{{ t("rss.manager.items.activeFilters.search", { value: state.filters.search }) }}</el-tag>
        <el-tag
          v-if="state.filters.categoryFilter"
          size="small"
          closable
          type="primary"
          @close="
            state.filters.categoryFilter = '';
            onItemFilterChange();
          "
        >{{ t("rss.manager.items.activeFilters.category", { value: state.filters.categoryFilter }) }}</el-tag>
        <el-tag
          v-if="state.filters.sourceUrlFilter"
          size="small"
          closable
          type="warning"
          @close="
            state.filters.sourceUrlFilter = '';
            onItemFilterChange();
          "
        >{{ t("rss.manager.items.activeFilters.source", { value: state.filters.sourceUrlFilter }) }}</el-tag>
        <el-tag
          v-if="state.filters.importanceMin"
          size="small"
          closable
          type="success"
          @close="
            state.filters.importanceMin = null;
            importanceFilterBind = 1;
            onItemFilterChange();
          "
        >{{ t("rss.manager.items.activeFilters.importanceMin", { v: state.filters.importanceMin }) }}</el-tag>
        <el-tag
          v-if="state.filters.starredOnly"
          size="small"
          closable
          type="danger"
          @close="
            state.filters.starredOnly = false;
            onItemFilterChange();
          "
        >{{ t("rss.manager.items.activeFilters.starredOnly") }}</el-tag>
        <el-tag
          v-if="dateRangeBind"
          size="small"
          closable
          @close="
            dateRangeBind = null;
            state.filters.startDate = null;
            state.filters.endDate = null;
            timePreset = 'all';
            onItemFilterChange();
          "
        >{{ t("rss.manager.items.activeFilters.date", { from: dateRangeBind?.[0] ?? "", to: dateRangeBind?.[1] ?? "" }) }}</el-tag>
        <el-tag
          v-if="heatSelectionRoles.length"
          size="small"
          closable
          type="warning"
          effect="dark"
          @close="
            state.filters.selectedRoles = new Set(rolesRef);
            heatSelectionRoles = [];
            onItemFilterChange();
          "
        >{{ t("rss.manager.items.activeFilters.roles", { n: heatSelectionRoles.length, list: heatSelectionRoles.join(",") }) }}</el-tag>
      </div>

      <!-- Recent article strip -->
      <div v-if="recentArticles.length" class="rss-role__recent-strip">
        <span class="rss-role__recent-label">{{ t("rss.manager.items.recent.label") }}</span>
        <button
          v-for="a in recentArticles"
          :key="a.key ?? a.link"
          class="rss-role__recent-chip"
          :title="a.link"
          @click="openArticleLink(a)"
        >
          <span class="rss-role__recent-dot" :style="{ background: roleColor(a.category_path) }"></span>
          {{ a.title }}
        </button>
        <button
          class="rss-role__recent-clear"
          :title="t('rss.manager.items.recent.clearTitle')"
          @click="clearRecentArticles"
        >
          {{ t("rss.manager.items.recent.clear") }}
        </button>
      </div>

      <div v-if="err" class="rss-items__err">
        <el-alert :title="err" type="warning" show-icon :closable="false" />
      </div>

      <!-- Table view -->
      <el-table
        v-if="viewMode === 'table'"
        ref="tableRef"
        :data="sortedItems"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        row-key="key"
        :empty-text="
          loading
            ? ''
            : items.length || hasActiveFilters
              ? t('rss.manager.items.table.noData.filtered')
              : t('rss.manager.items.table.noData.empty')
        "
        highlight-current-row
        @selection-change="onSelectionChange"
        @row-click="onArticleRowClick"
      >
        <el-table-column type="selection" width="42" />
        <el-table-column width="56" align="center">
          <template #default="{ row }">
            <button
              v-if="pruneSuggestedKeys.has((row as RssItemDocument).key ?? '')"
              class="rss-prune-suggest-pill"
              @click.stop="onQuickPruneOne(row as RssItemDocument)"
              type="button"
            >
              🗑 {{ t("rss.manager.items.pruneSuggest") }}
            </button>
          </template>
        </el-table-column>
        <el-table-column :label="t('rss.manager.items.table.title')" min-width="340">
          <template #default="{ row }">
            <div class="rss-role__item-title">
              <a
                :href="(row as RssItemDocument).link"
                target="_blank"
                rel="noopener noreferrer"
                class="rss-role__item-link"
                @click.stop="addRecentArticle(row as RssItemDocument)"
              >
                {{ (row as RssItemDocument).title }}
              </a>
              <el-icon
                v-if="isStarred(row as RssItemDocument)"
                class="rss-role__item-starred"
                style="color: var(--el-color-warning);"
              ><StarFilled /></el-icon>
              <div class="rss-role__item-meta">
                <span class="rss-role__item-source">{{ (row as RssItemDocument).source_name }}</span>
                <template v-if="(row as RssItemDocument).author"> · {{ (row as RssItemDocument).author }}</template>
                <span v-if="(row as RssItemDocument).summary" class="rss-role__item-summary-inline">
                  · {{ trimSummary((row as RssItemDocument).summary!) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('rss.manager.items.table.importance')" width="92" align="center">
          <template #default="{ row }">
            <el-tooltip :content="importanceTooltip(computeImportance(row as RssItemDocument))" placement="top">
              <span
                class="rss-items__imp"
                :style="{ background: importanceColor(computeImportance(row as RssItemDocument)) }"
              >{{ computeImportance(row as RssItemDocument) }}</span>
            </el-tooltip>
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
              <span class="rss-role__cat-dot" :style="{ background: roleColor((row as RssItemDocument).category_path) }"></span
              >{{ subCategory((row as RssItemDocument).category_path) }}
            </span>
            <span v-else class="rss-role__text-muted">{{ t("rss.manager.detail.fields.unknown") }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('rss.manager.items.table.actions')" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              size="small"
              text
              :icon="isStarred(row as RssItemDocument) ? StarFilled : Star"
              :type="isStarred(row as RssItemDocument) ? 'warning' : 'default'"
              :title="t('rss.manager.items.table.star')"
              @click.stop="onStarOne(row as RssItemDocument)"
            />
            <el-button
              size="small"
              text
              :icon="View"
              :title="t('rss.manager.items.table.detail')"
              @click.stop="onViewDetail(row as RssItemDocument)"
            />
            <el-popconfirm
              :title="t('rss.manager.items.table.deleteConfirm')"
              @confirm="onDeleteItem(row as RssItemDocument)"
            >
              <template #reference>
                <el-button size="small" text type="danger" :icon="Delete" @click.stop />
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- Card view -->
      <div v-else-if="viewMode === 'card'" v-loading="loading" class="rss-role__items-grid">
        <div
          v-if="!loading && !items.length"
          class="rss-briefing__chart-empty rss-items__empty-unified"
        >
          <div class="rss-briefing__chart-empty-glyph">{{ totalItems ? "🔍" : "📭" }}</div>
          <div class="rss-briefing__chart-empty-title">
            {{ totalItems ? t("rss.manager.items.empty.noMatch") : t("rss.manager.items.empty.noItems") }}
          </div>
          <div class="rss-briefing__chart-empty-hint">
            {{ totalItems ? t("rss.manager.items.empty.noMatchHint") : t("rss.manager.items.export.noData") }}
          </div>
          <el-button
            v-if="hasActiveFilters"
            size="small"
            type="primary"
            plain
            @click="clearFiltersLocal"
          >{{ t("rss.manager.items.empty.clearFilters") }}</el-button>
        </div>
        <el-card
          v-for="(item, idx) in sortedItems"
          :key="item.key ?? item.link ?? idx"
          class="rss-role__item-card"
          shadow="hover"
          @click="onArticleRowClick(item)"
        >
          <div class="rss-role__item-card-top">
            <span class="rss-role__item-card-date">{{ formatRelativeTime(item.published) }}</span>
            <span
              v-if="pruneSuggestedKeys.has(item.key ?? '')"
              class="rss-prune-suggest-pill"
              @click.stop="onQuickPruneOne(item)"
            >
              🗑 {{ t("rss.manager.items.pruneSuggest") }}
            </span>
          </div>
          <p class="rss-role__item-card-title">
            <a
              v-if="item.link"
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
              class="rss-role__item-link"
              @click.stop="addRecentArticle(item)"
            >{{ item.title }}</a>
            <span v-else>{{ item.title }}</span>
            <el-icon
              v-if="isStarred(item)"
              class="rss-role__item-starred"
              style="color: var(--el-color-warning); margin-left:4px;"
            ><StarFilled /></el-icon>
          </p>
          <div class="rss-role__item-card-meta">
            <span class="rss-role__item-source">{{ item.source_name }}</span>
            <template v-if="item.author"> · {{ item.author }}</template>
            <template v-if="subCategory(item.category_path)">
              · <span class="rss-role__cat-dot" :style="{ background: roleColor(item.category_path) }"></span
              >{{ subCategory(item.category_path) }}</template
            >
            ·
            <el-tooltip :content="importanceTooltip(computeImportance(item))" placement="top">
              <span
                class="rss-items__imp"
                :style="{ background: importanceColor(computeImportance(item)), fontSize: 10 }"
              >{{ computeImportance(item) }}</span>
            </el-tooltip>
          </div>
          <p v-if="item.summary" class="rss-role__item-card-summary">{{ trimSummary(item.summary) }}</p>
          <div class="rss-role__item-card-actions">
            <el-checkbox
              :model-value="!!isSelected(item)"
              @change="(v: any) => toggleSelectOne(item, v)"
              @click.stop
            />
            <el-button
              size="small"
              text
              :icon="isStarred(item) ? StarFilled : Star"
              :type="isStarred(item) ? 'warning' : 'default'"
              :title="t('rss.manager.items.table.star')"
              @click.stop="onStarOne(item)"
            />
            <el-button
              size="small"
              text
              :icon="View"
              :title="t('rss.manager.items.table.detail')"
              @click.stop="onViewDetail(item)"
            />
            <el-popconfirm :title="t('rss.manager.items.table.deleteConfirm')" @confirm="onDeleteItem(item)">
              <template #reference>
                <el-button size="small" text type="danger" :icon="Delete" @click.stop />
              </template>
            </el-popconfirm>
          </div>
        </el-card>
      </div>

      <!-- List view -->
      <div v-else v-loading="loading" class="rss-role__items-list rss-items__list--compact">
        <div
          v-if="!loading && !items.length"
          class="rss-briefing__chart-empty rss-items__empty-unified"
        >
          <div class="rss-briefing__chart-empty-glyph">{{ totalItems ? "🔍" : "📭" }}</div>
          <div class="rss-briefing__chart-empty-title">
            {{ totalItems ? t("rss.manager.items.empty.noMatch") : t("rss.manager.items.empty.noItems") }}
          </div>
          <div class="rss-briefing__chart-empty-hint">
            {{ totalItems ? t("rss.manager.items.empty.noMatchHint") : t("rss.manager.items.export.noData") }}
          </div>
          <el-button
            v-if="hasActiveFilters"
            size="small"
            type="primary"
            plain
            @click="clearFiltersLocal"
          >{{ t("rss.manager.items.empty.clearFilters") }}</el-button>
        </div>
        <div
          v-for="item in sortedItems"
          :key="item.key ?? item.link"
          class="rss-role__items-list-row"
          @click="onArticleRowClick(item)"
        >
          <el-checkbox
            :model-value="!!isSelected(item)"
            @change="(v: any) => toggleSelectOne(item, v)"
            @click.stop
          />
          <span
            v-if="pruneSuggestedKeys.has(item.key ?? '')"
            class="rss-prune-suggest-pill"
            @click.stop="onQuickPruneOne(item)"
          >
            🗑
          </span>
          <span class="rss-role__items-list-source">{{ item.source_name }}</span>
          <span class="rss-role__items-list-title">
            <a
              v-if="item.link"
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
              class="rss-role__item-link"
              @click.stop="addRecentArticle(item)"
            >{{ item.title }}</a>
            <span v-else>{{ item.title }}</span>
            <el-icon
              v-if="isStarred(item)"
              class="rss-role__item-starred"
              style="color: var(--el-color-warning); margin-left:4px;"
            ><StarFilled /></el-icon>
          </span>
          <el-tooltip :content="importanceTooltip(computeImportance(item))" placement="top">
            <span
              class="rss-items__imp"
              :style="{ background: importanceColor(computeImportance(item)), fontSize: 10 }"
            >{{ computeImportance(item) }}</span>
          </el-tooltip>
          <span class="rss-role__items-list-date">{{ formatRelativeTime(item.published) }}</span>
          <div class="rss-role__items-list-actions">
            <el-button
              size="small"
              text
              :icon="isStarred(item) ? StarFilled : Star"
              :type="isStarred(item) ? 'warning' : 'default'"
              @click.stop="onStarOne(item)"
            />
            <el-button
              size="small"
              text
              :icon="View"
              :title="t('rss.manager.items.table.detail')"
              @click.stop="onViewDetail(item)"
            />
            <el-popconfirm :title="t('rss.manager.items.table.deleteConfirm')" @confirm="onDeleteItem(item)">
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
          v-model:page-size="itemPageSize"
          :page-sizes="[20, 50, 100, 200, 500]"
          :total="totalItems"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="onItemPageSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </div>

    <!-- Move category dialog -->
    <el-dialog v-model="moveDialogVisible" :title="t('rss.manager.items.moveDialog.title')" width="460px">
      <el-alert
        v-if="batchSelected.length === 0"
        :title="t('rss.manager.items.moveDialog.noneSelected')"
        type="info"
        :closable="false"
        style="margin-bottom: 12px;"
      />
      <el-form label-position="top">
        <el-form-item :label="t('rss.manager.items.moveDialog.label')">
          <el-select
            v-model="moveTargetCategory"
            filterable
            clearable
            style="width: 100%"
            :placeholder="t('rss.manager.items.moveDialog.placeholder')"
          >
            <el-option
              v-for="c in categoryOptions"
              :key="c.value"
              :label="`${c.icon} ${c.label}`"
              :value="c.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="moveDialogVisible = false">{{ t("rss.manager.items.moveDialog.cancel") }}</el-button>
        <el-button
          type="primary"
          :disabled="!moveTargetCategory || !batchSelected.length"
          :loading="batchOpLoading.move"
          @click="onBatchMove"
        >{{ t("rss.manager.items.moveDialog.confirm", { n: batchSelected.length }) }}</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, computed, reactive, onBeforeUnmount, markRaw, nextTick } from "vue";
import {
  Search, Refresh, Download, View, Delete, Star, StarFilled, Select, FolderChecked
} from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { toRef } from "vue";
import type { RssSeedDocument, RssItemDocument } from "@/api/modules/rssService";
import { roleColor as roleColorFn } from "@/views/knowledge/executive/okrData";
import { getSeedList } from "@/api/modules/rssService";
import { useItems, computeImportanceFor } from "./useItems";
import ECharts from "@/components/ECharts/index.vue";
import { useFormatting } from "./useFormatting";
import { ElMessage } from "element-plus";
import type { DisposerBag } from "@/utils/disposer";
import { loadJson, saveJson } from "@/utils/storage";

const props = defineProps<{
  selectedRoles: string[];
  viewMode: "card" | "list" | "table";
}>();

const emit = defineEmits<{
  "update:viewMode": [value: "card" | "list" | "table"];
  "viewArticle": [item: RssItemDocument];
  "itemsChanged": [];
}>();

const { t, subCategory, formatDate, formatRelativeTime, trimSummary, roleFromCategory } = useFormatting();
const roleColor = (cat?: string) => {
  const rid = cat?.split("/")[0] || "";
  return roleColorFn(rid);
};

const rolesRef = toRef(props, "selectedRoles");
const advancedFiltersOpen = ref(false);

const itemsBag: DisposerBag = (() => {
  // Just a local placeholder to satisfy bag.reset pattern
  return {
    addTimer: () => ({}) as any,
    addAbort: () => ({}) as any,
    addFn: () => ({}) as any,
    reset: () => {},
    dispose: () => {}
  } as any;
})();

// Seeds for source/category options
const seeds = ref<RssSeedDocument[]>([]);
async function loadSeedsForOptions() {
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), 12_000);
  itemsBag.addTimer(tm);
  itemsBag.addAbort(ctrl);
  try {
    const res = await getSeedList({}, { timeout: 10_000, signal: ctrl.signal } as any);
    seeds.value = res.data?.list ?? [];
  } catch {
    seeds.value = seeds.value ?? [];
  } finally {
    clearTimeout(tm);
  }
}

const seedOptions = computed(() => {
  const roleSet = rolesRef.value.length ? new Set(rolesRef.value) : null;
  return seeds.value
    .filter(s => s.name && (!roleSet || roleSet.has((s.category || "").split("/")[0] || "")))
    .map(s => ({ label: s.name!, value: s.name! }));
});

const categoryOptions = computed(() => {
  const roleSet = rolesRef.value.length ? new Set(rolesRef.value) : null;
  const seen = new Set<string>();
  const out: { label: string; value: string; icon: string }[] = [];
  for (const s of seeds.value) {
    const cat = s.category || "";
    if (!cat || !cat.includes("/")) continue;
    const rid = roleFromCategory(cat);
    if (roleSet && !roleSet.has(rid)) continue;
    if (seen.has(cat)) continue;
    seen.add(cat);
    out.push({ label: cat.slice(rid.length + 1), value: cat, icon: "\uD83D\uDCC1" });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
});

// useItems
const state = useItems(rolesRef, t);
const loading = computed(() => state.loading.value);
const err = computed(() => state.err.value);
const items = computed(() => state.items.value);
const totalItems = computed(() => Math.max(state.total.value || 0, state.count.value));
const itemPage = computed({
  get: () => state.pageNum.value,
  set: (v) => state.setPageNum(v)
});
const itemPageSize = computed({
  get: () => state.pageSize.value,
  set: (v) => state.setPageSize(v)
});
const pieOption = computed(() => state.pieOption.value);
const heatOption = computed(() => state.heatOption.value);
const computeImportance = (i: RssItemDocument) => state.computeImportance(i);
const isStarred = (i: RssItemDocument) => state.isStarred(i);

// Top-level refs for template auto-unwrap (TS2339 fix: avoid state.*.length / state.*.has via plain obj)
const batchSelected = computed(() => state.batchSelected.value);
const pruneSuggestedKeys = computed(() => state.pruneSuggestedKeys.value);
const starredKeys = computed(() => state.starredKeys.value);
const stateFilters = state.filters;

const exportingItems = ref(false);

const timePreset = ref<string>("all");
const sortKey = ref<string>("published_parsed");
const dateRangeBind = ref<string[] | null>(null);
const importanceFilterBind = ref<number>(1);
const heatSelectionRoles = ref<string[]>([]);
const tableRef = ref<any>(null);
const selectedMap = ref<any>([]); // only for card checkbox model
const selectedItems = ref<RssItemDocument[]>([]);
const batchOpLoading = reactive({ star: false, prune: false, move: false });

const moveDialogVisible = ref(false);
const moveTargetCategory = ref("");

function isSelected(item: RssItemDocument) {
  const id = item.key ?? item.link ?? "";
  return state.batchSelected.value.some(s => (s.key ?? s.link ?? "") === id);
}
function toggleSelectOne(item: RssItemDocument, v: boolean) {
  if (v) {
    if (!isSelected(item)) state.batchSelected.value.push(item);
  } else {
    const id = item.key ?? item.link ?? "";
    state.batchSelected.value = state.batchSelected.value.filter(s => (s.key ?? s.link ?? "") !== id);
  }
}

function onSelectionChange(rows: RssItemDocument[]) {
  selectedItems.value = rows;
  state.batchSelected.value = [...rows];
}
function clearSelection() {
  state.batchSelected.value = [];
  selectedItems.value = [];
  selectedMap.value = [];
  tableRef.value?.clearSelection?.();
}

function onImportanceSlider(v: number | number[]) {
  const val = Array.isArray(v) ? v[v.length - 1] : v;
  state.filters.importanceMin = val === 1 ? null : val;
  onItemFilterChange();
}

function setTimePreset(preset: string | number | boolean | undefined) {
  const val = typeof preset === "string" ? preset : preset != null ? String(preset) : "";
  dateRangeBind.value = null;
  state.filters.startDate = null;
  state.filters.endDate = null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (val === "today") {
    state.filters.startDate = new Date(today);
    const end = new Date(today);
    end.setDate(end.getDate() + 1);
    state.filters.endDate = end;
  } else if (val === "week") {
    const start = new Date(today);
    start.setDate(start.getDate() - 7);
    state.filters.startDate = start;
    state.filters.endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  } else if (val === "month") {
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    state.filters.startDate = start;
    state.filters.endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  onItemFilterChange();
}

function onItemFilterChange() {
  // Sync date range
  if (dateRangeBind.value && dateRangeBind.value.length === 2) {
    const [s, e] = dateRangeBind.value;
    state.filters.startDate = s ? new Date(s + "T00:00:00") : null;
    const end = e ? new Date(e + "T23:59:59") : null;
    state.filters.endDate = end;
  } else if (state.filters.startDate && !dateRangeBind.value) {
    // Keep from setTimePreset
  }
  // Sync roles
  if (heatSelectionRoles.value.length) {
    state.filters.selectedRoles = new Set(heatSelectionRoles.value);
  } else {
    state.filters.selectedRoles = new Set(rolesRef.value);
  }
  state.setPageNum(1);
  void loadUIItems();
}

function loadUIItems() {
  return state.loadItems({ resetPage: false });
}

function onPageChange(p: number) {
  state.setPageNum(p);
  void loadUIItems();
}

function onItemPageSizeChange(n: number) {
  state.setPageSize(n);
  state.setPageNum(1);
  void loadUIItems();
}

const hasActiveFilters = computed(() => {
  const f = state.filters;
  if (f.search) return true;
  if (f.categoryFilter) return true;
  if (f.sourceUrlFilter) return true;
  if (f.importanceMin) return true;
  if (f.starredOnly) return true;
  if (f.startDate || f.endDate) return true;
  if (heatSelectionRoles.value.length) return true;
  return false;
});

function clearFiltersLocal() {
  const f = state.filters;
  f.search = "";
  f.categoryFilter = "";
  f.sourceUrlFilter = "";
  f.importanceMin = null;
  f.starredOnly = false;
  f.startDate = null;
  f.endDate = null;
  f.selectedRoles = new Set(rolesRef.value);
  importanceFilterBind.value = 1;
  timePreset.value = "all";
  dateRangeBind.value = null;
  heatSelectionRoles.value = [];
  onItemFilterChange();
}

// Importance color
function importanceColor(v: number) {
  const map: Record<number, string> = {
    1: "rgba(245,108,108,0.18)",
    2: "rgba(230,162,60,0.2)",
    3: "rgba(250,173,20,0.22)",
    4: "rgba(103,194,58,0.22)",
    5: "rgba(64,158,255,0.25)"
  };
  return map[v] ?? "var(--el-fill-color-light)";
}
function importanceTooltip(v: number) {
  return ({
    1: t("rss.manager.items.importance.1"),
    2: t("rss.manager.items.importance.2"),
    3: t("rss.manager.items.importance.3"),
    4: t("rss.manager.items.importance.4"),
    5: t("rss.manager.items.importance.5")
  } as Record<number, string>)[v] ?? String(v);
}

// Sort by sortKey
const sortedItems = computed(() => {
  const list = items.value.slice();
  const k = sortKey.value;
  if (k === "published_parsed") {
    list.sort((a, b) => {
      const pa = typeof a.published_parsed === "number" ? a.published_parsed : new Date(a.published ?? 0).getTime();
      const pb = typeof b.published_parsed === "number" ? b.published_parsed : new Date(b.published ?? 0).getTime();
      return pb - pa;
    });
  } else if (k === "published_parsed-asc") {
    list.sort((a, b) => {
      const pa = typeof a.published_parsed === "number" ? a.published_parsed : new Date(a.published ?? 0).getTime();
      const pb = typeof b.published_parsed === "number" ? b.published_parsed : new Date(b.published ?? 0).getTime();
      return pa - pb;
    });
  } else if (k === "source_name") {
    list.sort((a, b) => String(a.source_name ?? "").localeCompare(String(b.source_name ?? "")));
  } else if (k === "category_path") {
    list.sort((a, b) => String(a.category_path ?? "").localeCompare(String(b.category_path ?? "")));
  }
  return list;
});

// Recent articles (localStorage)
const RECENT_ARTICLES_KEY = "rss.recentArticles";
const MAX_RECENT = 8;
const recentArticles = ref<RssItemDocument[]>(loadJson<RssItemDocument[]>(RECENT_ARTICLES_KEY, []));
function addRecentArticle(a: RssItemDocument) {
  const id = a.key ?? a.link;
  recentArticles.value = [a, ...recentArticles.value.filter(x => (x.key ?? x.link) !== id)].slice(0, MAX_RECENT);
  saveJson(RECENT_ARTICLES_KEY, recentArticles.value);
}
function clearRecentArticles() {
  recentArticles.value = [];
  saveJson(RECENT_ARTICLES_KEY, []);
}
function openArticleLink(item: RssItemDocument) {
  if (item.link) window.open(item.link, "_blank", "noopener,noreferrer");
  addRecentArticle(item);
}

// Article interactions
function onArticleRowClick(item: RssItemDocument) {
  if (item.link) window.open(item.link, "_blank", "noopener,noreferrer");
  addRecentArticle(item);
}
function onViewDetail(row: RssItemDocument) {
  emit("viewArticle", row);
}
async function onDeleteItem(row: RssItemDocument) {
  if (!row.key) return;
  const n = await state.pruneItems([row], { keepStarred: false });
  if (n > 0) {
    ElMessage.success(t("rss.manager.items.delete.ok"));
    emit("itemsChanged");
  }
}

async function onStarOne(row: RssItemDocument) {
  await state.toggleStar([row]);
  ElMessage.success(t("rss.manager.items.star.ok"));
  emit("itemsChanged");
}

async function onQuickPruneOne(row: RssItemDocument) {
  const n = await state.pruneItems([row], { keepStarred: true });
  if (n > 0) {
    ElMessage.success(t("rss.manager.items.prune.suggestedOk"));
    emit("itemsChanged");
  } else {
    ElMessage.info(t("rss.manager.items.prune.skippedStarred"));
  }
}

const prunableCount = computed(() => state.batchSelected.value.filter(s => !isStarred(s)).length);
const starCount = computed(() => state.batchSelected.value.length - prunableCount.value);

async function onBatchStar() {
  if (!state.batchSelected.value.length) return;
  batchOpLoading.star = true;
  try {
    await state.toggleStar(state.batchSelected.value);
    ElMessage.success(t("rss.manager.items.batchStarOk", { n: state.batchSelected.value.length }));
    emit("itemsChanged");
  } finally {
    batchOpLoading.star = false;
  }
}
async function onBatchPrune() {
  if (!state.batchSelected.value.length) return;
  batchOpLoading.prune = true;
  try {
    const n = await state.pruneItems(state.batchSelected.value, { keepStarred: true });
    if (n > 0) {
      ElMessage.success(t("rss.manager.items.batchPruneOk", { n, total: state.batchSelected.value.length }));
      clearSelection();
      void loadUIItems();
      emit("itemsChanged");
    } else {
      ElMessage.info(t("rss.manager.items.prune.skippedStarred"));
    }
  } finally {
    batchOpLoading.prune = false;
  }
}
async function onBatchMove() {
  if (!moveTargetCategory.value || !state.batchSelected.value.length) return;
  batchOpLoading.move = true;
  try {
    await state.moveCategory(state.batchSelected.value, moveTargetCategory.value);
    ElMessage.success(t("rss.manager.items.moveDialog.ok", { n: state.batchSelected.value.length, cat: moveTargetCategory.value }));
    moveDialogVisible.value = false;
    moveTargetCategory.value = "";
    clearSelection();
    void loadUIItems();
    emit("itemsChanged");
  } finally {
    batchOpLoading.move = false;
  }
}

// Charts click filters
function onPieClick(p: any) {
  if (!p || !p.data) return;
  const full = p.data.fullName ?? p.name;
  if (!full) return;
  // Find matching full category path by distribution key
  const keys = Object.keys(state.categoryDistribution.value);
  let hit: string | null = null;
  for (const k of keys) {
    const sub = k.split("/").slice(1).join("/") || k;
    if (sub === full || k === full) { hit = k; break; }
  }
  if (!hit) return;
  state.filters.categoryFilter = hit;
  ElMessage.info(t("rss.manager.items.filterApplied", { cat: hit }));
  state.setPageNum(1);
  void loadUIItems();
}
function onHeatClick(p: any) {
  if (!p || !p.data || !Array.isArray(p.data.value)) return;
  const [x, y] = p.data.value;
  if (typeof y !== "number") return;
  const yLabels: string[] = ["executive", "aier", "engineer", "sre", "product", "curator", "leader"];
  const role = yLabels[y];
  if (!role) return;
  heatSelectionRoles.value = [role];
  const min = typeof x === "number" ? x + 1 : null;
  state.filters.importanceMin = min === 1 ? null : min;
  if (min && min > 1) importanceFilterBind.value = min;
  ElMessage.info(t("rss.manager.items.heatFiltered", { role, imp: min ?? 1 }));
  state.setPageNum(1);
  void loadUIItems();
}

// Export items (simple JSON/CSV blob)
async function exportItems() {
  if (!items.value.length) {
    ElMessage.info(t("rss.manager.items.export.noData"));
    return;
  }
  exportingItems.value = true;
  try {
    const rows = sortedItems.value;
    const headers = ["title", "source_name", "author", "published", "category_path", "link", "summary"];
    const escape = (s: any) => `"${String(s ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
    const csv = [headers.join(","), ...rows.map(r => headers.map(h => escape((r as any)[h])).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ts = new Date().toISOString().slice(0, 10);
    a.download = `yivad-rss-items-${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    ElMessage.success(t("rss.manager.items.export.ok", { n: rows.length }));
  } finally {
    exportingItems.value = false;
  }
}

defineExpose({
  focusSearch() {
    nextTick(() => {
      const el = document.querySelector<HTMLElement>(".rss-role__section .rss-role__toolbar .el-input__inner");
      el?.focus?.();
    });
  },
  refresh: loadUIItems
});

onMounted(() => {
  void loadSeedsForOptions();
  void state.loadItems({ resetPage: true });
  void state.loadPruneSnapshot();
});

watch(rolesRef, () => {
  itemsBag.reset();
  heatSelectionRoles.value = [];
  state.filters.selectedRoles = new Set(rolesRef.value);
  state.setPageNum(1);
  void loadSeedsForOptions();
  void loadUIItems();
}, { deep: true });

onBeforeUnmount(() => {
  state.dispose();
  itemsBag.dispose();
});
</script>

<style scoped lang="scss">
@use "./ItemsSection.scss";
@use "@/views/knowledge/executive/styles/rssManager.scss" as *;

.rss-items__chart-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 12px;
  margin-bottom: 12px;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}
.rss-items__chart {
  min-width: 0;
}
.rss-items__imp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  line-height: 1;
  color: var(--el-text-color-primary);
  border: 1px solid var(--el-border-color-lighter);
}
.rss-role__item-starred { font-size: 14px; display: inline-flex; vertical-align: middle; }
.rss-items__err { margin-bottom: 8px; }
</style>
