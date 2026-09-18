---
title: "Runbook 编写指南 — 可执行的故障处理手册"
aliases: [runbook, playbook, incident-runbook, troubleshooting-guide]
tags: [sre, incident-response, runbook, troubleshooting, operations]
category: srer/incident-response
created: 2026-09-15
updated: 2026-09-15
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "值班工程师在告警触发时，能立即按照 runbook 中的步骤化指引快速恢复服务"
acceptance_criteria:
  - "定义 runbook 的标准结构模板"
  - "包含 3 个 YrY 服务的实战 runbook 示例"
  - "覆盖 runbook 的维护和测试策略"
related:
  - ./04-事件-响应事件.md
  - ./02-事件-处理值班轮班.md
  - ../observability/07-可观测-搭建可观测性.md
  - ../observability/10-可观测-告警规则配置.md
---

# Runbook 编写指南 — 可执行的故障处理手册

> **适用场景**：为每个已知的告警条件编写对应的 runbook。一个没有 runbook 的告警，只是噪音——值班人收到告警后不知道该做什么。

## 什么是 Runbook

Runbook 是特定告警或故障场景的**步骤化处理指南**。它与事件响应流程的关系：

| 文档 | 作用 | 类比 |
|---|---|---|
| **事件响应流程** | 通用的事件响应方法论 | 急救手册的总纲 |
| **Runbook** | 特定症状的具体处理步骤 | 针对"心脏骤停"或"骨折"的具体急救步骤 |
| **事后复盘** | 事件结束后分析为什么发生 | 病例分析报告 |

## Runbook 编写原则

- **凌晨 3 点可执行**——值班人在凌晨被叫醒、头脑不清醒时，能按照 runbook 一步步操作
- **每步都有验证**——每一步操作后紧跟验证命令，确认操作生效
- **先恢复，后调查**——runbook 的优先目标是恢复服务，不是找到根因
- **包含升级条件**——明确指出何时应停止自行处理、升级求助

## Runbook 标准模板

```markdown
# Runbook：<告警名称>

| 项目 | 内容 |
|---|---|
| **Runbook ID** | RB-{编号} |
| **触发告警** | <对应的告警规则名称> |
| **严重程度** | P0 / P1 / P2 |
| **维护人** | <姓名> |
| **最后更新** | YYYY-MM-DD |
| **预计处理时间** | <N> 分钟 |

## 症状

用户/监控看到什么现象？（用业务语言描述，不用技术语言）

- 用户端：{{用户看到什么}}
- 监控端：{{告警信息包含什么}}

## 前置检查（1 分钟）

确定这确实是此 runbook 适用的问题，而非其他故障。

- [ ] 检查 {{具体端点/指标}} 是否异常
- [ ] 排除 {{容易混淆的其他故障}}

> 如果检查结果不符，参见 [升级](#升级)

## 恢复步骤

### 步骤 1：<操作名称>（预计 <N> 分钟）

**操作**：
```bash
<可直接复制粘贴执行的命令>
```

**验证**：
```bash
<验证操作生效的命令>
```

**预期结果**：{{预期看到什么}}

> 如果验证失败 → 跳到 [步骤 2](#步骤-2)

### 步骤 2：<备选方案>（预计 <N> 分钟）

...

## 升级

满足以下任一条件时，立即升级：

- [ ] 按照上述步骤操作后问题未解决
- [ ] 操作耗时超过 {{N}} 分钟
- [ ] 出现本 runbook 未覆盖的症状

**升级路径**：备份值班人 → 工程经理

## 回滚（如果步骤中包含变更）

```bash
<撤销上述操作的命令>
```

## 关联信息

- 相关告警：{{其他可能同时触发的告警}}
- 相关 runbook：{{其他可能需要同时参考的 runbook}}
- 历史事件：{{由此症状引发的历史事件链接}}
```

## YrY 实战 Runbook 示例

### Runbook 1：YiAi 健康检查失败（MongoDB 不可达）

```markdown
# Runbook：YiAi MongoDB 不可达

| 项目 | 内容 |
|---|---|
| **Runbook ID** | RB-001 |
| **触发告警** | YiAi `/health/observer` 返回 `mongodb: disconnected` |
| **严重程度** | P0 |
| **维护人** | SRE Team |
| **预计处理时间** | 10 分钟 |

## 症状

- YiVad/YiPet 所有数据操作返回错误
- 健康检查 `/health/observer` 显示 `mongodb: disconnected`

## 前置检查

- [ ] `curl http://localhost:10086/health/observer` 确认 MongoDB 状态
- [ ] 排除网络问题：`ping <MongoDB 地址>`

## 恢复步骤

### 步骤 1：检查 MongoDB 进程（2 分钟）

**操作**：
```bash
# macOS
brew services list | grep mongodb

# Linux
systemctl status mongod
```

**验证**：确认 MongoDB 进程状态
**预期结果**：进程状态为 `started` 或 `active`

> 如果进程未运行 → 执行步骤 2
> 如果进程运行但 YiAi 仍无法连接 → 执行步骤 3

### 步骤 2：启动 MongoDB（3 分钟）

**操作**：
```bash
# macOS
brew services restart mongodb-community

# Linux
sudo systemctl restart mongod
```

**验证**：
```bash
mongosh --eval "db.runCommand({ping:1})"
```

**预期结果**：返回 `{ ok: 1 }`

> 重启后验证 YiAi 健康检查：`curl http://localhost:10086/health/observer`

### 步骤 3：检查连接数和磁盘空间（5 分钟）

**操作**：
```bash
# 检查磁盘空间
df -h /data/db

# 检查 MongoDB 当前连接数
mongosh --eval "db.serverStatus().connections"
```

