/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneCard · Vue 3 场景卡片组件 (loader)
   适用: Layer 4 的 37 张场景卡片

   props 简表:
     num         (可选) 场景序号,如 '场景 1'
     name        (必填) 场景名
     nameHref    (可选) 场景名链接
     nameTarget  (可选) _blank 等
     desc        (可选) 场景描述
     meta        (可选) 7 个交付物链接 · 形如 [{ icon, label, href, target? }]
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YrySceneCard] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-scene-card-tpl';
  var READY_EVENT = 'yry-scene-card-ready';
  var TAG_NAME    = 'yry-scene-card';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YrySceneCard] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YrySceneCard] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YrySceneCard',
      props: {
        num:        { type: String, default: '' },
        name:       { type: String, required: true },
        nameHref:   { type: String, default: '' },
        nameTarget: { type: String, default: '' },
        desc:       { type: String, default: '' },
        meta:       { type: Array,  default: function () { return []; } }
      },
      computed: {
        deliveryLinks: function () {
          var DELIVERY_ICONS = [
            { icon: '📋', label: '清单' },
            { icon: '📐', label: '架构' },
            { icon: '🔗', label: '图谱' },
            { icon: '🧪', label: '测试' },
            { icon: '📄', label: '源码' },
            { icon: '💡', label: '演示' },
            { icon: '📝', label: '审查' }
          ];
          if (!this.meta || !this.meta.length) return DELIVERY_ICONS;
          var existing = {};
          this.meta.forEach(function (m) { existing[m.label] = m; });
          return DELIVERY_ICONS.map(function (d) {
            return existing[d.label] || { icon: d.icon, label: d.label };
          });
        }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YrySceneCard' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YrySceneCard] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YrySceneCard = buildComponent(templateHTML);

      /* ── 注册为自定义元素(允许 <yry-scene-card> 标签直接使用) ────── */
      if (typeof window.Vue.defineCustomElement === 'function') {
        var YrySceneCardCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YrySceneCardCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YrySceneCard] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();
