<template>
  <div class="search-page">
    <!-- Date Navigation -->
    <HeroDateNav
      :filter-date="filterDate"
      :label="filterDateLabel"
      :is-today="isFilterToday"
      @prev="goToPrevDay"
      @next="goToNextDay"
      @today="goToFilterToday"
      @clear="clearFilterDate"
    />

    <!-- Search Header -->
    <div class="search-page__head">
      <div class="search-page__input-area">
        <div class="search-page__input-wrap" :class="{ 'is-focused': inputFocused }">
          <el-icon class="search-page__input-icon" :size="18">
            <component :is="searching ? Loading : Search" :class="{ 'is-spinning': searching }" />
          </el-icon>
          <input
            ref="inputRef"
            v-model="query"
            class="search-page__input"
            :placeholder="$t('search.placeholder') || 'Search across projects, issues, modules, bugs, pages...'"
            @input="onInput"
            @focus="inputFocused = true"
            @blur="inputFocused = false"
            @keydown="onInputKeydown"
          />
          <span v-if="searching" class="search-page__searching-dot" />
          <el-icon v-else-if="query" class="search-page__clear" :size="16" @mousedown.prevent="clearSearch">
            <CircleClose />
          </el-icon>
          <kbd class="search-page__kbd">⌘K</kbd>
        </div>

        <!-- Recent Suggestions -->
        <Transition name="suggest">
          <div v-if="showSuggestions && suggestionItems.length" class="search-page__suggestions">
            <div class="search-page__suggestions-head">
              {{ query ? 'Suggestions' : 'Recent searches' }}
              <button v-if="!query && recentSearches.length" class="search-page__suggestions-clear" @click="clearRecent">Clear</button>
            </div>
            <button
              v-for="(s, i) in suggestionItems"
              :key="i"
              :class="['search-page__suggestion', { 'is-active': suggestionIdx === i }]"
              @mousedown.prevent="pickSuggestion(s)"
              @mouseenter="suggestionIdx = i"
            >
              <el-icon :size="14"><Clock v-if="!query" /><Search v-else /></el-icon>
              <span v-html="highlightSuggestion(s)" />
              <span v-if="!query" class="search-page__suggestion-remove" @mousedown.stop.prevent="removeRecent(i)">
                <el-icon :size="12"><Close /></el-icon>
              </span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- Active Filters Bar -->
      <div v-if="query" class="search-page__toolbar">
        <div class="search-page__type-filters">
          <button
            v-for="ft in typeFilters"
            :key="ft.key"
            :class="['search-page__filter-btn', { 'is-active': activeTypeFilter === ft.key }]"
            @click="activeTypeFilter = activeTypeFilter === ft.key ? '' : ft.key"
          >
            <el-icon :size="14"><component :is="ft.icon" /></el-icon>
            <span>{{ ft.label }}</span>
            <span v-if="typeCounts[ft.key]" class="search-page__filter-count">{{ typeCounts[ft.key] }}</span>
          </button>
        </div>
        <div class="search-page__toolbar-right">
          <select v-if="projectOptions.length > 1" v-model="projectFilter" class="search-page__project-select">
            <option value="">All Projects</option>
            <option v-for="p in projectOptions" :key="p.key" :value="p.key">{{ p.name }}</option>
          </select>
          <div class="search-page__sort">
            <button :class="['search-page__sort-btn', { 'is-active': sortBy === 'relevance' }]" @click="sortBy = 'relevance'">
              Relevance
            </button>
            <button :class="['search-page__sort-btn', { 'is-active': sortBy === 'recent' }]" @click="sortBy = 'recent'">
              Recent
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="searching" class="search-page__loading">
      <p class="search-page__loading-text">
        Searching<template v-if="query"> for "<strong>{{ query }}</strong>"</template
        ><span class="search-page__loading-dots"><span>.</span><span>.</span><span>.</span></span>
      </p>
      <div v-for="i in 4" :key="i" class="search-page__skeleton">
        <div class="search-page__skeleton-icon" />
        <div class="search-page__skeleton-lines">
          <div class="search-page__skeleton-line w-40" />
          <div class="search-page__skeleton-line w-60" />
          <div class="search-page__skeleton-line w-25" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="searchError" class="search-page__error">
      <div class="search-page__error-icon">
        <el-icon :size="24"><WarningFilled /></el-icon>
      </div>
      <p class="search-page__error-text">Search failed. Please try again.</p>
      <button class="search-page__error-retry" @click="() => { searchError = null; void refresh(); }">Retry</button>
    </div>

    <!-- Results -->
    <div v-else-if="query && !searching" class="search-page__results">
      <!-- Summary Bar -->
      <div class="search-page__summary">
        <template v-if="totalResults || autoFilteredCount > 0 || ghostFilteredCount > 0">
          <span class="search-page__summary-count">{{ totalResults }}</span>
          {{ totalResults === 1 ? 'result' : 'results' }} for "<strong>{{ query }}</strong
          >"
          <span v-if="searchMs !== null" class="search-page__summary-time">in {{ searchMs }}ms</span>

          <div
            v-if="autoFilteredCount + ghostFilteredCount > 0"
            class="search-page__summary-auto-filter"
            role="button"
            tabindex="0"
            @click="showFilterDetail = !showFilterDetail"
          >
            <el-icon size="14"><WarningFilled /></el-icon>
            自动屏蔽 {{ autoFilteredCount + ghostFilteredCount }} 条不可达/幽灵结果
            <el-icon :size="14" :class="{ 'is-open': showFilterDetail }"><ArrowRight /></el-icon>
            <div v-if="showFilterDetail" class="search-page__summary-filter-detail" @click.stop>
              <div>· 后端过滤（已删除/归档/取消）：{{ ghostFilteredCount }} 条</div>
              <div>· 前端 Gate A（路由/权限/隐藏）：{{ autoFilteredCount }} 条</div>
              <div class="search-page__summary-filter-actions">
                <el-button size="small" link @click="includeUnreachable = !includeUnreachable">
                  {{ includeUnreachable ? '恢复仅展示可达结果' : '临时包含不可达结果（仅调试）' }}
                </el-button>
              </div>
            </div>
          </div>
        </template>
        <span v-else class="search-page__summary-empty">
          No results for "<strong>{{ query }}</strong>"
          <span v-if="searchMs !== null" class="search-page__summary-time"> — searched in {{ searchMs }}ms</span>
        </span>
      </div>

      <!-- Distribution Bar -->
      <div v-if="totalResults > 0 && !activeTypeFilter" class="search-page__distro">
        <button
          v-for="seg in distribution"
          :key="seg.type"
          class="search-page__distro-seg"
          :style="{ width: seg.pct + '%', background: seg.color }"
          :title="`${seg.label}: ${seg.count}`"
          @click="activeTypeFilter = seg.type"
        />
      </div>

      <!-- Active Filter Indicator -->
      <div v-if="activeTypeFilter" class="search-page__filter-active">
        Show: <strong>{{ groupConfigs[activeTypeFilter]?.label }}</strong>
        <button class="search-page__filter-clear" @click="activeTypeFilter = ''">× Clear</button>
      </div>

      <!-- No Results with Actions -->
      <div v-if="totalResults === 0" class="search-page__no-results">
        <p class="search-page__no-results-text">Try a different term, or jump to:</p>
        <div class="search-page__no-results-links">
          <a v-for="ql in noResultsActions" :key="ql.path" class="search-page__no-results-link" :href="'#' + ql.path">
            <el-icon :size="14"><component :is="ql.icon" /></el-icon>
            <span>{{ ql.label }}</span>
          </a>
        </div>
      </div>

      <!-- Result Groups -->
      <TransitionGroup name="group">
        <div v-for="group in sortedGroups" :key="group.type" class="search-page__group">
          <button class="search-page__group-head" @click="toggleGroup(group.type)">
            <div class="search-page__group-label">
              <el-icon :size="12" class="search-page__group-chevron" :class="{ 'is-open': !collapsedGroups.has(group.type) }">
                <ArrowRight />
              </el-icon>
              <span class="search-page__group-dot" :style="{ background: group.color }" />
              <component :is="group.icon" :size="14" />
              <span class="search-page__group-title">{{ group.label }}</span>
            </div>
            <span class="search-page__group-count">{{ group.items.length }}</span>
          </button>

          <TransitionGroup v-show="!collapsedGroups.has(group.type)" name="item" tag="div" class="search-page__group-items">
            <a
              v-for="item in group.items"
              :key="item.id"
              :ref="el => setItemRef(el, item._idx)"
              :class="[
                'search-page__item',
                {
                  'is-active': activeIdx === item._idx,
                  'search-page__item--ghost': !item._gateA.ok
                }
              ]"
              :style="{ '--accent': group.color }"
              :href="'#' + (item._gateA.ok ? item._link : item._gateA.fallback)"
              :aria-disabled="!item._gateA.ok ? 'true' : undefined"
              @click.prevent="goTo(item)"
              @mouseenter="activeIdx = item._idx"
            >
              <div class="search-page__item-icon" :style="{ background: group.color }">
                <el-icon :size="14"><component :is="group.icon" /></el-icon>
              </div>
              <div class="search-page__item-body">
                <div class="search-page__item-title">
                  <span v-html="highlight(item.title)" />
                  <span class="search-page__item-key">{{ item.key || extractKey(item.id) }}</span>
                  <span v-if="item.score != null" class="search-page__item-score">{{ Math.round(item.score) }}%</span>
                  <LinkValidationBadge
                    v-if="!item._gateA.ok"
                    class="search-page__item-gate-badge"
                    :gate-a="item._gateA"
                  />
                </div>
                <div class="search-page__item-meta">
                  <code v-if="item.project">{{ item.project }}</code>
                  <span v-if="item.subtitle" class="search-page__item-subtitle">{{ item.subtitle }}</span>
                </div>
                <div class="search-page__item-badges">
                  <el-tag
                    v-for="b in (item.badges || [])"
                    :key="b.label"
                    :type="b.type || undefined"
                    size="small"
                    :effect="b.effect || 'plain'"
                    :disable-transitions="true"
                  >
                    {{ b.label }}
                  </el-tag>
                  <span v-if="item._status && item._status !== 'active'" class="search-page__item-status">
                    状态：{{ item._status }}
                  </span>
                  <span v-if="item.date" class="search-page__item-date">{{ formatDate(item.date) }}</span>
                </div>
                <div v-if="item.detail" class="search-page__item-detail" v-html="highlight(truncate(item.detail, 140))" />
              </div>
              <el-icon v-if="activeIdx === item._idx && item._gateA.ok" class="search-page__item-enter" :size="14"><ArrowRight /></el-icon>
            </a>
          </TransitionGroup>
        </div>
      </TransitionGroup>
    </div>

    <!-- Empty State (no query) -->
    <div v-else class="search-page__empty">
      <div class="search-page__empty-icon">
        <el-icon :size="40"><Search /></el-icon>
      </div>
      <p class="search-page__scope">
        Search across <strong>{{ typeFilters.length }}</strong> collections
        <template v-if="projectStore.projects.length"> in <strong>{{ projectStore.projects.length }}</strong> projects</template>
      </p>

      <!-- Example Searches -->
      <div v-if="exampleSearches.length" class="search-page__examples">
        <div class="search-page__recent-title">Try searching for</div>
        <div class="search-page__examples-list">
          <button
            v-for="ex in exampleSearches"
            :key="ex"
            class="search-page__example-chip"
            @click="searchRecent(ex)"
          >
            {{ ex }}
          </button>
        </div>
      </div>

      <!-- Recent Searches -->
      <div v-if="recentSearches.length" class="search-page__recent">
        <div class="search-page__recent-head">
          <span class="search-page__recent-title">Recent</span>
          <button class="search-page__recent-clear" @click="clearRecent">Clear all</button>
        </div>
        <div class="search-page__recent-list">
          <span v-for="(rs, i) in recentSearches" :key="i" class="search-page__recent-item">
            <el-icon :size="14" class="search-page__recent-clock"><Clock /></el-icon>
            <span class="search-page__recent-text" @click="searchRecent(rs)">{{ rs }}</span>
            <button class="search-page__recent-remove" @click="removeRecent(i)" title="Remove">
              <el-icon :size="12"><Close /></el-icon>
            </button>
          </span>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="search-page__quick-links">
        <div class="search-page__recent-title">Quick Navigation</div>
        <div class="search-page__quick-grid">
          <a v-for="ql in quickLinks" :key="ql.path" class="search-page__quick-card" :href="'#' + ql.path">
            <el-icon :size="18"><component :is="ql.icon" /></el-icon>
            <span>{{ ql.label }}</span>
          </a>
        </div>
      </div>

      <p class="search-page__hint">Press <kbd>/</kbd> or <kbd>⌘</kbd> + <kbd>K</kbd> from anywhere to focus search</p>
    </div>
  </div>
