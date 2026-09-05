<template>
  <div class="search-page">
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
        <div class="search-page__input-wrap">
          <el-icon class="search-page__input-icon" :size="18"><Search /></el-icon>
          <input
            ref="inputRef"
            v-model="query"
            class="search-page__input"
            placeholder="Search across issues, projects, bugs, pages..."
            @input="onInput"
            @focus="onInputFocus"
            @blur="onInputBlur"
            @keydown="onInputKeydown"
          />
          <el-icon v-if="query" class="search-page__clear" :size="16" @mousedown.prevent="clearSearch">
            <CircleClose />
          </el-icon>
          <kbd class="search-page__kbd">Ctrl K</kbd>
        </div>

        <!-- Suggestions Dropdown -->
        <Transition name="suggest">
          <div v-if="showSuggestions && suggestionItems.length" class="search-page__suggestions">
            <div class="search-page__suggestions-head">Recent searches</div>
            <button
              v-for="(s, i) in suggestionItems"
              :key="i"
              :class="['search-page__suggestion', { 'is-active': suggestionIdx === i }]"
              @mousedown.prevent="pickSuggestion(s)"
              @mouseenter="suggestionIdx = i"
            >
              <el-icon :size="14"><Clock /></el-icon>
              <span v-html="highlightSuggestion(s)" />
            </button>
          </div>
        </Transition>
      </div>

      <!-- Toolbar -->
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
            <option value="">All projects</option>
            <option v-for="p in projectOptions" :key="p.key" :value="p.key">{{ p.name }}</option>
          </select>
          <div class="search-page__sort">
            <button :class="['search-page__sort-btn', { 'is-active': sortBy === 'relevance' }]" @click="sortBy = 'relevance'">Relevance</button>
            <button :class="['search-page__sort-btn', { 'is-active': sortBy === 'recent' }]" @click="sortBy = 'recent'">Recent</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="searching" class="search-page__loading">
      <div v-for="i in 4" :key="i" class="search-page__skeleton">
        <div class="search-page__skeleton-icon" />
        <div class="search-page__skeleton-lines">
          <div class="search-page__skeleton-line w-50" />
          <div class="search-page__skeleton-line w-35" />
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-else-if="query && !searching" class="search-page__results">
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

      <div v-if="totalResults > 0 && !activeTypeFilter" class="search-page__distro">
        <button
          v-for="seg in distribution"
          :key="seg.type"
          class="search-page__distro-seg"
          :style="{ width: seg.pct + '%', background: seg.color }"
          :title="`${seg.label}: ${seg.count} — click to filter`"
          @click="activeTypeFilter = seg.type"
        />
      </div>
      <div v-if="activeTypeFilter" class="search-page__filter-active">
        Filtered by <strong>{{ groupConfigs[activeTypeFilter]?.label }}</strong>
        <button class="search-page__filter-clear" @click="activeTypeFilter = ''">Clear</button>
      </div>

      <div v-if="totalResults === 0" class="search-page__no-results">
        <p class="search-page__no-results-text">Try a different term, or create something new:</p>
        <div class="search-page__no-results-links">
          <a v-for="ql in noResultsActions" :key="ql.path" class="search-page__no-results-link" :href="'#' + ql.path">
            <el-icon :size="14"><component :is="ql.icon" /></el-icon>
            <span>{{ ql.label }}</span>
          </a>
        </div>
      </div>

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
                </div>
                <div class="search-page__item-meta">
                  <code v-if="item.project">{{ item.project }}</code>
                  <span v-if="item.subtitle" class="search-page__item-subtitle">{{ item.subtitle }}</span>
                </div>
                <div class="search-page__item-badges">
                  <el-tag
                    v-for="b in item.badges"
                    :key="b.label"
                    :type="b.type"
                    size="small"
                    :effect="b.effect || 'plain'"
                    :disable-transitions="true"
                  >
                    {{ b.label }}
                  </el-tag>
                  <span v-if="item.date" class="search-page__item-date">{{ item.date }}</span>
                </div>
                <div v-if="item.detail" class="search-page__item-detail" v-html="highlight(truncate(item.detail, 140))" />
              </div>
              <el-icon v-if="activeIdx === item._idx" class="search-page__item-enter" :size="14"><ArrowRight /></el-icon>
            </a>
          </TransitionGroup>
        </div>
      </TransitionGroup>
    </div>

    <!-- Empty State -->
    <div v-else class="search-page__empty">
      <div class="search-page__empty-icon">
        <el-icon :size="40"><Search /></el-icon>
      </div>
      <p class="search-page__scope">Searching <strong>7</strong> collections across <strong>{{ projectStore.projects.length || 'all' }}</strong> projects</p>

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

      <div class="search-page__quick-links">
        <div class="search-page__recent-title">Quick Navigation</div>
        <div class="search-page__quick-grid">
          <a v-for="ql in quickLinks" :key="ql.path" class="search-page__quick-card" :href="'#' + ql.path">
            <el-icon :size="18"><component :is="ql.icon" /></el-icon>
            <span>{{ ql.label }}</span>
          </a>
        </div>
      </div>

      <p class="search-page__hint">Press <kbd>Ctrl</kbd> + <kbd>K</kbd> from anywhere to focus search</p>
    </div>
  </div>
