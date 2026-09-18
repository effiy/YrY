---
title: "Ollama 模型生命周期管理 — 从选型到退役"
aliases: [ollama-model-management, model-lifecycle, model-versioning, model-rollback]
tags: [sre, observability, ollama, model-management, ai-operations]
category: srer/observability
created: 2026-09-15
updated: 2026-09-15
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, aier]
benefit: "SRE 和 AI 工程师安全管理 Ollama 模型的完整生命周期——评估、部署、监控、回滚和退役"
acceptance_criteria:
  - "覆盖模型选型评估、灰度部署、性能监控和回滚"
  - "包含模型存储空间管理和清理策略"
  - "YrY 常用模型版本对照表和切换决策流程"
related:
  - ./04-可观测-GPU推理.md
  - ./01-可观测-容量与成本.md
  - ./13-可观测-性能测试指南.md
  - ../release/01-发布-金丝雀发布.md
---

# Ollama 模型生命周期管理 — 从选型到退役

> **适用场景**：切换 Ollama 模型版本、评估新模型、管理磁盘上的模型存储空间。LLM 模型文件动辄数 GB，频繁切换会快速耗尽磁盘——需要系统化管理。

## 模型生命周期

```
选型评估 → 下载部署 → 灰度验证 → 全量切换 → 旧模型退役
   │           │           │           │            │
   │   GPU显存  │   模型预热  │  对比基线  │  保留回退   │  释放空间
   │   兼容性   │   健康检查  │  用户反馈  │   能力      │
```

## YrY 常用模型版本卡

| 模型 | 量化 | 显存需求 | 适用 GPU | 上下文窗口 | 首次 token 延迟 | 适用场景 |
|---|---|---|---|---|---|---|
| `qwen3.5:7b-q4_K_M` | 4-bit | ~4.5 GB | 12 GB+ | 8192 | ~1.5s | **当前默认**——通用聊天 |
| `qwen3.5:7b-q4_0` | 4-bit | ~4.0 GB | 8 GB+ | 4096 | ~1.2s | 显存紧张时的降级方案 |
| `qwen3.5:7b-q8_0` | 8-bit | ~7.0 GB | 12 GB+ | 8192 | ~2.0s | 质量优先场景（精度更高） |
| `qwen3.5:14b-q4_K_M` | 4-bit | ~9.5 GB | 24 GB | 8192 | ~3.0s | 复杂推理——需要 24GB 显存 |
| `qwen3.5:14b-q4_0` | 4-bit | ~8.5 GB | 24 GB | 4096 | ~2.5s | 14B 的降级方案 |

## 模型部署流程

### 阶段一：评估（开发和预发布环境）

```bash
# 1. 拉取新模型
ollama pull qwen3.5:14b-q4_K_M

# 2. 确认模型参数量和显存占用
ollama show qwen3.5:14b-q4_K_M

# 3. 确认显存余量
nvidia-smi --query-gpu=memory.free --format=csv,noheader

# 4. 在预发布环境测试
curl -s http://localhost:11434/api/generate -d '{
  "model": "qwen3.5:14b-q4_K_M",
  "prompt": "用 100 字解释什么是 RAG",
  "stream": false
}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'响应: {d.get(\"response\",\"\")[:100]}...')"

# 5. 对比基准性能
# 使用 vegeta 对 7B 和 14B 分别做相同负载的测试，对比 P99 延迟和吞吐量
```

### 阶段二：灰度部署

模型对用户体验影响巨大——必须灰度切换，不能直接全量：

1. **YiAi 配置支持多模型**：
```yaml
# config.yaml 中配置新旧两个模型
ollama:
  default_model: "qwen3.5:7b-q4_K_M"      # 当前生产模型
  experimental_model: "qwen3.5:14b-q4_K_M"  # 灰度测试模型
```

2. **按用户或比例路由**（需 YiAi 应用层支持）：先 5% 用户使用新模型 → 观察 24 小时 → 逐步放量

3. **灰度期间监控对比**：

