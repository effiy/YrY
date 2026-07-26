# YiVad

### Introduction 📖

YiVad is an open-source admin management framework built with Vue 3.4, TypeScript, Vite 5, Pinia, and Element Plus, developed using the latest tech stack. The project provides a powerful ProTable component to improve your development efficiency. It also includes commonly used components, hooks, directives, dynamic routing, button-level permission control, and more.

### Features 🔨

- Built with Vue 3.4 + TypeScript, single-file components with **<script setup>**
- Uses Vite 5 for development and build tooling (configured with gzip/brotli bundling, TSX syntax, CORS proxy, and more)
- Uses Pinia instead of Vuex — lightweight, simple, and easy to use, with integrated Pinia persistence plugin
- Full Axios wrapper in TypeScript (request interception, cancellation, common request encapsulation, and more)
- ProTable component built on Element Plus, with table pages driven entirely by column configuration
- Supports Element component size switching, multi-theme layouts, dark mode, and i18n internationalization
- Dynamic route permission guards with Vue Router, lazy loading, and page-level button permission control
- Page caching via KeepAlive, with support for multi-level nested route caching
- Custom directives (permission, copy, watermark, drag, throttle, debounce, long press, and more)
- Unified code formatting with Prettier, integrated with ESLint and Stylelint
- Standardized commit messages with husky, lint-staged, commitlint, czg, and cz-git

### Installation & Usage 📔

- **Install：**

```text
pnpm install
```

- **Run：**

```text
pnpm dev
pnpm serve
```

- **Build：**

```text
# Development environment
pnpm build:dev

# Test environment
pnpm build:test

# Production environment
pnpm build:pro
```

- **Lint：**

```text
# eslint code check
pnpm lint:eslint

# prettier code formatting
pnpm lint:prettier

# stylelint style formatting
pnpm lint:stylelint
```

- **commit：**

```text
# Commit code (automatically runs lint:lint-staged before committing)
pnpm commit
```

### Directory Structure 📚

```text
YiVad
├─ .husky                  # husky config files
├─ .vscode                 # VSCode recommended config
├─ build                   # Vite config options
├─ public                  # Static assets (this folder is not bundled)
├─ src
│  ├─ api                  # API interface management
│  ├─ assets               # Static assets
│  ├─ components           # Global components
│  ├─ config               # Global config
│  ├─ directives           # Global directives
│  ├─ enums                # Common enumerations
│  ├─ hooks                # Common hooks
│  ├─ languages            # i18n internationalization
│  ├─ layouts              # Layout modules
│  ├─ routers              # Route management
│  ├─ stores               # Pinia store
│  ├─ styles               # Global styles
│  ├─ typings              # Global TypeScript declarations
│  ├─ utils                # Utility functions
│  ├─ views                # All project pages
│  ├─ App.vue              # Root component
│  ├─ main.ts              # Entry file
│  └─ vite-env.d.ts        # TypeScript declaration for Vue SFCs
├─ .editorconfig           # Unified editor coding style config
├─ .env                    # Vite common config
├─ .env.development        # Development environment config
├─ .env.production         # Production environment config
├─ .env.test               # Test environment config
├─ .eslintignore           # Ignore ESLint checks
├─ .eslintrc.cjs           # ESLint config file
├─ .gitignore              # Ignore git commits
├─ .prettierignore         # Ignore Prettier formatting
├─ .prettierrc.cjs         # Prettier config
├─ .stylelintignore        # Ignore stylelint formatting
├─ .stylelintrc.cjs        # stylelint config
├─ CHANGELOG.md            # Project changelog
├─ commitlint.config.cjs   # Git commit convention config
├─ index.html              # Entry HTML
├─ LICENSE                 # Open source license
├─ lint-staged.config.cjs  # lint-staged config
├─ package-lock.json       # Dependency version lock
├─ package.json            # Dependency management
├─ postcss.config.cjs      # PostCSS config
├─ README.md               # README introduction
├─ tsconfig.json           # TypeScript global config
└─ vite.config.ts          # Vite global config
```

