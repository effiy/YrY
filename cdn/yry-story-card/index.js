/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryStoryCard · Vue 3 故事任务卡片组件 (loader)
   适用: Layer 3 的 7 张故事任务卡片

   props 简表:
     icon        (可选) 故事 icon emoji
     name        (必填) 故事名
     nameHref    (可选) 故事名链接
     nameTarget  (可选) _blank 等
     badge       (可选) 版本号徽标
     desc        (可选) 故事描述(支持 HTML,经 v-html 渲染)
     scenes      (可选) 场景 tag 文本数组
	     demo        (可选) 效果演示链接 URL
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryStoryCard] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-story-card-tpl';
  var READY_EVENT = 'yry-story-card-ready';
  var TAG_NAME    = 'yry-story-card';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryStoryCard] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryStoryCard] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryStoryCard',
      props: {
        icon:       { type: String, default: '' },
        name:       { type: String, required: true },
        nameHref:   { type: String, default: '' },
        nameTarget: { type: String, default: '' },
        badge:      { type: String, default: '' },
        desc:       { type: String, default: '' },
        scenes:     { type: Array,  default: function () { return []; } },
        demo:       { type: String, default: '' },
        links:      { type: Array,  default: function () { return []; } }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryStoryCard' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryStoryCard] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryStoryCard = buildComponent(templateHTML);

      /* ── 注册为自定义元素(允许 <yry-story-card> 标签直接使用) ────── */
      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryStoryCardCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryStoryCardCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryStoryCard] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();
