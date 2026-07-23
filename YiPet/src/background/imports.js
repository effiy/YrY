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
    'src/config/pet.config.js',

    'cdn/utils/core/logger.js',
    'cdn/utils/core/error.js',
    'cdn/utils/core/module-utils.js',
    'cdn/utils/core/global-accessor.js',

    'src/background/services/tab-messaging.service.js',
    'src/background/services/injection.service.js',

    'src/background/integrations/wework/wework.service.js',

    'src/background/handlers/extension.handler.js',
    'src/background/handlers/pet.handler.js',
    'src/background/handlers/message-forward.handler.js',
    'src/background/handlers/tab.handler.js',

    'src/background/integrations/wework/wework.handler.js',

    'src/background/messaging/message-router.js',
  ].forEach(safeImport)
})()
