<template>
  <div class="card content-box">
    <span class="text">SearchForm Demo</span>
    <el-alert
      title="SearchForm is the canonical search bar used with ProTable. Renders a responsive grid of form items with search/reset/collapse controls. It can also be used standalone."
      type="warning"
      :closable="false"
    />

    <SearchForm
      :columns="columns"
      :search-param="searchParam"
      :search-col="{ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }"
      :search="onSearch"
      :reset="onReset"
    />

    <el-card shadow="hover" class="mt30">
      <template #header>Search Result</template>
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="(val, key) in lastSearch" :key="key" :label="String(key)">
          {{ val === "" || val === null || val === undefined ? "—" : String(val) }}
        </el-descriptions-item>
      </el-descriptions>
      <el-empty v-if="Object.keys(lastSearch).length === 0" description="Click Search to see params" :image-size="60" />
    </el-card>

    <el-descriptions title="Props" :column="1" border class="mt30">
      <el-descriptions-item label="columns">ColumnProps[] — search column definitions (same as ProTable columns)</el-descriptions-item>
      <el-descriptions-item label="searchParam">{} — reactive search params object</el-descriptions-item>
      <el-descriptions-item label="searchCol">number | Record — responsive grid columns</el-descriptions-item>
      <el-descriptions-item label="search">(params) => void — search callback</el-descriptions-item>
      <el-descriptions-item label="reset">(params) => void — reset callback</el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="ColumnProps Search Config" :column="1" border class="mt30">
      <el-descriptions-item label="search.el">"input" | "select" | "tree-select" | "cascader" | "date-picker" | "time-picker" | "input-number" | "switch"</el-descriptions-item>
      <el-descriptions-item label="search.props">Record — element props passed to the form item</el-descriptions-item>
      <el-descriptions-item label="search.order">number — field order</el-descriptions-item>
      <el-descriptions-item label="search.label">string — label override</el-descriptions-item>
      <el-descriptions-item label="search.tooltip">string — tooltip on label</el-descriptions-item>
      <el-descriptions-item label="search.defaultValue">any — default search value</el-descriptions-item>
    </el-descriptions>
    <el-alert title="Note" type="info" :closable="false" class="mt30">
      SearchForm is typically used within ProTable (auto-generated from columns with search config). It can also be used standalone by passing the same ColumnProps array.
    </el-alert>
  </div>
</template>

<script setup lang="ts" name="componentDemoSearchForm">
import { reactive, ref } from "vue";
import SearchForm from "@/components/SearchForm/index.vue";
import type { ColumnProps } from "@/components/ProTable/interface";

const lastSearch = ref<Record<string, any>>({});

const searchParam = reactive<Record<string, any>>({
  keyword: "",
  status: "",
  dateRange: [],
  minAge: undefined,
  active: true,
});

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
];

const columns: ColumnProps[] = [
  {
    prop: "keyword",
    label: "Keyword",
    search: { el: "input", order: 1, props: { placeholder: "Search by name/email" } },
  },
  {
    prop: "status",
    label: "Status",
    search: { el: "select", order: 2, props: { options: statusOptions, placeholder: "Select status" } },
  },
  {
    prop: "dateRange",
    label: "Date Range",
    search: {
      el: "date-picker",
      order: 3,
      key: "dateRange",
      props: { type: "daterange", "range-separator": "to", "start-placeholder": "Start", "end-placeholder": "End" },
    },
  },
  {
    prop: "minAge",
    label: "Min Age",
    search: { el: "input-number", order: 4, props: { min: 0, max: 150, placeholder: "Min age" } },
  },
  {
    prop: "active",
    label: "Active Only",
    search: { el: "switch", order: 5, key: "active" },
  },
];

const onSearch = () => {
  lastSearch.value = { ...searchParam };
};

const onReset = () => {
  lastSearch.value = {};
};
</script>

<style scoped lang="scss">
.mt30 { margin-top: 30px; }
</style>