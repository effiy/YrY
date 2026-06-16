/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneNav · Vue 3 场景层级导航组件 (loader)
   适用: 场景页 pill 风格面包屑导航

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-scene-nav-tpl"> 内容
     3) 注册组件到 window.YrySceneNav
     4) 派发 'yry-scene-nav-ready' 事件,通知页面挂载

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-scene-nav/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-scene-nav/index.js"></script>
     <div id="scene-nav-app"></div>
     <script>
       function mount() {
         Vue.createApp(window.YrySceneNav, {
           items: [{ label:'任务故事', href:'../README.md' }, { label:'场景 1' }]
         }).mount('#scene-nav-app');
       }
       if (window.YrySceneNav) mount();
       else document.addEventListener('yry-scene-nav-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YrySceneNav] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-scene-nav-tpl';
  var READY_EVENT = 'yry-scene-nav-ready';
  var TAG_NAME    = 'yry-scene-nav';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YrySceneNav] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YrySceneNav] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YrySceneNav',
      props: {
        items: { type: Array, required: true },
        separator: { type: String, default: '·' }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YrySceneNav' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YrySceneNav] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YrySceneNav = buildComponent(templateHTML);

      /* ── 注册为自定义元素(允许 <yry-scene-nav> 标签直接使用) ─────── */
      if (typeof window.Vue.defineCustomElement === 'function') {
        var YrySceneNavCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YrySceneNavCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YrySceneNav] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();
