/**
 * rui-finding-card — single key-finding card.
 * ----------------------------------------------------------------------
 * The page-level key-findings grid iterates a list of finding objects
 * (icon, label, value, sub, hint, href, tone) and inlines the same
 * `.finding-card` markup per row. Extract it into a self-contained
 * component so the v-for becomes `<rui-finding-card v-for="f in
 * keyFindings" :key="..." v-bind="f" />` and the markup is defined
 * exactly once.
 */
(function () {
    'use strict';

    window.ruiFindingCard = {
        name: 'ruiFindingCard',
        template: '#rui-finding-card-tpl',
        props: {
            icon:  { type: String, required: true },
            label: { type: String, required: true },
            value: { type: [String, Number], required: true },
            sub:   { type: String, default: '' },
            hint:  { type: String, default: '' },
            href:  { type: String, required: true },
            tone:  { type: String, default: 'info' }   // critical | warn | info | ok
        }
    };
})();
