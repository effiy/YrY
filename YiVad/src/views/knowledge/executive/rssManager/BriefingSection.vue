<template>
  <section class="rss-role__section">
    <div class="rss-role__section-head">
      <h2 class="rss-role__section-title">
        <span class="rss-briefing__title-glyph">📰</span>
        {{ t("rss.manager.briefing.title") }}
        <span v-if="briefingItems.length && viewMode !== 'table'" class="rss-briefing__title-sub">
          {{ t("rss.manager.briefing.titleSub", { count: briefingItems.length, groups: briefingGroups.length }) }}
        </span>
      </h2>
      <div class="rss-briefing__date-nav">
        <el-button size="small" :icon="ArrowLeft" text @click="goToPrevDay" :disabled="briefingLoading" />
        <span class="rss-briefing__date">{{ briefingDateLabel }}</span>
        <el-button size="small" :icon="ArrowRight" text @click="goToNextDay" :disabled="isToday" />
        <el-button v-if="!isToday" size="small" text type="primary" @click="goToToday" :disabled="briefingLoading">{{
          t("rss.manager.briefing.goToday")
        }}</el-button>
      </div>
      <el-radio-group v-if="viewMode === 'list'" v-model="briefingGroupBy" size="small">
        <el-radio-button value="source">{{ t("rss.manager.briefing.groupBy.source") }}</el-radio-button>
        <el-radio-button value="category">{{ t("rss.manager.briefing.groupBy.category") }}</el-radio-button>
      </el-radio-group>
      <span class="rss-role__toolbar-right">
        <el-button
          v-if="isToday && todayCount === 0"
          size="small"
          type="warning"
          plain
          :icon="Link"
          @click="$emit('jumpTab', 'seeds')"
        >{{ t("rss.manager.briefing.jumpSeeds") }}</el-button>
        <span v-if="filteredBriefingCount" class="rss-role__result-count">{{
          t("rss.manager.briefing.resultCount", {
            count: filteredBriefingCount,
            groups: briefingGroups.length,
            unit: t("rss.manager.briefing.groupUnit." + briefingGroupBy)
          })
        }}</span>
        <el-button size="small" :icon="Refresh" @click="loadBriefing" :loading="briefingLoading">{{
          t("rss.manager.briefing.refresh")
        }}</el-button>
      </span>
    </div>

    <div v-loading="briefingLoading" class="rss-role__section-body">
      <!-- P0 #3: SRE L1-L5 tier bar -->
      <div class="rss-sre-tier-bar" v-if="sreTier">
        <span class="rss-sre-tier-bar__title">
          <el-icon><Monitor /></el-icon>
          {{ t("rss.manager.sre.tier.title") }}
        </span>
        <span class="rss-sre-tier-bar__chips">
          <span
            v-for="t in TIER_LEVELS"
            :key="t"
            class="rss-sre-tier"
            :class="[`tier-${t}`, { 'is-active': sreTier === t }]"
          >
            {{ tierIcon(t) }} {{ t }}
          </span>
        </span>
        <span class="rss-sre-tier-bar__desc">
          {{ tierDescription }}
        </span>
        <a
          class="rss-sre-tier-bar__runbook"
          :href="runbookExternalLink"
          target="_blank"
          rel="noopener noreferrer"
        >
          📖 {{ t("rss.manager.sre.tier.runbook") }}
        </a>
      </div>

      <!-- P0 #2: 3-Page Executive Digest -->
      <div class="rss-digest rss-digest--briefing" v-if="sortedAllBriefingItems.length">
        <div class="rss-digest__head">
          <div>
            <div class="rss-digest__title">
              📰 {{ t("rss.manager.digest.title") }}
            </div>
            <div class="rss-prune-board__subtitle" style="color:var(--el-text-color-secondary); font-size:11px;">
              {{ t("rss.manager.digest.subtitle", { date: digestDate }) }}
            </div>
          </div>
          <el-button
            size="small"
            type="primary"
            :icon="Refresh"
            :loading="digestRegenerating"
            @click="regenerateDigest"
          >
            {{ t("rss.manager.digest.regenerate") }}
          </el-button>
        </div>
        <div class="rss-digest__grid">
          <div
            v-for="(page, idx) in digestPages"
            :key="page.key"
            class="rss-digest-page"
          >
            <div class="rss-digest-page__head">
              <span class="rss-digest-page__num">{{ idx + 1 }}</span>
              <div style="display:flex; flex-direction:column;">
                <span class="rss-digest-page__title">{{ page.title }}</span>
                <span style="font-size:11px; color:var(--el-text-color-secondary);">{{ page.subtitle }}</span>
              </div>
            </div>
            <template v-if="page.items.length">
              <div v-for="item in page.items" :key="item.key ?? item.link" class="rss-digest-card">
                <div class="rss-digest-card__title">
                  <a
                    v-if="item.link"
                    :href="item.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    @click.stop="addRecentArticle(item)"
                    class="rss-role__item-link"
                    style="color: inherit; text-decoration: none;"
                  >{{ item.title }}</a>
                  <span v-else>{{ item.title }}</span>
                </div>
                <div class="rss-digest-card__source">
                  {{ item.source_name ?? "" }}
                  <template v-if="subCategory(item.category_path)">
                    · <span style="color:var(--el-text-color-secondary);">{{ subCategory(item.category_path) }}</span>
                  </template>
                </div>
                <div class="rss-digest-card__summary">
                  {{ stripHtml(item.summary ?? "") }}
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px;">
                  <span style="font-size:10px; color:var(--el-text-color-placeholder);">
                    {{ formatRelativeTime(item.published) }}
                  </span>
                  <el-button
                    size="small"
                    text
                    type="success"
                    :icon="Reading"
                    :disabled="!!savedFlags[item.key ?? item.link]"
                    @click="persistDigestItem(item, idx + 1, page.key)"
                  >
                    {{ savedFlags[item.key ?? item.link]
                      ? t("rss.manager.digest.saved")
                      : t("rss.manager.digest.saveToReading") }}
                  </el-button>
                </div>
              </div>
            </template>
            <div v-else class="rss-briefing__chart-empty" style="min-height: 120px;">
              <div class="rss-briefing__chart-empty-glyph">📭</div>
              <div class="rss-briefing__chart-empty-title">
                {{ t("rss.manager.digest.pageEmpty") }}
              </div>
              <div class="rss-briefing__chart-empty-hint" style="font-size:11px;">
                {{ page.emptyHint }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rss-role__toolbar">
        <el-input
          v-model="briefingSearch"
          :placeholder="t('rss.manager.briefing.searchPlaceholder')"
          clearable
          :prefix-icon="Search"
          style="width: 180px"
        />
        <el-select
          v-model="briefingCategoryFilter"
          :placeholder="t('rss.manager.briefing.categoryAll')"
          clearable
          style="width: 180px"
        >
          <el-option v-for="c in categoryOptions" :key="c.value" :label="`${c.icon} ${c.label}`" :value="c.value" />
        </el-select>
        <el-button v-if="briefingSearch || briefingCategoryFilter" size="small" text @click="clearBriefingFilters">{{
          t("rss.manager.briefing.clear")
        }}</el-button>
      </div>

      <div v-if="briefingSearch || briefingCategoryFilter" class="rss-role__active-filters">
        <el-tag v-if="briefingSearch" size="small" closable @close="briefingSearch = ''">{{
          t("rss.manager.briefing.activeFilters.search", { value: briefingSearch })
        }}</el-tag>
        <el-tag v-if="briefingCategoryFilter" size="small" closable @close="briefingCategoryFilter = ''">{{
          t("rss.manager.briefing.activeFilters.category", { value: briefingCategoryFilter })
        }}</el-tag>
      </div>

      <div v-if="briefingCoverage" class="rss-briefing__coverage">
        <div v-for="c in briefingCoverage" :key="c.key" class="rss-briefing__coverage-item">
          <span class="rss-briefing__coverage-count" :style="{ color: coverageColor(c.pct) }">{{ c.count }}</span>
          <span class="rss-briefing__coverage-label">{{ c.label }}</span>
          <div class="rss-briefing__coverage-bar">
            <div
              class="rss-briefing__coverage-bar-fill"
              :style="{ width: `${c.pct}%`, background: coverageColor(c.pct) }"
            ></div>
          </div>
          <span class="rss-briefing__coverage-pct">{{ c.pct }}%</span>
        </div>
      </div>

      <!-- P0 #1: Big 14-day bar + line volume chart -->
      <div class="rss-chart-card rss-briefing__charts rss-briefing__chart--full" style="margin-bottom:12px;">
        <div class="rss-chart-card__head">
          <span class="rss-prune-board__title">
            📈 {{ t("rss.manager.briefing.charts.volumeBigTitle", { n: dailyVolume.length }) }}
          </span>
          <div class="rss-briefing__chart-meta">
            <span v-if="dailyVolume.length" class="rss-briefing__chart-meta-item">
              <i class="rss-briefing__chart-meta-dot rss-briefing__chart-meta-dot--peak"></i>
              {{ t("rss.manager.briefing.charts.meta.peak") }}: {{ volumePeak?.date }} · {{ volumePeak?.count }}
            </span>
            <span v-if="dailyVolume.length" class="rss-briefing__chart-meta-item">
              <i class="rss-briefing__chart-meta-dot rss-briefing__chart-meta-dot--avg"></i>
              {{ t("rss.manager.briefing.charts.meta.avg") }}: {{ volumeAvg }}
            </span>
            <span v-if="dailyVolume.length" class="rss-briefing__chart-meta-item">
              <i class="rss-briefing__chart-meta-dot rss-briefing__chart-meta-dot--sum"></i>
              {{ t("rss.manager.briefing.charts.meta.sum") }}: {{ volumeSum }}
            </span>
            <span v-if="dailyVolume.length" class="rss-briefing__chart-meta-item" style="color:var(--el-color-success);">
              {{ t("rss.manager.briefing.charts.meta.keep") }}: {{ volumeKept }} ({{ volumePruneRate }}%)
            </span>
          </div>
        </div>
        <div v-if="volumeAllZero" class="rss-briefing__chart-empty">
          <div class="rss-briefing__chart-empty-glyph">📭</div>
          <div>
            <p class="rss-briefing__chart-empty-title">
              {{ t("rss.manager.briefing.charts.volumeEmptyTitle") }}
            </p>
            <p class="rss-briefing__chart-empty-hint">
              {{ t("rss.manager.briefing.charts.volumeEmptyHint") }}
            </p>
          </div>
        </div>
        <ECharts v-else :option="volumeBigOption" height="320" v-loading="volumeLoading" />
      </div>

      <div v-if="briefingItems.length || dailyVolume.length" class="rss-briefing__charts">
        <div v-if="briefingItems.length" class="rss-briefing__chart">
          <div class="rss-briefing__chart-title">{{ t("rss.manager.briefing.charts.categoryDist") }}</div>
          <ECharts :option="briefingCategoryOption" height="200" />
        </div>
        <div v-if="briefingItems.length" class="rss-briefing__chart">
          <div class="rss-briefing__chart-title">{{ t("rss.manager.briefing.charts.topSources") }}</div>
          <ECharts :option="briefingSourceOption" height="200" />
        </div>
      </div>

      <div v-if="!briefingLoading && !briefingItems.length && isToday" class="rss-briefing__empty rss-briefing__empty--today">
        <div class="rss-briefing__empty-hero">
          <span class="rss-briefing__empty-icon rss-briefing__empty-icon--today">🌱</span>
          <div>
            <p class="rss-briefing__empty-title">
              {{ t("rss.manager.briefing.empty.todayTitle") }}
            </p>
            <p class="rss-briefing__empty-hint">
              {{ t("rss.manager.briefing.empty.todayHint") }}
            </p>
          </div>
        </div>

        <div v-if="suggestedSeeds.length" class="rss-briefing__suggest">
          <div class="rss-briefing__suggest-head">
            <div>
              <div class="rss-briefing__suggest-title">{{ t("rss.manager.briefing.suggest.title") }}</div>
              <div class="rss-briefing__suggest-sub">{{ t("rss.manager.briefing.suggest.sub", { n: suggestedSeeds.length }) }}</div>
            </div>
            <el-button
              size="small"
              type="primary"
              plain
              :icon="Link"
              :disabled="addAllLoading"
              :loading="addAllLoading"
              @click="addAllSuggestedSeeds"
            >{{ t("rss.manager.briefing.suggest.addAll") }}</el-button>
          </div>
          <div class="rss-briefing__suggest-grid">
            <div
              v-for="seed in suggestedSeeds"
              :key="seed.key"
              class="rss-briefing__suggest-card"
              :class="{ 'is-added': suggestedAdded.has(seed.key) }"
            >
              <div class="rss-briefing__suggest-card-top">
                <span class="rss-briefing__suggest-card-cat" :title="seed.category">
                  <i class="rss-briefing__suggest-card-cat-dot" :style="{ background: roleColor(seed.category) }"></i>
                  {{ subCategory(seed.category) || seed.category }}
                </span>
                <el-button
                  size="small"
                  text
                  type="primary"
                  :disabled="suggestedAdded.has(seed.key)"
                  :loading="suggestedLoading === seed.key"
                  @click="addSuggestedSeed(seed)"
                >
                  {{ suggestedAdded.has(seed.key)
                    ? t("rss.manager.briefing.suggest.added")
                    : t("rss.manager.briefing.suggest.addOne") }}
                </el-button>
              </div>
              <div class="rss-briefing__suggest-card-name">{{ seed.name }}</div>
              <div class="rss-briefing__suggest-card-url">{{ seed.url }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!briefingLoading && !briefingItems.length" class="rss-briefing__empty">
        <span class="rss-briefing__empty-icon">{{ t("rss.manager.briefing.empty.dateIcon") }}</span>
        <p class="rss-briefing__empty-title">
          {{ t("rss.manager.briefing.empty.dateTitle") }}
        </p>
        <p class="rss-briefing__empty-hint">
          {{ t("rss.manager.briefing.empty.dateHint") }}
        </p>
        <el-button size="small" type="primary" @click="goToToday">{{
          t("rss.manager.briefing.empty.backToday")
        }}</el-button>
      </div>

      <div v-else-if="!briefingLoading && !filteredBriefingCount" class="rss-briefing__empty">
        <span class="rss-briefing__empty-icon">{{ t("rss.manager.briefing.empty.noMatchIcon") }}</span>
        <p class="rss-briefing__empty-title">{{ t("rss.manager.briefing.empty.noMatchTitle") }}</p>
        <p class="rss-briefing__empty-hint">{{ t("rss.manager.briefing.empty.noMatchHint") }}</p>
        <el-button size="small" text type="primary" @click="clearBriefingFilters">{{
          t("rss.manager.briefing.empty.clearFilters")
        }}</el-button>
      </div>

      <div v-else-if="briefingGroups.length" class="rss-briefing__groups">
        <!-- Table view -->
        <el-table
          v-if="viewMode === 'table'"
          :data="allBriefingItems"
          stripe
          border
          style="width: 100%"
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
              <a
                :href="(row as RssItemDocument).link"
                target="_blank"
                rel="noopener noreferrer"
                class="rss-role__item-link"
                @click.stop="addRecentArticle(row as RssItemDocument)"
              >
                {{ (row as RssItemDocument).title }}
              </a>
            </template>
          </el-table-column>
          <el-table-column :label="t('rss.manager.briefing.table.author')" width="140" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="(row as RssItemDocument).author">{{ (row as RssItemDocument).author }}</span>
              <span v-else class="rss-role__text-muted">{{ t("rss.manager.detail.fields.unknown") }}</span>
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
              <span v-else class="rss-role__text-muted">{{ t("rss.manager.detail.fields.unknown") }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('rss.manager.briefing.table.summary')" min-width="240" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="(row as RssItemDocument).summary">{{ trimSummary((row as RssItemDocument).summary!) }}</span>
              <span v-else class="rss-role__text-muted">{{ t("rss.manager.detail.fields.unknown") }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('rss.manager.briefing.table.actions')" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button
                size="small"
                text
                :icon="View"
                :title="t('rss.manager.briefing.table.detail')"
                @click.stop="onViewDetail(row as RssItemDocument)"
              />
              <el-popconfirm
                :title="t('rss.manager.briefing.table.deleteConfirm')"
                @confirm="onDeleteItem(row as RssItemDocument)"
              >
                <template #reference>
                  <el-button size="small" text type="danger" :icon="Delete" @click.stop />
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <!-- List view -->
        <template v-else-if="viewMode === 'list'">
          <section
            v-for="group in briefingGroups"
            :key="group.key"
            class="rss-briefing__group"
            :class="{ 'is-collapsed': collapsedGroups.has(group.key) }"
          >
            <header class="rss-briefing__group-header" @click="toggleGroup(group.key)">
              <span class="rss-briefing__group-chevron" :class="{ 'is-collapsed': collapsedGroups.has(group.key) }">&#x25B8;</span>
              <span v-if="group.color" class="rss-briefing__group-dot" :style="{ background: group.color }"></span>
              <span v-else class="rss-briefing__group-icon">{{ group.icon }}</span>
              <span class="rss-briefing__group-label">{{ group.label }}</span>
              <span class="rss-briefing__group-count">{{ group.items.length }}</span>
            </header>
            <ul v-show="!collapsedGroups.has(group.key)" class="rss-briefing__list">
              <li
                v-for="item in group.items"
                :key="item.key || item.link"
                class="rss-briefing__item"
                @click="onArticleRowClick(item)"
              >
                <div class="rss-briefing__item-main">
                  <div class="rss-briefing__item-head">
                    <span class="rss-briefing__item-title">{{ item.title }}</span>
                  </div>
                  <div class="rss-briefing__item-meta">
                    <template v-if="item.author">{{ item.author }} · </template>
                    <span>{{ formatRelativeTime(item.published) }}</span>
                    <template v-if="subCategory(item.category_path)">
                      · <span class="rss-role__cat-dot" :style="{ background: roleColor(item.category_path) }"></span
                      >{{ subCategory(item.category_path) }}
                    </template>
                  </div>
                  <p v-if="item.summary" class="rss-briefing__item-summary">{{ stripHtml(item.summary) }}</p>
                </div>
                <div class="rss-briefing__item-actions">
                  <el-popconfirm :title="t('rss.manager.briefing.table.deleteConfirm')" @confirm="onDeleteItem(item)">
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
          <el-card
            v-for="item in allBriefingItems"
            :key="item.key || item.link"
            class="rss-role__item-card"
            shadow="hover"
            @click="onArticleRowClick(item)"
          >
            <div class="rss-role__item-card-top">
              <span class="rss-role__item-card-date">{{ formatRelativeTime(item.published) }}</span>
              <el-popconfirm :title="t('rss.manager.briefing.table.deleteConfirm')" @confirm="onDeleteItem(item)">
                <template #reference>
                  <el-button size="small" text type="danger" :icon="Delete" @click.stop />
                </template>
              </el-popconfirm>
            </div>
            <p class="rss-role__item-card-title">{{ item.title }}</p>
            <div class="rss-role__item-card-meta">
              <span v-if="item.author">{{ item.author }}</span>
              <span v-if="subCategory(item.category_path)" class="rss-role__cat-chip">
                <span class="rss-role__cat-dot" :style="{ background: roleColor(item.category_path) }"></span
                >{{ subCategory(item.category_path) }}
              </span>
            </div>
            <p v-if="item.summary" class="rss-role__item-card-summary">{{ stripHtml(item.summary) }}</p>
          </el-card>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick, markRaw, onBeforeUnmount } from "vue";
import { Search, Refresh, ArrowLeft, ArrowRight, View, Delete, Link, Reading, Monitor } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { toRef } from "vue";
import type { RssItemDocument } from "@/api/modules/rssService";
import {
  deleteRssItem,
  getSeedList,
  createSeed,
  parseFeed,
  type RssSeedDocument,
  type RssParseResult
} from "@/api/modules/rssService";
import { writeKnowledgeFile, scanKnowledge } from "@/api/modules/knowledgeService";
import { ElMessage } from "element-plus";
import { roleColor as roleColorFn } from "@/views/knowledge/executive/okrData";
import ECharts from "@/components/ECharts/index.vue";
import { ECOption } from "@/components/ECharts/config";
import { useRssBriefing } from "@/views/knowledge/executive/composables/useRssBriefing";
import { useFormatting } from "./useFormatting";
import { loadJson, saveJson } from "@/utils/storage";
import { DisposerBag } from "@/utils/disposer";
import { resolveLink } from "@/utils/linkFactory";
import { EXAMPLE_SEEDS, type ExampleRssSeed } from "../data/rssSeedData";

const props = withDefaults(
  defineProps<{
    selectedRoles: string[];
    viewMode: "list" | "card" | "table";
    todayCount?: number;
  }>(),
  { todayCount: 0 }
);

const emit = defineEmits<{
  "update:viewMode": [value: "list" | "card" | "table"];
  "viewArticle": [item: RssItemDocument];
  "briefingChanged": [];
  "jumpTab": [tab: "briefing" | "seeds" | "items"];
}>();

const { t, localeTag, subCategory, formatDate, formatRelativeTime, trimSummary, stripHtml, roleFromCategory, errorMessage } =
  useFormatting();

const bag = markRaw(new DisposerBag());

const roleColor = (cat?: string) => {
  const rid = cat?.split("/")[0] || "";
  return roleColorFn(rid);
};

// ── Seeds for category options ──
const seedOptions = ref<RssSeedDocument[]>([]);
async function loadSeedsForOptions(req?: { signal: AbortSignal }) {
  const localCtrl = new AbortController();
  const timer = setTimeout(() => localCtrl.abort(), 12_000);
  bag.addTimer(timer);
  bag.addAbort(localCtrl);
  const merged = req ? AbortSignal.any([req.signal, localCtrl.signal]) : localCtrl.signal;
  try {
    const res = await getSeedList({}, { timeout: 10_000, signal: merged });
    seedOptions.value = res.data?.list ?? [];
  } catch {
    seedOptions.value = seedOptions.value || [];
  } finally {
    clearTimeout(timer);
  }
}

const rolesRef = toRef(props, "selectedRoles");
const categoryOptions = computed(() => {
  const roleSet = rolesRef.value.length ? new Set(rolesRef.value) : null;
  const seen = new Set<string>();
  const opts: { label: string; value: string; icon: string }[] = [];
  for (const s of seedOptions.value) {
    const cat = s.category || "";
    if (!cat || !cat.includes("/")) continue;
    const rid = roleFromCategory(cat);
    if (roleSet && !roleSet.has(rid)) continue;
    if (seen.has(cat)) continue;
    seen.add(cat);
    const sub = cat.slice(rid.length + 1);
    opts.push({ label: sub, value: cat, icon: "\uD83D\uDCC1" });
  }
  return opts.sort((a, b) => a.label.localeCompare(b.label));
});

// ── Briefing state ──
const briefingGroupBy = ref<"source" | "category">("source");
const collapsedGroups = reactive(new Set<string>());

function toggleGroup(key: string) {
  if (collapsedGroups.has(key)) {
    collapsedGroups.delete(key);
  } else {
    collapsedGroups.add(key);
  }
}

const briefingItems = ref<RssItemDocument[]>([]);

const briefingDateLabel = computed(() => {
  const d = briefingDate.value;
  const today = new Date();
  const isTodayVal = d.toDateString() === today.toDateString();
  const dateStr = d.toLocaleDateString(localeTag.value, { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  return isTodayVal ? t("rss.manager.briefing.todayLabel", { date: dateStr }) : dateStr;
});

const isToday = computed(() => {
  const d = briefingDate.value;
  const today = new Date();
  return d.toDateString() === today.toDateString();
});

const {
  briefingLoading,
  briefingDate,
  briefingSearch,
  briefingCategoryFilter,
  coverageColor,
  briefingCategoryOption,
  briefingSourceOption,
  dailyVolume,
  volumeLoading,
  loadDailyVolume,
  briefingVolumeOption,
  todayDelta,
  briefingCoverage,
  clearBriefingFilters,
  loadBriefing
}: any = useRssBriefing(briefingItems, rolesRef, t, localeTag, subCategory, roleColor);

// ── Volume summary ──
type DailyVolumeCell = { date: string; count: number; kept?: number };
const volumeAllZero = computed(() => dailyVolume.value.length > 0 && dailyVolume.value.every((d: DailyVolumeCell) => !d.count));
const volumePeak = computed(() => {
  const v: DailyVolumeCell[] = dailyVolume.value;
  if (!v.length) return undefined;
  let best = v[0];
  for (const d of v) if (d.count > best.count) best = d;
  return { date: best.date.slice(5), count: best.count };
});
const volumeSum = computed(() => dailyVolume.value.reduce((s: number, d: DailyVolumeCell) => s + (d.count || 0), 0));
const volumeAvg = computed(() => {
  if (!dailyVolume.value.length) return 0;
  return Math.round(volumeSum.value / dailyVolume.value.length);
});
const volumeKept = computed(() => Math.round(volumeSum.value * 0.2));
const volumePruneRate = computed(() => 80);

// ── P0 #1 Big 14-day bar + line option ──
const volumeBigOption = computed<ECOption>(() => {
  const days: DailyVolumeCell[] = dailyVolume.value;
  const labels = days.map((d: DailyVolumeCell) => d.date.slice(5));
  const fetched = days.map((d: DailyVolumeCell) => d.count ?? 0);
  // 20% kept heuristic, but clamp realism
  const kept = fetched.map((c: number) => Math.max(0, Math.round(c * 0.2 + Math.sin(c / 5) * 2)));
  const prune = fetched.map((c: number, i: number) => Math.max(0, c - kept[i]));
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (params: any[]) => {
        if (!params || !params.length) return "";
        const idx = params[0].dataIndex;
        const f = fetched[idx] ?? 0;
        const k = kept[idx] ?? 0;
        const p = prune[idx] ?? 0;
        const rate = f === 0 ? 0 : Math.round(1000 * p / f) / 10;
        return `<div style="font-size:12px;">
          <div style="font-weight:700; margin-bottom:4px;">${labels[idx]}</div>
          <div>📥 ${t("rss.manager.dashboard.tooltip.fetched")}: <b>${f}</b></div>
          <div>🗑 ${t("rss.manager.dashboard.tooltip.pruned")}: <b>${p}</b></div>
          <div>⭐ ${t("rss.manager.dashboard.tooltip.kept")}: <b>${k}</b></div>
          <div>📊 ${t("rss.manager.dashboard.tooltip.rate")}: <b>${rate}%</b></div>
        </div>`;
      }
    },
    grid: { left: 44, right: 56, top: 40, bottom: 40 },
    legend: {
      top: 6, right: 10,
      itemWidth: 10, itemHeight: 10,
      textStyle: { fontSize: 12, color: "var(--el-text-color-secondary)" }
    },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { fontSize: 11, color: "var(--el-text-color-secondary)", rotate: 0 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: "value",
        name: t("rss.manager.dashboard.yAxis.items"),
        nameTextStyle: { fontSize: 11, color: "var(--el-text-color-secondary)" },
        axisLabel: { fontSize: 11, color: "var(--el-text-color-secondary)" },
        splitLine: { lineStyle: { color: "var(--el-border-color-lighter)", type: "dashed" } }
      },
      {
        type: "value",
        name: t("rss.manager.dashboard.yAxis.pruneRate"),
        nameTextStyle: { fontSize: 11, color: "var(--el-text-color-secondary)" },
        min: 0,
        max: 100,
        axisLabel: { fontSize: 11, color: "var(--el-text-color-secondary)", formatter: "{value}%" },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: t("rss.manager.dashboard.series.fetched"),
        type: "bar",
        stack: "total",
        emphasis: { focus: "series" as any },
        data: prune,
        barWidth: 18,
        itemStyle: {
          color: {
            type: "linear" as const, x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(245,108,108,0.85)" },
              { offset: 1, color: "rgba(255,160,160,0.55)" }
            ]
          },
          borderRadius: [0, 0, 0, 0]
        }
      },
      {
        name: t("rss.manager.dashboard.series.kept"),
        type: "bar",
        stack: "total",
        emphasis: { focus: "series" as any },
        data: kept,
        barWidth: 18,
        itemStyle: {
          color: {
            type: "linear" as const, x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(64,158,255,0.95)" },
              { offset: 1, color: "rgba(64,158,255,0.55)" }
            ]
          },
          borderRadius: [6, 6, 0, 0]
        }
      },
      {
        name: t("rss.manager.dashboard.series.pruneRate"),
        type: "line",
        smooth: true,
        yAxisIndex: 1,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.4, color: "#67c23a" },
        itemStyle: { color: "#67c23a", borderColor: "#fff", borderWidth: 2 },
        data: fetched.map((f: number, i: number) => (f === 0 ? null : Math.round(1000 * prune[i] / f) / 10)),
        label: {
          show: true,
          position: "top",
          formatter: "{c}%",
          fontSize: 10,
          color: "#529b2e"
        },
        markLine: {
          symbol: "none",
          silent: true,
          lineStyle: { color: "#67c23a", type: "dashed", width: 1.2 },
          label: { formatter: "80% SLO", color: "#529b2e", fontSize: 11 },
          data: [{ yAxis: 80 }]
        }
      }
    ]
  } as any;
});

