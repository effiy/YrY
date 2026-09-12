<template>
  <div class="db-root">
    <!-- ═══ Stats Summary ═══ -->
    <section class="db-section">
      <div class="db-stats">
        <div class="db-stat">
          <span class="db-stat__value">{{ bugs.length }}</span>
          <span class="db-stat__label">{{ $t("project.overview.quality.totalBugs") }}</span>
        </div>
        <div class="db-stat">
          <span class="db-stat__value db-stat__value--warn">{{ openCount }}</span>
          <span class="db-stat__label">{{ $t("project.overview.quality.openBugs") }}</span>
          <span class="db-stat__sub">{{ $t("project.overview.quality.ofTotal") }} {{ openPct }}%</span>
        </div>
        <div class="db-stat">
          <span class="db-stat__value db-stat__value--danger">{{ criticalCount }}</span>
          <span class="db-stat__label">{{ $t("project.overview.quality.critical") }}</span>
        </div>
        <div class="db-stat">
          <span class="db-stat__value db-stat__value--success">{{ resolvedRate }}%</span>
          <span class="db-stat__label">{{ $t("project.overview.quality.resolvedRate") }}</span>
          <span class="db-stat__sub">{{ $t("project.overview.quality.resolvedCount", { n: resolvedCount }) }}</span>
        </div>
      </div>
    </section>

    <!-- ═══ Bug List by Category ═══ -->
    <section
      v-for="group in categoryGroups"
      :key="group.category"
      class="db-section"
    >
      <div class="db-toolbar">
        <h3 class="db-section__title">{{ group.category }}</h3>
        <span class="db-card__total">{{ $t("project.stats.total", { n: group.items.length }) }}</span>
      </div>
      <div class="db-card">
        <div
          v-for="bug in group.items"
          :key="bug.path"
          class="db-bug-row"
          @click="openDoc(bug)"
        >
          <div class="db-bug-row__left">
            <span
              class="db-bug-row__severity"
              :class="`db-bug-row__severity--${bug.severity || 'trivial'}`"
              :title="bug.severity"
            />
            <span class="db-bug-row__title">{{ bug.title }}</span>
          </div>
          <div class="db-bug-row__right">
            <el-tag
              :type="statusTagType(bug.status)"
              size="small"
              effect="plain"
            >{{ bug.status || "open" }}</el-tag>
            <span class="db-bug-row__module" v-if="bug.module">{{ bug.module }}</span>
            <span class="db-bug-row__date">{{ formatDate(bug.updated) }}</span>
          </div>
        </div>
        <el-empty v-if="!group.items.length" :description="$t('project.overview.quality.noBugs')" :image-size="48" />
      </div>
    </section>

    <el-empty v-if="!bugs.length" :description="$t('project.overview.quality.noBugs')" :image-size="48" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { useProjectDetail, PREVIEW_DLG_KEY } from "@/views/project/types";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

const ctx = useProjectDetail();
const previewDlg = inject(PREVIEW_DLG_KEY, null);
const { knowledgeFiles, project } = ctx;

const projectKey = computed(() => project.value?.key || "");

// ── Bug file interface ──
interface BugFile {
  path: string;
  name: string;
  title: string;
  category: string;
  severity: string;
  priority: string;
  status: string;
  module: string;
  assignee: string;
  reporter: string;
  created?: string;
  updated?: string;
}

// ── Filter & parse bug files from knowledgeFiles ──
const bugs = computed<BugFile[]>(() => {
  const key = projectKey.value;
  if (!key) return [];
  const prefix = `projects/${key}/bugs/`;

  return knowledgeFiles.value
    .filter(f => f.path.startsWith(prefix) && f.name !== "README.md" && f.path.endsWith(".md"))
    .map(f => {
      const m = f.meta || {};
      const pathParts = f.path.split("/");
      // Extract category from path: projects/{key}/bugs/{category}/file.md
      const catIndex = pathParts.indexOf("bugs") + 1;
      const category = pathParts[catIndex] || "";

      return {
        path: f.path,
        name: f.name,
        title: String(m.title || f.name),
        category,
        severity: String(m.severity || "trivial"),
        priority: String(m.priority || "p2"),
        status: String(m.status || "open"),
        module: String(m.module || ""),
        assignee: String(m.assignee || ""),
        reporter: String(m.reporter || ""),
        created: String(m.created || ""),
        updated: String(m.updated || ""),
      };
    })
    .sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));
});

// ── Derived stats ──
const openCount = computed(() =>
  bugs.value.filter(b => b.status === "open" || b.status === "reopened").length
);

const criticalCount = computed(() =>
  bugs.value.filter(b => b.severity === "critical" || b.severity === "major").length
);

const resolvedCount = computed(() =>
  bugs.value.filter(b => b.status === "resolved" || b.status === "closed").length
);

const resolvedRate = computed(() => {
  if (!bugs.value.length) return 0;
  return Math.round((resolvedCount.value / bugs.value.length) * 100);
});

const openPct = computed(() => {
  if (!bugs.value.length) return 0;
  return Math.round((openCount.value / bugs.value.length) * 100);
});

// ── Category grouping ──
const categoryGroups = computed(() => {
  const map = new Map<string, BugFile[]>();
  for (const bug of bugs.value) {
    const cat = bug.category || "其他";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(bug);
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
});

// ── Helpers ──
function statusTagType(s: string): "success" | "warning" | "info" | "primary" | "danger" {
  switch (s) {
    case "open": return "danger";
    case "reopened": return "warning";
    case "in_progress": return "primary";
    case "resolved": case "closed": return "success";
    default: return "info";
  }
}

function formatDate(d?: string): string {
  if (!d) return "";
  return d.slice(0, 10);
}

function openDoc(bug: BugFile) {
  previewDlg?.value?.open(bug.path);
}
</script>

<style scoped lang="scss">
.db-root {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.db-section__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.db-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .db-section__title { margin: 0; }
}

// ── Stats row ──
.db-stats {
  display: flex;
  padding: 12px 0 8px;
}

.db-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0 14px;
  min-width: 0;

  & + & { border-left: 1px solid var(--el-border-color-extra-light); }
}

.db-stat__value {
  font-size: 22px;
  font-weight: 800;
  font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--el-text-color-primary);

  &--warn    { color: #e6a23c; }
  &--danger  { color: #f56c6c; }
  &--success { color: #67c23a; }
}

.db-stat__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.db-stat__sub {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}

// ── Card ──
.db-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;

  &__total {
    font-size: 11px;
    font-weight: 400;
    color: var(--el-text-color-placeholder);
  }
}

// ── Bug row ──
.db-bug-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;

  & + & { border-top: 1px solid var(--el-border-color-extra-light); }

  &:hover { background: var(--el-fill-color-light); }
}

.db-bug-row__left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.db-bug-row__severity {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &--critical { background: #f56c6c; }
  &--major    { background: #e6a23c; }
  &--minor    { background: #409eff; }
  &--trivial  { background: #909399; }
}

.db-bug-row__title {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.db-bug-row__right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  margin-left: 16px;
}

.db-bug-row__module {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  font-family: "SF Mono", Menlo, monospace;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.db-bug-row__date {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
}
</style>