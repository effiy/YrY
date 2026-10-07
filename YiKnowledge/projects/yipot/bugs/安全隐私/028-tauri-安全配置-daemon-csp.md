---
title: "Tauri daemon 窗口 --disable-web-security + CSP script-src * 'unsafe-eval' 安全配置"
tags: [bug, security, tauri, csp, daemon, configuration]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: acknowledged
severity: minor
priority: p3
project: yipot
module: src-tauri/tauri.conf.json
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: null
frequency: always
roles: [engineer, leader]
---

# Tauri 安全配置 — daemon --disable-web-security + 宽松 CSP

---

## 一、现象

> `tauri.conf.json` 中 daemon 窗口启用 `--disable-web-security`，CSP 配置 `script-src * 'unsafe-eval'` 允许任意来源脚本注入。

## 二、详情

| 配置 | 当前值 | 风险 |
|------|--------|------|
| daemon additionalBrowserArgs | `--disable-web-security` | 禁用同源策略 |
| CSP script-src | `* 'unsafe-eval'` | 任意来源脚本 + eval() |
| CSP default-src | `* data:` | 任意来源资源加载 |
| HTTP scope | `http://**`, `https://**` | 任意 URL 请求 |

## 三、现状

这些配置项为 Pot-App 上游设计决策，受限于 Tauri 1.x + 插件系统需求：
- `--disable-web-security`：Tauri 1.x 多窗口通信需求
- `script-src 'unsafe-eval'`：插件系统 `eval()` 执行
- HTTP wildcard scope：36+ 第三方翻译/OCR API 域名

## 四、改进计划

| 版本 | 改进 |
|------|------|
| 4.0 (Tauri 2.x) | 移除 `--disable-web-security` |
| 3.1 | HTTP scope 白名单 |
| 4.0 | CSP 收紧 + 插件沙箱 |

## 五、关联文档

- [安全配置审计](../architecture/security-config-audit.md)
- [审计完成报告](../architecture/audit-completion-report.md)