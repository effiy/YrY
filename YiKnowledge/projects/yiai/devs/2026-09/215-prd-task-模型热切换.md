---
doc_type: module
prd_task_id: "YA-09-144"
title: "YA-09-144: 模型热切换 — 原子切换 + 预加载 + 回滚 — 开发方案"
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
source_prd: "215-需求-模型热切换.md"
source_okr: [yiai-002]
---

# YA-09-144: 模型热切换 — 原子切换 + 预加载 + 回滚 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[215-需求-模型热切换.md](../../prds/2026-09/215-需求-模型热切换.md)
> 需求编号：YA-09-144 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

不重启服务在 Ollama 模型间切换：新模型预加载 → 排空进行中请求 → 原子切换 → 可回滚。

```python
class ModelHotSwapper:
    async def swap(self, new_model: str) -> bool:
        # 1. 预加载
        await ollama.pull(new_model)
        # 2. 标记切换中
        self.transitioning = True
        # 3. 等待进行中请求完成
        await asyncio.sleep(5)
        # 4. 原子切换
        self.active_model = new_model
        self.transitioning = False
        logger.info(f"Model swapped to {new_model}")

    async def rollback(self):
        self.active_model = self.previous_model
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 预加载 + 请求排空 + 切换 | 进行中请求不受影响 | 0.25 |
| 2 | 回滚 + 审计日志 + 测试 | 切换失败自动回滚 | 0.25 |

**合计：0.5d**。