import { VNode, ComponentPublicInstance, Ref } from "vue";
import { BreakPoint, Responsive } from "@/components/Grid/interface";
import { TableColumnCtx } from "element-plus/es/components/table/src/table-column/defaults";
import { ProTableProps } from "@/components/ProTable/index.vue";
import ProTable from "@/components/ProTable/index.vue";

export interface EnumProps {
  label?: string; // Text displayed in option box
  value?: string | number | boolean | any[]; // Option value
  disabled?: boolean; // Whether to disable this option
  tagType?: string; // When tag is true, this option specifies tag display type
  children?: EnumProps[]; // For tree select, children property specifies sub-options
  [key: string]: any;
}

export type TypeProps = "index" | "selection" | "radio" | "expand" | "sort";

export type SearchType =
  | "input"
  | "input-number"
  | "select"
  | "select-v2"
  | "tree-select"
  | "cascader"
  | "date-picker"
  | "time-picker"
  | "time-select"
  | "switch"
  | "slider";

export type SearchRenderScope = {
  searchParam: { [key: string]: any };
  placeholder: string;
  clearable: boolean;
  options: EnumProps[];
  data: EnumProps[];
};

export type SearchProps = {
  el?: SearchType; // Search box type for this item
  label?: string; // Search box label for this item
  props?: any; // Search item params, pass according to Element Plus official docs, all values are forwarded to the component
  key?: string; // When search item key differs from prop, specify via key
  tooltip?: string; // Search hint
  order?: number; // Search item sort order (descending)
  span?: number; // Number of columns this search item occupies, default 1
  offset?: number; // Left offset for search field in columns
  defaultValue?: string | number | boolean | any[] | Ref<any>; // Search item default value
  render?: (scope: SearchRenderScope) => VNode; // Custom search content render (TSX syntax)
} & Partial<Record<BreakPoint, Responsive>>;

export type FieldNamesProps = {
  label: string;
  value: string;
  children?: string;
};

export type RenderScope<T> = {
  row: T;
  $index: number;
  column: TableColumnCtx<T>;
  [key: string]: any;
};

export type HeaderRenderScope<T> = {
  $index: number;
  column: TableColumnCtx<T>;
  [key: string]: any;
};

export interface ColumnProps<T = any> extends Partial<
  Omit<TableColumnCtx<T>, "type" | "children" | "renderCell" | "renderHeader">
> {
  type?: TypeProps; // Column type
  tag?: boolean | Ref<boolean>; // Whether to display as tag
  isShow?: boolean | Ref<boolean>; // Whether to show in table
  isSetting?: boolean | Ref<boolean>; // Whether configurable in ColSetting
  search?: SearchProps | undefined; // Search item config
  enum?: EnumProps[] | Ref<EnumProps[]> | ((params?: any) => Promise<any>); // Enum dictionary
  isFilterEnum?: boolean | Ref<boolean>; // Whether current cell value is formatted by enum (example: enum only as search data)
  fieldNames?: FieldNamesProps; // Specify key names for label, value, children
  headerRender?: (scope: HeaderRenderScope<T>) => VNode; // Custom header content render (TSX syntax)
  render?: (scope: RenderScope<T>) => VNode | string; // Custom cell content render (TSX syntax)
  _children?: ColumnProps<T>[]; // Multi-level header
}

export type ProTableInstance = Omit<InstanceType<typeof ProTable>, keyof ComponentPublicInstance | keyof ProTableProps>;
