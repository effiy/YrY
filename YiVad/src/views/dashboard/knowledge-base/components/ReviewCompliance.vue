<script setup lang="ts">
import { computed, ref } from "vue";
import { reviewCycleTagType, REVIEW_CYCLE_DAYS } from "../utils";

const props = defineProps<{
  data: {
    cycle: string;
    total: number;
    overdue: number;
    onTrack: number;
    compliance: number;
  }[];
}>();

const emit = defineEmits<{
  (e: "selectCycle", cycle: string): void;
}>();

const sortField = ref("compliance");
const sortDir = ref<"asc" | "desc">("asc");

const sortedData = computed(() => {
  const d = [...props.data];
  d.sort((a: any, b: any) => {
    const va = a[sortField.value] ?? 0;
    const vb = b[sortField.value] ?? 0;
    return sortDir.value === "asc" ? va - vb : vb - va;
  });
  return d;
});

function onSort(field: string) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDir.value = field === "compliance" ? "asc" : "desc";
  }
}

function complianceColor(pct: number): string {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}

function complianceBg(pct: number): string {
  if (pct >= 80) return "#f0f9eb";
  if (pct >= 50) return "#fdf6ec";
  return "#fef0f0";
}

const columns = [
  { key: "cycle", label: "Review Cycle", sortable: false },
  { key: "total", label: "Files", sortable: true },
  { key: "overdue", label: "Overdue", sortable: true },
  { key: "onTrack", label: "On Track", sortable: true },
  { key: "compliance", label: "Compliance", sortable: true }
];
</script>

<template>
  <div class="review-compliance">
    <table>
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="{ sortable: col.sortable, active: sortField === col.key }"
            @click="col.sortable ? onSort(col.key) : undefined"
          >
            {{ col.label }}
            <span v-if="sortField === col.key" class="sort-arrow">{{ sortDir === "asc" ? "↑" : "↓" }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in sortedData" :key="row.cycle" @click="emit('selectCycle', row.cycle)">
          <td>
            <el-tag :type="reviewCycleTagType(row.cycle)" size="small">{{ row.cycle }}</el-tag>
          </td>
          <td class="num">{{ row.total }}</td>
          <td class="num" :class="{ 'text-danger': row.overdue > 0 }">{{ row.overdue || "—" }}</td>
          <td class="num">{{ row.onTrack }}</td>
          <td class="num">
            <span
              class="rc-compliance-badge"
              :style="{
                color: complianceColor(row.compliance),
                background: complianceBg(row.compliance)
              }"
            >
              {{ row.compliance }}%
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.review-compliance {
  overflow-x: auto;
  table {
    width: 100%;
    font-size: 11px;
    border-collapse: collapse;
    th,
    td {
      padding: 4px 8px;
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
    th {
      font-size: 10px;
      font-weight: 500;
      color: #909399;
      background: var(--el-fill-color-light);
      &.sortable {
        cursor: pointer;
        user-select: none;
      }
      &.active {
        color: var(--el-color-primary);
      }
    }
    td {
      color: #303133;
    }
    tr {
      cursor: pointer;
      transition: background 0.1s;
      &:hover {
        background: var(--el-color-primary-light-9);
      }
    }
  }
  .num {
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
  .sort-arrow {
    margin-left: 2px;
    font-size: 9px;
  }
  .text-danger {
    font-weight: 600;
    color: #f56c6c;
  }
  .rc-compliance-badge {
    display: inline-block;
    padding: 1px 8px;
    font-size: 10px;
    font-weight: 600;
    border-radius: 10px;
  }
}
</style>
