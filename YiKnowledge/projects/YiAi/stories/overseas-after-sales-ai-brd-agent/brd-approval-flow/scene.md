---
key: sc_brd_approval_flow
name: BRD审批流
status: planning
priority: p1
createdAt: 1753920000000
updatedAt: 1753920000000
---

# BRD审批流

## 描述 (description)

生成的 BRD 初稿按业务负责人 / EU HUB ITBP / RSC 业务 / HQ 对口业务四级审批角色发起审批，审批结果与意见回写至 story 的 approvalRecords 字段，全部通过后 story 状态自动推进至 design。

## 触发条件 (trigger)

story 的 BRD 内容完成编辑后，用户点击「提交审批」。

## 前置条件 (prerequisites)

- story 已存在完整 BRD 内容
- 四类审批角色均已配置审批人
- story 当前状态为 planning

## 预期结果 (expectedResult)

- 审批请求通知至各角色对应审批人
- approvalRecords 字段按角色顺序追加审批记录
- 任一角色 reject 则 story 状态保持 planning 并标记 at_risk
- 全部 approved 后 story 状态自动推进至 design
- 审批意见可追溯（含审批人、日期、结果、备注）

## 步骤 (steps)

| Order | Action | Description |
|-------|--------|-------------|
| 1 | Given | story 已完成 BRD 编辑，状态为 planning |
| 2 | When | 用户点击「提交审批」 |
| 3 | Then | 系统按四级角色顺序发起审批请求 |
| 4 | And | business_owner 首先收到通知并审批 |
| 5 | When | business_owner 审批通过 |
| 6 | Then | eu_hub_itbp 收到通知并审批 |
| 7 | When | 任一角色 reject |
| 8 | Then | story 状态保持 planning，scheduleStatus 标记为 at_risk |
| 9 | And | 审批记录写入 approvalRecords |
| 10 | When | 全部四级审批 approved |
| 11 | Then | story 状态自动推进至 design |
| 12 | And | 审批记录完整可追溯 |

## 标签 (tags)

- BRD
- 审批
- 工作流
- approval

## 关联文件 (files)

- filePath: YiVad/src/views/story/index.vue
- filePath: YiVad/src/stores/modules/story.ts
- filePath: YiVad/src/api/modules/story.ts
