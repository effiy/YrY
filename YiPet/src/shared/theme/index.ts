/**
 * Theme system barrel — color palettes, injection utilities, Element Plus adapter,
 * and palette generator.
 */

export { applyElementTheme, clearElementTheme } from './element-theme';
export { generatePalette } from './color-generator';
export {
  applyThemeColors,
  applyThemeHex,
  clearThemeColors,
  NONE_PALETTE,
  THEME_PALETTES,
  THEME_VAR_KEYS,
  type ThemePalette,
} from './colors';
