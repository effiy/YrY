/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCronPanel · 调度任务面板 (Vue 3 custom element)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-cron-panel/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-cron-panel/index.js"></script>
     <yry-cron-panel></yry-cron-panel>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryCronPanel] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TAG_NAME = 'yry-cron-panel';
  var TEMPLATE_ID = 'yry-cron-panel-tpl';
  var LOAD_TIMEOUT_MS = 5000;

  if (customElements.get(TAG_NAME)) return;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryCronPanel] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  var templateUrl = new URL('index.html', scriptUrl).href;

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryCronPanel] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      if (!tpl) throw new Error('未找到 <script type="text/x-template" id="' + TEMPLATE_ID + '">');

      var component = {
        name: 'YryCronPanel',
        template: tpl.innerHTML
      };

      if (typeof window.Vue.defineCustomElement === 'function') {
        var CE = window.Vue.defineCustomElement(component, { shadowRoot: false });
        customElements.define(TAG_NAME, CE);
      }

      document.dispatchEvent(new CustomEvent('yry-cron-panel-ready', { detail: { component: 'YryCronPanel' } }));
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryCronPanel] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();