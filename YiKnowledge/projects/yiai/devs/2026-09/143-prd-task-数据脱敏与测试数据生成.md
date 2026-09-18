---
doc_type: module
prd_task_id: "YA-09-66"
title: "YA-09-66: 数据脱敏与测试数据 — Faker 假数据 + CI 播种 — 开发方案"
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
source_prd: "143-需求-数据脱敏与测试数据.md"
source_okr: [yiai-001]
---

# YA-09-66: 数据脱敏与测试数据 — Faker 假数据 + CI 播种 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[143-需求-数据脱敏与测试数据.md](../../prds/2026-09/143-需求-数据脱敏与测试数据.md)
> 需求编号：YA-09-66 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

从生产数据脱敏生成测试数据，关键字段用 `faker` 替换——姓名、邮箱、手机号等。CI 启动时自动播种测试库。

```python
from faker import Faker

fake = Faker("zh_CN")

MASK_RULES = {
    "users": {
        "username": lambda: fake.user_name(),
        "email": lambda: fake.email(),
        "phone": lambda: fake.phone_number(),
    },
    "projects": {
        "name": lambda: f"TEST-{fake.word().upper()}-{fake.random_int(1,999)}",
        "description": lambda: fake.sentence(),
    },
}

async def mask_production_data(collection: str, docs: list[dict]) -> list[dict]:
    rules = MASK_RULES.get(collection, {})
    for doc in docs:
        for field, generator in rules.items():
            if field in doc:
                doc[field] = generator()
    return docs
```

### CI 集成

```yaml
# .github/workflows/test.yml
- name: Seed test data
  run: python scripts/seed_test_data.py --from-production --mask
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Faker 脱敏规则 + seed 脚本 | 敏感字段被假数据替换 | 0.25 |
| 2 | CI 集成 + 测试 | 测试环境自动播种 | 0.25 |

**合计：0.5d**。