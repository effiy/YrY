/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryPanelHub · Vue 3 浮动面板工具栏组件 (loader)
   适用: 浮动面板 (cron/notify/selfimprove/faq) 集中入口工具栏

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-panel-hub-tpl"> 内容
     3) 注册组件到 window.YryPanelHub
     4) 派发 'yry-panel-hub-ready' 事件,通知页面挂载

   交互约定:
     - 按钮/label 点击 → 在组件根元素上派发 CustomEvent('panel-hub-select',
       { detail: { panel: <name> }, bubbles: true })
     - 页面监听该事件后调用自己的面板 API(例如 window.PanelHub.open)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-panel-hub/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-panel-hub/index.js"></script>
     <div id="panel-hub-app"></div>
     <script>
       function mount() {
         const root = Vue.createApp(window.YryPanelHub, {
           label:   { text: '🩺 —', panel: 'selfimprove', title: '点击打开自改进面板' },
           buttons: [
             { icon: '⏰', name: '调度', desc: '定时·触发·编排', color: 'var(--yry-cyan)', panel: 'cron', title: '...' },
             { icon: '🔔', name: '通知', desc: '健康·循环·趋势', color: '#ef4444',       panel: 'notify', title: '...' }
             // ...
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

   对应场景文档:
     - docs/故事任务面板/首页/场景-2-实时面板与交互组件/
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
        /* 可选: 左侧 live health 标签
           形如 { text, panel, title } · 点击后触发 panel-hub-select 事件 */
        label:   { type: Object, default: null },

        /* 必填: 按钮列表
           每项: { icon, name, desc, color?, panel, title? }
           - icon / name / desc 必填
           - color 可选 (CSS color 值,作用于 .panel-hub-icon)
           - panel 必填 (点击后随事件 detail.panel 派发)
           - title 可选 (鼠标悬停提示) */
        buttons: { type: Array,  required: true },

        /* 可选: 末尾的流程说明文字 */
        flow:    { type: String, default: '' }
      },
      methods: {
        /* 派发 select 事件 — 通过 DOM CustomEvent 方式,
           便于页面以 addEventListener 方式监听(无需 Vue 父组件) */
        onSelect: function (panel) {
          this.$el.dispatchEvent(new CustomEvent('panel-hub-select', {
            detail: { panel: panel },
            bubbles: true
          }));
        },
        onLabelClick: function () {
          if (this.label && this.label.panel) {
            this.onSelect(this.label.panel);
          }
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
      if (timedOut) return; // 已超时,放弃注册
      clearTimeout(timeoutId);

      var doc = new DOMParser().parseFromString(htmlText, 'text/html');
      var tpl = doc.getElementById(TEMPLATE_ID);
      if (!tpl) {
        throw new Error('未找到 <script type="text/x-template" id="' + TEMPLATE_ID + '">');
      }

      var templateHTML = tpl.innerHTML;
      window.YryPanelHub = buildComponent(templateHTML);

      /* ── 注册为自定义元素(允许 <yry-panel-hub> 标签直接使用) ────── */
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
