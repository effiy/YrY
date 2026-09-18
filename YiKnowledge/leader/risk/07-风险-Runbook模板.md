---
title: "Runbook Template — Operational Procedures for Common Scenarios"
aliases: [runbook, playbook, operational-procedure, ops-guide]
tags: [leader, risk, runbook, operations, incident]
category: leader/risk
created: 2026-09-15
updated: 2026-09-15
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, srer, engineer]
benefit: "技术负责人通过标准化的操作手册确保常见运维操作可重复、可审查、可由非原作者执行"
acceptance_criteria:
  - "包含 runbook 编写规范和模板"
  - "包含 YrY 关键场景的 runbook 示例"
  - "区分自动化和手动操作"
related:
  - ./05-风险-事故指挥指南.md
  - ./02-风险-事后复盘.md
  - ../../srer/incident-response/
---

# Runbook 模板 — 常见运维操作手册

> Runbook 回答一个问题：**凌晨 3 点，不是你值班的人，能根据这个文档处理问题吗？**

## Runbook 编写原则

1. **写给睡眠不足的人** — 凌晨 3 点的值班工程师认知能力下降。步骤必须逐行可执行，不能有任何隐含知识
2. **先判断，再行动** — 每一步都是"检查 X → 如果 Y，则 Z"。没有需要人判断的模糊步骤
3. **包含"什么时候该升级"** — 明确说明什么情况下操作者应该停止并呼叫支援
4. **每一步有预期结果** — 执行者知道"正常情况"下这一步应该看到什么
5. **记录最后更新时间** — 过时的 runbook 比没有 runbook 更危险

## Runbook 模板

```markdown
# Runbook: [操作名称]

**适用场景**：[什么情况下执行此 runbook]
**预计执行时间**：[正常情况下的耗时]
**所需权限**：[执行此操作需要的系统和访问权限]
**最后更新**：YYYY-MM-DD
**最后验证**：YYYY-MM-DD（上次实际执行并验证此 runbook 仍有效）

## 触发条件

[如何判断需要执行此 runbook——监控告警、用户报告、日志特征]

## 前置检查

- [ ] 检查项 1：[预期结果]
- [ ] 检查项 2：[预期结果]

## 执行步骤

### 步骤 1：[步骤名称]

**操作**：
```bash
[逐行可执行的命令]
```

**预期结果**：[正常情况下的输出]
**如果异常**：[异常时的分支操作或升级条件]

### 步骤 2：...

## 验证

- [ ] 验证项 1：[如何确认操作成功]
- [ ] 验证项 2：

## 回滚

[如果操作失败，如何回滚到操作前状态]
**回滚预计时间**：[分钟]

## 升级条件

满足以下任一条件时停止执行并升级：
- [条件 1]
- [条件 2]
**升级联系人**：[姓名 + 联系方式]
```

## YrY Runbook 示例

### Runbook: 重启 YiAi 服务

**适用场景**：YiAi 响应异常、内存泄漏、或配置变更后需重启
**预计执行时间**：2 分钟
**所需权限**：服务器 SSH 访问
**最后更新**：2026-09-15

#### 触发条件
- YiAi 健康检查连续 3 次失败
- 内存使用 > 80% 且持续增长
- 配置变更后需要加载新配置

#### 前置检查
- [ ] 确认 MongoDB 正在运行：`pgrep mongod` 有输出
- [ ] 确认 Ollama 正在运行：`curl -s http://localhost:11434/api/tags` 返回模型列表
- [ ] 确认端口 10086 被 YiAi 占用：`lsof -i :10086`

#### 执行步骤

**步骤 1：找到 YiAi 进程**
```bash
ps aux | grep "python main.py" | grep -v grep
```
**预期结果**：一行 Python 进程信息
**如果异常**：进程不存在→ YiAi 未运行，转步骤 3 直接启动

**步骤 2：优雅关闭**
```bash
kill -TERM <PID>
# 等待最多 10 秒
sleep 10
# 确认已关闭
ps aux | grep "python main.py" | grep -v grep
```
**预期结果**：进程已不存在
**如果异常**：进程仍在运行→ `kill -9 <PID>`（强制关闭，可能丢失正在处理的请求）

**步骤 3：启动**
```bash
cd /path/to/YiAi
nohup python main.py > /tmp/yiai.log 2>&1 &
```
**预期结果**：进程在后台启动

**步骤 4：验证启动成功**
```bash
sleep 5
curl -s http://localhost:10086 | head -20
```
**预期结果**：返回 JSON 响应
**如果异常**：检查 `/tmp/yiai.log` 错误信息

