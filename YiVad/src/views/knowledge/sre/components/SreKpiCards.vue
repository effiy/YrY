<template>
  <div class="sre-kpi-cards">
    <div class="sre-kpi-card" :class="`sre-kpi-card--${scoreColor}`">
      <div class="sre-kpi-card__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
      </div>
      <div class="sre-kpi-card__body">
        <span class="sre-kpi-card__label">{{ $t("knowledge.sre.qualityScore") }}</span>
        <span class="sre-kpi-card__value">{{ qualityScore }}</span>
        <span class="sre-kpi-card__trend" :class="trendClass">{{ trendLabel }}</span>
      </div>
    </div>

    <div class="sre-kpi-card sre-kpi-card--info">
      <div class="sre-kpi-card__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div class="sre-kpi-card__body">
        <span class="sre-kpi-card__label">{{ $t("knowledge.sre.mttr") }}</span>
        <span class="sre-kpi-card__value">{{ mttr }}<small>h</small></span>
      </div>
    </div>

    <div class="sre-kpi-card sre-kpi-card--warning">
      <div class="sre-kpi-card__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <div class="sre-kpi-card__body">
        <span class="sre-kpi-card__label">{{ $t("knowledge.sre.openBugs") }}</span>
        <span class="sre-kpi-card__value">{{ openBugs }}</span>
      </div>
    </div>

    <div class="sre-kpi-card" :class="`sre-kpi-card--${slaColor}`">
      <div class="sre-kpi-card__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <div class="sre-kpi-card__body">
        <span class="sre-kpi-card__label">{{ $t("knowledge.sre.slaCompliance") }}</span>
        <span class="sre-kpi-card__value">{{ sla }}<small>%</small></span>
      </div>
    </div>

    <div class="sre-kpi-card sre-kpi-card--danger">
      <div class="sre-kpi-card__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <div class="sre-kpi-card__body">
        <span class="sre-kpi-card__label">{{ $t("knowledge.sre.criticalOpen") }}</span>
        <span class="sre-kpi-card__value">{{ criticalOpen }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="SreKpiCards">
import { computed } from "vue";
import type { QualityMetrics } from "@/types/analytics";

const props = defineProps<{
  quality: QualityMetrics | null;
}>();

const qualityScore = computed(() => {
  if (!props.quality) return "--";
  return props.quality.quality_score.toFixed(1);
});

const mttr = computed(() => {
  if (!props.quality) return "--";
  return props.quality.mttr_hours.toFixed(1);
});

const openBugs = computed(() => {
  if (!props.quality) return "--";
  const done = props.quality.status_breakdown?.closed ?? 0;
  const resolved = props.quality.status_breakdown?.resolved ?? 0;
  return props.quality.bug_count - done - resolved;
});

const sla = computed(() => {
  if (!props.quality) return "--";
  return props.quality.sla_compliance.toFixed(1);
});

const criticalOpen = computed(() => {
  if (!props.quality) return "--";
  return props.quality.critical_open ?? 0;
});

const scoreColor = computed(() => {
  const s = props.quality?.quality_score ?? 0;
  if (s >= 80) return "success";
  if (s >= 60) return "warning";
  return "danger";
});

const slaColor = computed(() => {
  const s = props.quality?.sla_compliance ?? 0;
  if (s >= 90) return "success";
  if (s >= 75) return "warning";
  return "danger";
});

const trendClass = computed(() => {
  const d = props.quality?.trend_direction;
  if (d === "improving") return "sre-kpi-card__trend--up";
  if (d === "declining") return "sre-kpi-card__trend--down";
  return "sre-kpi-card__trend--stable";
});

const trendLabel = computed(() => {
  const d = props.quality?.trend_direction;
  const delta = props.quality?.trend_delta ?? 0;
  if (d === "improving") return `↑ ${delta > 0 ? "+" : ""}${delta}`;
  if (d === "declining") return `↓ ${delta}`;
  return "→ stable";
});
</script>

<style scoped lang="scss">
.sre-kpi-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.sre-kpi-card {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px 18px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px -8px rgb(0 0 0 / 12%);
  }

  &--success { border-left: 3px solid #22c55e; }
  &--info { border-left: 3px solid #3b82f6; }
  &--warning { border-left: 3px solid #f59e0b; }
  &--danger { border-left: 3px solid #ef4444; }
}

.sre-kpi-card__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;

  svg {
    width: 22px;
    height: 22px;
  }

  .sre-kpi-card--success & {
    color: #22c55e;
    background: #f0fdf4;
  }
  .sre-kpi-card--info & {
    color: #3b82f6;
    background: #eff6ff;
  }
  .sre-kpi-card--warning & {
    color: #f59e0b;
    background: #fffbeb;
  }
  .sre-kpi-card--danger & {
    color: #ef4444;
    background: #fef2f2;
  }
}

.sre-kpi-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sre-kpi-card__label {
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sre-kpi-card__value {
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--el-text-color-primary);

  small {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
  }
}

.sre-kpi-card__trend {
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;

  &--up { color: #22c55e; }
  &--down { color: #ef4444; }
  &--stable { color: var(--el-text-color-secondary); }
}
</style>