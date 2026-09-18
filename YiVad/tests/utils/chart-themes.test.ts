import { describe, it, expect } from "vitest";
import { getTheme, applyThemeToEChartsOption, chartThemes } from "@/utils/chart/themes";

describe("chart themes", () => {
  it("has 4 preset themes", () => {
    expect(Object.keys(chartThemes)).toHaveLength(4);
  });

  it("default theme has 8 colors", () => {
    expect(chartThemes.default.colors).toHaveLength(8);
  });

  it("each theme has required fields", () => {
    for (const theme of Object.values(chartThemes)) {
      expect(theme.id).toBeTruthy();
      expect(theme.name).toBeTruthy();
      expect(theme.colors.length).toBeGreaterThan(0);
      expect(theme.backgroundColor).toBeTruthy();
      expect(theme.textStyle.color).toBeTruthy();
    }
  });

  it("getTheme returns default for unknown id", () => {
    expect(getTheme("nonexistent")).toBe(chartThemes.default);
  });

  it("getTheme returns default for undefined", () => {
    expect(getTheme()).toBe(chartThemes.default);
  });

  it("dark theme has dark background", () => {
    expect(chartThemes.dark.backgroundColor).toBe("#1d1e1f");
    expect(chartThemes.dark.textStyle.color).toBe("#E0E0E0");
  });

  it("applyThemeToEChartsOption injects theme colors", () => {
    const option = { title: { text: "Test" } };
    const themed = applyThemeToEChartsOption(option, chartThemes.dark);
    expect(themed.backgroundColor).toBe("#1d1e1f");
    expect(themed.color).toEqual(chartThemes.dark.colors);
  });
});
