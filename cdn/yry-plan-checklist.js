const SCENE_KEY = 'yry-arch-s3-checklist';

// ── Tab Switching ─────────────────────────
document.querySelector('.tabs').addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  switchPanel(tab.dataset.panel);
});

function switchPanel(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.panel === name));
  document.querySelectorAll('.panel').forEach(p => {
    p.classList.toggle('on', p.id === 'panel' + name.charAt(0).toUpperCase() + name.slice(1));
  });
  localStorage.setItem(SCENE_KEY + '-tab', name);
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  const m = {'1':'checklist','2':'overview','3':'commands','4':'related','5':'verify','6':'metrics','7':'deliverables','8':'risks','9':'timeline'};
  if (m[e.key]) { e.preventDefault(); switchPanel(m[e.key]); }
});

// ── Progress ─────────────────────────────
function updateProgress() {
  const checks = document.querySelectorAll('.step-checkbox');
  const done = Array.from(checks).filter(c => c.checked).length;
  const total = checks.length;
  const pct = Math.round((done / total) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent = done + ' / ' + total + ' 完成';

  checks.forEach(cb => {
    const status = cb.closest('.step').querySelector('.step-status');
    if (cb.checked) {
      status.textContent = '✅ 完成'; status.className = 'step-status status-done';
    } else {
      const allChecks = Array.from(checks);
      const idx = allChecks.indexOf(cb);
      const prevDone = idx === 0 || allChecks[idx - 1].checked;
      status.textContent = prevDone ? '🔶 就绪' : '⏳ 待开始';
      status.className = prevDone ? 'step-status status-active' : 'step-status status-pending';
    }
  });

  // Update overview tab stats
  const pending = total - done;
  const ready = Array.from(checks).filter((c, i) => {
    if (c.checked) return false;
    const allChecks = Array.from(checks);
    return i === 0 || allChecks[i - 1].checked;
  }).length;
  const ovDone = document.getElementById('ov-done');
  const ovReady = document.getElementById('ov-ready');
  const ovPending = document.getElementById('ov-pending');
  if (ovDone) ovDone.textContent = done;
  if (ovReady) ovReady.textContent = ready;
  if (ovPending) ovPending.textContent = pending - ready;

  // Persist
  const state = {};
  checks.forEach((cb, i) => { state['step-' + (i + 1)] = cb.checked; });
  localStorage.setItem(SCENE_KEY, JSON.stringify(state));
}

// ── Copy ─────────────────────────────────
function copyCmd(btn, cmd) {
  navigator.clipboard.writeText(cmd).then(() => {
    btn.textContent = '✅'; btn.style.opacity = '1';
    setTimeout(() => { btn.textContent = '📋'; btn.style.opacity = ''; }, 1500);
  }).catch(() => toast('复制失败'));
}

function copyPath(path, el) {
  navigator.clipboard.writeText(path).then(() => {
    const orig = el ? el.textContent : '';
    if (el) {
      el.textContent = '✅ 已复制';
      el.style.color = '#10b981';
      setTimeout(() => { el.textContent = orig; el.style.color = ''; }, 1500);
    }
    toast('📋 已复制路径: ' + path);
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = path; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
    if (el) {
      const orig = el.textContent;
      el.textContent = '✅ 已复制';
      setTimeout(() => { el.textContent = orig; }, 1500);
    }
    toast('📋 已复制路径: ' + path);
  });
}

function toggleRisk(row) {
  row.classList.toggle('open');
  const tog = row.querySelector('.rr-toggle');
  if (tog) tog.textContent = row.classList.contains('open') ? '▲' : '▼';
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 1800);
}

// ── Init ──────────────────────────────────
(function() {
  const saved = JSON.parse(localStorage.getItem(SCENE_KEY) || '{}');
  document.querySelectorAll('.step-checkbox').forEach((cb, i) => {
    if (saved['step-' + (i + 1)]) {
      cb.checked = true;
    }
  });
  updateProgress();

  // Restore last active tab
  const activeTab = localStorage.getItem(SCENE_KEY + '-tab') || 'checklist';
  switchPanel(activeTab);
})();
