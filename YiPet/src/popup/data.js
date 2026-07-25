/**
 * YiPet Popup — Configuration Adapter
 *
 * Reads canonical config from PET_CONFIG (pet.config.js) and exposes it
 * as window.YIPET_POPUP in the shape the popup component expects.
 *
 * Single source of truth — no duplicated values.
 * Safe fallbacks ensure the popup still works even if PET_CONFIG is absent.
 *
 * Exports: window.YIPET_POPUP
 *
 * @see ../config/pet.config.js  — canonical config
 */
;(function (root) {
  'use strict'

  var C = (root.PET_CONFIG && root.PET_CONFIG.constants) || {}
  var P = (root.PET_CONFIG && root.PET_CONFIG.pet)       || {}
  var U = C.UI || {}

  /* ── Color labels (not in PET_CONFIG, only needed by popup UI) ──── */
  var COLOR_LABELS = [
    '量子蓝紫（主色）',
    '靛蓝紫',
    '量子海洋',
    '量子森林',
    '量子日落'
  ]

  /**
   * Build COLORS array from PET_CONFIG.pet.colors gradient strings.
   * Falls back to empty array so the popup gracefully hides the select.
   */
  function buildColors() {
    var gradients = P.colors || []
    var result = []
    for (var i = 0; i < gradients.length; i++) {
      result.push({
        value: i,
        label: COLOR_LABELS[i] || ('主题 ' + (i + 1))
      })
    }
    return result
  }

  /* ── Assemble config ──────────────────────────────────────────────── */

  /** @namespace */
  var YIPET_POPUP = {

    /* Roles (popup-only, not in PET_CONFIG) */
    ROLES: ['教师', '医生', '甜品师', '警察'],

    /* Colour themes → derived from PET_CONFIG.pet.colors */
    COLORS: buildColors(),

    /* Size constraints → PET_CONFIG.pet.sizeLimits */
    SIZE: {
      MIN:  (P.sizeLimits && P.sizeLimits.min)  || 80,
      MAX:  (P.sizeLimits && P.sizeLimits.max)  || 400,
      STEP: 10
    },

    /* Storage key → PET_CONFIG.constants.storageKeys.globalState */
    STORAGE_KEY: (C.storageKeys && C.storageKeys.globalState) || 'pet_global_state',

    /* Timing → PET_CONFIG.constants.TIMING + RETRY */
    TIMING: {
      NOTIFICATION_DURATION: C.TIMING && C.TIMING.NOTIFICATION_DURATION || 3000,
      CONNECT_RETRY_MAX:     (C.RETRY && C.RETRY.MAX_RETRIES)          || 3,
      CONNECT_RETRY_BASE_MS: (C.RETRY && C.RETRY.INITIAL_DELAY)        || 500
    },

    /* Status indicator colours → PET_CONFIG.constants.UI */
    STATUS_DOT: {
      ACTIVE:   U.STATUS_DOT_ACTIVE   || '#22c55e',
      INACTIVE: U.STATUS_DOT_INACTIVE || '#f59e0b'
    },

    /* Notification colours → PET_CONFIG.constants.UI */
    NOTIFY: {
      SUCCESS: U.NOTIFICATION_SUCCESS || '#22c55e',
      ERROR:   U.NOTIFICATION_ERROR   || '#ef4444',
      INFO:    U.NOTIFICATION_INFO    || '#3b82f6'
    },

    /* User-facing messages → PET_CONFIG.constants messages */
    MSG: {
      CONNECTING:   '连接中…',
      READY:        '准备就绪',
      READY_OFFLINE: '准备就绪（离线）',
      ACTIVE:       '已激活',
      HIDDEN:       '已隐藏',
      SHOWN:        (C.SUCCESS_MESSAGES && C.SUCCESS_MESSAGES.SHOWN)           || '已显示',
      SIZE_UPDATED: (C.SUCCESS_MESSAGES && C.SUCCESS_MESSAGES.SIZE_UPDATED)    || '大小已更新',
      ROLE_CHANGED: (C.SUCCESS_MESSAGES && C.SUCCESS_MESSAGES.ROLE_CHANGED)    || '角色已切换',
      COLOR_SET:    (C.SUCCESS_MESSAGES && C.SUCCESS_MESSAGES.COLOR_SET)       || '颜色主题已设置',
      OP_FAILED:    (C.ERROR_MESSAGES   && C.ERROR_MESSAGES.OPERATION_FAILED)  || '操作失败',
      TAB_NOT_FOUND: (C.ERROR_MESSAGES  && C.ERROR_MESSAGES.TAB_NOT_FOUND)     || '无法获取当前标签页',
      INIT_FAILED:  (C.ERROR_MESSAGES   && C.ERROR_MESSAGES.INIT_FAILED)       || '初始化失败',
      CS_NOT_READY: 'Content Script 未就绪'
    },

    /* Default state */
    DEFAULTS: {
      VISIBLE: (P.defaultVisible !== undefined) ? P.defaultVisible : false,
      SIZE:    P.defaultSize  || 260,
      ROLE:    (C.DEFAULTS && C.DEFAULTS.PET_ROLE) || '教师',
      COLOR:   (P.defaultColorIndex !== undefined) ? P.defaultColorIndex : 0,
      MODEL:   null,
      VERSION: (C.DEFAULTS && C.DEFAULTS.VERSION) || '1.1.2'
    }
  }

  root.YIPET_POPUP = YIPET_POPUP

})(typeof globalThis !== 'undefined' ? globalThis : window)
