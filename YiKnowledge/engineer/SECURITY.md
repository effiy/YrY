---
title: Security Domain Index
aliases: [security-index, appsec, supply-chain-security, risk-management]
tags: [domain-index, security, supply-chain, appsec, risk, incident-response, compliance, auth]
category: root
created: 2026-08-06
updated: 2026-09-18
last_verified: 2026-09-18
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader, srer, executiver, aier]
benefit: "All security-relevant content — supply chain, application security, risk management, incident response, compliance, and AI safety — reachable from a single cross-role index"
acceptance_criteria:
  - "Aggregates security content from engineer/, leader/, srer/, aier/, executiver/"
  - "Organized by 6 subdomains with verified file paths"
  - "Each entry describes what the reader will find"
  - "Covers both preventive (shift-left) and reactive (incident response) security"
related:
  - ./INDEX.md
  - ./README.md
  - ./ENGINEERING.md
  - ../curator/COLLABORATION.md
  - ../leader/risk/README.md
  - ../srer/incident-response/README.md
---

# 安全领域聚合索引

> 跨角色聚合供应链安全、应用安全、风险管理、事件响应、合规治理及 AI 安全类内容。不重复存储内容——通过 frontmatter `roles:` 和交叉引用聚合所有角色目录中的安全相关内容。

## 主题导航

