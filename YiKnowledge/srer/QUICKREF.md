---
title: "YrY 运维速查卡 — 值班 SRE 的即时参考"
aliases: [ops-quickref, sre-cheatsheet, oncall-reference, troubleshooting-quickref]
tags: [sre, quickref, operations, troubleshooting, oncall]
category: srer
created: 2026-09-15
updated: 2026-09-15
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer]
benefit: "值班 SRE 在告警或故障时，30 秒内找到对应服务的检查命令和恢复步骤"
acceptance_criteria:
  - "覆盖 YiAi/YiVad/YiPet/MongoDB/Ollama 的健康检查、重启、日志和常见故障"
  - "命令可直接复制粘贴执行"
  - "包含服务依赖图和值班决策树"
related:
  - ./incident-response/04-事件-响应事件.md
  - ./incident-response/09-事件-Runbook模板.md
  - ./observability/07-可观测-搭建可观测性.md
---

# YrY 运维速查卡

> 收到告警 → 找到对应服务 → 复制命令 → 执行 → 10 分钟未解决 → 翻完整 runbook。

## 服务依赖图

```
用户 ──→ YiVad (:8848) ──→ YiAi (:10086) ──→ MongoDB (:27017)
              │                   │
              │                   ├──→ Ollama (:11434) AI 推理
              │                   └──→ YiKnowledge/ RAG 数据源
用户 ──→ YiPet (扩展) ──→ 同上 YiAi
```

**依赖不可用时的降级**：MongoDB 不可用 → P0 全部数据操作失败。Ollama 不可用 → P1 聊天失败，数据 CRUD 正常。RAG 索引空 → P2 知识检索失效。

## 关键端点和端口

| 服务 | 端口 | 健康检查命令 |
|---|---|---|
| YiAi | 10086 | `curl -s localhost:10086/health/observer` |
| YiVad | 8848 | 浏览器访问 `localhost:8848` |
| MongoDB | 27017 | `mongosh --eval "db.runCommand({ping:1})"` |
| Ollama | 11434 | `curl -s localhost:11434/api/tags` |

## YiAi 速查

```bash
# 进程状态
ps aux | grep uvicorn | grep -v grep

# 重启
pkill -f uvicorn && cd /path/to/YiAi && python main.py &

# 全量健康
curl -s localhost:10086/health/observer | python3 -m json.tool

# RAG 状态
curl -s localhost:10086/rag-status | python3 -m json.tool

# RPC 功能验证
curl -s -X POST localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{"module_name":"services.database.data_service","method_name":"query_documents","parameters":{"cname":"menus","pageSize":1}}'

# Agent 错误日志
grep -i "\[Agent\].*error" /dev/stdout | tail -20

# MongoDB 连接错误
grep -i "pymongo.errors" /dev/stdout | tail -10

# Ollama 连接错误
grep -i "ConnectionError.*11434" /dev/stdout | tail -10
```

### 常见故障速判

| 症状 | 首先检查 | 参考 |
|---|---|---|
| `mongodb: disconnected` | `brew services list \| grep mongo` | Runbook RB-001 |
| `ollama: unavailable` | `curl localhost:11434/api/tags` | Runbook RB-002 |
| API 返回 5xx | `tail -50` stdout | 事件响应流程 |
| RAG 返回空结果 | `curl localhost:10086/rag-status` | 知识监视器排查 |
| 聊天流中断 | 检查 Nginx `proxy_buffering` | 反向代理 SSE 配置 |

## YiVad 速查

```bash
# 类型检查
cd /path/to/YiVad && vue-tsc --noEmit 2>&1 | tail -20

# 构建
cd /path/to/YiVad && pnpm build:pro 2>&1 | tail -20

# 确认构建产物
ls -la /path/to/YiVad/dist/index.html
```

