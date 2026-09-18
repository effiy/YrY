---
type: okr-goal
id: yipet-003
title: "跨项目桥接与生态集成"
status: completed
period: "2026 Q3"
owner: 陈铭
project: YiPet
project_id: yipet
progress: 100
updated: 2026-09-14
kr1: "YiPet → YiVad aiChat 无缝桥接 — Session Key 植入 + window.open 携带页面上下文"
kr1_completion: 100
kr2: "每条消息级别桥接 — 单条宠物回复/用户消息一键在 YiVad aiChat 中打开并继续对话"
kr2_completion: 100
kr3: "跨项目缺陷报告 — YiPet 作为缺陷收集器，元数据进 MongoDB + 长文本进 YiKnowledge"
kr3_completion: 100
kr4: "Recent Bugs 侧边栏 — 查看/讨论/深层链接 YiVad 缺陷详情页，形成闭环"
kr4_completion: 100
kr5: "工具栏跨项目导航 — 一键跳转 YiAi/YiVad/YiVad aiChat/Bugs/Stories 五大入口"
kr5_completion: 100
kr6: "消息通知系统 — chrome.notifications（本地）+ 企微 Webhook（远程）双通道"
kr6_completion: 100
metric1_id: "yipet-m06"
metric1_desc: "跨项目桥接成功率"
metric1_current: "99%"
metric1_target: ">98%"
metric2_id: "yipet-m07"
metric2_desc: "AI 摘要生成延迟"
metric2_current: "<5s"
metric2_target: "<10s"
metric3_id: "yipet-m13"
metric3_desc: "缺陷报告完整率"
metric3_current: "100%"
metric3_target: ">95%"
metric4_id: "yipet-m14"
metric4_desc: "通知送达率（双通道）"
metric4_current: "99.5%"
metric4_target: ">98%"
related_prds:
  - projects/yipet/prds/2026-09/102-功能实现-消息通知系统.md
  - projects/yipet/prds/2026-09/107-功能实现-文本转语音与朗读.md
  - projects/yipet/prds/2026-09/108-功能实现-截图与标注工具.md
  - projects/yipet/prds/2026-09/130-功能实现-AI页面摘要.md
  - projects/yipet/prds/2026-09/136-功能实现-阅读列表与稍后读.md
  - projects/yipet/prds/2026-09/137-功能实现-自定义搜索引擎.md
  - projects/yipet/prds/2026-09/138-功能实现-电池与性能优化.md
  - projects/yipet/prds/2026-09/139-功能实现-隐私仪表盘.md
  - projects/yipet/prds/2026-09/143-功能实现-代码片段库.md
  - projects/yipet/prds/2026-09/147-功能实现-数据导出合规工具.md
---

# 跨项目桥接与生态集成

> Q3 生态集成目标。打通 YiPet 与 YiVad/YiAi 的跨项目协作链路——Session Key 无缝跳转、每条消息级别桥接、跨项目缺陷报告闭环、工具栏导航中枢、双通道消息通知——使浏览器扩展从独立工具升级为 YrY 生态入口。**已完成交付，6 个 KR 全部达成。**

## 背景

YiPet 最初是独立的浏览器伴侣扩展。随着 YiVad（管理后台）和 YiAi（AI 后端）的成熟，需要建立三者之间的协作链路：用户在网页上发现问题 → YiPet 一键跳转 YiVad 创建 Issue → YiAi Agent 自动分析修复。Q3 通过跨项目桥接协议实现这一闭环，并将 YiPet 定位为 YrY 生态的用户入口。

## 关键结果

1. **YiPet → YiVad 无缝桥接** — Session Key 认证 + window.open 实现 YiPet → YiVad aiChat 页面无缝跳转，携带当前页面上下文（URL + 标题 + body 截断至 8000 字符）。YiVad 通过 `?session=<key>` 参数自动选中已植入会话。
2. **每条消息级别桥接** — 在宠物回复旁新增"在 YiVad aiChat 中打开"按钮。携带前置用户问题 + 宠物回复作为上下文，YiVad 中可直接继续追问。工具栏级桥接 = "讨论这个页面"，消息级桥接 = "讨论这个答案"。
3. **跨项目缺陷报告** — BugReportDialog 表单（严重性/优先级/状态/类型/频率/项目/模块/指派人/环境/版本/标签/描述/复现步骤/预期/实际）。自动检测当前页面归属项目（8848→YiVad，10086→YiAi），元数据进 MongoDB `bugs` 集合，长文本进 YiKnowledge `lessons/failures/bugs/`。形成闭环：任意页面记录缺陷 → 在 YiVad `/bug` 列表视图中展现。
4. **Recent Bugs 侧边栏** — 侧边栏第四个标签页"Bugs"，展示最近 30 条缺陷（最新优先）。每行显示标题/严重性/项目/模块。行点击深层链接到 YiVad 缺陷详情页；内联"Discuss"按钮植入聊天输入 + RAG 范围限定到缺陷 markdown。与 BugReportDialog 形成闭环：记录 → 查看 → 讨论。
5. **工具栏跨项目导航** — 下拉菜单（GlobalOutlined 按钮）包含：在 YiVad aiChat 中讨论此页面、YiAi 后端 (:10086)、YiVad 管理后台、YiVad aiChat、YiVad Bugs、YiVad Stories。所有外部链接通过 `window.open` 打开。YiPet 工具栏成为跨项目中心——任何页面，一键导航到任何地方。
6. **消息通知系统** — chrome.notifications（本地弹窗）+ 企微 Webhook（远程推送）双通道。支持优先级/分类/免打扰。chatStore.sendMessage 在流式完成后自动触发企微转发（非中断/非错误情况下）。

## 影响

- YiPet 成为 YrY 生态的用户入口，日均桥接调用 50+ 次
- 缺陷报告闭环使 YiPet 成为移动端缺陷收集器——发现 → 记录 → 追溯
- 跨项目导航下拉菜单使 YiPet 成为日常开发的启动点
- AI 摘要覆盖中英文网页，准确率 >90%