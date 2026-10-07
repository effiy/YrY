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
      <button class="search-page__error-retry" @click="doSearch">Retry</button>
    </div>

    <!-- Results -->
    <div v-else-if="query && !searching" class="search-page__results">
      <!-- Summary Bar -->
      <div class="search-page__summary">
        <template v-if="totalResults">
          <span class="search-page__summary-count">{{ totalResults }}</span>
          {{ totalResults === 1 ? 'result' : 'results' }} for "<strong>{{ query }}</strong>"
          <span v-if="searchMs !== null" class="search-page__summary-time">in {{ searchMs }}ms</span>
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
              :class="['search-page__item', { 'is-active': activeIdx === item._idx }]"
              :style="{ '--accent': group.color }"
              :href="'#' + item.link"
              @click.prevent="goTo(item.link)"
              @mouseenter="activeIdx = item._idx"
            >
              <div class="search-page__item-icon" :style="{ background: group.color }">
                <el-icon :size="14"><component :is="group.icon" /></el-icon>
              </div>
              <div class="search-page__item-body">
                <div class="search-page__item-title">
                  <span v-html="highlight(item.title)" />
                  <span class="search-page__item-key">{{ extractKey(item.id) }}</span>
                  <span v-if="item.score != null" class="search-page__item-score">{{ Math.round(item.score) }}%</span>
                </div>
                <div class="search-page__item-meta">
                  <code v-if="item.project">{{ item.project }}</code>
                  <span v-if="item.subtitle" class="search-page__item-subtitle">{{ item.subtitle }}</span>
                </div>
                <div class="search-page__item-badges">
                  <el-tag
                    v-for="b in item.badges"
                    :key="b.label"
                    :type="b.type || undefined"
                    size="small"
                    :effect="b.effect || 'plain'"
                    :disable-transitions="true"
                  >
                    {{ b.label }}
                  </el-tag>
                  <span v-if="item.date" class="search-page__item-date">{{ formatDate(item.date) }}</span>
                </div>
                <div v-if="item.detail" class="search-page__item-detail" v-html="highlight(truncate(item.detail, 140))" />
              </div>
              <el-icon v-if="activeIdx === item._idx" class="search-page__item-enter" :size="14"><ArrowRight /></el-icon>
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
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import { useDateFilter } from "@/hooks/useDateFilter";
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
import { unifiedSearch } from "@/api/modules/searchService";
import type { UnifiedSearchItem, UnifiedSearchBadge } from "@/api/modules/searchService";
import { useProjectStore } from "@/stores/modules/project";

const RECENT_KEY = "global_search_recent";
const MAX_RECENT = 8;

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();

// ── State ──
const query = ref("");
const inputFocused = ref(false);
const searching = ref(false);
const searchError = ref(false);
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
let abortController: AbortController | null = null;
let searchSeq = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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
  doSearch();
}

