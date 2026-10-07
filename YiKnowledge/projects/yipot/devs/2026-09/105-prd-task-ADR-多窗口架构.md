---

doc_type: summary
title: "ADR-004 多窗口架构选型 — 实施总结"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prd: "47-prd-ADR-多窗口架构.md"

type: task
---
# ADR-004 多窗口架构 — 实施总结
> 来源 ADR：[47-prd-ADR-多窗口架构](../../prds/2026-09/47-prd-ADR-多窗口架构.md)
## 决策回顾
选择 Tauri 多窗口模式 (WebviewWindow)，每个功能独立窗口：翻译/OCR/截图/设置/更新/守护。
## 实施效果
| 指标 | 目标 | 实际 |
|------|------|------|
| 窗口数 | 6 个 | 6 (translate/recognize/screenshot/config/updater/daemon) |
| 窗口隔离性 | 单窗口崩溃不影响其他 | 达标 |
| 窗口创建延迟 | <100ms (热启动) | ~80ms |
## 6 窗口清单
| Label | 组件 | 特性 |
|-------|------|------|
| `daemon` | 不可见 | 进程保活，无 UI |
| `translate` | TranslateWindow | 鼠标跟随、置顶、尺寸记忆 |
| `recognize` | RecognizeWindow | 居中、尺寸记忆 |
| `screenshot` | ScreenshotWindow | 全屏、无边框、选区标注 |
| `config` | ConfigWindow | 800×600、路由导航 |
| `updater` | UpdaterWindow | 600×400、下载进度 |
## 交叉引用
- ADR: [47-prd-ADR-多窗口架构](../../prds/2026-09/47-prd-ADR-多窗口架构.md)
- React 组件架构: [10-prd-task-React组件与窗口架构](./10-prd-task-React组件与窗口架构.md)
- 窗口定位: [14-prd-task-窗口定位](./14-prd-task-窗口定位.md)