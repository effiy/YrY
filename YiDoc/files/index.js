/**
 * rui-report-files — Vue 3 standalone app (entry point)
 * ----------------------------------------------------------------------
 * Assembles the page-level Vue app from the pieces in app/ and boots
 * the deferred mount. The actual app definition is split across:
 *   - app/state.js      → data() + computed (derived state)
 *   - app/actions.js    → methods (chrome buttons)
 *   - app/lifecycle.js  → mounted/beforeUnmount (side effects)
 *   - app/mount.js      → RuiReportApp.mount() — registers components
 *                          and starts the Vue boot.
 *
 * Page-level concerns: header, TOC, active section tracking,
 * remediation toggle, keyboard shortcuts, print.
 *
 * Mount is deferred until window.__vueLoadPromise resolves, so the
 * CDN-loader in index.html can fall back to jsdelivr if unpkg is
 * blocked.
 */
(function () {
    'use strict';

    // Sanity guard: if Vue failed to load, reveal the missing-Vue
    // fallback panel in index.html. Otherwise, run the deferred mount.
    window.__vueLoadPromise = window.__vueLoadPromise || Promise.resolve();
    window.__vueLoadPromise.then(function () {
        if (typeof Vue === 'undefined') {
            const missing = document.getElementById('app-vue-missing');
            if (missing) {
                missing.style.display = 'block';
            }
            return;
        }
        return window.RuiReportApp.mount();
    });
})();
