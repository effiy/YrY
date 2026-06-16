/* ═══════════════════════════════════════════════════════════════════════════
   YrY Checklist Core JS — 清单核心交互 (勾选·进度·标签页·风险行·复制)
   适用: 场景-2-清单交互组件实现/计划清单.html
   依赖: shared.js (需先加载，提供 YrY.toast 等公共方法)

   挂载: window.YryChecklistCore
   导出: init() · switchPanel() · updateProgress() · toggleRisk() · copyCmd() · copyPath()
   ═══════════════════════════════════════════════════════════════════════════ */

window.YryChecklistCore = (function() {
  'use strict';

  var SCENE_KEY = 'yry-arch-s2-checklist';

  /* ── Tab Switching ────────────────────────────────────────────────────── */
  function switchPanel(name) {
    document.querySelectorAll('.tab').forEach(function(t) {
      t.classList.toggle('on', t.dataset.panel === name);
    });
    document.querySelectorAll('.panel').forEach(function(p) {
      p.classList.toggle('on', p.id === 'panel' + name.charAt(0).toUpperCase() + name.slice(1));
    });
    try { localStorage.setItem(SCENE_KEY + '-tab', name); } catch(e) {}
  }

  /* ── Progress Update ──────────────────────────────────────────────────── */
  function updateProgress() {
    var checks = document.querySelectorAll('.step-checkbox');
    var done = 0;
    checks.forEach(function(c) { if (c.checked) done++; });
    var total = checks.length;
    var pct = Math.round((done / total) * 100);
    var fill = document.getElementById('progress-fill');
    var text = document.getElementById('progress-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = done + ' / ' + total + ' 完成';

    var allChecks = Array.from(checks);
    checks.forEach(function(cb) {
      var status = cb.closest('.step').querySelector('.step-status');
      if (cb.checked) {
        status.textContent = '✅ 完成'; status.className = 'step-status status-done';
      } else {
        var idx = allChecks.indexOf(cb);
        var prevDone = idx === 0 || allChecks[idx - 1].checked;
        status.textContent = prevDone ? '🔶 就绪' : '⏳ 待开始';
        status.className = prevDone ? 'step-status status-active' : 'step-status status-pending';
      }
    });

    // Update overview tab stats
    var pending = total - done;
    var ready = 0;
    allChecks.forEach(function(c, i) {
      if (!c.checked && (i === 0 || allChecks[i - 1].checked)) ready++;
    });
    var ovDone = document.getElementById('ov-done');
    var ovReady = document.getElementById('ov-ready');
    var ovPending = document.getElementById('ov-pending');
    if (ovDone) ovDone.textContent = done;
    if (ovReady) ovReady.textContent = ready;
    if (ovPending) ovPending.textContent = pending - ready;

    // Persist
    var state = {};
    allChecks.forEach(function(cb, i) { state['step-' + (i + 1)] = cb.checked; });
    try { localStorage.setItem(SCENE_KEY, JSON.stringify(state)); } catch(e) {}
  }

  /* ── Copy Command ─────────────────────────────────────────────────────── */
  function copyCmd(btn, cmd) {
    navigator.clipboard.writeText(cmd).then(function() {
      btn.textContent = '✅'; btn.style.opacity = '1';
      setTimeout(function() { btn.textContent = '📋'; btn.style.opacity = ''; }, 1500);
    }).catch(function() { toast('复制失败'); });
  }

  /* ── Copy Path ────────────────────────────────────────────────────────── */
  function copyPath(path, el) {
    var orig = el ? el.textContent : '';
    var onSuccess = function() {
      if (el) { el.textContent = '✅ 已复制'; el.style.color = '#10b981'; }
      toast('📋 已复制路径: ' + path);
      if (el) { setTimeout(function() { el.textContent = orig; el.style.color = ''; }, 1500); }
    };
    navigator.clipboard.writeText(path).then(onSuccess).catch(function() {
      // Fallback for older browsers
      var ta = document.createElement('textarea');
      ta.value = path; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
      onSuccess();
    });
  }

  /* ── Toggle Risk Row ──────────────────────────────────────────────────── */
  function toggleRisk(row) {
    row.classList.toggle('open');
    var tog = row.querySelector('.rr-toggle');
    if (tog) tog.textContent = row.classList.contains('open') ? '▲' : '▼';
  }

  /* ── Toast ────────────────────────────────────────────────────────────── */
  function toast(msg) {
    if (window.YrY && window.YrY.toast) { window.YrY.toast(msg); return; }
    var el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function() { el.classList.remove('show'); }, 1800);
  }

  /* ── Init ─────────────────────────────────────────────────────────────── */
  function init() {
    // Bind tab clicks
    var tabs = document.querySelector('.tabs');
    if (tabs) {
      tabs.addEventListener('click', function(e) {
        var tab = e.target.closest('.tab');
        if (!tab) return;
        switchPanel(tab.dataset.panel);
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      var m = {'1':'checklist','2':'overview','3':'commands','4':'related','5':'verify','6':'metrics','7':'deliverables','8':'risks','9':'timeline'};
      if (m[e.key]) { e.preventDefault(); switchPanel(m[e.key]); }
    });

    // Bind checkboxes
    document.addEventListener('change', function(e) {
      if (e.target.classList.contains('step-checkbox')) updateProgress();
    });

    // Bind risk row clicks
    document.addEventListener('click', function(e) {
      var row = e.target.closest('.risk-row');
      if (row) toggleRisk(row);
    });

    // Restore saved state
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(SCENE_KEY) || '{}'); } catch(e) {}
    document.querySelectorAll('.step-checkbox').forEach(function(cb, i) {
      if (saved['step-' + (i + 1)]) cb.checked = true;
    });
    updateProgress();

    // Restore last active tab
    var activeTab = 'checklist';
    try { activeTab = localStorage.getItem(SCENE_KEY + '-tab') || 'checklist'; } catch(e) {}
    switchPanel(activeTab);
  }

  /* ── Public API ───────────────────────────────────────────────────────── */
  var api = {
    init: init,
    switchPanel: switchPanel,
    updateProgress: updateProgress,
    toggleRisk: toggleRisk,
    copyCmd: copyCmd,
    copyPath: copyPath
  };

  // Expose for inline onclick/onchange handlers that reference bare names
  window.updateProgress = updateProgress;
  window.toggleRisk = toggleRisk;
  window.copyCmd = copyCmd;
  window.copyPath = copyPath;
  window.switchPanel = switchPanel;

  return api;
})();