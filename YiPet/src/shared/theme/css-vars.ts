/** CSS variable injection helpers. */
import type { ThemePalette } from './types';

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

export function applyPaletteToRoot(root: HTMLElement, palette: ThemePalette, scheme: ColorScheme): void {
  const style = root.style;
  for (const [field, canonical, legacy] of PALETTE_TO_CSS) {
    const value = palette[field];
    style.setProperty(canonical, value);
    style.setProperty(legacy, value);
  }
  style.colorScheme = scheme;
}

export function clearPaletteFromRoot(root: HTMLElement): void {
  for (const name of THEME_VAR_KEYS) {
    root.style.removeProperty(name);
  }
  root.style.colorScheme = '';
}

