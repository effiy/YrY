<template>
  <section class="rss-role__section">
    <div class="rss-role__section-head">
      <h2 class="rss-role__section-title">{{ t("rss.manager.seeds.title") }}</h2>
      <span class="rss-role__result-count">{{
        t("rss.manager.seeds.resultCount", { filtered: filteredSeeds.length, total: feedsCount })
      }}</span>
      <span class="rss-role__toolbar-right">
        <el-button type="primary" :icon="Plus" @click="openSeedDialog()">{{ t("rss.manager.seeds.addSource") }}</el-button>
        <el-button :icon="Refresh" @click="onParseAll" :loading="parseAllLoading">{{
          t("rss.manager.seeds.parseAllBtn")
        }}</el-button>
        <el-button :icon="Link" @click="quickParseVisible = true">{{ t("rss.manager.seeds.quickParseBtn") }}</el-button>
      </span>
    </div>

    <div class="rss-role__section-body">
      <div class="rss-role__toolbar">
        <el-input
          v-model="seedSearch"
          :placeholder="t('rss.manager.seeds.searchPlaceholder')"
          clearable
          :prefix-icon="Search"
          style="width: 220px"
        />
      </div>
      <el-table
        v-if="viewMode === 'table'"
        :data="filteredSeeds"
        v-loading="seedsLoading"
        stripe
        border
        style="width: 100%"
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
        <el-table-column :label="t('rss.manager.seeds.table.actions')" width="190" fixed="right">
          <template #default="{ row }">
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
              <span class="rss-role__cat-dot" :style="{ background: roleColor(seed.category) }"></span
              >{{ subCategory(seed.category) }}
            </span>
            <span v-if="seedIntervals[seed.url]">{{ formatInterval(seedIntervals[seed.url]) }}</span>
            <span v-else>{{ t("rss.manager.seeds.card.globalInterval") }}</span>
            <span v-if="seedArticleCounts[seed.url] !== undefined">{{
              t("rss.manager.seeds.card.articles", { n: seedArticleCounts[seed.url] })
            }}</span>
            <span v-if="parseTimes[seed.url]">{{ formatTimeAgo(parseTimes[seed.url]) }}</span>
            <span v-else>{{ t("rss.manager.seeds.card.neverParsed") }}</span>
          </div>
          <div class="rss-role__seed-card-actions">
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

    <!-- Seed Dialog -->
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
  </section>
</template>

<script setup lang="ts">
import { onMounted, watch, toRef } from "vue";
import { Search, Plus, Refresh, Link, Delete } from "@element-plus/icons-vue";
import type { RssSeedDocument } from "@/api/modules/rssService";
import { useI18n } from "vue-i18n";
import { roleColor as roleColorFn } from "@/views/knowledge/executive/okrData";
import { useFeeds } from "./useFeeds";
import SeedDialog from "./SeedDialog.vue";
import QuickParseDialog from "./QuickParseDialog.vue";

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
  subCategory
} = useFeeds(rolesRef);

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

onMounted(() => {
  loadSeeds();
  loadSeedArticleCounts();
});

watch(
  rolesRef,
  () => {
    loadSeeds();
    loadSeedArticleCounts();
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
.rss-role__section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  animation: rss-section-in 0.25s ease;
}
@keyframes rss-section-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.rss-role__section-head {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
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
.rss-role__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.rss-role__toolbar-right {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-left: auto;
}
.rss-role__result-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.rss-role__text-muted {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.rss-role__cat-dot {
  display: inline-block;
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-right: 4px;
  vertical-align: middle;
  border-radius: 50%;
}
.rss-role__cat-chip {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
.rss-role__schedule-badge {
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
}
.rss-role__article-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.rss-role__seed-url {
  display: inline-flex;
  gap: 2px;
  align-items: center;
  max-width: 100%;
}
.rss-role__seed-url-text {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.rss-role__date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

// Cards grid (shared with items)
.rss-role__items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

// Seed card
.rss-role__seed-card {
  cursor: default;
  border-radius: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
  }
}
.rss-role__seed-card-head {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}
.rss-role__seed-card-name {
  font-size: 14px;
  font-weight: 600;
}
.rss-role__seed-card-url {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.rss-role__seed-card-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.rss-role__seed-card-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

// Form hint
.rss-role__form-hint {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.4;
  color: var(--el-text-color-placeholder);
}

// Table hover
:deep(.el-table__body tr) {
  transition: background-color 0.15s ease;
}
:deep(.el-table__body tr:hover > td) {
  background-color: var(--el-color-primary-light-9) !important;
}
</style>