---
title: "Config: YAML 配置扁平化导致嵌套键名冲突，深层配置被意外覆盖"
tags:
- config
- yaml
- pydantic-settings
- flatten
- key-collision
category: projects/yiai/bugs/config
created: 2026-09-07
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiAi
module: src/shared/config.py
reporter: Claude
environment: all
affected_version: main (pre-fix)
fixed_version: main (post-fix 2026-09-07)
frequency: rare
---

## Description

`YamlConfigSettingsSource._flatten` 将嵌套 YAML 结构扁平化为 `parent_key_child` 格式（如 `mongodb_uri`）。当两个不同父键下的子键名相同时（如 `rag.timeout` 和 `agent.timeout`），扁平化后的键名 `timeout` 在 `rag` 和 `agent` 的上下文中含义不同，但扁平化逻辑不区分——如果两个父键同时存在且子键名相同，后出现的会覆盖先出现的。

**当前代码：**
```python
# src/shared/config.py:24-32
@staticmethod
def _flatten(d: Dict[str, Any], parent_key: str = '', sep: str = '_') -> Dict[str, Any]:
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(YamlConfigSettingsSource._flatten(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)
```

`dict(items)` 会静默覆盖重复键——如果两个嵌套路径产生相同的扁平键，最后写入的值胜出，没有任何警告。

**实际影响：** 当前 `config.yaml` 中尚未出现真正的键冲突，因为字段命名足够具体（`rag_chat_timeout` vs `ollama_chat_timeout`）。但这是一种**静默的数据丢失风险**——未来添加新配置段时，如果子键名与已有配置段的子键名相同，配置值会被静默覆盖。

## Steps to Reproduce

1. 修改 `config.yaml`，添加：
   ```yaml
   rag:
     chat_timeout: 180
   agent:
     chat_timeout: 300
   ```
2. 两个配置段扁平化后都产生键 `chat_timeout`
3. `dict(items)` 中后出现的值覆盖先出现的值
4. `rag.chat_timeout` 实际读取到 `300`（agent 的值）

## Expected Result

检测到重复扁平键时抛出异常或至少输出 WARNING 日志，提醒开发者键名冲突。

## Actual Result

`_flatten` 静默覆盖，`dict(items)` 最后写入的值胜出，无任何告警。

## Root Cause

`_flatten` 方法使用 `dict(items)` 从元组列表构建字典，Python 的 `dict` 构造器在遇到重复键时静默覆盖。此外，扁平化键名仅使用最后一级键名作为前缀，不保留完整的层级路径信息。

**根本原因：** `_flatten` 没有重复键检测机制。`pydantic-settings` 的 `YamlConfigSettingsSource` 本身不提供扁平化功能——这是自定义实现，但缺少防御性校验。

## Fix

### 1. 添加重复键检测

```python
# src/shared/config.py
@staticmethod
def _flatten(d: Dict[str, Any], parent_key: str = '', sep: str = '_') -> Dict[str, Any]:
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(YamlConfigSettingsSource._flatten(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))

    # Detect duplicate keys
    seen = {}
    result = {}
    for key, value in items:
        if key in seen:
            raise ValueError(
                f"Config key collision: '{key}' from "
                f"'{seen[key]}' and another path both flatten to the same key. "
                f"Rename one of the nested keys to avoid collision."
            )
        seen[key] = f"{parent_key}.{k}" if parent_key else k
        result[key] = value
    return result
```

### 2. 添加启动时配置审计日志

```python
# 在 Settings 初始化后记录配置来源
logger.info(f"Config loaded: {len(settings.model_dump())} keys from config.yaml")
logger.debug(f"Config keys: {sorted(settings.model_dump().keys())}")
```

## Verification

- 正常 `config.yaml` → 启动成功，无变化
- 添加冲突键 → 启动失败，抛出 `ValueError: Config key collision: 'timeout' from 'rag.timeout' and 'agent.timeout' both flatten to the same key`
- 所有现有配置项 → 值不变

## Prevention

- **代码层面：** 新增配置段时，确保子键名不与已有配置段的子键名冲突
- **命名约定：** 配置键使用 `{module}_{field}` 的命名模式（如 `rag_chat_timeout` 而非 `chat_timeout`），避免扁平化冲突
- **测试层面：** 添加配置加载测试，验证所有配置项的类型和默认值

## 影响范围

- **影响模块**：src/shared/config.py
- **涉及文件**：
- src/shared/config.py
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
