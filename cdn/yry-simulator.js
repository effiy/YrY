/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN · 管线模拟器 + Sim Log

   提供 simLog / updateStage / resetSim / setSpeed / startSim
   依赖: 页面需定义 var stageDefsS3 = [...] (阶段定义数据)
         DOM 中需存在 #simLogBox / #btnSimPlay / simStageIds 对应元素
   用法: <script src="../yry-simulator.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Sim Log (带时间戳) ─────────────────────────────────────────────────── */
(function () {
  var origLog = function (msg, color) {
    var box = document.getElementById('simLogBox');
    if (!box) return;
    box.style.display = 'block';
    var div = document.createElement('div');
    div.className = 'log-line';
    var now = new Date();
    var time = ('0' + now.getHours()).slice(-2) + ':' +
               ('0' + now.getMinutes()).slice(-2) + ':' +
               ('0' + now.getSeconds()).slice(-2) + '.' +
               ('00' + now.getMilliseconds()).slice(-3);
    div.textContent = '';
    div.insertAdjacentHTML('beforeend', '<span class="log-time">' + time + '</span>' +
                    '<span class="log-icon" style="color:' + (color || 'var(--text2)') + '">●</span>' +
                    '<span style="color:' + (color || 'var(--text2)') + '">' + msg + '</span>';
    var ms = document.createElement('span');
    ms.className = 'log-ms';
    ms.textContent = '+0ms';
    div.appendChild(ms);
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    return div;
  };
  var startTime = Date.now();
  window.simLog = function (msg, color) {
    var div = origLog(msg, color);
    if (div) {
      var ms = Date.now() - startTime;
      div.querySelector('.log-ms').textContent = '+' + ms + 'ms';
    }
  };
  setTimeout(function () { window.simLog = window.simLog; }, 0);
})();

/* ── 模拟器状态 ──────────────────────────────────────────────────────────── */
var simRunning = false, simSpeed = 1, simStageIds = ['stg0', 'stg1', 'stg2', 'stg3', 'stg4'];

/* ── 阶段 UI 更新 ────────────────────────────────────────────────────────── */
function updateStage(idx, statusCls, statusText, barPct) {
  var row = document.getElementById(simStageIds[idx]);
  if (!row) return;
  row.classList.remove('done', 'active', 'failed');
  if (statusCls === 'ok') row.classList.add('done');
  if (statusCls === 'loading') row.classList.add('active');
  if (statusCls === 'err') row.classList.add('failed');
  var st = row.querySelector('.st-status');
  st.textContent = statusText;
  st.className = 'st-status ' + statusCls;
  row.querySelector('.st-bar').style.width = (barPct || 0) + '%';
}

/* ── 重置模拟 ────────────────────────────────────────────────────────────── */
function resetSim() {
  if (simRunning) return;
  simStageIds.forEach(function (id, i) {
    updateStage(i, 'waiting', '等待中', 0);
    var t = document.getElementById(id + 't');
    if (t) t.textContent = id.replace('stg', '') + 's';
  });
  var box = document.getElementById('simLogBox');
  if (box) {
    box.textContent = '';
  box.insertAdjacentHTML('beforeend', '<div style="color:var(--text3)">等待模拟开始...</div>');
    box.style.display = 'none';
  }
  var btn = document.getElementById('btnSimPlay');
  btn.classList.remove('running');
  btn.textContent = '▶ 开始模拟';
}

/* ── 设置速度 ────────────────────────────────────────────────────────────── */
function setSpeed(val) { simSpeed = parseFloat(val); }

/* ── 开始模拟 ────────────────────────────────────────────────────────────── */
function startSim() {
  if (simRunning) return;
  simRunning = true;
  var btn = document.getElementById('btnSimPlay');
  btn.classList.add('running');
  btn.textContent = '⏳ 模拟中...';
  var box = document.getElementById('simLogBox');
  box.style.display = 'block';
  box.textContent = '';
  simLog('🚀 开始新人上手模拟演练', 'var(--accent)');
  var baseDur = 1000;
  var i = 0;
  function next() {
    if (i >= stageDefsS3.length) {
      setTimeout(function () {
        simLog('✅ 5 阶段模拟完成 — 新人已具备独立开发能力', 'var(--pass)');
        btn.classList.remove('running');
        btn.textContent = '✓ 模拟完成';
        simRunning = false;
        YrY.toast('新人上手模拟完成', 2500);
        setTimeout(function () { btn.textContent = '▶ 重新模拟'; }, 2000);
      }, 400 / simSpeed);
      return;
    }
    var def = stageDefsS3[i];
    updateStage(i, 'loading', '学习中...', 0);
    var tEl = document.getElementById(simStageIds[i] + 't');
    if (tEl) {
      var orig = document.getElementById(simStageIds[i]).dataset.stagetime;
      if (orig) tEl.textContent = Math.round(parseInt(orig) / simSpeed) + 's';
    }
    simLog('⏳ ' + def.name + ' — ' + def.detail, 'var(--cyan)');
    var start = Date.now();
    var duration = baseDur / simSpeed;
    var tick = setInterval(function () {
      var pct = Math.min(100, ((Date.now() - start) / duration) * 100);
      var el = document.getElementById(simStageIds[i]);
      if (el) el.querySelector('.st-bar').style.width = pct + '%';
      if (pct >= 100) clearInterval(tick);
    }, 16);
    var logDelay = duration / (def.logLines.length + 2);
    def.logLines.forEach(function (line, li) {
      setTimeout(function () {
        simLog(line, line.indexOf('✓') !== -1 || line.indexOf('✅') !== -1 ? 'var(--pass)' : 'var(--text2)');
      }, logDelay * (li + 1));
    });
    setTimeout(function () {
      clearInterval(tick);
      updateStage(i, 'ok', '完成 ✓', 100);
      simLog('  ✅ ' + def.name + ' — 阶段完成', 'var(--pass)');
      i++;
      setTimeout(next, 300 / simSpeed);
    }, duration);
  }
  setTimeout(next, 300 / simSpeed);
}

/* ── 暴露全局 ────────────────────────────────────────────────────────────── */
window.resetSim = resetSim;
window.setSpeed = setSpeed;
window.startSim = startSim;