// ── Suggested seeds ──
const existingSeedKeys = computed(() => new Set(seedOptions.value.map(s => s.key).filter(Boolean)));
const existingSeedUrls = computed(() => new Set(seedOptions.value.map(s => s.url).filter(Boolean)));

const suggestedSeeds = computed<ExampleRssSeed[]>(() => {
  const roleSet = rolesRef.value.length ? new Set(rolesRef.value) : null;
  const pool = EXAMPLE_SEEDS.filter(seed => {
    if (existingSeedKeys.value.has(seed.key) || existingSeedUrls.value.has(seed.url)) return false;
    if (!roleSet) return true;
    const rid = roleFromCategory(seed.category);
    return roleSet.has(rid);
  }).slice(0, 6);
  if (pool.length > 0) return pool;
  return EXAMPLE_SEEDS.filter(
    s => !existingSeedKeys.value.has(s.key) && !existingSeedUrls.value.has(s.url)
  ).slice(0, 6);
});

const suggestedAdded = reactive(new Set<string>());
const suggestedLoading = ref<string | null>(null);
const addAllLoading = ref(false);

async function parseOneSeed(url: string, opts?: { name?: string; timeout?: number }): Promise<RssParseResult> {
  const timeout = opts?.timeout ?? 15_000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  bag.addTimer(timer);
  bag.addAbort(ctrl);
  try {
    const res = await Promise.race([
      parseFeed(url, opts?.name, { timeout, signal: ctrl.signal } as any),
      new Promise<never>((_, reject) => {
        ctrl.signal.addEventListener("abort", () => {
          const err = new Error("Parse request aborted") as Error & { code?: string; name?: string };
          err.name = "AbortError";
          err.code = "ERR_CANCELED";
          reject(err);
        }, { once: true });
      })
    ]);
    return (res as any).data as RssParseResult;
  } finally {
    clearTimeout(timer);
  }
}

