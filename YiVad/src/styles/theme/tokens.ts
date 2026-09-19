/**
 * Theme Tokens — YiVad 设计系统的单一颜色 token 来源。
 *
 * ## 模块说明
 * 每个主题（light / inverted / dark）是一组 CSS 变量键值对，
 * 由 `useTheme` hook 注入到 `document.documentElement`。
 *
 * ## Token 命名
 * - 不使用数字后缀；按用途命名（`menu-bg`、`menu-text`、`menu-hover-bg`）
 * - Element Plus 变量直接转发，便于定制（如 `--el-color-primary-light-3`）
 * - 设计 tokens 集中存放在 `tokens.ts`，便于 SCSS 消费
 *
 * ## 主题家族
 * - `light`     — 默认浅色主题
 * - `inverted`  — 暗色导航 + 浅色内容（顶部/侧边反色）
 * - `dark`      — 全暗主题
 */

import type { Theme } from "@/hooks/interface";
import { DEFAULT_PRIMARY } from "@/config";
import { lighten as colorLighten, darken as colorDarken, withAlpha as colorWithAlpha } from "@/utils/color";

export type { Theme };

/** 主题 token 字典（CSS 变量名 → 颜色值）。 */
export type ThemeTokens = Readonly<Record<string, string>>;

// ── 浅色主题 ─────────────────────────────────────────────────────────────

const lightTokens: ThemeTokens = {
  /* ── Brand（用户主色，由 useTheme.changePrimary 覆盖） ── */
  "--el-color-primary": DEFAULT_PRIMARY,
  "--el-color-primary-dark-2": colorDarken(DEFAULT_PRIMARY, 0.2) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-1": colorLighten(DEFAULT_PRIMARY, 0.1) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-3": colorLighten(DEFAULT_PRIMARY, 0.3) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-5": colorLighten(DEFAULT_PRIMARY, 0.5) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-7": colorLighten(DEFAULT_PRIMARY, 0.7) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-8": colorLighten(DEFAULT_PRIMARY, 0.8) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-9": colorLighten(DEFAULT_PRIMARY, 0.9) ?? DEFAULT_PRIMARY,

  /* ── Menu ── */
  "--el-menu-bg-color": "#ffffff",
  "--el-menu-hover-bg-color": "#f5f7fa",
  "--el-menu-active-bg-color": "var(--el-color-primary-light-9)",
  "--el-menu-text-color": "#303133",
  "--el-menu-active-color": "var(--el-color-primary)",
  "--el-menu-hover-text-color": "#409eff",
  "--el-menu-horizontal-sub-item-height": "50px",

  /* ── Aside ── */
  "--el-aside-logo-text-color": "#303133",
  "--el-aside-border-color": "#e4e7ed",

  /* ── Header ── */
  "--el-header-logo-text-color": "#303133",
  "--el-header-bg-color": "#ffffff",
  "--el-header-text-color": "#303133",
  "--el-header-text-color-regular": "#606266",
  "--el-header-border-color": "#e4e7ed",
};

// ── 反色主题（侧边/顶部使用深色，主体保持浅色） ─────────────────────────

const invertedTokens: ThemeTokens = {
  /* ── Brand ── */
  "--el-color-primary": DEFAULT_PRIMARY,
  "--el-color-primary-dark-2": colorDarken(DEFAULT_PRIMARY, 0.15) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-1": colorLighten(DEFAULT_PRIMARY, 0.1) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-3": colorLighten(DEFAULT_PRIMARY, 0.3) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-5": colorLighten(DEFAULT_PRIMARY, 0.5) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-7": colorLighten(DEFAULT_PRIMARY, 0.7) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-8": colorLighten(DEFAULT_PRIMARY, 0.8) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-9": colorLighten(DEFAULT_PRIMARY, 0.9) ?? DEFAULT_PRIMARY,

  /* ── Menu（深色） ── */
  "--el-menu-bg-color": "#191a20",
  "--el-menu-hover-bg-color": "#000000",
  "--el-menu-active-bg-color": "#000000",
  "--el-menu-text-color": "#bdbdc0",
  "--el-menu-active-color": "#ffffff",
  "--el-menu-hover-text-color": "#ffffff",
  "--el-menu-horizontal-sub-item-height": "50px",

  /* ── Aside ── */
  "--el-aside-logo-text-color": "#dadada",
  "--el-aside-border-color": "#414243",

  /* ── Header（深色） ── */
  "--el-header-logo-text-color": "#dadada",
  "--el-header-bg-color": "#191a20",
  "--el-header-text-color": "#e5eaf3",
  "--el-header-text-color-regular": "#cfd3dc",
  "--el-header-border-color": "#414243",
};

// ── 全暗主题 ─────────────────────────────────────────────────────────────

const darkTokens: ThemeTokens = {
  /* ── Brand（暗背景下保持主色饱和度，提升亮度） ── */
  "--el-color-primary": colorLighten(DEFAULT_PRIMARY, 0.15) ?? DEFAULT_PRIMARY,
  "--el-color-primary-dark-2": colorLighten(DEFAULT_PRIMARY, 0.05) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-1": colorLighten(DEFAULT_PRIMARY, 0.2) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-3": colorLighten(DEFAULT_PRIMARY, 0.4) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-5": colorLighten(DEFAULT_PRIMARY, 0.55) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-7": colorLighten(DEFAULT_PRIMARY, 0.7) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-8": colorLighten(DEFAULT_PRIMARY, 0.8) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-9": colorLighten(DEFAULT_PRIMARY, 0.9) ?? DEFAULT_PRIMARY,

  /* ── Menu（全暗） ── */
  "--el-menu-bg-color": "#141414",
  "--el-menu-hover-bg-color": "#000000",
  "--el-menu-active-bg-color": "#000000",
  "--el-menu-text-color": "#bdbdc0",
  "--el-menu-active-color": "#ffffff",
  "--el-menu-hover-text-color": "#ffffff",
  "--el-menu-horizontal-sub-item-height": "50px",

  /* ── Aside ── */
  "--el-aside-logo-text-color": "#dadada",
  "--el-aside-border-color": "#414243",

  /* ── Header ── */
  "--el-header-logo-text-color": "#dadada",
  "--el-header-bg-color": "#141414",
  "--el-header-text-color": "#e5eaf3",
  "--el-header-text-color-regular": "#cfd3dc",
  "--el-header-border-color": "#414243",
};