</template>

<script setup lang="ts" name="globalSearch">
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";
import { ElNotification } from "element-plus";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import LinkValidationBadge from "@/components/CommandPalette/LinkValidationBadge.vue";
import { useDateFilter } from "@/hooks/useDateFilter";
import useUnifiedSearch from "@/composables/useUnifiedSearch";
import {
  resolveLink,
  gateBEntityExists,
  gateCPostNavigate,
  type LinkResolveOk,
} from "@/utils/linkFactory";
import {
  Search,
  CircleClose,
  Close,
  ArrowRight,
  Clock,
  Plus,
  Tickets,
  Folder,
  Box,
  WarningFilled,
  Document,
  Collection,
  Loading
} from "@element-plus/icons-vue";
import type { UnifiedSearchItem } from "@/api/modules/searchService";
import { useProjectStore } from "@/stores/modules/project";
import { useCommandPaletteStore } from "@/stores/command-palette";

const RECENT_KEY = "global_search_recent";
const MAX_RECENT = 8;

type SearchItemEnriched = UnifiedSearchItem & {
  _idx: number;
  _gateA: ReturnType<typeof resolveLink>;
  _link: string;
};

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();
const cpStore = useCommandPaletteStore();

// ── State ──
const query = ref("");
const inputFocused = ref(false);
const searchError = ref<string | null>(null);
const searchMs = ref<number | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const itemRefs: Record<number, HTMLElement> = {};
const activeTypeFilter = ref("");
const activeIdx = ref(-1);
const sortBy = ref<"relevance" | "recent">("relevance");
const projectFilter = ref("");
const collapsedGroups = reactive(new Set<string>());
const showSuggestions = ref(false);
const suggestionIdx = ref(-1);
const includeUnreachable = ref(false);        // 临时：展示 Gate A 失败的灰卡（默认不展示）
const showFilterDetail = ref(false);

