/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySubTitle · Vue 3 子区块标题组件 (loader)
   适用: 文档中心子区块的标题行(如 "运行时依赖 (6)")

   props 简表:
     icon   (可选) 标题前的 emoji
     text   (必填) 标题文字
     count  (可选) 右侧计数徽标(浅灰色,大写)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YrySubTitle] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-sub-title-tpl';
  var READY_EVENT = 'yry-sub-title-ready';
  var TAG_NAME    = 'yry-sub-title';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YrySubTitle] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YrySubTitle] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YrySubTitle',
      props: {
        icon:  { type: String, default: '' },
        text:  { type: String, required: true },
        count: { type: String, default: '' }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YrySubTitle' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YrySubTitle] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YrySubTitle = buildComponent(templateHTML);

      /* ── 注册为自定义元素(允许 <yry-sub-title> 标签直接使用) ────── */
      if (typeof window.Vue.defineCustomElement === 'function') {
        var YrySubTitleCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YrySubTitleCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YrySubTitle] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();