/** 主题 token 表。键名与 Theme.ThemeType 严格对应。 */
export const themeTokens: Readonly<Record<Theme.ThemeType, ThemeTokens>> = {
  light: lightTokens,
  inverted: invertedTokens,
  dark: darkTokens,
};

// ── 旧菜单/侧边/顶部分文件（保留以兼容外部导入） ─────────────────────────

/**
 * @deprecated 使用 `themeTokens` 统一管理；该常量保留以便渐进迁移。
 */
export const menuTheme: Readonly<Record<Theme.ThemeType, ThemeTokens>> = {
  light: {
    "--el-menu-bg-color": lightTokens["--el-menu-bg-color"]!,
    "--el-menu-hover-bg-color": lightTokens["--el-menu-hover-bg-color"]!,
    "--el-menu-active-bg-color": lightTokens["--el-menu-active-bg-color"]!,
    "--el-menu-text-color": lightTokens["--el-menu-text-color"]!,
    "--el-menu-active-color": lightTokens["--el-menu-active-color"]!,
    "--el-menu-hover-text-color": lightTokens["--el-menu-hover-text-color"]!,
    "--el-menu-horizontal-sub-item-height":
      lightTokens["--el-menu-horizontal-sub-item-height"]!,
  },
  inverted: {
    "--el-menu-bg-color": invertedTokens["--el-menu-bg-color"]!,
    "--el-menu-hover-bg-color": invertedTokens["--el-menu-hover-bg-color"]!,
    "--el-menu-active-bg-color": invertedTokens["--el-menu-active-bg-color"]!,
    "--el-menu-text-color": invertedTokens["--el-menu-text-color"]!,
    "--el-menu-active-color": invertedTokens["--el-menu-active-color"]!,
    "--el-menu-hover-text-color": invertedTokens["--el-menu-hover-text-color"]!,
    "--el-menu-horizontal-sub-item-height":
      invertedTokens["--el-menu-horizontal-sub-item-height"]!,
  },
  dark: {
    "--el-menu-bg-color": darkTokens["--el-menu-bg-color"]!,
    "--el-menu-hover-bg-color": darkTokens["--el-menu-hover-bg-color"]!,
    "--el-menu-active-bg-color": darkTokens["--el-menu-active-bg-color"]!,
    "--el-menu-text-color": darkTokens["--el-menu-text-color"]!,
    "--el-menu-active-color": darkTokens["--el-menu-active-color"]!,
    "--el-menu-hover-text-color": darkTokens["--el-menu-hover-text-color"]!,
    "--el-menu-horizontal-sub-item-height":
      darkTokens["--el-menu-horizontal-sub-item-height"]!,
  },
};

/**
 * @deprecated 使用 `themeTokens` 统一管理。
 */
export const asideTheme: Readonly<Record<Theme.ThemeType, ThemeTokens>> = {
  light: {
    "--el-aside-logo-text-color": lightTokens["--el-aside-logo-text-color"]!,
    "--el-aside-border-color": lightTokens["--el-aside-border-color"]!,
  },
  inverted: {
    "--el-aside-logo-text-color": invertedTokens["--el-aside-logo-text-color"]!,
    "--el-aside-border-color": invertedTokens["--el-aside-border-color"]!,
  },
  dark: {
    "--el-aside-logo-text-color": darkTokens["--el-aside-logo-text-color"]!,
    "--el-aside-border-color": darkTokens["--el-aside-border-color"]!,
  },
};

/**
 * @deprecated 使用 `themeTokens` 统一管理。
 */
export const headerTheme: Readonly<Record<Theme.ThemeType, ThemeTokens>> = {
  light: {
    "--el-header-logo-text-color": lightTokens["--el-header-logo-text-color"]!,
    "--el-header-bg-color": lightTokens["--el-header-bg-color"]!,
    "--el-header-text-color": lightTokens["--el-header-text-color"]!,
    "--el-header-text-color-regular": lightTokens["--el-header-text-color-regular"]!,
    "--el-header-border-color": lightTokens["--el-header-border-color"]!,
  },
  inverted: {
    "--el-header-logo-text-color": invertedTokens["--el-header-logo-text-color"]!,
    "--el-header-bg-color": invertedTokens["--el-header-bg-color"]!,
    "--el-header-text-color": invertedTokens["--el-header-text-color"]!,
    "--el-header-text-color-regular": invertedTokens["--el-header-text-color-regular"]!,
    "--el-header-border-color": invertedTokens["--el-header-border-color"]!,
  },
  dark: {
    "--el-header-logo-text-color": darkTokens["--el-header-logo-text-color"]!,
    "--el-header-bg-color": darkTokens["--el-header-bg-color"]!,
    "--el-header-text-color": darkTokens["--el-header-text-color"]!,
    "--el-header-text-color-regular": darkTokens["--el-header-text-color-regular"]!,
    "--el-header-border-color": darkTokens["--el-header-border-color"]!,
  },
};

/** 重新导出颜色工具，便于主题模块独立使用。 */
export { colorLighten as lighten, colorDarken as darken, colorWithAlpha as withAlpha };