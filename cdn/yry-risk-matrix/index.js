/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryRiskMatrix · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryRiskMatrix] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-risk-matrix-tpl';
  var READY_EVENT = 'yry-risk-matrix-ready';
  var TAG_NAME = 'yry-risk-matrix';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryRiskMatrix] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryRiskMatrix] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return name: 'YryRiskMatrix',
      props: {
        cells: { type: String, default: '[]' },
        colLabels: { type: String, default: '["极低 (1)","低 (2)","中 (3)","高 (4)","极高 (5)"]' },
        rowLabels: { type: String, default: '["极高 (5)","高 (4)","中 (3)","低 (2)","极低 (1)"]' },
        severityAxis: { type: String, default: '↑ 严重度' },
        likelihoodAxis: { type: String, default: '可能性 →' }
      },
      computed: {
        parsedColLabels: function () { try { return JSON.parse(this.colLabels); } catch (e) { return []; } },
        parsedRowLabels: function () { try { return JSON.parse(this.rowLabels); } catch (e) { return []; } },
        parsedCells: function () { try { return JSON.parse(this.cells); } catch (e) { return []; } }
      },
      methods: {
        cellObj: function (r, c) {
          var cells = this.parsedCells;
          return (cells[r] && cells[r][c]) ? cells[r][c] : {};
        },
        cellCls: function (r, c) {
          var cell = this.cellObj(r, c);
          if (cell.level) return 'r-' + cell.level;
          return 'l' + r;
        }
      },
      template: templateHTML;
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryRiskMatrix' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryRiskMatrix] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryRiskMatrix = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var ce = window.Vue.defineCustomElement(buildComponent(templateHTML), { shadowRoot: false });
        if (!customElements.get(TAG_NAME)) customElements.define(TAG_NAME, ce);
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryRiskMatrix] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();