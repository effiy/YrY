/**
 * Content Script 入口（已拆分）
 *
 * 说明：
 * - `core/bootstrap/bootstrap.js`：日志开关、PET_CONFIG 兜底、StorageHelper、默认位置工具函数
 * - `modules/pet/content/core/petManager.core.js`：PetManager 类定义（IIFE，挂到 window.PetManager）
 * - `modules/pet/content/petManager.js`：PetManager 轻量入口/装配文件（校验加载顺序、后续拆分模块的聚合点）
 * - `core/bootstrap/index.js`（本文件）：只负责实例化与生命周期清理
 */

;(function () {
  'use strict'

  try {
    // Deferred instantiation with retry to avoid race condition
    // with prototype augmentation files (28 files attach methods to
    // PetManager.prototype; the constructor's init() depends on them).
    function tryInstantiate(retries) {
      var remaining = typeof retries === 'number' ? retries : 10
      var Klass = window.PetManager
      if (!Klass) {
        console.warn('[bootstrap] PetManager class not yet defined, retrying...')
        if (remaining > 0) {
          setTimeout(function () { tryInstantiate(remaining - 1) }, 100)
        } else {
          console.error('[bootstrap] PetManager class never defined after max retries')
        }
        return
      }
      if (typeof window.petManager === 'undefined') {
        // Safety: verify at least one prototype method exists before instantiation
        var proto = Klass.prototype
        var hasCore = typeof proto.createPet === 'function' || typeof proto.init === 'function'
        if (!hasCore && remaining > 0) {
          setTimeout(function () { tryInstantiate(remaining - 1) }, 80)
          return
        }
        window.petManager = new Klass()
      }
    }

    tryInstantiate()
  } catch (e) {
    console.error('init petManager error:', e)
  }

  // 页面卸载时清理资源
  window.addEventListener('beforeunload', () => {
    if (window.petManager) {
      window.petManager.cleanup()
    }
  })

  // 页面隐藏时暂停某些功能（预留）
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('页面隐藏，暂停某些功能')
      // 可以在这里添加暂停逻辑
    } else {
      console.log('页面显示，恢复功能')
      // 可以在这里添加恢复逻辑
    }
  })

  console.log('Content Script 完成')
})()
