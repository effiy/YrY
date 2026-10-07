/**
 * Element Plus Theme Adapter — YiPet palette → Element Plus CSS vars.
 *
 * Element Plus 的主题完全通过 CSS 自定义属性驱动，因此我们只需将
 * palette 中的 token 映射到对应的 `--el-*` 变量即可完成主题注入。
 *
 * ## 两个入口
 * - `applyElementPalette(root, palette, scheme)` — 接受调色板对象，用于自定义 hex 色
 * - `applyElementTheme(root, idx)` — 接受预设索引，便捷包装
 *
 * ## 语义对齐原则
 * - `--el-color-primary-light-{n}` 表示主色的浅色阶（n 越大越浅，9 最浅）
 *   - 暗色主题：通过 mix(primary, surface, ratio) 生成，更多 surface → 更深
 *   - 亮色主题：通过 mix(primary, #fff, ratio) 生成，更多 white → 更浅
 * - `--el-bg-color-*` 三档：page（页面） / overlay（弹层） / color（默认组件）
 * - `--el-text-color-primary` / `regular` / `secondary` / `placeholder`
 *
 * @see https://element-plus.org/en-US/guide/theming.html
 */

import { colord } from 'colord';
import type { ThemePalette, ColorScheme } from './types';
import { NONE_PALETTE, resolvePalette } from './colors';

// ── 颜色混合工具（colord 2.x 无 mix 插件，手动实现 RGB 线性插值）────────────

/** 线性混合两个颜色，ratio 为 b 的权重 (0-1) */
function mixColors(aHex: string, bHex: string, ratio: number): string {
  const a = colord(aHex).toRgb();
  const b = colord(bHex).toRgb();
  const r = Math.round(a.r + (b.r - a.r) * ratio);
  const g = Math.round(a.g + (b.g - a.g) * ratio);
  const bl = Math.round(a.b + (b.b - a.b) * ratio);
  return colord(`rgb(${r}, ${g}, ${bl})`).toHex();
}

// ── 语义状态色（不随 primary 变化）──────────────────────────────────────────
// 暗色主题用降低亮度的变体，使 light-* 在暗色背景上可用

const STATUS_COLORS = {
  success: { base: '#67c23a', rgb: '103, 194, 58' },
  warning: { base: '#e6a23c', rgb: '230, 162, 60' },
  danger:  { base: '#f56c6c', rgb: '245, 108, 108' },
  info:    { base: '#909399', rgb: '144, 147, 153' },
} as const;

type StatusKey = keyof typeof STATUS_COLORS;

/**
 * 为指定状态色生成 light-{3,5,7,8,9} 变体。
 * 暗色模式：混入 surface 色（越深越 muted）
 * 亮色模式：混入白色（越浅越 tinted）
 */
function injectStatusScale(
  style: CSSStyleDeclaration,
  key: StatusKey,
  surface: string,
  isDark: boolean,
): void {
  const { base, rgb } = STATUS_COLORS[key];
  const prefix = `--el-color-${key}`;

  style.setProperty(prefix, base);
  style.setProperty(`${prefix}-rgb`, rgb);

  if (isDark) {
    style.setProperty(`${prefix}-light-3`,  mixColors(surface, base, 0.65));
    style.setProperty(`${prefix}-light-5`,  mixColors(surface, base, 0.40));
    style.setProperty(`${prefix}-light-7`,  mixColors(surface, base, 0.18));
    style.setProperty(`${prefix}-light-8`,  mixColors(surface, base, 0.10));
    style.setProperty(`${prefix}-light-9`,  mixColors(surface, base, 0.05));
  } else {
    style.setProperty(`${prefix}-light-3`,  mixColors('#ffffff', base, 0.70));
    style.setProperty(`${prefix}-light-5`,  mixColors('#ffffff', base, 0.50));
    style.setProperty(`${prefix}-light-7`,  mixColors('#ffffff', base, 0.30));
    style.setProperty(`${prefix}-light-8`,  mixColors('#ffffff', base, 0.20));
    style.setProperty(`${prefix}-light-9`,  mixColors('#ffffff', base, 0.10));
  }
}

// ── 公开 API ────────────────────────────────────────────────────────────────

/**
 * 将 Element Plus 主题变量注入到 root 元素。
 * 支持自定义 hex 生成的调色板。
 *
 * @param root    注入目标容器
 * @param palette 调色板对象
 * @param scheme  亮/暗模式
 */