| 浏览器现象 | DevTools 检查 | 可能原因 |
|---|---|---|
| 页面白屏 | Console 红色错误 | JS 加载失败 |
| 菜单不显示 | Network → 菜单 API | YiAi 未运行或 Token 过期 |
| 数据表格为空 | Network → RPC 请求 | 参数名不匹配（filter vs query） |
| SSE 流中断 | Network → EventSource | Nginx 缓冲未关闭 |

## MongoDB 速查

```bash
# 进程状态 (macOS)
brew services list | grep mongodb

# 连接测试
mongosh --eval "db.runCommand({ping:1})"

# 当前连接数
mongosh --eval "db.serverStatus().connections"

# 集合文档数
mongosh --eval "use yry; print('sessions: ' + db.sessions.countDocuments())"

# 重启
brew services restart mongodb-community

# 磁盘空间
df -h /usr/local/var/mongodb 2>/dev/null || df -h /data/db
```

## Ollama 速查

```bash
# 服务可用性
curl -s localhost:11434/api/tags

# 已加载模型
curl -s localhost:11434/api/ps

# GPU 状态
nvidia-smi --query-gpu=utilization.gpu,memory.used,temperature.gpu --format=csv,noheader 2>/dev/null || echo "无 GPU"

# 强制加载模型（预热）
curl -s localhost:11434/api/generate -d '{"model":"qwen3.5:7b-q4_K_M","prompt":"ping","stream":false}' | python3 -c "import sys,json; print('OK' if json.load(sys.stdin).get('response') else 'FAIL')"

# 重启
pkill ollama && ollama serve &
```

## 磁盘空间应急

```bash
df -h /
find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null | sort -k5 -hr | head -10
pip cache purge
npm cache clean --force
sudo journalctl --vacuum-time=7d
```

## 备份速查

```bash
# 查看最近备份
cat /opt/backups/mongodb/latest_backup.txt 2>/dev/null || echo "无备份记录"

# 备份文件列表
ls -lh /opt/backups/mongodb/ 2>/dev/null | tail -5
```

## 启动与关机流程

### 开机启动顺序

```
1. MongoDB  ──→ 2. Ollama ──→ 3. YiAi ──→ 4. Nginx ──→ 5. YiVad
   数据库        AI推理       API后端      反向代理      前端
```

```bash
# 完整启动（按依赖顺序）
brew services start mongodb-community    # 1. MongoDB
ollama serve &                           # 2. Ollama
sleep 3 && curl -s localhost:11434/api/tags > /dev/null  # 等待就绪
sudo systemctl start yiai               # 3. YiAi
sleep 3 && curl -s localhost:10086/health/observer       # 等待就绪
sudo systemctl start nginx              # 4. Nginx
# 5. YiVad — 构建并启动
cd /path/to/YiVad && pnpm build:pro
```

### 关机顺序（反向）

```bash
sudo systemctl stop nginx               # 1. 先停流量入口
sudo systemctl stop yiai                # 2. 停应用
brew services stop mongodb-community    # 3. 停数据库
pkill ollama                            # 4. 停推理服务
```

### 启动后验证清单

```bash
# 逐一验证
curl -s localhost:10086/health/observer | grep -q '"status":"ok"' && echo "✓ YiAi" || echo "✗ YiAi"
curl -s localhost:11434/api/tags > /dev/null && echo "✓ Ollama" || echo "✗ Ollama"
mongosh --eval "db.runCommand({ping:1})" > /dev/null 2>&1 && echo "✓ MongoDB" || echo "✗ MongoDB"
curl -s -o /dev/null -w "%{http_code}" localhost:8848 | grep -q 200 && echo "✓ YiVad" || echo "✗ YiVad"
echo "启动验证完成"
```

### 系统重启后自动恢复

如果配置了 systemd（见搭建可观测性指南），YiAi 和 Nginx 会自动启动。需要验证的是 MongoDB 和 Ollama：

```bash
# 重启后检查
curl -s localhost:10086/health/observer
# 如果显示 mongodb: disconnected 或 ollama: unavailable
# 手动启动对应服务（见上方命令）
```

## 运维节奏清单

### 每日（5 分钟）