| 主题 | 说明 | 核心角色 |
|------|------|----------|
| [供应链安全](#供应链安全) | 依赖审计、锁文件完整性、构建可重现性 | engineer |
| [应用安全](#应用安全) | 代码质量、认证授权、数据保护、安全加固 | engineer, leader |
| [风险管理](#风险管理) | 风险登记册、上线评估、依赖风险、安全审查 | leader |
| [事件响应](#事件响应) | 检测→定级→缓解→复盘 全流程 | srer |
| [合规与治理](#合规与治理) | 监管合规、数据留存、安全策略 | executiver, leader |
| [AI 安全](#ai-安全) | 提示词注入、模型安全、数据隐私、AI 防护 | aier, engineer |

---

## 供应链安全

| 资源 | 位置 | 描述 |
|------|------|------|
| 供应链加固指南 | [ship/02-交付-加固供应链.md](./ship/02-交付-加固供应链.md) | Python（pip-audit）+ Node.js（npm audit）依赖审计，锁文件完整性验证，构建可重现性 |
| 依赖审计清单 | [../leader/capacity/03-容量-依赖审计清单.md](../leader/capacity/03-容量-依赖审计清单.md) | 季度依赖健康度审计：许可证合规、维护活跃度、安全公告 |
| 季度技术债审查 | [ship/04-交付-季度技术债.md](./ship/04-交付-季度技术债.md) | 安全相关技术债跟踪与优先级决策 |

### YrY 供应链安全实践

| 项目 | 审计工具 | 锁文件 | 关键实践 |
|------|----------|--------|----------|
| YiAi (Python) | `pip-audit`, `pip check` | `requirements.txt` (精确版本+哈希) | 虚拟环境隔离，最小依赖原则 |
| YiVad (Node.js) | `npm audit`, `pnpm audit` | `pnpm-lock.yaml` | `npm ci` 保证构建可重现 |
| YiPet (Node.js) | `npm audit` | `package-lock.json` | Chrome Web Store 合规审查 |

**通用原则：** 每个依赖必须证明自身价值——能否在 50 行内自行实现？维护是否活跃？传递依赖有多少？每季度执行一次完整审计。

---

## 应用安全

| 资源 | 位置 | 描述 |
|------|------|------|
| 代码审查标准 | [../leader/architecture/10-架构-代码审查标准.md](../leader/architecture/10-架构-代码审查标准.md) | 各项目的代码审查检查清单，含安全审查要点 |
| API 设计模式 | [build/05-构建-API设计模式.md](./build/05-构建-API设计模式.md) | 输入校验、参数化查询、错误信息脱敏 |
| 环境变量配置 | [build/08-构建-环境变量配置.md](./build/08-构建-环境变量配置.md) | 密钥管理、配置分离、`.env` 文件安全 |
| 部署指南 | [ship/08-交付-部署指南.md](./ship/08-交付-部署指南.md) | 生产环境安全配置：CORS、HTTPS、最小权限 |

### YrY 认证与授权架构

| 层级 | 机制 | 配置 |
|------|------|------|
| 传输层 | CORS 中间件 | 开发环境 `origins: ["*"]`，生产环境应限定具体域名 |
| 认证层 | JWT + bcrypt (X-Token header) | `middleware.auth_enabled` 控制开关（默认关闭） |
| 授权层 | `v-auth` 指令 (YiVad) | 按钮级权限控制，权限树来自后端菜单 API |
| 审计层 | Observer 中间件 | 可选：限流、采样、沙箱保护 |

### 常见应用安全反模式

| 反模式 | 风险 | 修复 |
|--------|------|------|
| 硬编码密钥在代码中 | 密钥泄露到版本控制 | 使用 `.env` + `.gitignore`，生产环境用环境变量注入 |
| 错误信息暴露内部实现 | 信息泄露辅助攻击者 | 统一错误码体系，生产环境不返回堆栈信息 |
| 缺少输入校验 | SQL 注入、XSS | FastAPI Pydantic 模型校验 + 前端双重校验 |
| CORS 配置 `*` 上生产 | 跨域请求伪造 | 生产环境配置精确的允许域名列表 |

---

## 风险管理

| 资源 | 位置 | 描述 |
|------|------|------|
| 安全审查清单 | [../leader/risk/06-风险-安全审查清单.md](../leader/risk/06-风险-安全审查清单.md) | 上线前/季度安全检查 15 项：认证、授权、数据保护、网络安全 |
| 上线风险评估 | [../leader/risk/01-风险-上线风险评估.md](../leader/risk/01-风险-上线风险评估.md) | Go/No-Go 决策框架，风险矩阵评估 |
| 风险登记册模板 | [../leader/risk/03-风险-风险登记册模板.md](../leader/risk/03-风险-风险登记册模板.md) | 风险持续追踪：概率×影响矩阵，缓解措施追踪 |
| 依赖风险管理 | [../leader/risk/04-风险-依赖风险管理.md](../leader/risk/04-风险-依赖风险管理.md) | 依赖风险识别、评估和缓解策略 |
| 事故指挥指南 | [../leader/risk/05-风险-事故指挥指南.md](../leader/risk/05-风险-事故指挥指南.md) | 事故中技术负责人的 IC 角色和决策框架 |

### 风险等级定义

| 等级 | 描述 | 响应时间 | 示例 |
|------|------|----------|------|
| P0 紧急 | 用户数据泄露、系统完全不可用 | 15 分钟内响应 | MongoDB 被公网暴露 |
| P1 严重 | 核心功能受损、安全机制绕过 | 1 小时内响应 | 认证中间件被绕过 |
| P2 一般 | 非核心功能异常、低风险漏洞 | 24 小时内响应 | 依赖库低危 CVE |
| P3 轻微 |  cosmetic 问题、理论风险 | 下个迭代修复 | 安全 header 缺失 |

---

## 事件响应

| 资源 | 位置 | 描述 |
|------|------|------|
| 事件响应流程 | [../srer/incident-response/04-事件-响应事件.md](../srer/incident-response/04-事件-响应事件.md) | 4 阶段响应：发现→定级→缓解→学习 |
| 处理数据泄露 | [../srer/incident-response/01-事件-处理数据泄露.md](../srer/incident-response/01-事件-处理数据泄露.md) | 数据泄露专项响应流程：隔离→评估→通知→修复 |
| 作战室运作 | [../srer/incident-response/05-事件-作战室运作.md](../srer/incident-response/05-事件-作战室运作.md) | War room 角色分配、沟通节奏、决策升级 |
| 事后复盘指南 | [../srer/incident-response/07-事件-事后复盘指南.md](../srer/incident-response/07-事件-事后复盘指南.md) | 无指责事后复盘：时间线→根因→行动项 |
| 事件沟通模板 | [../srer/incident-response/10-事件-事件沟通模板.md](../srer/incident-response/10-事件-事件沟通模板.md) | 对内/对外/客户沟通模板和时机 |
| 灾难恢复计划 | [../srer/incident-response/11-事件-灾难恢复计划.md](../srer/incident-response/11-事件-灾难恢复计划.md) | 恢复优先级、RPO/RTO 定义、演练计划 |
| Runbook 模板 | [../srer/incident-response/09-事件-Runbook模板.md](../srer/incident-response/09-事件-Runbook模板.md) | 可执行的操作手册模板 |
| FMEA 模板 | [../srer/incident-response/16-事件-FMEA模板.md](../srer/incident-response/16-事件-FMEA模板.md) | 故障模式与影响分析 |
| Game Day 演练 | [../srer/incident-response/08-事件-GameDay演练.md](../srer/incident-response/08-事件-GameDay演练.md) | 混沌工程演练设计与执行 |

---

## 合规与治理

| 资源 | 位置 | 描述 |
|------|------|------|
| 处理监管变更 | [../executiver/strategy/04-战略-处理监管变更.md](../executiver/strategy/04-战略-处理监管变更.md) | 监管新规的影响评估和适应计划 |
| 数据合规处理 | [../executiver/strategy/05-战略-数据合规处理.md](../executiver/strategy/05-战略-数据合规处理.md) | 数据分类、跨境传输、用户同意管理 |
| 数据留存审查 | [../executiver/strategy/03-战略-数据留存审查.md](../executiver/strategy/03-战略-数据留存审查.md) | 数据生命周期管理、留存策略审查 |
| 数据保留策略 | [../srer/observability/11-可观测-数据库备份恢复.md](../srer/observability/11-可观测-数据库备份恢复.md) | 备份策略、恢复验证、保留期限 |

### 合规检查清单

- [ ] 用户数据是否分类（公开/内部/敏感/机密）？
- [ ] 敏感数据是否加密存储（at rest + in transit）？
- [ ] 数据保留策略是否符合监管要求？
- [ ] 数据删除请求是否有可执行的流程？
- [ ] 第三方服务（Ollama/DeepSeek API）是否传输用户数据？
- [ ] 访问日志是否保留且不可篡改？

---

## AI 安全

| 资源 | 位置 | 描述 |
|------|------|------|
| AI 安全与防护 | [../aier/foundations/03-基础-AI安全与防护.md](../aier/foundations/03-基础-AI安全与防护.md) | 提示词注入、越狱攻击、数据投毒、模型盗取——攻击向量与防护 |
| LLM 基础 | [../aier/foundations/01-基础-LLM基础.md](../aier/foundations/01-基础-LLM基础.md) | Token 消耗与隐私、本地 vs 云端的数据安全权衡 |
| Agent 架构模式 | [../aier/methods/01-方法-Agent架构模式.md](../aier/methods/01-方法-Agent架构模式.md) | 工具调用确认门控（requires_confirmation），防止自主执行危险操作 |

### AI 安全威胁矩阵

| 威胁类型 | 攻击向量 | YiAi 防护措施 |
|----------|----------|--------------|
| 提示词注入 | 用户输入中包含指令覆盖 | System prompt 隔离，输入消毒 |
| 越狱攻击 | 角色扮演绕过安全限制 | 输出内容审核（规划中） |
| 数据泄露 | LLM 记忆训练数据中的敏感信息 | 本地部署 Ollama，数据不外传 |
| 工具滥用 | Agent 自主调用危险工具 | `requires_confirmation=True` 门控，写操作需用户确认 |
| 拒绝服务 | 超长输入耗尽上下文窗口 | Token 限制（num_ctx），超时保护（600s） |
| 模型盗取 | 通过大量查询提取模型知识 | 速率限制（规划中） |

---

## YrY 安全降级策略

YiAi 提供多层安全能力，开发和生产的默认行为不同：

| 安全机制 | 开发环境 | 生产建议 |
|----------|----------|----------|
| 认证中间件 | `auth_enabled: false`（全开放） | `auth_enabled: true`，JWT + bcrypt |
| CORS | `origins: ["*"]` | 限定具体域名列表 |
| Observer 中间件 | 默认关闭 | 开启限流和采样 |
| Token 过期 | 24 小时（默认） | 按安全需求调整（建议 1-4 小时 + refresh token） |
| Ollama 网络绑定 | `localhost:11434`（仅本机） | 保持本机绑定，不暴露到公网 |
| MongoDB 网络绑定 | `localhost:27017`（仅本机） | 保持本机绑定，启用认证 |

---

## 按角色快速查找

| 角色 | 最相关的安全资源 |
|------|-----------------|
| engineer | 供应链加固、代码审查标准、API 设计模式、部署指南 |
| leader | 安全审查清单、上线风险评估、风险登记册、依赖风险管理 |
| srer | 事件响应流程、数据泄露处理、灾难恢复、Game Day 演练 |
| aier | AI 安全与防护、提示词注入防御、工具调用门控 |
| executiver | 监管合规、数据留存、安全策略制定 |

## 维护说明

- 新增安全相关文件时，在此索引中添加条目
- 每季度验证所有链接有效性和内容准确性
- 安全事件后 1 周内更新相关 Runbook 和风险登记册
- 不在此文件中直接写安全内容——始终链接到角色目录中的源文件