/**
 * yry-remediation.js — Shared remediation logic for YiDoc report templates.
 *
 * Exposes window.yryRemediation with factory functions that create
 * Vue methods for remediation queue management. Used by both
 * templates/apis/ and templates/files/ report pages.
 *
 * Factory functions (each returns a Vue method):
 *   createToggleRemediation(storageKey)    → toggleRemediation(key)
 *   createClearRemediationDone(storageKey) → clearRemediationDone()
 *   createCopyFilePath()                   → copyFilePath(item)
 *
 * @module yry-remediation
 * @since Phase 4 refactoring — extracted from apis/app/actions.js and files/app/actions.js
 */
;(function () {
    'use strict';

    /**
     * Build a file reference string ("path" or "path:line").
     * @param {Object} item — must have .file, optionally .line
     * @returns {string}
     */
    function buildFileRef(item) {
        var file = String((item && item.file) || '');
        var line = item && item.line;
        return line != null && line !== '' ? file + ':' + line : file;
    }

    /**
     * Factory: create a `toggleRemediation(key)` method.
     * @param {string} storageKey — localStorage key for persistence
     * @returns {function}
     */
    function createToggleRemediation(storageKey) {
        return function (key) {
            var next = Object.assign({}, this.remediationDone);
            if (next[key]) {
                delete next[key];
            } else {
                next[key] = true;
            }
            this.remediationDone = next;
            try {
                localStorage.setItem(storageKey, JSON.stringify(next));
            } catch (e) { /* quota exceeded or blocked */ }
        };
    }

    /**
     * Factory: create a `clearRemediationDone()` method.
     * @param {string} storageKey — localStorage key to clear
     * @returns {function}
     */
    function createClearRemediationDone(storageKey) {
        return function () {
            this.remediationDone = {};
            try {
                localStorage.removeItem(storageKey);
            } catch (e) { /* ignore */ }
        };
    }

    /**
     * Factory: create a `copyFilePath(item)` method.
     * Uses window.yryClipboard.writeText for the actual copy.
     * Manages copiedKey state and copy feedback timer.
     * @returns {function}
     */
    function createCopyFilePath() {
        var _timer = null;

        return function (item) {
            if (!item || !item.file) return;

            var ref = buildFileRef(item);
            var self = this;

            function finish(ok) {
                if (!ok) return;
                if (_timer) clearTimeout(_timer);
                self.copiedKey = item._key || null;
                _timer = setTimeout(function () {
                    self.copiedKey = null;
                    _timer = null;
                }, 1500);

                // Announce to screen readers
                try {
                    var announcer = document.getElementById('sr-announcer');
                    if (announcer) announcer.textContent = 'Copied: ' + ref;
                } catch (e) { /* ignore */ }
            }

            try {
                var result = window.yryClipboard.writeText(ref);
                if (result && typeof result.then === 'function') {
                    result.then(function () { finish(true); }, function () { finish(false); });
                } else {
                    finish(true);
                }
            } catch (e) {
                finish(false);
            }
        };
    }

    window.yryRemediation = {
        buildFileRef: buildFileRef,
        createToggleRemediation: createToggleRemediation,
        createClearRemediationDone: createClearRemediationDone,
        createCopyFilePath: createCopyFilePath
    };
})();
