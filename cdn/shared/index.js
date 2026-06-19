/* ═══════════════════════════════════════════════════════════════════════════
   YrY Shared JS — 所有故事面板 HTML 页面的公共脚本
   适用: 审查 · 测试面板 · 演示 · 计划清单 · 架构图 · 知识图谱

   使用方式:
     <script src="../../../../cdn/shared/index.js"></script>
     然后调用: YrY.toast('消息') / YrY.copyCmd(btn, cmd) / YrY.switchPanel(name)

   对应场景文档:
     - docs/故事任务面板/yry-cdn/场景-1-cdn资源加载与页面渲染/
     - docs/故事任务面板/yry-cdn/场景-3-组件库与JS工具API/
     - docs/故事任务面板/yry-cdn/场景-4-存量页面迁移/
     - docs/故事任务面板/yry-cdn/场景-5-npm包发布与版本管理/
   ═══════════════════════════════════════════════════════════════════════════ */

window.YrY = (function() {
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

  /* ── Tab panel auto-init ──────────────────────────────────────────────── */
  function initTabs(containerSelector) {
    var container = document.querySelector(containerSelector || '.yry-container');
    if (!container) container = document;
    var tabs = container.querySelectorAll('.yry-tab');
    tabs.forEach(function(t) {
      t.addEventListener('click', function() {
        switchPanel(this.dataset.panel, '.yry-tab', '.yry-panel');
      });
    });
  }

  /* ── Code block click-to-copy ─────────────────────────────────────────── */
  function initCodeCopy(containerSelector) {
    var container = document.querySelector(containerSelector || '.yry-container');
    if (!container) container = document;
    container.querySelectorAll('pre').forEach(function(p) {
      p.addEventListener('click', function() {
        var text = this.textContent || '';
        clipboardWrite(text.replace(/📋$/,'').trim());
      });
    });
  }

  /* ── Checklist step toggle ────────────────────────────────────────────── */
  function initStepToggle(containerSelector) {
    var container = document.querySelector(containerSelector || '.yry-container');
    if (!container) container = document;
    container.addEventListener('click', function(e) {
      var head = e.target.closest('.step-header');
      if (!head) return;
      var body = head.parentElement.querySelector('.step-body');
      if (body) body.classList.toggle('open');
    });
  }

  /* ── Demo tab panel init with localStorage ────────────────────────────── */
  function initDemoTabs(sceneKey, keyMap, onHelp) {
    keyMap = keyMap || {
      '1': 'walkthrough', '2': 'timeline', '3': 'radar', '4': 'replay',
      '5': 'day', '6': 'commands', '7': 'overview', '8': 'quiz',
      '9': 'pitfalls', '0': 'files', 'c': 'checklist', 'C': 'checklist',
      's': 'simulator', 'S': 'simulator'
    };

    window.switchPanel = function (name) {
      YrY.switchPanel(name, '.tab', '.panel');
      try { localStorage.setItem(sceneKey + '-tab', name); } catch (e) {}
    };

    var tabsEl = document.querySelector('.tabs');
    if (tabsEl) {
      tabsEl.addEventListener('click', function (e) {
        var tab = e.target.closest('.tab');
        if (!tab) return;
        window.switchPanel(tab.dataset.panel);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (keyMap[e.key]) {
        e.preventDefault();
        window.switchPanel(keyMap[e.key]);
      } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        if (typeof onHelp === 'function') onHelp();
        else if (typeof window.toggleHelp === 'function') window.toggleHelp();
      } else if (e.key === 'Escape') {
        var h = document.getElementById('helpOverlay');
        if (h) h.classList.remove('show');
      }
    });

    try {
      var saved = localStorage.getItem(sceneKey + '-tab');
      if (saved) window.switchPanel(saved);
    } catch (e) {}
  }

  /* ── Docs quiz init (onclick pattern) ─────────────────────────────────── */
  function initDocsQuiz(config) {
    var quizState = {};
    for (var i = 0; i < config.total; i++) quizState[i] = -1;

    window.quizAnswer = function (q, idx, correct) {
      if (quizState[q] !== -1) return;
      quizState[q] = idx;
      var card = document.querySelector('.quiz-card[data-q="' + q + '"]');
      if (!card) return;
      var opts = card.querySelectorAll('.quiz-opt');
      opts.forEach(function (o, i) {
        o.classList.add('disabled');
        if (i === correct) o.classList.add('correct');
        else if (i === idx) o.classList.add('wrong');
      });
      var fb = card.querySelector('.quiz-feedback');
      if (fb) fb.classList.add('show');
      var allDone = Object.keys(quizState).every(function (k) { return quizState[k] !== -1; });
      if (allDone) showScore();
    };

    function showScore() {
      var correct = 0;
      for (var k in quizState) {
        if (quizState[k] === config.correctAnswers[k]) correct++;
      }
      var pct = Math.round(correct / config.total * 100);
      var big = document.getElementById('qsBig');
      var sub = document.getElementById('qsSub');
      if (big) big.textContent = correct + ' / ' + config.total;
      if (sub) {
        if (pct >= 80) sub.textContent = config.fbExcellent;
        else if (pct >= 60) sub.textContent = config.fbGood;
        else sub.textContent = config.fbPoor;
      }
      var scoreEl = document.getElementById('quizScore');
      if (scoreEl) scoreEl.classList.add('show');
      var sq = document.getElementById('statQuiz');
      if (sq) {
        sq.textContent = pct + '%';
        sq.style.color = pct >= 80 ? 'var(--pass)' : (pct >= 60 ? 'var(--warn)' : 'var(--fail)');
      }
    }
  }

  /* ── Radar chart init ────────────────────────────────────────────────── */
  function initRadar(data, baseData, descMap, defaultMsg) {
    var num = function (v) { return typeof v === 'number' && !isNaN(v) ? v : 0; };
    var angles = [];
    for (var i = 0; i < data.length; i++) {
      angles.push(-Math.PI / 2 + i * 2 * Math.PI / data.length);
    }
    function pt(v, i) {
      var r = 120 * num(v);
      return [num(Math.cos(angles[i]) * r), num(Math.sin(angles[i]) * r)];
    }
    function render() {
      var polyPts = data.map(function (v, i) { return pt(v, i).join(','); }).join(' ');
      var sh = document.getElementById('radarShield');
      if (sh) sh.setAttribute('points', polyPts);
      document.querySelectorAll('.radar-point').forEach(function (c, i) {
        var p = pt(data[i], i);
        c.setAttribute('cx', p[0]);
        c.setAttribute('cy', p[1]);
      });
      document.querySelectorAll('.radar-point').forEach(function (c, i) {
        c.onmouseenter = function () {
          document.getElementById('radarDesc').textContent = '';

          document.getElementById('radarDesc').insertAdjacentHTML('beforeend', descMap[i]);
        };
        c.onmouseleave = function () {
          document.getElementById('radarDesc').textContent = '';

          document.getElementById('radarDesc').insertAdjacentHTML('beforeend', defaultMsg);
        };
      });
    }
    setTimeout(render, 100);
    window.radarRender = render;
  }

  /* ── Next-Action Callout init ─────────────────────────────────────────── */
  function initNextAction(steps) {
    var stepIdx = 0;

    window.goNextStep = function () {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      var s = steps[stepIdx];
      var naTitle = document.getElementById('naTitle');
      var naDesc = document.getElementById('naDesc');
      var naBtn = document.getElementById('naBtn');
      if (naTitle) naTitle.textContent = s.t;
      if (naDesc) naDesc.textContent = s.d;
      if (naBtn) naBtn.textContent = s.cta;
      if (stepIdx === steps.length - 1) {
        var na = document.getElementById('nextAction');
        if (na) {
          na.style.background = 'linear-gradient(135deg,rgba(34,197,94,.12) 0%,rgba(34,211,238,.06) 100%)';
          na.style.borderColor = 'rgba(34,197,94,.3)';
        }
      }
      toast('✓ 已更新下一步', 1200);
    };

    window.jumpStep = function (n) {
      window.switchPanel('walkthrough');
      var step = document.querySelector('.step[data-step="' + n + '"]');
      if (step) {
        step.scrollIntoView({ behavior: 'smooth', block: 'center' });
        step.style.transition = 'background .5s';
        step.style.background = 'rgba(255,193,7,.04)';
        setTimeout(function () { step.style.background = ''; }, 1500);
      }
    };
  }

  /* ── Checklist init ──────────────────────────────────────────────────── */
  function initChecklist(config) {
    var CK_KEY = config.storageKey;
    var checked = {};
    var prevCount = 0;
    try { var raw = localStorage.getItem(CK_KEY); if (raw) checked = JSON.parse(raw); } catch (e) {}

    function updateUI() {
      var items = document.querySelectorAll('.check-item');
      var count = 0;
      items.forEach(function (item) {
        var id = item.dataset.id;
        if (checked[id]) { item.classList.add('checked'); count++; }
        else { item.classList.remove('checked'); }
      });
      if (items.length === 0) return;
      var pct = Math.round(count / items.length * 100);
      var pf = document.getElementById('progFill');
      if (pf) pf.style.width = pct + '%';
      var pl = document.getElementById('progLabel');
      if (pl) pl.textContent = count + ' / ' + items.length + ' (' + pct + '%)';
      var sd = document.getElementById('statCheckDone');
      if (sd) sd.textContent = count;
      var sp = document.getElementById('statCheckPct');
      if (sp) sp.textContent = pct + '%';
      var delta = count - prevCount;
      var de = document.getElementById('statCheckDelta');
      if (de) {
        de.textContent = (delta >= 0 ? '+' : '') + delta;
        de.style.color = delta > 0 ? 'var(--pass)' : (delta < 0 ? 'var(--fail)' : 'var(--text3)');
      }
      prevCount = count;
    }

    var cl = document.getElementById('checkList');
    if (cl) {
      cl.addEventListener('click', function (e) {
        var item = e.target.closest('.check-item');
        if (!item) return;
        var id = item.dataset.id;
        var nameEl = item.querySelector('.ci-name');
        var name = nameEl ? nameEl.textContent : id;
        if (checked[id]) {
          delete checked[id];
          toast('取消勾选: ' + name, 1200);
        } else {
          checked[id] = true;
          toast('已完成: ' + name, 1500);
        }
        try { localStorage.setItem(CK_KEY, JSON.stringify(checked)); } catch (e) {}
        updateUI();
      });
    }

    window.clearAllChecks = function () {
      checked = {};
      try { localStorage.removeItem(CK_KEY); } catch (e) {}
      updateUI();
      toast('已清除所有勾选', 1200);
    };

    window.exportChecklist = function () {
      var items = document.querySelectorAll('.check-item');
      var lines = ['# ' + config.exportTitle, '', '导出时间: ' + new Date().toLocaleString(), ''];
      items.forEach(function (it) {
        var n = it.querySelector('.ci-name').textContent;
        var d = it.dataset.id;
        lines.push((checked[d] ? '[x]' : '[ ]') + ' ' + n);
      });
      var done = Object.keys(checked).length;
      lines.push('');
      lines.push('完成度: ' + done + ' / ' + items.length + ' (' + Math.round(done / items.length * 100) + '%)');
      var txt = lines.join('\n');
      try {
        if (navigator.clipboard) navigator.clipboard.writeText(txt);
        toast('✓ 已复制 ' + done + ' 项进度到剪贴板', 1800);
      } catch (e) { toast('导出失败,请手动复制', 1500); }
    };

    updateUI();
  }

  /* ── Help overlay toggle ─────────────────────────────────────────────── */
  window.toggleHelp = function () {
    var h = document.getElementById('helpOverlay');
    if (h) h.classList.toggle('show');
  };

  /* ── Timeline Progress ───────────────────────────────────────────────── */
  function initTimelineProgress() {
    var completed = {};
    try { var raw = localStorage.getItem('yry-arch-s3-checklist'); if (raw) completed = JSON.parse(raw); } catch (e) {}
    function updateTimeline() {
      var done = 0, active = false;
      document.querySelectorAll('.tl-node').forEach(function (n, i) {
        var stepNum = i + 1;
        n.classList.remove('done', 'active');
        if (completed['s' + (stepNum + 1) + '-intro'] || completed['s' + (stepNum + 2) + '-code'] || completed['s' + (stepNum + 1) + '-clone'] || (stepNum === 3 && completed['s7-explore']) || (stepNum === 5 && completed['s10-sync'])) {
          n.classList.add('done'); done++;
        } else if (!active) { n.classList.add('active'); active = true; }
      });
      var pct = done / 6 * 100;
      var p = document.getElementById('tlProgress');
      if (p) p.style.width = pct + '%';
    }
    setTimeout(updateTimeline, 200);
  }

  /* ── Help overlay HTML inject ────────────────────────────────────────── */
  function renderHelpOverlay() {
    if (document.getElementById('helpOverlay')) return;
    var container = document.querySelector('.container');
    if (!container) return;

    var fab = document.createElement('button');
    fab.className = 'fab-help';
    fab.title = '快捷键帮助';
    fab.onclick = toggleHelp;
    fab.textContent = '?';

    var overlay = document.createElement('div');
    overlay.className = 'help-overlay';
    overlay.id = 'helpOverlay';
    overlay.onclick = function (e) { if (e.target === overlay) toggleHelp(); };

    var rows = [
      { keys: ['1', '2', '3', '4', '5'], desc: '切换演示/时间线/雷达/回放/日程 Tab' },
      { keys: ['6', '7', '8', '9', '0'], desc: '切换命令/概览/自测/避坑/文件 Tab' },
      { keys: ['C', 'S'], desc: '切换清单/演练 Tab' },
      { keys: ['?'], desc: '打开/关闭本帮助' },
      { keys: ['Esc'], desc: '关闭弹窗 / 取消操作' },
      { keys: ['⏎'], desc: '代码块上 → 一键复制' },
      { keys: ['🖱'], desc: '点击 Timeline 节点 → 跳转演示步骤' }
    ];

    var card = document.createElement('div');
    card.className = 'help-card';

    var h3 = document.createElement('h3');
    h3.textContent = '⌨ 快捷键 & 操作';
    card.appendChild(h3);

    rows.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'help-row';
      var keysDiv = document.createElement('div');
      keysDiv.className = 'help-keys';
      r.keys.forEach(function (k) {
        var span = document.createElement('span');
        span.className = 'kbd';
        span.textContent = k;
        keysDiv.appendChild(span);
      });
      var descDiv = document.createElement('div');
      descDiv.className = 'help-desc';
      descDiv.textContent = r.desc;
      row.appendChild(keysDiv);
      row.appendChild(descDiv);
      card.appendChild(row);
    });

    var closeDiv = document.createElement('div');
    closeDiv.className = 'help-close';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'btn-clear-checks';
    closeBtn.onclick = toggleHelp;
    closeBtn.textContent = '关闭';
    closeDiv.appendChild(closeBtn);
    card.appendChild(closeDiv);

    overlay.appendChild(card);
    container.appendChild(fab);
    container.appendChild(overlay);
  }


  /* ── 场景标准交付物链接生成器 (7 件套) ──────────────────────────────── */
  function sceneMeta(basePath) {
    return [
      { icon: '📋', label: '清单', href: basePath + '/计划清单.html' },
      { icon: '📐', label: '架构', href: basePath + '/架构图.html' },
      { icon: '🔗', label: '图谱', href: basePath + '/知识图谱.html' },
      { icon: '🧪', label: '测试', href: basePath + '/测试面板.html' },
      { icon: '📄', label: '源码', href: basePath + '/源码.html' },
      { icon: '💡', label: '演示', href: basePath + '/演示.html' },
      { icon: '📝', label: '审查', href: basePath + '/审查.html' }
    ];
  }


  /* ── DOM 元素创建辅助 ────────────────────────────────────────────────── */
  function elt(tag, className, textContent) {
    var d = document.createElement(tag || 'div');
    if (className) d.className = className;
    if (textContent) d.textContent = textContent;
    return d;
  }

  /* ── Public API ───────────────────────────────────────────────────────── */
  return {
    toast: toast,
    copyCmd: copyCmd,
    switchPanel: switchPanel,
    initSuiteToggle: initSuiteToggle,
    expandAllSuites: expandAllSuites,
    collapseAllSuites: collapseAllSuites,
    initTabs: initTabs,
    initDemoTabs: initDemoTabs,
    initDocsQuiz: initDocsQuiz,
    initRadar: initRadar,
    initChecklist: initChecklist,
    initNextAction: initNextAction,
    renderHelpOverlay: renderHelpOverlay,
    initTimelineProgress: initTimelineProgress,
    initCodeCopy: initCodeCopy,
    initStepToggle: initStepToggle,
    fmtDur: fmtDur,
    esc: esc,
    clipboardWrite: clipboardWrite,
    sceneMeta: sceneMeta,
    elt: elt
  };
})();
