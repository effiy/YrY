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
        if (window.yryReportApiSummary && window.yryReportApiSummary.name === 'yryReportApiSummary') {
            app.component('yry-report-api-summary', window.yryReportApiSummary);
        }
        if (window.yryReportApiEndpoints && window.yryReportApiEndpoints.name === 'yryReportApiEndpoints') {
            app.component('yry-report-api-endpoints', window.yryReportApiEndpoints);
        }
        if (window.yryReportApiSemantics && window.yryReportApiSemantics.name === 'yryReportApiSemantics') {
            app.component('yry-report-api-semantics', window.yryReportApiSemantics);
        }
        if (window.yryReportApiPatterns && window.yryReportApiPatterns.name === 'yryReportApiPatterns') {
            app.component('yry-report-api-patterns', window.yryReportApiPatterns);
        }
        if (window.yryReportApiSecurity && window.yryReportApiSecurity.name === 'yryReportApiSecurity') {
            app.component('yry-report-api-security', window.yryReportApiSecurity);
        }
        if (window.yryReportApiHealth && window.yryReportApiHealth.name === 'yryReportApiHealth') {
            app.component('yry-report-api-health', window.yryReportApiHealth);
        }
    }

    RuiReportApp.mount = function mountReportApp() {
        return Promise.resolve(window.__reportTemplatesReady)
            .then(function () {
                return Promise.all([
                    whenReportComponentReady('yryReportApiSummary', 'yry-report-api-summary-tpl'),
                    whenReportComponentReady('yryReportApiEndpoints', 'yry-report-api-endpoints-tpl'),
                    whenReportComponentReady('yryReportApiSemantics', 'yry-report-api-semantics-tpl'),
                    whenReportComponentReady('yryReportApiPatterns', 'yry-report-api-patterns-tpl'),
                    whenReportComponentReady('yryReportApiSecurity', 'yry-report-api-security-tpl'),
                    whenReportComponentReady('yryReportApiHealth', 'yry-report-api-health-tpl'),
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
                console.error('[yry-report-apis] mount failed after retry:', err);
                return;
            }
            setTimeout(function () {
                scheduleMount(function () { mountOnce(attempt + 1); });
            }, 50);
        }
    }
})();
