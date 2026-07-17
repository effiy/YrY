# vue3-h5-template

> An out-of-the-box mobile project base template built on the Vue 3 family, TS / JS, and the Vite build tool.
> The main branch defaults to TypeScript. For the JavaScript edition, use the `js-version` branch; for i18n multi-language support, use the `i18n` branch.

> Source: <https://github.com/yulimchen/vue3-h5-template>
> Verbatim copy from upstream master branch.

## Features

- [x] ⚡ Vue 3 + Vite 8
- [x] 🍕 TypeScript
- [x] ✨ Vant 4 component library
- [x] 🌀 Tailwindcss atomic-class framework
- [x] 👏 Multiple icon solutions integrated
- [x] 🍍 Pinia state management
- [x] 🌓 Dark mode support
- [x] 🧀 i18n support
- [x] Vue Router 4
- [x] vmin viewport adaptation
- [x] Axios wrapper
- [x] Gzip compression of build assets
- [x] Mock data in development
- [x] ESLint
- [x] First-screen loading animation
- [x] Debug panel in development
- [x] CDN dependencies in production

## Branches

- [master](https://github.com/yulimchen/vue3-h5-template) — Default branch, TypeScript + Vant 4 + Pinia + i18n off
- [i18n](https://github.com/yulimchen/vue3-h5-template/tree/i18n) — Vue-i18n multi-language edition enabled
- [js-version](https://github.com/yulimchen/vue3-h5-template/tree/js-version) — Pure JavaScript edition
- [releases](https://github.com/yulimchen/vue3-h5-template/releases) — Stable version list
- [LICENSE](https://github.com/yulimchen/vue3-h5-template/blob/master/LICENSE) — MIT license

## Run the Project

Requires Node 20+. Recommend using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to manage Node versions and the [pnpm](https://pnpm.io/zh/installation) package manager.

```shell
# Clone the project
git clone https://github.com/yulimchen/vue3-h5-template.git
# Enter the project directory
cd vue3-h5-template
# Install dependencies
pnpm install
# Start the service
pnpm dev
```

How to clone the i18n branch:

```shell
git clone -b i18n https://github.com/yulimchen/vue3-h5-template.git
cd vue3-h5-template
pnpm install
pnpm dev
```

How to clone the js-version branch:

```shell
git clone -b js-version https://github.com/yulimchen/vue3-h5-template.git
cd vue3-h5-template
pnpm install
pnpm dev
```

## Documentation Guide

- [On-demand import of Vant components](#vant)
- [Icon usage](#icon)
- [Route caching & naming notes](#router)
- [eruda debug panel](#console)
- [Dynamically set page title](#page-title)
- [Development environment Mock](#mock)
- [vw viewport adaptation](#viewport)
- [Tailwindcss atomic-class framework](#tailwindcss)
- [Git commit message convention](#git)
- [CDN-loaded dependencies](#CDN)

### On-demand Import of Vant Components

Importing the full component library is too bloated. The project uses the `unplugin-vue-components` plugin for on-demand auto-importing of components. See [Vant Official Docs - Plugin Configuration](https://vant-ui.github.io/vant/#/zh-CN/quickstart#2.-pei-zhi-cha-jian).

### Icon Usage

#### Iconify Icons (Recommended)

Iconify has an icon library of over 200,000 icons. This project wraps `Iconify for Vue` slightly.

- Option 1: Request icons on demand via the Iconify API. `<i-icon icon="fa6-solid:heart" />`
- Option 2: For intranet environments, install the icon-set dependency package for offline use.
  ```shell
  pnpm i -D @iconify-icons/fa6-solid
  ```
  ```ts
  import Fa6SolidHeart from '@iconify-icons/fa6-solid/heart'
  ```
  ```vue
  <i-icon :icon="Fa6SolidHeart" />
  ```
- Combined with the VS Code extension [Iconify](https://marketplace.visualstudio.com/items?itemName=antfu.iconify), you can preview icons in real time while coding.
- Example reference: [tools page](https://github.com/yulimchen/vue3-h5-template/blob/master/src/views/tools/index.vue).
- Full docs: <https://iconify.design/docs/>

#### Local SVG File Icons

- Place SVG icon files in the `src/icons/svg` directory.
- Use `<svg-icon name="svg-icon-file-name" />` directly.
- The project uses `unplugin-vue-components` for auto-importing components; no need to register a global icon component in `main.ts`.

### Route Caching & Naming Notes

- Components are cached by default. To disable, set `meta.noCache` to `true` on the corresponding route.
- To ensure pages are cached correctly, make sure the component's `name` matches the corresponding route's `name` exactly (use `defineOptions({ name: 'About' })`).

### eruda Debug Panel

- In development, the eruda debug panel is dynamically loaded (the CDN script is injected on demand via `src/main.ts`).
- If not needed, set `VITE_ENABLE_ERUDA` to a non-`true` value in `.env.development`.

### Dynamically Set Page Title

- Call `setPageTitle(to.meta.title)` in the global before-guard in `src/router/index.ts`.
- See `src/utils/set-page-title.ts` for the implementation.

### Development Environment Mock

- Configure endpoints and data in the `mock` directory.
- Docs: [vite-plugin-mock-dev-server](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/blob/main/README.zh-CN.md).

### vw Viewport Adaptation

- Uses `cnjm-postcss-px-to-viewport` for viewport adaptation.
- Config file: `postcss.config.js`.
- Defaults to a 375 design width, minimum conversion value of 1, retains 2 decimal places.
- Compatible with Android >= 4.0, iOS >= 7.

### Tailwindcss Atomic-Class Framework

- Tailwindcss 3.0+ defaults to `JIT` mode; combined with Vite it has a small bundle and fast builds.
- Official docs: <https://tailwindcss.com/docs/padding>.

### Git Commit Message Convention

- The project uses `husky` to enforce Git commit messages, following the community-mainstream [Angular Conventional Commits](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular) spec.
- Format: `<type>(<scope>): <subject>`
- Types: feat / fix / style / perf / refactor / revert / test / docs / chore / workflow / ci / types / wip.

### CDN Production Environment Dependencies

- Off by default. To enable: set `VITE_CDN_DEPS` to `true` in `.env.production` at the root and rebuild.

## Acknowledgments

- [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)
- [vant-demo](https://github.com/youzan/vant-demo)
- [vue-pure-admin](https://github.com/xiaoxian521/vue-pure-admin)
- [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)
- Font Awesome Solid icons created by [Dave Gandy](https://github.com/FortAwesome/Font-Awesome), released under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license.

## License

[MIT](https://github.com/yulimchen/vue3-h5-template/blob/master/LICENSE)
