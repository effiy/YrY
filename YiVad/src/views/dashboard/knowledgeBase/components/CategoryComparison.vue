<script setup lang="ts">
import { computed, ref } from "vue";
import { TrendCharts } from "@element-plus/icons-vue";
import { catColor } from "../utils";

const props = defineProps<{
  data: {
    name: string;
    files: number;
    modules: number;
    coverage: number;
    stale: number;
    tacit: number;
    quality: number;
    topStatus: string;
    topType: string;
  }[];
  activeCategory: string;
}>();

const emit = defineEmits<{
  (e: "selectCategory", name: string): void;
}>();

const sortField = ref("files");
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

function onSort(field: string) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDir.value = "desc";
  }
}

const columns = [
  { key: "name", label: "Category", width: "130" },
  { key: "files", label: "Files", width: "60" },
  { key: "modules", label: "Modules", width: "70" },
  { key: "coverage", label: "Coverage", width: "80" },
  { key: "stale", label: "Stale", width: "60" },
  { key: "tacit", label: "Tacit", width: "60" },
  { key: "quality", label: "Quality", width: "70" },
  { key: "topStatus", label: "Top Status", width: "90" },
  { key: "topType", label: "Top Type", width: "80" },
];

function coverageBarStyle(pct: number) {
  let color = "#f56c6c";
  if (pct >= 80) color = "#67c23a";
  else if (pct >= 50) color = "#e6a23c";
  return { width: pct + "%", background: color };
}

function qualityColor(pct: number) {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}
</script>

<template>
  <div class="cat-compact-table">
    <table>
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="{ width: col.width }"
            :class="{ sortable: col.key !== 'name', active: sortField === col.key }"
            @click="col.key !== 'name' ? onSort(col.key) : undefined"
          >
            {{ col.label }}
            <span v-if="sortField === col.key" class="sort-arrow">{{ sortDir === "asc" ? "↑" : "↓" }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in sortedData"
          :key="row.name"
          :class="{ 'row-active': row.name === activeCategory }"
          @click="emit('selectCategory', row.name)"
        >
          <td>
            <span class="cat-dot" :style="{ background: catColor(row.name) }"></span>
            {{ row.name }}
          </td>
          <td class="num">{{ row.files }}</td>
          <td class="num">{{ row.modules }}</td>
          <td>
            <div class="mini-bar-wrap">
              <div class="mini-bar" :style="coverageBarStyle(row.coverage)"></div>
            </div>
            <span class="mini-val">{{ row.coverage }}%</span>
          </td>
          <td class="num" :class="{ 'text-warn': row.stale > 0 }">{{ row.stale || "—" }}</td>
          <td class="num" :class="{ 'text-tacit': row.tacit > 0 }">{{ row.tacit || "—" }}</td>
          <td class="num">
            <span :style="{ color: qualityColor(row.quality), fontWeight: 600 }">{{ row.quality }}%</span>
          </td>
          <td class="cell-tag">{{ row.topStatus }}</td>
          <td class="cell-tag text-muted">{{ row.topType }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.cat-compact-table {
  overflow-x: auto;
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    th, td {
      padding: 4px 8px;
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
      cursor: pointer;
      transition: background 0.1s;
      &:hover { background: var(--el-color-primary-light-9); }
      &.row-active { background: var(--el-color-primary-light-8); }
    }
  }
  .cat-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    flex-shrink: 0;
  }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .sort-arrow { font-size: 9px; margin-left: 2px; }
  .mini-bar-wrap {
    display: inline-block;
    width: 50px;
    height: 6px;
    background: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;
    vertical-align: middle;
    margin-right: 4px;
  }
  .mini-bar {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s;
  }
  .mini-val {
    font-size: 10px;
    color: #606266;
    vertical-align: middle;
  }
  .text-warn { color: #e6a23c; font-weight: 600; }
  .text-tacit { color: #9a60b4; font-weight: 600; }
  .text-muted { color: #909399; }
  .cell-tag { font-size: 10px; }
}
</style>
