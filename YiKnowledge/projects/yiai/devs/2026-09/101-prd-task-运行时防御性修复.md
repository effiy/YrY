---
doc_type: dev
title: "YiAi 运行时防御性修复 — 开发方案"
tags:
- 开发方案
- allowlist
- asyncio
- 错误隔离
category: 项目/后端/开发
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: task
status: 已完成
priority: P1
project: YiAi
project_id: yiai
owner: Chengliang.Yi
prd_month: '202609'
dev_id: YA-09-101
prd_ref: YA-09-101
estimate: 0.25
review_status: 已评审
roles:
- engineer
---

# YiAi 运行时防御性修复 — 开发方案

> 开发编号：YA-09-101 · 关联 PRD：YA-09-101 · 预估人天：0.25d

---

## 一、变更清单

| 文件 | 变更 | 说明 |
|------|------|------|
| `domain/execution/executor.py:22-25` | 新增 None 检查 | `allowlist is None → []` |
| `server/routes/analytics.py:97-100` | 新增 `return_exceptions=True` | gather 错误隔离 |

---

## 二、实施步骤

### Step 1: executor allowlist None 防护

在 `SRC_ROOT/domain/execution/executor.py` 第 22 行后添加 None 检查：

```python
allowlist = settings.module_allowlist
if allowlist is None:          # ← 新增
    allowlist = []             # ← 新增
if isinstance(allowlist, str):
    allowlist = [x.strip() for x in allowlist.split(',') if x.strip()]
EXEC_ALLOWLIST = set(allowlist)
```

### Step 2: analytics gather 错误隔离

在 `SRC_ROOT/server/routes/analytics.py` 第 97-100 行修改：

```python
efficiency_data, quality_data = await asyncio.gather(
    get_efficiency_metrics(params),
    get_quality_metrics(params),
    return_exceptions=True,           # ← 新增
)
efficiency_data = efficiency_data if not isinstance(efficiency_data, BaseException) else {}  # ← 新增
quality_data = quality_data if not isinstance(quality_data, BaseException) else {}          # ← 新增
```

---

## 三、验证

```bash
cd YiAi
python -m pytest tests/ -q                    # 598+ passed
python -c "from domain.execution.executor import EXEC_ALLOWLIST; print(type(EXEC_ALLOWLIST))"  # <class 'set'>
```

---

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/101-需求-运行时防御性修复.md` |
| 测试 | `../tests/2026-09/101-prd-test-运行时防御性修复.md` |
| Bug 执行 | `../bugs/2026-09/执行/02-执行-allowlist-none-set崩溃.md` |
| Bug 代码质量 | `../bugs/2026-09/代码质量/84-质量-analytics-gather-缺return-exceptions.md` |