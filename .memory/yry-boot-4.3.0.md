---
name: yry-boot-4.3.0
description: YrY 4.3.0 自改进数据层启动 — 引导 .memory/ + .improvement/ 基础设施
metadata:
  type: project
---

# YrY 4.3.0 自改进数据层启动

2026-06-06 执行的一次性自改进引导操作：

## 做了什么

1. **统一常量** — proposals.mjs 和 collect.mjs 中的重复常量移到 lib/constants.mjs，新增 DIAGNOSTIC_LABELS、DIAGNOSTIC_PROPOSAL_TYPE、DIAGNOSTIC_BASELINES、UPGRADE_THRESHOLDS 等共享导出
2. **修复 cmdEvaluate** — 从 stub 改为真实 E1-E4 评估：读取前后执行记忆，计算改善/退化，更新提案状态
3. **添加快照收集** — collectStoryData 增加 git diff/stat 快照，generateProposals 强制 snapshot 证据要求
4. **修复 D4 诊断** — 从计数交付失败改为基于状态历史的 Gate B 轮回溯计数
5. **修复 D6 诊断** — 从检查单文件存在改为扫描场景文档 §4 完整性
6. **创建数据记录器** — skills/rui/record.mjs：exec/delivery/audit/state/bootstrap/compress 六个子命令
7. **引导数据层** — 为 3 个故事 (rui-npm, yry-arch, yry-self-test) 创建 .memory/ + .improvement/ 目录

## 待完成

- 管线执行时自动调用 record.mjs 记录执行记忆（需集成到 rui 管线）
- 修复 D4 命名冲突：rules/self-improve.md 说"流程退化"，agents/self-improve.md 说"安全边界模糊"
- 扫描并补充场景文档 §2/§3/§4 缺失内容

**Why:** 自改进闭环只有设计文档和诊断引擎，数据层完全空缺导致闭环无法运转。这次引导让它能开始采集数据和产生诊断。

**How to apply:** 每次 /rui code 完成后，在自改进阶段运行 `node skills/rui/record.mjs exec --story=<name> ...` 记录执行数据，然后 `node skills/rui/proposals.mjs generate --story=<name>` 运行诊断。
