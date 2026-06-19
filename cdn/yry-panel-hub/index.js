/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryPanelHub · Vue 3 浮动面板工具栏组件 + PanelHub 全局 API (full)

   双职责:
     1) 渲染浮动面板工具栏 (Vue 3 custom element + props 配置入口)
     2) 注册 window.PanelHub 全局 API(register/open/close/toggle/isOpen/panelLink/escHtml/relativeTime/PATHS)
        以及 window.openPanel 便捷入口(为旧版 onclick="window.openPanel('xxx')" 兼容)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-panel-hub/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-panel-hub/index.js"></script>
     <div id="panel-hub-app"></div>
     <script>
       function mount() {
         const root = Vue.createApp(window.YryPanelHub, {
           label:   { text: '🩺 —', panel: 'selfimprove', title: '...' },
           buttons: [
             { icon: '⏰', name: '调度', desc: '...', color: 'var(--yry-cyan)', panel: 'cron' },
             { icon: '🔔', name: '通知', desc: '...', color: '#ef4444',       panel: 'notify' }
           ],
           flow: 'Cron 定时触发 → ...'
         }).mount('#panel-hub-app');

         root.addEventListener('panel-hub-select', function (e) {
           if (window.PanelHub) window.PanelHub.open(e.detail.panel);
         });
       }
       if (window.YryPanelHub) mount();
       else document.addEventListener('yry-panel-hub-ready', mount, { once: true });
     </script>

   数据迁移说明:
     本组件 1:1 保留 docs/js/panel-hub.js 的 PanelHub 全局 API(register/open/close/...),
     并集成原 yry-panel-hub 的 Vue 工具栏组件,合并为单一 CDN 组件。
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 依赖检测: 必须先加载 Vue 3 ────────────────────────────────────── */
  if (!window.Vue) {
    console.warn('[YryPanelHub] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  /* ── 常量 ──────────────────────────────────────────────────────────── */
  var TEMPLATE_ID = 'yry-panel-hub-tpl';
  var READY_EVENT = 'yry-panel-hub-ready';
  var TAG_NAME    = 'yry-panel-hub';
  var LOAD_TIMEOUT_MS = 5000;

  /* ── PanelHub 全局 API(原 docs/js/panel-hub.js) ──────────────────── */
  var PanelHubRegistry = {
    registry: {},
    PATHS: {
      healthIndex:   '../docs/健康报告/health-cdn-index.html',
      loopIndex:     './自循环报告/index.html',
      trendManifest: './趋势报告/reports.json',
      summaryJson:   './自我改进/summary.json',
      healthTrend:   '../.memory/health-trend.jsonl',
      scheduledTasks:'../.claude/scheduled_tasks.json'
    },
    register: function (name, bellId, panelId, overlayId, onOpen) {
      var bell = bellId ? document.getElementById(bellId) : null;
      var panel = document.getElementById(panelId);
      var overlay = document.getElementById(overlayId);
      if (!panel || !overlay) return;
      this.registry[name] = { bell: bell, panel: panel, overlay: overlay, onOpen: onOpen || null };
      var r = this.registry[name];
      if (r.bell) r.bell.addEventListener('click', function () { PanelHubRegistry.toggle(name); });
      r.overlay.addEventListener('click', function () { PanelHubRegistry.close(name); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && r.panel.classList.contains('open')) PanelHubRegistry.close(name);
      });
    },
    closeAllExcept: function (name) {
      var self = this;
      Object.keys(this.registry).forEach(function (k) { if (k !== name) self.close(k); });
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
      return '<a href="#" onclick="event.preventDefault();event.stopPropagation();PanelHub.open(\'' + name + '\')" style="color:inherit;text-decoration:underline;text-underline-offset:2px;text-decoration-color:rgba(255,255,255,.2)">' + label + '</a>';
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
        var now = new Date();
        var diffMin = Math.floor((now - d) / 60000);
        var diffHr  = Math.floor((now - d) / 3600000);
        var diffDay = Math.floor((now - d) / 86400000);
        if (diffMin < 1)  return '刚刚';
        if (diffMin < 60) return diffMin + '分钟前';
        if (diffHr < 24)  return diffHr + '小时前';
        if (diffDay === 1) return '昨天';
        if (diffDay < 7)  return diffDay + '天前';
        if (diffDay < 30) return diffDay + '天前';
        var months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
        return months[d.getMonth()] + d.getDate() + '日';
      } catch (e) { return dateStr; }
    }
  };

  /* 暴露 PanelHub API + openPanel 便捷入口 */
  function exposePanelHub() {
    if (!window.PanelHub) window.PanelHub = PanelHubRegistry;
    if (!window.openPanel) {
      window.openPanel = function (name) { PanelHubRegistry.open(name); };
    }
  }

  /* ── 计算 index.html 的绝对 URL (基于本脚本自身的 src) ────────────── */
  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryPanelHub] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryPanelHub] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  /* ── 组件定义工厂 ──────────────────────────────────────────────────── */
  function buildComponent(templateHTML) {
    return {
      name: 'YryPanelHub',
      props: {
        label:   { type: Object, default: null },
        buttons: { type: Array,  required: true },
        flow:    { type: String, default: '' }
      },
      methods: {
        onSelect: function (panel) {
          this.$el.dispatchEvent(new CustomEvent('panel-hub-select', {
            detail: { panel: panel },
            bubbles: true
          }));
        },
        onLabelClick: function () {
          if (this.label && this.label.panel) this.onSelect(this.label.panel);
        }
      },
      template: templateHTML
    };
  }

  /* ── 派发 ready 事件 (页面挂载脚本监听) ───────────────────────────── */
  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryPanelHub' } }));
  }

  /* ── 加载模板并注册组件 ───────────────────────────────────────────── */
  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryPanelHub] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
  }, LOAD_TIMEOUT_MS);

  fetch(templateUrl, { credentials: 'same-origin' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + r.statusText);
      return r.text();
    })
    .then(function (htmlText) {
      if (timedOut) return;
      clearTimeout(timeoutId);

      var doc = new DOMParser().parseFromString(htmlText, 'text/html');
      var tpl = doc.getElementById(TEMPLATE_ID);
      if (!tpl) {
        throw new Error('未找到 <script type="text/x-template" id="' + TEMPLATE_ID + '">');
      }

      var templateHTML = tpl.innerHTML;

      /* 先暴露 PanelHub API,确保其他面板组件注册时已可用 */
      exposePanelHub();

      /* 注册 Vue 组件对象(供页面用 Vue.createApp().mount() 挂载) */
      window.YryPanelHub = buildComponent(templateHTML);

      /* 注册为自定义元素(<yry-panel-hub> 标签直接使用) */
      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryPanelHubCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryPanelHubCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryPanelHub] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();