watch(query, val => {
  const q = val.trim();
  if (q && q !== ((route.query.q as string) || "")) {
    router.replace({ query: { q } });
  } else if (!q && route.query.q) {
    router.replace({ query: {} });
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
  issue: { label: "Issues", icon: Tickets, color: "#409eff" },
  project: { label: "Projects", icon: Folder, color: "#5470c6" },
  module: { label: "Modules", icon: Collection, color: "#9b59b6" },
  bug: { label: "Bugs", icon: WarningFilled, color: "#f56c6c" },
  page: { label: "Pages", icon: Document, color: "#67c23a" }
};

const quickLinks = [
  { label: "Issues", icon: Tickets, path: "/issue" },
  { label: "Projects", icon: Folder, path: "/project" },
  { label: "Kanban", icon: Box, path: "/kanban" },
  { label: "Pages", icon: Document, path: "/page" },
  { label: "Bugs", icon: WarningFilled, path: "/bug" },
  { label: "Modules", icon: Collection, path: "/module" }
];

const exampleSearches = ["login bug", "API performance", "user dashboard", "deployment error", "database schema"];

const noResultsActions = [
  { label: "New Issue", icon: Plus, path: "/issue" },
  { label: "New Bug", icon: Plus, path: "/bug" },
  { label: "All Issues", icon: Tickets, path: "/issue" },
  { label: "All Bugs", icon: WarningFilled, path: "/bug" },
  { label: "All Pages", icon: Document, path: "/page" }
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
  searchError.value = false;
  debouncedSearch();
}

function pickSuggestion(s: string) {
  query.value = s;
  showSuggestions.value = false;
  doSearch();
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
  doSearch();
}

// ── Results ──
const allResults = ref<UnifiedSearchItem[]>([]);

const filteredResults = computed(() => {
  let results = allResults.value;
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
  allResults.value.forEach(item => {
    counts[item.type] = (counts[item.type] || 0) + 1;
  });
  return counts;
});

const distribution = computed(() => {
  if (!allResults.value.length) return [];
  return ["issue", "project", "module", "bug", "page"]
    .map(type => ({ type, count: typeCounts.value[type] || 0 }))
    .filter(s => s.count > 0)
    .map(s => {
      const cfg = groupConfigs[s.type];
      return { ...s, label: cfg.label, color: cfg.color, pct: Math.max((s.count / allResults.value.length) * 100, 2) };
    });
});

const resultGroups = computed(() => {
  const groups: Record<string, UnifiedSearchItem[]> = {};
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
      items.sort((a, b) => b._ts - a._ts);
    } else {
      items.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    return { ...g, items };
  });
});

const totalResults = computed(() => filteredResults.value.length);

function flattenItems(): UnifiedSearchItem[] {
  const items: UnifiedSearchItem[] = [];
  sortedGroups.value.forEach(g => {
    if (!collapsedGroups.has(g.type)) items.push(...g.items);
  });
  return items;
}

function setItemRef(el: any, idx: number) {
  if (el) itemRefs[idx] = el;
}

watch([resultGroups, sortBy], () => {
  const flat = flattenItems();
  flat.forEach((item, i) => {
    item._idx = i;
  });
  activeIdx.value = flat.length > 0 ? 0 : -1;
});

function scrollToActive() {
  nextTick(() => {
    itemRefs[activeIdx.value]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

function toggleGroup(type: string) {
  if (collapsedGroups.has(type)) collapsedGroups.delete(type);
  else collapsedGroups.add(type);
}

// ── Search Logic ──
function debouncedSearch() {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!query.value.trim()) {
    allResults.value = [];
    activeIdx.value = -1;
    searchMs.value = null;
    searchError.value = false;
    return;
  }
  debounceTimer = setTimeout(doSearch, 200);
}

async function doSearch() {
  const q = query.value.trim();
  if (!q) {
    allResults.value = [];
    searchMs.value = null;
    return;
  }

  // Cancel previous request
  if (abortController) abortController.abort();
  abortController = new AbortController();

  const seq = ++searchSeq;
  searching.value = true;
  searchError.value = false;
  activeTypeFilter.value = "";
  projectFilter.value = "";
  collapsedGroups.clear();
  showSuggestions.value = false;
  const t0 = performance.now();

  try {
    const data = await unifiedSearch(q, undefined, 40, abortController.signal);
    if (seq !== searchSeq) return;

    allResults.value = data.results || [];
    searchMs.value = data.timing?.total_ms ?? Math.round(performance.now() - t0);

    if (allResults.value.length > 0) saveRecent(q);
  } catch (e: any) {
    if (e?.name === "AbortError") return;
    if (seq !== searchSeq) return;
    searchError.value = true;
    allResults.value = [];
    searchMs.value = null;
  } finally {
    if (seq === searchSeq) searching.value = false;
  }
}

// ── Utilities ──
function clearSearch() {
  query.value = "";
  allResults.value = [];
  activeTypeFilter.value = "";
  projectFilter.value = "";
  activeIdx.value = -1;
  searchMs.value = null;
  searchError.value = false;
  collapsedGroups.clear();
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

function goTo(link: string) {
  router.push(link);
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
    if (item) goTo(item.link);
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