</template>

<script setup lang="ts" name="globalSearch">
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import { useDateFilter } from "@/hooks/useDateFilter";
import { Search, CircleClose, Close, ArrowRight, Clock, Plus, Tickets, Folder, Calendar, Box, WarningFilled, Document, Collection } from "@element-plus/icons-vue";
import { getIssueList, ISSUE_STATUS_MAP, ISSUE_TYPE_MAP, ISSUE_PRIORITY_MAP, issueStatusTag, issueTypeTag } from "@/api/modules/issueService";
import type { Issue, IssueStatus, IssuePriority, IssueType } from "@/api/modules/issueService";
import { getModuleList, MODULE_STATUS_MAP } from "@/api/modules/moduleService";
import type { Module, ModuleStatus } from "@/api/modules/moduleService";
import { getPageList } from "@/api/modules/pageService";
import type { Page } from "@/api/modules/pageService";
import { getBugList } from "@/api/modules/bug";
import type { BugDocument, BugSeverity, BugStatus } from "@/api/modules/bug";
import { useProjectStore } from "@/stores/modules/project";

const RECENT_KEY = "global_search_recent";
const MAX_RECENT = 6;

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();

// ── State ──
const query = ref("");

// ── Date filter ──
const filterDate = ref<Date | null>(null);
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);
const searching = ref(false);
const activeTypeFilter = ref("");
const activeIdx = ref(-1);
const sortBy = ref<"relevance" | "recent">("relevance");
const projectFilter = ref("");
const searchMs = ref<number | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const itemRefs: Record<number, HTMLElement> = {};
const collapsedGroups = reactive(new Set<string>());
const showSuggestions = ref(false);
const suggestionIdx = ref(-1);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let searchSeq = 0;
let blurTimer: ReturnType<typeof setTimeout> | null = null;

// ── URL sync ──
const initialQ = (route.query.q as string) || "";
if (initialQ) {
  query.value = initialQ;
  doSearch();
}

watch(query, (val) => {
  const q = val.trim();
  if (q && q !== (route.query.q as string || "")) {
    router.replace({ query: { q } });
  } else if (!q && route.query.q) {
    router.replace({ query: {} });
  }
});

// ── Project options ──
const projectOptions = computed(() => projectStore.projects.map(p => ({ key: p.key, name: p.name })));

// ── Suggestions ──
const suggestionItems = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return recentSearches.value.slice(0, 5);
  return recentSearches.value.filter(r => r.toLowerCase().includes(q)).slice(0, 5);
});

function onInput() {
  suggestionIdx.value = -1;
  showSuggestions.value = true;
  debouncedSearch();
}

function onInputFocus() {
  if (blurTimer) clearTimeout(blurTimer);
  if (!query.value || suggestionItems.value.length) {
    showSuggestions.value = true;
  }
}

function onInputBlur() {
  blurTimer = setTimeout(() => {
    showSuggestions.value = false;
  }, 150);
}

