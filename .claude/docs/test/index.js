/**
 * rui-report-test · page entry
 * ----------------------------------------------------------------------
 * Thin entry: waits for window.__vueLoadPromise (provided by the
 * shared loader), verifies REPORT_DATA + REPORT_CONFIG, then mounts
 * the Vue app. Boot retries once with a fresh mount target on
 * failure (defensive — see rui-report-files for the same pattern).
 */
(function () {
    'use strict';

    // Resolve the loader path at runtime from the actual <script> tag
    // so the diagnostic banner names the real URL the browser tried
    // (and failed) to fetch — independent of the report's OUT_DIR.
    // Falls back to the conventional 'docs/reports/test' relative
    // path if the script tag is not reachable (e.g. when this file is
    // loaded outside the page context during unit tests).
    var LOADER_PATH_HINT = (function () {
        try {
            var scripts = document.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                var src = scripts[i].src || '';
                if (src.indexOf('loader.js') !== -1) return src;
            }
        } catch (e) { /* fall through */ }
        return '../../shared/loader.js';
    })();

    function hideVueMissing() {
        var el = document.getElementById('vue-missing');
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }
    function showVueMissing(err) {
        var app = document.getElementById('page-app');
        if (!app) return;
        var banner = document.createElement('div');
        banner.id = 'vue-missing';
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:16px;background:#ef4444;color:white;font-family:monospace;z-index:9999;white-space:pre-wrap;line-height:1.5;';
        var msg = (err && err.message) || String(err);
        banner.textContent = '[rui-report-test] Vue failed to load: ' + msg +
            '\nExpected loader at: ' + LOADER_PATH_HINT +
            '\nHint: open DevTools → Network and check the loader.js + Vue CDN requests.';
        document.body.appendChild(banner);
    }
    function ensureData() {
        if (typeof window.REPORT_DATA !== 'object' || window.REPORT_DATA === null) {
            throw new Error('window.REPORT_DATA is missing — data.js did not load.');
        }
        if (typeof window.REPORT_CONFIG !== 'object' || window.REPORT_CONFIG === null) {
            throw new Error('window.REPORT_CONFIG is missing — data.js did not load.');
        }
        if (!Array.isArray(window.REPORT_DATA.scenes) || window.REPORT_DATA.scenes.length !== 6) {
            throw new Error('window.REPORT_DATA.scenes must be an array of 6 scenes.');
        }
    }

    function runBoot() {
        window.__vueLoadPromise
            .then(function () {
                if (typeof window.Vue === 'undefined' || typeof window.Vue.createApp !== 'function') {
                    throw new Error('window.Vue is unavailable after the loader resolved.');
                }
                hideVueMissing();
                ensureData();
                return mountApp();
            })
            .catch(function (err) {
                console.error('[rui-report-test] boot failed:', err);
                showVueMissing(err);
            });
    }

    function boot() {
        if (typeof window.__vueLoadPromise === 'object' && typeof window.__vueLoadPromise.then === 'function') {
            runBoot();
            return;
        }
        // Defensive poll: the shared loader is a plain <script> tag so it
        // SHOULD run before this IIFE, but a slow CDN or a syntax error in
        // a sibling <script> can defer window.__vueLoadPromise past our
        // first read. Wait up to 1.5s before giving up so transient races
        // (e.g. the user opening the file from a slow disk) don't surface
        // a false "loader.js did not run" error.
        var waited = 0;
        var maxWait = 1500;
        var step = 50;
        var timer = setInterval(function () {
            waited += step;
            if (typeof window.__vueLoadPromise === 'object' && typeof window.__vueLoadPromise.then === 'function') {
                clearInterval(timer);
                runBoot();
            } else if (waited >= maxWait) {
                clearInterval(timer);
                showVueMissing(new Error(
                    'window.__vueLoadPromise is not a Promise — loader.js did not run within ' + maxWait + 'ms. ' +
                    'Expected <script src="' + LOADER_PATH_HINT + '"> in index.html.'
                ));
            }
        }, step);
    }

    function mountApp() {
        var mountEl = document.getElementById('page-app');
        if (!mountEl) throw new Error('#page-app not found in DOM.');

        var RuiSelfTestApp = {
            data: function () {
                var d = window.REPORT_DATA;
                var c = window.REPORT_CONFIG;
                return {
                    config: c,
                    scenes: d.scenes,
                    summary: d.summary,
                    score: d.score,
                    grade: d.grade,
                    scope: c.options.scope,
                    generatedAtHuman: formatHuman(c.options.generatedAt),
                    title: 'test Report — ' + c.options.scopeTitle,
                    tagline: '6 test scenes · §0–§4 lifecycle · composite score ' + d.score + ' (' + d.grade + ')',
                    breadcrumb: [
                        { label: 'Docs', href: '../index.html' },
                        { label: 'test Report' }
                    ],
                    theme: c.options.theme || 'dark',
                    readingProgress: 0,
                    activeSection: d.scenes[0] ? d.scenes[0].slug : '',
                    gradeScale: d.gradeScale || [
                        { grade: 'A', min: 90, tone: 'pass' },
                        { grade: 'B', min: 75, tone: 'pass' },
                        { grade: 'C', min: 60, tone: 'warn' },
                        { grade: 'D', min: 40, tone: 'warn' },
                        { grade: 'F', min: 0,  tone: 'fail' },
                    ],
                    inventory: d.inventory || { items: [], totalFiles: 0, totalBytes: 0 },
                    compliance: d.compliance || [],
                    riskRegister: d.riskRegister || [],
                    glossary: d.glossary || [],
                    roadmap: d.roadmap || [],
                    metrics: d.metrics || { sizeBuckets: [], largest: [], topDirs: [] },
                    activity: d.activity || { buckets: [], freshest: [] },
                    mermaidSourceOpen: {},
                };
            },
            computed: {
                riskBanner: function () {
                    var s = this.summary;
                    if (s.failCount > 0) return { marker: '🚫', text: s.failCount + ' scene(s) failing — review and fix before shipping', tone: 'fail' };
                    if (s.partialCount > 0) return { marker: '⚠️', text: s.partialCount + ' scene(s) partial — see details', tone: 'warn' };
                    if (s.passCount === s.totalScenes) return { marker: '✅', text: 'All ' + s.totalScenes + ' scenes pass — ship it', tone: 'pass' };
                    return null;
                },
                riskBannerClass: function () {
                    return this.riskBanner ? 'risk-banner tone-' + this.riskBanner.tone : '';
                },
                executiveSummary: function () {
                    var d = window.REPORT_DATA;
                    var s = d.summary;
                    var fileCount = (s.totalFiles || 0).toLocaleString();
                    var sizeMB = ((s.totalBytes || 0) / (1024 * 1024)).toFixed(2);
                    var scope = d.scope || 'the project';
                    var headline = 'This report walks ' + fileCount + ' files (' + sizeMB + ' MiB) under ' + scope +
                        ' and evaluates six canonical test scenes across the §0–§4 lifecycle. ';
                    var breakdown = 'Composite score is ' + d.score + '/100 (grade ' + d.grade + '), driven by ' +
                        s.passCount + ' pass' + (s.passCount === 1 ? '' : 'es') + ', ' +
                        s.partialCount + ' partial, and ' + s.failCount + ' fail' + (s.failCount === 1 ? '' : 's') + '.';
                    var guidance = '';
                    if (d.score >= 90) {
                        guidance = ' The project is shippable from a fresh clone; no blocking regressions detected.';
                    } else if (d.score >= 50) {
                        guidance = ' The project is partially shippable; address the failing scenes before the next release.';
                    } else {
                        guidance = ' Significant regressions detected — block the release and rerun /rui-init before re-evaluating.';
                    }
                    return headline + breakdown + guidance;
                },
                facetSnapshot: function () {
                    var d = window.REPORT_DATA;
                    var f = d.facets || {};
                    var snap = [];
                    if (f.init) {
                        var initChecks = [f.init.hasClaude, f.init.hasReadme, f.init.hasDocs, f.init.hasTests, f.init.hasPackageJson || f.init.hasPyproject || f.init.hasGoMod || f.init.hasCargoToml];
                        var initPass = initChecks.filter(Boolean).length;
                        snap.push({ key: 'init', icon: '🚀', label: 'Init Integrity', value: initPass + '/' + initChecks.length, note: 'artifacts present', tone: initPass / initChecks.length >= 0.9 ? 'pass' : initPass / initChecks.length >= 0.5 ? 'warn' : 'fail' });
                    }
                    if (f.tests) {
                        snap.push({ key: 'tests', icon: '🧪', label: 'Test Framework', value: f.tests.framework || 'none', note: (f.tests.testFileCount || 0) + ' test files', tone: f.tests.hasFramework ? 'pass' : 'fail' });
                    }
                    if (f.docs) {
                        snap.push({ key: 'docs', icon: '📚', label: 'Doc Surface', value: (f.docs.docCount || 0) + ' docs', note: 'ratio ' + (f.docs.docRatio || 0), tone: (f.docs.docRatio || 0) >= 0.05 ? 'pass' : 'warn' });
                    }
                    if (f.security) {
                        snap.push({ key: 'security', icon: '🔐', label: 'Security Surface', value: (f.security.dangerousCallCount || 0) + ' findings', note: (f.security.envFileCount || 0) + ' .env files', tone: (f.security.dangerousCallCount || 0) < 5 ? 'pass' : 'fail' });
                    }
                    if (f.refs) {
                        snap.push({ key: 'refs', icon: '🔗', label: 'Cross-Story', value: (f.refs.brokenLinks || 0) + ' broken', note: (f.refs.totalLinks || 0) + ' links audited', tone: (f.refs.brokenLinks || 0) === 0 ? 'pass' : 'fail' });
                    }
                    if (f.deps) {
                        var pinPct = Math.round((f.deps.pinningRatio || 0) * 100);
                        snap.push({ key: 'deps', icon: '🧩', label: 'Third-Party', value: (f.deps.totalCount || 0) + ' deps', note: pinPct + '% pinned', tone: pinPct >= 50 ? 'pass' : 'warn' });
                    }
                    return snap;
                },
                priorityActions: function () {
                    var scenes = this.scenes || [];
                    var actions = [];
                    var priorityRank = { fail: 0, partial: 1, pass: 2 };
                    for (var i = 0; i < scenes.length; i++) {
                        var sc = scenes[i];
                        if (!sc.section4 || !Array.isArray(sc.section4.improvements)) continue;
                        for (var j = 0; j < sc.section4.improvements.length; j++) {
                            actions.push({
                                sceneIndex: sc.index,
                                sceneTitle: sc.title,
                                sceneSlug: sc.slug,
                                sceneVerdict: sc.verdict,
                                text: sc.section4.improvements[j],
                                rank: priorityRank[sc.verdict] !== undefined ? priorityRank[sc.verdict] : 3,
                            });
                        }
                    }
                    actions.sort(function (a, b) {
                        if (a.rank !== b.rank) return a.rank - b.rank;
                        return a.sceneIndex - b.sceneIndex;
                    });
                    return actions.slice(0, 5);
                },
                inventoryItems: function () {
                    var inv = this.inventory || {};
                    return Array.isArray(inv.items) ? inv.items : [];
                },
                inventorySummaryText: function () {
                    var inv = this.inventory || {};
                    var total = inv.totalFiles || 0;
                    var bytes = inv.totalBytes || 0;
                    var groups = (inv.items || []).length;
                    return 'The analyzer walked ' + total.toLocaleString() + ' files (' +
                        this.formatBytes(bytes) + ') and grouped them into ' + groups +
                        ' type categories. The table below shows the top ' + groups +
                        ' by file count, with their share of the total and on-disk size.';
                },
                scopeProfile: function () {
                    var d = window.REPORT_DATA;
                    var f = d.facets || {};
                    var inv = d.inventory || {};
                    var tags = [];
                    var topGroup = (inv.items && inv.items[0]) || null;
                    if (topGroup) {
                        tags.push({
                            icon: '📦',
                            label: 'Top type',
                            value: topGroup.group + ' · ' + topGroup.pct + '%',
                            tone: 'accent',
                        });
                    }
                    if (f.tests) {
                        tags.push({
                            icon: '🧪',
                            label: 'Tests',
                            value: f.tests.framework || 'none detected',
                            tone: f.tests.hasFramework ? 'pass' : 'fail',
                        });
                    }
                    if (f.docs) {
                        tags.push({
                            icon: '📚',
                            label: 'Docs',
                            value: (f.docs.docCount || 0) + ' files',
                            tone: (f.docs.docRatio || 0) >= 0.05 ? 'pass' : 'warn',
                        });
                    }
                    if (f.security) {
                        tags.push({
                            icon: '🔐',
                            label: 'Security',
                            value: (f.security.dangerousCallCount || 0) + ' findings',
                            tone: (f.security.dangerousCallCount || 0) < 5 ? 'pass' : 'fail',
                        });
                    }
                    if (f.deps && f.deps.totalCount > 0) {
                        tags.push({
                            icon: '🧩',
                            label: 'Deps',
                            value: f.deps.totalCount + ' · ' + Math.round((f.deps.pinningRatio || 0) * 100) + '% pinned',
                            tone: (f.deps.pinningRatio || 0) >= 0.5 ? 'pass' : 'warn',
                        });
                    }
                    return tags;
                },
            },
            methods: {
                verdictLabel: function (v) {
                    if (v === 'pass') return 'pass';
                    if (v === 'partial') return 'partial';
                    return 'fail';
                },
                formatPct: function (n) {
                    return Math.round((n || 0) * 100) + '%';
                },
                formatBytes: function (bytes) {
                    var b = Number(bytes) || 0;
                    if (b < 1024) return b + ' B';
                    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KiB';
                    if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(2) + ' MiB';
                    return (b / (1024 * 1024 * 1024)).toFixed(2) + ' GiB';
                },
                activityTone: function (ratio) {
                    var r = Number(ratio) || 0;
                    if (r >= 0.6) return 'pass';
                    if (r >= 0.3) return 'warn';
                    return 'fail';
                },
                activityVerdict: function (ratio) {
                    var r = Number(ratio) || 0;
                    if (r >= 0.6) return 'Active — majority of code modified within 90 days.';
                    if (r >= 0.3) return 'Steady — meaningful churn in the last quarter.';
                    if (r > 0) return 'Maintenance mode — most code is over 90 days old.';
                    return 'Dormant — no recent activity detected.';
                },
                reportRowClass: function (result) {
                    if (!result) return '';
                    if (result.indexOf('✅') !== -1) return 'report-row-pass';
                    if (result.indexOf('⚠') !== -1) return 'report-row-warn';
                    if (result.indexOf('❌') !== -1 || result.indexOf('🚫') !== -1) return 'report-row-fail';
                    return '';
                },
                sceneCallout: function (scene) {
                    if (!scene) return null;
                    var v = scene.verdict;
                    var pct = Math.round((scene.coverage || 0) * 100);
                    var checks = (scene.section3 && scene.section3.report) || [];
                    var passed = checks.filter(function (c) { return c.result && c.result.indexOf('✅') !== -1; }).length;
                    var total = checks.length;
                    if (v === 'pass') {
                        return {
                            marker: '✅',
                            headline: 'Passing — ' + passed + '/' + total + ' checks satisfied (' + pct + '% coverage)',
                            detail: 'This scene meets the shippability contract. No action required; continue monitoring on the next analyzer run.',
                        };
                    }
                    if (v === 'partial') {
                        return {
                            marker: '⚠️',
                            headline: 'Partial — ' + passed + '/' + total + ' checks satisfied (' + pct + '% coverage)',
                            detail: 'The scene is wired but has gaps. Review the §3 failures and the §4 improvements below before the next release.',
                        };
                    }
                    return {
                        marker: '🚫',
                        headline: 'Failing — ' + passed + '/' + total + ' checks satisfied (' + pct + '% coverage)',
                        detail: 'This scene is a release blocker. Address every failing §3 check before merging; see §4 for targeted fixes.',
                    };
                },
                passedCount: function (scene) {
                    var checks = (scene && scene.section3 && scene.section3.report) || [];
                    return checks.filter(function (c) { return c.result && c.result.indexOf('✅') !== -1; }).length;
                },
                checkCount: function (scene) {
                    var checks = (scene && scene.section3 && scene.section3.report) || [];
                    return checks.length;
                },
                dotGlyph: function (result) {
                    if (!result) return '·';
                    if (result.indexOf('✅') !== -1) return '●';
                    if (result.indexOf('⚠') !== -1) return '◐';
                    if (result.indexOf('❌') !== -1 || result.indexOf('🚫') !== -1) return '○';
                    return '·';
                },
                toggleTheme: function () {
                    this.theme = this.theme === 'dark' ? 'light' : 'dark';
                    document.documentElement.setAttribute('data-rui-theme', this.theme);
                    try { localStorage.setItem('rui-report-test-theme', this.theme); } catch (e) {}
                    renderMermaidDiagrams();
                },
                toggleMermaidSource: function (slug) {
                    var next = {};
                    for (var k in this.mermaidSourceOpen) {
                        if (Object.prototype.hasOwnProperty.call(this.mermaidSourceOpen, k)) next[k] = this.mermaidSourceOpen[k];
                    }
                    next[slug] = !next[slug];
                    this.mermaidSourceOpen = next;
                },
                printReport: function () {
                    window.print();
                },
                onScroll: function () {
                    var doc = document.documentElement;
                    var max = doc.scrollHeight - window.innerHeight;
                    this.readingProgress = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;

                    // Update active section
                    var sections = this.scenes;
                    var best = sections[0] ? sections[0].slug : '';
                    var bestTop = -Infinity;
                    for (var i = 0; i < sections.length; i++) {
                        var el = document.getElementById('scene-' + sections[i].index);
                        if (!el) continue;
                        var rect = el.getBoundingClientRect();
                        if (rect.top <= 120 && rect.top > bestTop) {
                            bestTop = rect.top;
                            best = sections[i].slug;
                        }
                    }
                    this.activeSection = best;
                },
            },
            mounted: function () {
                // Restore persisted theme
                try {
                    var stored = localStorage.getItem('rui-report-test-theme');
                    if (stored === 'light' || stored === 'dark') {
                        this.theme = stored;
                        document.documentElement.setAttribute('data-rui-theme', this.theme);
                    }
                } catch (e) {}
                // Wire scroll
                this._onScroll = this.onScroll.bind(this);
                window.addEventListener('scroll', this._onScroll, { passive: true });
                this.onScroll();
                // Keyboard shortcuts
                this._onKey = function (e) {
                    var tag = (e.target && e.target.tagName) || '';
                    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
                    if (e.metaKey || e.ctrlKey || e.altKey) return;
                    if (e.key >= '1' && e.key <= '6') {
                        var n = parseInt(e.key, 10);
                        var target = document.getElementById('scene-' + n);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            e.preventDefault();
                        }
                    } else if (e.key === 't') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (e.key === 'l') {
                        this.toggleTheme();
                    } else if (e.key === 'p') {
                        window.print();
                    }
                }.bind(this);
                window.addEventListener('keydown', this._onKey);
            },
            beforeUnmount: function () {
                if (this._onScroll) window.removeEventListener('scroll', this._onScroll);
                if (this._onKey) window.removeEventListener('keydown', this._onKey);
            },
        };

        // Wait for shared rui-* components to be ready (best-effort)
        var sharedReady = Promise.all([
            whenGlobal('ruiBreadcrumb'),
            whenGlobal('ruiBadge'),
            whenGlobal('ruiBackTop'),
        ]).catch(function () { return null; });

        sharedReady.then(function () {
            try {
                var app = window.Vue.createApp(RuiSelfTestApp);
                if (window.ruiBreadcrumb) app.component('rui-breadcrumb', window.ruiBreadcrumb);
                if (window.ruiBadge) app.component('rui-badge', window.ruiBadge);
                if (window.ruiBackTop) app.component('rui-back-top', window.ruiBackTop);
                if (window.ruiTagChip) app.component('rui-tag-chip', window.ruiTagChip);
                app.mount(mountEl);
            } catch (err) {
                // Retry once with a fresh mount target
                console.warn('[rui-report-test] first mount failed, retrying:', err);
                var fresh = mountEl.cloneNode(false);
                mountEl.parentNode.replaceChild(fresh, mountEl);
                var app2 = window.Vue.createApp(RuiSelfTestApp);
                if (window.ruiBreadcrumb) app2.component('rui-breadcrumb', window.ruiBreadcrumb);
                if (window.ruiBadge) app2.component('rui-badge', window.ruiBadge);
                if (window.ruiBackTop) app2.component('rui-back-top', window.ruiBackTop);
                if (window.ruiTagChip) app2.component('rui-tag-chip', window.ruiTagChip);
                app2.mount(fresh);
            }
            // Render §0 mermaid diagrams after Vue has populated the DOM.
            // The loader (in index.html) opts in via data-mermaid-path +
            // data-mermaid-fallback, so Mermaid is loaded either from
            // <scope>/.claude/shared/vendor/mermaid.min.js (preferred)
            // or from the jsDelivr CDN. If both fail, each diagram
            // gracefully falls back to showing the raw source as text.
            renderMermaidDiagrams();
        });
    }

    function renderMermaidDiagrams() {
        var nodes = Array.prototype.slice.call(document.querySelectorAll('.scene-mermaid.mermaid'));
        if (!nodes.length) return;

        function mermaidTheme() {
            return document.documentElement.getAttribute('data-rui-theme') === 'light' ? 'default' : 'dark';
        }
        // Strip a leading ```mermaid fence and a leading %%{init: ...}%%
        // block. The init block is reapplied via mermaid.initialize() so
        // we don't pass it through the parser (it would re-apply on every
        // diagram and force the same options twice).
        function normalizeSource(src) {
            var text = String(src || '').replace(/\r\n?/g, '\n').trim();
            text = text.replace(/^```mermaid\s*/i, '').replace(/```\s*$/, '').trim();
            text = text.replace(/^%%\{[\s\S]*?\}%%\s*/, '').trim();
            return text;
        }
        function clearError(el) {
            el.classList.remove('is-error');
            el.removeAttribute('data-mermaid-error');
            var note = el.parentNode && el.parentNode.querySelector('.mermaid-error-note');
            if (note && note.parentNode) note.parentNode.removeChild(note);
        }
        function showError(el, err, src) {
            var message = (err && err.message) ? err.message : String(err || 'Unknown Mermaid error');
            // Roll the error back to a clean slate so the next render pass
            // starts from a known state.
            clearError(el);
            el.classList.add('is-error');
            el.setAttribute('data-mermaid-error', message);
            el.removeAttribute('data-processed');
            el.innerHTML = '';
            el.textContent = src;
            var note = document.createElement('div');
            note.className = 'mermaid-error-note';
            note.textContent = 'Mermaid render failed — showing source instead. ' + message;
            if (el.parentNode) el.parentNode.appendChild(note);
        }
        function populateSources() {
            for (var i = 0; i < nodes.length; i++) {
                var el = nodes[i];
                var src = normalizeSource(el.getAttribute('data-mermaid-src'));
                if (!src) continue;
                // Bump the cached source key so a re-render (e.g. theme
                // toggle) re-applies even when the data attribute is
                // unchanged but a previous attempt left state behind.
                if (el.getAttribute('data-render-source') !== src) {
                    el.removeAttribute('data-processed');
                    el.setAttribute('data-render-source', src);
                }
                if (el.getAttribute('data-processed') !== 'true') el.textContent = src;
            }
        }

        // Wait for Mermaid to be available. The loader exposes
        // window.__mermaidLoadPromise (set when data-mermaid-path is
        // configured on the <script src="loader.js"> tag), so a page
        // served from a path where the local ../../shared/... URL
        // can't resolve still resolves to the CDN fallback before we
        // time out.
        function waitForMermaid() {
            if (typeof window.mermaid === 'object' && window.mermaid && typeof window.mermaid.render === 'function') {
                return Promise.resolve(window.mermaid);
            }
            var loadPromise = (typeof window.__mermaidLoadPromise === 'object' && window.__mermaidLoadPromise && typeof window.__mermaidLoadPromise.then === 'function')
                ? window.__mermaidLoadPromise
                : Promise.resolve();
            return loadPromise.catch(function () { return null; }).then(function () {
                return new Promise(function (resolve, reject) {
                    var waited = 0;
                    var timer = setInterval(function () {
                        waited += 100;
                        if (typeof window.mermaid === 'object' && window.mermaid && typeof window.mermaid.render === 'function') {
                            clearInterval(timer);
                            resolve(window.mermaid);
                        } else if (waited >= 5000) {
                            clearInterval(timer);
                            reject(new Error('window.mermaid was not ready within 5000ms. ' +
                                'The local copy and the CDN fallback both failed to load — ' +
                                'check the Network tab and confirm the report is allowed to ' +
                                'reach cdn.jsdelivr.net.'));
                        }
                    }, 100);
                });
            });
        }

        // Render a single element. Returns a Promise that never rejects
        // (errors are surfaced via the showError() branch and a
        // console warning) so one bad diagram can't break the batch.
        function renderOne(mermaidApi, el, idx) {
            var src = normalizeSource(el.getAttribute('data-mermaid-src'));
            if (!src) return Promise.resolve();
            clearError(el);
            el.removeAttribute('data-processed');
            el.innerHTML = '';
            // ID must be unique per call site; Date.now() + the index
            // gives Mermaid a fresh DOM id so two re-renders don't
            // collide on the same #mermaid-xxx target.
            var renderId = 'rui-test-mermaid-' + idx + '-' + Date.now();
            return Promise.resolve(
                typeof mermaidApi.parse === 'function' ? mermaidApi.parse(src) : true
            ).then(function () {
                return mermaidApi.render(renderId, src);
            }).then(function (result) {
                // Mermaid 9.x returns {svg, bindFunctions}; older builds
                // return the SVG string directly. Normalize both.
                var svg = result && result.svg ? result.svg : result;
                if (!svg) throw new Error('Mermaid returned empty SVG output.');
                el.innerHTML = svg;
                if (result && typeof result.bindFunctions === 'function') {
                    try { result.bindFunctions(el); } catch (e) { /* click handlers are best-effort */ }
                }
                el.setAttribute('data-processed', 'true');
            }).catch(function (err) {
                console.warn('[rui-report-test] mermaid render failed:', err);
                showError(el, err, src);
            });
        }

        function renderAll(mermaidApi) {
            mermaidApi.initialize({
                startOnLoad: false,
                theme: mermaidTheme(),
                securityLevel: 'loose',
                flowchart: { htmlLabels: true, useMaxWidth: true },
            });
            populateSources();
            // Render in parallel — each diagram is independent, so a
            // 6-scene page with 6 diagrams goes from O(6·t) to O(t).
            return Promise.all(nodes.map(function (el, idx) {
                return renderOne(mermaidApi, el, idx);
            }));
        }

        waitForMermaid()
            .then(renderAll)
            .catch(function (err) {
                console.warn('[rui-report-test] Mermaid unavailable:', err);
                populateSources();
                for (var i = 0; i < nodes.length; i++) {
                    showError(nodes[i], err, normalizeSource(nodes[i].getAttribute('data-mermaid-src')));
                }
            });
    }

    function whenGlobal(name, timeoutMs) {
        return new Promise(function (resolve, reject) {
            if (typeof window[name] !== 'undefined') return resolve(window[name]);
            var t0 = Date.now();
            (function poll() {
                if (typeof window[name] !== 'undefined') return resolve(window[name]);
                if (Date.now() - t0 > (timeoutMs || 5000)) return reject(new Error(name + ' not ready'));
                setTimeout(poll, 50);
            })();
        });
    }

    function formatHuman(iso) {
        if (!iso) return '';
        try {
            var d = new Date(iso);
            return d.toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
        } catch (e) { return iso; }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