#### 验证
- [ ] `curl http://localhost:10086` 返回正常响应
- [ ] 聊天功能可用：发送"ping"，收到回复
- [ ] 错误率在基线范围内（< 1%）

#### 升级条件
- 重启 2 次后问题未解决→ 升级到技术负责人
- MongoDB 或 Ollama 不可用→ 先恢复依赖服务，再重启 YiAi

---

### Runbook: Ollama 模型不响应

**适用场景**：聊天请求超时，Ollama 返回错误或无响应
**预计执行时间**：5 分钟
**最后更新**：2026-09-15

#### 触发条件
- 聊天返回 AI 服务不可用错误 (code: 2001)
- `ollama list` 超时或报错

#### 前置检查
- [ ] `pgrep ollama` 有输出—确认进程在运行
- [ ] GPU/内存可用：检查是否有其他进程占用大量 VRAM

#### 执行步骤

**步骤 1：检查 Ollama 是否响应**
```bash
curl -s http://localhost:11434/api/tags
```
**预期结果**：返回已安装模型列表的 JSON
**如果异常**：连接超时或拒绝→ Ollama 已挂起或崩溃

**步骤 2：检查模型是否已加载**
```bash
ollama list
```
**预期结果**：显示已拉取的模型（qwen2.5 等）
**如果异常**：空列表或报错→ 需要拉取模型

**步骤 3：重启 Ollama**
```bash
pkill ollama
sleep 3
ollama serve > /tmp/ollama.log 2>&1 &
sleep 5
# 预热模型（加载到 VRAM）
ollama run qwen2.5 "ping" --quiet
```

**步骤 4：验证恢复**
```bash
ollama run qwen2.5 "hello" --quiet
```
**预期结果**：返回正常的文本回复
**如果异常**：检查 GPU VRAM 是否充足

#### 升级条件
- 重启后仍然无响应 → 切换到云 API fallback（多提供商路由已配置）
- GPU 硬件问题 → 仅使用云 API，安排硬件排查

---

### Runbook: MongoDB 连接池耗尽

**适用场景**：数据库操作报错 `connection pool exhausted`
**预计执行时间**：5 分钟
**最后更新**：2026-09-15

#### 触发条件
- 日志中出现 `connection pool exhausted` 或 `timed out`
- API 返回数据库错误 (code: 5001)

#### 执行步骤

**步骤 1：检查当前连接数**
```bash
mongosh --eval "db.serverStatus().connections"
```
**预期结果**：`current < available`

**步骤 2：识别连接泄漏源**
```bash
mongosh --eval "db.currentOp().inprog" | grep -c "active"
```
**预期结果**：长时间运行的查询数少（< 5）

**步骤 3：终止异常连接**
```bash
mongosh --eval 'db.currentOp().inprog.forEach(function(op) {
  if (op.secs_running > 30) db.killOp(op.opid)
})'
```

**步骤 4：临时扩大连接池**
```yaml
# config.yaml
mongodb:
  maxPoolSize: 150  # 临时从 100 增大
```
重启 YiAi 后生效。

#### 验证
- [ ] 错误日志中不再出现 `pool exhausted`
- [ ] API 响应正常

#### 升级条件
- 连接池耗尽反复发生→ 检查是否有连接泄漏（代码中未关闭的 Motor client）
- 需要永久增大连接池→ 分析原因，写 ADR

## Runbook 维护规则

| 规则 | 说明 |
|---|---|
| 每次事故后更新相关 runbook | 如果事故处理中发现了 runbook 没有覆盖的步骤，补充进去 |
| 每季度演练一个 runbook | 确认步骤仍然有效——依赖服务可能已经变化 |
| runbook 作者 ≠ 唯一执行者 | 至少让另一个人根据 runbook 执行过一次 |
| 过时标记 | 超过 6 个月未验证的 runbook 标记为"待验证" |

## 反模式

| 反模式 | 失败原因 | 正确做法 |
|---|---|---|
| "步骤省略，你应该知道" | 凌晨 3 点值班的人不知道 | 逐步、逐命令——零隐含知识 |
| 只写正常路径 | 唯一的操作路径包含了错误情况——执行者不知道出问题时怎么办 | 每步有"如果异常"分支 |
| 从不演练 | Runbook 步骤引用了已下线的服务——执行时卡住 | 每季度演练一个 |
| runbook 只有一个人能写 | 只有原作者理解——其他人依赖口头传授 | 让新人根据 runbook 操作，卡住的地方就是要修改的地方 |