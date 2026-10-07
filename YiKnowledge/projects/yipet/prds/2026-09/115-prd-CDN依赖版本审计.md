---

doc_type: module
prd_id: "YP-09-115"
title: "YP-09-115: CDN 依赖版本审计与更新 — 60+ 第三方库安全与兼容性评估"
status: planned
priority: P1
owner: unassigned
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
tags: [cdn, dependencies, security, audit, planned]
related_tasks: ["115-prd-task-CDN依赖版本审计.md"]
related_tests: ["115-prd-test-CDN依赖版本审计.md"]
related_modules: ["content/cdn/catalog.ts", "public/cdn/vendor/"]

type: 需求
---

# YP-09-115: CDN 依赖版本审计与更新

> **PRD 版本**：v1.0 · **状态**：planned（待排期）

---

## 1. 背景

YiPet 通过 CDN 注入机制向宿主页面提供 60+ 第三方库。这些库打包在 `public/cdn/vendor/` 中，通过 `content/cdn/catalog.ts` 索引。部分库版本严重滞后或已废弃。

## 2. 审计发现

### 版本滞后项

| 库 | 当前版本 | 最新稳定版 | 滞后 | 风险 |
|----|---------|-----------|------|------|
| GSAP TweenMax | 2.x (global: `TweenMax`) | 3.12+ (global: `gsap`) | 废弃 | 全局检查 `TweenMax` 在 GSAP 3 页面上失效 |
| Font Awesome | 4.7.0 (2016) | 6.6 (2024) | 3 大版本 | 图标缺失，CSS 类名可能不兼容 |
| Swiper | 7.0.3 (2021) | 11.1 (2024) | 4 大版本 | API 变更 |
| Bootstrap | 5.2.3 (2023) | 5.3.3 (2024) | 1 小版本 | 低风险 |
| Animate.css | 3.5.1 (2016) | 4.1 (2023) | 1 大版本 | CSS 类名变更 |
| Anime.js | 3.0.0 (2019) | 3.2.2 (2023) | 2 补丁 | 低风险 |
| Leaflet | 1.1.1 (2017) | 1.9 (2024) | 8 小版本 | API 基本兼容 |
| Isotope | 3.0.6 (2017) | 3.0.6 (无更新) | 停滞 | 项目已停止维护 |

### 废弃/无维护项

| 库 | 状态 | 建议 |
|----|------|------|
| GSAP TweenMax | GSAP 3.0 (2019) 废弃 `TweenMax` | 迁移至 `gsap` 全局 |
| Owl Carousel | 最后发布 2019 | 替换为 Swiper 11 或保持 |
| Typing.js | 无版本号，来源不明 | 评估必要性 |
| Counter-Up | 依赖 jQuery + Waypoints | 评估必要性 |

## 3. 用户问题

- **目标用户**：使用 CDN 注入功能的高级用户（`window.YiPet.load('gsap')`）
- **问题陈述**：用户页面已加载 GSAP 3+，YiPet 检测 `window.TweenMax` 不存在，注入旧版 TweenMax——两版本冲突导致动画异常
- **证据**：强证据 — 代码审查确认 `global: 'TweenMax'` 与 GSAP 3 不兼容

## 4. 成功标准

| 指标 | 目标 |
|------|------|
| GSAP 全局检测 | `window.gsap` 替代 `window.TweenMax` |
| Font Awesome | 4.7 → 6.6 或标记为 deprecated |
| 安全漏洞 | 无已知 CVE 的库版本 |
| 类型检查 | 0 error |
| 回归测试 | 138/138 |

## 5. 实施阶段

| 阶段 | 工作量 | 内容 |
|------|--------|------|
| 1. 审计 | 0.5d | 全量 CVE 扫描 + 许可证审计 |
| 2. 更新 | 1d | 下载新版本 → 更新 catalog.ts → 测试 |
| 3. 兼容 | 0.5d | 验证 `window.YiPet.load()` 所有 key 正常 |
| **总计** | **2d** | |

## 6. 风险

| 风险 | 缓解 |
|------|------|
| 大版本 API 变更导致宿主页面脚本异常 | 保留旧版本副本，catalog 新增 `_v2` key 过渡 |
| CDN 文件体积增长 | 对比新旧文件大小，超 20% 需评审 |