/* ── SSOT 搜索：useUnifiedSearch（v2 contract） ───────────────────────── */
const {
  results: _rawResults,
  loading: searching,
  error: usError,
  timing: usTiming,
  meta: usMeta,
  refresh,
} = useUnifiedSearch(query as any, {
  collections: [],
  limit: 40,
  debounceMs: 200,
  timeoutMs: 15_000,
  immediate: false,
});

// 同步搜索错误到 searchError（供 UI 展示）
watch(
  [() => usError.value, searching],
  ([err, l]) => {
    searchError.value = l ? null : (err ? String(err) : null);
    if (l) searchMs.value = null;
  },
  { immediate: true }
);
watch(
  () => usTiming.value?.total_ms ?? null,
  (ms) => {
    if (typeof ms === "number") searchMs.value = Math.round(ms);
  },
  { immediate: true }
);

// ── Date filter ──
const filterDate = ref<Date | null>(null);
const {
  label: filterDateLabel,
  isToday: isFilterToday,
  goToPrevDay,
  goToNextDay,
  goToFilterToday,
  clearFilterDate
} = useDateFilter(filterDate);

// ── URL sync ──
const initialQ = (route.query.q as string) || "";
if (initialQ) {
  query.value = initialQ;
}

watch(query, val => {
  const q = val.trim();
  if (q && q !== ((route.query.q as string) || "")) {
    router.replace({ query: { ...route.query, q } }).catch(() => {});
  } else if (!q && route.query.q) {
    router.replace({ query: { ...route.query, q: undefined } }).catch(() => {});
  }
});

