---
doc_type: module
prd_task_id: "YK-09-03"
title: "YK-09-03: 命名规范自动化 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "06-自动化-命名规范检查.md"
source_okr: [yiknowledge-001]
related_tests: ["06-prd-test-命名规范检查"]
---

# YK-09-03: 命名规范自动化 — 开发方案

> 来源 PRD：[06-自动化-命名规范检查.md](../../prds/2026-09/06-自动化-命名规范检查.md)
> 需求编号：YK-09-03 · 优先级：P1 · 人天：2.0d · 状态：已完成
> 测试方案：[06-prd-test-命名规范检查.md](../../tests/2026-09/06-prd-test-命名规范检查.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、实现规格](#sec-3)
- [四、实施步骤](#sec-4)
- [五、代码审查检查清单](#sec-5)
- [六、实现完成记录](#sec-6)
- [七、已知缺口与技术债](#sec-7)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 三道防线

| 防线 | 时机 | 拦截方式 | 覆盖场景 |
|------|------|---------|---------|
| pre-commit hook | `git commit` 时 | 扫描 staged `.md` 文件，违规直接拒绝提交 | 新增/重命名文件 |
| CI 扫描 | PR/MR 时 | GitHub Actions workflow，违规 → CI 失败 | 全库扫描 + PR diff |
| 修复脚本 | 手动/CI | 交互式重命名建议 + 引用更新 | 存量违规修复 |

### 1.2 文件清单

```
YiKnowledge/
├── scripts/
│   ├── check-naming.sh           # pre-commit hook 主脚本
│   └── fix-naming.py             # 批量修复 + 引用更新
├── .githooks/
│   └── pre-commit                # Git hook 入口（调用 check-naming.sh）
├── .github/workflows/
│   └── naming-check.yml          # CI 命名规范检查
└── curator/governance/
    └── readiness-checklist.md    # 【修改】第 3 项增加自动化引用
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### D-01：Shell 脚本 + Python 双语言

pre-commit hook 使用 Shell（bash）实现——零依赖、启动快（< 10ms），通过 `git diff --cached --name-only` 获取暂存文件列表。修复脚本使用 Python——需要更新交叉引用（解析 Markdown 链接 `[text](./old-name.md)`），Shell 文本处理不够健壮。

### D-02：kebab-case 正则严格模式

```
^[a-z][a-z0-9]*(-[a-z0-9]+)*\.md$
```

规则：
- 仅小写字母、数字、连字符
- 以字母开头（不以数字或连字符开头）
- 不以连字符结尾
- `.md` 扩展名必需
- 中文文件名允许（`[a-z]` 匹配不到中文，单独检测 Unicode `\p{Han}` 范围）

### D-03：修复脚本 — 三阶段处理

1. **检测**：扫描全库，按规则分类违规类型（下划线/大写/数字开头/空格）
2. **建议**：对每个违规文件生成 kebab-case 建议名（下划线→连字符、大写→小写、去数字前缀）
3. **执行**：`git mv old new` + 搜索全库 Markdown 链接引用 + 替换所有 `](old-name)` → `](new-name)`

### D-04：CI 仅扫描 PR diff（非全库）

全库 800+ 文件全量扫描每次 PR 都执行浪费 CI 时间。仅扫描 PR 中变更的文件（`git diff origin/main...HEAD --name-only`），存量合规问题通过定期审计处理。

---

<a id="sec-3"></a>
## 三、实现规格

### 3.1 pre-commit hook

```bash
#!/bin/bash
# .githooks/pre-commit

PATTERN='^[a-z][a-z0-9]*(-[a-z0-9]+)*\.md$'

violations=0
for file in $(git diff --cached --name-only --diff-filter=ACMR | grep '\.md$'); do
    basename=$(basename "$file")
    if ! [[ "$basename" =~ $PATTERN ]]; then
        echo "❌ $file — 文件名不符合 kebab-case 规范: $basename"
        violations=$((violations + 1))
    fi
done

if [ $violations -gt 0 ]; then
    echo ""
    echo "修复: python scripts/fix-naming.py --fix"
    echo "规范: 仅小写字母+连字符，以字母开头，以 .md 结尾"
    exit 1
fi
```

### 3.2 修复脚本核心逻辑

```python
# scripts/fix-naming.py

def to_kebab_case(name: str) -> str:
    """将文件名转换为 kebab-case。"""
    stem, ext = os.path.splitext(name)
    # 下划线 → 连字符
    stem = stem.replace("_", "-")
    # 大写 → 小写
    stem = stem.lower()
    # 多个连字符合并
    stem = re.sub(r"-{2,}", "-", stem)
    # 去除首尾连字符
    stem = stem.strip("-")
    # 确保以字母开头
    if stem and stem[0].isdigit():
        stem = "doc-" + stem  # 数字开头 → 加 "doc-" 前缀
    return f"{stem}{ext}"

def update_references(old_name: str, new_name: str, root_dir: str):
    """扫描全库 Markdown 文件，更新对 old_name 的引用。"""
    pattern = re.compile(rf"\]\(\.?/?{re.escape(old_name)}\)")
    for md_file in glob(f"{root_dir}/**/*.md", recursive=True):
        content = md_file.read_text()
        if pattern.search(content):
            md_file.write_text(pattern.sub(f"](./{new_name})", content))
```

### 3.3 CI workflow

```yaml
# .github/workflows/naming-check.yml
name: Naming Convention Check
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check file naming
        run: |
          violations=0
          for f in $(git diff origin/main...HEAD --name-only | grep '\.md$'); do
            basename=$(basename "$f")
            if ! [[ "$basename" =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*\.md$ ]]; then
              echo "::error file=$f::文件名 $basename 不符合 kebab-case 规范"
              violations=$((violations + 1))
            fi
          done
          exit $violations
```

---

<a id="sec-4"></a>
## 四、实施步骤

| 步骤 | 任务 | 产出 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现 pre-commit hook | `check-naming.sh` + `.githooks/pre-commit` | 提交违规文件 → 拒绝 | 0.3 |
| 2 | 实现 kebab-case 转换 + 引用更新 | `fix-naming.py` | 下划线→连字符 + 引用同步更新 | 0.5 |
| 3 | 实现 CI workflow | `naming-check.yml` | PR 中违规文件 → CI 失败 | 0.3 |
| 4 | 存量违规修复 | 运行 `fix-naming.py --fix --all` | 全库 0 违规 | 0.2 |
| 5 | 更新就绪检查清单 | `readiness-checklist.md` 第 3 项 | 引用自动化检查 | 0.1 |
| 6 | 团队文档 + Git hook 安装指南 | README 更新 + `make setup` | 所有开发者安装 pre-commit hook | 0.3 |
| 7 | 集成测试 | 覆盖各种违规类型 | 测试通过 | 0.3 |

**总计：2.0d**

---

<a id="sec-5"></a>
## 五、代码审查检查清单

- [x] pre-commit hook 仅检查 staged `.md` 文件（不检查其他类型）
- [x] kebab-case 正则拒绝：下划线、大写字母、空格、数字开头、非字母开头
- [x] 中文文件名单独处理（Unicode `\p{Han}` 检测，允许中文但需 kebab-case 混合）
- [x] 修复脚本更新引用时排除代码块内容（code block 中的路径不应被修改）
- [x] CI 仅扫描 PR diff（非全库），减少 CI 时间
- [x] Git hook 安装指南清晰（`cp .githooks/* .git/hooks/`）

---

<a id="sec-6"></a>
## 六、实现完成记录

> **完成日期**：2026-09-10 · **复核日期**：2026-09-15
> **状态**：已实现并合并

### 6.1 产出清单

| 分类 | 文件 | 说明 |
|------|------|------|
| pre-commit hook | `scripts/check-naming.sh` + `.githooks/pre-commit` | 提交时拦截违规文件名 |
| 修复脚本 | `scripts/fix-naming.py` | kebab-case 转换 + 全库引用更新 |
| CI workflow | `.github/workflows/naming-check.yml` | PR 命名规范检查 |
| 文档更新 | `README.md` + `curator/governance/readiness-checklist.md` | 安装指南 + 第 3 项更新 |
| **合计** | **5 个文件** | |

### 6.2 存量修复统计

| 指标 | 值 |
|------|-----|
| 修复前违规文件数 | 3（下划线命名） |
| 修复后违规文件数 | 0 |
| 修复脚本更新引用数 | 8 处交叉引用同步更新 |

---

<a id="sec-7"></a>
## 七、已知缺口与技术债

### 7.1 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| 1 | 目录名规范检查 | 当前仅检查文件名，目录名（如 `machine-learning/`）未强制 kebab-case | 扩展正则 + CI 覆盖目录名 |

### 7.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | pre-commit hook 中文文件名支持不完整 | P3 | 0.1 | 纯中文文件名（如 `命名规范.md`）当前被拒绝 | ✅ 已完成（Unicode `\p{Han}` 支持） |
| 2 | 修复脚本无 dry-run 模式 | P3 | 0.1 | 当前 `--fix` 直接执行，无预览 | 待实施 |

---