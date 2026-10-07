---

doc_type: task
prd_task_id: "YA-09-114"
title: "YA-09-114: 异常类型规范化 — 技术实现"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
source_prd: "114-需求-异常类型规范化.md"

type: task
---

# YA-09-114: 异常类型规范化 — 技术实现

## 变更文件

### `domain/state/service.py`

```python
# 添加导入
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

# update() — 资源未找到
- raise ValueError(f"Record with key {key} not found")
+ raise BusinessException(ErrorCode.DATA_NOT_FOUND, message=f"Record with key {key} not found")

# delete() — 资源未找到
- raise ValueError(f"Record with key {key} not found")
+ raise BusinessException(ErrorCode.DATA_NOT_FOUND, message=f"Record with key {key} not found")
```

### `domain/rss/scheduler.py`

```python
# set_config() — 参数验证
- raise ValueError("Scheduler interval cannot be less than 60 seconds")
+ raise BusinessException(ErrorCode.INVALID_PARAMS, message="Scheduler interval cannot be less than 60 seconds")

- raise ValueError(f"{field} must be between {min_val}-{max_val}")
+ raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"{field} must be between {min_val}-{max_val}")
```

### `tests/unit/domain/test_state.py`

```python
# 导入 BusinessException
from shared.exceptions import BusinessException

# 更新断言
- with pytest.raises(ValueError, match="not found"):
+ with pytest.raises(BusinessException, match="not found"):
```

## RPC 响应变化

| 端点 | 场景 | 旧 code | 新 code |
|------|------|---------|---------|
| `PUT /state/records/{key}` | key 不存在 | `9999` (UNKNOWN) | `1004` (DATA_NOT_FOUND) |
| `DELETE /state/records/{key}` | key 不存在 | `9999` (UNKNOWN) | `1004` (DATA_NOT_FOUND) |
| RSS scheduler set_config | interval < 60s | `9999` (UNKNOWN) | `1002` (INVALID_PARAMS) |
| RSS scheduler set_config | cron 字段越界 | `9999` (UNKNOWN) | `1002` (INVALID_PARAMS) |