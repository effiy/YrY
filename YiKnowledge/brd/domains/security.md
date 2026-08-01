---
title: Security & Compliance Domain
tags: [brd, domain, security, compliance, infosec]
category: brd/domains
created: 2026-08-01
type: domain-knowledge
status: active
---

# Security / Compliance Domain

> 信息安全与合规领域知识 — 涵盖访问控制、审计日志、漏洞管理、安全运营 (SOC)、合规策略执行等核心场景。

---

## 1. 领域概述

Security 域保护企业信息资产的机密性 (Confidentiality)、完整性 (Integrity) 和可用性 (Availability)。在跨国环境中，安全体系需同时满足 GDPR（欧洲）、CCPA（加州）、CSL（中国）等多法域要求。

### 典型业务子域

| 子域 | 描述 | 典型系统 |
|------|------|---------|
| 身份与访问管理 (IAM) | 认证 (SSO/MFA) + 授权 (RBAC/ABAC) + 生命周期 | Okta, Azure AD, SailPoint, Ping Identity |
| 安全运营 (SOC) | 日志采集 → SIEM 关联 → SOAR 编排 → 事件响应 | Splunk, Sentinel, CrowdStrike, Palo Alto XSOAR |
| 漏洞管理 | 资产扫描 → 漏洞评级 → 修复追踪 → 验证 | Qualys, Tenable, Rapid7 |
| 数据安全 | 加密/脱敏/分级/DLP | Vormetric, Forcepoint, Microsoft Purview |
| 应用安全 | SAST/DAST 扫描、渗透测试、SBOM 管理 | Snyk, Veracode, Burp Suite, OWASP ZAP |
| 合规自动化 | 控制框架映射 → 证据收集 → 审计报告 | Vanta, Drata, AuditBoard |
| 第三方风险管理 | 供应商安全评估、合同审查、持续监控 | OneTrust, ProcessUnity, BitSight |

---

## 2. 关键指标体系 (KPI)

| KPI | 行业基准 | 优秀目标 |
|-----|---------|---------|
| 漏洞修复时间 (MTTR) | 30–90 天 (非关键) | < 7 天 (关键), < 30 天 (非关键) |
| 安全事件检测时间 (MTTD) | 数小时至数天 | < 15 分钟 |
| 事件响应时间 | 1–4 小时 | < 30 分钟 |
| 访问评审完成率 | 60–85% | 100% (季度评审) |
| 补丁合规率 | 80–95% | > 98% |
| 钓鱼测试点击率 | 15–30% | < 5% |
| 审计发现的整改完成率 | 50–80% | > 90% |

---

## 3. 常见痛点

| 痛点 | 量化影响 | 改进方向 |
|------|---------|---------|
| 告警过多 | SOC 每天 5,000–50,000 条告警，真阳性 < 1% | SIEM 调优 + AI 降噪 |
| 权限累积 | 员工平均拥有比职责任务多 2–3× 的权限 | JML 自动化 + 季度访问评审 |
| 漏洞过载 | 扫描发现数千漏洞，团队无力修复 | 基于风险的优先级排序 + 自动修复 |
| 合规证据手工收集 | 每次审计花费 100–300 人时 | 持续合规监控 + 自动证据映射 |
| 安全意识不足 | 员工仍是最大的安全漏洞（钓鱼、弱密码） | 持续培训 + 模拟测试 |

---

## 4. 典型用户角色

| 角色 | 使用频率 | 关键需求 | 影响级别 |
|------|---------|---------|---------|
| 安全分析师 (L1) | 每日 | 告警分类、初步调查、升级 | End User |
| 安全工程师 | 每日 | 工具管理、规则编写、自动化 | End User |
| IR (事件响应) 负责人 | 按需 | 事件指挥、取证、沟通 | Decision Maker |
| CISO / 安全总监 | 每周/每月 | 风险仪表盘、合规报告、预算管理 | Decision Maker |
| 合规经理 | 每周/每月 | 控制映射、证据收集、审计协调 | Key Influencer |
| 渗透测试工程师 | 按需/每季 | 漏洞发现、利用验证、报告 | Key Influencer |

---

## 5. 领域术语

| 术语 (EN) | 术语 (ZH) | 定义 |
|-----------|-----------|------|
| CIA Triad | CIA 三元组 | 机密性、完整性、可用性的信息安全核心原则 |
| SIEM (Security Information & Event Management) | 安全信息与事件管理 | 集中化日志收集和关联分析平台 |
| SOAR (Security Orchestration, Automation & Response) | 安全编排自动化与响应 | 自动化安全操作流程和事件响应的工具 |
| RBAC (Role-Based Access Control) | 基于角色的访问控制 | 按组织角色分配权限的模型 |
| SoD (Segregation of Duties) | 职责分离 | 确保单一人员无法同时执行冲突操作的控制 |
| SAST / DAST | 静态/动态应用安全测试 | 分别在源代码和运行时环境中检测安全漏洞 |
| Zero-Day | 零日漏洞 | 厂商尚未发布补丁的已知漏洞 |
| CVE (Common Vulnerabilities and Exposures) | 通用漏洞与暴露 | 公开披露的网络安全漏洞条目 |
| CVSS (Common Vulnerability Scoring System) | 通用漏洞评分系统 | 0.0–10.0 分，衡量漏洞严重程度 |
| DLP (Data Loss Prevention) | 数据丢失防护 | 检测和阻止敏感数据外泄的技术 |
| SSO / MFA | 单点登录 / 多因素认证 | 一次认证访问多系统 / 多因素验证身份 |
| Zero Trust Architecture | 零信任架构 | 默认不信任任何实体，持续验证的架构 |
