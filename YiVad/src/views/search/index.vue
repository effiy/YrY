<template>
  <div class="search-page">
    <div class="search-page__head">
      <h1 class="search-page__title">Search</h1>
      <el-input
        v-model="query"
        placeholder="Search issues, projects, cycles, pages..."
        :prefix-icon="SearchIcon"
        size="large"
        clearable
        @input="debouncedSearch"
        @keydown.enter="doSearch"
      />
    </div>

    <div v-if="query && !searching" class="search-page__results">
      <div class="search-page__summary">
        <span v-if="totalResults">{{ totalResults }} results for "{{ query }}"</span>
        <span v-else>No results for "{{ query }}"</span>
      </div>

      <div v-for="group in resultGroups" :key="group.type" class="search-page__group">
        <div class="search-page__group-head">
          <span class="search-page__group-title">{{ group.label }}</span>
          <el-tag size="small" round>{{ group.items.length }}</el-tag>
        </div>
        <div
          v-for="item in group.items"
          :key="item.id"
          class="search-page__item"
          @click="goTo(item.link)"
        >
          <div class="search-page__item-icon" :style="{ background: group.color }">
            <el-icon :size="14"><component :is="group.icon" /></el-icon>
          </div>
          <div class="search-page__item-content">
            <div class="search-page__item-title" v-html="highlight(item.title)" />
            <div class="search-page__item-meta">
              <code>{{ item.project }}</code>
              <span>{{ item.subtitle }}</span>
            </div>
            <div v-if="item.detail" class="search-page__item-detail" v-html="highlight(item.detail)" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!query" class="search-page__empty">
      <el-empty description="Type to search across all modules" :image-size="80" />
    </div>
  </div>
</template>

<script setup lang="ts" name="globalSearch">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Search as SearchIcon, Tickets, Folder, Calendar, Refresh, Document, Collection } from "@element-plus/icons-vue";
import { getIssueList } from "@/api/modules/issueService";
import { getCycleList } from "@/api/modules/cycleService";
import { getModuleList } from "@/api/modules/moduleService";
import { getPageList } from "@/api/modules/pageService";
import { useProjectStore } from "@/stores/modules/project";
import type { Issue } from "@/api/modules/issueService";
import type { Cycle } from "@/api/modules/cycleService";
import type { Module } from "@/api/modules/moduleService";
import type { Page } from "@/api/modules/pageService";

const router = useRouter();
const projectStore = useProjectStore();

const query = ref("");
const searching = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  detail?: string;
  project: string;
  link: string;
}

interface ResultGroup {
  type: string;
  label: string;
  icon: any;
  color: string;
  items: SearchItem[];
}

const allResults = ref<SearchItem[]>([]);

const resultGroups = computed<ResultGroup[]>(() => {
  const items = allResults.value;
  const groups: Record<string, SearchItem[]> = { issue: [], project: [], cycle: [], module: [], page: [] };

  items.forEach(item => {
    const type = item.id.split("-")[0].toLowerCase();
    const key = type === "iss" ? "issue" : type === "proj" ? "project" : type === "cyc" ? "cycle" : type === "mod" ? "module" : "page";
    if (groups[key]) groups[key].push(item);
    else groups["page"].push(item);
  });

  const configs: Array<{ type: string; label: string; icon: any; color: string }> = [
    { type: "issue", label: "Issues", icon: Tickets, color: "#409eff" },
    { type: "project", label: "Projects", icon: Folder, color: "#67c23a" },
    { type: "cycle", label: "Cycles", icon: Calendar, color: "#e6a23c" },
    { type: "module", label: "Modules", icon: Collection, color: "#9b59b6" },
    { type: "page", label: "Pages", icon: Document, color: "#909399" }
  ];

  return configs
    .map(c => ({ ...c, items: groups[c.type] || [] }))
    .filter(g => g.items.length > 0);
});

const totalResults = computed(() => allResults.value.length);

function debouncedSearch() {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!query.value.trim()) {
    allResults.value = [];
    return;
  }
  debounceTimer = setTimeout(doSearch, 300);
}

