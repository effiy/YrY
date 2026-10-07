---
doc_type: test
title: "YiAi 运行时防御性修复 — 测试方案"
tags:
- 测试方案
- allowlist
- asyncio
- 错误隔离
category: 项目/后端/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P1
project: YiAi
project_id: yiai
owner: Chengliang.Yi
prd_month: '202609'
test_id: YA-09-101
prd_ref: YA-09-101
dev_ref: YA-09-101
estimate: 0.125
review_status: 已评审
roles:
- engineer
---

# YiAi 运行时防御性修复 — 测试方案

> 测试编号：YA-09-101 · 关联 PRD：YA-09-101 · 关联 Dev：YA-09-101

---

## 一、测试策略

编译验证 + 边界场景 + 回归测试

---

## 二、测试用例

### TC-001: allowlist 正常配置加载

```bash
python -c "from domain.execution.executor import EXEC_ALLOWLIST; print(type(EXEC_ALLOWLIST))"
```

**预期**：输出 `<class 'set'>`，无异常。

### TC-002: allowlist 为 None 时降级

模拟代码路径：`settings.module_allowlist = None` → `isinstance(None, str)` = False → `set(None)` 应被拦截。

**验证**：`allowlist is None` 检查将 None 转换为 `[]`，`set([])` = `set()`。

### TC-003: allowlist 字符串解析

`settings.module_allowlist = "services.ai.chat_service:chat,services.database.data_service:query_documents"`

**预期**：`EXEC_ALLOWLIST = {"services.ai.chat_service:chat", "services.database.data_service:query_documents"}`

### TC-004: allowlist 列表格式

`settings.module_allowlist = ["services.ai.chat_service:chat"]`

**预期**：直接作为 set 参数，无额外处理。

### TC-005: analytics gather 错误隔离

**步骤**：
1. Mock `get_efficiency_metrics` 抛出异常
2. 调用 analytics combined 端点

**预期**：`efficiency_data = {}`, `quality_data` 正常返回，端点不返回 500。

### TC-006: analytics 正常双查询

**步骤**：调用 analytics combined 端点（正常数据）

**预期**：两个查询结果均正常返回，behavior 不变。

### TC-007: pytest 全量回归

```bash
python -m pytest tests/ -q
```

**预期**：598+ passed，与修复前基线一致。

---

## 三、测试结果

| 测试编号 | 描述 | 结果 | 备注 |
|----------|------|------|------|
| TC-001 | allowlist 正常加载 | ✅ | `<class 'set'>` |
| TC-002 | None 降级 | ✅ | `set()` |
| TC-003 | 字符串解析 | ✅ | 正确分割 |
| TC-004 | 列表格式 | ✅ | 直接使用 |
| TC-005 | gather 错误隔离 | — | 需 mock |
| TC-006 | 正常双查询 | — | 需集成环境 |
| TC-007 | 全量回归 | ✅ | 598 passed |