/**
 * rui-remediation-group — remediation queue severity-group wrapper.
 * ----------------------------------------------------------------------
 * The remediation section renders three near-identical blocks (P0 /
 * P1 / P2) — each a `.remediation-group` div containing a header
 * (.remediation-group-head) and a `<ul class="remediation-list">`.
 * Only the severity, icon, title, hint, and item count differ.
 *
 * The component owns the outer div + header + `<ul>` shell, and
 * delegates the per-item rows to the default slot — so callers
 * simply do:
 *
 *   <rui-remediation-group
 *       v-if="remediationGrouped.P0.length"
 *       severity="P0" icon="!" title="P0 — Critical"
 *       hint="Resolve before merge / release"
 *       :count="remediationGrouped.P0.length" tone="critical">
 *       <rui-remediation-item v-for="item in remediationGrouped.P0"
 *                             :key="item._key" :item="item" />
 *   </rui-remediation-group>
 *
 * The `visible` prop keeps the conditional rendering ergonomic for
 * callers — it just v-if's out the whole block when there's nothing
 * to show. Defaults to `true` so callers can omit it when the
 * surrounding `<template v-if>` is already guarding emptiness.
 */
(function () {
    'use strict';

    window.ruiRemediationGroup = {
        name: 'ruiRemediationGroup',
        template: '#rui-remediation-group-tpl',
        props: {
            severity:  { type: String, required: true },  // P0 | P1 | P2
            icon:      { type: String, required: true },  // '!' / '▲' / 'i'
            title:     { type: String, required: true },
            hint:      { type: String, default: '' },
            count:     { type: Number, default: 0 },
            tone:      { type: String, default: 'critical' },  // critical | warn | info
            visible:   { type: Boolean, default: true }
        }
    };
})();
