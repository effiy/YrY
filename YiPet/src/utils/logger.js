/**
 * PetManager - Shared Logger (extracted from repeated patterns)
 */
;(function () {
  'use strict'
  if (typeof window === 'undefined') return
  
  window.PetLogger = {
    get: function (name) {
      if (window.LoggerUtils && typeof window.LoggerUtils.getLogger === 'function') {
        return window.LoggerUtils.getLogger(name || 'YiPet')
      }
      return console
    }
  }
})()
