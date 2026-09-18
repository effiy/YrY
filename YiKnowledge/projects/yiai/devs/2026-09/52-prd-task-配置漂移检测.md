---
doc_type: module
prd_task_id: "YA-09-104"
title: "YA-09-104: 配置漂移检测 — 运行时 vs 期望状态差异告警 — 开发方案"
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
source_prd: "52-需求-配置漂移检测.md"
source_okr: [yiai-001]
---

# YA-09-104: 配置漂移检测 — 运行时 vs 期望状态差异告警 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[52-需求-配置漂移检测.md](../../prds/2026-09/52-需求-配置漂移检测.md)
> 需求编号：YA-09-104 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

热更新配置后，运行时配置可能与 Git 中的 `config.yaml` 不一致（漂移）。定期对比并告警。

```python
async def detect_config_drift():
    git_config = yaml.safe_load(subprocess.check_output(["git", "show", "HEAD:config.yaml"]))
    runtime_config = settings.model_dump()

    drift = deep_diff(git_config, runtime_config)
    if drift:
        logger.warning(f"Config drift detected: {drift}")
        await send_wework(f"检测到 {len(drift)} 个配置漂移:\n{json.dumps(drift, indent=2)}")
    return drift
```

### 检测范围

| 配置 | 可漂移 | 说明 |
|------|--------|------|
| `rag.top_k` | 是 | Admin 热更新后可能忘记提交 |
| `server.port` | 否 | 需重启生效 |
| `llm.model` | 是 | 热更新友好 |
| `mongo.url` | 否 | 需重启生效 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | deep_diff + Git 对比 | 漂移配置被检测 | 0.25 |
| 2 | 定时检查 + 企微告警 + 测试 | 漂移超过 1h 未提交则通知 | 0.25 |

**合计：0.5d**。