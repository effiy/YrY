<template>
  <div class="role-page" v-loading="loading">
    <header
      class="role-page__header"
      v-sticky="{
        top: 0,
        zIndex: 20,
        offsetX: [24, 24],
        offsetY: [20, 14],
        activeClass: 'is-stuck'
      }"
    >
      <div class="role-page__header-row">
        <slot name="title"
          ><h1>{{ title }}</h1></slot
        >
      </div>
    </header>

    <slot name="header" />

    <KnowledgeError v-if="error" :message="error" @retry="() => d.refresh()" />

    <template v-else>
      <div class="role-page__body">
        <nav
          class="role-page__sidebar"
          v-sticky="{
            top: 96,
            zIndex: 18,
            activeClass: 'is-stuck'
          }"
        >
          <div class="role-page__sidebar-view">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button value="card">Cards</el-radio-button>
              <el-radio-button value="list">List</el-radio-button>
              <el-radio-button value="table">Table</el-radio-button>
            </el-radio-group>
          </div>
          <button
            v-for="dir in subdirs"
            :key="dir.id"
            class="role-page__sidebar-item"
            :class="{ 'is-active': isStatActive(dir) }"
            @click="scrollTo(dir.id)"
          >
            <span class="role-page__sidebar-icon">{{ dir.icon }}</span>
            <span class="role-page__sidebar-label">{{ dir.label }}</span>
            <span class="role-page__sidebar-badge">{{ fileCounts[dir.id] || 0 }}</span>
          </button>
        </nav>

        <div class="role-page__content">
          <RoleCardView
            v-if="viewMode === 'card'"
            :subdirs="subdirs"
            :files-by-dir="filesByDir"
            :collapsed-sections="collapsedSections"
            :category="category"
            :structural-tags="structuralTags"
            @open="openFile"
            @delete="handleDelete"
            @toggle-section="toggleSection"
          />
          <RoleListView
            v-else-if="viewMode === 'list'"
            :files="filteredFiles"
            :total-count="flatFiles.length"
            :category="category"
            @open="openFile"
            @delete="handleDelete"
          />
          <RoleTableView
            v-else
            :files="filteredFiles"
            :total-count="flatFiles.length"
            :filters="filters"
            :category="category"
            @open="openFile"
            @delete="handleDelete"
          />
        </div>
      </div>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="RoleKnowledgePage">
/* ──────────────────────────────────────────────────────────
 * NOTE: This component is now a thin fallback.
 * All 7 real roles use dedicated dashboard pages that import
 * `useRoleDashboard` and render Red-Lines + Quick-Ref +
 * 5-Day Onboarding sections. This page is kept only for
 * unknown/custom category routing.
 * ────────────────────────────────────────────────────────── */
import { ref, computed, onMounted, nextTick, reactive, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { confirm } from "@/hooks/useConfirmAction";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import KnowledgeError from "./KnowledgeError.vue";
import RoleCardView from "./RoleCardView.vue";
import RoleListView from "./RoleListView.vue";
import RoleTableView from "./RoleTableView.vue";
import { useRoleDashboard } from "../composables/useRoleDashboard";

interface Subdir {
  id: string;
  icon: string;
  label: string;
  color: string;
  desc: string;
}

const props = withDefaults(
  defineProps<{
    title: string;
    domainsWord: string;
    description: string;
    category: string;
    subdirs: Subdir[];
    structuralTags?: string[];
  }>(),
  { structuralTags: () => [] }
);
const { t } = useI18n();
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

/* ── Delegate 100% of data + state to shared composable. ── */
const categoryRef = computed(() => props.category);
const d = useRoleDashboard(categoryRef, { pollIntervalMs: 90_000 });

const {
  loading, error, filesByDir, fileCounts, flatFiles, filteredFiles,
  viewMode, collapsedSections, filters, toggleSection
} = d;

/* ── Local helpers (sidebar interactions) ─────────────── */
function isStatActive(dir: Subdir): boolean {
  if (viewMode.value === "table") return filters.domain.includes(dir.label);
  return d.cardActiveDomain.value === dir.id;
}
function scrollTo(id: string) {
  if (viewMode.value === "table" || viewMode.value === "list") {
    const dir = props.subdirs.find(x => x.id === id);
    if (!dir) return;
    const idx = filters.domain.indexOf(dir.label);
    if (idx >= 0) filters.domain.splice(idx, 1);
    else filters.domain.push(dir.label);
    return;
  }
  d.cardActiveDomain.value = d.cardActiveDomain.value === id ? null : id;
  if (collapsedSections.value.has(id)) toggleSection(id);
  nextTick(() => {
    const el = document.querySelector(`[data-section="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/* ── Actions ───────────────────────────────────────── */
function openFile(file: { path: string }) {
  previewDlg.value?.open(file.path);
}
async function handleDelete(file: { path: string }) {
  const ok = await confirm(
    t("knowledge.common.deleteFileConfirm", { path: file.path }),
    t("knowledge.common.deleteFileTitle")
  );
  if (!ok) return;
  const done = await d.removeFile(file as any);
  if (done) ElMessage.success(t("knowledge.common.fileDeleted"));
  else ElMessage.error(t("knowledge.common.fileDeleteFailed"));
}
</script>

<style scoped lang="scss">
.role-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  background: var(--el-bg-color-page);
}
.role-page__header {
  z-index: 20;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    backdrop-filter 0.2s ease;
  h1 {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 700;
  }
  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }
  &.is-stuck {
    background: color-mix(in srgb, var(--el-bg-color-page) 82%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--el-border-color-lighter) 70%, transparent);
    box-shadow: 0 6px 20px -12px rgb(0 0 0 / 10%);
    backdrop-filter: saturate(180%) blur(14px);
  }
}
.role-page__header-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  h1 {
    margin-bottom: 4px;
  }
}

// ── Body + Sidebar ──
.role-page__body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.role-page__sidebar {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 4px;
  width: 180px;
  padding: 10px 10px 12px;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  &.is-stuck {
    border-color: color-mix(in srgb, var(--el-border-color) 70%, transparent);
    box-shadow:
      0 8px 24px -10px rgb(0 0 0 / 12%),
      0 2px 6px rgb(0 0 0 / 4%);
    transform: translateY(-2px);
  }
}
.role-page__sidebar-item {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;
  transition: all 0.15s;
  &:hover {
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
  }
  &.is-active {
    font-weight: 600;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    box-shadow: inset 3px 0 0 var(--el-color-primary);
  }
}
.role-page__sidebar-icon {
  flex-shrink: 0;
  font-size: 18px;
}
.role-page__sidebar-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.role-page__sidebar-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 10px;
  .role-page__sidebar-item.is-active & {
    color: #ffffff;
    background: var(--el-color-primary);
  }
}
.role-page__sidebar-view {
  padding: 4px 8px 8px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) {
    display: flex;
    width: 100%;
  }
  :deep(.el-radio-button) {
    flex: 1;
  }
  :deep(.el-radio-button__inner) {
    width: 100%;
    padding: 4px 0;
    font-size: 12px;
    text-align: center;
  }
}
.role-page__content {
  flex: 1;
  min-width: 0;
}
</style>
