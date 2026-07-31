---
title: 新人 Day-1 任务清单模板
tags: [模板, 新人, 引导, Day-1, checklist]
category: work/onboarding
created: 2026-07-31
updated: 2026-07-31
source: internal
type: template
status: stable
---

# 新人 Day-1 任务清单模板

> 抽取自 `template.md` §6。可独立打印或贴到 onboarding ticket。每条都要可勾选、可验证。

## 如何使用

- 复制到新人 onboarding ticket / Notion / 飞书
- 替换 `{{...}}` 占位符
- 每条都要能在 30 分钟内验完成状态（要么通过要么明确卡住）

## 环境层

- [ ] 仓库 clone 到本地，`cd /path/to/YrY/{{项目名}}`
- [ ] `{{install_cmd}}` 退出码 0，无 peer dep 警告（或已被项目接受）
- [ ] 依赖的其他 Yi 项目在跑（如 YiAi `http://localhost:10086` `/health/observer` 200）
- [ ] 其他外部依赖就绪（MongoDB / Ollama / Chrome 114+ 等）

## 构建层

- [ ] `{{dev_command}}` 启动成功，端口 `{{port}}` 可访问
- [ ] 浏览器打开 `{{verify_url}}` 看到 {{期望页面}}
- [ ] DevTools Console 无 error
- [ ] `{{typecheck_cmd}}` 退出码 0
- [ ] （可选）`{{build_cmd}}` 退出码 0，产物路径 `{{dist_path}}` 生成

## 功能层（端到端）

- [ ] 跑通一次核心功能（{{SSE 流式对话 / 列表查询 / 扩展 popup / RAG 查询}}）
- [ ] 跑通一次 RPC 调用，参数用 `filter` 而非 `query`（铁律）
- [ ] 跑通一次 `/read-file` 或等价操作，字段用 `target_file` 而非 `path`（铁律）
- [ ] DevTools / Swagger / `YiPet.help()` 等开发者入口可用

## 阅读层

- [ ] 读完 `{{项目名}}/CLAUDE.md` 的 Module Boundaries
- [ ] 读完 `{{项目名}}/CLAUDE.md` 的 Cross-project protocol（铁律集中地）
- [ ] 浏览 `YiKnowledge/projects/{{项目名}}/engineering/readme.md` 的架构图
- [ ] 知道 `YiKnowledge/projects/{{项目名}}/onboarding.md` 的 §4 和 §8 在哪

## 动手层

- [ ] 加一个 Hello World 级改动（{{加 `/hello` 页 / 加 `/ping` 端点 / 加 `HelloBox` 组件}}）
- [ ] 提交 PR，CI 通过
- [ ] 找同事做一次 30 分钟走读，把未懂的点问清

## 完成标志

- 上面所有 [ ] 全部勾掉
- 或：明确卡住的条目标注 `🚫 卡住原因`，在走读时一起讨论
