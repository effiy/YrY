/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryScorecard · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryScorecard] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-scorecard-tpl';
  var READY_EVENT = 'yry-scorecard-ready';
  var TAG_NAME = 'yry-scorecard';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryScorecard] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryScorecard] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return name: 'YryScorecard',
      props: { columns: { type: String, default: '[]' }, rows: { type: String, default: '[]' }, total: { type: String, default: '[]' } },
      computed: {
        parsedColumns: function () { try { return JSON.parse(this.columns); } catch (e) { return []; } },
        parsedRows: function () { try { return JSON.parse(this.rows); } catch (e) { return []; } },
        parsedTotal: function () { try { return JSON.parse(this.total); } catch (e) { return []; } }
      },
      methods: {
        cellClass: function (c) {
          if (c && typeof c === 'object' && c.status) return c.status;
          if (typeof c === 'boolean') return c ? 'pass' : 'fail';
          return '';
        },
        cellText: function (c) {
          if (c === null || c === undefined) return '';
          if (typeof c === 'object') return c.text !== undefined ? c.text : '';
          if (typeof c === 'boolean') return c ? '✓' : '✗';
          return String(c);
        }
      },
      template: templateHTML;
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryScorecard' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryScorecard] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      if (!tpl) throw new Error('未找到模板 ' + TEMPLATE_ID);

      var templateHTML = tpl.innerHTML;
      window.YryScorecard = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var ce = window.Vue.defineCustomElement(buildComponent(templateHTML), { shadowRoot: false });
        if (!customElements.get(TAG_NAME)) customElements.define(TAG_NAME, ce);
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryScorecard] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();