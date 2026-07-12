/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — window.PanelHub global API (panel open/close/toggle/register)

   Extracted from the ruiPanelHub Vue component for independent loading.
   This script loads synchronously and exposes window.PanelHub / window.openPanel
   immediately — callers can use PanelHub.register() as soon as the <script> tag
   has executed, without waiting for the Vue component's async template fetch.

   Usage:
     <script src="../../../../rui-html-cdn/rui-panel-hub/panel-hub-api.js"></script>
     <script>
       PanelHub.register('my-panel', 'bell-id', 'panel-id', 'overlay-id');
       openPanel('my-panel');  // legacy shorthand, kept for backward compat
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var H = window.ruiComponentHelpers || {};
    var MS_PER_MINUTE = H.MS_PER_MINUTE || 60000;
    var MS_PER_HOUR   = H.MS_PER_HOUR   || 3600000;
    var MS_PER_DAY    = H.MS_PER_DAY    || 86400000;

    var PanelHubRegistry = {
        registry: {},
        _keydownHandler: null,
        PATHS: {
            healthIndex:     '../docs/健康报告/health-cdn-index.html',
            loopIndex:       './自循环报告/index.html',
            trendManifest:   './趋势报告/reports.json',
            summaryJson:     './自我改进/summary.json',
            healthTrend:     '../.memory/health-trend.jsonl',
            scheduledTasks:  '../.claude/scheduled_tasks.json'
        },
        _ensureKeydownListener: function () {
            if (this._keydownHandler) return;
            var self = this;
            this._keydownHandler = function (e) {
                if (e.key === 'Escape') {
                    Object.keys(self.registry).forEach(function (name) {
                        if (self.registry[name].panel.classList.contains('open')) {
                            self.close(name);
                        }
                    });
                }
            };
            document.addEventListener('keydown', this._keydownHandler);
        },
        register: function (name, bellId, panelId, overlayId, onOpen) {
            var bell    = bellId    ? document.getElementById(bellId)    : null;
            var panel   =           document.getElementById(panelId);
            var overlay =           document.getElementById(overlayId);
            if (!panel || !overlay) {
                console.warn('[PanelHub] register("' + name + '"): panel or overlay element not found');
                return false;
            }
            this.registry[name] = { bell: bell, panel: panel, overlay: overlay, onOpen: onOpen || null };
            var r = this.registry[name];
            if (r.bell) {
                r.bell.addEventListener('click', function () {
                    PanelHubRegistry.toggle(name);
                });
            }
            r.overlay.addEventListener('click', function () {
                PanelHubRegistry.close(name);
            });
            this._ensureKeydownListener();
            return true;
        },
        unregister: function (name) {
            delete this.registry[name];
        },
        closeAllExcept: function (name) {
            var self = this;
            Object.keys(this.registry).forEach(function (k) {
                if (k !== name) self.close(k);
            });
        },
        open: function (name) {
            var r = this.registry[name];
            if (!r) return;
            this.closeAllExcept(name);
            r.panel.classList.add('open');
            r.overlay.classList.add('open');
            if (r.onOpen) r.onOpen();
        },
        close: function (name) {
            var r = this.registry[name];
            if (!r) return;
            r.panel.classList.remove('open');
            r.overlay.classList.remove('open');
        },
        toggle: function (name) {
            var r = this.registry[name];
            if (!r) return;
            if (r.panel.classList.contains('open')) this.close(name);
            else this.open(name);
        },
        isOpen: function (name) {
            var r = this.registry[name];
            return r ? r.panel.classList.contains('open') : false;
        },
        panelLink: function (name, label) {
            var escapedName = this.escHtml(name);
            return (
                '<a href="#" class="rui-panel-hub-link" onclick="event.preventDefault();event.stopPropagation();PanelHub.open(\'' +
                escapedName +
                '\')">' +
                this.escHtml(label) +
                '</a>'
            );
        },
        escHtml: function (s) {
            var d = document.createElement('div');
            d.textContent = s == null ? '' : String(s);
            return d.innerHTML;
        },
        relativeTime: function (dateStr) {
            if (!dateStr) return '';
            try {
                var d = new Date(dateStr);
                if (isNaN(d.getTime())) return dateStr;
                var now     = new Date();
                var diffMin = Math.floor((now - d) / MS_PER_MINUTE);
                var diffHr  = Math.floor((now - d) / MS_PER_HOUR);
                var diffDay = Math.floor((now - d) / MS_PER_DAY);
                if (diffMin < 1)  return '刚刚';
                if (diffMin < 60) return diffMin + '分钟前';
                if (diffHr  < 24) return diffHr  + '小时前';
                if (diffDay === 1) return '昨天';
                if (diffDay < 7)  return diffDay + '天前';
                if (diffDay < 30) return diffDay + '天前';
                var months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
                return months[d.getMonth()] + d.getDate() + '日';
            } catch (e) {
                return dateStr;
            }
        }
    };

    if (!window.PanelHub)  window.PanelHub  = PanelHubRegistry;
    if (!window.openPanel) {
        window.openPanel = function (name) { PanelHubRegistry.open(name); };
    }
})();
