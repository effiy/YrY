/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN · CDN 资源加载性能监测

   检测 shared/index.css / theme/index.css / shared.js 的加载耗时并更新 Live Bar 徽章
   依赖: DOM 中需存在 #lrCss, #lrTheme, #lrJs, #statTiming 元素
   用法: <script src="../yry-cdn-detect/index.js"></script> (自动执行)
   ═══════════════════════════════════════════════════════════════════════════ */

(function detectCDN() {
  var resources = performance.getEntriesByType('resource');
  var cdnEntries = resources.filter(function (r) { return r.name.indexOf('/cdn/') !== -1; });
  var found = { css: false, theme: false, js: false };
  var totalDuration = 0;
  cdnEntries.forEach(function (r) {
    var name = r.name.split('/').pop().split('?')[0];
    if (name === 'shared/index.css') found.css = r;
    if (name === 'theme/index.css') found.theme = r;
    if (name === 'shared.js') found.js = r;
    totalDuration += r.duration;
  });
  function updateBadge(elId, entry) {
    var el = document.getElementById(elId);
    if (entry) {
      el.textContent = '✓ ' + Math.round(entry.duration) + 'ms';
      el.style.color = 'var(--pass)';
    } else {
      el.textContent = '—';
      el.style.color = 'var(--text3)';
    }
  }
  updateBadge('lrCss', found.css);
  updateBadge('lrTheme', found.theme);
  updateBadge('lrJs', found.js);
  var timingEl = document.getElementById('statTiming');
  if (cdnEntries.length >= 3) {
    timingEl.textContent = Math.round(totalDuration) + 'ms';
    timingEl.style.color = totalDuration < 100 ? 'var(--pass)' : 'var(--accent)';
  } else if (cdnEntries.length > 0) {
    timingEl.textContent = Math.round(totalDuration) + 'ms';
    timingEl.style.color = 'var(--cyan)';
  } else {
    timingEl.textContent = '已缓存';
    timingEl.style.color = 'var(--text3)';
  }
})();
