/**
 * app/mount.js — Vue app boot + component registration + deferred mount.
 * ----------------------------------------------------------------------
 * Waits for window.__vueLoadPromise (CDN-loader promise) and
 * window.__reportTemplatesReady (template fetch promise), then registers
 * the shared rui-* components and the report section components, and
 * finally mounts the PAGE_REPORT_FILES_APP onto #page-app.
 *
 * If any component is missing (e.g. CDN blocked), the page still mounts
 * with degraded UI — empty custom elements and console warnings only.
 */
(function () {
    'use strict';

    const RuiReportApp = window.RuiReportApp = window.RuiReportApp || {};

    /**
     * Wait for a shared rui-* component to be ready. The component sets
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
        // Shared components (loaded from /.claude/shared/components/*).
        if (window.ruiBreadcrumb && window.ruiBreadcrumb.name === 'ruiBreadcrumb') {
            app.component('rui-breadcrumb', window.ruiBreadcrumb);
        }
        if (window.ruiScoreBar && window.ruiScoreBar.name === 'ruiScoreBar') {
            app.component('rui-score-bar', window.ruiScoreBar);
        }
        if (window.ruiBadge && window.ruiBadge.name === 'ruiBadge') {
            app.component('rui-badge', window.ruiBadge);
        }
        if (window.ruiTagChip && window.ruiTagChip.name === 'ruiTagChip') {
            app.component('rui-tag-chip', window.ruiTagChip);
        }
        if (window.ruiBackTop && window.ruiBackTop.name === 'ruiBackTop') {
            app.component('rui-back-top', window.ruiBackTop);
        }
        // Report section components.
        if (window.ruiReportSummary && window.ruiReportSummary.name === 'ruiReportSummary') {
            app.component('rui-report-summary', window.ruiReportSummary);
        }
        if (window.ruiReportSize && window.ruiReportSize.name === 'ruiReportSize') {
            app.component('rui-report-size', window.ruiReportSize);
        }
        if (window.ruiReportLargest && window.ruiReportLargest.name === 'ruiReportLargest') {
            app.component('rui-report-largest', window.ruiReportLargest);
        }
        if (window.ruiReportCoupling && window.ruiReportCoupling.name === 'ruiReportCoupling') {
            app.component('rui-report-coupling', window.ruiReportCoupling);
        }
        if (window.ruiReportRisk && window.ruiReportRisk.name === 'ruiReportRisk') {
            app.component('rui-report-risk', window.ruiReportRisk);
        }
        if (window.ruiReportHealth && window.ruiReportHealth.name === 'ruiReportHealth') {
            app.component('rui-report-health', window.ruiReportHealth);
        }
        if (window.ruiReportSelfImprovement && window.ruiReportSelfImprovement.name === 'ruiReportSelfImprovement') {
            app.component('rui-report-self-improvement', window.ruiReportSelfImprovement);
        }
        // Page-level chrome widgets (extracted from inline duplication).
        if (window.ruiRiskBanner && window.ruiRiskBanner.name === 'ruiRiskBanner') {
            app.component('rui-risk-banner', window.ruiRiskBanner);
        }
        if (window.ruiMetaItem && window.ruiMetaItem.name === 'ruiMetaItem') {
            app.component('rui-meta-item', window.ruiMetaItem);
        }
        if (window.ruiFooterRecapItem && window.ruiFooterRecapItem.name === 'ruiFooterRecapItem') {
            app.component('rui-footer-recap-item', window.ruiFooterRecapItem);
        }
        if (window.ruiFindingCard && window.ruiFindingCard.name === 'ruiFindingCard') {
            app.component('rui-finding-card', window.ruiFindingCard);
        }
        if (window.ruiRemediationGroup && window.ruiRemediationGroup.name === 'ruiRemediationGroup') {
            app.component('rui-remediation-group', window.ruiRemediationGroup);
        }
        if (window.ruiRemediationItem && window.ruiRemediationItem.name === 'ruiRemediationItem') {
            app.component('rui-remediation-item', window.ruiRemediationItem);
        }
        if (window.ruiCopyButton && window.ruiCopyButton.name === 'ruiCopyButton') {
            app.component('rui-copy-button', window.ruiCopyButton);
        }
        if (window.ruiRemediationCheck && window.ruiRemediationCheck.name === 'ruiRemediationCheck') {
            app.component('rui-remediation-check', window.ruiRemediationCheck);
        }
        if (window.ruiStaleBanner && window.ruiStaleBanner.name === 'ruiStaleBanner') {
            app.component('rui-stale-banner', window.ruiStaleBanner);
        }
        if (window.ruiRiskDistribution && window.ruiRiskDistribution.name === 'ruiRiskDistribution') {
            app.component('rui-risk-distribution', window.ruiRiskDistribution);
        }
        if (window.ruiP0Jump && window.ruiP0Jump.name === 'ruiP0Jump') {
            app.component('rui-p0-jump', window.ruiP0Jump);
        }
        if (window.ruiBackToTopLink && window.ruiBackToTopLink.name === 'ruiBackToTopLink') {
            app.component('rui-back-to-top-link', window.ruiBackToTopLink);
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
                    whenReady('ruiBreadcrumb', 'rui-breadcrumb-ready', 'rui-breadcrumb-error'),
                    whenReady('ruiScoreBar', 'rui-score-bar-ready', 'rui-score-bar-error'),
                    whenReady('ruiBadge', 'rui-badge-ready', 'rui-badge-error'),
                    whenReady('ruiTagChip', 'rui-tag-chip-ready', 'rui-tag-chip-error'),
                    whenReady('ruiBackTop', 'rui-back-top-ready', 'rui-back-top-error'),
                ]);
            })
            .then(function () {
                return Promise.all([
                    whenReportComponentReady('ruiReportSummary', 'rui-report-summary-tpl'),
                    whenReportComponentReady('ruiReportSize', 'rui-report-size-tpl'),
                    whenReportComponentReady('ruiReportLargest', 'rui-report-largest-tpl'),
                    whenReportComponentReady('ruiReportCoupling', 'rui-report-coupling-tpl'),
                    whenReportComponentReady('ruiReportRisk', 'rui-report-risk-tpl'),
                    whenReportComponentReady('ruiReportHealth', 'rui-report-health-tpl'),
                    whenReportComponentReady('ruiReportSelfImprovement', 'rui-report-self-improvement-tpl'),
                    whenReportComponentReady('ruiRiskBanner', 'rui-risk-banner-tpl'),
                    whenReportComponentReady('ruiMetaItem', 'rui-meta-item-tpl'),
                    whenReportComponentReady('ruiFooterRecapItem', 'rui-footer-recap-item-tpl'),
                    whenReportComponentReady('ruiFindingCard', 'rui-finding-card-tpl'),
                    whenReportComponentReady('ruiRemediationGroup', 'rui-remediation-group-tpl'),
                    whenReportComponentReady('ruiRemediationItem', 'rui-remediation-item-tpl'),
                    whenReportComponentReady('ruiCopyButton', 'rui-copy-button-tpl'),
                    whenReportComponentReady('ruiRemediationCheck', 'rui-remediation-check-tpl'),
                    whenReportComponentReady('ruiStaleBanner', 'rui-stale-banner-tpl'),
                    whenReportComponentReady('ruiRiskDistribution', 'rui-risk-distribution-tpl'),
                    whenReportComponentReady('ruiP0Jump', 'rui-p0-jump-tpl'),
                    whenReportComponentReady('ruiBackToTopLink', 'rui-back-to-top-link-tpl'),
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
                console.error('[rui-report-files] mount failed after retry:', err);
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
