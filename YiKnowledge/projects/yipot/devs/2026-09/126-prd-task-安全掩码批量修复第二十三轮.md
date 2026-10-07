---
doc_type: dev
title: "YiPot 安全掩码批量修复（第二十三轮）— 开发方案"
tags: [开发方案, 安全, 密码掩码, python, 批量修复]
category: projects/yipot/devs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: task
status: 已完成
priority: P2
project: YiPot
owner: Chengliang.Yi
prd_month: "202609"
dev_id: YP-09-126
prd_ref: YP-09-84
estimate: 0.25
roles: [engineer]
---

# YiPot 安全掩码批量修复（第二十三轮）— 开发方案

> 开发编号：YP-09-126 · 关联 PRD：YP-09-84

---

## 一、变更清单

Python 脚本批量为 22 个 Config.jsx 文件中 30 个敏感 `<Input>` 组件添加 `type='password'` 属性。

**覆盖**：翻译 (8) + OCR (11) + 生词本 (1) + 保留原已修复 (4 openai/deepl/chatglm/geminipro + 1 baidu) = 26 文件全部覆盖。

---

## 二、执行方法

```python
# 扫描所有 Config.jsx
# 匹配 label={...secret/token/apikey...} 的 Input 组件
# 在 labelPlacement 行后插入 type='password'
```

---

## 三、验证

```bash
grep -rl "type='password'" src/services/ | wc -l  # → 26
pnpm build  # ✓
```

## 四、关联文件

- PRD 84: `../prds/2026-09/84-prd-安全掩码批量修复第二十三轮.md`
- Bug 043: `../bugs/安全隐私/043-config-password-type-missing.md`