/**
 * rui-copy-button — clipboard copy button with "Copied!" feedback.
 * ----------------------------------------------------------------------
 * Replaces the 3× duplicated `.remediation-copy` markup inside the
 * remediation-item blocks. The component:
 *   1) accepts a `text` (or `value`) prop carrying the file:line
 *      reference to copy
 *   2) writes it to the clipboard (with a `textarea + execCommand`
 *      fallback for non-secure contexts — same behaviour as the
 *      previous page-level `writeToClipboard` in app/actions.js)
 *   3) flashes a brief `copied = true` for 1.5s, then resets
 *   4) re-uses the existing `.remediation-copy*` classes from
 *      files/index.css so visual identity is preserved
 *
 * The clipboard helper is now self-contained — the previous
 * `writeToClipboard` / `buildFileRef` in app/actions.js can be
 * deleted and the page can just emit `@copy="onCopy(item)"` with
 * the same `text` it used to render into the title attribute.
 */
(function () {
    'use strict';

    var FEEDBACK_MS = 1500;

    function writeToClipboard(text) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            try {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.top = '-1000px';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                var ok = document.execCommand('copy');
                document.body.removeChild(ta);
                ok ? resolve() : reject(new Error('execCommand copy failed'));
            } catch (e) {
                reject(e);
            }
        });
    }

    window.ruiCopyButton = {
        name: 'ruiCopyButton',
        template: '#rui-copy-button-tpl',
        props: {
            text:       { type: String, required: true },
            label:      { type: String, default: 'Copy path' },
            disabled:   { type: Boolean, default: false }
        },
        data: function () {
            return { copied: false };
        },
        computed: {
            title: function () {
                return 'Copy path: ' + this.text;
            },
            ariaLabel: function () {
                return 'Copy path ' + this.text;
            }
        },
        methods: {
            onClick: function () {
                var self = this;
                if (this.disabled) { return; }
                var finish = function (ok) {
                    if (!ok) { return; }
                    self.copied = true;
                    if (self._tid) { clearTimeout(self._tid); }
                    self._tid = setTimeout(function () {
                        self.copied = false;
                        self._tid = null;
                    }, FEEDBACK_MS);
                };
                try {
                    var result = writeToClipboard(this.text);
                    if (result && typeof result.then === 'function') {
                        result.then(function () { finish(true); }, function () { finish(false); });
                    } else {
                        finish(true);
                    }
                } catch (e) {
                    finish(false);
                }
            }
        },
        beforeUnmount: function () {
            if (this._tid) { clearTimeout(this._tid); this._tid = null; }
        }
    };
})();
