/* ═══════════════════════════════════════════════════════════════════════════
   YrY Shared JS — 所有故事面板 HTML 页面的公共脚本
   适用: 审查 · 测试面板 · 演示 · 计划清单 · 架构图 · 知识图谱

   使用方式:
     <script src="../../../../cdn/shared.js"></script>
     然后调用: YrY.toast('消息') / YrY.copyCmd(btn, cmd) / YrY.switchPanel(name)

   对应场景文档:
     - docs/故事任务面板/yry-cdn/场景-1-cdn资源加载与页面渲染/
     - docs/故事任务面板/yry-cdn/场景-3-组件库与JS工具API/
     - docs/故事任务面板/yry-cdn/场景-4-存量页面迁移/
     - docs/故事任务面板/yry-cdn/场景-5-npm包发布与版本管理/
   ═══════════════════════════════════════════════════════════════════════════ */

const YrY = (function() {
  'use strict';

  /* ── Toast ────────────────────────────────────────────────────────────── */
  function toast(msg, duration) {
    duration = duration || 1800;
    var el = document.querySelector('.yry-toast');
    if (!el) { el = document.createElement('div'); el.className = 'yry-toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function() { el.classList.remove('show'); }, duration);
  }

  /* ── Copy command to clipboard ────────────────────────────────────────── */
  function copyCmd(btn, cmd) {
    var orig = btn.textContent;
    navigator.clipboard.writeText(cmd).then(function() {
      btn.textContent = '✅';
      btn.classList.add('done');
      setTimeout(function() { btn.textContent = orig; btn.classList.remove('done'); }, 1500);
    }).catch(function() { toast('复制失败'); });
  }

  /* ── Tab panel switching ──────────────────────────────────────────────── */
  function switchPanel(name, tabSelector, panelSelector) {
    tabSelector = tabSelector || '.yry-tab';
    panelSelector = panelSelector || '.yry-panel';
    document.querySelectorAll(tabSelector).forEach(function(t) {
      t.classList.toggle('on', t.dataset.panel === name);
    });
    document.querySelectorAll(panelSelector).forEach(function(p) {
      p.classList.toggle('on', p.id === 'panel' + name.charAt(0).toUpperCase() + name.slice(1));
    });
  }

  /* ── Suite / Collapsible toggle ───────────────────────────────────────── */
  function initSuiteToggle(containerSelector) {
    var container = document.querySelector(containerSelector || '.yry-container');
    if (!container) container = document;
    container.addEventListener('click', function(e) {
      var head = e.target.closest('.yry-suite-head');
      if (!head) return;
      head.closest('.yry-suite').classList.toggle('open');
    });
  }

  /* ── Expand / Collapse all suites ─────────────────────────────────────── */
  function expandAllSuites(scope) {
    (scope || document).querySelectorAll('.yry-suite').forEach(function(s) { s.classList.add('open'); });
  }
  function collapseAllSuites(scope) {
    (scope || document).querySelectorAll('.yry-suite').forEach(function(s) { s.classList.remove('open'); });
  }

  /* ── Format duration (ms → human readable) ────────────────────────────── */
  function fmtDur(ms) {
    if (ms == null) return '';
    if (ms < 1) return '<1ms';
    if (ms < 1000) return Math.round(ms) + 'ms';
    return (ms / 1000).toFixed(1) + 's';
  }

  /* ── HTML escape ──────────────────────────────────────────────────────── */
  function esc(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Clipboard write fallback ─────────────────────────────────────────── */
  function clipboardWrite(text, onSuccess, onFail) {
    navigator.clipboard.writeText(text).then(function() {
      if (onSuccess) onSuccess();
    }).catch(function() {
      if (onFail) onFail(); else toast('复制失败');
    });
  }

  /* ── Utils: Console-friendly utilities ────────────────────────────────── */
  var utils = {};

  /* DOM */
  utils.$  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  utils.$$ = function (sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); };

  /* Fetch */
  utils.fetchJSON = function (url, opts) {
    opts = opts || {};
    return fetch(url, opts).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  };

  /* Storage */
  utils.storage = {
    get: function (k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : (def !== undefined ? def : null); } catch (_) { return def !== undefined ? def : null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} },
    remove: function (k) { localStorage.removeItem(k); }
  };

  /* Async */
  utils.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  utils.debounce = function (fn, delay) {
    delay = delay || 300;
    var t;
    return function () { var a = arguments, ctx = this; clearTimeout(t); t = setTimeout(function () { fn.apply(ctx, a); }, delay); };
  };
  utils.throttle = function (fn, delay) {
    delay = delay || 300;
    var last = 0;
    return function () { var now = Date.now(); if (now - last >= delay) { last = now; fn.apply(this, arguments); } };
  };

  /* String */
  utils.truncate = function (s, n, suffix) { n = n || 100; suffix = suffix || '...'; s = String(s || ''); return s.length <= n ? s : s.slice(0, n - suffix.length) + suffix; };
  utils.generateId = function (prefix) { return (prefix || 'id') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8); };
  utils.uuid = function () { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : r & 0x3 | 0x8).toString(16); }); };
  utils.safeJsonParse = function (s, def) { try { return JSON.parse(s); } catch (_) { return def !== undefined ? def : null; } };

  /* Time */
  utils.formatDate = function (d, fmt) {
    d = d instanceof Date ? d : new Date(d);
    if (isNaN(d.getTime())) return '';
    fmt = fmt || 'YYYY-MM-DD HH:mm:ss';
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return fmt.replace('YYYY', d.getFullYear()).replace('MM', pad(d.getMonth() + 1)).replace('DD', pad(d.getDate())).replace('HH', pad(d.getHours())).replace('mm', pad(d.getMinutes())).replace('ss', pad(d.getSeconds()));
  };
  utils.timeAgo = function (d) {
    d = d instanceof Date ? d : new Date(d);
    var diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前';
    return Math.floor(diff / 86400) + ' 天前';
  };

  /* Array / Object */
  utils.unique = function (arr, key) {
    if (!Array.isArray(arr)) return [];
    if (key) { var seen = new Set(); return arr.filter(function (it) { var k = it[key]; if (seen.has(k)) return false; seen.add(k); return true; }); }
    return Array.from(new Set(arr));
  };
  utils.groupBy = function (arr, key) {
    if (!Array.isArray(arr)) return {};
    return arr.reduce(function (acc, it) { var k = typeof key === 'function' ? key(it) : it[key]; (acc[k] = acc[k] || []).push(it); return acc; }, {});
  };
  utils.chunk = function (arr, size) {
    size = size || 10;
    if (!Array.isArray(arr)) return [];
    var result = [];
    for (var i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
    return result;
  };
  utils.deepClone = function (obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (Array.isArray(obj)) return obj.map(utils.deepClone);
    var copy = {};
    for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) copy[k] = utils.deepClone(obj[k]); }
    return copy;
  };
  utils.pick = function (obj, keys) {
    if (!obj || !Array.isArray(keys)) return {};
    return keys.reduce(function (acc, k) { if (obj.hasOwnProperty(k)) acc[k] = obj[k]; return acc; }, {});
  };
  utils.omit = function (obj, keys) {
    if (!obj || !Array.isArray(keys)) return Object.assign({}, obj);
    var result = Object.assign({}, obj);
    keys.forEach(function (k) { delete result[k]; });
    return result;
  };
  utils.get = function (obj, path, def) {
    var keys = String(path || '').split(/[.[\]]/).filter(Boolean);
    var result = obj;
    for (var i = 0; i < keys.length; i++) { if (result == null) return def; result = result[keys[i]]; }
    return result === undefined ? def : result;
  };

  /* Browser */
  utils.copyToClipboard = function (text) {
    return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return false; });
  };
  utils.scrollToTop = function (smooth) { window.scrollTo({ top: 0, behavior: smooth !== false ? 'smooth' : 'auto' }); };
  utils.getSelectedText = function () { var s = window.getSelection(); return s ? s.toString() : ''; };

  /* ── Public API ───────────────────────────────────────────────────────── */
  return {
    toast: toast,
    copyCmd: copyCmd,
    switchPanel: switchPanel,
    initSuiteToggle: initSuiteToggle,
    expandAllSuites: expandAllSuites,
    collapseAllSuites: collapseAllSuites,
    fmtDur: fmtDur,
    esc: esc,
    clipboardWrite: clipboardWrite,
    utils: utils
  };
})();
