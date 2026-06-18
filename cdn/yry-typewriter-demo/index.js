/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryTypewriterDemo · 终端打字机模拟 脚本
   零依赖 vanilla JS — 从 JSON 数据驱动终端动画

   数据格式 (<script type="application/json" id="...">):
   {
     "title": "终端标题",
     "scenarios": {
       "key1": {
         "label": "场景名",
         "lines": [
           { "t": "cmd|out|ok|warn|info|fail|muted", "p": "$ ", "c": "内容", "d": 200 }
         ]
       }
     }
   }

   使用方式:
     <script type="application/json" id="tw-data">{ ... }</script>
     <yry-typewriter-demo></yry-typewriter-demo>
     <script src="yry-typewriter-demo/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-typewriter-demo';

  var YryTypewriterDemo = function () {
    return Reflect.construct(HTMLElement, [], YryTypewriterDemo);
  };
  YryTypewriterDemo.prototype = Object.create(HTMLElement.prototype);

  YryTypewriterDemo.prototype.connectedCallback = function () {
    var self = this;

    // Read config from preceding <script type="application/json">
    var dataEl = this.previousElementSibling;
    if (!dataEl || dataEl.tagName !== 'SCRIPT' || dataEl.type !== 'application/json') {
      var id = this.id;
      if (id) {
        dataEl = document.querySelector('script[type="application/json"][id="' + id + '"]');
      }
    }

    var cfg;
    if (dataEl) {
      try { cfg = JSON.parse(dataEl.textContent); }
      catch (e) { cfg = null; }
    }
    if (!cfg || !cfg.scenarios) {
      this.innerHTML = '<div style="text-align:center;padding:24px;color:var(--yry-text3,#888)">⌨️ 无终端数据</div>';
      return;
    }

    var title = cfg.title || 'terminal';
    var scenarios = cfg.scenarios;
    var scenarioKeys = Object.keys(scenarios);
    var currentTimer = null;

    // Build UI
    var wrap = document.createElement('div');
    wrap.className = 'tw-wrap';

    // Terminal window
    var term = document.createElement('div');
    term.className = 'tw-demo';

    var head = document.createElement('div');
    head.className = 'tw-head';
    head.innerHTML =
      '<span class="tw-btn r"></span>' +
      '<span class="tw-btn y"></span>' +
      '<span class="tw-btn g"></span>' +
      '<span class="tw-title">' + escapeHtml(title) + '</span>';
    term.appendChild(head);

    var content = document.createElement('div');
    content.className = 'tw-content';
    content.id = 'tw-content-' + (this.id || Math.random().toString(36).slice(2, 8));
    term.appendChild(content);

    wrap.appendChild(term);

    // Controls
    var controls = document.createElement('div');
    controls.className = 'tw-controls';

    scenarioKeys.forEach(function (key, i) {
      var btn = document.createElement('button');
      btn.className = 'tw-ctrl-btn' + (i === 0 ? ' on' : '');
      btn.textContent = scenarios[key].label || key;
      btn.addEventListener('click', function () {
        // Highlight active
        controls.querySelectorAll('.tw-ctrl-btn:not(.reset-btn)').forEach(function (b) {
          b.classList.remove('on');
        });
        btn.classList.add('on');
        // Run scenario
        runScenario(scenarios[key], content);
      });
      controls.appendChild(btn);
    });

    // Reset button
    var resetBtn = document.createElement('button');
    resetBtn.className = 'tw-ctrl-btn reset-btn';
    resetBtn.textContent = '⟳ 清屏';
    resetBtn.addEventListener('click', function () {
      if (currentTimer) {
        clearTimeout(currentTimer);
        currentTimer = null;
      }
      content.textContent = '';
    });
    controls.appendChild(resetBtn);

    wrap.appendChild(controls);
    this.appendChild(wrap);

    // Auto-run first scenario
    if (scenarioKeys.length > 0) {
      setTimeout(function () {
        runScenario(scenarios[scenarioKeys[0]], content);
      }, 200);
    }

    // ── Run scenario ──────────────────────────────────────────────
    function runScenario(scenario, box) {
      if (currentTimer) {
        clearTimeout(currentTimer);
        currentTimer = null;
      }
      box.textContent = '';
      var lines = scenario.lines || [];
      var delay = 0;
      lines.forEach(function (l) {
        currentTimer = setTimeout(function () {
          var line = document.createElement('span');
          line.className = 'tw-line';
          if (l.t === 'cmd') {
            var prompt = l.p || '$ ';
            line.innerHTML =
              '<span class="tw-prompt">' + escapeHtml(prompt) + '</span>' +
              '<span class="tw-cmd">' + escapeHtml(l.c || '') + '</span>';
          } else {
            var clsMap = {
              cmd: 'tw-cmd', out: 'tw-out', ok: 'tw-ok',
              warn: 'tw-warn', info: 'tw-info', fail: 'tw-fail', muted: 'tw-muted'
            };
            var cls = clsMap[l.t] || 'tw-out';
            line.innerHTML = '<span class="' + cls + '">' + escapeHtml(l.c || '') + '</span>';
          }
          box.appendChild(line);
          line.scrollIntoView({ block: 'end', behavior: 'smooth' });
          currentTimer = null;
        }, delay);
        delay += l.d || 180;
      });
      // Final delay to clear timer ref
      currentTimer = setTimeout(function () {
        currentTimer = null;
      }, delay);
    }
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryTypewriterDemo);
  }
})();