function pickSuggestion(s: string) {
  query.value = s;
  showSuggestions.value = false;
  doSearch();
}

function highlightSuggestion(text: string): string {
  const q = query.value.trim();
  if (!q) return text;
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const qe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(new RegExp(`(${qe})`, "gi"), "<mark>$1</mark>");
}

// ── Recent Searches ──
const recentSearches = ref<string[]>(loadRecent());

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
  catch { return []; }
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
  doSearch();
}

// ── Config ──
const typeFilters = [
  { key: "issue", label: "Issues", icon: Tickets },
  { key: "project", label: "Projects", icon: Folder },
  { key: "module", label: "Modules", icon: Collection },
  { key: "bug", label: "Bugs", icon: WarningFilled },
  { key: "page", label: "Pages", icon: Document },
];

const quickLinks = [
  { label: "Issues", icon: Tickets, path: "/issue" },
  { label: "Projects", icon: Folder, path: "/project" },
  { label: "Kanban", icon: Box, path: "/kanban" },
  { label: "Pages", icon: Document, path: "/page" },
  { label: "Bugs", icon: WarningFilled, path: "/bug" },
  { label: "Modules", icon: Collection, path: "/module" },
];

const noResultsActions = [
  { label: "New Issue", icon: Plus, path: "/issue" },
  { label: "New Bug", icon: Plus, path: "/bug" },
  { label: "Open Issues", icon: Tickets, path: "/issue" },
  { label: "Open Bugs", icon: WarningFilled, path: "/bug" },
  { label: "Open Pages", icon: Document, path: "/page" },
];

const groupConfigs: Record<string, { label: string; icon: any; color: string }> = {
  issue: { label: "Issues", icon: Tickets, color: "#409eff" },
  project: { label: "Projects", icon: Folder, color: "#5470c6" },
  module: { label: "Modules", icon: Collection, color: "#9b59b6" },
  bug: { label: "Bugs", icon: WarningFilled, color: "#f56c6c" },
  page: { label: "Pages", icon: Document, color: "#909399" },
};

function toggleGroup(type: string) {
  if (collapsedGroups.has(type)) collapsedGroups.delete(type);
  else collapsedGroups.add(type);
}

function extractKey(id: string): string {
  const parts = id.split("-");
  return parts.length > 1 ? parts.slice(1).join("-") : id;
}

// ── Badge helpers ──
type Badge = { label: string; type?: "primary" | "success" | "warning" | "danger" | "info"; effect?: "plain" | "dark" };

const BUG_SEVERITY_TAG: Record<BugSeverity, Badge["type"]> = {
  critical: "danger", major: "warning", minor: "info", trivial: undefined,
};
const BUG_STATUS_TAG: Record<BugStatus, Badge["type"]> = {
  open: "danger", in_progress: "warning", resolved: "success", closed: "info", rejected: "danger", reopened: "warning",
};
const MODULE_STATUS_TAG: Record<ModuleStatus, Badge["type"]> = {
  planned: "info", in_progress: "primary", completed: "success", cancelled: "danger",
};

function issueBadges(i: Issue): Badge[] {
  const badges: Badge[] = [];
  if (i.issue_type) badges.push({ label: ISSUE_TYPE_MAP[i.issue_type] || i.issue_type, type: issueTypeTag(i.issue_type) });
  if (i.status) badges.push({ label: ISSUE_STATUS_MAP[i.status] || i.status, type: issueStatusTag(i.status) });
  if (i.priority && i.priority !== "none") badges.push({ label: ISSUE_PRIORITY_MAP[i.priority] || i.priority, type: i.priority === "urgent" ? "danger" : i.priority === "high" ? "warning" : "info" });
  return badges;
}

function bugBadges(b: BugDocument): Badge[] {
  const badges: Badge[] = [];
  if (b.severity) badges.push({ label: b.severity, type: BUG_SEVERITY_TAG[b.severity], effect: "dark" });
  if (b.status) badges.push({ label: b.status.replace(/_/g, " "), type: BUG_STATUS_TAG[b.status] });
  if (b.priority) badges.push({ label: b.priority, type: b.priority === "p0" ? "danger" : b.priority === "p1" ? "warning" : "info" });
  return badges;
}



