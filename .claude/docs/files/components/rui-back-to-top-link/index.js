/**
 * rui-back-to-top-link — small "↑ Back to top" link used inside the
 *                        read-helper / methodology collapsible cards.
 * ----------------------------------------------------------------------
 * Replaces the inline `<a class="read-helper__back-top" ... onclick=
 * "window.scrollTo(...);return false;">` blocks. The previous version
 * shipped an inline JS string in the markup (a small CSP / a11y
 * smell) — the new component binds a real click handler so no
 * `onclick` attribute is needed.
 */
(function () {
    'use strict';

    window.ruiBackToTopLink = {
        name: 'ruiBackToTopLink',
        template: '#rui-back-to-top-link-tpl',
        props: {
            label: { type: String, default: '↑ Back to top' }
        },
        methods: {
            onClick: function () {
                if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        }
    };
})();