// ── Project options ──
const projectOptions = computed(() => projectStore.projects.map(p => ({ key: p.key, name: p.name })));

// ── Type config ──
const typeFilters = [
  { key: "issue", label: "Issues", icon: Tickets },
  { key: "project", label: "Projects", icon: Folder },
  { key: "module", label: "Modules", icon: Collection },
  { key: "bug", label: "Bugs", icon: WarningFilled },
  { key: "page", label: "Pages", icon: Document }
];

const groupConfigs: Record<string, { label: string; icon: any; color: string }> = {
  issue:   { label: "Issues",   icon: Tickets,      color: "#409eff" },
  project: { label: "Projects", icon: Folder,       color: "#5470c6" },
  module:  { label: "Modules",  icon: Collection,   color: "#9b59b6" },
  bug:     { label: "Bugs",     icon: WarningFilled,color: "#f56c6c" },
  page:    { label: "Pages",    icon: Document,     color: "#67c23a" },
};

const quickLinks = [
  { label: "Issues",   icon: Tickets,      path: "/issue" },
  { label: "Projects", icon: Folder,       path: "/project" },
  { label: "Kanban",   icon: Box,          path: "/kanban" },
  { label: "Pages",    icon: Document,     path: "/page" },
  { label: "Bugs",     icon: WarningFilled,path: "/bug" },
  { label: "Modules",  icon: Collection,   path: "/module" }
];

