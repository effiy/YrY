---
doc_type: test
title: "YP-07-06: 浮窗宠物 UI 与动画 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202607"
source_prds: ["06-功能实现-浮窗宠物UI与动画系统"]
source_modules: ["06-prd-task-浮窗宠物UI与动画系统"]
---

# YP-07-06: 浮窗宠物 UI 与动画 — 测试用例

## 测试分层

| 层级 | 覆盖 |
|------|------|
| L2 集成 | Shadow DOM + CSS 动画 + 空闲状态机 |
| L3 E2E | 视觉验证 |

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-PET-001 | Pet DOM 渲染 | Shadow DOM 内正确的 DOM 结构 | P0 |
| TC-PET-002 | 样式隔离 | 宿主 CSS 不影响 Pet 样式 | P0 |
| TC-PET-003 | 空闲动画切换 | idle→sleep→唤醒 状态机正确 | P0 |
| TC-PET-004 | hover 动画触发 | 鼠标悬停→弹跳动画 | P1 |
| TC-PET-005 | 30s 无操作→sleep | 空闲状态机 30s 计时正确 | P1 |
| TC-PET-006 | prefers-reduced-motion | 禁用所有动画 | P2 |

## 出口准则

- [ ] P0 用例 100% 通过
- [ ] 动画帧率 60fps (Composite 层)