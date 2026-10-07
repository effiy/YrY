---

doc_type: task
prd_task_id: "YA-09-117"
title: "YA-09-117: 依赖清理 — 技术实现"
status: 已完成
priority: P3
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
source_prd: "117-需求-依赖清理.md"

type: task
---

# YA-09-117: 依赖清理 — 技术实现

## 变更

`requirements.txt` — 删除 1 行。

## 根因

B11 修复将 `shared/cache.py` 的 `cachetools.TTLCache` 替换为 `dict[(value, expire_at)]` 后，`cachetools` 成为孤儿依赖。

## 验证

```bash
# 零引用确认
grep -rn "cachetools\|TTLCache" src/

# 安装后测试
pip install -r requirements.txt
python -m pytest tests/unit/ -q
# 457 passed
```