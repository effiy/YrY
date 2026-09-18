---
doc_type: module
prd_task_id: "YA-09-61"
title: "YA-09-61: 多环境配置管理 — 环境分层 + 热更新 + 校验 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "147-需求-多环境配置管理.md"
source_okr: [yiai-001]
---

# YA-09-61: 多环境配置管理 — 环境分层 + 热更新 + 校验 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[147-需求-多环境配置管理.md](../../prds/2026-09/147-需求-多环境配置管理.md)
> 需求编号：YA-09-61 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

```yaml
# config/base.yaml — 公共默认值
# config/dev.yaml   — 开发环境覆盖
# config/prod.yaml  — 生产环境覆盖
# 环境变量          — 最高优先级
```

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 基础
    server_port: int = 10086
    mongo_url: str = "mongodb://localhost:27017"

    # 环境分层加载
    model_config = {
        "yaml_file": ["config/base.yaml", f"config/{os.getenv('ENV', 'dev')}.yaml"],
        "env_prefix": "YIAI_",
    }

    # 启动校验
    @model_validator(mode="after")
    def validate_prod_requirements(self):
        if os.getenv("ENV") == "prod":
            assert self.jwt_secret != "yi-ai-dev-secret", "JWT secret must be set in production"
            assert self.middleware_auth_enabled, "Auth must be enabled in production"
        return self
```

### 优先级: 环境变量 > 环境 YAML > 基础 YAML > 代码默认值

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 分层加载 + 生产校验 | `ENV=prod` 时硬编码默认值报错 | 0.5 |
| 2 | 热更新 (SIGHUP) + 测试 | 不重启即可更新配置 | 0.5 |

**合计：1.0d**。