| 指标 | 7B 基线 | 14B 灰度 | 接受标准 |
|---|---|---|---|
| 首次 token 延迟 | 1.5s | 3.0s | < 5s |
| 完整响应时间 | 8s | 15s | < 25s |
| GPU 显存使用 | 4.5 GB | 9.5 GB | < 11 GB（12GB 显卡 90%） |
| 错误率 | < 1% | < 1% | 不超过基线的 2 倍 |

### 阶段三：全量切换

```bash
# 1. 更新 YiAi config.yaml 的默认模型
# ollama.default_model: "qwen3.5:14b-q4_K_M"

# 2. 重启 YiAi
sudo systemctl restart yiai

# 3. 预热新模型
curl -s http://localhost:11434/api/generate -d '{
  "model": "qwen3.5:14b-q4_K_M",
  "prompt": "ping",
  "stream": false,
  "options": {"num_predict": 1}
}' > /dev/null

# 4. 验证健康检查
curl -s localhost:10086/health/observer

# 5. 发送测试聊天消息验证
```

### 阶段四：旧模型保留与退役

**保留期**：切换后至少保留旧模型 7 天作为回退选项。

```bash
# 保留旧模型——不删除
ollama list  # 确认两个模型都在

# 7 天后如无回退需求，删除旧模型
ollama rm qwen3.5:7b-q4_K_M
```

## 存储空间管理

Ollama 模型存储在 `~/.ollama/models/`，每个模型 4-15 GB。

```bash
# 查看模型占用空间
du -sh ~/.ollama/models/

# 查看已安装模型及大小
ollama list

# 清理未使用的模型
ollama rm <模型名>

# 批量清理：删除所有非当前生产模型（谨慎！）
# 保留当前默认模型，删除其余
```

**磁盘空间告警阈值**：

| 剩余空间 | 行动 |
|---|---|
| > 20 GB | 正常——可拉取新模型 |
| 10-20 GB | 谨慎——拉取新模型前先评估空间 |
| < 10 GB | **禁止拉取新模型**——先清理旧模型或其他文件 |

## 模型回滚

如果新模型出现问题，快速回退：

```bash
# 1. 修改 config.yaml 回退到旧模型
# ollama.default_model: "qwen3.5:7b-q4_K_M"

# 2. 重启 YiAi
sudo systemctl restart yiai

# 3. 预热旧模型
curl -s http://localhost:11434/api/generate -d '{
  "model": "qwen3.5:7b-q4_K_M",
  "prompt": "ping",
  "stream": false,
  "options": {"num_predict": 1}
}' > /dev/null

# 4. 验证
curl -s localhost:10086/health/observer
```

**触发回滚的条件**：
- 错误率超过基线 2 倍，持续 10 分钟
- P99 延迟超过基线 3 倍
- GPU 显存溢出（OOM）导致推理失败
- 用户投诉激增

## 模型切换决策流程

```
考虑切换到新模型
    │
    ├─ 当前模型有问题？（OOM、延迟超标、质量投诉）
    │   ├─ 是 → 评估替代模型 → 走完整部署流程
    │   └─ 否 → 新模型有明显优势？
    │       ├─ 是 → 评估 + 灰度
    │       └─ 否 → 不切换——"没坏不修"原则
    │
    ├─ 有时间做灰度验证？
    │   ├─ 是 → 灰度（推荐）
    │   └─ 否 → 至少做预发布环境完整测试 + 保留回退能力
    │
    └─ 磁盘空间足够容纳两个模型？
        ├─ 是 → 保留旧模型 7 天
        └─ 否 → 清理旧模型前确保回退方案可行
```

## 常见反模式

| 反模式 | 后果 | 正确做法 |
|---|---|---|
| 直接全量切换新模型 | 新模型有问题时影响所有用户 | 灰度验证至少 24 小时 |
| 切换后立即删除旧模型 | 需要回退时模型已不存在 | 保留旧模型至少 7 天 |
| 不评估显存就拉取大模型 | 显存不够 → OOM → 服务中断 | 拉取前 `ollama show` 确认显存需求，`nvidia-smi` 确认余量 |
| 磁盘满了才清理模型 | 模型下载到一半空间不足 | 定期检查磁盘空间和模型占用 |
| 切换模型不做性能基线对比 | 只知道"感觉慢了"不知道慢多少 | 切换前后用相同负载测试并记录 P50/P95/P99 |