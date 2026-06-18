/**
 * cron-panel.js — scheduled tasks panel (Vue 3)
 *
 * Reads .claude/scheduled_tasks.json and renders a task list
 * with cron descriptions, status indicators, and next-fire estimates.
 * Depends on: panel-hub.js (loaded first) · Vue 3 (window.Vue)
 */
(function() {
  'use strict';
  var H = window.PanelHub;
  if (!H) { console.error('cron-panel: PanelHub required'); return; }

  var cronPanelBody = document.getElementById('cronPanelBody');
  var cronTaskCount = document.getElementById('cronTaskCount');
  var cronBadge = document.getElementById('cronBadge');

  /* ── Cron parsing helpers ───────────────── */
  function cronDescription(expr) {
    var parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return expr;
    var m = parts[0], h = parts[1], dom = parts[2], mon = parts[3], dow = parts[4];
    if (m.startsWith('*/')) {
      var n = parseInt(m.substring(2));
      if (n && h === '*' && dom === '*' && mon === '*') return '每 ' + n + ' 分钟';
    }
    if (m.indexOf(',') !== -1 && h === '*' && dom === '*' && mon === '*') return '每小时第 ' + m + ' 分';
    if (m.match(/^\d+$/) && h === '*' && dom === '*' && mon === '*') return '每小时第 ' + m + ' 分';
    if (m.match(/^\d+$/) && h.match(/^\d+$/) && dom === '*' && mon === '*') return '每天 ' + h + ':' + m.padStart(2, '0');
    if (m.match(/^\d+$/) && h.match(/^\d+$/) && dom.match(/^\d+$/) && mon.match(/^\d+$/)) return mon + '月' + dom + '日 ' + h + ':' + m.padStart(2, '0');
    if (m.match(/^\d+$/) && h.match(/^\d+$/) && dom === '*' && mon === '*' && dow !== '*') {
      var days = { '0': '日', '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六' };
      var dows = dow.split(',').map(function(d) { return days[d] || d; }).join(',');
      return '每周' + dows + ' ' + h + ':' + m.padStart(2, '0');
    }
    return expr;
  }

  function cronStatus(item) {
    if (!item.lastFiredAt) return 'idle';
    var now = Date.now();
    var diff = now - item.lastFiredAt;
    try {
      var parts = item.cron.trim().split(/\s+/);
      if (parts.length === 5 && parts[0].startsWith('*/')) {
        var intervalMin = parseInt(parts[0].substring(2));
        if (diff < intervalMin * 60000 * 2) return 'active';
      }
      if (parts.length === 5 && parts[0].indexOf(',') !== -1) {
        if (diff < 3600000) return 'active';
      }
      if (parts.length === 5 && parts[0].match(/^\d+$/)) {
        if (diff < 7200000) return 'active';
      }
      if (diff > 86400000) return 'idle';
      return 'active';
    } catch(e) { return 'idle'; }
  }

  function nextFireEstimate(cronExpr, lastFiredAt) {
    try {
      var parts = cronExpr.trim().split(/\s+/);
      if (parts.length !== 5) return '';
      var m = parts[0], h = parts[1], dom = parts[2], mon = parts[3], dow = parts[4];
      var now = new Date();
      var base = lastFiredAt ? new Date(lastFiredAt) : now;
      if (m.startsWith('*/') && h === '*' && dom === '*' && mon === '*') {
        var interval = parseInt(m.substring(2)) || 5;
        var next = new Date(base.getTime() + interval * 60000);
        return next.toISOString().slice(0, 16).replace('T', ' ');
      }
      if (m.indexOf(',') !== -1 && h === '*' && dom === '*' && mon === '*') {
        var mins = m.split(',').map(Number);
        var curMin = now.getMinutes();
        var nextMin = mins.find(function(x) { return x > curMin; });
        if (nextMin === undefined) nextMin = mins[0];
        var next = new Date(now);
        next.setMinutes(nextMin, 0, 0);
        if (nextMin <= curMin) next.setHours(next.getHours() + 1);
        return next.toISOString().slice(0, 16).replace('T', ' ');
      }
      if (m.match(/^\d+$/) && h === '*' && dom === '*' && mon === '*') {
        var fm = parseInt(m);
        var next2 = new Date(now);
        next2.setMinutes(fm, 0, 0);
        if (fm <= now.getMinutes()) next2.setHours(next2.getHours() + 1);
        return next2.toISOString().slice(0, 16).replace('T', ' ');
      }
      if (m.match(/^\d+$/) && h.match(/^\d+$/) && dom === '*' && mon === '*') {
        var next3 = new Date(now);
        next3.setHours(parseInt(h), parseInt(m), 0, 0);
        if (next3 <= now) next3.setDate(next3.getDate() + 1);
        return next3.toISOString().slice(0, 16).replace('T', ' ');
      }
      if (m.match(/^\d+$/) && h.match(/^\d+$/) && dom === '*' && mon === '*' && dow !== '*') {
        var days = dow.split(',').map(Number);
        var next4 = new Date(now);
        next4.setHours(parseInt(h), parseInt(m), 0, 0);
        var curDay = now.getDay();
        var found = false;
        for (var di = 0; di < 7; di++) {
          var checkDay = (curDay + di) % 7;
          if (days.indexOf(checkDay) !== -1) {
            next4.setDate(next4.getDate() + di);
            if (di === 0 && next4 <= now) continue;
            found = true; break;
          }
        }
        if (found) return next4.toISOString().slice(0, 16).replace('T', ' ');
      }
      return '';
    } catch(e) { return ''; }
  }

  /* ── Vue reactive state ─────────────────── */
  var state = Vue.reactive({
    cronData: [],
    loading: false,
    error: null
  });

  /* ── Vue app ────────────────────────────── */
  var app = Vue.createApp({
    data: function() { return state; },
    computed: {
      tasks: function() {
        return this.cronData.map(function(item) {
          var status = cronStatus(item);
          var isActive = status === 'active';
          var desc = cronDescription(item.cron);
          var created = item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 16).replace('T', ' ') : '';
          var lastFired = item.lastFiredAt ? new Date(item.lastFiredAt).toISOString().slice(0, 16).replace('T', ' ') : '未触发';
          var recurring = item.recurring ? '循环' : '单次';
          var nextFire = (isActive && item.recurring) ? nextFireEstimate(item.cron, item.lastFiredAt) : '';
          var prompt = item.prompt || '';
          var promptLong = prompt.length > 80;
          var cdHtml = null;
          if (nextFire) {
            var diffMs = new Date(nextFire) - new Date();
            var diffMin = Math.floor(diffMs / 60000);
            var cdLabel = diffMin < 1 ? '即将触发' : diffMin < 60 ? diffMin + '分钟后' : diffMin < 1440 ? Math.floor(diffMin/60) + '小时后' : Math.floor(diffMin/1440) + '天后';
            cdHtml = { label: '⏱ ' + cdLabel, cls: diffMin < 5 ? 'soon' : 'later' };
          }
          return {
            desc: H.escHtml(desc),
            status: status,
            isActive: isActive,
            created: H.escHtml(created),
            lastFired: H.escHtml(lastFired),
            recurring: recurring,
            durable: item.durable,
            nextFire: nextFire ? H.escHtml(nextFire) : '',
            cdHtml: cdHtml,
            prompt: H.escHtml(prompt),
            promptLong: promptLong,
            cron: H.escHtml(item.cron)
          };
        });
      }
    },
    template: /* html */'<div v-if="loading" class="panel-loading yry-panel-loading">加载中...</div>'
      + '<div v-else-if="error" class="panel-empty yry-panel-empty">加载失败<br><span class="hint">{{ error }}</span></div>'
      + '<div v-else-if="tasks.length === 0" class="panel-empty yry-panel-empty">暂无调度任务<br><span class="hint">使用 Claude Code 的 <code>/loop</code> 命令创建定时任务</span></div>'
      + '<ul v-else class="cron-list">'
      +   '<li v-for="(t, i) in tasks" :key="i" :class="\'cron-item\' + (t.isActive ? \' active-item\' : \'\')">'
      +     '<div class="cr-row1"><span :class="t.isActive ? \'pulse-dot\' : \'cr-dot-idle\'"></span><span class="cr-desc">{{ t.desc }}</span>'
      +     '<span :class="\'cr-badge \' + (t.isActive ? \'active\' : \'idle\')">{{ t.isActive ? \'活跃\' : \'空闲\' }}</span>'
      +     '<span v-if="t.durable" class="cr-badge cr-badge-durable">💾持久</span>'
      +     '<span v-if="t.cdHtml" :class="\'cr-countdown \' + t.cdHtml.cls">{{ t.cdHtml.label }}</span>'
      +     '</div><div class="cr-row2 cr-raw">{{ t.cron }}</div>'
      +     '<div class="cr-row3"><span class="cr-badge cr-badge-meta">{{ t.recurring }}</span>'
      +     '<span class="cr-dot">·</span><span>创建: {{ t.created }}</span>'
      +     '<span class="cr-dot">·</span><span>上次: {{ t.lastFired }}</span></div>'
      +     '<div v-if="t.nextFire" class="cr-next">⏭ 预计下次: {{ t.nextFire }}</div>'
      +     '<div v-if="t.prompt" :class="\'cr-prompt\' + (t.promptLong ? \' collapsed\' : \'\')" :title="t.prompt">{{ t.prompt }}</div>'
      +   '</li>'
      + '</ul>'
  });

  function setupDOM() {
    /* ── Refresh ──────────────────────────── */
    var cronRefreshBtn = document.getElementById('cronRefresh');
    if (cronRefreshBtn) {
      cronRefreshBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        cronRefreshBtn.classList.add('spinning');
        state.cronData = []; state.loading = false; state.error = null;
        fetchCron().finally(function() { cronRefreshBtn.classList.remove('spinning'); });
      });
    }

    /* ── Prompt collapse/expand delegation ── */
    cronPanelBody.addEventListener('click', function(e) {
      var prompt = e.target.closest('.cr-prompt');
      if (prompt) {
        e.stopPropagation();
        prompt.classList.toggle('collapsed');
        prompt.classList.toggle('expanded');
      }
    });
  }

  function mountApp() {
    if (cronPanelBody) { app.mount(cronPanelBody); setupDOM(); return; }
    document.addEventListener('yry-cron-panel-ready', function() {
      cronPanelBody = document.getElementById('cronPanelBody');
      if (cronPanelBody) { app.mount(cronPanelBody); setupDOM(); }
    }, { once: true });
  }
  mountApp();

  /* ── PanelHub registration ───────────────── */
  H.register('cron', null, 'cronPanel', 'cronOverlay', function() {
    if (state.cronData.length === 0 && !state.loading) fetchCron();
  });

  /* ── Data fetching ───────────────────────── */
  async function fetchCron() {
    state.loading = true;
    state.error = null;
    try {
      var resp = await fetch(H.PATHS.scheduledTasks);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      state.cronData = (data.tasks || []).sort(function(a, b) {
        var aAt = a.lastFiredAt || a.createdAt || 0;
        var bAt = b.lastFiredAt || b.createdAt || 0;
        return bAt - aAt;
      });
    } catch(e) {
      state.cronData = [];
      state.error = e.message;
    }
    state.loading = false;
    if (cronTaskCount) cronTaskCount.textContent = state.cronData.length + ' 个任务';
    if (cronBadge) cronBadge.textContent = state.cronData.length > 0 ? String(state.cronData.length) : '';
  }
})();