const exampleSearches = ["login bug", "API performance", "user dashboard", "deployment error", "database schema"];

const noResultsActions = [
  { label: "New Issue", icon: Plus, path: "/issue" },
  { label: "New Bug",   icon: Plus, path: "/bug" },
  { label: "All Issues", icon: Tickets, path: "/issue" },
  { label: "All Bugs",   icon: WarningFilled, path: "/bug" },
  { label: "All Pages",  icon: Document, path: "/page" }
];

// ── Suggestions ──
const suggestionItems = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return recentSearches.value.slice(0, 8);
  return recentSearches.value.filter(r => r.toLowerCase().includes(q)).slice(0, 8);
});

function onInput() {
  suggestionIdx.value = -1;
  showSuggestions.value = true;
  searchError.value = null;
}

function pickSuggestion(s: string) {
  query.value = s;
  showSuggestions.value = false;
}

function highlightSuggestion(text: string): string {
  const q = query.value.trim();
  if (!q) return escapeHtml(text);
  const qe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escapeHtml(text).replace(new RegExp(`(${qe})`, "gi"), "<mark>$1</mark>");
}

// ── Recent Searches ──
const recentSearches = ref<string[]>(loadRecent());

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  const list = loadRecent().filter(r => r !== q);
  list.unshift(q);
  if (list.length > MAX_RECENT) list.length = MAX_RECENT;
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  recentSearches.value = list;
}

function clearRecent() {
  localStorage.removeItem(RECENT_KEY);
  recentSearches.value = [];
}

function removeRecent(idx: number) {
  const list = loadRecent();
  list.splice(idx, 1);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  recentSearches.value = list;
}

function searchRecent(q: string) {
  query.value = q;
  showSuggestions.value = false;
}

// 当搜索成功返回非空时记一次 recent
watch(
  [() => (_rawResults.value || []).length, () => query.value, searching],
  ([len, q, loading]) => {
    if (!loading && len > 0 && q) saveRecent(String(q).trim());
  }
);

// ── Results: Gate A + filter/sort ────────────────────────────────────────
const ghostFilteredCount = computed(() => usMeta.value?.ghost_filtered_count ?? 0);

const enrichedResults = computed<SearchItemEnriched[]>(() => {
  const list: UnifiedSearchItem[] = (_rawResults.value as any) || [];
  return list
    .filter(Boolean)
    .map((item: any) => {
      const gateA = resolveLink({
        type: item.type,
        key: item.key,
        project: item.project,
        title: item.title,
      });
      return {
        ...item,
        _gateA: gateA,
        _link: gateA.ok ? (gateA as LinkResolveOk).link : "",
        _idx: -1,
      } as SearchItemEnriched;
    });
});

const autoFilteredCount = computed<number>(() => {
  return enrichedResults.value.reduce((n, it) => n + (it._gateA.ok ? 0 : 1), 0);
});

const filteredResults = computed<SearchItemEnriched[]>(() => {
  let results = enrichedResults.value;
  // Gate A：默认过滤所有不可达结果（用户显式 includeUnreachable 才显示灰卡）
  if (!includeUnreachable.value) results = results.filter(r => r._gateA.ok);
  if (projectFilter.value) {
    results = results.filter(item => item.project === projectFilter.value);
  }
  if (activeTypeFilter.value) {
    results = results.filter(item => item.type === activeTypeFilter.value);
  }
  return results;
});

const typeCounts = computed(() => {
  const counts: Record<string, number> = {};
  enrichedResults.value.forEach(item => {
    if (!includeUnreachable.value && !item._gateA.ok) return;
    counts[item.type] = (counts[item.type] || 0) + 1;
  });
  return counts;
});

