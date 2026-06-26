/* ═══════════════════════════════════════════════════════════════════════════
   YrY Checklist Shell JS — 引导启动 (fetch-and-inject)
   职责: DOMContentLoaded 后并行 fetch 42 个片段 → 累积注入 DOM → 初始化 Core · Deliv
   依赖: shared.js · yry-checklist-core.js · yry-checklist-deliv.js

   挂载: 无 (自动执行 IIFE)
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var _script = document.currentScript;
  var _dataUrl = _script && _script.src ? _script.src.replace(/yry-checklist-shell\.js(\?[^]*)?$/, 'yry-checklist-shell.json') : './yry-checklist-shell.json';
  var _dataCache = null;
  var _dataPromise = fetch(_dataUrl).then(function(r) { return r.json(); }).then(function(d) { _dataCache = d; }).catch(function(err) { console.error('[YryChecklistShell] data.json load failed:', err); });

  var FRAGMENTS = [];

  function init() {
    var accum = {};
    FRAGMENTS.forEach(function(f) { accum[f.id] = ''; });

    var fetches = FRAGMENTS.map(function(f) {
      return fetch(f.file)
        .then(function(r) {
          if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + f.file);
          return r.text();
        })
        .then(function(html) {
          accum[f.id] += html;
        })
        .catch(function(err) {
          console.error('YryChecklist: failed to load %s: %s', f.file, err.message);
          accum[f.id] += '<div style="padding:20px;text-align:center;color:var(--text3)">'
            + '— 面板加载失败: ' + f.file + ' —</div>';
        });
    });

    Promise.all(fetches).finally(function() {
      Object.keys(accum).forEach(function(id) {
        var panel = document.getElementById(id);
        if (panel) {
	          panel.textContent = '';
	          panel.insertAdjacentHTML('beforeend', accum[id]);
	        }
      });
      if (window.YryChecklistCore) YryChecklistCore.init();
      if (window.YryChecklistDeliv) YryChecklistDeliv.init();
    });
  }

  _dataPromise.then(function() {
    if (_dataCache) FRAGMENTS = _dataCache.FRAGMENTS || [];
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  });
})();
