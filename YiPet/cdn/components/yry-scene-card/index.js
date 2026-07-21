import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const _defaultLinks = [
    { label: 'List', href: 'https://github.com/example/{name}#readme', target: '_blank' },
    { label: 'Architecture', href: 'docs/components/workflow/index.html', target: '_blank' },
    { label: 'Graph', href: 'https://github.com/example/{name}/network/dependents', target: '_blank' },
    { label: 'Tests', href: 'https://github.com/example/{name}/actions', target: '_blank' },
    { label: 'Source', href: 'https://github.com/example/{name}', target: '_blank' },
    { label: 'Demo', href: 'https://{name}.example.com', target: '_blank' },
    { label: 'Review', href: 'https://github.com/example/{name}/pulls', target: '_blank' }
];

const compDef = {
    name: 'ruiSceneCard',
    html: '/cdn/components/yry-scene-card/template.html',
    css: '/cdn/components/yry-scene-card/index.css',
    components: {
        ruiTagChip: {
            get() { return window.ruiTagChip; }
        }
    },
    props: {
        name:       { type: String, required: true },
        nameHref:   { type: String, default: '' },
        nameTarget: { type: String, default: '_blank' },
        badge:      { type: String, default: '' },
        desc:       { type: String, default: '' },
        tags:       { type: Array,  default: () => [] },
        meta:       { type: String, default: '' },
        demo:       { type: String, default: '' },
        links:      { type: Array,  default: null }
    },
    _defaultLinks,
    computed: {
        resolvedLinks() {
            const raw = Array.isArray(this.links)
                ? this.links
                : (this.$options._defaultLinks || []);
            const encodedName = encodeURIComponent(this.name || '');
            const arr = raw.map(function (l) {
                return {
                    icon:   l.icon   || '',
                    label:  l.label  || '',
                    href:   (l.href  || '').replace('{name}', encodedName),
                    target: l.target || '_blank'
                };
            });
            const demo = this.demo;
            if (demo && !arr.some(function (l) { return l.label === 'Demo'; })) {
                arr.push({ label: 'Demo', href: demo, target: '_blank' });
            }
            return arr;
        }
    }
};
registerGlobalComponent(compDef);
export default compDef;
