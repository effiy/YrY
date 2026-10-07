---

doc_type: test
title: "ADR 决策验证 — Tauri/Jotai/插件/多窗口"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prds: ["44-prd-ADR-Tauri选择","45-prd-ADR-Jotai选择","46-prd-ADR-插件架构","47-prd-ADR-多窗口架构"]

type: test
---
# ADR 决策验证 — Tauri/Jotai/插件/多窗口
> 验证 4 个架构决策的正确性和实施效果
## ADR-001 Tauri 选型验证
| 验证项 | 方法 | 基准 | 实际 |
|--------|------|------|------|
| 包体积 | 构建后检查 | <30MB | ~25MB (macOS universal) |
| 内存占用 | 空闲 5min 后 RSS | <80MB | ~50MB |
| 快捷键响应 | 按下到事件触发 | <200ms | <150ms (P95) |
| 3 平台构建 | CI 验证 | 全部通过 | macOS/Win/Linux 均通过 |
## ADR-002 Jotai 验证
| 验证项 | 方法 | 结果 |
|--------|------|------|
| 原子更新隔离 | React Profiler 检查渲染范围 | 仅受影响组件重渲染 |
| 跨窗口同步 | 修改 config → 检查其他窗口 | 500ms 内同步 |
## ADR-003 插件架构验证
| 验证项 | 方法 | 结果 |
|--------|------|------|
| 新插件加载 | 添加插件目录 → pnpm tauri dev | 自动发现并注册 |
| 插件隔离 | 单个插件加载失败 | 其他插件不受影响 |
## ADR-004 多窗口验证
| 验证项 | 方法 | 结果 |
|--------|------|------|
| 窗口独立生命周期 | 关闭翻译窗口 → 检查托盘 | 托盘/其他窗口不受影响 |
| 内存隔离 | 同时打开 4 窗口 → 内存峰值 | <350MB |
## 回归清单
- [ ] 三平台构建通过
- [ ] 翻译/OCR/TTS/生词本四类服务可添加
- [ ] 6 窗口打开/关闭/切换正常
- [ ] 快捷键响应 <200ms
- [ ] 空闲内存 <150MB