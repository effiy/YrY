import { describe, it, expect } from "vitest";
import { getMermaidThemeConfig, MERMAID_THEME_NAMES, LIGHT_THEME_DEFAULT, DARK_THEME_DEFAULT } from "@/config/mermaidThemes";

describe("mermaidThemes", () => {
  it("has 15 theme names", () => {
    expect(MERMAID_THEME_NAMES).toHaveLength(15);
  });
  
  it("light default is github-light", () => {
    expect(LIGHT_THEME_DEFAULT).toBe("github-light");
  });
  
  it("dark default is tokyo-night", () => {
    expect(DARK_THEME_DEFAULT).toBe("tokyo-night");
  });
  
  it("getMermaidThemeConfig returns base theme for light", () => {
    const config = getMermaidThemeConfig(false);
    expect(config.theme).toBe("base");
    expect(config.themeVariables.primaryColor).toBeDefined();
    expect(config.themeVariables.background).toBeDefined();
  });
  
  it("getMermaidThemeConfig returns base theme for dark", () => {
    const config = getMermaidThemeConfig(true);
    expect(config.theme).toBe("base");
    expect(config.themeVariables.background).toBeDefined();
  });
  
  it("getMermaidThemeConfig respects explicit theme name", () => {
    const config = getMermaidThemeConfig(false, "dracula");
    expect(config.themeVariables.primaryColor).toBeDefined();
  });
  
  it("getMermaidThemeConfig falls back for unknown theme", () => {
    const config = getMermaidThemeConfig(false, "nonexistent");
    expect(config.theme).toBe("base");
  });
  
  it("all theme names produce valid config", () => {
    for (const name of MERMAID_THEME_NAMES) {
      const config = getMermaidThemeConfig(false, name);
      expect(config.theme).toBe("base");
      expect(config.themeVariables.primaryTextColor).toBeDefined();
      expect(config.themeVariables.lineColor).toBeDefined();
    }
  });
});
