<template>
  <div class="rss-manager">
    <el-breadcrumb separator="/" class="rss-manager__breadcrumb">
      <el-breadcrumb-item :to="{ path: '/executiver' }">Executive</el-breadcrumb-item>
      <el-breadcrumb-item>RSS Manager</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="rss-manager__sub-nav">
      <span class="rss-manager__sub-nav-item" @click="$router.push('/executiver/okr')">
        🎯 OKR Dashboard
      </span>
    </div>

    <header class="rss-manager__header">
      <div class="rss-manager__header-row">
        <h1>RSS Feed Management</h1>
        <el-button
          :type="schedulerStatus.enabled ? 'warning' : 'success'"
          size="small"
          plain
          @click="toggleScheduler"
          :loading="schedulerLoading"
        >
          {{ schedulerStatus.enabled ? '⏸ Pause Scheduler' : '▶ Start Scheduler' }}
        </el-button>
      </div>
      <p>
        Subscribe to RSS feeds, auto-classify into <code>YiKnowledge/executive</code> subdomains.
        Articles feed the <em>market-intel</em> and <em>reading-list</em> pipeline chips. Each source manages its own fetch schedule.
      </p>
    </header>

    <el-tabs v-model="activeTab" type="card" class="rss-manager__tabs" @tab-change="onTabChange">
      <el-tab-pane name="seeds">
        <template #label>
          <span class="rss-manager__tab-label">📡 Feed Sources
            <span v-if="seeds.length" class="rss-manager__tab-badge">{{ seeds.length }}</span>
          </span>
        </template>

        <div class="rss-manager__toolbar">
          <el-input
            v-model="seedSearch"
            placeholder="Search..."
            clearable
            :prefix-icon="Search"
            style="width:220px"
          />
          <el-button type="primary" :icon="Plus" @click="openSeedDialog()">Add Source</el-button>
          <el-button :icon="Refresh" @click="parseAllFeeds" :loading="parseAllLoading">Parse All</el-button>
          <el-button :icon="Link" @click="quickParseVisible = true">Quick Parse</el-button>
        </div>

        <el-table
          :data="filteredSeeds"
          v-loading="seedsLoading"
          stripe
          style="width:100%"
          row-key="url"
          :empty-text="seedsLoading ? '' : 'No feed sources yet. Add one to start fetching articles.'"
          highlight-current-row
          @row-click="openSeedDrawer"
        >
          <el-table-column prop="name" label="Name" min-width="140" show-overflow-tooltip />
          <el-table-column prop="url" label="Feed URL" min-width="220" show-overflow-tooltip />
          <el-table-column prop="category" label="Category" width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="(row as RssSeedDocument).category" class="rss-manager__cat">{{ (row as RssSeedDocument).category }}</span>
              <span v-else class="rss-manager__text-muted">auto</span>
            </template>
          </el-table-column>
          <el-table-column label="Interval" width="90" align="center">
            <template #default="{ row }">
              <span v-if="seedIntervals[(row as RssSeedDocument).url]" class="rss-manager__schedule-badge">
                {{ formatInterval(seedIntervals[(row as RssSeedDocument).url]) }}
              </span>
              <span v-else class="rss-manager__text-muted">global</span>
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
      </el-tab-pane>

      <el-tab-pane name="items">
        <template #label>
          <span class="rss-manager__tab-label">📄 Articles
            <span v-if="totalItems" class="rss-manager__tab-badge">{{ totalItems }}</span>
          </span>
        </template>
        <div class="rss-manager__toolbar">
          <el-input
            v-model="itemSearch"
            placeholder="Search title, author..."
            clearable
            :prefix-icon="Search"
            style="width:200px"
            @clear="onItemFilterChange"
            @keyup.enter="onItemFilterChange"
          />
          <el-select v-model="itemSourceFilter" placeholder="All sources" clearable style="width:150px" @change="onItemFilterChange">
            <el-option v-for="s in seedOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
          <el-select v-model="itemCategoryFilter" placeholder="All categories" clearable style="width:170px" @change="onItemFilterChange">
            <el-option v-for="c in allCategoryOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
          <el-date-picker
            v-model="itemDateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="From"
            end-placeholder="To"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width:230px"
            @change="onItemFilterChange"
          />
          <el-select v-model="itemSortKey" style="width:130px" @change="onItemFilterChange">
            <el-option label="Newest first" value="published_parsed" />
            <el-option label="Oldest first" value="published_parsed-asc" />
            <el-option label="By source" value="source_name" />
            <el-option label="By category" value="category_path" />
          </el-select>
          <span class="rss-manager__toolbar-right">
            <span v-if="totalItems" class="rss-manager__result-count">{{ totalItems }} articles</span>
            <el-button v-if="selectedItems.length" type="danger" size="small" @click="batchDelete">Delete ({{ selectedItems.length }})</el-button>
            <el-button v-if="hasActiveFilters" size="small" text @click="clearFilters">Clear filters</el-button>
            <el-button size="small" text :icon="Refresh" @click="loadItems">Refresh</el-button>
          </span>
        </div>

        <div v-if="hasActiveFilters" class="rss-manager__active-filters">
          <el-tag v-if="itemSearch" size="small" closable @close="itemSearch = ''; onItemFilterChange()">Search: {{ itemSearch }}</el-tag>
          <el-tag v-if="itemSourceFilter" size="small" closable @close="itemSourceFilter = ''; onItemFilterChange()">Source: {{ itemSourceFilter }}</el-tag>
          <el-tag v-if="itemCategoryFilter" size="small" closable @close="itemCategoryFilter = ''; onItemFilterChange()">Category: {{ itemCategoryFilter }}</el-tag>
          <el-tag v-if="itemDateRange" size="small" closable @close="itemDateRange = null; onItemFilterChange()">Date: {{ itemDateRange[0] }} ~ {{ itemDateRange[1] }}</el-tag>
        </div>

        <el-table
          :data="items"
          v-loading="itemsLoading"
          stripe
          style="width:100%"
          :empty-text="itemsLoading ? '' : 'No articles yet. Add a feed source and click Parse.'"
          @selection-change="onSelectionChange"
        >
          <el-table-column type="selection" width="40" />
          <el-table-column label="Title" min-width="320" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="rss-manager__item-title">
                <a :href="(row as RssItemDocument).link" target="_blank" rel="noopener noreferrer" class="rss-manager__item-link">
                  {{ (row as RssItemDocument).title }}
                </a>
                <div class="rss-manager__item-meta">
                  <span class="rss-manager__item-source">{{ (row as RssItemDocument).source_name }}</span>
                  <template v-if="(row as RssItemDocument).author"> · {{ (row as RssItemDocument).author }}</template>
                  </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="category_path" label="Category" width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="(row as RssItemDocument).category_path" class="rss-manager__category-path">
                <template v-for="(seg, i) in categorySegments((row as RssItemDocument).category_path)" :key="i">
                  <span v-if="i > 0" class="rss-manager__category-sep">/</span>
                  <span class="rss-manager__category-seg">{{ seg }}</span>
                </template>
              </span>
              <span v-else class="rss-manager__text-muted">—</span>
            </template>
          </el-table-column>
          <el-table-column label="Published" width="140" align="center">
            <template #default="{ row }">
              <el-tooltip :content="formatDate((row as RssItemDocument).published)" placement="top" :show-after="400">
                <span class="rss-manager__date">{{ formatRelativeTime((row as RssItemDocument).published) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="130" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="(row as RssItemDocument).file_path"
                size="small"
                text
                type="primary"
                @click="previewArticle(row as RssItemDocument)"
              >Read</el-button>
              <span v-else class="rss-manager__text-muted" style="font-size:12px">—</span>
              <el-popconfirm title="Delete this article?" @confirm="removeItem(row as RssItemDocument)">
                <template #reference>
                  <el-button size="small" text type="danger">Del</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <div class="rss-manager__pagination">
          <el-pagination
            v-model:current-page="itemPage"
            :page-size="itemPageSize"
            :total="totalItems"
            layout="prev,pager,next,total"
            background
            @current-change="loadItems"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Seed Drawer -->
    <el-drawer
      v-model="seedDrawerVisible"
      :title="drawerSeed?.name || drawerSeed?.url || 'Source Detail'"
      size="420px"
      destroy-on-close
    >
      <template v-if="drawerSeed">
        <div class="rss-manager__drawer-section">
          <div class="rss-manager__drawer-label">Feed URL</div>
          <div class="rss-manager__drawer-url">{{ drawerSeed.url }}</div>
        </div>
        <div class="rss-manager__drawer-section">
          <div class="rss-manager__drawer-label">Category</div>
          <div>{{ drawerSeed.category || 'auto (keyword-based classification)' }}</div>
        </div>

        <el-divider />

        <div class="rss-manager__drawer-section">
          <div class="rss-manager__drawer-label">Fetch Schedule</div>
          <div class="rss-manager__drawer-schedule">
            <el-select
              :model-value="seedIntervals[drawerSeed.url] || 0"
              @change="setSeedInterval(drawerSeed, $event)"
              size="small"
              style="width:150px"
            >
              <el-option :value="0" label="Global default" />
              <el-option :value="600" label="10 minutes" />
              <el-option :value="1800" label="30 minutes" />
              <el-option :value="3600" label="1 hour" />
              <el-option :value="7200" label="2 hours" />
              <el-option :value="21600" label="6 hours" />
              <el-option :value="43200" label="12 hours" />
              <el-option :value="86400" label="24 hours" />
            </el-select>
            <span v-if="!seedIntervals[drawerSeed.url]" class="rss-manager__text-muted">
              Uses global interval ({{ formatInterval(schedulerStatus.interval || 3600) }})
            </span>
            <span v-else class="rss-manager__text-muted">
              Next run: ~{{ estimateNextRun(drawerSeed.url) }}
            </span>
          </div>
        </div>

        <div class="rss-manager__drawer-section">
          <div class="rss-manager__drawer-label">Status</div>
          <el-switch
            :model-value="drawerSeed.enabled !== false"
            :loading="seedToggling === drawerSeed.key"
            @change="toggleSeed(drawerSeed)"
            size="small"
            active-text="Active"
            inactive-text="Paused"
          />
        </div>

        <el-divider />

        <div class="rss-manager__drawer-section">
          <div class="rss-manager__drawer-label">Parse Stats</div>
          <div class="rss-manager__drawer-stats">
            <div class="rss-manager__drawer-stat">
              <span class="rss-manager__drawer-stat-val">{{ seedArticleCounts[drawerSeed.url] ?? '...' }}</span>
              <span class="rss-manager__drawer-stat-lbl">articles</span>
            </div>
            <div class="rss-manager__drawer-stat">
              <span class="rss-manager__drawer-stat-val">
                <span v-if="parseResults[drawerSeed.url]" :class="parseResults[drawerSeed.url]!.ok ? 'rss-manager__text-ok' : 'rss-manager__text-err'">
                  {{ parseResults[drawerSeed.url]!.ok ? 'OK' : 'Fail' }}
                </span>
                <span v-else class="rss-manager__text-muted">—</span>
              </span>
              <span class="rss-manager__drawer-stat-lbl">last parse</span>
            </div>
            <div class="rss-manager__drawer-stat">
              <span class="rss-manager__drawer-stat-val">{{ formatTimeAgo(parseTimes[drawerSeed.url]) }}</span>
              <span class="rss-manager__drawer-stat-lbl">when</span>
            </div>
          </div>
        </div>

        <div class="rss-manager__drawer-section">
          <div class="rss-manager__drawer-label">Recent Activity</div>
          <div v-if="sourceHistory(drawerSeed).length === 0" class="rss-manager__text-muted">No parse activity yet</div>
          <div v-else class="rss-manager__drawer-history">
            <div v-for="h in sourceHistory(drawerSeed).slice(0, 10)" :key="h.id" class="rss-manager__drawer-history-item">
              <span class="rss-manager__seed-history-dot" :class="{ ok: h.ok }" />
              <span class="rss-manager__seed-history-time">{{ h.time }}</span>
              <span v-if="h.ok">{{ h.saved }} new, {{ h.updated }} updated</span>
              <span v-else class="rss-manager__seed-history-stat--err">{{ h.error }}</span>
            </div>
          </div>
        </div>
      </template>
    </el-drawer>

    <!-- Seed Dialog -->
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
          <span class="rss-manager__form-hint">Override classification target. Leave empty for auto.</span>
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
          <span class="rss-manager__form-hint">Leave empty to use the global scheduler setting.</span>
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

    <!-- Article Preview -->
    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="rssManager">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Plus, Refresh, Link } from "@element-plus/icons-vue";
import {
  getSeedList, createSeed, updateSeed, deleteSeed,
  getRssList, deleteRssItem,
  parseFeed, parseAllEnabledFeeds,
  startRssScheduler, stopRssScheduler,
  getRssSchedulerStatus,
  type RssSeedDocument, type RssItemDocument, type RssSchedulerStatus
} from "@/api/modules/rssService";
import KnowledgePreviewDialog from "@/views/aiChat/components/KnowledgePreviewDialog.vue";

const activeTab = ref("seeds");

/** Category options grouped by role domain — mirrors YiKnowledge directory structure. */
const categoryGroups = [
  {
    label: "Executive",
    options: [
      { label: "Industry · market trends, competitors, reports", value: "executive/industry" },
      { label: "Strategy · frameworks, compliance, positioning", value: "executive/strategy" },
      { label: "Roadmap · planning, OKR, budget", value: "executive/roadmap" },
      { label: "Reading List · curated executive readings", value: "executive/reading-list" }
    ]
  },
  {
    label: "AI Engineer",
    options: [
      { label: "Methodology", value: "ai-engineer/methodology" },
      { label: "Foundations", value: "ai-engineer/foundations" }
    ]
  },
  {
    label: "Other Roles",
    options: [
      { label: "Data Engineer · patterns", value: "data-engineer/patterns" },
      { label: "DevOps · processes", value: "devops/processes" },
      { label: "Product Manager · frameworks", value: "product-manager/frameworks" },
      { label: "Engineer · lessons", value: "engineer/lessons" },
      { label: "Technical Writer · patterns", value: "technical-writer/patterns" }
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

const filteredSeeds = computed(() => {
  if (!seedSearch.value) return seeds.value;
  const q = seedSearch.value.toLowerCase();
  return seeds.value.filter(s =>
    (s.name || "").toLowerCase().includes(q) || (s.url || "").toLowerCase().includes(q)
  );
});

const seedOptions = computed(() =>
  seeds.value.filter(s => s.name).map(s => ({ label: s.name!, value: s.name! }))
);

const seedDialogVisible = ref(false);
const editingSeed = ref<RssSeedDocument | null>(null);
const seedSaving = ref(false);
const seedForm = reactive<{ url: string; name: string; category: string; interval: number; enabled: boolean }>({
  url: "", name: "", category: "", interval: 0, enabled: true
});

const parseAllLoading = ref(false);

// Seed drawer
const seedDrawerVisible = ref(false);
const drawerSeed = ref<RssSeedDocument | null>(null);

function openSeedDrawer(row: RssSeedDocument) {
  drawerSeed.value = row;
  seedDrawerVisible.value = true;
  if (seedArticleCounts[row.url] === undefined) {
    getRssList({ source_url: row.url, pageSize: 1 })
      .then(res => { seedArticleCounts[row.url] = (res.data as any)?.total ?? 0; })
      .catch(() => { seedArticleCounts[row.url] = 0; });
  }
}

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
    const patch: any = {
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
  } catch (e: any) {
    ElMessage.error(e.message || "Failed to save source");
  } finally {
    seedSaving.value = false;
  }
}

async function removeSeed(row: RssSeedDocument) {
  if (!row.key) return;
  try {
    await deleteSeed(row.key);
    ElMessage.success("Source removed");
    seedDrawerVisible.value = false;
    await loadSeeds();
  } catch (e: any) {
    ElMessage.error(e.message || "Failed to remove source");
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
  } catch (e: any) {
    ElMessage.error(e.message || "Failed to toggle source");
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
  } catch (e: any) {
    addParseHistory(row.name || row.url, false, 0, 0, e.message || "Parse failed");
    ElMessage.error(e.message || "Parse failed");
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
  } catch (e: any) {
    addParseHistory("All sources", false, 0, 0, e.message || "Batch parse failed");
    ElMessage.error(e.message || "Batch parse failed");
  } finally {
    parseAllLoading.value = false;
  }
}

async function loadSeeds() {
  seedsLoading.value = true;
  try {
    const res = await getSeedList();
    const list = ((res.data as any)?.list ?? []) as RssSeedDocument[];
    seeds.value = list;
    for (const s of list) {
      if (s.interval) seedIntervals[s.url] = s.interval;
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
  } catch (e: any) {
    ElMessage.error(e.message || "Quick parse failed");
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
const itemSourceFilter = ref("");
const itemCategoryFilter = ref("");
const itemDateRange = ref<[string, string] | null>(null);
const itemSortKey = ref("published_parsed");
const itemPage = ref(1);
const itemPageSize = 20;
const totalItems = ref(0);
const selectedItems = ref<RssItemDocument[]>([]);

const allCategoryOptions = computed(() => {
  const cats = new Set<string>();
  for (const s of seeds.value) if (s.category) cats.add(s.category);
  for (const i of items.value) if (i.category_path) cats.add(i.category_path);
  return [...cats].sort().map(c => ({ label: c, value: c }));
});

function categorySegments(path?: string): string[] {
  if (!path) return [];
  return path.split("/").filter(Boolean);
}

const hasActiveFilters = computed(() =>
  !!(itemSearch.value || itemSourceFilter.value || itemCategoryFilter.value || itemDateRange.value)
);

function onSelectionChange(rows: any[]) {
  selectedItems.value = rows as RssItemDocument[];
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;
function onItemFilterChange() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { itemPage.value = 1; loadItems(); }, 300);
}

function clearFilters() {
  itemSearch.value = "";
  itemSourceFilter.value = "";
  itemCategoryFilter.value = "";
  itemDateRange.value = null;
  itemSortKey.value = "published_parsed";
  itemPage.value = 1;
  loadItems();
}

async function loadItems() {
  itemsLoading.value = true;
  selectedItems.value = [];
  try {
    const params: any = { pageNum: itemPage.value, pageSize: itemPageSize };
    if (itemSearch.value) params.search = itemSearch.value;
    if (itemSourceFilter.value) params.source_name = itemSourceFilter.value;
    if (itemCategoryFilter.value) params.category_path = itemCategoryFilter.value;
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
    items.value = (res.data as any)?.list ?? [];
    totalItems.value = (res.data as any)?.total ?? 0;
  } catch { items.value = []; totalItems.value = 0; }
  finally { itemsLoading.value = false; }
}

// ── Article preview drawer ──
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

function previewArticle(row: RssItemDocument) {
  if (!row.file_path) return;
  previewDlg.value?.open(row.file_path);
}

async function removeItem(row: RssItemDocument) {
  if (!row.key) return;
  try {
    await deleteRssItem(row.key);
    ElMessage.success("Article deleted");
    await loadItems();
  } catch (e: any) {
    ElMessage.error(e.message || "Failed to delete article");
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
}

// ═══════════════════════════════════════════════
// Scheduler
// ═══════════════════════════════════════════════
const schedulerStatus = reactive<RssSchedulerStatus>({ enabled: false, type: "interval", interval: 3600 });
const schedulerLoading = ref(false);

async function loadSchedulerStatus() {
  try {
    const res = await getRssSchedulerStatus();
    Object.assign(schedulerStatus, res.data);
  } catch { /* ignore */ }
}

async function toggleScheduler() {
  schedulerLoading.value = true;
  try {
    if (schedulerStatus.enabled) {
      await stopRssScheduler();
      ElMessage.success("Scheduler paused");
    } else {
      await startRssScheduler();
      ElMessage.success("Scheduler started");
    }
    await loadSchedulerStatus();
  } catch (e: any) {
    ElMessage.error(e.message || "Failed to toggle scheduler");
  } finally {
    schedulerLoading.value = false;
  }
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

// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════
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
  const interval = seedIntervals[url] || schedulerStatus.interval || 3600;
  const last = parseTimes[url];
  if (!last) return "on next tick";
  const diff = (last + interval * 1000) - Date.now();
  if (diff < 0) return "any moment";
  if (diff < 60000) return `${Math.round(diff / 1000)}s`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m`;
  return `${Math.round(diff / 3600000)}h`;
}

function onTabChange(tab: any) {
  if (tab === "items") loadItems();
  else if (tab === "seeds") loadSeeds();
}

onMounted(() => {
  loadSeeds();
  loadItems();
  loadSchedulerStatus();
});
</script>

<style scoped lang="scss">
.rss-manager {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 16px 20px;
  background: var(--el-bg-color-page);
  min-height: 100%;
}

// ── Breadcrumb & Sub-nav ──
.rss-manager__breadcrumb { margin-bottom: 4px; }

.rss-manager__sub-nav { display: flex; gap: 8px; margin-bottom: 12px; }
.rss-manager__sub-nav-item {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
  color: var(--el-color-primary); background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  cursor: pointer; transition: background .15s, border-color .15s;
  &:hover { background: var(--el-color-primary-light-7); border-color: var(--el-color-primary-light-5); }
}

// ── Header ──
.rss-manager__header {
  margin-bottom: 12px;
}

.rss-manager__header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  h1 { margin: 0; font-size: 18px; font-weight: 700; }
}

.rss-manager__header p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  code { font-size: 11px; background: var(--el-fill-color); padding: 1px 5px; border-radius: 3px; }
}

// ── Tabs ──
.rss-manager__tabs {
  :deep(.el-tabs__header) { margin-bottom: 0; }
  :deep(.el-tabs__content) { padding: 12px 0 0; }
}

.rss-manager__tab-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rss-manager__tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

// ── Toolbar ──
.rss-manager__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.rss-manager__toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.rss-manager__result-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

// ── Active filters ──
.rss-manager__active-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

// ── Text helpers ──
.rss-manager__text-muted { color: var(--el-text-color-placeholder); font-size: 12px; }
.rss-manager__text-ok { color: #10b981; font-weight: 600; }
.rss-manager__text-err { color: #f56c6c; font-weight: 600; }

.rss-manager__cat {
  font-size: 12px;
  font-family: monospace;
  color: var(--el-text-color-secondary);
}

.rss-manager__schedule-badge {
  font-size: 11px;
  font-weight: 600;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  padding: 1px 7px;
  border-radius: 4px;
}

// ── Item title ──
.rss-manager__item-title {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.rss-manager__item-link {
  color: var(--el-text-color-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
  line-height: 1.4;
  &:hover { color: var(--el-color-primary); text-decoration: underline; }
}

.rss-manager__item-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  flex-wrap: wrap;
}

.rss-manager__item-source {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

// ── Category breadcrumb ──
.rss-manager__category-path {
  display: inline-flex;
  align-items: center;
  gap: 0;
  font-size: 11px;
  font-family: "SF Mono", "Fira Code", monospace;
  white-space: nowrap;
}

.rss-manager__category-sep {
  color: var(--el-text-color-placeholder);
  margin: 0 2px;
  font-size: 10px;
}

.rss-manager__category-seg {
  color: var(--el-text-color-secondary);
  &:first-child { color: var(--el-color-primary); font-weight: 600; }
}

.rss-manager__date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

// ── Pagination ──
.rss-manager__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

// ── Form hints ──
.rss-manager__form-hint {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  line-height: 1.4;
}

// ── Drawer ──
.rss-manager__drawer-section {
  margin-bottom: 14px;
}

.rss-manager__drawer-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 6px;
}

.rss-manager__drawer-url {
  font-size: 12px;
  font-family: monospace;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}

.rss-manager__drawer-schedule {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rss-manager__drawer-stats {
  display: flex;
  gap: 24px;
}

.rss-manager__drawer-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rss-manager__drawer-stat-val {
  font-size: 16px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.rss-manager__drawer-stat-lbl {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.rss-manager__drawer-history {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rss-manager__drawer-history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 2px 0;
}

.rss-manager__seed-history-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; background: #f56c6c;
  &.ok { background: #10b981; }
}

.rss-manager__seed-history-time {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  min-width: 70px;
}

.rss-manager__seed-history-stat--err { color: var(--el-color-danger); }
</style>