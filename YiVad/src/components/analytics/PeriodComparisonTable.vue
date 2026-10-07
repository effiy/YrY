<template>
  <div class="pct-wrap">
    <table class="pct-table">
      <thead>
        <tr>
          <th class="pct-table__metric">Metric</th>
          <th class="pct-table__val">Current</th>
          <th class="pct-table__val">Previous</th>
          <th class="pct-table__change">Change</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.metric">
          <td class="pct-table__metric">
            <span class="pct-metric__icon">{{ row.icon }}</span>
            {{ row.metric }}
          </td>
          <td class="pct-table__val pct-table__val--current">{{ row.current }}</td>
          <td class="pct-table__val pct-table__val--prev">{{ row.previous }}</td>
          <td class="pct-table__change">
            <span :class="changeClass(row)">{{ changeText(row) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface CompareRow {
  icon: string;
  metric: string;
  current: string;
  previous: string;
  changePct: number | null;   // positive = better, negative = worse
  inverted: boolean;           // true if lower is better
}

interface Props {
  rows: CompareRow[];
}

const props = defineProps<Props>();

const rows = computed(() => props.rows);

function changeText(row: CompareRow): string {
  if (row.changePct == null) return "—";
  const sign = row.changePct >= 0 ? "+" : "";
  return `${sign}${row.changePct}%`;
}

function changeClass(row: CompareRow): string {
  if (row.changePct == null) return "pct-change--neutral";
  const isGood = row.inverted ? row.changePct <= 0 : row.changePct >= 0;
  if (Math.abs(row.changePct) < 3) return "pct-change--neutral";
  return isGood ? "pct-change--good" : "pct-change--bad";
}
</script>

<style scoped lang="scss">
.pct-wrap {
  overflow-x: auto;
}

.pct-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    padding: 8px 12px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  td {
    padding: 7px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    white-space: nowrap;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: var(--el-fill-color-lighter);
  }

  &__metric {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  &__val {
    font-variant-numeric: tabular-nums;
    font-weight: 600;

    &--current {
      color: var(--el-text-color-primary);
    }

    &--prev {
      color: var(--el-text-color-placeholder);
      font-weight: 400;
    }
  }

  &__change {
    font-variant-numeric: tabular-nums;
  }
}

.pct-metric__icon {
  font-size: 12px;
  margin-right: 4px;
}

.pct-change {
  &--good {
    color: #389e0d;
    font-weight: 600;
  }
  &--bad {
    color: #cf1322;
    font-weight: 600;
  }
  &--neutral {
    color: var(--el-text-color-placeholder);
  }
}
</style>