function moduleBadges(m: Module): Badge[] {
  return m.status ? [{ label: MODULE_STATUS_MAP[m.status] || m.status, type: MODULE_STATUS_TAG[m.status] }] : [];
}

// ── Relative time ──
const REL_TIME = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "narrow" });

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return REL_TIME.format(-mins, "minute");
  const hours = Math.floor(mins / 60);
  if (hours < 24) return REL_TIME.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  if (days < 30) return REL_TIME.format(-days, "day");
  const months = Math.floor(days / 30);
  return REL_TIME.format(-months, "month");
}

function dateFromTs(ts: number): string {
  return relativeTime(new Date(ts).toISOString());
}

// ── Data types ──
interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  detail?: string;
  project: string;
  link: string;
  badges: Badge[];
  date: string;
  _idx: number;
  _ts: number;
}

interface ResultGroup {
  type: string;
  label: string;
  icon: any;
  color: string;
  items: SearchItem[];
}

// ── Results ──
const allResults = ref<SearchItem[]>([]);

const filteredResults = computed(() => {
  if (!projectFilter.value) return allResults.value;
  return allResults.value.filter(item => item.project === projectFilter.value);
});

const typeCounts = computed(() => {
  const counts: Record<string, number> = {};
  filteredResults.value.forEach(item => {
    const type = classifyType(item.id);
    counts[type] = (counts[type] || 0) + 1;
  });
  return counts;
});

const distribution = computed(() => {
  const total = filteredResults.value.length;
  if (!total) return [];
  return ["issue", "project", "module", "bug", "page"]
    .map(type => ({ type, count: typeCounts.value[type] || 0 }))
    .filter(s => s.count > 0)
    .map(s => {
      const cfg = groupConfigs[s.type];
      return { ...s, label: cfg.label, color: cfg.color, pct: Math.max((s.count / total) * 100, 2) };
    });
});

function classifyType(id: string): string {
  const prefix = id.split("-")[0].toLowerCase();
  const map: Record<string, string> = { iss: "issue", proj: "project", mod: "module", bug: "bug", pag: "page" };
  return map[prefix] || "page";
}

const resultGroups = computed<ResultGroup[]>(() => {
  const groups: Record<string, SearchItem[]> = {};
  filteredResults.value.forEach(item => {
    const type = classifyType(item.id);
    (groups[type] ||= []).push(item);
  });

  return ["issue", "project", "module", "bug", "page"]
    .map(type => ({ ...groupConfigs[type], type, items: groups[type] || [] }))
    .filter(g => {
      if (activeTypeFilter.value && g.type !== activeTypeFilter.value) return false;
      return g.items.length > 0;
    });
});

const sortedGroups = computed(() => {
  return resultGroups.value.map(g => {
    const items = [...g.items];
    if (sortBy.value === "recent") items.sort((a, b) => b._ts - a._ts);
    return { ...g, items };
  });
});

const totalResults = computed(() => filteredResults.value.length);

function flattenItems(): SearchItem[] {
  const items: SearchItem[] = [];
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
  flat.forEach((item, i) => { item._idx = i; });
  activeIdx.value = flat.length > 0 ? 0 : -1;
});

