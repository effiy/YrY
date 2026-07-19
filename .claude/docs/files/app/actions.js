/**
 * app/actions.js — Page-level user actions (chrome buttons).
 * ----------------------------------------------------------------------
 * Exposes window.RuiReportApp.methods. The only remaining actions
 * are the remediation queue toggle / reset.
 *
 * The previous `copyFilePath` + `buildFileRef` + `writeToClipboard`
 * + `copyFeedbackTimer` machinery has moved into the dedicated
 * `<rui-copy-button>` component (each instance owns its own 1.5 s
 * feedback timer, clipboard write, and fallback `<textarea>` path).
 */
(function () {
    'use strict';

    const RuiReportApp = window.RuiReportApp = window.RuiReportApp || {};

    RuiReportApp.methods = {
        toggleRemediation: function (key) {
            const next = Object.assign({}, this.remediationDone);
            if (next[key]) {
                delete next[key];
            } else {
                next[key] = true;
            }
            this.remediationDone = next;
            try {
                localStorage.setItem('rui-report-remediation-done', JSON.stringify(next));
            } catch (e) {}
        },

        clearRemediationDone: function () {
            this.remediationDone = {};
            try {
                localStorage.removeItem('rui-report-remediation-done');
            } catch (e) {}
        },
    };
})();
