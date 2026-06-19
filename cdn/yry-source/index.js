/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — yry-source-page.js · 源码页面共享 JS 工具

   适用: 所有 源码.html 页面 (35+ 文件)
   依赖: cdn/shared.js (提供 YrY.toast, YrY.switchPanel, YrY.esc)

   消除 35 个源码页面中重复的 inline JS 函数。
   加载: <script src="../../../../cdn/yry-source-page.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var SP = window.YrYSourcePage = {};

  /* ── 格式化字节数 ──────────────────────────────────────────────────────── */
  SP.fmtSize = function(b) {
    if (!b || b === 0) return '—';
    if (b < 1024) return b + 'B';
    return (b / 1024).toFixed(1) + 'KB';
  };

  /* ── 复制文本 (含 HTML 实体还原) ───────────────────────────────────────── */
  SP.copyText = function(text) {
    text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        YrY.toast('✅ 已复制到剪贴板');
      }).catch(function() {
        SP.fallbackCopy(text);
      });
    } else {
      SP.fallbackCopy(text);
    }
  };

  /* ── 降级复制 (execCommand) ─────────────────────────────────────────────── */
  SP.fallbackCopy = function(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      YrY.toast('✅ 已复制到剪贴板');
    } catch (e) {
      YrY.toast('❌ 复制失败');
    }
    document.body.removeChild(ta);
  };

  /* ── 关闭模态框 ─────────────────────────────────────────────────────────── */
  SP.closeModal = function() {
    var overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
  };

  /* ── 新标签页打开源码 ───────────────────────────────────────────────────── */
  SP.openInNewTab = function(currentSourcePath) {
    if (!currentSourcePath) {
      YrY.toast('❌ 暂无可打开内容');
      return;
    }
    window.open(currentSourcePath, '_blank');
  };

})();
