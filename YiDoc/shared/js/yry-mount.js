/**
 * yry-mount.js — Shared Vue 3 mount helper for YiDoc templates.
 *
 * Provides standardised mount infrastructure that was previously duplicated
 * across templates/apis/app/mount.js and templates/files/app/mount.js.
 *
 * API:
 *   window.yryMount.showVueMissing(err, namespace)  — show an error banner
 *   window.yryMount.scheduleMount(fn)                — rIC/rAF scheduling
 *   window.yryMount.whenComponentsReady(names)        — Promise-based waiter
 *
 * @module yry-mount
 * @since Phase 6 refactoring
 */
;(function () {
    'use strict';

    /**
     * Display a visible error banner when Vue fails to load or mount.
     * @param {Error|string} err
     * @param {string} [namespace='YiDoc'] — shown in the banner title
     */
    function showVueMissing(err, namespace) {
        namespace = namespace || 'YiDoc';
        var banner = document.createElement('div');
        banner.id = 'yry-vue-missing';
        banner.style.cssText =
            'position:fixed;top:0;left:0;right:0;padding:16px 20px;background:#ef4444;color:#fff;' +
            'font-family:monospace;z-index:9999;white-space:pre-wrap;line-height:1.5;font-size:13px;';
        banner.textContent =
            '[' + namespace + '] Vue 3 failed to load: ' +
            (err && err.message || String(err)) +
            '\nCheck your network and CDN connectivity.';
        document.body.appendChild(banner);
    }

    /**
     * Schedule a function using requestIdleCallback (preferred) or
     * requestAnimationFrame as fallback, with a maximum delay.
     * @param {function} fn
     * @param {number} [maxDelay=200] — max delay in ms before forcing execution
     */
    function scheduleMount(fn, maxDelay) {
        maxDelay = maxDelay || 200;
        var called = false;
        var fallbackTimer = null;

        function run() {
            if (called) return;
            called = true;
            if (fallbackTimer) clearTimeout(fallbackTimer);
            fn();
        }

        fallbackTimer = setTimeout(run, maxDelay);

        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(run, { timeout: maxDelay });
        } else {
            requestAnimationFrame(run);
        }
    }

    /**
     * Wait for named global components to become available on window.
     * Each name should be the global variable name (e.g. 'ruiBackTop').
     * Returns a Promise that resolves when all components are found.
     * @param {string[]} names — global variable names to wait for
     * @param {number} [timeout=3000] — max wait time in ms
     * @returns {Promise<void>}
     */
    function whenComponentsReady(names, timeout) {
        timeout = timeout || 3000;
        var start = Date.now();
        var step = 50;

        return new Promise(function (resolve) {
            function check() {
                var allReady = true;
                for (var i = 0; i < names.length; i++) {
                    if (!window[names[i]]) {
                        allReady = false;
                        break;
                    }
                }
                if (allReady || Date.now() - start > timeout) {
                    resolve();
                    return;
                }
                setTimeout(check, step);
            }
            check();
        });
    }

    window.yryMount = {
        showVueMissing: showVueMissing,
        scheduleMount: scheduleMount,
        whenComponentsReady: whenComponentsReady
    };
})();
