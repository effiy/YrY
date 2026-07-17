/**
 * app/actions.js — Page-level user actions (chrome buttons).
 * ----------------------------------------------------------------------
 * Exposes window.RuiReportApp.methods. Currently just the
 * remediation toggle.
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
