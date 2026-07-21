---
description: "Detailed specification for each file in the 4-file component pattern: index.html, data.js, index.js, and index.css."
---

# Component 4-File Pattern (Detailed Spec)

## `index.html` — Template + Script Includes

```html
<!-- Component Name — purpose description -->
<template id="xxx-template">
    <section id="xxx">
        <h2>{{ sectionTitle }}</h2>
        <p>{{ sectionDescription }}</p>
        <div v-if="items.length">
            <div v-for="(item, i) in items" :key="i">
                <h3>{{ item.name }}</h3>
                <p v-html="item.desc"></p>
            </div>
        </div>
    </section>
</template>

<!-- data.js MUST come before index.js -->
<script src="data.js"></script>
<script src="index.js"></script>
```

**Rules:**
- `<template>` `id` must be globally unique across all components
- `<section>` `id` must match the sidebar navigation anchor (`href="#xxx"`)
- `data.js` before `index.js` — enforced by `include.js` sequential execution
- Use Vue 3 syntax: `v-for`, `v-if`, `v-html`, `{{ }}`, `:bind`, `@click`

## `data.js` — Data Source

```javascript
/**
 * ComponentName data source
 * Flat object — every key the template reads lives here.
 */
window.COMPONENT_CONFIG = {
    /* ── Cross-cutting values ─────────────── */
    sceneName: 'Getting Started',

    /* ── Copy ────────────────────────────── */
    labels: {
        title:       'Getting Started',
        description: 'How to install and run the project.',
        items: [
            { name: 'Step 1', desc: 'Clone the repo.' },
            { name: 'Step 2', desc: 'Install dependencies.' }
        ]
    },

    /* ── Behavior / visual config ────────────── */
    props: {
        accentToken:  '--yry-accent',
        borderRadius: 'medium'
    }
};
```

**Rules:**
- `window.XXX_CONFIG` key must be globally unique
- Keep the structure flat — the template reads keys directly (e.g., `{{ labels.title }}`)
- Use `v-html` when content contains HTML (`<strong>`, `<a>`)

## `index.js` — Vue 3 Component

```javascript
/**
 * ComponentName Vue 3 component
 * Mounted by the assets/mount-component.js shared utility.
 */
mountDocComponent({
    name: 'DocComponentName',       // Vue devtools + log prefix
    templateId: 'xxx-template',     // matches <template id="...">
    dataKey: 'COMPONENT_CONFIG',    // matches window.XXX_CONFIG

    /* ── Extra options (optional) ───────────────────── */
    extra: {
        methods: {
            handleClick: function(id) { /* ... */ }
        },
        computed: {
            filteredItems: function() { return this.items.filter(/* ... */); }
        },
        mounted: function() {
            // DOM-dependent init; track sub-apps: this._mountedApps = []
        },
        beforeUnmount: function() {
            // Cleanup sub-apps, event listeners
        }
    }
});
```

**Rules:**
- **Never call `Vue.createApp()` directly** — always use `mountDocComponent()`
- `name` format: `Doc` + PascalCase (e.g., `DocIntro`, `DocSidebar`)
- `templateId` must exactly match `<template id="...">`
- `dataKey` must exactly match `window.XXX_CONFIG`
- Track sub-app instances → unmount in `beforeUnmount`

## `index.css` — Component Styles (Optional)

```css
/* Scoped under .yry-doc to avoid leaking */
.yry-doc .component-class { /* ... */ }
```

**Rules:**
- Scoped under `.yry-doc` — no bare element selectors
- If the component has `index.css`, register its directory name in `_COMPONENTS_WITH_CSS` (static whitelist — never probe with `fetch` HEAD)
