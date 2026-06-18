/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryPipelineSimulator · 管线模拟器 脚本
   零依赖 vanilla JS — 从 JSON 数据模拟管线阶段执行

   数据格式 (<script type="application/json" id="...">):
   {
     "title": "管线标题",
     "stages": [
       {
         "name": "阶段名",
         "detail": "阶段描述",
         "logLines": ["日志行1", "日志行2", ...]
       }
     ]
   }

   使用方式:
     <script type="application/json" id="sim-data">{ ... }</script>
     <yry-pipeline-simulator></yry-pipeline-simulator>
     <script src="yry-pipeline-simulator/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-pipeline-simulator';

  var YryPipelineSimulator = function () {
    return Reflect.construct(HTMLElement, [], YryPipelineSimulator);
  };
  YryPipelineSimulator.prototype = Object.create(HTMLElement.prototype);

  YryPipelineSimulator.prototype.connectedCallback = function () {
    var self = this;
    var simRunning = false;
    var simSpeed = 1;
    var simTimer = null;

    // Read config
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
    if (!cfg || !cfg.stages || !cfg.stages.length) {
      this.innerHTML = '<div style="text-align:center;padding:24px;color:var(--yry-text3,#888)">⚙️ 无管线数据</div>';
      return;
    }

    var title = cfg.title || '';
    var stages = cfg.stages;

    // Build UI
    var wrap = document.createElement('div');
    wrap.className = 'sim-wrap';

    // Title
    if (title) {
      var titleEl = document.createElement('div');
      titleEl.style.cssText = 'font-size:.82rem;font-weight:600;color:var(--yry-text,#f5f5f5);margin-bottom:2px;';
      titleEl.textContent = title;
      wrap.appendChild(titleEl);
    }

    // Controls
    var controls = document.createElement('div');
    controls.className = 'sim-controls';

    var playBtn = document.createElement('button');
    playBtn.className = 'sim-btn play-btn';
    playBtn.textContent = '▶ 开始模拟';
    controls.appendChild(playBtn);

    var resetBtn = document.createElement('button');
    resetBtn.className = 'sim-btn';
    resetBtn.textContent = '⟳ 重置';
    controls.appendChild(resetBtn);

    var speedWrap = document.createElement('div');
    speedWrap.className = 'sim-speed';
    speedWrap.innerHTML = '速度 <select><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select>';
    controls.appendChild(speedWrap);

    var speedSelect = speedWrap.querySelector('select');
    speedSelect.addEventListener('change', function () {
      simSpeed = parseFloat(this.value);
    });

    wrap.appendChild(controls);

    // Stage list
    var stageList = document.createElement('div');
    stageList.className = 'sim-stages';

    stages.forEach(function (stage, idx) {
      var row = document.createElement('div');
      row.className = 'sim-stage';
      row.innerHTML =
        '<span class="st-num">' + (idx + 1) + '</span>' +
        '<div class="st-info">' +
          '<div class="st-name">' + escapeHtml(stage.name) + '</div>' +
          '<div class="st-detail">' + escapeHtml(stage.detail || '') + '</div>' +
        '</div>' +
        '<span class="st-status waiting">等待中</span>' +
        '<div class="st-bar" style="width:0%"></div>';
      stageList.appendChild(row);
    });

    wrap.appendChild(stageList);

    // Log box
    var logBox = document.createElement('div');
    logBox.className = 'sim-log';
    logBox.innerHTML = '<div style="color:var(--yry-text3,#888)">等待模拟开始...</div>';
    wrap.appendChild(logBox);

    this.appendChild(wrap);

    // ── Reset ─────────────────────────────────────────────────────
    function resetAll() {
      if (simRunning) return;
      if (simTimer) { clearTimeout(simTimer); simTimer = null; }
      var rows = stageList.querySelectorAll('.sim-stage');
      rows.forEach(function (row) {
        row.className = 'sim-stage';
        row.querySelector('.st-status').className = 'st-status waiting';
        row.querySelector('.st-status').textContent = '等待中';
        row.querySelector('.st-bar').style.width = '0%';
      });
      logBox.innerHTML = '<div style="color:var(--yry-text3,#888)">等待模拟开始...</div>';
      logBox.classList.remove('show');
      playBtn.classList.remove('running');
      playBtn.textContent = '▶ 开始模拟';
    }

    // ── Log ───────────────────────────────────────────────────────
    var startTime = 0;
    function addLog(msg, color) {
      logBox.classList.add('show');
      var line = document.createElement('div');
      line.className = 'log-line';
      var now = new Date();
      var time = ('0' + now.getHours()).slice(-2) + ':' +
                 ('0' + now.getMinutes()).slice(-2) + ':' +
                 ('0' + now.getSeconds()).slice(-2);
      var ms = startTime ? Date.now() - startTime : 0;
      line.innerHTML =
        '<span class="log-time">' + time + '</span>' +
        '<span class="log-icon" style="color:' + (color || 'var(--yry-text2)') + '">●</span>' +
        '<span style="color:' + (color || 'var(--yry-text2)') + '">' + escapeHtml(msg) + '</span>' +
        '<span class="log-ms">+' + ms + 'ms</span>';
      logBox.appendChild(line);
      logBox.scrollTop = logBox.scrollHeight;
      return line;
    }

    // ── Start ─────────────────────────────────────────────────────
    function startSim() {
      if (simRunning) return;
      simRunning = true;
      startTime = Date.now();
      playBtn.classList.add('running');
      playBtn.textContent = '⏳ 模拟中...';
      logBox.classList.add('show');
      logBox.textContent = '';
      addLog('🚀 开始管线模拟', 'var(--yry-accent)');

      var baseDuration = 1200;
      var i = 0;

      function next() {
        if (i >= stages.length) {
          setTimeout(function () {
            addLog('✅ 管线模拟完成 — ' + stages.length + ' 阶段全部执行', 'var(--yry-pass)');
            playBtn.classList.remove('running');
            playBtn.textContent = '✓ 完成';
            simRunning = false;
            setTimeout(function () { playBtn.textContent = '▶ 重新模拟'; }, 2000);
          }, 400 / simSpeed);
          return;
        }

        var stage = stages[i];
        var row = stageList.querySelectorAll('.sim-stage')[i];

        // Mark active
        row.className = 'sim-stage active';
        row.querySelector('.st-status').className = 'st-status loading';
        row.querySelector('.st-status').textContent = '执行中...';

        addLog('⏳ ' + stage.name + ' — ' + (stage.detail || ''), 'var(--yry-cyan)');

        var start = Date.now();
        var duration = baseDuration / simSpeed;

        // Progress tick
        var tick = setInterval(function () {
          var pct = Math.min(100, ((Date.now() - start) / duration) * 100);
          row.querySelector('.st-bar').style.width = pct + '%';
          if (pct >= 100) clearInterval(tick);
        }, 16);

        // Log lines with staggered timing
        var logLines = stage.logLines || [];
        var logDelay = duration / (logLines.length + 2);
        logLines.forEach(function (line, li) {
          setTimeout(function () {
            var c = 'var(--yry-text2)';
            if (line.indexOf('✓') !== -1 || line.indexOf('✅') !== -1 || line.indexOf('PASS') !== -1) c = 'var(--yry-pass)';
            else if (line.indexOf('⚠') !== -1) c = 'var(--yry-warn)';
            else if (line.indexOf('❌') !== -1 || line.indexOf('FAIL') !== -1) c = 'var(--yry-fail)';
            addLog(line, c);
          }, logDelay * (li + 1));
        });

        // Complete stage after duration
        simTimer = setTimeout(function () {
          clearInterval(tick);
          row.querySelector('.st-bar').style.width = '100%';

          var isFailed = (stage.logLines || []).some(function (l) {
            return l.indexOf('❌') !== -1 || l.indexOf('FAIL') !== -1;
          });

          if (isFailed) {
            row.className = 'sim-stage failed';
            row.querySelector('.st-status').className = 'st-status err';
            row.querySelector('.st-status').textContent = '失败 ✗';
          } else {
            row.className = 'sim-stage done';
            row.querySelector('.st-status').className = 'st-status ok';
            row.querySelector('.st-status').textContent = '完成 ✓';
          }

          addLog('  ✅ ' + stage.name + ' — 阶段完成', 'var(--yry-pass)');
          i++;
          simTimer = setTimeout(next, 300 / simSpeed);
        }, duration);
      }

      simTimer = setTimeout(next, 300 / simSpeed);
    }

    playBtn.addEventListener('click', function () {
      if (simRunning) return;
      if (playBtn.textContent === '▶ 重新模拟' || playBtn.textContent === '✓ 完成') {
        resetAll();
        setTimeout(startSim, 200);
      } else {
        startSim();
      }
    });

    resetBtn.addEventListener('click', resetAll);
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryPipelineSimulator);
  }
})();