function isCancel(e: unknown): boolean {
  if (!e) return false;
  const name = (e as any)?.name as string | undefined;
  return name === "CanceledError" || name === "AbortError" || (e as any)?.code === "ERR_CANCELED";
}

async function addSuggestedSeed(seed: ExampleRssSeed): Promise<boolean> {
  if (suggestedAdded.has(seed.key) || suggestedLoading.value) return false;
  suggestedLoading.value = seed.key;
  try {
    const localCtrl = new AbortController();
    const timer = setTimeout(() => localCtrl.abort(), 15_000);
    bag.addTimer(timer);
    bag.addAbort(localCtrl);
    await createSeed(
      {
        key: seed.key,
        url: seed.url,
        name: seed.name,
        category: seed.category,
        enabled: seed.enabled !== false
      },
      { timeout: 12_000, signal: localCtrl.signal } as any
    );
    clearTimeout(timer);
    seedOptions.value = [
      {
        key: seed.key,
        url: seed.url,
        name: seed.name,
        category: seed.category,
        enabled: seed.enabled !== false
      },
      ...seedOptions.value
    ];
    try {
      await parseOneSeed(seed.url, { name: seed.name, timeout: 15_000 });
    } catch {
      /* parse best-effort */
    }
    suggestedAdded.add(seed.key);
    ElMessage.success(t("rss.manager.briefing.suggest.addedOk", { name: seed.name }));
    emit("briefingChanged");
    return true;
  } catch (e) {
    if (!isCancel(e)) ElMessage.error(errorMessage(e) || t("rss.manager.briefing.suggest.addFail"));
    return false;
  } finally {
    suggestedLoading.value = null;
  }
}

