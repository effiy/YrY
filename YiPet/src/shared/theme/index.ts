/**
 * Theme System Barrel — YiPet 主题色统一入口。
 *
 * ## 模块职责
 * - `colors.ts` — 9 个预设调色板、token 类型、CSS 变量注入
 * - `color-generator.ts` — 自定义 hex → 完整调色板的纯函数生成器
 * - `element-theme.ts` — Element Plus CSS 变量适配器
 *
 * ## 推荐用法
 * ```ts
 * import { applyThemeColors, applyThemeHex } from '@/shared/theme';
 *
 * // 注入预设主题
 * applyThemeColors(chatRoot, 1); // Indigo
 *
 * // 注入用户自定义色
 * applyThemeHex(chatRoot, '#10b981');
 * ```
 */

export {
  applyElementTheme,
  clearElementTheme,
} from './element-theme';

export {
  generatePalette,
  hexToRgb,
  rgbToHsl,
  hslToHex,
  relativeLuminance,
  contrastRatio,
  meetsWCAG,
  findReadableText,
  lightenHex,
  darkenHex,
  saturateHex,
} from './color-generator';

export {
  applyThemeColors,
  applyThemeHex,
  clearThemeColors,
  NONE_PALETTE,
  resolvePalette,
  THEME_PALETTES,
  THEME_VAR_KEYS,
} from './colors';

export type {
  ColorScheme,
  RgbTuple,
  ThemePalette,
} from './colors';