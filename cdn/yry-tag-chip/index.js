/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryTagChip · Vue 3 标签芯片组件 (loader)
   适用: 卡片内的标签行 (tags-row) · 状态徽标 · 角色分类

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-tag-chip-tpl"> 内容
     3) 注册组件到 window.YryTagChip
     4) 派发 'yry-tag-chip-ready' 事件,通知页面挂载

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-tag-chip/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-tag-chip/index.js"></script>
     <div id="tag-row"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryTagChip, { text: '自建', modifier: 'accent' }).mount('#tag-row');
         // 或循环:
         [{text:'v1.0',modifier:'cyan'}, {text:'核心',modifier:'accent'}].forEach(...);
       }
       if (window.YryTagChip) mount();
       else document.addEventListener('yry-tag-chip-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryTagChip] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-tag-chip-tpl';
  var READY_EVENT = 'yry-tag-chip-ready';
  var TAG_NAME    = 'yry-tag-chip';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryTagChip] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryTagChip] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryTagChip',
      props: {
        /* 必填: 标签文本 */
        text:     { type: String, required: true },
        /* 可选: 颜色变体
           取值: accent | info | cyan | green | purple | red | warn | blue
           默认: 'info' */
        modifier: { type: String, default: 'info' },
        /* 可选: 如果提供则渲染为 <a>,否则渲染为 <span> */
        href:     { type: String, default: '' }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryTagChip' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryTagChip] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryTagChip = buildComponent(templateHTML);

      /* ── 注册为自定义元素(允许 <yry-tag-chip> 标签直接使用) ──────── */
      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryTagChipCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryTagChipCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryTagChip] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();