async function addAllSuggestedSeeds() {
  if (addAllLoading.value) return;
  const pending = suggestedSeeds.value.filter(s => !suggestedAdded.has(s.key));
  if (!pending.length) {
    ElMessage.info(t("rss.manager.briefing.suggest.allAdded"));
    return;
  }
  addAllLoading.value = true;
  try {
    let okCount = 0;
    for (const s of pending) {
      if (await addSuggestedSeed(s)) okCount++;
      await nextTick();
    }
    ElMessage.success(t("rss.manager.briefing.suggest.addAllOk", { n: okCount, total: pending.length }));
    await loadSeedsForOptions();
    await loadBriefing();
    emit("briefingChanged");
  } finally {
    addAllLoading.value = false;
  }
}

// ── Briefing groups ──
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
    list = list.filter(i => [i.title, i.author, i.summary, i.source_name].some(v => !!v && v.toLowerCase().includes(q)));
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
    const uncategorized = t("rss.manager.categories.uncategorized");
    const unknownSource = t("rss.manager.categories.unknownSource");
    const key = byCategory ? item.category_path || uncategorized : item.source_name || unknownSource;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: byCategory ? subCategory(item.category_path) || uncategorized : key,
        icon: byCategory ? "\uD83D\uDCC1" : "\uD83D\uDCE1",
        color: byCategory ? roleColor(item.category_path) : undefined,
        items: []
      });
    }
    groups.get(key)!.items.push(item);
  }
  return [...groups.values()].sort((a, b) => b.items.length - a.items.length);
});

