# Claude Code 官方文档 — 结构参考

> 原始来源: https://code.claude.com/docs/en/overview
> 获取方式: sitemap 爬取 (2026-05-20)，页面为 JS 渲染，无法直接下载正文。
> 此文档记录文档结构，确保外链失效时技能规约仍可执行。

## 概述

Claude Code 是 Anthropic 的 AI 编码工具，可读取代码库、编辑文件、运行命令，并集成到开发工具链。支持终端、IDE (VS Code / JetBrains)、桌面应用和浏览器（Web 端）。

## 文档结构（来自 sitemap.xml）

### 快速入门
- [overview](https://code.claude.com/docs/en/overview) — 总览
- [quickstart](https://code.claude.com/docs/en/quickstart) — 快速入门（CLI）
- [setup](https://code.claude.com/docs/en/setup) — 安装与配置
- [web-quickstart](https://code.claude.com/docs/en/web-quickstart) — Web 端快速入门
- [desktop-quickstart](https://code.claude.com/docs/en/desktop-quickstart) — 桌面端快速入门
- [desktop](https://code.claude.com/docs/en/desktop) — 桌面应用
- [desktop-changelog](https://code.claude.com/docs/en/desktop-changelog) — 桌面版更新日志
- [desktop-scheduled-tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks) — 桌面端计划任务

### 平台支持
- [platforms](https://code.claude.com/docs/en/platforms) — 平台总览
- [vs-code](https://code.claude.com/docs/en/vs-code) — VS Code 集成
- [jetbrains](https://code.claude.com/docs/en/jetbrains) — JetBrains IDE 集成
- [chrome](https://code.claude.com/docs/en/chrome) — Chrome 扩展
- [claude-code-on-the-web](https://code.claude.com/docs/en/claude-code-on-the-web) — Web 端

### 核心概念
- [how-claude-code-works](https://code.claude.com/docs/en/how-claude-code-works) — 工作原理
- [features-overview](https://code.claude.com/docs/en/features-overview) — 功能总览
- [common-workflows](https://code.claude.com/docs/en/common-workflows) — 常见工作流
- [context-window](https://code.claude.com/docs/en/context-window) — 上下文窗口
- [prompt-caching](https://code.claude.com/docs/en/prompt-caching) — 提示缓存
- [checkpointing](https://code.claude.com/docs/en/checkpointing) — 文件检查点
- [worktrees](https://code.claude.com/docs/en/worktrees) — Git worktree 隔离

### CLI 参考
- [cli-reference](https://code.claude.com/docs/en/cli-reference) — CLI 完整参考
- [commands](https://code.claude.com/docs/en/commands) — 斜杠命令
- [tools-reference](https://code.claude.com/docs/en/tools-reference) — 工具参考
- [interactive-mode](https://code.claude.com/docs/en/interactive-mode) — 交互模式
- [headless](https://code.claude.com/docs/en/headless) — 无头模式
- [fullscreen](https://code.claude.com/docs/en/fullscreen) — 全屏模式
- [auto-mode-config](https://code.claude.com/docs/en/auto-mode-config) — 自动模式配置
- [output-styles](https://code.claude.com/docs/en/output-styles) — 输出样式
- [keybindings](https://code.claude.com/docs/en/keybindings) — 键盘快捷键
- [statusline](https://code.claude.com/docs/en/statusline) — 状态栏

### 配置
- [settings](https://code.claude.com/docs/en/settings) — 设置文件
- [env-vars](https://code.claude.com/docs/en/env-vars) — 环境变量
- [model-config](https://code.claude.com/docs/en/model-config) — 模型配置
- [terminal-config](https://code.claude.com/docs/en/terminal-config) — 终端配置
- [network-config](https://code.claude.com/docs/en/network-config) — 网络配置
- [server-managed-settings](https://code.claude.com/docs/en/server-managed-settings) — 服务端管理设置
- [debug-your-config](https://code.claude.com/docs/en/debug-your-config) — 调试配置

### 权限与安全
- [permissions](https://code.claude.com/docs/en/permissions) — 权限系统
- [permission-modes](https://code.claude.com/docs/en/permission-modes) — 权限模式
- [sandboxing](https://code.claude.com/docs/en/sandboxing) — 沙箱机制
- [security](https://code.claude.com/docs/en/security) — 安全概览
- [zero-data-retention](https://code.claude.com/docs/en/zero-data-retention) — 零数据保留
- [data-usage](https://code.claude.com/docs/en/data-usage) — 数据使用
- [legal-and-compliance](https://code.claude.com/docs/en/legal-and-compliance) — 合规
- [authentication](https://code.claude.com/docs/en/authentication) — 认证
- [llm-gateway](https://code.claude.com/docs/en/llm-gateway) — LLM 网关

### Hooks 系统
- [hooks](https://code.claude.com/docs/en/hooks) — Hooks 概览
- [hooks-guide](https://code.claude.com/docs/en/hooks-guide) — Hooks 使用指南

### MCP
- [mcp](https://code.claude.com/docs/en/mcp) — MCP 协议集成

### Skills
- [skills](https://code.claude.com/docs/en/skills) — 技能系统

### 插件系统
- [plugins](https://code.claude.com/docs/en/plugins) — 插件概览
- [plugins-reference](https://code.claude.com/docs/en/plugins-reference) — 插件参考
- [plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) — 插件市场
- [plugin-dependencies](https://code.claude.com/docs/en/plugin-dependencies) — 插件依赖
- [discover-plugins](https://code.claude.com/docs/en/discover-plugins) — 发现插件
- [claude-directory](https://code.claude.com/docs/en/claude-directory) — Claude Directory

### Agent SDK
- [agent-sdk/overview](https://code.claude.com/docs/en/agent-sdk/overview) — Agent SDK 概览
- [agent-sdk/quickstart](https://code.claude.com/docs/en/agent-sdk/quickstart) — SDK 快速入门
- [agent-sdk/typescript](https://code.claude.com/docs/en/agent-sdk/typescript) — TypeScript SDK
- [agent-sdk/python](https://code.claude.com/docs/en/agent-sdk/python) — Python SDK
- [agent-sdk/agent-loop](https://code.claude.com/docs/en/agent-sdk/agent-loop) — Agent 循环
- [agent-sdk/claude-code-features](https://code.claude.com/docs/en/agent-sdk/claude-code-features) — Claude Code 特性
- [agent-sdk/custom-tools](https://code.claude.com/docs/en/agent-sdk/custom-tools) — 自定义工具
- [agent-sdk/tool-search](https://code.claude.com/docs/en/agent-sdk/tool-search) — 工具搜索
- [agent-sdk/hooks](https://code.claude.com/docs/en/agent-sdk/hooks) — Hooks
- [agent-sdk/mcp](https://code.claude.com/docs/en/agent-sdk/mcp) — MCP
- [agent-sdk/skills](https://code.claude.com/docs/en/agent-sdk/skills) — Skills
- [agent-sdk/plugins](https://code.claude.com/docs/en/agent-sdk/plugins) — 插件
- [agent-sdk/slash-commands](https://code.claude.com/docs/en/agent-sdk/slash-commands) — 斜杠命令
- [agent-sdk/subagents](https://code.claude.com/docs/en/agent-sdk/subagents) — 子 Agent
- [agent-sdk/sessions](https://code.claude.com/docs/en/agent-sdk/sessions) — 会话管理
- [agent-sdk/permissions](https://code.claude.com/docs/en/agent-sdk/permissions) — 权限
- [agent-sdk/user-input](https://code.claude.com/docs/en/agent-sdk/user-input) — 用户输入
- [agent-sdk/streaming-output](https://code.claude.com/docs/en/agent-sdk/streaming-output) — 流式输出
- [agent-sdk/streaming-vs-single-mode](https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode) — 流式 vs 单次模式
- [agent-sdk/structured-outputs](https://code.claude.com/docs/en/agent-sdk/structured-outputs) — 结构化输出
- [agent-sdk/todo-tracking](https://code.claude.com/docs/en/agent-sdk/todo-tracking) — 任务追踪
- [agent-sdk/cost-tracking](https://code.claude.com/docs/en/agent-sdk/cost-tracking) — 成本追踪
- [agent-sdk/observability](https://code.claude.com/docs/en/agent-sdk/observability) — 可观测性
- [agent-sdk/file-checkpointing](https://code.claude.com/docs/en/agent-sdk/file-checkpointing) — 文件检查点
- [agent-sdk/modifying-system-prompts](https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts) — 修改系统提示
- [agent-sdk/migration-guide](https://code.claude.com/docs/en/agent-sdk/migration-guide) — 迁移指南
- [agent-sdk/secure-deployment](https://code.claude.com/docs/en/agent-sdk/secure-deployment) — 安全部署
- [agent-sdk/hosting](https://code.claude.com/docs/en/agent-sdk/hosting) — 托管
- [agent-sdk/typescript-v2-preview](https://code.claude.com/docs/en/agent-sdk/typescript-v2-preview) — TypeScript v2 预览

### Agent 与团队
- [agents](https://code.claude.com/docs/en/agents) — Agent 概念
- [sub-agents](https://code.claude.com/docs/en/sub-agents) — 子 Agent
- [agent-teams](https://code.claude.com/docs/en/agent-teams) — Agent 团队
- [agent-view](https://code.claude.com/docs/en/agent-view) — Agent 视图

### 高级功能
- [memory](https://code.claude.com/docs/en/memory) — 记忆系统
- [routines](https://code.claude.com/docs/en/routines) — 例程
- [scheduled-tasks](https://code.claude.com/docs/en/scheduled-tasks) — 计划任务
- [remote-control](https://code.claude.com/docs/en/remote-control) — 远程控制
- [deep-links](https://code.claude.com/docs/en/deep-links) — 深度链接
- [ultraplan](https://code.claude.com/docs/en/ultraplan) — UltraPlan（超级规划模式）
- [ultrareview](https://code.claude.com/docs/en/ultrareview) — UltraReview（超级审查模式）
- [fast-mode](https://code.claude.com/docs/en/fast-mode) — Fast Mode（快速模式）
- [computer-use](https://code.claude.com/docs/en/computer-use) — 计算机操作
- [voice-dictation](https://code.claude.com/docs/en/voice-dictation) — 语音输入
- [code-review](https://code.claude.com/docs/en/code-review) — 代码审查

### CI/CD 集成
- [github-actions](https://code.claude.com/docs/en/github-actions) — GitHub Actions
- [gitlab-ci-cd](https://code.claude.com/docs/en/gitlab-ci-cd) — GitLab CI/CD
- [github-enterprise-server](https://code.claude.com/docs/en/github-enterprise-server) — GitHub Enterprise Server
- [devcontainer](https://code.claude.com/docs/en/devcontainer) — Dev Container

### 云平台
- [amazon-bedrock](https://code.claude.com/docs/en/amazon-bedrock) — Amazon Bedrock
- [google-vertex-ai](https://code.claude.com/docs/en/google-vertex-ai) — Google Vertex AI
- [microsoft-foundry](https://code.claude.com/docs/en/microsoft-foundry) — Microsoft Foundry
- [claude-platform-on-aws](https://code.claude.com/docs/en/claude-platform-on-aws) — AWS 上的 Claude 平台

### 集成
- [third-party-integrations](https://code.claude.com/docs/en/third-party-integrations) — 第三方集成
- [slack](https://code.claude.com/docs/en/slack) — Slack 集成
- [channels](https://code.claude.com/docs/en/channels) — Channels
- [channels-reference](https://code.claude.com/docs/en/channels-reference) — Channels 参考

### 管理与监控
- [admin-setup](https://code.claude.com/docs/en/admin-setup) — 管理员设置
- [monitoring-usage](https://code.claude.com/docs/en/monitoring-usage) — 用量监控
- [analytics](https://code.claude.com/docs/en/analytics) — 分析
- [costs](https://code.claude.com/docs/en/costs) — 成本

### 参考
- [glossary](https://code.claude.com/docs/en/glossary) — 术语表
- [best-practices](https://code.claude.com/docs/en/best-practices) — 最佳实践
- [troubleshooting](https://code.claude.com/docs/en/troubleshooting) — 故障排除
- [troubleshoot-install](https://code.claude.com/docs/en/troubleshoot-install) — 安装故障排除
- [errors](https://code.claude.com/docs/en/errors) — 错误参考
- [whats-new](https://code.claude.com/docs/en/whats-new) — 新功能
- [changelog](https://code.claude.com/docs/en/changelog) — 变更日志

### 团队推广
- [champion-kit](https://code.claude.com/docs/en/champion-kit) — 推广工具包
- [communications-kit](https://code.claude.com/docs/en/communications-kit) — 沟通工具包
- [goal](https://code.claude.com/docs/en/goal) — 目标

## YrY 技能设计相关关键话题

YrY 进行技能设计、hook 配置、MCP 集成时，应重点查阅以下话题：

| YrY 需求 | 查阅文档 |
|---------|---------|
| 技能设计时确认 harness 能力边界 | skills, tools-reference, cli-reference |
| Hook 配置 | hooks, hooks-guide, agent-sdk/hooks |
| MCP 集成 | mcp, agent-sdk/mcp |
| IDE 集成 | vs-code, jetbrains |
| 权限系统 | permissions, permission-modes, sandboxing |
| 记忆系统 | memory, agent-sdk/sessions |
| 子 Agent | sub-agents, agent-sdk/subagents |
| 配置管理 | settings, env-vars, model-config |
| 插件开发 | plugins, plugins-reference, plugin-marketplaces |
| Agent SDK | agent-sdk/overview, agent-sdk/quickstart |
