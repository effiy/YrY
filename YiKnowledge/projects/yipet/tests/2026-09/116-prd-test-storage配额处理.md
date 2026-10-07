---

doc_type: test
prd_test_id: "YP-09-116"
title: "YP-09-116: chrome.storage 配额处理 — 测试方案"
status: planned
priority: P1
owner: unassigned
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_prd: "116-架构-chrome-storage配额处理.md"
tags: [storage, quota, testing, planned]

type: test
---

# YP-09-116: chrome.storage 配额处理 — 测试方案

## 1. 测试用例

| ID | 用例 | 验证 |
|----|------|------|
| TC-01 | 配额 <70% → level='ok'，无通知 | getBytesInUse mock |
| TC-02 | 配额 70-90% → level='warn'，通知弹出 | notify('Storage 70% full') |
| TC-03 | 配额 >90% → level='critical'，触发归档 | 旧会话迁移到 IndexedDB |
| TC-04 | 写入失败 → 通知 + 拒绝新会话创建 | QuotaExceededError mock |
| TC-05 | 归档会话可恢复 | restoreSession(id) 返回完整数据 |
| TC-06 | typecheck | `vue-tsc --noEmit` |
| TC-07 | 回归测试 | 138/138 |

## 2. 自动化

```bash
npm run typecheck && npm test && npm run build
```