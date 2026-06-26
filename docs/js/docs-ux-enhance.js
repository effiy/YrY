/**
 * YrY 文档中心 · UX 增强脚本
 * 从 docs/index.html 内联 <script> (原 712 行 32 个特性) 迁出
 *
 * 职责清单 (32 个特性,按执行顺序):
 *   1)  滚动进度条 — 委托 <yry-progress-bar> (Vue 3 CE) 渲染
 *   2)  主体淡入   — 等首屏 Vue 组件挂载后解除遮罩
 *   4)  滚动间谍   — quicknav chip 跟随当前可视 section (由 <yry-dashboard-quicknav> 内置 IO 接管)
 *   6)  Tab 切换淡入 — 监听 .yry-panel .on 类变化
 *   7)  Tab 状态持久化 — URL hash 同步 (#tab=dashboard|architecture|governance)
 *   8)  滚动揭示   — IntersectionObserver 让 section 渐入
 *   8b) 动态 section 兜底 — 监听 :mounted 事件后立即揭示
 *   10) 章节锚点复制 — hover 标题显示 # 按钮复制深链
 *   14) 章节入口计数徽章 — 自动注入到每个 .sr-title 后
 *   16) 章节折叠状态持久化 — localStorage 记忆用户折叠偏好
 *   17) 访问计数     — 独立 localStorage,卡片访问热度等内部统计
 *   17b) 访问计数更新时刷新卡片角标与排序
 *   18) 卡片网格化   — 将 sr-link 原地升级为带描述的卡片
 *   25) 重置所有偏好 — 清除 localStorage 并刷新
 *   26) 卡片入场交错索引 + section 返回顶部按钮
 *   27) 卡片复制链接按钮 — hover 显示,点击复制
 *   19) Cmd+P 打印快捷 — 全局触发原生打印 (已通过 @media print 优化)
 *   20) 统一 Toast 通知 — 委托 cdn/yry-toast (Vue 3 懒加载组件)
 *   21) J/K vim 风格章节导航 — 跳到上/下一个 section
 *   22) ? 快捷键帮助面板 — 动态构建,Esc 关闭
 *   29) 概览模式     — 按 o 键折叠所有 section 为标题
 *   32) sm-cards 交错索引 + score bar 加载动画 (已迁入 yry-dashboard-report)
 *
 * 依赖 (window 上):
 *   - YryProgressBar   (cdn/yry-progress-bar/index.js)
 *   - YryDashboardQuicknav  (cdn/yry-dashboard-quicknav/index.js)
 *   - YryDashboardReport    (cdn/yry-dashboard-report/index.js)
 *   - YryToast         (cdn/yry-toast/index.js)
 *   - YryReportSection (cdn/yry-report-section/index.js)
 *   - YrY.initTabs     (cdn/shared/index.js)
 */
  (function () {
    'use strict';
    var doc = document;
    var win = window;

    /* 1. 滚动进度条 — 委托 <yry-progress-bar> (Vue 3 CE) 渲染
       将 scrollY 映射为 done,可滚动距离映射为 total,pct 由组件计算 */
    function bindScrollProgress() {
      var bar = doc.getElementById('scroll-progress-app');
      if (!bar) return;
      var ticking = false;
      function updateProgress() {
        var h = doc.documentElement;
        var total = (h.scrollHeight - h.clientHeight) || 1;
        var done = Math.min(total, Math.max(0, win.scrollY));
        bar.total = total;
        bar.done = done;
        ticking = false;
      }
      win.addEventListener('scroll', function () {
        if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
      }, { passive: true });
      win.addEventListener('resize', function () {
        if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
      }, { passive: true });
      updateProgress();
    }
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', bindScrollProgress, { once: true });
    } else {
      bindScrollProgress();
    }

    /* 2. 主体淡入 — 等首屏 Vue 组件挂载后解除遮罩 */
    var container = doc.querySelector('.container');
    function reveal() {
      if (container) container.classList.add('is-ready');
    }
    if (doc.readyState === 'complete') {
      setTimeout(reveal, 80);
    } else {
      win.addEventListener('load', function () { setTimeout(reveal, 80); });
    }
    // 兜底: 1.2s 后强制可见,避免 load 事件被外部资源阻塞
    setTimeout(reveal, 1200);

    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, function (c) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
      });
    }

    /* 4. 滚动间谍 — quicknav chip 跟随当前可视 section
       (现由 <yry-dashboard-quicknav> 内置 IntersectionObserver 接管,
        见 cdn/yry-dashboard-quicknav/index.js → mounted → _initScrollSpy) */

    /* 6. Tab 切换淡入 — 通过监听 .on 类变化触发动画 */
    var panels = Array.prototype.slice.call(doc.querySelectorAll('.yry-panel'));
    var tabObs = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.attributeName === 'class' && m.target.classList.contains('on')) {
          m.target.style.animation = 'none';
          // reflow
          void m.target.offsetWidth;
          m.target.style.animation = '';
          syncTabHash(m.target.id);
        }
      });
    });
    panels.forEach(function (p) { tabObs.observe(p, { attributes: true, attributeFilter: ['class'] }); });

    /* 7. Tab 状态持久化 — URL hash 同步,刷新/分享保留当前 Tab */
    var tabTriggers = Array.prototype.slice.call(doc.querySelectorAll('.yry-tab[data-panel]'));
    var panelByTab = {};
    tabTriggers.forEach(function (t) {
      panelByTab[t.getAttribute('data-panel')] = t;
    });

    function syncTabHash(panelId) {
      var name = panelId.replace(/^panel/, '').toLowerCase();
      if (name && win.location.hash !== '#tab=' + name) {
        try {
          history.replaceState(null, '', '#tab=' + name);
        } catch (e) { /* ignore */ }
      }
    }

    function restoreTabFromHash() {
      var m = /^#tab=([a-z]+)/i.exec(win.location.hash);
      if (!m) return;
      var name = m[1].toLowerCase();
      var trigger = panelByTab[name];
      if (trigger && !trigger.classList.contains('on')) {
        // YrY.initTabs 已绑定 click,程序触发即可
        trigger.click();
      }
    }
    // 延迟以等 YrY.initTabs 完成
    setTimeout(restoreTabFromHash, 60);
    win.addEventListener('hashchange', restoreTabFromHash);

    /* 8. 滚动揭示 — IntersectionObserver 让 section 渐入 */
    var revealTargets = Array.prototype.slice.call(
      doc.querySelectorAll('#panelDashboard .score-report')
    );
    var revObs = null;
    if ('IntersectionObserver' in win) {
      revObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed');
            revObs.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
      revealTargets.forEach(function (t) { revObs.observe(t); });
      // 兜底: 4s 后强制全部可见,避免 viewport 极端情况下永不揭示
      setTimeout(function () {
        revealTargets.forEach(function (t) { t.classList.add('is-revealed'); });
      }, 4000);
    } else {
      revealTargets.forEach(function (t) { t.classList.add('is-revealed'); });
    }
    /* 8b. 动态 section 兜底 — <yry-report-section> 等 Vue 组件在观察者建立后才挂载
       渲染的 <section class="score-report">,需用 MutationObserver 补登记,
       避免停留在 opacity:0 不可见。监听到 :mounted 事件后立即揭示。 */
    function revealDynamicSection(host) {
      if (!host || !host.classList || !host.classList.contains('score-report')) return;
      if (host.classList.contains('is-revealed')) return;
      host.classList.add('is-revealed');
      if (revObs) {
        try { revObs.unobserve(host); } catch (e) { /* noop */ }
      }
    }
    document.addEventListener('yry-report-section-ready:mounted', function (e) {
      if (e && e.detail && e.detail.host) revealDynamicSection(e.detail.host);
    });

    /* 10. 章节锚点复制 — hover 标题显示 # 按钮复制深链 */
    var anchorTargets = Array.prototype.slice.call(
      doc.querySelectorAll('.sr-title[id], .sm-title[id]')
    );
    anchorTargets.forEach(function (title) {
      // 避免重复注入
      if (title.querySelector('.yry-anchor-copy')) return;
      var id = title.id;
      if (!id) return;
      var btn = doc.createElement('a');
      btn.className = 'yry-anchor-copy';
      btn.href = '#' + id;
      btn.title = '复制锚点链接 #' + id;
      btn.setAttribute('aria-label', '复制锚点链接 ' + id);
      btn.textContent = '#';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var url = win.location.origin + win.location.pathname + '#tab=dashboard&sec=' + id;
        var done = function () {
          btn.classList.add('is-copied');
          btn.textContent = '✓';
          setTimeout(function () {
            btn.classList.remove('is-copied');
            btn.textContent = '#';
          }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(function () {
            // fallback
            var tmp = doc.createElement('textarea');
            tmp.value = url; doc.body.appendChild(tmp); tmp.select();
            try { doc.execCommand('copy'); done(); } catch (err) {}
            doc.body.removeChild(tmp);
          });
        }
      });
      title.appendChild(btn);
    });

    // 折叠按钮引用 — 被 16. 章节折叠状态持久化 使用
    var collapseBtns = Array.prototype.slice.call(doc.querySelectorAll('.sr-collapse-btn'));

    /* 14. 章节入口计数徽章 — 自动注入到每个 .sr-title 后 */
    function injectCountBadges() {
      var titles = Array.prototype.slice.call(
        doc.querySelectorAll('#panelDashboard .score-report .sr-title')
      );
      titles.forEach(function (t) {
        if (t.querySelector('.sr-count-badge')) return;
        var sec = t.closest('.score-report');
        if (!sec) return;
        var links = sec.querySelectorAll('.sr-link');
        if (!links.length) return;
        var badge = doc.createElement('span');
        badge.className = 'sr-count-badge';
        badge.textContent = links.length + ' 个入口';
        t.appendChild(badge);
      });
    }
    injectCountBadges();

    /* 16. 章节折叠状态持久化 — localStorage 记忆用户折叠偏好 */
    var COLLAPSE_KEY = 'yry-collapse-v1';
    function readCollapseState() {
      try {
        var raw = localStorage.getItem(COLLAPSE_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    }
    function writeCollapseState(state) {
      try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(state)); } catch (e) {}
    }
    var collapseState = readCollapseState();
    // 恢复折叠状态 — 等到 sr-collapse-btn 渲染完成后
    function applyCollapseState() {
      collapseBtns.forEach(function (b) {
        var targetId = b.getAttribute('data-target');
        if (!targetId) return;
        var wantCollapsed = collapseState[targetId];
        var isCollapsed = b.getAttribute('aria-expanded') !== 'true';
        if (wantCollapsed && !isCollapsed) b.click();
        else if (!wantCollapsed && isCollapsed) b.click();
      });
    }
    setTimeout(applyCollapseState, 120);
    // 监听折叠按钮点击,持久化状态
    collapseBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var targetId = b.getAttribute('data-target');
        if (!targetId) return;
        // 等下一帧,让 aria-expanded 更新
        setTimeout(function () {
          var expanded = b.getAttribute('aria-expanded') === 'true';
          collapseState[targetId] = !expanded;
          writeCollapseState(collapseState);
        }, 30);
      });
    });

    /* 17. 访问计数 — 独立 localStorage,用于卡片访问热度等内部统计 */
    var COUNT_KEY = 'yry-visit-count-v1';
    function readCounts() {
      try {
        var raw = localStorage.getItem(COUNT_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    }
    function writeCounts(obj) {
      try { localStorage.setItem(COUNT_KEY, JSON.stringify(obj)); } catch (e) {}
    }
    function bumpCount(href) {
      if (!href || href.charAt(0) === '#') return;
      var counts = readCounts();
      counts[href] = (counts[href] || 0) + 1;
      writeCounts(counts);
    }
    // 拦截 sr-link 点击,累加计数 (复用事件委托)
    doc.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.sr-link');
      if (a) bumpCount(a.getAttribute('href'));
    }, true);

    /* 18. 卡片网格化 — 将 sr-link 原地升级为带描述的卡片 (保留元素引用) */
    var UPGRADED_SECTIONS = ['详细报告导航', '技能市场', 'CDN 共享前端资源库', '治理规则'];
    var SORT_KEY = 'yry-sort-pref-v1';
    function readSortPrefs() {
      try { return JSON.parse(localStorage.getItem(SORT_KEY) || '{}'); } catch (e) { return {}; }
    }
    function writeSortPrefs(obj) {
      try { localStorage.setItem(SORT_KEY, JSON.stringify(obj)); } catch (e) {}
    }
    var sortPrefs = readSortPrefs();

    function upgradeReportCards() {
      var titles = Array.prototype.slice.call(
        doc.querySelectorAll('#panelDashboard .sr-title')
      );
      titles.forEach(function (t) {
        var rawText = t.textContent.replace(/\d+\s*个入口.*$/, '').trim();
        var matched = UPGRADED_SECTIONS.some(function (kw) {
          return rawText.indexOf(kw) >= 0;
        });
        if (!matched) return;
        var sec = t.closest('.score-report');
        if (!sec || sec.dataset.upgraded) return;
        var linksContainer = sec.querySelector('.sr-links');
        if (!linksContainer) return;
        var links = Array.prototype.slice.call(linksContainer.querySelectorAll('.sr-link'));
        if (!links.length) return;
        var grid = doc.createElement('div');
        grid.className = 'yry-card-grid';
        var counts = readCounts();
        links.forEach(function (a) {
          var href = a.getAttribute('href') || '';
          var title = a.getAttribute('title') || '';
          var label = a.textContent.trim().replace(/\s+/g, ' ');
          var iconMatch = label.match(/^(\S+)/);
          var icon = iconMatch ? iconMatch[1] : '•';
          var cleanLabel = label.replace(/^\S+\s*/, '') || label;
          var desc = title.split('—').slice(1).join('—').trim() || title;
          var visit = counts[href] || 0;
          a.classList.add('yry-report-card');
          if (visit > 0) a.setAttribute('data-visited', '1');
          a.setAttribute('data-visit-count', String(visit));
          a.setAttribute('data-label', cleanLabel);
          // 热力等级
          var heat = 0;
          if (visit >= 6) heat = 3;
          else if (visit >= 3) heat = 2;
          else if (visit >= 1) heat = 1;
          if (heat > 0) a.setAttribute('data-heat', String(heat));
          a.innerHTML =
            '<div class="yry-report-card-head">' +
              '<span class="yry-report-card-icon">' + escapeHtml(icon) + '</span>' +
              '<span class="yry-report-card-label">' + escapeHtml(cleanLabel) + '</span>' +
            '</div>' +
            '<div class="yry-report-card-desc">' + escapeHtml(desc.slice(0, 110)) + '</div>' +
            (visit > 0 ? '<span class="yry-report-card-visit">已访问 ' + visit + ' 次</span>' : '');
          grid.appendChild(a);
        });
        linksContainer.parentNode.replaceChild(grid, linksContainer);
        sec.dataset.upgraded = '1';
        sec._cardGrid = grid;
        // 注入排序下拉
        injectSortSelect(sec, grid, t);
      });
    }

    function injectSortSelect(sec, grid, titleEl) {
      var header = sec.querySelector('.sr-header');
      if (!header || header.querySelector('.yry-sort-select')) return;
      var select = doc.createElement('select');
      select.className = 'yry-sort-select';
      select.setAttribute('aria-label', '卡片排序方式');
      select.innerHTML =
        '<option value="default">默认顺序</option>' +
        '<option value="alpha">按字母</option>' +
        '<option value="visits">按访问频率</option>';
      var secKey = (titleEl.textContent || '').trim().slice(0, 20);
      if (sortPrefs[secKey]) select.value = sortPrefs[secKey];
      select.addEventListener('change', function () {
        sortCards(grid, select.value);
        sortPrefs[secKey] = select.value;
        writeSortPrefs(sortPrefs);
      });
      header.appendChild(select);
      // 应用已保存的排序
      if (sortPrefs[secKey] && sortPrefs[secKey] !== 'default') {
        sortCards(grid, sortPrefs[secKey]);
      }
    }

    function sortCards(grid, mode) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.yry-report-card'));
      if (mode === 'alpha') {
        cards.sort(function (a, b) {
          return (a.getAttribute('data-label') || '').localeCompare(
            b.getAttribute('data-label') || '', 'zh-Hans');
        });
      } else if (mode === 'visits') {
        cards.sort(function (a, b) {
          var av = parseInt(a.getAttribute('data-visit-count') || '0', 10);
          var bv = parseInt(b.getAttribute('data-visit-count') || '0', 10);
          return bv - av;
        });
      } else {
        // default: 按 data-order (注入时已保存) 或 DOM 顺序
        cards.sort(function (a, b) {
          var ao = parseInt(a.getAttribute('data-order') || '0', 10);
          var bo = parseInt(b.getAttribute('data-order') || '0', 10);
          return ao - bo;
        });
      }
      cards.forEach(function (c) { grid.appendChild(c); });
    }

    // 首次升级时给每张卡打 data-order
    setTimeout(function () {
      upgradeReportCards();
      // 标记原始顺序
      doc.querySelectorAll('#panelDashboard .yry-card-grid').forEach(function (grid) {
        grid.querySelectorAll('.yry-report-card').forEach(function (card, i) {
          card.setAttribute('data-order', String(i));
        });
      });
      // 应用已保存的排序偏好
      Object.keys(sortPrefs).forEach(function (k) {
        var mode = sortPrefs[k];
        if (mode && mode !== 'default') {
          // 找到对应的 grid
          var titles = Array.prototype.slice.call(doc.querySelectorAll('#panelDashboard .sr-title'));
          titles.forEach(function (t) {
            if ((t.textContent || '').trim().slice(0, 20) === k) {
              var sec = t.closest('.score-report');
              if (sec && sec._cardGrid) sortCards(sec._cardGrid, mode);
            }
          });
        }
      });
    }, 200);

    /* 17b. 当访问计数更新时,刷新卡片角标与排序 */
    function refreshCardVisitState() {
      var counts = readCounts();
      doc.querySelectorAll('#panelDashboard .yry-report-card').forEach(function (card) {
        var href = card.getAttribute('href') || '';
        var visit = counts[href] || 0;
        card.setAttribute('data-visit-count', String(visit));
        card.setAttribute('data-visited', visit > 0 ? '1' : '0');
        // 热力等级: 1-2 次=1, 3-5 次=2, 6+ 次=3
        var heat = 0;
        if (visit >= 6) heat = 3;
        else if (visit >= 3) heat = 2;
        else if (visit >= 1) heat = 1;
        if (heat > 0) card.setAttribute('data-heat', String(heat));
        else card.removeAttribute('data-heat');
        var visitBadge = card.querySelector('.yry-report-card-visit');
        if (visit > 0) {
          if (!visitBadge) {
            visitBadge = doc.createElement('span');
            visitBadge.className = 'yry-report-card-visit';
            card.appendChild(visitBadge);
          }
          visitBadge.textContent = '已访问 ' + visit + ' 次';
        } else if (visitBadge) {
          visitBadge.remove();
        }
      });
    }

    /* 26. 卡片入场交错索引 + section 返回顶部按钮 */
    function injectStaggerIndex() {
      doc.querySelectorAll('#panelDashboard .yry-card-grid').forEach(function (grid) {
        grid.querySelectorAll('.yry-report-card').forEach(function (card, i) {
          card.style.setProperty('--yry-i', i);
        });
      });
    }
    /* 27. 卡片复制链接按钮 — hover 显示,点击复制 */
    function injectCopyButtons() {
      var cards = doc.querySelectorAll('#panelDashboard .yry-report-card');
      cards.forEach(function (card) {
        if (card.querySelector('.yry-report-card-copy')) return;
        var btn = doc.createElement('button');
        btn.className = 'yry-report-card-copy';
        btn.type = 'button';
        btn.title = '复制链接';
        btn.setAttribute('aria-label', '复制此入口的链接');
        btn.textContent = '📋';
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var href = card.getAttribute('href') || '';
          if (!href) return;
          var url = win.location.origin + win.location.pathname.replace(/[^/]*$/, '') + href.replace(/^\.\.\//, '../');
          var done = function () {
            btn.classList.add('is-copied');
            btn.textContent = '✓';
            yryToast('已复制链接到剪贴板', 'success', '链接已复制');
            setTimeout(function () {
              btn.classList.remove('is-copied');
              btn.textContent = '📋';
            }, 1400);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done).catch(function () {
              var tmp = doc.createElement('textarea');
              tmp.value = url; doc.body.appendChild(tmp); tmp.select();
              try { doc.execCommand('copy'); done(); } catch (err) {}
              doc.body.removeChild(tmp);
            });
          }
        });
        card.appendChild(btn);
      });
    }

    setTimeout(function () {
      injectStaggerIndex();
      injectCopyButtons();
    }, 280);

    /* 19. Cmd+P 打印快捷 — 全局触发原生打印 */
    doc.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'p' || e.key === 'P')) {
        // 不阻止默认行为 — 让浏览器打印当前页面 (已通过 @media print 优化)
        // 仅在用户按住 Shift+Cmd+P 时给一个 toast 提示
      }
    });

    /* 20. 统一 Toast 通知 — 委托 cdn/yry-toast (Vue 3 懒加载组件) */
    function yryToast(text, type, title) {
      if (!window.YryToast) return;
      /* 兼容旧调用: 'warning' → 'warn',其他未识别类型由组件归一化为 'default' */
      window.YryToast.show(String(text == null ? '' : text), type || 'info', title || '');
    }
    // 替换锚点复制的内联 ✓ 反馈为 toast
    // (保留 ✓ 视觉反馈,额外加 toast 提示 — 修改第 10 步的 done 函数)
    // 通过事件委托监听 .yry-anchor-copy 的 click,在复制成功后发 toast
    doc.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.yry-anchor-copy');
      if (!btn) return;
      // 等待复制完成 (clipboard API 异步)
      setTimeout(function () {
        if (btn.classList.contains('is-copied')) {
          yryToast('已复制锚点链接到剪贴板', 'success', '链接已复制');
        }
      }, 100);
    });

    /* 21. J/K vim 风格章节导航 — 跳到上/下一个 section */
    function getVisibleSections() {
      return Array.prototype.slice.call(
        doc.querySelectorAll('#panelDashboard section[id]')
      ).filter(function (s) {
        return s.style.display !== 'none';
      });
    }
    function currentSectionIndex(sections) {
      var viewportMid = win.scrollY + win.innerHeight * 0.35;
      var idx = 0;
      for (var i = 0; i < sections.length; i++) {
        var top = sections[i].getBoundingClientRect().top + win.scrollY;
        if (top <= viewportMid) idx = i;
      }
      return idx;
    }
    function jumpSection(delta) {
      var sections = getVisibleSections();
      if (!sections.length) return;
      var idx = currentSectionIndex(sections);
      var target = sections[Math.max(0, Math.min(sections.length - 1, idx + delta))];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        yryToast('跳到 ' + (target.querySelector('.sr-title, .sm-title') || target).textContent.trim().slice(0, 30), 'info');
      }
    }

    /* 22. ? 快捷键帮助面板 */
    var helpTrigger = doc.getElementById('yry-help-trigger');
    var helpBackdrop = null;
    function buildHelp() {
      if (helpBackdrop) return;
      helpBackdrop = doc.createElement('div');
      helpBackdrop.className = 'yry-help-backdrop';
      helpBackdrop.setAttribute('role', 'dialog');
      helpBackdrop.setAttribute('aria-modal', 'true');
      helpBackdrop.setAttribute('aria-label', '键盘快捷键');
      var shortcuts = [
        [['Esc'], '关闭面板'],
        [['1'], '切换到仪表板 Tab'],
        [['2'], '切换到架构 Tab'],
        [['3'], '切换到治理 Tab'],
        [['J'], '下一个章节'],
        [['K'], '上一个章节'],
        [['o'], '概览模式 (折叠所有章节)'],
        [['?'], '显示此帮助'],
        [['Tab'], '在面板内循环焦点'],
        [['⌘', 'P'], '打印页面 (已优化样式)']
      ];
      var html = '<div class="yry-help-panel">' +
        '<div class="yry-help-title">⌨ 键盘快捷键</div>' +
        '<div class="yry-help-sub">YrY 文档中心 · 全局可用</div>' +
        '<div class="yry-help-grid">';
      shortcuts.forEach(function (s) {
        var keys = s[0].map(function (k) { return '<kbd>' + escapeHtml(k) + '</kbd>'; }).join('<span style="opacity:.4">+</span>');
        html += '<div class="yry-help-row"><span>' + escapeHtml(s[1]) + '</span><span class="yry-help-keys">' + keys + '</span></div>';
      });
      html += '</div><button class="yry-help-close" type="button">关闭 (Esc)</button></div>';
      helpBackdrop.innerHTML = html;
      doc.body.appendChild(helpBackdrop);
      helpBackdrop.addEventListener('click', function (e) {
        if (e.target === helpBackdrop || e.target.closest('.yry-help-close')) closeHelp();
      });
    }
    function openHelp() {
      buildHelp();
      helpBackdrop.classList.add('is-open');
      helpBackdrop.querySelector('.yry-help-close').focus();
    }
    function closeHelp() {
      if (!helpBackdrop) return;
      helpBackdrop.classList.remove('is-open');
      if (helpTrigger) helpTrigger.focus();
    }
    if (helpTrigger) {
      helpTrigger.addEventListener('click', openHelp);
    }

    /* 29. 概览模式 — 按 o 键折叠所有 section 为标题,点击展开单段 */
    var panelDashboard = doc.getElementById('panelDashboard');
    var overviewActive = false;
    function toggleOverview() {
      overviewActive = !overviewActive;
      if (panelDashboard) panelDashboard.classList.toggle('is-overview', overviewActive);
      if (overviewActive) {
        // 进入概览: 清除所有 is-expanded
        doc.querySelectorAll('#panelDashboard .score-report, #panelDashboard .score-methodology')
          .forEach(function (s) { s.classList.remove('is-expanded'); });
        yryToast('已进入概览模式 — 点击标题展开', 'info', '概览模式');
      } else {
        // 退出概览: 清除所有 is-expanded
        doc.querySelectorAll('#panelDashboard .score-report, #panelDashboard .score-methodology')
          .forEach(function (s) { s.classList.remove('is-expanded'); });
        yryToast('已退出概览模式', 'info', '概览模式');
      }
    }
    // 点击标题切换展开 (仅概览模式)
    if (panelDashboard) {
      panelDashboard.addEventListener('click', function (e) {
        if (!overviewActive) return;
        var title = e.target.closest && e.target.closest('.sr-title, .sm-title');
        if (!title) return;
        // 避免点击锚点复制按钮触发
        if (e.target.closest('.yry-anchor-copy')) return;
        var sec = title.closest('.score-report, .score-methodology');
        if (sec) {
          sec.classList.toggle('is-expanded');
          if (sec.classList.contains('is-expanded')) {
            // 展开后滚动到可视位置
            setTimeout(function () {
              sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
          }
        }
      });
    }

    /* 32. sm-cards 交错索引 + score bar 加载动画 */
    /* 注: 已迁入 cdn/yry-dashboard-report/index.js
       (window.YryDashboardReport.animateSmCards) + index.css (动画规则)。
       旧的内联实现已移除,由 dashboard-report 组件统一负责。
       若 dashboard-report JS 未加载,提供兜底调用入口: */
    if (!window.YryDashboardReport) {
      setTimeout(function () {
        var cards = Array.prototype.slice.call(
          doc.querySelectorAll('.score-methodology .sm-card')
        );
        cards.forEach(function (c, i) { c.style.setProperty('--sm-i', i); });
      }, 300);
    }
    var helpOpen = false;
    doc.addEventListener('keydown', function (e) {
      var inField = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      // ? 打开帮助 (非输入态)
      if (e.key === '?' && !inField && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (helpOpen) closeHelp(); else openHelp();
        helpOpen = !helpOpen;
      } else if (e.key === 'Escape' && helpOpen) {
        closeHelp();
        helpOpen = false;
      } else if ((e.key === 'j' || e.key === 'J') && !inField && !e.metaKey && !e.ctrlKey && !helpOpen) {
        e.preventDefault();
        jumpSection(1);
      } else if ((e.key === 'k' || e.key === 'K') && !inField && !e.metaKey && !e.ctrlKey && !helpOpen) {
        e.preventDefault();
        jumpSection(-1);
      } else if ((e.key === '1' || e.key === '2' || e.key === '3') && !inField && !e.metaKey && !e.ctrlKey && !helpOpen) {
        // 数字键 1/2/3 切换 Tab
        var idx = parseInt(e.key, 10) - 1;
        if (tabTriggers[idx] && !tabTriggers[idx].classList.contains('on')) {
          e.preventDefault();
          tabTriggers[idx].click();
          yryToast(['评分仪表板', '技能架构', 'Agent与治理'][idx], 'info', '切换到 Tab');
        }
      } else if ((e.key === 'o' || e.key === 'O') && !inField && !e.metaKey && !e.ctrlKey && !helpOpen) {
        // o 键切换概览模式
        e.preventDefault();
        toggleOverview();
      }
    });

    /* 25. 重置所有偏好 — 清除 localStorage 并刷新 */
    function resetAllPreferences() {
      var keys = ['yry-visit-count-v1', 'yry-collapse-v1',
                  'yry-sort-pref-v1', 'yry-view-mode-v1'];
      keys.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
      yryToast('已清除所有本地偏好,即将刷新...', 'success', '偏好已重置');
      setTimeout(function () { win.location.reload(); }, 1200);
    }
    // 在帮助面板注入重置按钮
    function injectResetButton() {
      if (!helpBackdrop) return;
      if (helpBackdrop.querySelector('.yry-help-reset')) return;
      var panel = helpBackdrop.querySelector('.yry-help-panel');
      if (!panel) return;
      var btn = doc.createElement('button');
      btn.className = 'yry-help-reset';
      btn.type = 'button';
      btn.textContent = '🗑 重置所有本地偏好 (最近访问 · 排序 · 视图 · 折叠)';
      btn.addEventListener('click', function () {
        if (confirm('确定清除所有本地偏好设置?此操作不可撤销。')) {
          resetAllPreferences();
        }
      });
      panel.appendChild(btn);
    }
  })();
