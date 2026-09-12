---
doc_type: test
title: "YV-09-86: 集成市场 — 第三方集成目录、安装/配置/卸载流程、集成健康状态、使用统计、OAuth 配置助手 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-86"
source_prds: ["39-prd-集成市场"]
source_modules: []
---
# YV-09-86: 集成市场 — 第三方集成目录、安装/配置/卸载流程、集成健康状态、使用统计、OAuth 配置助手 — 测试规格

> 来源 PRD：[39-prd-集成市场.md](../../prds/2026-09/39-prd-集成市场.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：浏览集成目录

**GIVEN** 后端注册了 5 个集成（Slack/GitHub/Jira/Email/Webhook）
**WHEN** 用户打开集成市场
**THEN** 应显示 5 个集成卡片
**AND** 应按分类分组显示
**AND** 搜索框可过滤集成

### 场景 2：安装 GitHub 集成（OAuth PKCE）

**GIVEN** 用户点击 GitHub 集成的"安装"按钮
**WHEN** 完成 OAuth PKCE 流程
**THEN** 应重定向到 GitHub 授权页
**AND** 授权后返回 YiVad
**AND** 集成状态应变为"已连接"

### 场景 3：安装 Webhook 集成

**GIVEN** 用户点击 Webhook 集成的"安装"按钮
**WHEN** 配置完成
**THEN** 应生成 Webhook URL
**AND** 应显示密钥（仅显示一次）
**AND** 应提供复制 URL 和密钥的功能

### 场景 4：查看集成健康状态

**GIVEN** GitHub 集成已安装但最近一次调用失败
**WHEN** 用户查看集成健康状态
**THEN** GitHub 卡片应显示黄色警告状态
**AND** 点击详情应显示最近 10 次调用记录

### 场景 5：卸载集成

**GIVEN** Slack 集成已安装
**WHEN** 用户点击"卸载"并确认
**THEN** Token 应被撤销
**AND** 配置应被删除
**AND** 集成卡片状态应变回"未安装"

### 场景 6：使用统计

**GIVEN** Slack 集成已安装并使用了 30 天
**WHEN** 用户查看使用统计
**THEN** 应显示：总 API 调用次数、日均调用量、成功率、活跃天数
**AND** 应显示按日/按月的趋势图

---

