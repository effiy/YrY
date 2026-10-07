---
doc_type: test
title: "YiPot 安全掩码批量修复（第二十三轮）— 测试方案"
tags: [测试方案, 安全, 密码掩码]
category: projects/yipot/tests
created: 2026-09-23
updated: 2026-09-23
source: internal
type: test
status: 已完成
priority: P2
project: YiPot
prd_ref: YP-09-84
dev_ref: YP-09-126
roles: [engineer]
---

# YiPot 安全掩码批量修复（第二十三轮）— 测试方案

> 关联 PRD：YP-09-84 · 关联开发：YP-09-126

---

## 测试用例

### TC-01: 全量 password 覆盖率

| 项 | 内容 |
|-----|------|
| **命令** | `grep -rl "type='password'" src/services/ \| wc -l` |
| **预期** | ≥ 26 |

### TC-02: 零明文泄漏

| 项 | 内容 |
|-----|------|
| **命令** | `grep -rn "secret\|token\|apikey" src/services/ --include="Config.jsx" \| grep "value=" \| grep -v "type='password'" \| wc -l` |
| **预期** | 敏感字段的 value 行附近必有 type='password'（允许非敏感 secret 字段如 accesskey_id 不掩码） |

### TC-03: 构建验证

| 项 | 内容 |
|-----|------|
| **命令** | `pnpm build` |
| **预期** | ✓ built successfully |

### TC-04: 抽样 UI 验证

| 项 | 内容 |
|-----|------|
| **步骤** | 设置 → 服务 → 各翻译/OCR 引擎 → 检查 secret/key/token 字段 |
| **预期** | 4 个抽样引擎（alibaba/caiyun/volcengine/tencent）敏感字段为密码掩码 |

---

## 关联文档

- PRD 84: `../prds/2026-09/84-prd-安全掩码批量修复第二十三轮.md`
- Dev 126: `../devs/2026-09/126-prd-task-安全掩码批量修复第二十三轮.md`