export function applyElementPalette(root: HTMLElement, palette: ThemePalette, scheme: ColorScheme): void {
  const style = root.style;
  const isDark = scheme === 'dark';
  const surface = palette.surfaceBase;

  // ── Primary scale (动态生成 light-5 / light-8 / dark-2) ──
  style.setProperty('--el-color-primary',           palette.primary);
  style.setProperty('--el-color-primary-rgb',       palette.primaryRgb);
  style.setProperty('--el-color-primary-light-3',   palette.primaryHover);
  style.setProperty('--el-color-primary-light-5',   mixColors(surface, palette.primary, isDark ? 0.38 : 0.55));
  style.setProperty('--el-color-primary-light-7',   palette.primarySoft);
  style.setProperty('--el-color-primary-light-8',   mixColors(surface, palette.primary, isDark ? 0.13 : 0.75));
  style.setProperty('--el-color-primary-light-9',   palette.primaryFaint);
  style.setProperty('--el-color-primary-dark-2',    palette.primaryActive);

  // ── Surface ──
  style.setProperty('--el-bg-color',          palette.surfaceSunken);
  style.setProperty('--el-bg-color-page',     palette.surfaceBase);
  style.setProperty('--el-bg-color-overlay',  palette.surfaceRaised);

  // ── Text ──
  style.setProperty('--el-text-color-primary',     palette.textPrimary);
  style.setProperty('--el-text-color-regular',     palette.textSecondary);
  style.setProperty('--el-text-color-secondary',   palette.textMuted);
  style.setProperty('--el-text-color-placeholder', palette.placeholderColor);

  // ── Border ──
  style.setProperty('--el-border-color',             palette.borderSubtle);
  style.setProperty('--el-border-color-light',       palette.borderSubtle);
  style.setProperty('--el-border-color-lighter',     palette.borderSubtle);
  style.setProperty('--el-border-color-extra-light', palette.primaryFaint);
  style.setProperty('--el-border-color-dark',        palette.borderStrong);

  // ── Fill ──
  style.setProperty('--el-fill-color',         palette.surfaceRaised);
  style.setProperty('--el-fill-color-light',   palette.surfaceSunken);
  style.setProperty('--el-fill-color-lighter', palette.surfaceBase);
  style.setProperty('--el-fill-color-blank',   palette.inputBg);
  style.setProperty('--el-fill-color-dark',    palette.borderSubtle);

  // ── Mask ──
  style.setProperty('--el-mask-color', isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)');

  // ── Status colors ──
  for (const key of Object.keys(STATUS_COLORS) as StatusKey[]) {
    injectStatusScale(style, key, surface, isDark);
  }

  // ── Color scheme ──
  style.setProperty('color-scheme', isDark ? 'dark' : 'light');
}

/**
 * 通过预设索引注入 Element Plus 主题变量。
 * @param root 注入目标容器
 * @param idx  调色板索引；-1 表示 NONE_PALETTE（浅色无主题）
 */
export function applyElementTheme(root: HTMLElement, idx: number): void {
  const { palette, scheme } = resolvePalette(idx);
  applyElementPalette(root, palette, scheme);
}

/**
 * 清除注入到 root 元素的 Element Plus 主题变量。
 */
export function clearElementTheme(root: HTMLElement): void {
  const vars = [
    '--el-color-primary', '--el-color-primary-rgb',
    '--el-color-primary-light-3', '--el-color-primary-light-5',
    '--el-color-primary-light-7', '--el-color-primary-light-8',
    '--el-color-primary-light-9', '--el-color-primary-dark-2',
    '--el-bg-color', '--el-bg-color-page', '--el-bg-color-overlay',
    '--el-text-color-primary', '--el-text-color-regular',
    '--el-text-color-secondary', '--el-text-color-placeholder',
    '--el-border-color', '--el-border-color-light', '--el-border-color-lighter',
    '--el-border-color-extra-light', '--el-border-color-dark',
    '--el-fill-color', '--el-fill-color-light', '--el-fill-color-lighter',
    '--el-fill-color-blank', '--el-fill-color-dark',
    '--el-mask-color',
  ];
  for (const v of vars) root.style.removeProperty(v);

  for (const key of Object.keys(STATUS_COLORS)) {
    for (const suffix of ['', '-rgb', '-light-3', '-light-5', '-light-7', '-light-8', '-light-9']) {
      root.style.removeProperty(`--el-color-${key}${suffix}`);
    }
  }

  root.style.removeProperty('color-scheme');
}

export { NONE_PALETTE };