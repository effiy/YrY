---

doc_type: module
prd_task_id: "YA-09-87"
title: "YA-09-87: 数据库凭证轮换 — 零停机 + 双凭证过渡 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "88-需求-数据库凭证轮换.md"
source_okr: [yiai-001]

type: task
---

# YA-09-87: 数据库凭证轮换 — 零停机 + 双凭证过渡 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[88-需求-数据库凭证轮换.md](../../prds/2026-09/88-需求-数据库凭证轮换.md)
> 需求编号：YA-09-87 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、架构总览

MongoDB 连接凭证（用户名/密码）需要定期轮换以满足安全合规。传统方式需要修改配置 + 重启服务，导致短暂不可用。引入双凭证机制：配置同时包含新旧两套凭证，主凭证失败时自动尝试备用凭证，实现零停机轮换。

```mermaid
flowchart TD
    A["DualCredentialClient 初始化"] --> B{"尝试主凭证连接"}
    B -->|成功| C["使用主凭证 (user_v1)"]
    B -->|失败| D["尝试备用凭证 (user_v2)"]
    D -->|成功| E["使用备用凭证 + WARNING 日志"]
    D -->|失败| F["服务无法启动"]

    G["凭证轮换流程"] --> H["MongoDB 创建 user_v2"]
    H --> I["部署含双凭证的 config"]
    I --> J["验证服务使用 user_v1 正常"]
    J --> K["交换 url ↔ fallback_url"]
    K --> L["验证服务使用 user_v2 正常"]
    L --> M["MongoDB 删除 user_v1"]

    style A fill:#9cf,stroke:#333
    style G fill:#f96,stroke:#333
```

**零停机原理**：连接池检测到主凭证失效时，新建连接自动使用备用凭证。已建立的连接池继续工作直到下次重连。

---

<a id="sec-2"></a>
## 二、文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `YiAi/src/domain/data/credential_client.py` | 新增 | DualCredentialClient |
| `YiAi/src/domain/data/database.py` | 修改 | 使用 DualCredentialClient |
| `YiAi/scripts/rotate_mongo_creds.sh` | 新增 | 凭证轮换脚本 |
| `YiAi/tests/test_credential_rotation.py` | 新增 | 凭证轮换测试 |

---

<a id="sec-3"></a>
## 三、模块设计

### 3.1 DualCredentialClient

```python
# YiAi/src/domain/data/credential_client.py
from motor.motor_asyncio import AsyncIOMotorClient
import os

class DualCredentialClient:
    """双凭证 MongoDB 客户端——主凭证失败自动切换备用。

    配置:
        mongodb:
          url: "mongodb://user_v1:pass_v1@host:27017"
          fallback_url: "mongodb://user_v2:pass_v2@host:27017"
          credential_check_interval: 300  # 每 5 分钟检查主凭证是否恢复

    轮换流程:
        1. MongoDB 创建新用户 (user_v2)
        2. 部署 config 含双凭证 (url=旧, fallback_url=新)
        3. 验证服务正常
        4. 交换 url ↔ fallback_url (url=新, fallback_url=旧)
        5. 验证服务正常
        6. MongoDB 删除旧用户 (user_v1)
    """

    def __init__(self, primary_url: str, fallback_url: str = None, **kwargs):
        self._primary_url = primary_url
        self._fallback_url = fallback_url
        self._kwargs = kwargs
        self._client: AsyncIOMotorClient = None
        self._using_backup = False

    async def connect(self) -> AsyncIOMotorClient:
        """建立连接——优先主凭证，失败时尝试备用。

        连接成功后启动后台任务：每 5 分钟检查主凭证是否恢复。
        """
        # 尝试主凭证
        try:
            client = AsyncIOMotorClient(
                self._primary_url,
                serverSelectionTimeoutMS=5000,
                **self._kwargs
            )
            await client.admin.command('ping')
            self._client = client
            self._using_backup = False
            logger.info('[CredentialClient] 主凭证连接成功')
            return self._client
        except Exception as e:
            logger.warning(f'[CredentialClient] 主凭证失败: {e}')

        # 尝试备用凭证
        if self._fallback_url:
            try:
                client = AsyncIOMotorClient(
                    self._fallback_url,
                    serverSelectionTimeoutMS=5000,
                    **self._kwargs
                )
                await client.admin.command('ping')
                self._client = client
                self._using_backup = True
                logger.warning('[CredentialClient] 使用备用凭证连接成功')
                self._start_recovery_check()
                return self._client
            except Exception as e:
                raise RuntimeError(f'所有凭证均失败: {e}')

        raise RuntimeError('主凭证失败且无备用凭证')

    def _start_recovery_check(self):
        """后台检查主凭证是否恢复。"""
        asyncio.create_task(self._check_primary_recovery())

    async def _check_primary_recovery(self):
        """每 5 分钟检查主凭证是否恢复。"""
        while self._using_backup:
            await asyncio.sleep(300)
            try:
                client = AsyncIOMotorClient(
                    self._primary_url,
                    serverSelectionTimeoutMS=3000,
                    **self._kwargs
                )
                await client.admin.command('ping')
                # 主凭证恢复——切换回去
                old_client = self._client
                self._client = client
                self._using_backup = False
                old_client.close()
                logger.info('[CredentialClient] 主凭证已恢复，已切换回主连接')
                break
            except Exception:
                pass

    @property
    def client(self) -> AsyncIOMotorClient:
        if not self._client:
            raise RuntimeError('未连接——请先调用 connect()')
        return self._client

    def get_credential_status(self) -> dict:
        """获取凭证状态——用于 /health/debug。"""
        return {
            'using_backup': self._using_backup,
            'primary_url': self._mask_url(self._primary_url),
            'fallback_url': self._mask_url(self._fallback_url) if self._fallback_url else None,
        }

    def _mask_url(self, url: str) -> str:
        """脱敏凭证 URL——隐藏密码。"""
        import re
        return re.sub(r'://(.+?):(.+?)@', r'://\1:***@', url)
```

