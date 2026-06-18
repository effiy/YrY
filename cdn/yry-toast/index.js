/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryToast · 消息提示 脚本
   零依赖 vanilla JS — 全局 Toast 通知系统

   API:
     YryToast.show(message, type?, duration?)
     YryToast.success(message, duration?)
     YryToast.error(message, duration?)
     YryToast.warn(message, duration?)
     YryToast.info(message, duration?)

   type: 'default' | 'success' | 'error' | 'warn' | 'info'
   duration: 毫秒 (默认 3500)

   容器: 自动查找或创建 #yry-toast-container
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var DEFAULT_DURATION = 3500;
  var MAX_TOASTS = 5;

  function getContainer() {
    var el = document.getElementById('yry-toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'yry-toast-container';
      document.body.appendChild(el);
    }
    return el;
  }

  function show(message, type, duration) {
    type = type || 'default';
    duration = typeof duration === 'number' ? duration : DEFAULT_DURATION;

    var container = getContainer();

    // Limit max toasts
    var existing = container.querySelectorAll('.yry-toast');
    while (existing.length >= MAX_TOASTS) {
      var oldest = existing[existing.length - 1];
      removeToast(oldest);
      existing = container.querySelectorAll('.yry-toast');
    }

    // Create toast
    var toast = document.createElement('div');
    toast.className = 'yry-toast ' + type;
    toast.textContent = message;

    // Dismiss button
    var dismiss = document.createElement('span');
    dismiss.className = 'toast-dismiss';
    dismiss.textContent = '×';
    dismiss.setAttribute('aria-label', '关闭');
    toast.appendChild(dismiss);

    // Click to dismiss
    toast.addEventListener('click', function () {
      removeToast(toast);
    });

    container.appendChild(toast);

    // Auto-dismiss
    var timer = setTimeout(function () {
      removeToast(toast);
    }, duration);

    toast._timer = timer;
  }

  function removeToast(toast) {
    if (toast._removing) return;
    toast._removing = true;
    if (toast._timer) clearTimeout(toast._timer);
    toast.classList.add('removing');
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }

  // Convenience methods
  function success(msg, dur) { show(msg, 'success', dur); }
  function error(msg, dur)   { show(msg, 'error', dur); }
  function warn(msg, dur)    { show(msg, 'warn', dur); }
  function info(msg, dur)    { show(msg, 'info', dur); }

  window.YryToast = {
    show: show,
    success: success,
    error: error,
    warn: warn,
    info: info
  };
})();
