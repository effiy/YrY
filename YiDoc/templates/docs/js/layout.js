/*!
 * YrY Docs - Shared Layout Injector
 * --------------------------------------------------------------------------
 * Single source of truth for the sidebar/topbar/footer scaffold across all
 * sub-project documentation sites under YiDoc/projects/. Reads per-project
 * configuration from `window.YRY_DOC_CONFIG` (set by each project's
 * `assets/js/layout.js` shim) and injects the DOM wrapper, sidebar, topbar,
 * and footer around the static `#page-content` element.
 *
 * Interaction features (10):
 *   1. Dark/light theme toggle (localStorage-backed)
 *   2. Sidebar state persistence (localStorage-backed)
 *   3. Active-link sync (data-page matching)
 *   4. Back-to-top button (scroll-triggered)
 *   5. Page loading fade (body.loading → fade-in)
 *   6. Sidebar search filter (filter pages by label)
 *   7. Keyboard shortcut (Cmd/Ctrl+K → focus search)
 *   8. TOC auto-generation (h2/h3 → right-side TOC + scroll-spy)
 *   9. Code block copy buttons (<pre><code> → clipboard)
 *  10. External link indicator (<a target="_blank"> → ↗)
 */
(function () {
    'use strict';

    // --------------------------------------------------------------------
    // 0. Config (set by per-project shim before this script loads)
    // --------------------------------------------------------------------
    var CFG = window.YRY_DOC_CONFIG || {};
    var PAGES        = CFG.pages        || [];
    var BRAND        = CFG.brand        || 'YrY';
    var TAGLINE      = CFG.tagline      || BRAND;
    var VERSION      = CFG.version      || '';
    var MANIFEST_URL = CFG.manifestUrl  || '';
    var MANIFEST_LABEL = CFG.manifestLabel || 'Source';
    var BRAND_COLOR  = CFG.brandColor   || '#22C55E';
    var THEME_KEY    = 'yry-doc-theme';   // 'light' | 'dark' | 'auto'
    var SIDEBAR_KEY  = 'yry-doc-sidebar'; // 'open' | 'collapsed'

    // --------------------------------------------------------------------
    // 1. Helpers
    // --------------------------------------------------------------------
    function currentPageKey() {
        var main = document.getElementById('page-content');
        return (main && main.getAttribute('data-page')) || 'index';
    }

    function currentPageTitle() {
        for (var i = 0; i < PAGES.length; i++) {
            if (PAGES[i].key === currentPageKey()) return PAGES[i].label;
        }
        return 'Documentation';
    }

    function qs(sel, root) { return (root || document).querySelector(sel); }
    function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    // --------------------------------------------------------------------
    // 2. DOM builders
    // --------------------------------------------------------------------
    function buildSidebar(activeKey) {
        var items = '';
        for (var i = 0; i < PAGES.length; i++) {
            var p = PAGES[i];
            var isActive = p.key === activeKey ? ' class="active"' : '';
            items += ''
                + '<li data-page-key="' + p.key + '">'
                +   '<a href="' + p.href + '"' + isActive + '>'
                +     '<i class="' + p.icon + '"></i>'
                +     '<span> ' + p.label + ' </span>'
                +   '</a>'
                + '</li>';
        }
        return ''
            + '<div class="left-side-menu">'
            +   '<div class="logo-box">'
            +     '<a href="index.html" class="logo logo-light">'
            +       '<span class="logo-sm"><img src="../../../templates/docs/images/logo-sm.svg" alt="" height="24"></span>'
            +       '<span class="logo-lg"><img src="../../../templates/docs/images/logo-light.svg" alt="" height="20"></span>'
            +     '</a>'
            +   '</div>'
            +   '<div class="sidebar-search-wrap">'
            +     '<div class="sidebar-search">'
            +       '<i class="ri-search-line"></i>'
            +       '<input type="search" id="sidebar-search-input" placeholder="Search docs… (Ctrl+K)" autocomplete="off" spellcheck="false">'
            +     '</div>'
            +   '</div>'
            +   '<div class="h-100" data-simplebar>'
            +     '<div id="sidebar-menu">'
            +       '<ul id="side-menu">'
            +         '<li class="menu-title">Docs</li>'
            +         items
            +       '</ul>'
            +     '</div>'
            +     '<div class="clearfix"></div>'
            +   '</div>'
            + '</div>';
    }

    function buildTopbar() {
        var versionBadge = VERSION
            ? '<li class="d-none d-sm-inline-block">'
            +   '<div class="nav-link version-badge">'
            +     '<span class="badge font-sm" style="background:' + BRAND_COLOR + '">' + VERSION + '</span>'
            +   '</div>'
            + '</li>'
            : '';
        var manifestLink = MANIFEST_URL
            ? '<li class="d-none d-md-inline-block">'
            +   '<a href="' + MANIFEST_URL + '" class="nav-link" target="_blank" rel="noopener" title="View ' + MANIFEST_LABEL + '">'
            +     '<i class="ri-code-s-slash-line me-1"></i> ' + MANIFEST_LABEL
            +   '</a>'
            + '</li>'
            : '';
        return ''
            + '<div class="navbar-custom">'
            +   '<div class="container-fluid">'
            +     '<div class="topbar-left">'
            +       '<button class="button-menu-mobile" aria-label="Toggle navigation">'
            +         '<i class="ri-menu-line"></i>'
            +       '</button>'
            +       '<a href="index.html" class="topbar-logo">'
            +         '<img src="../../../templates/docs/images/logo-sm.svg" alt="' + BRAND + '" height="24">'
            +       '</a>'
            +     '</div>'
            +     '<div class="topbar-center d-none d-md-flex">'
            +       '<span class="topbar-page-title">' + BRAND + ' Documentation</span>'
            +     '</div>'
            +     '<div class="topbar-right">'
            +       '<ul class="list-unstyled topnav-menu">'
            +         '<li>'
            +           '<button id="theme-toggle" aria-label="Toggle theme" title="Toggle dark/light mode">'
            +             '<i class="ri-moon-line theme-icon-moon"></i>'
            +             '<i class="ri-sun-line theme-icon-sun"></i>'
            +             '<i class="ri-computer-line theme-icon-auto"></i>'
            +           '</button>'
            +         '</li>'
            +         manifestLink
            +         versionBadge
            +       '</ul>'
            +     '</div>'
            +   '</div>'
            + '</div>';
    }

    function buildFooter() {
        return ''
            + '<footer class="footer">'
            +   '<div class="container-fluid">'
            +     '<div class="row">'
            +       '<div class="col-md-6"><span id="footer-year"></span> &copy; ' + BRAND + (TAGLINE && TAGLINE !== BRAND ? ' · ' + TAGLINE : '') + '</div>'
            +       '<div class="col-md-6">'
            +         '<div class="text-md-end footer-links d-none d-sm-block">'
            +           '<a href="https://github.com" target="_blank" rel="noopener">YrY</a>'
            +         '</div>'
            +       '</div>'
            +     '</div>'
            +   '</div>'
            + '</footer>';
    }

    // --------------------------------------------------------------------
    // 3. Injection
    // --------------------------------------------------------------------
    function inject() {
        var content = document.getElementById('page-content');
        if (!content) return;

        var pageKey = currentPageKey();
        var wrapper = document.createElement('div');
        wrapper.id = 'wrapper';

        var skipLink = document.createElement('a');
        skipLink.href = '#page-container';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to content';
        document.body.appendChild(skipLink);

        var sidebarDiv = document.createElement('div');
        sidebarDiv.innerHTML = buildSidebar(pageKey);
        while (sidebarDiv.firstChild) {
            wrapper.appendChild(sidebarDiv.firstChild);
        }

        var contentPage = document.createElement('div');
        contentPage.className = 'content-page';

        var contentArea = document.createElement('div');
        contentArea.className = 'content';

        var topbarDiv = document.createElement('div');
        topbarDiv.innerHTML = buildTopbar();
        while (topbarDiv.firstChild) {
            contentArea.appendChild(topbarDiv.firstChild);
        }

        var container = document.createElement('div');
        container.className = 'container-fluid';
        container.id = 'page-container';

        while (content.firstChild) {
            container.appendChild(content.firstChild);
        }
        contentArea.appendChild(container);
        contentPage.appendChild(contentArea);

        var footerDiv = document.createElement('div');
        footerDiv.innerHTML = buildFooter();
        while (footerDiv.firstChild) {
            contentPage.appendChild(footerDiv.firstChild);
        }

        wrapper.appendChild(contentPage);
        document.body.appendChild(wrapper);

        var backToTop = document.createElement('button');
        backToTop.id = 'back-to-top';
        backToTop.className = 'back-to-top';
        backToTop.setAttribute('aria-label', 'Back to top');
        backToTop.innerHTML = '<i class="ri-arrow-up-s-line"></i>';
        document.body.appendChild(backToTop);
    }

    // --------------------------------------------------------------------
    // 4. Theme (dark/light/auto)
    // --------------------------------------------------------------------
    function applyTheme(mode) {
        var effective = mode;
        if (mode === 'auto') {
            effective = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-bs-theme', effective);
        document.documentElement.setAttribute('data-yry-theme', mode);
        updateThemeIcon(mode);
    }

    function updateThemeIcon(mode) {
        var btn = qs('#theme-toggle');
        if (!btn) return;
        var moon = qs('.theme-icon-moon', btn);
        var sun  = qs('.theme-icon-sun',  btn);
        var auto = qs('.theme-icon-auto', btn);
        if (moon) moon.style.display = mode === 'dark'  ? '' : 'none';
        if (sun)  sun.style.display  = mode === 'light' ? '' : 'none';
        if (auto) auto.style.display = mode === 'auto'  ? '' : 'none';
    }

    function cycleTheme() {
        var current = localStorage.getItem(THEME_KEY) || 'auto';
        var next = current === 'dark' ? 'light' : current === 'light' ? 'auto' : 'dark';
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
    }

    function wireTheme() {
        applyTheme(localStorage.getItem(THEME_KEY) || 'auto');
        var btn = qs('#theme-toggle');
        if (btn) btn.addEventListener('click', cycleTheme);
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
                if ((localStorage.getItem(THEME_KEY) || 'auto') === 'auto') applyTheme('auto');
            });
        }
    }

    // --------------------------------------------------------------------
    // 5. Sidebar state (collapse/expand)
    // --------------------------------------------------------------------
    function wireSidebarToggle() {
        var btn = qs('.button-menu-mobile');
        var body = document.body;
        var saved = localStorage.getItem(SIDEBAR_KEY);
        if (saved === 'collapsed') body.classList.add('sidebar-collapsed');

        if (btn) {
            btn.addEventListener('click', function () {
                body.classList.toggle('sidebar-collapsed');
                localStorage.setItem(SIDEBAR_KEY,
                    body.classList.contains('sidebar-collapsed') ? 'collapsed' : 'open');
            });
        }
        // Close sidebar when clicking a link on mobile
        qsa('#side-menu a').forEach(function (a) {
            a.addEventListener('click', function () {
                if (window.innerWidth <= 991) {
                    body.classList.add('sidebar-collapsed');
                    localStorage.setItem(SIDEBAR_KEY, 'collapsed');
                }
            });
        });
    }

    // --------------------------------------------------------------------
    // 6. Back-to-top
    // --------------------------------------------------------------------
    function wireBackToTop() {
        var btn = qs('#back-to-top');
        if (!btn) return;
        function onScroll() {
            if (window.scrollY > 300) btn.classList.add('show');
            else btn.classList.remove('show');
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --------------------------------------------------------------------
    // 7. Sidebar search (Ctrl/Cmd+K to focus, filter by label)
    // --------------------------------------------------------------------
    function wireSidebarSearch() {
        var input = qs('#sidebar-search-input');
        if (!input) return;
        var items = qsa('#side-menu li[data-page-key]');

        input.addEventListener('input', function () {
            var q = input.value.trim().toLowerCase();
            items.forEach(function (li) {
                var label = (li.textContent || '').toLowerCase();
                li.style.display = !q || label.indexOf(q) !== -1 ? '' : 'none';
            });
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                input.value = '';
                input.dispatchEvent(new Event('input'));
                input.blur();
            }
            if (e.key === 'Enter') {
                var first = items.filter(function (li) { return li.style.display !== 'none'; })[0];
                if (first) {
                    var a = qs('a', first);
                    if (a) a.click();
                }
            }
        });
    }

    // --------------------------------------------------------------------
    // 8. Keyboard shortcut (Cmd/Ctrl+K → focus search)
    // --------------------------------------------------------------------
    function wireKeyboardShortcuts() {
        document.addEventListener('keydown', function (e) {
            var isMod = e.metaKey || e.ctrlKey;
            if (isMod && (e.key === 'k' || e.key === 'K')) {
                var input = qs('#sidebar-search-input');
                if (input) {
                    e.preventDefault();
                    input.focus();
                    input.select();
                }
            }
        });
    }

    // --------------------------------------------------------------------
    // 9. TOC auto-generation (h2/h3 → right-side sticky TOC + scroll-spy)
    // --------------------------------------------------------------------
    function buildTOC() {
        var container = qs('#page-container');
        if (!container) return;
        if (currentPageKey() === 'index') return; // Landing pages don't need a TOC
        var source = document.getElementById('page-content');
        if (source && source.hasAttribute('data-no-toc')) return; // Explicitly opted out
        var headings = qsa('h2, h3', container);
        if (headings.length < 3) return; // Not worth generating for short pages

        // Assign stable IDs
        headings.forEach(function (h, i) {
            if (!h.id) {
                h.id = 'toc-' + i + '-' + (h.textContent || '').trim().toLowerCase()
                    .replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
            }
        });

        // Build TOC DOM
        var toc = document.createElement('nav');
        toc.className = 'yry-toc';
        toc.setAttribute('aria-label', 'Table of contents');
        var title = document.createElement('div');
        title.className = 'yry-toc-title';
        title.textContent = 'On this page';
        toc.appendChild(title);
        var list = document.createElement('ul');
        headings.forEach(function (h) {
            var li = document.createElement('li');
            li.className = 'yry-toc-item yry-toc-' + h.tagName.toLowerCase();
            var a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent;
            li.appendChild(a);
            list.appendChild(li);
        });
        toc.appendChild(list);

        // Make layout a two-column grid when TOC present
        container.classList.add('has-toc');
        container.appendChild(toc);

        // Scroll-spy via IntersectionObserver
        if ('IntersectionObserver' in window) {
            var links = qsa('.yry-toc-item a', toc);
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        links.forEach(function (l) { l.classList.remove('active'); });
                        var match = toc.querySelector('.yry-toc-item a[href="#' + entry.target.id + '"]');
                        if (match) match.classList.add('active');
                    }
                });
            }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
            headings.forEach(function (h) { observer.observe(h); });
        }
    }

    // --------------------------------------------------------------------
    // 10. Code block copy buttons
    // --------------------------------------------------------------------
    function wireCodeCopyButtons() {
        qsa('pre').forEach(function (pre) {
            var code = qs('code', pre);
            if (!code) return;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'yry-copy-btn';
            btn.setAttribute('aria-label', 'Copy code');
            btn.innerHTML = '<i class="ri-file-copy-line"></i><span>Copy</span>';
            btn.addEventListener('click', function () {
                var text = code.textContent || '';
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function () {
                        btn.classList.add('copied');
                        btn.innerHTML = '<i class="ri-check-line"></i><span>Copied</span>';
                        setTimeout(function () {
                            btn.classList.remove('copied');
                            btn.innerHTML = '<i class="ri-file-copy-line"></i><span>Copy</span>';
                        }, 2000);
                    });
                } else {
                    // Fallback
                    var ta = document.createElement('textarea');
                    ta.value = text;
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); } catch (e) {}
                    document.body.removeChild(ta);
                    btn.classList.add('copied');
                    setTimeout(function () { btn.classList.remove('copied'); }, 2000);
                }
            });
            pre.style.position = 'relative';
            pre.appendChild(btn);
        });
    }

    // --------------------------------------------------------------------
    // 11. External link indicator
    // --------------------------------------------------------------------
    function markExternalLinks() {
        qsa('a[target="_blank"]').forEach(function (a) {
            if (a.classList.contains('yry-ext')) return;
            a.classList.add('yry-ext');
            // Don't add ↗ if the link already has an icon <i> or is an image
            if (qs('i, img', a)) return;
            var sup = document.createElement('sup');
            sup.className = 'yry-ext-indicator';
            sup.textContent = ' ↗';
            sup.setAttribute('aria-hidden', 'true');
            a.appendChild(sup);
        });
    }

    // --------------------------------------------------------------------
    // 12. Page loading fade
    // --------------------------------------------------------------------
    function fadePageIn() {
        // body starts with class="loading"; app.min.css hides body.loading's children
        // or provides opacity transition; we remove after a tick to let CSS settle.
        requestAnimationFrame(function () {
            setTimeout(function () {
                document.body.classList.remove('loading');
            }, 60);
        });
    }

    // --------------------------------------------------------------------
    // 13. Boot
    // --------------------------------------------------------------------
    function init() {
        inject();

        // Year in footer
        var yearEl = qs('#footer-year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        wireTheme();
        wireSidebarToggle();
        wireBackToTop();
        wireSidebarSearch();
        wireKeyboardShortcuts();
        buildTOC();
        wireCodeCopyButtons();
        markExternalLinks();
        fadePageIn();

        // Expose for debugging
        window.__yryDoc = {
            config: CFG,
            currentPage: currentPageKey(),
            currentPageTitle: currentPageTitle()
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
