/**
 * app/actions.js — Page-level user actions (chrome buttons).
 * ----------------------------------------------------------------------
 * Exposes window.RuiReportApp.methods. Currently just the
 * remediation toggle.
 */
(function () {
    'use strict';

    const RuiReportApp = window.RuiReportApp = window.RuiReportApp || {};

    // Timer handle for clearing the "copied" feedback. Stored on the host
    // page so the previous in-flight timeout (if any) can be cancelled when
    // the user copies another path — preventing premature reset.
    let copyFeedbackTimer = null;

    function buildFileRef(item) {
        const file = String((item && item.file) || '');
        const line = item && item.line;
        return line != null && line !== '' ? `${file}:${line}` : file;
    }

    function writeToClipboard(text) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            return navigator.clipboard.writeText(text);
        }
        // Fallback for non-secure contexts: use a hidden textarea + execCommand.
        return new Promise(function (resolve, reject) {
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.top = '-1000px';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                const ok = document.execCommand('copy');
                document.body.removeChild(ta);
                ok ? resolve() : reject(new Error('execCommand copy failed'));
            } catch (e) {
                reject(e);
            }
        });
    }

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
                localStorage.setItem('yry-report-remediation-done', JSON.stringify(next));
            } catch (e) {}
        },

        clearRemediationDone: function () {
            this.remediationDone = {};
            try {
                localStorage.removeItem('yry-report-remediation-done');
            } catch (e) {}
        },

        /**
         * Copy a remediation item's file reference ("path" or "path:line")
         * to the clipboard and flash a short-lived "Copied!" confirmation
         * on the matching button via `copiedKey`. Errors are swallowed so
         * the UI never breaks if the clipboard API is denied.
         */
        copyFilePath: function (item) {
            if (!item || !item.file) {
                return;
            }
            const ref = buildFileRef(item);
            const self = this;
            const finish = function (ok) {
                if (!ok) {
                    return;
                }
                if (copyFeedbackTimer) {
                    clearTimeout(copyFeedbackTimer);
                }
                self.copiedKey = item._key || null;
                copyFeedbackTimer = setTimeout(function () {
                    self.copiedKey = null;
                    copyFeedbackTimer = null;
                }, 1500);
            };
            try {
                const result = writeToClipboard(ref);
                if (result && typeof result.then === 'function') {
                    result.then(function () { finish(true); }, function () { finish(false); });
                } else {
                    finish(true);
                }
            } catch (e) {
                finish(false);
            }
        },
    };
})();
