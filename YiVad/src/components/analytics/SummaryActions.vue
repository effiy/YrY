<template>
  <div class="sa-panel">
    <div class="sa-headline" :class="`sa-headline--${headlineLevel}`">
      <span class="sa-headline__icon">{{ headlineIcon }}</span>
      <span class="sa-headline__text">{{ headline }}</span>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :md="8">
        <div class="sa-section sa-section--good">
          <h4 class="sa-section__title">Working Well</h4>
          <ul class="sa-section__list">
            <li v-for="(item, i) in workingWell" :key="'w'+i">{{ item }}</li>
            <li v-if="!workingWell.length" class="sa-section__empty">No clear positive signals yet</li>
          </ul>
        </div>
      </el-col>
      <el-col :xs="24" :md="8">
        <div class="sa-section sa-section--warn">
          <h4 class="sa-section__title">Needs Attention</h4>
          <ul class="sa-section__list">
            <li v-for="(item, i) in needsAttention" :key="'a'+i">{{ item }}</li>
            <li v-if="!needsAttention.length" class="sa-section__empty">All metrics within acceptable ranges</li>
          </ul>
        </div>
      </el-col>
      <el-col :xs="24" :md="8">
        <div class="sa-section sa-section--action">
          <h4 class="sa-section__title">Recommended Actions</h4>
          <ul class="sa-section__list">
            <li v-for="(item, i) in actions" :key="'x'+i">{{ item }}</li>
            <li v-if="!actions.length" class="sa-section__empty">Continue monitoring current trends</li>
          </ul>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  healthScore: number;
  qualityScore: number;
  qualityTrendDelta: number;
  predictability: number;
  slaCompliance: number;
  flowEfficiency: number;
  cycleTimeP50: number;
  cycleTimeP95: number;
  cycleTimeUcl: number;
  cycleTimeCv: number;
  criticalOpen: number;
  unassignedOpen: number;
  staleOpen: number;
  wipCount: number;
  bugNetChange: number | null;
  throughputPerWeek: number;
  arrivalRate: number;
  completenessScore: number;
  mttrHours: number;
}

const props = defineProps<Props>();

const headlineLevel = computed(() => {
  if (props.healthScore >= 80) return "good";
  if (props.healthScore >= 60) return "warn";
  return "bad";
});

const headlineIcon = computed(() => {
  if (props.healthScore >= 80) return "";
  if (props.healthScore >= 60) return "";
  return "";
});

const headline = computed(() => {
  if (props.healthScore >= 80) {
    return "System health is strong — quality, flow, and predictability are all within targets.";
  }
  if (props.healthScore >= 60) {
    const issues: string[] = [];
    if (props.cycleTimeCv > 0.5) issues.push("high cycle-time variability");
    if (props.criticalOpen > 0) issues.push(`${props.criticalOpen} critical bugs open`);
    if (props.slaCompliance < 80) issues.push(`SLA compliance at ${props.slaCompliance}%`);
    return `System health is moderate — monitor ${issues.join(", ")}.`;
  }
  const issues: string[] = [];
  if (props.criticalOpen > 0) issues.push(`${props.criticalOpen} critical bugs`);
  if (props.cycleTimeCv > 0.5) issues.push("unstable delivery process");
  if (props.slaCompliance < 50) issues.push("poor SLA compliance");
  return `System health needs immediate attention — ${issues.join(", ")}.`;
});

const workingWell = computed(() => {
  const items: string[] = [];
  if (props.qualityTrendDelta > 2) {
    items.push(`Quality score improving (+${props.qualityTrendDelta} pts) — bug rate and MTTR trending in the right direction.`);
  }
  if (props.bugNetChange != null && props.bugNetChange < -3) {
    items.push(`Bug backlog is shrinking (net ${props.bugNetChange}) — resolution rate exceeds discovery rate.`);
  }
  if (props.predictability >= 70) {
    items.push(`Delivery predictability at ${props.predictability}% — process is stable and reliable.`);
  }
  if (props.flowEfficiency >= 60) {
    items.push(`Flow efficiency at ${props.flowEfficiency}% — work spends most of its time in active development.`);
  }
  if (props.slaCompliance >= 80) {
    items.push(`SLA compliance at ${props.slaCompliance}% — resolution times consistently meet targets.`);
  }
  if (props.completenessScore >= 70) {
    items.push(`Data quality at ${props.completenessScore}% — bug reports are well-documented.`);
  }
  if (props.staleOpen === 0 && props.criticalOpen === 0) {
    items.push(`No stale or critical bugs — backlog is healthy and prioritized.`);
  }
  return items.slice(0, 3);
});

