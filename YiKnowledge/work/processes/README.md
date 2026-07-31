# 流程 / Processes

收录团队工作流程、规范、SOP。

## 收录范围

- 研发流程（需求、开发、测试、发布、复盘）
- 产品流程（发现、评审、交付）
- 运维与事件响应流程
- 跨团队协作流程
- 模板与表单（Sprint 回顾、上线 checklist）

## 文件类型与命名

- `{流程名}-process.md`：流程文档
- `{流程名}-template.md`：可复用模板
- 命名采用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: 某流程
tags: [流程, 主题]
category: work/processes
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: internal
type: process
status: stable
---
```

## 写作推荐结构

1. 流程目的与适用范围
2. 角色与职责（RACI）
3. 步骤拆解（含状态流转图）
4. 输入 / 输出工件
5. 度量指标
6. 异常处理与升级路径

## 已收录

- `sprint-retrospective-template.md` — Sprint 回顾模板
- `tech-roadmap-review-template.md` — 技术路线图季度审查模板（投资分布 + 里程碑对齐）
- `tech-roadmap-review-summary.md` — 技术路线图审查摘要（方法论）
- `engineering-productivity-metrics-template.md` — 工程效能指标模板（DORA 四指标 + 人均吞吐）
- `engineering-productivity-metrics-summary.md` — 工程效能指标摘要（DORA 解读）
- `org-productivity-diagnosis-template.md` — 组织效能诊断模板（团队拓扑 / 依赖拓扑 / 交付瓶颈 / Conway 对齐）
- `org-productivity-diagnosis-summary.md` — 组织效能诊断摘要（Team Topologies）
- `requirement-review-process.md` — 需求评审流程（内审 → 预排期 → 评审 → 结论同步）
- `design-review-process.md` — 设计评审流程（设计自审 → 评审 → 设计验收）
- `tech-review-process.md` — 技术评审流程（内审 → 正式评审 → 确定里程碑）
- `release-process.md` — 上线发布流程与 checklist（含发布前 checklist 与回滚要求）
- `incident-response-process.md` — 事件响应流程（P0/P1/P2，MTTA/MTTI/MTTR）
- `canary-release-process.md` — 灰度发布流程（内部 → 小/中/大流量 → 全量）
- `knowledge-transfer-process.md` — 知识沉淀与传承流程（触发 → 草稿 → 审核 → 归档 → 复审 → 传承）
- `hotfix-release-process.md` — 紧急修复（hotfix）发布流程（判定 → 最小修复 → 快速评审 → 发布 → 事后补记录）
- `data-migration-process.md` — 数据迁移与回滚流程（DDL / 大表迁移 / 跨库同步，含回滚预案）
- `dependency-upgrade-process.md` — 依赖升级流程（紧急/高/中/低分级，CVE 驱动）
- `cross-team-collaboration-process.md` — 跨团队协作流程（识别 → 契约 → 联合计划 → 联调 → 共同发布）
- `rollback-drill-process.md` — 紧急回滚演练流程（剧本 → 预演 → 演练 → 验证 → 复盘 → 改进）
- `capacity-planning-process.md` — 容量评估与扩容流程（需求 → 基线 → 压测 → 扩容 → 观测 → 收缩）
- `data-compliance-process.md` — 数据合规与脱敏流程（分类 → 脱敏方案 → 评审 → 上线 → 审计 → 销毁）
- `project-handover-process.md` — 跨团队交接流程（触发 → 交接包 → 验证 → 权限移交 → 支持期）
- `disaster-recovery-drill-process.md` — 灾备演练与切换流程（L1~L4 分级，RTO/RPO 验证）
- `chaos-engineering-process.md` — 故障演练（chaos）流程（用例设计 → 爆炸半径 → 注入 → 观测 → 恢复）
- `quarterly-security-audit-process.md` — 季度安全审计流程（代码/依赖/基础设施/数据/第三方）
- `release-freeze-process.md` — 代码冻结期流程（硬冻结/软冻结/黄金周，含例外审批）
- `oncall-rotation-process.md` — Oncall 轮值流程
- `monitoring-governance-process.md` — 监控治理流程
- `quarterly-tech-debt-process.md` — 季度技术债流程

## 待收录

- 故障复盘归档与知识沉淀流程（与 [lessons/failures](../../lessons/failures/) 联动）