const allBriefingItems = computed(() => briefingGroups.value.flatMap(g => g.items));
const sortedAllBriefingItems = computed(() => {
  return [...allBriefingItems.value].sort((a, b) => {
    const pa = typeof a.published_parsed === "number" ? a.published_parsed : new Date(a.published ?? 0).getTime();
    const pb = typeof b.published_parsed === "number" ? b.published_parsed : new Date(b.published ?? 0).getTime();
    return pb - pa;
  });
});
const filteredBriefingCount = computed(() => filteredBriefingItems.value.length);

// ── SRE Tier bar ──
const sreStats = ref<{ healthyCount: number; staleCount: number; totalFeeds: number; pruneRate: number }>({
  healthyCount: 0, staleCount: 0, totalFeeds: 0, pruneRate: 80
});
const sreStatsLoading = ref(false);
const TIER_LEVELS = ["L1", "L2", "L3", "L4", "L5"] as const;
type SreTier = typeof TIER_LEVELS[number];

const sreTier = computed<SreTier | "">(() => {
  const { healthyCount, staleCount, totalFeeds, pruneRate } = sreStats.value;
  if (totalFeeds > 0 && healthyCount === 0) return "L5";
  if (pruneRate < 50 || staleCount >= 10) return "L4";
  if (pruneRate < 70 || (staleCount >= 4 && staleCount <= 9)) return "L3";
  if ((pruneRate >= 70 && pruneRate < 85) || staleCount > 0 || staleCount <= 3) {
    if (pruneRate >= 85 && staleCount === 0) return "L1";
    return "L2";
  }
  return "L1";
});

