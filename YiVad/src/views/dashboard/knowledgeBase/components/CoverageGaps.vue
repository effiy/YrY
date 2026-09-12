<script setup lang="ts">
import { computed, ref } from "vue";
import { catColor } from "../utils";

const props = defineProps<{
  data: {
    module: string;
    category: string;
    name: string;
    fileCount: number;
    noStatus: number;
    noType: number;
    noLifecycle: number;
    noReview: number;
    noRoles: number;
    noTags: number;
    totalGaps: number;
  }[];
}>();

const emit = defineEmits<{
  (e: "drillGap", category: string, module: string, field: string): void;
}>();

const sortField = ref("totalGaps");
const sortDir = ref<"asc" | "desc">("desc");

const sortedData = computed(() => {
  const d = [...props.data];
  d.sort((a: any, b: any) => {
    const va = a[sortField.value] ?? 0;
    const vb = b[sortField.value] ?? 0;
    return sortDir.value === "asc" ? va - vb : vb - va;
  });
  return d;
});

const columns = [
  { key: "module", label: "Module", sortable: false },
  { key: "noStatus", label: "No Status", sortable: true },
  { key: "noType", label: "No Type", sortable: true },
  { key: "noLifecycle", label: "No Lifecycle", sortable: true },
  { key: "noReview", label: "No Review", sortable: true },
  { key: "noRoles", label: "No Roles", sortable: true },
  { key: "noTags", label: "No Tags", sortable: true },
  { key: "totalGaps", label: "Total Gaps", sortable: true },
];

function onSort(key: string) {
  if (sortField.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = key;
    sortDir.value = "desc";
  }
}

function gapClass(count: number) {
  if (count === 0) return "gap-none";
  if (count <= 3) return "gap-low";
  if (count <= 10) return "gap-med";
  return "gap-high";
}

const FIELD_MAP: Record<string, string> = {
  noStatus: "status",
  noType: "type",
  noLifecycle: "lifecycle",
  noReview: "review_cycle",
  noRoles: "roles",
  noTags: "tags",
};
</script>

<template>
  <div class="coverage-gaps">
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
        <tr v-for="row in sortedData.slice(0, 20)" :key="row.module">
          <td>
            <span class="cat-dot" :style="{ background: catColor(row.category) }"></span>
            <span class="gap-module-name">{{ row.name }}</span>
            <span class="gap-file-count">({{ row.fileCount }})</span>
          </td>
          <td
            v-for="col in columns.slice(1)"
            :key="col.key"
            class="num"
            :class="[
              gapClass((row as any)[col.key]),
              { clickable: (row as any)[col.key] > 0 },
            ]"
            @click="(row as any)[col.key] > 0 ? emit('drillGap', row.category, row.name, FIELD_MAP[col.key]) : undefined"
          >
            {{ (row as any)[col.key] || "—" }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.coverage-gaps {
  overflow-x: auto;
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    th, td {
      padding: 3px 8px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      text-align: left;
      white-space: nowrap;
    }
    th {
      color: #909399;
      font-weight: 500;
      font-size: 10px;
      background: var(--el-fill-color-light);
      &.sortable { cursor: pointer; user-select: none; }
      &.active { color: var(--el-color-primary); }
    }
    td { color: #303133; }
    tr {
      transition: background 0.1s;
      &:hover { background: var(--el-fill-color-light); }
    }
  }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .gap-none { color: #c0c4cc; }
  .gap-low { color: #e6a23c; }
  .gap-med { color: #e6a23c; font-weight: 600; }
  .gap-high { color: #f56c6c; font-weight: 700; }
  .clickable { cursor: pointer; &:hover { text-decoration: underline; } }
  .sort-arrow { font-size: 9px; margin-left: 2px; }
  .cat-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
    flex-shrink: 0;
  }
  .gap-module-name { color: #303133; }
  .gap-file-count { font-size: 10px; color: #909399; margin-left: 4px; }
}
</style>