function scrollToActive() {
  nextTick(() => {
    itemRefs[activeIdx.value]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

// ── Search ──
function debouncedSearch() {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!query.value.trim()) {
    allResults.value = [];
    activeIdx.value = -1;
    searchMs.value = null;
    return;
  }
  debounceTimer = setTimeout(doSearch, 250);
}

async function doSearch() {
  const q = query.value.trim();
  if (!q) { allResults.value = []; searchMs.value = null; return; }

  const seq = ++searchSeq;
  searching.value = true;
  activeTypeFilter.value = "";
  projectFilter.value = "";
  collapsedGroups.clear();
  showSuggestions.value = false;
  const t0 = performance.now();

  try {
    const results: SearchItem[] = [];
    const lower = q.toLowerCase();

    if (projectStore.projects.length) {
      projectStore.projects.forEach(p => {
        if (p.name.toLowerCase().includes(lower) || p.identifier.toLowerCase().includes(lower)) {
          results.push({
            id: `proj-${p.key}`, title: p.name, subtitle: p.identifier,
            detail: p.description, project: p.key, link: `/project/${p.key}`,
            badges: p.status === "archived" ? [{ label: "Archived", type: "info" }] : [{ label: "Active", type: "success" }],
            date: relativeTime(p.updated_at), _idx: 0, _ts: new Date(p.updated_at).getTime(),
          });
        }
      });
    }

    try {
      const issueRes = await getIssueList({ search: q, pageSize: 30 });
      if (seq !== searchSeq) return;
      (issueRes.data?.list as Issue[] ?? []).forEach(i => {
        results.push({
          id: `iss-${i.key}`, title: i.title,
          subtitle: [i.assignee, i.due_date ? `Due ${i.due_date}` : ""].filter(Boolean).join(" · ") || i.issue_type,
          detail: i.description, project: i.project_key, link: `/issue/${i.key}`,
          badges: issueBadges(i), date: relativeTime(i.updated_at), _idx: 0, _ts: new Date(i.updated_at).getTime(),
        });
      });
    } catch { /* ignore */ }
    if (seq !== searchSeq) return;

    try {
      const modRes = await getModuleList({ pageSize: 50 });
      if (seq !== searchSeq) return;
      (modRes.data?.list as Module[] ?? [])
        .filter(m => m.name.toLowerCase().includes(lower) || (m.description || "").toLowerCase().includes(lower))
        .forEach(m => {
          results.push({
            id: `mod-${m.key}`, title: m.name,
            subtitle: [m.lead ? `Lead: ${m.lead}` : "", m.issue_keys?.length ? `${m.issue_keys.length} issues` : ""].filter(Boolean).join(" · "),
            detail: m.description, project: m.project_key, link: `/module/${m.key}`,
            badges: moduleBadges(m), date: relativeTime(m.updated_at), _idx: 0, _ts: new Date(m.updated_at).getTime(),
          });
        });
    } catch { /* ignore */ }
    if (seq !== searchSeq) return;

    try {
      const pageRes = await getPageList({ search: q, pageSize: 30 });
      if (seq !== searchSeq) return;
      (pageRes.data?.list as Page[] ?? []).forEach(p => {
        results.push({
          id: `pag-${p.key}`, title: p.title, subtitle: p.project_key,
          detail: p.content?.slice(0, 200), project: p.project_key, link: `/page`,
          badges: [], date: relativeTime(p.updated_at), _idx: 0, _ts: new Date(p.updated_at).getTime(),
        });
      });
    } catch { /* ignore */ }
    if (seq !== searchSeq) return;

    if (seq !== searchSeq) return;

    try {
      const bugRes = await getBugList({ search: q, pageSize: 30 });
      if (seq !== searchSeq) return;
      (bugRes.data?.list as BugDocument[] ?? []).forEach(b => {
        results.push({
          id: `bug-${b.key}`, title: b.title,
          subtitle: [b.assignee ? `Assignee: ${b.assignee}` : "", b.module].filter(Boolean).join(" · "),
          detail: b.description, project: b.project_key || b.project, link: `/bug/${b.key}`,
          badges: bugBadges(b), date: dateFromTs(b.updatedAt), _idx: 0, _ts: b.updatedAt,
        });
      });
    } catch { /* ignore */ }
    if (seq !== searchSeq) return;

    allResults.value = results;
    searchMs.value = Math.round(performance.now() - t0);
    if (results.length > 0) saveRecent(q);
  } finally {
    if (seq === searchSeq) searching.value = false;
  }
}

// ── Actions ──
function clearSearch() {
  query.value = "";
  allResults.value = [];
  activeTypeFilter.value = "";
  projectFilter.value = "";
  activeIdx.value = -1;
  searchMs.value = null;
  collapsedGroups.clear();
  inputRef.value?.focus();
}

function highlight(text: string | undefined): string {
  if (!text || !query.value) return text || "";
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const q = query.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(new RegExp(`(${q})`, "gi"), "<mark>$1</mark>");
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function goTo(link: string) {
  router.push(link);
}

// ── Keyboard ──
function onInputKeydown(e: KeyboardEvent) {
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
  } else if (e.key === "Enter") {
    e.preventDefault();
    const item = flat[activeIdx.value];
    if (item) goTo(item.link);
  }
}

function globalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    inputRef.value?.focus();
  }
}

