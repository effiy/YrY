/**
 * Element Plus theme adapter — maps YiPet color palette to Element Plus CSS vars.
 *
 * Used by popup and chat surfaces to apply the active theme. Element Plus uses
 * CSS custom properties for theming, so we inject the mapped vars onto the root
 * element. CSP-safe for MV3.
 */
import type { ThemePalette } from './colors';
import { NONE_PALETTE, THEME_PALETTES } from './colors';

/**
 * YiPet palette → Element Plus CSS var mapping.
 * Each entry: [paletteField, elementPlusVarName]
 */
const EP_VAR_MAP: ReadonlyArray<readonly [keyof ThemePalette, string]> = [
  ['primary', '--el-color-primary'],
  ['primaryHover', '--el-color-primary-light-3'],
  ['primaryLight', '--el-color-primary-light-5'],
  ['primaryAlpha', '--el-color-primary-light-9'],
  ['bgPrimary', '--el-bg-color'],
  ['bgSecondary', '--el-bg-color-overlay'],
  ['bgPrimary', '--el-bg-color-page'],
  ['textPrimary', '--el-text-color-primary'],
  ['textSecondary', '--el-text-color-regular'],
  ['borderSecondary', '--el-border-color'],
  ['borderSecondary', '--el-border-color-base'],
  ['inputBg', '--el-fill-color-blank'],
  ['buttonBg', '--el-button-bg-color'],
  ['buttonHover', '--el-button-hover-bg-color'],
  ['buttonText', '--el-button-text-color'],
  ['linkColor', '--el-color-info'],
];

/**
 * Apply Element Plus CSS variables to a root element based on palette index.
 * Pass idx < 0 for the None palette (light theme).
 */
export function applyElementTheme(root: HTMLElement, idx: number): void {
  const s = root.style;
  const p: ThemePalette = idx < 0 || idx >= THEME_PALETTES.length ? NONE_PALETTE : THEME_PALETTES[idx];

  for (const [field, varName] of EP_VAR_MAP) {
    s.setProperty(varName, p[field]);
  }
}

/**
 * Remove Element Plus theme CSS variables from the root element.
 */
export function clearElementTheme(root: HTMLElement): void {
  for (const [, varName] of EP_VAR_MAP) {
    root.style.removeProperty(varName);
  }
}