<template>
  <div v-if="projectKey" class="chp-root">
    <div class="chp-header" @click="collapsed = !collapsed">
      <el-icon class="chp-header__icon"><Monitor /></el-icon>
      <span class="chp-header__label">{{ $t("project.health.title") }}</span>
      <span class="chp-header__right">
        <span v-if="report" class="chp-header__time">{{ $t("project.health.analyzedAt", { time: formatTime(report.analyzed_at) }) }}</span>
        <el-button link size="small" :icon="Refresh" @click.stop="analyze" :loading="loading" />
        <el-icon :class="{ 'is-collapsed': collapsed }" class="chp-header__arrow"><ArrowDown /></el-icon>
      </span>
    </div>

    <div v-if="!collapsed" class="chp-body">
      <CodeHealthSkeleton v-if="loading" />

      <div v-else-if="error" class="chp-error">
        <span class="chp-error__text">{{ error }}</span>
        <el-button link size="small" type="primary" @click="analyze">{{ $t("project.health.retry") }}</el-button>
      </div>

      <div v-else-if="!report" class="chp-empty">
        <el-button link size="small" type="primary" :icon="Search" @click="analyze">{{ $t("project.health.analyze") }}</el-button>
      </div>

      <template v-else>
        <!-- Scale -->
        <div class="chp-section">
          <div class="chp-section__head">
            <el-icon class="chp-section__icon"><Document /></el-icon>
            <span>{{ $t("project.health.scale") }}</span>
          </div>
          <div class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.totalLines") }}</span>
            <span class="chp-row__value">{{ report.scale.total_lines.toLocaleString() }}</span>
          </div>
          <div class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.fileCount") }}</span>
            <span class="chp-row__value">{{ report.scale.file_count }}</span>
          </div>
          <div class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.maxFile") }}</span>
            <span class="chp-row__value" :class="`chp-row__value--${getLevel(report.scale.max_file.lines, [300, 600])}`">
              {{ report.scale.max_file.lines }} {{ $t("project.health.lines") }}
            </span>
            <span class="chp-row__detail" :title="report.scale.max_file.path">{{ report.scale.max_file.path.split("/").pop() }}</span>
          </div>
          <div class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.avgLines") }}</span>
            <span class="chp-row__value" :class="`chp-row__value--${getLevel(report.scale.avg_lines, [200, 400])}`">
              {{ report.scale.avg_lines.toFixed(1) }}
            </span>
          </div>
        </div>

        <!-- Density -->
        <div class="chp-section">
          <div class="chp-section__head">
            <el-icon class="chp-section__icon"><DataAnalysis /></el-icon>
            <span>{{ $t("project.health.density") }}</span>
          </div>
          <div class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.commentRate") }}</span>
            <span class="chp-row__value" :class="`chp-row__value--${getLevel(report.density.comment_rate * 100, [5, 10], true)}`">
              {{ fmtPct(report.density.comment_rate) }}
            </span>
          </div>
          <div class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.blankRate") }}</span>
            <span class="chp-row__value">{{ fmtPct(report.density.blank_rate) }}</span>
          </div>
          <div class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.codeLines") }}</span>
            <span class="chp-row__value">{{ report.density.code_lines.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Reuse (Vue only) -->
        <div v-if="report.reuse.component_defs > 0" class="chp-section">
          <div class="chp-section__head">
            <el-icon class="chp-section__icon"><Connection /></el-icon>
            <span>{{ $t("project.health.reuse") }}</span>
          </div>
          <div class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.componentDefs") }}</span>
            <span class="chp-row__value">{{ report.reuse.component_defs }}</span>
          </div>
          <div class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.componentUsages") }}</span>
            <span class="chp-row__value">{{ report.reuse.component_usages }}</span>
          </div>
          <div class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.reuseRate") }}</span>
            <span class="chp-row__value" :class="`chp-row__value--${getLevel(report.reuse.reuse_rate, [1, 2], true)}`">
              {{ report.reuse.reuse_rate.toFixed(1) }}x
            </span>
          </div>
          <div v-if="report.reuse.unused_components.length" class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.unused") }}</span>
            <span class="chp-row__value chp-row__value--warn">{{ report.reuse.unused_components.length }}</span>
          </div>
        </div>

        <!-- Duplication -->
        <div class="chp-section">
          <div class="chp-section__head">
            <el-icon class="chp-section__icon"><Files /></el-icon>
            <span>{{ $t("project.health.duplication") }}</span>
          </div>
          <div class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.dupBlocks") }}</span>
            <span class="chp-row__value" :class="`chp-row__value--${getLevel(report.duplication.duplicate_blocks, [5, 15])}`">
              {{ report.duplication.duplicate_blocks }}
            </span>
          </div>
          <div class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.dupRate") }}</span>
            <span class="chp-row__value" :class="`chp-row__value--${getLevel(report.duplication.duplicate_rate * 100, [5, 15])}`">
              {{ fmtPct(report.duplication.duplicate_rate) }}
            </span>
          </div>
          <div class="chp-row">
            <span class="chp-row__label">{{ $t("project.health.dupMaxBlock") }}</span>
            <span class="chp-row__value" :class="`chp-row__value--${getLevel(report.duplication.max_block_size, [15, 30])}`">
              {{ report.duplication.max_block_size }} {{ $t("project.health.lines") }}
            </span>
          </div>
        </div>

        <!-- Alerts -->
        <div v-if="report.alerts.length" class="chp-alerts">
          <div class="chp-alerts__title">{{ $t("project.health.alerts") }} ({{ report.alerts.length }})</div>
          <div
            v-for="(a, i) in report.alerts"
            :key="i"
            class="chp-alert"
            :class="`chp-alert--${a.level}`"
            @click="openAlertFile(a.file)"
          >
            <span class="chp-alert__icon">{{ a.level === "danger" ? "🔴" : "⚠️" }}</span>
            <div class="chp-alert__body">
              <div class="chp-alert__msg">{{ a.message }}</div>
              <div class="chp-alert__sug">{{ a.suggestion }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import { Monitor, Refresh, ArrowDown, Search, Document, DataAnalysis, Connection, Files } from "@element-plus/icons-vue";
import { useCodeHealth } from "@/hooks/useCodeHealth";
import { PREVIEW_DLG_KEY } from "@/views/project/types";
import CodeHealthSkeleton from "./CodeHealthSkeleton.vue";

const { t } = useI18n();

const props = defineProps<{ projectKey: string }>();

const previewDlg = inject(PREVIEW_DLG_KEY);

const projectKeyRef = computed(() => props.projectKey);
const { report, loading, error, analyze, getLevel, fmtPct } = useCodeHealth(projectKeyRef);

const collapsed = ref(false);

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.replace(" ", "T"));
  if (isNaN(d.getTime())) return iso;
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return t("project.health.timeJustNow");
  if (mins < 60) return t("project.health.timeMinutesAgo", { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("project.health.timeHoursAgo", { n: hours });
  return t("project.health.timeDaysAgo", { n: Math.floor(hours / 24) });
}

function openAlertFile(file: string | null) {
  if (!file) return;
  previewDlg?.value?.open(`projects/${props.projectKey}/${file}`);
}
</script>

<style scoped lang="scss">
.chp-root {
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 12px;
  padding-top: 8px;
}

.chp-header {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
  color: var(--el-text-color-regular);
  &:hover { color: var(--el-color-primary); }
}

.chp-header__icon {
  font-size: 14px;
}

.chp-header__label {
  font-size: 13px;
  font-weight: 500;
  flex: 1;
}

.chp-header__right {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.chp-header__time {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chp-header__arrow {
  font-size: 12px;
  transition: transform 0.2s;
  &.is-collapsed { transform: rotate(-90deg); }
}

.chp-body {
  padding: 4px 0 0 0;
}

.chp-section {
  margin-bottom: 8px;
}

.chp-section__head {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.chp-section__icon {
  font-size: 12px;
}

.chp-row {
  display: flex;
  align-items: center;
  padding: 2px 0;
  font-size: 12px;
}

.chp-row__label {
  color: var(--el-text-color-placeholder);
  min-width: 56px;
  flex-shrink: 0;
}

.chp-row__value {
  font-variant-numeric: tabular-nums;
  font-weight: 500;

  &--good { color: var(--el-color-success); }
  &--warn { color: var(--el-color-warning); }
  &--danger { color: var(--el-color-danger); }
}

.chp-row__detail {
  margin-left: 6px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chp-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 0;
}

.chp-error__text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.chp-empty {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}

.chp-alerts {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.chp-alerts__title {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.chp-alert {
  display: flex;
  gap: 6px;
  padding: 4px 0;
  cursor: default;
  border-radius: 4px;
  &--danger { .chp-alert__msg { color: var(--el-color-danger); } }
  &--warn { .chp-alert__msg { color: var(--el-color-warning); } }
  &[data-clickable] { cursor: pointer; }
}

.chp-alert__icon {
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 1px;
}

.chp-alert__msg {
  font-size: 11px;
  line-height: 1.4;
}

.chp-alert__sug {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  line-height: 1.3;
}
</style>