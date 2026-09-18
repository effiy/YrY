---
doc_type: test
title: "M07: 图片展示与组织 — 测试用例"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiPet
project_id: yipet
prd_month: "202609"
prd_task_id: "YP-M07"
source_prds: ["07-功能实现-图片展示与组织工具"]
source_modules: ["07-prd-task-图片展示与组织工具"]
source_okr: [yipet-004]
---

# M07: 图片展示与组织 — 测试用例

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-GL-01 | 网格→瀑布流→列表切换 | 视图切换 < 100ms，数据不丢失 |
| UT-GL-02 | 标签筛选 (AND) | "宠物"+"2026" → 仅显示同时满足的图片 |
| UT-GL-03 | 文件名搜索 | "screenshot" → 匹配文件名含 "screenshot" 的图片 |
| UT-GL-04 | 日期范围搜索 | 2026-09-01~2026-09-15 → 仅该时段图片 |
| UT-GL-05 | 排序：日期降序 | 最新的图片排最前 |
| UT-GL-06 | 排序：大小升序 | 最小文件排最前 |
| UT-GL-07 | 全屏：键盘 ← → 导航 | 左键=上一张，右键=下一张 |
| UT-GL-08 | 全屏：缩放 (2×) | CSS scale(2)，图片居中 |
| UT-GL-09 | 预加载相邻图片 | 当前第 5 张 → 3/4/6/7 已预加载 |

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 视图切换后图片丢失 |
| S2 — 一般 | 瀑布流布局断裂（图片重叠） |

---