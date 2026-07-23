/**
 * ChatWindow Shared Utilities
 * Common helper functions used across chat components.
 */
(function () {
  'use strict'

  if (!window.PetManager) window.PetManager = {}
  if (!window.PetManager.Components) window.PetManager.Components = {}
  const utils = {}

  utils.safeCall = function (fn, fallbackValue) {
    try {
      return fn()
    } catch (_) {
      return arguments.length > 1 ? fallbackValue : null
    }
  }

  utils.safeCallAsync = async function (fn, fallbackValue) {
    try {
      return await fn()
    } catch (_) {
      return arguments.length > 1 ? fallbackValue : null
    }
  }

  utils.getVueApi = function (Vue) {
    if (
      !Vue ||
      typeof Vue.createApp !== 'function' ||
      typeof Vue.defineComponent !== 'function' ||
      typeof Vue.ref !== 'function' ||
      typeof Vue.onMounted !== 'function'
    ) {
      return null
    }
    return {
      createApp: Vue.createApp,
      defineComponent: Vue.defineComponent,
      ref: Vue.ref,
      onMounted: Vue.onMounted
    }
  }

  utils.canUseVueTemplate = function (Vue) {
    if (typeof Vue?.compile !== 'function') return false
    return utils.safeCall(function () {
      Function('return 1')()
      return true
    }, false)
  }

  utils.getComponentModule = function (name) {
    return window.PetManager?.Components?.[name] || null
  }

  utils.loadTemplateIfAvailable = async function (mod) {
    if (!mod || typeof mod.loadTemplate !== 'function') return ''
    return String((await utils.safeCallAsync(function () { return mod.loadTemplate() }, '')) || '')
  }

  utils.toRgbFromHex = function (hex) {
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

  utils.clampInt = function (n, min, max) {
    var x = Math.round(Number(n))
    if (!Number.isFinite(x)) return min
    return Math.min(Math.max(x, min), max)
  }

  utils.shadeHexColor = function (hex, ratio) {
    var rgb = utils.toRgbFromHex(hex)
    if (!rgb) return null
    var t = ratio < 0 ? 0 : 255
    var p = Math.abs(Number(ratio))
    if (!Number.isFinite(p)) return null
    var r = utils.clampInt((t - rgb.r) * p + rgb.r, 0, 255)
    var g = utils.clampInt((t - rgb.g) * p + rgb.g, 0, 255)
    var b = utils.clampInt((t - rgb.b) * p + rgb.b, 0, 255)
    return '#' + [r, g, b].map(function (c) { return c.toString(16).padStart(2, '0') }).join('')
  }

  // ── Shared Template Loader ──
  // Factory for the loadTemplate pattern duplicated across components.
  // Returns an async loadTemplate() function with built-in caching.
  utils.createTemplateLoader = function (resourcePath, templateSelector, errorMsg) {
    if (!resourcePath || !templateSelector) return function () { return '' }
    var cache = ''
    return async function () {
      if (cache) return cache
      var DomHelper = window.DomHelper
      if (!DomHelper || typeof DomHelper.loadHtmlTemplate !== 'function') return ''
      cache = await DomHelper.loadHtmlTemplate(resourcePath, templateSelector, errorMsg || 'Failed to load template')
      return cache
    }
  }

  // ── Shared IME Composition Helper ──
  // Creates a composition-state tracker for textarea elements.
  // Eliminates the ~40-line duplication between Vue setup() and DOM fallback paths.
  utils.createCompositionHandler = function () {
    var state = {
      isComposing: false,
      compositionEndTime: 0,
      COMPOSITION_END_DELAY: 100
    }

    return {
      getState: function () { return state },

      onCompositionStart: function () {
        state.isComposing = true
        state.compositionEndTime = 0
      },

      onCompositionUpdate: function () {
        state.isComposing = true
        state.compositionEndTime = 0
      },

      onCompositionEnd: function () {
        state.isComposing = false
        state.compositionEndTime = Date.now()
      },

      // Returns true if the Enter key should be suppressed due to ongoing composition.
      shouldSuppressEnter: function (event) {
        if (event.isComposing || event.keyCode === 229 || state.isComposing) return true
        if (state.compositionEndTime > 0 && Date.now() - state.compositionEndTime < state.COMPOSITION_END_DELAY) return true
        return false
      },

      // Attaches composition event listeners to a textarea element
      bindTo: function (textarea) {
        if (!textarea) return
        var self = this
        textarea.addEventListener('compositionstart', self.onCompositionStart)
        textarea.addEventListener('compositionupdate', self.onCompositionUpdate)
        textarea.addEventListener('compositionend', self.onCompositionEnd)
      },

      // Removes composition event listeners from a textarea element
      unbindFrom: function (textarea) {
        if (!textarea) return
        var self = this
        textarea.removeEventListener('compositionstart', self.onCompositionStart)
        textarea.removeEventListener('compositionupdate', self.onCompositionUpdate)
        textarea.removeEventListener('compositionend', self.onCompositionEnd)
      }
    }
  }

  window.PetManager.Components.ChatWindowUtils = utils
})()
