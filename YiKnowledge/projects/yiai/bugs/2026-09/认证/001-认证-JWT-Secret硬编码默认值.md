---
title: "Auth: JWT Secret 使用硬编码默认值，生产环境未强制覆盖"
tags:
- jwt
- security
- hardcoded-secret
- config
- production
category: projects/yiai/bugs/auth
created: 2026-09-07
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiAi
module: src/shared/config.py, src/domain/auth/core.py
reporter: Claude
environment: all
affected_version: main (pre-fix)
fixed_version: main (post-fix 2026-09-07)
frequency: always
---

## Description

`config.py` 中 `jwt_secret` 的默认值为 `"yi-ai-jwt-secret-change-in-production"`，这是一个硬编码的字符串常量。虽然 `pydantic-settings` 支持环境变量覆盖（`JWT_SECRET`），但没有任何机制在**生产环境**启动时检测到仍在使用默认值并拒绝启动或发出告警。

**风险：**
- 开发者忘记设置 `JWT_SECRET` 环境变量 → 生产环境使用已知的默认密钥
- 任何看过源码的人（包括开源贡献者）都知道默认密钥
- 使用默认密钥签发的 JWT Token 可被任意伪造

**当前代码：**
```python
# src/shared/config.py:127
jwt_secret: str = Field("yi-ai-jwt-secret-change-in-production", validation_alias="jwt_secret")
```

没有生产环境保护检查——配置加载完成后不验证是否为默认值。

## Steps to Reproduce

1. 在不设置 `JWT_SECRET` 环境变量的情况下启动 YiAi 生产环境
2. 使用默认密钥签发 JWT Token：`python -c "import jwt; print(jwt.encode({'sub':'admin'}, 'yi-ai-jwt-secret-change-in-production', algorithm='HS256'))"`
3. 使用该 Token 调用需要认证的端点 → 认证通过
4. 任意知道默认密钥的人都可以伪造任意用户的 Token

## Expected Result

生产环境启动时检测到 `jwt_secret` 仍为默认值 → 拒绝启动并输出明确的错误信息，要求设置 `JWT_SECRET` 环境变量。

## Actual Result

使用默认密钥正常启动，无任何告警。JWT 签名/验证使用已知的默认密钥。

## Root Cause

`config.py` 的 `Settings` 类没有配置验证逻辑（`@field_validator` 或 `@model_validator`）来检测关键安全配置是否仍为默认值。`middleware_auth_enabled` 默认为 `False` 提供了部分缓解（认证默认关闭），但一旦开启认证，JWT 密钥就是最后一道防线。

**根本原因：** 缺乏生产环境安全配置校验机制。所有安全敏感配置（`jwt_secret`、`middleware_auth_token`、`oss_access_key`）都应检测是否使用了默认值。

## Fix

### 1. 添加生产环境安全配置校验

```python
# src/shared/config.py
import os
from pydantic import model_validator

class Settings(BaseSettings):
    # ... existing fields ...

    @model_validator(mode="after")
    def _validate_security_defaults(self):
        """Reject insecure defaults in production-like environments."""
        # Detect non-dev environments
        is_production = os.getenv("ENV", "").lower() in ("production", "prod", "staging")
        if not is_production:
            return self

        security_defaults = {
            "jwt_secret": "yi-ai-jwt-secret-change-in-production",
            "middleware_auth_token": "",
        }
        for field_name, default_value in security_defaults.items():
            current = getattr(self, field_name, None)
            if current == default_value:
                raise ValueError(
                    f"Security: {field_name} is still using the default value "
                    f"('{default_value}'). Set the {field_name.upper()} environment "
                    f"variable in production."
                )
        return self
```

### 2. 添加启动时 JWT Secret 熵检查

```python
# src/domain/auth/core.py
import math

def _validate_jwt_secret_entropy(secret: str, min_bits: int = 128) -> bool:
    """Check that JWT secret has sufficient entropy for production use."""
    if len(secret) < 16:
        return False
    unique_chars = len(set(secret))
    entropy = len(secret) * math.log2(max(unique_chars, 2))
    return entropy >= min_bits
```

## Verification

- 设置 `ENV=production` 且 `JWT_SECRET` 为默认值 → 启动失败，报错 "Security: jwt_secret is still using the default value"
- 设置 `ENV=production` 且 `JWT_SECRET=<random-256-bit-key>` → 启动成功
- 开发环境（`ENV` 未设置或为 `development`）→ 无变化，默认值仍可用

## Prevention

- **配置层面：** 所有安全敏感配置项 MUST 在生产环境通过环境变量覆盖
- **部署层面：** Docker/CI 部署脚本中检查 `JWT_SECRET` 是否已设置且非默认值
- **文档层面：** 在部署文档中明确标注必须覆盖的安全配置项
- **监控层面：** 添加启动时安全配置审计日志，记录每个安全配置项的来源（默认值 vs 环境变量）

## 影响范围

- **影响模块**：src/shared/config.py, src/domain/auth/core.py
- **涉及文件**：
- `config.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
