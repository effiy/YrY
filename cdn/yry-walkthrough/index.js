/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryWalkthrough · Vue 3 逐步演示组件 (loader)

   props:
     steps: [{ title, time?, desc?, cmd?, copyCmd?, tags?, note?, result? }]

   tag class 自动映射: "P0 阻断" → t-p0, "P1 推荐" → t-p1, "P2 收尾" → t-p2
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryWalkthrough] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-walkthrough-tpl';
  var READY_EVENT = 'yry-walkthrough-ready';
  var TAG_NAME    = 'yry-walkthrough';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryWalkthrough] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryWalkthrough] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function tagClass(tag) {
    if (!tag) return '';
    if (/^P0/.test(tag)) return 't-p0';
    if (/^P1/.test(tag)) return 't-p1';
    if (/^P2/.test(tag)) return 't-p2';
    if (/^(新|入门|NEW)/i.test(tag)) return 't-new';
    return '';
  }

  function buildComponent(templateHTML) {
    return {
      name: 'YryWalkthrough',
      props: {
        steps: { type: Array, default: function () { return []; } }
      },
      methods: {
        tagClass: tagClass
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryWalkthrough' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryWalkthrough] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryWalkthrough = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryWalkthroughCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryWalkthroughCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryWalkthrough] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();
