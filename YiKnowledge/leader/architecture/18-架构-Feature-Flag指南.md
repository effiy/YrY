---
title: "Feature Flag Guide — Safe Deployment Through Decoupling Deploy from Release"
aliases: [feature-flags, feature-toggles, dark-launching, canary]
tags: [architecture, feature-flags, deployment, safety, leader]
category: leader/architecture
created: 2026-09-15
updated: 2026-09-15
source: internal
type: methodology
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "技术负责人通过 feature flag 将部署（代码上线）和发布（用户可见）解耦，实现安全的渐进式交付"
acceptance_criteria:
  - "覆盖四种 flag 类型、生命周期管理和 YrY 实现建议"
  - "区分前端 flag (YiVad/YiPet) 和后端 flag (YiAi)"
  - "包含 flag 清理策略"
related:
  - ../risk/01-风险-上线风险评估.md
  - ../roadmap/02-路线图-下线服务.md
  - ../roadmap/04-路线图-废弃功能.md
---

# Feature Flag 指南

> Feature flag 解决一个核心问题：**部署 ≠ 发布**。代码上线不代表用户能看到。这让上线从"赌一把"变成"逐步验证"。

## 四种 Flag 类型

| 类型 | 目的 | 存活时间 | 示例 |
|---|---|---|---|
| **发布 Flag** | 隐藏未完成的功能 | 天-周 | 新页面还在开发中，flag 关闭时不可见 |
| **实验 Flag** | A/B 测试 | 周-月 | 50% 用户看到新版 UI，50% 看到旧版 |
| **运维 Flag** | 紧急开关 | 长期（低频使用） | 关闭 RAG 查询，降级到纯 LLM 回答 |
| **权限 Flag** | 按用户/角色控制 | 长期 | 管理员看到调试面板，普通用户不看到 |

## Flag 生命周期

```
创建 → 灰度（0→100%）→ 默认开启 → 清理（删除 flag 代码）
  │        │              │            │
开发期间  验证期间      稳定运行      功能已常态
```

**清理是关键**：不清理的 flag 是技术债。每个 flag 都有过期日期。

## YrY 实现方案

### YiVad (Vue 3) — 前端 Flag

```typescript
// src/utils/featureFlags.ts
type FlagName = 'newProTableLayout' | 'agentDebugPanel' | 'darkMode';

const flags: Record<FlagName, {
  enabled: boolean;
  expiresAt: string;  // ISO date，过期后必须清理
  description: string;
}> = {
  newProTableLayout: {
    enabled: false,
    expiresAt: '2026-12-31',
    description: 'ProTable 新版布局——Q4 测试完成后开启'
  },
  agentDebugPanel: {
    enabled: false,
    expiresAt: '2026-11-30',
    description: 'Agent 调试面板——仅开发环境可见'
  },
};

export function isFeatureEnabled(flag: FlagName): boolean {
  const f = flags[flag];
  if (!f.enabled) return false;
  // 过期告警
  if (new Date() > new Date(f.expiresAt)) {
    console.warn(`Feature flag "${flag}" has expired. Remove it.`);
  }
  return true;
}
```

**使用**：
```vue
<template>
  <NewProTable v-if="isFeatureEnabled('newProTableLayout')" />
  <OldProTable v-else />
</template>
```

### YiPet (React 18) — 前端 Flag

同样的模式，使用 React Context 或简单的 config 对象：

```typescript
// src/config/features.ts
export const FEATURES = {
  newChatLayout: import.meta.env.DEV,  // 仅开发环境
  magicReply: false,                    // 实验中
} as const;
```

### YiAi (FastAPI) — 后端 Flag

后端 flag 比前端更重要——控制功能行为和数据流：

```python
# src/config/features.py
from datetime import datetime

FEATURE_FLAGS = {
    "llm_cloud_fallback": {
        "enabled": True,
        "expires_at": datetime(2027, 1, 1),
        "description": "Ollama 不可用时自动切换云 LLM——Q3 已上线，Q4 验证"
    },
    "rag_hybrid_search": {
        "enabled": True,
        "expires_at": datetime(2027, 6, 1),
        "description": "RAG 混合检索（向量+BM25）"
    },
    "agent_max_turns_10": {
        "enabled": False,  # 实验中
        "expires_at": datetime(2026, 12, 31),
        "description": "Agent 最大对话轮数从 5 提升到 10——需要验证 LLM 上下文窗口"
    }
}

def is_enabled(flag_name: str) -> bool:
    flag = FEATURE_FLAGS.get(flag_name)
    if not flag:
        return False
    if not flag["enabled"]:
        return False
    if datetime.now() > flag["expires_at"]:
        import logging
        logging.warning(f"Feature flag '{flag_name}' has expired. Remove it.")
    return True
```

