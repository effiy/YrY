<template>
  <component
    :is="column.search?.render ?? componentMap[column.search?.el ?? 'input']"
    v-bind="{ ...handleSearchProps, ...placeholder, searchParam: _searchParam, clearable }"
    v-model.trim="_searchParam[column.search?.key ?? handleProp(column.prop!)]"
    :data="column.search?.el === 'tree-select' ? columnEnum : []"
    :options="['cascader', 'select-v2'].includes(column.search?.el!) ? columnEnum : []"
  >
    <template v-if="column.search?.el === 'cascader'" #default="{ data }">
      <span>{{ data[fieldNames.label] }}</span>
    </template>
    <template v-if="column.search?.el === 'select'">
      <component
        :is="ElOption"
        v-for="(col, index) in columnEnum"
        :key="index"
        :label="col[fieldNames.label]"
        :value="col[fieldNames.value]"
      ></component>
    </template>
    <slot v-else></slot>
  </component>
</template>

<script setup lang="ts" name="SearchFormItem">
import { computed, inject, ref } from "vue";
import { ElInput, ElSelect, ElOption, ElTreeSelect, ElDatePicker, ElCascader, ElSelectV2 } from "element-plus";
import { handleProp } from "@/utils";
import { ColumnProps } from "@/components/ProTable/interface";

// Map `search.el` (string from column config) to the actual EP component.
// unplugin-vue-components only auto-imports statically-detectable tags, so
// `<component :is="`el-${search.el}`">` evades its scan — passing the component
// object directly sidesteps string resolution entirely.
const componentMap: Record<string, any> = {
  input: ElInput,
  select: ElSelect,
  "tree-select": ElTreeSelect,
  "date-picker": ElDatePicker,
  cascader: ElCascader,
  "select-v2": ElSelectV2
};

interface SearchFormItem {
  column: ColumnProps;
  searchParam: { [key: string]: any };
}
const props = defineProps<SearchFormItem>();

// Re receive SearchParam
const _searchParam = computed(() => props.searchParam);

// Determine fieldNames key values for label, value, children
const fieldNames = computed(() => {
  return {
    label: props.column.fieldNames?.label ?? "label",
    value: props.column.fieldNames?.value ?? "value",
    children: props.column.fieldNames?.children ?? "children"
  };
});

// Receive enumMap (select-v2 needs separate enumData handling)
const enumMap = inject("enumMap", ref(new Map()));
const columnEnum = computed(() => {
  let enumData = enumMap.value.get(props.column.prop);
  if (!enumData) return [];
  if (props.column.search?.el === "select-v2" && props.column.fieldNames) {
    enumData = enumData.map((item: { [key: string]: any }) => {
      return { ...item, label: item[fieldNames.value.label], value: item[fieldNames.value.value] };
    });
  }
  return enumData;
});

// Process forwarded searchProps (tree-select/cascader need default label, value, children)
const handleSearchProps = computed(() => {
  const label = fieldNames.value.label;
  const value = fieldNames.value.value;
  const children = fieldNames.value.children;
  const searchEl = props.column.search?.el;
  let searchProps = props.column.search?.props ?? {};
  if (searchEl === "tree-select") {
    searchProps = { ...searchProps, props: { ...searchProps, label, children }, nodeKey: value };
  }
  if (searchEl === "cascader") {
    searchProps = { ...searchProps, props: { ...searchProps, label, value, children } };
  }
  return searchProps;
});

// Process default placeholder
const placeholder = computed(() => {
  const search = props.column.search;
  if (["datetimerange", "daterange", "monthrange"].includes(search?.props?.type) || search?.props?.isRange) {
    return {
      rangeSeparator: search?.props?.rangeSeparator ?? "to",
      startPlaceholder: search?.props?.startPlaceholder ?? "Start time",
      endPlaceholder: search?.props?.endPlaceholder ?? "End time"
    };
  }
  const placeholder = search?.props?.placeholder ?? (search?.el?.includes("input") ? "Please enter" : "Please select");
  return { placeholder };
});

// Whether to show clear button (hidden when search item has default value)
const clearable = computed(() => {
  const search = props.column.search;
  return search?.props?.clearable ?? (search?.defaultValue == null || search?.defaultValue == undefined);
});
</script>
