/**
 * yry-clipboard.js — Shared clipboard API wrapper for YiDoc templates.
 *
 * Exposes window.yryClipboard with a single method:
 *   writeText(text) → Promise<void>
 *
 * Uses the modern navigator.clipboard API when available, with a
 * textarea + execCommand fallback for non-secure contexts (file://, HTTP).
 *
 * @module yry-clipboard
 * @since Phase 4 refactoring — extracted from apis/app/actions.js and files/app/actions.js
 */
;(function () {
    'use strict';

    function writeText(text) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            return navigator.clipboard.writeText(text);
        }
        // Fallback for non-secure contexts: hidden textarea + execCommand
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

    window.yryClipboard = { writeText: writeText };
})();
