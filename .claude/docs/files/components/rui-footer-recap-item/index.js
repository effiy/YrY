/**
 * rui-footer-recap-item — footer summary stat (label / value).
 * ----------------------------------------------------------------------
 * Replaces 4× inline `.footer-recap-item` blocks in files/index.html.
 * Pass a `label` and either a `value` prop or default slot. The
 * optional `tone` prop maps to the existing .critical / .warn / .ok
 * modifier classes on `.footer-recap-value` defined in files/index.css.
 */
(function () {
    'use strict';

    window.ruiFooterRecapItem = {
        name: 'ruiFooterRecapItem',
        template: '#rui-footer-recap-item-tpl',
        props: {
            label: { type: String, required: true },
            value: { type: [String, Number], default: '' },
            tone: { type: String, default: '' }   // 'critical' | 'warn' | 'ok' | ''
        }
    };
})();
