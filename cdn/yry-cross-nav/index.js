/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCrossNav · Vue 3 交叉导航组件 (loader)
   适用: 场景页 7 种交付物类型间的快速跳转

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-cross-nav-tpl"> 内容
     3) 注册组件到 window.YryCrossNav
     4) 派发 'yry-cross-nav-ready' 事件,通知页面挂载

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-cross-nav/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-cross-nav/index.js"></script>
     <div id="cross-nav-app"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryCrossNav, {
           basePath: './',
           active: '清单',
           pages: [{ id:'清单', icon:'📋', href:'计划清单.html' }, ...]
         }).mount('#cross-nav-app');
       }
       if (window.YryCrossNav) mount();
       else document.addEventListener('yry-cross-nav-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryCrossNav] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-cross-nav-tpl';
  var READY_EVENT = 'yry-cross-nav-ready';
  var TAG_NAME    = 'yry-cross-nav';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryCrossNav] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryCrossNav] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryCrossNav',
      props: {
        basePath: { type: String, default: './' },
        pages:    { type: Array,  default: function() { return []; } },
        active:   { type: String, default: '' }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryCrossNav' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryCrossNav] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryCrossNav = buildComponent(templateHTML);

      /* ── 注册为自定义元素(允许 <yry-cross-nav> 标签直接使用) ─────── */
      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryCrossNavCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryCrossNavCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryCrossNav] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();
