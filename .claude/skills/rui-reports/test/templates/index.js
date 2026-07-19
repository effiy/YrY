/**
 * rui-report-test · page entry
 * ----------------------------------------------------------------------
 * Keeps a single entrypoint while the actual app logic lives in
 * app/*.js modules grouped by responsibility.
 */
(function () {
    'use strict';

    function start() {
        if (window.RuiSelfTestApp && typeof window.RuiSelfTestApp.boot === 'function') {
            window.RuiSelfTestApp.boot();
            return;
        }
        console.error('[rui-report-test] boot module is missing.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
