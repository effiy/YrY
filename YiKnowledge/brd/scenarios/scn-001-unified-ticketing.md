---
title: "SCN-001: Unified After-Sales Ticketing Platform"
tags: [brd, scenario, after-sales, ticketing, multi-market]
category: brd/scenarios
created: 2026-08-01
type: scenario-pattern
status: active
---

# SCN-001: Unified After-Sales Ticketing Platform

> 统一售后工单管理平台 — 跨市场、多品牌、智能路由的企业级工单系统。

---

## 场景概述

### 行业背景

汽车售后服务的复杂度随着品牌数量、市场覆盖、技术复杂度（电动化、智能网联）的同步增长急剧上升。传统的以电话和邮件为主的被动式客服模式已无法满足客户对即时响应、全程透明的期望。

### 市场数据

| 指标 | 数值 |
|------|------|
| 市场覆盖 | 5 个欧盟市场 (DE, FR, IT, ES, NL) |
| 月均工单量 | ~15,000 张 |
| 服务品牌 | 2–3 个品牌 |
| 产品线 | 乘用车 + 轻型商用车 (LCV) |
| 经销商数量 | ~800 家 (含授权经销商 + 独立维修商) |
| 客户触点 | 电话、邮件、Web 表单、经销商前台、App 自助 |

### 业务驱动力

1. **客户满意度下滑**：NPS 连续 3 个季度下降 (-12 vs 基准)
2. **竞争压力**：竞品品牌已实现 < 2h 响应和 85%+ 首次解决率
3. **成本压力**：人工流程的年成本估算 €1.2M
4. **合规风险**：GDPR + EU Data Act 对客户数据处理和车联网数据共享的要求
5. **系统 EOL**：德国市场当前使用的 Zendesk 版本将于 2027 年停止支持

---

## As-Is 现状分析

### 当前流程

| 步骤 | 角色 | 动作 | 耗时 | 工具 |
|:----:|------|------|:----:|------|
| 1 | 客户 | 通过电话/邮件/经销商报告问题 | 5–15 min | 电话、邮件 |
| 2 | Tier-1 客服 | 创建工单、记录客户信息 | 3–5 min | Zendesk (DE/FR) / 邮件 (IT/ES/NL) |
| 3 | Tier-1 客服 | 搜索知识库、尝试解决 | 5–10 min | Zendesk KB + 自建 Wiki |
| 4 | Tier-1 → Tier-2 | 无法解决则升级，手工填写升级描述 | 2–3 min | Zendesk + 邮件通知 |
| 5 | Tier-2 专家 | 查看工单，登录 SAP 查询配件 | 3–5 min | SAP ECC — 单独窗口 |
| 6 | Tier-2 专家 | 登录 Dealer Portal 查看车辆保修状态 | 2–3 min | Dealer Portal — 单独窗口 |
| 7 | Tier-2 专家 | 手动交叉比对、制定方案 | 10–20 min | 三个系统 + Excel |
| 8 | Tier-2 专家 | 更新工单、通知 Tier-1 (如需跟进) | 2–3 min | Zendesk / 邮件 |
| 9 | 客户 | 等待进展更新 | 不定 | 电话回拨或邮件 |

**端到端耗时**：从客户报修到给出解决方案的平均时间为 **8.3 小时**（有效工作时间约 40–60 min）。

### 关键痛点与量化影响

| 痛点 | 量化影响 |
|------|---------|
| 多系统切换 | 每张工单浪费 4.2 min (窗口切换+数据复制)；数据录入错误率 8% |
| 市场系统不一致 | IT/ES/NL 无系统，纯邮件管理 — 无 SLA 监控、无队列透视 |
| 被动式通知 | 客户平均主动催促 2.3 次/工单 |
| 知识孤岛 | Tier-1 只能解决 48% 的问题，其余必须升级 |
| SLA 监控缺失 | 23% 的工单超 SLA — IT/ES/NL 无法追踪 |

### 当前系统

| 系统 | 覆盖市场 | 用途 |
|------|---------|------|
| Zendesk | DE, FR | 工单管理（已配置定制字段和 SLA） |
| 邮件 (Outlook) | IT, ES, NL | 工单管理（零结构化） |
| SAP ECC | 全部 | 配件目录、库存查询 |
| Dealer Portal | 全部 | 车辆保修状态、经销商信息 |
| 自建 Wiki | 全部 | 知识库（非结构化、搜索差） |
| Excel | 全部 | 个人工单追踪、手动 SLA 计算 |

---

## To-Be 目标状态

### 目标流程

| 步骤 | 角色 | 动作 | 目标耗时 | 工具 |
|:----:|------|------|:--------:|------|
| 1 | 客户 | 多渠道提交（电话/Web/App/经销商）— 自动创建工单 | 2–3 min | UniTicket Portal |
| 2 | 系统 | 自动分类 → VIN 解析 → 填充客户/车辆/保修数据 | < 5 sec | UniTicket Engine |
| 3 | 系统 | 技能路由 → 分派最优坐席 | < 10 sec | UniTicket Router |
| 4 | Agent | 单一视图（工单 + 客户 + 车辆 + 配件 + KB + TSB） | 即时 | UniTicket Workspace |
| 5 | Agent | AI 推荐解决方案 → 一键采纳或自定义 | < 2 min | UniTicket AI |
| 6 | Agent | 自动配件可用性检查 → 一键下单 | < 1 min | SAP API 集成 |
| 7 | Agent | 提交方案、触发客户通知（自动推送+邮件） | < 1 min | UniTicket Notify |
| 8 | 客户 | App/Web 实时追踪工单进展 → CSAT 反馈 | 即时 | UniTicket Customer Portal |

