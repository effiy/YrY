# mobile-web-best-practice

> This project uses a Todo app built with [vue-cli3](https://cli.vuejs.org/) and [typescript](http://www.typescriptlang.org/) as an example to illustrate best practices for mobile web development (not limited to the [Vue](https://cn.vuejs.org/) framework). Many of these practices also apply to PC web development.
> The author periodically updates this project with the best solutions found in practice.

> Source: <https://github.com/mcuking/mobile-web-best-practice>
> Verbatim copy from upstream master branch.

## Online Demo

The Todo app has a clean, practical interaction. No server is required — data is saved to the webview's indexDB, ensuring data safety. You're welcome to use it in your day-to-day work.

| Platform | Link | Notes |
| -------- | ---- | ---- |
| Web | <https://mcuking.github.io/mobile-web-best-practice> |  |
| Android | <https://www.pgyer.com/mwbpcontainer> | Install password: 123456 |

## Table of Contents

- [Layered Architecture](#layered-architecture)
- [Micro-frontends](#micro-frontends)
- [Offline Package](#offline-package)
- [JSBridge](#jsbridge)
- [Error Monitoring](#error-monitoring)
- [Page State Persistence](#page-state-persistence)
- [Request Data Caching](#request-data-caching)
- [Restricting Native API Calls](#restricting-native-api-calls)
- [Style Adaptation](#style-adaptation)
- [Form Validation](#form-validation)
- [Gesture Libraries](#gesture-libraries)
- [Webpack Strategy](#webpack-strategy)
- [Debug Console](#debug-console)
- [Packet Capture Tools](#packet-capture-tools)
- [Deployment](#deployment)
- [Common Questions](#common-questions)

## Layered Architecture

- [react-clean-architecture](https://github.com/eduardomoroni/react-clean-architecture)
- [business-rules-package](https://github.com/fabriciomendonca/business-rules-package)
- [ddd-fe-demo](https://github.com/Vincedream/ddd-fe-demo)

Today's frontend development is mostly single-page apps. When business logic becomes complex enough, you inevitably hit problems like these:

- Business logic is too concentrated in the view layer, making it impossible to share platform-agnostic business logic across platforms.
- When multiple people collaborate, everyone has a different code style and understanding of the business.
- Understanding of the product stays at the page-driven level, causing the technical model to diverge significantly from the actual business model.
- Over-reliance on a frontend framework means that switching frameworks during a rewrite requires rewriting all business logic.

To address these problems, the author studied DDD (Domain-Driven Design), Clean Architecture, and similar ideas, and collected practical frontend materials with similar thinking, forming the following frontend layered architecture: View / Services / Entities / Interactors.

### Services Layer

The Services layer operates the underlying technologies: wrapping AJAX requests, manipulating cookies / localStorage / indexDB, invoking native capabilities, establishing WebSockets, and so on. It can be subdivided into a request layer and a translator layer. The sample code (based on Vue + TS) demonstrates three concrete implementations: CommonService, NativeService, and NoteService.

### Entities Layer

An Entity is a core concept of Domain-Driven Design. It defines the attributes and methods of an individual in the business. In this project, Note and Notebook are both entities. The Note entity demonstrates how to wrap attributes, derived attributes (getters), and strongly related business methods.

### Interactors Layer

The Interactors layer handles business logic and is mainly composed of business use cases. Generally an Interactor is a singleton — it can store state, avoid unnecessary HTTP calls, and decide when to load new data. CommonInteractor and NoteInteractor are two examples in the project.

### Recommended Articles

- [Frontend Architecture - Making Refactoring Less Painful (Translation)](https://juejin.im/post/5d849084e51d456206115acb)
- [Scalable Frontend #1 - Architecture Foundations (Translation)](https://juejin.im/post/5d897d13f265da03c5035030)
- [Scalable Frontend #2 - Common Patterns (Translation)](https://juejin.im/post/5d8ac00cf265da5b6a16844a)
- [Domain-Driven Design in Practice in Internet Business Development](https://tech.meituan.com/2017/12/22/ddd-in-practice.html)
- [Frontend Development - Domain-Driven Design](https://juejin.im/post/5b1c71ad6fb9a01e5918398d)
- [Applying Domain-Driven Design in Frontend](https://juejin.im/post/5d3926176fb9a07ef161c719)

## Micro-frontends

- [preload-routes](https://github.com/micro-frontends-vue/preload-routes)
- [async-routes](https://github.com/micro-frontends-vue/async-routes)

### Background

For large frontend projects (internal corporate systems like OA / HR / CRM / meeting room booking), putting all the business in one frontend project leads to a huge codebase, long compile times, and small changes triggering full-package deployments.

### Solution

- preload-routes: A main project + multiple sub-projects. Sub-projects are packaged in vue-cli 3 library mode. The main project uses InsertScriptWebpackPlugin to insert the sub-project entry as a `<script>` into the HTML. Sub-projects register their route list to `Vue.__share__.routes`, and the main project merges it into the router instance.
- async-routes: Lazily-loaded routes that dynamically load sub-project resources when the user clicks.

Main project responsibilities: manage sub-project route switching, register sub-project routes and the global Store layer, and provide global libraries and utilities. Sub-project responsibilities: develop the sub-business-line code, including PC + Mobile + reuse-layer code.

## Offline Package

- Basic idea: Web static resources (html / js / css / images) are packaged and pushed to the client. The client intercepts network requests and reads resources locally to achieve "instant open".
- Resource update: On startup, the client fetches `version.json` and compares the local version number to decide whether to download a new package.
- Resource download: Typically uses libraries such as `RNFetchBlob` / `okdownload`.
- Resource unzip: Unzips to a path like `files/offline/...`.
- Resource loading: Through native request interception (NSURLProtocol / WebViewClient.shouldInterceptRequest), requests are redirected to local files.
- Security: Asymmetric encryption (private-key signing + public-key verification) prevents tampering with the offline package.
- Real-world project: [react-native-largelist](https://github.com/mcuking/react-native-largelist) and other RN projects have a complete offline-package implementation.

## JSBridge

- Background: H5 pages cannot directly invoke native capabilities (camera, geolocation, push, local storage, etc.). A JSBridge is needed to establish a communication channel between JS and native.
- Implementation principle: JS calls native (intercept URL scheme -> native parses scheme -> native invokes the capability -> callback to JS), native calls JS (native directly executes a JS string or injects an object via messageHandlers).
- Recommended library: [dsbridge](https://github.com/wendux/DSBridge-Android) (unified across Android / iOS / uni-app).
- Recommended article: [JSBridge Principle and Implementation](https://juejin.im/post/5d1c257a6fb9a07ed4410ad1)

## Error Monitoring

- Reporting triggers: JS runtime errors (`window.onerror` / `unhandledrejection`), Promise exceptions, resource load failures, API failures (HTTP 4xx / 5xx / business error codes), white-screen detection (`document.getElementsByTagName('*').length === 0` or sampled comparison of root-node screenshots).
- Reported content: error type, error message, stack, url, user identifier, UA, network type, device model, SDK version.
- Reporting methods: immediate reporting (navigator.sendBeacon — sent even if the page unloads), sampled reporting (only report 1/N), batched reporting (accumulate a batch and send together).
- Recommended SDKs: [sentry](https://github.com/getsentry/sentry), [fundebug](https://www.fundebug.com/), [FrontJS](https://www.frontjs.com/).
- In-house suggestion: Set up ELK / ClickHouse storage and custom alerting rules.

## Page State Persistence

- Scenario: Going from a list to a detail and back — preserve the list scroll position, form content, and selected tab.
- Option 1: keep-alive + scrollBehavior (Vue Router scrollBehavior + sessionStorage to cache scrollTop).
- Option 2: sessionStorage / localStorage to cache key state.
- Option 3: Hoist state into Vuex / Pinia; route changes don't destroy the store.
- Option 4: The navigation-ui library ([@navigation-ui](https://github.com/lz5z/keep-alive-route)) does route-granular keep-alive.

## Request Data Caching

- In-memory cache: Promise-based singleton Map (key = url + params, value = Promise). Identical requests share the same Promise to avoid duplicates.
- localStorage / sessionStorage cache: Persisted with a maxAge expiration, still hit after a page refresh.
- indexDB cache: For larger or structured data (notes, product lists, offline messages).
- Recommended libraries: [axios-extensions](https://github.com/lz5z/axios-extensions), [vue-axios-extensions](https://www.npmjs.com/package/vue-axios-extensions), [lscache](https://github.com/pamelafox/lscache).
- In-house: The `@m({ maxAge: 60 * 1000 })` decorator attached directly to Service methods.

## Restricting Native API Calls

- Scenario: When JSBridge calls native, you need to verify: (1) platform support (android / ios / WeChat mini-program); (2) native version support (>= 1.0.1); (3) user is logged in; (4) user has permission; (5) parameters are valid.
- Decorator solution: `@limit(['android', 'ios'], '1.0.1')` attached directly to a method, uniformly intercepted by the decorator.
- Flow: JS-side pre-validation -> serialize parameters -> call native -> native secondary validation -> execute business -> callback to JS -> error handling.

## Style Adaptation

- viewport scaling: Controlled via `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- rem adaptation: Use `lib-flexible` + `postcss-pxtorem` to convert px to rem; the root font-size is set dynamically based on screen width (design width / 10).
- vw adaptation: Use `postcss-px-to-viewport` to convert px to vw; no JS needed (design width / 100).
- 1px border: `transform: scale(0.5)` + `transform-origin: 0 0`, or simulate with `border-image` / `box-shadow`.
- Safe area adaptation: iOS notch screens use `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`.
- Font size: Forbid user scaling (`user-scalable=no`); use rem on the root node.

## Form Validation

- async-validator: Open-sourced by Alibaba, an async validation-rules engine.
- Vant's built-in Form component: Based on async-validator, out of the box.
- Recommended libraries: [async-validator](https://github.com/yiminghe/async-validator), [Vant Form](https://vant-ui.github.io/vant/#/zh-CN/form).

## Gesture Libraries

- Scenarios: Common H5 interactions like swipe-left-to-delete, long-press drag, pinch-to-zoom, rotate, pull-to-refresh, infinite scroll.
- Recommended libraries: [hammer.js](https://github.com/hammerjs/hammer.js), [alloyfinger](https://github.com/AlloyTeam/AlloyFinger), [interact.js](https://github.com/taye/interact.js), [vue-touch](https://github.com/vuejs/vue-touch).

## Webpack Strategy

- Build speedup: dll-plugin / hard-source-webpack-plugin / thread-loader / cache-loader / esbuild-loader.
- Bundle optimization: splitChunks (business / vendor / common), tree-shaking, sideEffects, on-demand import (`unplugin-vue-components` + Vant / Element), CDN externals (`externals` + `html-webpack-externals-plugin`), gzip / brotli compression.
- Cache strategy: runtimeChunk: 'single', file hashing (contenthash), long-term caching (maxAge=31536000, immutable).
- Visual analysis: [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer).

## Debug Console

- eruda: Mobile web debug panel (Console / Network / Element / Sources), just include via CDN.
- vConsole: Open-sourced by Tencent, a lightweight mobile debug panel.
- Recommended libraries: [eruda](https://github.com/nicknisi/eruda), [vConsole](https://github.com/Tencent/vConsole).

## Packet Capture Tools

- Charles: HTTP / HTTPS capture; SSL proxying requires installing the root certificate.
- Fiddler: The classic Windows capture tool.
- Whistle: A Node-based capture + rewrite + mock tool, cross-platform, recommended.
- Recommended tools: [Charles](https://www.charlesproxy.com/), [Whistle](https://github.com/nicknisi/whistle).

## Deployment

- CDN: Upload static resources to CDN; origin fetch uses COS / OSS.
- Version management: Generate a `version.json` per release; the frontend / native fetches and compares to decide whether to update.
- Canary release: Use URL parameters like `?v=2&gray=1` to control the canary ratio.
- Rollback: Keep the previous version's package; switch back to it in emergencies.
- Monitoring: After release, use sentry / fundebug to monitor the exception rate in real time; use tracking events to monitor key metrics.

## Common Questions

- iOS 12 input focus doesn't reflow the page: Use `scrollIntoView` + delay + soft-keyboard listener.
- Absolute elements misalign when the soft keyboard pops up: Use `100vh` instead of `100%` + flex layout.
- Scroll passthrough: Add `overflow: hidden` to the body and record the scroll position.
- Inconsistent 1px border thickness: Simulate with transform scale(0.5) or border-image.
- WebView cookie loss: iOS WKWebView needs `document.cookie = ...` injected; Android needs `CookieManager.setCookie`.
- Old Android localStorage failure: Wrap in try/catch and degrade to cookie / sessionStorage.
- Recommended article: [H5 Common Questions Summary](https://juejin.im/user/1714893789630792)
