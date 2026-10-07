/**
 * Theme Palette Tokens — YiPet design system.
 *
 * 每个主题是一组语义化的 design tokens。
 * 注入到容器根元素（chat root / overlay / popup）上以避免污染宿主页面样式。
 *
 * ## Token 命名规范
 * - 不使用数字后缀（颜色强度等级通过语义命名传达，参见下表）
 * - `--yp-` 前缀确保在宿主页面 CSS 中可识别且无冲突
 * - Surface 用 `surface-{role}` 表示层级（base / sunken / raised / overlay）
 * - Text 用 `text-{emphasis}` 表示语义（primary / secondary / muted / accent）
 * - Border 用 `border-{role}` 表示用途（subtle / strong / focus）
 * - Primary 色阶：`primary`（500） / `primary-hover`（600） / `primary-active`（700）
 *   / `primary-soft`（100，tint 背景） / `primary-faint`（50，hover/选中态）
 *
 * ## 无障碍
 * - 文本/背景对比度 ≥ 4.5:1（WCAG AA 正文）
 * - 大文本/图标对比度 ≥ 3:1
 * - Focus ring 始终使用 `primary` 色，配合 `border-focus`
 *
 * ## 主题索引（与 popup 颜色下拉菜单一致）
 *   0 = Slate      1 = Indigo     2 = Ocean
 *   3 = Forest     4 = Sunset     5 = Rose
 *   6 = Lavender   7 = Mint       8 = Sky
 * NONE_PALETTE (-1) 为纯净浅色主题，尊重宿主页面样式。
 */

// ── 类型定义 ─────────────────────────────────────────────────────────────

export interface RgbTuple {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface ThemePalette {
  readonly primary: string;
  readonly primaryHover: string;
  readonly primaryActive: string;
  readonly primarySoft: string;
  readonly primaryFaint: string;
  readonly primaryGradient: string;
  readonly primaryGradientHover: string;
  readonly primaryRgb: string;
  readonly primaryAlpha: string;

  readonly surfaceBase: string;
  readonly surfaceSunken: string;
  readonly surfaceRaised: string;
  readonly surfaceOverlay: string;
  readonly surfaceGradient: string;

  readonly accent: string;
  readonly accentRgb: string;
  readonly accentGradient: string;

  readonly borderSubtle: string;
  readonly borderFocus: string;
  readonly borderStrong: string;

  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textMuted: string;
  readonly textAccent: string;
  readonly linkColor: string;
  readonly placeholderColor: string;

  readonly buttonBg: string;
  readonly buttonHover: string;
  readonly buttonText: string;

  readonly inputBg: string;
  readonly inputBorder: string;

  readonly selectionBg: string;

  readonly headerBg: string;
  readonly headerBgGradient: string;
  readonly headerBorder: string;
  readonly headerTextPrimary: string;
  readonly headerTextSecondary: string;
  readonly headerAccent: string;
  readonly headerGlow: string;
}


export type ColorScheme = 'dark' | 'light';
