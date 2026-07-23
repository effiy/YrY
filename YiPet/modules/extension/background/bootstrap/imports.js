;(function initBackgroundImports() {
  const toUrl = (path) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function') {
        return chrome.runtime.getURL(path)
      }
    } catch (_) {}
    return path
  }

  const safeImport = (path) => {
    try {
      importScripts(toUrl(path))
    } catch (e) {
      try {
        console.error('无法加载脚本:', path, e)
      } catch (_) {}
    }
  }

  ;[
    'core/config.js',

    'cdn/utils/core-ext/logging/loggerUtils.js',
    'cdn/utils/core-ext/error/errorHandler.js',
    'cdn/utils/core-ext/runtime/moduleUtils.js',
    'cdn/utils/core-ext/runtime/globalAccessor.js',

    'modules/extension/background/services/tabMessaging.js',
    'modules/extension/background/services/injectionService.js',

    'modules/extension/background/integrations/wework/weworkService.js',

    'modules/extension/background/actions/extensionHandler.js',
    'modules/extension/background/actions/petHandler.js',
    'modules/extension/background/actions/messageForwardHandler.js',
    'modules/extension/background/actions/tabHandler.js',

    'modules/extension/background/integrations/wework/weworkHandler.js',

    'modules/extension/background/messaging/messageRouter.js',
  ].forEach(safeImport)
})()