const distribution = computed(() => {
  const total = enrichedResults.value.filter(r => includeUnreachable.value || r._gateA.ok).length;
  if (!total) return [];
  return ["issue", "project", "module", "bug", "page"]
    .map(type => ({ type, count: typeCounts.value[type] || 0 }))
    .filter(s => s.count > 0)
    .map(s => {
      const cfg = groupConfigs[s.type];
      return { ...s, label: cfg.label, color: cfg.color, pct: Math.max((s.count / total) * 100, 2) };
    });
});

const resultGroups = computed(() => {
  const groups: Record<string, SearchItemEnriched[]> = {};
  filteredResults.value.forEach(item => {
    (groups[item.type] ||= []).push(item);
  });

  return ["issue", "project", "module", "bug", "page"]
    .map(type => ({ ...groupConfigs[type], type, items: groups[type] || [] }))
    .filter(g => g.items.length > 0);
});

const sortedGroups = computed(() => {
  return resultGroups.value.map(g => {
    const items = [...g.items];
    if (sortBy.value === "recent") {
      items.sort((a, b) => (b._ts || 0) - (a._ts || 0));
    } else {
      items.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    return { ...g, items };
  });
});

const totalResults = computed(() => filteredResults.value.length);

function flattenItems(): SearchItemEnriched[] {
  const items: SearchItemEnriched[] = [];
  sortedGroups.value.forEach(g => {
    if (!collapsedGroups.has(g.type)) items.push(...g.items);
  });
  return items;
}

function setItemRef(el: any, idx: number) {
  if (el) itemRefs[idx] = el;
}

watch([sortedGroups, sortBy], () => {
  const flat = flattenItems();
  flat.forEach((item, i) => {
    item._idx = i;
  });
  activeIdx.value = flat.length > 0 ? 0 : -1;
}, { immediate: true, flush: "post" });

function scrollToActive() {
  nextTick(() => {
    itemRefs[activeIdx.value]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

function toggleGroup(type: string) {
  if (collapsedGroups.has(type)) collapsedGroups.delete(type);
  else collapsedGroups.add(type);
}

// ── 三闸门导航 goTo：与命令面板共用同一套 Gold Copy ───────────────────
async function goTo(item: SearchItemEnriched) {
  // Gate A
  if (!item._gateA.ok) {
    try {
      ElNotification({
        title: "无法跳转",
        message: `${item._gateA.message}（${item._gateA.reason}）`,
        type: "warning",
        duration: 3000,
      });
    } catch { /* noop */ }
    router.push(item._gateA.fallback).catch(() => {});
    return;
  }
  const gateA = item._gateA as LinkResolveOk;
  const link = gateA.link;

  // Gate B
  const needGateB = ["issue", "bug", "project", "module", "page"].includes(item.type as string);
  if (needGateB) {
    try {
      const exist = await gateBEntityExists(
        { type: item.type, key: item.key, project: item.project, title: item.title },
        { timeoutMs: 1500 }
      );
      if (exist === false) {
        try {
          ElNotification({
            title: "目标资源暂不可用",
            message: `${item.title}（${item.type}: ${item.key}）在后端 HEAD 预检不存在，已为您跳转至搜索页。`,
            type: "warning",
            duration: 3000,
          });
        } catch { /* noop */ }
        router.push(`/search?q=${encodeURIComponent(item.title || item.key || "")}`).catch(() => {});
        return;
      }
    } catch {
      /* 网络异常：Gate C 兜底 */
    }
  }

  try { await router.push(link); }
  catch (err: any) {
    if (err?.name !== "NavigationDuplicated") {
      try {
        ElNotification({
          title: "路由异常",
          message: err?.message || "跳转失败，已跳回搜索页。",
          type: "warning",
          duration: 3000,
        });
      } catch { /* noop */ }
      router.push(`/search?q=${encodeURIComponent(item.title || item.key || "")}`).catch(() => {});
    }
    return;
  }

  // Gate C：2s 后验，成功 → MRU v2；失败 → 回退搜索页
  const cPass = await gateCPostNavigate({
    expectedLink: link,
    expectedParams: gateA.params,
    timeoutMs: 2000,
  });
  if (cPass) {
    cpStore.pushMRU({
      id: item.id, type: item.type, key: item.key, title: item.title,
      project: item.project, ts: Date.now(),
    });
  } else {
    try {
      ElNotification({
        title: "未成功到达目标页",
        message: `${item.title} 的详情页渲染未在预期时间内完成。可能已归档/删除；已跳回搜索页搜索。`,
        type: "warning",
        duration: 3000,
      });
    } catch { /* noop */ }
    router.push(`/search?q=${encodeURIComponent(item.title || item.key || "")}`).catch(() => {});
  }
}

// ── Utilities ──
function clearSearch() {
  query.value = "";
  activeTypeFilter.value = "";
  projectFilter.value = "";
  activeIdx.value = -1;
  searchMs.value = null;
  searchError.value = null;
  collapsedGroups.clear();
  showFilterDetail.value = false;
  includeUnreachable.value = false;
  inputRef.value?.focus();
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(text: string | undefined): string {
  if (!text || !query.value) return text || "";
  const escaped = escapeHtml(text);
  const q = query.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(new RegExp(`(${q})`, "gi"), "<mark>$1</mark>");
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function extractKey(id: string): string {
  const parts = id.split("-");
  return parts.length > 1 ? parts.slice(1).join("-") : id;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return dateStr;
  } catch {
    return dateStr;
  }
}

// ── Keyboard ──
function onInputKeydown(e: KeyboardEvent) {
  // Suggestions navigation
  if (showSuggestions.value && suggestionItems.value.length) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      suggestionIdx.value = (suggestionIdx.value + 1) % suggestionItems.value.length;
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      suggestionIdx.value = (suggestionIdx.value - 1 + suggestionItems.value.length) % suggestionItems.value.length;
      return;
    }
    if (e.key === "Enter" && suggestionIdx.value >= 0) {
      e.preventDefault();
      pickSuggestion(suggestionItems.value[suggestionIdx.value]);
      return;
    }
  }

  // Results navigation
  const flat = flattenItems();
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (flat.length > 0) {
      activeIdx.value = (activeIdx.value + 1) % flat.length;
      scrollToActive();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (flat.length > 0) {
      activeIdx.value = (activeIdx.value - 1 + flat.length) % flat.length;
      scrollToActive();
    }
  } else if (e.key === "Enter" && !(showSuggestions.value && suggestionIdx.value >= 0)) {
    e.preventDefault();
    const item = flat[activeIdx.value];
    if (item) goTo(item);
  } else if (e.key === "Escape") {
    if (showSuggestions.value) {
      showSuggestions.value = false;
    } else if (query.value) {
      clearSearch();
    } else {
      inputRef.value?.blur();
    }
  }
}

function globalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    inputRef.value?.focus();
    return;
  }
  // "/" shortcut — only when not already typing in an input
  if (e.key === "/" && !isEditingInput(e.target as HTMLElement)) {
    e.preventDefault();
    inputRef.value?.focus();
  }
}

function isEditingInput(el: HTMLElement | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return (el as HTMLElement).isContentEditable ?? false;
}

const SCROLL_KEY = "global_search_scroll";

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (showSuggestions.value && !target.closest(".search-page__suggestions") && !target.closest(".search-page__input-wrap")) {
    showSuggestions.value = false;
  }
}

