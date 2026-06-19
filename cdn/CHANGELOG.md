# Changelog

All notable changes to **yry-cdn** will be documented in this file.

> 格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),
> 本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。
>
> **新增** · **变更** · **弃用** · **移除** · **修复** · **安全**

---

## [Unreleased]

### Added
- 工程化基础设施:`scripts/build-manifest.mjs` 自动生成 `components.manifest.json`
- 工程化基础设施:`scripts/sync-version.mjs` 一键同步版本号到 index.html/README
- 工程化基础设施:`scripts/validate.mjs` 三合一校验 (manifest/version/components)
- 配置:`package.json` 新增 `scripts` / `engines` / `exports` / `sideEffects` / `peerDependencies`
- 配置:`.editorconfig` / `.gitattributes` / `.prettierrc` / `.eslintrc` / `.stylelintrc`
- 文档:`CONTRIBUTING.md` / `SECURITY.md`
- CI:`.github/workflows/ci.yml`(lint + validate + manifest 重建)
- CI:`.github/workflows/release.yml`(npm publish on tag)

---

## [1.2.0] - 2026-06-16

### Added
- `yry-stats-grid` 组件 — KPI 总览统计卡组
- `yry-panel-hub` 组件 — 浮动面板工具栏(本页顶部即采用)
- `yry-doc-layer` 组件 — 文档分层容器,与 `docs/index.html` 4 个 doc-layer 同构
- `yry-story-card` / `yry-scene-card` — 故事/场景卡片,7 件套交付物链接
- `YrY.copyCmd` / `YrY.toast` API 增强

### Migration
v1.1 → v1.2:无破坏性变更。`panel-hub` 事件名 `panel-hub-select` 与 docs 同构,直接复用绑定代码。

---

## [1.1.0] - 2026-05-20

### Added
- `theme-mono/index.css` — JetBrains Mono 等宽主题(Cat A:架构图/知识图谱)
- `fonts/jetbrains-mono-latin-{400,500,600,700}.woff2`
- 14 设计令牌固化:Surfaces / Brand / Semantic / Text / Elevation
- `yry-breadcrumb` / `yry-tabs-panel` / `yry-suite-toggle` 组件稳定

### Migration
v1.0 → v1.1:Cat A 页面需新增 `fonts/index.css` 引用;Cat B 页面不受影响。

---

## [1.0.0] - 2026-04-08

### Added
- `shared/index.css` — Reset + 动画 + 14 组件基线
- `theme/index.css` — System 主题(Cat B)
- `shared.js` — YrY 全局对象,9 个 API(`toast` / `copyCmd` / `switchPanel` / `suiteToggle` / ...)
- `package.json` — npm 包元数据,jsDelivr 同步就绪

[Unreleased]: https://github.com/effiyichengliang/YrY/compare/cdn-v1.2.0...main
[1.2.0]: https://github.com/effiyichengliang/YrY/compare/cdn-v1.1.0...cdn-v1.2.0
[1.1.0]: https://github.com/effiyichengliang/YrY/compare/cdn-v1.0.0...cdn-v1.1.0
[1.0.0]: https://github.com/effiyichengliang/YrY/releases/tag/cdn-v1.0.0