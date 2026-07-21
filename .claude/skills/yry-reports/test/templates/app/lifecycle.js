/**
 * app/lifecycle.js — mount-time side effects for the test report.
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

        this._onKey = function (event) {
            var tag = (event.target && event.target.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (event.metaKey || event.ctrlKey || event.altKey) return;

            if (event.key >= '1' && event.key <= '6') {
                var sceneNumber = parseInt(event.key, 10);
                var target = document.getElementById('scene-' + sceneNumber);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    event.preventDefault();
                }
                return;
            }

            if (event.key === 't') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                event.preventDefault();
                return;
            }

            if (event.key === 'l') {
                this.toggleTheme();
                event.preventDefault();
                return;
            }

            if (event.key === 'p') {
                window.print();
                event.preventDefault();
            }
        }.bind(this);

        window.addEventListener('keydown', this._onKey);
    };

    RuiSelfTestApp.beforeUnmount = function () {
        if (this._onScroll) {
            window.removeEventListener('scroll', this._onScroll);
            this._onScroll = null;
        }
        if (this._onKey) {
            window.removeEventListener('keydown', this._onKey);
            this._onKey = null;
        }
    };
})();
