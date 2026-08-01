---
title: General BRD & Project Terminology
tags: [brd, terminology, general, project-management]
category: brd/terminology
created: 2026-08-01
type: terminology
status: active
---

# General BRD & Project Management Terminology

> 通用 BRD 编写和项目管理术语表（中英双语），供 `yry-gen-brd` skill 和 YiAi BRD Agent 使用。

---

## BRD 文档术语

| 术语 (EN) | 术语 (ZH) | 定义 |
|-----------|-----------|------|
| BRD (Business Requirements Document) | 业务需求文档 | 定义业务问题和解决方案的高层次需求文件 |
| PRD (Product Requirements Document) | 产品需求文档 | 将 BRD 细化为产品功能和规格的文件 |
| FRD (Functional Requirements Document) | 功能需求文档 | 详细描述系统功能和行为的文件 |
| SRS (Software Requirements Specification) | 软件需求规格说明 | 系统的完整功能和非功能需求描述 |
| RFI (Request for Information) | 信息征询书 | 向供应商征询产品和能力信息的文件 |
| RFP (Request for Proposal) | 建议书征询书 | 邀请供应商提交解决方案提案的文件 |
| MoSCoW | MoSCoW 优先级 | Must / Should / Could / Won't — 需求优先级排序方法 |
| Acceptance Criteria | 验收标准 | 需求被接受前必须满足的条件集合 |
| BDD (Behavior-Driven Development) | 行为驱动开发 | Given/When/Then 格式编写验收标准的实践 |
| Given / When / Then | Given/When/Then 场景 | 描述前置条件、触发动作、预期结果的结构化格式 |

---

## 项目管理术语

| 术语 (EN) | 术语 (ZH) | 定义 |
|-----------|-----------|------|
| Milestone | 里程碑 | 项目中的关键时间节点和决策点 |
| Deliverable | 可交付成果 | 项目产出的有形或无形产品、成果或能力 |
| Go-Live | 上线 | 系统从开发/测试环境切换到生产环境 |
| Hypercare | 上线保障期 | Go-Live 后 2–4 周的增强支持窗口 |
| SIT (System Integration Testing) | 系统集成测试 | 验证多个子系统之间接口和交互的测试 |
| UAT (User Acceptance Testing) | 用户验收测试 | 最终用户在真实场景下验证系统的测试 |
| MVP (Minimum Viable Product) | 最小可行产品 | 具备核心功能、可交付的最小产品版本 |
| POC (Proof of Concept) | 概念验证 | 验证技术方案或思路可行性的小型实验 |
| RACI | RACI 矩阵 | Responsible-Accountable-Consulted-Informed 角色矩阵 |
| Sprint | 迭代周期 | 敏捷开发中固定时间盒的工作周期（通常 2–4 周） |
| Backlog | 待办事项列表 | 待完成工作的优先级排序清单 |
| Change Request (CR) | 变更请求 | 对已批准范围的修改建议（需走变更控制） |
| Scope Creep | 范围蔓延 | 未经正式变更控制的范围持续扩张 |
| RAID | RAID 日志 | Risks-Assumptions-Issues-Dependencies 综合管理日志 |

---

## 流程与治理术语

| 术语 (EN) | 术语 (ZH) | 定义 |
|-----------|-----------|------|
| As-Is / To-Be | 现状 / 未来态 | 当前业务流程 vs 目标业务流程的映射分析 |
| Gap Analysis | 差距分析 | 现状与目标之间的差距识别和量化 |
| Root Cause Analysis (RCA) | 根因分析 | 找到问题的根本原因而非表象的分析方法 |
| 5 Whys | 5 个为什么 | 连续追问 5 次「为什么」以追溯根本原因的方法 |
| Cost-Benefit Analysis (CBA) | 成本效益分析 | 权衡项目投入和预期回报的量化方法 |
| ROI (Return on Investment) | 投资回报率 | (收益 - 投资) / 投资 × 100% |
| TCO (Total Cost of Ownership) | 总拥有成本 | 系统从获取到退役的全生命周期总成本 |
| KPI (Key Performance Indicator) | 关键绩效指标 | 衡量业务目标达成程度的量化指标 |
| SLA (Service Level Agreement) | 服务水平协议 | 服务提供方和接收方之间的绩效承诺 |
| OLA (Operational Level Agreement) | 操作级别协议 | 内部团队间的支持承诺 |
| SoW (Statement of Work) | 工作说明书 | 规定项目范围、交付物、时间表的正式文件 |
| NDA (Non-Disclosure Agreement) | 保密协议 | 约束信息接收方不得对外披露的合同 |

---

## 质量与测试术语

| 术语 (EN) | 术语 (ZH) | 定义 |
|-----------|-----------|------|
| Smoke Test | 冒烟测试 | 验证系统最基本功能是否正常运行的快速测试 |
| Sanity Test | 健全性测试 | 验证特定功能修正后是否正常运行的测试 |
| Regression Test | 回归测试 | 确保新变更未破坏已有功能的测试 |
| Load Test | 负载测试 | 在预期负载下验证系统性能的测试 |
| Stress Test | 压力测试 | 在极端负载下验证系统极限和恢复能力的测试 |
| Penetration Test | 渗透测试 | 模拟攻击者尝试入侵系统以发现安全漏洞 |
| P1 / P2 / P3 / P4 | 缺陷优先级 | Critical-High-Medium-Low 四级缺陷严重程度 |
| Severity vs Priority | 严重程度 vs 优先级 | 技术影响程度 vs 业务紧急程度（两个独立维度） |

---

## 审批与决策术语

| 术语 (EN) | 术语 (ZH) | 定义 |
|-----------|-----------|------|
| Steering Committee | 指导委员会 | 批准重大项目方向和预算的高级决策小组 |
| Change Control Board (CCB) | 变更控制委员会 | 审批项目范围/时间/成本变更的决策小组 |
| Architecture Review Board (ARB) | 架构评审委员会 | 确保技术方案符合企业架构标准的审核机构 |
| Sign-off | 签字认可 | 正式的书面/电子审批确认 |
| Conditional Approval | 有条件批准 | 附带必须满足的条件才生效的批准 |
| Gate Review | 关口评审 | 项目阶段转折点的正式评审会议 |
| Business Owner | 业务负责人 | 需求方最高决策者，承担业务后果 |
| Sponsor | 发起人 | 为项目提供资金和战略支持的高级领导 |