### Browser Support 🌎

- For local development, the latest version of Chrome is recommended [Download](https://www.google.com/intl/zh-CN/chrome/).
- Production supports modern browsers only. IE is no longer supported. For more details, see [Can I Use ES Module](https://caniuse.com/?search=ESModule).

| ![IE](https://i.imgtg.com/2023/04/11/8z7ot.png) | ![Edge](https://i.imgtg.com/2023/04/11/8zr3p.png) | ![Firefox](https://i.imgtg.com/2023/04/11/8zKiU.png) | ![Chrome](https://i.imgtg.com/2023/04/11/8zNrx.png) | ![Safari](https://i.imgtg.com/2023/04/11/8zeGj.png) |
| :---------------------------------------------: | :-----------------------------------------------: | :--------------------------------------------------: | :-------------------------------------------------: | :-------------------------------------------------: |
|                   not support                   |                  last 2 versions                  |                   last 2 versions                    |                   last 2 versions                   |                   last 2 versions                   |

## Domain Language

YiVad is a domain model for admin management systems, built around three core concepts: **menu permission**, **dynamic routing**, and **component configuration**.

### Terminology

- **ProTable** — A declarative table component built on Element Plus `el-table`, driven by a `columns` configuration array for table rendering, search, pagination, and sorting, eliminating repetitive table template code.
- **Dynamic Router** — A mechanism that fetches the permission menu tree from the backend menu API, flattens it, and registers routes at runtime via `router.addRoute()`. Unlike static routes, dynamic routes are visible only based on the user's permissions.
- **AuthButton** — A permission model that controls page button visibility via the `v-auth` directive. Button permission lists are fetched from the backend API, decoupled from page routes, and support fine-grained operation-level permission control.
- **Pinia Store Persist** — A mechanism that uses `pinia-plugin-persistedstate` to automatically sync Pinia store state to `localStorage`, ensuring user state (token, theme, tabs) is preserved after page refresh.
- **Layout Mode** — YiVad supports four layout modes: `vertical` (sidebar), `classic` (classic), `transverse` (top navigation), `columns` (split), switchable dynamically via `globalStore.layout`.

### Term Relationships

- **Dynamic Router** depends on permission data from **AuthButton** to determine which menus are visible
- **ProTable** relies on the `useTable` hook to handle pagination and data fetching
- **Pinia Store Persist** applies to the `global`, `user`, and `tabs` stores
- **Layout Mode** consumes theme and layout configuration from `globalStore`

### Example Conversations

> **User:** I want to add an edit button to the "User Management" page, but only the admin role should see it.
>
> **System:** Add the `v-auth="'user:edit'"` directive to the button. The backend returns the current role's button permission list via the `authButtonList` API. If `user:edit` is not in the list, the button will be automatically hidden.
>
> **User:** How do I add a new page to the sidebar menu?
>
> **System:** Create the page component under `src/views/`, then configure the menu item (path, name, component path) in the backend menu management API. The frontend uses **dynamic routing** to automatically fetch and register routes after login. If the backend is unavailable, you can add menu items directly in `src/assets/json/authMenuList.json`.

### Disambiguation Markers

| Term | Easily Confused Concept |
|------|---------------|
| **ProTable** | Not Element Plus's `el-table`; ProTable is a full table solution with search, pagination, and column configuration |
| **Dynamic Router** | Not Vue Router's lazy loading (`() => import()`) or nested routes (children); dynamic routing specifically refers to runtime route registration based on permissions |
| **AuthButton** | Not a route guard (`beforeEach`); route guards control page-level access, while AuthButton controls button-level visibility within a page |
| **Persist** | Not the browser's `localStorage` API; refers to the Pinia plugin's automatic bidirectional sync mechanism |
| **Layout Mode** | Not CSS layout or Element Plus's `el-row/el-col` grid; it is page-level framework structure switching |
