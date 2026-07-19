/**
 * rui-meta-item — header meta-grid item (label / value).
 * ----------------------------------------------------------------------
 * Replaces 5× inline `.meta-item` blocks in files/index.html. Accepts
 * a `label` and either a `value` prop or default slot content (so the
 * page can keep embedding rich content — e.g. the health-score
 * "X / 100" expression — by slot).
 */
(function () {
    'use strict';

    window.ruiMetaItem = {
        name: 'ruiMetaItem',
        template: '#rui-meta-item-tpl',
        props: {
            label: { type: String, required: true },
            value: { type: [String, Number], default: '' }
        }
    };
})();
