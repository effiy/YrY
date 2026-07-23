/**
 * Chrome扩展Content Script
 * 负责在网页中创建和管理宠物
 */

;(function () {
  try {
    const keyName =
      typeof PET_CONFIG !== 'undefined' && PET_CONFIG.constants && PET_CONFIG.constants.storageKeys
        ? PET_CONFIG.constants.storageKeys.devMode
        : 'petDevMode'
    LoggerUtils.initMuteLogger(keyName, false)
  } catch (e) {}
})()

// ---------------------------------------------------------------------------
// 将 CDN vendor 库注入到页面主世界，使其可在浏览器控制台中直接使用
// MV3 content script 运行于隔离世界，仅注入到页面 DOM 的脚本对控制台可见
// ---------------------------------------------------------------------------
;(function () {
  'use strict'
  const head = document.head || document.documentElement
  if (!head) return

  function getUrl(path) {
    try { return chrome.runtime.getURL(path) } catch (_) { return null }
  }

  /**
   * 注入单个脚本到主世界
   * @param {string} path - 相对于扩展根目录的路径
   * @returns {Promise<void>}
   */
  function injectScript(path) {
    return new Promise(function (resolve) {
      var url = getUrl(path)
      if (!url) { resolve(); return }
      var el = document.createElement('script')
      el.src = url
      el.async = false
      el.onload = function () { resolve() }
      el.onerror = function () { resolve() }
      head.appendChild(el)
    })
  }

  // 按依赖顺序注入：先注入基础库，后注入依赖它们的库
  var scripts = [
    // 工具库
    'cdn/vendor/md5.js',
    // 日期库
    'cdn/vendor/dayjs@1.11.21/dayjs.min.js',
    'cdn/vendor/dayjs@1.11.21/locale/zh-cn.js',
    'cdn/vendor/dayjs@1.11.21/plugin/relativeTime.js',
    'cdn/vendor/dayjs@1.11.21/plugin/advancedFormat.js',
    'cdn/vendor/dayjs@1.11.21/plugin/utc.js',
    'cdn/vendor/dayjs@1.11.21/plugin/duration.js',
    'cdn/vendor/dayjs@1.11.21/plugin/customParseFormat.js',
    // DOM / jQuery 生态
    'cdn/vendor/jquery@3.7.1/jquery.min.js',
    // UI 框架
    'cdn/vendor/vue.global.js',
    // Markdown / 富文本
    'cdn/vendor/marked.min.js',
    'cdn/vendor/turndown.js',
    // 图表 / 可视化
    'cdn/vendor/mermaid.min.js',
    'cdn/vendor/apexcharts@3.46.0/apexcharts.min.js',
    // 工具库
    'cdn/vendor/html2canvas@1.4.1/html2canvas.min.js',
    'cdn/vendor/jspdf@2.5.2/jspdf.umd.min.js',
    'cdn/vendor/xlsx@0.20.3/xlsx.full.min.js',
    // GSAP 动画
    'cdn/vendor/gsap/TweenMax.min.js',
    // Bootstrap
    'cdn/vendor/bootstrap@5.2.3/js/bootstrap.bundle.min.js',
    // Swiper 轮播
    'cdn/vendor/swiper@7.0.3/js/swiper-bundle.min.js',
    // anime.js
    'cdn/vendor/anime@3.0.0/anime.min.js',
  ]

  // 顺序注入，每个加载完后注入下一个
  function injectAll(i) {
    i = i || 0
    if (i >= scripts.length) return
    injectScript(scripts[i]).then(function () {
      injectAll(i + 1)
    })
  }
  injectAll()
})()

// 检查PET_CONFIG是否可用
if (typeof PET_CONFIG === 'undefined') {
  // PET_CONFIG未定义
}

