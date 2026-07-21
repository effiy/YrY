/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — yry-loader · bootstrap framework loader (thin bridge)

   This file bridges the template contract {{CDN_ROOT}}/yry-loader/index.js
   to the actual shared loader at ../../loader.js. It ensures that
   ruiBootstrapComponent, ruiComponentHelpers, and all other loader APIs
   are available on window before any component scripts execute.

   The loader.js IIFE is idempotent — loading it a second time is a no-op
   because all APIs already exist on window. This bridge detects whether
   loader.js has already been loaded (e.g. by a direct <script> tag on
   the page) and skips the injection if so.

   Console Guard compliance:
     - No unhandled errors — all failures logged via console.warn
     - Idempotent — safe to include alongside a direct loader.js <script>
     - Synchronous injection ensures ordering (async=false)
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Idempotency guard: if loader.js already ran, nothing to do.
  if (window.ruiBootstrapComponent && window.ruiComponentHelpers) return;

  var SELF_SRC = (document.currentScript && document.currentScript.src) || '';
  // From cdn/components/yry-loader/index.js → cdn/loader.js
  var LOADER_PATH = SELF_SRC.replace(/\/components\/yry-loader\/index\.js(\?.*)?$/, '/loader.js');

  if (!LOADER_PATH || LOADER_PATH === SELF_SRC) {
    console.warn('[yry-loader] cannot resolve loader.js path from ' + SELF_SRC);
    return;
  }

  var s = document.createElement('script');
  s.src = LOADER_PATH;
  s.async = false;
  s.onerror = function () {
    console.error('[yry-loader] failed to load loader.js from ' + LOADER_PATH);
  };
  document.head.appendChild(s);
})();
