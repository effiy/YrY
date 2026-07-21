/**
 * yry-bytes — shared low-level utilities used by both the page-level app
 *             and the section components.
 * ----------------------------------------------------------------------
 * Exposes `window.RuiBytes` with:
 *   - humanBytes(b)    → string (e.g. "4.3 MB")
 *   - debounce(fn, ms) → debounced wrapper
 *
 * Keep this file dependency-free — every helper here is pure, runs in
 * any browser, and is safe to load before Vue / shared components.
 */
(function () {
    'use strict';

    function humanBytes(b) {
        if (b == null || isNaN(b)) {
            return '—';
        }
        if (b < 1024) {
            return `${b.toFixed(0) } B`;
        }
        if (b < 1048576) {
            return `${(b / 1024).toFixed(1) } KB`;
        }
        if (b < 1073741824) {
            return `${(b / 1048576).toFixed(1) } MB`;
        }
        return `${(b / 1073741824).toFixed(2) } GB`;
    }

    function debounce(fn, ms) {
        let timer = null;
        return function () {
            const ctx = this, args = arguments;
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(function () {
                fn.apply(ctx, args);
            }, ms);
        };
    }

    window.RuiBytes = {
        humanBytes: humanBytes,
        debounce: debounce,
    };
})();
