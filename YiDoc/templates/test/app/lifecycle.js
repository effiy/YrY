/**
 * app/lifecycle.js — mount-time side effects for the test report.
 * ------------------------------------------------------------------
 * Keyboard shortcuts now delegated to shared yry-kbd.js module.
 */
(function () {
    'use strict';

    var RuiSelfTestApp = window.RuiSelfTestApp = window.RuiSelfTestApp || {};

    RuiSelfTestApp.mounted = function () {
        try {
            var stored = localStorage.getItem('yry-report-test-theme');
            if (stored === 'light' || stored === 'dark') {
                this.theme = stored;
                document.documentElement.setAttribute('data-yry-theme', this.theme);
            }
        } catch (e) {}

        this._onScroll = this.onScroll.bind(this);
        window.addEventListener('scroll', this._onScroll, { passive: true });
        this.onScroll();

        // Keyboard shortcuts (via shared yryKbd module).
        yryKbd.register(this, [
            { keys: ['1', '2', '3', '4', '5', '6'], handler: function (key) { var el = document.getElementById('scene-' + key); if (el) el.scrollIntoView({behavior:'smooth',block:'start'}); }, desc: 'Jump to scene 1–6' },
            { key: 't', handler: function () { window.scrollTo({top:0,behavior:'smooth'}); }, desc: 'Scroll to top' },
            { key: 'l', handler: function () { this.toggleTheme(); }, desc: 'Toggle dark/light theme', scope: this },
            { key: 'p', handler: function () { window.print(); }, desc: 'Print / Save as PDF' },
        ]);
    };

    RuiSelfTestApp.beforeUnmount = function () {
        if (this._onScroll) {
            window.removeEventListener('scroll', this._onScroll);
            this._onScroll = null;
        }
        if (typeof yryKbd !== 'undefined') {
            yryKbd.unregister(this);
        }
    };
})();
