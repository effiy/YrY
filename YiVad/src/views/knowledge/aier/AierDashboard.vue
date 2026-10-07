<template>
  <div class="adb" v-loading="loading">
    <!-- Row 0: Header -->
    <header class="adb__header" v-sticky="{ top: 0, zIndex: 20, offsetX: [24, 24], offsetY: [20, 14], activeClass: 'is-stuck' }">
      <RoleNav :active="'aier'" show-quick-nav quick-role="aier" />
      <p class="adb__subtitle">AI foundations, engineering methods, platform selection, ML patterns, and OKR tracking</p>
    </header>

    <KnowledgeError v-if="error" :message="error" @retry="refresh" />

    <template v-else>
      <!-- Row 1: Summary Stats -->
      <section class="adb__stats">
        <div class="adb__stat-card">
          <span class="adb__stat-value">{{ stats.total }}</span>
          <span class="adb__stat-label">Total Files</span>
        </div>
        <div class="adb__stat-card adb__stat-card--success">
          <span class="adb__stat-value">{{ stats.stable }}</span>
          <span class="adb__stat-label">Stable</span>
        </div>
        <div class="adb__stat-card adb__stat-card--warning">
          <span class="adb__stat-value">{{ stats.draft }}</span>
          <span class="adb__stat-label">Draft</span>
        </div>
        <div class="adb__stat-card adb__stat-card--danger">
          <span class="adb__stat-value">{{ stats.deprecated + stats.archived }}</span>
          <span class="adb__stat-label">Deprecated</span>
        </div>
        <div class="adb__stat-card">
          <span class="adb__stat-value">
            <el-progress
              :percentage="reviewCompliancePct"
              :stroke-width="8"
              :show-text="false"
              :color="reviewComplianceColor"
            />
          </span>
          <span class="adb__stat-label">Review Compliance</span>
          <span class="adb__stat-sub">{{ stats.reviewOk }}/{{ stats.reviewOk + stats.reviewStale }} up to date</span>
        </div>
        <div class="adb__stat-card adb__stat-card--time">
          <span class="adb__stat-value adb__stat-time">{{ stats.lastUpdated }}</span>
          <span class="adb__stat-label">
            Last Scan
            <el-button :icon="Refresh" size="small" text @click="refresh" :loading="loading" />
          </span>
        </div>
      </section>

      <!-- Row 2: Domain Cards + Quick Reference -->
      <section class="adb__row2">
        <div class="adb__domains">
          <h2 class="adb__section-title">Knowledge Domains</h2>
          <div class="adb__domain-grid">
            <el-card
              v-for="dir in subdirs"
              :key="dir.id"
              class="adb__domain-card"
              :class="{ 'is-empty': !filesByDir[dir.id]?.length }"
              shadow="hover"
            >
              <div class="adb__domain-head">
                <span class="adb__domain-icon">{{ dir.icon }}</span>
                <div class="adb__domain-info">
                  <span class="adb__domain-name">{{ dir.label }}</span>
                  <span class="adb__domain-count">{{ filesByDir[dir.id]?.length || 0 }} files</span>
                </div>
                <span class="adb__domain-accent" :style="{ background: dir.color }" />
              </div>
              <p class="adb__domain-desc">{{ dir.desc }}</p>
              <div class="adb__domain-tags" v-if="filesByDir[dir.id]?.length">
                <el-tag
                  v-for="tag in topTags(dir.id)"
                  :key="tag"
                  size="small"
                  effect="plain"
                  round
                >{{ tag }}</el-tag>
              </div>
              <div v-else class="adb__domain-empty">No files yet</div>
            </el-card>
          </div>
        </div>

        <div class="adb__quickref">
          <h2 class="adb__section-title">Quick Reference</h2>
          <div class="adb__quickref-grid">
            <button
              v-for="qr in quickRefs"
              :key="qr.file"
              class="adb__quickref-item"
              :class="{ 'is-missing': !resolveFilePath(qr.file) }"
              @click="openQuickRef(qr.file)"
              :disabled="!resolveFilePath(qr.file)"
            >
              <span class="adb__quickref-icon">{{ qr.icon }}</span>
              <span class="adb__quickref-text">{{ qr.want }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Row 3: Learning Path -->
      <section class="adb__learn">
        <h2 class="adb__section-title">
          Learning Path
          <el-tag size="small" effect="plain" round>12 Steps</el-tag>
        </h2>
        <div class="adb__learn-phases">
          <div class="adb__phase-label" style="--phase-color: #10b981">
            <span class="adb__phase-dot" /> Beginner (1–3)
          </div>
          <div class="adb__phase-label" style="--phase-color: #1677ff">
            <span class="adb__phase-dot" /> Intermediate (4–7)
          </div>
          <div class="adb__phase-label" style="--phase-color: #7c3aed">
            <span class="adb__phase-dot" /> Advanced (8–12)
          </div>
        </div>
        <div class="adb__learn-path">
          <button
            v-for="ls in learningPath"
            :key="ls.step"
            class="adb__learn-step"
            :class="{ 'is-missing': !resolveFilePath(ls.file) }"
            :style="{ '--step-color': ls.phaseColor }"
            @click="openQuickRef(ls.file)"
            :disabled="!resolveFilePath(ls.file)"
          >
            <span class="adb__learn-num">{{ ls.step }}</span>
            <span class="adb__learn-title">{{ ls.title }}</span>
          </button>
        </div>
      </section>

      <!-- Row 4: File Table -->
      <section class="adb__files">
        <div class="adb__files-header">
          <h2 class="adb__section-title">All Files ({{ stats.total }})</h2>
          <el-button text @click="showTable = !showTable">
            {{ showTable ? "Collapse" : "Expand" }}
          </el-button>
        </div>
        <AierFileTable
          v-if="showTable"
          :files="files"
          :files-by-dir="filesByDir"
          :subdirs="subdirs"
          @open="openPreview"
        />
      </section>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="AierDashboard">
import { ref, computed, onMounted } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import KnowledgeError from "../components/KnowledgeError.vue";
import RoleNav from "../components/RoleNav.vue";
import AierFileTable from "./AierFileTable.vue";
import { useAierData } from "./useAierData";

defineProps<{
  role: {
    title: string;
    domainsWord: string;
    description: string;
    category: string;
    structuralTags: string[];
    subdirs: { id: string; icon: string; label: string; color: string; desc: string }[];
  };
}>();

const {
  files,
  filesByDir,
  stats,
  loading,
  error,
  subdirs,
  learningPath,
  quickRefs,
  resolveFilePath,
  load,
  refresh
} = useAierData();

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const showTable = ref(true);

const reviewCompliancePct = computed(() => {
  const total = stats.value.reviewOk + stats.value.reviewStale;
  if (!total) return 100;
  return Math.round((stats.value.reviewOk / total) * 100);
});

const reviewComplianceColor = computed(() => {
  if (reviewCompliancePct.value >= 80) return "#10b981";
  if (reviewCompliancePct.value >= 50) return "#f59e0b";
  return "#ef4444";
});

function topTags(dirId: string): string[] {
  const dirFiles = filesByDir.value[dirId] || [];
  const counts = new Map<string, number>();
  for (const f of dirFiles) {
    for (const tag of (f.meta?.tags || [])) {
      if (tag === "aier" || tag === dirId) continue;
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(e => e[0]);
}

function openPreview(file: KnowledgeFileEntry) {
  previewDlg.value?.open(file.path);
}

function openQuickRef(fileRef: string) {
  const f = resolveFilePath(fileRef);
  if (f) openPreview(f);
}

onMounted(load);
</script>

<style scoped lang="scss">
.adb {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 24px;
  background: var(--el-bg-color-page);
}

// ── Header ──
.adb__header {
  z-index: 20;
  padding-bottom: 8px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, backdrop-filter 0.2s ease;
  &.is-stuck {
    margin: -4px -8px 0;
    padding: 12px 8px 10px;
    background: color-mix(in srgb, var(--el-bg-color-page) 82%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--el-border-color-lighter) 70%, transparent);
    box-shadow: 0 6px 20px -12px rgb(0 0 0 / 10%);
    backdrop-filter: saturate(180%) blur(14px);
  }
}

.adb__subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

// ── Stats ──
.adb__stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.adb__stat-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 2px 12px rgb(0 0 0 / 6%);
  }
}

