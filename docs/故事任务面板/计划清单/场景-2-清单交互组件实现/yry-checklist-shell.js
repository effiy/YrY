/* ═══════════════════════════════════════════════════════════════════════════
   YrY Checklist Shell JS — 引导启动 (fetch-and-inject)
   职责: DOMContentLoaded 后并行 fetch 42 个片段 → 累积注入 DOM → 初始化 Core · Deliv
   依赖: shared.js · yry-checklist-core.js · yry-checklist-deliv.js

   挂载: 无 (自动执行 IIFE)
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var FRAGMENTS = [
    // ── Checklist panel (9 partials → #panelChecklist) ──
    { file: 'partials/checklist-head.html',       id: 'panelChecklist' },
    { file: 'partials/phase-strip.html',           id: 'panelChecklist' },
    { file: 'partials/deliv-summary.html',         id: 'panelChecklist' },
    { file: 'partials/section-tech-review.html',   id: 'panelChecklist' },
    { file: 'partials/section-test-design.html',   id: 'panelChecklist' },
    { file: 'partials/section-impl-report.html',   id: 'panelChecklist' },
    { file: 'partials/section-test-report.html',   id: 'panelChecklist' },
    { file: 'partials/section-self-improve.html',  id: 'panelChecklist' },
    { file: 'partials/section-delivery.html',      id: 'panelChecklist' },

    // ── Commands panel (9 partials → #panelCommands) ──
    { file: 'partials/cmd-head.html',              id: 'panelCommands' },
    { file: 'partials/cmd-quickstart.html',        id: 'panelCommands' },
    { file: 'partials/cmd-section-s0.html',        id: 'panelCommands' },
    { file: 'partials/cmd-section-s1.html',        id: 'panelCommands' },
    { file: 'partials/cmd-section-s2.html',        id: 'panelCommands' },
    { file: 'partials/cmd-section-s3.html',        id: 'panelCommands' },
    { file: 'partials/cmd-section-s4.html',        id: 'panelCommands' },
    { file: 'partials/cmd-section-delivery.html',  id: 'panelCommands' },
    { file: 'partials/cmd-section-sR.html',        id: 'panelCommands' },

    // ── Standalone panels ──
    { file: 'panels/panel-related.html',           id: 'panelRelated' },
    { file: 'panels/panel-metrics.html',           id: 'panelMetrics' },
    { file: 'panels/panel-deliverables.html',      id: 'panelDeliverables' },

    // ── Verify panel (6 partials → #panelVerify) ──
    { file: 'partials/verify-head.html',           id: 'panelVerify' },
    { file: 'partials/verify-tc10.html',           id: 'panelVerify' },
    { file: 'partials/verify-tc11.html',           id: 'panelVerify' },
    { file: 'partials/verify-tc12-13.html',        id: 'panelVerify' },
    { file: 'partials/verify-tc14.html',           id: 'panelVerify' },
    { file: 'partials/verify-foot.html',           id: 'panelVerify' },

    // ── Risks panel (14 partials → #panelRisks) ──
    { file: 'partials/risk-head.html',             id: 'panelRisks' },
    { file: 'partials/risk-kpi.html',              id: 'panelRisks' },
    { file: 'partials/risk-matrix.html',           id: 'panelRisks' },
    { file: 'partials/risk-list-head.html',        id: 'panelRisks' },
    { file: 'partials/risk-row-01.html',           id: 'panelRisks' },
    { file: 'partials/risk-row-02.html',           id: 'panelRisks' },
    { file: 'partials/risk-row-03.html',           id: 'panelRisks' },
    { file: 'partials/risk-row-04.html',           id: 'panelRisks' },
    { file: 'partials/risk-row-05.html',           id: 'panelRisks' },
    { file: 'partials/risk-row-06.html',           id: 'panelRisks' },
    { file: 'partials/risk-row-07.html',           id: 'panelRisks' },
    { file: 'partials/risk-row-08.html',           id: 'panelRisks' },
    { file: 'partials/risk-list-foot.html',        id: 'panelRisks' },
    { file: 'partials/risk-category.html',         id: 'panelRisks' },
    { file: 'partials/risk-trend.html',            id: 'panelRisks' },

    // ── Standalone panel ──
    { file: 'panels/panel-timeline.html',          id: 'panelTimeline' }
  ];

  document.addEventListener('DOMContentLoaded', function() {
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
        if (panel) panel.innerHTML = accum[id];
      });
      if (window.YryChecklistCore) YryChecklistCore.init();
      if (window.YryChecklistDeliv) YryChecklistDeliv.init();
    });
  });
})();