- [ ] `curl -s localhost:10086/health/observer` — 确认 MongoDB + Ollama 正常
- [ ] `df -h /` — 磁盘使用率是否 < 80%
- [ ] `tail -20 /var/log/yiai/stdout.log | grep -i error` — 无新错误
- [ ] 检查告警通道无遗漏通知

### 每周（15 分钟）

- [ ] 审查 YiAi 日志中的 Agent 错误模式
- [ ] `mongosh --eval "db.stats()" yry` — 集合大小是否异常增长
- [ ] `curl -s localhost:10086/rag-status` — 索引文档数是否 ≈ YiKnowledge 文件数
- [ ] 检查磁盘增长趋势（对比上周 df -h 输出）
- [ ] 检查 Ollama 模型是否有新版本可用
- [ ] 如有值班交接，准备交接文档

### 每月（30 分钟）

- [ ] 审查月度 SRE 指标（MTTD/MTTR/事件数/变更失败率）
- [ ] 更新容量规划工作表（对比上月基线）
- [ ] 审查错误预算消耗
- [ ] 检查 MongoDB 备份是否正常执行
- [ ] 审查技术债清单，更新进度
- [ ] 识别 Top 3 重复劳动，评估自动化进展

### 每季度（2 小时）

- [ ] 执行 SRE 季度回顾（QUARTERLY-REVIEW.md）
- [ ] 更新性能基线（负载测试）
- [ ] MongoDB 备份恢复演练
- [ ] 组织 Game Day 演练
- [ ] 更新 QUICKREF.md 中的命令和配置
- [ ] 审查并调整 SLO 目标值
- [ ] 更新 FMEA 风险清单
- [ ] 设备货商账单审查（如有云服务支出）

## 值班决策树

```
收到告警
├─ 确定服务 → 翻到该服务速查 → 按症状定位 → 执行恢复
├─ 不确定 → 从上到下检查依赖链：
│    curl /health/observer → mongosh ping → ollama tags
├─ 10分钟未恢复 → 升级到备份值班
└─ 影响核心路径 → 启动作战室
```

## 常见错误签名速查

看到日志中的错误信息时，快速定位问题：

### YiAi / Python

| 错误信息 | 含义 | 立即检查 |
|---|---|---|
| `pymongo.errors.ServerSelectionTimeoutError` | YiAi 无法连接到 MongoDB | `brew services list \| grep mongo`；MongoDB 是否运行 |
| `pymongo.errors.ConnectionPoolError` | MongoDB 连接池耗尽 | `mongosh --eval "db.serverStatus().connections"`；慢查询 |
| `ConnectionError.*11434` | YiAi 无法连接到 Ollama | `curl localhost:11434/api/tags`；Ollama 是否运行 |
| `CUDA out of memory` | GPU 显存不足 | `nvidia-smi`；模型太大或上下文窗口过大 |
| `OSError: No space left on device` | 磁盘空间满 | `df -h /`；清理日志/缓存/旧模型 |
| `PermissionError` | 文件权限问题 | `ls -la` 目标路径；检查 YiAi 运行用户 |
| `json.decoder.JSONDecodeError` | API 收到非 JSON 请求体 | 检查调用方 Content-Type 是否为 `application/json` |
| `KeyError: 'module_name'` | RPC 信封格式错误 | 检查请求体是否包含 `module_name/method_name/parameters` |

### YiVad / 前端

| 浏览器 Console 错误 | 含义 | 立即检查 |
|---|---|---|
| `Failed to fetch` | 无法连接到 YiAi API | `curl localhost:10086/health/observer` |
| `401 Unauthorized` | Token 过期或无效 | 清除浏览器存储，重新登录 |
| `422 Unprocessable Entity` | RPC 参数名称不匹配 | 检查参数名：是 `filter` 不是 `query`，是 `target_file` 不是 `path` |
| `EventSource error` | SSE 流中断 | 检查 Nginx `proxy_buffering off; proxy_read_timeout 600s` |
| `CORS error` | 跨域请求被拦截 | Nginx CORS 配置；检查 `Access-Control-Allow-Origin` |
| `chunk load error` | 前端资源加载失败 | 检查 `dist/` 是否完整；清除浏览器缓存 |

