/**
 * Typed i18n wrapper around chrome.i18n.getMessage.
 *
 * MessageKey is a union of all known keys — add new keys here.
 * t() returns the localized string, or the key itself as fallback.
 * localizeDOM() processes [data-i18n] attributes in static HTML.
 */

/* ── Message Key Registry ───────────────────────────────────────────────── */

export type MessageKey =
  // Extension metadata
  | 'extName'
  | 'extDescription'
  | 'extDefaultTitle'
  // Commands
  | 'cmdTogglePet'
  | 'cmdOpenChat'
  // Popup — labels
  | 'popupTitle'
  | 'popupSwitchLabel'
  | 'popupSwitchDesc'
  | 'popupSizeLabel'
  | 'popupRoleLabel'
  | 'popupColorLabel'
  | 'popupSettingsTitle'
  | 'popupModelPrefix'
  // Popup — status
  | 'popupStatusConnecting'
  | 'popupStatusReady'
  | 'popupStatusReadyOffline'
  | 'popupStatusActive'
  | 'popupStatusHidden'
  // Popup — success notifications
  | 'notifyShown'
  | 'notifyHidden'
  | 'notifySizeUpdated'
  | 'notifyRoleChanged'
  | 'notifyColorSet'
  | 'notifyLanguageChanged'
  // Popup — error notifications
  | 'errorOperationFailed'
  | 'errorTabNotFound'
  | 'errorInitFailed'
  | 'errorContentScriptNotReady'
  // Chat
  | 'chatInputPlaceholder'
  // Thinking bubble texts
  | 'thinkLetMeThink'
  | 'thinkThinking'
  | 'thinkInspiration'
  | 'thinkOrganizing'
  | 'thinkDeepAnalysis'
  | 'thinkSearching'
  | 'thinkIdea'
  | 'thinkBrainstorming'
  | 'thinkChoosing'
  | 'thinkCrafting'
  | 'thinkAlmostThere'
  | 'thinkNearlyReady'
  | 'thinkComingRightUp'
  // Error messages (shared)
  | 'errorContextInvalidated'
  | 'errorQuotaExceeded'
  | 'errorRetrying'
  | 'errorRetrySuccess'
  | 'errorRetryFailed'
  // Success messages (shared)
  | 'successColorChanged'
  | 'successPositionReset'
  | 'successCentered'
  // About
  | 'aboutTitle'
  | 'aboutTagline'
  | 'aboutDescription'
  | 'aboutVersion'
  | 'aboutTechStack'
  | 'aboutFeaturesTitle'
  | 'aboutFeaturePet'
  | 'aboutFeatureChat'
  | 'aboutFeatureI18n'
  | 'aboutFeatureTimezone'
  | 'aboutFeatureCDN'
  | 'aboutFeatureApi'
  | 'aboutArchitectureTitle'
  | 'aboutArchitectureDesc'
  | 'aboutArchLayerPopup'
  | 'aboutArchLayerContent'
  | 'aboutArchLayerBackend'
  | 'aboutBackendTitle'
  | 'aboutBackendDesc'
  | 'aboutProdDepsTitle'
  | 'aboutDevDepsTitle'
  // Misc
  | 'popupSizeUnit'
  | 'popupVersion'
  // Language
  | 'popupLanguageLabel';

import { lookupMessage } from './messages';

/* ── Public API ─────────────────────────────────────────────────────────── */

/**
 * Translate a message key. Uses the runtime-loaded locale cache first,
 * falling back to chrome.i18n.getMessage() (which is keyed to the browser
 * UI language). Never returns "" — caller always gets something displayable.
 */
export function t(key: MessageKey, substitutions?: string | string[]): string {
  // Try runtime cache first (supports user-selected locale)
  const cached = lookupMessage(key, undefined, substitutions);
  if (cached) return cached;

  // Fallback to Chrome's built-in i18n
  return chrome.i18n.getMessage(key, substitutions) || key;
}

/**
 * Process all [data-i18n], [data-i18n-title], and [data-i18n-placeholder]
 * elements in the given root, replacing their content with translated strings.
 * Call once after mount, or after switching locale at runtime.
 */
export function localizeDOM(root: HTMLElement = document.body): void {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as MessageKey;
    if (key) el.textContent = t(key);
  });

  root.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    const key = el.dataset.i18nTitle as MessageKey;
    if (key) el.title = t(key);
  });

  root.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder as MessageKey;
    if (key) el.placeholder = t(key);
  });
}