async function doSearch() {
  const q = query.value.trim();
  if (!q) {
    allResults.value = [];
    return;
  }
  searching.value = true;

  try {
    const results: SearchItem[] = [];

    // Search projects
    if (projectStore.projects.length) {
      projectStore.projects.forEach(p => {
        if (p.name.toLowerCase().includes(q.toLowerCase()) || p.identifier.toLowerCase().includes(q.toLowerCase())) {
          results.push({
            id: `proj-${p.key}`,
            title: p.name,
            subtitle: p.identifier,
            detail: p.description,
            project: p.key,
            link: `/project/${p.key}`
          });
        }
      });
    }

    // Search issues
    try {
      const issueRes = await getIssueList({ search: q, pageSize: 50 });
      const issues = (issueRes.data?.list as Issue[]) ?? [];
      issues.forEach(i => {
        results.push({
          id: `iss-${i.key}`,
          title: i.title,
          subtitle: `${i.issue_type} · ${i.status}`,
          detail: i.description,
          project: i.project_key,
          link: `/issue/${i.key}`
        });
      });
    } catch { /* ignore */ }

    // Search cycles
    try {
      const cycleRes = await getCycleList({ search: q, pageSize: 50 });
      const cycles = (cycleRes.data?.list as Cycle[]) ?? [];
      cycles.forEach(c => {
        results.push({
          id: `cyc-${c.key}`,
          title: c.name,
          subtitle: c.status,
          detail: c.goal,
          project: c.project_key,
          link: `/cycle/${c.key}`
        });
      });
    } catch { /* ignore */ }

    // Search modules
    try {
      const modRes = await getModuleList({ pageSize: 50 });
      const modules = (modRes.data?.list as Module[]) ?? [];
      modules.filter(m => m.name.toLowerCase().includes(q.toLowerCase()) || (m.description || "").toLowerCase().includes(q.toLowerCase()))
        .forEach(m => {
          results.push({
            id: `mod-${m.key}`,
            title: m.name,
            subtitle: m.status,
            detail: m.description,
            project: m.project_key,
            link: `/module/${m.key}`
          });
        });
    } catch { /* ignore */ }

    // Search pages
    try {
      const pageRes = await getPageList({ search: q, pageSize: 50 });
      const pages = (pageRes.data?.list as Page[]) ?? [];
      pages.forEach(p => {
        results.push({
          id: `pag-${p.key}`,
          title: p.title,
          subtitle: `${p.project_key}`,
          detail: p.content?.slice(0, 200),
          project: p.project_key,
          link: `/page`
        });
      });
    } catch { /* ignore */ }

    allResults.value = results;
  } finally {
    searching.value = false;
  }
}

function highlight(text: string | undefined): string {
  if (!text || !query.value) return text || "";
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const q = query.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(new RegExp(`(${q})`, "gi"), "<mark>$1</mark>");
}

function goTo(link: string) {
  router.push(link);
}
</script>

<style scoped lang="scss">
.search-page {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.search-page__head {
  max-width: 700px;
  margin-bottom: 24px;
}
.search-page__title { margin: 0 0 16px; font-size: 20px; font-weight: 600; }
.search-page__results {
  max-width: 700px;
}
.search-page__summary {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 20px;
}
.search-page__group {
  margin-bottom: 24px;
}
.search-page__group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.search-page__group-title {
  font-size: 14px;
  font-weight: 600;
}
.search-page__item {
  display: flex;
  gap: 12px;
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  &:hover {
    background: var(--el-fill-color-light);
  }
}
.search-page__item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.search-page__item-content {
  flex: 1;
  min-width: 0;
}
.search-page__item-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  :deep(mark) {
    background: var(--el-color-warning-light-5);
    color: inherit;
    padding: 0 2px;
    border-radius: 2px;
  }
}
.search-page__item-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  code {
    font-size: 11px;
    background: var(--el-fill-color);
    padding: 0 4px;
    border-radius: 3px;
  }
}
.search-page__item-detail {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  :deep(mark) {
    background: var(--el-color-warning-light-5);
    color: inherit;
    padding: 0 2px;
    border-radius: 2px;
  }
}
.search-page__empty {
  padding: 60px 0;
}
</style>