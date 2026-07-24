/**
 * app/mount.js — Vue boot, data validation, and component registration.
 */
(function () {
    'use strict';

    var RuiSelfTestApp = window.RuiSelfTestApp = window.RuiSelfTestApp || {};
    var initialMarkup = null;

    var LOADER_PATH_HINT = (function () {
        try {
            var scripts = document.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                var src = scripts[i].src || '';
                if (src.indexOf('loader.js') !== -1) return src;
            }
        } catch (e) {}
        return 'loader.js';
    })();

    function hideVueMissing() {
        var element = document.getElementById('vue-missing');
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    function showVueMissing(err) {
        var app = document.getElementById('page-app');
        if (!app) return;

        hideVueMissing();
        var banner = document.createElement('div');
        banner.id = 'vue-missing';
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:16px;background:#ef4444;color:white;font-family:monospace;z-index:9999;white-space:pre-wrap;line-height:1.5;';
        var message = (err && err.message) || String(err);
        banner.textContent = '[yry-report-test] Vue failed to load: ' + message +
            '\nExpected loader at: ' + LOADER_PATH_HINT +
            '\nHint: open DevTools → Network and check the loader.js + Vue CDN requests.';
        document.body.appendChild(banner);
    }

    function ensureData() {
        if (typeof window.REPORT_DATA !== 'object' || window.REPORT_DATA === null) {
            throw new Error('window.REPORT_DATA is missing — data.js did not load.');
        }
        if (typeof window.REPORT_CONFIG !== 'object' || window.REPORT_CONFIG === null) {
            throw new Error('window.REPORT_CONFIG is missing — data.js did not load.');
        }
        if (!Array.isArray(window.REPORT_DATA.scenes) || window.REPORT_DATA.scenes.length !== 6) {
            throw new Error('window.REPORT_DATA.scenes must be an array of 6 scenes.');
        }
    }

    function createRootOptions() {
        return {
            data: RuiSelfTestApp.data,
            computed: RuiSelfTestApp.computed,
            methods: RuiSelfTestApp.methods,
            mounted: RuiSelfTestApp.mounted,
            beforeUnmount: RuiSelfTestApp.beforeUnmount,
        };
    }

    function registerSharedComponents(app) {
        if (window.ruiBreadcrumb) app.component('yry-breadcrumb', window.ruiBreadcrumb);
        if (window.ruiBadge) app.component('yry-badge', window.ruiBadge);
        if (window.ruiBackTop) app.component('yry-back-top', window.ruiBackTop);
        if (window.ruiTagChip) app.component('yry-tag-chip', window.ruiTagChip);
    }

    function resetMountTarget() {
        var mountEl = document.getElementById('page-app');
        if (!mountEl || !initialMarkup || !mountEl.parentNode) {
            return mountEl;
        }
        var wrapper = document.createElement('div');
        wrapper.innerHTML = initialMarkup;
        var freshEl = wrapper.firstElementChild;
        if (!freshEl) {
            return mountEl;
        }
        mountEl.parentNode.replaceChild(freshEl, mountEl);
        return freshEl;
    }

    function mountOnce(attempt) {
        var mountEl = document.getElementById('page-app');
        if (!mountEl) {
            throw new Error('#page-app not found in DOM.');
        }

        if (!initialMarkup) {
            initialMarkup = mountEl.outerHTML;
        }
        if (attempt > 0) {
            mountEl = resetMountTarget() || mountEl;
        }

        var app = window.Vue.createApp(createRootOptions());
        registerSharedComponents(app);

        try {
            app.mount(mountEl);
        } catch (err) {
            if (attempt >= 1) {
                throw err;
            }
            console.warn('[yry-report-test] first mount failed, retrying:', err);
            return mountOnce(attempt + 1);
        }

        if (typeof RuiSelfTestApp.renderMermaidDiagrams === 'function') {
            RuiSelfTestApp.renderMermaidDiagrams();
        }
    }

    function mountReport() {
        return Promise.all([
            RuiSelfTestApp.whenGlobal('ruiBreadcrumb'),
            RuiSelfTestApp.whenGlobal('ruiBadge'),
            RuiSelfTestApp.whenGlobal('ruiBackTop'),
        ]).catch(function () {
            return null;
        }).then(function () {
            mountOnce(0);
        });
    }

    function runBoot() {
        window.__vueLoadPromise
            .then(function () {
                if (typeof window.Vue === 'undefined' || typeof window.Vue.createApp !== 'function') {
                    throw new Error('window.Vue is unavailable after the loader resolved.');
                }
                hideVueMissing();
                ensureData();
                return mountReport();
            })
            .catch(function (err) {
                console.error('[yry-report-test] boot failed:', err);
                showVueMissing(err);
            });
    }

    RuiSelfTestApp.boot = function boot() {
        if (typeof window.__vueLoadPromise === 'object' && typeof window.__vueLoadPromise.then === 'function') {
            runBoot();
            return;
        }

        var waited = 0;
        var maxWait = 1500;
        var step = 50;
        var timer = setInterval(function () {
            waited += step;
            if (typeof window.__vueLoadPromise === 'object' && typeof window.__vueLoadPromise.then === 'function') {
                clearInterval(timer);
                runBoot();
                return;
            }
            if (waited >= maxWait) {
                clearInterval(timer);
                showVueMissing(new Error(
                    'window.__vueLoadPromise is not a Promise — loader.js did not run within ' + maxWait + 'ms. ' +
                    'Expected <script src="' + LOADER_PATH_HINT + '"> in index.html.'
                ));
            }
        }, step);
    };
})();