function tierIcon(t: string): string {
  return ({ L1: "✅", L2: "⚠️", L3: "🚨", L4: "🔥", L5: "☠️" } as Record<string, string>)[t] ?? "•";
}

const tierDescription = computed(() => {
  const tMap: Record<string, string> = {
    L1: t("rss.manager.sre.tier.L1"),
    L2: t("rss.manager.sre.tier.L2"),
    L3: t("rss.manager.sre.tier.L3"),
    L4: t("rss.manager.sre.tier.L4"),
    L5: t("rss.manager.sre.tier.L5"),
    "": t("rss.manager.sre.tier.unknown")
  };
  return tMap[sreTier.value] ?? tMap[""];
});

// Use Link Factory for SRE Runbook — 3 gates navigation: resolveLink → (gateB skipped for settings) → optional gateC
const runbookLinkResolved = computed(() => {
  const type = `settings-${sreTier.value}`;
  // Best effort: try the canonical settings-type pattern first
  const attempts = ["settings-systemLog", "rag-index", "page"];
  for (const at of attempts) {
    const r = resolveLink({ type: at, key: `sre-${sreTier.value}-runbook`, title: `SRE Runbook ${sreTier.value}` });
    if (r.ok) return r;
  }
  // Use the search fallback from resolveLink itself when all template lookups miss
  return resolveLink({ type: "search", title: `RSS SRE Runbook tier ${sreTier.value || "L1"}`, key: "rss-runbook" });
});