onMounted(() => {
  if (!initialQ) inputRef.value?.focus();
  document.addEventListener("keydown", globalKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", globalKeydown);
});
</script>

<style scoped lang="scss">
.search-page {
  max-width: 740px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  height: calc(100vh - 95px);
  overflow-y: auto;
}

// -- Input --
.search-page__head { margin-bottom: 24px; }
.search-page__input-area { position: relative; }
.search-page__input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus-within {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 3px var(--el-color-primary-light-8);
  }
}
.search-page__input-icon { color: var(--el-text-color-placeholder); flex-shrink: 0; }
.search-page__input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: var(--el-text-color-primary);
  &::placeholder { color: var(--el-text-color-placeholder); font-size: 15px; }
}
.search-page__clear {
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  flex-shrink: 0;
  padding: 4px;
  border-radius: 4px;
  &:hover { color: var(--el-text-color-secondary); background: var(--el-fill-color); }
}
.search-page__kbd {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--el-fill-color);
  color: var(--el-text-color-placeholder);
  font-family: ui-monospace, monospace;
  flex-shrink: 0;
}

// -- Suggestions dropdown --
.search-page__suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  overflow: hidden;
  z-index: 100;
}
.search-page__suggestions-head {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 10px 14px 6px;
}
.search-page__suggestion {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 14px;
  border: none;
  background: none;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  :deep(mark) { background: var(--el-color-warning-light-5); color: inherit; padding: 0 2px; border-radius: 2px; }
  &:hover, &.is-active { background: var(--el-fill-color-light); color: var(--el-text-color-primary); }
}
.suggest-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.suggest-leave-active { transition: opacity 0.1s ease; }
.suggest-enter-from { opacity: 0; transform: translateY(-4px); }
.suggest-leave-to { opacity: 0; }

