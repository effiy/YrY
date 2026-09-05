<template>
  <Teleport to="body">
    <div v-if="visible" class="cmd-palette-overlay" @click.self="close">
      <div class="cmd-palette">
        <div class="cmd-palette__input-wrap">
          <el-icon class="cmd-palette__search-icon"><Search /></el-icon>
          <input
            ref="inputRef"
            v-model="query"
            class="cmd-palette__input"
            placeholder="Search issues, projects, pages... or type a command"
            @keydown="onKeydown"
          />
          <kbd class="cmd-palette__kbd">Esc</kbd>
        </div>

        <div class="cmd-palette__results" v-if="query">
          <div v-for="group in resultGroups" :key="group.label">
            <div class="cmd-palette__group-label">{{ group.label }}</div>
            <div
              v-for="item in group.items"
              :key="item.id"
              class="cmd-palette__item"
              :class="{ 'cmd-palette__item--active': activeIdx === item._idx }"
              @click="select(item)"
              @mouseenter="activeIdx = item._idx"
            >
              <div class="cmd-palette__item-icon" :style="{ background: group.color }">
                <el-icon :size="14"><component :is="group.icon" /></el-icon>
              </div>
              <div class="cmd-palette__item-content">
                <div class="cmd-palette__item-title" v-html="highlight(item.title)" />
                <div class="cmd-palette__item-meta">{{ item.subtitle }}</div>
              </div>
              <kbd class="cmd-palette__item-kbd" v-if="item._idx === activeIdx">↵</kbd>
            </div>
          </div>
          <div v-if="!totalItems" class="cmd-palette__empty">No results for "{{ query }}"</div>
        </div>

        <div class="cmd-palette__results" v-else>
          <div class="cmd-palette__group-label">Quick Actions</div>
          <div
            v-for="action in quickActions"
            :key="action.id"
            class="cmd-palette__item"
            :class="{ 'cmd-palette__item--active': activeIdx === action._idx }"
            @click="runAction(action)"
            @mouseenter="activeIdx = action._idx"
          >
            <div class="cmd-palette__item-icon" :style="{ background: action.color }">
              <el-icon :size="14"><component :is="action.icon" /></el-icon>
            </div>
            <div class="cmd-palette__item-content">
              <div class="cmd-palette__item-title">{{ action.title }}</div>
              <div class="cmd-palette__item-meta">{{ action.shortcut }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts" name="commandPalette">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Search, Plus, Tickets, Grid, Folder, Calendar, Document } from "@element-plus/icons-vue";
import { getIssueList } from "@/api/modules/issueService";
import { useProjectStore } from "@/stores/modules/project";
import type { Issue } from "@/api/modules/issueService";

const router = useRouter();
const projectStore = useProjectStore();

const visible = ref(false);
const query = ref("");
const activeIdx = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  link: string;
  _idx: number;
}

const searchResults = ref<PaletteItem[]>([]);

const quickActions = [
  { id: "new-issue", title: "Create New Issue", shortcut: "N I", color: "#409eff", icon: Plus, action: () => router.push("/issue") },
  { id: "new-project", title: "Create New Project", shortcut: "N P", color: "#67c23a", icon: Folder, action: () => router.push("/project") },
  { id: "kanban", title: "Open Kanban Board", shortcut: "K", color: "#e6a23c", icon: Grid, action: () => router.push("/kanban") },
    { id: "pages", title: "Go to Pages", shortcut: "P", color: "#909399", icon: Document, action: () => router.push("/page") },
  { id: "search", title: "Global Search", shortcut: "S", color: "#409eff", icon: Search, action: () => router.push("/search") }
].map((a, i) => ({ ...a, _idx: i }));

const totalItems = computed(() => searchResults.value.length);

type ResultGroup = { label: string; icon: any; color: string; items: PaletteItem[] };

const resultGroups = computed<ResultGroup[]>(() => {
  const items = searchResults.value;
  const issues = items.filter(i => i.id.startsWith("iss-"));
  const projects = items.filter(i => i.id.startsWith("proj-"));
  const groups: ResultGroup[] = [];
  if (issues.length) groups.push({ label: "Issues", icon: Tickets, color: "#409eff", items: issues });
  if (projects.length) groups.push({ label: "Projects", icon: Folder, color: "#67c23a", items: projects });
  return groups;
});