window.StorageHelper = {
  // 检查chrome.storage是否可用
  isChromeStorageAvailable() {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local || !chrome.runtime) return false
      try {
        return !!chrome.runtime.id
      } catch (error) {
        return false
      }
    } catch (error) {
      return false
    }
  },

  isQuotaError(error) {
    return ErrorHandler.isQuotaError(error)
  },

  isContextInvalidatedError(error) {
    return ErrorHandler.isContextInvalidated(error)
  },

  // 清理旧数据以释放空间
  async cleanupOldData() {
    try {
      // 检查chrome.storage是否可用
      if (!this.isChromeStorageAvailable()) {
        console.debug('扩展已重新加载，跳过清理')
        return
      }

      // 获取所有存储的数据
      const allData = await new Promise((resolve) => {
        try {
          chrome.storage.local.get(null, (items) => {
            if (chrome.runtime.lastError) {
              const error = chrome.runtime.lastError
              if (this.isContextInvalidatedError(error)) {
                console.debug('扩展已重新加载，跳过清理')
                resolve({})
                return
              }
            }
            resolve(items || {})
          })
        } catch (error) {
          if (this.isContextInvalidatedError(error)) {
            console.debug('扩展已重新加载，跳过清理')
            resolve({})
          } else {
            throw error
          }
        }
      })

      // 按优先级清理数据
      const cleanupKeys = [
        'petOssFiles', // OSS文件列表（可以重新加载）
      ]

      for (const key of cleanupKeys) {
        if (allData[key]) {
          // 其他数据直接清空
          if (this.isChromeStorageAvailable()) {
            await new Promise((resolve) => {
              try {
                chrome.storage.local.remove(key, () => {
                  if (chrome.runtime.lastError && this.isContextInvalidatedError(chrome.runtime.lastError)) {
                    console.debug('扩展已重新加载，跳过清理')
                  }
                  resolve()
                })
              } catch (error) {
                if (this.isContextInvalidatedError(error)) {
                  console.debug('扩展已重新加载，跳过清理')
                }
                resolve()
              }
            })
            console.log(`已清理存储键: ${key}`)
          }
        }
      }
    } catch (error) {
      console.error('清理存储数据失败:', error)
    }
  },

  // 处理存储错误的辅助函数
  _handleStorageError(key, value, error, resolve) {
    if (this.isContextInvalidatedError(error)) {
      resolve({ success: false, error: error.message || '扩展上下文失效', contextInvalidated: true })
      return true
    }

    if (this.isQuotaError(error)) {
      console.warn('存储配额超出，尝试清理旧数据...')
      this.cleanupOldData().then(() => {
        if (!this.isChromeStorageAvailable()) {
          resolve({ success: false, error: 'chrome.storage 不可用', contextInvalidated: true })
          return
        }
        // 重试保存
        chrome.storage.local.set({ [key]: value }, (_retryError) => {
          if (chrome.runtime.lastError) {
            const retryErr = chrome.runtime.lastError
            resolve({ success: false, error: retryErr.message })
          } else {
            resolve({ success: true, retried: true })
          }
        })
      })
      return true
    }

    resolve({ success: false, error: error.message || '存储失败' })
    return true
  },

  // 安全的存储设置函数
  async set(key, value, _options = {}) {
    return new Promise(async (resolve) => {
      if (!this.isChromeStorageAvailable()) {
        resolve({ success: false, error: 'chrome.storage 不可用', contextInvalidated: true })
        return
      }

      try {
        chrome.storage.local.set({ [key]: value }, async () => {
          if (chrome.runtime.lastError) {
            const error = chrome.runtime.lastError
            if (!this._handleStorageError(key, value, error, resolve)) {
              resolve({ success: true })
            }
          } else {
            resolve({ success: true })
          }
        })
      } catch (error) {
        const errorMsg = (error.message || error.toString() || '').toLowerCase()
        const isContextInvalidated =
          this.isContextInvalidatedError(error) || !this.isChromeStorageAvailable() || errorMsg.includes('invalidated')
        resolve({ success: false, error: error.message || '存储失败', contextInvalidated: !!isContextInvalidated })
      }
    })
  },

  // 安全的存储获取函数
  async get(key) {
    return new Promise((resolve) => {
      if (!this.isChromeStorageAvailable()) {
        resolve(null)
        return
      }

      try {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            resolve(null)
          } else {
            resolve(result[key] || null)
          }
        })
      } catch (error) {
        resolve(null)
      }
    })
  },
}

window.getPetDefaultPosition = function () {
  return { x: 20, y: Math.round(window.innerHeight * 0.2) }
}

window.getChatWindowDefaultPosition = function (width, _height) {
  return {
    x: Math.max(0, window.innerWidth - width),
    y: 0,
  }
}

window.getCenterPosition = function (elementSize, windowSize) {
  return Math.max(0, (windowSize - elementSize) / 2)
}
