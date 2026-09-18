---
doc_type: test
title: "YP-09-02: Service Worker 可靠性 — 测试用例"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiPet
project_id: yipet
prd_month: "202609"
prd_task_id: "YP-09-02"
source_prds: ["09-稳定性-ServiceWorker"]
source_modules: ["09-prd-task-ServiceWorker"]
source_okr: [yipet-004]
---

# YP-09-02: Service Worker 可靠性 — 测试用例

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-SW-01 | 心跳 20s 发送 ping | `setInterval` 每 20s 触发，SW 保持 running |
| UT-SW-02 | 空闲 35s 后被终止 (心跳关闭) | 无心跳 → Chrome 终止 SW |
| UT-SW-03 | Content Script 唤醒 SW | `chrome.runtime.sendMessage` → SW 从 terminated→running |
| UT-SW-04 | 休眠期间消息入队 | SW terminated → 消息写入 `chrome.storage.local` |
| UT-SW-05 | 唤醒后消息批量出队 | SW 恢复 → 从 storage 读取并逐条处理 |
| UT-SW-06 | 崩溃恢复 | SW throw Error → try/catch → chrome.storage 恢复状态 |

## 二、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-SW-01 | SW 30s 空闲→终止→Content Script 唤醒 | 全链路：终止→消息入队→唤醒→出队→正常 |
| IT-SW-02 | 长期运行稳定性 (1h) | SW 未意外终止，心跳正常 |

## 三、出口准则

- [ ] P0 用例 100% 通过
- [ ] 1h 长期运行 SW 无意外终止

---