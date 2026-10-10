<template>
  <section class="rss-role__section">
    <div class="rss-role__section-head">
      <h2 class="rss-role__section-title">{{ t("rss.manager.seeds.title") }}</h2>
      <span class="rss-role__result-count">{{
        t("rss.manager.seeds.resultCount", { filtered: filteredSeeds.length, total: feedsCount })
      }}</span>
      <span class="rss-role__toolbar-right">
        <el-button :icon="Timer" size="small" type="success" plain @click="retryVisible = true">
          {{ t("rss.manager.retry.drawerTitle") }}
          <el-badge :value="retryQueue.length" :hidden="retryQueue.length === 0" class="ml-2" />
        </el-button>
        <el-button :icon="Upload" size="small" @click="onImportOpml">{{ t("rss.scheduler.importOpml") }}</el-button>
        <el-button :icon="Download" size="small" @click="onExportOpml">{{ t("rss.scheduler.exportOpml") }}</el-button>
        <el-button type="primary" size="small" :icon="Plus" @click="openSeedDialog()">{{ t("rss.manager.seeds.addSource") }}</el-button>
        <el-button size="small" :icon="Refresh" @click="onParseAll" :loading="parseAllLoading">{{
          t("rss.manager.seeds.parseAllBtn")
        }}</el-button>
        <el-button size="small" :icon="Link" @click="quickParseVisible = true">{{ t("rss.manager.seeds.quickParseBtn") }}</el-button>
      </span>
    </div>

    <div class="rss-role__section-body">
      <!-- P0 #1: Health Dashboard KPI cards -->
      <div class="rss-kpi-row">
        <div class="rss-kpi-card" :title="t('rss.manager.kpi.totalFeeds.title')">
          <div class="rss-kpi-card__label">
            <span class="rss-kpi-card__icon">📡</span>
            {{ t("rss.manager.kpi.totalFeeds.label") }}
          </div>
          <div class="rss-kpi-card__value">
            {{ totalFeedsKpi }}
            <span class="rss-kpi-card__unit">{{ t("rss.manager.kpi.totalFeeds.unit") }}</span>
          </div>
          <div class="rss-kpi-card__spark">
            <ECharts :option="sparkOption(totalSparkline, '#409EFF')" height="32" />
          </div>
        </div>
        <div class="rss-kpi-card" :title="t('rss.manager.kpi.healthyToday.title')">
          <div class="rss-kpi-card__label">
            <span class="rss-kpi-card__icon">🟢</span>
            {{ t("rss.manager.kpi.healthyToday.label") }}
          </div>
          <div class="rss-kpi-card__value">
            {{ healthyTodayKpi }}
            <span class="rss-kpi-card__unit">/ {{ totalFeedsKpi }}</span>
            <span
              class="rss-kpi-card__pill"
              :class="healthyTodayKpi === totalFeedsKpi ? 'pill-green' : 'pill-yellow'"
              style="margin-left:auto"
            >
              {{ totalFeedsKpi ? Math.round(100 * healthyTodayKpi / totalFeedsKpi) : 0 }}%
            </span>
          </div>
          <div class="rss-kpi-card__spark">
            <ECharts :option="sparkOption(healthySparkline, '#67c23a')" height="32" />
          </div>
        </div>
        <div class="rss-kpi-card" :title="t('rss.manager.kpi.staleLast7d.title')">
          <div class="rss-kpi-card__label">
            <span class="rss-kpi-card__icon">🟥</span>
            {{ t("rss.manager.kpi.staleLast7d.label") }}
          </div>
          <div class="rss-kpi-card__value">
            {{ staleLast7dKpi }}
            <span class="rss-kpi-card__unit">{{ t("rss.manager.kpi.staleLast7d.unit") }}</span>
            <span
              class="rss-kpi-card__pill"
              :class="staleLast7dKpi === 0 ? 'pill-green' : staleLast7dKpi < 4 ? 'pill-orange' : 'pill-red'"
              style="margin-left:auto"
            >
              {{ staleLast7dKpi === 0 ? t("rss.manager.kpi.ok") : t("rss.manager.kpi.attention") }}
            </span>
          </div>
          <div class="rss-kpi-card__spark">
            <ECharts :option="sparkOption(staleSparkline, '#f56c6c', true)" height="32" />
          </div>
        </div>
        <div class="rss-kpi-card" :title="t('rss.manager.kpi.avgFetchLatency.title')">
          <div class="rss-kpi-card__label">
            <span class="rss-kpi-card__icon">⏱</span>
            {{ t("rss.manager.kpi.avgFetchLatency.label") }}
          </div>
          <div class="rss-kpi-card__value">
            {{ avgFetchLatencyKpi }}
            <span class="rss-kpi-card__unit">ms</span>
            <span
              class="rss-kpi-card__pill"
              :class="avgFetchLatencyKpi === 0 ? 'pill-gray' : avgFetchLatencyKpi < 400 ? 'pill-green' : avgFetchLatencyKpi < 800 ? 'pill-yellow' : 'pill-red'"
              style="margin-left:auto"
            >
              {{ avgFetchLatencyKpi < 200 ? "L" : avgFetchLatencyKpi < 400 ? "ML" : avgFetchLatencyKpi < 800 ? "MH" : avgFetchLatencyKpi < 1600 ? "H" : "VH" }}
            </span>
          </div>
          <div class="rss-kpi-card__spark">
            <ECharts
              :option="sparkOption(latencySparkline, avgFetchLatencyColor)"
              height="32"
            />
          </div>
        </div>
      </div>

      <!-- P0 #4: Enhanced Filter Toolbar -->
      <div class="rss-role__toolbar">
        <el-input
          v-model="seedSearch"
          :placeholder="t('rss.manager.seeds.searchPlaceholder')"
          clearable
          :prefix-icon="Search"
          style="width: 220px"
        />
        <el-select
          v-model="fetchStatusFilter"
          :placeholder="t('rss.manager.filters.fetchStatus.all')"
          clearable
          style="width: 150px"
        >
          <el-option :label="t('rss.manager.filters.fetchStatus.all')" value="" />
          <el-option :label="t('rss.manager.filters.fetchStatus.ok')" value="ok" />
          <el-option :label="t('rss.manager.filters.fetchStatus.failing')" value="failing" />
          <el-option :label="t('rss.manager.filters.fetchStatus.timeout')" value="timeout" />
          <el-option :label="t('rss.manager.filters.fetchStatus.stale')" value="stale" />
        </el-select>
        <el-date-picker
          v-model="monthRange"
          type="month"
          :placeholder="t('rss.manager.filters.month.placeholder')"
          format="YYYY-MM"
          value-format="YYYY-MM"
          style="width: 160px"
          @change="() => currentMonthOnly = true"
        />
        <el-checkbox v-model="currentMonthOnly">
          {{ t("rss.manager.filters.month.currentOnly") }}
        </el-checkbox>
        <el-button size="small" text @click="onRefreshAll">
          <el-icon class="mr-1"><Refresh /></el-icon>
          {{ t("rss.manager.items.refresh") }}
        </el-button>
      </div>

      <!-- P0 #3: Monthly Prune Compliance Board -->
      <div v-if="pruneSnapshot" class="rss-prune-board rss-prune-board--section" v-loading="pruneLoading">
        <div class="rss-prune-board__head">
          <div>
            <div class="rss-prune-board__title">
              🪓 {{ t("rss.manager.prune.boardTitle") }}
            </div>
            <div class="rss-prune-board__subtitle">
              {{ t("rss.manager.prune.rule") }}
            </div>
          </div>
          <el-tag
            size="large"
            effect="dark"
            :type="pruneTagType"
          >
            {{ t("rss.manager.prune.currentMonthRate", { pct: pruneSnapshot.currentRate, target: pruneSnapshot.targetRate }) }}
          </el-tag>
        </div>
        <div class="rss-prune-board__gauge">
          <div class="rss-prune-board__gauge-chart">
            <ECharts :option="pruneGaugeOption" height="160" />
          </div>
          <div class="rss-prune-board__gauge-meta">
            <div>
              <span class="big" :style="{ color: pruneColor }">{{ pruneSnapshot.currentRate }}%</span>
              {{ t("rss.manager.prune.gauge.current") }}
            </div>
            <div :class="pruneMetaClass">
              🎯 {{ t("rss.manager.prune.gauge.target") }}：{{ pruneSnapshot.targetRate }}%
              · {{ pruneReachDescription }}
            </div>
            <div>
              🔁 {{ t("rss.manager.prune.gauge.byRoleBest") }}：
              <span class="target">
                {{ bestRoleName }} ({{ bestRoleRate }}%)
              </span>
              · {{ t("rss.manager.prune.gauge.byRoleWorst") }}：
              <span :class="worstRoleRate >= 80 ? 'target' : 'warn'">
                {{ worstRoleName }} ({{ worstRoleRate }}%)
              </span>
            </div>
            <div style="color: var(--el-text-color-secondary); font-size: 11px;">
              ✅ {{ t("rss.manager.prune.gauge.updateAgo") }}：{{ formatAgo(pruneSnapshot.updatedAt) }}
            </div>
          </div>
        </div>
        <div class="rss-prune-board__body">
          <div class="rss-prune-board__panel">
            <div class="rss-prune-board__panel-title">
              {{ t("rss.manager.prune.panels.monthly.title") }}
            </div>
            <ECharts :option="pruneBarOption" height="220" />
          </div>
          <div class="rss-prune-board__panel">
            <div class="rss-prune-board__panel-title">
              {{ t("rss.manager.prune.panels.heat.title") }}
            </div>
            <table class="rss-heat-table" v-if="heatMonths.length && heatRoles.length">
              <thead>
                <tr>
                  <th>{{ t("rss.manager.prune.panels.heat.role") }}</th>
                  <th v-for="m in heatMonths" :key="m">{{ m }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in heatRoles" :key="r">
                  <td class="role-cell">{{ roleDisplayName(r) }}</td>
                  <td
                    v-for="m in heatMonths"
                    :key="`${r}-${m}`"
                    class="rss-heat-cell"
                    :style="heatCellStyle(heatRate(r, m))"
                    :title="`${roleDisplayName(r)} · ${m} · ${heatRate(r, m)}%`"
                  >
                    {{ heatRate(r, m) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 0 seeds → 引导用户添加推荐种子 -->
      <div v-if="!seedsLoading && !filteredSeeds.length" class="rss-role__suggest-wrap">
        <div class="rss-briefing__suggest">
          <div class="rss-briefing__suggest-head">
            <div>
              <div class="rss-briefing__suggest-title">{{ t("rss.manager.briefing.suggest.title") }}</div>
              <div class="rss-briefing__suggest-sub">
                {{ t("rss.manager.briefing.suggest.sub", { n: suggest.suggestedSeeds.value.length }) }}
              </div>
            </div>
            <el-button
              type="primary"
              size="small"
              :loading="suggest.addAllLoading.value"
              :disabled="!suggest.suggestedSeeds.value.length"
              @click="onSuggestAddAll"
              >{{ t("rss.manager.briefing.suggest.addAll") }}</el-button
            >
          </div>
          <div class="rss-briefing__suggest-grid">
            <div
              v-for="seed in suggest.suggestedSeeds.value"
              :key="seed.key"
              class="rss-briefing__suggest-card"
              :class="{ 'is-added': suggest.suggestedAdded.has(seed.key) }"
            >
              <div class="rss-briefing__suggest-card-top">
                <span class="rss-briefing__suggest-card-cat">
                  <span class="rss-role__cat-dot" :style="{ background: roleColor(seed.category) }"></span>
                  {{ subCategory(seed.category) }}
                </span>
                <span v-if="suggest.suggestedAdded.has(seed.key)" class="rss-briefing__suggest-card-added">✓</span>
              </div>
              <div class="rss-briefing__suggest-card-name">{{ seed.name }}</div>
              <div class="rss-briefing__suggest-card-url" :title="seed.url">{{ seed.url }}</div>
              <el-button
                size="small"
                type="primary"
                plain
                :disabled="suggest.suggestedAdded.has(seed.key)"
                :loading="suggest.suggestedLoading.value === seed.key"
                @click.stop="onSuggestAddOne(seed)"
                >{{
                  suggest.suggestedAdded.has(seed.key)
                    ? t("rss.manager.briefing.suggest.added")
                    : t("rss.manager.briefing.suggest.addOne")
                }}</el-button
              >
            </div>
          </div>
          <div v-if="!suggest.suggestedSeeds.value.length" class="rss-briefing__chart-empty">
            <div class="rss-briefing__chart-empty-glyph">📡</div>
            <div class="rss-briefing__chart-empty-title">{{ t("rss.manager.briefing.suggest.allAdded") }}</div>
          </div>
        </div>
      </div>

      <el-table
        v-if="viewMode === 'table' && (seedsLoading || filteredSeeds.length)"
        :data="filteredSeeds"
        v-loading="seedsLoading"
        stripe
        border
        style="width: 100%; margin-top: 16px;"
        row-key="url"
        :empty-text="seedsLoading ? '' : t('rss.manager.seeds.table.noData')"
      >
        <el-table-column prop="name" :label="t('rss.manager.seeds.table.name')" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <div style="display:flex; align-items:center; gap:6px;">
              <span
                v-if="healthAggregate[(row as RssSeedDocument).url ?? '']?.stale"
                class="rss-fetch-pill status-stale"
                :title="t('rss.manager.seeds.table.stale7d')"
              >
                <span class="rss-fetch-pill__dot"></span>
                {{ t("rss.manager.seeds.table.stale") }}
              </span>
              {{ (row as RssSeedDocument).name ?? "-" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('rss.manager.seeds.table.feedUrl')" min-width="260">
          <template #default="{ row }">
            <a
              :href="(row as RssSeedDocument).url"
              target="_blank"
              rel="noopener noreferrer"
              class="rss-role__seed-url-link"
              :title="(row as RssSeedDocument).url"
            >
              <span class="rss-role__seed-url-glyph">🔗</span>
              <span class="rss-role__seed-url-text">{{ (row as RssSeedDocument).url }}</span>
            </a>
          </template>
        </el-table-column>
        <el-table-column :label="t('rss.manager.seeds.table.category')" width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="subCategory((row as RssSeedDocument).category)" class="rss-role__cat-chip">
              <span class="rss-role__cat-dot" :style="{ background: roleColor((row as RssSeedDocument).category) }"></span
              >{{ subCategory((row as RssSeedDocument).category) }}
            </span>
            <span v-else class="rss-role__text-muted">{{ t("rss.manager.detail.fields.unknown") }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('rss.manager.seeds.table.interval')" width="90" align="center">
          <template #default="{ row }">
            <span v-if="seedIntervals[(row as RssSeedDocument).url]" class="rss-role__schedule-badge">
              {{ formatInterval(seedIntervals[(row as RssSeedDocument).url]) }}
            </span>
            <span v-else class="rss-role__text-muted">{{ t("rss.manager.seeds.table.globalInterval") }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('rss.manager.seeds.table.latency')" width="100" align="center">
          <template #default="{ row }">
            <span
              v-if="healthAggregate[(row as RssSeedDocument).url ?? '']?.avgLatency10"
              style="font-weight:700; font-family: DIN,monospace;"
              :style="{ color: latencyTierColorFn(healthAggregate[(row as RssSeedDocument).url ?? ''].avgLatency10) }"
            >
              {{ Math.round(healthAggregate[(row as RssSeedDocument).url ?? ''].avgLatency10) }}ms
            </span>
            <span v-else class="rss-role__text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('rss.manager.seeds.table.testResult')" width="190">
          <template #default="{ row }">
            <render-fetch-pill
              :status="testFetchStatus[(row as RssSeedDocument).url ?? '']"
              :loading="!!testFetchLoading[(row as RssSeedDocument).url ?? '']"
            />
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
            <span v-else class="rss-role__text-muted">{{ t("rss.manager.detail.fields.unknown") }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('rss.manager.seeds.table.lastParsed')" width="110" align="center">
          <template #default="{ row }">
            <el-tooltip
              v-if="parseTimes[(row as RssSeedDocument).url]"
              :content="formatTime(new Date(parseTimes[(row as RssSeedDocument).url]))"
              placement="top"
              :show-after="400"
            >
              <span class="rss-role__date">{{ formatTimeAgo(parseTimes[(row as RssSeedDocument).url]) }}</span>
            </el-tooltip>
            <span v-else class="rss-role__text-muted">{{ t("rss.manager.seeds.table.neverParsed") }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('rss.manager.seeds.table.actions')" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              text
              type="success"
              :loading="!!testFetchLoading[(row as RssSeedDocument).url ?? '']"
              @click.stop="testFetch(row as RssSeedDocument)"
            >
              {{ t("rss.manager.seeds.table.test") }}
            </el-button>
            <el-button
              size="small"
              text
              type="primary"
              :loading="parsingSeed === (row as RssSeedDocument).url"
              @click.stop="onParseOne(row as RssSeedDocument)"
            >
              {{
                parsingSeed === (row as RssSeedDocument).url
                  ? t("rss.manager.seeds.table.editing")
                  : t("rss.manager.seeds.table.parse")
              }}
            </el-button>
            <el-button size="small" text @click.stop="openSeedDialog(row as RssSeedDocument)">{{
              t("rss.manager.seeds.table.edit")
            }}</el-button>
            <el-popconfirm :title="t('rss.manager.seeds.deleteConfirm')" @confirm="removeSeed(row as RssSeedDocument)">
              <template #reference>
                <el-button size="small" text type="danger" :icon="Delete" @click.stop />
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div v-else-if="seedsLoading || filteredSeeds.length" class="rss-role__items-grid" style="margin-top: 16px;">
        <el-card v-for="seed in filteredSeeds" :key="seed.url" class="rss-role__seed-card" shadow="hover">
          <div class="rss-role__seed-card-head">
            <div style="display:flex; align-items:center; gap:6px; min-width:0;">
              <span
                v-if="healthAggregate[seed.url ?? '']?.stale"
                class="rss-fetch-pill status-stale"
              >
                <span class="rss-fetch-pill__dot"></span>
                {{ t("rss.manager.seeds.table.stale") }}
              </span>
              <span class="rss-role__seed-card-name">{{ seed.name }}</span>
            </div>
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
              <span class="rss-role__cat-dot" :style="{ background: roleColor(seed.category) }"></span
              >{{ subCategory(seed.category) }}
            </span>
            <span v-if="seedIntervals[seed.url]">{{ formatInterval(seedIntervals[seed.url]) }}</span>
            <span v-else>{{ t("rss.manager.seeds.card.globalInterval") }}</span>
            <span
              v-if="healthAggregate[seed.url ?? '']?.avgLatency10"
              style="font-weight:700; font-family: DIN,monospace;"
              :style="{ color: latencyTierColorFn(healthAggregate[seed.url ?? ''].avgLatency10) }"
            >
              {{ Math.round(healthAggregate[seed.url ?? ''].avgLatency10) }}ms
            </span>
            <span v-if="seedArticleCounts[seed.url] !== undefined">{{
              t("rss.manager.seeds.card.articles", { n: seedArticleCounts[seed.url] })
            }}</span>
            <span v-if="parseTimes[seed.url]">{{ formatTimeAgo(parseTimes[seed.url]) }}</span>
            <span v-else>{{ t("rss.manager.seeds.card.neverParsed") }}</span>
          </div>
          <div style="margin:2px 0 -4px;">
            <render-fetch-pill
              :status="testFetchStatus[seed.url ?? '']"
              :loading="!!testFetchLoading[seed.url ?? '']"
            />
          </div>
          <div class="rss-role__seed-card-actions">
            <el-button
              size="small"
              text
              type="success"
              :loading="!!testFetchLoading[seed.url ?? '']"
              @click.stop="testFetch(seed)"
            >{{ t("rss.manager.seeds.table.test") }}</el-button>
            <el-button
              size="small"
              text
              type="primary"
              :loading="parsingSeed === seed.url"
              @click.stop="onParseOne(seed)"
              >{{
                parsingSeed === seed.url ? t("rss.manager.seeds.table.editing") : t("rss.manager.seeds.table.parse")
              }}</el-button
            >
            <el-button size="small" text @click.stop="openSeedDialog(seed)">{{
              t("rss.manager.seeds.table.edit")
            }}</el-button>
            <el-popconfirm :title="t('rss.manager.seeds.deleteConfirm')" @confirm="removeSeed(seed)">
              <template #reference>
                <el-button size="small" text type="danger" :icon="Delete" @click.stop />
              </template>
            </el-popconfirm>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Seed Dialog (extended) -->
    <SeedDialog
      :visible="seedDialogVisible"
      :editing-seed="editingSeed"
      :seed-form="seedForm"
      :seed-saving="seedSaving"
      :category-groups="categoryGroups"
      @update:visible="seedDialogVisible = $event"
      @save="saveSeed"
    />

    <!-- Quick Parse Dialog -->
    <QuickParseDialog
      :visible="quickParseVisible"
      :loading="quickParseLoading"
      :form="quickParseForm"
      @update:visible="quickParseVisible = $event"
      @parse="onQuickParse"
    />

    <!-- Retry Queue Drawer -->
    <el-drawer
      v-model="retryVisible"
      :title="t('rss.manager.retry.drawerTitleWithCount', { n: retryQueue.length })"
      direction="rtl"
      size="520px"
      destroy-on-close
    >
      <div style="display:flex; flex-direction:column; gap:12px; padding-right:4px;">
        <div style="display:flex; gap:8px; align-items:center;">
          <el-tag effect="light" type="warning">
            {{ t("rss.manager.retry.queuedEntries", { n: retryQueue.length }) }}
          </el-tag>
          <el-button
            size="small"
            type="primary"
            plain
            :disabled="!retryQueue.length"
            @click="retryAll"
          >
            {{ t("rss.manager.retry.retryAll") }}
          </el-button>
          <el-button
            size="small"
            text
            type="danger"
            :disabled="!retryQueue.length"
            @click="abandonAll"
          >
            {{ t("rss.manager.retry.abandonAll") }}
          </el-button>
        </div>
        <el-table :data="retryQueue" stripe border empty-text="—">
          <el-table-column :label="t('rss.manager.retry.table.feed')" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <div>
                <div style="font-weight:700;">{{ row.feedName || t("rss.manager.retry.table.unnamed") }}</div>
                <div style="font-size:11px; color:var(--el-text-color-secondary);" :title="row.feedUrl">
                  {{ row.feedUrl }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="t('rss.manager.retry.table.lastError')" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip :content="row.lastError" placement="top" :show-after="400">
                <span style="color:var(--el-color-danger); font-size:12px;">
                  {{ row.lastError?.slice(0, 72) }}{{ (row.lastError?.length ?? 0) > 72 ? "…" : "" }}
                </span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="t('rss.manager.retry.table.retries')" width="80" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.retryCount >= 5 ? 'danger' : row.retryCount >= 3 ? 'warning' : 'info'">
                {{ row.retryCount }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('rss.manager.retry.table.nextRetry')" width="150" align="center">
            <template #default="{ row }">
              {{ formatRelativeRetry(row.nextRetryAt) }}
            </template>
          </el-table-column>
          <el-table-column :label="t('rss.manager.retry.table.actions')" width="150" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" text type="primary" @click="retryOne(row)">
                {{ t("rss.manager.retry.table.retryNow") }}
              </el-button>
              <el-button size="small" text type="danger" @click="abandonRetry(row)">
                {{ t("rss.manager.retry.table.abandon") }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </section>
</template>

<script setup lang="ts">
import { h, onMounted, watch, toRef, computed, defineComponent } from "vue";
import { Search, Plus, Refresh, Link, Delete, Upload, Download, Timer } from "@element-plus/icons-vue";
import type { RssSeedDocument } from "@/api/modules/rssService";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { roleColor as roleColorFn, rolesData } from "@/views/knowledge/executive/okrData";
import {
  useFeeds,
  type FetchStatusPill,
  type RetryQueueEntry
} from "./useFeeds";
import { useSeedSuggest } from "./useSeedSuggest";
import SeedDialog from "./SeedDialog.vue";
import QuickParseDialog from "./QuickParseDialog.vue";
import ECharts from "@/components/ECharts/index.vue";
import { ECOption } from "@/components/ECharts/config";

const props = defineProps<{
  selectedRoles: string[];
  viewMode: "table" | "card";
}>();

const emit = defineEmits<{
  "update:viewMode": [value: "table" | "card"];
  feedsChanged: [];
}>();

const { t } = useI18n();

const roleColor = (cat?: string) => {
  const rid = cat?.split("/")[0] || "";
  return roleColorFn(rid);
};

function latencyTierColorFn(v: number): string {
  if (v <= 0) return "#909399";
  if (v < 200) return "#67c23a";
  if (v < 400) return "#85ce61";
  if (v < 800) return "#e6a23c";
  if (v < 1600) return "#f56c6c";
  return "#c45656";
}

// Inline sub-component for fetch pill (to avoid creating a new file per hard constraints)
const RenderFetchPill = defineComponent({
  name: "RenderFetchPill",
  props: {
    status: { type: Object as () => FetchStatusPill | undefined, default: undefined },
    loading: { type: Boolean, default: false }
  },
  setup(props) {
    const { t } = useI18n();
    return () => {
      if (props.loading) {
        return h("span", { class: "rss-fetch-pill status-unknown" }, [
          h("el-icon", { style: "animation:spin 0.9s linear infinite;" }, () => "⟳"),
          " ",
          t?.("rss.manager.seeds.test.loading") ?? "Testing…"
        ]);
      }
      const s = props.status;
      if (!s || !s.kind) {
        return h("span", {
          class: "rss-fetch-pill status-unknown",
          title: t?.("rss.manager.seeds.test.untested") ?? "Not tested"
        }, "— " + (t?.("rss.manager.seeds.test.untestedShort") ?? "Untested"));
      }
      const textMap: Record<string, string> = {
        ok: `${t?.("rss.manager.seeds.test.okPrefix") ?? "OK"} · ${s.count ?? 0} items · ${s.latencyMs ?? 0}ms`,
        timeout: `${t?.("rss.manager.seeds.test.timeout") ?? "Timeout"} · 15s`,
        rate: t?.("rss.manager.seeds.test.ratelimit") ?? "Rate Limited (429)",
        fail: `${t?.("rss.manager.seeds.test.fail") ?? "Failed"}`,
        stale: t?.("rss.manager.seeds.test.stale") ?? "Stale"
      };
      const classKind = `status-${s.kind}`;
      const tip = s.error || textMap[s.kind];
      return h(
        "span",
        {
          class: ["rss-fetch-pill", classKind],
          title: tip
        },
        [
          h("span", { class: "rss-fetch-pill__dot" }),
          textMap[s.kind]
        ]
      );
    };
  }
});

// Pass selectedRoles as a reactive ref to the composable
const rolesRef = toRef(props, "selectedRoles");

const {
  seeds,
  seedsLoading,
  seedSearch,
  parsingSeed,
  seedToggling,
  parseTimes,
  seedIntervals,
  seedArticleCounts,
  parseAllLoading,
  feedsCount,
  filteredSeeds,
  seedDialogVisible,
  editingSeed,
  seedSaving,
  seedForm,
  openSeedDialog,
  saveSeed,
  removeSeed,
  toggleSeed,
  parseOneFeed,
  parseAllFeeds,
  loadSeeds,
  loadSeedArticleCounts,
  quickParseVisible,
  quickParseLoading,
  quickParseForm,
  doQuickParse,
  categoryGroups,
  formatTime,
  formatTimeAgo,
  formatInterval,
  subCategory,
  // New health data
  totalFeedsKpi,
  healthyTodayKpi,
  staleLast7dKpi,
  avgFetchLatencyKpi,
  avgFetchLatencyColor,
  totalSparkline,
  healthySparkline,
  staleSparkline,
  latencySparkline,
  healthAggregate,
  fetchStatusFilter,
  currentMonthOnly,
  monthRange,
  testFetchStatus,
  testFetchLoading,
  testFetch,
  retryVisible,
  retryQueue,
  retryOne,
  abandonRetry,
  pruneSnapshot,
  pruneLoading
} = useFeeds(rolesRef);

// ── ECharts helpers ──
function sparkOption(data: number[], color: string, inverse = false): ECOption {
  const values = inverse ? data.slice().map(v => Math.max(...data) - v) : data;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const areaColor = {
    type: "linear" as const,
    x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: color + "AA" },
      { offset: 1, color: color + "00" }
    ]
  };
  return {
    animation: false,
    grid: { left: 0, right: 0, top: 4, bottom: 0 },
    xAxis: { type: "category", show: false, data: data.map((_, i) => String(i)) },
    yAxis: { type: "value", show: false, min: Math.max(0, min - 1), max: max + 1 },
    series: [{
      type: "line",
      smooth: true,
      data: values,
      showSymbol: false,
      lineStyle: { width: 1.5, color },
      areaStyle: { color: areaColor }
    }]
  };
}

const pruneGaugeOption = computed<ECOption>(() => {
  const rate = pruneSnapshot.value?.currentRate ?? 0;
  const target = pruneSnapshot.value?.targetRate ?? 80;
  const color =
    rate >= target ? "#67c23a" : rate >= 60 ? "#e6a23c" : "#f56c6c";
  return {
    series: [
      {
        type: "gauge",
        startAngle: 210,
        endAngle: -30,
        radius: "92%",
        center: ["50%", "62%"],
        progress: { show: true, width: 16, roundCap: true, itemStyle: { color } },
        axisLine: {
          lineStyle: {
            width: 16,
            color: [[1, "var(--el-fill-color-light)"]]
          }
        },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, "18%"],
          fontSize: 26,
          fontWeight: 800,
          fontFamily: "DIN,monospace",
          color,
          formatter: "{value}%"
        },
        title: {
          offsetCenter: [0, "60%"],
          fontSize: 11,
          color: "var(--el-text-color-secondary)"
        },
        data: [{ value: rate, name: `${t("rss.manager.prune.gauge.target")} ${target}%` }]
      },
      // target mark ring
      {
        type: "gauge",
        startAngle: 210,
        endAngle: -30,
        radius: "82%",
        center: ["50%", "62%"],
        progress: { show: false },
        axisLine: { lineStyle: { width: 0, color: [[1, "transparent"]] } },
        pointer: { length: "78%", width: 2, icon: "triangle", itemStyle: { color: "#303133" }, offsetCenter: [0, 0] },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        detail: { show: false },
        data: [{ value: target }]
      }
    ]
  };
});

const pruneBarOption = computed<ECOption>(() => {
  const snap = pruneSnapshot.value;
  const months = snap?.months ?? [];
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" }
    },
    grid: { left: 36, right: 20, top: 30, bottom: 28 },
    legend: {
      top: 0, right: 0,
      itemWidth: 10, itemHeight: 10,
      textStyle: { fontSize: 11, color: "var(--el-text-color-secondary)" }
    },
    xAxis: {
      type: "category",
      data: months.map(m => m.label),
      axisLabel: { fontSize: 11, color: "var(--el-text-color-secondary)" }
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 11, color: "var(--el-text-color-secondary)" },
      splitLine: { lineStyle: { color: "var(--el-border-color-lighter)", type: "dashed" } }
    },
    series: [
      {
        name: t("rss.manager.prune.panels.monthly.expected"),
        type: "bar",
        data: months.map(m => m.expected),
        barWidth: 16,
        itemStyle: {
          color: { type: "linear" as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [
            { offset: 0, color: "#909399CC" }, { offset: 1, color: "#C0C4CC66" }
          ] },
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: t("rss.manager.prune.panels.monthly.actual"),
        type: "bar",
        data: months.map(m => ({
          value: m.actual,
          itemStyle: {
            color: m.rate >= 80 ? "#67c23a" : m.rate >= 60 ? "#e6a23c" : "#f56c6c",
            borderRadius: [4, 4, 0, 0]
          }
        })),
        barWidth: 16
      },
      {
        name: t("rss.manager.prune.panels.monthly.rate"),
        type: "line",
        yAxisIndex: 0,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 2, color: "#409EFF" },
        itemStyle: { color: "#409EFF", borderColor: "#fff", borderWidth: 1 },
        data: months.map(m => m.expected === 0 ? 0 : Math.round(m.actual * 100 / m.expected)),
        label: {
          show: true,
          position: "top",
          formatter: "{c}%",
          fontSize: 10,
          color: "#409EFF"
        }
      }
    ]
  } as any;
});

const pruneColor = computed(() => {
  const r = pruneSnapshot.value?.currentRate ?? 0;
  return r >= 80 ? "#67c23a" : r >= 60 ? "#e6a23c" : "#f56c6c";
});
const pruneTagType = computed<"info" | "success" | "warning" | "danger">(() => {
  const r = pruneSnapshot.value?.currentRate ?? 0;
  return r >= 80 ? "success" : r >= 60 ? "warning" : "danger";
});
const pruneMetaClass = computed(() => {
  const r = pruneSnapshot.value?.currentRate ?? 0;
  return r >= 80 ? "target" : r >= 60 ? "warn" : "bad";
});
const pruneReachDescription = computed(() => {
  const r = pruneSnapshot.value?.currentRate ?? 0;
  const target = pruneSnapshot.value?.targetRate ?? 80;
  if (r >= target) return t("rss.manager.prune.gauge.reached");
  const gap = (target - r).toFixed(1);
  return t("rss.manager.prune.gauge.gap", { gap });
});

// Heat map helpers
const heatMonths = computed(() => Array.from(new Set((pruneSnapshot.value?.heat ?? []).map(x => x.month))));
const heatRoles = computed(() => Array.from(new Set((pruneSnapshot.value?.heat ?? []).map(x => x.role))));
function heatRate(role: string, month: string): number {
  const cell = pruneSnapshot.value?.heat.find(x => x.role === role && x.month === month);
  return cell?.rate ?? 0;
}
function heatCellStyle(rate: number) {
  const r = Math.max(0, Math.min(100, rate));
  if (r === 0) {
    return { background: "var(--el-fill-color-lighter)", color: "var(--el-text-color-placeholder)" };
  }
  // Gradient from danger(red) → warning(yellow) → success(green)
  const ratio = r / 100;
  let color = `rgba(245,108,108, ${0.25 + ratio * 0.7})`;
  if (r >= 80) {
    color = `linear-gradient(135deg, rgba(103,194,58, ${0.35 + (r - 80) / 20 * 0.55}), rgba(133,206,97, 0.9))`;
  } else if (r >= 60) {
    color = `linear-gradient(135deg, rgba(230,162,60, 0.55), rgba(240,199,138, 0.92))`;
  } else if (r >= 40) {
    color = `linear-gradient(135deg, rgba(243,123,29,0.6), rgba(255,179,102,0.92))`;
  } else {
    color = `linear-gradient(135deg, rgba(245,108,108,0.75), rgba(255,160,160,0.95))`;
  }
  return { background: color };
}
function roleDisplayName(role: string): string {
  const v = (rolesData as any)[role];
  if (v?.name) return v.name;
  return role;
}
const bestRoleEntry = computed(() => {
  const byRole = pruneSnapshot.value?.byRole ?? {};
  let best = { name: "-", rate: 0 };
  for (const [role, rate] of Object.entries(byRole)) {
    if (rate > best.rate) best = { name: role, rate: Math.round(rate * 10) / 10 };
  }
  return best;
});
const worstRoleEntry = computed(() => {
  const byRole = pruneSnapshot.value?.byRole ?? {};
  let worst: { name: string; rate: number } = { name: "-", rate: 100 };
  const keys = Object.keys(byRole);
  if (!keys.length) return worst;
  worst = { name: keys[0], rate: Math.round((byRole[keys[0]] ?? 0) * 10) / 10 };
  for (const [role, rate] of Object.entries(byRole)) {
    const rr = Math.round(rate * 10) / 10;
    if (rr < worst.rate) worst = { name: role, rate: rr };
  }
  return worst;
});
const bestRoleName = computed(() => roleDisplayName(bestRoleEntry.value.name));
const bestRoleRate = computed(() => bestRoleEntry.value.rate);
const worstRoleName = computed(() => roleDisplayName(worstRoleEntry.value.name));
const worstRoleRate = computed(() => worstRoleEntry.value.rate);

function formatAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - (ts ?? 0));
  const min = 60_000;
  const hour = 60 * min;
  if (diff < min) return "刚刚";
  if (diff < hour) return Math.floor(diff / min) + t("rss.manager.prune.time.minutesAgo");
  if (diff < 24 * hour) return Math.floor(diff / hour) + t("rss.manager.prune.time.hoursAgo");
  return Math.floor(diff / (24 * hour)) + t("rss.manager.prune.time.daysAgo");
}

function formatRelativeRetry(ts: number): string {
  const diff = ts - Date.now();
  const absMin = Math.round(Math.abs(diff) / 60_000);
  if (diff <= 0) return t("rss.manager.retry.time.now");
  if (absMin < 60) return `${absMin}${t("rss.manager.retry.time.min")}`;
  const hours = Math.round(absMin / 60);
  if (hours < 24) return `${hours}${t("rss.manager.retry.time.hour")}`;
  return `${Math.round(hours / 24)}${t("rss.manager.retry.time.day")}`;
}

async function retryAll() {
  const all = [...retryQueue.value];
  for (const e of all) await retryOne(e);
}
function abandonAll() {
  retryQueue.value = [];
}

async function onParseOne(row: RssSeedDocument) {
  const ok = await parseOneFeed(row);
  if (ok) emit("feedsChanged");
}

async function onParseAll() {
  const ok = await parseAllFeeds();
  if (ok) emit("feedsChanged");
}

async function onQuickParse() {
  const ok = await doQuickParse();
  if (ok) emit("feedsChanged");
}

async function onRefreshAll() {
  await loadSeeds();
  loadSeedArticleCounts();
}

onMounted(() => {
  loadSeeds();
  loadSeedArticleCounts();
  suggest.loadSeedsForOptions();
});

watch(
  rolesRef,
  () => {
    loadSeeds();
    loadSeedArticleCounts();
    suggest.loadSeedsForOptions();
  },
  { deep: true }
);

// OPML buttons (stub for now)
function onImportOpml() {
  ElMessage.info(`${t("rss.scheduler.importOpml")} (stub)`);
}
function onExportOpml() {
  ElMessage.info(`${t("rss.scheduler.exportOpml")} (stub)`);
}

const tFn: (key: string, args?: Record<string, unknown>) => string = (k, args) =>
  (t as unknown as (k: string, a?: Record<string, unknown>) => string)(k, args ?? {});

function errorMessage(e: unknown): string | undefined {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return undefined;
}

const suggest = useSeedSuggest(rolesRef, {
  t: tFn,
  errorMessage,
  onSeedAdded: async () => {
    await loadSeeds();
    await loadSeedArticleCounts();
    emit("feedsChanged");
  }
});

async function onSuggestAddOne(seed: Parameters<typeof suggest.addSuggestedSeed>[0]) {
  await suggest.addSuggestedSeed(seed);
}
async function onSuggestAddAll() {
  await suggest.addAllSuggestedSeeds(async () => {
    await loadSeeds();
    await loadSeedArticleCounts();
    emit("feedsChanged");
  });
}

defineExpose({
  parseAllLoading
});
</script>

<style scoped lang="scss">
@use "@/views/knowledge/executive/styles/rssManager.scss" as *;

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.rss-role__suggest-wrap {
  margin-top: 12px;
}
</style>
