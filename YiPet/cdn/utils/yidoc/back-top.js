/**
 * yry-back-top — Minimal inline stub.
 * Renders a fixed-position back-to-top button.
 */
(function () {
    'use strict';
    window.ruiBackTop = {
        name: 'ruiBackTop',
        template: '<button class="yry-back-top" @click="scrollTop" aria-label="Back to top" title="Back to top (t)"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 14V2M3 7l5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>',
        methods: {
            scrollTop: function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        },
    };
})();