.adb__stat-value {
  font-size: 28px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
}

.adb__stat-time {
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.adb__stat-label {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.adb__stat-sub {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.adb__stat-card--success .adb__stat-value { color: #10b981; }
.adb__stat-card--warning .adb__stat-value { color: #f59e0b; }
.adb__stat-card--danger .adb__stat-value { color: #ef4444; }

// ── Section Title ──
.adb__section-title {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
}

// ── Row 2 ──
.adb__row2 {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
  align-items: start;
}

// ── Domain Cards ──
.adb__domain-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}

.adb__domain-card {
  cursor: pointer;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
  &.is-empty {
    opacity: 0.5;
  }
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.adb__domain-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 8px;
}

.adb__domain-icon {
  flex-shrink: 0;
  font-size: 22px;
}

.adb__domain-info {
  flex: 1;
  min-width: 0;
}

.adb__domain-name {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.adb__domain-count {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.adb__domain-accent {
  width: 4px;
  height: 32px;
  border-radius: 2px;
}

.adb__domain-desc {
  display: -webkit-box;
  margin: 0 0 10px;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  -webkit-box-orient: vertical;
}

.adb__domain-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.adb__domain-empty {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

// ── Quick Reference ──
.adb__quickref {
  position: sticky;
  top: 96px;
}

.adb__quickref-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}

.adb__quickref-item {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;
  transition: all 0.15s;
  &:hover:not(:disabled) {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.adb__quickref-icon {
  flex-shrink: 0;
  font-size: 16px;
}

.adb__quickref-text {
  line-height: 1.4;
}

// ── Learning Path ──
.adb__learn {
  padding: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}

.adb__learn-phases {
  display: flex;
  gap: 24px;
  margin-bottom: 14px;
}

.adb__phase-label {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.adb__phase-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--phase-color);
  border-radius: 50%;
}

.adb__learn-path {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.adb__learn-step {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  text-align: left;
  cursor: pointer;
  background: var(--el-fill-color-lighter);
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 0.18s;
  &:hover:not(:disabled) {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.adb__learn-num {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  background: var(--step-color);
  border-radius: 50%;
}

.adb__learn-title {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}

// ── File Table ──
.adb__files {
  padding: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}

.adb__files-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  h2 {
    margin: 0;
  }
}
</style>