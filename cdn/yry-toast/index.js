/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryToast · Vue 3 Toast 通知组件 (loader + 全局服务)

   适用: 页面级消息通知 · 复制成功反馈 · 操作提示

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-toast-tpl"> 内容
     3) 懒加载挂载: 首次调用 YryToast.show 时才创建 Vue 应用 (省初始开销)
     4) 暴露全局 window.YryToast 简易 API (show/success/error/warn/info/dismiss)
     5) 派发 'yry-toast-ready' 事件,通知页面挂载完成

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-toast/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-toast/index.js"></script>
     <script>
       YryToast.success('已复制', '链接已复制');
       YryToast.show('自定义消息', 'info', '提示', 5000);
     </script>

   模板源: <script type="text/x-template" id="yry-toast-tpl"> in index.html
   容器:   自动创建 <div id="yry-toast-host"> 注入到 body 末尾
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var DEFAULT_DURATION = 3500;
  var MAX_TOASTS = 5;
  var TEMPLATE_ID = 'yry-toast-tpl';
  var HOST_ID = 'yry-toast-host';
  var LOAD_TIMEOUT_MS = 5000;

  /* ── 类型 → 图标 ───────────────────────────────────────────────── */
  var ICONS = {
    default: 'ℹ',
    success: '✓',
    warn: '⚠',
    warning: '⚠',
    error: '✕',
    info: 'ℹ'
  };

  /* ── 类型别名归一化 ─────────────────────────────────────────── */
  function normalizeType(type) {
    type = String(type || 'default');
    if (type === 'warning') return 'warn';
    if (ICONS[type] === undefined) return 'default';
    return type;
  }

  /* ── 单例状态 ───────────────────────────────────────────────── */
  var _app = null;          // Vue app instance (singleton)
  var _nextId = 1;          // toast id 自增
  var _pending = [];        // 模板未加载时缓存的 toast
  var _readyFired = false;

  function getScriptUrl() {
    var s = document.currentScript;
    if (!s || !s.src) return null;
    try { return new URL(s.getAttribute('src'), window.location.href); }
    catch (e) { return null; }
  }

  function getTemplateUrl() {
    var u = getScriptUrl();
    if (!u) return null;
    return new URL('index.html', u).href;
  }

  function fetchTemplate() {
    var url = getTemplateUrl();
    if (!url) return Promise.reject(new Error('无法确定模板 URL'));

    return new Promise(function (resolve, reject) {
      var timedOut = false;
      var tid = setTimeout(function () {
        timedOut = true;
        reject(new Error('模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms): ' + url));
      }, LOAD_TIMEOUT_MS);

      fetch(url, { credentials: 'same-origin' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + r.statusText);
          return r.text();
        })
        .then(function (htmlText) {
          if (timedOut) return;
          clearTimeout(tid);
          var doc = new DOMParser().parseFromString(htmlText, 'text/html');
          var tpl = doc.getElementById(TEMPLATE_ID);
          if (!tpl) throw new Error('未找到 <script type="text/x-template" id="' + TEMPLATE_ID + '">');
          resolve(tpl.innerHTML);
        })
        .catch(function (err) {
          if (timedOut) return;
          clearTimeout(tid);
          reject(err);
        });
    });
  }

  /* ── 懒挂载 Vue 应用 ─────────────────────────────────────────── */
  function mountApp(templateHTML) {
    if (_app) return _app;
    if (!window.Vue) {
      throw new Error('Vue 3 未加载,请先引入 vue.global.prod.js');
    }

    var host = document.getElementById(HOST_ID);
    if (!host) {
      host = document.createElement('div');
      host.id = HOST_ID;
      document.body.appendChild(host);
    }

    var app = window.Vue.createApp({
      template: templateHTML,
      data: function () { return { items: [], icons: ICONS }; },
      methods: {
        dismiss: function (id) {
          this.items = this.items.filter(function (it) { return it.id !== id; });
        }
      }
    });

    _app = app.mount(host);

    /* 派发 ready 事件 (供需要在挂载后做事的页面监听) */
    if (!_readyFired) {
      _readyFired = true;
      document.dispatchEvent(new CustomEvent('yry-toast-ready', {
        detail: { component: 'YryToast' }
      }));
    }

    /* 排空挂载前缓存的 toast */
    var queue = _pending;
    _pending = [];
    queue.forEach(function (item) { _pushItem(item); });

    return _app;
  }

  /* ── 推入 toast 到列表 (限长 + 自动消失) ────────────────────── */
  function _pushItem(item) {
    if (!_app) return;
    var data = _app;
    var items = data.items;

    /* 上限保护: 超出则丢弃最旧的 */
    while (items.length >= MAX_TOASTS) {
      items.shift();
    }
    items.push(item);

    /* 自动消失 */
    if (item.duration > 0) {
      setTimeout(function () {
        if (data && typeof data.dismiss === 'function') {
          data.dismiss(item.id);
        }
      }, item.duration);
    }
  }

  /* ── 公开 API: show(text, type?, title?, duration?) ─────────── */
  function show(text, type, title, duration) {
    var t = normalizeType(type);
    var d = typeof duration === 'number' ? duration : DEFAULT_DURATION;
    var item = {
      id: _nextId++,
      type: t,
      text: String(text == null ? '' : text),
      title: title ? String(title) : '',
      duration: d
    };

    if (_app) {
      _pushItem(item);
      return item;
    }

    /* 模板未加载: 缓存后异步挂载,挂载成功再入队 */
    _pending.push(item);
    fetchTemplate()
      .then(mountApp)
      .catch(function (err) {
        console.error('[YryToast] 模板加载失败:', err);
        _pending = [];
      });
    return item;
  }

  function success(text, title, duration) { return show(text, 'success', title, duration); }
  function error(text, title, duration)   { return show(text, 'error', title, duration); }
  function warn(text, title, duration)    { return show(text, 'warn', title, duration); }
  function info(text, title, duration)    { return show(text, 'info', title, duration); }

  function dismiss(id) {
    if (!_app) return;
    if (id == null) {
      _app.items = [];
    } else {
      _app.dismiss(id);
    }
  }

  /* ── 暴露全局 ───────────────────────────────────────────────── */
  window.YryToast = {
    show: show,
    success: success,
    error: error,
    warn: warn,
    info: info,
    dismiss: dismiss
  };
})();
