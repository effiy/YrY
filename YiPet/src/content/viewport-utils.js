/**
 * PetManager - 视口与几何工具函数
 * 从 petManager.chat.js / petManager.chatUi.js 中提取
 */
;(function () {
  'use strict'
  if (typeof window === 'undefined') return

  var ViewportUtils = window.ViewportUtils || {}

  /** 限制数值在 [min, max] 范围内 */
  ViewportUtils.clampNumber = function (value, min, max) {
    var n = Number(value)
    if (!Number.isFinite(n)) return min
    return Math.min(Math.max(n, min), max)
  }

  /** 获取当前视口尺寸（优先 visualViewport） */
  ViewportUtils.getViewportSize = function () {
    var vv = window.visualViewport
    var width =
      (vv && Number.isFinite(vv.width) && vv.width > 0 ? vv.width : window.innerWidth) ||
      (document.documentElement && document.documentElement.clientWidth) ||
      0
    var height =
      (vv && Number.isFinite(vv.height) && vv.height > 0 ? vv.height : window.innerHeight) ||
      (document.documentElement && document.documentElement.clientHeight) ||
      0
    return { width: width, height: height }
  }

  /**
   * 计算聊天窗口尺寸（基于视口比例）
   * @param {number} widthRatio - 宽度比例 (0-1)
   */
  ViewportUtils.computeChatWindowRect = function (widthRatio, sizeLimits) {
    var ratio = Number(widthRatio)
    var viewport = ViewportUtils.getViewportSize()
    var limits = sizeLimits || {}
    var minWidth = Number.isFinite(limits.minWidth) ? limits.minWidth : 300
    var maxWidth = Number.isFinite(limits.maxWidth) ? limits.maxWidth : viewport.width
    var maxHeight = Number.isFinite(limits.maxHeight) ? limits.maxHeight : viewport.height

    var desiredWidth = Math.round(viewport.width * (Number.isFinite(ratio) ? ratio : 0.5))
    var width = Math.min(Math.max(desiredWidth, minWidth), Math.min(maxWidth, viewport.width))
    var height = Math.min(Math.min(Math.max(viewport.height, 0), maxHeight), viewport.height)

    return { width: width, height: height }
  }

  window.ViewportUtils = ViewportUtils
})()
