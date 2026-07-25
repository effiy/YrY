/**
 * 注入服务
 * 统一管理content script和宠物的注入逻辑
 */

class InjectionService {
  /**
   * 从 manifest.json 中动态获取 content_scripts 的 js 文件列表
   * 避免与 manifest.json 手动维护重复的列表
   * @returns {string[]}
   */
  static getContentScriptFiles() {
    try {
      const manifest = chrome.runtime.getManifest()
      const contentScripts = manifest.content_scripts || []
      // 汇总所有 matches 匹配项中的 js 文件（通常只有一个 <all_urls> 条目）
      const allFiles = []
      for (const entry of contentScripts) {
        if (Array.isArray(entry.js)) {
          allFiles.push(...entry.js)
        }
      }
      return allFiles
    } catch (e) {
      console.error('无法读取 manifest，使用空列表:', e)
      return []
    }
  }

  /**
   * 直接注入content script到指定标签页
   * @param {number} tabId - 标签页ID
   * @returns {Promise<boolean>} 是否注入成功
   */
  async injectContentScript(tabId) {
    try {
      console.log('直接注入content script到标签页:', tabId)
      const files = InjectionService.getContentScriptFiles()
      if (files.length === 0) {
        console.error('Content script 文件列表为空，无法注入')
        return false
      }
      await chrome.scripting.executeScript({
        target: { tabId },
        files,
      })
      console.log('Content script 注入成功')
      return true
    } catch (error) {
      console.log('Content script 注入失败:', error)
      return false
    }
  }

  /**
   * 向指定标签页发送消息（必要时自动注入 content script 并重试一次）
   * @param {number} tabId
   * @param {Object} message
   * @returns {Promise<{ok: boolean, response?: any, error?: string, injected?: boolean}>}
   */
  async sendMessageToTabWithAutoInject(tabId, message) {
    const helper = typeof self !== 'undefined' ? self.TabMessaging : null
    if (!helper || typeof helper.sendMessageToTabWithAutoInject !== 'function') {
      return { ok: false, error: 'TabMessaging 不可用' }
    }

    return await helper.sendMessageToTabWithAutoInject(tabId, message, {
      injectContentScript: (id) => this.injectContentScript(id),
      retryDelayMs:
        typeof self !== 'undefined' && self.PET_CONFIG && self.PET_CONFIG.constants && self.PET_CONFIG.constants.TIMING
          ? self.PET_CONFIG.constants.TIMING.INJECT_PET_DELAY
          : 1000,
    })
  }

  /**
   * 向指定标签页注入宠物
   * 如果content script未加载，会先尝试注入content script
   * @param {number} tabId - 标签页ID
   */
  injectPetToTab(tabId) {
    console.log('尝试注入宠物到标签页:', tabId)
    this.sendMessageToTabWithAutoInject(tabId, { action: 'initPet' }).then((result) => {
      if (!result.ok) {
        console.log('无法注入宠物到标签页:', result.error)
      } else {
        console.log('宠物注入成功:', result.response)
      }
    })
  }

  /**
   * 从指定标签页移除宠物
   * @param {number} tabId - 标签页ID
   */
  removePetFromTab(tabId) {
    const helper = typeof self !== 'undefined' ? self.TabMessaging : null
    if (!helper || typeof helper.sendMessageToTab !== 'function') {
      console.error('无法从标签页移除宠物：TabMessaging 不可用')
      return
    }
    helper.sendMessageToTab(tabId, { action: 'removePet' }).then((result) => {
      if (!result.ok) {
        console.log('无法从标签页移除宠物:', result.error)
      }
    })
  }

  /**
   * 获取所有浏览器标签页
   * @returns {Promise<Array>} 标签页数组
   */
  async getAllBrowserTabs() {
    return new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        resolve(tabs)
      })
    })
  }

  /**
   * 在所有标签页中执行操作
   * @param {string} action - 要执行的操作
   * @param {Object} data - 附加数据
   * @returns {Promise<Array>} 执行结果数组
   */
  async executeActionInAllTabs(action, data = {}) {
    const tabs = await this.getAllBrowserTabs()
    const promises = tabs.map((tab) => {
      return new Promise((resolve) => {
        const helper = typeof self !== 'undefined' ? self.TabMessaging : null
        if (!helper || typeof helper.sendMessageToTab !== 'function') {
          resolve({ tabId: tab.id, success: false })
          return
        }
        helper.sendMessageToTab(tab.id, { action, ...data }).then((result) => {
          resolve({ tabId: tab.id, success: !!result.ok })
        })
      })
    })

    return Promise.all(promises)
  }
}

// 导出单例
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InjectionService
} else {
  if (typeof self !== 'undefined') {
    self.InjectionService = new InjectionService()
  }
}