let searchTimer: ReturnType<typeof setTimeout> | null = null;

watch(query, (val) => {
  if (searchTimer) clearTimeout(searchTimer);
  if (!val.trim()) {
    searchResults.value = [];
    activeIdx.value = 0;
    return;
  }
  searchTimer = setTimeout(() => doSearch(val), 200);
});

async function doSearch(q: string) {
  const results: PaletteItem[] = [];
  const lower = q.toLowerCase();

  // Projects
  if (projectStore.projects.length) {
    projectStore.projects.forEach(p => {
      if (p.name.toLowerCase().includes(lower) || p.identifier.toLowerCase().includes(lower)) {
        results.push({ id: `proj-${p.key}`, title: p.name, subtitle: p.identifier, link: `/project/${p.key}`, _idx: 0 });
      }
    });
  }

  // Issues
  try {
    const res = await getIssueList({ search: q, pageSize: 10 });
    const issues = (res.data?.list as Issue[]) ?? [];
    issues.forEach(i => {
      results.push({ id: `iss-${i.key}`, title: i.title, subtitle: `${i.status} · ${i.project_key}`, link: `/issue/${i.key}`, _idx: 0 });
    });
  } catch { /* ignore */ }

  results.forEach((r, i) => { r._idx = i; });
  searchResults.value = results;
  activeIdx.value = 0;
}

function onKeydown(e: KeyboardEvent) {
  const total = query.value ? searchResults.value.length : quickActions.length;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIdx.value = (activeIdx.value + 1) % Math.max(total, 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIdx.value = (activeIdx.value - 1 + total) % Math.max(total, 1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (query.value) {
      const item = searchResults.value[activeIdx.value];
      if (item) select(item);
    } else {
      const action = quickActions[activeIdx.value];
      if (action) runAction(action);
    }
  } else if (e.key === "Escape") {
    close();
  }
}

function select(item: PaletteItem) {
  close();
  router.push(item.link);
}

function runAction(action: any) {
  close();
  action.action();
}

function open() {
  visible.value = true;
  query.value = "";
  activeIdx.value = 0;
  searchResults.value = [];
  setTimeout(() => inputRef.value?.focus(), 50);
}

function close() {
  visible.value = false;
}

function highlight(text: string): string {
  if (!query.value) return text;
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const q = query.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(new RegExp(`(${q})`, "gi"), "<mark>$1</mark>");
}

function globalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    open();
  }
}

onMounted(() => {
  document.addEventListener("keydown", globalKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", globalKeydown);
});

defineExpose({ open, close });
</script>

<style scoped>
.cmd-palette-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  padding-top: 15vh;
}
.cmd-palette {
  width: 560px;
  max-height: 420px;
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.cmd-palette__input-wrap {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--el-border-color);
  gap: 10px;
}
.cmd-palette__search-icon {
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}
.cmd-palette__input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
  color: var(--el-text-color-primary);
}
.cmd-palette__input::placeholder {
  color: var(--el-text-color-placeholder);
}
.cmd-palette__kbd {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--el-fill-color);
  color: var(--el-text-color-placeholder);
  font-family: monospace;
}
.cmd-palette__results {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.cmd-palette__group-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  padding: 8px 12px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.cmd-palette__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.1s;
}
.cmd-palette__item--active {
  background: var(--el-color-primary-light-9);
}
.cmd-palette__item-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.cmd-palette__item-content {
  flex: 1;
  min-width: 0;
}
.cmd-palette__item-title {
  font-size: 13px;
  font-weight: 500;
  :deep(mark) {
    background: var(--el-color-warning-light-5);
    color: inherit;
    padding: 0 2px;
    border-radius: 2px;
  }
}
.cmd-palette__item-meta {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.cmd-palette__item-kbd {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--el-fill-color);
  color: var(--el-text-color-placeholder);
  font-family: monospace;
}
.cmd-palette__empty {
  text-align: center;
  padding: 24px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}
</style>