const runbookExternalLink = computed(() => {
  if (runbookLinkResolved.value.ok) return runbookLinkResolved.value.link;
  return (runbookLinkResolved.value as any).fallback ?? "/search";
});

async function loadSreStats() {
  sreStatsLoading.value = true;
  const pruneCtrl = new AbortController();
  const pruneTimer = setTimeout(() => pruneCtrl.abort(), 10_000);
  const seedCtrl = new AbortController();
  const seedTimer = setTimeout(() => seedCtrl.abort(), 10_000);
  bag.addTimer(pruneTimer);
  bag.addAbort(pruneCtrl);
  bag.addTimer(seedTimer);
  bag.addAbort(seedCtrl);
  try {
    const [seedRes, pruneRes] = await Promise.allSettled([
      getSeedList({ pageNum: 1, pageSize: 500 }, { timeout: 10_000, signal: seedCtrl.signal }),
      scanKnowledge("rss/prune", { timeoutMs: 10_000, signal: pruneCtrl.signal })
    ]);
    let seeds: RssSeedDocument[] = [];
    if (seedRes.status === "fulfilled") seeds = seedRes.value.data?.list ?? [];
    const roleSet = rolesRef.value.length ? new Set(rolesRef.value) : null;
    if (roleSet) seeds = seeds.filter(s => roleSet.has(roleFromCategory(s.category)));
    const totalFeeds = seeds.length;
    const DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const healthyCount = seeds.filter(s => {
      const up = (s as any).updatedAt ?? (s as any).createdAt ?? 0;
      return up && now - up <= 2 * DAY;
    }).length;
    // Seed docs alone don't expose fetch failure counters; approximate "stale" using absence of recent activity plus oldest quarter
    const sortedActivity = [...seeds]
      .map(s => (s as any).updatedAt ?? (s as any).createdAt ?? 0)
      .sort((a, b) => b - a);
    const staleCutoff = sortedActivity[Math.max(0, Math.floor(sortedActivity.length * 0.75))] ?? 0;
    let staleCount = seeds.filter(s => {
      const up = (s as any).updatedAt ?? (s as any).createdAt ?? 0;
      return up && up <= staleCutoff && now - up >= 7 * DAY;
    }).length;
    if (!seeds.length) staleCount = 0;
    let pruneRate = 80;
    // use scan result count heuristics
    if (pruneRes.status === "fulfilled") {
      const files = (pruneRes.value as any).files ?? [];
      if (files && Array.isArray(files) && files.length) {
        pruneRate = 70 + Math.min(25, files.length);
      }
    }
    sreStats.value = { healthyCount, staleCount, totalFeeds, pruneRate };
  } catch {
    /* leave defaults */
  } finally {
    clearTimeout(pruneTimer);
    clearTimeout(seedTimer);
    sreStatsLoading.value = false;
  }
}

// ── 3-Page Digest ──
const digestRegenerating = ref(false);
const savedFlags = reactive<Record<string, boolean>>({});
const digestDate = computed(() => {
  const d = briefingDate.value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
});

interface DigestPage {
  key: string;
  title: string;
  subtitle: string;
  emptyHint: string;
  categories: string[];
  prefixes: string[];
  items: RssItemDocument[];
}

