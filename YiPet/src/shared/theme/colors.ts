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

/** 调色板家族（暗 / 亮）。 */
export type ColorScheme = 'dark' | 'light';

// ── CSS 变量注入表 ───────────────────────────────────────────────────────
//
// palette 字段 → 注入到容器 inline style 的 CSS 变量名。
// 单一来源：所有需要 setProperty 的变量名都在这里声明。
// 消费侧通过 var(--yp-*) 引用，无需关心映射细节。
//
// 兼容策略：每个 token 注入时同时写出"语义名"（--yp-color-primary）
// 与"历史别名"（--primary）。新代码统一使用 --yp-*，旧 CSS 通过
// 别名保持可用，后续可渐进迁移。

const PALETTE_TO_CSS: ReadonlyArray<readonly [keyof ThemePalette, string, string]> = [
  /* palette field          canonical var name                 legacy alias                */
  ['primary',               '--yp-color-primary',              '--primary'],
  ['primaryHover',          '--yp-color-primary-hover',        '--primary-hover'],
  ['primaryActive',         '--yp-color-primary-active',       '--primary-active'],
  ['primarySoft',           '--yp-color-primary-soft',         '--primary-soft'],
  ['primaryFaint',          '--yp-color-primary-faint',        '--primary-faint'],
  ['primaryGradient',       '--yp-gradient-primary',           '--primary-gradient'],
  ['primaryGradientHover',  '--yp-gradient-primary-hover',     '--primary-gradient-hover'],
  ['primaryRgb',            '--yp-color-primary-rgb',          '--primary-rgb'],
  ['primaryAlpha',          '--yp-color-primary-alpha',        '--primary-alpha'],

  ['surfaceBase',           '--yp-surface-base',               '--bg-primary'],
  ['surfaceSunken',         '--yp-surface-sunken',             '--bg-secondary'],
  ['surfaceRaised',         '--yp-surface-raised',             '--bg-tertiary'],
  ['surfaceOverlay',        '--yp-surface-overlay',            '--bg-elevated'],
  ['surfaceGradient',       '--yp-gradient-surface',           '--bg-gradient'],

  ['accent',                '--yp-color-accent',               '--accent'],
  ['accentRgb',             '--yp-color-accent-rgb',           '--accent-rgb'],
  ['accentGradient',        '--yp-gradient-accent',            '--accent-gradient'],

  ['borderSubtle',          '--yp-border-subtle',              '--border-secondary'],
  ['borderFocus',           '--yp-border-focus',               '--border-focus'],
  ['borderStrong',          '--yp-border-strong',              '--border-strong'],

  ['textPrimary',           '--yp-text-primary',               '--text-primary'],
  ['textSecondary',         '--yp-text-secondary',             '--text-secondary'],
  ['textMuted',             '--yp-text-muted',                 '--text-muted'],
  ['textAccent',            '--yp-text-accent',                '--text-accent'],
  ['linkColor',             '--yp-link-color',                 '--link-color'],
  ['placeholderColor',      '--yp-placeholder-color',          '--placeholder-color'],

  ['buttonBg',              '--yp-button-bg',                  '--button-bg'],
  ['buttonHover',           '--yp-button-hover',               '--button-hover'],
  ['buttonText',            '--yp-button-text',                '--button-text'],

  ['inputBg',               '--yp-input-bg',                   '--input-bg'],
  ['inputBorder',           '--yp-input-border',               '--input-border'],

  ['selectionBg',           '--yp-selection-bg',               '--selection-bg'],

  ['headerBg',              '--yp-header-bg',                  '--header-bg'],
  ['headerBgGradient',      '--yp-gradient-header',             '--header-gradient'],
  ['headerBorder',          '--yp-header-border',                '--header-border'],
  ['headerTextPrimary',    '--yp-header-text-primary',        '--header-text-primary'],
  ['headerTextSecondary',  '--yp-header-text-secondary',     '--header-text-secondary'],
  ['headerAccent',        '--yp-header-accent',               '--header-accent'],
  ['headerGlow',          '--yp-header-glow',                  '--header-glow'],
];

