/*!
 * Adminto Docs - Shared Layout Injector
 * Injects sidebar, topbar and footer around page content
 * Eliminates ~80% HTML duplication across 5 pages
 */
(function () {
    'use strict';

    var PAGES = [
        { key: 'index', href: 'index.html', icon: 'ri-honour-line', label: 'Introduction' },
        { key: 'setup', href: 'setup.html', icon: 'ri-tools-fill', label: 'Setup' },
        { key: 'customization', href: 'customization.html', icon: 'ri-paint-line', label: 'Customization' },
        { key: 'specifications', href: 'specifications.html', icon: 'ri-file-list-3-line', label: 'Specifications' },
        { key: 'rtl', href: 'rtl.html', icon: 'ri-global-line', label: 'RTL Version' },
        { key: 'faq', href: 'faq.html', icon: 'ri-question-answer-line', label: 'FAQ' },
        { key: 'changelog', href: 'changelog.html', icon: 'ri-book-open-line', label: 'Changelog' }
    ];

    function currentPageKey() {
        var main = document.getElementById('page-content');
        return (main && main.getAttribute('data-page')) || 'index';
    }

    function buildSidebar(activeKey) {
        var items = '';
        for (var i = 0; i < PAGES.length; i++) {
            var p = PAGES[i];
            var isActive = p.key === activeKey ? ' class="active"' : '';
            items += ''
                + '<li>'
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
            +       '<span class="logo-sm"><img src="assets/images/logo-sm.svg" alt="" height="24"></span>'
            +       '<span class="logo-lg"><img src="assets/images/logo-light.svg" alt="" height="20"></span>'
            +     '</a>'
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
        return ''
            + '<div class="navbar-custom">'
            +   '<div class="container-fluid">'
            // Left section: hamburger (visible mobile) + logo (visible mobile when sidebar is hidden)
            +     '<div class="topbar-left">'
            +       '<button class="button-menu-mobile" aria-label="Toggle navigation">'
            +         '<i class="ri-menu-line"></i>'
            +       '</button>'
            +       '<a href="index.html" class="topbar-logo">'
            +         '<img src="assets/images/logo-sm.svg" alt="Adminto" height="24">'
            +       '</a>'
            +     '</div>'
            // Center: page title / breadcrumb area (optional future use)
            +     '<div class="topbar-center d-none d-md-flex">'
            +       '<span class="topbar-page-title">Documentation</span>'
            +     '</div>'
            // Right section: theme toggle + navigation links + version badge
            +     '<div class="topbar-right">'
            +       '<ul class="list-unstyled topnav-menu">'
            +         '<li>'
            +           '<button id="dark-mode-toggle" aria-label="Toggle dark mode" title="Toggle dark/light mode">'
            +             '<i class="ri-moon-line moon-icon"></i>'
            +             '<i class="ri-sun-line sun-icon"></i>'
            +           '</button>'
            +         '</li>'
            +         '<li class="d-none d-md-inline-block">'
            +           '<a href="https://coderthemes.com/adminto" class="nav-link" target="_blank" rel="noopener" title="Live Preview">'
            +             '<i class="ri-eye-line me-1"></i> Live Preview'
            +           '</a>'
            +         '</li>'
            +         '<li class="d-none d-md-inline-block">'
            +           '<a href="https://coderthemes.com/" class="nav-link" target="_blank" rel="noopener" title="Support">'
            +             '<i class="ri-customer-service-line me-1"></i> Support'
            +           '</a>'
            +         '</li>'
            +         '<li class="d-none d-sm-inline-block">'
            +           '<div class="nav-link version-badge">'
            +             '<span class="badge badge-danger font-sm">v1.1.0</span>'
            +           '</div>'
            +         '</li>'
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
            +       '<div class="col-md-6"><span id="footer-year"></span> &copy; Adminto theme by Coderthemes</div>'
            +       '<div class="col-md-6">'
            +         '<div class="text-md-end footer-links d-none d-sm-block">'
            +           '<a href="https://coderthemes.com/" target="_blank" rel="noopener">About Us</a>'
            +         '</div>'
            +       '</div>'
            +     '</div>'
            +   '</div>'
            + '</footer>';
    }

    function inject() {
        var content = document.getElementById('page-content');
        if (!content) return;

        var pageKey = currentPageKey();
        var wrapper = document.createElement('div');
        wrapper.id = 'wrapper';

        // Skip to content link (accessibility)
        var skipLink = document.createElement('a');
        skipLink.href = '#page-container';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to content';
        document.body.appendChild(skipLink);

        // Build sidebar
        var sidebarDiv = document.createElement('div');
        sidebarDiv.innerHTML = buildSidebar(pageKey);
        while (sidebarDiv.firstChild) {
            wrapper.appendChild(sidebarDiv.firstChild);
        }

        // Build content page wrapper
        var contentPage = document.createElement('div');
        contentPage.className = 'content-page';

        var contentArea = document.createElement('div');
        contentArea.className = 'content';

        // Topbar
        var topbarDiv = document.createElement('div');
        topbarDiv.innerHTML = buildTopbar();
        while (topbarDiv.firstChild) {
            contentArea.appendChild(topbarDiv.firstChild);
        }

        // Page content container
        var container = document.createElement('div');
        container.className = 'container-fluid';
        container.id = 'page-container';

        // Move original content into the container
        while (content.firstChild) {
            container.appendChild(content.firstChild);
        }
        contentArea.appendChild(container);
        contentPage.appendChild(contentArea);

        // Footer
        var footerDiv = document.createElement('div');
        footerDiv.innerHTML = buildFooter();
        while (footerDiv.firstChild) {
            contentPage.appendChild(footerDiv.firstChild);
        }

        wrapper.appendChild(contentPage);
        document.body.appendChild(wrapper);

        // Back to top button
        var backToTop = document.createElement('button');
        backToTop.id = 'back-to-top';
        backToTop.className = 'back-to-top';
        backToTop.setAttribute('aria-label', 'Back to top');
        backToTop.innerHTML = '<i class="ri-arrow-up-s-line"></i>';
        document.body.appendChild(backToTop);
    }

    // Run injection synchronously
    inject();

    // Set footer year
    var yearEl = document.getElementById('footer-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
})();