function saveScrollPosition() {
  const el = document.querySelector(".search-page");
  if (el) sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop));
}

function restoreScrollPosition() {
  const saved = sessionStorage.getItem(SCROLL_KEY);
  if (saved) {
    nextTick(() => {
      const el = document.querySelector(".search-page");
      if (el) el.scrollTop = Number(saved);
    });
    sessionStorage.removeItem(SCROLL_KEY);
  }
}

onMounted(() => {
  if (!initialQ) {
    inputRef.value?.focus();
  } else {
    // 注意：useUnifiedSearch 此处传了 immediate=false（避免与详情页回跳产生重复请求对撞），
    // 但 URL 直接带 q 的首次进入仍需显式触发一次搜索（watch 的 post flush 与同步 query.value
    // 赋值在同 tick 里可能被 scheduler 合并成 no-op，因此 refresh() 兜底显式驱动）。
    void refresh();
    restoreScrollPosition();
  }
  document.addEventListener("keydown", globalKeydown);
  document.addEventListener("mousedown", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("keydown", globalKeydown);
  document.removeEventListener("mousedown", onClickOutside);
});

onBeforeRouteLeave((_to, _from, next) => {
  saveScrollPosition();
  next();
});
</script>

<style scoped lang="scss">
@use "./styles/search.scss";
</style>