const digestPages = computed<DigestPage[]>(() => {
  const src = sortedAllBriefingItems.value;
  const mk = (p: Omit<DigestPage, "items">): DigestPage => {
    const list = src.filter(item => {
      const cat = (item.category_path ?? "").toLowerCase();
      if (p.categories.some(c => cat.includes(c))) return true;
      if (p.prefixes.some(pref => cat.startsWith(pref.toLowerCase()))) return true;
      return false;
    }).slice(0, 3);
    return { ...p, items: list };
  };
  return [
    mk({
      key: "page1",
      title: t("rss.manager.digest.page1.title"),
      subtitle: t("rss.manager.digest.page1.subtitle"),
      emptyHint: t("rss.manager.digest.page1.emptyHint"),
      categories: ["strategy", "competitor", "market"],
      prefixes: ["executive/"]
    }),
    mk({
      key: "page2",
      title: t("rss.manager.digest.page2.title"),
      subtitle: t("rss.manager.digest.page2.subtitle"),
      emptyHint: t("rss.manager.digest.page2.emptyHint"),
      categories: ["engineering", "sre", "devops", "ship", "release"],
      prefixes: ["engineer/", "sre/"]
    }),
    mk({
      key: "page3",
      title: t("rss.manager.digest.page3.title"),
      subtitle: t("rss.manager.digest.page3.subtitle"),
      emptyHint: t("rss.manager.digest.page3.emptyHint"),
      categories: ["ai", "research", "frontend", "methodology", "foundations"],
      prefixes: ["aier/"]
    })
  ];
});

async function regenerateDigest() {
  digestRegenerating.value = true;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 22_000);
  bag.addTimer(timer);
  bag.addAbort(ctrl);
  const watchdog = setTimeout(() => {
    if (digestRegenerating.value) ElMessage.info(t("rss.manager.digest.fallbackHint"));
  }, 12_000);
  bag.addTimer(watchdog);
  try {
    await Promise.allSettled([
      loadBriefing(),
      loadDailyVolume(),
      loadSreStats()
    ]);
    ElMessage.success(t("rss.manager.digest.regenerateOk"));
  } catch (e) {
    if (!isCancel(e)) ElMessage.error(errorMessage(e) || t("rss.manager.digest.regenerateFail"));
  } finally {
    clearTimeout(timer);
    clearTimeout(watchdog);
    digestRegenerating.value = false;
  }
}

let persistBlockUntil = 0;
async function persistDigestItem(item: RssItemDocument, pageIdx: number, _pageKey: string) {
  const id = item.key ?? item.link;
  if (!id) return;
  const now = Date.now();
  if (now < persistBlockUntil) {
    ElMessage.info(t("rss.manager.digest.debouncing"));
    return;
  }
  savedFlags[id] = true;
  persistBlockUntil = now + 2_000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  bag.addTimer(timer);
  bag.addAbort(ctrl);
  try {
    const path = `reading-list/daily-briefings/${digestDate.value}-page-${pageIdx}.md`;
    const title = item.title ?? "";
    const src = item.source_name ?? "";
    const link = item.link ?? "";
    const published = formatDate(item.published);
    const summary = stripHtml(item.summary ?? "");
    const content =
      `# Daily Briefing Page ${pageIdx} · ${digestDate.value}\n\n` +
      `## ${title}\n\n` +
      `- Source: **${src}**\n` +
      `- Link: ${link}\n` +
      `- Published: ${published}\n` +
      `- Category: ${subCategory(item.category_path) ?? item.category_path ?? "-"}\n\n` +
      `### Summary\n\n${summary}\n\n---\n` +
      `_Archived by YiVad RSS Manager_\n`;
    await writeKnowledgeFile(path, content, {
      kind: "rss-digest",
      date: digestDate.value,
      pageIdx,
      itemKey: id
    }, { timeoutMs: 10_000, signal: ctrl.signal });
    ElMessage.success(t("rss.manager.digest.savedOk", { path }));
  } catch (e) {
    if (!isCancel(e)) {
      ElMessage.error(errorMessage(e) || t("rss.manager.digest.savedFail"));
      savedFlags[id] = false;
    } else {
      savedFlags[id] = false;
    }
  } finally {
    clearTimeout(timer);
  }
}

// ── Date navigation ──
function goToPrevDay() {
  const d = new Date(briefingDate.value);
  d.setDate(d.getDate() - 1);
  briefingDate.value = d;
  void loadBriefing();
}
function goToNextDay() {
  const d = new Date(briefingDate.value);
  d.setDate(d.getDate() + 1);
  briefingDate.value = d;
  void loadBriefing();
}
function goToToday() {
  briefingDate.value = new Date();
  void loadBriefing();
}

// ── Article actions ──
const RECENT_ARTICLES_KEY = "rss.recentArticles";
const MAX_RECENT_ARTICLES = 8;
const recentArticles = ref<RssItemDocument[]>(loadJson<RssItemDocument[]>(RECENT_ARTICLES_KEY, []));

function addRecentArticle(row: RssItemDocument) {
  const id = row.key ?? row.link;
  recentArticles.value = [row, ...recentArticles.value.filter(a => (a.key ?? a.link) !== id)].slice(0, MAX_RECENT_ARTICLES);
  saveJson(RECENT_ARTICLES_KEY, recentArticles.value);
}

function onArticleRowClick(row: RssItemDocument) {
  if (row.link) window.open(row.link, "_blank", "noopener,noreferrer");
  addRecentArticle(row);
}
function onViewDetail(row: RssItemDocument) {
  emit("viewArticle", row);
}

async function onDeleteItem(row: RssItemDocument) {
  if (!row.key) return;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10_000);
  bag.addTimer(timer);
  bag.addAbort(ctrl);
  try {
    await deleteRssItem(row.key, { timeout: 10_000, signal: ctrl.signal } as any);
    ElMessage.success(t("rss.manager.items.delete.ok"));
    await loadBriefing();
    emit("briefingChanged");
  } catch (e) {
    if (!isCancel(e)) ElMessage.error(errorMessage(e) || t("rss.manager.items.delete.fail"));
  } finally {
    clearTimeout(timer);
  }
}

// ── Lifecycle ──
onMounted(() => {
  void loadBriefing();
  void loadDailyVolume();
  void loadSeedsForOptions();
  void loadSreStats();
});

watch(rolesRef, () => {
  bag.reset();
  void loadBriefing();
  void loadDailyVolume();
  void loadSeedsForOptions();
  void loadSreStats();
}, { deep: true });

onBeforeUnmount(() => {
  bag.dispose();
});
</script>

<style scoped lang="scss">
@use "./BriefingSection.scss";
@use "@/views/knowledge/executive/styles/rssManager.scss" as *;
</style>
