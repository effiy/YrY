---
doc_type: test
title: "YP-09-01: Content Script 稳定性 — 测试用例"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiPet
project_id: yipet
prd_month: "202609"
prd_task_id: "YP-09-01"
source_prds: ["08-稳定性-ContentScript"]
source_modules: ["08-prd-task-ContentScript"]
source_okr: [yipet-004]
---

# YP-09-01: Content Script 稳定性 — 测试用例

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-CS-01 | SPA pushState → Pet 重新注入 | URL 变化 → MutationObserver 触发 → Pet 可见 |
| UT-CS-02 | popstate (后退) → Pet 保持 | 浏览器后退 → Pet 仍在页面 |
| UT-CS-03 | 注入重试 1 次成功 | 第 1 次失败 → 500ms 后成功 |
| UT-CS-04 | 注入重试 3 次全部失败 | 3 次后放弃 + error 日志 |
| UT-CS-05 | Shadow DOM 样式隔离 | Pet CSS 不影响宿主页面样式 |
| UT-CS-06 | 点击事件不冒泡 | Pet 内部 click → 宿主 `document.click` 不触发 |

## 二、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-CS-01 | React SPA 路由切换 | `/page1` → `/page2` → Pet 持续存在 |
| IT-CS-02 | Vue SPA 路由切换 | hash 模式 → Pet 持续存在 |
| IT-CS-03 | 页面硬刷新 | F5 → Content Script 重新注入成功 |

## 三、出口准则

- [ ] P0 用例 100% 通过
- [ ] React/Vue/Angular SPA 路由兼容测试通过
- [ ] Shadow DOM 无样式泄露

---