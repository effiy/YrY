---
doc_type: dev
title: "YiPot 安全审计与收尾（第八轮）— 开发方案"
tags: [开发方案, 安全, tauri, csp, 审计]
category: 项目/桌面应用/开发
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: task
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
dev_id: YP-09-112
prd_ref: YP-09-71
estimate: 0.25
review_status: 已评审
roles: [engineer, leader]
---

# YiPot 安全审计与收尾（第八轮）— 开发方案

> 开发编号：YP-09-112 · 关联 PRD：YP-09-71 · 预估人天：0.25d

---

## 一、审计清单

| 配置项 | 文件 | 当前值 | 审计结论 |
|--------|------|--------|---------|
| daemon browser args | `tauri.conf.json:116` | `--disable-web-security` | Tauri 1.x 必需，2.x 移除 |
| CSP script-src | `tauri.conf.json:107` | `* 'unsafe-eval'` | 插件系统需要 eval() |
| CSP default-src | `tauri.conf.json:107` | `* data:` | 翻译服务跨域需要 |
| HTTP scope | `tauri.conf.json:35-41` | `http://** https://**` | 36+ 第三方 API |
| Shell open | `tauri.conf.json:17-18` | `all: true, open: .*` | 帮助链接需要 |
| FS scope | `tauri.conf.json:53-58` | `$APPCONFIG/** $APPCACHE/**` | 合理限制 |

---

## 二、产出物

1. `architecture/security-config-audit.md` — 5 项配置审计 + 改进路线图
2. `architecture/audit-completion-report.md` — 8 轮审计汇总 + 覆盖率矩阵 + 版本规划
3. `bugs/安全隐私/028-tauri-安全配置-daemon-csp.md` — Bug 028

---

## 三、后续版本规划

| 版本 | 改进项 |
|------|--------|
| 3.0.8 | 8 轮审计修复发布 |
| 3.1 | API Key 加密存储 + HTTP scope 白名单 + 翻译引擎全量 null safety |
| 4.0 | Tauri 2.x 迁移（移除 --disable-web-security、CSP 收紧、插件沙箱） |

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/71-prd-安全审计与收尾第八轮.md` |
| 测试 | `../tests/2026-09/117-prd-test-安全审计与收尾第八轮.md` |
| 安全审计 | `../architecture/security-config-audit.md` |
| 完成报告 | `../architecture/audit-completion-report.md` |