/**
 * YiPet Shared — barrel export.
 *
 * Domain-specific cross-cutting modules (Chrome extension APIs, i18n, IPC, theme).
 * Pure utilities live in @/utils/.
 */

export type { ExtensionComponent } from './component';
export { wrapComponent } from './component';

// i18n — typed chrome.i18n wrapper
export type { MessageKey } from './i18n/index';
export { localizeDOM, t } from './i18n/index';
export type { SupportedLocale } from './i18n/locale';
export * from './i18n/locale';

// IPC message types
export type * from './ipc/messages';
// Role definitions
export { ROLE_STORAGE_KEY, validateRole } from './roles';
// Chrome storage helpers
export * from './storage/state';

// Theme system — 统一通过 ./theme 子模块 barrel 导出
export {
  applyThemeColors,
  applyThemeHex,
  clearThemeColors,
  applyElementTheme,
  clearElementTheme,
  generatePalette,
  NONE_PALETTE,
  THEME_PALETTES,
  THEME_VAR_KEYS,
  resolvePalette,
} from './theme';
export type { ColorScheme, RgbTuple, ThemePalette } from './theme';
