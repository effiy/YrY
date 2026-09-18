import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SkeletonTable from "@/components/Skeleton/SkeletonTable.vue";

describe("SkeletonTable", () => {
  it("CT-05-1: renders correct number of header cells", () => {
    const wrapper = mount(SkeletonTable, {
      props: { rows: 5, columns: 4 },
    });
    const headerCells = wrapper.find(".skeleton-table__header").findAll(".skeleton-bar");
    expect(headerCells.length).toBe(4);
  });

  it("CT-05-1: renders correct number of rows and cells", () => {
    const wrapper = mount(SkeletonTable, {
      props: { rows: 3, columns: 6 },
    });
    const rows = wrapper.findAll(".skeleton-table__row");
    expect(rows.length).toBe(3);
    const cells = rows[0].findAll(".skeleton-bar");
    expect(cells.length).toBe(6);
  });

  it("CT-05-1: uses default props (8 rows × 5 columns)", () => {
    const wrapper = mount(SkeletonTable);
    const rows = wrapper.findAll(".skeleton-table__row");
    expect(rows.length).toBe(8);
    const headerCells = wrapper.find(".skeleton-table__header").findAll(".skeleton-bar");
    expect(headerCells.length).toBe(5);
  });

  it("has aria-busy attribute for accessibility", () => {
    const wrapper = mount(SkeletonTable);
    expect(wrapper.attributes("aria-busy")).toBe("true");
  });

  it("has aria-label for screen readers", () => {
    const wrapper = mount(SkeletonTable);
    expect(wrapper.attributes("aria-label")).toBe("Loading table");
  });

  it("handles zero rows", () => {
    const wrapper = mount(SkeletonTable, {
      props: { rows: 0, columns: 3 },
    });
    const rows = wrapper.findAll(".skeleton-table__row");
    expect(rows.length).toBe(0);
    // Header still renders
    const header = wrapper.find(".skeleton-table__header");
    expect(header.exists()).toBe(true);
  });

  it("handles zero columns", () => {
    const wrapper = mount(SkeletonTable, {
      props: { rows: 5, columns: 0 },
    });
    const headerCells = wrapper.find(".skeleton-table__header").findAll(".skeleton-bar");
    expect(headerCells.length).toBe(0);
  });

  it("cell widths vary by seed for visual realism", () => {
    const wrapper = mount(SkeletonTable, {
      props: { rows: 1, columns: 2 },
    });
    const cells = wrapper.findAll(".skeleton-bar");
    const width1 = cells[0].attributes("style");
    const width2 = cells[1].attributes("style");
    // Different seeds produce different widths
    expect(width1).not.toBe(width2);
  });
});