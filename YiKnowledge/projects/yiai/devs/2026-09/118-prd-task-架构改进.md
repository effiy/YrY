---

doc_type: task
prd_task_id: "YA-09-118"
title: "YA-09-118: URL 守卫抽取 + CI 门禁 — 技术实现"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
source_prd: "118-需求-架构改进.md"

type: task
---

# YA-09-118: URL 守卫抽取 + CI 门禁

## 1. `shared/url_guard.py` — SSRF 守卫统一

将 `server/routes/search.py` 和 `domain/ai/tools/builtin/web_tools.py` 中重复的 `_is_private_url()` (~35行×2) 抽取为共享模块。

**使用方**：
```python
from shared.url_guard import is_private_url
```

## 2. `pyproject.toml` — 可选依赖

```toml
[project.optional-dependencies]
observer = ["yi-observer>=0.1.0"]
```

## 3. `scripts/ci-check.sh` — 5 项自动化检查

| # | 检查项 | 命令 |
|---|--------|------|
| 1 | 错误码唯一性 | `pytest test_all_business_codes_unique` |
| 2 | 废弃 utcnow() | `grep -rn '\.utcnow()' src/` |
| 3 | 裸 ValueError | `grep -rn 'raise ValueError' src/domain/ src/services/` |
| 4 | SSRF 守卫 | `python -c is_private_url(localhost) == True` |
| 5 | 全量测试 | `pytest tests/unit/ -q` |

## 4. 最终 3 处 ValueError 修复 (B32-B33)

| 文件 | 修复 |
|------|------|
| `domain/rss/feed.py:100` | `ValueError` → `BusinessException(INVALID_PARAMS)` |
| `services/translation/context_service.py:43,114` | 同上 |