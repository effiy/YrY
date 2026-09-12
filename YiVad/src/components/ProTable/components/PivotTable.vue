<template>
  <div class="pivot-table">
    <div class="pivot-table__config">
      <div class="pivot-table__config-item">
        <label>Row Field</label>
        <el-select v-model="rowField" size="small" placeholder="Select row field">
          <el-option v-for="f in fields" :key="f" :label="f" :value="f" />
        </el-select>
      </div>
      <div class="pivot-table__config-item">
        <label>Column Field</label>
        <el-select v-model="colField" size="small" placeholder="Select column field">
          <el-option v-for="f in fields" :key="f" :label="f" :value="f" />
        </el-select>
      </div>
      <div class="pivot-table__config-item">
        <label>Value Field</label>
        <el-select v-model="valueField" size="small" placeholder="Select value field">
          <el-option v-for="f in numericFields" :key="f" :label="f" :value="f" />
        </el-select>
      </div>
      <div class="pivot-table__config-item">
        <label>Aggregation</label>
        <el-select v-model="aggregation" size="small">
          <el-option label="Sum" value="sum" />
          <el-option label="Count" value="count" />
          <el-option label="Average" value="avg" />
          <el-option label="Max" value="max" />
          <el-option label="Min" value="min" />
        </el-select>
      </div>
    </div>
    <el-table v-if="pivotReady" :data="pivotData" border size="small">
      <el-table-column prop="__rowLabel" label="" width="120" fixed />
      <el-table-column v-for="c in pivotColumns" :key="c" :prop="c" :label="String(c)" align="right" />
    </el-table>
    <EmptyState v-else title="Configure pivot fields" description="Select row, column, and value fields above." />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import EmptyState from "@/components/EmptyState/EmptyState.vue";

const props = defineProps<{ data: Record<string, any>[]; fields: string[] }>();

const rowField = ref("");
const colField = ref("");
const valueField = ref("");
const aggregation = ref<"sum" | "count" | "avg" | "max" | "min">("sum");

const numericFields = computed(() => props.fields.filter((f) => props.data.some((r) => typeof r[f] === "number")));

const pivotReady = computed(() => rowField.value && colField.value && valueField.value);

const pivotResult = computed(() => {
  if (!pivotReady.value) return { columns: [], rows: [] };

  const rowValues = [...new Set(props.data.map((r) => String(r[rowField.value] ?? "")))].sort();
  const colValues = [...new Set(props.data.map((r) => String(r[colField.value] ?? "")))].sort();

  const cells = new Map<string, number[]>();
  props.data.forEach((r) => {
    const rk = String(r[rowField.value] ?? "");
    const ck = String(r[colField.value] ?? "");
    const v = Number(r[valueField.value]);
    const key = `${rk}::${ck}`;
    if (!cells.has(key)) cells.set(key, []);
    if (!isNaN(v)) cells.get(key)!.push(v);
  });

  const rows = rowValues.map((rv) => {
    const row: Record<string, any> = { __rowLabel: rv };
    colValues.forEach((cv) => {
      const vals = cells.get(`${rv}::${cv}`) ?? [];
      if (aggregation.value === "sum") row[cv] = vals.reduce((a, b) => a + b, 0);
      else if (aggregation.value === "count") row[cv] = vals.length;
      else if (aggregation.value === "avg") row[cv] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      else if (aggregation.value === "max") row[cv] = vals.length ? Math.max(...vals) : 0;
      else if (aggregation.value === "min") row[cv] = vals.length ? Math.min(...vals) : 0;
    });
    return row;
  });

  return { columns: colValues, rows };
});

const pivotColumns = computed(() => pivotResult.value.columns);
const pivotData = computed(() => pivotResult.value.rows);
</script>

<style scoped lang="scss">
.pivot-table {
  &__config {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    &-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      label { font-size: 12px; font-weight: 500; }
    }
  }
}
</style>