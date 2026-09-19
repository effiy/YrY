/**
 * Element Plus Theme Adapter — YiPet palette → Element Plus CSS vars.
 *
 * Element Plus 的主题完全通过 CSS 自定义属性驱动，因此我们只需将
 * palette 中的 token 映射到对应的 `--el-*` 变量即可完成主题注入。
 *
 * ## 语义对齐原则
 * - `--el-color-primary-light-{n}` 表示主色的浅色阶（n 越大越浅，9 最浅）
 *   - light-3 ≈ 主色 + 黑色 20%（hover 适用）
 *   - light-5 ≈ 主色 + 黑色 50%（disabled/soft 适用）
 *   - light-7 / light-9 ≈ 主色 + 黑色 70% / 90%（背景 tint 适用）
 * - `--el-bg-color-*` 三档：page（页面） / overlay（弹层） / color（默认组件）
 * - `--el-text-color-primary` / `regular` / `secondary` / `placeholder`
 *
 * @see https://element-plus.org/en-US/guide/theming.html
 */

import type { ThemePalette } from './colors';
import { NONE_PALETTE, resolvePalette } from './colors';

/**
 * YiPet palette → Element Plus CSS var 映射。
 * 每个条目：[paletteField, elPlusVarName]
 *
 * 设计要点：
 * - 同一变量可能映射多次（如 surfaceBase 同时作为 page 与 overlay），
 *   保留必要的重复以确保 EP 各组件风格一致。
 * - 不引入语义错位的映射（如：linkColor ≠ info color；buttonHover ≠ button-hover-bg-color）。
 */
const EP_VAR_MAP: ReadonlyArray<readonly [keyof ThemePalette, string]> = [
  /* ── Brand ── */
  ['primary', '--el-color-primary'],
  ['primaryHover', '--el-color-primary-light-3'],
  ['primarySoft', '--el-color-primary-light-7'],
  ['primaryFaint', '--el-color-primary-light-9'],
  ['primaryAlpha', '--el-color-primary-light-9'],

  /* ── Surface ── */
  ['surfaceBase', '--el-bg-color'],
  ['surfaceSunken', '--el-bg-color-overlay'],
  ['surfaceBase', '--el-bg-color-page'],

  /* ── Text ── */
  ['textPrimary', '--el-text-color-primary'],
  ['textSecondary', '--el-text-color-regular'],
  ['textMuted', '--el-text-color-secondary'],
  ['placeholderColor', '--el-text-color-placeholder'],

  /* ── Border ── */
  ['borderSubtle', '--el-border-color'],
  ['borderSubtle', '--el-border-color-light'],
  ['borderSubtle', '--el-border-color-lighter'],
  ['borderStrong', '--el-border-color-dark'],

  /* ── Fill ── */
  ['inputBg', '--el-fill-color-blank'],
  ['surfaceSunken', '--el-fill-color-light'],
  ['surfaceRaised', '--el-fill-color'],
  ['borderSubtle', '--el-fill-color-dark'],
];

/**
 * 将 Element Plus 主题变量注入到 root 元素。
 * @param root 注入目标容器
 * @param idx 调色板索引；-1 表示 NONE_PALETTE（浅色无主题）
 */
export function applyElementTheme(root: HTMLElement, idx: number): void {
  const { palette } = resolvePalette(idx);
  const style = root.style;
  for (const [field, varName] of EP_VAR_MAP) {
    style.setProperty(varName, palette[field]);
  }
}

/**
 * 清除注入到 root 元素的 Element Plus 主题变量。
 */
export function clearElementTheme(root: HTMLElement): void {
  for (const [, varName] of EP_VAR_MAP) {
    root.style.removeProperty(varName);
  }
}

/**
 * 内部导出：NONE 调色板别名，便于 EP 单独导入。
 * @internal
 */
export { NONE_PALETTE };