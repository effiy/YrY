---
doc_type: test
title: "YiPot 100% 引擎覆盖与专业交付物（第十七轮）— 测试方案"
tags: [测试方案, 完成, 引擎覆盖, config-safety]
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
test_id: YP-09-128
prd_ref: YP-09-80
dev_ref: YP-09-121
roles: [engineer]
---

# YiPot 100% 引擎覆盖与专业交付物（第十七轮）— 测试方案

> 测试编号：YP-09-128 · 关联 PRD：YP-09-80 · 关联开发：YP-09-121

---

## 一、自动化验证

### TC-01: Config 默认值零遗留

| 项 | 内容 |
|-----|------|
| **命令** | `grep -rn "const { config } = options" src/services/ \| grep -v "= {}"` |
| **预期** | 零输出 |

### TC-02: 构建验证

| 项 | 内容 |
|-----|------|
| **命令** | `pnpm build` |
| **预期** | ✓ built successfully |

### TC-03: CI 检查脚本

| 项 | 内容 |
|-----|------|
| **步骤** | 运行 `scripts/check-config-defaults.sh` |
| **预期** | "All services have config default values." |

---

## 二、抽样手动验证

### TC-04-06: 低流量引擎快速验证

| # | 服务 | 步骤 | 预期 |
|---|------|------|------|
| 4 | Baidu Field | 不配置 appid → 翻译 | "Please configure appid" (非 TypeError) |
| 5 | Iflytek Intsig | 不配置 → OCR | API 认证错误 (非 TypeError) |
| 6 | Simple LaTeX | 不配置 token → OCR | API 错误 (非 TypeError) |

---

## 三、交付物验证

| # | 交付物 | 验证方法 |
|---|--------|---------|
| 7 | 执行摘要 | 文件存在 + frontmatter 完整 |
| 8 | 升级指南 | 步骤可执行 + 回滚方案明确 |
| 9 | CI 自动化指南 | GitHub Actions 配置可复制使用 |

---

## 四、回归测试

执行 [主测试策略](../master-test-strategy.md) 完整回归冒烟套件（15 项）。

## 五、关联文档

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/80-prd-100percent-引擎覆盖第十七轮.md` |
| 开发方案 | `../devs/2026-09/121-prd-task-100percent-引擎覆盖第十七轮.md` |
| 执行摘要 | `../architecture/executive-summary.md` |