**目标端到端耗时**：< 2 小时（有效工作时间 < 15 min）

### 预期收益

| 收益 | 当前 | 目标 | 量化价值 |
|------|:----:|:----:|---------|
| 平均解决时间 | 8.3 h | < 2 h | €900K/年生产力 |
| SLA 达标率 | 77% | > 95% | 合规 + NPS 提升 |
| Tier-1 解决率 | 48% | > 70% | 释放 Tier-2 专家产能 |
| 数据录入错误 | 8% | < 1% | €120K/年 (错误处理成本) |
| 客户主动催促 | 2.3 次/工单 | < 0.5 次 | NPS +12 |
| 系统切换时间 | 4.2 min/工单 | 0 | €180K/年 |
| 全局工单透明度 | 0% (IT/ES/NL) | 100% | 全面 SLA 管理 |

### 目标技术方案

```
┌─────────────────────────────────────────┐
│            UniTicket Portal             │  ← 客户 + 经销商
│    Web App · Mobile App · Dealer Kiosk  │
└────────────────┬────────────────────────┘
                 │ REST + SSE
┌────────────────▼────────────────────────┐
│           UniTicket Engine              │
│  ┌──────────────────────────────────┐   │
│  │  Ticket Core  │  SLA Engine      │   │
│  │  Auto-Router  │  AI Recommender  │   │
│  │  Notification │  CSAT Survey     │   │
│  └──────────────────────────────────┘   │
└──────┬─────────┬─────────┬──────────────┘
       │REST     │REST     │REST
┌──────▼──┐ ┌────▼──┐ ┌───▼───────────┐
│ SAP ECC │ │ Dealer│ │   SSO (Azure  │
│ Parts + │ │ Portal│ │   AD / Okta) │
│ Stock   │ │Warranty│ └───────────────┘
└─────────┘ └───────┘
```

---

## 关键业务规则

| ID | 规则 | 优先级 |
|:---|------|:------:|
| BR-001 | 工单必须自动关联 VIN 并填充客户/车辆/保修信息 | Must |
| BR-002 | 工单路由基于：技能匹配 > 语言能力 > 负载均衡 | Must |
| BR-003 | Critical 工单（安全相关）15 分钟内必须分配并响应 | Must |
| BR-004 | 客户数据访问权限按市场+角色限制 (GDPR Art. 25) | Must |
| BR-005 | 工单关闭后 24h 自动发送 CSAT 调查 | Should |
| BR-006 | AI 推荐方案必须可追溯 — 记录所用的信号和置信度 | Should |
| BR-007 | 跨市场工单转移需经理审批 | Could |

---

## 集成与依赖

| 系统 | 方向 | 数据 | 协议 | 依赖方 |
|------|:----:|------|------|--------|
| SAP ECC / S/4HANA | In | 配件目录、库存量、价格 | OData | Core Platform Team |
| Dealer Portal | In | 车辆档案、保修状态、经销商信息 | REST API | Dealer Systems Team |
| Azure AD / Okta | In | 用户认证、角色权限 | SAML / OIDC | IT Infra |
| PowerBI | Out | 运营数据、SLA 报告 | ODBC / REST | BI Team |
| SMS / Email Gateway | Out | 实时通知 | REST API | Comms Platform |
| Customer App (YiPet) | Out | 工单状态推送 | REST + SSE | App Team |

---

## 验收标准示例 (BDD)

```
Scenario: Critical ticket auto-routing
  Given a customer report is classified as "Critical" (safety-related)
  And the customer is located in Germany
  When the ticket is submitted
  Then it is automatically assigned to an available German-speaking Tier-2 expert
  And a notification is sent within 30 seconds
  And the SLA countdown starts at 15 minutes

Scenario: Parts availability check
  Given a Tier-2 agent has determined a replacement part is needed
  And the part number is identified via VIN decode
  When the agent clicks "Check Availability"
  Then the system displays stock levels across all relevant PDCs within 2 seconds
  And if stock > 0, the agent can create a parts order with one click
  And if stock = 0, the system suggests the nearest PDC with stock and ETA

Scenario: Customer self-service tracking
  Given a customer has an open ticket
  When they log into the Customer Portal or App
  Then they can see real-time ticket status, assigned agent, and estimated resolution time
  And they can add supplementary information or attachments
  And they receive push notifications when the ticket status changes
```

---

## 风险与缓解

| 风险 | 可能性 | 影响 | 缓解 |
|------|:------:|:----:|------|
| SAP API v2 延迟交付 | Med | High | Fallback batch-file import；合同承诺交付日期；若延迟 > 1 月则调整 Phase 1 范围 |
| AI 推荐准确率不达标 | Med | Med | 先上线人工辅助模式（人复核所有 AI 建议）；beta 期 3 个月评估准确率后决定是否全自动 |
| IT/ES/NL 市场用户抵触变化 | Low | Med | 分阶段推广，先选 2 个试点经销商 per market；收集反馈后全面推广 |
| GDPR 合规 | Low | High | 从设计阶段嵌入 DPIA；DPO 参与架构评审；每季度隐私审计 |
| 数据迁移失败 | Low | High | 先在 DE 市场试点迁移；建立回滚方案；保留 Zendesk 只读 6 个月 |
