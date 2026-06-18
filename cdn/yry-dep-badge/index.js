/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryDepBadge · Vue 3 依赖页跳转徽章组件 (loader)

   props: href · label · type · target
   type: doc/rule/test/cmd/arc/skill/warn

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-dep-badge/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-dep-badge/index.js"></script>
     <div id="my-badge"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryDepBadge, {
           href: '架构图.html', label: '📐 架构图', type: 'arc'
         }).mount('#my-badge');
       }
       if (window.YryDepBadge) mount();
       else document.addEventListener('yry-dep-badge-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryDepBadge] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-dep-badge-tpl';
  var READY_EVENT = 'yry-dep-badge-ready';
  var TAG_NAME = 'yry-dep-badge';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryDepBadge] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryDepBadge] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryDepBadge',
      props: {
        href:   { type: String, default: '' },
        label:  { type: String, default: '' },
        type:   { type: String, default: 'doc' },
        target: { type: String, default: '' }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryDepBadge' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryDepBadge] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryDepBadge = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryDepBadgeCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryDepBadgeCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryDepBadge] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();