### 3.2 轮换脚本

```bash
#!/bin/bash
# YiAi/scripts/rotate_mongo_creds.sh

set -e

MONGO_HOST="${MONGO_HOST:-localhost:27017}"
NEW_USER="app_user_$(date +%Y%m%d)"
NEW_PASS=$(openssl rand -base64 32)

echo "=== MongoDB 凭证轮换 ==="
echo "Step 1/6: 创建新用户: $NEW_USER"
mongosh "mongodb://$MONGO_HOST/admin" --eval "
  db.createUser({
    user: '$NEW_USER',
    pwd: '$NEW_PASS',
    roles: [{role: 'readWrite', db: 'yiai'}]
  })
"

echo "Step 2/6: 更新 config.yaml 添加备用凭证"
# 手动编辑 config.yaml
echo "  fallback_url: 'mongodb://$NEW_USER:$NEW_PASS@$MONGO_HOST/yiai'"

echo "Step 3-6: 部署 → 交换 → 验证 → 删除旧用户"
echo "请手动完成剩余步骤（避免脚本失误）"
```

---

<a id="sec-4"></a>
## 四、数据流

```
服务启动:
  → DualCredentialClient.connect()
    → 主凭证: mongodb://user_v1:pass_v1@host:27017
      → ping() 成功 → 使用主凭证
    → 主凭证失败:
      → 备用凭证: mongodb://user_v2:pass_v2@host:27017
        → ping() 成功 → 使用备用 + 后台检查恢复

凭证轮换:
  Step 1: MongoDB 创建 user_v2
  Step 2: config.yaml {url: user_v1, fallback_url: user_v2}
  Step 3: 部署 → 服务仍用 user_v1
  Step 4: config.yaml {url: user_v2, fallback_url: user_v1}
  Step 5: 部署 → 服务切换到 user_v2（连接池刷新时自动使用新凭证）
  Step 6: MongoDB db.dropUser('user_v1')
```

---

<a id="sec-5"></a>
## 五、实施路线

| # | 步骤 | 产出 | 验证 | 人天 |
|---|------|------|------|------|
| 1 | 创建 DualCredentialClient | `credential_client.py` | 主凭证失败自动切换备用 | 0.15 |
| 2 | 实现后台恢复检查 | `credential_client.py` | 主凭证恢复后自动切回 | 0.1 |
| 3 | 集成到 database.py | `database.py` | 使用双凭证客户端 | 0.1 |
| 4 | 编写轮换脚本 + 文档 | `scripts/rotate_mongo_creds.sh` | 轮换流程清晰可执行 | 0.1 |
| 5 | 测试用例 | `tests/test_credential_rotation.py` | 主凭证失败/备用/恢复/双失败 | 0.05 |

**合计：0.5d**

---

<a id="sec-6"></a>
## 六、代码审查检查清单

- [ ] 主凭证失败自动尝试备用（不抛异常）
- [ ] 双凭证均失败时服务启动失败（正确行为）
- [ ] 使用备用凭证时记录 WARNING 日志 + 企微通知
- [ ] 后台每 5 分钟检查主凭证恢复
- [ ] 主凭证恢复后自动切回（关闭旧连接）
- [ ] 日志/健康检查中凭证脱敏（隐藏密码）
- [ ] 轮换流程文档化（6 步骤清晰）

---

<a id="sec-7"></a>
## 七、风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 双凭证同时失效（配置错误） | 低 | 高 | 轮换前验证新凭证可连接 |
| 后台恢复检查时旧连接池未完全关闭 | 低 | 低 | 延迟 1s 后 close 旧客户端 |
| 凭证 URL 脱敏不完整 | 低 | 低 | 正则匹配多种 URL 格式 |

**回滚**：config.yaml 恢复单凭证（移除 fallback_url），重启服务。