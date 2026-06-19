/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryPathLink · Vue 3 路径链接组件 (loader)

   props: display · full · href · target

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-path-link/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-path-link/index.js"></script>
     <div id="my-link"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryPathLink, {
           display: 'cdn/shared/index.css', full: '/path/to/file', href: 'file.css'
         }).mount('#my-link');
       }
       if (window.YryPathLink) mount();
       else document.addEventListener('yry-path-link-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryPathLink] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-path-link-tpl';
  var READY_EVENT = 'yry-path-link-ready';
  var TAG_NAME = 'yry-path-link';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryPathLink] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryPathLink] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryPathLink',
      props: {
        display: { type: String, default: '' },
        full:    { type: String, default: '' },
        href:    { type: String, default: '' },
        target:  { type: String, default: '' }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryPathLink' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryPathLink] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryPathLink = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryPathLinkCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryPathLinkCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryPathLink] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();