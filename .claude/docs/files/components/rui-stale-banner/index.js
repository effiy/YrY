/**
 * rui-stale-banner — "data is N days old" warning strip.
 * ----------------------------------------------------------------------
 * Replaces the inline `<div class="stale-banner">` block in
 * files/index.html. Defaults to the project's standard copy
 * (CN-localised) but accepts a default slot for callers that need
 * to override the message.
 *
 * The "is stale" decision lives in the parent — pass `visible`
 * explicitly so the same component can also be used as a plain
 * banner with a different gate.
 */
(function () {
    'use strict';

    window.ruiStaleBanner = {
        name: 'ruiStaleBanner',
        template: '#rui-stale-banner-tpl',
        props: {
            visible:     { type: Boolean, default: true },
            ageDays:     { type: Number,  default: 0 },
            generatedAt: { type: String,  default: '' }
        }
    };
})();
