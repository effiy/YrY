---
doc_type: test
title: "YiPet 运行时可靠性修复 — 测试方案"
tags:
- 测试方案
- 错误处理
- SSE
- Service Worker
category: 项目/浏览器扩展/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P2
project: YiPet
project_id: yipet
owner: Chengliang.Yi
prd_month: '202609'
test_id: YP-09-100
prd_ref: YP-09-100
dev_ref: YP-09-100
estimate: 0.125
review_status: 已评审
roles:
- engineer
---

# YiPet 运行时可靠性修复 — 测试方案

> 测试编号：YP-09-100 · 关联 PRD：YP-09-100 · 关联 Dev：YP-09-100

---

## 一、测试用例

### TC-001: 构建验证

```bash
npm run typecheck && npm run build
```

**预期**：类型检查通过，多入口构建成功。

### TC-002: 单元测试回归

```bash
npm test
```

**预期**：138 passed (16 files)。

### TC-003: SSE data: 有空格格式

输入 SSE 帧：`data: hello\n\n`

**预期**：`parseSSEFrame` 返回 `{done: false, data: "hello"}`。

### TC-004: SSE data: 无空格格式

输入 SSE 帧：`data:hello\n\n`

**预期**：`parseSSEFrame` 返回 `{done: false, data: "hello"}`。

### TC-005: SSE event:error 有空格

输入 SSE 帧：`event: error\n\n`

**预期**：`parseSSEFrame` 返回 `{done: true, error: "Stream error"}`。

### TC-006: SSE event:error 无空格

输入 SSE 帧：`event:error\n\n`

**预期**：`parseSSEFrame` 返回 `{done: true, error: "Stream error"}`。

### TC-007: SW 初始化失败日志

**步骤**：Mock `chrome.storage.local.get` 抛出异常

**预期**：console 输出 `[YiPet] Service worker init failed: <error>`。

---

## 二、测试结果

| 测试编号 | 描述 | 结果 | 备注 |
|----------|------|------|------|
| TC-001 | 构建验证 | ✅ | typecheck + build 通过 |
| TC-002 | 回归测试 | ✅ | 138 passed |
| TC-003 | SSE data 有空格 | ✅ | 向后兼容 |
| TC-004 | SSE data 无空格 | ✅ | 新增支持 |
| TC-005 | SSE event error 有空格 | ✅ | 向后兼容 |
| TC-006 | SSE event error 无空格 | ✅ | 新增支持 |
| TC-007 | SW 初始化失败日志 | — | 需 mock chrome.storage |