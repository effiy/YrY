/**
 * rui-remediation-item — single remediation queue row.
 * ----------------------------------------------------------------------
 * The previous markup defined the same ~60-line `<li>` block three
 * times — once per severity (P0 / P1 / P2) — differing only in the
 * outer tone class. Centralising the row into this component:
 *
 *   1) Eliminates the 3× duplication and keeps visual + interaction
 *      rules in one place.
 *   2) Pushes the file-path copy and the resolved-state toggle into
 *      dedicated sub-components (`<rui-copy-button>` and
 *      `<rui-remediation-check>`) so the row is just composition.
 *   3) Replaces the page-level `copyFilePath` + `copiedKey` + timer
 *      dance — the copy button owns its own feedback and reuses the
 *      same 1.5 s window the project conventions require.
 *
 * Props:
 *   item   — the row data (severity, file, line, message, metric,
 *            impact, risk, recommendations, acceptance, firstStep,
 *            tooling, preventiveControls, rollbackPlan, _key, _done,
 *            href, marker, category, effort, scoreUplift,
 *            estimatedHours, blastRadius).
 *
 * Emits:
 *   toggle(done: boolean) — when the user flips the checkbox. The
 *   parent should use this to update the persisted remediationDone
 *   map (typically: `remediationDone[item._key] = done`).
 */
(function () {
    'use strict';

    var SEVERITY_TONE = {
        P0: 'tone-critical',
        P1: 'tone-warn',
        P2: 'tone-info'
    };

    window.ruiRemediationItem = {
        name: 'ruiRemediationItem',
        template: '#rui-remediation-item-tpl',
        props: {
            item: { type: Object, required: true }
        },
        computed: {
            tone: function () {
                return SEVERITY_TONE[this.item.severity] || 'tone-info';
            },
            done: function () {
                return Boolean(this.item._done);
            },
            fileRef: function () {
                var f = String(this.item.file || '');
                var l = this.item.line;
                return l != null && l !== '' ? f + ':' + l : f;
            },
            hasDetail: function () {
                var it = this.item;
                return Boolean(
                    it.metric || it.impact || it.risk || it.firstStep ||
                    (it.recommendations && it.recommendations.length) ||
                    (it.acceptance && it.acceptance.length) ||
                    (it.tooling && it.tooling.length) ||
                    (it.preventiveControls && it.preventiveControls.length) ||
                    it.rollbackPlan
                );
            },
            hasRecsOrAcceptance: function () {
                var it = this.item;
                return Boolean(
                    (it.recommendations && it.recommendations.length) ||
                    (it.acceptance && it.acceptance.length)
                );
            }
        },
        methods: {
            onToggle: function (checked) {
                this.$emit('toggle', checked, this.item);
            }
        }
    };
})();
