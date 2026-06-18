/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryOpBtn · Vue 3 操作按钮组件 (loader)

   props: label · icon · href · target · tone (view/run/edit/del/warn/default)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-op-btn/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-op-btn/index.js"></script>
     <div id="my-btn"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryOpBtn, {
           label: '查看', icon: '👁', href: 'demo.html', tone: 'view'
         }).mount('#my-btn');
       }
       if (window.YryOpBtn) mount();
       else document.addEventListener('yry-op-btn-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryOpBtn] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-op-btn-tpl';
  var READY_EVENT = 'yry-op-btn-ready';
  var TAG_NAME = 'yry-op-btn';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryOpBtn] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryOpBtn] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryOpBtn',
      props: {
        label:  { type: String, default: '' },
        icon:   { type: String, default: '' },
        href:   { type: String, default: '' },
        target: { type: String, default: '' },
        tone:   { type: String, default: '' }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryOpBtn' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryOpBtn] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryOpBtn = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryOpBtnCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryOpBtnCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryOpBtn] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();