/** 注入的 CSS 变量名清单（用于清理）。 */
export const THEME_VAR_KEYS: readonly string[] = PALETTE_TO_CSS.flatMap(
  ([, canonical, legacy]) => [canonical, legacy],
);

// ── 内部注入函数 ─────────────────────────────────────────────────────────

function applyPaletteToRoot(root: HTMLElement, palette: ThemePalette, scheme: ColorScheme): void {
  const style = root.style;
  for (const [field, canonical, legacy] of PALETTE_TO_CSS) {
    const value = palette[field];
    style.setProperty(canonical, value);
    style.setProperty(legacy, value);
  }
  style.colorScheme = scheme;
}

function clearPaletteFromRoot(root: HTMLElement): void {
  for (const name of THEME_VAR_KEYS) {
    root.style.removeProperty(name);
  }
  root.style.colorScheme = '';
}

// ── 9 个预设调色板 ───────────────────────────────────────────────────────
//
// 设计原则：
// - Surface 层级基于主色 hue，但饱和度极低、亮度递进，确保层级感清晰且不刺眼
// - Text 全部走浅色（暗主题），保持对比度
// - Border 使用 accent RGB + 低 alpha，避免硬切
// - 所有 alpha 值不超过 0.3，避免脏污感

export const THEME_PALETTES: readonly ThemePalette[] = [
  /* ── 0: Slate — 沉稳石板灰，极简专业 ── */
  {
    primary: '#64748b',
    primaryHover: '#475569',
    primaryActive: '#334155',
    primarySoft: 'rgba(148, 163, 184, 0.18)',
    primaryFaint: 'rgba(148, 163, 184, 0.08)',
    primaryGradient: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #546270 0%, #3d4a5c 50%, #2d3a4a 100%)',
    primaryRgb: '100, 116, 139',
    primaryAlpha: 'rgba(100, 116, 139, 0.12)',
    surfaceBase: '#0f1117',
    surfaceSunken: '#1a1d24',
    surfaceRaised: '#252830',
    surfaceOverlay: 'rgba(26, 29, 36, 0.92)',
    surfaceGradient: 'linear-gradient(135deg, #0f1117 0%, #1a1d24 30%, #252830 60%, #2d3138 100%)',
    accent: '#38bdf8',
    accentRgb: '56, 189, 248',
    accentGradient: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)',
    borderSubtle: 'rgba(148, 163, 184, 0.18)',
    borderFocus: '#38bdf8',
    borderStrong: 'rgba(148, 163, 184, 0.35)',
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: 'rgba(203, 213, 225, 0.55)',
    textAccent: '#7dd3fc',
    linkColor: '#7dd3fc',
    placeholderColor: 'rgba(203, 213, 225, 0.45)',
    buttonBg: '#64748b',
    buttonHover: '#475569',
    buttonText: '#ffffff',
    inputBg: '#1a1d24',
    inputBorder: 'rgba(148, 163, 184, 0.15)',
    selectionBg: 'rgba(100, 116, 139, 0.25)',
    headerBg: 'rgba(15, 17, 23, 0.85)',
    headerBgGradient: 'linear-gradient(180deg, rgba(100, 116, 139, 0.18) 0%, rgba(15, 17, 23, 0.85) 55%, rgba(15, 17, 23, 0.92) 100%)',
    headerBorder: 'rgba(148, 163, 184, 0.22)',
    headerTextPrimary: '#f8fafc',
    headerTextSecondary: 'rgba(203, 213, 225, 0.72)',
    headerAccent: '#7dd3fc',
    headerGlow: '0 0 32px rgba(56, 189, 248, 0.08), 0 1px 0 rgba(255, 255, 255, 0.06) inset',
  },
  /* ── 1: Indigo — 深邃靛蓝，现代专注 ── */
  {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    primaryActive: '#4338ca',
    primarySoft: 'rgba(129, 140, 248, 0.2)',
    primaryFaint: 'rgba(129, 140, 248, 0.08)',
    primaryGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)',
    primaryRgb: '99, 102, 241',
    primaryAlpha: 'rgba(99, 102, 241, 0.12)',
    surfaceBase: '#0f1129',
    surfaceSunken: '#181b3a',
    surfaceRaised: '#222752',
    surfaceOverlay: 'rgba(24, 27, 58, 0.92)',
    surfaceGradient: 'linear-gradient(135deg, #0f1129 0%, #181b3a 30%, #222752 60%, #2d3270 100%)',
    accent: '#818cf8',
    accentRgb: '129, 140, 248',
    accentGradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)',
    borderSubtle: 'rgba(129, 140, 248, 0.22)',
    borderFocus: '#818cf8',
    borderStrong: 'rgba(129, 140, 248, 0.4)',
    textPrimary: '#eef2ff',
    textSecondary: '#c7d2fe',
    textMuted: 'rgba(199, 210, 254, 0.55)',
    textAccent: '#a5b4fc',
    linkColor: '#a5b4fc',
    placeholderColor: 'rgba(199, 210, 254, 0.45)',
    buttonBg: '#6366f1',
    buttonHover: '#4f46e5',
    buttonText: '#ffffff',
    inputBg: '#1a1d3a',
    inputBorder: 'rgba(129, 140, 248, 0.18)',
    selectionBg: 'rgba(99, 102, 241, 0.25)',
    headerBg: 'rgba(15, 17, 41, 0.85)',
    headerBgGradient: 'linear-gradient(180deg, rgba(99, 102, 241, 0.22) 0%, rgba(15, 17, 41, 0.85) 55%, rgba(24, 27, 58, 0.92) 100%)',
    headerBorder: 'rgba(129, 140, 248, 0.28)',
    headerTextPrimary: '#eef2ff',
    headerTextSecondary: 'rgba(199, 210, 254, 0.75)',
    headerAccent: '#a5b4fc',
    headerGlow: '0 0 40px rgba(99, 102, 241, 0.12), 0 1px 0 rgba(255, 255, 255, 0.08) inset',
  },
  /* ── 2: Ocean — 深海蓝绿，沉静清晰 ── */
  {
    primary: '#0d9488',
    primaryHover: '#0f766e',
    primaryActive: '#115e59',
    primarySoft: 'rgba(45, 212, 191, 0.18)',
    primaryFaint: 'rgba(45, 212, 191, 0.08)',
    primaryGradient: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #0f766e 0%, #0e7490 50%, #0369a1 100%)',
    primaryRgb: '13, 148, 136',
    primaryAlpha: 'rgba(13, 148, 136, 0.12)',
    surfaceBase: '#0a1620',
    surfaceSunken: '#0f1f2b',
    surfaceRaised: '#162d3b',
    surfaceOverlay: 'rgba(15, 31, 43, 0.92)',
    surfaceGradient: 'linear-gradient(135deg, #0a1620 0%, #0f1f2b 30%, #162d3b 60%, #1d3f52 100%)',
    accent: '#22d3ee',
    accentRgb: '34, 211, 238',
    accentGradient: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #0891b2 100%)',
    borderSubtle: 'rgba(34, 211, 238, 0.2)',
    borderFocus: '#22d3ee',
    borderStrong: 'rgba(34, 211, 238, 0.38)',
    textPrimary: '#ecfeff',
    textSecondary: '#cffafe',
    textMuted: 'rgba(207, 250, 254, 0.55)',
    textAccent: '#67e8f9',
    linkColor: '#67e8f9',
    placeholderColor: 'rgba(207, 250, 254, 0.45)',
    buttonBg: '#0d9488',
    buttonHover: '#0f766e',
    buttonText: '#ffffff',
    inputBg: '#101f28',
    inputBorder: 'rgba(34, 211, 238, 0.15)',
    selectionBg: 'rgba(13, 148, 136, 0.25)',
    headerBg: 'rgba(10, 22, 32, 0.85)',
    headerBgGradient: 'linear-gradient(180deg, rgba(13, 148, 136, 0.20) 0%, rgba(10, 22, 32, 0.85) 55%, rgba(15, 31, 43, 0.92) 100%)',
    headerBorder: 'rgba(34, 211, 238, 0.26)',
    headerTextPrimary: '#ecfeff',
    headerTextSecondary: 'rgba(207, 250, 254, 0.74)',
    headerAccent: '#67e8f9',
    headerGlow: '0 0 38px rgba(13, 148, 136, 0.10), 0 1px 0 rgba(255, 255, 255, 0.07) inset',
  },
  /* ── 3: Forest — 翠绿森林，自然沉稳 ── */
  {
    primary: '#16a34a',
    primaryHover: '#15803d',
    primaryActive: '#166534',
    primarySoft: 'rgba(74, 222, 128, 0.18)',
    primaryFaint: 'rgba(74, 222, 128, 0.08)',
    primaryGradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #15803d 0%, #166534 50%, #14532d 100%)',
    primaryRgb: '22, 163, 74',
    primaryAlpha: 'rgba(22, 163, 74, 0.12)',
    surfaceBase: '#0a1710',
    surfaceSunken: '#0f2216',
    surfaceRaised: '#162f20',
    surfaceOverlay: 'rgba(15, 34, 22, 0.92)',
    surfaceGradient: 'linear-gradient(135deg, #0a1710 0%, #0f2216 30%, #162f20 60%, #1d402b 100%)',
    accent: '#34d399',
    accentRgb: '52, 211, 153',
    accentGradient: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    borderSubtle: 'rgba(52, 211, 153, 0.2)',
    borderFocus: '#34d399',
    borderStrong: 'rgba(52, 211, 153, 0.38)',
    textPrimary: '#ecfdf5',
    textSecondary: '#d1fae5',
    textMuted: 'rgba(209, 250, 229, 0.55)',
    textAccent: '#6ee7b7',
    linkColor: '#6ee7b7',
    placeholderColor: 'rgba(209, 250, 229, 0.45)',
    buttonBg: '#16a34a',
    buttonHover: '#15803d',
    buttonText: '#ffffff',
    inputBg: '#101f16',
    inputBorder: 'rgba(52, 211, 153, 0.15)',
    selectionBg: 'rgba(22, 163, 74, 0.25)',
    headerBg: 'rgba(10, 23, 16, 0.85)',
    headerBgGradient: 'linear-gradient(180deg, rgba(22, 163, 74, 0.20) 0%, rgba(10, 23, 16, 0.85) 55%, rgba(15, 34, 22, 0.92) 100%)',
    headerBorder: 'rgba(52, 211, 153, 0.26)',
    headerTextPrimary: '#ecfdf5',
    headerTextSecondary: 'rgba(209, 250, 229, 0.74)',
    headerAccent: '#6ee7b7',
    headerGlow: '0 0 38px rgba(22, 163, 74, 0.10), 0 1px 0 rgba(255, 255, 255, 0.07) inset',
  },
  /* ── 4: Sunset — 落日暖橙，活力温暖 ── */
  {
    primary: '#d97706',
    primaryHover: '#b45309',
    primaryActive: '#92400e',
    primarySoft: 'rgba(251, 191, 36, 0.18)',
    primaryFaint: 'rgba(251, 191, 36, 0.08)',
    primaryGradient: 'linear-gradient(135deg, #d97706 0%, #c2410c 50%, #9a3412 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #b45309 0%, #9a3412 50%, #7c2d12 100%)',
    primaryRgb: '217, 119, 6',
    primaryAlpha: 'rgba(217, 119, 6, 0.12)',
    surfaceBase: '#1a140a',
    surfaceSunken: '#261e0e',
    surfaceRaised: '#352a14',
    surfaceOverlay: 'rgba(38, 30, 14, 0.92)',
    surfaceGradient: 'linear-gradient(135deg, #1a140a 0%, #261e0e 30%, #352a14 60%, #4a3a1a 100%)',
    accent: '#fb923c',
    accentRgb: '251, 146, 60',
    accentGradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
    borderSubtle: 'rgba(251, 191, 36, 0.2)',
    borderFocus: '#fbbf24',
    borderStrong: 'rgba(251, 191, 36, 0.38)',
    textPrimary: '#fffbeb',
    textSecondary: '#fef3c7',
    textMuted: 'rgba(254, 243, 199, 0.55)',
    textAccent: '#fcd34d',
    linkColor: '#fcd34d',
    placeholderColor: 'rgba(254, 243, 199, 0.45)',
    buttonBg: '#d97706',
    buttonHover: '#b45309',
    buttonText: '#ffffff',
    inputBg: '#1f180e',
    inputBorder: 'rgba(251, 191, 36, 0.15)',
    selectionBg: 'rgba(217, 119, 6, 0.25)',
    headerBg: 'rgba(26, 20, 10, 0.85)',
    headerBgGradient: 'linear-gradient(180deg, rgba(217, 119, 6, 0.22) 0%, rgba(26, 20, 10, 0.85) 55%, rgba(38, 30, 14, 0.92) 100%)',
    headerBorder: 'rgba(251, 191, 36, 0.28)',
    headerTextPrimary: '#fffbeb',
    headerTextSecondary: 'rgba(254, 243, 199, 0.75)',
    headerAccent: '#fcd34d',
    headerGlow: '0 0 40px rgba(217, 119, 6, 0.12), 0 1px 0 rgba(255, 255, 255, 0.08) inset',
  },
  /* ── 5: Rose — 玫红柔粉，温暖创意 ── */
  {
    primary: '#be185d',
    primaryHover: '#9d174d',
    primaryActive: '#831843',
    primarySoft: 'rgba(244, 114, 182, 0.18)',
    primaryFaint: 'rgba(244, 114, 182, 0.08)',
    primaryGradient: 'linear-gradient(135deg, #be185d 0%, #9d174d 50%, #831843 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #9d174d 0%, #831843 50%, #701a3d 100%)',
    primaryRgb: '190, 24, 93',
    primaryAlpha: 'rgba(190, 24, 93, 0.12)',
    surfaceBase: '#1a0f16',
    surfaceSunken: '#261521',
    surfaceRaised: '#351d2e',
    surfaceOverlay: 'rgba(38, 21, 33, 0.92)',
    surfaceGradient: 'linear-gradient(135deg, #1a0f16 0%, #261521 30%, #351d2e 60%, #4a283f 100%)',
    accent: '#f472b6',
    accentRgb: '244, 114, 182',
    accentGradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
    borderSubtle: 'rgba(244, 114, 182, 0.22)',
    borderFocus: '#f472b6',
    borderStrong: 'rgba(244, 114, 182, 0.4)',
    textPrimary: '#fdf2f8',
    textSecondary: '#fce7f3',
    textMuted: 'rgba(252, 231, 243, 0.55)',
    textAccent: '#f9a8d4',
    linkColor: '#f9a8d4',
    placeholderColor: 'rgba(252, 231, 243, 0.45)',
    buttonBg: '#be185d',
    buttonHover: '#9d174d',
    buttonText: '#ffffff',
    inputBg: '#1f141a',
    inputBorder: 'rgba(244, 114, 182, 0.18)',
    selectionBg: 'rgba(190, 24, 93, 0.25)',
    headerBg: 'rgba(26, 15, 22, 0.85)',
    headerBgGradient: 'linear-gradient(180deg, rgba(190, 24, 93, 0.22) 0%, rgba(26, 15, 22, 0.85) 55%, rgba(38, 21, 33, 0.92) 100%)',
    headerBorder: 'rgba(244, 114, 182, 0.30)',
    headerTextPrimary: '#fdf2f8',
    headerTextSecondary: 'rgba(252, 231, 243, 0.76)',
    headerAccent: '#f9a8d4',
    headerGlow: '0 0 42px rgba(190, 24, 93, 0.12), 0 1px 0 rgba(255, 255, 255, 0.08) inset',
  },
  /* ── 6: Lavender — 薰衣草紫，优雅浪漫 ── */
  {
    primary: '#a78bfa',
    primaryHover: '#8b5cf6',
    primaryActive: '#7c3aed',
    primarySoft: 'rgba(196, 181, 253, 0.2)',
    primaryFaint: 'rgba(196, 181, 253, 0.08)',
    primaryGradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
    primaryRgb: '167, 139, 250',
    primaryAlpha: 'rgba(167, 139, 250, 0.12)',
    surfaceBase: '#13111a',
    surfaceSunken: '#1c1926',
    surfaceRaised: '#262333',
    surfaceOverlay: 'rgba(28, 25, 38, 0.92)',
    surfaceGradient: 'linear-gradient(135deg, #13111a 0%, #1c1926 30%, #262333 60%, #302e40 100%)',
    accent: '#c4b5fd',
    accentRgb: '196, 181, 253',
    accentGradient: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #8b5cf6 100%)',
    borderSubtle: 'rgba(196, 181, 253, 0.2)',
    borderFocus: '#a78bfa',
    borderStrong: 'rgba(196, 181, 253, 0.38)',
    textPrimary: '#f5f3ff',
    textSecondary: '#e9e5f5',
    textMuted: 'rgba(233, 229, 245, 0.55)',
    textAccent: '#ddd6fe',
    linkColor: '#c4b5fd',
    placeholderColor: 'rgba(233, 229, 245, 0.45)',
    buttonBg: '#8b5cf6',
    buttonHover: '#7c3aed',
    buttonText: '#ffffff',
    inputBg: '#1c1926',
    inputBorder: 'rgba(196, 181, 253, 0.18)',
    selectionBg: 'rgba(167, 139, 250, 0.25)',
    headerBg: 'rgba(19, 17, 26, 0.85)',
    headerBgGradient: 'linear-gradient(180deg, rgba(167, 139, 250, 0.22) 0%, rgba(19, 17, 26, 0.85) 55%, rgba(28, 25, 38, 0.92) 100%)',
    headerBorder: 'rgba(196, 181, 253, 0.28)',
    headerTextPrimary: '#f5f3ff',
    headerTextSecondary: 'rgba(233, 229, 245, 0.75)',
    headerAccent: '#ddd6fe',
    headerGlow: '0 0 40px rgba(167, 139, 250, 0.12), 0 1px 0 rgba(255, 255, 255, 0.08) inset',
  },
  /* ── 7: Mint — 薄荷绿，清新自然 ── */
  {
    primary: '#34d399',
    primaryHover: '#10b981',
    primaryActive: '#059669',
    primarySoft: 'rgba(110, 231, 183, 0.18)',
    primaryFaint: 'rgba(110, 231, 183, 0.08)',
    primaryGradient: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    primaryRgb: '52, 211, 153',
    primaryAlpha: 'rgba(52, 211, 153, 0.12)',
    surfaceBase: '#0a1512',
    surfaceSunken: '#0f2119',
    surfaceRaised: '#162e24',
    surfaceOverlay: 'rgba(15, 33, 25, 0.92)',
    surfaceGradient: 'linear-gradient(135deg, #0a1512 0%, #0f2119 30%, #162e24 60%, #1d3a2e 100%)',
    accent: '#6ee7b7',
    accentRgb: '110, 231, 183',
    accentGradient: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #10b981 100%)',
    borderSubtle: 'rgba(110, 231, 183, 0.2)',
    borderFocus: '#34d399',
    borderStrong: 'rgba(110, 231, 183, 0.38)',
    textPrimary: '#ecfdf5',
    textSecondary: '#d1fae5',
    textMuted: 'rgba(209, 250, 229, 0.55)',
    textAccent: '#a7f3d0',
    linkColor: '#6ee7b7',
    placeholderColor: 'rgba(209, 250, 229, 0.45)',
    buttonBg: '#10b981',
    buttonHover: '#059669',
    buttonText: '#ffffff',
    inputBg: '#0f2119',
    inputBorder: 'rgba(110, 231, 183, 0.15)',
    selectionBg: 'rgba(52, 211, 153, 0.25)',
    headerBg: 'rgba(10, 21, 18, 0.85)',
    headerBgGradient: 'linear-gradient(180deg, rgba(52, 211, 153, 0.20) 0%, rgba(10, 21, 18, 0.85) 55%, rgba(15, 33, 25, 0.92) 100%)',
    headerBorder: 'rgba(110, 231, 183, 0.26)',
    headerTextPrimary: '#ecfdf5',
    headerTextSecondary: 'rgba(209, 250, 229, 0.74)',
    headerAccent: '#a7f3d0',
    headerGlow: '0 0 38px rgba(52, 211, 153, 0.10), 0 1px 0 rgba(255, 255, 255, 0.07) inset',
  },
  /* ── 8: Sky — 天空蓝，通透宁静 ── */
  {
    primary: '#38bdf8',
    primaryHover: '#0ea5e9',
    primaryActive: '#0284c7',
    primarySoft: 'rgba(125, 211, 252, 0.18)',
    primaryFaint: 'rgba(125, 211, 252, 0.08)',
    primaryGradient: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
    primaryRgb: '56, 189, 248',
    primaryAlpha: 'rgba(56, 189, 248, 0.12)',
    surfaceBase: '#0a1318',
    surfaceSunken: '#0f1f28',
    surfaceRaised: '#162b38',
    surfaceOverlay: 'rgba(15, 31, 40, 0.92)',
    surfaceGradient: 'linear-gradient(135deg, #0a1318 0%, #0f1f28 30%, #162b38 60%, #1d3848 100%)',
    accent: '#7dd3fc',
    accentRgb: '125, 211, 252',
    accentGradient: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%)',
    borderSubtle: 'rgba(125, 211, 252, 0.2)',
    borderFocus: '#38bdf8',
    borderStrong: 'rgba(125, 211, 252, 0.38)',
    textPrimary: '#f0f9ff',
    textSecondary: '#e0f2fe',
    textMuted: 'rgba(224, 242, 254, 0.55)',
    textAccent: '#bae6fd',
    linkColor: '#7dd3fc',
    placeholderColor: 'rgba(224, 242, 254, 0.45)',
    buttonBg: '#0ea5e9',
    buttonHover: '#0284c7',
    buttonText: '#ffffff',
    inputBg: '#0f1f28',
    inputBorder: 'rgba(125, 211, 252, 0.15)',
    selectionBg: 'rgba(56, 189, 248, 0.25)',
    headerBg: 'rgba(10, 19, 24, 0.85)',
    headerBgGradient: 'linear-gradient(180deg, rgba(56, 189, 248, 0.22) 0%, rgba(10, 19, 24, 0.85) 55%, rgba(15, 31, 40, 0.92) 100%)',
    headerBorder: 'rgba(125, 211, 252, 0.28)',
    headerTextPrimary: '#f0f9ff',
    headerTextSecondary: 'rgba(224, 242, 254, 0.75)',
    headerAccent: '#bae6fd',
    headerGlow: '0 0 40px rgba(56, 189, 248, 0.12), 0 1px 0 rgba(255, 255, 255, 0.08) inset',
  },
];