**常见原因和解决**：
- 磁盘满 → 清理日志或扩容
- 连接数耗尽 → 重启 YiAi 释放连接；长期方案增大 `maxPoolSize`

## 升级

- 步骤 2 执行后问题仍存在 → 升级到备份值班
- 耗时超过 15 分钟 → 升级到工程经理
- 怀疑数据损坏 → 升级到 DBA（如有）

## 关联

- 相关告警：YiAi API 5xx 错误率飙升
- 历史事件：[事后复盘链接]
```

### Runbook 2：YiAi Ollama 不可用

```markdown
# Runbook：YiAi Ollama 不可用

| 项目 | 内容 |
|---|---|
| **Runbook ID** | RB-002 |
| **触发告警** | YiAi `/health/observer` 返回 `ollama: unavailable` |
| **严重程度** | P1 |
| **维护人** | SRE Team |
| **预计处理时间** | 10 分钟 |

## 症状

- 聊天功能返回 "AI 服务暂时不可用" 或错误码 2001
- 数据 CRUD 功能正常
- 健康检查 `/health/observer` 显示 `ollama: unavailable`

## 前置检查

- [ ] `curl http://localhost:11434/api/tags` 是否有响应
- [ ] 确认是 Ollama 进程问题还是模型加载问题

## 恢复步骤

### 步骤 1：启动 Ollama 服务（2 分钟）

**操作**：
```bash
# 检查 Ollama 是否运行
ps aux | grep ollama

# 如未运行，启动服务
ollama serve &
```

**验证**：
```bash
curl http://localhost:11434/api/tags
```

**预期结果**：返回模型列表 JSON

### 步骤 2：检查 GPU 显存（3 分钟）

**操作**：
```bash
nvidia-smi
```

**验证**：确认 GPU 显存未被其他进程占满
**常见原因**：其他进程占用了 GPU 显存，导致 Ollama 无法加载模型

### 步骤 3：重新加载模型（3 分钟）

如果 Ollama 在运行但模型未加载：

**操作**：
```bash
# 强制加载模型
curl http://localhost:11434/api/generate -d '{
  "model": "qwen3.5:7b-q4_K_M",
  "prompt": "ping",
  "stream": false
}'
```

## 升级

- Ollama 反复崩溃 → 检查 GPU 温度和驱动
- 模型加载 OOM → 切换到更低量化版本
- 耗时超过 20 分钟 → 升级到工程经理

## 降级方案

在 Ollama 恢复前：
- 通知用户聊天功能暂时不可用
- 数据管理功能正常，可引导用户使用非聊天功能
```

### Runbook 3：磁盘空间不足

```markdown
# Runbook：磁盘空间不足

| 项目 | 内容 |
|---|---|
| **Runbook ID** | RB-003 |
| **触发告警** | 磁盘使用率 > 80%（警告）/ > 90%（严重） |
| **严重程度** | P1（> 90% 时为 P0） |
| **维护人** | SRE Team |
| **预计处理时间** | 15 分钟 |

## 症状

- 磁盘监控告警
- YiAi 日志中出现 `OSError: No space left on device`

## 前置检查

- [ ] `df -h` 确认磁盘使用率
- [ ] `du -sh /tmp/* /var/log/*` 快速定位大文件

## 恢复步骤

### 步骤 1：紧急释放空间（5 分钟）

**操作**：
```bash
# 清理 pip 缓存
pip cache purge

# 清理 npm 缓存
npm cache clean --force

# 清理系统日志（保留最近 7 天）
sudo journalctl --vacuum-time=7d

# 清理 Docker（如使用）
docker system prune -a -f
```

**验证**：`df -h` 确认磁盘使用率下降

### 步骤 2：定位大文件（5 分钟）

**操作**：
```bash
# 查找大于 100MB 的文件
find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null

# 检查 YiAi 数据目录
du -sh /opt/yiai/*
```

### 步骤 3：清理 YiAi 特定文件（5 分钟）

**操作**：
```bash
# 清理过期的临时文件
find /opt/yiai/tmp -type f -mtime +7 -delete

# 清理旧的 Ollama 模型（未使用的）
ollama list
# ollama rm <不用的模型名>
```

## 升级

- 清理后磁盘使用率仍然 > 85% → 需要扩容
- 磁盘使用率增长异常快（> 5%/天）→ 排查是否有异常写入

## 预防（非紧急，事后执行）

- 添加日志轮转配置
- 设置磁盘使用率告警规则
- 每月检查磁盘增长趋势
```

## Runbook 维护策略

| 维护活动 | 频率 | 内容 |
|---|---|---|
| **内容审查** | 每季度 | 检查操作步骤是否仍然有效；验证命令是否可用 |
| **跟随事件更新** | 每次事件后 | 如果事件处理中发现了新的恢复方法，更新 runbook |
| **演练验证** | 每半年 | 在预发布环境按 runbook 操作一遍，确保步骤正确 |
| **废弃清理** | 每季度 | 删除不再适用的 runbook；标记已被自动化替代的 |

## 常见反模式

| 反模式 | 为何失败 | 正确做法 |
|---|---|---|
| Runbook 全是文字没有命令 | 凌晨 3 点的值班人需要的是可复制粘贴的命令，不是说明文 | 每个操作步骤附带可直接执行的命令 |
| 只有"怎么做"没有"怎么验证" | 执行了操作但不知道是否生效 | 每步操作后紧跟验证命令和预期结果 |
| Runbook 写完后从不更新 | 系统变化后 runbook 中的命令已失效 | 每季度审查；每次事件后更新 |
| 没有升级条件 | 值班人按 runbook 反复尝试但不求助，延误故障恢复 | 每个 runbook 明确定义升级条件 |
| 告警没有对应 runbook | 值班人收到告警后不知道做什么 | 每个告警规则必须有对应的 runbook |