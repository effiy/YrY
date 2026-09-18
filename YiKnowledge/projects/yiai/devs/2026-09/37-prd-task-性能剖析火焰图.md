---
doc_type: module
prd_task_id: "YA-09-103"
title: "YA-09-103: 性能剖析与火焰图 — py-spy CPU Profiling — 开发方案"
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
source_prd: "37-需求-性能剖析火焰图.md"
source_okr: [yiai-001]
---

# YA-09-103: 性能剖析与火焰图 — py-spy CPU Profiling — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[37-需求-性能剖析火焰图.md](../../prds/2026-09/37-需求-性能剖析火焰图.md)
> 需求编号：YA-09-103 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

`py-spy` 无需修改代码即可对运行中的 Python 进程采样，生成火焰图。

```bash
# 采样 30s，生成火焰图
py-spy record -o profile.svg --pid $(pgrep -f uvicorn) --duration 30

# Admin API 触发
@router.post("/admin/profile")
async def profile(duration: int = 30):
    proc = await asyncio.create_subprocess_exec("py-spy", "record", "-o", f"/tmp/profile_{ts}.svg", "--pid", str(os.getpid()), f"--duration={duration}")
    await proc.wait()
    return {"url": f"/static/profiles/profile_{ts}.svg"}
```

### 集成到 Dashboard

| 操作 | 端点 |
|------|------|
| 触发采样 | `POST /admin/profile?duration=30` |
| 历史列表 | `GET /admin/profiles` |
| 下载 SVG | `GET /static/profiles/{name}` |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | py-spy 集成 + Admin API | 火焰图可下载查看 | 0.25 |
| 2 | Dashboard 集成 + 测试 | 可视化历史火焰图列表 | 0.25 |

**合计：0.5d**。