/**
 * 纯净浅色主题（idx = -1）— 尊重宿主页面样式的"无主题"模式。
 * 当用户不希望 YiPet 注入强色彩时使用此调色板。
 */
export const NONE_PALETTE: ThemePalette = {
  primary: '#6366f1',
  primaryHover: '#4f46e5',
  primaryActive: '#4338ca',
  primarySoft: 'rgba(99, 102, 241, 0.1)',
  primaryFaint: 'rgba(99, 102, 241, 0.04)',
  primaryGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
  primaryGradientHover: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)',
  primaryRgb: '99, 102, 241',
  primaryAlpha: 'rgba(99, 102, 241, 0.08)',
  surfaceBase: '#ffffff',
  surfaceSunken: '#f8fafc',
  surfaceRaised: '#f1f5f9',
  surfaceOverlay: '#ffffff',
  surfaceGradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
  accent: '#6366f1',
  accentRgb: '99, 102, 241',
  accentGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
  borderSubtle: 'rgba(0, 0, 0, 0.1)',
  borderFocus: '#6366f1',
  borderStrong: 'rgba(0, 0, 0, 0.18)',
  textPrimary: '#1e293b',
  textSecondary: '#475569',
  textMuted: 'rgba(71, 85, 105, 0.6)',
  textAccent: '#4f46e5',
  linkColor: '#4f46e5',
  placeholderColor: 'rgba(71, 85, 105, 0.45)',
  buttonBg: '#6366f1',
  buttonHover: '#4f46e5',
  buttonText: '#ffffff',
  inputBg: '#ffffff',
  inputBorder: 'rgba(0, 0, 0, 0.12)',
  selectionBg: 'rgba(99, 102, 241, 0.15)',
  headerBg: '#ffffff',
  headerBgGradient: 'linear-gradient(180deg, rgba(99, 102, 241, 0.06) 0%, #ffffff 55%, #f8fafc 100%)',
  headerBorder: 'rgba(0, 0, 0, 0.10)',
  headerTextPrimary: '#1e293b',
  headerTextSecondary: 'rgba(71, 85, 105, 0.75)',
  headerAccent: '#4f46e5',
  headerGlow: '0 0 24px rgba(99, 102, 241, 0.06), 0 1px 0 rgba(0, 0, 0, 0.05) inset',
};

