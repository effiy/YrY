/**
 * app/state.js — page state and derived data for the test report.
 */
(function () {
    'use strict';

    var DEFAULT_GRADE_SCALE = [
        { grade: 'A', min: 90, tone: 'pass' },
        { grade: 'B', min: 75, tone: 'pass' },
        { grade: 'C', min: 60, tone: 'warn' },
        { grade: 'D', min: 40, tone: 'warn' },
        { grade: 'F', min: 0, tone: 'fail' },
    ];

    var EMPTY_INVENTORY = { items: [], totalFiles: 0, totalBytes: 0 };
    var EMPTY_METRICS = { sizeBuckets: [], largest: [], topDirs: [], totalFiles: 0, totalBytes: 0, avgBytes: 0, medianBytes: 0 };
    var EMPTY_ACTIVITY = { buckets: [], freshest: [], recentByteRatio: 0, recentFileCount: 0 };

    var RuiSelfTestApp = window.RuiSelfTestApp = window.RuiSelfTestApp || {};

    function buildExecutiveSummary(vm) {
        var summary = vm.summary || {};
        var fileCount = (summary.totalFiles || 0).toLocaleString();
        var sizeMB = ((summary.totalBytes || 0) / (1024 * 1024)).toFixed(2);
        var scope = vm.scope || 'the project';
        var headline = 'This report walks ' + fileCount + ' files (' + sizeMB + ' MiB) under ' + scope +
            ' and evaluates six canonical test scenes across the §0–§4 lifecycle. ';
        var breakdown = 'Composite score is ' + vm.score + '/100 (grade ' + vm.grade + '), driven by ' +
            summary.passCount + ' pass' + (summary.passCount === 1 ? '' : 'es') + ', ' +
            summary.partialCount + ' partial, and ' + summary.failCount + ' fail' + (summary.failCount === 1 ? '' : 's') + '.';
        var guidance = '';
        if (vm.score >= 90) {
            guidance = ' The project is shippable from a fresh clone; no blocking regressions detected.';
        } else if (vm.score >= 50) {
            guidance = ' The project is partially shippable; address the failing scenes before the next release.';
        } else {
            guidance = ' Significant regressions detected — block the release and rerun /rui-init before re-evaluating.';
        }
        return headline + breakdown + guidance;
    }

    function buildFacetSnapshot(facets) {
        var snapshot = [];
        if (facets.init) {
            var initChecks = [
                facets.init.hasClaude,
                facets.init.hasReadme,
                facets.init.hasDocs,
                facets.init.hasTests,
                facets.init.hasPackageJson || facets.init.hasPyproject || facets.init.hasGoMod || facets.init.hasCargoToml,
            ];
            var initPass = initChecks.filter(Boolean).length;
            var initRatio = initChecks.length ? initPass / initChecks.length : 0;
            snapshot.push({
                key: 'init',
                icon: '🚀',
                label: 'Init Integrity',
                value: initPass + '/' + initChecks.length,
                note: 'artifacts present',
                tone: initRatio >= 0.9 ? 'pass' : initRatio >= 0.5 ? 'warn' : 'fail',
            });
        }
        if (facets.tests) {
            snapshot.push({
                key: 'tests',
                icon: '🧪',
                label: 'Test Framework',
                value: facets.tests.framework || 'none',
                note: (facets.tests.testFileCount || 0) + ' test files',
                tone: facets.tests.hasFramework ? 'pass' : 'fail',
            });
        }
        if (facets.docs) {
            snapshot.push({
                key: 'docs',
                icon: '📚',
                label: 'Doc Surface',
                value: (facets.docs.docCount || 0) + ' docs',
                note: 'ratio ' + (facets.docs.docRatio || 0),
                tone: (facets.docs.docRatio || 0) >= 0.05 ? 'pass' : 'warn',
            });
        }
        if (facets.security) {
            snapshot.push({
                key: 'security',
                icon: '🔐',
                label: 'Security Surface',
                value: (facets.security.dangerousCallCount || 0) + ' findings',
                note: (facets.security.envFileCount || 0) + ' .env files',
                tone: (facets.security.dangerousCallCount || 0) < 5 ? 'pass' : 'fail',
            });
        }
        if (facets.refs) {
            snapshot.push({
                key: 'refs',
                icon: '🔗',
                label: 'Cross-Story',
                value: (facets.refs.brokenLinks || 0) + ' broken',
                note: (facets.refs.totalLinks || 0) + ' links audited',
                tone: (facets.refs.brokenLinks || 0) === 0 ? 'pass' : 'fail',
            });
        }
        if (facets.deps) {
            var pinPct = Math.round((facets.deps.pinningRatio || 0) * 100);
            snapshot.push({
                key: 'deps',
                icon: '🧩',
                label: 'Third-Party',
                value: (facets.deps.totalCount || 0) + ' deps',
                note: pinPct + '% pinned',
                tone: pinPct >= 50 ? 'pass' : 'warn',
            });
        }
        return snapshot;
    }

    function buildPriorityActions(scenes) {
        var actions = [];
        var priorityRank = { fail: 0, partial: 1, pass: 2 };
        for (var i = 0; i < scenes.length; i++) {
            var scene = scenes[i];
            if (!scene.section4 || !Array.isArray(scene.section4.improvements)) continue;
            for (var j = 0; j < scene.section4.improvements.length; j++) {
                actions.push({
                    sceneIndex: scene.index,
                    sceneTitle: scene.title,
                    sceneSlug: scene.slug,
                    sceneVerdict: scene.verdict,
                    text: scene.section4.improvements[j],
                    rank: priorityRank[scene.verdict] !== undefined ? priorityRank[scene.verdict] : 3,
                });
            }
        }
        actions.sort(function (a, b) {
            if (a.rank !== b.rank) return a.rank - b.rank;
            return a.sceneIndex - b.sceneIndex;
        });
        return actions.slice(0, 5);
    }

    function buildScopeProfile(vm) {
        var tags = [];
        var topGroup = (vm.inventory.items && vm.inventory.items[0]) || null;
        if (topGroup) {
            tags.push({
                icon: '📦',
                label: 'Top type',
                value: topGroup.group + ' · ' + topGroup.pct + '%',
                tone: 'accent',
            });
        }
        if (vm.facets.tests) {
            tags.push({
                icon: '🧪',
                label: 'Tests',
                value: vm.facets.tests.framework || 'none detected',
                tone: vm.facets.tests.hasFramework ? 'pass' : 'fail',
            });
        }
        if (vm.facets.docs) {
            tags.push({
                icon: '📚',
                label: 'Docs',
                value: (vm.facets.docs.docCount || 0) + ' files',
                tone: (vm.facets.docs.docRatio || 0) >= 0.05 ? 'pass' : 'warn',
            });
        }
        if (vm.facets.security) {
            tags.push({
                icon: '🔐',
                label: 'Security',
                value: (vm.facets.security.dangerousCallCount || 0) + ' findings',
                tone: (vm.facets.security.dangerousCallCount || 0) < 5 ? 'pass' : 'fail',
            });
        }
        if (vm.facets.deps && vm.facets.deps.totalCount > 0) {
            tags.push({
                icon: '🧩',
                label: 'Deps',
                value: vm.facets.deps.totalCount + ' · ' + Math.round((vm.facets.deps.pinningRatio || 0) * 100) + '% pinned',
                tone: (vm.facets.deps.pinningRatio || 0) >= 0.5 ? 'pass' : 'warn',
            });
        }
        return tags;
    }

    RuiSelfTestApp.data = function () {
        var data = window.REPORT_DATA || {};
        var config = window.REPORT_CONFIG || {};
        var options = config.options || {};
        var scenes = Array.isArray(data.scenes) ? data.scenes : [];
        return {
            config: config,
            scenes: scenes,
            summary: data.summary || { passCount: 0, partialCount: 0, failCount: 0, totalScenes: scenes.length, totalFiles: 0, totalBytes: 0 },
            score: data.score || 0,
            grade: data.grade || 'F',
            scope: options.scope || data.scope || '',
            facets: data.facets || {},
            generatedAtHuman: RuiSelfTestApp.formatHuman(options.generatedAt),
            title: 'test Report — ' + (options.scopeTitle || options.scope || ''),
            tagline: '6 test scenes · §0–§4 lifecycle · composite score ' + (data.score || 0) + ' (' + (data.grade || 'F') + ')',
            breadcrumb: [
                { label: 'Docs', href: '../index.html' },
                { label: 'test Report' },
            ],
            theme: options.theme || 'dark',
            readingProgress: 0,
            activeSection: scenes[0] ? scenes[0].slug : '',
            gradeScale: data.gradeScale || DEFAULT_GRADE_SCALE,
            inventory: data.inventory || EMPTY_INVENTORY,
            compliance: data.compliance || [],
            riskRegister: data.riskRegister || [],
            glossary: data.glossary || [],
            roadmap: data.roadmap || [],
            metrics: data.metrics || EMPTY_METRICS,
            activity: data.activity || EMPTY_ACTIVITY,
            mermaidSourceOpen: {},
        };
    };

    RuiSelfTestApp.computed = {
        riskBanner: function () {
            var summary = this.summary || {};
            if (summary.failCount > 0) {
                return { marker: '🚫', text: summary.failCount + ' scene(s) failing — review and fix before shipping', tone: 'fail' };
            }
            if (summary.partialCount > 0) {
                return { marker: '⚠️', text: summary.partialCount + ' scene(s) partial — see details', tone: 'warn' };
            }
            if (summary.passCount === summary.totalScenes) {
                return { marker: '✅', text: 'All ' + summary.totalScenes + ' scenes pass — ship it', tone: 'pass' };
            }
            return null;
        },

        riskBannerClass: function () {
            return this.riskBanner ? 'risk-banner tone-' + this.riskBanner.tone : '';
        },

        executiveSummary: function () {
            return buildExecutiveSummary(this);
        },

        facetSnapshot: function () {
            return buildFacetSnapshot(this.facets || {});
        },

        priorityActions: function () {
            return buildPriorityActions(this.scenes || []);
        },

        inventoryItems: function () {
            return Array.isArray(this.inventory.items) ? this.inventory.items : [];
        },

        inventorySummaryText: function () {
            var total = this.inventory.totalFiles || 0;
            var bytes = this.inventory.totalBytes || 0;
            var groups = this.inventoryItems.length;
            return 'The analyzer walked ' + total.toLocaleString() + ' files (' +
                this.formatBytes(bytes) + ') and grouped them into ' + groups +
                ' type categories. The table below shows the top ' + groups +
                ' by file count, with their share of the total and on-disk size.';
        },

        scopeProfile: function () {
            return buildScopeProfile(this);
        },
    };
})();
