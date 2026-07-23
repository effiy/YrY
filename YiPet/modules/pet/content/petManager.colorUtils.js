/**
 * PetManager - 颜色工具函数
 * 从 petManager.chat.js 中提取，供多处复用
 */
;(function () {
  'use strict'
  if (typeof window === 'undefined') return

  var ColorUtils = window.ColorUtils || {}

  /** HEX 颜色字符串 -> { r, g, b } 对象 */
  ColorUtils.hexToRgb = function (hex) {
    var normalized = String(hex || '').trim()
    var match = normalized.match(/^#([0-9a-fA-F]{6})$/)
    if (!match) return null
    var value = match[1]
    var r = parseInt(value.slice(0, 2), 16)
    var g = parseInt(value.slice(2, 4), 16)
    var b = parseInt(value.slice(4, 6), 16)
    if (![r, g, b].every(function (n) { return Number.isFinite(n) })) return null
    return { r: r, g: g, b: b }
  }

  /** 限制整数在 [min, max] 范围内 */
  ColorUtils.clampInt = function (n, min, max) {
    var x = Math.round(Number(n))
    if (!Number.isFinite(x)) return min
    return Math.min(Math.max(x, min), max)
  }

  /**
   * 对 HEX 颜色进行加深/减淡
   * @param {string} hex - 6 位 HEX 颜色
   * @param {number} ratio - 正值趋近白色，负值趋近黑色
   */
  ColorUtils.shadeHexColor = function (hex, ratio) {
    var rgb = ColorUtils.hexToRgb(hex)
    if (!rgb) return null
    var t = ratio < 0 ? 0 : 255
    var p = Math.abs(Number(ratio))
    if (!Number.isFinite(p)) return null
    var r = ColorUtils.clampInt((t - rgb.r) * p + rgb.r, 0, 255)
    var g = ColorUtils.clampInt((t - rgb.g) * p + rgb.g, 0, 255)
    var b = ColorUtils.clampInt((t - rgb.b) * p + rgb.b, 0, 255)
    return '#' + [r, g, b].map(function (c) { return c.toString(16).padStart(2, '0') }).join('')
  }

  window.ColorUtils = ColorUtils
})()
