/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryProgressBar · Vue 3 进度条组件 (loader)

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-progress-bar-tpl"> 内容
     3) 注册组件到 window.YryProgressBar
     4) 派发 'yry-progress-bar-ready' 事件

   props:
     done  — 已完成数量 (默认 0)
     total — 总数量 (默认 0)
     label — 左侧标签文字 (默认 "进度")

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-progress-bar/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-progress-bar/index.js"></script>
     <div id="my-progress"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryProgressBar, {
           done: 3, total: 8, label: '总体进度'
         }).mount('#my-progress');
       }
       if (window.YryProgressBar) mount();
       else document.addEventListener('yry-progress-bar-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryProgressBar] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-progress-bar-tpl';
  var READY_EVENT = 'yry-progress-bar-ready';
  var TAG_NAME = 'yry-progress-bar';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryProgressBar] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryProgressBar] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryProgressBar',
      props: {
        done:  { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        label: { type: String, default: '进度' }
      },
      computed: {
        pct: function () {
          var total = this.total || 0;
          return total > 0 ? Math.round((this.done / total) * 100) : 0;
        }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryProgressBar' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryProgressBar] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryProgressBar = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryProgressBarCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryProgressBarCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryProgressBar] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();