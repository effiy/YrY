/**
 * rui-report-apis — Vue 3 standalone app (entry point)
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
 */
(function () {
    'use strict';

    window.__vueLoadPromise = window.__vueLoadPromise || Promise.resolve();
    window.__vueLoadPromise.then(function () {
        if (typeof Vue === 'undefined') {
            const missing = document.getElementById('app-vue-missing');
            if (missing) missing.style.display = 'block';
            return;
        }
        return window.RuiReportApp.mount();
    });
})();
