/**
 * yry-vue-loader.js — Standardized Vue 3 CDN loader for YiDoc templates.
 *
 * Replaces 5 different Vue-loading strategies that were duplicated across
 * the codebase with a single, robust loader.
 *
 * Strategy (tried in order):
 *   1. If window.Vue is already defined → resolve immediately (no-op).
 *   2. If window.__vueLoadPromise already exists → return (already loading).
 *   3. Try the PRIMARY path (set by each template via a script data attribute
 *      or window.__YRY_VUE_PRIMARY). This is the exact relative path the
 *      template would have used before the refactoring — zero performance
 *      regression for the happy path.
 *   4. Walk UP the directory tree (depths 0-12) probing for
 *      YiPet/cdn/vendor/vue.global.prod.js. This handles deployments at any
 *      nesting depth — relocate a template without editing its HTML.
 *   5. Fall back to unpkg CDN.
 *   6. Fall back to jsDelivr CDN (last resort).
 *
 * Contract:
 *   After this script runs, window.__vueLoadPromise is a Promise that:
 *     - resolves when Vue is ready (window.Vue is defined)
 *     - rejects if all candidates fail
 *
 * Usage in index.html:
 *   <script src="../../shared/js/yry-vue-loader.js"
 *           data-vue-primary="../../../YiPet/cdn/vendor/vue.global.prod.js">
 *   </script>
 *
 * @module yry-vue-loader
 * @since Phase 2 refactoring
 */
;(function () {
    'use strict';

    // Already loaded — nothing to do
    if (typeof Vue !== 'undefined') {
        window.__vueLoadPromise = window.__vueLoadPromise || Promise.resolve();
        return;
    }

    // Already loading from another template on the same page
    if (window.__vueLoadPromise && typeof window.__vueLoadPromise.then === 'function') {
        return;
    }

    // ── Gather the primary path hint ──────────────────────────────────
    // Templates set this via a data-vue-primary attribute on the <script>
    // tag that loads this file, or via window.__YRY_VUE_PRIMARY before
    // this script runs.
    var primary = window.__YRY_VUE_PRIMARY || null;
    if (!primary) {
        try {
            var scripts = document.querySelectorAll('script[data-vue-primary]');
            if (scripts.length) {
                primary = scripts[scripts.length - 1].getAttribute('data-vue-primary');
            }
        } catch (_) { /* DOM not ready — primary will be null, walk will handle it */ }
    }

    // ── Build candidate list ──────────────────────────────────────────
    var CANDIDATES = [];

    // Tier 1: Primary path (fast path — zero regression)
    if (primary) {
        CANDIDATES.push(primary);
    }

    // Tier 2: Directory walk for YiPet/cdn/vendor/vue.global.prod.js
    var VUE_REL = 'YiPet/cdn/vendor/vue.global.prod.js';
    for (var depth = 0; depth <= 12; depth++) {
        var prefix = depth === 0 ? './' : new Array(depth + 1).join('../');
        var candidate = prefix + VUE_REL;
        if (candidate !== primary) {
            CANDIDATES.push(candidate);
        }
    }
    CANDIDATES.push('/' + VUE_REL);

    // Tier 3: CDN fallbacks
    CANDIDATES.push('https://unpkg.com/vue@3.4.27/dist/vue.global.prod.js');
    CANDIDATES.push('https://cdn.jsdelivr.net/npm/vue@3.4.27/dist/vue.global.prod.js');

    // ── Create the promise ────────────────────────────────────────────
    var _resolve, _reject;
    window.__vueLoadPromise = new Promise(function (resolve, reject) {
        _resolve = resolve;
        _reject = reject;
    });

    // ── Try candidates in order ───────────────────────────────────────
    var _tried = 0;
    var _activeScript = null;

    function tryNext() {
        // Check if Vue appeared (could have been loaded by another script)
        if (typeof Vue !== 'undefined') {
            _resolve();
            return;
        }

        if (_tried >= CANDIDATES.length) {
            _reject(new Error(
                '[yry-vue-loader] All ' + CANDIDATES.length +
                ' candidates failed. Last tried: ' + (CANDIDATES[_tried - 1] || 'none')
            ));
            return;
        }

        var url = CANDIDATES[_tried++];
        var s = document.createElement('script');
        s.src = url;
        s.async = false;

        s.onload = function () {
            _activeScript = null;
            if (typeof Vue !== 'undefined') {
                _resolve();
            } else {
                // Script loaded but Vue global not set — keep trying
                tryNext();
            }
        };

        s.onerror = function () {
            _activeScript = null;
            tryNext();
        };

        _activeScript = s;
        document.head.appendChild(s);
    }

    tryNext();
})();