### 运维 Flag 的特殊处理

运维 flag（如"关闭 RAG"）需要在运行时动态切换，而不是部署新代码：

```python
# 方案 1：config.yaml 热加载
# config.yaml
features:
  rag_enabled: true  # 改为 false 即可降级

# 方案 2：MongoDB 动态配置
# features 集合中存 flag 状态，管理后台可切换
```

**YrY 建议**：单人项目用 `config.yaml` 即可——简单且不需要管理后台。团队 > 3 人时考虑 MongoDB 动态配置。

## Flag 灰度策略

新功能上线时，逐步扩大可见范围：

| 阶段 | 可见范围 | 持续时间 | 验证内容 |
|---|---|---|---|
| 0% | 开发者自己 | 开发期间 | 功能是否正常工作 |
| 5% | 内部测试用户 | 1-2 天 | 有没有明显的 bug |
| 25% | 小范围用户 | 2-3 天 | 性能是否正常、错误率是否上升 |
| 50% | 一半用户 | 2-3 天 | A/B 对比（如果适用） |
| 100% | 全部用户 | 持续 | 功能正式上线 |

**灰度实现**（YrY 简化版——单人项目不需要复杂的用户分组）：

```python
# 基于用户 hash 的简单灰度
def is_in_percentage(user_id: str, percentage: int) -> bool:
    """percentage: 0-100"""
    hash_val = hash(user_id) % 100
    return hash_val < percentage

# 使用
if is_in_percentage(user_id, 25):
    use_new_feature()
else:
    use_old_feature()
```

## Flag 清理策略

不清理的 flag = 代码债 + 决策债（"这个 flag 还开着吗？能关吗？"）

| 规则 | 说明 |
|---|---|
| 每个 flag 有 `expires_at` | 过期后代码中打印警告 |
| 发布 flag 存活 ≤ 30 天 | 功能上线并验证后立即清理 |
| 实验 flag 存活 ≤ 90 天 | 实验结束后无论成败都清理 |
| 运维 flag 可以长期存在 | 但需每季度审查——这个降级开关还有必要吗？ |
| 季度 flag 审计 | 检查所有 flag，清理过期的 |

```bash
# 季度 flag 审计命令
grep -r "expires_at" --include="*.py" --include="*.ts"
```

## Flag 反模式

| 反模式 | 失败原因 | 正确做法 |
|---|---|---|
| Flag 地狱 | 10 个 flag 嵌套——`if A: if B: if C: ...` | 控制 flag 数量（< 5 个活跃）；flag 之间不应嵌套 |
| 永久 flag | "暂时先 flag 着"→ 半年后还在 | 每个 flag 有过期日期；自动告警 |
| Flag 覆盖所有代码路径 | 9 个 flag = 2^9 = 512 种组合——不可能全部测试 | 活跃 flag < 5；新 flag 上线时清理旧 flag |
| 用 flag 替代分支 | 两个 flag 分别指向不同实现——相当于维护两套代码 | Flag 应包裹小的代码块，而非整个模块 |
| Flag 没有监控 | 打开了 flag 但没有观察错误率——出了问题不知道是 flag 导致的 | 每个 flag 打开时监控错误率和关键指标 |

## 适用场景

- YiAi 新增 Agent 模式功能——先 flag 关着，测试完逐步灰度
- YiVad 重构 ProTable——新老版本并存，flag 切换
- 紧急降级——RAG 服务异常时运维 flag 关闭，降级到纯 LLM

## YrY 当前 Flag

| Flag | 类型 | 状态 | 过期 | 说明 |
|---|---|---|---|---|
| `llm_cloud_fallback` | 运维 | ✅ 开启 | 2027-01-01 | LLM 多提供商路由 |
| `rag_hybrid_search` | 运维 | ✅ 开启 | 2027-06-01 | RAG 混合检索 |

*当前单人项目 flag 数量极低——主要是运维开关。随着功能复杂度增加，flag 数量会增长。*