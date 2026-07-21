/**
 * yry-breadcrumb — Minimal inline stub.
 * Renders a breadcrumb trail from an `items` array.
 * Each item: { label: string, href?: string }
 */
(function () {
    'use strict';
    window.ruiBreadcrumb = {
        name: 'ruiBreadcrumb',
        props: ['items'],
        template: '<nav class="yry-breadcrumb" aria-label="Breadcrumb"><template v-for="(item, i) in items" :key="i"><span v-if="i > 0" class="yry-breadcrumb__sep" aria-hidden="true">/</span><a v-if="item.href" :href="item.href" v-text="item.label"></a><span v-else v-text="item.label"></span></template></nav>',
    };
})();
