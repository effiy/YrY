---
title: 扩展图标使用 PNG 而非 SVG
tags: [yipet, code-quality, assets]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# 扩展图标使用 PNG 而非 SVG

## 现象

`manifest.json:42-47` 声明了 4 种尺寸的 PNG 图标：

```json
"icons": {
  "16": "assets/icons/icon16.png",
  "32": "assets/icons/icon32.png",
  "48": "assets/icons/icon48.png",
  "128": "assets/icons/icon128.png"
}
```

Chrome 扩展支持 SVG 图标，可自适应任意分辨率而无损。使用 4 个独立的 PNG 文件增加了扩展包体积和维护成本。

## 涉及文件

- `manifest.json:42-47`
- `assets/icons/icon*.png` — 4 个 PNG 文件

## 修复方案

```json
"icons": { "128": "assets/icons/icon.svg" }
```

Chrome 会自动从 SVG 缩放所有需要的尺寸。


## 影响范围

**影响模块**：宠物图标和 UI 图标资源。
**影响用户**：PNG 图标在高 DPI 屏幕上模糊，且体积比 SVG 大，增加扩展包大小。
**影响范围**：Popup 弹窗、宠物覆盖层、聊天窗口中的所有图标。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 优先使用 SVG 格式的图标（文件小、任意缩放无损） | 开发者 |
| 资源 | 对现有 PNG 图标进行 SVG 替代评估 | 开发/设计 |
| 构建 | 构建时检查图标资源格式和大小 | DevOps |
| 性能 | SVG sprite 或内联 SVG 优于多个独立 SVG 文件 | 开发者 |


## 经验教训

在 Chrome 扩展中，每 KB 都很重要。SVG 图标通常比 PNG 小 5-10 倍，且在任何 DPI 下都清晰。对于需要多种颜色的图标（如宠物角色），SVG 还可以通过 CSS 动态改变颜色，减少需要维护的图标变体数量。
