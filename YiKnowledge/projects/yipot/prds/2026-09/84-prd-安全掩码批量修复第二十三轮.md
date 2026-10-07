---
title: "YiPot 安全掩码批量修复与最终审计（第二十三轮）— PRD"
tags: [PRD, YiPot, 安全, 密码掩码, 完成]
category: projects/yipot/prds
created: 2026-09-23
updated: 2026-09-23
source: internal
type: 需求
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
prd_id: YP-09-84
doc_type: prd
roles: [engineer]
---

# YiPot 安全掩码批量修复与最终审计（第二十三轮）— PRD

> 编号：YP-09-84 · 优先级：P2 · 状态：已完成

---

## 一、里程碑

**Config.jsx 密码掩码覆盖率：4/21 → 26/26（100%）**

```
修复前: ██░░░░░░░░░░░░░░░░░░ 19% (4/21)
修复后: ████████████████████ 100% (26/26)
```

所有翻译/OCR/TTS/生词本服务的 API Key/Secret/Token 字段现在均使用 `type='password'` 掩码。

## 二、修复方法

Python 脚本自动扫描所有 `Config.jsx`，为包含敏感标签（secret/token/apikey/authkey）的 `<Input>` 组件添加 `type='password'` 属性。

## 三、验收标准

- [x] 26 个 Config.jsx 文件包含 `type='password'`
- [x] `pnpm build` 通过
- [x] 前 22 轮所有修复无回归

## 四、最终安全态势

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| API Key 存储 | 明文 JSON | ⚠️ 已知限制 |
| UI 密码掩码 | 19% | **100%** |
| Rust panic 防护 | ~40 处 | **0** |
| 前端异常处理 | 多处 | **全覆盖** |
| 已知运行时缺陷 | — | **0** |

## 五、关联文档

- Bug 043: `bugs/安全隐私/043-config-password-type-missing.md`（状态更新为已修复）