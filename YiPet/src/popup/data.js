/**
 * YiPet Popup — Configuration Adapter
 *
 * Projects PET_CONFIG into the shape the popup expects (window.YIPET_POPUP).
 * Single source of truth for popup configuration — no duplicated values.
 * All defaults are defined here; PET_CONFIG can override any field.
 *
 * @see ../config/pet.config.js — canonical config
 */
;(function (root) {
  'use strict'

  var C = (root.PET_CONFIG && root.PET_CONFIG.constants) || {}
  var P = (root.PET_CONFIG && root.PET_CONFIG.pet)       || {}
  var U = C.UI || {}

  /* ── Helpers ────────────────────────────────────────────────────────── */

  /** Safe nested property access with default fallback. */
  function pick(obj, path, fallback) {
    var parts = path.split('.')
    var cur = obj
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return fallback
      cur = cur[parts[i]]
    }
    return cur !== undefined && cur !== null ? cur : fallback
  }

  /** Build a messages table from keys → PET_CONFIG path → default. */
  function buildMessages(table) {
    var out = {}
    Object.keys(table).forEach(function (key) {
      var entry = table[key]
      out[key] = pick(C, entry.path, entry.def)
    })
    return out
  }

  /* ── Colour labels (UI-only, not in PET_CONFIG) ─────────────────────── */

  var COLOR_LABELS = ['Quantum Violet (Default)', 'Indigo Violet', 'Quantum Ocean', 'Quantum Forest', 'Quantum Sunset']

  function buildColors() {
    var gradients = P.colors || []
    var result = []
    for (var i = 0; i < gradients.length; i++) {
      result.push({ value: i, label: COLOR_LABELS[i] || ('Theme ' + (i + 1)) })
    }
    return result
  }

  /* ── Assemble ───────────────────────────────────────────────────────── */

  var YIPET_POPUP = {

    ROLES: ['Teacher', 'Doctor', 'Pastry Chef', 'Police Officer'],

    COLORS: buildColors(),

    SIZE: {
      MIN:  pick(P, 'sizeLimits.min', 80),
      MAX:  pick(P, 'sizeLimits.max', 400),
      STEP: 10
    },

    STORAGE_KEY: pick(C, 'storageKeys.globalState', 'pet_global_state'),

    TIMING: {
      NOTIFICATION_DURATION: pick(C, 'TIMING.NOTIFICATION_DURATION', 3000),
      CONNECT_RETRY_MAX:     pick(C, 'RETRY.MAX_RETRIES', 3),
      CONNECT_RETRY_BASE_MS: pick(C, 'RETRY.INITIAL_DELAY', 500)
    },

    STATUS_DOT: {
      ACTIVE:   pick(U, 'STATUS_DOT_ACTIVE', '#22c55e'),
      INACTIVE: pick(U, 'STATUS_DOT_INACTIVE', '#f59e0b')
    },

    MSG: buildMessages({
      CONNECTING:     { path: 'none',                         def: 'Connecting…' },
      READY:          { path: 'none',                         def: 'Ready' },
      READY_OFFLINE:  { path: 'none',                         def: 'Ready (Offline)' },
      ACTIVE:         { path: 'none',                         def: 'Active' },
      HIDDEN:         { path: 'none',                         def: 'Hidden' },
      SHOWN:          { path: 'SUCCESS_MESSAGES.SHOWN',       def: 'Shown' },
      SIZE_UPDATED:   { path: 'SUCCESS_MESSAGES.SIZE_UPDATED',def: 'Size Updated' },
      ROLE_CHANGED:   { path: 'SUCCESS_MESSAGES.ROLE_CHANGED',def: 'Role Changed' },
      COLOR_SET:      { path: 'SUCCESS_MESSAGES.COLOR_SET',   def: 'Color Theme Set' },
      OP_FAILED:      { path: 'ERROR_MESSAGES.OPERATION_FAILED', def: 'Operation Failed' },
      TAB_NOT_FOUND:  { path: 'ERROR_MESSAGES.TAB_NOT_FOUND', def: 'Cannot Get Current Tab' },
      INIT_FAILED:    { path: 'ERROR_MESSAGES.INIT_FAILED',   def: 'Initialization Failed' },
      CS_NOT_READY:   { path: 'none',                         def: 'Content Script Not Ready' }
    }),

    DEFAULTS: {
      VISIBLE: pick(P, 'defaultVisible', false),
      SIZE:    pick(P, 'defaultSize', 260),
      ROLE:    pick(C, 'DEFAULTS.PET_ROLE', 'Teacher'),
      COLOR:   pick(P, 'defaultColorIndex', 0),
      MODEL:   null,
      VERSION: pick(C, 'DEFAULTS.VERSION', '1.1.2')
    }
  }

  root.YIPET_POPUP = YIPET_POPUP

})(typeof globalThis !== 'undefined' ? globalThis : window)
