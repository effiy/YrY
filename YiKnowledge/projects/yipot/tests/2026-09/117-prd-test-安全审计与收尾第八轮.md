---
doc_type: test
title: "YiPot 安全审计与收尾（第八轮）— 测试方案"
tags: [测试方案, 安全, tauri, csp, 审计]
category: 项目/桌面应用/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
test_id: YP-09-117
prd_ref: YP-09-71
dev_ref: YP-09-112
roles: [engineer, leader]
---

# YiPot 安全审计与收尾（第八轮）— 测试方案

> 测试编号：YP-09-117 · 关联 PRD：YP-09-71 · 关联开发：YP-09-112

---

## 一、安全配置验证

### TC-01: daemon 窗口隔离

| 项 | 内容 |
|-----|------|
| **步骤** | 1. 启动应用 2. 检查 daemon 窗口是否可见 |
| **预期** | daemon 窗口 `visible: false`，用户不可见 |

### TC-02: CSP eval() 可用性

| 项 | 内容 |
|-----|------|
| **步骤** | 安装并运行 .potext 插件 |
| **预期** | 插件正常执行（CSP 允许 eval） |

### TC-03: HTTP 请求范围

| 项 | 内容 |
|-----|------|
| **步骤** | Google/Baidu/DeepL 翻译各一次 |
| **预期** | 第三方 API 请求正常（HTTP scope 覆盖） |

### TC-04: 更新签名验证

| 项 | 内容 |
|-----|------|
| **步骤** | 尝试安装未签名更新包 |
| **预期** | 更新被拒绝（pubkey 验证） |

---

## 二、完整审计回归

执行前 7 轮全部回归测试用例（共 60+ 用例），确认所有修复在安全配置审计后仍然有效。

## 三、关联文档

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/71-prd-安全审计与收尾第八轮.md` |
| 开发方案 | `../devs/2026-09/112-prd-task-安全审计与收尾第八轮.md` |
| 安全审计 | `../architecture/security-config-audit.md` |