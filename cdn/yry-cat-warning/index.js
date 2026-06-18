/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCatWarning · Vue 3 类别警告组件 (loader)

   props:
     tone    — 'warn' | 'success' | 'info' | 'fail'
     icon    — 左侧图标 emoji
     content — 内容 HTML (支持内联 HTML)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-cat-warning/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-cat-warning/index.js"></script>
     <div id="my-warning"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryCatWarning, {
           tone: 'warn', icon: '\u{1F4A1}',
           content: '<b>注意：</b>这是警告内容'
         }).mount('#my-warning');
       }
       if (window.YryCatWarning) mount();
       else document.addEventListener('yry-cat-warning-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryCatWarning] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-cat-warning-tpl';
  var READY_EVENT = 'yry-cat-warning-ready';
  var TAG_NAME = 'yry-cat-warning';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryCatWarning] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryCatWarning] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryCatWarning',
      props: {
        tone:    { type: String, default: 'warn' },
        icon:    { type: String, default: '' },
        content: { type: String, default: '' }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryCatWarning' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryCatWarning] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryCatWarning = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryCatWarningCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryCatWarningCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryCatWarning] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();