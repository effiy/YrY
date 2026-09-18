<!-- 📚📚📚 Pro-Table Docs: https://juejin.cn/post/7166068828202336263 -->

<template>
  <div>
    <!-- Search Form -->
    <SearchForm
      v-show="isShowSearch"
      :search="_search"
      :reset="_reset"
      :columns="searchColumns"
      :search-param="searchParam"
      :search-col="searchCol"
    />

    <!-- Table Body -->
    <div class="card table-main">
      <!-- Table Header Action Buttons -->
      <div class="table-header">
        <div class="header-button-lf">
          <slot name="tableHeader" :selected-list="selectedList" :selected-list-ids="selectedListIds" :is-selected="isSelected" />
        </div>
        <div v-if="toolButton || headerPagination" class="header-button-ri">
          <Pagination
            v-if="headerPagination"
            :pageable="pageable"
            :handle-size-change="handleSizeChange"
            :handle-current-change="handleCurrentChange"
          />
          <template v-if="toolButton">
            <slot name="toolButton">
              <el-button v-if="showToolButton('refresh')" :icon="Refresh" circle @click="getTableList" />
              <el-button v-if="showToolButton('setting') && columns.length" :icon="Operation" circle @click="openColSetting" />
              <el-button
                v-if="showToolButton('search') && searchColumns?.length"
                :icon="Search"
                circle
                @click="isShowSearch = !isShowSearch"
              />
              <el-dropdown v-if="showToolButton('export')" trigger="click" @command="handleExport">
                <el-button :icon="Download" :loading="exporting" circle />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="fmt in props.exportFormats" :key="fmt" :command="fmt">{{
                      fmt.toUpperCase()
                    }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </slot>
          </template>
        </div>
      </div>
      <!-- Table Body -->
      <el-table
        ref="tableRef"
        v-bind="$attrs"
        :id="uuid"
        :data="processTableData"
        :border="border"
        :show-header="showHeader"
        :row-key="rowKey"
        @selection-change="selectionChange"
      >
        <!-- Default Slot -->
        <slot />
        <template v-for="(item, index) in tableColumns" :key="item.prop ?? item.type ?? index">
          <!-- selection || radio || index || expand || sort -->
          <el-table-column
            v-if="item.type && columnTypes.includes(item.type)"
            v-bind="item"
            :align="item.align ?? 'center'"
            :reserve-selection="item.type == 'selection'"
          >
            <template #default="scope">
              <!-- expand -->
              <template v-if="item.type == 'expand'">
                <component :is="item.render" v-bind="scope" v-if="item.render" />
                <slot v-else :name="item.type" v-bind="scope" />
              </template>
              <!-- radio -->
              <el-radio v-if="item.type == 'radio'" v-model="radio" :label="scope.row[rowKey]">
                <i></i>
              </el-radio>
              <!-- sort -->
              <el-tag v-if="item.type == 'sort'" class="move">
                <el-icon> <DCaret /></el-icon>
              </el-tag>
            </template>
          </el-table-column>
          <!-- other -->
          <TableColumn v-else :column="item">
            <template v-for="slot in Object.keys($slots)" #[slot]="scope">
              <slot :name="slot" v-bind="scope" />
            </template>
          </TableColumn>
        </template>
        <!-- Slot After Last Table Row -->
        <template #append>
          <slot name="append" />
        </template>
        <!-- No Data -->
        <template #empty>
          <div class="table-empty">
            <slot name="empty">
              <img src="@/assets/images/notData.png" alt="notData" />
              <div>No data</div>
            </slot>
          </div>
        </template>
      </el-table>
      <!-- Pagination Component -->
      <slot name="pagination">
        <Pagination
          v-if="pagination && !headerPagination"
          :pageable="pageable"
          :handle-size-change="handleSizeChange"
          :handle-current-change="handleCurrentChange"
        />
      </slot>
    </div>
    <!-- Column Settings -->
    <ColSetting v-if="toolButton" ref="colRef" v-model:col-setting="colSetting" />
  </div>
</template>

<script setup lang="ts" name="ProTable">
import { ref, watch, provide, onMounted, unref, computed, reactive } from "vue";
import { ElTable } from "element-plus";
import { Refresh, Operation, Search, Download } from "@element-plus/icons-vue";
import { useTable } from "@/hooks/useTable";
import { useSelection } from "@/hooks/useSelection";
import { useTableState } from "@/hooks/useTableState";
import { useColumnManager } from "@/hooks/useColumnManager";
import { useRowSelection } from "@/hooks/useRowSelection";
import { useTableExport } from "@/hooks/useTableExport";
import type { ColumnConfig } from "@/hooks/useColumnManager";
import type { ExportFormat } from "@/utils/export/types";
import { BreakPoint } from "@/components/Grid/interface";
import { ColumnProps, TypeProps } from "@/components/ProTable/interface";
import { generateUUID, handleProp } from "@/utils";
import SearchForm from "@/components/SearchForm/index.vue";
import Pagination from "./components/Pagination.vue";
import ColSetting from "./components/ColSetting.vue";
import TableColumn from "./components/TableColumn.vue";
import Sortable from "sortablejs";

export interface ProTableProps {
  columns?: ColumnProps[]; // Column config with sensible defaults
  data?: any[]; // Static table data, if provided, requestApi return data is not used ==> optional
  requestApi?: (params: any) => Promise<any>; // API to request table data ==> optional
  requestAuto?: boolean; // Whether to auto-execute the request API ==> optional (default true)
  requestError?: (params: any) => void; // Table API request error listener ==> optional
  dataCallback?: (data: any) => any; // Callback to process returned data ==> optional
  title?: string; // Table title ==> optional
  pagination?: boolean; // Whether to show pagination component ==> optional (default true)
  headerPagination?: boolean; // Render pagination inside the header row (right side) instead of below the table ==> optional (default false)
  initParam?: any; // Initial request params ==> optional (default {})
  border?: boolean; // Whether to show vertical borders ==> optional (default true)
  toolButton?: ("refresh" | "setting" | "search" | "export")[] | boolean; // Whether to show table tool buttons ==> optional (default true)
  rowKey?: string; // Row data key, used to optimize Table rendering, the specified id for multi-select ==> optional (default id)
  searchCol?: number | Record<BreakPoint, number>; // Search item column ratio config ==> optional { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }
  defaultPageSize?: number; // Default page size ==> optional (default 50)
  showHeader?: boolean; // Whether to show table header row ==> optional (default true)
  // ── New opt-in capabilities ──
  storageKey?: string; // Key for state/column persistence (enables useTableState + useColumnManager when set)
  enableExport?: boolean; // Show export button in toolbar
  exportFormats?: ExportFormat[]; // Export formats to offer (default: all)
}

// Accept parent component params, configure defaults
const props = withDefaults(defineProps<ProTableProps>(), {
  columns: () => [],
  requestAuto: true,
  pagination: true,
  headerPagination: false,
  initParam: {},
  border: true,
  toolButton: true,
  rowKey: "id",
  searchCol: () => ({ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }),
  defaultPageSize: 50,
  showHeader: true,
  exportFormats: () => ["csv", "xlsx", "json", "pdf"]
});

// ── New capability: State persistence ──
const tableState = props.storageKey ? useTableState(props.storageKey, { pageSize: props.defaultPageSize }) : null;

// ── New capability: Column manager ──
const defaultColumns: ColumnConfig[] = props.columns.map((c, i) => ({
  key: c.prop || `col-${i}`,
  label: unref(c.label) || "",
  visible: unref(c.isShow) ?? true,
  width: typeof c.width === "number" ? c.width : undefined,
  order: i,
  fixed: c.fixed as "left" | "right" | undefined,
  sortable: !!unref(c.sortable)
}));

const columnManager = props.storageKey ? useColumnManager(props.storageKey, defaultColumns) : null;

// ── New capability: Export ──
const { exporting, exportProgress, exportData, shouldUseServerExport } = useTableExport();

// Table instance
const tableRef = ref<any>();

// Generate unique component id
const uuid = ref("id-" + generateUUID());

// Column types
const columnTypes: TypeProps[] = ["selection", "radio", "index", "expand", "sort"];

// Whether to show search module
const isShowSearch = ref(true);

// Control ToolButton visibility
const showToolButton = (key: "refresh" | "setting" | "search" | "export") => {
  if (key === "export") return props.enableExport === true;
  return Array.isArray(props.toolButton) ? props.toolButton.includes(key) : props.toolButton;
};

// Radio value
const radio = ref("");

// Table multi-select hooks
const { selectionChange, selectedList, selectedListIds, isSelected } = useSelection(props.rowKey);

// Table operation hooks
const { tableData, pageable, searchParam, searchInitParam, getTableList, search, reset, handleSizeChange, handleCurrentChange } =
  useTable(props.requestApi, props.initParam, props.pagination, props.dataCallback, props.requestError, props.defaultPageSize);

// Clear selected data list
const clearSelection = () => tableRef.value!.clearSelection();

// ── State persistence: restored inside onMounted to avoid prop mutation ──

// ── Export handler ──
const handleExport = async (format: ExportFormat) => {
  const rows = processTableData.value;
  const cols = columnManager
    ? columnManager.visibleColumns.value.map(c => ({ key: c.key, label: c.label }))
    : tableColumns
        .filter(c => !columnTypes.includes(c.type!) && c.prop !== "operation")
        .map(c => ({ key: c.prop!, label: c.label! }));
  await exportData({
    data: rows,
    columns: cols,
    format,
    fileName: `${props.title || "export"}_${new Date().toISOString().slice(0, 10)}`
  });
};

// ── State sync: watch table changes and persist ──
watch(
  () => ({ pageNum: pageable.value.pageNum, pageSize: pageable.value.pageSize }),
  val => {
    if (tableState) {
      tableState.updateState({ pageNum: val.pageNum, pageSize: val.pageSize });
    }
  }
);

// Initialize table data && drag sort
onMounted(() => {
  // Restore saved table state (filters, sort, pagination)
  if (tableState) {
    tableState.restore();
    const restored = tableState.state;
    const merged = { ...props.initParam };
    if (restored.pageNum > 1) merged.pageNum = restored.pageNum;
    if (restored.pageSize && restored.pageSize !== props.defaultPageSize) merged.pageSize = restored.pageSize;
    if (restored.sortField) {
      merged.sortField = restored.sortField;
      merged.sortOrder = restored.sortOrder;
    }
    if (Object.keys(restored.filters).length > 0) {
      Object.assign(merged, restored.filters);
    }
    emit("update:initParam", merged);
  }
  dragSort();
  props.requestAuto && getTableList();
  props.data && (pageable.value.total = props.data.length);
});

// Process table data
const processTableData = computed(() => {
  if (!props.data) return tableData.value;
  if (!props.pagination) return props.data;
  return props.data.slice(
    (pageable.value.pageNum - 1) * pageable.value.pageSize,
    pageable.value.pageSize * pageable.value.pageNum
  );
});

// Watch page initParam changes, re-fetch table data
watch(() => props.initParam, getTableList, { deep: true });

// Accept columns and make reactive
const tableColumns = reactive<ColumnProps[]>(props.columns);

// Apply column manager visibility to table columns
if (columnManager) {
  watch(
    () => columnManager.columns.value,
    managedCols => {
      const visibilityMap = new Map(managedCols.map(c => [c.key, c.visible]));
      tableColumns.forEach(col => {
        const key = col.prop;
        if (key && visibilityMap.has(key)) {
          col.isShow = visibilityMap.get(key);
        }
      });
    },
    { immediate: true, deep: true }
  );
}

// Flatten columns
const flatColumns = computed(() => flatColumnsFunc(tableColumns as any) as ColumnProps[]);

// Define enumMap to store enum values (prevent async requests from failing to format cell content or populate search dropdown)
const enumMap = ref(new Map<string, { [key: string]: any }[]>());
const setEnumMap = async ({ prop, enum: enumValue }: ColumnProps) => {
  if (!enumValue) return;

  // If current enumMap has the same value, return
  if (enumMap.value.has(prop!) && (typeof enumValue === "function" || enumMap.value.get(prop!) === enumValue)) return;

  // If current enum is static data, store directly to enumMap
  if (typeof enumValue !== "function") return enumMap.value.set(prop!, unref(enumValue!));

  // To prevent slow API causing duplicate requests, pre-store as [], then store again after API returns
  enumMap.value.set(prop!, []);

  // If current enum needs backend data, call the request API and store to enumMap
  const { data } = await enumValue();
  enumMap.value.set(prop!, data);
};

// Inject enumMap
provide("enumMap", enumMap);

// Method to flatten columns
const flatColumnsFunc = (columns: ColumnProps[], flatArr: ColumnProps[] = []) => {
  columns.forEach(async col => {
    if (col._children?.length) flatArr.push(...flatColumnsFunc(col._children));
    flatArr.push(col);

    // Add default isShow, isSetting, isFilterEnum prop values to column
    col.isShow = col.isShow ?? true;
    col.isSetting = col.isSetting ?? true;
    col.isFilterEnum = col.isFilterEnum ?? true;

    // Set enumMap
    await setEnumMap(col);
  });
  return flatArr.filter(item => !item._children?.length);
};

// Filter search config items && sort
const searchColumns = computed(() => {
  return flatColumns.value
    ?.filter(item => item.search?.el || item.search?.render)
    .sort((a, b) => a.search!.order! - b.search!.order!);
});

// Set default sort order for search form && default values for search form items
searchColumns.value?.forEach((column, index) => {
  column.search!.order = column.search?.order ?? index + 2;
  const key = column.search?.key ?? handleProp(column.prop!);
  const defaultValue = column.search?.defaultValue;
  if (defaultValue !== undefined && defaultValue !== null) {
    searchParam.value[key] = defaultValue;
    searchInitParam.value[key] = defaultValue;
  }
});

// Column settings ==> filter out columns that don't need settings
const colRef = ref();
const colSetting = computed(() => {
  if (columnManager) {
    return columnManager.columns.value
      .filter(item => {
        const colProp = item.key;
        const originalCol = props.columns.find(c => c.prop === colProp);
        return (
          originalCol && !columnTypes.includes(originalCol.type!) && colProp !== "operation" && originalCol.isSetting !== false
        );
      })
      .map(c => ({ prop: c.key, label: c.label, isShow: c.visible, isSetting: true }));
  }
  return (tableColumns as ColumnProps[]).filter(item => {
    const { type, prop, isSetting } = item;
    return !columnTypes.includes(type!) && prop !== "operation" && isSetting;
  });
});
const openColSetting = () => colRef.value.openColSetting();

// Define emit events
const emit = defineEmits<{
  search: [];
  reset: [];
  dragSort: [{ newIndex?: number; oldIndex?: number }];
  "update:initParam": [initParam: Record<string, any>];
}>();

const _search = () => {
  search();
  emit("search");
};

const _reset = () => {
  reset();
  emit("reset");
};

// Table drag sort
const dragSort = () => {
  // Only init Sortable when the columns prop actually declares a `sort`-type
  // column (the one that renders the `.move` handle). Without this guard,
  // every ProTable instance — including those that never opted into drag
  // sort — hits `Sortable.create` on mount, and when the underlying
  // `<el-table>` hasn't rendered its tbody yet (tab inside a v-if, lazy
  // keep-alive route, initial empty data), `document.querySelector` returns
  // null and Sortable throws "el must be an HTMLElement, not [object Null]".
  const hasSortCol = props.columns.some(c => c.type === "sort");
  if (!hasSortCol) return;
  const tbody = document.querySelector(`#${uuid.value} tbody`) as HTMLElement | null;
  if (!tbody) return;
  Sortable.create(tbody, {
    handle: ".move",
    animation: 300,
    onEnd({ newIndex, oldIndex }) {
      const [removedItem] = processTableData.value.splice(oldIndex!, 1);
      processTableData.value.splice(newIndex!, 0, removedItem);
      emit("dragSort", { newIndex, oldIndex });
    }
  });
};

// Expose params and methods to parent component (expose whatever the outside needs)
defineExpose({
  element: tableRef,
  tableData: processTableData,
  radio,
  pageable,
  searchParam,
  searchInitParam,
  isSelected,
  selectedList,
  selectedListIds,

  // Functions below
  getTableList,
  search,
  reset,
  handleSizeChange,
  handleCurrentChange,
  clearSelection,
  enumMap,

  // ── New capabilities ──
  tableState,
  columnManager,
  exporting,
  exportProgress,
  exportData,
  handleExport
});
</script>
