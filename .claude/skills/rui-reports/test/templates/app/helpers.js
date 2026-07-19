/**
 * app/helpers.js — shared browser helpers for the test report.
 */
(function () {
    'use strict';

    var RuiSelfTestApp = window.RuiSelfTestApp = window.RuiSelfTestApp || {};

    RuiSelfTestApp.formatHuman = function formatHuman(iso) {
        if (!iso) return '';
        try {
            var date = new Date(iso);
            return date.toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
        } catch (e) {
            return iso;
        }
    };

    RuiSelfTestApp.whenGlobal = function whenGlobal(name, timeoutMs) {
        return new Promise(function (resolve, reject) {
            if (typeof window[name] !== 'undefined') {
                resolve(window[name]);
                return;
            }
            var startedAt = Date.now();
            (function poll() {
                if (typeof window[name] !== 'undefined') {
                    resolve(window[name]);
                    return;
                }
                if (Date.now() - startedAt > (timeoutMs || 5000)) {
                    reject(new Error(name + ' not ready'));
                    return;
                }
                setTimeout(poll, 50);
            })();
        });
    };

    RuiSelfTestApp.cloneRecord = function cloneRecord(source) {
        var next = {};
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                next[key] = source[key];
            }
        }
        return next;
    };
})();
