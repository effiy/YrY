/* YrY Shared — 全局工具 API + 健康报告 tab 兼容
 * 文档规约见 cdn/shared/README.md (12 个 YrY.* API)
 * 同时保留旧版 .h-tab / .h-panel 兼容初始化(健康报告页沿用)
 */
(function () {
  'use strict';

  /* ── 内部工具 ───────────────────────────────────────── */

  function esc(str) {
    return str == null ? '' : String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fmtDur(ms) {
    if (ms == null || isNaN(ms)) return '—';
    if (ms < 1000) return ms + 'ms';
    var s = ms / 1000;
    if (s < 60) return s.toFixed(1) + 's';
    var m = Math.floor(s / 60);
    var rs = Math.floor(s % 60);
    if (m < 60) return m + 'm' + rs + 's';
    var h = Math.floor(m / 60);
    return h + 'h' + (m % 60) + 'm';
  }

  function clipboardWrite(text, ok, fail) {
    var done = function (v) { if (ok) ok(v); };
    var nope = function (e) { if (fail) fail(e); else console.warn('[YrY.clipboardWrite]', e); };
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext !== false) {
      navigator.clipboard.writeText(text).then(done, function () {
        // fallback: textarea + execCommand
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(true); }
        catch (e) { nope(e); }
        finally { document.body.removeChild(ta); }
      });
      return true;
    }
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(true); }
    catch (e) { nope(e); return false; }
    finally { document.body.removeChild(ta); }
    return true;
  }

  function toast(msg, dur) {
    var d = dur == null ? 2200 : dur;
    var host = document.getElementById('yry-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'yry-toast-host';
      host.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none';
      document.body.appendChild(host);
    }
    var el = document.createElement('div');
    el.className = 'yry-toast';
    el.textContent = msg;
    el.style.cssText = 'background:rgba(15,23,42,.92);color:#e5e7eb;border:1px solid rgba(34,211,238,.4);border-radius:8px;padding:8px 14px;font-size:.82rem;box-shadow:0 4px 16px rgba(0,0,0,.4);opacity:0;transition:opacity .2s';
    host.appendChild(el);
    requestAnimationFrame(function () { el.style.opacity = '1'; });
    setTimeout(function () {
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 220);
    }, d);
  }

  function copyCmd(el, cmd) {
    clipboardWrite(cmd, function () { toast('已复制命令'); }, function () { toast('复制失败'); });
  }

  /* ── Tab 面板:支持 .yry-tab/.yry-panel 与旧版 .h-tab/.h-panel ── */
  /* 规约:data-panel="name" 对应 id="panelName"(前置 'panel',首字母大写) */

  function panelIdFor(dataPanel) {
    if (!dataPanel) return '';
    // 已显式以 "panel" 开头则直接使用(允许自定义命名)
    if (dataPanel.toLowerCase().startsWith('panel')) return dataPanel;
    return 'panel' + dataPanel.charAt(0).toUpperCase() + dataPanel.slice(1);
  }

  function initTabs(container) {
    var root = container ? (typeof container === 'string' ? document.querySelector(container) : container) : document;
    if (!root) return;
    var tabSel = '.yry-tab, .h-tab';
    var panelSel = '.yry-panel, .h-panel';
    var tabs = root.querySelectorAll(tabSel);
    var panels = document.querySelectorAll(panelSel);
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      if (tab.dataset.yryBound === '1') return;
      tab.dataset.yryBound = '1';
      tab.addEventListener('click', function (ev) {
        // 尊重自定义 data-no-switch 标记
        if (tab.dataset.noSwitch !== undefined) return;
        var target = tab.getAttribute('data-panel');
        if (!target) return;
        tabs.forEach(function (t) { t.classList.remove('on'); });
        panels.forEach(function (p) { p.classList.remove('on'); });
        tab.classList.add('on');
        // 优先按原始 id 查找,否则按规约补全 panelId
        var panel = document.getElementById(target) || document.getElementById(panelIdFor(target));
        if (panel) panel.classList.add('on');
        // 派发事件,供其他模块响应
        document.dispatchEvent(new CustomEvent('yry-tab-change', { detail: { tab: tab, panelId: target } }));
      });
    });
  }

  function switchPanel(name, tab, panel) {
    var tabEl = tab ? document.querySelector(tab) : document.querySelector('[data-panel="' + name + '"]');
    var panelEl = panel ? document.querySelector(panel) : (document.getElementById(name) || document.getElementById(panelIdFor(name)));
    if (!tabEl || !panelEl) return false;
    var tabs = document.querySelectorAll('.yry-tab, .h-tab');
    var panels = document.querySelectorAll('.yry-panel, .h-panel');
    tabs.forEach(function (t) { t.classList.remove('on'); });
    panels.forEach(function (p) { p.classList.remove('on'); });
    tabEl.classList.add('on');
    panelEl.classList.add('on');
    return true;
  }

  /* ── 折叠套件 ───────────────────────────────────────── */

  function initSuiteToggle(scope) {
    var root = scope || document;
    root.querySelectorAll('.suite-header, [data-suite-toggle]').forEach(function (h) {
      if (h.dataset.yryBound === '1') return;
      h.dataset.yryBound = '1';
      h.style.cursor = 'pointer';
      h.addEventListener('click', function () {
        var body = h.nextElementSibling;
        if (body && (body.classList.contains('suite-body') || body.hasAttribute('data-suite-body'))) {
          body.classList.toggle('open');
        }
      });
    });
  }

  function expandAllSuites(scope) {
    var root = scope || document;
    root.querySelectorAll('.suite-body, [data-suite-body]').forEach(function (b) { b.classList.add('open'); });
  }

  function collapseAllSuites(scope) {
    var root = scope || document;
    root.querySelectorAll('.suite-body, [data-suite-body]').forEach(function (b) { b.classList.remove('open'); });
  }

  /* ── 代码块点击复制 / 步骤条切换 ──────────────────────── */

  function initCodeCopy(scope) {
    var root = scope || document;
    root.querySelectorAll('pre').forEach(function (pre) {
      if (pre.dataset.yryBound === '1') return;
      pre.dataset.yryBound = '1';
      pre.style.cursor = 'copy';
      pre.title = '点击复制';
      pre.addEventListener('click', function () {
        clipboardWrite(pre.innerText, function () { toast('已复制'); });
      });
    });
  }

  function initStepToggle(scope) {
    var root = scope || document;
    root.querySelectorAll('.step-header').forEach(function (h) {
      if (h.dataset.yryBound === '1') return;
      h.dataset.yryBound = '1';
      h.style.cursor = 'pointer';
      h.addEventListener('click', function () {
        var body = h.nextElementSibling;
        if (body && body.classList.contains('step-body')) body.classList.toggle('open');
      });
    });
  }

  /* ── 旧版健康报告 details 兼容(原本 IIFE 已包含,合并保留) ── */

  function initDetails() {
    document.querySelectorAll('details.h-rs-trace-details').forEach(function (d) {
      d.addEventListener('toggle', function () { /* placeholder */ });
    });
  }

  /* ── 暴露 window.YrY ─────────────────────────────────── */

  window.YrY = {
    toast: toast,
    copyCmd: copyCmd,
    clipboardWrite: clipboardWrite,
    switchPanel: switchPanel,
    initTabs: initTabs,
    initSuiteToggle: initSuiteToggle,
    expandAllSuites: expandAllSuites,
    collapseAllSuites: collapseAllSuites,
    initCodeCopy: initCodeCopy,
    initStepToggle: initStepToggle,
    fmtDur: fmtDur,
    esc: esc
  };

  /* ── 自动初始化(行为与原脚本一致) ────────────────────── */

  function autoInit() {
    initTabs();
    initStepToggle();
    initSuiteToggle();
    initCodeCopy();
    initDetails();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})();
