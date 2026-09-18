---
doc_type: module
prd_task_id: "YA-09-78"
title: "YA-09-78: 自适应压缩传输 — Zstd/Brotli 智能选择 — 开发方案"
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
source_prd: "97-需求-自适应压缩传输.md"
source_okr: [yiai-001]
---

# YA-09-78: 自适应压缩传输 — Zstd/Brotli 智能选择 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[97-需求-自适应压缩传输.md](../../prds/2026-09/97-需求-自适应压缩传输.md)
> 需求编号：YA-09-78 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

在 [YA-09-73 响应压缩](./47-prd-task-响应压缩优化.md) 基础上增加自适应算法选择——根据响应体大小和 Content-Type 自动选择最优压缩算法。

```python
class AdaptiveCompression:
    def choose(self, content_type: str, size: int, accept_encoding: str) -> str | None:
        if size < 1024: return None          # 不压缩小响应
        if "image" in content_type: return None

        # 大响应优先 Brotli（更高压缩比），中等响应用 Zstd（更快）
        if "br" in accept_encoding and size > 100*1024: return "br"
        if "zstd" in accept_encoding: return "zstd"
        if "gzip" in accept_encoding: return "gzip"
        return None
```

### 算法对比

| 算法 | 压缩比 | 速度 | 适用 |
|------|--------|------|------|
| Zstd | 中 (3-5x) | 极快 | 中等响应 (< 100KB) |
| Brotli | 高 (5-8x) | 慢 | 大响应 (JSON 大列表) |
| Gzip | 低 (2-4x) | 快 | 兼容性回退 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 自适应选择逻辑 | 大响应自动 Brotli | 0.25 |
| 2 | 集成到 GZipMiddleware + 测试 | 与现有压缩兼容 | 0.25 |

**合计：0.5d**。