const needsAttention = computed(() => {
  const items: string[] = [];
  if (props.criticalOpen > 0) {
    items.push(`${props.criticalOpen} critical bugs remain open — prioritize resolution to prevent SLA breaches.`);
  }
  if (props.cycleTimeCv > 0.5) {
    items.push(`Cycle time CV at ${props.cycleTimeCv} — high variability means delivery dates are unreliable.`);
  }
  if (props.cycleTimeUcl > 0 && props.cycleTimeP95 > props.cycleTimeUcl) {
    items.push(`P95 (${props.cycleTimeP95}d) exceeds upper control limit (${props.cycleTimeUcl}d) — outliers need investigation.`);
  }
  if (props.wipCount > props.throughputPerWeek * 3) {
    items.push(`WIP (${props.wipCount}) is ${Math.round(props.wipCount / Math.max(props.throughputPerWeek, 1))}× weekly throughput — consider WIP limits.`);
  }
  if (props.unassignedOpen > 5) {
    items.push(`${props.unassignedOpen} bugs are unassigned — triage and assign ownership.`);
  }
  if (props.staleOpen > 0) {
    items.push(`${props.staleOpen} bugs have been stale >30 days — review for relevance or close.`);
  }
  if (props.completenessScore < 50) {
    items.push(`Data quality at ${props.completenessScore}% — enforce bug report templates to improve completeness.`);
  }
  if (props.mttrHours > 72) {
    items.push(`MTTR at ${props.mttrHours}h — resolution time exceeds 3-day target.`);
  }
  if (props.bugNetChange != null && props.bugNetChange > 5) {
    items.push(`Bug backlog growing (+${props.bugNetChange} net) — inflow exceeds outflow.`);
  }
  if (props.flowEfficiency < 30) {
    items.push(`Flow efficiency at ${props.flowEfficiency}% — too much time spent waiting vs. working.`);
  }
  return items.slice(0, 3);
});

const actions = computed(() => {
  const items: string[] = [];
  if (props.criticalOpen > 0 && props.unassignedOpen > 0) {
    items.push(`Assign and schedule resolution for ${props.criticalOpen} critical bugs this week.`);
  }
  if (props.cycleTimeCv > 0.5) {
    items.push(`Investigate causes of cycle-time outliers — review P95+ issues for common blockers.`);
  }
  if (props.wipCount > props.throughputPerWeek * 2) {
    items.push(`Implement WIP limits (suggested: ${Math.round(props.throughputPerWeek * 2)}) to reduce context switching.`);
  }
  if (props.staleOpen > 0) {
    items.push(`Run a backlog grooming session to close or reprioritize ${props.staleOpen} stale bugs.`);
  }
  if (props.completenessScore < 60) {
    items.push(`Enforce bug report templates — require description, environment, and assignee fields.`);
  }
  if (props.slaCompliance < 60) {
    items.push(`Review SLA breach patterns — focus on severity levels with lowest compliance.`);
  }
  if (props.bugNetChange != null && props.bugNetChange > 5) {
    items.push(`Increase resolution capacity or reduce inflow — backlog is growing unsustainably.`);
  }
  if (props.qualityScore < 60) {
    items.push(`Schedule a quality retrospective to identify root causes of low quality score.`);
  }
  return items.slice(0, 3);
});
</script>

<style scoped lang="scss">
.sa-panel {
  margin-top: 4px;
}

.sa-headline {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;

  &--good {
    background: rgba(103, 194, 58, 0.08);
    color: #135200;
  }
  &--warn {
    background: rgba(230, 162, 60, 0.08);
    color: #874d00;
  }
  &--bad {
    background: rgba(245, 108, 108, 0.08);
    color: #820014;
  }

  &__icon { font-size: 16px; }
}

.sa-section {
  padding: 12px 16px;
  border-radius: 8px;
  height: 100%;
  border-left: 3px solid transparent;

  &--good {
    background: rgba(103, 194, 58, 0.04);
    border-left-color: #67c23a;
  }
  &--warn {
    background: rgba(230, 162, 60, 0.04);
    border-left-color: #e6a23c;
  }
  &--action {
    background: rgba(64, 158, 255, 0.04);
    border-left-color: #409eff;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    .sa-section--good & { color: #389e0d; }
    .sa-section--warn & { color: #d46b08; }
    .sa-section--action & { color: #096dd9; }
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;

    li {
      font-size: 12px;
      line-height: 1.5;
      color: var(--el-text-color-regular);
      padding-left: 12px;
      position: relative;

      &::before {
        content: "·";
        position: absolute;
        left: 0;
        font-weight: 700;
        color: var(--el-text-color-placeholder);
      }
    }
  }

  &__empty {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    font-style: italic;
  }
}
</style>