// -- Toolbar --
.search-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}
.search-page__type-filters { display: flex; flex-wrap: wrap; gap: 6px; flex: 1; }
.search-page__filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  color: var(--el-text-color-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: var(--el-color-primary-light-5); color: var(--el-color-primary); }
  &.is-active { background: var(--el-color-primary-light-9); border-color: var(--el-color-primary); color: var(--el-color-primary); }
}
.search-page__filter-count {
  font-size: 11px;
  padding: 0 5px;
  border-radius: 10px;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  font-weight: 600;
  min-width: 18px;
  text-align: center;
  .is-active & { background: var(--el-color-primary); color: #fff; }
}

.search-page__toolbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.search-page__project-select {
  appearance: none;
  padding: 5px 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  cursor: pointer;
  max-width: 140px;
  outline: none;
  transition: border-color 0.15s;
  &:hover { border-color: var(--el-color-primary-light-5); }
  &:focus { border-color: var(--el-color-primary); }
}

.search-page__sort { display: flex; gap: 2px; background: var(--el-fill-color); border-radius: 8px; padding: 2px; flex-shrink: 0; }
.search-page__sort-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  &.is-active { background: var(--el-bg-color); color: var(--el-text-color-primary); box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
  &:hover:not(.is-active) { color: var(--el-text-color-secondary); }
}

// -- Loading --
.search-page__loading { display: flex; flex-direction: column; gap: 12px; }
.search-page__skeleton { display: flex; gap: 12px; padding: 12px; align-items: center; }
.search-page__skeleton-icon {
  width: 36px; height: 36px; border-radius: 8px; background: var(--el-fill-color);
  flex-shrink: 0; animation: pulse 1.5s ease-in-out infinite;
}
.search-page__skeleton-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.search-page__skeleton-line {
  height: 12px; border-radius: 4px; background: var(--el-fill-color); animation: pulse 1.5s ease-in-out infinite;
  &.w-50 { width: 50%; } &.w-35 { width: 35%; }
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

// -- Results --
.search-page__results { display: flex; flex-direction: column; gap: 16px; }
.search-page__summary {
  font-size: 13px; color: var(--el-text-color-secondary);
  strong { color: var(--el-text-color-primary); }
}
.search-page__summary-count { font-weight: 700; color: var(--el-color-primary); margin-right: 2px; }
.search-page__summary-time { font-size: 11px; color: var(--el-text-color-placeholder); margin-left: 6px; }
.search-page__summary-empty { color: var(--el-text-color-placeholder); }

// Distribution bar
.search-page__distro {
  display: flex; height: 6px; border-radius: 3px; overflow: hidden;
  background: var(--el-fill-color); gap: 1px; cursor: pointer;
}
.search-page__distro-seg {
  display: block; border: none; padding: 0; min-width: 2px; border-radius: 3px;
  transition: width 0.3s ease, opacity 0.15s; cursor: pointer;
  &:hover { opacity: 0.8; }
}
.search-page__filter-active {
  font-size: 12px; color: var(--el-text-color-secondary);
  display: flex; align-items: center; gap: 8px;
  strong { color: var(--el-text-color-primary); }
}
.search-page__filter-clear {
  font-size: 11px; color: var(--el-color-primary); background: none; border: none;
  cursor: pointer; padding: 0;
  &:hover { text-decoration: underline; }
}

// No results
.search-page__no-results { padding: 8px 0; }
.search-page__no-results-text { font-size: 13px; color: var(--el-text-color-secondary); margin: 0 0 12px; }
.search-page__no-results-links { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.search-page__no-results-link {
  display: flex; align-items: center; gap: 6px; padding: 8px 12px;
  border: 1px solid var(--el-border-color); border-radius: 8px;
  color: var(--el-text-color-secondary); font-size: 13px; text-decoration: none;
  transition: all 0.15s;
  &:hover { border-color: var(--el-color-primary-light-5); color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
}

// Group
.search-page__group { display: flex; flex-direction: column; }
.search-page__group-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 4px 8px; border: none; border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 4px; background: none; cursor: pointer; width: 100%;
  color: inherit; font-size: inherit; font-family: inherit;
  &:hover { .search-page__group-title { color: var(--el-text-color-primary); } }
}
.search-page__group-label {
  display: flex; align-items: center; gap: 8px;
  color: var(--el-text-color-secondary); font-size: 13px; font-weight: 600;
}
.search-page__group-chevron {
  color: var(--el-text-color-placeholder); transition: transform 0.2s; flex-shrink: 0;
  &.is-open { transform: rotate(90deg); }
}
.search-page__group-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.search-page__group-title { transition: color 0.15s; }
.search-page__group-count {
  font-size: 11px; color: var(--el-text-color-placeholder);
  background: var(--el-fill-color); padding: 1px 8px; border-radius: 10px;
}
.search-page__group-items { display: flex; flex-direction: column; }

// Item
.search-page__item {
  --accent: var(--el-border-color);
  display: flex; align-items: flex-start; gap: 12px; padding: 10px 8px 10px 10px;
  cursor: pointer; border-radius: 8px; transition: background 0.1s, box-shadow 0.15s;
  text-decoration: none; color: inherit;
  border-left: 3px solid transparent;
  &:hover {
    background: var(--el-bg-color);
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    border-left-color: var(--accent);
  }
  &.is-active {
    background: var(--el-color-primary-light-9);
    border-left-color: var(--accent);
  }
}
.search-page__item-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0; margin-top: 2px;
}
.search-page__item-body { flex: 1; min-width: 0; }
.search-page__item-title {
  font-size: 14px; font-weight: 500; line-height: 1.4;
  display: flex; align-items: baseline; gap: 6px;
  :deep(mark) { background: var(--el-color-warning-light-5); color: inherit; padding: 0 2px; border-radius: 2px; }
}
.search-page__item-key {
  font-size: 11px; color: var(--el-text-color-placeholder);
  font-family: ui-monospace, monospace; flex-shrink: 0;
  opacity: 0; transition: opacity 0.15s;
  .search-page__item:hover & { opacity: 1; }
}
.search-page__item-meta {
  display: flex; align-items: center; gap: 8px; margin-top: 3px;
  font-size: 12px; color: var(--el-text-color-placeholder);
  code { font-size: 11px; background: var(--el-fill-color); padding: 0 5px; border-radius: 3px; color: var(--el-text-color-secondary); }
}
.search-page__item-subtitle { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.search-page__item-badges {
  display: flex; align-items: center; gap: 5px; margin-top: 5px; flex-wrap: wrap;
}
.search-page__item-date { font-size: 11px; color: var(--el-text-color-placeholder); margin-left: auto; }
.search-page__item-detail {
  margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary); line-height: 1.5;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  :deep(mark) { background: var(--el-color-warning-light-5); color: inherit; padding: 0 2px; border-radius: 2px; }
}
.search-page__item-enter { color: var(--el-text-color-placeholder); flex-shrink: 0; margin-top: 10px; }

// -- Transitions --
.group-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.group-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.group-enter-from { opacity: 0; transform: translateY(-8px); }
.group-leave-to { opacity: 0; transform: translateY(-4px); }

.item-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.item-leave-active { transition: opacity 0.15s ease; }
.item-enter-from { opacity: 0; transform: translateX(-6px); }
.item-leave-to { opacity: 0; }

// -- Empty State --
.search-page__empty { display: flex; flex-direction: column; align-items: center; padding: 40px 0 0; gap: 20px; }
.search-page__empty-icon {
  width: 80px; height: 80px; border-radius: 20px; background: var(--el-fill-color-light);
  display: flex; align-items: center; justify-content: center; color: var(--el-text-color-placeholder);
}
.search-page__scope {
  font-size: 13px; color: var(--el-text-color-secondary); margin: 0;
  strong { color: var(--el-text-color-primary); }
}
.search-page__recent { width: 100%; max-width: 480px; }
.search-page__recent-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.search-page__recent-title {
  font-size: 12px; font-weight: 600; color: var(--el-text-color-placeholder);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.search-page__recent-clear {
  font-size: 12px; color: var(--el-text-color-placeholder); background: none; border: none; cursor: pointer;
  &:hover { color: var(--el-color-danger); }
}
.search-page__recent-list { display: flex; flex-wrap: wrap; gap: 6px; }
.search-page__recent-item {
  display: inline-flex; align-items: center; gap: 0;
  border: 1px solid var(--el-border-color); border-radius: 8px; background: var(--el-bg-color);
  color: var(--el-text-color-secondary); font-size: 13px; transition: all 0.15s;
  overflow: hidden;
  &:hover { border-color: var(--el-color-primary-light-5); }
}
.search-page__recent-clock { margin: 0 6px; color: var(--el-text-color-placeholder); flex-shrink: 0; }
.search-page__recent-text { padding: 6px 0; cursor: pointer; &:hover { color: var(--el-color-primary); } }
.search-page__recent-remove {
  display: flex; align-items: center; justify-content: center;
  width: 26px; align-self: stretch;
  border: none; background: none; color: var(--el-text-color-placeholder); cursor: pointer;
  border-left: 1px solid var(--el-border-color);
  &:hover { color: var(--el-color-danger); background: var(--el-color-danger-light-9); }
}
.search-page__quick-links { width: 100%; max-width: 480px; }
.search-page__quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px; }
.search-page__quick-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 8px;
  border: 1px solid var(--el-border-color); border-radius: 10px; background: var(--el-bg-color);
  color: var(--el-text-color-secondary); font-size: 12px; cursor: pointer; transition: all 0.15s;
  text-decoration: none;
  &:hover { border-color: var(--el-color-primary-light-5); color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
}
.search-page__hint {
  font-size: 12px; color: var(--el-text-color-placeholder); margin: 0;
  kbd { font-size: 11px; padding: 1px 5px; border-radius: 3px; background: var(--el-fill-color); font-family: ui-monospace, monospace; }
}
</style>