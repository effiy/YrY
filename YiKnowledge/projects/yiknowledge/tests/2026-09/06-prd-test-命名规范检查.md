---
doc_type: test
title: "YK-09-03: 命名规范自动化 — 测试用例"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-03"
source_prds: ["06-自动化-命名规范检查"]
source_modules: ["06-prd-task-命名规范检查"]
source_okr: [yiknowledge-001]
---

# YK-09-03: 命名规范自动化 — 测试用例

> 来源 PRD：[06-自动化-命名规范检查.md](../../prds/2026-09/06-自动化-命名规范检查.md)
> 开发方案：[06-prd-task-命名规范检查.md](../../devs/2026-09/06-prd-task-命名规范检查.md)
> 需求编号：YK-09-03 · 优先级：P1

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 pre-commit hook、CI 扫描、修复脚本三道防线。

---

## 一、测试范围

| 防线 | 测试重点 |
|------|---------|
| pre-commit hook | 违规拦截/合规放行/仅扫描 .md/非 staged 文件不扫描 |
| 修复脚本 | kebab-case 转换/引用更新/代码块排除 |
| CI workflow | PR diff 扫描/全库存量不扫描 |

---

## 二、单元测试 — kebab-case 正则

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-RG-01 | 合规：标准 kebab-case | `readiness-checklist.md` | 匹配 ✅ |
| UT-RG-02 | 合规：含数字 | `frontmatter-v2.md` | 匹配 ✅ |
| UT-RG-03 | 合规：单字母开头 | `a-quick-guide.md` | 匹配 ✅ |
| UT-RG-04 | 违规：下划线 | `my_file.md` | 不匹配 ❌ |
| UT-RG-05 | 违规：大写字母 | `MyFile.md` | 不匹配 ❌ |
| UT-RG-06 | 违规：数字开头 | `01-intro.md` | 不匹配 ❌ |
| UT-RG-07 | 违规：空格 | `file name.md` | 不匹配 ❌ |
| UT-RG-08 | 违规：连字符结尾 | `file-.md` | 不匹配 ❌ |
| UT-RG-09 | 违规：开头连字符 | `-file.md` | 不匹配 ❌ |
| UT-RG-10 | 违规：非 .md 文件不应被检测 | `script.py`（下划线） | 不被 hook 检查 |

---

## 三、单元测试 — 修复脚本

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-FX-01 | 下划线→连字符 | `my_file.md` | → `my-file.md` |
| UT-FX-02 | 大写→小写 | `MyFile.md` | → `myfile.md` |
| UT-FX-03 | 混合问题 | `My_File_v2.md` | → `my-file-v2.md` |
| UT-FX-04 | 数字开头 | `01-intro.md` | → `doc-01-intro.md` |
| UT-FX-05 | 多个连字符合并 | `file---name.md` | → `file-name.md` |
| UT-FX-06 | 首尾连字符去除 | `-file-name-.md` | → `file-name.md` |
| UT-FX-07 | 引用更新 | `git mv old.md new.md` + 扫描引用 | 全库 `](old.md)` → `](new.md)` |
| UT-FX-08 | 代码块排除 | Markdown 代码块中的 `](old-name.md)` | 不被替换 |

---

## 四、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-HK-01 | `git add` 违规文件 → `git commit` | pre-commit hook 拒绝，exit code 1 |
| IT-HK-02 | `git add` 合规文件 → `git commit` | pre-commit hook 放行，exit code 0 |
| IT-HK-03 | 仅非 .md 文件变更 → `git commit` | hook 不扫描，直接放行 |
| IT-HK-04 | 未 staged 的违规文件不触发 | hook 仅检查 staged，unstaged 违规不影响 commit |
| IT-CI-01 | PR 含 1 个违规文件 | CI 失败，annotation 指向违规文件 |
| IT-CI-02 | PR 全合规 | CI 通过 |
| IT-CI-03 | PR 仅含非 .md 文件 | CI 跳过扫描 |
| IT-FX-01 | 修复脚本全库执行 | 全库 0 违规 |

---

## 五、缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| S0 — 阻断 | pre-commit hook 无法安装或崩溃 | hook 脚本语法错误导致所有 commit 被拒绝 |
| S1 — 严重 | 合规文件被误拒 | `my-file.md`（合规）被 hook 拒绝 |
| S2 — 一般 | 违规文件被漏过 | `my_file.md`（违规）通过 hook |
| S3 — 轻微 | 体验问题 | 错误信息未提示修复命令 |

---

## 六、自动化现状

| 模块 | 状态 | 说明 |
|------|------|------|
| kebab-case 正则 | ✅ 已完成 | 10 种合规/违规模式全覆盖 |
| pre-commit hook | ✅ 已完成 | Shell 集成测试 |
| 修复脚本 | ✅ 已完成 | Python 转换 + 引用更新 |
| CI workflow | ✅ 已完成 | YAML 语法校验 + 手动触发测试 |

---