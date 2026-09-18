---
doc_type: module
prd_task_id: "YA-09-87"
title: "YA-09-87: 数据库凭证轮换 — 零停机 + 双凭证过渡 — 开发方案"
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
source_prd: "88-需求-数据库凭证轮换.md"
source_okr: [yiai-001]
---

# YA-09-87: 数据库凭证轮换 — 零停机 + 双凭证过渡 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[88-需求-数据库凭证轮换.md](../../prds/2026-09/88-需求-数据库凭证轮换.md)
> 需求编号：YA-09-87 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

MongoDB 连接串含凭证，轮换时需零停机。方案：MongoDB 先创建新用户 → 配置双凭证 → 切换 → 删除旧用户。

```python
# config.yaml
mongodb:
  url: "mongodb://user_v1:pass_v1@host:27017"  # 旧凭证
  fallback_url: "mongodb://user_v2:pass_v2@host:27017"  # 新凭证

class DualCredentialClient:
    async def connect(self):
        try:
            self.client = AsyncIOMotorClient(settings.mongo_url, serverSelectionTimeoutMS=5000)
            await self.client.admin.command("ping")
        except ServerSelectionTimeoutError:
            logger.warning("Primary credential failed, using fallback")
            self.client = AsyncIOMotorClient(settings.mongo_fallback_url)
```

### 轮换流程

1. MongoDB 创建 `user_v2`（新凭证）
2. 部署 `config.yaml` 含双凭证（`url`=旧, `fallback_url`=新）
3. 验证服务使用 `url` 正常
4. 交换 `url` ↔ `fallback_url` 部署
5. 验证服务使用新凭证正常
6. MongoDB 删除 `user_v1`

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 双凭证连接 | 主凭证失败自动切换 | 0.25 |
| 2 | 轮换脚本 + 测试 | 零停机轮换成功 | 0.25 |

**合计：0.5d**。