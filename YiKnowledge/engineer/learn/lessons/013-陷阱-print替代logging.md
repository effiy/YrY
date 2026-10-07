---
title: "Gotcha: Using `print()` Instead of `logging` in Backend Libraries"
tags: [gotcha, logging, backend, YiAi, Python, code-quality]
category: engineer/learn/lessons
created: 2026-09-24
updated: 2026-09-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "后端共享/服务代码应使用 logging 而非 print，确保日志可路由、可分级、可关闭"
related:
  - ../0006-陷阱-RPC参数名不匹配.md
---

# 后端库代码中 `print()` 替代 `logging`

> YiAi `src/shared/migration_helpers.py` 中全部 9 处日志输出使用 `print()` 而非 `logging` 模块。CLI 入口文件（`cli/migrate.py`）和启动文件（`main.py`）使用 `print()` 是合理的——它们的输出是给终端用户的。但 `src/shared/` 下的库代码被其他模块导入使用，应使用 `logging`。

## 影响

- `print()` 输出无法按级别过滤（info/warning/error）
- 生产环境无法关闭调试级别的输出
- 无法路由到集中式日志系统
- 与项目其他模块（已使用 `logging`）不一致

## 修复

将 `src/shared/migration_helpers.py` 中所有 `print()` 替换为 `logging.getLogger(__name__).info()`：

```python
# 修复前
print(f"  [batch_update] {collection}: {processed}/{total} ({pct:.1f}%)")

# 修复后
logger = logging.getLogger(__name__)
logger.info("  [batch_update] %s: %s/%s (%.1f%%)", collection, processed, total, pct)
```

## 判断标准

| 场景 | 使用 print | 使用 logging |
|------|-----------|-------------|
| CLI 入口（`cli/*.py`、`main.py`） | 是 — 面向终端用户 | — |
| `src/shared/` 下的共享库 | — | 是 — 被其他模块导入 |
| `src/services/` 服务层 | — | 是 — 可路由、可分级 |
| 一次性迁移脚本（不在 src/ 下） | 是 — 独立运行 | 可选 |

## 检测方法

```bash
# 搜索 src/ 下非 CLI 文件中的 print
rg 'print\(' YiAi/src/ --type py | grep -v 'cli/' | grep -v 'main\.py'
```