### MongoDB

| 错误/现象 | 含义 | 立即检查 |
|---|---|---|
| `db.serverStatus().connections` 显示 current ≈ available | 连接池接近耗尽 | 检查慢查询 `db.system.profile.find().sort({ts:-1})` |
| `mongosh` 连接超时 | MongoDB 进程未运行或端口被占用 | `brew services list \| grep mongo`；`lsof -i :27017` |
| `WriteError: not master` | 连接到 Secondary 节点（副本集） | 检查连接串是否指向 Primary |

### Ollama

| 错误/现象 | 含义 | 立即检查 |
|---|---|---|
| `curl localhost:11434/api/tags` 无响应 | Ollama 进程未运行 | `ps aux \| grep ollama`；重启 `ollama serve &` |
| 模型响应极慢（> 30s） | 模型在 CPU 而非 GPU 上运行 | `ollama ps` 检查 GPU 层数；`nvidia-smi` 检查 GPU 是否被识别 |
| `model not found` | 模型未拉取或名称拼写错误 | `ollama list`；确认模型名与 config.yaml 一致 |

## 用户报障速判

用户说... | 最可能的原因 | 首先检查
---|---|---
"页面打不开/白屏" | YiVad 前端未运行或构建失败 | `curl -o /dev/null -w '%{http_code}' localhost:8848`
"登录后跳回登录页" | Token 过期（401） | 浏览器 Console → Network → 401 响应
"数据表格是空的" | RPC 参数名错误（filter≠query）或 YiAi 不可达 | `curl -X POST localhost:10086/ ...` 验证 RPC
"菜单加载不出来" | YiAi 菜单 API 不可达 | `curl localhost:10086/health/observer`
"聊天没反应" | YiAi API 不可达或 Ollama 不可用 | `curl localhost:10086/health/observer` → 检查 ollama 字段
"聊天回了一半停了" | Nginx SSE 缓冲未关闭或超时 | `proxy_buffering off; proxy_read_timeout 600s`
"AI 说找不到相关知识" | RAG 索引为空或过时 | `curl localhost:10086/rag-status`
"Chrome 扩展用不了" | 扩展构建失败或 API 不可达 | `chrome://extensions` → 查看错误
"之前能用的功能突然不行了" | 最近有变更——先查变更日志 | `git log --oneline -10`

## 关键文档速查

| 我需要... | 去这里 |
|---|---|
| 完整事件响应流程 | [事件响应流程](./incident-response/04-事件-响应事件.md) |
| 详细故障处理步骤 | [Runbook 模板](./incident-response/09-事件-Runbook模板.md) |
| 如何主持作战室 | [作战室运作](./incident-response/05-事件-作战室运作.md) |
| 如何写事后复盘 | [事后复盘指南](./incident-response/07-事件-事后复盘指南.md) |
| 如何主持复盘会议 | [复盘会议主持](./incident-response/13-事件-复盘会议主持.md) |
| 如何对外沟通事件 | [事件沟通模板](./incident-response/10-事件-事件沟通模板.md) |
| 如何发布变更 | [发布流程](./release/04-发布-发布流程.md) |
| 如何做热修复 | [热修复发布](./release/02-发布-热修复发布.md) |
| 灾难恢复完整流程 | [灾难恢复计划](./incident-response/11-事件-灾难恢复计划.md) |
| 新人该从哪里开始 | [新人入职指南](./ONBOARDING.md) |
| 备份恢复数据库 | [数据库备份恢复](./observability/11-可观测-数据库备份恢复.md) |
| 生产就绪上线审查 | [生产就绪审查](./release/07-发布-生产就绪审查.md) |
| 季度可靠性回顾 | [季度回顾指南](./QUARTERLY-REVIEW.md) |