/**
 * app/mount.js — Vue app boot + component registration + deferred mount.
 * ----------------------------------------------------------------------
 * Waits for window.__vueLoadPromise (CDN-loader promise), then registers
 * the report section components, and finally mounts the app onto #page-app.
 */
(function () {
    'use strict';

    const RuiReportApp = window.RuiReportApp = window.RuiReportApp || {};

    function whenReportComponentReady(globalName, templateId) {
        return new Promise(function (resolve) {
            function isReady() {
                return Boolean(window[globalName] &&
                    window[globalName].name === globalName &&
                    document.getElementById(templateId));
            }
            if (isReady()) { resolve(); return; }
            const startedAt = Date.now();
            (function poll() {
                if (isReady() || Date.now() - startedAt >= ((window.REPORT_CONFIG && window.REPORT_CONFIG.constants && window.REPORT_CONFIG.constants.componentReadyTimeoutMs) || 5000)) {
                    resolve(); return;
                }
                setTimeout(poll, 50);
            })();
        });
    }

    function scheduleMount(fn) {
        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(fn, { timeout: 200 });
            return;
        }
        requestAnimationFrame(function () { fn(); });
    }

    function registerComponents(app) {
        if (window.ruiReportApiSummary && window.ruiReportApiSummary.name === 'ruiReportApiSummary') {
            app.component('rui-report-api-summary', window.ruiReportApiSummary);
        }
        if (window.ruiReportApiEndpoints && window.ruiReportApiEndpoints.name === 'ruiReportApiEndpoints') {
            app.component('rui-report-api-endpoints', window.ruiReportApiEndpoints);
        }
        if (window.ruiReportApiSemantics && window.ruiReportApiSemantics.name === 'ruiReportApiSemantics') {
            app.component('rui-report-api-semantics', window.ruiReportApiSemantics);
        }
        if (window.ruiReportApiPatterns && window.ruiReportApiPatterns.name === 'ruiReportApiPatterns') {
            app.component('rui-report-api-patterns', window.ruiReportApiPatterns);
        }
        if (window.ruiReportApiSecurity && window.ruiReportApiSecurity.name === 'ruiReportApiSecurity') {
            app.component('rui-report-api-security', window.ruiReportApiSecurity);
        }
        if (window.ruiReportApiHealth && window.ruiReportApiHealth.name === 'ruiReportApiHealth') {
            app.component('rui-report-api-health', window.ruiReportApiHealth);
        }
    }

    RuiReportApp.mount = function mountReportApp() {
        return Promise.resolve(window.__reportTemplatesReady)
            .then(function () {
                return Promise.all([
                    whenReportComponentReady('ruiReportApiSummary', 'rui-report-api-summary-tpl'),
                    whenReportComponentReady('ruiReportApiEndpoints', 'rui-report-api-endpoints-tpl'),
                    whenReportComponentReady('ruiReportApiSemantics', 'rui-report-api-semantics-tpl'),
                    whenReportComponentReady('ruiReportApiPatterns', 'rui-report-api-patterns-tpl'),
                    whenReportComponentReady('ruiReportApiSecurity', 'rui-report-api-security-tpl'),
                    whenReportComponentReady('ruiReportApiHealth', 'rui-report-api-health-tpl'),
                ]);
            })
            .then(function () {
                scheduleMount(function () { mountOnce(0); });
            });
    };

    let initialMarkup = null;

    function resetMountTarget() {
        const mountEl = document.getElementById('page-app');
        if (!mountEl || !initialMarkup) return mountEl;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = initialMarkup;
        const freshEl = wrapper.firstElementChild;
        if (!freshEl) return mountEl;
        mountEl.replaceWith(freshEl);
        return freshEl;
    }

    function mountOnce(attempt) {
        let mountEl = document.getElementById('page-app');
        if (!mountEl) return;
        if (!initialMarkup) initialMarkup = mountEl.outerHTML;
        if (attempt > 0) mountEl = resetMountTarget();
        const app = Vue.createApp(RuiReportApp);
        registerComponents(app);
        try {
            app.mount(mountEl);
        } catch (err) {
            if (attempt >= 1) {
                console.error('[rui-report-apis] mount failed after retry:', err);
                return;
            }
            setTimeout(function () {
                scheduleMount(function () { mountOnce(attempt + 1); });
            }, 50);
        }
    }
})();
