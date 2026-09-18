---
doc_type: module
prd_task_id: "YA-09-47"
title: "YA-09-47: 日志敏感数据脱敏 — 自动扫描 + 字段遮蔽 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "111-需求-日志敏感数据脱敏.md"
source_okr: [yiai-001]
---

# YA-09-47: 日志敏感数据脱敏 — 自动扫描 + 字段遮蔽 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[111-需求-日志敏感数据脱敏.md](../../prds/2026-09/111-需求-日志敏感数据脱敏.md)
> 需求编号：YA-09-47 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

在 [YA-09-16 结构化日志](./35-prd-task-结构化日志.md) 的脱敏基础上增加：正则模式匹配（信用卡/身份证/手机号）、深度遍历嵌套 JSON、自定义遮蔽规则。

```python
import re

SENSITIVE_PATTERNS = [
    (r'\b\d{16}\b', '***CC***'),                # 信用卡号
    (r'\b1[3-9]\d{9}\b', '***PHONE***'),        # 手机号
    (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '***EMAIL***'),
]

class LogSanitizer:
    @staticmethod
    def sanitize(data: dict | list | str) -> dict | list | str:
        if isinstance(data, str):
            for pattern, replacement in SENSITIVE_PATTERNS:
                data = re.sub(pattern, replacement, data)
            return data
        if isinstance(data, dict):
            return {k: LogSanitizer.sanitize(v) for k, v in data.items()}
        if isinstance(data, list):
            return [LogSanitizer.sanitize(item) for item in data]
        return data
```

### logging Filter 集成

```python
class SensitiveDataFilter(logging.Filter):
    def filter(self, record):
        if hasattr(record, 'msg') and isinstance(record.msg, str):
            record.msg = LogSanitizer.sanitize(record.msg)
        return True
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 正则模式 + 递归清理 | JSON 日志中敏感字段被遮蔽 | 0.25 |
| 2 | logging Filter 集成 + 测试 | 所有日志自动脱敏 | 0.25 |

**合计：0.5d**。