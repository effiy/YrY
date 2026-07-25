// ── Imports for window registration ──────────────────────────────────────
import * as _log         from '/cdn/utils/core/log.js';
import * as _common      from '/cdn/utils/core/common.js';
import * as _validation  from '/cdn/utils/core/validation.js';
import * as _animation   from '/cdn/utils/core/animation.js';
import * as _string      from '/cdn/utils/core/string.js';
import * as _array       from '/cdn/utils/core/array.js';
import * as _object      from '/cdn/utils/core/object.js';
import * as _http        from '/cdn/utils/core/http.js';
import * as _storage     from '/cdn/utils/core/storage.js';
import * as _eventBus    from '/cdn/utils/core/eventBus.js';
import * as _performance  from '/cdn/utils/core/performance.js';
import * as _form        from '/cdn/utils/core/form.js';
import * as _i18n        from '/cdn/utils/core/i18n.js';
import * as _api         from '/cdn/utils/core/api.js';

// ── Re-exports (keep for module consumers) ──────────────────────────────
export * from '/cdn/utils/core/log.js';
export * from '/cdn/utils/core/error.js';
export * from '/cdn/utils/core/common.js';
export * from '/cdn/utils/core/validation.js';
export * from '/cdn/utils/core/animation.js';
export * from '/cdn/utils/core/string.js';
export * from '/cdn/utils/core/array.js';
export * from '/cdn/utils/core/object.js';
export * from '/cdn/utils/core/http.js';
export * from '/cdn/utils/core/storage.js';
export * from '/cdn/utils/core/eventBus.js';
export * from '/cdn/utils/core/performance.js';
export * from '/cdn/utils/core/form.js';
export * from '/cdn/utils/core/i18n.js';
export * from '/cdn/utils/core/api.js';

// ── Window registration ─────────────────────────────────────────────────
(function _registerCoreUtilsOnWindow() {
  // Collect all named exports from core utility modules
  const allCoreExports = {
    ..._log,
    ..._common,
    ..._validation,
    ..._animation,
    ..._string,
    ..._array,
    ..._object,
    ..._http,
    ..._storage,
    ..._eventBus,
    ..._performance,
    ..._form,
    ..._i18n,
    ..._api
  };

  // error.js uses classic script pattern (window.ErrorHandler), include if present
  if (window.ErrorHandler) {
    allCoreExports.ErrorHandler = window.ErrorHandler;
  }

  // Register under window.YiPet.Core
  if (window.YiPet && typeof window.YiPet.register === 'function') {
    window.YiPet.register('Core', allCoreExports);
  } else {
    window.YiPet = window.YiPet || {};
    window.YiPet.Core = allCoreExports;
  }

  // Expose commonly-used core utilities directly on window
  // (skip keys that already exist to avoid overwriting)
  Object.keys(allCoreExports).forEach(function (key) {
    if (!(key in window)) {
      window[key] = allCoreExports[key];
    }
  });
})();