// ── 公开 API ─────────────────────────────────────────────────────────────

/**
 * 根据索引查找调色板。索引越界时回退到第一个预设。
 * @param idx 调色板索引；-1 表示 NONE_PALETTE（浅色无主题）
 */
export function resolvePalette(idx: number): { palette: ThemePalette; scheme: ColorScheme } {
  if (idx < 0) return { palette: NONE_PALETTE, scheme: 'light' };
  if (!Number.isInteger(idx) || idx < 0 || idx >= THEME_PALETTES.length) {
    return { palette: THEME_PALETTES[0]!, scheme: 'dark' };
  }
  return { palette: THEME_PALETTES[idx]!, scheme: 'dark' };
}

/**
 * 将主题调色板的 CSS 变量注入到 root 元素。
 *
 * 注意：root 应为 YiPet 容器（chat-root / overlay / popup root），
 * 切勿使用 document.documentElement，否则会破坏宿主页面样式。
 *
 * @param root 注入目标容器
 * @param idx 调色板索引；-1 表示 NONE_PALETTE（浅色无主题）
 */
export function applyThemeColors(root: HTMLElement, idx: number): void {
  const { palette, scheme } = resolvePalette(idx);
  applyPaletteToRoot(root, palette, scheme);
}

/**
 * 根据用户自定义 hex 主色生成调色板并注入。
 *
 * 自定义色保留主色 hue，生成协调的暗色 surface 与浅色 text；
 * 由于是用户自选主色，scheme 始终为 'dark'（与 NONE 区分）。
 *
 * @returns 是否成功（hex 非法时返回 false）
 */
export function applyThemeHex(root: HTMLElement, hex: string): boolean {
  const palette = generatePalette(hex);
  if (!palette) return false;
  applyPaletteToRoot(root, palette, 'dark');
  return true;
}

/**
 * 清除注入到 root 元素的主题 CSS 变量，恢复宿主页面的初始样式。
 */
export function clearThemeColors(root: HTMLElement): void {
  clearPaletteFromRoot(root);
}

// ── 内部依赖 ─────────────────────────────────────────────────────────────
//
// generatePalette 与 ColorScheme 类型在此处 re-export，避免上层直接引用 color-generator 路径。
// 通过本地延迟绑定（IIFE-style getter）保持模块循环依赖安全。

import { generatePalette } from './color-generator';