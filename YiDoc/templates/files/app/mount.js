/**
 * app/mount.js — Vue app boot + component registration + deferred mount.
 * ----------------------------------------------------------------------
 * Waits for window.__vueLoadPromise (CDN-loader promise) and
 * window.__reportTemplatesReady (template fetch promise), then registers
 * the shared yry-* components and the report section components, and
 * finally mounts the PAGE_REPORT_FILES_APP onto #page-app.
 *
 * If any component is missing (e.g. CDN blocked), the page still mounts
 * with degraded UI — empty custom elements and console warnings only.
 */
(function () {
    'use strict';

    const RuiReportApp = window.RuiReportApp = window.RuiReportApp || {};

    /**
     * Wait for a shared yry-* component to be ready. The component sets
     * `window[globalName].name === globalName` once its template + options
     * are wired. Resolves either on the ready event, the error event, or
     * a 5 s safety timeout.
     */
    function whenReady(globalName, readyEvent, errorEvent) {
        return new Promise(function (resolve) {
            if (window[globalName] && window[globalName].name === globalName) {
                resolve();
                return;
            }
            let settled = false;
            function done() {
                if (settled) {
                    return;
                }
                settled = true;
                resolve();
            }
            document.addEventListener(readyEvent, done, {once: true});
            document.addEventListener(errorEvent, done, {once: true});
            setTimeout(done, (window.REPORT_CONFIG && window.REPORT_CONFIG.constants && window.REPORT_CONFIG.constants.componentReadyTimeoutMs) || 5000);
        });
    }

    /**
     * Wait for a report section component (ruiReportXxx) to have both
     * its Vue options and its <script type="text/x-template"> block
     * present in the document. Polls because these components do not
     * fire a global ready event of their own.
     */
    function whenReportComponentReady(globalName, templateId) {
        return new Promise(function (resolve) {
            function isReady() {
                return Boolean(window[globalName] &&
                    window[globalName].name === globalName &&
                    document.getElementById(templateId));
            }
            if (isReady()) {
                resolve(); return;
            }
            const startedAt = Date.now();
            (function poll() {
                if (isReady() || Date.now() - startedAt >= ((window.REPORT_CONFIG && window.REPORT_CONFIG.constants && window.REPORT_CONFIG.constants.componentReadyTimeoutMs) || 5000)) {
                    resolve(); return;
                }
                setTimeout(poll, 50);
            })();
        });
    }

    /**
     * Schedule the mount outside of a requestAnimationFrame callback so the
     * ~60ms synchronous Vue mount does not register as a long rAF handler
     * (Chrome [Violation] 'requestAnimationFrame' handler took Nms).
     * Falls back to rAF on browsers without requestIdleCallback.
     */
    function scheduleMount(fn) {
        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(fn, {timeout: 200});
            return;
        }
        requestAnimationFrame(function () {
            fn();
        });
    }

    function registerComponents(app) {
        // Shared components (loaded from YiPet/cdn/utils/yidoc/*).
        if (window.ruiBreadcrumb && window.ruiBreadcrumb.name === 'ruiBreadcrumb') {
            app.component('yry-breadcrumb', window.ruiBreadcrumb);
        }
        if (window.ruiScoreBar && window.ruiScoreBar.name === 'ruiScoreBar') {
            app.component('yry-score-bar', window.ruiScoreBar);
        }
        if (window.ruiBadge && window.ruiBadge.name === 'ruiBadge') {
            app.component('yry-badge', window.ruiBadge);
        }
        if (window.ruiTagChip && window.ruiTagChip.name === 'ruiTagChip') {
            app.component('yry-tag-chip', window.ruiTagChip);
        }
        if (window.ruiBackTop && window.ruiBackTop.name === 'ruiBackTop') {
            app.component('yry-back-top', window.ruiBackTop);
        }
        // Report section components.
        if (window.ruiReportSummary && window.ruiReportSummary.name === 'ruiReportSummary') {
            app.component('yry-report-summary', window.ruiReportSummary);
        }
        if (window.ruiReportSize && window.ruiReportSize.name === 'ruiReportSize') {
            app.component('yry-report-size', window.ruiReportSize);
        }
        if (window.ruiReportLargest && window.ruiReportLargest.name === 'ruiReportLargest') {
            app.component('yry-report-largest', window.ruiReportLargest);
        }
        if (window.ruiReportCoupling && window.ruiReportCoupling.name === 'ruiReportCoupling') {
            app.component('yry-report-coupling', window.ruiReportCoupling);
        }
        if (window.ruiReportRisk && window.ruiReportRisk.name === 'ruiReportRisk') {
            app.component('yry-report-risk', window.ruiReportRisk);
        }
        if (window.ruiReportHealth && window.ruiReportHealth.name === 'ruiReportHealth') {
            app.component('yry-report-health', window.ruiReportHealth);
        }
        if (window.ruiReportSelfImprovement && window.ruiReportSelfImprovement.name === 'ruiReportSelfImprovement') {
            app.component('yry-report-self-improvement', window.ruiReportSelfImprovement);
        }
    }

    /**
     * Boot sequence. Called by index.js after data.js is loaded.
     * Returns a Promise so the caller can chain diagnostics if needed.
     */
    RuiReportApp.mount = function mountReportApp() {
        return Promise.resolve(window.__reportTemplatesReady)
            .then(function () {
                return Promise.all([
                    whenReady('ruiBreadcrumb', 'yry-breadcrumb-ready', 'yry-breadcrumb-error'),
                    whenReady('ruiScoreBar', 'yry-score-bar-ready', 'yry-score-bar-error'),
                    whenReady('ruiBadge', 'yry-badge-ready', 'yry-badge-error'),
                    whenReady('ruiTagChip', 'yry-tag-chip-ready', 'yry-tag-chip-error'),
                    whenReady('ruiBackTop', 'yry-back-top-ready', 'yry-back-top-error'),
                ]);
            })
            .then(function () {
                return Promise.all([
                    whenReportComponentReady('ruiReportSummary', 'yry-report-summary-tpl'),
                    whenReportComponentReady('ruiReportSize', 'yry-report-size-tpl'),
                    whenReportComponentReady('ruiReportLargest', 'yry-report-largest-tpl'),
                    whenReportComponentReady('ruiReportCoupling', 'yry-report-coupling-tpl'),
                    whenReportComponentReady('ruiReportRisk', 'yry-report-risk-tpl'),
                    whenReportComponentReady('ruiReportHealth', 'yry-report-health-tpl'),
                    whenReportComponentReady('ruiReportSelfImprovement', 'yry-report-self-improvement-tpl'),
                ]);
            })
            .then(function () {
                scheduleMount(function () {
                    mountOnce(0);
                });
            });
    };

    // Module-private mount helper — preserves the original behaviour:
    // keep a snapshot of the initial markup so the mount target can be
    // reset and the app remounted on a retry (e.g. transient Vue errors).
    let initialMarkup = null;

    function resetMountTarget() {
        const mountEl = document.getElementById('page-app');
        if (!mountEl || !initialMarkup) {
            return mountEl;
        }
        const wrapper = document.createElement('div');
        wrapper.innerHTML = initialMarkup;
        const freshEl = wrapper.firstElementChild;
        if (!freshEl) {
            return mountEl;
        }
        mountEl.replaceWith(freshEl);
        return freshEl;
    }

    function mountOnce(attempt) {
        let mountEl = document.getElementById('page-app');
        if (!mountEl) {
            return;
        }
        if (!initialMarkup) {
            initialMarkup = mountEl.outerHTML;
        }
        if (attempt > 0) {
            mountEl = resetMountTarget();
        }
        const app = Vue.createApp(RuiReportApp);
        registerComponents(app);
        try {
            app.mount(mountEl);
        } catch (err) {
            if (attempt >= 1) {
                console.error('[yry-report-files] mount failed after retry:', err);
                return;
            }
            setTimeout(function () {
                scheduleMount(function () {
                    mountOnce(attempt + 1);
                });
            }, 50);
        }
    }
})();
