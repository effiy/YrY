---
prd_task_id: "YV-09-99"
title: "YV-09-99: 项目详情页 Recent Activity 模块渲染优化 — 测试用例"
status: 已完成
priority: P2
owner: Chengliang.Yi
source_prds: ["99-prd-项目详情页Recent-Activity模块渲染优化"]
source_modules: ["YV-09-99"]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
type: test
tags: [测试用例, 体验优化, 渲染优化, 时间轴, 骨架屏]
category: 项目/管理后台/测试
roles: [engineer]
test_coverage: "L1+L4 17 用例通过"
test_execution_date: 2026-09-23
source: YiVad
benefit: "测试用例：项目详情页Recent-Activity模块渲染优化"
lifecycle: active
---

# YV-09-99: 项目详情页 Recent Activity 模块渲染优化 — 测试用例

> 来源 PRD：[99-prd-项目详情页Recent-Activity模块渲染优化](../../prds/2026-09/99-prd-项目详情页Recent-Activity模块渲染优化.md)
> 开发方案：[99-prd-task-项目详情页Recent-Activity模块渲染优化](../../devs/2026-09/99-prd-task-项目详情页Recent-Activity模块渲染优化.md)

| 用例 | 覆盖 AC | 层级 | 结果 |
|------|---------|------|------|
| TC-01 编译零错误（vue-tsc + rsbuild） | AC-1~7 | L1 | ✅ |
| TC-02 内容预览带样式渲染（clamp + 左边框 + 背景） | AC-1 | L4 | ✅ |
| TC-03 点击内容预览展开/收起完整文本 | AC-1 | L4 | ✅ |
| TC-04 加载中显示 5 行动画骨架屏 | AC-2 | L4 | ✅ |
| TC-05 4 种类型显示专属图标 + 圆点光晕 | AC-3 | L4 | ✅ |
| TC-06 鼠标悬停时间戳 > 600ms 显示 tooltip | AC-4 | L4 | ✅ |
| TC-07 切换类型筛选触发 enter 动画 | AC-5 | L4 | ✅ |
| TC-08 筛选无结果时显示类型名空状态 | AC-6 | L4 | ✅ |
| TC-09 hover 条目时 padding 左移 4px + 内容区背景 | AC-7 | L4 | ✅ |
| TC-10 轮询刷新不闪现骨架屏（已有数据时） | AC-2 | L4 | ✅ |
| TC-11 骨架屏显示 2 组日期标签 + 5 条微光条目 | AC-8 | L4 | ✅ |
| TC-12 5 分钟内更新的条目圆点有呼吸动画 | AC-9 | L4 | ✅ |
| TC-13 日期分组标题显示星期 + 条目计数 | AC-10 | L4 | ✅ |
| TC-14 条目按索引递增延迟错峰入场 | AC-11 | L4 | ✅ |
| TC-15 Tab 键聚焦条目显示 focus-visible 环 | AC-12 | L4 | ✅ |
| TC-16 Enter 键触发文件预览（同点击行为） | AC-12 | L4 | ✅ |
| TC-17 视口 ≤ 1100px 时双列布局垂直堆叠 | AC-13 | L4 | ✅ |

**结论**：全部 17 项通过。

## L4 验证步骤

1. 打开 `http://localhost:8848/#/project/yipot` → Overview Tab
2. 验证 Recent Activity 加载时显示骨架屏（非空白）
3. 验证加载完成后各类型条目显示图标（需求=Document、缺陷=Warning、模块=Grid、文档=Notebook）
4. 验证圆点带有类型专属彩色光晕
5. 鼠标悬停时间戳 → 验证 tooltip 显示绝对时间
6. 点击文档类型条目的内容预览 → 验证展开完整描述
7. 再次点击 → 验证收起
8. 切换 Bug/Module/Doc 筛选标签 → 验证 enter 动画
9. 选择无数据的筛选类型 → 验证显示 "暂无 {类型} 相关动态"
10. hover 任一条目 → 验证左移 4px + 背景高亮
11. 等待轮询刷新（30s）→ 验证已有数据时不闪现骨架屏
12. 检查骨架屏是否显示 2 组日期标签 + 5 条微光条目（匹配时间轴分组布局）
13. 手动修改数据触发 5 分钟内的新条目 → 验证圆点呼吸动画
14. 检查非 Today/Yesterday 日期标签显示 `YYYY-MM-DD · DayOfWeek` 格式 + 计数徽章
15. 刷新页面 → 验证条目以递增延迟错峰入场（底部条目动画最晚）
16. 按 Tab 键聚焦时间轴条目 → 验证 focus-visible 蓝色环
17. 按 Enter 键 → 验证打开 KnowledgePreviewDialog（同点击行为）
18. 缩小浏览器窗口至 1100px 以下 → 验证 Activity + Todo 垂直堆叠
19. 继续缩小至 768px → 验证统计条切换为 2 列布局

## 回归检查

- [ ] 1. 时间轴条目点击仍正确打开 KnowledgePreviewDialog
- [ ] 2. Todo List（右侧列）功能不受影响
- [ ] 3. README.md 预览正常
- [ ] 4. OKR Progress 卡片正常
- [ ] 5. Document Directory 正常
- [ ] 6. 日期筛选联动正常
- [ ] 7. 切换 Tab 后切回 Overview 刷新正常
- [ ] 8. 项目切换后数据重新加载正常