---

doc_type: task
prd_task_id: "YA-09-116"
title: "YA-09-116: Agent SSRF 防护 — 技术实现"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
source_prd: "116-需求-Agent-SSRF防护.md"

type: task
---

# YA-09-116: Agent SSRF 防护 — 技术实现

## 变更

`domain/ai/tools/builtin/web_tools.py` — 新增 `_is_private_url()` + 调用点

### 新增导入

```python
import ipaddress, socket
from urllib.parse import urlparse
```

### 新增函数 (~35 行)

`_is_private_url(url)` — 与 `server/routes/search.py` 中的同名函数逻辑一致：
1. 解析 URL hostname
2. 检查 blocked hosts (localhost, metadata.google.internal 等)
3. 检查是否为 IP 字面量且在私有网段
4. DNS 解析后检查解析 IP 是否在私有网段

### 调用点

```python
# _web_fetch() 函数中，_is_url_allowed() 之后
if _is_private_url(url):
    return {"content": "", "error": f"Access denied: ..."}
```

## 已知重复

`_is_private_url()` 在 `web_tools.py` 和 `search.py` 中存在两份实现。建议后续抽取到 `shared/url_guard.py`（P3 优先级）。