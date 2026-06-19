/* ═══════════════════════════════════════════════════════════════════════════
   YrY Checklist Deliv JS — 交付物增强交互 (类型标注·过滤·折叠·复制·哈希)
   适用: 场景-2-清单交互组件实现/计划清单.html
   依赖: shared.js (需先加载)

   挂载: window.YryChecklistDeliv
   导出: init() · autoAnnotate() · initFilter() · initCopyAll() · handleHashNav()
   ═══════════════════════════════════════════════════════════════════════════ */

window.YryChecklistDeliv = (function() {
  'use strict';

  var TYPE_MAP = { '.html': 'html', '.htm': 'html', '.md': 'md', '.markdown': 'md', '.css': 'css', '.mjs': 'test', '.js': 'test', '.json': 'data' };

  /* ── Copy text utility ────────────────────────────────────────────────── */
  function copyText(text, el) {
    var old = el.textContent;
    var restore = function() { el.textContent = old; el.classList.remove('done'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        el.textContent = '✅ 已复制';
        el.classList.add('done');
        setTimeout(restore, 1500);
      }).catch(function() { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); el.textContent = '✅ 已复制'; el.classList.add('done'); setTimeout(restore, 1500); }
      catch(e) { el.textContent = '❌ 失败'; setTimeout(restore, 1500); }
      document.body.removeChild(ta);
    }
  }

  /* ── Auto-annotate deliverable links with data-type ────────────────────── */
  function autoAnnotate() {
    var blocks = document.querySelectorAll('.step-deliv');
    if (!blocks.length) return {};

    var counts = { html: 0, md: 0, css: 0, test: 0, other: 0, all: 0 };

    blocks.forEach(function(blk, idx) {
      var stepEl = blk.closest('.step');
      var numEl = stepEl && stepEl.querySelector('.step-num');
      var num = numEl ? numEl.textContent.trim() : (idx + 1);
      blk.id = 'step-' + num + '-deliv';
      blk.setAttribute('data-step', num);

      blk.querySelectorAll('.deliv-link').forEach(function(a) {
        var href = (a.getAttribute('href') || '').toLowerCase();
        var type = 'other';
        for (var ext in TYPE_MAP) {
          if (href.endsWith(ext) || href.includes(ext + '#') || href.includes(ext + '?')) {
            type = TYPE_MAP[ext]; break;
          }
        }
        a.setAttribute('data-type', type);
        counts[type] = (counts[type] || 0) + 1;
        counts.all++;
      });
    });

    // Add copy button + collapse toggle per step
    blocks.forEach(function(blk) {
      var head = blk.querySelector('.step-deliv-head');
      if (!head) return;
      head.addEventListener('click', function(e) {
        if (e.target.closest('.sd-copy')) return;
        blk.classList.toggle('collapsed');
      });
      var countSpan = head.querySelector('.sd-count');
      if (countSpan && !head.querySelector('.sd-copy')) {
        var copy = document.createElement('span');
        copy.className = 'sd-copy';
        copy.textContent = '📋 复制路径';
        copy.title = '复制本步全部交付物路径';
        copy.addEventListener('click', function(e) {
          e.stopPropagation();
          var paths = Array.from(blk.querySelectorAll('.deliv-link')).map(function(a) { return a.getAttribute('href'); }).join('\n');
          copyText(paths, copy);
        });
        countSpan.insertAdjacentElement('afterend', copy);
      }
    });

    return counts;
  }

  /* ── Update summary stats in DOM ──────────────────────────────────────── */
  function updateStats(counts) {
    function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
    setText('ds-total', counts.all);
    setText('ds-pass', counts.all);
    setText('ds-fail', 0);
    setText('ds-html', counts.html);
    setText('ds-other', (counts.other || 0) + (counts.md || 0) + (counts.css || 0) + (counts.test || 0));
    setText('dfc-all', counts.all);
    setText('dfc-html', counts.html);
    setText('dfc-md', counts.md);
    setText('dfc-css', counts.css);
    setText('dfc-test', counts.test);
    setText('dfc-other', counts.other);
  }

  /* ── Init type filter buttons ─────────────────────────────────────────── */
  function initFilter() {
    var blocks = document.querySelectorAll('.step-deliv');
    var filterBtns = document.querySelectorAll('.df-btn');
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('on'); });
        btn.classList.add('on');
        var f = btn.getAttribute('data-filter');
        blocks.forEach(function(blk) {
          var links = blk.querySelectorAll('.deliv-link');
          var visible = 0;
          links.forEach(function(a) {
            var t = a.getAttribute('data-type');
            var show = (f === 'all') || (f === 'other' ? (t === 'other' || t === 'md' || t === 'css' || t === 'test') : t === f);
            a.classList.toggle('dim', !show);
            if (show) visible++;
          });
          var list = blk.querySelector('.step-deliv-list');
          if (list) {
            if (visible === 0 && f !== 'all') {
              if (!list.querySelector('.empty-msg')) {
                var empty = document.createElement('div');
                empty.className = 'empty-msg';
                empty.style.cssText = 'padding:10px;text-align:center;color:var(--text3);font-size:.7rem;';
                empty.textContent = '— 本步无该类型交付物 —';
                list.appendChild(empty);
              }
              list.classList.add('empty');
            } else {
              list.classList.remove('empty');
              var emptyMsg = list.querySelector('.empty-msg');
              if (emptyMsg) emptyMsg.remove();
            }
          }
        });
      });
    });
  }

  /* ── Init expand/collapse all ─────────────────────────────────────────── */
  function initExpandCollapse() {
    var blocks = document.querySelectorAll('.step-deliv');
    var expandBtn = document.getElementById('df-expand');
    var collapseBtn = document.getElementById('df-collapse');
    if (expandBtn) {
      expandBtn.addEventListener('click', function() {
        blocks.forEach(function(b) { b.classList.remove('collapsed'); });
      });
    }
    if (collapseBtn) {
      collapseBtn.addEventListener('click', function() {
        blocks.forEach(function(b) { b.classList.add('collapsed'); });
      });
    }
  }

  /* ── Init copy all paths ──────────────────────────────────────────────── */
  function initCopyAll() {
    var btn = document.getElementById('df-copyall');
    if (!btn) return;
    btn.addEventListener('click', function() {
      var all = Array.from(document.querySelectorAll('.deliv-link')).map(function(a) { return a.getAttribute('href'); });
      copyText(all.join('\n'), this);
    });
  }

  /* ── Handle hash navigation (cross-link from deliverables tab) ─────────── */
  function handleHashNav() {
    if (location.hash && location.hash.startsWith('#step-') && location.hash.endsWith('-deliv')) {
      var target = document.querySelector(location.hash);
      if (target) {
        target.classList.add('flash');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.remove('collapsed');
      }
    }
  }

  /* ── Init ─────────────────────────────────────────────────────────────── */
  function init() {
    var counts = autoAnnotate();
    updateStats(counts);
    initFilter();
    initExpandCollapse();
    initCopyAll();
    handleHashNav();
  }

  /* ── Public API ───────────────────────────────────────────────────────── */
  return {
    init: init,
    autoAnnotate: autoAnnotate,
    initFilter: initFilter,
    initExpandCollapse: initExpandCollapse,
    initCopyAll: initCopyAll,
    handleHashNav: handleHashNav
  };
})();