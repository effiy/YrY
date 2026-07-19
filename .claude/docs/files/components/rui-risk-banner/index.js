/**
 * rui-risk-banner — risk overview banner with optional hotspot list.
 * ----------------------------------------------------------------------
 * Replaces the previous template-string + v-html pattern in
 * app/state.js (riskBanner). The component consumes a fully
 * structured `banner` prop (level / icon / title / intro / hotspots /
 * actions) and renders it with native Vue templating — so hotspot
 * paths are interpolated by Vue's text-mustache (no manual escape, no
 * v-html, no XSS surface).
 *
 * The page-level `riskBanner` computed now only produces the data
 * shape; the markup lives here.
 */
(function () {
    'use strict';

    window.ruiRiskBanner = {
        name: 'ruiRiskBanner',
        template: '#rui-risk-banner-tpl',
        props: {
            banner: { type: Object, default: null }
        }
    };
})();
