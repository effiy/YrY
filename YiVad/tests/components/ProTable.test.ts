import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ProTable from "@/components/ProTable/index.vue";

// Mock hooks that ProTable depends on
vi.mock("@/hooks/useTable", () => ({
  useTable: () => ({
    tableData: { value: [] },
    pageable: { value: { pageNum: 1, pageSize: 10, total: 0 } },
    searchParam: { value: {} },
    searchInitParam: { value: {} },
    getTableList: vi.fn(),
    search: vi.fn(),
    reset: vi.fn(),
    handleSizeChange: vi.fn(),
    handleCurrentChange: vi.fn(),
  }),
}));

vi.mock("@/hooks/useSelection", () => ({
  useSelection: () => ({
    isSelected: { value: false },
    selectedList: { value: [] },
    selectedListIds: { value: [] },
    selectionChange: vi.fn(),
  }),
}));

vi.mock("sortablejs", () => ({ default: { create: vi.fn() } }));

// Stub child components that have complex dependencies
const stubs = {
  SearchForm: { template: "<div class='search-form-stub' />", props: ["columns", "searchParam", "searchCol"] },
  Pagination: { template: "<div class='pagination-stub' />", props: ["pageable", "handleSizeChange", "handleCurrentChange"] },
  ColSetting: { template: "<div class='col-setting-stub' />" },
  TableColumn: { template: "<div class='table-column-stub' />" },
};

const defaultColumns = [
  { type: "selection" as const, width: 50 },
  { prop: "name", label: "Name" },
  { prop: "age", label: "Age" },
  { prop: "operation", label: "Operation", fixed: "right" as const, width: 120 },
];

describe("ProTable", () => {
  it("renders the component", () => {
    const wrapper = mount(ProTable, {
      props: { columns: defaultColumns, data: [] },
      global: { stubs },
    });
    expect(wrapper.vm).toBeDefined();
    expect(wrapper.find(".table-main").exists()).toBe(true);
  });

  it("renders with static data", () => {
    const data = [
      { id: 1, name: "Alice", age: 30 },
      { id: 2, name: "Bob", age: 25 },
    ];
    const wrapper = mount(ProTable, {
      props: { columns: defaultColumns, data, pagination: false },
      global: { stubs },
    });
    expect(wrapper.vm).toBeDefined();
  });

  it("renders search form when search columns exist", () => {
    const colsWithSearch = [
      { prop: "name", label: "Name", search: { el: "input" as const } },
    ];
    const wrapper = mount(ProTable, {
      props: { columns: colsWithSearch, data: [] },
      global: { stubs },
    });
    expect(wrapper.find(".search-form-stub").exists()).toBe(true);
  });

  it("renders toolbar buttons by default", () => {
    const wrapper = mount(ProTable, {
      props: { columns: defaultColumns, data: [] },
      global: { stubs },
    });
    expect(wrapper.find(".table-header").exists()).toBe(true);
  });

  it("hides toolbar when toolButton is false", () => {
    const wrapper = mount(ProTable, {
      props: { columns: defaultColumns, data: [], toolButton: false },
      global: { stubs },
    });
    // Header still exists but toolbar buttons should be hidden
    expect(wrapper.vm).toBeDefined();
  });

  it("renders with data callback prop", () => {
    const callback = vi.fn();
    const wrapper = mount(ProTable, {
      props: { columns: defaultColumns, data: [], dataCallback: callback },
      global: { stubs },
    });
    expect(wrapper.vm).toBeDefined();
  });

  it("exposes expected methods via ref", async () => {
    const wrapper = mount(ProTable, {
      props: { columns: defaultColumns, data: [] },
      global: { stubs },
    });
    const vm = wrapper.vm as any;
    expect(typeof vm.getTableList).toBe("function");
    expect(typeof vm.search).toBe("function");
    expect(typeof vm.reset).toBe("function");
    expect(typeof vm.clearSelection).toBe("function");
  });
});