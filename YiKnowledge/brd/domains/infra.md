---
title: IT Infrastructure Domain
tags: [brd, domain, infra, ITSM, devops]
category: brd/domains
created: 2026-08-01
type: domain-knowledge
status: active
---

# IT Infrastructure Domain

> IT 基础设施领域知识 — 涵盖服务台、事件管理、变更管理、资产管理、监控告警等核心场景。

---

## 1. 领域概述

IT Infrastructure 域支撑所有业务系统的稳定运行。在跨国企业环境中，基础设施涉及混合云（私有云+公有云）、全球广域网（SD-WAN）、身份与访问管理（IAM）、终端管理（MDM/UEM）等。

### 典型业务子域

| 子域 | 描述 | 典型系统 |
|------|------|---------|
| IT 服务管理 (ITSM) | 事件 → 问题 → 变更 → 发布管理 (ITIL) | ServiceNow, BMC Remedy, Jira Service Management |
| 云基础设施 | IaaS/PaaS 资源管理、成本优化、安全合规 | AWS, Azure, GCP + Terraform/ Pulumi |
| 监控与可观测性 | 指标 + 日志 + 追踪 + 告警 | Datadog, Grafana, Prometheus, ELK |
| 身份与访问管理 (IAM) | 用户生命周期、SSO、MFA、权限管理 | Azure AD, Okta, SailPoint |
| 终端管理 | 设备注册、策略推送、软件分发、安全基线 | Intune, Jamf, Workspace ONE |
| 网络管理 | SD-WAN、DNS、DHCP、负载均衡、防火墙 | Cisco, Palo Alto, Cloudflare |

---

## 2. 关键指标体系 (KPI)

| KPI | 行业基准 | 优秀目标 |
|-----|---------|---------|
| 事件平均解决时间 (MTTR) | 24–72 小时 | < 8 小时 |
| 首次解决率 (FSR) | 60–75% | > 85% |
| 变更成功率 | 85–95% | > 98% |
| 系统可用率 | 99.5–99.9% | > 99.99% |
| 补丁部署及时率 | 70–90% | > 98% (关键补丁 < 48h) |
| 云资源利用率 | 30–60% | > 70% |
| 平均检测时间 (MTTD) | 1–4 小时 | < 15 分钟 |

---

## 3. 常见痛点

| 痛点 | 量化影响 | 改进方向 |
|------|---------|---------|
| 告警风暴 | 每天 500–2,000 条告警，真问题淹没 | 告警收敛 + AI 降噪 + 关联分析 |
| 变更窗口受限 | 业务需求等待 2–4 周才能上线 | CI/CD + 蓝绿部署 + 特性开关 |
| 资产台账不准 | 20–30% 资产记录与实际不符 | 自动发现 + CMDB 审计 |
| 权限膨胀 | 离职/转岗后遗留权限，安全风险 | JML (Joiner-Mover-Leaver) 自动化 |
| 云成本失控 | 月账单波动 20–40% 难以解释 | FinOps + 成本标签 + 预算告警 |

---

## 4. 典型用户角色

| 角色 | 使用频率 | 关键需求 | 影响级别 |
|------|---------|---------|---------|
| 服务台坐席 (L1) | 每日 | 工单处理、知识库、用户沟通 | End User |
| 系统管理员 (L2/L3) | 每日 | 事件排查、变更执行、监控响应 | End User |
| IT 运维经理 | 每日/每周 | 团队排班、SLA 仪表盘、重大问题管理 | Decision Maker |
| 基础设施架构师 | 每周/每月 | 容量规划、技术选型、架构评审 | Key Influencer |
| CTO / IT 总监 | 每月/每季 | 基础设施 TCO、可靠性报告、技术战略 | Decision Maker |

---

## 5. 领域术语

| 术语 (EN) | 术语 (ZH) | 定义 |
|-----------|-----------|------|
| ITSM (IT Service Management) | IT 服务管理 | ITIL 框架下的 IT 服务交付与支持的实践 |
| CMDB (Configuration Management Database) | 配置管理数据库 | IT 环境中所有配置项 (CI) 及其关系的存储库 |
| MTTR (Mean Time to Resolve) | 平均恢复时间 | 从故障发生到服务恢复的平均耗时 |
| MTBF (Mean Time Between Failures) | 平均无故障时间 | 两次故障之间的平均运行时间 |
| SRE (Site Reliability Engineering) | 站点可靠性工程 | Google 首创的通过软件工程提升可靠性的实践 |
| IaC (Infrastructure as Code) | 基础设施即代码 | 用代码定义和管理基础设施的实践 |
| FinOps | 云财务运营 | 云成本的财务管理和优化的跨职能实践 |
| RPO / RTO | 恢复点目标/恢复时间目标 | 灾难恢复中可接受的数据丢失和时间中断上限 |
| Zero Trust | 零信任 | 默认不信任任何设备/用户的网络安全模型 |
| Change Advisory Board (CAB) | 变更顾问委员会 | 审批重大 IT 变更的跨职能决策小组 |
