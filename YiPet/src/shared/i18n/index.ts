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
  | 'cmdScreenshot'
  | 'cmdToggleMute'
  // Shortcut cheatsheet
  | 'shortcutCheatsheetTitle'
  | 'shortcutSearchPlaceholder'
  | 'shortcutNoMatch'
  | 'shortcutCategoryPet'
  | 'shortcutCategoryChat'
  | 'shortcutCategoryNavigation'
  | 'shortcutCategoryUtility'
  // Popup — labels
  | 'popupTitle'
  | 'popupSwitchLabel'
  | 'popupSwitchDesc'
  | 'popupSizeLabel'
  | 'popupRoleLabel'
  | 'popupColorLabel'
  | 'popupPageThemeLabel'
  | 'popupPageThemeHint'
  | 'popupCustomColorLabel'
  | 'popupCustomColorHint'
  | 'popupSettingsTitle'
  | 'popupModelPrefix'
  | 'popupSubtitle'
  | 'popupPreviewTitle'
  | 'popupModelLabel'
  | 'popupReset'
  | 'popupSectionAppearance'
  | 'popupSectionPreferences'
  | 'popupSwitchHint'
  | 'popupModelHint'
  | 'popupLanguageLabel'
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
  | 'notifyPageThemeOn'
  | 'notifyPageThemeOff'
  | 'notifyModelUpdated'
  | 'notifyLanguageChanged'
  // Popup — error notifications
  | 'errorOperationFailed'
  | 'errorTabNotFound'
  | 'errorInitFailed'
  | 'errorContentScriptNotReady'
  // Chat — input & actions
  | 'chatInputPlaceholder'
  | 'chatPlaceholderSlash'
  | 'chatPlaceholderFetching'
  | 'chatPlaceholderRetrieving'
  | 'chatPlaceholderThinking'
  | 'chatPlaceholderStreaming'
  | 'chatPlaceholderSearching'
  | 'chatPlaceholderDefault'
  | 'chatSend'
  | 'chatStop'
  | 'chatRegenerate'
  | 'chatRetry'
  | 'chatCopy'
  | 'chatCopied'
  | 'chatEdit'
  | 'chatDelete'
  | 'chatSave'
  | 'chatCancel'
  | 'chatResend'
  | 'chatSearchWeb'
  | 'chatLike'
  | 'chatDislike'
  | 'chatSaveToKnowledge'
  | 'chatOpenInYiVad'
  | 'chatBranchFromHere'
  | 'chatClearAll'
  | 'chatRemove'
  | 'chatDownloadFile'
  | 'chatMarkdownPlaceholder'
  | 'chatSessionContextFile'
  | 'chatClearContext'
  | 'chatContextEnabled'
  | 'chatKnowledgeEnabled'
  | 'chatNoMessages'
  | 'chatExportMarkdown'
  | 'chatExported'
  | 'chatNothingToExport'
  | 'chatSummarizeSession'
  | 'chatSummarizing'
  | 'chatSummaryCopied'
  | 'chatAutoTitle'
  | 'chatTitleGenerated'
  | 'chatPromptHistory'
  | 'chatPromptHistoryClear'
  | 'chatPromptHistoryCount'
  | 'chatUploadImage'
  | 'chatActiveContext'
  | 'chatClickToPreview'
  | 'chatToolbarAriaLabel'
  | 'contextBackToSessions'
  | 'contextFilesLabel'
  | 'contextSessionTitle'
  | 'contextSavedToKB'
  | 'contextSaveToKB'
  | 'chatInsertSelection'
  | 'chatNoSelection'
  | 'chatSelectionInserted'
  | 'chatFilterByPage'
  | 'chatFilterByPageActive'
  | 'chatDiscussInYiVad'
  | 'chatSessionBranched'
  | 'chatToggleSidebar'
  | 'chatCloseWindow'
  | 'chatClearInput'
  | 'chatInputAriaLabel'
  | 'chatCleared'
  | 'chatCompactUnavailable'
  | 'chatMsgUpdated'
  | 'chatMsgDeleted'
  | 'chatOpenedInYiVad'
  | 'chatSessionsDeleted'
  | 'errorSyncFailed'
  | 'errorSyncFailedRetry'
  | 'welcomeUntitled'
  | 'welcomeOpenPage'
  | 'sessionEditContext'
  | 'sessionEditContextCount'
  // Sidebar
  | 'sidebarSessions'
  | 'sidebarKnowledge'
  | 'sidebarStories'
  | 'sidebarBugs'
  | 'sidebarCollapse'
  | 'sidebarExpand'
  | 'sidebarSearchConversations'
  | 'sidebarSearchKnowledge'
  | 'sidebarNoSessions'
  | 'sidebarNoMatch'
  | 'sidebarNoKnowledge'
  | 'sidebarNoKnowledgeMatch'
  | 'sidebarNoKnowledgeFiles'
  | 'sidebarNoStories'
  | 'sidebarNoBugs'
  | 'sidebarDragKnowledgeHint'
  // Bug Report
  | 'bugReportTitle'
  | 'bugReportSubmit'
  | 'bugReportSuccess'
  | 'bugReportFailed'
  | 'bugFieldTitle'
  | 'bugFieldProject'
  | 'bugFieldModule'
  | 'bugFieldSeverity'
  | 'bugFieldPriority'
  | 'bugFieldStatus'
  | 'bugFieldType'
  | 'bugFieldFrequency'
  | 'bugFieldAssignee'
  | 'bugFieldReporter'
  | 'bugFieldEnvironment'
  | 'bugFieldAffectedVersion'
  | 'bugFieldFixedVersion'
  | 'bugFieldTags'
  | 'bugFieldDescription'
  | 'bugFieldSteps'
  | 'bugFieldExpected'
  | 'bugFieldActual'
  | 'bugDiscussInChat'
  | 'bugOpenInYiVad'
  // Knowledge
  | 'knowledgePreviewTitle'
  | 'knowledgePreviewLoading'
  | 'knowledgePreviewError'
  | 'knowledgeScopeLabel'
  | 'knowledgeScopeClear'
  | 'knowledgeScopeAll'
  | 'knowledgeCategoryFilter'
  | 'knowledgeReload'
  | 'knowledgeEmpty'
  | 'knowledgeFileSaved'
  | 'knowledgeFileSaveFailed'
  | 'knowledgeFileSaveTitle'
  | 'knowledgeFilePath'
  | 'knowledgeFileTitle'
  | 'knowledgeFileCategory'
  | 'knowledgeFileTags'
  | 'knowledgeFileType'
  // RAG
  | 'ragSourcesPreview'
  | 'ragSourcesDialogTitle'
  | 'ragSourcesEmpty'
  | 'ragSourcesLoading'
  | 'ragDecompose'
  | 'ragDecomposeTitle'
  | 'ragDecomposeLoading'
  | 'ragDecomposeSynthesis'
  | 'ragDecomposeSubQuestions'
  | 'ragRebuildIndex'
  | 'ragStatusBuilt'
  | 'ragStatusNotBuilt'
  | 'ragStatusBuilding'
  // Cross-project
  | 'crossProjectYiAi'
  | 'crossProjectYiVad'
  | 'crossProjectYiVadAiChat'
  | 'crossProjectYiVadBugs'
  | 'crossProjectYiVadStories'
  | 'crossProjectMenuTitle'
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
  | 'aboutFeatureI18n'
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
