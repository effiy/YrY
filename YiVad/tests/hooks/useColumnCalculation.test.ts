import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useColumnCalculation, type ColumnCalc } from "@/hooks/useColumnCalculation";

describe("useColumnCalculation", () => {
  it("calculates sum correctly", () => {
    const data = ref([{ v: 10 }, { v: 20 }, { v: 30 }]);
    const calcs = ref<ColumnCalc[]>([{ column: "v", func: "sum", label: "" }]);
    const { footerData } = useColumnCalculation(data, calcs);
    expect(footerData.value["__calc_v_sum"]).toBe(60);
  });

  it("calculates avg correctly", () => {
    const data = ref([{ v: 10 }, { v: 20 }, { v: 30 }]);
    const calcs = ref<ColumnCalc[]>([{ column: "v", func: "avg", label: "" }]);
    const { footerData } = useColumnCalculation(data, calcs);
    expect(footerData.value["__calc_v_avg"]).toBe(20);
  });

  it("calculates count, max, and min correctly", () => {
    const data = ref([{ v: 10 }, { v: 50 }, { v: 30 }]);
    const calcs = ref<ColumnCalc[]>([
      { column: "v", func: "count", label: "" },
      { column: "v", func: "max", label: "" },
      { column: "v", func: "min", label: "" },
    ]);
    const { footerData } = useColumnCalculation(data, calcs);
    expect(footerData.value["__calc_v_count"]).toBe(3);
    expect(footerData.value["__calc_v_max"]).toBe(50);
    expect(footerData.value["__calc_v_min"]).toBe(10);
  });

  it("filters out NaN values (null, undefined, non-numeric)", () => {
    const data = ref([{ v: 10 }, { v: null }, { v: undefined }, { v: "abc" }, { v: 30 }]);
    const calcs = ref<ColumnCalc[]>([{ column: "v", func: "sum", label: "" }]);
    const { footerData } = useColumnCalculation(data, calcs);
    // null → Number(null)=0; undefined → NaN; "abc" → NaN
    // So values: [10, 0, 30] → sum = 40
    expect(footerData.value["__calc_v_sum"]).toBe(40);
  });

  it("returns empty string for empty data", () => {
    const data = ref<Record<string, any>[]>([]);
    const calcs = ref<ColumnCalc[]>([{ column: "v", func: "count", label: "" }]);
    const { footerData } = useColumnCalculation(data, calcs);
    expect(footerData.value["__calc_v_count"]).toBe("");
  });

  it("handles multiple calculations on multiple columns", () => {
    const data = ref([{ a: 10, b: 5 }, { a: 20, b: 15 }]);
    const calcs = ref<ColumnCalc[]>([
      { column: "a", func: "sum", label: "" },
      { column: "b", func: "avg", label: "" },
    ]);
    const { footerData } = useColumnCalculation(data, calcs);
    expect(footerData.value["__calc_a_sum"]).toBe(30);
    expect(footerData.value["__calc_b_avg"]).toBe(10);
  });
});