/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN · Typewriter 终端模拟器

   提供 twAdd / twRun / twReset 三个函数
   依赖: 页面需定义 var twScenarios = { scenarioName: [...] }
   用法: <script src="../yry-typewriter/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

function twAdd(type, prompt, cmd, content) {
  var box = document.getElementById('twContent');
  if (!box) return;
  var line = document.createElement('span');
  line.className = 'tw-line';
  var colorMap = { cmd: 'tw-cmd', out: 'tw-out', ok: 'tw-ok', warn: 'tw-warn', info: 'tw-info', fail: 'tw-fail', muted: 'tw-muted' };
  var c = colorMap[type] || 'tw-out';
  if (type === 'cmd') {
    line.textContent = '';
    line.insertAdjacentHTML('beforeend', '<span class="tw-prompt">' + prompt + '</span><span class="' + c + '">' + cmd + '</span>');
  } else {
    line.textContent = '';
    line.insertAdjacentHTML('beforeend', '<span class="' + c + '">' + content + '</span>');
  }
  box.appendChild(line);
  line.scrollIntoView({ block: 'end', behavior: 'smooth' });
}

function twRun(scenario, btn) {
  var box = document.getElementById('twContent');
  if (!box) return;
  box.textContent = '';
  document.querySelectorAll('.tw-ctrl-btn').forEach(function (b) { b.classList.remove('on'); });
  if (btn) btn.classList.add('on');
  var lines = twScenarios[scenario] || [];
  var delay = 0;
  lines.forEach(function (l) {
    setTimeout(function () {
      twAdd(l.t, l.p || '', l.c || '', l.c || '');
      if (!l.t || (l.t === 'ok' && !l.c)) box.appendChild(document.createElement('br'));
    }, delay);
    delay += l.d || 180;
  });
}

window.twRun = twRun;
window.twReset = function () {
  var box = document.getElementById('twContent');
  if (box) box.textContent = '';
};
