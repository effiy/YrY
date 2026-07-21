/**
 * app/actions.js — page methods for the test report.
 */
(function () {
    'use strict';

    var RuiSelfTestApp = window.RuiSelfTestApp = window.RuiSelfTestApp || {};

    function countPassedChecks(scene) {
        var checks = (scene && scene.section3 && scene.section3.report) || [];
        return checks.filter(function (check) {
            return check.result && check.result.indexOf('✅') !== -1;
        }).length;
    }

    function getCheckCount(scene) {
        var checks = (scene && scene.section3 && scene.section3.report) || [];
        return checks.length;
    }

    function formatBytes(bytes) {
        var value = Number(bytes) || 0;
        if (value < 1024) return value + ' B';
        if (value < 1024 * 1024) return (value / 1024).toFixed(1) + ' KiB';
        if (value < 1024 * 1024 * 1024) return (value / (1024 * 1024)).toFixed(2) + ' MiB';
        return (value / (1024 * 1024 * 1024)).toFixed(2) + ' GiB';
    }

    function buildSceneCallout(scene) {
        if (!scene) return null;
        var verdict = scene.verdict;
        var coverage = Math.round((scene.coverage || 0) * 100);
        var passed = countPassedChecks(scene);
        var total = getCheckCount(scene);
        if (verdict === 'pass') {
            return {
                marker: '✅',
                headline: 'Passing — ' + passed + '/' + total + ' checks satisfied (' + coverage + '% coverage)',
                detail: 'This scene meets the shippability contract. No action required; continue monitoring on the next analyzer run.',
            };
        }
        if (verdict === 'partial') {
            return {
                marker: '⚠️',
                headline: 'Partial — ' + passed + '/' + total + ' checks satisfied (' + coverage + '% coverage)',
                detail: 'The scene is wired but has gaps. Review the §3 failures and the §4 improvements below before the next release.',
            };
        }
        return {
            marker: '🚫',
            headline: 'Failing — ' + passed + '/' + total + ' checks satisfied (' + coverage + '% coverage)',
            detail: 'This scene is a release blocker. Address every failing §3 check before merging; see §4 for targeted fixes.',
        };
    }

    RuiSelfTestApp.methods = {
        verdictLabel: function (verdict) {
            if (verdict === 'pass') return 'pass';
            if (verdict === 'partial') return 'partial';
            return 'fail';
        },

        formatPct: function (value) {
            return Math.round((value || 0) * 100) + '%';
        },

        formatBytes: function (bytes) {
            return formatBytes(bytes);
        },

        activityTone: function (ratio) {
            var value = Number(ratio) || 0;
            if (value >= 0.6) return 'pass';
            if (value >= 0.3) return 'warn';
            return 'fail';
        },

        activityVerdict: function (ratio) {
            var value = Number(ratio) || 0;
            if (value >= 0.6) return 'Active — majority of code modified within 90 days.';
            if (value >= 0.3) return 'Steady — meaningful churn in the last quarter.';
            if (value > 0) return 'Maintenance mode — most code is over 90 days old.';
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
            return buildSceneCallout(scene);
        },

        passedCount: function (scene) {
            return countPassedChecks(scene);
        },

        checkCount: function (scene) {
            return getCheckCount(scene);
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
            document.documentElement.setAttribute('data-yry-theme', this.theme);
            try {
                localStorage.setItem('yry-report-test-theme', this.theme);
            } catch (e) {}
            if (typeof RuiSelfTestApp.renderMermaidDiagrams === 'function') {
                RuiSelfTestApp.renderMermaidDiagrams();
            }
        },

        toggleMermaidSource: function (slug) {
            var next = RuiSelfTestApp.cloneRecord(this.mermaidSourceOpen || {});
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

            var best = this.scenes[0] ? this.scenes[0].slug : '';
            var bestTop = -Infinity;
            for (var i = 0; i < this.scenes.length; i++) {
                var scene = this.scenes[i];
                var element = document.getElementById('scene-' + scene.index);
                if (!element) continue;
                var rect = element.getBoundingClientRect();
                if (rect.top <= 120 && rect.top > bestTop) {
                    bestTop = rect.top;
                    best = scene.slug;
                }
            }
            this.activeSection = best;
        },
    };
})();
