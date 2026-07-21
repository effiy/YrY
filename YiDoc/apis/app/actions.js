/**
 * app/actions.js — Page-level user actions (chrome buttons).
 * ----------------------------------------------------------------------
 * Exposes window.RuiReportApp.methods.
 */
(function () {
    'use strict';

    const RuiReportApp = window.RuiReportApp = window.RuiReportApp || {};

    let copyFeedbackTimer = null;

    function buildFileRef(item) {
        const file = String((item && item.file) || '');
        const line = item && item.line;
        return line != null && line !== '' ? file + ':' + line : file;
    }

    function writeToClipboard(text) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            return navigator.clipboard.writeText(text);
        }
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
            } catch (e) { reject(e); }
        });
    }

    RuiReportApp.methods = {
        toggleRemediation: function (key) {
            const next = Object.assign({}, this.remediationDone);
            if (next[key]) delete next[key];
            else next[key] = true;
            this.remediationDone = next;
            try { localStorage.setItem('yry-report-api-remediation-done', JSON.stringify(next)); } catch (e) {}
        },

        clearRemediationDone: function () {
            this.remediationDone = {};
            try { localStorage.removeItem('yry-report-api-remediation-done'); } catch (e) {}
        },

        copyFilePath: function (item) {
            if (!item || !item.file) return;
            const ref = buildFileRef(item);
            const self = this;
            const finish = function (ok) {
                if (!ok) return;
                if (copyFeedbackTimer) clearTimeout(copyFeedbackTimer);
                self.copiedKey = item._key || null;
                copyFeedbackTimer = setTimeout(function () {
                    self.copiedKey = null;
                    copyFeedbackTimer = null;
                }, 1500);
                // Announce to screen readers
                try {
                    var announcer = document.getElementById('sr-announcer');
                    if (announcer) announcer.textContent = 'Copied: ' + ref;
                } catch (e) { /* ignore */ }
            };
            try {
                const result = writeToClipboard(ref);
                if (result && typeof result.then === 'function') {
                    result.then(function () { finish(true); }, function () { finish(false); });
                } else { finish(true); }
            } catch (e) { finish(false); }
        },

        openLibUrl: function (url) {
            if (!url) return;
            window.open(url, '_blank', 'noopener,noreferrer');
        },
    };
})();
