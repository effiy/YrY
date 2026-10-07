<template>
  <div v-if="insights.length" class="insights-bar">
    <div
      v-for="(item, i) in insights"
      :key="i"
      class="ib-item"
      :class="`ib-item--${item.level}`"
    >
      <span class="ib-item__icon">{{ item.icon }}</span>
      <span class="ib-item__text">{{ item.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Insight {
  icon: string;
  text: string;
  level: "good" | "warn" | "bad" | "info";
}

interface Props {
  qualityTrendDelta: number;
  qualityTrendDirection: string;
  criticalOpen: number;
  unassignedOpen: number;
  staleOpen: number;
  flowEfficiency: number;
  wipCount: number;
  cycleTimeP50: number;
  cycleTimeP95: number;
  cycleTimeUcl: number;
  cycleTimeCv: number;
  slaCompliance: number;
  predictability: number;
  completenessScore: number;
  bugNetChange: number | null;
}

const props = defineProps<Props>();

const insights = computed<Insight[]>(() => {
  const items: Insight[] = [];

  // Quality direction
  if (Math.abs(props.qualityTrendDelta) > 2) {
    const dir = props.qualityTrendDelta > 0 ? "improving" : "declining";
    items.push({
      icon: dir === "improving" ? "▲" : "▼",
      text: `Quality ${dir === "improving" ? "improving" : "declining"} ${Math.abs(props.qualityTrendDelta)}pts`,
      level: dir === "improving" ? "good" : "bad",
    });
  } else {
    items.push({
      icon: "●",
      text: "Quality score stable",
      level: "info",
    });
  }

  // Critical bugs
  if (props.criticalOpen > 0) {
    const extra = props.unassignedOpen > 0 ? ` · ${props.unassignedOpen} unassigned` : "";
    items.push({
      icon: "⚠",
      text: `${props.criticalOpen} critical bugs open${extra}`,
      level: props.criticalOpen > 3 ? "bad" : "warn",
    });
  }

  // Stale bugs
  if (props.staleOpen > 0) {
    items.push({
      icon: "⏳",
      text: `${props.staleOpen} bugs stale >30 days`,
      level: props.staleOpen > 5 ? "bad" : "warn",
    });
  }

  // Net flow
  if (props.bugNetChange != null) {
    if (props.bugNetChange > 5) {
      items.push({
        icon: "📈",
        text: `Bug backlog growing (+${props.bugNetChange} net) — inflow exceeds outflow`,
        level: "warn",
      });
    } else if (props.bugNetChange < -5) {
      items.push({
        icon: "📉",
        text: `Bug backlog shrinking (${props.bugNetChange} net) — outflow exceeds inflow`,
        level: "good",
      });
    }
  }

  // Flow debt / WIP
  const flowDebt = Math.round(props.wipCount * props.cycleTimeP50);
  if (flowDebt > 200) {
    items.push({
      icon: "🔴",
      text: `Flow debt ${flowDebt} item-days — WIP (${props.wipCount}) × Cycle Time (${props.cycleTimeP50}d)`,
      level: "bad",
    });
  } else if (flowDebt > 100) {
    items.push({
      icon: "🟡",
      text: `Flow debt ${flowDebt} item-days — consider WIP limits`,
      level: "warn",
    });
  }

  // Process stability
  if (props.cycleTimeCv > 0.5) {
    items.push({
      icon: "📊",
      text: `High cycle time variability (CV=${props.cycleTimeCv}) — process unstable`,
      level: props.cycleTimeCv > 0.8 ? "bad" : "warn",
    });
  }

  // P95 vs UCL
  if (props.cycleTimeUcl > 0 && props.cycleTimeP95 > props.cycleTimeUcl) {
    items.push({
      icon: "🔺",
      text: `P95 (${props.cycleTimeP95}d) exceeds UCL (${props.cycleTimeUcl}d) — outliers detected`,
      level: "warn",
    });
  }

  // SLA
  if (props.slaCompliance < 60) {
    items.push({
      icon: "❗",
      text: `SLA compliance ${props.slaCompliance}% — below acceptable threshold`,
      level: "bad",
    });
  }

  // Predictability
  if (props.predictability < 40) {
    items.push({
      icon: "🎲",
      text: `Low predictability (${props.predictability}%) — delivery dates unreliable`,
      level: "bad",
    });
  }

  // Data quality
  if (props.completenessScore < 50) {
    items.push({
      icon: "📋",
      text: `Data quality ${props.completenessScore}% — bug fields incomplete`,
      level: "warn",
    });
  }

  return items.slice(0, 6);
});
</script>

<style scoped lang="scss">
.insights-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.ib-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;

  &--good {
    background: rgba(103, 194, 58, 0.08);
    color: #389e0d;
  }
  &--warn {
    background: rgba(230, 162, 60, 0.08);
    color: #d46b08;
  }
  &--bad {
    background: rgba(245, 108, 108, 0.08);
    color: #cf1322;
  }
  &--info {
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
  }

  &__icon {
    font-size: 11px;
    flex-shrink: 0;
  }
}
</style>