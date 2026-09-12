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

// Theme system
export { applyThemeColors } from './theme/colors';
