---

doc_type: task
prd_task_id: "YA-09-112"
title: "YA-09-112: 废弃 API 迁移 — 技术实现"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
source_prd: "112-需求-废弃API迁移.md"

type: task
---

# YA-09-112: 废弃 API 迁移 — 技术实现

> **影响文件**：10 个源文件 · **机械替换**：2 种模式

## 实现

### 导入修正（8 个文件缺 `timezone`）

```python
# 模式 A: 已有 timedelta
- from datetime import datetime, timedelta
+ from datetime import datetime, timedelta, timezone

# 模式 B: 仅 datetime
- from datetime import datetime
+ from datetime import datetime, timezone
```

### 调用替换（全部 15 处）

```bash
# 全局替换 — 无歧义，直接 sed
sed -i '' 's/\.utcnow()/.now(timezone.utc)/g' <file>
```

### 验证

```bash
# 确认 0 残留
grep -rn "\.utcnow()" src/
# (无输出)

# 确认导入正确
grep -rn "from datetime import.*timezone" src/ | wc -l
# ≥ 10（含历史已有 timezone 导入的文件）

# 运行全量测试
python -m pytest tests/unit/ -q
# 457 passed
```

## 风险

| 风险 | 缓解 |
|------|------|
| `.isoformat()` 输出末尾多 `+00:00` | 仅影响字符串全量比较，代码中均为 ISO 8601 标准，下游兼容 |
| `sed` 替代误伤变量名/注释含 `utcnow` | 正则 `\.utcnow()` 精确匹配方法调用 |