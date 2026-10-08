---
doc_type: test
title: "YiPot 自动化基础设施与 100% 覆盖率（第十九轮）— 测试方案"
tags: [测试方案, 自动化, eslint, pre-commit]
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
test_id: YP-09-129
prd_ref: YP-09-81
dev_ref: YP-09-122
roles: [engineer]
---

# YiPot 自动化基础设施与 100% 覆盖率（第十九轮）— 测试方案

> 测试编号：YP-09-129 · 关联 PRD：YP-09-81

---

## 一、自动化检查验证

### TC-01: Config 检查脚本通过

```bash
bash .scripts/check-config-defaults.sh
# 预期：✅ All services have config default values.
```

### TC-02: Config 检查脚本检测违规

```bash
# 临时注入违规
echo "const { config } = options;" >> src/services/translate/google/index.jsx
bash .scripts/check-config-defaults.sh  # 预期：❌ exit 1
git checkout src/services/translate/google/index.jsx
```

### TC-03: Pre-commit hook 可执行

```bash
bash .scripts/pre-commit.sh
# 预期：✅ All checks passed.
```

### TC-04: ESLint 配置有效

```bash
npx eslint --config .eslintrc.cjs src/App.jsx 2>&1 | head -5
# 预期：无 no-undef/prefer-const 错误
```

---

## 二、覆盖率最终验证

| 检查 | 命令 | 预期 |
|------|------|------|
| 翻译引擎 | `grep -rn "const { config } = options" src/services/translate/*/index.jsx \| grep -v "= {}"` | 零输出 |
| OCR 引擎 | `grep -rn "const { config } = options" src/services/recognize/*/index.jsx \| grep -v "= {}"` | 零输出 |
| TTS/生词本 | `grep -rn "const { config } = options" src/services/{tts,collection}/*/index.jsx \| grep -v "= {}"` | 零输出 |

---

## 三、关联文档

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/81-prd-自动化基础设施第十九轮.md` |
| CI 指南 | `../workflows/操作指南/0004-指南-CI自动化质量检查.md` |