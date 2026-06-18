/**
 * PanelHub — CDN 浮动面板管理器
 *
 * 与 docs/js/panel-hub.js 行为一致,但数据源路径全部指向 CDN 上下文:
 *   - 调度: ../.claude/scheduled_tasks.json (项目级)
 *   - 通知: ./releases.json (CDN 版本发布)
 *   - 自改进: ./cdn-trend.json (CDN 演进趋势)
 *   - FAQ: 静态 (faq-panel.js 内联)
 */
(function () {
  'use strict';

  var registry = {};

  /* ── CDN 数据源路径 (相对 cdn/index.html) ───────────────── */
  var PATHS = {
    scheduledTasks: '../.claude/scheduled_tasks.json',
    releases:       './releases.json',
    cdnTrend:       './cdn-trend.json',
    cdnSummary:     './cdn-summary.json',
    healthReports:  './health-report.json'
  };

  /* ── API ────────────────────────────────── */
  function register(name, panelId, overlayId, onOpen) {
    var panel = document.getElementById(panelId);
    var overlay = document.getElementById(overlayId);
    if (!panel || !overlay) return;

    registry[name] = {
      panel: panel,
      overlay: overlay,
      onOpen: onOpen || null
    };
    var r = registry[name];

    /* 遮罩点击关闭 */
    r.overlay.addEventListener('click', function () { close(name); });

    /* Esc 关闭 */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && r.panel.classList.contains('open')) close(name);
    });
  }

  function closeAllExcept(name) {
    Object.keys(registry).forEach(function (k) { if (k !== name) close(k); });
  }

  function open(name) {
    var r = registry[name];
    if (!r) return;
    closeAllExcept(name);
    r.panel.classList.add('open');
    r.overlay.classList.add('open');
    if (r.onOpen) r.onOpen();
  }

  function close(name) {
    var r = registry[name];
    if (!r) return;
    r.panel.classList.remove('open');
    r.overlay.classList.remove('open');
  }

  function toggle(name) {
    var r = registry[name];
    if (!r) return;
    if (r.panel.classList.contains('open')) close(name); else open(name);
  }

  function isOpen(name) {
    var r = registry[name];
    return r ? r.panel.classList.contains('open') : false;
  }

  /* ── 跨面板链接辅助 ──────────────────────── */
  function panelLink(name, label) {
    return '<a href="#" onclick="event.preventDefault();event.stopPropagation();PanelHub.open(\'' + name + '\')" style="color:inherit;text-decoration:underline;text-underline-offset:2px;text-decoration-color:rgba(255,255,255,.2)">' + label + '</a>';
  }

  /* ── 通用工具 ───────────────────────────── */
  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function relativeTime(dateStr) {
    if (!dateStr) return '';
    try {
      var d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      var now = new Date();
      var diffMin = Math.floor((now - d) / 60000);
      var diffHr  = Math.floor((now - d) / 3600000);
      var diffDay = Math.floor((now - d) / 86400000);
      if (diffMin < 1)  return '刚刚';
      if (diffMin < 60) return diffMin + '分钟前';
      if (diffHr < 24)  return diffHr + '小时前';
      if (diffDay === 1) return '昨天';
      if (diffDay < 7)  return diffDay + '天前';
      if (diffDay < 30) return diffDay + '天前';
      var months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
      return months[d.getMonth()] + d.getDate() + '日';
    } catch (e) { return dateStr; }
  }

  /* ── 暴露 ─────────────────────────────── */
  window.PanelHub = {
    register: register,
    open: open,
    close: close,
    toggle: toggle,
    isOpen: isOpen,
    closeAllExcept: closeAllExcept,
    panelLink: panelLink,
    escHtml: escHtml,
    relativeTime: relativeTime,
    PATHS: PATHS
  };

  window.openPanel = function (name) { PanelHub.open(name); };
})();
