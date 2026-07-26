/**
 * Content Script 入口
 *
 * 负责页面级别的生命周期管理：
 * - visibilitychange 事件监听（页面隐藏/显示）
 */

;(function () {
  'use strict'

  // 页面卸载时清理资源（预留）
  window.addEventListener('beforeunload', () => {
    if (window.petManager) {
      window.petManager.cleanup()
    }
  })

  // 页面隐藏/显示时的处理
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('页面隐藏，暂停某些功能')
    } else {
      console.log('页面显示，恢复功能')
    }
  })

  console.log('Content Script 完成')
})()
